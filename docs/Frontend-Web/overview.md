# Frontend Web

## Introduction

The Auditerra frontend is a **Next.js** application built with **React**, **TypeScript**, and **Tailwind CSS**. It serves three distinct user interfaces:

1. **Expert PWA** : Offline-first progressive web app for field experts
2. **Supervisor Dashboard** : Administrative dashboard for program oversight
3. **Authentication Pages** : Login, signup, password reset flows

---

## Technology Stack

| Category             | Technology                    | Purpose                                    |
| :------------------- | :---------------------------- | :----------------------------------------- |
| **Hosting**          | Vercel                        | Production deployment and hosting platform |
| **Framework**        | Next.js 15                    | React framework with App Router            |
| **Language**         | TypeScript                    | Type safety                                |
| **Styling**          | Tailwind CSS                  | Utility-first CSS                          |
| **State Management** | React Context + Local Storage | Global client-state hydration and tracking |
| **Animations**       | Framer Motion                 | Page and component animations              |
| **Icons**            | Lucide React                  | Icon library                               |
| **Maps**             | Leaflet (dynamic import)      | Interactive maps for supervisors           |
| **Offline**          | IndexedDB + Service Workers   | Offline data persistence and caching       |
| **Auth**             | JWT (localStorage + cookies)  | Authentication                             |
| **Kenya Locations**  | `kenya-locations`             | County/sub-county/ward data                |
| **HTTP Client**      | Native `fetch`                | API communication                          |

---

## Project Structure

```
scisync_dashboard/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Authentication routes (group)
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── forgot-password/     # Forgot password
│   │   └── reset-password/      # Reset password
│   ├── (expert)/                # Expert PWA routes (group)
│   │   ├── home/                # Expert home (pending tickets)
│   │   ├── tickets/             # Ticket management
│   │   ├── profile/             # Expert profile
│   │   └── forms/               # Diagnostic forms
│   ├── (supervisor)/            # Supervisor routes (group)
│   │   ├── dashboard/           # Supervisor dashboard
│   │   ├── matches/             # Farmer-expert matches
│   │   └── reports/
│   │       └── [id]/            # Individual report view
│   ├── api/                     # Next.js API routes (proxy)
│   │   ├── logs/                # POST proxy for logs
│   │   └── locations/           # POST proxy for locations
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── favicon.ico              # Favicon
│
├── components/                  # Reusable components
│   ├── expert/                  # Expert-specific components
│   │   ├── BottomNav.tsx        # Bottom navigation bar
│   │   ├── Header.tsx           # Expert header
│   │   ├── OfflineBanner.tsx    # Offline mode indicator
│   │   └── TicketCard.tsx       # Ticket display card
│   ├── supervisor/              # Supervisor-specific components
│   │   ├── AnimatedStatCard.tsx # Animated stat card
│   │   ├── DashboardCharts.tsx  # Charts for dashboard
│   │   ├── RegionMap.tsx        # Interactive map (Leaflet)
│   │   └── TopNav.tsx           # Supervisor top navigation
│   ├── shared/                  # Shared components
│   │   ├── Button.tsx           # Reusable button
│   │   ├── Input.tsx            # Reusable input
│   │   ├── LoadingScreen.tsx    # Loading overlay
│   │   ├── MapEmbed.tsx         # Map embed
│   │   ├── ServiceWorkerRegister.tsx  # SW registration
│   │   └── Sidebar.tsx          # Sidebar navigation
│   └── providers/
│       └── ClientSyncProvider.tsx  # Offline sync provider
│
├── lib/                         # Utilities and services
│   ├── api/                     # API client
│   │   ├── api.ts               # Core fetch functions
│   │   ├── auth.ts              # Authentication helpers
│   │   ├── farmers.ts           # Farmer API calls
│   │   ├── locations.ts         # Location API calls
│   │   ├── logs.ts              # Diagnostic log API
│   │   ├── recommendations.ts   # AI recommendation API
│   │   ├── staff.ts             # Staff API calls
│   │   └── tickets.ts           # Ticket API calls
│   ├── db/
│   │   └── indexedDB.ts         # Offline database operations
│   └── utils.ts                 # Utility functions
│
├── public/                      # Static assets
│   ├── images/                  # Images
│   ├── kenya-region.json        # Kenya region data
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker
│
├── types/
│   └── index.ts                 # Shared type definitions
│
├── middleware.ts                # Next.js middleware (auth/roles)
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript configuration
```

