
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text, Enum
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import enum

class RoleEnum(str, enum.Enum):
    parent = "parent"
    teacher = "teacher"

class Child(Base):
    __tablename__ = "children"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    avatar = Column(String, default="bear")
    language = Column(String, default="en") # en, fil
    abilities_profile = Column(JSON, default={}) # {reading: 2, motor: 3, etc}
    diagnoses = Column(JSON, default=[]) # optional, not assumed
    sensory_preferences = Column(JSON, default={})
    parent_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    progress = relationship("Progress", back_populates="child")
    goals = relationship("Goal", back_populates="child")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="parent")
    name = Column(String)

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True)
    module = Column(String) # daily_living, academic, emotional, speech, sensory, cognitive, motor, life_skills
    category = Column(String)
    title_en = Column(String)
    title_fil = Column(String)
    difficulty = Column(Integer, default=1) # 1-5 adaptive
    content = Column(JSON) # steps, images, audio urls
    is_offline_ready = Column(Boolean, default=True)

class Progress(Base):
    __tablename__ = "progress"
    id = Column(Integer, primary_key=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    accuracy = Column(Float)
    completion_time = Column(Float)
    attention_score = Column(Float) # from interaction patterns
    attempts = Column(Integer, default=1)
    completed = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    child = relationship("Child", back_populates="progress")

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    title = Column(String)
    target_skill = Column(String)
    target_value = Column(Integer)
    current_value = Column(Integer, default=0)
    child = relationship("Child", back_populates="goals")
