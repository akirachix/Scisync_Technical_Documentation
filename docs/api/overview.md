# Backend Overview

The Auditerra backend provides a RESTful API for authentication, farmer management, service tickets, field diagnostics, AI recommendations, staff management, location tracking, and audit logging.

The backend is built with **FastAPI** and uses a layered architecture consisting of routers, services, repositories, and a PostgreSQL database.

---

## API Information

| Item              | Details            |
| ----------------- | ------------------ |
| Framework         | FastAPI            |
| API Version       | `v1`               |
| Base Path         | `/api/v1`          |
| Database          | PostgreSQL         |
| ORM / Data Access | SQLAlchemy         |
| Spatial Data      | PostGIS            |
| Authentication    | JWT                |
| API Documentation | Swagger UI / ReDoc |
| SMS Integration   | Africa's Talking   |
| AI Integration    | Google Gemini      |

---

## Hosted API

**Production API:**
`https://auditerra-6a019ce5a862.herokuapp.com`

**Swagger UI:**
`https://auditerra-6a019ce5a862.herokuapp.com/docs`

---

## Prerequisites

Before setting up the backend, ensure the following are installed on your system:

| Tool       | Version | Purpose                        |
| ---------- | ------- | ------------------------------ |
| Python     | 3.11+   | Runtime environment            |
| PostgreSQL | 15+     | Production database            |
| Redis      | 7+      | Caching and session management |
| Git        | Latest  | Version control                |
| Make       | Any     | Task automation (optional)     |

### Install PostgreSQL on Linux

```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "CREATE USER rod_user WITH PASSWORD 'rod_password';"
sudo -u postgres psql -c "CREATE DATABASE rod_db OWNER rod_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rod_db TO rod_user;"
```

### Install Redis on Linux

```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
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
# Server Configuration
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://rod_user:rod_password@localhost:5432/rod_db
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_SESSION_URL=redis://localhost:6379/1

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Africa's Talking
AFRICASTALKING_API_KEY=your-api-key
AFRICASTALKING_USERNAME=your-username
AFRICASTALKING_SERVICE_CODE=your-service-code

# SMS Leopard
SMS_LEOPARD_API_KEY=your-api-key
SMS_LEOPARD_SENDER_ID=RoD

# Google Gemini
GEMINI_API_KEY=your-api-key
GEMINI_MODEL=gemini-1.5-flash

# Feature Flags
ENABLE_AI_DIAGNOSTICS=true
ENABLE_OFFLINE_SYNC=true
ENABLE_60_DAY_AUDIT=true
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

## Architecture Layers

The backend follows a strict layered architecture that separates concerns and ensures maintainability.

| Layer             | Responsibility                                             |
| ----------------- | ---------------------------------------------------------- |
| Router            | Receives HTTP requests, validates input, returns responses |
| Schema            | Pydantic models for request/response validation            |
| Service           | Contains business logic and orchestrates operations        |
| Repository        | Performs database operations, abstracts data access        |
| Database          | PostgreSQL with PostGIS for spatial queries                |
| External Services | AI (Gemini), SMS (Africa's Talking), USSD                  |

### Request Flow

```
Client
  ↓
FastAPI Router
  ↓
Authentication / Authorization
  ↓
Pydantic Schema Validation
  ↓
Service Layer
  ↓
Repository Layer
  ↓
PostgreSQL / PostGIS
  ↓
Response
```

For AI-enabled operations:

```
Client
  ↓
API Router
  ↓
Service Layer
  ↓
Diagnostic Data
  ↓
AI / Knowledge Retrieval
  ↓
Generated Recommendation
  ↓
Recommendation Repository
  ↓
PostgreSQL
  ↓
API Response
```

---

## API Conventions

### Base URL

All versioned endpoints are exposed under `/api/v1`.

```http
GET /api/v1/users
GET /api/v1/farmers
GET /api/v1/ticket
```

### Authentication

Protected endpoints use a Bearer JWT access token.

```http
Authorization: Bearer <access_token>
```

### Common HTTP Status Codes

| Status | Meaning                            |
| ------ | ---------------------------------- |
| `200`  | Request successful                 |
| `201`  | Resource created                   |
| `204`  | Resource deleted successfully      |
| `400`  | Invalid request                    |
| `401`  | Authentication required or invalid |
| `403`  | Insufficient permissions           |
| `404`  | Resource not found                 |
| `409`  | Conflict or invalid resource state |
| `422`  | Request validation failed          |
| `429`  | Rate limit exceeded                |
| `500`  | Internal server error              |

### Validation Error Response

FastAPI returns structured validation errors:

```json
{
  "detail": [
    {
      "type": "string_type",
      "loc": ["body", "phone"],
      "msg": "Input should be a valid string",
      "input": null
    }
  ]
}
```

### Rate Limiting

| Endpoint Group           | Limit        | Window     |
| ------------------------ | ------------ | ---------- |
| Public endpoints         | 100 requests | 60 seconds |
| Authenticated endpoints  | 200 requests | 60 seconds |
| Gemini AI endpoints      | 100 requests | 60 seconds |
| SMS sending (per farmer) | 10/day       | 24 hours   |
| SMS sending (per expert) | 100/day      | 24 hours   |

---

## Endpoint Reference

### Authentication API

Manages login, MFA verification, token refresh, logout, and password recovery.

| Method | Endpoint                | Purpose                |
| ------ | ----------------------- | ---------------------- |
| `POST` | `/auth/login`           | Authenticate user      |
| `POST` | `/auth/verify-otp`      | Verify MFA code        |
| `POST` | `/auth/logout`          | Logout current session |
| `POST` | `/auth/refresh`         | Refresh access token   |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password`  | Reset password         |

### Users API

Manages system accounts and user profiles.

| Method   | Endpoint                      | Purpose          |
| -------- | ----------------------------- | ---------------- |
| `GET`    | `/users`                      | List users       |
| `GET`    | `/users/me`                   | Get current user |
| `GET`    | `/users/{user_id}`            | Get user         |
| `POST`   | `/users`                      | Create user      |
| `PATCH`  | `/users/{user_id}`            | Update user      |
| `PATCH`  | `/users/{user_id}/deactivate` | Deactivate user  |
| `DELETE` | `/users/{user_id}`            | Delete user      |

### Farmers API

Manages farmer profiles, locations, handshake codes, issue reporting, and farmer ticket access.

| Method   | Endpoint                                          | Purpose            |
| -------- | ------------------------------------------------- | ------------------ |
| `GET`    | `/farmers`                                        | List farmers       |
| `GET`    | `/farmers/{farmer_id}`                            | Get farmer         |
| `POST`   | `/farmers`                                        | Create farmer      |
| `PATCH`  | `/farmers/{farmer_id}`                            | Update farmer      |
| `DELETE` | `/farmers/{farmer_id}`                            | Delete farmer      |
| `POST`   | `/farmers/{farmer_id}/report-issue`               | Report issue       |
| `GET`    | `/farmers/{farmer_id}/tickets`                    | Get farmer tickets |
| `POST`   | `/farmers/{farmer_id}/tickets/{ticket_id}/cancel` | Cancel ticket      |
| `POST`   | `/farmers/{farmer_id}/verify-handshake`           | Verify handshake   |
| `POST`   | `/farmers/{farmer_id}/rotate-handshake`           | Rotate handshake   |

### Service Tickets API

Manages the complete service-request lifecycle from creation through resolution.

**Ticket States:** `pending` → `dispatched` → `resolved` → `cancelled`

| Method   | Endpoint                                 | Purpose                |
| -------- | ---------------------------------------- | ---------------------- |
| `GET`    | `/ticket`                                | List tickets           |
| `GET`    | `/ticket/status/{status}`                | Filter by status       |
| `GET`    | `/ticket/farmer/{farmer_id}`             | Farmer tickets         |
| `GET`    | `/ticket/staff/{staff_id}`               | Expert tickets         |
| `GET`    | `/ticket/{ticket_id}`                    | Get ticket             |
| `POST`   | `/ticket`                                | Create ticket          |
| `PATCH`  | `/ticket/{ticket_id}`                    | Update ticket          |
| `POST`   | `/ticket/{ticket_id}/dispatch`           | Dispatch expert        |
| `POST`   | `/ticket/auto-dispatch`                  | Automatically dispatch |
| `POST`   | `/ticket/{ticket_id}/cancel/{farmer_id}` | Cancel ticket          |
| `POST`   | `/ticket/{ticket_id}/resolve/{staff_id}` | Resolve ticket         |
| `DELETE` | `/ticket/{ticket_id}`                    | Delete ticket          |

**Expert Matching Factors:**

| Factor                   | Weight |
| ------------------------ | ------ |
| Proximity                | 40%    |
| Technical Specialization | 35%    |
| Language Compatibility   | 15%    |
| Availability             | 10%    |

**Search Radius:** 15km → 30km → 45km → Unlimited

### Diagnostic Logs API

Stores soil measurements collected by field experts during farm visits.

**Diagnostic Parameters:**

| Parameter         | Range | Description               |
| ----------------- | ----- | ------------------------- |
| `soil_ph`         | 0-14  | Soil acidity/alkalinity   |
| `nitrogen_ppm`    | 0-200 | Nitrogen concentration    |
| `phosphorous_ppm` | 0-100 | Phosphorous concentration |
| `potassium_ppm`   | 0-500 | Potassium concentration   |

| Method   | Endpoint                   | Purpose               |
| -------- | -------------------------- | --------------------- |
| `GET`    | `/logs`                    | List diagnostic logs  |
| `GET`    | `/logs/{log_id}`           | Get diagnostic log    |
| `GET`    | `/logs/ticket/{ticket_id}` | Get log by ticket     |
| `GET`    | `/logs/expert/{staff_id}`  | Get expert logs       |
| `POST`   | `/logs`                    | Create diagnostic log |
| `POST`   | `/logs/sync-offline`       | Sync offline logs     |
| `PATCH`  | `/logs/{log_id}`           | Update log            |
| `DELETE` | `/logs/{log_id}`           | Delete log            |

### AI Recommendations API

Generates agronomic recommendations from diagnostic information using Retrieval-Augmented Generation.

| Method   | Endpoint                              | Purpose                 |
| -------- | ------------------------------------- | ----------------------- |
| `POST`   | `/recommendation`                     | Generate recommendation |
| `GET`    | `/recommendation`                     | List recommendations    |
| `GET`    | `/recommendation/{recommendation_id}` | Get recommendation      |
| `GET`    | `/recommendation/farmer/{farmer_id}`  | Farmer recommendations  |
| `GET`    | `/recommendation/log/{log_id}`        | Recommendation by log   |
| `PATCH`  | `/recommendation/{recommendation_id}` | Update recommendation   |
| `DELETE` | `/recommendation/{recommendation_id}` | Delete recommendation   |

**Recommendation Delivery Status:**

- Expert: `pending` → `sent` → `delivered`
- SMS: `pending` → `sent` → `delivered` / `failed`

### Staff API

Manages field experts and institutional supervisors.

