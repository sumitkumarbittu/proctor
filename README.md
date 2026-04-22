# Online Examination and Proctoring System (OEPS)

A comprehensive, production-ready online examination platform with built-in proctoring capabilities. Built with modern, scalable technologies.

## Tech Stack

**Backend:**
- **Framework:** FastAPI (Python 3.11)
- **Database:** PostgreSQL 15
- **ORM:** SQLAlchemy 2.0 (Async) + Alembic Migrations
- **Authentication:** JWT (Access + Refresh Tokens)
- **Monitoring:** Sentry (Optional integration ready)
- **Containerization:** Docker + Docker Compose

**Frontend:**
- **Core:** Pure HTML5, modular CSS3, TypeScript
- **Build Tool:** Vite (for optimal asset bundling and HMR)
- **Networking:** Native Fetch API with custom wrapper
- **Hosting:** Nginx (via Docker)

## Features

- **Role-Based Access Control (RBAC):** Admin, Examiner, Student roles.
- **Exam Management:** Create exams with MCQs and Subjective questions.
- **Exam Attempt Engine:**
  - Timer enforcement.
  - Auto-save every few seconds.
  - One-time submission.
- **Proctoring Module:**
  - Tab switch detection.
  - Window blur/focus tracking.
  - Metadata logging.
- **Evaluation:**
  - Automatic grading for MCQs.
  - Manual evaluation support for Subjective answers.
- **Reporting:** Exam summary statistics.

## Project Structure

```bash
.
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # API Routers (v1)
│   │   ├── core/           # Config & Security
│   │   ├── db/             # Database Session & Base
│   │   ├── models/         # SQLAlchemy Models
│   │   ├── schemas/        # Pydantic Schemas
│   │   ├── services/       # Business Logic (Service Layer)
│   │   ├── repositories/   # Data Access Layer
│   │   └── main.py         # App Entry Point
│   ├── migrations/         # Alembic Migrations
│   ├── scripts/            # Startup Scripts
│   ├── tests/              # Pytest Suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Frontend Application
│   ├── src/
│   │   ├── scripts/        # TypeScript Modules
│   │   └── styles/         # CSS Modules
│   ├── index.html          # Login Page
│   ├── dashboard.html      # User Dashboard
│   ├── exam.html           # Exam Interface
│   ├── result.html         # Result Page
│   ├── nginx.conf          # Nginx Config
│   └── Dockerfile
└── docker-compose.yml      # Orchestration
```

## Quick Start

### Prerequisites
- Docker & Docker Compose installed.

### Setup & Run
1. **Clone the repository.**
2. **Build and start services:**

```bash
docker-compose up --build
```
This will:
- Spin up PostgreSQL database.
- Build the Backend image.
- Build the Frontend image (compiling TypeScript).
- Run database migrations automatically.
- Create a default Superuser.

3. **Access the Application:**
   - Frontend: `http://localhost`
   - API Docs: `http://localhost:8000/docs`

### Default Credentials
A superuser is created automatically on first run:
- **Email:** `admin@example.com`
- **Password:** `password` (Change this immediately in production!)

## Development Workflow

- **Backend:** The `backend/app` directory is mounted as a volume. Changes to Python files will trigger auto-reload.
- **Frontend:** Since we use a multi-stage Docker build for production (Nginx), live reloading requires running Vite locally:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  Then access `http://localhost:5173`. Make sure to update proxy settings in `vite.config.ts` if running outside Docker network.

## Assumptions & Notes
- **Security:** In a real production environment, secrets (SECRET_KEY, POSTGRES_PASSWORD) should be injected via robust secret management, not `.env` files committed to repo.
- **Proctoring:** Basic browser events (visibilitychange, blur) are used. Advanced proctoring would require WebRTC/Camera permissions.
- **Evaluation:** Currently, MCQs are auto-graded upon submission/evaluation trigger. Subjective answers require manual review (endpoint provided).
- **Time Sync:** Exam timer runs client-side synchronized with server start time. For strict enforcement, server-side validation on submission is critical (partially implemented).

## License
MIT
