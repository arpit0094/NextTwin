from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, StudentProfile, PredictionLog
from ..auth import get_current_user
from ..ml.predictor import predict_placement, predict_academic, predict_skill_development

router = APIRouter(prefix="/predict", tags=["Predictions"])


def _require_profile(user: User, db: Session) -> StudentProfile:
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile or not profile.cgpa:
        raise HTTPException(
            status_code=400,
            detail="Please complete your Digital Twin profile before running predictions."
        )
    return profile


@router.get("/placement")
def get_placement_prediction(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Predict placement readiness (0-100%) using Random Forest model.
    Returns score + XAI feature importance explanation.
    """
    profile = _require_profile(current_user, db)
    result = predict_placement(profile)

    # Log to DB
    log = PredictionLog(user_id=current_user.id, prediction_type="placement", result=result)
    db.add(log)
    db.commit()

    return result


@router.get("/academic")
def get_academic_prediction(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Predict future CGPA using Gradient Boosting model.
    Returns current CGPA, predicted CGPA, trend, and XAI explanation.
    """
    profile = _require_profile(current_user, db)
    result = predict_academic(profile)

    log = PredictionLog(user_id=current_user.id, prediction_type="academic", result=result)
    db.add(log)
    db.commit()

    return result


@router.get("/skills")
def get_skill_prediction(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Predict skill development for next semester using Linear Regression model.
    Returns per-skill current vs predicted values.
    """
    profile = _require_profile(current_user, db)
    result = predict_skill_development(profile)

    log = PredictionLog(user_id=current_user.id, prediction_type="skill", result=result)
    db.add(log)
    db.commit()

    return result


@router.get("/history")
def get_prediction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the last 10 predictions for this user."""
    logs = (
        db.query(PredictionLog)
        .filter(PredictionLog.user_id == current_user.id)
        .order_by(PredictionLog.created_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "id": l.id,
            "type": l.prediction_type,
            "result": l.result,
            "created_at": l.created_at.isoformat(),
        }
        for l in logs
    ]