| Method   | Endpoint            | Purpose             |
| -------- | ------------------- | ------------------- |
| `GET`    | `/staff`            | List staff          |
| `GET`    | `/staff/{staff_id}` | Get staff member    |
| `POST`   | `/staff`            | Create staff member |
| `PATCH`  | `/staff/{staff_id}` | Update staff member |
| `DELETE` | `/staff/{staff_id}` | Delete staff member |

### Locations API

Stores GPS and geographic information captured by field experts.

| Method   | Endpoint                      | Purpose                |
| -------- | ----------------------------- | ---------------------- |
| `GET`    | `/locations`                  | List locations         |
| `GET`    | `/locations/{location_id}`    | Get location           |
| `GET`    | `/locations/county/{county}`  | Locations by county    |
| `GET`    | `/locations/staff/{staff_id}` | Locations by expert    |
| `POST`   | `/locations`                  | Create location        |
| `POST`   | `/locations/sync-offline`     | Sync offline locations |
| `PATCH`  | `/locations/{location_id}`    | Update location        |
| `DELETE` | `/locations/{location_id}`    | Delete location        |

### Audit Logs API

Records important system actions for traceability and accountability.

| Repository Method     | Purpose                                |
| --------------------- | -------------------------------------- |
| `get()`               | Retrieve an audit log                  |
| `get_by_actor()`      | Retrieve actions performed by an actor |
| `get_by_event_type()` | Filter by event type                   |
| `get_by_resource()`   | Filter by affected resource            |
| `get_all()`           | Retrieve audit logs                    |
| `create()`            | Create an audit entry                  |

---

## Repository Layer

The backend uses repositories to isolate database access from business logic.

### Repository Summary

| Repository                 | Primary Resource     |
| -------------------------- | -------------------- |
| `UserRepository`           | Users                |
| `FarmerRepository`         | Farmers              |
| `TicketRepository`         | Service tickets      |
| `StaffRepository`          | Institution staff    |
| `LocationRepository`       | Geographic locations |
| `DiagnosticLogRepository`  | Diagnostic logs      |
| `RecommendationRepository` | AI recommendations   |
| `AuditLogRepository`       | Audit records        |

### UserRepository

| Method           | Purpose            |
| ---------------- | ------------------ |
| `get()`          | Get user by ID     |
| `get_by_phone()` | Find user by phone |
| `get_by_email()` | Find user by email |
| `get_by_role()`  | Find users by role |
| `get_all()`      | List users         |
| `create()`       | Create user        |
| `update()`       | Update user        |
| `deactivate()`   | Deactivate user    |

### FarmerRepository

| Method               | Purpose                  |
| -------------------- | ------------------------ |
| `get()`              | Get farmer               |
| `get_by_phone()`     | Find farmer by phone     |
| `get_by_handshake()` | Find farmer by handshake |
| `get_all()`          | List farmers             |
| `create()`           | Create farmer            |
| `update()`           | Update farmer            |
| `delete()`           | Delete farmer            |

### TicketRepository

| Method            | Purpose             |
| ----------------- | ------------------- |
| `get()`           | Get ticket          |
| `get_by_farmer()` | Find farmer tickets |
| `get_by_staff()`  | Find expert tickets |
| `get_by_status()` | Filter tickets      |
| `get_all()`       | List tickets        |
| `create()`        | Create ticket       |
| `update()`        | Update ticket       |
| `delete()`        | Delete ticket       |

### StaffRepository

| Method                     | Purpose             |
| -------------------------- | ------------------- |
| `get()`                    | Get staff           |
| `get_by_email()`           | Find staff by email |
| `get_by_role()`            | Filter by role      |
| `get_by_county_and_role()` | Find suitable staff |
| `get_all()`                | List staff          |
| `create()`                 | Create staff        |
| `update()`                 | Update staff        |
| `delete()`                 | Delete staff        |

### LocationRepository

| Method            | Purpose               |
| ----------------- | --------------------- |
| `get()`           | Get location          |
| `get_by_county()` | Find county locations |
| `get_by_staff()`  | Find staff locations  |
| `get_all()`       | List locations        |
| `create()`        | Create location       |
| `update()`        | Update location       |
| `delete()`        | Delete location       |

### DiagnosticLogRepository

| Method            | Purpose             |
| ----------------- | ------------------- |
| `get()`           | Get diagnostic log  |
| `get_by_ticket()` | Find log by ticket  |
| `get_by_staff()`  | Find logs by expert |
| `get_all()`       | List logs           |
| `create()`        | Create log          |
| `update()`        | Update log          |
| `delete()`        | Delete log          |

### RecommendationRepository

| Method            | Purpose                     |
| ----------------- | --------------------------- |
| `get()`           | Get recommendation          |
| `get_all()`       | List recommendations        |
| `get_by_farmer()` | Find farmer recommendations |
| `get_by_log()`    | Find recommendation by log  |
| `get_by_staff()`  | Find expert recommendations |
| `create()`        | Create recommendation       |
| `update()`        | Update recommendation       |
| `update_by_id()`  | Update by ID                |
| `delete()`        | Delete recommendation       |

### AuditLogRepository

| Method                | Purpose                 |
| --------------------- | ----------------------- |
| `get()`               | Get audit log           |
| `get_by_actor()`      | Find actions by actor   |
| `get_by_event_type()` | Filter events           |
| `get_by_resource()`   | Filter resource history |
| `get_all()`           | List audit logs         |
| `create()`            | Create audit record     |

---

## Data Models

The primary backend resources are represented by the following entities:

| Entity               | Purpose                                |
| -------------------- | -------------------------------------- |
| `users`              | Application user accounts              |
| `farmers`            | Farmer-specific profiles               |
| `institution_staff`  | Expert and supervisor profiles         |
| `service_tickets`    | Farmer-reported issues                 |
| `diagnostic_logs`    | Field diagnostic measurements          |
| `locations`          | GPS and geographic records             |
| `ai_recommendations` | Generated agricultural recommendations |
| `audit_logs`         | System activity records                |

### Entity Relationship Diagram

> _Click below to view the detailed visual representation of the entities, their attributes, and foreign key relationships._