---

## Role-Based Routing

### Route Groups

| Route Group    | URL Prefix                                                 | Role Access                | Description          |
| -------------- | ---------------------------------------------------------- | -------------------------- | -------------------- |
| `(auth)`       | `/login`, `/signup`, `/forgot-password`, `/reset-password` | Public                     | Authentication pages |
| `(expert)`     | `/home`, `/tickets`, `/profile`, `/forms`                  | `field_expert`             | Expert PWA           |
| `(supervisor)` | `/dashboard`, `/matches`, `/reports`                       | `institutional_supervisor` | Supervisor dashboard |

### Middleware Protection

```typescript
// middleware.ts
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// Role-based redirection:
- Authenticated users on public paths → redirected based on their role
- Unauthenticated users on protected paths → redirected to login
- Supervisor accessing /home → redirected to /dashboard
- Expert accessing /dashboard → redirected to /home
```

### Route Redirects

| Current Path             | Role       | Redirects To |
| ------------------------ | ---------- | ------------ |
| `/login` (authenticated) | Supervisor | `/dashboard` |
| `/login` (authenticated) | Expert     | `/home`      |
| `/home`                  | Supervisor | `/dashboard` |
| `/dashboard`             | Expert     | `/home`      |

---

## Authentication Flow

The authentication process is broken down into a clear sequence of steps, ensuring that the user is directed to the correct interface based on their role.

1. The user visits the `/login` page.
2. They enter their credentials (email and password).
3. The system validates the credentials.
4. If valid, a JWT is issued.
5. The JWT is stored in `localStorage` and `cookies`.
6. The system checks the user role from the token.
7. If the role is `institutional_supervisor`, the user is redirected to `/dashboard`.
8. If the role is `field_expert`, the user is redirected to `/home`.
9. If validation fails, an error message is displayed to the user.

### Token Storage

| Storage          | Purpose                                 |
| ---------------- | --------------------------------------- |
| `localStorage`   | Token persistence across page refreshes |
| `cookies`        | Server-side authentication (middleware) |
| `sessionStorage` | Temporary data (submitted tickets)      |

### Auth Helpers (`lib/api/auth.ts`)

| Function             | Description                                |
| -------------------- | ------------------------------------------ |
| `saveSession(token)` | Store token, decode payload, save user ID  |
| `getToken()`         | Retrieve token from localStorage           |
| `clearSession()`     | Remove token from localStorage and cookies |
| `isAuthenticated()`  | Check if token exists and is not expired   |
| `isTokenExpired()`   | Check token expiration                     |
| `decodeToken(token)` | Decode JWT payload                         |
| `logout()`           | Clear session and redirect to login        |

### Token Payload

```typescript
interface TokenPayload {
  sub: string; // User ID (UUID)
  role: "farmer" | "field_expert" | "institutional_supervisor";
  exp: number; // Expiration timestamp
}
```

---

## API Integration

### API Client (`lib/api/api.ts`)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Core functions:
- apiPost(path, body) - POST requests with auth
- apiGet(path) - GET requests with auth
- fetchJson(url) - Generic fetch with error handling
```

### API Service Files

| File                 | Endpoints Called   | Description            |
| -------------------- | ------------------ | ---------------------- |
| `farmers.ts`         | `/farmers/`        | Farmer CRUD operations |
| `locations.ts`       | `/locations/`      | Location management    |
| `logs.ts`            | `/logs/`           | Diagnostic logs        |
| `recommendations.ts` | `/recommendation/` | AI recommendations     |
| `staff.ts`           | `/staff/`          | Staff management       |
| `tickets.ts`         | `/ticket/`         | Ticket management      |

### API Proxies (Next.js API Routes)

Next.js API routes proxy requests to the backend to handle CORS and authentication:

| Route            | Backend Target         | Purpose               |
| ---------------- | ---------------------- | --------------------- |
| `/api/logs`      | `{API_URL}/logs/`      | Create diagnostic log |
| `/api/locations` | `{API_URL}/locations/` | Create location       |

### Environment Variables

```
# Required
NEXT_PUBLIC_API_URL= your_deployed_api_key

