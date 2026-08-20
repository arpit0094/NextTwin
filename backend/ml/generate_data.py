"""
Synthetic Dataset Generator for NextTwin ML Models.

Generates 300 realistic student records with meaningful feature-label
relationships so that ML models can learn real patterns.

Run:  python -m backend.ml.generate_data
"""
import os
import numpy as np
import pandas as pd

SEED = 42
N = 300  # number of synthetic records


def generate_dataset(n: int = N, seed: int = SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    # ── Core academic features ──────────────────────────────────────────────
    cgpa          = rng.uniform(5.0, 9.8, n)
    attendance    = rng.uniform(40, 100, n)
    semester      = rng.integers(2, 9, n)          # 2-8

    # ── Technical skills (1-10) ─────────────────────────────────────────────
    dsa           = rng.integers(1, 11, n).astype(float)
    python_skill  = rng.integers(1, 11, n).astype(float)
    java          = rng.integers(1, 11, n).astype(float)
    javascript    = rng.integers(1, 11, n).astype(float)
    sql           = rng.integers(1, 11, n).astype(float)
    ml_skill      = rng.integers(1, 11, n).astype(float)

    # ── Soft skills (1-10) ──────────────────────────────────────────────────
    communication    = rng.integers(1, 11, n).astype(float)
    problem_solving  = rng.integers(1, 11, n).astype(float)
    aptitude         = rng.integers(1, 11, n).astype(float)

    # ── Achievements ────────────────────────────────────────────────────────
    projects_count       = rng.integers(0, 9, n)
    certifications_count = rng.integers(0, 6, n)
    internship_months    = rng.integers(0, 13, n)
    hackathons           = rng.integers(0, 5, n)

    # ── Derived labels ───────────────────────────────────────────────────────

    # --- Placement Readiness (0-100) ---
    # Composite score inspired by real campus recruitment criteria
    tech_avg    = (dsa*0.25 + python_skill*0.15 + java*0.15 +
                   javascript*0.1 + sql*0.1 + ml_skill*0.1 +
                   problem_solving*0.15) / 10.0           # 0-1
    soft_avg    = (communication*0.55 + aptitude*0.45) / 10.0  # 0-1
    acad_norm   = np.clip((cgpa - 5.0) / 4.8, 0, 1)            # 0-1
    attend_norm = np.clip((attendance - 40) / 60, 0, 1)         # 0-1
    extra_score = np.clip(
        projects_count*0.08 + certifications_count*0.06 +
        np.minimum(internship_months, 6)*0.012 + hackathons*0.04,
        0, 1.0
    )

    placement_readiness = (
        tech_avg   * 35 +
        soft_avg   * 15 +
        acad_norm  * 20 +
        extra_score * 20 +
        attend_norm * 10
    )
    placement_readiness += rng.normal(0, 2.5, n)
    placement_readiness = np.clip(placement_readiness, 0, 100)

    # --- Future CGPA (predicted next-semester CGPA) ---
    study_factor = (dsa + problem_solving + python_skill) / 30.0  # 0-1
    future_cgpa = (
        cgpa +
        study_factor * 0.4 +
        attend_norm * 0.15 +
        rng.normal(0, 0.18, n)
    )
    future_cgpa = np.clip(future_cgpa, cgpa * 0.93, np.minimum(cgpa + 1.2, 10.0))

    # --- Skill growth label (improvement factor 0-1) ---
    # Used to train skill-development model
    skill_growth = np.clip(
        certifications_count*0.08 + projects_count*0.06 +
        np.minimum(internship_months, 6)*0.02 + hackathons*0.04 +
        rng.normal(0, 0.05, n),
        0, 1.0
    )

    df = pd.DataFrame({
        "cgpa": cgpa,
        "attendance": attendance,
        "semester": semester,
        "dsa": dsa,
        "python_skill": python_skill,
        "java": java,
        "javascript": javascript,
        "sql": sql,
        "machine_learning": ml_skill,
        "communication": communication,
        "problem_solving": problem_solving,
        "aptitude": aptitude,
        "projects_count": projects_count,
        "certifications_count": certifications_count,
        "internship_months": internship_months,
        "hackathons": hackathons,
        # Labels
        "placement_readiness": np.round(placement_readiness, 2),
        "future_cgpa": np.round(future_cgpa, 2),
        "skill_growth": np.round(skill_growth, 4),
    })

    return df


if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(out_dir, exist_ok=True)
    df = generate_dataset()
    out_path = os.path.join(out_dir, "synthetic_students.csv")
    df.to_csv(out_path, index=False)
    print(f"✓ Saved {len(df)} records → {out_path}")
    print(df.describe().T[["mean", "min", "max"]].round(2))