[View the Lucidchart Entity Relationship Diagram](https://lucid.app/lucidchart/934030c2-6b6e-49ed-9f23-e8d0e3845bf1/edit?invitationId=inv_68ff5f84-71fe-47b3-a8e6-e9b1750d2e41&page=0_0#)

### Main Relationships

| Relationship                    | Description                                      |
| ------------------------------- | ------------------------------------------------ |
| User → Farmer                   | User account associated with farmer profile      |
| User → Staff                    | User account associated with staff profile       |
| Farmer → Ticket                 | Farmer can create multiple tickets               |
| Staff → Ticket                  | Expert can receive multiple tickets              |
| Ticket → Diagnostic Log         | Ticket can have diagnostic information           |
| Diagnostic Log → Location       | Diagnostic record references field location      |
| Diagnostic Log → Recommendation | Diagnostic data can produce an AI recommendation |
| Farmer → Recommendation         | Farmer receives recommendations                  |
| Staff → Recommendation          | Expert generates/oversees recommendation         |

### Database Model Document

> _Click below to view the detailed documentation of the Auditerra datamodel._

[View the Database Model Document](https://docs.google.com/document/d/16uvKdsZ77rL0jgfASHSE05mavL6Ekg34Pz_7ZQo-TCQ/edit?tab=t.0#heading=h.u5sb3jt0jj1a)

---

## SMS Integration

Auditerra integrates with **Africa's Talking** for dispatch and recommendation notifications.

### Integration Flow

```
Ticket → Expert Matching → Expert Dispatched → SMS Notification → Farmer / Expert
```

### Environment Variables

```env
AFRICASTALKING_USERNAME=your_username
AFRICASTALKING_API_KEY=your_api_key
```

### Dispatch SMS Function

```python
send_dispatch_sms(farmer_phone, ticket_category, custom_message=None)
```

**Example Message:**

```
Hello! Your Auditerra ticket for 'soil' has been dispatched.
An expert is on their way.
```

SMS failures are logged and do not block the primary ticket workflow.

---

## Testing and QA

The Auditerra backend API is rigorously tested to ensure data integrity, security, and performance. Testing uses **Postman** for manual and automated API regression testing, and **FastAPI's native Swagger UI** for live endpoint interaction and verification.

### API Testing Tool

| Tool / Framework | Purpose                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| **Postman**      | Automated API collection, environment variables, and integration tests |

### API Test Coverage Matrix

The Postman collection covers comprehensive testing for every backend resource, including success, validation, and error handling scenarios.

| API Resource        | Endpoint Group     | Key Test Scenarios                                                                                                |
| ------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Users**           | `/users/`          | JWT authentication, password hashing security checks, role-based access, profile updates, and session expiration  |
| **Farmers**         | `/farmers/`        | USSD registration data mapping, handshake code generation/rotation, data isolation (IDOR prevention), and CRUD    |
| **Tickets**         | `/ticket/`         | Full lifecycle (Pending, Matched, Dispatched, Resolved), cancellation logic, and expert dispatch workflows        |
| **Locations**       | `/locations/`      | GPS coordinate validation, spatial boundary capture, county filtering, and geospatial query integrity             |
| **Diagnostic Logs** | `/logs/`           | Soil parameter input validation, offline sync payloads, batch processing, and foreign key validation              |
| **Recommendations** | `/recommendation/` | AI Output schema validation, SMS/webhook delivery statuses, audit trail hashing, and AI prompt injection defenses |

### Postman Collection Highlights

The repository contains automated test scripts executed on every API call, ensuring:

1. **Status Code Validation:** Verifies correct HTTP status codes (200, 201, 204, 400, 401, 403, 404, 422).
2. **Payload Schema Checks:** Validates JSON structure, data types, and required fields using dynamic assertions.
3. **Security Filters:** Automatically blocks and verifies responses do not leak sensitive data (password hashes, SQL queries, or stack traces).
4. **Performance Benchmarks:** Enforces SLA thresholds on response times for production readiness.
5. **Environment Variables:** Dynamically captures IDs (`user_id`, `ticket_id`) to maintain stateful testing across the collection.

### Running the API Tests

1. Import the collection into Postman using the `Auditerra Postman API Collection` JSON file.
2. Configure environment variables: Set `baseUrl` to local (`http://localhost:8000`) or production URL.
3. Execute the collection runner to run all automated requests and view assertion results.

### Related QA Documents

- [API Testing Repository](https://github.com/akirachix/Scisync_Backend/tree/Scisync_Qa_Postman_Testing)
- [API Testing Workbook](https://docs.google.com/spreadsheets/d/1Ag7YrY-18PpcufDGv0lBdb5dh3bCf5EIaaojNtgb4vs/edit?gid=772674532#gid=772674532)

---

## Code Standards

### Naming Conventions

| Element   | Convention       | Example                  |
| --------- | ---------------- | ------------------------ |
| Variables | snake_case       | `user_id`, `farmer_name` |
| Functions | snake_case       | `get_user_by_id()`       |
| Classes   | PascalCase       | `UserRepository`         |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`     |
| Files     | snake_case       | `user_repository.py`     |
| Models    | PascalCase       | `User`, `ServiceTicket`  |
| Endpoints | kebab-case       | `/api/v1/users/me`       |

### Folder Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routers/         # Endpoint definitions
│   │   └── schemas/         # Pydantic models
│   ├── core/
│   │   ├── config.py        # Configuration
│   │   ├── security.py      # Authentication
│   │   └── database.py      # Database connection
│   ├── models/              # SQLAlchemy models
│   ├── repositories/        # Data access layer
│   ├── services/            # Business logic
│   └── utils/               # Helper functions
├── tests/
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── migrations/              # Alembic migrations
├── scripts/                 # Utility scripts
├── requirements.txt         # Production dependencies
├── requirements-dev.txt     # Development dependencies
└── Dockerfile              # Container configuration
```

### Import Order

1. Standard library imports
2. Third-party library imports
3. Local application imports

### Linting and Formatting

| Tool      | Purpose                          | Config File      |
| --------- | -------------------------------- | ---------------- |
| **Ruff**  | Linting (replaces Flake8, isort) | `pyproject.toml` |
| **Black** | Code formatting                  | `pyproject.toml` |
| **MyPy**  | Type checking                    | `pyproject.toml` |

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```
feat(auth): add MFA verification endpoint
fix(ticket): resolve dispatch failure when expert unavailable
docs(api): update authentication schema documentation
```

### Git Branch Strategy

| Branch      | Purpose                 |
| ----------- | ----------------------- |
| `main`      | Production-ready code   |
| `develop`   | Integration branch      |
| `feature/*` | New features            |
| `fix/*`     | Bug fixes               |
| `release/*` | Release preparation     |
| `hotfix/*`  | Urgent production fixes |

---

## Deployment

### Backend (Heroku)

| Component | Specification              |
| --------- | -------------------------- |
| Hosting   | Heroku (Dublin, Ireland)   |
| Dyno Type | Standard-1x (1GB)          |
| Database  | Heroku Postgres (Standard) |
| Redis     | Heroku Redis (Premium-0)   |

### Deployment Commands

```bash
# Deploy to Heroku
git push heroku main

# Run migrations
heroku run alembic upgrade head

# Seed database
heroku run python scripts/seed.py

# View logs
heroku logs --tail
```

### Environment Variables (Heroku)

```bash
heroku config:set ENVIRONMENT=production
heroku config:set DATABASE_URL=postgresql://...
heroku config:set REDIS_URL=redis://...
heroku config:set SECRET_KEY=your-secret-key
```

### Health Check Endpoint

```http
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai_service": "ready"
  }
}
```

---

## Troubleshooting

### Common Issues and Solutions

| Issue                                               | Cause                      | Solution                                                                                     |
| --------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| `JWT_PRIVATE_KEY_PATH not found`                    | Missing private key file   | Use B64 encoded keys in `.env`: `JWT_PRIVATE_KEY_B64=your-key`                               |
| `address already in use :::8000`                    | Port occupied              | Find and kill process: `sudo lsof -i :8000` → `kill -9 <PID>`                                |
| `FATAL: role "rod_user" does not exist`             | Database user missing      | Create user: `sudo -u postgres psql -c "CREATE USER rod_user WITH PASSWORD 'rod_password';"` |
| `ModuleNotFoundError: No module named 'sqlalchemy'` | Dependencies not installed | Activate venv and install: `pip install -r requirements.txt`                                 |
| `Error: connect ECONNREFUSED 127.0.0.1:6379`        | Redis not running          | Start Redis: `sudo systemctl start redis-server`                                             |

---

## API Endpoints Detail

### Authentication Endpoints

#### POST `/auth/login`

Authenticates a user using their credentials.

**Request:**

```json
{
  "email": "example@gmail.com",
  "password": "your_password"
}
```

**Successful Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "your_name",
    "email": "example@gmail.com",
    "role": "expert/supervisor"
  }
}
```

**MFA Response:**

```json
{
  "requires_mfa": true,
  "mfa_temp_token": "eyJhbGciOiJSUzI1NiIs...",
  "message": "MFA verification required"
}
```

---

#### POST `/auth/verify-otp`

Verifies the MFA code supplied after login.

**Request:**

```json
{
  "mfa_temp_token": "eyJhbGciOiJSUzI1NiIs...",
  "mfa_code": "123456",
  "method": "totp"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "David Mwai",
    "email": "supervisor@auditerra.ke",
    "role": "institutional_supervisor"
  }
}
```

---

#### POST `/auth/logout`

Invalidates the current authenticated session.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

---

#### POST `/auth/refresh`

Generates a new access token using a valid refresh token.

**Headers:** `Authorization: Bearer <refresh_token>`

**Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

#### POST `/auth/forgot-password`

Requests a password reset.

**Request:**

```json
{
  "email": "example@gmail.com"
}
```

**Response:**

```json
{
  "message": "If this email exists, a reset link has been sent"
}
```

---

#### POST `/auth/reset-password`

Resets the password using a valid reset token.

**Request:**

```json
{
  "token": "reset_token",
  "new_password": "NewSecurePassword123!"
}
```

**Response:**

```json
{
  "message": "Password reset successful"
}
```

---

### Users Endpoints

#### GET `/users`

Returns a list of users.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

| Parameter | Type    | Description       |
| --------- | ------- | ----------------- |
| `role`    | string  | Filter by role    |
| `county`  | string  | Filter by county  |
| `page`    | integer | Page number       |
| `limit`   | integer | Number of records |

**Response:**

```json
[
  {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Amina Hassan",
    "phone": "+254712345678",
    "email": "amina@example.com",
    "county": "Machakos",
    "role": "farmer",
    "preferred_language": "english",
    "is_active": true
  }
]
```

---

#### GET `/users/me`

Returns the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** Same as `GET /users/{user_id}`

---

#### GET `/users/{user_id}`

Returns a specific user.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Amina Hassan",
  "phone": "+254712345678",
  "email": "amina@example.com",
  "county": "Machakos",
  "role": "farmer",
  "preferred_language": "english",
  "is_active": true,
  "created_at": "2026-01-15T10:30:00Z"
}
```

---

#### POST `/users`

Creates a new user.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body (Farmer):**

```json
{
  "name": "Amina Hassan",
  "phone": "+254712345678",
  "email": "amina@example.com",
  "password": "SecurePassword123!",
  "county": "Machakos",
  "preferred_language": "english",
  "role": "farmer"
}
```

**Request Body (Field Expert):**

```json
{
  "name": "Sarah Kimani",
  "phone": "+254722222222",
  "email": "sarah@example.com",
  "password": "SecurePassword123!",
  "county": "Baringo",
  "preferred_language": "swahili",
  "role": "field_expert",
  "institution_name": "AgriTech Lab",
  "expertise_area": ["Soil Microbiology", "Crop Management"]
}
```

**Response:**

```json
{
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sarah Kimani",
    "phone": "+254722222222",
    "email": "sarah@example.com",
    "role": "field_expert",
    "staff_profile": {
      "institution_name": "AgriTech Lab",
      "expertise_area": ["Soil Microbiology", "Crop Management"]
    }
  },
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer"
}
```

---

#### PATCH `/users/{user_id}`

Updates an existing user.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "name": "Amina Hassan Updated",
  "county": "Kiambu",
  "preferred_language": "swahili"
}
```

**Response:** The updated user object.

---

#### PATCH `/users/{user_id}/deactivate`

Soft-deactivates an account.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "message": "User deactivated successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

#### DELETE `/users/{user_id}`

Permanently deletes a user.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `204 No Content`

---

### Farmers Endpoints

#### GET `/farmers`

Returns registered farmers.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
[
  {
    "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Amina Hassan",
    "phone": "+254712345678",
    "county_location": "Machakos",
    "sub_county": "Masinga",
    "village": "Kyeleni",
    "landmark": "Nambale Market",
    "preferred_language": "english"
  }
]
```

---

#### GET `/farmers/{farmer_id}`

Returns a specific farmer.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** Farmer object with all fields.

---

#### POST `/farmers`

Creates a farmer profile.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "name": "Amina Hassan",
  "phone": "+254712345678",
  "unique_handshake_code": "0000",
  "county_location": "Machakos",
  "sub_county": "Masinga",
  "village": "Kyeleni",
  "landmark": "Nambale Market",
  "preferred_language": "english"
}
```

**Response:** Created farmer object.

---

#### PATCH `/farmers/{farmer_id}`

Updates a farmer profile.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "name": "Amina Hassan Updated",
  "village": "New Village",
  "landmark": "New Landmark"
}
```

**Note:** Phone number cannot be changed via this endpoint.

**Response:** Updated farmer object.

---

#### DELETE `/farmers/{farmer_id}`

Deletes a farmer.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `204 No Content`

---

#### POST `/farmers/{farmer_id}/report-issue`

Allows a farmer to create a service ticket.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "issue_category": "soil",
  "description": "Soil is too acidic and crops are yellowing"
}
```

**Response:**

```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "pending",
  "handshake_code": "4728",
  "message": "Issue reported. Wait for SMS with expert details."
}
```

---

#### GET `/farmers/{farmer_id}/tickets`

Returns all tickets for a farmer.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
[
  {
    "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
    "issue_category": "soil",
    "status": "dispatched",
    "description": "Soil too acidic",
    "expert_name": "Sarah Kimani",
    "expert_phone": "+254722222222",
    "created_at": "2026-01-15T10:30:00Z"
  }
]
```

---

#### POST `/farmers/{farmer_id}/tickets/{ticket_id}/cancel`

Cancels a ticket.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "cancelled"
}
```

---

#### POST `/farmers/{farmer_id}/verify-handshake`

Verifies the farmer/expert handshake code.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "code": "4728"
}
```

**Response:**

```json
{
  "verified": true,
  "message": "Handshake code verified"
}
```

---

#### POST `/farmers/{farmer_id}/rotate-handshake`

Generates a new handshake code.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
  "new_handshake_code": "8392"
}
```

---

### Service Tickets Endpoints

#### GET `/ticket`

Lists all tickets.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

| Parameter   | Type    | Description               |
| ----------- | ------- | ------------------------- |
| `status`    | string  | Filter by status          |
| `county`    | string  | Filter by county          |
| `farmer_id` | UUID    | Filter by farmer          |
| `staff_id`  | UUID    | Filter by assigned expert |
| `page`      | integer | Page number               |
| `limit`     | integer | Items per page            |

**Response:**

```json
[
  {
    "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
    "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
    "staff_id": null,
    "issue_category": "soil",
    "status": "pending",
    "description": "Soil too acidic",
    "handshake_attempts": 0,
    "dispatch_attempts": 0,
    "language": "en",
    "created_at": "2026-01-15T10:30:00Z"
  }
]
```

---

#### GET `/ticket/status/{status}`

Returns tickets filtered by status.

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameter:**

| Parameter | Type   | Description                                                     |
| --------- | ------ | --------------------------------------------------------------- |
| `status`  | string | `pending`, `dispatched`, `in_progress`, `resolved`, `cancelled` |

**Response:** List of tickets matching the status.

---

#### GET `/ticket/farmer/{farmer_id}`

Returns tickets for a specific farmer.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** List of tickets belonging to the farmer.

---

#### GET `/ticket/staff/{staff_id}`

Returns tickets assigned to a specific expert.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** List of tickets assigned to the expert.

---

#### GET `/ticket/{ticket_id}`

Returns a specific ticket.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
  "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
  "staff_id": "550e8400-e29b-41d4-a716-446655440002",
  "issue_category": "soil",
  "status": "dispatched",
  "description": "Soil too acidic, pH 4.5",
  "handshake_attempts": 0,
  "handshake_expires_at": "2026-01-16T10:30:00Z",
  "dispatch_attempts": 1,
  "accepted_at": "2026-01-15T10:40:00Z",
  "language": "en",
  "created_at": "2026-01-15T10:30:00Z",
  "dispatched_at": "2026-01-15T10:35:00Z",
  "resolved_at": null,
  "farmer": {
    "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Amina Hassan",
    "phone": "+254712345678",
    "county_location": "Machakos"
  },
  "expert": {
    "staff_id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Sarah Kimani",
    "phone": "+254722222222",
    "institution_name": "AgriTech Lab"
  }
}
```

