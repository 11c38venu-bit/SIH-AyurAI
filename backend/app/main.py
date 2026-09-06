from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.ai_case import router as ai_case_router
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router


from app.api.ayurvedic_assessment import router as ayurvedic_assessment_router
from app.api.case_questions import router as case_questions_router
from app.api.cases import router as cases_router
from app.api.consultations import router as consultations_router
from app.api.documents import router as documents_router
from app.api.document_processing import router as document_processing_router
from app.api.follow_ups import router as follow_ups_router
from app.api.medical_history import router as medical_history_router
from app.api.medicines import router as medicines_router
from app.api.notifications import router as notifications_router
from app.api.patient_progress import router as patient_progress_router
from app.api.patients import router as patients_router
from app.api.prescriptions import router as prescriptions_router
from app.api.queue import router as queue_router
from app.api.users import router as users_router

from app.core.config import settings

app = FastAPI(
    title="AYURAI API",
    description="Digital Ayurvedic Patient Care Platform",
    version="1.0.0",
)

# Configure CORS with explicit allowed origins
def _get_allowed_origins() -> list[str]:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    if hasattr(settings, "FRONTEND_ORIGIN") and settings.FRONTEND_ORIGIN:
        for orig in settings.FRONTEND_ORIGIN.split(","):
            clean_origin = orig.strip()
            if clean_origin and clean_origin not in origins:
                origins.append(clean_origin)
    return origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AYURAI Backend is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


# Register API Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(patients_router)
app.include_router(queue_router)
app.include_router(cases_router)
app.include_router(case_questions_router)
app.include_router(ayurvedic_assessment_router)
app.include_router(medical_history_router)
app.include_router(documents_router)
app.include_router(document_processing_router)
app.include_router(ai_case_router)
app.include_router(consultations_router)
app.include_router(medicines_router)
app.include_router(prescriptions_router)
app.include_router(follow_ups_router)
app.include_router(patient_progress_router)
app.include_router(notifications_router)
app.include_router(analytics_router)
app.include_router(admin_router)



