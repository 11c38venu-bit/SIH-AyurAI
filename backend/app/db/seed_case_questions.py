from typing import Any
from sqlalchemy.orm import Session
from app.db.database import Base, SessionLocal, engine
from app.models.case_question import CaseQuestion, QuestionType

DEFAULT_QUESTIONS: list[dict[str, Any]] = [
    {
        "question_code": "CHIEF_COMPLAINT_MAIN",
        "category": "CHIEF_COMPLAINT",
        "question_text": "What is your main health concern or reason for consultation today?",
        "question_type": QuestionType.TEXT,
        "options": None,
        "language": "en",
        "is_required": True,
        "display_order": 1,
    },
    {
        "question_code": "CHIEF_COMPLAINT_DURATION",
        "category": "CHIEF_COMPLAINT",
        "question_text": "When did this problem begin / how long have you had it?",
        "question_type": QuestionType.TEXT,
        "options": None,
        "language": "en",
        "is_required": True,
        "display_order": 2,
    },
    {
        "question_code": "CHIEF_COMPLAINT_SEVERITY",
        "category": "CHIEF_COMPLAINT",
        "question_text": "How severe is the problem?",
        "question_type": QuestionType.SINGLE_CHOICE,
        "options": ["Mild", "Moderate", "Severe", "Very Severe"],
        "language": "en",
        "is_required": False,
        "display_order": 3,
    },
    {
        "question_code": "CURRENT_SYMPTOMS_LIST",
        "category": "CURRENT_SYMPTOMS",
        "question_text": "What specific symptoms are you currently experiencing?",
        "question_type": QuestionType.TEXT,
        "options": None,
        "language": "en",
        "is_required": True,
        "display_order": 4,
    },
    {
        "question_code": "PREVIOUS_EPISODES",
        "category": "MEDICAL_HISTORY",
        "question_text": "Have you experienced this or a similar health issue in the past?",
        "question_type": QuestionType.SINGLE_CHOICE,
        "options": ["Never before", "Once or twice before", "Frequent/Chronic recurring issue"],
        "language": "en",
        "is_required": False,
        "display_order": 5,
    },
    {
        "question_code": "CURRENT_MEDICATIONS",
        "category": "MEDICAL_HISTORY",
        "question_text": "Are you currently taking any medications, supplements, or Ayurvedic remedies?",
        "question_type": QuestionType.TEXT,
        "options": None,
        "language": "en",
        "is_required": False,
        "display_order": 6,
    },
    {
        "question_code": "EXISTING_CONDITIONS",
        "category": "MEDICAL_HISTORY",
        "question_text": "Do you have any existing medical conditions (e.g., Diabetes, Hypertension, Thyroid, Asthma)?",
        "question_type": QuestionType.TEXT,
        "options": None,
        "language": "en",
        "is_required": False,
        "display_order": 7,
    },
    {
        "question_code": "KNOWN_ALLERGIES",
        "category": "MEDICAL_HISTORY",
        "question_text": "Do you have any known allergies to foods, medicines, or herbs?",
        "question_type": QuestionType.TEXT,
        "options": None,
        "language": "en",
        "is_required": False,
        "display_order": 8,
    },
    {
        "question_code": "DIGESTION_APPETITE",
        "category": "DIET",
        "question_text": "How would you describe your appetite and digestion?",
        "question_type": QuestionType.SINGLE_CHOICE,
        "options": [
            "Good / Regular",
            "Variable / Unpredictable",
            "Low / Poor appetite",
            "Excessive hunger / Burning sensation"
        ],
        "language": "en",
        "is_required": False,
        "display_order": 9,
    },
    {
        "question_code": "DAILY_WATER_INTAKE",
        "category": "DIET",
        "question_text": "How much water or fluids do you usually drink in a day?",
        "question_type": QuestionType.SINGLE_CHOICE,
        "options": [
            "Less than 1 liter",
            "1 to 2 liters",
            "2 to 3 liters",
            "More than 3 liters"
        ],
        "language": "en",
        "is_required": False,
        "display_order": 10,
    },
    {
        "question_code": "SLEEP_DURATION_HOURS",
        "category": "SLEEP",
        "question_text": "How many hours do you usually sleep at night?",
        "question_type": QuestionType.NUMBER,
        "options": None,
        "language": "en",
        "is_required": False,
        "display_order": 11,
    },
    {
        "question_code": "SLEEP_QUALITY",
        "category": "SLEEP",
        "question_text": "How would you describe the quality of your sleep?",
        "question_type": QuestionType.SINGLE_CHOICE,
        "options": [
            "Sound and restful",
            "Difficulty falling asleep",
            "Disturbed / Frequent waking",
            "Excessive sleepiness / Lethargy"
        ],
        "language": "en",
        "is_required": False,
        "display_order": 12,
    },
    {
        "question_code": "BOWEL_HABITS",
        "category": "LIFESTYLE",
        "question_text": "How are your daily bowel movements?",
        "question_type": QuestionType.SINGLE_CHOICE,
        "options": [
            "Regular daily (normal)",
            "Constipation / Hard stools / Irregular",
            "Loose / Frequent",
            "Alternating constipation and loose stools"
        ],
        "language": "en",
        "is_required": False,
        "display_order": 13,
    },
    {
        "question_code": "PHYSICAL_ACTIVITY_LEVEL",
        "category": "LIFESTYLE",
        "question_text": "How active are you on a typical day?",
        "question_type": QuestionType.SINGLE_CHOICE,
        "options": [
            "Sedentary (mostly sitting)",
            "Mild activity (light walking)",
            "Moderate activity (regular exercise/work)",
            "High physical activity / strenuous labor"
        ],
        "language": "en",
        "is_required": False,
        "display_order": 14,
    },
    {
        "question_code": "STRESS_LEVEL",
        "category": "STRESS",
        "question_text": "How would you rate your current stress level?",
        "question_type": QuestionType.SINGLE_CHOICE,
        "options": [
            "Low / Calm",
            "Moderate / Manageable",
            "High / Overwhelmed",
            "Very High / Chronic anxiety"
        ],
        "language": "en",
        "is_required": False,
        "display_order": 15,
    },
    {
        "question_code": "ADDITIONAL_NOTES",
        "category": "BASIC_INFO",
        "question_text": "Is there anything else you would like the doctor to know?",
        "question_type": QuestionType.TEXT,
        "options": None,
        "language": "en",
        "is_required": False,
        "display_order": 16,
    },
]


