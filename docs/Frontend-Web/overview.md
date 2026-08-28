# Frontend Web

## Introduction

The Auditerra frontend is a **Next.js** application built with **React**, **TypeScript**, and **Tailwind CSS**. It serves three distinct user interfaces:

1. **Expert PWA**: Offline-first progressive web app for field experts
2. **Supervisor Dashboard**: Administrative dashboard for program oversight
3. **Authentication Pages**: Login, signup, password reset flows

The frontend is designed to operate in low-bandwidth environments, with the Expert PWA functioning completely offline. The codebase follows Next.js App Router conventions with route groups for role-based separation.

---

## Technology Stack

| Category             | Technology                    | Purpose                         |
| -------------------- | ----------------------------- | ------------------------------- |
| **Hosting**          | Vercel                        | Production deployment           |
| **Framework**        | Next.js 15                    | React framework with App Router |
| **Language**         | TypeScript                    | Type safety                     |
| **Styling**          | Tailwind CSS                  | Utility-first CSS               |
| **State Management** | React Context + Local Storage | Client-state tracking           |
| **Animations**       | Framer Motion                 | Page animations                 |
| **Maps**             | Leaflet                       | Interactive maps                |
| **Offline**          | IndexedDB + Service Workers   | Offline data persistence        |
| **Auth**             | JWT (localStorage + cookies)  | Authentication                  |
| **Kenya Locations**  | `kenya-locations`             | County/sub-county/ward data     |
| **HTTP Client**      | Native `fetch`                | API communication               |

---

## Prerequisites

| Tool    | Version | Purpose            |
| ------- | ------- | ------------------ |
| Node.js | 18.17+  | JavaScript runtime |
| npm     | 9.0+    | Package manager    |
| Git     | Latest  | Version control    |

---

## Setup and Installation

### Clone and Install

```bash
git clone https://github.com/your-org/auditerra.git
cd auditerra/frontend
npm install
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://auditerra-6a019ce5a862.herokuapp.com/api/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
```

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
scisync_dashboard/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (expert)/                # Expert PWA routes
│   │   ├── home/
│   │   ├── tickets/
│   │   └── profile/
│   ├── (supervisor)/            # Supervisor routes
│   │   ├── dashboard/
│   │   ├── matches/
│   │   └── reports/
│   ├── api/                     # API proxies
│   │   ├── logs/
│   │   └── locations/
│   └── layout.tsx
├── components/
│   ├── expert/
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   └── TicketCard.tsx
│   ├── supervisor/
│   │   ├── AnimatedStatCard.tsx
│   │   ├── RegionMap.tsx
│   │   └── TopNav.tsx
│   └── shared/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── LoadingScreen.tsx
├── lib/
│   ├── api/                     # API client
│   ├── db/                      # IndexedDB
│   └── hooks/
├── public/                      # Static assets
├── middleware.ts
└── package.json
```

---

## Coding Standards

### Naming Conventions

| Element    | Convention                  | Example              |
| ---------- | --------------------------- | -------------------- |
| Components | PascalCase                  | `TicketCard.tsx`     |
| Pages      | kebab-case                  | `forgot-password/`   |
| Functions  | camelCase                   | `getUserProfile()`   |
| Constants  | UPPER_SNAKE_CASE            | `MAX_RETRY_ATTEMPTS` |
| Hooks      | camelCase with `use` prefix | `useOfflineSync`     |

### Component Structure

A component defines props, manages state, and returns JSX.

```typescript
"use client";
import { useState } from "react";
import { apiGet } from "@/lib/api";

interface Props { ticketId: string }
export default function Component({ ticketId }: Props) {
  const [data, setData] = useState<Ticket | null>(null);
  return <div>{/* JSX */}</div>;
}
```

### Import Order

Group imports by source: React, third-party libraries, local code, then types.

```typescript
import { useState } from "react"; // React/Next.js
import { motion } from "framer-motion"; // Third-party
import { apiGet } from "@/lib/api"; // Local
import type { Ticket } from "@/types"; // Types
```

### Commit Message Format

Use Conventional Commits format.

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Role-Based Routing

### Route Groups

| Route Group    | URL Prefix               | Role Access                |
| -------------- | ------------------------ | -------------------------- |
| `(auth)`       | `/login`, `/signup`      | Public                     |
| `(expert)`     | `/home`, `/tickets`      | `field_expert`             |
| `(supervisor)` | `/dashboard`, `/matches` | `institutional_supervisor` |

### Middleware Protection

The middleware intercepts all requests, validates authentication, and enforces role-based access.

```typescript
const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password"];
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auditerra_token")?.value;
  const role = request.cookies.get("auditerra_role")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  if (role === "supervisor" && pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}
