# Developer Guide & Technical Reference

## 1. Integrations

The platform relies on several external third-party services for its core functionality. All configuration must be handled through environment variables or secure secret managers, and no credentials are ever committed to the repository.

| Service                      | Purpose                                                                             | Configuration Method                                                                                                               |
| :--------------------------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| **Google Gemini API**        | Generative AI (RAG) for generating expert reports and farmer SMS prescriptions.     | Requires `GOOGLE_API_KEY` and `GEMINI_MODEL` environment variables. API keys are stored in Secret Manager (prod) and `.env` (dev). |
| **Gemini File Search Store** | Hosts the agricultural knowledge base for semantic retrieval.                       | Created via REST API using `gemini-embedding-2`. Configured in the Jupyter setup script.                                           |
| **Heroku PostgreSQL**        | Primary production database storing users, tickets, diagnostics, and AI audit logs. | `DATABASE_URL` provided by Heroku add-on. Used by backend migrations and ORM.                                                      |
| **SMS Leopard**              | SMS gateway for delivering fertilizer recommendations and alerts to farmers.        | Requires `SMS_LEOPARD_API_KEY`, `SMS_LEOPARD_API_SECRET`, and `SMS_LEOPARD_SENDER_ID`. Uses Basic Auth.                            |
| **Cloudflare**               | Edge security (WAF, DDoS protection, TLS termination).                              | Configured via Cloudflare DNS. Points domain to Vercel and Heroku.                                                                 |
| **Vercel**                   | Hosting for the Supervisor PWA and the Field Expert Mobile Interface (PWA).         | Connected via Git integrations. Uses `vercel.json` for rewrites and build settings.                                                |

---

## 2. Code Standards

The team follows strict conventions to maintain code quality, security, and readability across the codebase.

### 2.1 Naming Conventions

- **Backend (Python):** `snake_case` for variables and functions, `PascalCase` for classes. Constants use `UPPER_CASE`.
- **Frontend (TypeScript/React):** `camelCase` for variables and functions, `PascalCase` for components and classes.
- **Files:** `snake_case.py` for backend modules; `PascalCase.tsx` for frontend components.
- **Branches:** Feature branches use `feature/[short-description]`, bug fixes use `fix/[short-description]`, and hotfixes use `hotfix/[short-description]` (e.g., `feature/soil-form-compression`).

### 2.2 Folder and File Structure

Adhere to the strict folder layout to ensure separation of concerns:

- **Backend:** `backend/app/routes/` contains API routers, `backend/app/models/` for database models, `backend/app/schemas/` for Pydantic schemas, and `backend/app/services/` for business logic.
- **Frontend:** `frontend/src/components/` for reusable UI components, `frontend/src/screens/` for page-level views, and `frontend/src/services/` for API integrations.
- **Rule for New Code:** All new feature code must reside in its corresponding layer folder. No business logic is permitted inside route or component files; it must be extracted into services.

### 2.3 Formatting and Linting

- **Backend:** `black` for auto-formatting and `ruff` for linting. The configuration is located in `pyproject.toml`.
- **Frontend:** `ESLint` and `Prettier`. The configuration is located in `.eslintrc.js` and `.prettierrc`.
- **Validation:** All code must pass `ruff check` and `eslint` without errors before merging.

### 2.4 Commit Messages and Pull Requests

- **Commit Format:** Follow the Conventional Commits standard: `type(scope): description` (e.g., `fix(auth): handle session token expiration`). Types include: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- **Pull Request Rules:**
  - Must target the `main` branch from a short-lived feature branch.
  - Requires at least one reviewer approval.
  - Must pass all CI/CD checks (linting, unit tests, build).
  - PR titles must mirror the merge commit message (e.g., `feat(tickets): add cancel flow`).

### 2.5 Error Handling and Logging

- **Backend:** All exceptions are handled in the service layer and returned as structured HTTP responses. Logging is performed using the `logging` module (standard Python) with specific file logs in the backend.
- **Frontend:** Unhandled exceptions are caught via Error Boundaries in React. Logging is performed via `console.error` during development and routed to the backend monitoring tools in production.
- **Convention:** Never log passwords, API keys, or full personal data. Use structured log messages with adequate context (e.g., `Logger.error("Failed to create ticket for user: {user_id}", extra={"user_id": user_id})`).

