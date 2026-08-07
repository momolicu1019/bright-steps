
from fastapi import APIRouter
router = APIRouter()
@router.get("/class/{teacher_id}")
def class_view(teacher_id: int):
    return {"students": [{"id":1,"name":"Alex","progress":80},{"id":2,"name":"Maya","progress":65}], "assignments": []}
@router.post("/assign")
def assign_activity(child_id: int, activity_id: int):
    return {"assigned": True}
