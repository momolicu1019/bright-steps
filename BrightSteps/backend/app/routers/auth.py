
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db

router = APIRouter()

@router.post("/register")
def register(email: str, password: str, name: str, role: str = "parent", db: Session = Depends(get_db)):
    # simplified - add hashing in prod
    return {"id": 1, "email": email, "role": role}

@router.post("/login")
def login(email: str, password: str):
    return {"access_token": "mock-jwt-token", "role": "parent", "user_id": 1}