# Optional
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

---

## Expert PWA

### Overview

The Expert PWA is an **offline-first** application that allows field experts to:

1. View assigned tickets
2. Complete soil diagnostic forms offline
3. Sync data automatically when connectivity returns
4. Track ticket history

The interface is optimized for use in remote areas with minimal connectivity, ensuring that field operations can continue without interruption.

### Expert Pages

| Page        | Path       | Description                                     |
| ----------- | ---------- | ----------------------------------------------- |
| **Home**    | `/home`    | Displays pending tickets assigned to the expert |
| **Tickets** | `/tickets` | Full ticket list with pending/history tabs      |
| **Profile** | `/profile` | Expert profile with logout                      |
| **Forms**   | `/forms`   | Diagnostic form for submitting soil data        |

### Expert Components

| Component           | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `Header.tsx`        | Top header with app name and navigation                   |
| `BottomNav.tsx`     | Bottom navigation bar (Home, Tickets, Profile, Forms)     |
| `TicketCard.tsx`    | Card displaying ticket details (farmer, category, status) |
| `OfflineBanner.tsx` | Banner shown when offline                                 |

### Ticket Status Display

| Status       | Badge Color | Description                   |
| ------------ | ----------- | ----------------------------- |
| `pending`    | Amber       | Waiting for expert assignment |
| `dispatched` | Blue        | Assigned to expert            |
| `resolved`   | Green       | Completed                     |
| `cancelled`  | Red         | Cancelled                     |

### Ticket Submissions Tracking

```typescript
// Submitted tickets are tracked in sessionStorage
function getSubmittedTicketIds(): string[] {
  const raw = sessionStorage.getItem("auditerra_submitted_tickets");
  return raw ? JSON.parse(raw) : [];
}
```

---

## Supervisor Dashboard

### Overview

The Supervisor Dashboard provides:

1. **Real-time metrics** : Hectares restored, active sites, expert count
2. **Interactive map** : Location visualization with Leaflet
3. **Charts** : Restoration progress visualization
4. **Data table** : Regional restoration matrix
5. **CSV export** : Data export for reporting

This interface is designed to give supervisors a bird's-eye view of all restoration efforts, making it easy to spot trends, identify underperforming regions, and generate reports for stakeholders.

### Supervisor Pages

| Page          | Path            | Description                            |
| ------------- | --------------- | -------------------------------------- |
| **Dashboard** | `/dashboard`    | Main dashboard with stats, map, charts |
| **Matches**   | `/matches`      | Farmer-expert match matrix             |
| **Reports**   | `/reports/[id]` | Individual report view                 |

### Dashboard Components

| Component              | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `TopNav.tsx`           | Top navigation with title                      |
| `AnimatedStatCard.tsx` | Animated stat card (count up animation)        |
| `RegionMap.tsx`        | Interactive Leaflet map with restoration sites |
| `DashboardCharts.tsx`  | Charts for restoration metrics                 |

### Dashboard Metrics

| Metric               | Source                                  | Description                     |
| -------------------- | --------------------------------------- | ------------------------------- |
| Hectares Restored    | `locations` filtered by restored status | Total restored land area        |
| Active Monitor Nodes | `locations` total count                 | Number of monitored sites       |
| Active Field Experts | `staff/field-experts`                   | Number of deployed experts      |
| Restored Ratio       | `locations` restored / total            | Percentage of restored sites    |
| In-Progress Ratio    | `locations` in-progress / total         | Percentage of in-progress sites |

### Dashboard Features

| Feature             | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| **Interactive Map** | Leaflet map with restored (rose) and in-progress (amber) markers |
| **Animated Stats**  | Count-up animations on stat cards                                |
| **CSV Export**      | Export regional restoration data                                 |
| **Filtering**       | Click on metrics to filter map data                              |
| **Real-time Data**  | Fetches latest data from API                                     |

