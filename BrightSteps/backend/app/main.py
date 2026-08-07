
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import children, activities, progress, ai, parent, teacher, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BrightSteps API", description="AI-powered learning platform for children with special needs", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(children.router, prefix="/api/children", tags=["Children"])
app.include_router(activities.router, prefix="/api/activities", tags=["Activities"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(parent.router, prefix="/api/parent", tags=["Parent"])
app.include_router(teacher.router, prefix="/api/teacher", tags=["Teacher"])

@app.get("/")
def root():
    return {"message": "BrightSteps API running", "docs": "/docs"}
@app.get("/health")
def health():
    return {"status": "ok"}
