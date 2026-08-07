
from fastapi import APIRouter
router = APIRouter()
@router.get("/dashboard/{parent_id}")
def dashboard(parent_id: int):
    return {"children": 2, "today_tasks": ["Morning routine","Letter tracing"], "weekly_progress": 78}
