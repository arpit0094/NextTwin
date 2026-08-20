from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, StudentProfile, WhatIfScenario
from ..schemas import WhatIfRequest
from ..auth import get_current_user
from ..ml.predictor import simulate_whatif

router = APIRouter(prefix="/whatif", tags=["What-If Simulator"])


@router.post("/simulate")
def run_simulation(
    req: WhatIfRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Run a What-If scenario simulation.
    Does NOT modify the real profile — only simulates hypothetical changes.
    Returns a side-by-side comparison of current vs scenario predictions.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.cgpa:
        raise HTTPException(
            status_code=400,
            detail="Please complete your Digital Twin profile first."
        )

    changes = req.model_dump(exclude_none=True, exclude={"scenario_name"})
    result = simulate_whatif(profile, changes)

    # Persist scenario for history
    scenario = WhatIfScenario(
        user_id=current_user.id,
        scenario_name=req.scenario_name or "My Scenario",
        changes=changes,
        result=result,
    )
    db.add(scenario)
    db.commit()

    return result


@router.get("/history")
def get_scenario_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the last 5 What-If scenarios for this user."""
    scenarios = (
        db.query(WhatIfScenario)
        .filter(WhatIfScenario.user_id == current_user.id)
        .order_by(WhatIfScenario.created_at.desc())
        .limit(5)
        .all()
    )
    return [
        {
            "id": s.id,
            "name": s.scenario_name,
            "changes": s.changes,
            "result": s.result,
            "created_at": s.created_at.isoformat(),
        }
        for s in scenarios
    ]
