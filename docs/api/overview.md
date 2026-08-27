# Auditerra API Documentation

> REST API reference for the Auditerra backend.

## 1. Overview

The Auditerra backend provides a RESTful API for authentication, farmer management, service tickets, field diagnostics, AI recommendations, staff management, location tracking, and audit logging.

The backend is built with **FastAPI** and uses a layered architecture consisting of routers, services, repositories, and a PostgreSQL database.

### API Information

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

### Hosted API

**Production API:**
`[https://auditerra-6a019ce5a862.herokuapp.com]`

**Swagger UI:**
`[https://auditerra-6a019ce5a862.herokuapp.com/docs]`

Example:

```text
Production API:
https://your-api-host.com

Swagger:
https://your-api-host.com/docs


```

---

# 2. API Conventions

## Base URL

All versioned endpoints are exposed under:

```text
/api/v1
```

For example:

```http
GET /api/v1/users
GET /api/v1/farmers
GET /api/v1/ticket
```

---

## Authentication

Protected endpoints use a Bearer JWT access token.

```http
Authorization: Bearer <access_token>
```

Example:

```bash
curl -X GET "https://your-api-host.com/api/v1/users/me" \
  -H "Authorization: Bearer <access_token>"
```

---

## Common HTTP Status Codes

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

---

## Validation Error

FastAPI returns structured validation errors.

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

---

# 3. Authentication API

Authentication handles login, MFA verification, token refresh, logout, and password recovery.

## Endpoint Summary

| Method | Endpoint                | Purpose                | Access        |
| ------ | ----------------------- | ---------------------- | ------------- |
| `POST` | `/auth/login`           | Authenticate user      | Authenticated |
| `POST` | `/auth/verify-otp`      | Verify MFA code        | Authenticated |
| `POST` | `/auth/logout`          | Logout current session | Authenticated |
| `POST` | `/auth/refresh`         | Refresh access token   | Authenticated |
| `POST` | `/auth/forgot-password` | Request password reset | Authenticated |
| `POST` | `/auth/reset-password`  | Reset password         | Authenticated |

---

## `POST /auth/login`

Authenticates a user using their credentials.

### Request

```json
{
  "email": "example@gmail.com",
  "password": "your_password"
}
```

