# Architecture Overview

## Our System

Auditerra is built on three core principles:

1. **Offline First:** Field operations work in zero connectivity zones.
2. **Human Verified:** Replace satellite guesses with on-the-ground data.
3. **Audit Ready:** Every action is traceable and verifiable.

## Visual Diagrams

### System Architecture Diagram

> _Click below to view the end-to-end system architecture._

[**View the Lucidchart Architecture Diagram**](https://lucid.app/lucidspark/4f756537-28a5-4ec6-93b5-b11e2f710a06/edit?viewport_loc=-54%2C-300%2C5760%2C3258%2C0_0&invitationId=inv_b287c0c7-94d1-48cf-9f38-08a14172df1b)

---

## System Components

The system is built on a layered architecture, separating external users, application logic, and data services.

### 1. Farmers and USSD Interface

**Purpose:** Allow smallholder farmers to report soil and agricultural issues using basic feature phones.

**How it works:** Farmers dial `*384*55#`, collect their registration details (name, ID, phone, county, sub-county, landmark), and report an issue. The system generates a unique 4-digit handshake code and sends an SMS confirmation.

**Technology:** Africa's Talking USSD API

**Security:** Numeric inputs only; 30-second
session timeout; phone numbers normalized.

### 2. Reporting Module

**Purpose:** Convert farmer USSD inputs into structured service tickets.

**How it works:** Receives the issue category (Soil, Water, Crop, Erosion) and severity (Mild, Moderate, High), creates an immutable `PENDING` ticket record with a UUID, and triggers the expert matching process.

### 3. Matching Service

**Purpose:** Find the most suitable field expert for each farmer's issue.

**How it works:** Uses a multi-factor scoring matrix:

- **Proximity (40%):** PostGIS spatial queries within a 15 km radius.
- **Technical Specialization (35%):** Matches expert skills with the reported issue.
- **Language Compatibility (15%):** Matches the farmer's preferred language.

The system uses dynamic radius expansion: `15 km + 5`.
**Notifications:** Farmers receive the expert's name and handshake code; Experts receive ticket details.

### 4. Syncing Module

**Purpose:** Enable offline-first field operations for experts.

**How it works:** The expert PWA stores operational data locally in **IndexedDB**. The **Service Worker** intercepts network requests, and the **Background Sync API** detects connectivity, automatically uploading data when the network returns.

**Data Cached:** Tickets (up to 10 days), diagnostic forms, location coordinates, and photos.

**Security:** Highly Restricted data is not cached; JWT tokens expire after 1 hour.

### 5. Location Module

**Purpose:** Capture and manage geospatial data for farm visits.

**How it works:** The expert's device captures GPS coordinates via the W3C Geolocation API. The backend stores them in PostgreSQL with PostGIS, allowing farm boundaries to be represented as spatial polygons.

### 6. Verification Module

**Purpose:** Verify that field visits actually occurred and track restoration progress.

**How it works:** Using a 4-digit handshake code:

1. Code generated via `crypto.randomInt()`, hashed with bcrypt, and sent to the farmer.
2. Expert enters the code on site. Successful verification unlocks diagnostic forms (code expires after 24 hours).
3. A 60-day mandatory retest loop is scheduled to measure restoration progress.

### 7. AI Module

**Purpose:** Generate agronomic recommendations using Retrieval-Augmented Generation (RAG).

**How it works:**

1. **Knowledge Base:** Project-specific Markdown files are uploaded to the Gemini File Search store.
2. **Prompt Construction:** The backend strips farmer identity, structures soil parameters, and restricts the response format.
3. **RAG Execution:** Gemini retrieves relevant documents to ground the recommendation.
4. **Output Generation:** Produces a Farmer SMS, Expert Brief, and Institutional Data displayed on the dashboard.

**Security:** Farmer identity is removed before AI requests; outputs are constrained; input/output hashes are maintained for audit purposes.

### 8. SMS Alert Module

**Purpose:** Deliver prescriptions, verification codes, and operational notifications.
**How it works:**

- **Primary Channel:** Africa's Talking
- **Secondary Channel:** SMS Leopard (Failover)
- **Retry Policy:** Failed messages are retried up to 3 times.
  **Security:** API keys stored in Secret Manager; 10 SMS/day max for farmers, 100/day max for experts; passwords/GPS are never included.

### 9. Supervisor Dashboard

**Purpose:** Provide institutional supervisors with operational oversight and audit capabilities.
**Features:** Interactive national map, real-time ticket tracking, expert deployment density, 60-day audit reminders, and exportable impact reports.

---

## Data Flow and System Integration

The architecture follows a strict, secure data path:

1. **Report:** Farmer dials `*384*55#` → USSD menu → Issue category & severity submitted.
2. **Match:** Backend uses PostGIS + Multi-factor scoring → Expert assigned → Status: `MATCHED`.
3. **Verify:** Expert travels to farm → GPS captured → Handshake code entered → Status: `ON_SITE`.
4. **Diagnose:** Expert records soil parameters and photos offline → Data synced when connectivity returns.
5. **Prescribe:** Data syncs → AI generates recommendation (anonymized) → Delivered via SMS/PWA/Dashboard → 60-day retest scheduled.

---

## Design & Brand Guidelines

The Auditerra interface is designed for readability and clarity, specifically optimized for mobile devices and low-bandwidth environments. The visual design choices follow a professional, agricultural aesthetic focusing on clarity and trust.

### Design Principles

- **Low Connectivity Focus:** The interface is designed for mobile-first usage, ensuring fast loading times even on 2G networks.
- **Simple and Clear:** Icons are used heavily to bypass language barriers, and color coding is used to quickly indicate statuses (e.g., Green for success, Red for emergencies).
- **Accessibility:** High contrast ratios are used for text and backgrounds to ensure readability in outdoor field conditions.

### Color Palette

| Type      | Color | Hex       | Usage                                 |
| --------- | ----- | --------- | ------------------------------------- |
| Primary   | Brown | `#5B3D26` | Headings and navigation               |
| Primary   | White | `#FFFFFF` | Backgrounds and text on dark surfaces |
| Secondary | Green | `#4C8A42` | Buttons and success states            |
| Secondary | Teal  | `#436A4B` | Accent elements                       |

### Typography

| Property     | Value                         |
| ------------ | ----------------------------- |
| Primary Font | Fira Sans                     |
| Weights      | Regular, Medium, Bold         |
| Hierarchy    | Headings: Bold, Body: Regular |

### Figma Design References

> _Click below to view the Figma designs, including the brand moodboard, style guide, wireframes, and the full Web UI._

[**View the Figma Design Files**](https://www.figma.com/design/DvUaZIM2Po8pyEREPgUCSq/Sci-Sync-Case-study?node-id=1-3&t=6fCnJa56zdMW6Svo-1)
