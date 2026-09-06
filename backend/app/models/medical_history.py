from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class MedicalHistory(Base):
    __tablename__ = "medical_histories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    case_session_id = Column(
        Integer,
        ForeignKey("case_sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Clinical & Medical History Dimensions
    past_medical_conditions = Column(Text, nullable=True)
    past_surgeries = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    family_history = Column(Text, nullable=True)
    previous_treatments = Column(Text, nullable=True)
    lifestyle_history = Column(Text, nullable=True)
    dietary_history = Column(Text, nullable=True)
    substance_use_history = Column(Text, nullable=True)
    other_history = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

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
    patient = relationship("Patient", backref="medical_histories", lazy="joined")
    case_session = relationship("CaseSession", backref="medical_histories", lazy="joined")
