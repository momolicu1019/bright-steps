
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.post("/", response_model=schemas.ChildOut)
def create_child(child: schemas.ChildCreate, db: Session = Depends(get_db)):
    db_child = models.Child(**child.dict())
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return db_child

@router.get("/", response_model=list[schemas.ChildOut])
def list_children(parent_id: int = 1, db: Session = Depends(get_db)):
    return db.query(models.Child).filter(models.Child.parent_id == parent_id).all() or db.query(models.Child).all()

@router.get("/{child_id}", response_model=schemas.ChildOut)
def get_child(child_id: int, db: Session = Depends(get_db)):
    return db.query(models.Child).filter(models.Child.id == child_id).first()

@router.put("/{child_id}/abilities")
def update_abilities(child_id: int, abilities: dict, db: Session = Depends(get_db)):
    child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if child:
        child.abilities_profile = abilities
        db.commit()
    return {"status": "updated", "abilities": abilities}
