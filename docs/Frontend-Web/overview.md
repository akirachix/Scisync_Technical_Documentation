# Frontend Web

## Introduction

The Auditerra frontend is a **Next.js** application built with **React**, **TypeScript**, and **Tailwind CSS**. It serves three distinct user interfaces:

1. **Expert PWA**: Offline-first progressive web app for field experts
2. **Supervisor Dashboard**: Administrative dashboard for program oversight
3. **Authentication Pages**: Login, signup, password reset flows

The frontend is designed to operate in low-bandwidth environments, with the Expert PWA functioning completely offline. The codebase follows Next.js App Router conventions with route groups for role-based separation. All three interfaces share a common design system and authentication layer while maintaining distinct functionality optimized for each user persona.

The application is built with a mobile-first approach, recognizing that field experts primarily use smartphones in remote areas with unreliable connectivity. The Supervisor Dashboard is optimized for desktop use, providing data-rich views for program oversight. The authentication layer is designed to be secure and user-friendly, supporting both email/password login and password recovery flows.

---

## Technology Stack

| Category             | Technology                    | Purpose                                    |
| -------------------- | ----------------------------- | ------------------------------------------ |
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

### Technology Justification

Each technology was selected to address specific requirements of the Auditerra platform. Next.js provides server-side rendering capabilities and a robust routing system that simplifies the implementation of role-based access control. TypeScript ensures type safety across the codebase, reducing runtime errors and improving developer productivity. Tailwind CSS enables rapid UI development with consistent styling. Framer Motion provides smooth animations that enhance the user experience without compromising performance. The native `fetch` API is used for HTTP requests to minimize external dependencies and keep the bundle size small.

### Additional Development Tools

| Tool                | Purpose                             |
| ------------------- | ----------------------------------- |
| **ESLint**          | Code quality and style enforcement  |
| **Prettier**        | Automatic code formatting           |
| **Husky**           | Git hooks for pre-commit validation |
| **lint-staged**     | Run linters on staged files         |
| **Playwright**      | Cross-browser E2E testing           |
| **Cypress**         | Frontend E2E testing                |
| **Jest**            | Unit testing                        |
| **Testing Library** | React component testing             |

---

## Prerequisites

Before setting up the frontend, ensure the following are installed on your system:

| Tool    | Version | Purpose            |
| ------- | ------- | ------------------ |
| Node.js | 18.17+  | JavaScript runtime |
| npm     | 9.0+    | Package manager    |
| Git     | Latest  | Version control    |

### Install Node.js on Linux

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### Install Node.js on macOS

```bash
brew install node
node --version
npm --version
```

## View our dashboard

> [See our deployed dashboard](https://auditerra-34jr92d78-najmahares-projects.vercel.app/login)

### Install Node.js on Windows

Download and run the installer from [nodejs.org](https://nodejs.org/).

---

## Setup and Installation

### Clone the Repository

```bash
git clone https://github.com/your-org/auditerra.git
cd auditerra/frontend
```

### Install Dependencies

```bash
npm install
```

This installs all required dependencies including Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, and Leaflet. The installation process may take several minutes depending on your internet connection speed.

### Package.json Scripts

The `package.json` file includes several scripts for development, testing, and deployment:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "preview": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "test": "jest",
    "test:ci": "jest --ci --coverage",
    "test:watch": "jest --watch",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "playwright:test": "playwright test",
    "prepare": "husky install"
  }
}
```

### Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory. The most important variable is `NEXT_PUBLIC_API_URL`, which points to the backend API. This variable is required for the application to function. The remaining variables are optional and enable specific features.

```env
# Required - The backend API URL
NEXT_PUBLIC_API_URL=https://auditerra-6a019ce5a862.herokuapp.com/api/v1

# Optional - For authentication
NEXTAUTH_SECRET=your-secret-key

# Optional - For Google Maps integration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Optional - Map default settings
NEXT_PUBLIC_MAP_DEFAULT_CENTER=-1.286389,36.817223
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=7

# Optional - Feature flags
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_USSD_SIMULATOR=true
```

### Environment Variable Types

| Variable                            | Type     | Description                        |
| ----------------------------------- | -------- | ---------------------------------- |
| `NEXT_PUBLIC_API_URL`               | Required | Backend API base URL               |
| `NEXTAUTH_SECRET`                   | Optional | Authentication secret for NextAuth |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`   | Optional | Google Maps API key                |
| `NEXT_PUBLIC_MAP_DEFAULT_CENTER`    | Optional | Default map center coordinates     |
| `NEXT_PUBLIC_MAP_DEFAULT_ZOOM`      | Optional | Default map zoom level             |
| `NEXT_PUBLIC_ENABLE_OFFLINE_MODE`   | Optional | Enable offline functionality       |
| `NEXT_PUBLIC_ENABLE_USSD_SIMULATOR` | Optional | Enable USSD simulator              |

### Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`. The development server supports hot reloading, so changes to the code will be reflected immediately. The server also provides detailed error messages and debugging information to aid development.

### Build for Production

```bash
npm run build
```

The build process compiles the application into optimized static and server-side rendered pages. The output is stored in the `.next` directory. The build process also runs TypeScript type checking and ESLint validation.

### Preview Production Build

```bash
npm run preview
```

This starts a production-like server that serves the built application. This is useful for testing the production build locally before deployment.

---

## Project Structure

The project follows Next.js App Router conventions with a clear separation of concerns. The `app/` directory contains all route definitions, with route groups for authentication, expert, and supervisor interfaces. The `components/` directory is organized by feature and user role, ensuring that shared components are easily identifiable and role-specific components are kept separate. The `lib/` directory contains all utilities, API clients, and database operations. Static assets are stored in `public/`.

### Complete Structure

```
scisync_dashboard/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Authentication routes (group)
│   │   ├── login/               # Login page
│   │   │   └── page.tsx         # Login page component
│   │   ├── signup/              # Signup page
│   │   │   └── page.tsx         # Signup page component
│   │   ├── forgot-password/     # Forgot password
│   │   │   └── page.tsx         # Forgot password component
│   │   └── reset-password/      # Reset password
│   │       └── page.tsx         # Reset password component
│   ├── (expert)/                # Expert PWA routes (group)
│   │   ├── home/                # Expert home (pending tickets)
│   │   │   └── page.tsx         # Home page component
│   │   ├── tickets/             # Ticket management
│   │   │   └── page.tsx         # Tickets page component
│   │   ├── profile/             # Expert profile
│   │   │   └── page.tsx         # Profile page component
│   │   └── forms/               # Diagnostic forms
│   │       └── page.tsx         # Forms page component
│   ├── (supervisor)/            # Supervisor routes (group)
│   │   ├── dashboard/           # Supervisor dashboard
│   │   │   └── page.tsx         # Dashboard page component
│   │   ├── matches/             # Farmer-expert matches
│   │   │   └── page.tsx         # Matches page component
│   │   └── reports/
│   │       └── [id]/            # Individual report view
│   │           └── page.tsx     # Report page component
│   ├── api/                     # Next.js API routes (proxy)
│   │   ├── logs/
│   │   │   └── route.ts         # POST proxy for logs
│   │   └── locations/
│   │       └── route.ts         # POST proxy for locations
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
│   │   ├── ServiceWorkerRegister.tsx # SW registration
│   │   └── Sidebar.tsx          # Sidebar navigation
│   └── providers/
│       └── ClientSyncProvider.tsx # Offline sync provider
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
│   ├── hooks/
│   │   ├── useGeolocation.ts    # Geolocation hook
│   │   └── useOfflineSync.ts    # Offline sync hook
│   └── utils.ts                 # Utility functions
│
├── public/                      # Static assets
│   ├── images/                  # Images
│   │   ├── home.jpg
│   │   ├── logo.png
│   │   └── signup_bg.webp
│   ├── kenya-region.json        # Kenya region data
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker
│
├── types/
│   └── index.ts                 # Shared type definitions
│
├── .env.local                   # Environment variables
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore file
├── .prettierrc                  # Prettier configuration
├── middleware.ts                # Next.js middleware (auth/roles)
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

---

## Coding Standards and Conventions

### Naming Conventions

The codebase follows consistent naming conventions to improve readability and maintainability. Components are named using PascalCase, which distinguishes them from regular functions and variables. Pages and routes use kebab-case for URL-friendliness. Functions and variables use camelCase, while constants use UPPER_SNAKE_CASE to make them easily identifiable. TypeScript interfaces and types use PascalCase, and custom React hooks are prefixed with "use" to follow React conventions.

| Element          | Convention                  | Example                                |
| ---------------- | --------------------------- | -------------------------------------- |
| Components       | PascalCase                  | `TicketCard.tsx`, `LoadingScreen.tsx`  |
| Pages            | kebab-case                  | `forgot-password/`, `reset-password/`  |
| Functions        | camelCase                   | `getUserProfile()`, `handleSubmit()`   |
| Variables        | camelCase                   | `userData`, `isLoading`                |
| Constants        | UPPER_SNAKE_CASE            | `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`   |
| Types/Interfaces | PascalCase                  | `UserProfile`, `TicketStatus`          |
| Hooks            | camelCase with `use` prefix | `useOfflineSync`, `useGeolocation`     |
| Files            | kebab-case or camelCase     | `ticket-card.tsx`, `useOfflineSync.ts` |
| Directories      | kebab-case                  | `components/expert/`, `lib/api/`       |

### File Organization

Components are organized by their primary user role. Expert components live in `components/expert/`, supervisor components in `components/supervisor/`, and shared components in `components/shared/`. Each component file exports a single component as the default export, with related styles or test files co-located when applicable.

### Directory Structure Guidelines

| Directory                | Purpose                        | When to Use                                    |
| ------------------------ | ------------------------------ | ---------------------------------------------- |
| `app/(auth)/`            | Authentication pages           | For login, signup, password reset flows        |
| `app/(expert)/`          | Expert PWA pages               | For all expert-facing interfaces               |
| `app/(supervisor)/`      | Supervisor dashboard pages     | For all supervisor-facing interfaces           |
| `components/expert/`     | Expert-specific components     | When a component is only used by experts       |
| `components/supervisor/` | Supervisor-specific components | When a component is only used by supervisors   |
| `components/shared/`     | Shared components              | When a component is used across multiple roles |
| `lib/api/`               | API client code                | For all API interaction logic                  |
| `lib/hooks/`             | Custom React hooks             | For reusable hook logic                        |
| `types/`                 | TypeScript types               | For shared type definitions                    |
| `public/`                | Static assets                  | For images, fonts, and other static files      |

### Component Structure

Components follow a consistent structure to make them predictable and easy to navigate. Each component starts with the `"use client"` directive when it uses client-side features. Imports are grouped by source: React and Next.js imports first, followed by third-party libraries, then local imports. Props are defined using a TypeScript interface, and the component is exported as the default export. State and effects are declared near the top of the component, followed by handlers, and finally the render logic.

```typescript
// Standard component structure
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiGet } from "@/lib/api";
import type { Ticket } from "@/types";