def seed_case_questions(db: Session) -> int:
    """
    Seed structured MVP case-taking questions into the database.
    Idempotent: updates existing questions or inserts new ones without duplication.
    """
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    seeded_count = 0
    for q_data in DEFAULT_QUESTIONS:
        existing = db.query(CaseQuestion).filter(
            CaseQuestion.question_code == q_data["question_code"]
        ).first()

        if existing:
            # Update fields to match current definitions
            existing.category = q_data["category"]
            existing.question_text = q_data["question_text"]
            existing.question_type = q_data["question_type"]
            existing.options = q_data["options"]
            existing.language = q_data["language"]
            existing.is_required = q_data["is_required"]
            existing.display_order = q_data["display_order"]
            existing.is_active = True
        else:
            new_q = CaseQuestion(
                question_code=q_data["question_code"],
                category=q_data["category"],
                question_text=q_data["question_text"],
                question_type=q_data["question_type"],
                options=q_data["options"],
                language=q_data["language"],
                is_required=q_data["is_required"],
                display_order=q_data["display_order"],
                is_active=True,
            )
            db.add(new_q)
            seeded_count += 1

    db.commit()
    return seeded_count


def main() -> None:
    db = SessionLocal()
    try:
        count = seed_case_questions(db)
        total = db.query(CaseQuestion).count()
        print(f"Case questions seed complete: {count} newly inserted, {total} total active questions in database.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