---

#### POST `/ticket`

Creates a new service ticket.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
  "issue_category": "soil",
  "description": "Soil is too acidic, pH reading 4.5"
}
```

**Response:** The created ticket object.

---

#### PATCH `/ticket/{ticket_id}`

Updates a ticket.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "status": "in_progress",
  "staff_id": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response:** The updated ticket object.

---

#### POST `/ticket/{ticket_id}/dispatch`

Dispatches an expert to a ticket.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "preferred_county": "Machakos"
}
```

**Response:**

```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "dispatched",
  "staff_id": "550e8400-e29b-41d4-a716-446655440002",
  "expert": {
    "name": "Sarah Kimani",
    "phone": "+254722222222",
    "county": "Machakos"
  },
  "handshake_code": "4728",
  "message": "Expert dispatched successfully"
}
```

---

#### POST `/ticket/auto-dispatch`

Automatically dispatches all pending tickets.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "county": "Machakos"
}
```

**Response:**

```json
{
  "tickets_dispatched": 3,
  "failed": 1,
  "details": [
    {
      "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
      "status": "dispatched",
      "expert_id": "550e8400-e29b-41d4-a716-446655440002"
    }
  ]
}
```

---

#### POST `/ticket/{ticket_id}/cancel/{farmer_id}`

Cancels a ticket.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "cancelled"
}
```

---

#### POST `/ticket/{ticket_id}/resolve/{staff_id}`

Resolves a ticket.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "resolved",
  "resolved_at": "2026-01-16T14:30:00Z"
}
```

---

#### DELETE `/ticket/{ticket_id}`

Permanently deletes a ticket.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `204 No Content`

---

### Diagnostic Logs Endpoints

#### GET `/logs`

Lists all diagnostic logs.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

| Parameter   | Type    | Description      |
| ----------- | ------- | ---------------- |
| `ticket_id` | UUID    | Filter by ticket |
| `staff_id`  | UUID    | Filter by expert |
| `page`      | integer | Page number      |
| `limit`     | integer | Items per page   |

**Response:**

```json
[
  {
    "log_id": "550e8400-e29b-41d4-a716-446655440003",
    "location_id": "550e8400-e29b-41d4-a716-446655440004",
    "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
    "staff_id": "550e8400-e29b-41d4-a716-446655440002",
    "soil_ph": 5.2,
    "nitrogen_ppm": 12.5,
    "phosphorous_ppm": 8.3,
    "potassium_ppm": 95.0,
    "created_at": "2026-01-16T14:30:00Z"
  }
]
```

---

#### GET `/logs/{log_id}`

Returns a specific diagnostic log.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "log_id": "550e8400-e29b-41d4-a716-446655440003",
  "location_id": "550e8400-e29b-41d4-a716-446655440004",
  "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
  "staff_id": "550e8400-e29b-41d4-a716-446655440002",
  "soil_ph": 5.2,
  "nitrogen_ppm": 12.5,
  "phosphorous_ppm": 8.3,
  "potassium_ppm": 95.0,
  "soil_images": null,
  "location": {
    "location_id": "550e8400-e29b-41d4-a716-446655440004",
    "latitude": -1.286389,
    "longitude": 36.817223,
    "county": "Machakos"
  },
  "ticket": {
    "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
    "issue_category": "soil",
    "status": "resolved"
  },
  "expert": {
    "staff_id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Sarah Kimani"
  },
  "created_at": "2026-01-16T14:30:00Z"
}
```

---

#### GET `/logs/ticket/{ticket_id}`

Returns diagnostic log by ticket.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** The diagnostic log object.

---

#### GET `/logs/expert/{staff_id}`

Returns all logs by an expert.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** List of diagnostic logs.

---

#### POST `/logs`

Creates a diagnostic log.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "location_id": "550e8400-e29b-41d4-a716-446655440004",
  "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
  "staff_id": "550e8400-e29b-41d4-a716-446655440002",
  "soil_ph": 5.2,
  "nitrogen_ppm": 12.5,
  "phosphorous_ppm": 8.3,
  "potassium_ppm": 95.0
}
```

**Response:** The created diagnostic log object.

---

#### POST `/logs/sync-offline`

Syncs multiple offline diagnostic logs.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
[
  {
    "location_id": "550e8400-e29b-41d4-a716-446655440004",
    "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
    "staff_id": "550e8400-e29b-41d4-a716-446655440002",
    "soil_ph": 5.2,
    "nitrogen_ppm": 12.5,
    "phosphorous_ppm": 8.3,
    "potassium_ppm": 95.0
  }
]
```

**Response:** List of created diagnostic logs.

---

#### PATCH `/logs/{log_id}`

Updates a diagnostic log.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "soil_ph": 6.0
}
```

**Response:** The updated diagnostic log object.

---

#### DELETE `/logs/{log_id}`

Deletes a diagnostic log.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `204 No Content`

---

### AI Recommendations Endpoints

#### POST `/recommendation`

Generates an AI recommendation from a diagnostic log.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "log_id": "550e8400-e29b-41d4-a716-446655440003",
  "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
  "staff_id": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response:**

```json
{
  "recommendation_id": "550e8400-e29b-41d4-a716-446655440005",
  "log_id": "550e8400-e29b-41d4-a716-446655440003",
  "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
  "staff_id": "550e8400-e29b-41d4-a716-446655440002",
  "recommended_text": "Apply agricultural lime based on the soil assessment.",
  "expert_report": "Field inspection confirmed acidic soil.",
  "expert_recommendation_delivery": "pending",
  "sms_delivery_status": "pending",
  "created_at": "2026-01-16T15:00:00Z"
}
```

---

#### GET `/recommendation`

Lists all AI recommendations.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
[
  {
    "recommendation_id": "550e8400-e29b-41d4-a716-446655440005",
    "log_id": "550e8400-e29b-41d4-a716-446655440003",
    "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
    "staff_id": "550e8400-e29b-41d4-a716-446655440002",
    "recommended_text": "Apply agricultural lime...",
    "expert_report": "Field inspection confirmed acidic soil.",
    "expert_recommendation_delivery": "pending",
    "sms_delivery_status": "pending",
    "created_at": "2026-01-16T15:00:00Z"
  }
]
```

---

#### GET `/recommendation/{recommendation_id}`

Returns a specific AI recommendation.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** The recommendation object.

---

#### GET `/recommendation/farmer/{farmer_id}`

Returns all recommendations for a farmer.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** List of recommendations for the farmer.

---

#### GET `/recommendation/log/{log_id}`

Returns recommendation by diagnostic log ID.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** The recommendation object.

---

#### PATCH `/recommendation/{recommendation_id}`

Updates a recommendation.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "expert_recommendation_delivery": "sent",
  "sms_delivery_status": "delivered"
}
```

**Response:** The updated recommendation object.

---

#### DELETE `/recommendation/{recommendation_id}`

Deletes a recommendation.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `204 No Content`

---

### Staff Endpoints

#### GET `/staff`

Returns staff profiles.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

| Parameter | Type    | Description      |
| --------- | ------- | ---------------- |
| `role`    | string  | Filter by role   |
| `county`  | string  | Filter by county |
| `page`    | integer | Page number      |
| `limit`   | integer | Items per page   |

**Response:**

```json
[
  {
    "staff_id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Sarah Kimani",
    "email": "sarah@example.com",
    "phone": "+254722222222",
    "role": "field_expert",
    "institution_name": "AgriTech Lab",
    "expertise_area": ["Soil Microbiology", "Crop Management"],
    "assigned_county": "Baringo",
    "preferred_language": ["english", "swahili"],
    "last_login": "2026-01-16T10:00:00Z"
  }
]
```

---

#### GET `/staff/{staff_id}`

Returns a specific staff member.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "staff_id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "Sarah Kimani",
  "email": "sarah@example.com",
  "phone": "+254722222222",
  "role": "field_expert",
  "institution_name": "AgriTech Lab",
  "expertise_area": ["Soil Microbiology", "Crop Management"],
  "assigned_county": "Baringo",
  "preferred_language": ["english", "swahili"],
  "location_id": "550e8400-e29b-41d4-a716-446655440006",
  "last_login": "2026-01-16T10:00:00Z"
}
```

---

#### POST `/staff`

Creates a staff member.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "name": "New Expert",
  "email": "expert@example.com",
  "phone": "+254711111111",
  "password": "SecurePassword123!",
  "institution_name": "AgriTech Lab",
  "expertise_area": ["Soil Science", "Agronomy"],
  "assigned_county": "Kiambu",
  "preferred_language": ["english"],
  "role": "field_expert"
}
```

**Response:** The created staff object.

---

#### PATCH `/staff/{staff_id}`

Updates a staff member.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "expertise_area": ["Soil Science", "Crop Management", "Water Conservation"],
  "assigned_county": "Nakuru"
}
```

**Response:** The updated staff object.

---

#### DELETE `/staff/{staff_id}`

Deletes a staff member.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `204 No Content`

---

### Locations Endpoints

#### GET `/locations`

Lists all locations.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**

| Parameter  | Type    | Description      |
| ---------- | ------- | ---------------- |
| `county`   | string  | Filter by county |
| `staff_id` | UUID    | Filter by staff  |
| `page`     | integer | Page number      |
| `limit`    | integer | Items per page   |

**Response:**

```json
[
  {
    "location_id": "550e8400-e29b-41d4-a716-446655440004",
    "latitude": -1.286389,
    "longitude": 36.817223,
    "captured_at": "2026-01-16T14:30:00Z",
    "county": "Machakos",
    "country_code": "KE",
    "region_name": "Eastern",
    "postal_code": "90100",
    "staff_id": "550e8400-e29b-41d4-a716-446655440002",
    "created_at": "2026-01-16T14:30:00Z"
  }
]
```

---

#### GET `/locations/{location_id}`