### Successful Response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": time,
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "your_name",
    "email": "example@gmail.com",
    "role": "expert/supervisor"
  }
}
```

### MFA Response

For accounts requiring MFA:

```json
{
  "requires_mfa": true,
  "mfa_temp_token": "eyJhbGciOiJSUzI1NiIs...",
  "message": "MFA verification required"
}
```

---

## `POST /auth/verify-otp`

Verifies the MFA code supplied after login.

```json
{
  "mfa_temp_token": "eyJhbGciOiJSUzI1NiIs...",
  "mfa_code": "123456",
  "method": "totp"
}
```

---

## `POST /auth/logout`

Invalidates the current authenticated session.

```http
Authorization: Bearer <access_token>
```

Response:

```json
{
  "message": "Logged out successfully"
}
```

---

## `POST /auth/refresh`

Generates a new access token using a valid refresh token.

```http
Authorization: Bearer <refresh_token>
```

---

## `POST /auth/forgot-password`

Requests a password reset.

```json
{
  "email": "example@gmail.com"
}
```

---

## `POST /auth/reset-password`

Resets the password using a valid reset token.

```json
{
  "token": "reset_token",
  "new_password": "NewSecurePassword123!"
}
```

---

# 4. Users API

The Users API manages system accounts and user profiles.

## Endpoint Summary

| Method   | Endpoint                      | Purpose          |
| :------- | :---------------------------- | :--------------- |
| `GET`    | `/users`                      | List users       |
| `GET`    | `/users/me`                   | Get current user |
| `GET`    | `/users/{user_id}`            | Get user         |
| `POST`   | `/users`                      | Create user      |
| `PATCH`  | `/users/{user_id}`            | Update user      |
| `PATCH`  | `/users/{user_id}/deactivate` | Deactivate user  |
| `DELETE` | `/users/{user_id}`            | Delete user      |

## `GET /users`

Returns a list of users.

### Filters

| Parameter | Type    | Description       |
| --------- | ------- | ----------------- |
| `role`    | string  | Filter by role    |
| `county`  | string  | Filter by county  |
| `page`    | integer | Page number       |
| `limit`   | integer | Number of records |

### Example Response

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

## `GET /users/me`

Returns the currently authenticated user's profile.

```http
GET /api/v1/users/me
Authorization: Bearer <access_token>
```

---

## `GET /users/{user_id}`

Returns a specific user.

---

## `POST /users`

Creates a new user.

```json
{
  "name": "Sarah Kimani",
  "phone": "+254722222222",
  "email": "sarah@example.com",
  "password": "SecurePassword123!",
  "county": "Baringo",
  "preferred_language": "swahili",
  "role": "field_expert"
}
```

---

## `PATCH /users/{user_id}`

Updates an existing user.

```json
{
  "name": "Amina Hassan Updated",
  "county": "Kiambu",
  "preferred_language": "swahili"
}
```

---

## `PATCH /users/{user_id}/deactivate`

Soft-deactivates an account.

```json
{
  "message": "User deactivated successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## `DELETE /users/{user_id}`

Permanently deletes a user.

```http
DELETE /api/v1/users/{user_id}
```

Response:

```text
204 No Content
```

---

# 5. Farmers API

The Farmers API manages farmer profiles, locations, handshake codes, issue reporting, and farmer ticket access.

## Endpoint Summary

| Method   | Endpoint                                          | Purpose            | Access     |
| -------- | ------------------------------------------------- | ------------------ | ---------- |
| `GET`    | `/farmers`                                        | List farmers       | Authorized |
| `GET`    | `/farmers/{farmer_id}`                            | Get farmer         | Authorized |
| `POST`   | `/farmers`                                        | Create farmer      | Authorized |
| `PATCH`  | `/farmers/{farmer_id}`                            | Update farmer      | Authorized |
| `DELETE` | `/farmers/{farmer_id}`                            | Delete farmer      | Authorized |
| `POST`   | `/farmers/{farmer_id}/report-issue`               | Report issue       | Authorized |
| `GET`    | `/farmers/{farmer_id}/tickets`                    | Get farmer tickets | Authorized |
| `POST`   | `/farmers/{farmer_id}/tickets/{ticket_id}/cancel` | Cancel ticket      | Authorized |
| `POST`   | `/farmers/{farmer_id}/verify-handshake`           | Verify handshake   | Authorized |
| `POST`   | `/farmers/{farmer_id}/rotate-handshake`           | Rotate handshake   | Authorized |

## `GET /farmers`

Returns registered farmers.

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

## `POST /farmers`

Creates a farmer profile.

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

---

## `POST /farmers/{farmer_id}/report-issue`

Allows a farmer to create a service ticket.

```json
{
  "issue_category": "soil",
  "description": "Soil is too acidic and crops are yellowing"
}
```

Response:

```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "pending",
  "handshake_code": "4728",
  "message": "Issue reported."
}
```

---

## `POST /farmers/{farmer_id}/verify-handshake`

Verifies the farmer/expert handshake code.

```json
{
  "code": "4728"
}
```

Response:

```json
{
  "verified": true,
  "message": "Handshake code verified"
}
```

---

# 6. Service Tickets API

The Ticket API manages the complete service-request lifecycle.

## Ticket Lifecycle

| Status       | Meaning                   |
| ------------ | ------------------------- |
| `pending`    | Ticket has been created   |
| `dispatched` | Expert has been notified  |
| `resolved`   | Issue has been resolved   |
| `cancelled`  | Ticket has been cancelled |

## Endpoint Summary

| Method   | Endpoint                                 | Purpose                | Access     |
| -------- | ---------------------------------------- | ---------------------- | ---------- |
| `GET`    | `/ticket`                                | List tickets           | Staff      |
| `GET`    | `/ticket/status/{status}`                | Filter by status       | Staff      |
| `GET`    | `/ticket/farmer/{farmer_id}`             | Farmer tickets         | Authorized |
| `GET`    | `/ticket/staff/{staff_id}`               | Expert tickets         | Authorized |
| `GET`    | `/ticket/{ticket_id}`                    | Get ticket             | Authorized |
| `POST`   | `/ticket`                                | Create ticket          | Farmer     |
| `PATCH`  | `/ticket/{ticket_id}`                    | Update ticket          | Staff      |
| `POST`   | `/ticket/{ticket_id}/dispatch`           | Dispatch expert        | Staff      |
| `POST`   | `/ticket/auto-dispatch`                  | Automatically dispatch | Supervisor |
| `POST`   | `/ticket/{ticket_id}/cancel/{farmer_id}` | Cancel ticket          | Farmer     |
| `POST`   | `/ticket/{ticket_id}/resolve/{staff_id}` | Resolve ticket         | Expert     |
| `DELETE` | `/ticket/{ticket_id}`                    | Delete ticket          | Supervisor |

---

## `POST /ticket`

Creates a new service ticket.

```json
{
  "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
  "issue_category": "soil",
  "description": "Soil is too acidic, pH reading 4.5"
}
```

---

## `POST /ticket/{ticket_id}/dispatch`

Dispatches an expert to a ticket.

```json
{
  "preferred_county": "Machakos"
}
```

Example response:

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
  "handshake_code": "4728"
}
```

---

## Expert Matching

Experts are matched using multiple factors.

| Factor                   | Weight | Purpose                            |
| ------------------------ | -----: | ---------------------------------- |
| Proximity                |    40% | Distance between farmer and expert |
| Technical specialization |    35% | Expertise match                    |
| Language compatibility   |    15% | Communication compatibility        |
| Availability             |    10% | Current workload                   |

### Search Radius

| Attempt | Radius |
| ------- | -----: |
| 1       |  15 km |
| 2       |  30 km |
| 3       |  45 km |

---

# 7. Diagnostic Logs API

Diagnostic logs store measurements collected by field experts during farm visits.

## Endpoint Summary

| Method   | Endpoint                   | Purpose               | Access                       |
| -------- | -------------------------- | --------------------- | ---------------------------- |
| `GET`    | `/logs`                    | List diagnostic logs  | Authorized Expert/Supervisor |
| `GET`    | `/logs/{log_id}`           | Get diagnostic log    | Authorized Expert/Supervisor |
| `GET`    | `/logs/ticket/{ticket_id}` | Get log by ticket     | Authorized Expert/Supervisor |
| `GET`    | `/logs/expert/{staff_id}`  | Get expert logs       | Expert/Supervisor            |
| `POST`   | `/logs`                    | Create diagnostic log | Authorised Expert            |
| `POST`   | `/logs/sync-offline`       | Sync offline logs     | Authorised Expert            |
| `PATCH`  | `/logs/{log_id}`           | Update log            | Authorised Expert/Supervisor |
| `DELETE` | `/logs/{log_id}`           | Delete log            | Supervisor                   |

---

## Diagnostic Measurements

| Parameter         | Range | Description               |
| ----------------- | ----: | ------------------------- |
| `soil_ph`         |  0–14 | Soil acidity/alkalinity   |
| `nitrogen_ppm`    | 0–200 | Nitrogen concentration    |
| `phosphorous_ppm` | 0–100 | Phosphorous concentration |
| `potassium_ppm`   | 0–500 | Potassium concentration   |

---

## `POST /logs`

Creates a diagnostic log.

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

---

## `POST /logs/sync-offline`

Allows field experts to synchronize diagnostic data collected while offline.

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

---

# 8. AI Recommendations API

The AI Recommendation API generates agronomic recommendations from diagnostic information.

## AI Processing Flow

| Stage | Operation                                              |
| ----- | ------------------------------------------------------ |
| 1     | Field expert creates diagnostic log                    |
| 2     | Diagnostic data is submitted to recommendation service |
| 3     | Relevant agricultural knowledge is retrieved           |
| 4     | AI generates a recommendation                          |
| 5     | Recommendation is stored                               |
| 6     | Recommendation can be delivered to the farmer          |

## Endpoint Summary

| Method   | Endpoint                              | Purpose                 | Access                       |
| -------- | ------------------------------------- | ----------------------- | ---------------------------- |
| `POST`   | `/recommendation`                     | Generate recommendation | Authorized Expert            |
| `GET`    | `/recommendation`                     | List recommendations    | Authorized Supervisor/Expert |
| `GET`    | `/recommendation/{recommendation_id}` | Get recommendation      | Authorized Supervisor/Expert |
| `GET`    | `/recommendation/farmer/{farmer_id}`  | Farmer recommendations  | Authorized Staff             |
| `GET`    | `/recommendation/log/{log_id}`        | Recommendation by log   | Authorized Supervisor/Expert |
| `PATCH`  | `/recommendation/{recommendation_id}` | Update recommendation   | Authorised Expert            |
| `DELETE` | `/recommendation/{recommendation_id}` | Delete recommendation   | Supervisor                   |

---

## `POST /recommendation`

Generates an AI recommendation from a diagnostic log.

```json
{
  "log_id": "550e8400-e29b-41d4-a716-446655440003",
  "farmer_id": "550e8400-e29b-41d4-a716-446655440000",
  "staff_id": "550e8400-e29b-41d4-a716-446655440002"
}
```

Example response:

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

## Recommendation Delivery Status

### Expert Recommendation

```text
pending → sent → delivered
```

### SMS

```text
pending → sent → delivered
              ↓
            failed
