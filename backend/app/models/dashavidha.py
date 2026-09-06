from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class DashavidhaPariksha(Base):
    __tablename__ = "dashavidha_pariksha"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(
        Integer,
        ForeignKey("ayurvedic_assessments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    # Ten Assessment Dimensions (Dashavidha Pariksha)
    prakriti = Column(Text, nullable=True)        # Constitution assessment
    vikriti = Column(Text, nullable=True)         # Pathological state assessment
    sara = Column(Text, nullable=True)            # Tissue excellence / essence
    samhana = Column(Text, nullable=True)         # Body compactness / build
    pramana = Column(Text, nullable=True)         # Body proportions / measurements
    satmya = Column(Text, nullable=True)          # Habituation / adaptability
    sattva = Column(Text, nullable=True)          # Mental stamina / temperament
    ahara_shakti = Column(Text, nullable=True)    # Digestive and food intake capacity
    vyayama_shakti = Column(Text, nullable=True)  # Exercise / physical capacity
    vaya = Column(Text, nullable=True)            # Age / chronological & biological stage

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
    assessment = relationship("AyurvedicAssessment", back_populates="dashavidha")
