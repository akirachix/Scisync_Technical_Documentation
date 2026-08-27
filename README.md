# Auditerra

**Soil Diagnostics & Restoration Platform for Kenya's Smallholder Farmers**

Auditerra is a digital platform that connects smallholder farmers with agricultural experts to diagnose soil issues and deliver actionable restoration plans—even in areas with limited internet connectivity.

---

## The Problem

Sub-Saharan Africa faces a catastrophic ecological crisis:
- **65%** of arable land is actively degraded
- **12 million hectares** of productive land lost annually
- **75 billion tons** of fertile soil lost yearly

Current monitoring relies on macro-level satellite data, which fails to verify subsurface soil health or localized realities. This creates a ground-truth gap that prevents effective restoration and blocks climate funding.

---

## The Solution

Auditerra replaces unreliable satellite guesses with verified, human-field data through a four-step workflow:

| Step | Action | Technology |
|------|--------|------------|
| **Report** | Farmer logs environmental issue via USSD | Feature phone, no internet required |
| **Match** | System dispatches the nearest qualified expert | Multi-factor matching algorithm |
| **Verify** | Expert performs on-site security handshake | 4-digit code + GPS logging |
| **Prescribe** | AI generates tailored prescription via SMS | Gemini + RAG processing |

---

## Key Differentiators

| Feature | Description |
|---------|-------------|
| **Low-Connectivity First** | Farmers use USSD (feature phones). Experts use offline-first PWA. Syncs when signal returns. |
| **Verifiable Impact** | 60-day audit loop. Immutable field data. Proof for global climate funders. |
| **Human-Centric** | Multi-factor expert matching. Language compatibility. Local community trust. |
| **Scalable Architecture** | Cloud-native, serverless-ready. PostgreSQL with PostGIS. AI-powered diagnostics. |

---

## Who Uses Auditerra?

### Farmers (Primary Users)
- Smallholder farmers with basic feature phones
- Report soil issues via USSD (`*384*55#`)
- Receive AI-generated prescriptions via SMS

### Field Experts (Secondary Users)
- Certified agricultural professionals
- Use offline-first PWA to log diagnostics
- Sync data automatically when connectivity returns

### Institutional Supervisors (Tertiary Users)
- NGO program leads, government agencies
- Monitor progress via the Supervisor Dashboard
- Export verifiable impact reports

---

## Technical Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend API** | FastAPI + Python | REST API, business logic |
| **Database** | PostgreSQL + PostGIS | Relational data, spatial queries |
| **ORM** | SQLAlchemy | Database abstraction, migrations |
| **AI** | Google Gemini 1.5 Flash | Diagnostic generation |
| **USSD** | Africa's Talking | Feature phone interface |
| **SMS** | SMS Leopard | Farmer prescriptions |
| **Frontend** | React + Next.js | PWA, Supervisor Dashboard |
| **Offline** | IndexedDB + Service Workers | Field data persistence |
| **Auth** | JWT | Role-based access control |
| **Hosting** | Backend: Heroku, Frontend: Vercel | Production deployment |

---

## Key Metrics

### North Star Metric
**Monthly Successful Farmer-Expert Matches** — 300 matches/month target

### Success Thresholds

| Metric | Target |
|--------|--------|
| Time-to-Match | ≤ 24 hours |
| Expert Rejection Rate | ≤ 15% |
| Security Handshake Success | ≥ 98% |
| 60-Day Audit Completion | ≥ 80% |
| Farmer Repeat-Report Rate | ≤ 5% |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Clone and Install

```bash
git clone https://github.com/najmahares/Auditerra-Technical-Documentation-.git
cd Auditerra-Technical-Documentation-
npm install
```

### Run Documentation Locally

```bash
npm run docs:dev
```

Open http://localhost:5173

### Build for Production

```bash
npm run docs:build
```

---

## Documentation

Full technical documentation is available at:

**Live:** https://auditerra-technical-documentation.vercel.app/

| Section | Description |
|---------|-------------|
| [Overview](https://auditerra-technical-documentation.vercel.app/overview) | Product overview and key features |
| [Getting Started](https://auditerra-technical-documentation.vercel.app/guide/overview) | Prerequisites and setup |
| [Architecture](https://auditerra-technical-documentation.vercel.app/architecture/overview) | System design and components |
| [API Reference](https://auditerra-technical-documentation.vercel.app/api/overview) | Backend API documentation |
| [Frontend Web](https://auditerra-technical-documentation.vercel.app/Frontend-Web/overview) | React/Next.js application |
| [Frontend Mobile](https://auditerra-technical-documentation.vercel.app/frontend-mobile/overview) | PWA and offline-first |
| [Security](https://auditerra-technical-documentation.vercel.app/security/overview) | Authentication and authorization |
| [AI Module](https://auditerra-technical-documentation.vercel.app/ai/overview) | Gemini integration and RAG |
| [Deployment](https://auditerra-technical-documentation.vercel.app/deployment/overview) | Heroku and Vercel setup |
| [Developer Guide](https://auditerra-technical-documentation.vercel.app/dev_guide/overview) | Contributing and code standards |

---

## License

Copyright © 2026 Auditerra Team

---

## Built For

Kenya's land restoration and the global climate action community.

---

*Built for Kenya's farmers and the future of sustainable agriculture*
