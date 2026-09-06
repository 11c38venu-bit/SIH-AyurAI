from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.medicine import MedicineType


class MedicineBase(BaseModel):
    name: str = Field(..., max_length=255, description="Full trade/classical name of medicine")
    generic_name: Optional[str] = Field(None, max_length=255, description="Botanical or classical generic formulation name")
    classical_reference: Optional[str] = Field(None, max_length=255, description="Classical treatise citation (e.g. Charaka Samhita)")
    category: MedicineType = Field(MedicineType.OTHER, description="Ayurvedic category / dosage classification")
    formulation: Optional[str] = Field(None, max_length=100, description="Formulation method (e.g. Churna, Vati, Kwath)")
    dosage_form: Optional[str] = Field(None, max_length=100, description="Dosage form (e.g. Powder, Tablet, Liquid, Ghee)")
    manufacturer: Optional[str] = Field(None, max_length=255, description="Manufacturing pharmacy or pharmaceutical brand")
    description: Optional[str] = Field(None, description="Indications, actions, and therapeutic descriptions")
    ingredients: Optional[str] = Field(None, description="Key herbs and mineral ingredients")
    strength: Optional[str] = Field(None, max_length=100, description="Potency / strength per standard unit")
    unit: Optional[str] = Field(None, max_length=50, description="Standard dispensing unit (e.g. mg, g, ml, tablet)")
    standard_route: Optional[str] = Field("Oral", max_length=100, description="Default administration route")
    storage_instructions: Optional[str] = Field(None, max_length=255, description="Storage guidelines")
    is_active: bool = Field(True, description="Active status in medicine catalog")


class MedicineCreate(MedicineBase):
    medicine_code: Optional[str] = Field(None, max_length=50, description="Unique catalog medicine code (auto-generated if omitted)")


class MedicineUpdate(BaseModel):
    medicine_code: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=255)
    generic_name: Optional[str] = Field(None, max_length=255)
    classical_reference: Optional[str] = Field(None, max_length=255)
    category: Optional[MedicineType] = None
    formulation: Optional[str] = Field(None, max_length=100)
    dosage_form: Optional[str] = Field(None, max_length=100)
    manufacturer: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    ingredients: Optional[str] = None
    strength: Optional[str] = Field(None, max_length=100)
    unit: Optional[str] = Field(None, max_length=50)
    standard_route: Optional[str] = Field(None, max_length=100)
    storage_instructions: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class MedicineResponse(MedicineBase):
    id: int
    medicine_code: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
