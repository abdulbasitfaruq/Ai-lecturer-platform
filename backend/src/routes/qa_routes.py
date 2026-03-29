from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.config.database import get_db
from pydantic import BaseModel
from src.controller.qa_controller import ask_question, get_lecture_questions

router = APIRouter(prefix="/qa", tags=["questions"])


class QuestionRequest(BaseModel):
    lecture_id: int
    question_text: str
    user_id: int


@router.post("/ask")
def ask(request: QuestionRequest, db: Session = Depends(get_db)):
    return ask_question(
        db=db,
        lecture_id=request.lecture_id,
        question_text=request.question_text,
        user_id=request.user_id
    )


@router.get("/lectures/{lecture_id}/questions")
def get_questions(lecture_id: int, db: Session = Depends(get_db)):
    return get_lecture_questions(
        db=db,
        lecture_id=lecture_id
    )