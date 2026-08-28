# What is Auditerra?

Auditerra is a soil diagnostics and restoration platform that connects smallholder farmers in Kenya with agricultural experts through a low-connectivity digital network. The platform enables farmers to report land degradation issues using basic feature phones, allows experts to collect and verify field data offline, and gives institutional supervisors the tools to monitor restoration progress with verifiable, audit-ready evidence.

The platform transforms fragmented field observations into actionable restoration plans delivered directly to farmers via SMS, replacing unreliable satellite data with human-verified field measurements.

---

## The Problem We Solve

### The Ground-Truth Gap

Sub-Saharan Africa faces a severe ecological crisis. Current monitoring relies on satellite data that cannot verify subsurface soil health or localized realities. This creates a ground-truth gap that prevents effective restoration and blocks climate funding.

| Indicator                     | Scale               |
| ----------------------------- | ------------------- |
| Arable land actively degraded | 65%                 |
| Productive land lost annually | 12 million hectares |
| Fertile soil lost yearly      | 75 billion tons     |

Satellite data cannot measure:

- Subsurface soil health (pH, nitrogen, phosphorus, potassium)
- Localized socio-economic conditions
- Actual on-the-ground restoration progress

---

## Research Foundation

Auditerra is built on the Restoration-on-Demand (RoD) case study, a research project examining scalable digital architecture for land restoration in Kenya. The full research report provides the academic foundation and evidence base for the platform design.

### Research Structure

**1. Problem Definition**
The research identifies that traditional restoration projects fail due to a ground-truth gap where satellite data misreads actual soil health. Smallholder farmers lack agronomic expertise, manual field logs are error-prone, and institutional backers face verification anxieties that freeze funding.

**2. Stakeholder Analysis**
The research maps four stakeholder categories that inform the platform's user design:

| Category            | Stakeholders                             | Role                                                                           |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| **Players**         | Institutional Supervisors                | Decision-makers who coordinate field efforts and justify resource distribution |
| **Context Setters** | Agricultural Bodies, National Registries | Provide verified scientific data and set interoperability standards            |
| **Subjects**        | Smallholder Farmers, Field Experts       | Primary users whose livelihoods depend on restoration success                  |
| **Crowd**           | Commercial Fertilizer Blenders           | Secondary opportunity for monetization through aggregated soil health data     |

**3. Solution Framework**
The research proposes a decentralized digital architecture optimized for low-bandwidth environments that connects smallholders with local experts via USSD and offline-first mobile tools. The framework establishes an immutable audit trail through Three-Tiered Verification: satellite data, physical re-tests, and yield logs.

**4. Verification Methodology**

- **Security Handshake Protocol**: 4-digit code proves physical expert presence on-site
- **60-Day Physical Audit Loop**: Shifts success metrics from planting speed to biological survival and soil recovery
- **Geospatial Boundary Mapping**: GPS polygons capture accurate farm perimeters

**5. Technical Architecture**

- Offline-first Progressive Web App for field experts
- USSD interface for feature phone farmers
- AI-powered diagnostic engine using Retrieval-Augmented Generation
- PostgreSQL with PostGIS for spatial queries
- IndexedDB for client-side data persistence

**6. Environmental Considerations**
The research documents critical hardware limitations in ASAL environments:

- Temperatures exceeding 55°C cause drone batteries to lose 50% of lifespan
- Mineral dust reduces solar panel output by up to 50%
- Fine dust acts as abrasive in motor parts and can cause short circuits

