"""
ML Model Training Script for NextTwin.

Trains three models:
  1. Random Forest Regressor    → Placement Readiness (0-100)
  2. Gradient Boosting Regressor → Future CGPA prediction
  3. Linear Regression           → Skill Growth factor

Run once before starting the backend server:
    cd nexttwin
    python -m backend.ml.train_models

Models are saved to backend/ml/saved_models/
"""
import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

# Add project root to path so we can import sibling packages
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.ml.generate_data import generate_dataset

# Feature columns used by placement and academic models
PLACEMENT_FEATURES = [
    "cgpa", "attendance", "dsa", "python_skill", "java", "javascript",
    "sql", "machine_learning", "communication", "problem_solving", "aptitude",
    "projects_count", "certifications_count", "internship_months", "hackathons",
]

ACADEMIC_FEATURES = [
    "cgpa", "attendance", "semester", "dsa", "python_skill",
    "problem_solving", "projects_count", "certifications_count",
]

SKILL_FEATURES = [
    "projects_count", "certifications_count", "internship_months", "hackathons",
]


def evaluate(name: str, y_true, y_pred):
    mae  = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2   = r2_score(y_true, y_pred)
    print(f"\n── {name} ──")
    print(f"  MAE  : {mae:.3f}")
    print(f"  RMSE : {rmse:.3f}")
    print(f"  R²   : {r2:.3f}")


def train():
    print("Generating synthetic dataset …")
    df = generate_dataset(n=300)

    save_dir = os.path.join(os.path.dirname(__file__), "saved_models")
    os.makedirs(save_dir, exist_ok=True)

    # ── 1. Placement Readiness Model ─────────────────────────────────────────
    X_p = df[PLACEMENT_FEATURES].values
    y_p = df["placement_readiness"].values
    X_train, X_test, y_train, y_test = train_test_split(X_p, y_p, test_size=0.2, random_state=42)

    rf = RandomForestRegressor(n_estimators=150, max_depth=8, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    evaluate("Placement Readiness (Random Forest)", y_test, rf.predict(X_test))

    joblib.dump(rf, os.path.join(save_dir, "placement_model.pkl"))
    print("✓ Saved placement_model.pkl")

    # ── 2. Academic / Future CGPA Model ─────────────────────────────────────
    X_a = df[ACADEMIC_FEATURES].values
    y_a = df["future_cgpa"].values
    X_train, X_test, y_train, y_test = train_test_split(X_a, y_a, test_size=0.2, random_state=42)

    gb = GradientBoostingRegressor(n_estimators=120, learning_rate=0.1,
                                   max_depth=4, random_state=42)
    gb.fit(X_train, y_train)
    evaluate("Future CGPA (Gradient Boosting)", y_test, gb.predict(X_test))

    joblib.dump(gb, os.path.join(save_dir, "academic_model.pkl"))
    print("✓ Saved academic_model.pkl")

    # ── 3. Skill Growth Model ────────────────────────────────────────────────
    X_s = df[SKILL_FEATURES].values
    y_s = df["skill_growth"].values
    X_train, X_test, y_train, y_test = train_test_split(X_s, y_s, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    lr = LinearRegression()
    lr.fit(X_train_s, y_train)
    evaluate("Skill Growth (Linear Regression)", y_test, lr.predict(X_test_s))

    joblib.dump(lr,     os.path.join(save_dir, "skill_model.pkl"))
    joblib.dump(scaler, os.path.join(save_dir, "skill_scaler.pkl"))
    print("✓ Saved skill_model.pkl + skill_scaler.pkl")

    # Save feature lists for the predictor
    joblib.dump(PLACEMENT_FEATURES, os.path.join(save_dir, "placement_features.pkl"))
    joblib.dump(ACADEMIC_FEATURES,  os.path.join(save_dir, "academic_features.pkl"))
    joblib.dump(SKILL_FEATURES,     os.path.join(save_dir, "skill_features.pkl"))

    print("\n✅ All models trained and saved to", save_dir)


if __name__ == "__main__":
    train()
