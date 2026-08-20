from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    """Stores login credentials."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=utc_now)


    # One-to-one relationship with student profile
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    predictions = relationship("PredictionLog", back_populates="user", cascade="all, delete-orphan")
    whatif_scenarios = relationship("WhatIfScenario", back_populates="user", cascade="all, delete-orphan")
    snapshots = relationship("TwinSnapshot", back_populates="user", cascade="all, delete-orphan")



class StudentProfile(Base):
    """
    Central Digital Twin model.
    Stores academic info, skills, projects, certifications, career aspirations
    all in one table for simplicity.
    """
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # --- Academic Info ---
    university = Column(String(200), default="")
    degree = Column(String(100), default="B.Tech")
    branch = Column(String(100), default="Computer Science")
    semester = Column(Integer, default=1)
    cgpa = Column(Float, default=0.0)
    attendance = Column(Float, default=75.0)
    # Semester-wise CGPA history: {"sem1": 7.5, "sem2": 7.8, ...}
    sem_grades = Column(JSON, default=dict)
    # Subject-wise marks: {"Mathematics": 75, "Physics": 80, ...}
    subjects = Column(JSON, default=dict)

    # --- Technical Skills (0-10 scale) ---
    java = Column(Float, default=0.0)
    python_skill = Column(Float, default=0.0)
    javascript = Column(Float, default=0.0)
    sql = Column(Float, default=0.0)
    dsa = Column(Float, default=0.0)
    machine_learning = Column(Float, default=0.0)

    # --- Soft Skills (0-10 scale) ---
    communication = Column(Float, default=0.0)
    problem_solving = Column(Float, default=0.0)
    aptitude = Column(Float, default=0.0)

    # --- Achievements ---
    projects_count = Column(Integer, default=0)
    projects_details = Column(JSON, default=list)   # list of {name, desc, tech}
    certifications_count = Column(Integer, default=0)
    certifications_details = Column(JSON, default=list)  # list of {name, provider}
    internship_months = Column(Integer, default=0)
    internship_details = Column(JSON, default=list)   # list of {company, role, duration}
    hackathons = Column(Integer, default=0)

    # --- Career Aspirations ---
    desired_role = Column(String(200), default="")
    preferred_domain = Column(String(200), default="")
    target_companies = Column(Text, default="")
    career_interests = Column(Text, default="")

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


    user = relationship("User", back_populates="profile")


class PredictionLog(Base):
    """Stores AI prediction history for a user."""
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prediction_type = Column(String(50))  # "academic" | "placement" | "skill"
    result = Column(JSON)
    created_at = Column(DateTime, default=utc_now)


    user = relationship("User", back_populates="predictions")


class WhatIfScenario(Base):
    """Stores saved What-If simulation results."""
    __tablename__ = "whatif_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scenario_name = Column(String(200), default="My Scenario")
    changes = Column(JSON)    # what was hypothetically changed
    result = Column(JSON)     # comparison result
    created_at = Column(DateTime, default=utc_now)


    user = relationship("User", back_populates="whatif_scenarios")


class TwinSnapshot(Base):
    """Stores periodic snapshots of the student's Digital Twin for evolution timeline."""
    __tablename__ = "twin_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month_label = Column(String(50))   # e.g., "July", "August"
    readiness_score = Column(Float, default=0.0)
    cgpa = Column(Float, default=0.0)
    twin_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="snapshots")
