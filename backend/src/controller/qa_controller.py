from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.models.lectures import Lecture
from src.services.ai_service import answer_question
from src.models.question import Question


def ask_question(db: Session, lecture_id: int, question_text: str, user_id: int):

    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()

    if not lecture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lecture not found"
        )

    ai_answer = answer_question(
        lecture_content=lecture.content,
        question=question_text
    )

    new_question = Question(
        lecture_id=lecture_id,
        question=question_text,
        answer=ai_answer,
        user_id=user_id
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return {
        "message": "Question answered successfully",
        "question": {
            "id": new_question.id,
            "lecture_id": new_question.lecture_id,
            "question": new_question.question,
            "answer": new_question.answer,
            "created_at": str(new_question.created_at)
        }
    }


def get_lecture_questions(lecture_id: int, db: Session):

    questions = db.query(Question).filter(
        Question.lecture_id == lecture_id
    ).all()

    return {
        "lecture_id": lecture_id,
        "questions": [
            {
                "id": q.id,
                "question": q.question,
                "answer": q.answer,
                "user_id": q.user_id,
                "created_at": str(q.created_at)
            }
            for q in questions
        ]
    }