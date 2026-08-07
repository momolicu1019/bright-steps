
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChildCreate(BaseModel):
    name: str
    age: int
    avatar: Optional[str] = "bear"
    language: Optional[str] = "en"
    abilities_profile: Dict[str, Any] = {}
    diagnoses: List[str] = []
    sensory_preferences: Dict[str, Any] = {}

class ChildOut(ChildCreate):
    id: int
    class Config:
        from_attributes = True

class ActivityOut(BaseModel):
    id: int
    module: str
    category: str
    title_en: str
    title_fil: str
    difficulty: int
    content: Dict[str, Any]
    class Config:
        from_attributes = True

class ProgressCreate(BaseModel):
    child_id: int
    activity_id: int
    accuracy: float
    completion_time: float
    attention_score: float
    completed: bool = True

class AIExplainRequest(BaseModel):
    child_id: int
    concept: str
    language: str = "en"
    context: Optional[str] = None

class ParentCoachRequest(BaseModel):
    child_id: int
    language: str = "en"
