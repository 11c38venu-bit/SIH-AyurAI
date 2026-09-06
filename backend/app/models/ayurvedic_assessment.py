import enum
from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class AssessmentStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    COMPLETED = "COMPLETED"
    VERIFIED = "VERIFIED"


class PrakritiType(str, enum.Enum):
    VATA = "VATA"
    PITTA = "PITTA"
    KAPHA = "KAPHA"
    VATA_PITTA = "VATA_PITTA"
    PITTA_KAPHA = "PITTA_KAPHA"
    VATA_KAPHA = "VATA_KAPHA"
    TRIDOSHA = "TRIDOSHA"
    NOT_ASSESSED = "NOT_ASSESSED"


class VikritiType(str, enum.Enum):
    VATA = "VATA"
    PITTA = "PITTA"
    KAPHA = "KAPHA"
    VATA_PITTA = "VATA_PITTA"
    PITTA_KAPHA = "PITTA_KAPHA"
    VATA_KAPHA = "VATA_KAPHA"
    TRIDOSHA = "TRIDOSHA"
    NOT_ASSESSED = "NOT_ASSESSED"


class AgniType(str, enum.Enum):
    SAMA = "SAMA"
    VISHAMA = "VISHAMA"
    TIKSHNA = "TIKSHNA"
    MANDA = "MANDA"
    NOT_ASSESSED = "NOT_ASSESSED"


class AyurvedicAssessment(Base):
    __tablename__ = "ayurvedic_assessments"

    id = Column(Integer, primary_key=True, index=True)
    case_session_id = Column(
        Integer,
        ForeignKey("case_sessions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    practitioner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    status = Column(
        Enum(AssessmentStatus, name="assessment_status", native_enum=False),
        default=AssessmentStatus.DRAFT,
        nullable=False,
        index=True
    )
    prakriti = Column(
        Enum(PrakritiType, name="prakriti_type", native_enum=False),
        default=PrakritiType.NOT_ASSESSED,
        nullable=False
    )
    vikriti = Column(
        Enum(VikritiType, name="vikriti_type", native_enum=False),
        default=VikritiType.NOT_ASSESSED,
        nullable=False
    )
    agni = Column(
        Enum(AgniType, name="agni_type", native_enum=False),
        default=AgniType.NOT_ASSESSED,
        nullable=False
    )

    # Practitioner-entered observations
    clinical_observation = Column(Text, nullable=True)
    examination_notes = Column(Text, nullable=True)
    assessment_notes = Column(Text, nullable=True)
    practitioner_observations = Column(Text, nullable=True)

    # Verification workflow
    is_practitioner_verified = Column(Boolean, default=False, nullable=False, index=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

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
    case_session = relationship("CaseSession", backref="ayurvedic_assessment", lazy="joined")
    patient = relationship("Patient", lazy="joined")
    practitioner = relationship("User", lazy="joined")
    ashtavidha = relationship(
        "AshtavidhaPariksha",
        uselist=False,
        back_populates="assessment",
        cascade="all, delete-orphan",
        lazy="joined"
    )
    dashavidha = relationship(
        "DashavidhaPariksha",
        uselist=False,
        back_populates="assessment",
        cascade="all, delete-orphan",
        lazy="joined"
    )
