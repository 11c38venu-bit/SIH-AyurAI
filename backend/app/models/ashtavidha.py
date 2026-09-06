from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class AshtavidhaPariksha(Base):
    __tablename__ = "ashtavidha_pariksha"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(
        Integer,
        ForeignKey("ayurvedic_assessments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    # Eight Examination Components (Ashtavidha Pariksha)
    nadi = Column(Text, nullable=True)     # Pulse examination
    mutra = Column(Text, nullable=True)    # Urine examination
    mala = Column(Text, nullable=True)     # Feces/stool examination
    jihva = Column(Text, nullable=True)    # Tongue examination
    shabda = Column(Text, nullable=True)   # Voice/Speech examination
    sparsha = Column(Text, nullable=True)  # Touch/Skin examination
    druk = Column(Text, nullable=True)     # Eyes/Vision examination
    akriti = Column(Text, nullable=True)   # General body build/posture

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

    # Relationship
    assessment = relationship("AyurvedicAssessment", back_populates="ashtavidha")