### 2.6 Comment and Docstring Style

- **Backend:** Use **Google-style docstrings** for all public modules, classes, and functions. Inline comments should be used to explain complex logic or business rules.
- **Frontend:** Use **JSDoc** comments for exported functions and complex components. Inline comments should explain any complex or non-obvious logic.
- **Convention:** Comments must explain "why" code exists, not "what" the code is doing. No commented-out code is allowed in the `main` branch.

---

## 3. Testing Conventions & Rules

This section outlines the strict rules and conventions for writing and maintaining test suites. It is not a "how to run tests" guide, but rather the architectural and naming standards the team must adhere to when contributing new tests.

### 3.1 Test Structure & Location

- **Backend (Pytest):**
  - All tests must be located in `backend/tests/`.
  - Unit tests go in `backend/tests/unit/` and integration tests go in `backend/tests/integration/`.
- **Frontend (Jest/Vitest):**
  - Test files must be colocated with the component or service they test (e.g., `Header.test.tsx` next to `Header.tsx`), or organized in a dedicated `__tests__` folder if the project grows larger.
- **Rule:** Test files must never be placed in the production source folder (`src/` or `app/`).

### 3.2 Naming Conventions

- **Backend (Pytest):** Test files are named `test_[module_name].py`. Test functions use `test_[behavior_description]_[expected_outcome]` (e.g., `test_create_farmer_returns_201`).
- **Frontend (Jest):** Test files are named `[component_name].test.tsx`.
- **Rule:** Test names must be descriptive and state exactly what is being tested and the expected outcome.

### 3.3 Data Isolation & Mocking

- **Rule:** All logic tests must use mocked external services (APIs, SMS gateways, AI models) and must not rely on live database connections.
- **Rule:** Unit tests must be deterministic and run without network access. Integration tests must explicitly state if they require a live local database.

### 3.4 Coverage Requirements

- **Backend:** The minimum required coverage is 80% for all new business logic.
- **Frontend:** All critical user flows (login, ticket resolution, offline sync) must be tested.
- **Rule:** Any new feature or bug fix must include corresponding test cases to maintain the coverage threshold.

### 3.5 Test Categories & Matrices

The comprehensive QA test suite covers extensive functional, boundary, negative, and end-to-end scenarios across the platform. These tests are documented in external spreadsheets and test suites (e.g., Postman, Cypress, Playwright, and manual QA sheets).

## 4.0 Glossary

### 4.1 Technical Acronyms

- **API:** A defined set of rules that allows different software applications to communicate with each other.
- **CI/CD:** A practice where code changes are automatically built, tested, and deployed to production.
- **DPA:** A legally binding contract between a data controller and processor outlining data handling responsibilities.
- **HMAC:** A cryptographic signature used to verify the authenticity and integrity of an incoming message.
- **HTTPS:** The secure version of HTTP that encrypts data transmitted between a user and a server.
- **JWT:** A compact, URL-safe token used for stateless authentication and role verification.
- **MFA:** A security mechanism requiring multiple verification factors to access a resource.
- **ODPC:** The Kenyan regulatory authority established to oversee data protection compliance.
- **PWA:** A web-based application that works offline and can be installed on a device like a native app.
- **RAG:** An AI architecture that retrieves external knowledge to ground responses and reduce hallucinations.
- **RBAC:** A security model where access permissions are granted based on the user's role within an organization.
- **SAST:** A white-box testing method that analyzes source code to find security vulnerabilities early.
- **SQL:** A domain-specific language used for managing and querying data in relational databases.
- **TLS:** A cryptographic protocol used to secure communications over a computer network.
- **UI/UX:** The visual design and overall user experience of an application.
- **WAF:** A firewall that filters and monitors HTTP traffic to protect against common web attacks.

### 4.2 Domain Definitions (Auditerra)