### Data Fetching

```typescript
// Dashboard data sources:
// - /locations/          → Site locations and status
// - /staff/field-experts → Expert deployment data
```

---

## Offline-First Architecture

### IndexedDB Schema

```typescript
interface OfflineSoilForm {
  id?: number; // Auto-increment
  ticketId: string; // Associated ticket
  staffId: string | null; // Expert ID
  farmerName: string; // Farmer name
  soilPh: number; // Soil pH
  nitrogenPpm: number; // Nitrogen
  phosphorusPpm: number; // Phosphorus
  potassiumPpm: number; // Potassium
  locationId?: string; // Location reference
  soilImages?: string; // Image data
  isSynced: number; // 0 = pending, 1 = synced
  createdAt: number; // Timestamp
}
```

### IndexedDB Operations

| Function                | Purpose                              |
| ----------------------- | ------------------------------------ |
| `initDB()`              | Initialize database and object store |
| `saveSoilFormLocally()` | Save diagnostic form offline         |
| `getUnsyncedForms()`    | Retrieve all unsynced forms          |
| `markFormAsSynced(id)`  | Mark form as synced                  |

### Offline Sync Flow

1. **Form Submission**: The expert fills out a diagnostic form and submits it. The data is saved to IndexedDB locally.
2. **Sync Check**: The system periodically checks if the device is online.
3. **Sync Process**: When the device comes online, the background sync triggers a POST request to `/api/logs`.
4. **Confirmation**: On success, the form is marked as synced. If a validation error occurs (e.g., 422), the invalid item is deleted from local storage.

```typescript
// useOfflineSync.ts
export function useOfflineSync() {
  useEffect(() => {
    const handleSync = async () => {
      if (!navigator.onLine) return;

      const unsyncedItems = await getUnsyncedForms();
      for (const item of unsyncedItems) {
        // POST to /api/logs
        // On success: markFormAsSynced(item.id)
        // On 422: delete invalid item
      }
    };

    window.addEventListener("online", handleSync);
    return () => window.removeEventListener("online", handleSync);
  }, []);
}
```

### Offline Indicators

| Component               | Purpose            |
| ----------------------- | ------------------ |
| `OfflineBanner.tsx`     | Shows when offline |
| `Online/Offline` events | Triggers sync      |

---

## PWA Configuration

### Manifest (`public/manifest.json`)

```json
{
  "name": "Auditerra",
  "short_name": "Auditerra",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50"
}
```

### Service Worker (`public/sw.js`)

- Caches static assets
- Enables offline functionality
- Handles background sync

### Registration (`ServiceWorkerRegister.tsx`)

Registers service worker for:

- Offline support
- Caching
- Background sync

---

## Authentication Pages

### Login (`/login`)

- Email/password form
- Redirects based on role
- Token stored in localStorage + cookies

### Signup (`/signup`)

- Multi-step form with:
  - Personal information (name, email, phone)
  - Location selection (county, sub-county, ward) via `kenya-locations`
  - Role selection (field_expert, institutional_supervisor)
  - Role-specific fields (institution_name, expertise_area, supervisor_name)
  - Password with strength validation

### Forgot Password (`/forgot-password`)

- Email input
- Generates reset token
- Displays reset URL (copies to clipboard)

### Reset Password (`/reset-password`)

- Token from URL
- New password confirmation

---

## Shared Components

| Component           | Purpose                       |
| ------------------- | ----------------------------- |
| `Button.tsx`        | Reusable button with variants |
| `Input.tsx`         | Reusable input with label     |
| `LoadingScreen.tsx` | Full-screen loading overlay   |
| `Sidebar.tsx`       | Sidebar navigation            |
| `MapEmbed.tsx`      | Embedded map component        |

---

## Styling

### Tailwind CSS Configuration

```javascript
// tailwind.config.ts
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          600: "#4CAF50",
          700: "#2E7D32",
        },
      },
    },
  },
};
```

### Design Tokens

