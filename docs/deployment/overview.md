# Auditerra Platform Deployment Documentation

## 1. Overview of Deployment Architecture

The Auditerra platform is a full-stack ecosystem designed to serve distinct user groups (Farmers, Field Experts, and Supervisors) across both web and mobile environments. To ensure robustness, high availability, and ease of management, the production stack is deployed across several purpose-built platforms:

- **Backend & Database:** Heroku (dynos for FastAPI, PostgreSQL managed add-on)
- **Frontend Web (PWA for Institutional Supervisors):** Vercel
- **Mobile Interface (Native/Bridged app for Field Experts):** Vercel (serving the mobile web bundle)
- **AI Component:** Google Cloud (Gemini API & File Search Store)
- **External Services:** Cloudflare (Edge), SMS Leopard (SMS Gateway)

This document provides a technical walkthrough of how each component is configured, deployed, and connected in production.

---

## 2. Backend Deployment on Heroku

### 2.1 Why Heroku?

Heroku is used for the backend because it offers a highly managed, serverless-like PaaS (Platform as a Service) environment. It handles containerization (via Dynos), monitoring, load balancing, and environment variable injection natively.

### 2.2 Pre-Requisites for Heroku Deployment

Before you can deploy the FastAPI backend, you need the following:

1. **Heroku CLI** installed and authenticated (`heroku login`).
2. **`Procfile`** in the root directory.
3. **`requirements.txt`** containing all Python dependencies.
4. **Environment Variables** defined in the Heroku dashboard.

### 2.3 The `Procfile`

Heroku requires a `Procfile` to define how the application is started.

```text
web: uvicorn main:app --host=0.0.0.0 --port=$PORT
```

### 2.4 Deployment Workflow

The backend is deployed using Git integration or the Heroku CLI.

```bash
# Initialize git repo (if not already)
git init

# Create the Heroku app
heroku create auditerra-backend-prod

# Set environment variables (secrets are securely stored, not in git)
heroku config:set GOOGLE_API_KEY= VALUE
heroku config:set SMS_LEOPARD_API_KEY=VALUE
heroku config:set DATABASE_URL= VALUE
heroku config:set GEMINI_MODEL=VALUE

# Push the code to Heroku
git add .
git commit -m "Deploy backend"
git push heroku main
```

### 2.5 Database Provisioning (PostgreSQL)

The application uses a Heroku managed PostgreSQL add-on.

```bash
# Attach the managed Postgres add-on
heroku addons:create heroku-postgresql:essential-0 --app auditerra-backend-prod

# Retrieve the DATABASE_URL automatically injected into the app
```

### 2.6 Secure Environment Management

Heroku provides a secure environment variable injection system via `heroku config`. No hardcoded `.env` files are committed to git. Critical secrets such as `API_KEY`, `GOOGLE_API_KEY`, and database credentials are stored directly in the dashboard and injected at runtime.

---

## 3. Frontend Web (Supervisor PWA) Deployment on Vercel

### 3.1 Why Vercel?

Vercel is used for the frontend web application, which serves as the **PWA for Institutional Supervisors**. It is optimized for static and serverless frontend hosting, providing global CDN distribution, automatic SSL, zero-config deployments, and edge caching.

### 3.2 Pre-Requisites for Vercel Deployment

1. **Vercel Account** connected to your Git repository.
2. **`vercel.json`** configuration file for framework-specific settings.
3. **`build` command** (e.g., `npm run build`) defined in `package.json`.

### 3.3 The `vercel.json` Configuration

For the Supervisor PWA, the configuration ensures that the React/Vite build output is served correctly, including fallback routing and PWA caching headers.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

### 3.4 Deployment Workflow

Vercel integrates directly with the Git workflow.

```text
1. Push code to the main GitHub branch.
2. Vercel detects the framework (React/Vite) and automatically triggers a build.
3. The build creates a production-optimized static bundle.
4. Vercel deploys the bundle to the global CDN.
5. Live traffic is instantly served from the nearest edge location.
```

**Production Domain:** `https://auditerra-supervisor.vercel.app`

