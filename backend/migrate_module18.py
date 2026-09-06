from app.db.database import engine
from sqlalchemy import text

def run_migration():
    print("Running additive database migration for Module 18...")
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE ai_case_summaries ADD COLUMN IF NOT EXISTS structured_summary JSONB;"))
        conn.execute(text("ALTER TABLE ai_case_summaries ADD COLUMN IF NOT EXISTS information_quality VARCHAR(50) DEFAULT 'PARTIAL';"))
        conn.execute(text("ALTER TABLE ai_case_summaries ADD COLUMN IF NOT EXISTS summary_version INTEGER DEFAULT 1;"))
        conn.commit()
    print("Module 18 database migration completed successfully!")

if __name__ == "__main__":
    run_migration()