// Props interface
interface ComponentProps {
  ticketId: string;
  onStatusChange?: (status: string) => void;
  className?: string;
}

// Component definition
export default function ComponentName({
  ticketId,
  onStatusChange,
  className = "",
}: ComponentProps) {
  // State
  const [data, setData] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiGet(`/tickets/${ticketId}`);
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId]);

  // Handlers
  const handleClick = () => {
    if (onStatusChange && data) {
      onStatusChange(data.status);
    }
  };

  // Render
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data found</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleClick}
    >
      {/* Component JSX */}
    </motion.div>
  );
}
```

### Import Order

Imports are organized in a specific order to maintain clarity. React and Next.js imports come first, followed by third-party libraries, then local components, utilities, types, and finally styles. This ordering helps developers quickly understand the dependencies of a file.

```typescript
// ✅ Correct import order
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiPost } from "@/lib/api";
import { TicketCard } from "@/components/expert/TicketCard";
import type { Ticket } from "@/types";
import "./styles.css";
```

### TypeScript Best Practices

TypeScript is used strictly throughout the codebase. All props must have explicit types, and the `any` type is avoided except in rare cases where it is truly necessary. Functions have explicit return types to improve code clarity and catch type errors early. Strict null checks are enabled, so all potentially null or undefined values must be handled before use.

**Always define types for props:**

```typescript
// ✅ Good - Explicit props type
interface UserProfileProps {
  userId: string;
  onUpdate: (data: UserData) => void;
  className?: string;
}

const UserProfile = ({ userId, onUpdate, className }: UserProfileProps) => {
  // Component logic
};

// ❌ Avoid - Implicit any
const UserProfile = (props) => {
  // Component logic
};
```

**Use proper return types for functions:**

```typescript
// ✅ Good - Explicit return type
async function fetchUser(id: string): Promise<User> {
  const response = await apiGet(`/users/${id}`);
  return response.data;
}

// ✅ Good - Void return for event handlers
const handleSubmit = (event: React.FormEvent): void => {
  event.preventDefault();
  // Handler logic
};

// ❌ Avoid - Implicit return type
async function fetchUser(id: string) {
  return await apiGet(`/users/${id}`);
}
```

**Use strict null checks:**

```typescript
// ✅ Good - Null check
if (user && user.email) {
  console.log(user.email);
}

// ✅ Good - Optional chaining
console.log(user?.email ?? "No email");

// ❌ Avoid - Unsafe access
console.log(user.email); // Could be undefined
```

**Use discriminated unions for complex state:**

```typescript
// ✅ Good - Discriminated union for loading state
type LoadingState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: string };

const [state, setState] = useState<LoadingState>({ status: "idle" });

// ❌ Avoid - Multiple boolean flags
const [loading, setLoading] = useState(false);
const [data, setData] = useState<User | null>(null);
const [error, setError] = useState<string | null>(null);
```

### Component Best Practices

Components are kept focused on a single responsibility. A component should handle one specific task and delegate other concerns to child components or hooks. This makes components easier to test, maintain, and reuse. Props are destructured at the parameter level rather than accessed through a props object, which makes the component's dependencies more visible.

**Keep components focused and single-purpose:**

```typescript
// ✅ Good - Single responsibility
const UserProfile = ({ user }: { user: User }) => (
  <div className="profile">
    <h2>{user.name}</h2>
    <p>{user.email}</p>
    <p>Role: {user.role}</p>
  </div>
);

// ✅ Good - Separate component for tickets
const UserTickets = ({ tickets }: { tickets: Ticket[] }) => (
  <div className="tickets">
    {tickets.map(ticket => (
      <TicketCard key={ticket.id} ticket={ticket} />
    ))}
  </div>
);

// ❌ Avoid - Multiple responsibilities
const UserProfile = ({ user, tickets }) => (
  <div>
    <h2>{user.name}</h2>
    <p>{user.email}</p>
    <div>
      {tickets.map(ticket => (
        <div key={ticket.id}>{ticket.title}</div>
      ))}
    </div>
  </div>
);
```

**Use props destructuring:**

```typescript
// ✅ Good
function Component({ title, description, onAction }: Props) {
  return <div>{title}</div>;
}

// ❌ Avoid
function Component(props: Props) {
  return <div>{props.title}</div>;
}
```

**Use React.memo for expensive components:**

```typescript
// ✅ Good - Memoized component
const ExpensiveComponent = React.memo(({ data }: { data: Data }) => {
  // Expensive rendering logic
  return <div>{data}</div>;
});

// ✅ Good - With custom comparison
const ExpensiveComponent = React.memo(
  ({ data, onAction }: Props) => {
    // Component logic
  },
  (prev, next) => prev.data.id === next.data.id
);
```

### Linting and Formatting

ESLint is used for code quality checks and style enforcement. The configuration extends Next.js core web vitals and TypeScript recommended rules. Prettier handles automatic code formatting with a consistent style across the codebase. The linting and formatting tools are integrated into the development workflow and run on every commit.

**ESLint Configuration (`.eslintrc.json`):**

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": ["@typescript-eslint", "react-hooks"],
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/self-closing-comp": "error",
    "react/jsx-curly-brace-presence": [
      "error",
      { "props": "never", "children": "never" }
    ]
  }
}
```

**Prettier Configuration (`.prettierrc`):**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Run linting:**

```bash
npm run lint
```

**Run formatting:**

```bash
npm run format
```

### Git Hooks with Husky

Husky is used to enforce code quality checks before commits. The pre-commit hook runs lint-staged, which lints and formats staged files.

**Husky Configuration (`.husky/pre-commit`):**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**lint-staged Configuration (`package.json`):**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### Commit Message Convention