- **Agroecological Zone:** A region defined by specific climate, soil, and crop suitability characteristics.
- **Diagnostic Log:** A digital record containing soil measurements and observations captured during a field visit.
- **Field Expert:** A certified agricultural professional who visits farms and collects on-site soil data.
- **Institutional Supervisor:** A stakeholder who oversees program impact, expert deployment, and audit reporting.
- **Knowledge Base:** A curated collection of project-specific agricultural documents used to ground AI responses.
- **Security Handshake:** A one-time SMS code entered by the expert to verify their physical presence at the farm.
- **Ticket:** A central digital workflow object that tracks a farmer's issue from reporting to resolution.

# Developer Guide & Technical Reference

## 1. Integrations

The platform relies on several external third-party services for its core functionality. All configuration must be handled through environment variables or secure secret managers, and no credentials are ever committed to the repository.

| Service                      | Purpose                                                                             | Configuration Method                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Google Gemini API**        | Generative AI (RAG) for generating expert reports and farmer SMS prescriptions.     | Requires `GOOGLE_API_KEY` and `GEMINI_MODEL` environment variables. API keys are stored in Secret Manager (prod) and `.env` (dev). |
| **Gemini File Search Store** | Hosts the agricultural knowledge base for semantic retrieval.                       | Created via REST API using `gemini-embedding-2`. Configured in the Jupyter setup script.                                           |
| **Heroku PostgreSQL**        | Primary production database storing users, tickets, diagnostics, and AI audit logs. | `DATABASE_URL` provided by Heroku add-on. Used by backend migrations and ORM.                                                      |
| **SMS Leopard**              | SMS gateway for delivering fertilizer recommendations and alerts to farmers.        | Requires `SMS_LEOPARD_API_KEY`, `SMS_LEOPARD_API_SECRET`, and `SMS_LEOPARD_SENDER_ID`. Uses Basic Auth.                            |
| **Africa's Talking**         | USSD gateway for farmer registration and issue reporting.                           | Requires `AFRICASTALKING_API_KEY`, `AFRICASTALKING_USERNAME`, and `AFRICASTALKING_SERVICE_CODE`.                                   |
| **Cloudflare**               | Edge security (WAF, DDoS protection, TLS termination).                              | Configured via Cloudflare DNS. Points domain to Vercel and Heroku.                                                                 |
| **Vercel**                   | Hosting for the Supervisor PWA and the Field Expert Mobile Interface (PWA).         | Connected via Git integrations. Uses `vercel.json` for rewrites and build settings.                                                |

---

## 2. Code Standards

The team follows strict conventions to maintain code quality, security, and readability across the codebase.

### 2.1 Naming Conventions

| Language/Context                | Convention                               | Example                         |
| ------------------------------- | ---------------------------------------- | ------------------------------- |
| **Backend (Python)**            | `snake_case` for variables and functions | `get_user_by_id()`              |
| **Backend (Python)**            | `PascalCase` for classes                 | `UserRepository`                |
| **Backend (Python)**            | `UPPER_CASE` for constants               | `MAX_RETRY_ATTEMPTS`            |
| **Frontend (TypeScript/React)** | `camelCase` for variables and functions  | `getUserProfile()`              |
| **Frontend (TypeScript/React)** | `PascalCase` for components and classes  | `TicketCard`                    |
| **Files**                       | `snake_case.py` for backend modules      | `user_repository.py`            |
| **Files**                       | `PascalCase.tsx` for frontend components | `TicketCard.tsx`                |
| **Branches**                    | `feature/[short-description]`            | `feature/soil-form-compression` |
| **Branches**                    | `fix/[short-description]`                | `fix/ticket-dispatch`           |
| **Branches**                    | `hotfix/[short-description]`             | `hotfix/auth-timeout`           |

### 2.2 Folder and File Structure

Adhere to the strict folder layout to ensure separation of concerns:

**Backend:**

- `backend/app/routes/` — API routers
- `backend/app/models/` — Database models
- `backend/app/schemas/` — Pydantic schemas
- `backend/app/services/` — Business logic
- `backend/app/repositories/` — Data access layer
- `backend/app/core/` — Configuration and core utilities

**Frontend:**

- `frontend/src/components/` — Reusable UI components
- `frontend/src/screens/` — Page-level views
- `frontend/src/services/` — API integrations
- `frontend/src/hooks/` — Custom React hooks
- `frontend/src/utils/` — Utility functions
- `frontend/src/types/` — TypeScript type definitions