```

---

# 9. Staff API

The Staff API manages field experts and institutional supervisors.

## Endpoint Summary

| Method   | Endpoint            | Purpose             | Access           |
| -------- | ------------------- | ------------------- | ---------------- |
| `GET`    | `/staff`            | List staff          | Supervisor       |
| `GET`    | `/staff/{staff_id}` | Get staff member    | Authorized       |
| `POST`   | `/staff`            | Create staff member | Supervisor       |
| `PATCH`  | `/staff/{staff_id}` | Update staff member | Staff/Supervisor |
| `DELETE` | `/staff/{staff_id}` | Delete staff member | Supervisor       |

---

## `GET /staff`

Returns staff profiles including expertise and assigned areas.

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
    "preferred_language": ["english", "swahili"]
  }
]
```

---

## `POST /staff`

Creates a staff member.

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

---

# 10. Locations API

The Locations API stores GPS and geographic information captured by field experts.

## Endpoint Summary

| Method   | Endpoint                      | Purpose                | Access     |
| -------- | ----------------------------- | ---------------------- | ---------- |
| `GET`    | `/locations`                  | List locations         | Staff      |
| `GET`    | `/locations/{location_id}`    | Get location           | Authorized |
| `GET`    | `/locations/county/{county}`  | Locations by county    | Authorized |
| `GET`    | `/locations/staff/{staff_id}` | Locations by expert    | Authorized |
| `POST`   | `/locations`                  | Create location        | Expert     |
| `POST`   | `/locations/sync-offline`     | Sync offline locations | Expert     |
| `PATCH`  | `/locations/{location_id}`    | Update location        | Staff      |
| `DELETE` | `/locations/{location_id}`    | Delete location        | Supervisor |