Commit messages follow the Conventional Commits specification with a specific structure: type, optional scope, subject, body, and footer. The type indicates the nature of the change: `feat` for new features, `fix` for bug fixes, `docs` for documentation changes, `style` for formatting changes, `refactor` for code restructuring, `test` for test additions or updates, and `chore` for maintenance tasks. This convention makes the commit history more readable and enables automated changelog generation.

**Commit Message Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**

```bash
feat(auth): add MFA verification to login flow

Adds support for multi-factor authentication during login.
Users with MFA enabled will be prompted for a verification code
after entering their password.

fix(ticket): resolve dispatch failure when expert unavailable

Fixes an issue where ticket dispatch would fail when no experts
were available in the initial search radius. Now properly expands
the search radius and handles the no-expert case.

docs(api): update authentication schema documentation

Updates the API documentation to reflect the new MFA flow.
Adds examples for the verify-otp endpoint.

style(dashboard): format dashboard components with Prettier

No functional changes. Just formatting updates.

refactor(hooks): extract useGeolocation into separate file

Moves the geolocation logic from the forms page into a reusable hook.

test(auth): add unit tests for authentication service

Adds Jest tests for the auth service with 100% coverage.

chore(deps): update Next.js to version 15.1.0
```

---

## Role-Based Routing

### Route Groups

Next.js route groups are used to organize routes by user role and access level. The `(auth)` group contains public authentication pages that are accessible without authentication. The `(expert)` group contains routes for field experts that are protected by authentication and role checks. The `(supervisor)` group contains routes for institutional supervisors that are also protected by authentication and role checks.

| Route Group    | URL Prefix                                                 | Role Access                | Description          |
| -------------- | ---------------------------------------------------------- | -------------------------- | -------------------- |
| `(auth)`       | `/login`, `/signup`, `/forgot-password`, `/reset-password` | Public                     | Authentication pages |
| `(expert)`     | `/home`, `/tickets`, `/profile`, `/forms`                  | `field_expert`             | Expert PWA           |
| `(supervisor)` | `/dashboard`, `/matches`, `/reports`                       | `institutional_supervisor` | Supervisor dashboard |

### Middleware Protection

The middleware intercepts every request and enforces authentication and role-based access control. When a user visits a public path while already authenticated, they are redirected to their role-specific home page. When an unauthenticated user attempts to access a protected path, they are redirected to the login page. When a user attempts to access a path intended for a different role, they are redirected to their correct home page. This ensures that users only see content appropriate for their role.

**Middleware Implementation (`middleware.ts`):**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auditerra_token")?.value;
  const role = request.cookies.get("auditerra_role")?.value;

  // 1. Public paths - redirect authenticated users
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (token) {
      if (role === "institutional_supervisor") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected paths - redirect unauthenticated users
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Role protection - prevent cross-role access
  if (role === "institutional_supervisor" && pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (role === "field_expert" && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
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

The authentication process follows a straightforward sequence. The user enters their credentials on the login page. The system validates these credentials against the backend API. If the credentials are valid, a JSON Web Token (JWT) is issued and stored in both localStorage and cookies. The system then checks the user's role from the decoded token payload and redirects them to the appropriate dashboard. If the credentials are invalid, an error message is displayed to the user.

### Token Storage

The JWT token is stored in multiple locations for different purposes. localStorage provides persistence across page refreshes and browser sessions. Cookies enable server-side authentication through the middleware, which protects routes before the client-side JavaScript loads. sessionStorage is used for temporary data like submitted ticket IDs that should not persist beyond the current session.

| Storage          | Purpose                                 |
| ---------------- | --------------------------------------- |
| `localStorage`   | Token persistence across page refreshes |
| `cookies`        | Server-side authentication (middleware) |
| `sessionStorage` | Temporary data (submitted tickets)      |

### Auth Helpers

The authentication helpers in `lib/api/auth.ts` manage the entire authentication lifecycle. `saveSession` stores the token and decodes its payload to extract user information. `getToken` retrieves the token from localStorage. `clearSession` removes the token from all storage locations. `isAuthenticated` checks if a valid, unexpired token exists. `isTokenExpired` validates the token's expiration timestamp. `decodeToken` parses the JWT payload. `logout` clears the session and redirects the user to the login page.

**Auth Helpers Implementation (`lib/api/auth.ts`):**

```typescript
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: string;
  role: "farmer" | "field_expert" | "institutional_supervisor";
  exp: number;
}

function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function decodeToken(token: string): TokenPayload {
  return jwtDecode<TokenPayload>(token);
}

export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  try {
    return decodeToken(token).exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function saveSession(token: string) {
  const payload = decodeToken(token);
  localStorage.setItem("auditerra_token", token);
  localStorage.setItem("staff_id", payload.sub);
  setCookie("auditerra_token", token);
  setCookie("auditerra_role", payload.role);
  return payload;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auditerra_token");
}

export function clearSession() {
  localStorage.removeItem("auditerra_token");
  deleteCookie("auditerra_token");
  deleteCookie("auditerra_role");
}

export function getRole(): string | null {
  const token = getToken();
  if (!token || isTokenExpired(token)) return null;
  try {
    return decodeToken(token).role;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token && !isTokenExpired(token);
}

export function logout() {
  clearSession();
  window.location.href = "/login";
}
```

### Token Payload

The JWT payload contains the user ID and role. The `sub` claim holds the user's UUID, which is used to identify the user in API requests. The `role` claim determines which routes and features the user can access. The `exp` claim contains the token's expiration timestamp.

```typescript
interface TokenPayload {
  sub: string; // User ID (UUID)
  role: "farmer" | "field_expert" | "institutional_supervisor";
  exp: number; // Expiration timestamp (Unix seconds)
}
```

---

## API Integration

### API Client

The API client in `lib/api/api.ts` provides a consistent interface for making HTTP requests to the backend. The `apiPost` function handles POST requests with automatic authentication header injection. The `apiGet` function handles GET requests with the same authentication. Both functions handle error responses consistently, extracting error messages from the response body and throwing them as JavaScript errors. The client also supports form-encoded requests for USSD-related operations.

**API Client Implementation (`lib/api/api.ts`):**

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

if (!API_BASE && typeof window !== "undefined") {
  console.error("Missing NEXT_PUBLIC_API_URL. Check .env.local");
}

function buildUrl(path: string): string {
  return `${API_BASE}${path}`;
}

function getAuthHeaders(isForm = false): HeadersInit {
  if (isForm) {
    return { "Content-Type": "application/x-www-form-urlencoded" };
  }
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auditerra_token")
      : null;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function extractErrorMessage(data: any, status: number): string {
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((err: any) => err.msg || err.message || JSON.stringify(err))
      .join(". ");
  }
  if (typeof data.detail === "string") return data.detail;
  if (data.message) return data.message;
  if (data.error) return data.error;
  return `Request failed (HTTP ${status})`;
}

export async function apiPost(path: string, body: object, isForm = false) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(isForm),
    body: isForm ? (body as URLSearchParams).toString() : JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("API Error:", res.status, url, text);
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
    throw new Error(extractErrorMessage(data, res.status));
  }
  return JSON.parse(text);
}

export async function apiGet(path: string) {
  try {
    const url = buildUrl(path);
    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      console.warn(`API error ${res.status} on path: ${path}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch path [${path}]:`, error);
    return null;
  }
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return res.json();
}

// Public exports for specific endpoints
export const fetchTicketById = (id: string) =>
  fetchJson(buildUrl(`/ticket/${id}`));

export const fetchRecommendationById = (id: string) =>
  fetchJson(buildUrl(`/recommendation/${id}`));

export const fetchRecommendationsByFarmer = (farmerId: string) =>
  fetchJson(buildUrl(`/recommendation/farmer/${farmerId}`));
```

### API Service Files

API service files are organized by resource type. Each file exports functions for interacting with a specific backend resource. These functions use the core API client and handle resource-specific URL construction and response parsing. This separation keeps the API client code clean and makes it easy to locate API interactions for a specific resource.

| File                 | Endpoints Called   | Description            |
| -------------------- | ------------------ | ---------------------- |
| `farmers.ts`         | `/farmers/`        | Farmer CRUD operations |
| `locations.ts`       | `/locations/`      | Location management    |
| `logs.ts`            | `/logs/`           | Diagnostic logs        |
| `recommendations.ts` | `/recommendation/` | AI recommendations     |
| `staff.ts`           | `/staff/`          | Staff management       |
| `tickets.ts`         | `/ticket/`         | Ticket management      |

**Example Service File (`lib/api/tickets.ts`):**

```typescript
import { apiGet, apiPost, apiPatch } from "./api";

export interface Ticket {
  ticket_id: string;
  farmer_id: string;
  staff_id: string | null;
  issue_category: string;
  status: "pending" | "dispatched" | "in_progress" | "resolved" | "cancelled";
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function getMyTickets(staffId: string): Promise<Ticket[]> {
  const data = await apiGet(`/ticket/staff/${staffId}`);
  return data || [];
}

export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  return await apiGet(`/ticket/${ticketId}`);
}

export async function createTicket(data: {
  farmer_id: string;
  issue_category: string;
  description?: string;
}): Promise<Ticket> {
  return await apiPost("/ticket", data);
}

export async function updateTicket(
  ticketId: string,
  data: { status?: string; staff_id?: string },
): Promise<Ticket> {
  return await apiPatch(`/ticket/${ticketId}`, data);
}

export async function dispatchExpert(
  ticketId: string,
  data: { preferred_county?: string },
): Promise<{ ticket_id: string; status: string; staff_id: string }> {
  return await apiPost(`/ticket/${ticketId}/dispatch`, data);
}

export async function cancelTicket(
  ticketId: string,
  farmerId: string,
): Promise<{ ticket_id: string; status: string }> {
  return await apiPost(`/ticket/${ticketId}/cancel/${farmerId}`, {});
}
```

### API Proxies

Next.js API routes act as proxies to the backend API. This approach solves CORS issues in development and provides a centralized point for request logging and error handling. The proxy routes forward requests to the backend and return the response to the client. This pattern is used for diagnostic logs and locations to simplify the client-side code.

| Route            | Backend Target         | Purpose               |
| ---------------- | ---------------------- | --------------------- |
| `/api/logs`      | `{API_URL}/logs/`      | Create diagnostic log |
| `/api/locations` | `{API_URL}/locations/` | Create location       |

**Example API Route (`app/api/logs/route.ts`):**

```typescript
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  const res = await fetch(`${API_URL}/logs/`, {
    method: "POST",
    headers: {
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...(token ? { Authorization: token } : {}),
    },
    body: request.body,
    duplex: "half",
  } as RequestInit);

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}
```

---

## Expert PWA

### Overview

The Expert PWA is an offline-first application that enables field experts to continue working without internet connectivity. Experts can view assigned tickets, complete soil diagnostic forms, and track their ticket history. All data is stored locally in IndexedDB when offline and automatically synchronized when connectivity is restored. The interface is optimized for mobile use in field conditions, with large touch targets and clear status indicators.

### Expert Pages

The Expert PWA consists of four main pages. The Home page displays pending tickets assigned to the expert, showing only tickets that are still active and not yet submitted. The Tickets page provides a full view of all tickets with tabs for pending and history views. The Profile page displays the expert's information and provides logout functionality. The Forms page contains the diagnostic form for submitting soil data.

**Expert Home Page Implementation:**

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/expert/Header";
import TicketCard from "@/components/expert/TicketCard";
import { getMyTickets, type Ticket } from "@/lib/api/staff";

export default function HomePage() {
  const router = useRouter();
  const [staffName, setStaffName] = useState("Expert");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("staff_name") || "Expert";
    setStaffName(name);

    const staffId = localStorage.getItem("staff_id");
    if (!staffId) {
      setLoading(false);
      return;
    }

    getMyTickets(staffId)
      .then((data) => {
        const submittedIds = getSubmittedTicketIds();
        const active = data.filter(
          (t) =>
            (t.status === "pending" || t.status === "dispatched") &&
            !submittedIds.includes(t.ticket_id),
        );
        setTickets(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-black">
      <Header />
      <main className="flex-grow w-full max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Hello {staffName}!
        </h1>
        <p className="text-gray-500 mb-8">View Your Tickets</p>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading assignments...</p>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col justify-center text-center min-h-[320px] py-16 bg-white rounded-2xl border border-gray-200 shadow-xl">
            <p className="text-gray-400 text-base font-semibold">
              No pending assignments
            </p>
            <p className="text-sm text-gray-400 mt-2">
              All caught up! Check History for completed tickets.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="min-h-[220px] flex flex-col [&>*]:flex-1"
              >
                <TicketCard
                  ticketId={ticket.ticket_id}
                  farmerId={ticket.farmer_id}
                  issueCategory={ticket.issue_category}
                  status={ticket.status}
                  createdAt={ticket.created_at}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <footer className="bg-[#4CAF50] text-white py-6 px-6 md:px-12 w-full mt-16 shadow-inner text-center text-xs font-semibold">
        &copy; 2026 Auditerra. All rights reserved
      </footer>
    </div>
  );
}

function getSubmittedTicketIds(): string[] {
  try {
    const raw = sessionStorage.getItem("auditerra_submitted_tickets");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
```

