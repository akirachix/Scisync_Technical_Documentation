# Getting Started

Welcome to Scisync Auditerra. This guide will get you up and running with a local development environment.

## Prerequisites

Before you start, make sure you have the following installed:

| Tool           | Version  | Purpose             |
| -------------- | -------- | ------------------- |
| **Python**     | 3.10.12  | Backend runtime     |
| **Node.js**    | v24.15.0 | Frontend runtime    |
| **Flutter**    | 3.47.1   | Mobile PWA          |
| **PostgreSQL** | 18.3     | Production database |
| **Git**        | Latest   | Version control     |
| **Dart**       | 3.13.1   | Flutter language    |

### Install PostgreSQL on Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql-18 postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create the database user and database
sudo -u postgres psql -c "CREATE USER your_username WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE db_name your_username;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE db_name TO your_username;"
```

### Install Flutter

```bash
# Download Flutter
git clone https://github.com/flutter/flutter.git -b stable ~/flutter
export PATH="$PATH:$HOME/flutter/bin"

# Verify installation
flutter doctor
```

## Clone the Repositories

The project is split across three repositories:

```bash
# Backend (FastAPI)
git clone https://github.com/your-org/Scisync_Backend.git
cd Scisync_Backend

# Frontend (Next.js Dashboard)
git clone https://github.com/your-org/Scisync_Dashboard.git

# Mobile (Flutter PWA)
git clone https://github.com/your-org/Scisync_Mobile.git
```

## Backend Setup (Scisync_Backend)

### 1. Create a Virtual Environment

```bash
cd Scisync_Backend
python -m venv venv

source venv/bin/activate  # On Linux/macOS

# OR

venv\Scripts\activate   # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file in the root of the `Scisync_Backend` directory:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
#Use your actual values in place of placeholders

DATABASE_URL=  db_url from heroku

#JWT Configuration
JWT_ACCESS_TOKEN_EXPIRE_MINUTES= mumber_of_minutes
ACCESS_TOKEN_EXPIRE_MINUTES= number_of_minutes

# For local development, you can use the B64 encoded keys
JWT_PRIVATE_KEY_B64=your-base64-encoded-private-key
JWT_PUBLIC_KEY_B64=your-base64-encoded-public-key

# Or use file paths (recommended for production)
JWT_PRIVATE_KEY_PATH=/path/to/your/dev_private.pem
JWT_PUBLIC_KEY_PATH=/path/to/your/dev_public.pem

# Google Cloud / Gemini AI
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-service-account.json
GEMINI_API_KEY_SECRET_NAME=gemini-api-key

# Africa's Talking (USSD & SMS)
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your_at_api_key
AT_USERNAME=sandbox
AT_API_KEY_SECRET_NAME=at-api-key
AT_SHORT_CODE= shortcode

# SMS Leopard (Secondary SMS Gateway)
SMS_LEOPARD_API_KEY_SECRET_NAME=leopard-api-key
SMS_LEOPARD_API_SECRET_SECRET_NAME=leopard-api-secret
SMS_LEOPARD_SENDER_ID= sender_id
SMS_LEOPARD_BASE_URL= sms_leopard_base_url


```

### 4. Initialize the Database

```bash
# Create tables
python -c "from app.database import init_db; init_db()"

# Or if you have Alembic migrations:
alembic upgrade head
```

**Test Credentials:**

| Role       | Email                                                 | Password    |
| ---------- | ----------------------------------------------------- | ----------- |
| Expert     | [james@auditerra.org](mailto:james@auditerra.org)     | TestPass12  |
| Supervisor | [demilev@auditerra.org](mailto:demilev@auditerra.org) | TestPass123 |

### 5. Start the Backend Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup (Scisync_Frontend)

### 1. Install Dependencies

```bash
cd Scisync_Frontend
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000/ws

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Maps & Geolocation
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### 3. Start the Frontend Server

```bash
npm run dev
```

## Mobile PWA Setup (Scisync_Mobile)

### 1. Install Dependencies

```bash
cd Scisync_Mobile
flutter pub get
```

### 2. Environment Configuration

Create a `.env` file in the root of the mobile project:

```env
API_BASE_URL=http://localhost:8000/api/v1
WEBSOCKET_URL=ws://localhost:8000/ws
```

### 3. Run the Mobile App

```bash
# For Android
flutter run

# For Web (PWA)
flutter run -d chrome --web-port 3001
```

## Verify Everything Is Working

### 1. Backend Health Check

```bash
curl http://localhost:8000/docs
```

Expected: FastAPI Swagger documentation loads.

### 2. API Root

```bash
curl http://localhost:8000/
```

### 3. Frontend

Open `http://localhost:3000` to see the Supervisor Dashboard.

### 4. Mobile PWA

- Android: Check your emulator or connected device
- Web: `http://localhost:3001`

### 5. USSD Simulator

Visit `http://africa'stalking/auditerra/ussd/simulator` to test the USSD flow.

## Common Setup Issues

### PostgreSQL Connection Error

```text
FATAL: role "auditerra_user" does not exist
```

**Fix:**

```bash
sudo -u postgres psql -c "CREATE USER your_username WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE db_name your_username;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE db_name TO your_username;"
```

### Python Package Errors

```text
ModuleNotFoundError: No module named 'fastapi'
```

**Fix:**

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### JWT Key Errors

```text
FileNotFoundError: JWT_PRIVATE_KEY_PATH not found
```

**Fix:** Use the B64 encoded keys in your `.env` for local development:

```env
JWT_PRIVATE_KEY_B64=your-base64-encoded-key
JWT_PUBLIC_KEY_B64=your-base64-encoded-key
```

### Port Already in Use

```text
Error: address already in use :::8000
```

**Fix:**

```bash
# Find the process
sudo lsof -i :8000

# Kill it
kill -9 <PID>
```

### Flutter Doctor Issues

```bash
flutter doctor
```

Follow the instructions to install any missing dependencies.
