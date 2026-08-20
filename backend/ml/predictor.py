"""
ML Predictor for NextTwin.

Loads the trained models and exposes three main functions:
  - predict_placement(profile)  → placement readiness + XAI
  - predict_academic(profile)   → future CGPA + XAI
  - predict_skill_development(profile) → per-skill growth predictions
  - simulate_whatif(current, changes) → comparison result

XAI is implemented via feature_importances_ (sklearn built-in), which is
a valid and explainable form of Explainable AI (XAI).
"""
import os
import joblib
import numpy as np
from typing import Dict, Any, Optional

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

# Lazy-load models once
_placement_model = None
_academic_model  = None
_skill_model     = None
_skill_scaler    = None
_placement_features = None
_academic_features  = None
_skill_features     = None


def _load_models():
    global _placement_model, _academic_model, _skill_model, _skill_scaler
    global _placement_features, _academic_features, _skill_features

    if _placement_model is None:
        _placement_model    = joblib.load(os.path.join(MODEL_DIR, "placement_model.pkl"))
        _academic_model     = joblib.load(os.path.join(MODEL_DIR, "academic_model.pkl"))
        _skill_model        = joblib.load(os.path.join(MODEL_DIR, "skill_model.pkl"))
        _skill_scaler       = joblib.load(os.path.join(MODEL_DIR, "skill_scaler.pkl"))
        _placement_features = joblib.load(os.path.join(MODEL_DIR, "placement_features.pkl"))
        _academic_features  = joblib.load(os.path.join(MODEL_DIR, "academic_features.pkl"))
        _skill_features     = joblib.load(os.path.join(MODEL_DIR, "skill_features.pkl"))


def _profile_to_dict(profile) -> Dict[str, float]:
    """Convert a SQLAlchemy StudentProfile object to a plain dict."""
    if hasattr(profile, "__dict__"):
        return {
            "cgpa": profile.cgpa or 0.0,
            "attendance": profile.attendance or 0.0,
            "semester": profile.semester or 1,
            "dsa": profile.dsa or 0.0,
            "python_skill": profile.python_skill or 0.0,
            "java": profile.java or 0.0,
            "javascript": profile.javascript or 0.0,
            "sql": profile.sql or 0.0,
            "machine_learning": profile.machine_learning or 0.0,
            "communication": profile.communication or 0.0,
            "problem_solving": profile.problem_solving or 0.0,
            "aptitude": profile.aptitude or 0.0,
            "projects_count": profile.projects_count or 0,
            "certifications_count": profile.certifications_count or 0,
            "internship_months": profile.internship_months or 0,
            "hackathons": profile.hackathons or 0,
        }
    return profile  # already a dict


def _build_feature_vector(data: Dict, feature_names: list) -> np.ndarray:
    return np.array([[data.get(f, 0.0) for f in feature_names]])


# ─── Feature importance labels (human-readable) ───────────────────────────────
FEATURE_LABELS = {
    "cgpa": "CGPA",
    "attendance": "Attendance",
    "semester": "Semester",
    "dsa": "Data Structures & Algorithms",
    "python_skill": "Python",
    "java": "Java",
    "javascript": "JavaScript",
    "sql": "SQL",
    "machine_learning": "Machine Learning",
    "communication": "Communication",
    "problem_solving": "Problem Solving",
    "aptitude": "Aptitude",
    "projects_count": "Projects",
    "certifications_count": "Certifications",
    "internship_months": "Internship Experience",
    "hackathons": "Hackathons",
}

# Thresholds: below these values = weak area (for XAI explanation)
WEAK_THRESHOLDS = {
    "cgpa": 7.0, "attendance": 75.0, "dsa": 5.0,
    "python_skill": 5.0, "java": 5.0, "javascript": 5.0, "sql": 5.0,
    "machine_learning": 4.0, "communication": 6.0, "problem_solving": 5.0,
    "aptitude": 5.0, "projects_count": 2.0, "certifications_count": 1.0,
    "internship_months": 1.0,
}


def _build_xai_explanation(feature_names, importances, data: Dict):
    """
    Builds XAI explanation from feature importances.
    Returns positive factors (student is strong) and negative factors (weak areas).
    """
    # Pair feature with its importance and student's current value
    pairs = list(zip(feature_names, importances))
    pairs.sort(key=lambda x: x[1], reverse=True)

    # Contribution as percentage of total importance
    total = sum(i for _, i in pairs) or 1
    contributions = {
        FEATURE_LABELS.get(f, f): round((imp / total) * 100, 1)
        for f, imp in pairs
    }

    positive = []
    negative = []
    for feat, imp in pairs[:10]:  # top-10 features
        val = data.get(feat, 0)
        label = FEATURE_LABELS.get(feat, feat)
        threshold = WEAK_THRESHOLDS.get(feat, 5.0)
        contribution_pct = round((imp / total) * 100, 1)
        if val >= threshold:
            positive.append({
                "feature": label,
                "value": val,
                "contribution": f"+{contribution_pct}%",
            })
        else:
            negative.append({
                "feature": label,
                "value": val,
                "contribution": f"-{contribution_pct}%",
            })

    return {
        "feature_contributions": contributions,
        "positive_factors": positive[:5],
        "negative_factors": negative[:5],
    }