### Expert Components

| Component           | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `Header.tsx`        | Top header with app name and navigation                   |
| `BottomNav.tsx`     | Bottom navigation bar (Home, Tickets, Profile, Forms)     |
| `TicketCard.tsx`    | Card displaying ticket details (farmer, category, status) |
| `OfflineBanner.tsx` | Banner shown when offline                                 |

### Ticket Status Display

Ticket status is displayed using color-coded badges that provide quick visual feedback. Pending tickets are amber, indicating that the ticket is waiting for action. Dispatched tickets are blue, indicating that an expert has been assigned. Resolved tickets are green, indicating successful completion. Cancelled tickets are red, indicating the ticket is no longer active.

### Ticket Submissions Tracking

Submitted tickets are tracked in sessionStorage to prevent duplicate submissions. When an expert submits a diagnostic form, the ticket ID is added to a list in sessionStorage. On the home page, tickets that have already been submitted are filtered out of the pending list. This prevents the expert from seeing tickets they have already completed and ensures they only work on active assignments.

---

## Supervisor Dashboard

### Overview

The Supervisor Dashboard provides institutional supervisors with a comprehensive view of restoration operations. It displays real-time metrics including hectares restored, active monitoring sites, and deployed experts. An interactive map visualizes restoration sites across Kenya. Charts show restoration progress over time. A data table provides detailed regional restoration data. All data can be exported as CSV for reporting to stakeholders.

### Supervisor Pages

The dashboard consists of three main pages. The Dashboard page is the primary interface with stats, map, and charts. The Matches page shows the farmer-expert match matrix, displaying which experts are assigned to which farmers. The Reports page displays individual reports for specific tickets, including diagnostic data and AI recommendations.

### Dashboard Components

Supervisor-specific components are designed for desktop interaction with data-rich displays. The TopNav component provides navigation and branding. AnimatedStatCard components display key metrics with count-up animations. The RegionMap component uses Leaflet to render an interactive map with restoration site markers. DashboardCharts components visualize restoration metrics over time.

**AnimatedStatCard Component:**

```typescript
"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

function CountUpNumber({ value }: { value: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalDuration = 1500;
    const incrementTime = Math.max(Math.floor(totalDuration / end), 20);

    const timer = setInterval(() => {
      start += Math.ceil(end / (totalDuration / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCurrent(end);
      } else {
        setCurrent(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{current}</>;
}

interface AnimatedStatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export default function AnimatedStatCard({
  title,
  value,
  icon,
  color = "green",
  onClick,
}: AnimatedStatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={`relative overflow-hidden rounded-3xl p-8 cursor-pointer select-none text-white shadow-lg`}
      style={{
        background:
          "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)",
      }}
      onClick={onClick}
    >
      <div className="relative z-10 h-full flex flex-col justify-between gap-6">
        <div className="flex items-start justify-between">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
            {icon}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-white/80 bg-white/10 px-3 py-1 rounded-full">
            Live Telemetry
          </span>
        </div>

        <div>
          <span className="text-sm font-bold uppercase tracking-widest text-white/90 block mb-1">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-bold tracking-tight font-serif">
              <CountUpNumber value={value} />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
          <span>Current value</span>
        </div>
      </div>
    </motion.div>
  );
}
```

### Dashboard Metrics

The dashboard fetches data from multiple API endpoints and calculates key metrics. Hectares restored is calculated from location data filtered by restoration status. Active monitor nodes represent the total number of monitored sites. Active field experts are retrieved from the staff endpoint. The restored and in-progress ratios are calculated as percentages of total sites.

