import os
import re
import ssl

from fastapi import FastAPI, HTTPException, Request, status
from pydantic import BaseModel

from ldap3 import ALL_ATTRIBUTES, Connection, Server, Tls
from ldap3.core.exceptions import LDAPBindError, LDAPException
from ldap3.utils.conv import escape_filter_chars


LDAP_SERVER_URI = os.environ['LDAP_SERVER_URI']
LDAP_BIND_DN = os.environ['LDAP_BIND_DN']
LDAP_BIND_PASSWORD = os.environ['LDAP_BIND_PASSWORD']
LDAP_SEARCH_BASE = os.environ['LDAP_SEARCH_BASE']
LDAP_TLS_VALIDATE = os.getenv('LDAP_TLS_VALIDATE', 'False').strip().lower() in ('true', '1', 'yes')
LDAP_AUTH_API_KEY = os.environ['LDAP_AUTH_API_KEY']

GROUP_DN_RE = re.compile(r'cn=([^,]+)', re.IGNORECASE)

app = FastAPI(title='LDAP Auth')


class AuthRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    username: str
    email: str
    display_name: str
    is_superuser: bool
    groups: list[str]


def _build_server() -> Server:
    validate = ssl.CERT_REQUIRED if LDAP_TLS_VALIDATE else ssl.CERT_NONE
    return Server(LDAP_SERVER_URI, tls=Tls(validate=validate))


def _to_bool(val) -> bool:
    if val is None:
        return False
    if isinstance(val, bool):
        return val
    if isinstance(val, list):
        if not val:
            return False
        val = val[0]
    return str(val).strip().upper() == 'TRUE'


def _parse_groups(member_of) -> list[str]:
    """Extract the first cn= component of each memberOf DN."""
    if not member_of:
        return []
    if isinstance(member_of, str):
        member_of = [member_of]
    out: list[str] = []
    for dn in member_of:
        m = GROUP_DN_RE.match(str(dn))
        if m:
            out.append(m.group(1).lower())
    return out


def _check_api_key(request: Request) -> None:
    auth = request.headers.get('authorization', '')
    if not auth.startswith('Bearer ') or auth[7:] != LDAP_AUTH_API_KEY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)


@app.get('/health')
def health() -> dict:
    return {'status': 'ok'}


@app.post('/authenticate', response_model=AuthResponse)
def authenticate(req: AuthRequest, request: Request) -> AuthResponse:
    _check_api_key(request)

    server = _build_server()

    try:
        with Connection(
            server,
            user=LDAP_BIND_DN,
            password=LDAP_BIND_PASSWORD,
            auto_bind=True,
        ) as svc_conn:
            svc_conn.search(
                search_base=LDAP_SEARCH_BASE,
                search_filter=f'(cn={escape_filter_chars(req.username)})',
                attributes=ALL_ATTRIBUTES,
            )
            entries = list(svc_conn.entries)
    except LDAPException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f'LDAP transport error: {e}',
        )

    if not entries:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    entry = entries[0]
    attrs = entry.entry_attributes_as_dict
    user_dn = entry.entry_dn

    try:
        with Connection(server, user=user_dn, password=req.password, auto_bind=True):
            pass
    except LDAPBindError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    except LDAPException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f'LDAP user-bind error: {e}',
        )

    if not _to_bool(attrs.get('ak-active')):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    return AuthResponse(
        username=(attrs.get('cn') or [''])[0],
        email=(attrs.get('mail') or [''])[0],
        display_name=(attrs.get('displayName') or [''])[0],
        is_superuser=_to_bool(attrs.get('ak-superuser')),
        groups=_parse_groups(attrs.get('memberOf')),
    )
