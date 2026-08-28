# Overview

## What is Auditerra?

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

## Core Concepts

### Offline-First Design

Field experts often work in areas with unreliable or no internet connectivity. The system is designed to function offline, storing data locally in IndexedDB and synchronizing automatically when connectivity is restored. This ensures that work continues uninterrupted regardless of network conditions.

### Human-Verified Data

Unlike satellite-based monitoring, Auditerra relies on on-the-ground verification. Every data point is collected by a trained expert who physically visits the farm. The security handshake system ensures that experts are actually present at the reported location, preventing fraud.

### Audit-Ready Workflow

All actions in the system are tracked and auditable. The 60-day audit loop enforces re-testing to measure biological survival rather than just planting speed. This creates a verifiable impact record that can be presented to funders and stakeholders.

### Role-Based Access

The system serves three distinct user personas with different needs and permissions:

- **Farmers** report issues via USSD
- **Experts** collect diagnostic data and receive assignments
- **Supervisors** monitor progress and manage operations

Each role has specific access controls and interfaces tailored to their workflow.

---

## Quick Links

- [Architecture](/architecture/overview) : System design and components
- [Backend API](/api/overview) : Explore the endpoints
- [Deployment](/deployment/overview): Production setup

---