| Metric               | Source                                  | Description                     |
| -------------------- | --------------------------------------- | ------------------------------- |
| Hectares Restored    | `locations` filtered by restored status | Total restored land area        |
| Active Monitor Nodes | `locations` total count                 | Number of monitored sites       |
| Active Field Experts | `staff/field-experts`                   | Number of deployed experts      |
| Restored Ratio       | `locations` restored / total            | Percentage of restored sites    |
| In-Progress Ratio    | `locations` in-progress / total         | Percentage of in-progress sites |

### Dashboard Features

The dashboard includes several interactive features. The Leaflet map displays restored sites in rose and in-progress sites in amber. Stat cards animate their values when the page loads. The CSV export function downloads the regional restoration matrix as a CSV file. Clicking on a metric card filters the map to show only sites matching that metric.

---

## Offline-First Architecture

### IndexedDB Schema

The offline-first architecture uses IndexedDB to store diagnostic forms locally. Each form record includes the associated ticket ID, expert ID, farmer name, soil parameters (pH, nitrogen, phosphorus, potassium), optional location ID, optional image data, a sync status flag, and a creation timestamp. The sync status flag indicates whether the form has been synchronized with the server.

```typescript
export interface OfflineSoilForm {
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

The IndexedDB operations are encapsulated in a dedicated module. The `initDB` function creates or opens the database with the appropriate schema. `saveSoilFormLocally` stores a diagnostic form in the local database with a sync status of pending. `getUnsyncedForms` retrieves all forms that have not yet been synchronized. `markFormAsSynced` updates a form's sync status after successful server synchronization.

```typescript
const DB_NAME = "ScisyncOfflineDB";
const DB_VERSION = 3;
const STORE_NAME = "soil_forms";

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("isSynced", "isSynced", { unique: false });
        store.createIndex("ticketId", "ticketId", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject(
        `IndexedDB storage failed to initialize: ${(event.target as IDBOpenDBRequest).error?.message}`,
      );
    };
  });
};

export const saveSoilFormLocally = async (
  form: Omit<OfflineSoilForm, "id" | "isSynced" | "createdAt">,
): Promise<number> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const record: OfflineSoilForm = {
      ...form,
      isSynced: 0,
      createdAt: Date.now(),
    };

    const request = store.add(record);
    request.onsuccess = (event) =>
      resolve((event.target as IDBRequest).result as number);
    request.onerror = (event) =>
      reject(
        `Failed to cache soil sample record locally: ${(event.target as IDBRequest).error?.message}`,
      );
  });
};

export const getUnsyncedForms = async (): Promise<OfflineSoilForm[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("isSynced");
    const request = index.getAll(IDBKeyRange.only(0));

    request.onsuccess = (event) =>
      resolve((event.target as IDBRequest).result as OfflineSoilForm[]);
    request.onerror = (event) =>
      reject(
        `Failed to retrieve unsynced local data: ${(event.target as IDBRequest).error?.message}`,
      );
  });
};

export const markFormAsSynced = async (id: number): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const record = getRequest.result as OfflineSoilForm;
      if (record) {
        record.isSynced = 1;
        const updateRequest = store.put(record);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () =>
          reject("Failed to execute sync status modification entry update.");
      } else {
        reject("Target local cache record not found.");
      }
    };
    getRequest.onerror = () =>
      reject(
        "Failed to locate local matching asset ID lookup row index pointer.",
      );
  });
};
```

### Offline Sync Flow

The offline sync flow is triggered automatically when the device comes online. When a form is submitted offline, it is saved to IndexedDB. The system monitors the online status and triggers a sync when connectivity is restored. During sync, all unsynced forms are sent to the backend API. If a form is successfully synchronized, it is marked as synced locally. If the server returns a validation error (HTTP 422), the form is considered invalid and is marked as synced to prevent infinite retry loops.

```typescript
"use client";

import { useEffect } from "react";
import { getUnsyncedForms, markFormAsSynced } from "../lib/db/indexedDB";