---

## `POST /locations`

Creates a GPS location record.

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

---

## `POST /locations/sync-offline`

Synchronizes multiple locations captured while offline.

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

---

# 11. SMS Integration

Auditerra integrates with **Africa's Talking** for dispatch and recommendation notifications.

## Integration

```text
Ticket
   ↓
Expert Matching
   ↓
Expert Dispatched
   ↓
SMS Notification
   ↓
Farmer / Expert
```

## Environment Variables

```env
AFRICASTALKING_USERNAME=your_username
AFRICASTALKING_API_KEY=your_api_key
```

## Dispatch SMS

The backend provides dispatch notification functionality using:

```python
send_dispatch_sms(
    farmer_phone,
    ticket_category,
    custom_message=None
)
```

Example message:

```text
Hello! Your Auditerra ticket for 'soil' has been dispatched.
An expert is on their way.
```

SMS failures are logged and do not block the primary ticket workflow.

---

# 12. Audit Logs API

Audit logging records important system actions for traceability and accountability.

## Repository Operations

| Operation             | Description                            |
| --------------------- | -------------------------------------- |
| `get()`               | Retrieve an audit log                  |
| `get_by_actor()`      | Retrieve actions performed by an actor |
| `get_by_event_type()` | Filter by event type                   |
| `get_by_resource()`   | Filter by affected resource            |
| `get_all()`           | Retrieve audit logs                    |
| `create()`            | Create an audit entry                  |

