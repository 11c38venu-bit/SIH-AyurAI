# AYURAI — SECURITY CHECKLIST & GOVERNANCE REPORT

**Project:** AYURAI (Smart India Hackathon 2026)  
**Security Status:** Security-Hardened MVP | Deployment-Ready with Documented Configuration  
**Review Scope:** Modules 1 through 20  

---

## 1. Security Classification Framework

To maintain clear and honest security boundaries, AYURAI classifies all security measures into three distinct categories:
- **[IMPLEMENTED]**: Actively enforced in code and verified via automated test suites.
- **[DEPLOYMENT REQUIREMENT]**: Operational configuration required by the hosting infrastructure / sysadmin upon server deployment.
- **[FUTURE HARDENING]**: Post-hackathon architectural enhancements for enterprise hospital scale.

---

## 2. Comprehensive Security Checklist

| Category | Security Control | Implementation Level | Verification / Notes |
|---|---|:---:|---|
| **Authentication** | OAuth2 Password Bearer flow with JWT access tokens | **[IMPLEMENTED]** | Invalid credentials consistently return `HTTP 401`. |
| **JWT Implementation** | Signed HS256 tokens with configurable expiration | **[IMPLEMENTED]** | Missing/malformed tokens rejected; secret configurable via `JWT_SECRET_KEY`. |
| **Password Hashing** | Bcrypt hashing with random salt (72-byte safe truncation) | **[IMPLEMENTED]** | Plaintext passwords never stored, never logged, and never returned in API responses. |
| **RBAC Enforcement** | RoleChecker dependency enforcing ADMIN, DOCTOR, STAFF | **[IMPLEMENTED]** | Unauthorized role actions strictly return `HTTP 403 Forbidden`. |
| **Clinical Locks** | Finalized prescriptions and completed consultations locked | **[IMPLEMENTED]** | Modifying locked clinical records is prevented; append-only audit trail recorded. |
| **Cross-Patient Isolation** | Foreign key and ownership validation on all sub-resources | **[IMPLEMENTED]** | Associating one patient's case/records to another is blocked (`HTTP 400`). |
| **CORS Hardening** | Explicit origin whitelist via `FRONTEND_ORIGIN` env | **[IMPLEMENTED]** | Wildcard `allow_origins=["*"]` avoided when credentials are enabled. |
| **Secret Protection** | `.env` files ignored by Git (`.gitignore`) | **[IMPLEMENTED]** | Zero API keys, JWT secrets, or DB passwords committed to repository. |
| **Database Security** | Parameterized SQLAlchemy ORM queries; Pydantic validation | **[IMPLEMENTED]** | Raw user-controlled SQL string concatenation is strictly avoided. |
| **File Upload Security** | Whitelisted extensions (`.pdf`, `.png`, `.jpg`), MIME validation, 15MB limit | **[IMPLEMENTED]** | Stored with random UUID filenames; path traversal prevented. |
| **AI Secret Isolation** | `GEMINI_API_KEY` strictly loaded on backend server | **[IMPLEMENTED]** | Frontend client source code audited: zero AI keys present. |
| **Prompt Injection Defense** | Input isolation, system prompts enforcing assistive boundaries | **[IMPLEMENTED]** | Patient free-text treated strictly as DATA; malicious overrides neutralized. |
| **AI Clinical Safety** | No autonomous diagnosis, prescribing, or Dosha calculation | **[IMPLEMENTED]** | Mandatory practitioner review disclaimers attached to all AI case summaries. |
| **Error Handling** | Client-safe error details; no stack trace / credential leakage | **[IMPLEMENTED]** | Structured JSON error messages returned without internal path disclosures. |
| **Frontend Storage** | JWT stored in browser `localStorage` for MVP demo | **[IMPLEMENTED]** | Cleared immediately on logout or `401 Unauthorized` responses. |
| **Transport Encryption (HTTPS)** | TLS 1.3 reverse proxy termination | **[DEPLOYMENT REQUIREMENT]** | Deploy Nginx / Caddy with valid SSL certificates in production. |
| **Secure Cookie Storage** | HttpOnly, Secure, SameSite cookies for tokens | **[FUTURE HARDENING]** | Recommended transition for production hospital EHR deployments. |
| **Database Backup & Recovery** | Automated `pg_dump` backups and Point-In-Time-Recovery | **[DEPLOYMENT REQUIREMENT]** | Scheduled daily backup scripts documented in `DEPLOYMENT_GUIDE.md`. |
| **Rate Limiting & WAF** | IP rate limiting (e.g. Redis / Nginx `limit_req`) | **[FUTURE HARDENING]** | Protect intake endpoints against distributed denial of service (DDoS). |
| **Antivirus Scanner** | ClamAV integration for uploaded medical documents | **[FUTURE HARDENING]** | Asynchronous virus scanning queue for high-volume uploads. |

---

## 3. Clinical & Safety Governance Declarations

1. **Assistive AI Scope:** AYURAI is an AI-assisted clinical workflow support tool. It is **not** an autonomous diagnostic system. Qualified Ayurvedic practitioners remain the sole clinical decision-makers.
2. **Prescription Integrity:** Prescriptions can only be created and finalized by qualified doctors or authorized administrators. AI is strictly prohibited from generating prescription orders.
3. **Data Protection:** All patient data access is governed by authenticated RBAC rules ensuring strict privacy and operational integrity.
