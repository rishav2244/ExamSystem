import uuid
import random
import psycopg2
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()

# --- DATABASE CREDENTIALS ---
DB_CONFIG = {
    "dbname": "examdb",
    "user": "examadmin",
    "password": "examadmin",
    "host": "localhost",
    "port": "5432"
}

# --- PARAMETERS ---
ADMIN_ID = "c9d859a4-0fd2-4360-9d20-91d4f3d8a885" # Replace with your actual UUID
ADMIN_NAME = "Rishav Ganguli"
ADMIN_EMAIL = "rishavagaming@gmail.com"

NUM_EXAMS = 3
CANDIDATES_PER_EXAM = 15

def generate_fake_data():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        print("Connected to PostgreSQL. Starting data generation...")

        # 1. Ensure Admin exists (using ON CONFLICT to avoid errors if already there)
        cur.execute("""
            INSERT INTO users (id, email, password, name, role)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (email) DO NOTHING;
        """, (ADMIN_ID, ADMIN_EMAIL, "hashed_password", ADMIN_NAME, "ADMIN"))

        for _ in range(NUM_EXAMS):
            # 2. Create Exam
            exam_id = str(uuid.uuid4())
            start_time = datetime.now() + timedelta(days=random.randint(1, 10))
            end_time = start_time + timedelta(hours=2)
            cutoff = 60.0
            
            cur.execute("""
                INSERT INTO exam (id, title, duration, start_time, end_time, status, cutoff, total_score, user_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (exam_id, f"{fake.catch_phrase()} Exam", 60, start_time, end_time, "PUBLISHED", cutoff, 100, ADMIN_ID))

            # 3. Create 5 Questions per Exam
            questions = []
            for i in range(5):
                q_id = str(uuid.uuid4())
                cur.execute("INSERT INTO question (id, exam_id, text, marks) VALUES (%s, %s, %s, %s)",
                            (q_id, exam_id, f"What is {fake.word()} {i+1}?", 20))
                
                # 4. Create 4 Options per Question
                options = []
                for j in range(4):
                    opt_id = str(uuid.uuid4())
                    is_correct = (j == 0) # Make the first one correct
                    cur.execute("INSERT INTO option (id, question_id, text, is_correct, option_index) VALUES (%s, %s, %s, %s, %s)",
                                (opt_id, q_id, fake.word(), is_correct, j))
                    options.append(opt_id)
                
                questions.append({"id": q_id, "options": options})

            # 5. Create Candidates and Submissions
            for _ in range(CANDIDATES_PER_EXAM):
                c_email = fake.unique.email()
                c_name = fake.name()
                
                cur.execute("INSERT INTO exam_candidate (id, exam_id, email, name, status) VALUES (%s, %s, %s, %s, %s)",
                            (str(uuid.uuid4()), exam_id, c_email, c_name, "REGISTERED"))

                # 70% chance they actually took the exam
                if random.random() < 0.7:
                    sub_id = str(uuid.uuid4())
                    score = random.randint(30, 100)
                    
                    cur.execute("""
                        INSERT INTO submission (id, exam_id, candidate_name, candidate_email, score, passed, 
                                              time_taken, created_at, submitted_at, status, location, violations)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (sub_id, exam_id, c_name, c_email, score, score >= cutoff, 
                          random.randint(15, 60), datetime.now(), datetime.now(), "COMPLETED", fake.city(), random.randint(0, 2)))

                    # 6. Generate Answers (Selecting random options)
                    for q in questions:
                        selected_opt = random.choice(q["options"])
                        cur.execute("""
                            INSERT INTO answer (id, submission_id, question_id, option_id)
                            VALUES (%s, %s, %s, %s)
                        """, (str(uuid.uuid4()), sub_id, q["id"], selected_opt))

        conn.commit()
        print("Success! Realistic fake data has been injected.")

    except Exception as e:
        print(f"Error: {e}")
        if conn: conn.rollback()
    finally:
        if cur: cur.close()
        if conn: conn.close()

if __name__ == "__main__":
    generate_fake_data()