"""LDAP authentication backend.

LDAPBackend is placed before ModelBackend in AUTHENTICATION_BACKENDS. It
delegates the actual LDAP bind/search to the LdapAuth FastAPI microservice
(reachable at ``LDAP_AUTH_API_URL``, authed with bearer ``LDAP_AUTH_API_KEY``).

Per-username outcomes:

- LDAP disabled / username in LDAP_LOCAL_ONLY_USERS  -> return None (DB only).
- LdapAuth misconfigured / network error / 5xx       -> return None (fall through to DB).
- LdapAuth 404 (username not in LDAP)                -> return None (fall through to DB).
- LdapAuth 200 + group maps to a known user_type     -> upsert local shadow user, return it.
- LdapAuth 200 but no matching memberOf group        -> raise PermissionDenied.
- LdapAuth 401 (wrong password / inactive)           -> raise PermissionDenied.

Local shadow users are created with ``set_unusable_password()`` so they can never
be authenticated via ModelBackend, even if LdapAuth becomes unreachable later.
"""
import requests

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
from django.core.exceptions import PermissionDenied
from django.db import transaction

from core.models import USER_TYPE_CHOICES, UserProfile
from core.utils import log_error

User = get_user_model()

USER_TYPE_VALUES = {choice[0] for choice in USER_TYPE_CHOICES}
HTTP_TIMEOUT_SECONDS = 5


def _pick_user_type(groups) -> str | None:
    for g in groups or []:
        if str(g).lower() in USER_TYPE_VALUES:
            return str(g).lower()
    return None


def _split_name(display_name: str) -> tuple[str, str]:
    parts = (display_name or '').strip().split(None, 1)
    if not parts:
        return '', ''
    if len(parts) == 1:
        return parts[0], ''
    return parts[0], parts[1]


class LDAPBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None
        if not getattr(settings, 'LDAP_ENABLED', False):
            return None
        if username in getattr(settings, 'LDAP_LOCAL_ONLY_USERS', []):
            return None
        if not settings.LDAP_AUTH_API_URL or not settings.LDAP_AUTH_API_KEY:
            log_error(
                RuntimeError('LDAP_AUTH_API_URL or LDAP_AUTH_API_KEY not set'),
                {'context': 'ldap_config'},
            )
            return None

        try:
            response = requests.post(
                f'{settings.LDAP_AUTH_API_URL.rstrip("/")}/authenticate',
                json={'username': username, 'password': password},
                headers={'Authorization': f'Bearer {settings.LDAP_AUTH_API_KEY}'},
                timeout=HTTP_TIMEOUT_SECONDS,
            )
        except requests.RequestException as e:
            log_error(e, {'context': 'ldap_auth_http', 'username': username})
            return None

        if response.status_code == 401:
            raise PermissionDenied
        if response.status_code == 404:
            return None
        if response.status_code != 200:
            log_error(
                RuntimeError(f'Unexpected LdapAuth status {response.status_code}: {response.text}'),
                {'context': 'ldap_auth_http', 'username': username},
            )
            return None

        try:
            data = response.json()
        except ValueError as e:
            log_error(e, {'context': 'ldap_auth_json', 'username': username})
            return None

        user_type = _pick_user_type(data.get('groups'))
        if user_type is None:
            raise PermissionDenied

        return self._upsert_user(data, user_type)

    @staticmethod
    @transaction.atomic
    def _upsert_user(data: dict, user_type: str):
        username = data.get('username') or ''
        email = data.get('email') or ''
        display_name = data.get('display_name') or ''
        is_superuser = bool(data.get('is_superuser'))
        first_name, last_name = _split_name(display_name)

        user, _ = User.objects.update_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
                'is_staff': is_superuser,
                'is_superuser': is_superuser,
            },
        )
        user.set_unusable_password()
        user.save(update_fields=['password'])

        UserProfile.objects.update_or_create(
            user=user,
            defaults={'user_type': user_type},
        )
        return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