Returns a specific location.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "location_id": "550e8400-e29b-41d4-a716-446655440004",
  "latitude": -1.286389,
  "longitude": 36.817223,
  "captured_at": "2026-01-16T14:30:00Z",
  "county": "Machakos",
  "country_code": "KE",
  "region_name": "Eastern",
  "postal_code": "90100",
  "staff_id": "550e8400-e29b-41d4-a716-446655440002",
  "created_at": "2026-01-16T14:30:00Z"
}
```

---

#### GET `/locations/county/{county}`

Returns all locations in a county.

**Headers:** `Authorization: Bearer <access_token>`

**Path Parameter:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `county`  | string | County name |

**Response:** List of locations in the county.

---

#### GET `/locations/staff/{staff_id}`

Returns all locations captured by a specific staff member.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** List of locations captured by the staff member.

---

#### POST `/locations`

Creates a location record.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "latitude": -1.286389,
  "longitude": 36.817223,
  "captured_at": "2026-01-16T14:30:00Z",
  "county": "Machakos",
  "country_code": "KE",
  "region_name": "Eastern",
  "postal_code": "90100",
  "staff_id": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response:** The created location object.

---

#### POST `/locations/sync-offline`

Syncs multiple offline locations.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
[
  {
    "latitude": -1.286389,
    "longitude": 36.817223,
    "captured_at": "2026-01-16T14:30:00Z",
    "county": "Machakos",
    "country_code": "KE",
    "region_name": "Eastern",
    "postal_code": "90100",
    "staff_id": "550e8400-e29b-41d4-a716-446655440002"
  }
]
```

**Response:** List of created location objects.

---

#### PATCH `/locations/{location_id}`

Updates a location.

**Headers:** `Authorization: Bearer <access_token>`

**Request:**

```json
{
  "latitude": -1.2864,
  "longitude": 36.81723
}
```

**Response:** The updated location object.

---

#### DELETE `/locations/{location_id}`

Deletes a location.

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `204 No Content`

---

## Endpoint Summary

| Category           | Endpoints |
| ------------------ | --------- |
| Authentication     | 6         |
| Users              | 7         |
| Farmers            | 10        |
| Service Tickets    | 11        |
| Diagnostic Logs    | 8         |
| AI Recommendations | 7         |
| Staff              | 5         |
| Locations          | 8         |
| **Total**          | **62**    |

> The interactive Swagger/OpenAPI documentation should be treated as the authoritative source for the exact deployed endpoint set, request schemas, response schemas, and validation rules.

---

## API Quick Start

### Step 1: Obtain an access token

```http
POST /api/v1/auth/login
```

### Step 2: Include the token in requests

```http
Authorization: Bearer <access_token>
```

### Step 3: Access a protected endpoint

```http
GET /api/v1/users/me
```

### Step 4: Create a farmer issue

```http
POST /api/v1/farmers/{farmer_id}/report-issue
```

### Step 5: Create diagnostic data

```http
POST /api/v1/logs
```

### Step 6: Generate a recommendation

```http
POST /api/v1/recommendation
```

## Schemas Reference

### User Schemas

**UserBase:**

| Field                | Type                | Description                                    |
| -------------------- | ------------------- | ---------------------------------------------- |
| `name`               | string              | User's full name                               |
| `phone`              | string              | Phone number (unique)                          |
| `email`              | EmailStr (optional) | Email address                                  |
| `county`             | string              | County of residence                            |
| `preferred_language` | string (optional)   | "english" or "swahili"                         |
| `role`               | UserRole enum       | farmer, field_expert, institutional_supervisor |

**UserCreate:**

| Field               | Type                | Description            |
| ------------------- | ------------------- | ---------------------- |
| All UserBase fields | -                   | -                      |
| `password`          | string              | Password (min 8 chars) |
| `institution_name`  | string (optional)   | For staff users        |
| `expertise_area`    | string[] (optional) | For staff users        |
| `location_id`       | UUID (optional)     | For staff users        |

**UserUpdate:**

| Field                | Type                | Description      |
| -------------------- | ------------------- | ---------------- |
| `name`               | string (optional)   | Updated name     |
| `phone`              | string (optional)   | Updated phone    |
| `email`              | EmailStr (optional) | Updated email    |
| `county`             | string (optional)   | Updated county   |
| `preferred_language` | string (optional)   | Updated language |

**UserResponse:**

| Field               | Type                            | Description        |
| ------------------- | ------------------------------- | ------------------ |
| All UserBase fields | -                               | -                  |
| `user_id`           | UUID                            | Unique identifier  |
| `created_at`        | datetime                        | Creation timestamp |
| `is_active`         | boolean                         | Soft delete flag   |
| `staff_profile`     | StaffProfileResponse (optional) | For staff users    |

**StaffProfileResponse:**

| Field              | Type                | Description             |
| ------------------ | ------------------- | ----------------------- |
| `institution_name` | string              | Organization name       |
| `expertise_area`   | string[] (optional) | List of specializations |
| `location_id`      | UUID (optional)     | Location reference      |

---

### Farmer Schemas

**FarmerBase:**

| Field                   | Type   | Description            |
| ----------------------- | ------ | ---------------------- |
| `name`                  | string | Farmer's full name     |
| `phone`                 | string | Phone number (unique)  |
| `unique_handshake_code` | string | 4-digit handshake code |
| `county_location`       | string | County of farm         |
| `sub_county`            | string | Sub-county location    |
| `village`               | string | Village name           |
| `landmark`              | string | Nearby landmark        |
| `preferred_language`    | string | "english" or "swahili" |

**FarmerCreate:**

| Field                 | Type | Description |
| --------------------- | ---- | ----------- |
| All FarmerBase fields | -    | -           |

**FarmerRead:**

| Field                 | Type | Description       |
| --------------------- | ---- | ----------------- |
| All FarmerBase fields | -    | -                 |
| `farmer_id`           | UUID | Unique identifier |

**FarmerUpdate:**

| Field                   | Type              | Description            |
| ----------------------- | ----------------- | ---------------------- |
| `farmer_id`             | UUID              | Farmer to update       |
| `name`                  | string            | Updated name           |
| `phone`                 | string (optional) | Updated phone          |
| `unique_handshake_code` | string            | Updated handshake code |
| `county_location`       | string            | Updated county         |
| `sub_county`            | string            | Updated sub-county     |
| `village`               | string            | Updated village        |
| `landmark`              | string            | Updated landmark       |
| `preferred_language`    | string            | Updated language       |

---

### Staff Schemas

**StaffBase:**

| Field                | Type                | Description                                  |
| -------------------- | ------------------- | -------------------------------------------- |
| `role`               | string              | `field_expert` or `institutional_supervisor` |
| `location_id`        | UUID (optional)     | Current location reference                   |
| `name`               | string              | Staff full name                              |
| `email`              | string              | Email address (unique)                       |
| `phone`              | string              | Phone number (unique)                        |
| `institution_name`   | string              | Organization name                            |
| `assigned_county`    | string              | Primary county of operation                  |
| `expertise_area`     | string[] (optional) | List of specializations                      |
| `preferred_language` | string[] or string  | Communication languages                      |

**InstitutionStaffCreate:**

| Field                | Type   | Description            |
| -------------------- | ------ | ---------------------- |
| All StaffBase fields | -      | -                      |
| `password`           | string | Password (min 8 chars) |

**InstitutionStaffRead:**

| Field                | Type                | Description          |
| -------------------- | ------------------- | -------------------- |
| All StaffBase fields | -                   | -                    |
| `staff_id`           | UUID                | Unique identifier    |
| `last_login`         | datetime (optional) | Last login timestamp |

**InstitutionStaffUpdate:**

| Field                | Type                          | Description         |
| -------------------- | ----------------------------- | ------------------- |
| `role`               | string (optional)             | Updated role        |
| `location_id`        | UUID (optional)               | Updated location    |
| `name`               | string (optional)             | Updated name        |
| `email`              | string (optional)             | Updated email       |
| `phone`              | string (optional)             | Updated phone       |
| `institution_name`   | string (optional)             | Updated institution |
| `assigned_county`    | string (optional)             | Updated county      |
| `expertise_area`     | string[] (optional)           | Updated expertise   |
| `preferred_language` | string[] or string (optional) | Updated language    |

---

### Location Schemas

**LocationBase:**

| Field          | Type              | Description                   |
| -------------- | ----------------- | ----------------------------- |
| `latitude`     | float             | GPS latitude                  |
| `longitude`    | float             | GPS longitude                 |
| `captured_at`  | datetime          | Timestamp of capture          |
| `county`       | string            | County name                   |
| `country_code` | string (optional) | ISO country code (e.g., "KE") |
| `region_name`  | string (optional) | Region/Province name          |
| `postal_code`  | string (optional) | Postal/ZIP code               |
| `staff_id`     | UUID (optional)   | Capturing staff ID            |

**LocationCreate:**

| Field                   | Type | Description |
| ----------------------- | ---- | ----------- |
| All LocationBase fields | -    | -           |

**LocationRead:**

| Field                   | Type     | Description        |
| ----------------------- | -------- | ------------------ |
| All LocationBase fields | -        | -                  |
| `location_id`           | UUID     | Unique identifier  |
| `created_at`            | datetime | Creation timestamp |

**LocationUpdate:**

| Field                   | Type | Description        |
| ----------------------- | ---- | ------------------ |
| `location_id`           | UUID | Location to update |
| All LocationBase fields | -    | Updated values     |

---

### Diagnostic Log Schemas

**DiagnosticLogBase:**

| Field             | Type             | Description               |
| ----------------- | ---------------- | ------------------------- |
| `location_id`     | UUID             | Location reference        |
| `ticket_id`       | UUID (optional)  | Associated ticket         |
| `staff_id`        | UUID             | Capturing expert          |
| `soil_ph`         | float (optional) | Soil pH (0-14)            |
| `nitrogen_ppm`    | float (optional) | Nitrogen concentration    |
| `phosphorous_ppm` | float (optional) | Phosphorous concentration |
| `potassium_ppm`   | float (optional) | Potassium concentration   |
| `soil_images`     | bytes (optional) | Image data                |

**DiagnosticLogCreate:**

| Field                        | Type | Description |
| ---------------------------- | ---- | ----------- |
| All DiagnosticLogBase fields | -    | -           |

**DiagnosticLogRead:**

| Field                        | Type | Description       |
| ---------------------------- | ---- | ----------------- |
| All DiagnosticLogBase fields | -    | -                 |
| `log_id`                     | UUID | Unique identifier |

**DiagnosticLogUpdate:**

| Field                        | Type | Description    |
| ---------------------------- | ---- | -------------- |
| `log_id`                     | UUID | Log to update  |
| All DiagnosticLogBase fields | -    | Updated values |

---

### AI Recommendation Schemas

**AIRecommendationBase:**

| Field                            | Type              | Description                              |
| -------------------------------- | ----------------- | ---------------------------------------- |
| `log_id`                         | UUID              | Source diagnostic log                    |
| `farmer_id`                      | UUID              | Target farmer                            |
| `staff_id`                       | UUID              | Generating expert                        |
| `recommended_text`               | string            | AI-generated recommendation              |
| `expert_report`                  | string (optional) | Expert's field report                    |
| `expert_recommendation_delivery` | string            | `pending`, `sent`, `delivered`           |
| `sms_delivery_status`            | string            | `pending`, `sent`, `delivered`, `failed` |

**AIRecommendationCreate:**

| Field                           | Type | Description |
| ------------------------------- | ---- | ----------- |
| All AIRecommendationBase fields | -    | -           |