# ─── Public API ───────────────────────────────────────────────────────────────

def predict_placement(profile) -> Dict[str, Any]:
    """Predict placement readiness score with XAI explanation."""
    _load_models()
    data = _profile_to_dict(profile)
    X = _build_feature_vector(data, _placement_features)
    score = float(np.clip(_placement_model.predict(X)[0], 0, 100))

    xai = _build_xai_explanation(
        _placement_features,
        _placement_model.feature_importances_,
        data,
    )
    return {
        "placement_readiness": round(score, 1),
        **xai,
    }


def predict_academic(profile) -> Dict[str, Any]:
    """Predict future CGPA with XAI explanation."""
    _load_models()
    data = _profile_to_dict(profile)
    current_cgpa = data.get("cgpa", 0.0)
    X = _build_feature_vector(data, _academic_features)
    predicted = float(np.clip(_academic_model.predict(X)[0], 0, 10))

    xai = _build_xai_explanation(
        _academic_features,
        _academic_model.feature_importances_,
        data,
    )

    trend = "improving" if predicted > current_cgpa else "stable" if abs(predicted - current_cgpa) < 0.1 else "declining"

    return {
        "current_cgpa": round(current_cgpa, 2),
        "predicted_cgpa": round(predicted, 2),
        "change": round(predicted - current_cgpa, 2),
        "trend": trend,
        **xai,
    }


def predict_skill_development(profile) -> Dict[str, Any]:
    """
    Predict skill growth for each technical skill.
    Uses the Linear Regression skill-growth model to compute
    a growth factor, then applies it per-skill.
    """
    _load_models()
    data = _profile_to_dict(profile)

    skill_feat_vec = np.array([[data.get(f, 0) for f in _skill_features]])
    skill_feat_scaled = _skill_scaler.transform(skill_feat_vec)
    growth_factor = float(np.clip(_skill_model.predict(skill_feat_scaled)[0], 0, 1))

    skills = ["dsa", "python_skill", "java", "javascript", "sql", "machine_learning",
              "communication", "problem_solving", "aptitude"]

    current_skills = {}
    predicted_skills = {}
    improvements = []

    for sk in skills:
        current = data.get(sk, 0.0)
        # Growth potential inversely proportional to current level
        room_to_grow = max(10.0 - current, 0)
        improvement = round(growth_factor * room_to_grow * 0.6, 2)
        predicted = round(min(current + improvement, 10.0), 2)

        label = FEATURE_LABELS.get(sk, sk)
        current_skills[label] = current
        predicted_skills[label] = predicted
        improvements.append({
            "skill": label,
            "current": current,
            "predicted": predicted,
            "improvement": round(improvement, 2),
        })

    improvements.sort(key=lambda x: x["improvement"], reverse=True)

    return {
        "growth_factor": round(growth_factor, 3),
        "current_skills": current_skills,
        "predicted_skills": predicted_skills,
        "improvements": improvements,
        "summary": f"Based on your current activities, your skills are expected to grow by ~{round(growth_factor*60, 1)}% of their potential in the next semester.",
    }


def simulate_whatif(profile, changes: Dict) -> Dict[str, Any]:
    """
    What-If simulator: applies hypothetical changes to the profile
    without modifying the real profile. Returns a comparison.
    """
    _load_models()

    # Build current data dict
    current_data = _profile_to_dict(profile)

    # Build scenario data (apply changes on top)
    scenario_data = {**current_data}
    for key, val in changes.items():
        if val is not None and key in scenario_data:
            scenario_data[key] = val

    # Current predictions
    X_curr_p = _build_feature_vector(current_data, _placement_features)
    X_curr_a = _build_feature_vector(current_data, _academic_features)
    curr_placement = float(np.clip(_placement_model.predict(X_curr_p)[0], 0, 100))
    curr_academic  = float(np.clip(_academic_model.predict(X_curr_a)[0], 0, 10))

    # Scenario predictions
    X_scen_p = _build_feature_vector(scenario_data, _placement_features)
    X_scen_a = _build_feature_vector(scenario_data, _academic_features)
    scen_placement = float(np.clip(_placement_model.predict(X_scen_p)[0], 0, 100))
    scen_academic  = float(np.clip(_academic_model.predict(X_scen_a)[0], 0, 10))

    # XAI for scenario
    xai = _build_xai_explanation(_placement_features, _placement_model.feature_importances_, scenario_data)

    # Which features changed?
    changed_features = []
    for key, val in changes.items():
        if val is not None and key in current_data and current_data[key] != val:
            changed_features.append({
                "feature": FEATURE_LABELS.get(key, key),
                "from": current_data[key],
                "to": val,
            })

    return {
        "current": {
            "placement_readiness": round(curr_placement, 1),
            "predicted_cgpa": round(curr_academic, 2),
        },
        "scenario": {
            "placement_readiness": round(scen_placement, 1),
            "predicted_cgpa": round(scen_academic, 2),
        },
        "improvement": {
            "placement_readiness": round(scen_placement - curr_placement, 1),
            "predicted_cgpa": round(scen_academic - curr_academic, 2),
            "placement_readiness_pct": round(
                ((scen_placement - curr_placement) / max(curr_placement, 1)) * 100, 1
            ),
        },
        "changed_features": changed_features,
        **xai,
    }
