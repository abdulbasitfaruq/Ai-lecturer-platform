from fastapi import  APIRouter, Depends
from sqlalchemy.orm import Session
from src.config.database import get_db
from pydantic import BaseModel
from src.controller.lecture_controller import create_lecture, create_guest_lecture, get_lectures_by_user

router = APIRouter(prefix="/lectures", tags=["lectures"])

class LectureRequest(BaseModel):
    topic: str
    difficulty: str = "intermediate"
    
class UserLectureRequest(BaseModel):
     topic: str
     difficulty: str = "intermediate"
     user_id: int
     
@router.post("/generate")
def generate_user_lecture(lecture: UserLectureRequest, db: Session = Depends(get_db)):
    return create_lecture(
        topic=lecture.topic,
        difficulty=lecture.difficulty,
        user_id=lecture.user_id,
        db=db
    )
    
@router.post("/guest/generate")
def generate_guest_lecture(lecture: LectureRequest, db: Session = Depends(get_db)):
    return create_guest_lecture(
        topic=lecture.topic,
        difficulty=lecture.difficulty,
        db=db
    )
    
@router.get("/user/{user_id}")
def lecture_history(user_id: int, db: Session = Depends(get_db)):
    return get_lectures_by_user(user_id=user_id, db=db)

    
    
        
        