**AIRecommendationRead:**

| Field                           | Type     | Description        |
| ------------------------------- | -------- | ------------------ |
| All AIRecommendationBase fields | -        | -                  |
| `recommendation_id`             | UUID     | Unique identifier  |
| `created_at`                    | datetime | Creation timestamp |

**AIRecommendationUpdate:**

| Field                            | Type              | Description             |
| -------------------------------- | ----------------- | ----------------------- |
| `recommended_text`               | string (optional) | Updated recommendation  |
| `expert_report`                  | string (optional) | Updated report          |
| `expert_recommendation_delivery` | string (optional) | Updated delivery status |
| `sms_delivery_status`            | string (optional) | Updated SMS status      |

---

### Ticket Schemas

**ServiceTicketBase:**

| Field            | Type              | Description                        |
| ---------------- | ----------------- | ---------------------------------- |
| `farmer_id`      | UUID              | Reporting farmer                   |
| `staff_id`       | UUID (optional)   | Assigned expert                    |
| `issue_category` | string            | `soil`, `water`, `crop`, `erosion` |
| `status`         | string            | Ticket status                      |
| `description`    | string (optional) | Issue description                  |

**ServiceTicketCreate:**

| Field                        | Type | Description |
| ---------------------------- | ---- | ----------- |
| All ServiceTicketBase fields | -    | -           |

**ServiceTicketRead:**

| Field                        | Type     | Description        |
| ---------------------------- | -------- | ------------------ |
| All ServiceTicketBase fields | -        | -                  |
| `ticket_id`                  | UUID     | Unique identifier  |
| `created_at`                 | datetime | Creation timestamp |

**ServiceTicketUpdate:**

| Field                        | Type | Description      |
| ---------------------------- | ---- | ---------------- |
| `ticket_id`                  | UUID | Ticket to update |
| All ServiceTicketBase fields | -    | Updated values   |

---

### Authentication Schemas

**LoginRequest:**

| Field      | Type              | Description                   |
| ---------- | ----------------- | ----------------------------- |
| `email`    | EmailStr          | User's email address          |
| `password` | string            | User's password (min 6 chars) |
| `mfa_code` | string (optional) | 6-digit MFA code              |

**LoginResponse:**

| Field            | Type              | Description             |
| ---------------- | ----------------- | ----------------------- |
| `access_token`   | string            | JWT access token        |
| `refresh_token`  | string            | JWT refresh token       |
| `token_type`     | string            | Always "bearer"         |
| `expires_in`     | integer           | Token expiry in seconds |
| `mfa_required`   | boolean           | Whether MFA is required |
| `mfa_temp_token` | string (optional) | Temporary token for MFA |

**MFAVerifyRequest:**

| Field            | Type   | Description                |
| ---------------- | ------ | -------------------------- |
| `mfa_temp_token` | string | Temporary token from login |
| `mfa_code`       | string | 6-digit verification code  |
| `method`         | string | "totp", "sms", or "email"  |

**ForgotPasswordRequest:**

| Field   | Type     | Description          |
| ------- | -------- | -------------------- |
| `email` | EmailStr | User's email address |

**ResetPasswordRequest:**

| Field          | Type   | Description                |
| -------------- | ------ | -------------------------- |
| `token`        | string | Password reset token       |
| `new_password` | string | New password (min 8 chars) |

---

## Services Layer

The services layer contains the business logic of the application. Each service orchestrates operations across multiple repositories and handles complex workflows.

### Auth Service

| Method                                 | Purpose                                        |
| -------------------------------------- | ---------------------------------------------- |
| `login(db, data, response, client_id)` | Authenticate user, generate tokens, handle MFA |
| `verify_otp(db, data, response)`       | Verify MFA code and complete authentication    |
| `logout(response, request)`            | Invalidate refresh token and clear session     |
| `refresh_token(request, response)`     | Generate new access token from refresh token   |
| `forgot_password(db, data)`            | Generate password reset token and send email   |
| `reset_password(db, data)`             | Validate reset token and update password       |

### User Service

| Method                           | Purpose                                    |
| -------------------------------- | ------------------------------------------ |
| `get_user(db, user_id)`          | Retrieve user by ID                        |
| `get_user_by_email(db, email)`   | Find user by email                         |
| `create_user(db, data)`          | Create new user with role-specific profile |
| `update_user(db, user_id, data)` | Update user profile                        |
| `deactivate_user(db, user_id)`   | Soft-deactivate user account               |
| `delete_user(db, user_id)`       | Permanently delete user                    |

### Farmer Service

| Method                                  | Purpose                                  |
| --------------------------------------- | ---------------------------------------- |
| `get_farmer(db, farmer_id)`             | Retrieve farmer by ID                    |
| `get_farmer_by_phone(db, phone)`        | Find farmer by phone number              |
| `create_farmer(db, data)`               | Create new farmer profile                |
| `update_farmer(db, farmer_id, data)`    | Update farmer profile                    |
| `delete_farmer(db, farmer_id)`          | Delete farmer                            |
| `report_issue(db, farmer_id, data)`     | Create service ticket from farmer report |
| `verify_handshake(db, farmer_id, code)` | Verify handshake code                    |
| `rotate_handshake(db, farmer_id)`       | Generate new handshake code              |

### Ticket Service

| Method                                    | Purpose                                    |
| ----------------------------------------- | ------------------------------------------ |
| `get_ticket(db, ticket_id)`               | Retrieve ticket by ID                      |
| `get_tickets_by_farmer(db, farmer_id)`    | Get all tickets for a farmer               |
| `get_tickets_by_staff(db, staff_id)`      | Get all tickets assigned to an expert      |
| `get_tickets_by_status(db, status)`       | Get tickets by status                      |
| `create_ticket(db, data)`                 | Create new service ticket                  |
| `update_ticket(db, ticket_id, data)`      | Update ticket                              |
| `dispatch_expert(db, ticket_id, data)`    | Match and dispatch expert to ticket        |
| `auto_dispatch(db, county)`               | Automatically dispatch all pending tickets |
| `cancel_ticket(db, ticket_id, farmer_id)` | Cancel a ticket                            |
| `resolve_ticket(db, ticket_id, staff_id)` | Mark ticket as resolved                    |
| `delete_ticket(db, ticket_id)`            | Permanently delete ticket                  |

### Matching Service

| Method                                       | Purpose                                 |
| -------------------------------------------- | --------------------------------------- |
| `find_experts(db, farmer_id, radius)`        | Find experts within radius              |
| `score_experts(db, farmer_id, experts)`      | Score experts using multi-factor matrix |
| `select_best_expert(db, farmer_id, experts)` | Select highest-scoring expert           |
| `expand_radius(attempt)`                     | Calculate next radius based on attempt  |

### Log Service

| Method                             | Purpose                       |
| ---------------------------------- | ----------------------------- |
| `get_log(db, log_id)`              | Retrieve diagnostic log by ID |
| `get_log_by_ticket(db, ticket_id)` | Get log by ticket             |
| `get_logs_by_staff(db, staff_id)`  | Get all logs by expert        |
| `create_log(db, data)`             | Create new diagnostic log     |
| `sync_offline_logs(db, logs)`      | Sync multiple offline logs    |
| `update_log(db, log_id, data)`     | Update diagnostic log         |
| `delete_log(db, log_id)`           | Delete diagnostic log         |

### Recommendation Service

| Method                                               | Purpose                                         |
| ---------------------------------------------------- | ----------------------------------------------- |
| `get_recommendation(db, recommendation_id)`          | Retrieve recommendation by ID                   |
| `get_recommendations_by_farmer(db, farmer_id)`       | Get all recommendations for a farmer            |
| `get_recommendations_by_log(db, log_id)`             | Get recommendation by log                       |
| `generate_recommendation(db, data)`                  | Generate AI recommendation from diagnostic data |
| `update_recommendation(db, recommendation_id, data)` | Update recommendation                           |
| `delete_recommendation(db, recommendation_id)`       | Delete recommendation                           |

### Location Service

| Method                                   | Purpose                         |
| ---------------------------------------- | ------------------------------- |
| `get_location(db, location_id)`          | Retrieve location by ID         |
| `get_locations_by_county(db, county)`    | Get locations by county         |
| `get_locations_by_staff(db, staff_id)`   | Get locations by expert         |
| `create_location(db, data)`              | Create new location record      |
| `sync_offline_locations(db, locations)`  | Sync multiple offline locations |
| `update_location(db, location_id, data)` | Update location                 |
| `delete_location(db, location_id)`       | Delete location                 |

### Staff Service

| Method                                           | Purpose                       |
| ------------------------------------------------ | ----------------------------- |
| `get_staff(db, staff_id)`                        | Retrieve staff by ID          |
| `get_staff_by_email(db, email)`                  | Find staff by email           |
| `get_staff_by_role(db, role)`                    | Get staff by role             |
| `get_staff_by_county_and_role(db, county, role)` | Find staff by county and role |
| `create_staff(db, data)`                         | Create new staff member       |
| `update_staff(db, staff_id, data)`               | Update staff member           |
| `delete_staff(db, staff_id)`                     | Delete staff member           |

### Audit Service

| Method                                                                      | Purpose                |
| --------------------------------------------------------------------------- | ---------------------- |
| `log_action(db, actor_id, event_type, resource_type, resource_id, details)` | Create audit log entry |
| `get_audit_logs_by_actor(db, actor_id, limit)`                              | Get logs by actor      |
| `get_audit_logs_by_event_type(db, event_type, limit)`                       | Get logs by event type |
| `get_audit_logs_by_resource(db, resource_type, resource_id, limit)`         | Get logs by resource   |

---

## Utilities and Helpers

### Database Connection

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Redis Client

```python
import redis
import os

REDIS_URL = os.getenv("REDIS_URL")
redis_client = redis.from_url(REDIS_URL)

def increment_rate_limit(key, window_seconds):
    """Increment rate limit counter with TTL"""
    count = redis_client.incr(key)
    if count == 1:
        redis_client.expire(key, window_seconds)
    return count

def get_rate_limit_count(key):
    """Get current rate limit count"""
    count = redis_client.get(key)
    return int(count) if count else 0
```

### Password Utilities

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)
```

### JWT Utilities

```python
from datetime import datetime, timedelta
from jose import jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

### Handshake Code Generator

```python
import secrets
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_handshake_code():
    """Generate a 4-digit handshake code"""
    return f"{secrets.randbelow(10000):04d}"

def hash_handshake_code(code: str):
    """Hash handshake code for storage"""
    return pwd_context.hash(code)

def verify_handshake_code(code: str, hashed_code: str):
    """Verify handshake code against hash"""
    return pwd_context.verify(code, hashed_code)
```

### SMS Utilities