**Rule for New Code:** All new feature code must reside in its corresponding layer folder. No business logic is permitted inside route or component files; it must be extracted into services.

### 2.3 Formatting and Linting

| Language             | Tool       | Purpose         | Config File      |
| -------------------- | ---------- | --------------- | ---------------- |
| **Python**           | `black`    | Auto-formatting | `pyproject.toml` |
| **Python**           | `ruff`     | Linting         | `pyproject.toml` |
| **TypeScript/React** | `ESLint`   | Linting         | `.eslintrc.js`   |
| **TypeScript/React** | `Prettier` | Auto-formatting | `.prettierrc`    |

**Validation:** All code must pass `ruff check` and `eslint` without errors before merging.

### 2.4 Commit Messages and Pull Requests

**Commit Format:** Follow the Conventional Commits standard: `type(scope): description`

**Types:**

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style changes (formatting, etc.)
- `refactor` — Code refactoring
- `test` — Test additions or updates
- `chore` — Maintenance tasks

**Examples:**

```
feat(auth): add MFA verification to login flow
fix(ticket): resolve dispatch failure when expert unavailable
docs(api): update authentication schema documentation
```

**Pull Request Rules:**

- Must target the `main` branch from a short-lived feature branch
- Requires at least one reviewer approval
- Must pass all CI/CD checks (linting, unit tests, build)
- PR titles must mirror the merge commit message

### 2.5 Error Handling and Logging

**Backend:**

- All exceptions are handled in the service layer and returned as structured HTTP responses
- Logging is performed using the standard Python `logging` module
- Structured logs with context (e.g., `logger.error("Failed to create ticket", extra={"user_id": user_id})`)

**Frontend:**

- Unhandled exceptions are caught via Error Boundaries in React
- Logging via `console.error` during development
- Routed to backend monitoring tools in production

**Convention:** Never log passwords, API keys, or full personal data. Use structured log messages with adequate context.

### 2.6 Comment and Docstring Style

**Backend:** Use Google-style docstrings for all public modules, classes, and functions.

```python
def get_user_by_id(user_id: UUID) -> User:
    """
    Retrieve a user by their unique identifier.

    Args:
        user_id: The UUID of the user to retrieve.

    Returns:
        The User object if found.

    Raises:
        NotFoundException: If no user exists with the given ID.
    """
```

**Frontend:** Use JSDoc comments for exported functions and complex components.

```typescript
/**
 * Fetches tickets assigned to a specific expert.
 * @param staffId - The UUID of the expert.
 * @returns A promise that resolves to an array of tickets.
 */
export async function getMyTickets(staffId: string): Promise<Ticket[]> {
  // ...
}
```

**Convention:** Comments must explain "why" code exists, not "what" the code is doing. No commented-out code is allowed in the `main` branch.

---

## 3. Testing Conventions and Rules

This section outlines the strict rules and conventions for writing and maintaining test suites. It is not a "how to run tests" guide, but rather the architectural and naming standards the team must adhere to when contributing new tests.

### 3.1 Test Structure and Location

**Backend (Pytest):**

- All tests must be located in `backend/tests/`
- Unit tests go in `backend/tests/unit/`
- Integration tests go in `backend/tests/integration/`

**Frontend (Jest/Vitest):**

- Test files must be colocated with the component or service they test (e.g., `Header.test.tsx` next to `Header.tsx`)
- Alternatively, organized in a dedicated `__tests__` folder if the project grows larger

**Rule:** Test files must never be placed in the production source folder (`src/` or `app/`).

### 3.2 Naming Conventions

**Backend (Pytest):**

- Test files: `test_[module_name].py`
- Test functions: `test_[behavior_description]_[expected_outcome]`

**Example:**

```python
def test_create_farmer_returns_201():
    # ...
def test_create_farmer_with_duplicate_phone_returns_409():
    # ...
```

**Frontend (Jest):**

- Test files: `[component_name].test.tsx`

**Example:**

```typescript
// Button.test.tsx
describe("Button Component", () => {
  it("should render with primary variant", () => {
    // ...
  });
});
```

