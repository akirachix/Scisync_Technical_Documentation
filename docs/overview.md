# What is Auditerra?

**Auditerra** is a soil diagnostics and restoration platform built for smallholder farmers in Kenya. It connects three key personas:

1. **Farmers** who report soil issues via USSD on basic feature phones
2. **Field Experts** who conduct on-site diagnostics using an offline-first PWA
3. **Institutional Supervisors** who monitor program impact through audit dashboards

The platform transforms fragmented field observations into **actionable restoration plans** delivered directly to farmers via SMS.

## The Problem We Solve

### The Ground-Truth Gap

Sub-Saharan Africa faces a catastrophic ecological crisis:

- **65%** of arable land is actively degraded
- **12 million hectares** of productive land lost annually
- **75 billion tons** of fertile soil lost yearly

Current monitoring relies on **macro-level satellite data**, which creates a **ground-truth gap**-failing to verify:

- Subsurface soil health (pH, nitrogen, phosphorus, potassium)
- Localized socio-economic realities
- Actual on-the-ground restoration progress

## Who Uses Auditerra?

### 1. Farmers (Primary Users)

- Tech comfort: Low (basic feature phone, 2G connectivity)
- Pain points:
  - Only realizes trees are dying when it's too late
  - Severe topsoil erosion and nutrient depletion
  - Isolated from centralized agricultural advice

**What they do:**

- Dial a USSD shortcode (`*384*55#`)
- Register with their name, phone number, and location
- Report issues (Soil, Water, Crop, Erosion)
- Receive assistance from an agronomic expert
- Receive AI-generated prescriptions via SMS with a 60 day retest to verify land progress

### 2. Field Experts (Secondary Users)

- Tech comfort: High (smartphone user)
- Pain points:
  - Hardware damage from extreme heat (55°C+) and dust
  - No internet in remote areas
  - Difficulty tracking large, unmapped farm perimeters

**What they do:**

- Receive dispatch alerts on their PWA
- Travel to farms and perform a **Security Handshake**
- Log GPS coordinates and soil diagnostics offline
- Sync data automatically when signal returns
- Receive AI recommendations in a report, and go for 60 day retest

### 3. Institutional Supervisors (Tertiary Users)

- Tech comfort: High
- Pain points:
  - Can't verify if experts actually visited farms
  - No centralized, aggregated field statistics
  - Difficulty justifying resource allocation to global funders

**What they do:**

- Monitor the Supervisor Dashboard
- Track expert deployment densities
- Audit 60-day re-test compliance
- Export verifiable impact reports

---

## Key Features

### 1. Low-Connectivity First

| Feature               | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| **USSD Interface**    | Farmers report issues using basic feature phones. No internet required.    |
| **Offline-First PWA** | Experts work in zero-connectivity zones. Data stores locally in IndexedDB. |
| **Background Sync**   | Automatic data upload when network signal returns.                         |

### 2. Verifiable Impact

| Feature                         | Description                                                                 |
| ------------------------------- | --------------------------------------------------------------------------- |
| **Security Handshake**          | 4-digit code proves the expert physically visited the farm. Prevents fraud. |
| **60-Day Audit Loop**           | Enforces re-testing. Measures biological survival, not just planting speed. |
| **Geospatial Boundary Mapping** | GPS polygons capture accurate farm perimeters.                              |

### 3. Smart Matching

| Feature                      | Description                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| **Multi-Factor Scoring**     | Matches by proximity (40%), technical specialization (35%), language compatibility (15%). |
| **Dynamic Radius Expansion** | Searches 15km → 45km → unlimited until an expert is found.                                |
| **Language Compatibility**   | Matches farmers with experts who speak their language (English/Kiswahili).                |

### 4. AI-Powered Diagnostics

| Feature                  | Description                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| **RAG Processing**       | Retrieval-Augmented Generation using Gemini Flash 3.6                 |
| **Three Output Streams** | Farmer SMS (160 chars), Expert Brief, Institutional Dashboard Metrics |
| **Continuous Learning**  | 60-day re-test cycle validates and improves AI accuracy               |

### 5. Institutional Oversight

| Feature                  | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| **Supervisor Dashboard** | Interactive national map with verified field data                        |
| **Audit-Ready Reports**  | Immutable proof-of-impact for global climate funders                     |
| **Ticket Tracking**      | Real-time status monitoring (PENDING → MATCHED → DISPATCHED → COMPLETED) |

---

## How It Works: The Four-Step Workflow

### Step 1: Report

**Farmer dials `*384*55#`**(for example) and reports a soil/crop/water issue via USSD menu on their basic feature phone.

### Step 2: Match

**Backend engine uses multi-factor scoring** to find the nearest qualified expert (proximity + specialization + language) within a 15km radius.

### Step 3: Verify

**Expert travels to farm**, enters the 4-digit Security Handshake code, logs GPS boundaries, and records soil diagnostics offline.

### Step 4: Prescribe

**Data syncs → AI generates prescription** → SMS sent to farmer + dashboard updated + 60-day re-test scheduled.

---

## Key Metrics

### North Star Metric

**Monthly Successful Farmer-Expert Matches** — 300 matches/month target

### Success Thresholds

| Metric                     | Target     |
| -------------------------- | ---------- |
| Time-to-Match              | ≤ 24 hours |
| Expert Rejection Rate      | ≤ 15%      |
| Security Handshake Success | ≥ 98%      |
| 60-Day Audit Completion    | ≥ 80%      |
| Farmer Repeat-Report Rate  | ≤ 5%       |

---

## Technical Stack

| Layer           | Technology                        | Purpose                          |
| --------------- | --------------------------------- | -------------------------------- |
| **Backend API** | FastAPI + Python                  | REST API, business logic         |
| **Database**    | PostgreSQL + PostGIS              | Relational data, spatial queries |
| **ORM**         | SQLAlchemy                        | Database abstraction, migrations |
| **AI**          | Google Gemini 3.6 Flash           | Diagnostic generation            |
| **USSD**        | Africa's Talking                  | Feature phone interface          |
| **SMS**         | SMS Leopard                       | Farmer prescriptions             |
| **Frontend**    | React + Next.js                   | PWA, Supervisor Dashboard        |
| **Offline**     | IndexedDB + Service Workers       | Field data persistence           |
| **Auth**        | JWT                               | Role-based access control        |
| **Hosting**     | Backend: Heroku, Frontend: Vercel | Production deployment            |

---

## Next Steps

- [Getting Started](/guide/overview) : Set up your development environment
- [Developer Guides](/dev_guide/overview) : Are you a developer? Look at our guide designed to make your work easier.

- [Architecture](/architecture/overview) : Understand the system design

- [Backend API](/api/overview) : Explore the endpoints
- [Security](/security/overview) : See what we have implemented for security.
- [AI ](/ai/overview) : Understand how AI is used at Auditerra
- [Deployment](/deployment/overview) : Understand how to deploy a project like Auditerra

---
