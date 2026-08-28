# Backend Overview

The Auditerra backend provides a RESTful API for authentication, farmer management, service tickets, field diagnostics, AI recommendations, staff management, location tracking, and audit logging.

The backend is built with **FastAPI** and uses a layered architecture consisting of routers, services, repositories, and a PostgreSQL database.

---

## Prerequisites

Before setting up the backend, ensure the following are installed on your system:

| Tool       | Version | Purpose             |
| ---------- | ------- | ------------------- |
| Python     | 3.11+   | Runtime environment |
| PostgreSQL | 15+     | Production database |
| Git        | Latest  | Version control     |

### Install PostgreSQL on Linux

```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "CREATE USER rod_user WITH PASSWORD 'rod_password';"
sudo -u postgres psql -c "CREATE DATABASE rod_db OWNER rod_user;"
```

---

## Setup and Installation

### Clone the Repository

```bash
git clone https://github.com/your-org/auditerra.git
cd auditerra/backend
```

### Create and Activate Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Linux/macOS
# venv\Scripts\activate   # On Windows
```

### Install Dependencies

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development
```

### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
ENVIRONMENT=development
DEBUG=true
PORT=8000

# Database
DATABASE_URL=postgresql://rod_user:rod_password@localhost:5432/rod_db

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# External Services
AFRICASTALKING_API_KEY=your-api-key
GEMINI_API_KEY=your-api-key
SMS_LEOPARD_API_KEY=your-api-key
```

### Run Database Migrations

```bash
alembic upgrade head
```

### Seed the Database

```bash
python scripts/seed.py
```

### Start the Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Code Standards

### Naming Conventions

| Element               | Convention       | Example              |
| --------------------- | ---------------- | -------------------- |
| Variables / Functions | snake_case       | `get_user_by_id()`   |
| Classes               | PascalCase       | `UserRepository`     |
| Constants             | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Files                 | snake_case       | `user_repository.py` |

### Linting and Formatting

| Tool  | Purpose       | Config File      |
| ----- | ------------- | ---------------- |
| Ruff  | Linting       | `pyproject.toml` |
| Black | Formatting    | `pyproject.toml` |
| MyPy  | Type checking | `pyproject.toml` |

### Commit Message Format

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routers/              # Endpoint definitions
│   │   └── schemas/              # Pydantic models
│   ├── core/                     # Core configuration
│   │   ├── config.py             # Application settings
│   │   ├── security.py           # Authentication and authorization
│   │   └── database.py           # Database connection
│   ├── models/                   # SQLAlchemy models
│   ├── repositories/             # Data access layer
│   ├── services/                 # Business logic layer
│   ├── utils/                    # Helper functions
│   └── main.py                   # Application entry point
├── tests/
│   ├── unit/
│   └── integration/
├── migrations/                   # Alembic database migrations
├── scripts/
│   └── seed.py                   # Database seeding script
├── requirements.txt
└── requirements-dev.txt
```

---

## Configuration

### Environment Variables

Environment variables control the application's runtime behavior. Create a `.env` file in the backend root directory with the following configuration:

```env
# Server
ENVIRONMENT=development
DEBUG=true
PORT=8000

# Database
DATABASE_URL=postgresql://rod_user:rod_password@localhost:5432/rod_db

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# External Services
AFRICASTALKING_API_KEY=your-api-key
GEMINI_API_KEY=your-api-key
SMS_LEOPARD_API_KEY=your-api-key
```

### Database Connection

The database connection is managed through SQLAlchemy. The `get_db` function provides a database session for each request and ensures proper cleanup after the request completes:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### JWT Utilities

JWT tokens are used for authentication. The `create_access_token` function generates a new token with an expiration time, and `decode_token` validates and decodes incoming tokens:

