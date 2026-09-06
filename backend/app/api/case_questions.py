from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.deps import require_admin, require_staff
from app.db.database import get_db
from app.models.case_question import CaseQuestion
from app.models.user import User
from app.schemas.case import (
    CaseQuestionCreate,
    CaseQuestionResponse,
    CaseQuestionUpdate,
)

router = APIRouter(
    prefix="/case-questions",
    tags=["Case Questions Management"]
)


@router.get("/", response_model=list[CaseQuestionResponse])
def list_case_questions(
    category: Optional[str] = Query(None, description="Filter questions by category"),
    include_inactive: bool = Query(False, description="Include inactive questions (Admin/Staff view)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve all structured case-taking questions ordered by display_order.
    Accessible by STAFF, DOCTOR, and ADMIN.
    """
    query = db.query(CaseQuestion)

    if not include_inactive:
        query = query.filter(CaseQuestion.is_active == True)  # noqa: E712

    if category:
        query = query.filter(CaseQuestion.category == category)

    return query.order_by(CaseQuestion.display_order.asc(), CaseQuestion.id.asc()).all()


@router.get("/{question_id}", response_model=CaseQuestionResponse)
def get_case_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """
    Retrieve a specific question by ID.
    Accessible by STAFF, DOCTOR, and ADMIN.
    """
    question = db.query(CaseQuestion).filter(CaseQuestion.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {question_id} not found"
        )
    return question


@router.post("/", response_model=CaseQuestionResponse, status_code=status.HTTP_201_CREATED)
def create_case_question(
    payload: CaseQuestionCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    Create a new structured case question.
    Restricted to ADMIN role.
    """
    existing = db.query(CaseQuestion).filter(
        CaseQuestion.question_code == payload.question_code
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Question code '{payload.question_code}' already exists"
        )

    new_q = CaseQuestion(
        question_code=payload.question_code,
        category=payload.category,
        question_text=payload.question_text,
        question_type=payload.question_type,
        options=payload.options,
        language=payload.language,
        is_required=payload.is_required,
        display_order=payload.display_order,
        is_active=payload.is_active,
    )

    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q


@router.patch("/{question_id}", response_model=CaseQuestionResponse)
def update_case_question(
    question_id: int,
    payload: CaseQuestionUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    Update an existing question (text, category, options, display_order, is_active).
    Restricted to ADMIN role.
    """
    question = db.query(CaseQuestion).filter(CaseQuestion.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID {question_id} not found"
        )

    update_data = payload.model_dump(exclude_unset=True)

    # Check question_code uniqueness if updated
    if "question_code" in update_data and update_data["question_code"] != question.question_code:
        existing = db.query(CaseQuestion).filter(
            CaseQuestion.question_code == update_data["question_code"]
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question code '{update_data['question_code']}' already exists"
            )

    for field, value in update_data.items():
        setattr(question, field, value)

    db.commit()
    db.refresh(question)
    return question
