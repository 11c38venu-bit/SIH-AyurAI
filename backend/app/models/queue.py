import enum
from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class QueueStatus(str, enum.Enum):
    WAITING = "WAITING"
    CALLED = "CALLED"
    IN_CONSULTATION = "IN_CONSULTATION"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class QueuePriority(str, enum.Enum):
    NORMAL = "NORMAL"
    PRIORITY = "PRIORITY"


class PatientQueue(Base):
    __tablename__ = "patient_queues"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    token_number = Column(String(20), nullable=False, index=True)
    queue_date = Column(
        Date,
        nullable=False,
        index=True,
        server_default=func.current_date()
    )
    status = Column(
        Enum(QueueStatus, name="queue_status", native_enum=False),
        default=QueueStatus.WAITING,
        nullable=False,
        index=True
    )
    priority = Column(
        Enum(QueuePriority, name="queue_priority", native_enum=False),
        default=QueuePriority.NORMAL,
        nullable=False,
        index=True
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    called_at = Column(
        DateTime(timezone=True),
        nullable=True
    )
    completed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationship to Patient model
    patient = relationship("Patient", backref="queue_entries", lazy="joined")
