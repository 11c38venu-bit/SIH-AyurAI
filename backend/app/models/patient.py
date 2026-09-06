from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func

from app.db.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(50), unique=True, nullable=False, index=True)

    full_name = Column(String(150), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)

    phone = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)

    preferred_language = Column(String(10), default="en")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )