# AYURAI — PRODUCTION & DEMO DEPLOYMENT GUIDE

**Project:** AYURAI (Smart India Hackathon 2026)  
**Architecture:** FastAPI (Python 3.11+) + PostgreSQL 17 + React 18 / Vite / Tailwind CSS  
**Revision:** Module 20 (Security + Deployment Readiness)  

---

## 1. System Requirements

### Hardware Prerequisites
- **CPU:** Minimum 2 Cores (4 Cores recommended for OCR / AI workloads)
- **RAM:** Minimum 4 GB (8 GB recommended)
- **Disk Space:** Minimum 10 GB SSD for database, document storage, and logs

### Software Prerequisites
- **OS:** Windows 10/11, Ubuntu 22.04 LTS, or macOS 13+
- **Python:** 3.11, 3.12, or 3.13
- **Node.js:** 18.x or 20.x (with npm 9+)
- **Database:** PostgreSQL 17 (or PostgreSQL 15+)
- **Git:** Version 2.30+

---

## 2. PostgreSQL Database Setup

1. **Install PostgreSQL 17:** Ensure the PostgreSQL service is active and listening on port `5432`.
2. **Create Application User and Database:**
   ```sql
   CREATE USER postgres WITH PASSWORD 'postgres';
   CREATE DATABASE ayurai OWNER postgres;
   GRANT ALL PRIVILEGES ON DATABASE ayurai TO postgres;
   ```
3. **Verify Connectivity:**
   ```bash
   psql -U postgres -h localhost -d ayurai
   ```

---

## 3. Environment Variables Configuration

### A. Backend Configuration (`backend/.env`)
Copy the template file:
```bash
cp backend/.env.example backend/.env
```
Populate the configuration values:
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ayurai

# Security & JWT (Replace with strong random key: openssl rand -hex 32)
JWT_SECRET_KEY=your_generated_production_jwt_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Environment & CORS
ENVIRONMENT=production
FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173

# AI & Gemini Clinical Assistant
# Use "gemini" with valid key for live AI synthesis, or "mock" for offline demo
AI_PROVIDER=mock
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Notifications & Reminders
NOTIFICATION_DEFAULT_CHANNEL=IN_APP
FOLLOW_UP_REMINDER_HOURS_BEFORE=24
NOTIFICATION_MAX_RETRIES=3
```

### B. Frontend Configuration (`frontend/.env`)
Copy the template file:
```bash
cp frontend/.env.example frontend/.env
```
Populate the configuration values:
```env
# Point to the hosted backend API
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 4. Backend Installation & Setup

```bash
cd C:\SIH-AyurAI\backend

# 1. Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
# source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt
```

---

## 5. Frontend Installation & Production Build

```bash
cd C:\SIH-AyurAI\frontend

# 1. Install NPM packages
npm install

# 2. Compile production bundle
npm run build
```
The optimized bundle will be generated in `frontend/dist/`.

---

## 6. Running in Production

### A. Starting Backend Server
Do **NOT** use `--reload` in production. Run with production workers:
```bash
cd C:\SIH-AyurAI\backend
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### B. Serving Frontend Static Files
You can serve the compiled `frontend/dist/` bundle using Nginx, Caddy, or a lightweight static server:
```bash
# Example using serve
npx serve -s frontend/dist -l 5173
```

---

## 7. Security & Operational Considerations

1. **HTTPS Enforcement:** Always place the API and Frontend behind a TLS reverse proxy (e.g. Nginx, Cloudflare, AWS ALB) in production.
2. **Secret Protection:**
   - `.env` files are strictly excluded from version control via `.gitignore`.
   - `GEMINI_API_KEY` is loaded exclusively by the backend service and never sent to the client browser.
3. **Document & File Upload Storage:**
   - Uploads are saved in `uploads/documents/` using random UUID filenames to prevent path traversal.
   - Max upload size is strictly enforced at 15 MB.
4. **CORS Governance:**
   - `FRONTEND_ORIGIN` must explicitly match the client application URL. `allow_origins=["*"]` is never used when credentials are enabled.
5. **Database Backups:**
   - Set up daily `pg_dump` cron jobs:
     ```bash
     pg_dump -U postgres -h localhost -F c -b -v -f "/backup/ayurai_$(date +%Y%m%d).dump" ayurai
     ```

---

## 8. Health Check & Verification

Verify the system is running and responsive:
```bash
# Health Check Endpoint
curl -X GET http://127.0.0.1:8000/health
# Response: {"status": "ok"}

# API Root Endpoint
curl -X GET http://127.0.0.1:8000/
# Response: {"message": "AYURAI Backend is running", "status": "success"}
```

---

## 9. SIH Hackathon Demo Walkthrough Steps

1. **Launch Backend:** `venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`
2. **Launch Frontend:** `npm run dev` in `frontend/`
3. **Login as Staff:** Register patient, assign queue token, intake multilingual responses (Tamil/Hindi/English).
4. **Login as Doctor:**
   - Open Unified Clinical Workspace.
   - Review AI Case Summary & Medical History.
   - Enter clinical diagnosis and prescribed Ayurvedic formulations.
   - Finalize prescription and schedule follow-up.
5. **Demonstrate Follow-Up & Progress:**
   - Record return visit encounter and view longitudinal recovery timeline graph.
6. **Login as Admin:**
   - View operational queue metrics, user statistics, and administrative audit trails.