---

# 13. Repository Layer

The backend uses repositories to isolate database access from business logic.

## Repository Summary

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

---

## UserRepository

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

---

## FarmerRepository

| Method               | Purpose                  |
| -------------------- | ------------------------ |
| `get()`              | Get farmer               |
| `get_by_phone()`     | Find farmer by phone     |
| `get_by_handshake()` | Find farmer by handshake |
| `get_all()`          | List farmers             |
| `create()`           | Create farmer            |
| `update()`           | Update farmer            |
| `delete()`           | Delete farmer            |

---

## TicketRepository

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

---

## StaffRepository

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

---

## LocationRepository

| Method            | Purpose               |
| ----------------- | --------------------- |
| `get()`           | Get location          |
| `get_by_county()` | Find county locations |
| `get_by_staff()`  | Find staff locations  |
| `get_all()`       | List locations        |
| `create()`        | Create location       |
| `update()`        | Update location       |
| `delete()`        | Delete location       |

---

## DiagnosticLogRepository

| Method            | Purpose             |
| ----------------- | ------------------- |
| `get()`           | Get diagnostic log  |
| `get_by_ticket()` | Find log by ticket  |
| `get_by_staff()`  | Find logs by expert |
| `get_all()`       | List logs           |
| `create()`        | Create log          |
| `update()`        | Update log          |
| `delete()`        | Delete log          |

---

## RecommendationRepository

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

---

## AuditLogRepository

| Method                | Purpose                 |
| --------------------- | ----------------------- |
| `get()`               | Get audit log           |
| `get_by_actor()`      | Find actions by actor   |
| `get_by_event_type()` | Filter events           |
| `get_by_resource()`   | Filter resource history |
| `get_all()`           | List audit logs         |
| `create()`            | Create audit record     |

---

# 14. API Architecture

The backend follows a layered architecture.

| Layer             | Responsibility                               |
| ----------------- | -------------------------------------------- |
| Router            | Receives HTTP requests and returns responses |
| Schema            | Validates request and response data          |
| Service           | Contains business logic                      |
| Repository        | Performs database operations                 |
| Database          | Persists application data                    |
| External Services | AI, SMS, and other integrations              |

## Request Flow

```text
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

```text
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

# 15. Role-Based Access Control

Auditerra uses role-based permissions.

| Role                     | Main Responsibilities                                                  |
| ------------------------ | ---------------------------------------------------------------------- |
| Farmer                   | Report issues, view own tickets, cancel tickets                        |
| Field Expert             | Manage assigned tickets, collect diagnostics, generate recommendations |
| Institutional Supervisor | Manage staff, oversee tickets, access system-wide resources            |

### Access Model

```text
Farmer
 ├── Own profile
 ├── Own tickets
 └── Issue reporting

Field Expert
 ├── Assigned tickets
 ├── Diagnostic logs
 ├── Locations
 └── AI recommendations

Institutional Supervisor
 ├── All tickets
 ├── Staff management
 ├── System oversight
 └── Administrative operations
```

---

# 16. Data Models

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

## Database Model Document

> _Click below to view the detailed documentation of the Auditerra datamodel._