| Token          | Value     | Usage                  |
| -------------- | --------- | ---------------------- |
| Primary        | `#4CAF50` | Green buttons, accents |
| Primary Dark   | `#2E7D32` | Hover states           |
| Background     | `#f9fafb` | Page backgrounds       |
| Surface        | `#ffffff` | Cards, modals          |
| Text Primary   | `#111827` | Headings               |
| Text Secondary | `#6b7280` | Body text              |

---

## Animations

### Framer Motion

| Animation           | Purpose                      |
| ------------------- | ---------------------------- |
| `containerVariants` | Staggered children animation |
| `itemVariants`      | Individual item animation    |
| `cardHover`         | Card hover effects           |
| `CountUpNumber`     | Number count-up animation    |
| `AnimatePresence`   | Exit animations              |

### Animation Examples

```typescript
// Dashboard stats use CountUpNumber
<CountUpNumber value={apiSites.length} />

// Cards use Framer Motion
<motion.div
  variants={itemVariants}
  whileHover="hover"
  initial="rest"
  animate="rest"
>
```

---

## Charts

### DashboardCharts Component

- Displays restoration metrics
- Uses embedded charts (implementation not fully shown)

---

## Error Handling

### API Error Handling

```typescript
function extractErrorMessage(data, status): string {
  if (Array.isArray(data.detail)) {
    return data.detail.map((err) => err.msg).join(". ");
  }
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  return `Request failed (HTTP ${status})`;
}
```

### UI Error States

| Component | Error Display              |
| --------- | -------------------------- |
| Login     | Inline error message       |
| Signup    | Validation error list      |
| Dashboard | Full-page error with retry |
| Forms     | Inline validation errors   |

---

# QA Documentation

The Auditerra platform employs a comprehensive quality assurance strategy covering both automated frameworks and manual verification processes. Below is the complete repository of testing artifacts and documentation.

## Automated Testing Frameworks

| Framework      | Scope                     | Documentation Location       |
| :------------- | :------------------------ | :--------------------------- |
| **Cypress**    | Frontend E2E Flows        | Frontend Cypress Test Suite  |
| **Playwright** | Cross-Browser E2E Testing | Playwright E2E Test Coverage |
| **Jtest**      | Unit testing              | Unit testing suites          |

## Manual QA Test Cases & Matrices

For detailed scripted testing of specific user flows, edge cases, and business logic, the following comprehensive test matrices and spreadsheets are maintained:

| Test Area                                  | Documentation / Spreadsheet     | Key Coverage Areas                                                                                                                |
| :----------------------------------------- | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Farmer Profile Creation (USSD)**         | USSD Profile Creation Tests     | Step-by-step USSD prompts, national ID validation, phone normalization, county/sub-county selection, landmark length constraints. |
| **Farmer Booking & Issue Reporting Flow**  | Booking & Issue Reporting Tests | Booking cancellations, date rescheduling, network drop recovery, boundary error handling.                                         |
| **Expert Profile & Soil Baseline Logging** | Expert Baseline Logging Tests   | Input validation for pH/NPK, blank field blockades, success marker rendering, boundary limit checks.                              |
| **AI Recommendation & SMS Delivery**       | AI & SMS Delivery Tests         | AI output schema validation, SMS content safety checks, delivery status tracking, retry mechanisms.                               |
| **Backend API Integration**                | Auditerra Postman Collection    | Full CRUD operations for Users, Farmers, Tickets, Locations, Logs, and Recommendations, plus authentication flows.                |
| **System Security & Penetration**          | Security Test Cases             | Malicious input rejection, unauthorized access blocks, data leak prevention, injection attack prevention.                         |

## Test Logs & Evidence

For detailed step-by-step test executions and evidence records, refer to the following documents:

[**View the QA Test Case Workbook**](https://docs.google.com/spreadsheets/d/1bK2iyq5l6N8bls8oYktTzzb6w99F-GAN/edit?gid=25033287#gid=25033287)

[**View the Informational Website TDD Test**](https://github.com/akirachix/Scisync_Informational_Website/tree/feature/add-cypress-automation)

[**View the Dashboard Playwright Tests**](https://github.com/akirachix/Scisync_Dashboard)

---
