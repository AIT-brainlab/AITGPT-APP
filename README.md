# AITGPT — University AI Chatbot

A full-stack AI-powered chatbot application for the Asian Institute of Technology (AIT). The system provides role-based conversational assistance for seven user types: guest, candidate (prospective student), student, faculty, staff, alumni, and management. The frontend is a React/TypeScript application served as an overlay widget on a university landing page. The backend is a Django REST API that authenticates users, proxies chat requests to an external Langflow AI service, and logs all interactions to a PostgreSQL database.

----

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Organization](#3-project-organization)
4. [System Architecture](#4-system-architecture)
5. [How Modules Connect](#5-how-modules-connect)
6. [Local Development Setup](#6-local-development-setup)
7. [Deployment](#7-deployment)
8. [Environment Variables](#8-environment-variables)
9. [Debugging Guide](#9-debugging-guide)

----

## 1. Project Overview

AITGPT consists of two main services:

- **Frontend**: A React 18 single-page application built with Vite, styled with Tailwind CSS, and using Radix UI primitives. It renders a floating chat widget over a university landing page.
- **Backend**: A Django 5 REST API using Django REST Framework, PostgreSQL for persistence, and Token Authentication for session management.

The AI intelligence is provided by an external **Langflow** service. The backend acts as a proxy: it receives chat requests from the frontend, forwards them to Langflow with the appropriate API key and session context, then parses and returns the AI response. All interactions are optionally logged to PostgreSQL for analytics and auditing.

---

## 2. Technology Stack

### Frontend

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | React | 18.3.1 | UI library |
| Language | TypeScript | 5.x | Type safety and developer experience |
| Build Tool | Vite | 6.3.5 | Development server and production bundler |
| State Management | Redux Toolkit | 2.2.1 | Global application state |
| Persistence | redux-persist | 6.0.0 | Persist Redux state to browser sessionStorage |
| UI Primitives | Radix UI | 1.x | Accessible, unstyled UI component primitives |
| Styling | Tailwind CSS | latest | Utility-first CSS framework |
| Icons | lucide-react | 0.487.0 | Icon library |
| HTTP Client | native fetch API | — | Network requests to backend |

### Backend

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Django | 5.0.1 | Web framework |
| API Layer | Django REST Framework | 3.14.0 | REST API serialization and viewsets |
| Database | PostgreSQL | 15 | Primary data store |
| Database Driver | psycopg2-binary | 2.9.9 | PostgreSQL adapter for Python |
| Server | uvicorn | 0.27.0 | ASGI server (production) |
| CORS | django-cors-headers | 4.3.1 | Cross-origin request handling |
| Environment | python-dotenv | 1.0.0 | Environment variable management |
| HTTP Client | requests | 2.31.0 | Outbound requests to Langflow API |

### External Dependencies

| Service | Role |
|---------|------|
| Langflow API | AI/RAG pipeline execution (LLM + retrieval) |
| PostgreSQL | Persistent storage for users, chat logs, and task logs |

---

## 3. Project Organization

### Frontend Directory Structure

```
Frontend/
├── public/                        # Static assets
├── src/
│   ├── components/               # React components
│   │   ├── AITWebsite.tsx       # University landing page (background)
│   │   ├── FloatingChatButton.tsx   # Toggle button for chat widget
│   │   ├── FloatingChatWidget.tsx     # Main chat container
│   │   ├── FloatingOwlSplash.tsx      # Animated mascot intro screen
│   │   ├── FloatingWelcomeCard.tsx    # Sign In / Continue as Guest options
│   │   ├── FloatingUserTypeSelection.tsx  # Role selection (candidate/student/etc.)
│   │   ├── FloatingAuthModal.tsx      # Username/password login form
│   │   ├── FloatingLoadingScreen.tsx  # Authentication loading spinner
│   │   ├── ChatInterface.tsx          # Message list and input field
│   │   ├── FormattedMessageContent.tsx # Markdown/HTML rendering for bot replies
│   │   ├── OwlMascot.tsx              # Animated owl avatar component
│   │   ├── SSOLoginPage.tsx           # Single Sign-On login page variant
│   │   ├── ui/                        # Reusable shadcn/ui components
│   │   └── figma/                     # Design system exports
│   │
│   ├── store/                     # Redux state management
│   │   ├── store.ts              # Store configuration with redux-persist
│   │   ├── hooks.ts              # Typed Redux hooks (useAppDispatch, useAppSelector)
│   │   └── slices/
│   │       └── chatSlice.ts     # Chat state: messages, reasoning mode, current user
│   │
│   ├── types/
│   │   └── auth.ts             # TypeScript interfaces: User, UserRole, ChatMessage
│   │
│   ├── utils/                    # API and service layer
│   │   ├── api.ts               # Base URL resolution, fetch wrapper, token auth
│   │   ├── authApi.ts           # Login, logout, profile API functions
│   │   ├── authService.ts       # Authentication logic, role display helpers
│   │   ├── chatApi.ts           # Chat message API, guest session ID management
│   │   ├── chatService.ts       # Chat business logic, welcome messages per role
│   │   ├── sessionStorage.ts    # User session persistence in localStorage
│   │   └── textFormatter.ts     # Text formatting utilities
│   │
│   ├── hooks/
│   │   └── useTypingEffect.ts  # Typing animation hook
│   │
│   ├── App.tsx                   # Root component: widget state machine
│   ├── main.tsx                  # Entry point: React root + Redux Provider
│   └── index.css                 # Tailwind directives + global styles
│
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Production Docker orchestration
├── startup.sh                    # Runtime API URL injection script
├── vite.config.ts                # Vite configuration + path aliases
├── package.json
└── .env                          # Environment variables (not committed)
```

### Backend Directory Structure

```
Backend/
├── core/                         # Main Django application
│   ├── __init__.py
│   ├── admin.py                  # Django admin configuration
│   ├── exceptions.py             # Custom API exception classes
│   ├── middleware.py             # Request logging middleware
│   ├── models.py                 # UserProfile model (extends Django User)
│   ├── serializers.py            # DRF serializers (User, Login, Langflow request)
│   ├── settings.py               # Django settings (database, CORS, DRF, Langflow)
│   ├── urls.py                   # URL routing (auth + langflow endpoints)
│   ├── utils.py                  # create_response, log_error, clean_assistant_text
│   ├── views.py                  # API views: signup, login, logout, profile, langflow_chat
│   ├── wsgi.py                   # WSGI entry point
│   └── asgi.py                   # ASGI entry point (used by uvicorn)
│
├── tasks/                        # Chat logging and task management app
│   ├── __init__.py
│   ├── admin.py                  # Admin configuration for ChatLog/TaskLog
│   ├── apps.py                   # App configuration
│   ├── models.py                 # ChatLog and TaskLog database models
│   ├── serializers.py            # DRF serializers for logging models
│   ├── urls.py                   # Task logging URL routes
│   └── views.py                  # API views: health_check, chat_log_read/write, async ops
│
├── management/                   # Custom Django management commands
│   └── commands/
│       └── seed_users.py         # Seed sample users into database
│
├── logs/                         # Application log directory
├── Dockerfile                    # Backend container image
├── docker-compose.yml            # Compose orchestration (includes DB and web)
├── docker-compose.db.yml         # Database-only compose file
├── docker-compose.web.yml        # Web-only compose file
├── startup.sh                    # Container startup: migrate, seed, run uvicorn
├── seed-users.sh                 # User seeding shell script
├── manage.py                     # Django management entry point
├── requirements.txt              # Python dependencies
└── .env                          # Environment variables (not committed)
```

---

## 4. System Architecture

### High-Level Request Flow

The following sequence describes the complete data flow when an authenticated user sends a chat message:

1. User opens the chat widget in the browser (React Frontend on port 3000)
2. User authenticates via the login form or continues as a guest
3. User types and sends a chat message
4. Frontend constructs a POST request to `/api/langflow/chat/` with the DRF token in the `Authorization: Token <token>` header
5. Django Backend (port 8000) validates the token via DRF TokenAuthentication
6. Backend builds a deterministic `session_id` from the user ID and token hash
7. Backend constructs the Langflow API URL using environment variables and forwards the request
8. Langflow API executes its RAG pipeline (retrieval + generation) and returns a nested JSON response
9. Backend parses `assistant_text` and `metrics` from the nested response structure
10. If `IS_LOGGING_ENABLED` is true, backend saves the interaction to PostgreSQL ChatLog table
11. Backend returns `{ assistant_text, metrics, session_id }` to the frontend
12. Frontend dispatches the response to the Redux store and re-renders the ChatInterface component

### Component Architecture

The frontend is organized as a widget state machine within `App.tsx`. The landing page (`AITWebsite`) is always rendered in the background. A floating action button (`FloatingChatButton`) toggles the chat widget overlay. The widget progresses through a sequence of modal states: an animated owl splash screen, a welcome card offering authentication or guest access, a role selection screen, an authentication modal, a loading screen, and finally the main chat interface.

State management uses Redux Toolkit with redux-persist backed by browser `sessionStorage`. This means chat history survives an accidental page refresh within the same browser tab, but is intentionally cleared when the tab closes for privacy.

---

## 5. How Modules Connect

### 5.1 Frontend Module Connections

#### API Layer (`src/utils/`)

`api.ts` is the foundation of all backend communication. It defines `getApiBaseUrl()`, which resolves the backend API URL through three priority levels:

1. Runtime injection via `window.__API_BASE_URL__` (set by `startup.sh` in Docker)
2. Build-time environment variable `import.meta.env.VITE_API_URL`
3. Hardcoded fallback `http://localhost:8000`

`apiRequest()` reads the DRF token from `localStorage` key `auth_token` and attaches it as `Authorization: Token <token>` on every authenticated request. `apiRequestWithoutAuth()` is used exclusively for login and registration where no token exists yet.

`post()`, `get()`, and `postWithoutAuth()` are convenience wrappers around these core request functions.

`authApi.ts` depends on `api.ts` to implement `login()`, `logout()`, and `getProfile()`. On successful login, it stores the returned token via `setAuthToken()` and maps the backend user object to the frontend `User` interface using `mapBackendUserToFrontend()`.

`chatApi.ts` depends on `api.ts` to send chat messages. For guest users, it generates and stores a random session ID in `localStorage` key `chat_session_id`, which is included in the request body so the backend can maintain conversation context.

`chatService.ts` provides the business logic layer above `chatApi.ts`. It determines welcome messages and contextual suggestions based on the authenticated user's role, and handles error parsing from the backend response.

#### State Management (`src/store/`)

`main.tsx` wraps the application in a Redux `Provider` and a `PersistGate`. The store (`store.ts`) configures a single reducer slice, `chatSlice`, which manages:

- `tabMessages`: a dictionary mapping tab names to arrays of `ChatMessage` objects
- `reasoningMode`: a boolean toggle for reasoning-enabled AI responses
- `currentUserId`: tracks the active user to detect account switches

Redux actions such as `addMessage`, `updateMessage`, and `initializeChat` are dispatched from `FloatingChatWidget` and `ChatInterface` components.

#### Component Hierarchy

```
App.tsx (widget state machine)
  |-- AITWebsite.tsx (always visible background)
  |-- FloatingChatButton.tsx (toggle FAB)
  |
  |-- [widgetState === 'owl-splash']
  |     FloatingOwlSplash.tsx
  |
  |-- [widgetState === 'welcome']
  |     FloatingWelcomeCard.tsx
  |
  |-- [widgetState === 'user-type-selection']
  |     FloatingUserTypeSelection.tsx
  |
  |-- [widgetState === 'auth-modal']
  |     FloatingAuthModal.tsx
  |
  |-- [widgetState === 'authenticating']
  |     FloatingLoadingScreen.tsx
  |
  |-- [widgetState === 'chat']
  |     FloatingChatWidget.tsx
  |       |-- ChatInterface.tsx
  |       |     |-- FormattedMessageContent.tsx
  |       |-- OwlMascot.tsx
```

### 5.2 Backend Module Connections

#### URL Routing (`core/urls.py` and `tasks/urls.py`)

The backend exposes the following endpoints:

- `/admin/` — Django admin interface
- `/api/auth/signup/` — User registration (AllowAny)
- `/api/auth/login/` — Authentication, returns DRF token (AllowAny)
- `/api/auth/logout/` — Token invalidation (IsAuthenticated)
- `/api/auth/profile/` — Current user profile (IsAuthenticated)
- `/api/langflow/chat/` — Main chat proxy (AllowAny)
- `/api/langflow/chat/test/` — Chat test endpoint (AllowAny)
- `/api/tasks/health/` — Health check (AllowAny)
- `/api/tasks/chat-log/` — Chat log retrieval (AllowAny + X-Access-Token header)
- `/api/tasks/chat-log/write/` — Chat log write endpoint (AllowAny + X-Access-Token header)

#### Authentication (`core/views.py`)

The `login` view uses `UserLoginSerializer` to validate credentials. It verifies that the `user_type` selected by the frontend matches the `user_type` stored in the `UserProfile` database record. If a profile does not exist, it creates one automatically. Upon success, it returns a DRF `Token` and the serialized user object.

The `logout` view deletes the DRF token associated with the authenticated user, invalidating all future requests using that token.

#### Langflow Proxy (`core/views.py`)

The `langflow_chat` view is the core of the application. Its responsibilities are:

1. Validate the incoming request using `LangflowRequestSerializer`
2. Determine authentication status via DRF's `request.user.is_authenticated`
3. Generate a deterministic `session_id` for authenticated users by hashing the user ID and token
4. Generate a random `session_id` for guest users (or accept one from the request)
5. Build the Langflow API URL using settings: `{LANGFLOW_API_URL}/run/{run_id}?stream=false`
6. Forward the request with the `x-api-key` header
7. Parse the deeply nested JSON response to extract `assistant_text` and `metrics`
8. If `IS_LOGGING_ENABLED` is true, call `log_chat_async()` to persist the interaction

#### Chat Logging (`tasks/views.py`)

`log_chat_async()` is invoked from `langflow_chat` after every successful or failed Langflow request. It creates a `ChatLog` record containing:

- `user_id` (UUID, deterministic for authenticated users)
- `session_id`
- `turn_index` (auto-incremented per session using PostgreSQL advisory locks for concurrency safety)
- `user_prompt` and `generated_answer`
- Latency metrics: `generation_latency`, `retrieval_latency`, `end_to_end_latency`
- Token counts: `prompt_token_count`, `completion_token_count`, `total_token_count`
- `role` and `status` (success or fail)

`chat_log_read` provides paginated access to all chat logs, protected by an `X-Access-Token` header that must match the `CHAT_RETRIEVAL_ACCESS_TOKEN` environment variable.

#### Database Models (`core/models.py` and `tasks/models.py`)

`UserProfile` extends Django's built-in `User` model via a one-to-one relationship, adding a `user_type` field with choices: candidate, student, faculty, staff, alumni, management, and admin.

`ChatLog` stores every conversational turn with comprehensive metadata. Its primary key is a UUID, and it indexes heavily on `user_id`, `session_id`, `turn_index`, and `created_at` for fast querying.

`TaskLog` is a generic task tracking model for asynchronous operations.

---

## 6. Local Development Setup

### Prerequisites

- Node.js 20+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 15 (or use Docker for database)
- Backend running and accessible

### Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see Environment Variables section below)
# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Seed sample users (optional)
python manage.py seed_users

# Start development server
python manage.py runserver
# Or with uvicorn for ASGI behavior:
# uvicorn core.asgi:application --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

The frontend development server will start on `http://localhost:3000`.

### Database Setup (Docker)

If you prefer to run PostgreSQL via Docker:

```bash
cd Backend
docker compose -f docker-compose.db.yml up -d
```

This starts PostgreSQL on port 5432 with persistent volume storage.

---

## 7. Deployment

### Docker Deployment (Production)

The project is designed for containerized deployment using Docker Compose.

#### Prerequisites

- Docker Engine 24.0+
- Docker Compose 2.20+

#### Network Setup

The frontend and backend share an external Docker network:

```bash
docker network create aitgpt_network
```

#### Backend Deployment

```bash
cd Backend

# Build and start backend + database
docker compose up -d
```

This starts two services:
- `aitgpt_backend_db`: PostgreSQL 15 on port 5432
- `aitgpt_backend_web`: Django ASGI server on port 8000

The backend `startup.sh` script automatically:
1. Runs database migrations
2. Creates a superuser if `SUPERUSER_PASSWORD` is set
3. Seeds sample users
4. Starts uvicorn on port 8000

#### Frontend Deployment

```bash
cd Frontend

# Build and start frontend
docker compose up -d
```

This starts `aitgpt_frontend` on port 3000, serving the built static files.

#### Runtime API URL Injection

Vite bundles environment variables at build time. To support changing the API URL at runtime (for different deployment environments), the frontend `startup.sh` script uses `sed` to inject the `VITE_API_URL` value into the built `index.html` file before serving:

```bash
sed -i "s|window.__API_BASE_URL__ = '.*'|window.__API_BASE_URL__ = '$VITE_API_URL'|g" /app/build/index.html
```

The frontend `api.ts` checks for `window.__API_BASE_URL__` first, then falls back to the build-time `VITE_API_URL` environment variable.

---

## 8. Environment Variables

### Frontend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:8000` | Backend API base URL |

### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | — | Django secret key (cryptographic signing) |
| `DEBUG` | No | `False` | Debug mode (set `True` for development) |
| `ALLOWED_HOSTS` | Yes | `*` | Comma-separated list of allowed hostnames |
| `CORS_ALLOWED_ORIGINS` | Yes | — | Comma-separated list of allowed frontend origins |
| `DB_NAME` | Yes | `aitgpt` | PostgreSQL database name |
| `DB_USER` | Yes | `aitgpt_user` | PostgreSQL username |
| `DB_PASSWORD` | Yes | — | PostgreSQL password |
| `DB_HOST` | Yes | `db` (Docker) / `localhost` (local) | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `LANGFLOW_API_URL` | Yes | — | Base URL of the Langflow API service |
| `LANGFLOW_API_KEY` | Yes | — | API key for Langflow authentication |
| `LANGFLOW_RUN_ID` | Yes | — | Default Langflow run/flow ID |
| `LANGFLOW_REASONING_API_URL` | Yes | — | Langflow URL for reasoning mode |
| `LANGFLOW_REASONING_API_KEY` | Yes | — | API key for reasoning endpoint |
| `LANGFLOW_REASONING_RUN_ID` | Yes | — | Run ID for reasoning endpoint |
| `IS_LOGGING_ENABLED` | No | `False` | Enable chat interaction logging to PostgreSQL |
| `CHAT_RETRIEVAL_ACCESS_TOKEN` | No | — | Secret token for external chat log access |
| `SUPERUSER_PASSWORD` | No | — | Password for auto-created Django superuser |

---

## 9. Debugging Guide

### Frontend Debugging

#### Network Requests

Use the browser Developer Tools Network tab (filter by Fetch/XHR) to inspect:

- Request to `/api/auth/login/` — verify credentials and user_type
- Request to `/api/langflow/chat/` — check `Authorization: Token <key>` header is present
- Response structure — should contain `{ assistant_text, metrics, session_id }`

#### Browser Storage

Inspect `localStorage` in the browser console:

```javascript
localStorage.getItem('auth_token')        // DRF authentication token
localStorage.getItem('chat_user_session') // Serialized User object
localStorage.getItem('chat_session_id')   // Guest session ID
```

#### Redux State

Install the Redux DevTools browser extension to inspect:
- `chat.tabMessages` — all chat messages per tab
- `chat.currentUserId` — active user identifier
- `chat.reasoningMode` — reasoning toggle state

#### Common Frontend Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| CORS error in console | Backend `CORS_ALLOWED_ORIGINS` missing frontend origin | Add `http://localhost:3000` to backend `.env` |
| 401 Unauthorized on chat | Missing or invalid DRF token | Check `localStorage.getItem('auth_token')`; re-login if missing |
| Messages disappear on new tab | sessionStorage limitation | Expected behavior — redux-persist uses sessionStorage, not localStorage |
| Login fails with "user type mismatch" | Selected role does not match UserProfile | Select the correct role in the UI |
| Widget stuck in loading state | `authenticating` state not transitioning | Check Network tab for login API response; verify backend is running |

### Backend Debugging

#### API Testing with curl

```bash
# Health check
curl http://localhost:8000/api/tasks/health/

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"student123!","user_type":"student"}'

# Chat (authenticated — use token from login response)
curl -X POST http://localhost:8000/api/langflow/chat/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token <token-from-login>" \
  -d '{"input_value":"What programs do you offer?","output_type":"any","input_type":"chat"}'

# Chat (guest — no auth)
curl -X POST http://localhost:8000/api/langflow/chat/ \
  -H "Content-Type: application/json" \
  -d '{"input_value":"Hello","session_id":"test-session-123"}'
```

#### Database Inspection

```bash
# Django shell
python manage.py shell

# Check user profiles
>>> from core.models import UserProfile
>>> UserProfile.objects.all().values('user__username', 'user_type')

# Check chat logs
>>> from tasks.models import ChatLog
>>> ChatLog.objects.count()
>>> ChatLog.objects.filter(status='fail').count()
>>> ChatLog.objects.order_by('-created_at').first()
```

#### Langflow Connectivity

If the chat endpoint returns a 503 Service Unavailable error:

1. Verify `LANGFLOW_API_URL` is reachable: `curl <LANGFLOW_API_URL>/health`
2. Verify `LANGFLOW_API_KEY` is valid
3. Verify `LANGFLOW_RUN_ID` matches an existing flow in Langflow
4. Add temporary logging in `core/views.py` `langflow_chat()` before the `requests.post()` call

#### Common Backend Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| 503 on chat | Langflow API unreachable or misconfigured | Check `LANGFLOW_API_URL`, `LANGFLOW_API_KEY`, `LANGFLOW_RUN_ID` |
| Empty assistant response | Langflow response structure changed | Verify `outputs[0].outputs[0].outputs.payload.message` path in parser |
| Chat logs not saving | `IS_LOGGING_ENABLED` is false | Set `IS_LOGGING_ENABLED=True` in `.env` |
| Duplicate turn_index | Advisory lock bypassed under high load | Verify PostgreSQL `pg_advisory_xact_lock` is called in `log_chat_async()` |
| Migration errors | Pending migrations or model changes | Run `python manage.py makemigrations && python manage.py migrate` |

### Docker Debugging

```bash
# View container logs
docker logs aitgpt_backend_web -f
docker logs aitgpt_frontend -f
docker logs aitgpt_backend_db -f

# Shell into backend container
docker exec -it aitgpt_backend_web bash
python manage.py shell

# Shell into database container
docker exec -it aitgpt_backend_db psql -U <DB_USER> -d <DB_NAME>
```

---

## Related Documentation

- Backend: See `Backend/README.md`
- Sample Logins: See `SAMPLE_LOGINS.md`

**Maintainers**: @malcolm123ssj, @akraradets

**Status**: In Development
