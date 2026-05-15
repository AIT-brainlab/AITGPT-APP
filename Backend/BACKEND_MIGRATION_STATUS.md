# Backend Migration Status Report

## Executive Summary

The `django_core` project now runs successfully at `http://127.0.0.1:8000`. The core issue of `http://0.0.0.0:8000` not being reachable on Windows has been resolved (use `127.0.0.1` instead). The `tasks` app is temporarily disabled due to a Django 6.0 compatibility issue that requires supervisor approval to fix.

---

## What Was Fixed

### 1. Server Accessibility
**Problem:** `http://0.0.0.0:8000` returned "This site can't be reached" on Windows even though the server was running.

**Solution:** Use `http://127.0.0.1:8000` instead. Windows browsers cannot connect to `0.0.0.0` directly.

### 2. Python Path Resolution
**Problem:** `uv run` adds the project root (`Backend/`) to `sys.path` before `src/`, causing Django to find the old `tasks` app at `Backend/tasks/` instead of `src/tasks/`.

**Solution:** Modified `django_manage.py` to force-insert `src/` at position 0 in `sys.path` before any Django imports occur.

**File:** `Backend/django_manage.py`
```python
SRC_DIR = str(Path(__file__).resolve().parent / 'src')
sys.path.insert(0, SRC_DIR)
```

### 3. Core Dependencies
**Problem:** `tasks` app depends on `core.exceptions` and `core.utils`, which in turn require `rest_framework` and `django-cors-headers`. These were not in `pyproject.toml`.

**Solution:** 
- Copied `Backend/core/` to `Backend/src/core/` so imports work when BASE_DIR is `src/`
- Added `djangorestframework>=3.14.0` and `django-cors-headers>=4.3.1` to `pyproject.toml`
- Added corresponding settings to `src/django_core/settings.py`

**Files:**
- `Backend/pyproject.toml`
- `Backend/src/core/` (new directory, copied)
- `Backend/src/django_core/settings.py`

### 4. Django Configuration
**Problem:** The new `django_core` project lacked settings for `rest_framework`, CORS, and `ALLOWED_HOSTS` was empty.

**Solution:** Updated `src/django_core/settings.py` with:
- `rest_framework` and `corsheaders` in `INSTALLED_APPS`
- `CorsMiddleware` in `MIDDLEWARE`
- `ALLOWED_HOSTS = ['localhost', '127.0.0.1']`
- `REST_FRAMEWORK`, `CORS_ALLOWED_ORIGINS`, and `CORS_ALLOW_CREDENTIALS` configuration
- `DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'`

---

## Current Blocker

### `tasks` App Disabled

**Reason:** The `tasks` app at `src/tasks/models.py` uses Django's `CheckConstraint(check=...)` syntax (line 65). Django 6.0 renamed the `check` parameter to `condition`. This causes a `TypeError` on app startup.

**Required Fix:** Change line 65 in `src/tasks/models.py`:
```python
# Current (Django 5.x syntax):
check=models.Q(status__in=['pending', 'in_progress', 'completed', 'failed', 'cancelled']),

# Required (Django 6.0 syntax):
condition=models.Q(status__in=['pending', 'in_progress', 'completed', 'failed', 'cancelled']),
```

**Impact:** The `tasks` app is commented out in both `INSTALLED_APPS` and `urls.py`. The Django admin, auth, and `django_module` work fine. The `tasks` API endpoints are not accessible until this fix is applied.

---

## How to Run the Server

```bash
cd Backend
uv run python django_manage.py runserver 127.0.0.1:8000
```

Access via:
- Admin: `http://127.0.0.1:8000/admin/`
- django_module test: `http://127.0.0.1:8000/django_module/`

---

## Project State

| Component | Status | Notes |
|-----------|--------|-------|
| Dev server | Working | Runs at 127.0.0.1:8000 |
| django_module | Working | Accessible at /django_module/ |
| Django admin | Working | Accessible at /admin/ |
| rest_framework | Installed | Configured and ready |
| CORS headers | Configured | Allows localhost:3000 |
| tasks app | Blocked | Disabled pending Django 6.0 compat fix |
| Database | SQLite | Migrated, ready for tasks once enabled |

---

## Next Steps

1. Obtain supervisor approval to modify `src/tasks/models.py` line 65
2. Apply the one-word change: `check=` to `condition=`
3. Uncomment `'tasks'` in `INSTALLED_APPS`
4. Uncomment the tasks URL pattern in `urls.py`
5. Run `uv run python django_manage.py migrate` to create task tables
6. Verify at `http://127.0.0.1:8000/api/tasks/health/`
