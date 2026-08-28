# Architecture Overview

Auditerra is built on three core principles:

1. **Offline First:** Field operations work in zero connectivity zones.
2. **Human Verified:** Replace satellite guesses with on-the-ground data.
3. **Audit Ready:** Every action is traceable and verifiable.

---

## System Architecture

The system follows a layered architecture that separates external user interfaces, application logic, data processing, and storage. This design ensures scalability, maintainability, and clear separation of concerns.

### Architecture Layers

| Layer            | Components                                       | Responsibility                       |
| ---------------- | ------------------------------------------------ | ------------------------------------ |
| **Presentation** | USSD Interface, Expert PWA, Supervisor Dashboard | User interaction and data collection |
| **Application**  | Matching Service, AI Module, Verification Module | Business logic and orchestration     |
| **Data**         | PostgreSQL, IndexedDB, Redis                     | Persistent storage and caching       |
| **Integration**  | Africa's Talking, SMS Leopard, Gemini API        | External service communication       |

#### System Preview

![System Architecture](/sad.png)

> _This diagram shows the end-to-end system architecture including all components, data flows, and external integrations._

**Reference Diagram:** [View the Lucidchart Architecture Diagram](https://lucid.app/lucidspark/4f756537-28a5-4ec6-93b5-b11e2f710a06/edit?viewport_loc=-54%2C-300%2C5760%2C3258%2C0_0&invitationId=inv_b287c0c7-94d1-48cf-9f38-08a14172df1b)

---

## Component Breakdown

### 1. Farmers and USSD Interface

**Purpose:** Allow smallholder farmers to report soil and agricultural issues using basic feature phones.

**How It Works:**
Farmers dial the USSD shortcode (`*384*55#`) from any basic feature phone. The system guides them through a structured menu:

- Registration: Collects name, ID, phone number, county, sub-county, and landmark
- Issue Reporting: Captures category (Soil, Water, Crop, Erosion) and severity (Mild, Moderate, High)
- Confirmation: Generates a unique 4-digit handshake code and sends an SMS confirmation

**Technology:** Africa's Talking USSD API

**Security Considerations:**

- Numeric inputs only to prevent injection attacks
- 30-second session timeout to free up resources
- Phone numbers normalized to E.164 format
- All USSD interactions logged for audit purposes

**Limitations Addressed:**

- Works on 2G networks with no internet required
- Handles feature phones with minimal processing power
- Menu structure compressed to fit within 30-second session windows

---

### 2. Reporting Module

**Purpose:** Convert farmer USSD inputs into structured service tickets for processing.

**How It Works:**
The module receives the issue category and severity from the USSD interface, creates an immutable ticket record with a UUID, and triggers the expert matching process. Each ticket is assigned a unique 4-digit handshake code that serves as the security verification token.

**Ticket States:**

| State          | Description                                  |
| -------------- | -------------------------------------------- |
| **PENDING**    | Ticket created, awaiting expert assignment   |
| **MATCHED**    | Expert found, awaiting acceptance            |
| **DISPATCHED** | Expert notified and traveling                |
| **ON_SITE**    | Expert at farm, handshake complete           |
| **RESOLVED**   | Issue addressed, awaiting final verification |
| **COMPLETED**  | 60-day retest confirms restoration           |
| **CANCELLED**  | Ticket cancelled by farmer or system         |

**Data Collected:**

- Farmer identification (name, phone, location)
- Issue category and sub-category
- Severity level
- Timestamp and geographic coordinates
- Unique handshake code (hashed)

---

### 3. Matching Service

**Purpose:** Find the most suitable field expert for each farmer's issue using a multi-factor scoring system.

**How It Works:**
The matching engine evaluates available experts using a weighted scoring matrix and ranks them to find the optimal match.

**Scoring Matrix:**

| Factor                       | Weight | Calculation                                                      |
| ---------------------------- | ------ | ---------------------------------------------------------------- |
| **Proximity**                | 40%    | PostGIS spatial query within 15km radius                         |
| **Technical Specialization** | 35%    | Match between expert skills and issue category                   |
| **Language Compatibility**   | 15%    | Match between farmer's preferred language and expert's languages |
| **Availability**             | 10%    | Current workload and acceptance rate                             |

**Dynamic Radius Expansion:**
The system automatically expands the search radius if no expert is found:

- Attempt 1: 15km
- Attempt 2: 30km
- Attempt 3: 45km
- Attempt 4: Unlimited (nationwide)

**Match Confirmation:**

- **Farmer:** Receives SMS with expert name and estimated arrival time
- **Expert:** Receives web push notification with ticket details and farmer location
- **Supervisor:** Dashboard updates to show MATCHED status

---

### 4. Syncing Module

**Purpose:** Enable offline-first field operations for experts working in areas without connectivity.

**How It Works:**
The expert PWA stores operational data locally using **IndexedDB**. The **Service Worker** intercepts network requests and manages caching. The **Background Sync API** detects when connectivity is restored and automatically uploads queued data.

**Offline Storage Architecture:**

**Data Cached Offline:**

- Tickets: Up to 10 days of assignments
- Diagnostic forms: Complete forms awaiting sync
- Location data: GPS coordinates and farm boundaries
- Photos: Compressed field images

**Security:**

- Highly Restricted data is not cached
- JWT tokens expire after 1 hour
- Cache is cleared on logout
- Data encrypted at rest in IndexedDB

---

### 5. Location Module

**Purpose:** Capture and manage geospatial data for farm visits, enabling accurate boundary mapping and spatial analysis.

**How It Works:**
The expert's device captures GPS coordinates via the W3C Geolocation API. The backend stores these coordinates in PostgreSQL with PostGIS extension, allowing farm boundaries to be represented as spatial polygons.

**Spatial Data Types:**

- Point: Single GPS coordinate (expert location, farm centroid)
- Polygon: Farm boundary mapped by walking the perimeter
- Linestring: Road or path tracking
- Multipolygon: Multiple plots for a single farmer

**PostGIS Functionality:**

- Distance calculations for proximity matching
- Spatial joins for region analysis
- Geospatial aggregation for dashboard metrics
- Boundary overlap detection to prevent duplicate registrations

**Data Flow:**

1. Expert walks farm perimeter while device drops GPS pins
2. PWA calculates geometric polygon from coordinate stream
3. Polygon stored locally in IndexedDB (offline)
4. Background sync uploads polygon to cloud
5. PostGIS processes polygon for spatial queries
6. Dashboard renders farm boundaries on interactive map

---

### 6. Verification Module

**Purpose:** Verify that field visits actually occurred and track restoration progress over time.

**How It Works:**
The module uses a 4-digit Security Handshake code to prove physical presence at the farm location. This prevents fraud and ensures data integrity.

**Handshake Process:**

**Code Management:**

- Generated via `crypto.randomInt()` for true randomness
- Hashed with bcrypt before storage (preventing database exposure)
- Sent to farmer via SMS with instruction: "Do not share until expert arrives"
- Expires after 24 hours to prevent reuse
- Failed attempts limited to 5 before lockout

**60-Day Audit Loop:**
After the initial visit, the system automatically schedules a 60-day retest. The expert must return to the same farm, perform the same measurements, and log the results. This enforces measurement of biological survival rather than just planting speed.

**Verification Metrics Tracked:**

- Soil pH change
- Nitrogen, Phosphorus, Potassium levels
- Crop yield data
- Farmer satisfaction rating
- Photo evidence of restoration

---

### 7. AI Module

**Purpose:** Generate agronomic recommendations using Retrieval-Augmented Generation (RAG) with Google Gemini.

**How It Works:**
The AI module uses Retrieval-Augmented Generation to ground recommendations in authoritative agricultural science.

**RAG Process Flow:**

**Knowledge Base:**

- Project-specific Markdown files uploaded to Gemini File Search store
- KALRO (Kenya Agricultural and Livestock Research Organization) guidelines
- ICRAF (World Agroforestry) best practices
- Peer-reviewed agricultural research
- Localized agronomic data

**Prompt Engineering:**

1. **Anonymization:** Farmer identity removed before AI processing
2. **Context Construction:** Soil parameters structured with field data
3. **Constraint Setting:** Response format and length restrictions
4. **Citation Requirement:** AI must reference source documents

**Output Streams:**

| Stream                 | Format             | Purpose                       |
| ---------------------- | ------------------ | ----------------------------- |
| **Farmer SMS**         | 160 characters max | Actionable steps only         |
| **Expert Brief**       | Full report        | Detailed scientific rationale |
| **Institutional Data** | Dashboard metrics  | Aggregated for oversight      |

**Security:**

- Farmer identity removed before AI requests
- Outputs constrained to prevent harmful recommendations
- Input/output hashes maintained for audit purposes
- RAG ensures responses are grounded in verified sources

---

### 8. SMS Alert Module

**Purpose:** Deliver prescriptions, verification codes, and operational notifications to all users.

**How It Works:**
The module uses a primary SMS gateway with automatic failover to ensure delivery.

**SMS Architecture:**

| Component             | Technology                          | Purpose                       |
| --------------------- | ----------------------------------- | ----------------------------- |
| **Primary Gateway**   | Africa's Talking                    | USSD and primary SMS delivery |
| **Secondary Gateway** | SMS Leopard                         | Automatic failover for SMS    |
| **Retry Policy**      | 3 attempts, exponential backoff     | Ensure message delivery       |
| **Rate Limiting**     | 10/day (farmers), 100/day (experts) | Prevent abuse                 |

**Message Types:**

- Registration confirmation
- Handshake code delivery
- Expert dispatch notification
- AI-generated prescription
- 60-day retest reminder
- Operational alerts and status updates

**Security:**

- API keys stored in Secret Manager (not in code)
- Rate limiting per user (10/day farmers, 100/day experts)
- Passwords and GPS coordinates never included in SMS
- No personally identifiable information in messages
- All SMS interactions logged for audit

**Deliverability:**

- Phone numbers normalized to E.164 format
- Multiple retry attempts for failed messages
- SMS content compressed to 160 characters
- Unicode support for Kiswahili messages

---

### 9. Supervisor Dashboard

**Purpose:** Provide institutional supervisors with operational oversight and comprehensive audit capabilities.

**Features:**

| Feature                       | Description                                           |
| ----------------------------- | ----------------------------------------------------- |
| **Interactive National Map**  | Visual representation of all active restoration sites |
| **Real-Time Ticket Tracking** | Live status updates for all tickets                   |
| **Expert Deployment Density** | Heatmap showing expert coverage                       |
| **60-Day Audit Reminders**    | Automated alerts for upcoming retests                 |
| **Exportable Impact Reports** | PDF and CSV exports for funders                       |
| **Aggregated Statistics**     | Key metrics and performance indicators                |

**Dashboard Layout:**

1. **Top Navigation:** Title and user actions
2. **Stat Cards:** Key metrics (hectares restored, active sites, expert count)
3. **Interactive Map:** Region map with site markers
4. **Charts:** Restoration progress visualizations
5. **Data Table:** Regional restoration matrix with export

**Data Sources:**

- Tickets: Active and historical
- Locations: GPS polygons and site status
- Experts: Deployment and availability
- Diagnostics: Soil health metrics
- Audit Compliance: 60-day retest completion

**Audit Reports:**

- Immutable proof-of-impact for global climate funders
- Exportable in multiple formats (PDF, CSV, JSON)
- Timestamped and verifiable
- Includes photographic evidence
- Tracks both initial visit and 60-day retest results

---

## Data Flow and System Integration

The architecture follows a strict, secure data path for every transaction.

### End-to-End Data Flow

**Step 1: Report**

- Farmer dials `*384*55#` → USSD menu
- Issue category and severity submitted
- 4-digit handshake code generated
- SMS confirmation sent to farmer
- Ticket status: **PENDING**

**Step 2: Match**

- Backend uses PostGIS for proximity query
- Multi-factor scoring evaluates available experts
- Best expert selected and notified
- Status: **MATCHED**

**Step 3: Verify**

- Expert travels to farm location
- Device captures GPS coordinates
- Handshake code entered and verified
- Status: **ON_SITE**

**Step 4: Diagnose**

- Expert logs soil parameters (pH, N, P, K)
- Photos captured and stored locally
- Data stored in IndexedDB (offline)
- Background sync when connectivity returns

**Step 5: Prescribe**

- Data synced to cloud
- AI generates recommendation using RAG
- Output delivered: Farmer SMS, Expert Brief, Dashboard update
- 60-day retest scheduled
- Status: **RESOLVED**

**Step 6: Audit (60-Day Retest)**

- Expert returns to farm location
- Repeat diagnostic measurements
- Data compared to baseline
- Restoration verified or re-intervention scheduled
- Status: **COMPLETED**

---

## Design & Brand Guidelines

The Auditerra interface is designed for readability and clarity, specifically optimized for mobile devices and low-bandwidth environments.

### Design Principles

| Principle                  | Application                                                             |
| -------------------------- | ----------------------------------------------------------------------- |
| **Low Connectivity Focus** | Mobile-first design, fast loading on 2G networks, offline functionality |
| **Simple and Clear**       | Heavy icon usage to bypass language barriers, color coding for status   |
| **Accessibility**          | High contrast ratios for outdoor field conditions, readable fonts       |
| **Trustworthy**            | Professional agricultural aesthetic, consistent visual language         |

### Color Palette

| Type              | Color       | Hex       | Usage                                   |
| ----------------- | ----------- | --------- | --------------------------------------- |
| **Primary Dark**  | Brown       | `#5B3D26` | Headings, navigation, major UI elements |
| **Primary Light** | White       | `#FFFFFF` | Backgrounds, text on dark surfaces      |
| **Secondary**     | Green       | `#4C8A42` | Buttons, success states, CTAs           |
| **Accent**        | Teal        | `#436A4B` | Accent elements, highlights             |
| **Background**    | Off-white   | `#F9FBF9` | Page backgrounds                        |
| **Success**       | Light Green | `#E8F5E9` | Success indicators                      |
| **Warning**       | Amber       | `#F59E0B` | Pending status, warnings                |
| **Error**         | Red         | `#DC2626` | Errors, critical issues                 |

### Typography

| Property         | Specification                           | Usage                       |
| ---------------- | --------------------------------------- | --------------------------- |
| **Primary Font** | Fira Sans                               | All text content            |
| **Weights**      | Regular (400), Medium (500), Bold (700) | Typographic hierarchy       |
| **Headings**     | Bold, 1.2+ line-height                  | Section titles              |
| **Body**         | Regular, 1.5 line-height                | Paragraphs and content      |
| **Code**         | Fira Mono                               | Code blocks and inline code |

### Figma Design References

![Logo](/public/figma.png)

[View the Figma Design Files](https://www.figma.com/design/DvUaZIM2Po8pyEREPgUCSq/Sci-Sync-Case-study?node-id=1-3&t=6fCnJa56zdMW6Svo-1)

---

## Security Architecture

### Authentication Layer

| Component             | Implementation                 | Purpose                                         |
| --------------------- | ------------------------------ | ----------------------------------------------- |
| **JWT (RS256)**       | Access + Refresh tokens        | Secure, stateless authentication                |
| **MFA**               | TOTP or SMS/email OTP          | Additional security for experts and supervisors |
| **Role-Based Access** | RBAC with granular permissions | Enforce role separation                         |
| **Session Tracking**  | Redis-based session management | Monitor and revoke sessions                     |
| **Token Expiry**      | 60 min access, 7 day refresh   | Limit exposure of stolen tokens                 |

### Data Protection

| Measure                    | Implementation               | Purpose                         |
| -------------------------- | ---------------------------- | ------------------------------- |
| **Encryption in Transit**  | HTTPS/TLS 1.3                | Secure data during transmission |
| **Encryption at Rest**     | PostgreSQL column encryption | Protect stored data             |
| **Password Hashing**       | bcrypt (12 rounds)           | Secure password storage         |
| **Handshake Code Hashing** | bcrypt                       | Prevent code exposure           |
| **Audit Logging**          | All actions logged           | Traceability and compliance     |

### API Security

| Control                      | Implementation           | Purpose                      |
| ---------------------------- | ------------------------ | ---------------------------- |
| **Rate Limiting**            | IP and user-based limits | Prevent abuse                |
| **CORS**                     | Strict origin validation | Prevent cross-origin attacks |
| **Input Validation**         | Pydantic schemas         | Prevent injection attacks    |
| **XSS Protection**           | Output sanitization      | Prevent script injection     |
| **SQL Injection Protection** | SQLAlchemy ORM           | Parameterized queries        |

---

### API Security

| Control                      | Implementation           | Purpose                      |
| ---------------------------- | ------------------------ | ---------------------------- |
| **Rate Limiting**            | IP and user-based limits | Prevent abuse                |
| **CORS**                     | Strict origin validation | Prevent cross-origin attacks |
| **Input Validation**         | Pydantic schemas         | Prevent injection attacks    |
| **XSS Protection**           | Output sanitization      | Prevent script injection     |
| **SQL Injection Protection** | SQLAlchemy ORM           | Parameterized queries        |

### AI Security

| Control                         | Implementation                             | Purpose                               |
| ------------------------------- | ------------------------------------------ | ------------------------------------- |
| **Data Anonymization**          | Farmer identity stripped before AI prompts | PII never leaves trusted zone         |
| **Output Validation**           | Strict JSON schema enforcement             | Prevent harmful or unexpected content |
| **Rate Limiting**               | 100 requests per minute                    | Prevent Denial of Wallet attacks      |
| **Audit Trail**                 | Input/output hashes logged for 3 years     | Tamper-evident accountability         |
| **Prompt Injection Prevention** | Structured prompts with constraint setting | Reject malformed responses            |

## Deployment Architecture

### Backend (Heroku)

| Component     | Specification                | Purpose                  |
| ------------- | ---------------------------- | ------------------------ |
| **Hosting**   | Heroku (Dublin, Ireland)     | Production hosting       |
| **Dyno Type** | Standard-1x (1GB)            | Application server       |
| **Database**  | Heroku Postgres (Standard)   | PostgreSQL database      |
| **Redis**     | Heroku Redis (Premium-0)     | Caching and sessions     |
| **Add-ons**   | Custom environment variables | Configuration management |

### Frontend (Vercel)

| Component       | Specification            | Purpose               |
| --------------- | ------------------------ | --------------------- |
| **Hosting**     | Vercel (Edge Network)    | Frontend hosting      |
| **Build**       | Next.js App Router       | React framework       |
| **Environment** | .env.local configuration | Environment variables |
| **Deployment**  | Automatic on push        | Continuous deployment |

### CI/CD Pipeline

1. **Code Push:** GitHub push triggers workflow
2. **Build:** Backend and frontend built
3. **Test:** Automated test suite executed
4. **Deploy:** Staging → Production promotion
5. **Verification:** Health checks ensure uptime

---

## Monitoring & Logging

| Component            | Tool                   | Purpose                 |
| -------------------- | ---------------------- | ----------------------- |
| **Application Logs** | Heroku Logs            | Runtime monitoring      |
| **Database Metrics** | Heroku Dashboard       | Performance tracking    |
| **API Monitoring**   | Custom health endpoint | Service availability    |
| **Error Tracking**   | Console + Heroku       | Error detection         |
| **User Activity**    | Audit Log repository   | Compliance and security |

---

## Performance Considerations

| Area             | Strategy                             | Target            |
| ---------------- | ------------------------------------ | ----------------- |
| **Database**     | Indexed columns, connection pooling  | < 50ms query time |
| **API Response** | Caching, optimized queries           | < 200ms response  |
| **USSD**         | Compressed menus, session management | < 3s per step     |
| **Offline Sync** | Delta updates, background sync       | < 5s sync time    |
| **Frontend**     | Lazy loading, code splitting         | < 2s load time    |

---

## Scalability Strategy

| Component    | Strategy                     | Approach                                 |
| ------------ | ---------------------------- | ---------------------------------------- |
| **Backend**  | Horizontal scaling           | Multiple dynos with load balancer        |
| **Database** | Read replicas                | Separate read/write operations           |
| **Caching**  | Redis across instances       | Shared cache for sessions                |
| **Offline**  | Client-side storage          | Reduces server load                      |
| **USSD**     | Africa's Talking scalability | Handles thousands of concurrent sessions |

---