**Rule:** Test names must be descriptive and state exactly what is being tested and the expected outcome.

### 3.3 Data Isolation and Mocking

**Rule:** All logic tests must use mocked external services (APIs, SMS gateways, AI models) and must not rely on live database connections.

**Rule:** Unit tests must be deterministic and run without network access. Integration tests must explicitly state if they require a live local database.

### 3.4 Coverage Requirements

**Backend:** The minimum required coverage is 80% for all new business logic.

**Frontend:** All critical user flows (login, ticket resolution, offline sync) must be tested.

**Rule:** Any new feature or bug fix must include corresponding test cases to maintain the coverage threshold.

### 3.5 Test Categories and Matrices

The comprehensive QA test suite covers extensive functional, boundary, negative, and end-to-end scenarios across the platform. These tests are documented in external spreadsheets and test suites.

| Test Category         | Tools                                        | Scope                                    |
| --------------------- | -------------------------------------------- | ---------------------------------------- |
| **Unit Tests**        | Pytest (Backend), Jest (Frontend)            | Individual functions and components      |
| **Integration Tests** | Pytest (Backend), Testing Library (Frontend) | API endpoints and component interactions |
| **E2E Tests**         | Playwright, Cypress                          | Critical user journeys                   |
| **API Tests**         | Postman, Newman                              | Backend API endpoints                    |
| **Manual QA**         | Test spreadsheets                            | Edge cases, usability, accessibility     |

### 3.6 Continuous Integration

All tests run automatically in the CI/CD pipeline:

- Unit and integration tests run on every pull request
- E2E tests run on merge to main
- Test failures block the merge

---

## 4.0 Glossary

### 4.1 Technical Acronyms

| Acronym   | Definition                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| **API**   | Application Programming Interface. A set of rules allowing different software applications to communicate. |
| **CI/CD** | Continuous Integration and Continuous Deployment. Automated building, testing, and deployment.             |
| **DPA**   | Data Protection Act. Kenyan legislation governing data protection.                                         |
| **HMAC**  | Hash-based Message Authentication Code. Cryptographic signature for message verification.                  |
| **HTTPS** | Hypertext Transfer Protocol Secure. Encrypted version of HTTP.                                             |
| **JWT**   | JSON Web Token. Compact, URL-safe token for stateless authentication.                                      |
| **MFA**   | Multi-Factor Authentication. Security mechanism requiring multiple verification factors.                   |
| **ODPC**  | Office of the Data Protection Commissioner. Kenyan data protection regulatory authority.                   |
| **PWA**   | Progressive Web App. Web application that works offline and can be installed like a native app.            |
| **RAG**   | Retrieval-Augmented Generation. AI architecture that retrieves external knowledge to ground responses.     |
| **RBAC**  | Role-Based Access Control. Security model granting permissions based on user role.                         |
| **SAST**  | Static Application Security Testing. White-box testing analyzing source code for vulnerabilities.          |
| **SQL**   | Structured Query Language. Domain-specific language for managing relational databases.                     |
| **TLS**   | Transport Layer Security. Cryptographic protocol for secure communications over a network.                 |
| **UI/UX** | User Interface and User Experience. Visual design and overall user experience of an application.           |
| **WAF**   | Web Application Firewall. Filters and monitors HTTP traffic to protect against common web attacks.         |

### 4.2 Domain Definitions (Auditerra)

| Term                         | Definition                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| **Agroecological Zone**      | A region defined by specific climate, soil, and crop suitability characteristics.             |
| **Diagnostic Log**           | A digital record containing soil measurements and observations captured during a field visit. |
| **Field Expert**             | A certified agricultural professional who visits farms and collects on-site soil data.        |
| **Institutional Supervisor** | A stakeholder who oversees program impact, expert deployment, and audit reporting.            |
| **Knowledge Base**           | A curated collection of project-specific agricultural documents used to ground AI responses.  |
| **Security Handshake**       | A one-time SMS code entered by the expert to verify their physical presence at the farm.      |
| **Ticket**                   | A central digital workflow object that tracks a farmer's issue from reporting to resolution.  |
