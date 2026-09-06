from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class CaseResponse(Base):
    __tablename__ = "case_responses"

    id = Column(Integer, primary_key=True, index=True)
    case_session_id = Column(
        Integer,
        ForeignKey("case_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    question_id = Column(
        Integer,
        ForeignKey("case_questions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    original_response = Column(Text, nullable=False)
    response_language = Column(String(10), default="en", nullable=False)
    standardized_response = Column(Text, nullable=True)
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
    case_session = relationship("CaseSession", back_populates="responses")
    question = relationship("CaseQuestion", lazy="joined")
