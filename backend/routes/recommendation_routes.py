"""
Personalized Recommendation Engine.

Generates actionable recommendations based on the student's weakest
high-impact areas. Rules are transparent and linked to actual feature values.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, StudentProfile
from ..auth import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

# ─── Recommendation rules ─────────────────────────────────────────────────────
# Each rule: condition function + recommendation data
RECOMMENDATION_RULES = [
    {
        "id": "dsa_weak",
        "check": lambda p: (p.dsa or 0) < 5,
        "category": "Technical Skill",
        "priority": 1,
        "title": "Strengthen DSA Skills",
        "description": "Data Structures & Algorithms is the #1 factor in placement tests.",
        "action": "Practice DSA on LeetCode/GeeksforGeeks for 45 min/day for 8 weeks.",
        "expected_impact": "Placement readiness may improve by 8-15%.",
        "icon": "🧩",
    },
    {
        "id": "python_weak",
        "check": lambda p: (p.python_skill or 0) < 5,
        "category": "Technical Skill",
        "priority": 2,
        "title": "Improve Python Proficiency",
        "description": "Python is used in 70%+ of data/AI/backend roles.",
        "action": "Complete a Python project or take a structured course (Udemy/Coursera).",
        "expected_impact": "Opens roles in Data Science, AI/ML, Backend.",
        "icon": "🐍",
    },
    {
        "id": "projects_low",
        "check": lambda p: (p.projects_count or 0) < 2,
        "category": "Projects",
        "priority": 1,
        "title": "Build More Projects",
        "description": "Projects demonstrate practical skills to recruiters.",
        "action": "Build 1-2 full-stack or ML projects and upload to GitHub.",
        "expected_impact": "Placement readiness may improve by 10-15%.",
        "icon": "🚀",
    },
    {
        "id": "certs_low",
        "check": lambda p: (p.certifications_count or 0) < 1,
        "category": "Certification",
        "priority": 2,
        "title": "Get At Least One Certification",
        "description": "Certifications validate skills and improve resume shortlisting.",
        "action": "Complete a free/paid cert: AWS, Google Cloud, Meta, Microsoft, or Coursera.",
        "expected_impact": "Resume shortlisting rate improves significantly.",
        "icon": "🏆",
    },
    {
        "id": "internship_none",
        "check": lambda p: (p.internship_months or 0) == 0,
        "category": "Experience",
        "priority": 1,
        "title": "Get Internship Experience",
        "description": "Internship is one of the top differentiators in campus placements.",
        "action": "Apply to internships on LinkedIn, Internshala, or campus placements.",
        "expected_impact": "Placement readiness may improve by 5-12%.",
        "icon": "💼",
    },
    {
        "id": "communication_weak",
        "check": lambda p: (p.communication or 0) < 6,
        "category": "Soft Skill",
        "priority": 2,
        "title": "Improve Communication Skills",
        "description": "HR rounds and group discussions require strong communication.",
        "action": "Join public speaking clubs, practice mock interviews, and read daily.",
        "expected_impact": "Interview success rate improves noticeably.",
        "icon": "🗣️",
    },
    {
        "id": "aptitude_weak",
        "check": lambda p: (p.aptitude or 0) < 5,
        "category": "Aptitude",
        "priority": 2,
        "title": "Practice Aptitude Tests",
        "description": "Aptitude is tested in almost every company's online screening.",
        "action": "Practice on IndiaBix, PrepInsta for 30 min/day for 6 weeks.",
        "expected_impact": "Passes online screening rounds more reliably.",
        "icon": "📊",
    },
    {
        "id": "cgpa_low",
        "check": lambda p: (p.cgpa or 0) < 7.0,
        "category": "Academic",
        "priority": 1,
        "title": "Improve CGPA",
        "description": "Many top companies have a CGPA cutoff of 7.0 or higher.",
        "action": "Focus on scoring well in upcoming semester exams. Seek tutoring if needed.",
        "expected_impact": "Opens more job opportunities and improves academic score.",
        "icon": "📚",
    },
    {
        "id": "attendance_low",
        "check": lambda p: (p.attendance or 0) < 75,
        "category": "Academic",
        "priority": 2,
        "title": "Improve Attendance",
        "description": "Low attendance affects academics and sometimes eligibility for placements.",
        "action": "Attend all classes. Attendance below 75% may bar from exams.",
        "expected_impact": "Avoids academic penalties and improves CGPA.",
        "icon": "📅",
    },
    {
        "id": "good_profile",
        "check": lambda p: all([
            (p.cgpa or 0) >= 7.5,
            (p.projects_count or 0) >= 3,
            (p.dsa or 0) >= 6,
            (p.communication or 0) >= 6,
        ]),
        "category": "Career",
        "priority": 3,
        "title": "Target Dream Companies",
        "description": "Your profile is strong — time to aim high!",
        "action": "Apply to top-tier companies. Prepare system design and advanced DSA.",
        "expected_impact": "High chance of placement in a top company.",
        "icon": "⭐",
    },
]


@router.get("/")
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate personalized recommendations based on the student's profile.
    Recommendations are ranked by priority and relevance.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.cgpa:
        raise HTTPException(status_code=400, detail="Please complete your profile first.")

    triggered = []
    for rule in RECOMMENDATION_RULES:
        try:
            if rule["check"](profile):
                triggered.append({
                    "id": rule["id"],
                    "category": rule["category"],
                    "priority": rule["priority"],
                    "title": rule["title"],
                    "description": rule["description"],
                    "action": rule["action"],
                    "expected_impact": rule["expected_impact"],
                    "icon": rule["icon"],
                })
        except Exception:
            pass

    # Sort: priority 1 (high) first
    triggered.sort(key=lambda x: x["priority"])

    # Compute a simple "profile completeness" score
    skill_avg = sum([
        profile.dsa or 0, profile.python_skill or 0, profile.java or 0,
        profile.javascript or 0, profile.sql or 0, profile.machine_learning or 0,
        profile.communication or 0, profile.problem_solving or 0, profile.aptitude or 0,
    ]) / 9

    return {
        "total": len(triggered),
        "recommendations": triggered,
        "profile_summary": {
            "skill_average": round(skill_avg, 1),
            "projects": profile.projects_count or 0,
            "certifications": profile.certifications_count or 0,
            "internship_months": profile.internship_months or 0,
            "cgpa": profile.cgpa or 0,
        },
    }


@router.get("/top3")
def get_top3_actions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns top 3 highest priority actions for the student dashboard.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.cgpa:
        return {"top3": []}

    triggered = []
    for rule in RECOMMENDATION_RULES:
        try:
            if rule["check"](profile):
                triggered.append({
                    "title": rule["title"],
                    "action": rule["action"],
                    "impact": rule["expected_impact"],
                    "priority": rule["priority"],
                    "icon": rule["icon"]
                })
        except Exception:
            pass

    triggered.sort(key=lambda x: x["priority"])
    
    # Fallback if profile is already very strong
    if not triggered:
        triggered = [
            {"title": "Target Tier-1 Tech Companies", "action": "Practice advanced DSA & System Design", "impact": "High Impact", "priority": 1, "icon": "⭐"},
            {"title": "Build Open Source Portfolio", "action": "Contribute to popular GitHub repos", "impact": "High Impact", "priority": 2, "icon": "🚀"},
            {"title": "Mock Interview Prep", "action": "Conduct 2 mock technical interviews weekly", "impact": "Medium Impact", "priority": 3, "icon": "🗣️"},
        ]

    return {"top3": triggered[:3]}


@router.get("/roadmap")
def get_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates a personalized 30/60/90 day progression roadmap based on gaps & readiness.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.cgpa:
        raise HTTPException(status_code=400, detail="Please complete your profile first.")

    from ..ml.predictor import predict_placement
    placement = predict_placement(profile)
    curr_readiness = placement["placement_readiness"]

    # Days 1-30: Core Weaknesses (DSA/SQL/Aptitude)
    phase_1 = []
    if (profile.dsa or 0) < 6:
        phase_1.append("Practice DSA patterns (Arrays, Trees, Graphs) 45 min/day")
    if (profile.sql or 0) < 7:
        phase_1.append("Master SQL queries & indexing on LeetCode/Hackerrank")
    if (profile.cgpa or 0) < 7.5:
        phase_1.append("Focus on upcoming semester coursework & mid-terms")
    if not phase_1:
        phase_1.append("Solve 30 LeetCode Medium problem sets")
        phase_1.append("Review Data Structures & Algorithm complexity")

    # Days 31-60: Applied Skills & Projects
    phase_2 = []
    if (profile.projects_count or 0) < 3:
        phase_2.append("Build a production-ready full-stack or ML project")
    if (profile.certifications_count or 0) < 1:
        phase_2.append("Complete 1 industry certification (AWS / Azure / Coursera)")
    if (profile.communication or 0) < 7:
        phase_2.append("Practice technical communication & presentation skills")
    if not phase_2:
        phase_2.append("Deploy microservice backend project to cloud platform")
        phase_2.append("Add Docker & CI/CD workflow to main project")

    # Days 61-90: Placement Readiness & Interview Prep
    phase_3 = [
        "Create an ATS-friendly resume and update GitHub & LinkedIn profile",
        "Participate in mock interviews & company-specific online coding tests",
        "Apply to target companies and attend campus placement drives"
    ]

    r30 = min(100.0, round(curr_readiness + 5.5, 1))
    r60 = min(100.0, round(curr_readiness + 11.0, 1))
    r90 = min(100.0, round(curr_readiness + 16.5, 1))

    return {
        "current_readiness": curr_readiness,
        "progression": [
            {"period": "Current", "readiness": curr_readiness},
            {"period": "30 Days", "readiness": r30},
            {"period": "60 Days", "readiness": r60},
            {"period": "90 Days", "readiness": r90},
        ],
        "roadmap": [
            {
                "phase": "Days 1–30",
                "focus": "Foundation & Skill Gap Mitigation",
                "items": phase_1[:3]
            },
            {
                "phase": "Days 31–60",
                "focus": "Practical Projects & Certifications",
                "items": phase_2[:3]
            },
            {
                "phase": "Days 61–90",
                "focus": "Placement Practice & Mock Interviews",
                "items": phase_3
            }
        ]
    }