[View the Full Research Report](https://docs.google.com/document/d/18-6IqKA9vsZqwmht3UFp0WH251Kjl0XEdilepeAH_S4/edit?tab=t.0)

---

## The Product

The Restoration-on-Demand platform translates the research findings into a production-ready system.

### How It Works: The Four-Step Workflow

**Step 1: Report**
The farmer dials the USSD shortcode and reports a soil, crop, or water issue through the menu on their basic feature phone.

**Step 2: Match**
The backend engine uses multi-factor scoring to find the nearest qualified expert based on proximity, technical specialization, and language compatibility within a 15km radius.

**Step 3: Verify**
The expert travels to the farm, enters the 4-digit Security Handshake code, logs GPS boundaries, and records soil diagnostics offline.

**Step 4: Prescribe**
Data syncs to the cloud, the AI generates a prescription, SMS is sent to the farmer, the dashboard is updated, and a 60-day retest is scheduled.

### Who Uses Auditerra?

**1. Farmers (Primary Users)**

- Tech comfort: Low (basic feature phone, 2G connectivity)
- Pain points: Only realize trees are dying when it is too late; severe topsoil erosion and nutrient depletion; isolated from centralized agricultural advice
- What they do: Dial USSD shortcode; register with name, phone number, and location; report issues; receive AI-generated prescriptions via SMS; participate in 60-day retest

**2. Field Experts (Secondary Users)**

- Tech comfort: High (smartphone user)
- Pain points: Hardware damage from extreme heat; no internet connectivity in remote areas; difficulty tracking large farm perimeters
- What they do: Receive dispatch alerts on PWA; travel to farms and perform Security Handshake; log GPS coordinates and soil diagnostics offline; sync data automatically when signal returns; return for 60-day retest

**3. Institutional Supervisors (Tertiary Users)**

- Tech comfort: High
- Pain points: Cannot verify if experts visited farms; no centralized field statistics; difficulty justifying resource allocation to funders
- What they do: Monitor Supervisor Dashboard; track expert deployment densities; audit 60-day retest compliance; export verifiable impact reports

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
| **Dynamic Radius Expansion** | Searches 15km → 30km → 45km → unlimited until an expert is found.                         |
| **Language Compatibility**   | Matches farmers with experts who speak their language (English/Kiswahili).                |

### 4. AI-Powered Diagnostics

| Feature                  | Description                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| **RAG Processing**       | Retrieval-Augmented Generation using Gemini Flash                     |
| **Three Output Streams** | Farmer SMS (160 chars), Expert Brief, Institutional Dashboard Metrics |
| **Continuous Learning**  | 60-day retest cycle validates and improves AI accuracy                |

### 5. Institutional Oversight

| Feature                  | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| **Supervisor Dashboard** | Interactive national map with verified field data                        |
| **Audit-Ready Reports**  | Immutable proof-of-impact for global climate funders                     |
| **Ticket Tracking**      | Real-time status monitoring (PENDING → MATCHED → DISPATCHED → COMPLETED) |

---

## Product Requirements

The platform is designed to meet specific performance targets that align with both the research findings and operational needs. The Product Requirement Document details functional and non-functional requirements, user stories, and acceptance criteria for the implemented system.

[View the Product Requirement Document](https://docs.google.com/document/d/1LF-cRiHMh0Htt62VxRZfheig9Oym7ZvhVw8IHCi79VI/edit?tab=t.jxeni2ymg3l5#heading=h.u5ellvusl3i2)

---

## Technical Stack

| Layer           | Technology                        | Purpose                          |
| --------------- | --------------------------------- | -------------------------------- |
| **Backend API** | FastAPI + Python                  | REST API, business logic         |
| **Database**    | PostgreSQL + PostGIS              | Relational data, spatial queries |
| **ORM**         | SQLAlchemy                        | Database abstraction, migrations |
| **AI**          | Google Gemini Flash               | Diagnostic generation            |
| **USSD**        | Africa's Talking                  | Feature phone interface          |
| **SMS**         | SMS Leopard                       | Farmer prescriptions             |
| **Frontend**    | React + Next.js                   | PWA, Supervisor Dashboard        |
| **Offline**     | IndexedDB + Service Workers       | Field data persistence           |
| **Auth**        | JWT                               | Role-based access control        |
| **Hosting**     | Backend: Heroku, Frontend: Vercel | Production deployment            |

---

## Documentation Links

- [Architecture](/architecture/overview): System design and components
- [API Reference](/api/overview): Backend API documentation
- [Frontend Web](/Frontend-Web/overview): React/Next.js application
- [Frontend Mobile](/frontend-mobile/overview): PWA and offline-first
- [Security](/security/overview): Authentication and authorization
- [AI Module](/ai/overview): Gemini integration and RAG
- [Deployment](/deployment/overview): Heroku and Vercel setup
