from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, StudentProfile
from ..schemas import ProfileUpdate, ProfileResponse
from ..auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


def _get_or_create_profile(user: User, db: Session) -> StudentProfile:
    """Get existing profile or create a blank one."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(
            user_id=user.id,
            sem_grades={},
            subjects={},
            projects_details=[],
            certifications_details=[],
            internship_details=[],
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's Digital Twin profile."""
    return _get_or_create_profile(current_user, db)


@router.put("/", response_model=ProfileResponse)
def update_profile(
    updates: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update the Digital Twin profile."""
    profile = _get_or_create_profile(current_user, db)

    for field, value in updates.model_dump(exclude_none=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    # Record updated snapshot if profile has CGPA
    if profile.cgpa:
        try:
            from ..ml.predictor import predict_placement
            from ..models import TwinSnapshot
            placement = predict_placement(profile)
            r_score = placement["placement_readiness"]
            t_score = round(r_score * 0.6 + (profile.cgpa / 10) * 40, 1)

            # Record current month snapshot
            curr_month = "Current"
            existing_snap = db.query(TwinSnapshot).filter(
                TwinSnapshot.user_id == current_user.id,
                TwinSnapshot.month_label == curr_month
            ).first()

            if existing_snap:
                existing_snap.readiness_score = r_score
                existing_snap.cgpa = profile.cgpa
                existing_snap.twin_score = t_score
            else:
                snap = TwinSnapshot(
                    user_id=current_user.id,
                    month_label=curr_month,
                    readiness_score=r_score,
                    cgpa=profile.cgpa,
                    twin_score=t_score
                )
                db.add(snap)
            db.commit()
        except Exception:
            pass

    return profile


@router.get("/evolution")
def get_digital_twin_evolution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns historical timeline of Digital Twin progress over time.
    """
    from ..models import TwinSnapshot
    from ..ml.predictor import predict_placement

    profile = _get_or_create_profile(current_user, db)
    snapshots = (
        db.query(TwinSnapshot)
        .filter(TwinSnapshot.user_id == current_user.id)
        .order_by(TwinSnapshot.id.asc())
        .all()
    )

    if not snapshots and profile.cgpa:
        # Default starting timeline if no historical snapshots exist yet
        try:
            placement = predict_placement(profile)
            curr_r = placement["placement_readiness"]
        except Exception:
            curr_r = 60.0

        timeline = [
            {"month": "Month 1", "readiness": round(max(30.0, curr_r - 18.0), 1), "cgpa": round(max(5.0, profile.cgpa - 0.5), 1), "twin_score": round(max(40.0, curr_r - 15.0), 1)},
            {"month": "Month 2", "readiness": round(max(35.0, curr_r - 12.0), 1), "cgpa": round(max(5.0, profile.cgpa - 0.3), 1), "twin_score": round(max(45.0, curr_r - 10.0), 1)},
            {"month": "Month 3", "readiness": round(max(40.0, curr_r - 6.0), 1),  "cgpa": round(max(5.0, profile.cgpa - 0.1), 1), "twin_score": round(max(50.0, curr_r - 5.0), 1)},
            {"month": "Current", "readiness": round(curr_r, 1), "cgpa": profile.cgpa, "twin_score": round(curr_r * 0.6 + (profile.cgpa / 10) * 40, 1)},
        ]
        return {"timeline": timeline}

    timeline = [
        {
            "month": s.month_label,
            "readiness": s.readiness_score,
            "cgpa": s.cgpa,
            "twin_score": s.twin_score,
        }
        for s in snapshots
    ]

    return {"timeline": timeline}