```

---

## Authentication Flow

### Auth Helpers

Manage token storage and authentication state.

```typescript
export function saveSession(token: string) {
  localStorage.setItem("auditerra_token", token);
  setCookie("auditerra_token", token);
  return decodeToken(token);
}
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("auditerra_token");
  return !!token && !isTokenExpired(token);
}
export function logout() {
  localStorage.removeItem("auditerra_token");
  deleteCookie("auditerra_token");
  window.location.href = "/login";
}
```

### Token Payload

JWT payload contains user ID, role, and expiration.

```typescript
interface TokenPayload {
  sub: string;
  role: "farmer" | "field_expert" | "institutional_supervisor";
  exp: number;
}
```

---

## API Integration

### API Client

The API client handles all HTTP requests with automatic authentication headers.

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
function getAuthHeaders() {
  const token = localStorage.getItem("auditerra_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: getAuthHeaders() });
  return res.ok ? res.json() : null;
}
export async function apiPost(path: string, body: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

### API Proxies

Next.js API routes proxy requests to the backend to handle CORS.

```typescript
export async function POST(request: NextRequest) {
  const res = await fetch(`${API_URL}/logs/`, {
    method: "POST",
    headers: { Authorization: request.headers.get("authorization") || "" },
    body: request.body,
  });
  return new NextResponse(res.body, { status: res.status });
}
```

---

## Expert PWA

### Overview

The Expert PWA enables field experts to view assigned tickets, complete soil diagnostic forms offline, and track ticket history.

### Expert Home Page

The home page displays pending tickets assigned to the expert.

```typescript
export default function HomePage() {
  const [staffName, setStaffName] = useState("Expert");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  useEffect(() => {
    const staffId = localStorage.getItem("staff_id");
    if (staffId) getMyTickets(staffId).then(setTickets);
  }, []);
  return <div><Header /><h1>Hello {staffName}!</h1>{tickets.map(t => <TicketCard key={t.id} ticket={t} />)}</div>;
}
```

### Ticket Status Display

| Status       | Color |
| ------------ | ----- |
| `pending`    | Amber |
| `dispatched` | Blue  |
| `resolved`   | Green |
| `cancelled`  | Red   |

---

## Supervisor Dashboard

### Overview

The Supervisor Dashboard provides real-time metrics including hectares restored, active sites, expert count, interactive map, charts, data tables, and CSV export.

### AnimatedStatCard

The stat card animates numbers counting up to their final value.

```typescript
function CountUpNumber({ value }: { value: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => Math.min(prev + Math.ceil(value / 50), value)), 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{current}</>;
}
```

---

## Offline-First Architecture

### IndexedDB Init

Initialize the IndexedDB database and create the object store.

```typescript
const DB_NAME = "ScisyncOfflineDB";
const STORE_NAME = "soil_forms";
export const initDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 3);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME))
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
```

### Save Form Locally

Save diagnostic form data to IndexedDB with sync status pending.

```typescript
export const saveSoilFormLocally = async (form: any) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction(STORE_NAME, "readwrite")
      .objectStore(STORE_NAME)
      .add({ ...form, isSynced: 0 });
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
};
```

### Offline Sync Hook

Automatically sync pending forms when connectivity is restored.

```typescript
export function useOfflineSync() {
  useEffect(() => {
    const handleSync = async () => {
      if (!navigator.onLine) return;
      const unsynced = await getUnsyncedForms();
      for (const item of unsynced) {
        try {
          await fetch("/api/logs", {
            method: "POST",
            body: JSON.stringify({
              ticket_id: item.ticketId,
              soil_ph: item.soilPh,
            }),
          });
          await markFormAsSynced(item.id!);
        } catch (e) {
          break;
        }
      }
    };
    window.addEventListener("online", handleSync);
    return () => window.removeEventListener("online", handleSync);
  }, []);
}
```

---

## PWA Configuration

### Service Worker

Cache static assets for offline access.

```javascript
const CACHE_NAME = "auditerra-v1";
const STATIC_ASSETS = ["/", "/home", "/offline", "/manifest.json"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
```

---

## Styling

### Design Tokens

| Token        | Value     | Usage            |
| ------------ | --------- | ---------------- |
| Primary      | `#4CAF50` | Buttons, accents |
| Primary Dark | `#2E7D32` | Hover states     |
| Background   | `#f9fafb` | Page backgrounds |
| Surface      | `#ffffff` | Cards, modals    |
| Text Primary | `#111827` | Headings         |

---

## Error Handling

### API Error Extraction

Extract meaningful error messages from API responses.

```typescript
function extractErrorMessage(data: any): string {
  if (Array.isArray(data.detail))
    return data.detail.map((e) => e.msg).join(". ");
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  return "Request failed";
}
```

### Error Boundary

Catch JavaScript errors in the component tree.

```typescript
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div className="p-6 text-center">Something went wrong</div>;
    return this.props.children;
  }
}
```

---

## QA Documentation

### Cypress E2E Test

Test authentication flow.

```typescript
describe("Authentication Flow", () => {
  it("should login successfully", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type("supervisor@auditerra.ke");
    cy.get('input[name="password"]').type("SecurePassword123!");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");
  });
});
```

### Playwright E2E Test

Test offline form caching.

```typescript
test("Expert PWA should cache forms offline", async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto("/forms");
  await page.fill('input[name="soil_ph"]', "6.5");
  await page.click('button[type="submit"]');
  await expect(page.locator(".offline-success")).toBeVisible();
});
```

### Jest Unit Test

Test button component rendering.

```typescript
test("Button renders with primary variant", () => {
  render(<Button variant="primary">Click me</Button>);
  expect(screen.getByText("Click me")).toHaveClass("bg-green-600");
});
```

### Run Tests

```bash
npm run cypress:open
npm run cypress:run
npm run test
```

### QA Artifacts

- [QA Test Case Workbook](https://docs.google.com/spreadsheets/d/1bK2iyq5l6N8bls8oYktTzzb6w99F-GAN/edit?gid=25033287#gid=25033287)
- [Cypress Tests](https://github.com/akirachix/Scisync_Informational_Website/tree/feature/add-cypress-automation)
- [Playwright Tests](https://github.com/akirachix/Scisync_Dashboard)

---

## Deployment

### Vercel Configuration

Configure Vercel deployment settings.

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://auditerra-6a019ce5a862.herokuapp.com/api/v1"
  }
}
```

### Deployment Commands

```bash
vercel --prod
vercel
vercel logs
```
