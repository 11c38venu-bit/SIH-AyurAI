import enum
from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.sql import func
from app.db.database import Base


class MedicineType(str, enum.Enum):
    HERB = "HERB"
    CHURNA = "CHURNA"
    KASHAYA = "KASHAYA"
    VATI = "VATI"
    GUTIKA = "GUTIKA"
    TAILA = "TAILA"
    GHRITA = "GHRITA"
    ASAVA = "ASAVA"
    ARISHTA = "ARISHTA"
    LEHYA = "LEHYA"
    BHASMA = "BHASMA"
    RASAYANA = "RASAYANA"
    KVATHA = "KVATHA"
    LEPA = "LEPA"
    OTHER = "OTHER"


class Medicine(Base):
    """
    Ayurvedic Medicine Master Catalog.
    Master reference data for classical formulations, herbs, and preparations.
    """
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    medicine_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    generic_name = Column(String(255), nullable=True)
    classical_reference = Column(String(255), nullable=True)
    
    category = Column(
        Enum(MedicineType, name="medicine_type", native_enum=False),
        default=MedicineType.OTHER,
        nullable=False,
        index=True
    )
    
    formulation = Column(String(100), nullable=True)  # e.g. Churna, Vati, Kwath
    dosage_form = Column(String(100), nullable=True)  # e.g. Powder, Tablet, Syrup, Oil
    manufacturer = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=True)
    strength = Column(String(100), nullable=True)  # e.g. 500 mg, 5 g
    unit = Column(String(50), nullable=True)  # e.g. mg, g, ml, tablet
    standard_route = Column(String(100), default="Oral", nullable=True)
    storage_instructions = Column(String(255), nullable=True)
    
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
