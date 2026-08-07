
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..ai_service import explain_concept_simple, parent_coach_suggestions

router = APIRouter()

@router.post("/explain")
def ai_explain(req: schemas.AIExplainRequest, db: Session = Depends(get_db)):
    child = db.query(models.Child).filter(models.Child.id == req.child_id).first()
    name = child.name if child else "friend"
    abilities = child.abilities_profile if child else {}
    age = child.age if child else 5
    text = explain_concept_simple(req.concept, name, age, req.language, abilities)
    return {"text": text, "audio_url": f"/tts?text={text[:20]}", "should_speak": True}

@router.post("/parent-coach")
def parent_coach(req: schemas.ParentCoachRequest, db: Session = Depends(get_db)):
    # mock summary
    suggestions = parent_coach_suggestions({"accuracy":0.75,"favorite":"sensory"}, req.language)
    return {"suggestions": suggestions, "screen_time_tip": "Try 20-20 rule: 20 mins play, 20 mins off screen"}