### 3.5 Environment Variables for Frontend

All public-facing configuration is set in the Vercel dashboard. This allows the frontend to connect to the Heroku backend.

```text
VITE_API_BASE_URL=https://auditerra-backend-prod.herokuapp.com/
```

---

## 4. Mobile Interface (Field Expert) Deployment on Vercel

### 4.1 Why Vercel?

The **Field Expert Mobile Interface** is a separate, heavily optimized, mobile-first web application compiled into a static bundle. It is currently hosted on Vercel alongside the supervisor PWA, but as a distinct application. This allows for rapid deployment, zero server maintenance, and global availability for field experts working in remote locations.

### 4.2 Pre-Requisites for Deployment

1. **Vercel Project** dedicated to the mobile interface.
2. **`vercel.json`** configuration file pointing to the mobile build folder.
3. **Service Worker configuration** for offline caching (critical for low-connectivity rural areas).

### 4.3 The `vercel.json` Configuration

The mobile interface requires specific offline caching and routing settings to support the field expert's remote workflow.

```json
{
  "outputDirectory": "dist_mobile",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        },
        { "key": "Pragma", "value": "no-cache" }
      ]
    }
  ]
}
```

### 4.4 Deployment Workflow (Automated CI/CD)

The mobile interface is deployed through a dedicated Vercel pipeline.

```text
1. Push code to the mobile-app branch in GitHub.
2. Vercel builds the mobile-specific bundle.
3. The PWA Service Worker is generated and configured.
4. Vercel deploys to the global CDN.
5. Field Experts access the mobile interface via the URL and can "Install" it as a standalone app on their smartphones (PWA installation).
```

**Production URL:** `https://auditerra-mobile-expert.vercel.app`

### 4.5 Environment Variables for Mobile

The mobile app uses a distinct set of environment variables to handle mobile-specific API routing and authentication.

```text
VITE_API_BASE_URL= your_url
VITE_PUSH_NOTIFICATION_KEY=webpush_sec_abc123_def456
```

---

## 5. System Integration Across Platforms

The deployed components communicate seamlessly over secure, encrypted channels.

```text
[Cloudflare Edge]
       |
       v
[Vercel Supervisor PWA] --- HTTPS / REST API --->  [Heroku Backend (FastAPI)]
       |                                                   |
       v                                                   v
[Vercel Mobile Interface (Field Expert)]          [Heroku PostgreSQL]
       |                                                   |
       |                                                   v
       +----------------------------------------------------> [Google Gemini API & Store]
                                                                   |
                                                                   v
                                                          [SMS Leopard Gateway]
                                                                   |
                                                                   v
                                                               [Farmer Phone]
```

### 5.1 API Connection

The Vercel-hosted Supervisor PWA and Field Expert Mobile Interface communicate with the Heroku-hosted backend using standardized HTTP/HTTPS REST API calls. Both frontend applications use the `VITE_API_BASE_URL` environment variable to target the production endpoint.

### 5.2 Authentication & Security

- **Network:** Cloudflare provides the perimeter WAF and DDoS protection for all web traffic. All communications are encrypted using TLS 1.3.
- **Database Access:** Only the Heroku backend dynos can connect to the internal PostgreSQL instance. The database is never exposed directly to the public internet.
- **Token Handling:** The frontend applications handle JWT authentication tokens securely in memory, ensuring they are never exposed to third-party scripts.

### 5.3 Offline & Sync

The Field Expert Mobile Interface uses a Service Worker to cache operational data (e.g., assigned tickets, diagnostic forms) for up to 10 days. When connectivity is restored, the cached data is securely pushed to the Heroku backend for processing.

## 6. Conclusion

Auditerra's deployment strategy optimizes for performance, scalability, and reliability across its distinct user groups. **Heroku** provides a secure, managed containerized environment for the FastAPI backend and database; **Vercel** provides globally distributed static hosting for both the Supervisor PWA and the Field Expert Mobile Interface; and **Cloudflare** ensures a secure edge layer.

## 12. Next Steps

-[Developer Guide](/dev_guide/overview) : See our guide designed especially for developers
