from sqlalchemy.orm import Session
from src.models.lectures import Lecture
from src.services.ai_service import generate_lecture ,generate_audio
from fastapi import HTTPException

def create_lecture(db: Session, user_id: int, topic: str, subject: str, difficulty: str, voice: str = "onyx"):

    ai_response = generate_lecture(topic=topic, subject=subject, difficulty=difficulty)

    new_lecture = Lecture(
       user_id=user_id,
       topic=ai_response["topic"],
       content=ai_response["content"],
       summary=ai_response["summary"],
       difficulty=ai_response["difficulty"],
       subject=ai_response["subject"]
   )

     
    db.add(new_lecture)
    db.commit()
    db.refresh(new_lecture)
    
    # Generate audio for the lecture
    audio_filename = None
    try:
        audio_filename = generate_audio(
            text=ai_response["content"],
            lecture_id=new_lecture.id,
            voice=voice
        )
        # Save audio filename to database
        new_lecture.audio_file = audio_filename
        db.commit()
    except Exception as e:
        print(f"Audio generation failed: {str(e)}") 
    

    return {
        "message": "Lecture created successfully",
         "lecture": {
             "id": new_lecture.id,
             "topic": new_lecture.topic,
             "subject": new_lecture.subject,
             "content": new_lecture.content,
              "summary": new_lecture.summary,
              "difficulty": new_lecture.difficulty,
              "audio_file": new_lecture.audio_file,
             "created_at": str(new_lecture.created_at)
        }
     }


def create_guest_lecture(topic: str, subject: str, difficulty: str, db: Session):
    ai_response = generate_lecture(topic=topic, subject=subject, difficulty=difficulty)

    new_lecture = Lecture(
        user_id=None,  # No user associated with guest lectures
        topic=ai_response["topic"],
        content=ai_response["content"],
        summary=ai_response["summary"],
        difficulty=ai_response["difficulty"],
        subject=ai_response["subject"]
    )

    db.add(new_lecture)
    db.commit()
    db.refresh(new_lecture)
    

    return {
        "message": "Lecture generated successfully",
        "lecture": {
            "topic": new_lecture.topic,
            "subject": new_lecture.subject,
            "content": new_lecture.content,
            "summary": new_lecture.summary,
            "difficulty": new_lecture.difficulty
        }
    }

def get_lectures_by_user(db: Session, user_id: int):
    lectures = db.query(Lecture).filter(Lecture.user_id == user_id).all()
    return {
        "lectures": [
            {
                "id": lecture.id,
                "topic": lecture.topic,
                "content": lecture.content,
                "summary": lecture.summary,
                "difficulty": lecture.difficulty,
                "created_at": lecture.created_at,
                "subject": lecture.subject,
                "audio_file": lecture.audio_file
            }
            for lecture in lectures
        ]
    }