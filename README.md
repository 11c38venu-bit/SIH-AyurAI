# AYURAI — AI-Assisted Ayurvedic Patient Case-Taking & Digital Care Platform (SIH 2026)

**AYURAI** is a modern healthcare SaaS platform designed for Smart India Hackathon (SIH 2026). It bridges timeless Ayurvedic clinical wisdom (Charaka and Sushruta Samhitas) with modern intelligent case-taking, standardized Ashtavidha Pariksha, real-time OPD queue management, and native multilingual accessibility across 6 Indian languages.

---

## 🌿 Key Features

1. **Native Multilingual Architecture (Core MVP Feature)**:
   - Complete native-script translation architecture with real-time switching for:
     - **English** (`en`)
     - **Tamil** (`ta` - தமிழ்)
     - **Hindi** (`hi` - हिन्दी)
     - **Malayalam** (`ml` - മലയാളം)
     - **Telugu** (`te` - తెలుగు)
     - **Kannada** (`kn` - ಕನ್ನಡ)
   - Persistent language selection stored across sessions with fallback handling.

2. **Patient Experience Portal**:
   - Step-by-step OPD self-registration with instant token generation.
   - Live OPD Queue Tracker with real-time countdown, room alerts, and chime simulation.
   - AI-Guided Ayurvedic Anamnesis & Case-Taking (Ahara, Agni, Nidra, Koshtha, Manasa).
   - Interactive Prakriti & Vikriti Assessment Wizard with dynamic Tri-Dosha balance charts.
   - Medical Records & Previous Ayurvedic Prescriptions uploader.
   - Pre-consultation summary synthesis with doctor-ready briefing.
   - 6-Stage OPD Journey status tracker and Post-consultation Pathya/Apathya adherence log.

3. **Vaidya (Doctor) Clinical Desk**:
   - Live OPD queue triage with high-priority flagging.
   - 360° Longitudinal EHR dossier.
   - Integrated Clinical Consultation Room featuring **Ashtavidha Pariksha** (Nadi, Jihwa, Mutra, Mala, Shabda, Sparsha, Drik, Akriti) and Samprapti analysis.
   - AI Ayurvedic Differential Assistant with Classical Samhita references.
   - Digital Classical Formulation Prescription Builder (Kashayam, Churna, Vati, Bhasma, Asava) with customized Anupana, dosage timing, and printable Rx view.

4. **Frontdesk Staff Portal**:
   - Rapid walk-in patient registration and token dispenser.
   - Consultation room occupancy and live queue reordering.

5. **Hospital Administration & Analytics**:
   - Epidemiological and operational dashboard built with Recharts (patient footfall trends, Dosha distribution pie chart, common conditions).
   - Doctor roster and staff directory management.
   - System settings and AI diagnostic confidence thresholds.

6. **Responsible & Ethical Clinical AI**:
   - Persistent clinical disclaimers across all AI features: *"AI assists the practitioner and does not replace a qualified Ayurvedic doctor."*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.20+ or v18+)
- npm (v8+)

### Running the Application

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (already installed)
npm install

# Start the Vite development server
npm run dev

# Build for production
npm run build
```

The application will start at `http://localhost:3000`.

---

## 🗺️ Routing Reference

| Portal | Route | Description |
| :--- | :--- | :--- |
| **Public** | `/` | Modern Healthcare SaaS Landing Page |
| **Public** | `/login` | 1-Click Role Switcher & Sign In |
| **Patient** | `/patient` | Patient Dashboard & Active Token Overview |
| **Patient** | `/patient/register` | Patient OPD Registration & Token Dispenser |
| **Patient** | `/patient/token` | Live Queue Tracker & Room Call Alert |
| **Patient** | `/patient/case-taking` | AI-Guided Ayurvedic Digital Case-Taking |
| **Patient** | `/patient/assessment` | Prakriti & Vikriti Assessment Wizard |
| **Patient** | `/patient/documents` | Health Records & Diagnostic Uploads |
| **Patient** | `/patient/summary` | Consolidated Pre-Consultation Dossier |
| **Patient** | `/patient/status` | Real-Time OPD Journey Progression |
| **Patient** | `/patient/follow-up` | Care Plan, Pathya Diet & Daily Symptom Log |
| **Doctor** | `/doctor` | Vaidya Clinical Dashboard |
| **Doctor** | `/doctor/queue` | OPD Queue Management & Triage |
| **Doctor** | `/doctor/patients` | Patient EHR Registry |
| **Doctor** | `/doctor/patient/:id` | Patient 360° Longitudinal Medical Record |
| **Doctor** | `/doctor/consultation/:id` | Ashtavidha Pariksha & AI Differential Studio |
| **Doctor** | `/doctor/prescription/:id` | Classical Ayurvedic Prescription Builder |
| **Staff** | `/staff` | Frontdesk Counter Dashboard |
| **Staff** | `/staff/registration` | Desk OPD Intake & Thermal Slip Print |
| **Staff** | `/staff/queue` | Multi-Room Token Queue Manager |
| **Admin** | `/admin` | Hospital Operations & KPI Analytics |
| **Admin** | `/admin/doctors` | Doctor Roster & OPD Room Allocation |
| **Admin** | `/admin/staff` | Staff Directory & Shift Rosters |
| **Admin** | `/admin/patients` | Master Patient Index |
| **Admin** | `/admin/analytics` | Epidemiological Trends & Drug Dispensing |
| **Admin** | `/admin/settings` | Platform Configurations & AI Thresholds |