```python
import africastalking
import os

USERNAME = os.getenv("AFRICASTALKING_USERNAME")
API_KEY = os.getenv("AFRICASTALKING_API_KEY")
africastalking.initialize(USERNAME, API_KEY)
sms = africastalking.SMS

def send_dispatch_sms(farmer_phone: str, ticket_category: str, custom_message: str = None):
    """Send dispatch notification to farmer"""
    if not sms:
        return None

    message = custom_message or f"Hello! Your Auditerra ticket for '{ticket_category}' has been dispatched. An expert is on their way."

    try:
        response = sms.send(message, [farmer_phone])
        return response
    except Exception as e:
        print(f"Error sending Africa's Talking alert: {e}")
        return None

def send_prescription_sms(farmer_phone: str, prescription: str):
    """Send AI-generated prescription to farmer"""
    # Truncate to 160 characters if needed
    message = prescription[:160]
    try:
        response = sms.send(message, [farmer_phone])
        return response
    except Exception as e:
        print(f"Error sending prescription SMS: {e}")
        return None
```

### Geolocation Utilities

```python
from geoalchemy2 import functions
from sqlalchemy import func

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using PostGIS"""
    return func.ST_Distance(
        func.ST_SetSRID(func.ST_MakePoint(lon1, lat1), 4326),
        func.ST_SetSRID(func.ST_MakePoint(lon2, lat2), 4326)
    )

def create_point(lat, lon):
    """Create PostGIS point from coordinates"""
    return func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)

def create_polygon(points):
    """Create PostGIS polygon from coordinates"""
    # points: list of (lat, lon) tuples
    # Must be closed polygon (first point = last point)
    coordinates = [(lon, lat) for lat, lon in points]
    return func.ST_SetSRID(func.ST_MakePolygon(coordinates), 4326)
```

### Environment Configuration

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "debug"

    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_SESSION_URL: str = "redis://localhost:6379/1"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    AFRICASTALKING_API_KEY: str
    AFRICASTALKING_USERNAME: str
    AFRICASTALKING_SERVICE_CODE: str

    SMS_LEOPARD_API_KEY: str
    SMS_LEOPARD_SENDER_ID: str = "RoD"

    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-flash"

    ENABLE_AI_DIAGNOSTICS: bool = True
    ENABLE_OFFLINE_SYNC: bool = True
    ENABLE_60_DAY_AUDIT: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## Error Handling

### Custom Exceptions

```python
from fastapi import HTTPException, status

class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class UnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Authentication required"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class ForbiddenException(HTTPException):
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class ConflictException(HTTPException):
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)

class ValidationException(HTTPException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)

class RateLimitException(HTTPException):
    def __init__(self, detail: str = "Rate limit exceeded"):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)
```

### Global Exception Handler

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    if settings.DEBUG:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": str(exc)}
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"}
    )
```

---

## Rate Limiting Implementation

```python
from fastapi import Request
from core.cache import increment_rate_limit, get_rate_limit_count
from core.config import settings

async def rate_limit_by_ip(request: Request, max_requests: int = None, window_seconds: int = 60):
    """Rate limit by client IP address."""
    client_ip = request.client.host if request.client else "unknown"
    max_req = max_requests or settings.rate_limit_rps

    count = await increment_rate_limit(f"rate_limit:ip:{client_ip}", window_seconds)
    if count > max_req:
        raise RateLimitException("Rate limit exceeded. Please slow down.")

async def rate_limit_by_user(user_id: str, max_requests: int = None, window_seconds: int = 60):
    """Rate limit by user ID."""
    max_req = max_requests or settings.rate_limit_rps
    count = await increment_rate_limit(f"rate_limit:user:{user_id}", window_seconds)
    if count > max_req:
        raise RateLimitException("User rate limit exceeded. Please slow down.")
```

---

## Logging Configuration

```python
import logging
import sys

def setup_logging():
    """Configure application logging"""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("auditerra.log")
        ]
    )

    # Set third-party log levels
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)
```

---

## Background Tasks

### Offline Sync Task

```python
from background_tasks import BackgroundTasks

async def process_offline_sync(db: Session, unsynced_items: list):
    """Process offline sync items in background"""
    for item in unsynced_items:
        try:
            # Process each item
            payload = {
                "ticket_id": item.ticketId,
                "staff_id": item.staffId,
                "soil_ph": item.soilPh,
                "nitrogen_ppm": item.nitrogenPpm,
                "phosphorous_ppm": item.phosphorusPpm,
                "potassium_ppm": item.potassiumPpm,
                "location_id": item.locationId,
                "soil_images": item.soilImages
            }

            # Create diagnostic log
            log = log_service.create_log(db, payload)

            # Generate recommendation
            recommendation = recommendation_service.generate_recommendation(
                db,
                {"log_id": log.log_id, "farmer_id": item.farmer_id, "staff_id": item.staff_id}
            )

            # Send SMS
            if recommendation.recommended_text:
                send_prescription_sms(
                    item.farmer_phone,
                    recommendation.recommended_text
                )

        except Exception as e:
            logger.error(f"Offline sync failed for item {item.id}: {e}")
            continue
```

### 60-Day Audit Reminder Task

```python
from datetime import datetime, timedelta

async def check_60_day_audits(db: Session):
    """Check for tickets due for 60-day audit"""
    sixty_days_ago = datetime.utcnow() - timedelta(days=60)

    # Find tickets resolved 60 days ago
    tickets_due = db.query(ServiceTicket).filter(
        ServiceTicket.status == "resolved",
        ServiceTicket.resolved_at <= sixty_days_ago,
        ServiceTicket.audit_completed == False
    ).all()

    for ticket in tickets_due:
        # Notify expert
        send_audit_reminder(ticket.staff_id, ticket.ticket_id)
        # Update ticket status
        ticket.status = "audit_due"
        db.commit()
```

---

## Performance Optimization

### Database Indexing

```sql
-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Farmers table
CREATE INDEX idx_farmers_phone ON farmers(phone);
CREATE INDEX idx_farmers_county ON farmers(county_location);
CREATE INDEX idx_farmers_handshake ON farmers(unique_handshake_code);