export function useOfflineSync() {
  useEffect(() => {
    const handleSync = async () => {
      if (!navigator.onLine) return;

      try {
        const unsyncedItems = await getUnsyncedForms();
        if (unsyncedItems.length === 0) return;

        const token = localStorage.getItem("auditerra_token");

        for (const item of unsyncedItems) {
          const payload = {
            ticket_id: item.ticketId,
            staff_id: item.staffId,
            soil_ph: item.soilPh,
            nitrogen_ppm: item.nitrogenPpm,
            phosphorous_ppm: item.phosphorusPpm,
            potassium_ppm: item.potassiumPpm,
            location_id:
              item.locationId || "00000000-0000-0000-0000-000000000000",
            soil_images: item.soilImages || null,
          };

          const response = await fetch("/api/logs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          });

          if (response.ok && item.id !== undefined) {
            await markFormAsSynced(item.id!);
          } else if (response.status === 422 && item.id !== undefined) {
            console.warn("Deleting invalid offline item", item.id);
            await markFormAsSynced(item.id!);
          }
        }
      } catch (error) {
        console.error("Background sync failed:", error);
      }
    };

    window.addEventListener("online", handleSync);

    return () => {
      window.removeEventListener("online", handleSync);
    };
  }, []);
}
```

### Offline Indicators

The user interface provides clear indicators of offline status. The OfflineBanner component appears when the device loses connectivity, informing the user that data is being saved locally. The system listens for online and offline events and triggers synchronization automatically when connectivity is restored.

---

## PWA Configuration

### Manifest

The Web App Manifest configures the application for installation on mobile devices. The manifest specifies the app name, short name, start URL, display mode, background color, and theme color. It also defines the application icons at multiple sizes for different device resolutions.

```json
{
  "name": "Auditerra",
  "short_name": "Auditerra",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/images/logo-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/images/logo-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Service Worker

The service worker enables offline functionality by caching static assets and intercepting network requests. On installation, the service worker caches the application shell and static assets. On activation, it cleans up old caches. On fetch, it attempts to serve from the network first, falling back to the cache when offline. This ensures that the application loads even without connectivity.

```javascript
const CACHE_NAME = "auditerra-v1";
const STATIC_ASSETS = [
  "/",
  "/home",
  "/offline",
  "/manifest.json",
  "/images/logo.png",
];

// Install: Cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});

// Fetch: Network-first with cache fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    }),
  );
});

// Background Sync: Sync offline data
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-soil-forms") {
    event.waitUntil(syncSoilForms());
  }
});

async function syncSoilForms() {
  // Sync logic triggered from ClientSyncProvider
}
```

### Registration

The service worker is registered when the application loads. The registration is handled by the ServiceWorkerRegister component, which checks for service worker support and registers the service worker script. This registration enables offline functionality and background synchronization.

```typescript
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
```

---

## Authentication Pages

### Login

The login page provides a form for email and password entry. When the user submits the form, the credentials are sent to the backend. On success, the token is stored and the user is redirected based on their role. On failure, an error message is displayed. The login page also includes a link to the signup page for new users and a link to the forgot password page.

### Signup

The signup page collects comprehensive user information through a multi-step form. Personal information includes name, email, and phone number. Location selection uses the `kenya-locations` library for county, sub-county, and ward selection. Role selection allows users to choose between field expert and institutional supervisor. Role-specific fields appear conditionally based on the selected role, including institution name and expertise area for experts. Password validation ensures strong passwords with length, uppercase, lowercase, and number requirements.

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import {
  getCounties,
  getSubCountiesInCounty,
  getWardsInSubCounty,
} from "kenya-locations";

function EyeOpen({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    county: "",
    sub_county: "",
    ward: "",
    preferred_language: "english",
    institution_name: "",
    expertise_area: "",
    supervisor_name: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // County, sub-county, ward selection logic using kenya-locations
  const counties = getCounties();
  const selectedCounty = counties.find((county) => county.name === form.county);
  const subCounties = selectedCounty ? getSubCountiesInCounty(selectedCounty.name) : [];
  const selectedSubCounty = subCounties.find((sc) => sc.name === form.sub_county);
  const wards = selectedSubCounty ? getWardsInSubCounty(selectedSubCounty.name) : [];

  const [countySearch, setCountySearch] = useState("");
  const [subCountySearch, setSubCountySearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");

  const countyRef = useRef<HTMLDivElement>(null);
  const subCountyRef = useRef<HTMLDivElement>(null);
  const wardRef = useRef<HTMLDivElement>(null);

  // Click outside handlers for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (countyRef.current && !countyRef.current.contains(target)) setCountyOpen(false);
      if (subCountyRef.current && !subCountyRef.current.contains(target)) setSubCountyOpen(false);
      if (wardRef.current && !wardRef.current.contains(target)) setWardOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validation
  function validateForm() {
    if (!form.name.trim()) return "Please enter your full name.";
    if (form.name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!form.email.trim()) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    if (!form.phone.trim()) return "Please enter your phone number.";

    const cleanedPhone = form.phone.replace(/[\s-]/g, "");
    const phoneRegex = /^(?:\+254|254|0)?[71]\d{8}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return "Please enter a valid Kenyan phone number (e.g., 0712345678).";
    }

    if (!form.role) return "Please select your role.";
    if (!form.county) return "Please select your county.";
    if (!form.sub_county) return "Please select your sub-county.";
    if (!form.ward) return "Please select your ward.";
    if (form.role === "institutional_supervisor" && !form.institution_name.trim()) {
      return "Please enter your institution name.";
    }
    if (form.role === "field_expert" && !form.expertise_area.trim()) {
      return "Please enter your expertise area.";
    }
    if (!form.password) return "Please enter a password.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(form.password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(form.password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(form.password)) return "Password must contain at least one number.";
    if (!form.confirmPassword) return "Please confirm your password.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        county: form.county,
        sub_county: form.sub_county,
        ward: form.ward,
        preferred_language: form.preferred_language,
        institution_name: form.institution_name.trim(),
        expertise_area: form.expertise_area.trim()
          ? form.expertise_area.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        password: form.password,
      };

      if (form.role === "field_expert" && form.supervisor_name.trim()) {
        payload.supervisor_name = form.supervisor_name.trim();
      }

      await apiPost("/users/", payload, false);
      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Sign Up</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Form fields */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[48px] bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
```

### Forgot Password

The forgot password page allows users to request a password reset. The user enters their email address, and the system sends a reset link. The reset token is displayed to the user with a direct link, and the link is automatically copied to the clipboard for convenience.

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPost } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResetUrl("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost("/users/forgot-password", { email: email.trim() }, false);
      setSuccess(data.message || "Check your email for a reset link.");

      if (data.reset_token) {
        const url = `${window.location.origin}/reset-password?token=${data.reset_token}`;
        setResetUrl(url);
        navigator.clipboard?.writeText(url);
      }

      setEmail("");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
      <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-[48px] px-4 rounded-xl border border-green-600 bg-white text-gray-900 placeholder:text-gray-400 focus:border-green-700 focus:ring-1 focus:ring-green-200 focus:outline-none text-sm"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {resetUrl && (
          <div className="rounded-xl border border-green-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-sm text-gray-700 font-medium mb-3 text-center">Reset your password</p>
            <a
              href={resetUrl}
              className="block w-full text-center py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-semibold transition"
            >
              Continue to Reset Password
            </a>
            <p className="text-xs text-gray-400 mt-2 text-center">Link copied to clipboard</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[48px] bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-green-700 font-semibold underline">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
```

### Reset Password

The reset password page accepts a token from the URL and a new password. The user enters their new password and confirms it. On submission, the token and new password are sent to the backend for validation and update.

---

## Shared Components

Shared components are reusable across all user interfaces. The Button component provides consistent styling with variants for primary, secondary, and destructive actions. The Input component includes labels, placeholders, and error messages. The LoadingScreen component provides a full-screen loading overlay. The Sidebar component provides navigation for larger screens. The MapEmbed component provides a reusable map embed interface.

### Button Component

```typescript
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2";

  const variantStyles = {
    primary: "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white",
    ghost: "bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

### Input Component

```typescript
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-[48px] px-4 rounded-xl border ${
            error ? "border-red-500 bg-red-50" : "border-green-600 bg-white"
          } text-gray-900 placeholder:text-gray-400 focus:border-green-700 focus:ring-1 focus:ring-green-200 focus:outline-none text-sm ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
```

---

## Styling

### Tailwind CSS

Tailwind CSS is used for styling with a utility-first approach. The configuration extends the default theme with custom colors, including the Auditerra brand colors. Custom colors include the primary green and its dark variant. Components use Tailwind classes directly, ensuring consistency across the application.

**Tailwind Configuration (`tailwind.config.ts`):**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: "#f0f7f0",
          100: "#e0efe0",
          200: "#c1dfc1",
          300: "#a2cfa2",
          400: "#83bf83",
          500: "#64af64",
          600: "#4CAF50",
          700: "#2E7D32",
          800: "#1B5E20",
          900: "#0D3B0E",
        },
        brown: {
          50: "#f7f4f2",
          100: "#efe8e4",
          200: "#dfd1c9",
          300: "#cfbaae",
          400: "#bfa393",
          500: "#af8c78",
          600: "#5B3D26",
          700: "#4A3020",
          800: "#382418",
          900: "#261810",
        },
      },
      fontFamily: {
        sans: ["Fira Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

### Design Tokens

Design tokens provide a consistent design language across the application. The primary color is green `#4CAF50`, used for buttons and accents. The primary dark variant `#2E7D32` is used for hover states. Backgrounds are off-white `#f9fafb`, surfaces are white `#ffffff`, primary text is dark `#111827`, and secondary text is gray `#6b7280`.

| Token          | Value     | Usage                  |
| -------------- | --------- | ---------------------- |
| Primary        | `#4CAF50` | Green buttons, accents |
| Primary Dark   | `#2E7D32` | Hover states           |
| Background     | `#f9fafb` | Page backgrounds       |
| Surface        | `#ffffff` | Cards, modals          |
| Text Primary   | `#111827` | Headings               |
| Text Secondary | `#6b7280` | Body text              |

### Global Styles (`app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --foreground-rgb: 0, 0, 0;
    --background-rgb: 249, 250, 251;
  }

  body {
    color: rgb(var(--foreground-rgb));
    background: rgb(var(--background-rgb));
    font-family: "Fira Sans", system-ui, sans-serif;
  }
}

@layer components {
  .container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  .card {
    @apply bg-white rounded-2xl shadow-sm border border-gray-100 p-6;
  }
}
```

---

## Animations

### Framer Motion

Framer Motion is used for animations throughout the application. Container variants enable staggered children animations. Item variants provide individual item animations with spring physics. Card hover effects add interactivity. The count-up animation numbers animate from zero to their final value. AnimatePresence enables exit animations when elements are removed from the DOM.

**Animation Variants Example:**

```typescript
import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80 },
  },
};

const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -6,
    transition: { type: "spring" as const, stiffness: 300, damping: 15 },
  },
};
```

### Animation Usage

```typescript
// In components
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="show"
>
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      variants={itemVariants}
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      {/* Component content */}
    </motion.div>
  ))}
</motion.div>
```

---

## Charts

### DashboardCharts Component

The DashboardCharts component displays restoration metrics visually. The charts show restoration progress over time, site status distribution, and other key metrics. The charts are rendered using an embedded charting library and are designed to be responsive and accessible.

---

## Error Handling

### API Error Handling

API errors are handled consistently across the application. The API client extracts error messages from response bodies and throws them as JavaScript errors. The error extraction function handles multiple error formats: array of validation errors, string detail, message field, and error field. If no specific error message is found, a generic error message is returned.

```typescript
function extractErrorMessage(data: any, status: number): string {
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((err: any) => err.msg || err.message || JSON.stringify(err))
      .join(". ");
  }
  if (typeof data.detail === "string") return data.detail;
  if (data.message) return data.message;
  if (data.error) return data.error;
  return `Request failed (HTTP ${status})`;
}
```

### UI Error States

Error states are handled gracefully across the application. The login page displays inline error messages for authentication failures. The signup page displays validation error lists for form validation failures. The dashboard shows a full-page error with a retry button for API failures. Forms display inline validation errors for individual fields.

**Error Boundary Component:**

```typescript
"use client";

import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-gray-600">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## QA Documentation

The Auditerra platform employs a comprehensive quality assurance strategy covering both automated frameworks and manual verification processes. The QA approach combines automated testing for rapid feedback with manual testing for complex user flows and edge cases.

---

### Automated Testing Frameworks

| Framework      | Scope                     | Documentation Location       |
| -------------- | ------------------------- | ---------------------------- |
| **Cypress**    | Frontend E2E Flows        | Frontend Cypress Test Suite  |
| **Playwright** | Cross-Browser E2E Testing | Playwright E2E Test Coverage |
| **Jest**       | Unit testing              | Unit testing suites          |

