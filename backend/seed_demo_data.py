"""
Seed Demo Account for NextTwin.

Creates a ready-to-use demo student account:
  Email:    demo@nexttwin.com
  Password: Demo@1234

Run:
  python -m backend.seed_demo_data
"""
import sys
import os

# Add root to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.database import SessionLocal, create_tables
from backend.models import User, StudentProfile
from backend.auth import hash_password

def seed():
    create_tables()
    db = SessionLocal()
    try:
        demo_email = "demo@nexttwin.com"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                name="Arpit Sharma",
                email=demo_email,
                password_hash=hash_password("Demo@1234"),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print("✓ Created demo user: demo@nexttwin.com / Demo@1234")

        # Create or update profile
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if not profile:
            profile = StudentProfile(user_id=user.id)
            db.add(profile)

        profile.university = "RGPV University"
        profile.degree = "B.Tech"
        profile.branch = "Computer Science"
        profile.semester = 7
        profile.cgpa = 8.1
        profile.attendance = 85.0
        profile.sem_grades = {"sem1": 7.8, "sem2": 8.0, "sem3": 7.9, "sem4": 8.2, "sem5": 8.1, "sem6": 8.3}
        profile.subjects = {"DSA": 82, "DBMS": 88, "OS": 78, "CN": 80, "ML": 85}

        # Skills
        profile.java = 7.5
        profile.python_skill = 8.0
        profile.javascript = 7.0
        profile.sql = 8.5
        profile.dsa = 4.5  # INTENTIONALLY LOW FOR WHAT-IF DEMO
        profile.machine_learning = 7.0
        profile.communication = 7.5
        profile.problem_solving = 7.0
        profile.aptitude = 6.5

        # Achievements
        profile.projects_count = 3
        profile.projects_details = [
            {"name": "NextTwin - Student Digital Twin", "tech": "React, FastAPI, Scikit-Learn"},
            {"name": "E-Commerce Microservices", "tech": "Java, Spring Boot, MySQL"},
            {"name": "Smart Health Predictor", "tech": "Python, Flask, XGBoost"}
        ]
        profile.certifications_count = 2
        profile.certifications_details = [
            {"name": "AWS Certified Cloud Practitioner", "provider": "Amazon"},
            {"name": "Machine Learning Specialization", "provider": "Coursera"}
        ]
        profile.internship_months = 3
        profile.internship_details = [
            {"company": "TechCorp India", "role": "Software Engineering Intern", "duration": "3 months"}
        ]
        profile.hackathons = 2

        # Career Aspirations
        profile.desired_role = "Software Developer"
        profile.preferred_domain = "AI & Machine Learning"
        profile.target_companies = "Google, Amazon, Microsoft, TCS Digital"
        profile.career_interests = "Building scalable full-stack applications and AI models"

        db.commit()

        # Seed historical TwinSnapshots
        from backend.models import TwinSnapshot
        db.query(TwinSnapshot).filter(TwinSnapshot.user_id == user.id).delete()
        history_snaps = [
            TwinSnapshot(user_id=user.id, month_label="July", readiness_score=52.0, cgpa=7.8, twin_score=58.0),
            TwinSnapshot(user_id=user.id, month_label="August", readiness_score=58.5, cgpa=7.9, twin_score=62.5),
            TwinSnapshot(user_id=user.id, month_label="September", readiness_score=64.0, cgpa=8.0, twin_score=66.8),
            TwinSnapshot(user_id=user.id, month_label="October", readiness_score=71.4, cgpa=8.1, twin_score=72.5),
        ]
        db.add_all(history_snaps)
        db.commit()

        print("✓ Digital Twin profile & historical snapshots seeded for Arpit Sharma!")


    finally:
        db.close()

if __name__ == "__main__":
    seed()
