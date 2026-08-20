"""
Pydantic schemas for request/response validation.
Keeps API contracts clean and self-documenting.
"""
from __future__ import annotations
from typing import Optional, Dict, List, Any
from pydantic import BaseModel, EmailStr


# ─── Auth ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str


# ─── Student Profile ─────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    # Academic
    university: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[int] = None
    cgpa: Optional[float] = None
    attendance: Optional[float] = None
    sem_grades: Optional[Dict[str, float]] = None
    subjects: Optional[Dict[str, float]] = None

    # Technical Skills
    java: Optional[float] = None
    python_skill: Optional[float] = None
    javascript: Optional[float] = None
    sql: Optional[float] = None
    dsa: Optional[float] = None
    machine_learning: Optional[float] = None

    # Soft Skills
    communication: Optional[float] = None
    problem_solving: Optional[float] = None
    aptitude: Optional[float] = None

    # Achievements
    projects_count: Optional[int] = None
    projects_details: Optional[List[Dict]] = None
    certifications_count: Optional[int] = None
    certifications_details: Optional[List[Dict]] = None
    internship_months: Optional[int] = None
    internship_details: Optional[List[Dict]] = None
    hackathons: Optional[int] = None

    # Career
    desired_role: Optional[str] = None
    preferred_domain: Optional[str] = None
    target_companies: Optional[str] = None
    career_interests: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    university: str
    degree: str
    branch: str
    semester: int
    cgpa: float
    attendance: float
    sem_grades: Dict
    subjects: Dict
    java: float
    python_skill: float
    javascript: float
    sql: float
    dsa: float
    machine_learning: float
    communication: float
    problem_solving: float
    aptitude: float
    projects_count: int
    projects_details: List
    certifications_count: int
    certifications_details: List
    internship_months: int
    internship_details: List
    hackathons: int
    desired_role: str
    preferred_domain: str
    target_companies: str
    career_interests: str

    class Config:
        from_attributes = True


# ─── What-If ─────────────────────────────────────────────────────────────────

class WhatIfRequest(BaseModel):
    """Hypothetical changes to simulate. Only include fields to change."""
    java: Optional[float] = None
    python_skill: Optional[float] = None
    javascript: Optional[float] = None
    sql: Optional[float] = None
    dsa: Optional[float] = None
    machine_learning: Optional[float] = None
    communication: Optional[float] = None
    problem_solving: Optional[float] = None
    aptitude: Optional[float] = None
    projects_count: Optional[int] = None
    certifications_count: Optional[int] = None
    internship_months: Optional[int] = None
    cgpa: Optional[float] = None
    attendance: Optional[float] = None
    scenario_name: Optional[str] = "My Scenario"
