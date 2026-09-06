from datetime import datetime


def generate_patient_id(sequence: int) -> str:
    year = datetime.now().strftime("%Y")
    return f"PAT-{year}-{sequence:06d}"