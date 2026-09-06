from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.patient_service import generate_patient_id
from app.db.database import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientResponse

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


@router.post("/", response_model=PatientResponse)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db)
):
    patient = Patient(
        patient_id=generate_patient_id(db.query(Patient).count() + 1),
        full_name=patient_data.full_name,
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        phone=patient_data.phone,
        email=patient_data.email,
        preferred_language=patient_data.preferred_language
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return patient


@router.get("/", response_model=list[PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(Patient).all()