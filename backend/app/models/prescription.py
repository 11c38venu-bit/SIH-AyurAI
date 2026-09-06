import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class PrescriptionStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    FINALIZED = "FINALIZED"
    CANCELLED = "CANCELLED"


class Prescription(Base):
    """
    Clinical Prescription authored by a qualified practitioner.
    Immutable once marked FINALIZED or CANCELLED.
    """
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    prescription_number = Column(String(50), unique=True, index=True, nullable=False)
    
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    case_session_id = Column(
        Integer,
        ForeignKey("case_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    consultation_id = Column(
        Integer,
        ForeignKey("consultations.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    doctor_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    prescription_status = Column(
        Enum(PrescriptionStatus, name="prescription_status", native_enum=False),
        default=PrescriptionStatus.DRAFT,
        nullable=False,
        index=True
    )

    # General & Lifestyle Instructions
    general_instructions = Column(Text, nullable=True)
    dietary_advice = Column(Text, nullable=True)  # Pathya & Apathya
    lifestyle_advice = Column(Text, nullable=True)  # Vihara & Dinacharya
    follow_up_instructions = Column(Text, nullable=True)

    # Cancellation
    cancellation_reason = Column(Text, nullable=True)

    # Lifecycle Timestamps
    finalized_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

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
    patient = relationship("Patient", backref="prescriptions", lazy="joined")
    case_session = relationship("CaseSession", backref="prescriptions", lazy="joined")
    consultation = relationship("Consultation", backref="prescriptions", lazy="joined")
    doctor = relationship("User", foreign_keys=[doctor_id], lazy="joined")
    items = relationship(
        "PrescriptionItem",
        back_populates="prescription",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="PrescriptionItem.item_order"
    )
    audit_logs = relationship(
        "PrescriptionAudit",
        back_populates="prescription",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="PrescriptionAudit.created_at.desc()"
    )