```python
from datetime import datetime, timedelta
from jose import jwt

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

### Password Hashing

Passwords are hashed using bcrypt before storage. The `verify_password` function compares a plain-text password against its hash, while `get_password_hash` generates a new hash for storage:

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

---

## Architecture Layers

| Layer             | Responsibility                                  |
| ----------------- | ----------------------------------------------- |
| Router            | HTTP request handling, input validation         |
| Schema            | Pydantic models for request/response validation |
| Service           | Business logic, orchestration                   |
| Repository        | Database operations, data access                |
| Database          | PostgreSQL with PostGIS                         |
| External Services | Gemini, Africa's Talking, SMS Leopard           |

---

## API Conventions

### Base URL and Authentication

All endpoints are exposed under `/api/v1` and require a Bearer JWT token:

```http
Authorization: Bearer <access_token>
```

### Common Status Codes

| Status | Meaning                  |
| ------ | ------------------------ |
| 200    | Request successful       |
| 201    | Resource created         |
| 204    | Resource deleted         |
| 400    | Invalid request          |
| 401    | Authentication required  |
| 403    | Insufficient permissions |
| 404    | Resource not found       |
| 422    | Validation failed        |
| 429    | Rate limit exceeded      |

### Rate Limiting

| Endpoint Group          | Limit        | Window     |
| ----------------------- | ------------ | ---------- |
| Public endpoints        | 100 requests | 60 seconds |
| Authenticated endpoints | 200 requests | 60 seconds |
| Gemini AI endpoints     | 100 requests | 60 seconds |
| SMS (per farmer)        | 10/day       | 24 hours   |

---

## Endpoint Categories

Detailed endpoint documentation including request/response schemas and examples is available in the hosted Swagger UI.

| Category               | Description                                       |
| ---------------------- | ------------------------------------------------- |
| **Authentication**     | Login, MFA, logout, token refresh, password reset |
| **Users**              | User management and profile operations            |
| **Farmers**            | Farmer profiles, handshake codes, issue reporting |
| **Service Tickets**    | Full ticket lifecycle management                  |
| **Diagnostic Logs**    | Soil diagnostic data collection and sync          |
| **AI Recommendations** | AI-generated agronomic recommendations            |
| **Staff**              | Expert and supervisor management                  |
| **Locations**          | GPS and geospatial data management                |

---

## SMS Integration

Auditerra integrates with **Africa's Talking** for dispatch notifications. When a ticket is dispatched, the system sends an SMS to the farmer with confirmation details. SMS failures are logged and do not block the primary ticket workflow:

```python
def send_dispatch_sms(farmer_phone: str, ticket_category: str):
    sms.send(f"Your ticket for '{ticket_category}' has been dispatched.", [farmer_phone])
```

---

## Swagger Documentation

Complete API endpoint documentation with all request and response schemas, authentication requirements, and example payloads is available in the Swagger documentation repository. This serves as the authoritative reference for all API endpoints, including detailed descriptions of each endpoint's purpose, parameters, error responses, and expected behaviors.

[Swagger Documentation](https://github.com/najmahares/SciSync-Swagger-documentation)

---

## Testing and QA

The backend API is tested using **Postman** for automated API regression testing. The test suite covers all major resources and validates HTTP status codes, response schemas, and security controls:

```bash
newman run Auditerra-API-Collection.json --environment Auditerra-Environment.json
```

### Test Coverage

| Resource        | Test Scenarios                                                |
| --------------- | ------------------------------------------------------------- |
| Users           | JWT authentication, role-based access, profile updates        |
| Farmers         | USSD registration, handshake code generation, IDOR prevention |
| Tickets         | Full lifecycle, cancellation logic, dispatch workflows        |
| Locations       | GPS validation, spatial boundary capture                      |
| Diagnostic Logs | Soil parameter validation, offline sync                       |
| Recommendations | AI output validation, delivery status                         |

### Postman Documentation

[View the Postman Collection](https://github.com/akirachix/Scisync_Backend/tree/Scisync_Qa_Postman_Testing)

### API Testing Workbook

[View the Testing Workbook](https://docs.google.com/spreadsheets/d/1Ag7YrY-18PpcufDGv0lBdb5dh3bCf5EIaaojNtgb4vs/edit?gid=772674532#gid=772674532)

---

## Deployment

### Backend (Heroku)

| Component | Specification              |
| --------- | -------------------------- |
| Hosting   | Heroku (Dublin, Ireland)   |
| Dyno Type | Standard-1x (1GB)          |
| Database  | Heroku Postgres (Standard) |

### Deployment Commands

```bash
git push heroku main          # Deploy code
heroku run alembic upgrade head  # Run database migrations
heroku run python scripts/seed.py  # Seed initial data
```

### Health Check

The health endpoint verifies that the application, database, and external services are operational:

```http
GET /health
```
