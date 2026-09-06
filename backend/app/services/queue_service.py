import re
from datetime import date, datetime, timezone
from typing import Optional, Sequence
from fastapi import HTTPException, status
from sqlalchemy import case
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.queue import PatientQueue, QueuePriority, QueueStatus

ACTIVE_QUEUE_STATUSES: Sequence[QueueStatus] = [
    QueueStatus.WAITING,
    QueueStatus.CALLED,
    QueueStatus.IN_CONSULTATION,
]


def get_active_queue_entry_for_patient(
    db: Session,
    patient_id: int,
    queue_date: date
) -> Optional[PatientQueue]:
    """
    Check if a patient already has an active queue entry for the given date.
    Active statuses include WAITING, CALLED, and IN_CONSULTATION.
    """
    return (
        db.query(PatientQueue)
        .filter(
            PatientQueue.patient_id == patient_id,
            PatientQueue.queue_date == queue_date,
            PatientQueue.status.in_(ACTIVE_QUEUE_STATUSES)
        )
        .first()
    )


def generate_daily_token_number(db: Session, queue_date: date) -> str:
    """
    Generate the next sequential daily token number (e.g. A001, A002, A003...).
    Token sequences restart for every new queue_date.

    Concurrency & Architecture Note:
    For demo/hackathon deployment, this finds the highest existing token number
    for the given date and increments it. In high-concurrency multi-worker
    production, this can be backed by a PostgreSQL sequence or Redis atomic counter.
    """
    existing_tokens = (
        db.query(PatientQueue.token_number)
        .filter(PatientQueue.queue_date == queue_date)
        .all()
    )

    max_sequence = 0
    token_pattern = re.compile(r"^([A-Z])(\d+)$")

    for (token_str,) in existing_tokens:
        match = token_pattern.match(token_str)
        if match:
            try:
                num = int(match.group(2))
                if num > max_sequence:
                    max_sequence = num
            except ValueError:
                continue

    next_sequence = max_sequence + 1
    return f"A{next_sequence:03d}"


def create_patient_queue_token(
    db: Session,
    patient_id: int,
    priority: QueuePriority = QueuePriority.NORMAL,
    queue_date: Optional[date] = None
) -> PatientQueue:
    """
    Generate a new queue token for a registered patient.
    Prevents duplicate active tokens for the same patient on the same date.
    """
    if queue_date is None:
        queue_date = date.today()

    # 1. Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with database ID {patient_id} not found"
        )

    # 2. Check for existing active token on the same date
    active_entry = get_active_queue_entry_for_patient(db, patient_id, queue_date)
    if active_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Patient already has an active token for {queue_date}: "
                f"{active_entry.token_number} (Status: {active_entry.status.value}). "
                f"Complete or cancel the active token before issuing a new one."
            )
        )

    # 3. Generate daily token number
    token_number = generate_daily_token_number(db, queue_date)

    # 4. Create queue record
    new_entry = PatientQueue(
        patient_id=patient_id,
        token_number=token_number,
        queue_date=queue_date,
        status=QueueStatus.WAITING,
        priority=priority,
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return new_entry


def get_today_queue_list(
    db: Session,
    queue_date: Optional[date] = None,
    status_filter: Optional[QueueStatus] = None
) -> list[PatientQueue]:
    """
    Retrieve queue for a date, ordered logically:
    1. PRIORITY patients first, then NORMAL patients.
    2. Within each priority group, ordered by earliest creation time.
    """
    if queue_date is None:
        queue_date = date.today()

    query = db.query(PatientQueue).filter(PatientQueue.queue_date == queue_date)

    if status_filter:
        query = query.filter(PatientQueue.status == status_filter)

    # Order PRIORITY first, then by created_at ascending
    priority_order = case(
        (PatientQueue.priority == QueuePriority.PRIORITY, 1),
        else_=2
    )

    return query.order_by(priority_order, PatientQueue.created_at.asc(), PatientQueue.id.asc()).all()


def get_patient_queue_history(db: Session, patient_id: int) -> list[PatientQueue]:
    """
    Retrieve all queue entries for a given patient, newest first.
    """
    return (
        db.query(PatientQueue)
        .filter(PatientQueue.patient_id == patient_id)
        .order_by(PatientQueue.queue_date.desc(), PatientQueue.created_at.desc())
        .all()
    )


def update_queue_entry_status(
    db: Session,
    queue_id: int,
    new_status: QueueStatus
) -> PatientQueue:
    """
    Update queue entry status and maintain lifecycle timestamps.
    """
    entry = db.query(PatientQueue).filter(PatientQueue.id == queue_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Queue entry with ID {queue_id} not found"
        )

    entry.status = new_status
    now = datetime.now(timezone.utc)

    if new_status == QueueStatus.CALLED and entry.called_at is None:
        entry.called_at = now
    elif new_status in (QueueStatus.COMPLETED, QueueStatus.CANCELLED) and entry.completed_at is None:
        entry.completed_at = now

    db.commit()
    db.refresh(entry)
    return entry


def update_queue_entry_priority(
    db: Session,
    queue_id: int,
    new_priority: QueuePriority
) -> PatientQueue:
    """
    Update queue priority (NORMAL vs PRIORITY).
    """
    entry = db.query(PatientQueue).filter(PatientQueue.id == queue_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Queue entry with ID {queue_id} not found"
        )

    entry.priority = new_priority
    db.commit()
    db.refresh(entry)
    return entry