[**View the Database Model Document**](https://docs.google.com/document/d/16uvKdsZ77rL0jgfASHSE05mavL6Ekg34Pz_7ZQo-TCQ/edit?tab=t.0#heading=h.u5sb3jt0jj1a)

---

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

## Visual Diagram

### Entity Relationship Diagram

> _Click below to view the detailed visual representation of the entities, their attributes, and foreign key relationships._

[**View the Lucidchart Entity Relationship Diagram**](https://lucid.app/lucidchart/934030c2-6b6e-49ed-9f23-e8d0e3845bf1/edit?invitationId=inv_68ff5f84-71fe-47b3-a8e6-e9b1750d2e41&page=0_0#)

---

# 18. Endpoint Overview

| Category           | Endpoints |
| ------------------ | --------: |
| Authentication     |         6 |
| Users              |         7 |
| Farmers            |        10 |
| Service Tickets    |        11 |
| Diagnostic Logs    |         8 |
| AI Recommendations |         7 |
| Staff              |         5 |
| Locations          |         8 |
| **Total**          |    **62** |

> The interactive Swagger/OpenAPI documentation should be treated as the authoritative source for the exact deployed endpoint set, request schemas, response schemas, and validation rules.

---

# 19. Quick Start

### 1. Obtain an access token

```http
POST /api/v1/auth/login
```

### 2. Include the token in requests

```http
Authorization: Bearer <access_token>
```

### 3. Access a protected endpoint

```http
GET /api/v1/users/me
```

### 4. Create a farmer issue

```http
POST /api/v1/farmers/{farmer_id}/report-issue
```

### 5. Create diagnostic data

```http
POST /api/v1/logs
```

### 6. Generate a recommendation

```http
POST /api/v1/recommendation
```

---

# 21. API Documentation Maintenance

This document provides a structured overview of the Auditerra API.

For implementation-level details, the deployed OpenAPI documentation should be used alongside this reference:

```text
Hosted API:
[INSERT URL]

Swagger:
[INSERT URL]/docs

OpenAPI:
[INSERT URL]/openapi.json
```

When new endpoints are added or existing endpoints change, both the API implementation and this documentation should be updated to maintain consistency.
Here is the comprehensive **API QA and Documentation** section. I have integrated the Postman collection, Swagger/OpenAPI references, and specific API test coverage matrices for your backend.

---

## API QA & Documentation

The Auditerra backend API is rigorously tested to ensure data integrity, security, and performance. We utilize **Postman** for manual and automated API regression testing, and **FastAPI's native Swagger UI** for live endpoint interaction and verification.

### API Testing Tool

| Tool / Framework | Purpose                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| **Postman**      | Automated API collection, environment variables, and integration tests |

---

### API Test Coverage Matrix

The Postman collection covers comprehensive testing for every backend resource, including success, validation, and error handling scenarios.

| API Resource        | Endpoint Group     | Key Test Scenarios                                                                                                 |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Users**           | `/users/`          | JWT authentication, password hashing security checks, role-based access, profile updates, and session expiration.  |
| **Farmers**         | `/farmers/`        | USSD registration data mapping, handshake code generation/rotation, data isolation (IDOR prevention), and CRUD.    |
| **Tickets**         | `/ticket/`         | Full lifecycle (Pending, Matched, Dispatched, Resolved), cancellation logic, and expert dispatch workflows.        |
| **Locations**       | `/locations/`      | GPS coordinate validation, spatial boundary capture, county filtering, and geospatial query integrity.             |
| **Diagnostic Logs** | `/logs/`           | Soil parameter input validation, offline sync payloads, batch processing, and foreign key validation.              |
| **Recommendations** | `/recommendation/` | AI Output schema validation, SMS/webhook delivery statuses, audit trail hashing, and AI prompt injection defenses. |

---

### Postman Collection Highlights

The repository contains automated test scripts executed on every API call, ensuring the following:

1. **Status Code Validation:** Verifies correct HTTP status codes (200, 201, 204, 400, 401, 403, 404, 422).
2. **Payload Schema Checks:** Validates JSON structure, data types, and required fields using dynamic assertions.
3. **Security Filters:** Automatically blocks and verifies responses do not leak sensitive data (e.g., password hashes, SQL queries, or stack traces).
4. **Performance Benchmarks:** Enforces SLA thresholds on response times for production readiness.
5. **Environment Variables:** Dynamically captures IDs (e.g., `user_id`, `ticket_id`) to maintain stateful testing across the collection.

---

### How to Run the API Tests

1. **Import the Collection:** Open Postman and import the `Auditerra Postman API Collection` JSON file.
2. **Configure Environment:** Set the `baseUrl` variable to your local instance (`http://localhost:8000`) or production URL.
3. **Execute the Collection:** Run the collection runner to execute all automated requests and view the assertion results in the Postman console.

---

### Related QA Document

- [API Testing](https://github.com/akirachix/Scisync_Backend/tree/Scisync_Qa_Postman_Testing)