### Cypress E2E Testing

Cypress is used for end-to-end testing of critical user flows. The authentication test suite covers login, signup, password reset, and logout scenarios. The expert flows test suite covers ticket viewing, form submission, and offline synchronization. The supervisor flows test suite covers dashboard rendering, metrics display, and CSV export. The API integration test suite covers API call success and error handling. The navigation test suite covers role-based routing and protected route access.

**Cypress Test Example:**

```typescript
describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should login successfully with valid credentials", () => {
    cy.get('input[name="email"]').type("supervisor@auditerra.ke");
    cy.get('input[name="password"]').type("SecurePassword123!");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/dashboard");
    cy.get("h1").should("contain", "Supervisor Dashboard");
  });

  it("should show error with invalid credentials", () => {
    cy.get('input[name="email"]').type("invalid@example.com");
    cy.get('input[name="password"]').type("wrongpassword");
    cy.get('button[type="submit"]').click();

    cy.get(".text-red-600").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("should redirect authenticated users away from login", () => {
    // Set auth token
    cy.setCookie("auditerra_token", "valid-token");
    cy.setCookie("auditerra_role", "institutional_supervisor");

    cy.visit("/login");
    cy.url().should("include", "/dashboard");
  });
});
```

**Run Cypress tests:**

```bash
npm run cypress:open   # Interactive mode
npm run cypress:run    # Headless mode
```

### Playwright E2E Testing

Playwright provides cross-browser testing for critical user journeys across Chromium, Firefox, and WebKit. The authentication test suite runs on all three browsers, testing login, signup, and password reset. The Expert PWA test suite tests offline functionality and form submission across all browsers. The Supervisor Dashboard test suite tests map rendering, charts, and data tables across all browsers.

**Playwright Test Example:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Expert PWA Offline Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "expert@auditerra.ke");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("/home");
  });

  test("should cache forms when offline", async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    await page.goto("/forms");
    await page.fill('input[name="soil_ph"]', "6.5");
    await page.fill('input[name="nitrogen"]', "25");
    await page.click('button[type="submit"]');

    // Should show offline success message
    await expect(page.locator(".offline-success")).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Should sync automatically
    await expect(page.locator(".sync-success")).toBeVisible({ timeout: 10000 });
  });
});
```

**Run Playwright tests:**

```bash
npm run playwright:test
```

### Jest Unit Testing

Jest is used for unit testing of components, utilities, and hooks. The components test suite covers rendering, props, events, and state management. The hooks test suite covers custom hook behavior and side effects. The utils test suite covers helper functions and data transformations. The API client test suite covers request building, error handling, and response parsing.

**Jest Test Example:**

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/shared/Button";

describe("Button Component", () => {
  it("should render with primary variant", () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByText("Click me");
    expect(button).toHaveClass("bg-green-600");
  });

  it("should show loading state", () => {
    render(<Button isLoading>Click me</Button>);
    const button = screen.getByText("Loading...");
    expect(button).toBeDisabled();
    expect(button.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDisabled();
  });
});
```

**Run Jest tests:**

```bash
npm run test
npm run test:coverage  # With coverage report
```

---

### Manual QA Test Cases and Matrices

For detailed scripted testing of specific user flows, edge cases, and business logic, comprehensive test matrices and spreadsheets are maintained.

| Test Area                                    | Documentation / Spreadsheet       | Key Coverage Areas                                                                                                               |
| -------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Farmer Profile Creation (USSD)**           | USSD Profile Creation Tests       | Step-by-step USSD prompts, national ID validation, phone normalization, county/sub-county selection, landmark length constraints |
| **Farmer Booking and Issue Reporting Flow**  | Booking and Issue Reporting Tests | Booking cancellations, date rescheduling, network drop recovery, boundary error handling                                         |
| **Expert Profile and Soil Baseline Logging** | Expert Baseline Logging Tests     | Input validation for pH/NPK, blank field blockades, success marker rendering, boundary limit checks                              |
| **AI Recommendation and SMS Delivery**       | AI and SMS Delivery Tests         | AI output schema validation, SMS content safety checks, delivery status tracking, retry mechanisms                               |
| **Backend API Integration**                  | Auditerra Postman Collection      | Full CRUD operations for Users, Farmers, Tickets, Locations, Logs, and Recommendations, plus authentication flows                |
| **System Security and Penetration**          | Security Test Cases               | Malicious input rejection, unauthorized access blocks, data leak prevention, injection attack prevention                         |
| **Offline-First Testing**                    | Offline Sync Test Cases           | Form submission without internet, sync recovery, conflict resolution                                                             |
| **Performance Testing**                      | Performance Test Cases            | Page load times, response times, resource usage                                                                                  |
| **Accessibility Testing**                    | Accessibility Test Cases          | WCAG compliance, screen reader support, keyboard navigation                                                                      |
| **Cross-Browser Testing**                    | Cross-Browser Test Cases          | Browser compatibility, responsive design, mobile-specific issues                                                                 |

### Test Case Template

Each test case follows a standard template that ensures consistency and completeness. The test case includes a unique identifier, the affected module, the test scenario being validated, preconditions required before execution, step-by-step actions to perform, required test data, expected results, actual results, pass/fail status, tester name, and execution date.

| Field               | Description                                   |
| ------------------- | --------------------------------------------- |
| **Test Case ID**    | Unique identifier (e.g., TC-EXP-001)          |
| **Module**          | Affected module (e.g., Expert PWA, Dashboard) |
| **Test Scenario**   | What is being tested                          |
| **Preconditions**   | Required setup before test execution          |
| **Test Steps**      | Step-by-step actions to perform               |
| **Test Data**       | Required input data                           |
| **Expected Result** | What should happen                            |
| **Actual Result**   | What actually happened                        |
| **Status**          | Pass/Fail/Blocked                             |
| **Tester**          | Who performed the test                        |
| **Date**            | Test execution date                           |

---

### Regression Testing Strategy

Regression testing ensures that new changes do not break existing functionality. Automated regression tests run on every pull request to the main and develop branches, covering all critical paths. Manual regression tests run before each release, covering the full application scope. Test case workbooks document all manual regression tests, and QA leads provide sign-off before release.

### Automated Regression

Automated regression tests run on every pull request to the main and develop branches. The tests cover all critical paths and are executed using Cypress and Playwright. Test results are reported in the CI/CD pipeline, and failures block the merge.

```yaml
# .github/workflows/test.yml
name: Frontend Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:ci
      - run: npm run cypress:run
      - run: npm run playwright:test
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

### Manual Regression

Manual regression tests run before each release, typically at the sprint boundary. The tests cover the full application scope and are documented in test case workbooks. The QA lead reviews and signs off on regression testing before release.

### Regression Test Cycles

| Phase       | Frequency                    | Scope             | Owner   |
| ----------- | ---------------------------- | ----------------- | ------- |
| **Daily**   | Each merge to develop        | High-risk areas   | CI/CD   |
| **Sprint**  | End of sprint                | Full regression   | QA Team |
| **Release** | Before production deployment | Complete coverage | QA Lead |

---

### Test Evidence and Reporting

QA artifacts are maintained to provide evidence of testing and track progress. Test case workbooks document test cases with results. Test execution logs are captured from CI/CD runs. Bug reports are tracked in GitHub Issues. Test reports from GitHub Actions artifacts provide test coverage and success rates. Cypress and Playwright outputs provide screenshots and videos of test execution.

### Test Results Dashboard

The QA team maintains a dashboard tracking key quality metrics. Test coverage tracks the percentage of code covered by tests, with a target of 80% or higher. Pass rate tracks the percentage of passing tests, with a target of 95% or higher. Defect density tracks bugs per 1000 lines of code, with a target of less than 1. Defect reopen rate tracks the percentage of bugs that are reopened, with a target of less than 5%. Sprint test completion tracks the percentage of planned tests executed, with a target of 100%.

### Bug Reporting Template

When a bug is found, a detailed bug report is created. The report includes the bug title, severity level, environment, steps to reproduce, expected result, actual result, screenshots or logs, browser or device information, reporter name, and date. This template ensures that bugs are reported consistently and can be reproduced by developers.

```markdown
## Bug Report

**Title:** [Brief description]

**Severity:** Critical / High / Medium / Low

**Environment:** Production / Staging / Development

**Steps to Reproduce:**

1.
2.
3.

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots/Logs:**
[Attach evidence]

