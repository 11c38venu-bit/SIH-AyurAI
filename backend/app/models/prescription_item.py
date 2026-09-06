from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class PrescriptionItem(Base):
    """
    Individual medicine item in a clinical prescription.
    Maintains immutable point-in-time snapshots of medicine details.
    """
    __tablename__ = "prescription_items"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(
        Integer,
        ForeignKey("prescriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    medicine_id = Column(
        Integer,
        ForeignKey("medicines.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Point-in-time snapshots to guarantee legal/clinical record immutability
    medicine_name_snapshot = Column(String(255), nullable=False)
    formulation_snapshot = Column(String(100), nullable=True)
    strength_snapshot = Column(String(100), nullable=True)

    # Administration Details
    dosage = Column(String(100), nullable=False)  # e.g. "1 tablet", "5g", "15ml"
    frequency = Column(String(100), nullable=False)  # e.g. "Twice daily", "TDS", "BD"
    timing = Column(String(100), nullable=True)  # e.g. "Before food", "After food", "Bedtime"
    route = Column(String(100), default="Oral", nullable=False)  # e.g. "Oral", "External", "Nasya"
    duration = Column(String(100), nullable=False)  # e.g. "14 days", "1 month"
    quantity = Column(String(100), nullable=True)  # e.g. "60 tablets", "1 bottle"
    anupana = Column(String(255), nullable=True)  # e.g. "Warm water", "Honey", "Warm milk"
    special_instructions = Column(Text, nullable=True)
    item_order = Column(Integer, default=1, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    prescription = relationship("Prescription", back_populates="items")
    medicine = relationship("Medicine", lazy="joined")
