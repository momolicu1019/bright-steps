
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter()

# Seed data example
SEED = [
    {"module":"daily_living","category":"morning_routine","title_en":"Brush Teeth","title_fil":"Magsipilyo","difficulty":1,"content":{"steps":["Get toothbrush","Put toothpaste","Brush 2 mins"],"visuals":["brush1.png"],"audio_en":"brush_en.mp3"}},
    {"module":"academic","category":"alphabet","title_en":"Letter A","title_fil":"Letrang A","difficulty":1,"content":{"letters":["A"],"game_type":"tracing"}},
    {"module":"emotional","category":"emotions","title_en":"Happy Face","title_fil":"Masayang Mukha","difficulty":1,"content":{"emotions":["happy"],"game_type":"matching"}},
    {"module":"speech","category":"aac","title_en":"I want water","title_fil":"Gusto ko ng tubig","difficulty":1,"content":{"board":["I","want","water"]}},
    {"module":"sensory","category":"calm","title_en":"Bubble Pop Calm","title_fil":"Paputok ng Bula","difficulty":1,"content":{"type":"bubble_pop"}},
]

@router.get("/", response_model=list[schemas.ActivityOut])
def list_activities(module: str = None, difficulty: int = None, db: Session = Depends(get_db)):
    q = db.query(models.Activity)
    if module:
        q = q.filter(models.Activity.module == module)
    if difficulty:
        q = q.filter(models.Activity.difficulty == difficulty)
    activities = q.all()
    if not activities and not db.query(models.Activity).first():
        # auto-seed
        for s in SEED:
            db.add(models.Activity(**s))
        db.commit()
        activities = db.query(models.Activity).all()
    return activities

@router.get("/{activity_id}")
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    return db.query(models.Activity).filter(models.Activity.id == activity_id).first()
