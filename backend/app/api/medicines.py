from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.deps import require_admin, require_staff
from app.db.database import get_db
from app.models.medicine import Medicine, MedicineType
from app.models.user import User
from app.schemas.medicine import MedicineCreate, MedicineResponse, MedicineUpdate

router = APIRouter(prefix="/medicines", tags=["Ayurvedic Medicines Catalog"])


@router.post(
    "/",
    response_model=MedicineResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add new medicine to catalog (Admin only)"
)
def create_medicine(
    medicine_in: MedicineCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Add a new Ayurvedic medicine or formulation to the master catalog.
    Restricted to ADMIN.
    """
    medicine_dict = medicine_in.model_dump()
    
    # Auto-generate medicine_code if not supplied
    if not medicine_dict.get("medicine_code"):
        code_prefix = f"MED-{medicine_in.category.value[:3].upper()}-"
        count = db.query(Medicine).filter(Medicine.medicine_code.like(f"{code_prefix}%")).count()
        medicine_dict["medicine_code"] = f"{code_prefix}{count + 1:04d}"
    else:
        existing = db.query(Medicine).filter(Medicine.medicine_code == medicine_dict["medicine_code"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Medicine code '{medicine_dict['medicine_code']}' already exists."
            )

    medicine = Medicine(**medicine_dict)
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


@router.get(
    "/",
    response_model=List[MedicineResponse],
    summary="List and search medicines (Doctor, Staff, Admin)"
)
def list_medicines(
    q: Optional[str] = Query(None, description="Search keyword for name, generic name, ingredients, or indications"),
    category: Optional[MedicineType] = Query(None, description="Filter by Ayurvedic medicine category"),
    active_only: bool = Query(True, description="Filter only active medicines"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Search and retrieve medicines from the master catalog.
    Accessible to all authenticated staff, doctors, and administrators.
    """
    query = db.query(Medicine)

    if active_only:
        query = query.filter(Medicine.is_active.is_(True))

    if category:
        query = query.filter(Medicine.category == category)

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Medicine.name.ilike(search_pattern),
                Medicine.generic_name.ilike(search_pattern),
                Medicine.classical_reference.ilike(search_pattern),
                Medicine.ingredients.ilike(search_pattern),
                Medicine.description.ilike(search_pattern),
                Medicine.medicine_code.ilike(search_pattern)
            )
        )

    medicines = query.order_by(Medicine.name.asc()).offset(skip).limit(limit).all()
    return medicines


@router.get(
    "/{medicine_id}",
    response_model=MedicineResponse,
    summary="Get medicine details by ID (Doctor, Staff, Admin)"
)
def get_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve single medicine record from the catalog.
    """
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medicine with ID {medicine_id} not found."
        )
    return medicine


@router.patch(
    "/{medicine_id}",
    response_model=MedicineResponse,
    summary="Update medicine details or active status (Admin only)"
)
def update_medicine(
    medicine_id: int,
    medicine_in: MedicineUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Update master medicine catalog information or soft-deactivate.
    Restricted to ADMIN.
    """
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medicine with ID {medicine_id} not found."
        )

    update_data = medicine_in.model_dump(exclude_unset=True)

    if "medicine_code" in update_data and update_data["medicine_code"] != medicine.medicine_code:
        existing = db.query(Medicine).filter(
            Medicine.medicine_code == update_data["medicine_code"],
            Medicine.id != medicine_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Medicine code '{update_data['medicine_code']}' already in use."
            )

    for field, value in update_data.items():
        setattr(medicine, field, value)

    db.commit()
    db.refresh(medicine)
    return medicine