**Browser/Device:**
[Chrome 120, Safari 17, iPhone 15, etc.]

**Reported By:**
[Name]

**Date:**
[Timestamp]
```

---

### Test Logs and Evidence

For detailed step-by-step test executions and evidence records, refer to the following documents:

[**View the QA Test Case Workbook**](https://docs.google.com/spreadsheets/d/1bK2iyq5l6N8bls8oYktTzzb6w99F-GAN/edit?gid=25033287#gid=25033287)

[**View the Informational Website TDD Test**](https://github.com/akirachix/Scisync_Informational_Website/tree/feature/add-cypress-automation)

[**View the Dashboard Playwright Tests**](https://github.com/akirachix/Scisync_Dashboard)

---

### Test Environment Setup

The test environment is configured to support all testing activities. For local development, developers install dependencies, run the application in development mode, and execute tests locally. In the CI/CD pipeline, tests are automatically executed on every push and pull request, ensuring that issues are caught early in the development process.

---

### Performance Testing

Performance testing ensures the application meets response time and resource usage targets. Page load performance is measured using Lighthouse. API response times are measured using custom performance tests. Resource usage is measured to ensure the application is efficient. Each test type has defined thresholds that must be met for the application to be considered performant.

| Test Type          | Tool       | Metrics                  | Threshold |
| ------------------ | ---------- | ------------------------ | --------- |
| **Page Load**      | Lighthouse | First Contentful Paint   | < 1.5s    |
| **Page Load**      | Lighthouse | Largest Contentful Paint | < 2.5s    |
| **Page Load**      | Lighthouse | Time to Interactive      | < 3.5s    |
| **API Response**   | Custom     | Response time            | < 200ms   |
| **API Response**   | Custom     | Error rate               | < 1%      |
| **Resource Usage** | Lighthouse | Bundle size              | < 300KB   |
| **Resource Usage** | Lighthouse | Total requests           | < 50      |

**Performance Testing Commands:**

```bash
# Run Lighthouse
npx lighthouse http://localhost:3000 --output json --output html

# Run bundle analysis
npm run analyze

# Run performance tests
npm run test:performance
```

## Deployment

### Vercel Deployment

The frontend is deployed to Vercel for production hosting. Vercel provides automatic deployments from the main branch, preview deployments for pull requests, and edge network distribution for fast global performance.

**Deployment Configuration (`vercel.json`):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1", "cdg1", "sin1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://auditerra-6a019ce5a862.herokuapp.com/api/v1"
  }
}
```

### Environment Variables in Production

Environment variables must be configured in the Vercel dashboard. The following variables should be set for production:

| Variable                            | Value                | Purpose                                 |
| ----------------------------------- | -------------------- | --------------------------------------- |
| `NEXT_PUBLIC_API_URL`               | Production API URL   | Backend communication                   |
| `NEXTAUTH_SECRET`                   | Secure random string | Authentication                          |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`   | Google Maps API key  | Maps functionality                      |
| `NEXT_PUBLIC_ENABLE_OFFLINE_MODE`   | `true`               | Offline support                         |
| `NEXT_PUBLIC_ENABLE_USSD_SIMULATOR` | `false`              | USSD simulator (disabled in production) |

### Deployment Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# List all deployments
vercel list
```

### CI/CD Pipeline

The frontend uses GitHub Actions for continuous integration and deployment. The pipeline runs on every push to the main branch and on pull requests.

**CI/CD Workflow (`.github/workflows/deploy.yml`):**

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - "frontend/**"
  pull_request:
    branches: [main]
    paths:
      - "frontend/**"

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json
      - run: npm install
        working-directory: frontend
      - run: npm run test:ci
        working-directory: frontend
      - run: npm run cypress:run
        working-directory: frontend

  deploy:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
          working-directory: frontend
```

---

## Performance Optimization

### Code Splitting

Next.js automatically code-splits the application by route, ensuring that users only load the JavaScript needed for the current page. This reduces initial load time and improves performance.

### Image Optimization

Next.js Image component is used for automatic image optimization. Images are served in modern formats (WebP, AVIF) and resized based on the viewport.

```typescript
import Image from "next/image";

export default function OptimizedImage() {
  return (
    <Image
      src="/images/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority
      className="rounded-lg"
    />
  );
}
```

### Lazy Loading

Components that are not immediately visible are lazy-loaded to reduce initial bundle size.

```typescript
import dynamic from "next/dynamic";

const RegionMap = dynamic(() => import("@/components/supervisor/RegionMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[520px] bg-gray-50 rounded-2xl">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});
```

### Memoization

React.memo and useMemo are used to prevent unnecessary re-renders of expensive components.

```typescript
import { useMemo, memo } from "react";

// Memoized component
const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  return <div>{/* Expensive rendering */}</div>;
});

// Memoized calculation
const filteredData = useMemo(() => {
  return data.filter((item) => item.status === "active");
}, [data]);
```

### Bundle Analysis

The application includes a bundle analysis tool to identify large dependencies and optimize the bundle size.

```bash
npm run analyze
```

This generates a visual report showing the size of each dependency and module, helping identify opportunities for optimization.

---

## Monitoring and Error Tracking

### Logging

The frontend logs errors and important events to the console in development. In production, errors are sent to an error tracking service.

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: Error, data?: any) => {
    console.error(`[ERROR] ${message}`, error, data);
    // Send to error tracking service in production
    if (process.env.NODE_ENV === "production") {
      // sendToErrorTracking(message, error, data);
    }
  },
};
```

### Error Boundaries

Error boundaries catch JavaScript errors in the component tree and display fallback UI, preventing the entire application from crashing.

```typescript
"use client";

import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-gray-600">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## Accessibility

### WCAG Compliance

The frontend is designed to comply with WCAG 2.1 AA standards. This includes:

- Proper semantic HTML elements
- ARIA attributes where needed
- Keyboard navigation support
- Color contrast ratios meeting WCAG requirements
- Focus indicators for interactive elements
- Screen reader support

### Accessibility Testing

```bash
# Run axe accessibility tests
npm run test:accessibility

# Run Lighthouse accessibility audit
npx lighthouse http://localhost:3000 --output json --output html --only-categories accessibility
```

### Accessible Components

```typescript
// Accessible button component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  ariaLabel?: string;
}

export default function AccessibleButton({ children, ariaLabel, ...props }: ButtonProps) {
  return (
    <button
      aria-label={ariaLabel || (typeof children === "string" ? children : undefined)}
      className="px-4 py-2 bg-green-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## Security

### Content Security Policy

The application implements a Content Security Policy (CSP) to prevent XSS attacks.

```typescript
// next.config.mjs
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.auditerra.ke;",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];
```

### Input Sanitization

All user inputs are sanitized before rendering to prevent XSS attacks.

```typescript
// lib/sanitize.ts
import DOMPurify from "dompurify";

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  });
}
```

---

## Troubleshooting

### Common Issues and Solutions

| Issue                                        | Cause                                   | Solution                                                    |
| -------------------------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| `Error: connect ECONNREFUSED 127.0.0.1:3000` | Next.js dev server not running          | Run `npm run dev`                                           |
| `TypeScript errors during build`             | Type errors in code                     | Fix TypeScript errors: `npm run lint`                       |
| `"NEXT_PUBLIC_API_URL" is not defined`       | Missing environment variable            | Add `NEXT_PUBLIC_API_URL` to `.env.local`                   |
| `Service Worker registration failed`         | Service worker not supported or blocked | Check browser support; ensure service worker is not blocked |
| `IndexedDB quota exceeded`                   | Too much offline data stored            | Clear IndexedDB data; implement data eviction policy        |
| `Application not rendering offline`          | Service worker not caching assets       | Verify service worker registration; check cache strategy    |
| `CORS errors in development`                 | API not allowing frontend origin        | Configure CORS on backend; or use API proxy routes          |

### Debugging

```bash
# Run with verbose logging
NEXT_PUBLIC_DEBUG=true npm run dev

# View build logs
npm run build -- --debug

# Inspect bundle
npm run analyze
```

### Clear Cache

```bash
# Clear Next.js cache
rm -rf .next

# Clear browser cache (manual)
# Or use incognito/private browsing

# Clear service worker cache (manual)
# Chrome DevTools → Application → Clear storage
```

---

## Next Steps

- [Frontend Mobile](/frontend-mobile/overview) : Prerequisites and full setup guide
