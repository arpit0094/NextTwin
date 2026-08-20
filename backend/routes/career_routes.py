"""
Career Compatibility Engine.

Uses a weighted scoring approach (transparent and explainable) to rank
career roles based on the student's skill profile. Each role has a defined
set of feature weights that represent what's important for that career.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List

from ..database import get_db
from ..models import User, StudentProfile
from ..auth import get_current_user

router = APIRouter(prefix="/career", tags=["Career"])

# ─── Career Role Definitions ─────────────────────────────────────────────────
# Each role specifies: feature weights (must sum to 1.0) + description
CAREER_ROLES: Dict[str, Dict] = {
    "Software Developer": {
        "weights": {
            "dsa": 0.20, "python_skill": 0.15, "java": 0.15,
            "javascript": 0.15, "problem_solving": 0.15,
            "communication": 0.10, "projects_count_norm": 0.10,
        },
        "description": "Develops general-purpose software and web applications",
        "key_skills": ["DSA", "Java", "JavaScript", "Python"],
    },
    "Java Developer": {
        "weights": {
            "java": 0.30, "dsa": 0.20, "sql": 0.15,
            "problem_solving": 0.15, "projects_count_norm": 0.10,
            "communication": 0.10,
        },
        "description": "Builds Java-based enterprise applications",
        "key_skills": ["Java", "DSA", "SQL"],
    },
    "Backend Developer": {
        "weights": {
            "python_skill": 0.20, "java": 0.15, "sql": 0.20,
            "dsa": 0.20, "problem_solving": 0.15, "projects_count_norm": 0.10,
        },
        "description": "Builds server-side APIs and database-driven systems",
        "key_skills": ["Python/Java", "SQL", "DSA"],
    },
    "Data Analyst": {
        "weights": {
            "sql": 0.25, "python_skill": 0.20, "aptitude": 0.20,
            "communication": 0.15, "machine_learning": 0.10, "problem_solving": 0.10,
        },
        "description": "Analyzes data and creates insights for business decisions",
        "key_skills": ["SQL", "Python", "Aptitude"],
    },
    "Data Scientist": {
        "weights": {
            "python_skill": 0.25, "machine_learning": 0.25, "sql": 0.15,
            "problem_solving": 0.15, "aptitude": 0.10, "communication": 0.10,
        },
        "description": "Builds predictive models and performs advanced analytics",
        "key_skills": ["Python", "Machine Learning", "SQL"],
    },
    "AI/ML Engineer": {
        "weights": {
            "machine_learning": 0.30, "python_skill": 0.25, "dsa": 0.15,
            "problem_solving": 0.15, "sql": 0.10, "projects_count_norm": 0.05,
        },
        "description": "Develops and deploys machine learning models",
        "key_skills": ["ML", "Python", "DSA"],
    },
    "QA Engineer": {
        "weights": {
            "problem_solving": 0.25, "communication": 0.20, "python_skill": 0.15,
            "aptitude": 0.20, "sql": 0.10, "javascript": 0.10,
        },
        "description": "Ensures software quality through testing and automation",
        "key_skills": ["Problem Solving", "Communication", "Python"],
    },
    "Business Analyst": {
        "weights": {
            "communication": 0.30, "aptitude": 0.25, "sql": 0.15,
            "problem_solving": 0.20, "python_skill": 0.10,
        },
        "description": "Bridges business needs and technical implementation",
        "key_skills": ["Communication", "Aptitude", "SQL"],
    },
}


def _compute_compatibility(profile: StudentProfile, role_weights: Dict) -> float:
    """Score a career role for this student. Returns 0-100."""
    skill_map = {
        "dsa": profile.dsa or 0,
        "python_skill": profile.python_skill or 0,
        "java": profile.java or 0,
        "javascript": profile.javascript or 0,
        "sql": profile.sql or 0,
        "machine_learning": profile.machine_learning or 0,
        "communication": profile.communication or 0,
        "problem_solving": profile.problem_solving or 0,
        "aptitude": profile.aptitude or 0,
        "projects_count_norm": min((profile.projects_count or 0) / 8.0, 1.0) * 10,
    }

    score = 0.0
    for feat, weight in role_weights.items():
        val = skill_map.get(feat, 0) / 10.0  # normalize to 0-1
        score += val * weight

    # CGPA bonus (up to +10%)
    cgpa_bonus = max(0, ((profile.cgpa or 0) - 6.0) / 4.0) * 0.10
    score = score * 0.90 + cgpa_bonus

    return round(score * 100, 1)


def _build_career_explanation(profile: StudentProfile, role_name: str, role_info: Dict) -> List[str]:
    """Generate plain-language explanation for career recommendation."""
    explanations = []
    skill_map = {
        "dsa": ("DSA", profile.dsa),
        "python_skill": ("Python", profile.python_skill),
        "java": ("Java", profile.java),
        "javascript": ("JavaScript", profile.javascript),
        "sql": ("SQL", profile.sql),
        "machine_learning": ("Machine Learning", profile.machine_learning),
        "communication": ("Communication", profile.communication),
        "problem_solving": ("Problem Solving", profile.problem_solving),
        "aptitude": ("Aptitude", profile.aptitude),
    }
    key_weights = {k: v for k, v in role_info["weights"].items() if k in skill_map}
    for feat, weight in sorted(key_weights.items(), key=lambda x: x[1], reverse=True)[:4]:
        label, val = skill_map.get(feat, (feat, 0))
        val = val or 0
        if val >= 7:
            explanations.append(f"Strong {label} ({val}/10)")
        elif val >= 5:
            explanations.append(f"Moderate {label} ({val}/10)")
        else:
            explanations.append(f"Improve {label} ({val}/10) to boost compatibility")
    if (profile.projects_count or 0) >= 3:
        explanations.append(f"{profile.projects_count} projects demonstrate practical experience")
    return explanations


@router.get("/compatibility")
def get_career_compatibility(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Calculate compatibility score for 8 career roles.
    Returns ranked list with scores and explanations.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.cgpa:
        raise HTTPException(status_code=400, detail="Please complete your profile first.")

    results = []
    for role_name, role_info in CAREER_ROLES.items():
        score = _compute_compatibility(profile, role_info["weights"])
        explanations = _build_career_explanation(profile, role_name, role_info)
        results.append({
            "role": role_name,
            "score": score,
            "description": role_info["description"],
            "key_skills": role_info["key_skills"],
            "explanation": explanations,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return {
        "recommended_role": results[0]["role"],
        "roles": results,
    }

ROLE_BENCHMARKS = {
    "Java Developer": {
        "java": 8.0, "dsa": 7.0, "sql": 7.5, "javascript": 5.0,
        "communication": 7.0, "problem_solving": 7.5, "projects_count": 3,
        "certifications_count": 1, "internship_months": 3
    },
    "Software Developer": {
        "dsa": 8.0, "python_skill": 7.0, "java": 7.0, "sql": 7.0,
        "communication": 7.5, "problem_solving": 8.0, "projects_count": 3,
        "certifications_count": 1, "internship_months": 3
    },
    "Backend Developer": {
        "python_skill": 8.0, "java": 7.5, "sql": 8.5, "dsa": 7.5,
        "problem_solving": 8.0, "communication": 7.0, "projects_count": 3,
        "certifications_count": 1, "internship_months": 3
    },
    "Data Analyst": {
        "sql": 8.5, "python_skill": 8.0, "aptitude": 7.5, "communication": 7.5,
        "machine_learning": 5.0, "problem_solving": 7.0, "projects_count": 2,
        "certifications_count": 1, "internship_months": 2
    },
    "Data Scientist": {
        "python_skill": 8.5, "machine_learning": 8.5, "sql": 8.0,
        "problem_solving": 8.0, "aptitude": 7.5, "dsa": 6.5, "projects_count": 3,
        "certifications_count": 2, "internship_months": 3
    },
    "AI/ML Engineer": {
        "machine_learning": 8.5, "python_skill": 8.5, "dsa": 7.5,
        "problem_solving": 8.0, "sql": 7.0, "projects_count": 3,
        "certifications_count": 2, "internship_months": 3
    },
    "QA Engineer": {
        "problem_solving": 7.5, "communication": 8.0, "python_skill": 6.5,
        "aptitude": 7.5, "sql": 6.5, "projects_count": 2,
        "certifications_count": 1, "internship_months": 2
    },
    "Business Analyst": {
        "communication": 8.5, "aptitude": 8.0, "sql": 7.5,
        "problem_solving": 7.5, "python_skill": 5.5, "projects_count": 2,
        "certifications_count": 1, "internship_months": 2
    },
}

FEATURE_NAME_MAP = {
    "java": "Java",
    "python_skill": "Python",
    "javascript": "JavaScript",
    "sql": "SQL",
    "dsa": "DSA",
    "machine_learning": "Machine Learning",
    "communication": "Communication",
    "problem_solving": "Problem Solving",
    "aptitude": "Aptitude",
    "projects_count": "Projects",
    "certifications_count": "Certifications",
    "internship_months": "Internship Experience (months)"
}

@router.get("/gap")
def get_career_gap_analysis(
    role: str = "Software Developer",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Career Gap Analyzer: Compares student's Digital Twin against target role benchmark.
    Returns per-skill gap matrix, readiness score, and top priorities.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.cgpa:
        raise HTTPException(status_code=400, detail="Please complete your profile first.")

    target_benchmarks = ROLE_BENCHMARKS.get(role, ROLE_BENCHMARKS["Software Developer"])

    student_data = {
        "java": profile.java or 0.0,
        "python_skill": profile.python_skill or 0.0,
        "javascript": profile.javascript or 0.0,
        "sql": profile.sql or 0.0,
        "dsa": profile.dsa or 0.0,
        "machine_learning": profile.machine_learning or 0.0,
        "communication": profile.communication or 0.0,
        "problem_solving": profile.problem_solving or 0.0,
        "aptitude": profile.aptitude or 0.0,
        "projects_count": profile.projects_count or 0,
        "certifications_count": profile.certifications_count or 0,
        "internship_months": profile.internship_months or 0,
    }

    matrix = []
    total_met = 0
    total_items = len(target_benchmarks)

    strongest = []
    weakest = []
    top_to_improve = []

    for key, required in target_benchmarks.items():
        curr = student_data.get(key, 0)
        gap = round(max(0, required - curr), 1)
        
        if gap == 0:
            status = "met"  # ✓
            total_met += 1
            strongest.append(FEATURE_NAME_MAP.get(key, key))
        elif gap <= 1.5:
            status = "moderate"  # ⚠️
            total_met += 0.6
            weakest.append(FEATURE_NAME_MAP.get(key, key))
            top_to_improve.append({"skill": FEATURE_NAME_MAP.get(key, key), "gap": gap})
        else:
            status = "critical"  # ✗
            total_met += 0.2
            weakest.append(FEATURE_NAME_MAP.get(key, key))
            top_to_improve.append({"skill": FEATURE_NAME_MAP.get(key, key), "gap": gap})

        matrix.append({
            "key": key,
            "label": FEATURE_NAME_MAP.get(key, key),
            "current": curr,
            "required": required,
            "gap": gap,
            "status": status
        })

    top_to_improve.sort(key=lambda x: x["gap"], reverse=True)
    match_percentage = round((total_met / total_items) * 100, 1)

    return {
        "target_role": role,
        "career_readiness": match_percentage,
        "matrix": matrix,
        "strongest_skills": strongest[:4],
        "weakest_skills": weakest[:4],
        "top_to_improve": top_to_improve[:3],
        "available_roles": list(ROLE_BENCHMARKS.keys())
    }

