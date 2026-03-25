import psycopg2
import uuid
import random
from datetime import datetime, timedelta
from faker import Faker

# --- CONFIGURATION ---
DB_CONFIG = {
    "dbname": "examdb",
    "user": "examadmin",
    "password": "examadmin",
    "host": "localhost",
    "port": "5432"
}

ADMIN_USER_ID = "a5228136-3007-4e8e-ac3b-6466334e538d"
NUM_EXAMS = 50
SUBMISSIONS_PER_EXAM = 4

fake = Faker()

def generate_bulk_data():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        print("Connected to PostgreSQL successfully.")

        for i in range(NUM_EXAMS):
            # 1. Generate Exam
            exam_id = str(uuid.uuid4())
            exam_title = f"{fake.job()} Certification - Level {random.randint(1, 5)}"
            duration = random.choice([30, 60, 90, 120])
            start_time = datetime.now() + timedelta(days=random.randint(-10, 10))
            end_time = start_time + timedelta(hours=24)
            cutoff = 40.0
            total_score = 100
            status = "PUBLISHED"

            cur.execute("""
                INSERT INTO exam (id, title, duration, start_time, end_time, status, cutoff, total_score, user_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (exam_id, exam_title, duration, start_time, end_time, status, cutoff, total_score, ADMIN_USER_ID))

            # 2. Generate Submissions for this Exam
            for _ in range(SUBMISSIONS_PER_EXAM):
                sub_id = str(uuid.uuid4())
                name = fake.name()
                email = fake.unique.email() # Ensures no repeated emails across the whole set
                score = round(random.uniform(20.0, 95.0), 2)
                passed = score >= cutoff
                time_taken = random.randint(15, duration)
                created_at = datetime.now()
                submitted_at = created_at + timedelta(minutes=time_taken)
                sub_status = "COMPLETED"
                location = fake.city()
                violations = random.randint(0, 3)

                cur.execute("""
                    INSERT INTO submission (
                        id, exam_id, candidate_name, candidate_email, score, 
                        passed, time_taken, created_at, submitted_at, status, 
                        mailed, location, violations
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    sub_id, exam_id, name, email, score, 
                    passed, time_taken, created_at, submitted_at, sub_status, 
                    False, location, violations
                ))

            print(f"Inserted Exam {i+1}/{NUM_EXAMS}: {exam_title}")

        conn.commit()
        print("\nSuccess! Database has been flooded with test data.")

    except Exception as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if cur: cur.close()
        if conn: conn.close()

if __name__ == "__main__":
    generate_bulk_data()