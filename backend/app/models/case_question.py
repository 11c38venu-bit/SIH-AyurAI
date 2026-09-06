import enum
from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, JSON, String, Text
from sqlalchemy.sql import func
from app.db.database import Base


class QuestionType(str, enum.Enum):
    TEXT = "TEXT"
    SINGLE_CHOICE = "SINGLE_CHOICE"
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    NUMBER = "NUMBER"
    BOOLEAN = "BOOLEAN"


class CaseQuestion(Base):
    __tablename__ = "case_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_code = Column(String(50), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(
        Enum(QuestionType, name="question_type", native_enum=False),
        default=QuestionType.TEXT,
        nullable=False
    )
    options = Column(JSON, nullable=True)  # List of string options for choice types
    language = Column(String(10), default="en", nullable=False)
    is_required = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
