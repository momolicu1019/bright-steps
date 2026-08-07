
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..ai_service import analyze_progress

router = APIRouter()

@router.post("/")
def log_progress(data: schemas.ProgressCreate, db: Session = Depends(get_db)):
    prog = models.Progress(**data.dict())
    db.add(prog)
    db.commit()
    # adaptive logic
    history = db.query(models.Progress).filter(models.Progress.child_id == data.child_id).all()
    hist = [{"accuracy": h.accuracy, "difficulty": 1} for h in history]
    adaptation = analyze_progress(hist + [{"accuracy": data.accuracy, "difficulty": 1}])
    return {"logged": True, "adaptation": adaptation}

@router.get("/child/{child_id}")
def child_progress(child_id: int, db: Session = Depends(get_db)):
    records = db.query(models.Progress).filter(models.Progress.child_id == child_id).all()
    return {
        "total_completed": len([r for r in records if r.completed]),
        "avg_accuracy": sum(r.accuracy for r in records)/len(records) if records else 0,
        "favorite_module": "academic", # compute in prod
        "skills_mastered": ["colors","brushing"],
        "needs_support": ["sharing"],
        "records": records
    }

@router.get("/report/{child_id}/weekly")
def weekly_report(child_id: int):
    return {
        "attention_trend": [60, 70, 75, 80],
        "completion_time_avg": 4.2,
        "badges": ["Super Brusher","Alphabet Star"],
        "printable_url": f"/api/progress/report/{child_id}/pdf"
    }
