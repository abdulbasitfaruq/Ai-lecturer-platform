from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.config.database import get_db
from pydantic import BaseModel
from src.controller.qa_controller import ask_question, get_lecture_questions

router = APIRouter(prefix="/qa", tags=["questions"])
# Define request model for asking a question
# This model includes the lecture ID, the question text, and the user ID of the person asking the question.
# The user ID is necessary to associate the question with the user who asked it, which can be useful for tracking and analytics purposes.
# The lecture ID is required to ensure that the question is linked to the correct lecture, allowing the system to provide relevant answers based on the lecture content.
# The question text is the actual question being asked by the user, which will be processed by the AI to generate an answer.

class QuestionRequest(BaseModel):
    lecture_id: int
    question_text: str
    user_id: int
    
@router.post("/ask")
def ask(request: QuestionRequest, db: Session = Depends(get_db)):
    return ask_question(
        db=db,
        lecture_id=request.lecture_id,
        question=request.question_text,
        user_id=request.user_id
    )

@router.get("/lectures/{lecture_id}/questions")
def get_questions(lecture_id: int, db: Session = Depends(get_db)):
    return get_lecture_questions(
        db=db,
        lecture_id=lecture_id
    )