-- Tickets table
CREATE INDEX idx_tickets_farmer ON tickets(farmer_id);
CREATE INDEX idx_tickets_staff ON tickets(staff_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created ON tickets(created_at);

-- Locations table (PostGIS)
CREATE INDEX idx_locations_coordinates ON locations USING GIST (coordinates);
CREATE INDEX idx_locations_county ON locations(county);

-- Diagnostic logs table
CREATE INDEX idx_logs_ticket ON diagnostic_logs(ticket_id);
CREATE INDEX idx_logs_staff ON diagnostic_logs(staff_id);

-- Audit logs table
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
```

### Query Optimization Tips

1. **Use specific field selection** instead of `SELECT *`
2. **Apply pagination** for large result sets
3. **Use eager loading** for relationships to avoid N+1 queries
4. **Implement caching** for frequently accessed data
5. **Use connection pooling** to reduce connection overhead
6. **Batch operations** where possible

### Caching Strategy

```python
from functools import lru_cache
from typing import Optional

class CacheService:
    def __init__(self):
        self.cache = {}

    def get(self, key: str, ttl: int = 300):
        """Get cached value with TTL"""
        if key in self.cache:
            value, timestamp = self.cache[key]
            if datetime.utcnow() - timestamp < timedelta(seconds=ttl):
                return value
            del self.cache[key]
        return None

    def set(self, key: str, value: Any, ttl: int = 300):
        """Set cached value with TTL"""
        self.cache[key] = (value, datetime.utcnow())

    def invalidate(self, key: str):
        """Invalidate cache key"""
        if key in self.cache:
            del self.cache[key]

    def invalidate_pattern(self, pattern: str):
        """Invalidate all cache keys matching pattern"""
        keys_to_remove = [k for k in self.cache.keys() if pattern in k]
        for key in keys_to_remove:
            del self.cache[key]

cache_service = CacheService()
```

---

## API Documentation Maintenance

This document provides a structured overview of the Auditerra API.

For implementation-level details, the deployed OpenAPI documentation should be used alongside this reference:

```
Hosted API:
https://auditerra-6a019ce5a862.herokuapp.com

Swagger:
https://auditerra-6a019ce5a862.herokuapp.com/docs

OpenAPI:
https://auditerra-6a019ce5a862.herokuapp.com/openapi.json
```

When new endpoints are added or existing endpoints change, both the API implementation and this documentation should be updated to maintain consistency.

---

## Deployment Checklist

### Pre-Deployment Verification

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Seed data loaded
- [ ] Health endpoint returns OK
- [ ] API tests pass
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] CORS origins configured
- [ ] SSL/TLS enabled
- [ ] Redis connection verified
- [ ] External API keys verified

### Production Deployment

```bash
# 1. Deploy code
git push heroku main

# 2. Run migrations
heroku run alembic upgrade head

# 3. Seed database (if needed)
heroku run python scripts/seed.py

# 4. Verify health
curl https://auditerra-6a019ce5a862.herokuapp.com/health

# 5. Monitor logs
heroku logs --tail
```

### Rollback Procedure

```bash
# 1. Rollback to previous version
heroku rollback

# 2. Verify rollback
heroku ps:restart

# 3. Monitor logs
heroku logs --tail
```

---

## API Versioning Strategy

| Version | Status | Support Until |
| ------- | ------ | ------------- |
| v1      | Active | TBD           |

**Versioning Rules:**

- Breaking changes require a new API version
- Backwards-compatible changes can be made within the same version
- Deprecated endpoints are supported for at least 3 months
- Clients should use the latest stable version

---

## Testing and QA

The Auditerra backend API is rigorously tested to ensure data integrity, security, and performance. Testing uses **Postman** for manual and automated API regression testing, and **FastAPI's native Swagger UI** for live endpoint interaction and verification.

---

### API Testing Tool

| Tool / Framework | Purpose                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| **Postman**      | Automated API collection, environment variables, and integration tests |
| **Swagger UI**   | Interactive API documentation and manual testing                       |
| **Pytest**       | Unit and integration testing for Python code                           |

---

### API Test Coverage Matrix

The Postman collection covers comprehensive testing for every backend resource, including success, validation, and error handling scenarios.

| API Resource        | Endpoint Group     | Key Test Scenarios                                                                                                |
| ------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Users**           | `/users/`          | JWT authentication, password hashing security checks, role-based access, profile updates, and session expiration  |
| **Farmers**         | `/farmers/`        | USSD registration data mapping, handshake code generation/rotation, data isolation (IDOR prevention), and CRUD    |
| **Tickets**         | `/ticket/`         | Full lifecycle (Pending, Matched, Dispatched, Resolved), cancellation logic, and expert dispatch workflows        |
| **Locations**       | `/locations/`      | GPS coordinate validation, spatial boundary capture, county filtering, and geospatial query integrity             |
| **Diagnostic Logs** | `/logs/`           | Soil parameter input validation, offline sync payloads, batch processing, and foreign key validation              |
| **Recommendations** | `/recommendation/` | AI Output schema validation, SMS/webhook delivery statuses, audit trail hashing, and AI prompt injection defenses |

---

### Postman Collection Details

The repository contains automated test scripts executed on every API call, ensuring the following:

1. **Status Code Validation:** Verifies correct HTTP status codes (200, 201, 204, 400, 401, 403, 404, 422).

2. **Payload Schema Checks:** Validates JSON structure, data types, and required fields using dynamic assertions.

3. **Security Filters:** Automatically blocks and verifies responses do not leak sensitive data (e.g., password hashes, SQL queries, or stack traces).

4. **Performance Benchmarks:** Enforces SLA thresholds on response times for production readiness.

5. **Environment Variables:** Dynamically captures IDs (e.g., `user_id`, `ticket_id`) to maintain stateful testing across the collection.

---

### Test Scenarios by Endpoint

#### Authentication Tests

| Test Case        | Description                      | Expected Result             |
| ---------------- | -------------------------------- | --------------------------- |
| Valid Login      | Login with correct credentials   | 200 OK, returns tokens      |
| Invalid Login    | Login with incorrect password    | 401 Unauthorized            |
| MFA Verification | Verify valid MFA code            | 200 OK, completes login     |
| Invalid MFA      | Verify incorrect MFA code        | 401 Unauthorized            |
| Token Refresh    | Refresh with valid refresh token | 200 OK, new access token    |
| Invalid Refresh  | Refresh with expired token       | 401 Unauthorized            |
| Logout           | Logout with valid token          | 200 OK, session invalidated |
| Forgot Password  | Request password reset           | 200 OK, reset email sent    |

#### Users Tests

| Test Case                  | Description                         | Expected Result              |
| -------------------------- | ----------------------------------- | ---------------------------- |
| List Users                 | GET `/users` with valid token       | 200 OK, returns users list   |
| List Users (Unauthorized)  | GET `/users` without token          | 401 Unauthorized             |
| Get Current User           | GET `/users/me` with valid token    | 200 OK, returns user profile |
| Create User                | POST `/users` with valid data       | 201 Created, returns user    |
| Create User (Duplicate)    | POST `/users` with existing email   | 409 Conflict                 |
| Update User                | PATCH `/users/{id}` with valid data | 200 OK, returns updated user |
| Update User (Unauthorized) | PATCH another user's profile        | 403 Forbidden                |
| Deactivate User            | PATCH `/users/{id}/deactivate`      | 200 OK, user deactivated     |
| Delete User                | DELETE `/users/{id}`                | 204 No Content               |

#### Farmers Tests

| Test Case                 | Description                           | Expected Result                |
| ------------------------- | ------------------------------------- | ------------------------------ |
| List Farmers              | GET `/farmers` with valid token       | 200 OK, returns farmers list   |
| Get Farmer                | GET `/farmers/{id}` with valid token  | 200 OK, returns farmer         |
| Create Farmer             | POST `/farmers` with valid data       | 201 Created, returns farmer    |
| Create Farmer (Duplicate) | POST `/farmers` with existing phone   | 409 Conflict                   |
| Update Farmer             | PATCH `/farmers/{id}` with valid data | 200 OK, returns updated farmer |
| Delete Farmer             | DELETE `/farmers/{id}`                | 204 No Content                 |
| Report Issue              | POST `/farmers/{id}/report-issue`     | 201 Created, returns ticket    |
| Get Farmer Tickets        | GET `/farmers/{id}/tickets`           | 200 OK, returns tickets list   |
| Verify Handshake          | POST `/farmers/{id}/verify-handshake` | 200 OK, verified true          |
| Invalid Handshake         | POST with incorrect code              | 200 OK, verified false         |
| Rotate Handshake          | POST `/farmers/{id}/rotate-handshake` | 200 OK, new code generated     |

#### Tickets Tests

| Test Case             | Description                            | Expected Result                |
| --------------------- | -------------------------------------- | ------------------------------ |
| List Tickets          | GET `/ticket` with valid token         | 200 OK, returns tickets list   |
| Filter by Status      | GET `/ticket/status/pending`           | 200 OK, filtered tickets       |
| Get Ticket            | GET `/ticket/{id}` with valid token    | 200 OK, returns ticket         |
| Create Ticket         | POST `/ticket` with valid data         | 201 Created, returns ticket    |
| Update Ticket         | PATCH `/ticket/{id}` with valid data   | 200 OK, returns updated ticket |
| Dispatch Expert       | POST `/ticket/{id}/dispatch`           | 200 OK, expert assigned        |
| Auto Dispatch         | POST `/ticket/auto-dispatch`           | 200 OK, tickets dispatched     |
| Cancel Ticket         | POST `/ticket/{id}/cancel/{farmer_id}` | 200 OK, ticket cancelled       |
| Cancel Invalid Ticket | Cancel ticket not belonging to farmer  | 403 Forbidden                  |
| Resolve Ticket        | POST `/ticket/{id}/resolve/{staff_id}` | 200 OK, ticket resolved        |
| Delete Ticket         | DELETE `/ticket/{id}`                  | 204 No Content                 |

#### Diagnostic Logs Tests

| Test Case            | Description                        | Expected Result             |
| -------------------- | ---------------------------------- | --------------------------- |
| List Logs            | GET `/logs` with valid token       | 200 OK, returns logs list   |
| Get Log              | GET `/logs/{id}` with valid token  | 200 OK, returns log         |
| Get Log by Ticket    | GET `/logs/ticket/{ticket_id}`     | 200 OK, returns log         |
| Get Logs by Expert   | GET `/logs/expert/{staff_id}`      | 200 OK, returns logs        |
| Create Log           | POST `/logs` with valid data       | 201 Created, returns log    |
| Create Log (Invalid) | POST with invalid soil_ph > 14     | 422 Validation Error        |
| Sync Offline Logs    | POST `/logs/sync-offline`          | 201 Created, returns logs   |
| Update Log           | PATCH `/logs/{id}` with valid data | 200 OK, returns updated log |
| Delete Log           | DELETE `/logs/{id}`                | 204 No Content              |

#### Recommendations Tests

| Test Case               | Description                              | Expected Result                     |
| ----------------------- | ---------------------------------------- | ----------------------------------- |
| Generate Recommendation | POST `/recommendation` with valid log_id | 201 Created, returns recommendation |
| List Recommendations    | GET `/recommendation` with valid token   | 200 OK, returns recommendations     |
| Get Recommendation      | GET `/recommendation/{id}`               | 200 OK, returns recommendation      |
| Get by Farmer           | GET `/recommendation/farmer/{farmer_id}` | 200 OK, filtered list               |
| Get by Log              | GET `/recommendation/log/{log_id}`       | 200 OK, returns recommendation      |
| Update Recommendation   | PATCH `/recommendation/{id}`             | 200 OK, returns updated             |
| Delete Recommendation   | DELETE `/recommendation/{id}`            | 204 No Content                      |

#### Staff Tests

| Test Case                | Description                         | Expected Result               |
| ------------------------ | ----------------------------------- | ----------------------------- |
| List Staff               | GET `/staff` with valid token       | 200 OK, returns staff list    |
| Get Staff                | GET `/staff/{id}` with valid token  | 200 OK, returns staff member  |
| Create Staff             | POST `/staff` with valid data       | 201 Created, returns staff    |
| Create Staff (Duplicate) | POST with existing email            | 409 Conflict                  |
| Update Staff             | PATCH `/staff/{id}` with valid data | 200 OK, returns updated staff |
| Delete Staff             | DELETE `/staff/{id}`                | 204 No Content                |

#### Locations Tests

| Test Case                 | Description                       | Expected Result                  |
| ------------------------- | --------------------------------- | -------------------------------- |
| List Locations            | GET `/locations` with valid token | 200 OK, returns locations list   |
| Get Location              | GET `/locations/{id}`             | 200 OK, returns location         |
| Get by County             | GET `/locations/county/{county}`  | 200 OK, filtered list            |
| Get by Staff              | GET `/locations/staff/{staff_id}` | 200 OK, filtered list            |
| Create Location           | POST `/locations` with valid data | 201 Created, returns location    |
| Create Location (Invalid) | POST with invalid latitude > 90   | 422 Validation Error             |
| Sync Offline Locations    | POST `/locations/sync-offline`    | 201 Created, returns locations   |
| Update Location           | PATCH `/locations/{id}`           | 200 OK, returns updated location |
| Delete Location           | DELETE `/locations/{id}`          | 204 No Content                   |

---

### Running the API Tests

1. **Import the Collection:** Open Postman and import the `Auditerra Postman API Collection` JSON file.

2. **Configure Environment:** Set the `baseUrl` variable to your local instance (`http://localhost:8000`) or production URL.

3. **Execute the Collection:** Run the collection runner to execute all automated requests and view the assertion results in the Postman console.

```bash
# Import collection from CLI (optional)
newman run Auditerra-API-Collection.json \
  --environment Auditerra-Environment.json \
  --reporters cli,json
```

---

### Test Automation Scripts

#### Example Postman Test Script

```javascript
// Pre-request script - Authentication
pm.environment.set("timestamp", new Date().toISOString());

// Test script - Validate response
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has valid structure", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("user_id");
  pm.expect(jsonData).to.have.property("name");
  pm.expect(jsonData).to.have.property("email");
});

pm.test("User ID is a valid UUID", function () {
  var jsonData = pm.response.json();
  var uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  pm.expect(jsonData.user_id).to.match(uuidRegex);
});

// Store dynamic variables
var jsonData = pm.response.json();
pm.environment.set("user_id", jsonData.user_id);
```

---

### Performance Testing

| Test Type         | Tool        | Metrics Tracked                       | Threshold                 |
| ----------------- | ----------- | ------------------------------------- | ------------------------- |
| Load Testing      | k6 / Locust | Response time, throughput, error rate | < 500ms p95               |
| Stress Testing    | k6 / Locust | Breaking point, recovery time         | Handles 2x peak load      |
| Endurance Testing | k6 / Locust | Memory leaks, degradation over time   | Stable over 8 hours       |
| Spike Testing     | k6 / Locust | Response under sudden load spikes     | Recovers within 2 minutes |

---

### Security Testing

| Test Type             | Tool          | Description                         |
| --------------------- | ------------- | ----------------------------------- |
| Authentication Bypass | OWASP ZAP     | Verify JWT cannot be forged         |
| SQL Injection         | OWASP ZAP     | Verify ORM prevents injection       |
| XSS Prevention        | OWASP ZAP     | Verify input sanitization           |
| Rate Limiting         | Custom Script | Verify limits are enforced          |
| IDOR Prevention       | Custom Script | Verify data isolation between users |
| Session Security      | Custom Script | Verify token expiry and revocation  |

---

### Continuous Integration Testing

The API tests are integrated into the CI/CD pipeline via GitHub Actions:

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install Newman
        run: npm install -g newman
      - name: Run API Tests
        run: |
          newman run tests/postman/Auditerra-API-Collection.json \
            --environment tests/postman/Auditerra-Environment.json \
            --reporters cli,json \
            --reporter-json-export test-results.json
      - name: Upload Test Results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results.json
```

---

### Related QA Documents

- [API Testing Repository](https://github.com/akirachix/Scisync_Backend/tree/Scisync_Qa_Postman_Testing)
- [API Testing Workbook](https://docs.google.com/spreadsheets/d/1Ag7YrY-18PpcufDGv0lBdb5dh3bCf5EIaaojNtgb4vs/edit?gid=772674532#gid=772674532)
- [API Test Coverage Report](https://docs.google.com/spreadsheets/d/1Ag7YrY-18PpcufDGv0lBdb5dh3bCf5EIaaojNtgb4vs/edit?gid=772674532#gid=772674532)
