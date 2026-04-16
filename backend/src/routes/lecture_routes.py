from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from src.config.database import get_db
from pydantic import BaseModel
from src.controller.lecture_controller import create_lecture, create_guest_lecture, get_lectures_by_user
from src.services.ai_service import stream_lecture, stream_answer, generate_audio_chunk
import json
import uuid

router = APIRouter(prefix="/lectures", tags=["lectures"])

class LectureRequest(BaseModel):
    topic: str
    difficulty: str = "intermediate"
    subject: str

class UserLectureRequest(BaseModel):
    topic: str
    difficulty: str = "intermediate"
    user_id: int
    subject: str
    voice: str = "onyx"

class StreamRequest(BaseModel):
    topic: str
    subject: str
    difficulty: str = "intermediate"
    voice: str = "onyx"

class StreamQuestionRequest(BaseModel):
    lecture_content: str
    question: str
    voice: str = "onyx"

class SaveLectureRequest(BaseModel):
    topic: str
    subject: str
    difficulty: str
    content: str
    user_id: int
    audio_file: str = None

@router.post("/generate")
def generate_user_lecture(lecture: UserLectureRequest, db: Session = Depends(get_db)):
    return create_lecture(
        topic=lecture.topic,
        subject=lecture.subject,
        difficulty=lecture.difficulty,
        voice=lecture.voice,
        user_id=lecture.user_id,
        db=db
    )

@router.post("/guest/generate")
def generate_guest_lecture(lecture: LectureRequest, db: Session = Depends(get_db)):
    return create_guest_lecture(
        topic=lecture.topic,
        subject=lecture.subject,
        difficulty=lecture.difficulty,
        db=db
    )

@router.get("/user/{user_id}")
def lecture_history(user_id: int, db: Session = Depends(get_db)):
    return get_lectures_by_user(user_id=user_id, db=db)

@router.post("/stream")
def stream_lecture_endpoint(request: StreamRequest):
    def generate():
        full_content = ""

        # 1. Stream the text chunks as before
        for chunk in stream_lecture(request.topic, request.subject, request.difficulty):
            full_content += chunk
            data = json.dumps({"type": "text", "content": chunk})
            yield f"data: {data}\n\n"

        # 2. Text is finished — Generate audio WITH timestamps
        try:
            chunk_id = str(uuid.uuid4())[:8]
            
            # This now returns {"filename": "...", "timestamps": [...]}
            audio_result = generate_audio_chunk(full_content, chunk_id, request.voice)
            
            # Send BOTH to the frontend in one package
            audio_payload = json.dumps({
                "type": "audio", 
                "filename": audio_result["filename"],
                "timestamps": audio_result["timestamps"]  # The magic map
            })
            yield f"data: {audio_payload}\n\n"
            
        except Exception as e:
            print(f"Audio generation failed: {str(e)}")
            # Fallback error message for frontend
            yield f"data: {json.dumps({'type': 'error', 'message': 'Audio failed'})}\n\n"

        # 3. Signal completion
        done_data = json.dumps({"type": "done", "full_content": full_content})
        yield f"data: {done_data}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/stream/question")
def stream_question_endpoint(request: StreamQuestionRequest):
    def generate():
        full_answer = ""

        for chunk in stream_answer(request.lecture_content, request.question):
            full_answer += chunk
            data = json.dumps({"type": "text", "content": chunk})
            yield f"data: {data}\n\n"

        # Answer done — generate ONE audio file
        try:
            chunk_id = str(uuid.uuid4())[:8]
            audio_file = generate_audio_chunk(full_answer, chunk_id, request.voice)
            audio_data = json.dumps({"type": "audio", "filename": audio_file})
            yield f"data: {audio_data}\n\n"
        except Exception as e:
            print(f"Answer audio failed: {str(e)}")

        done_data = json.dumps({"type": "done", "full_answer": full_answer})
        yield f"data: {done_data}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/save")
def save_lecture(request: SaveLectureRequest, db: Session = Depends(get_db)):
    from src.models.lectures import Lecture
    from src.services.ai_service import client as ai_client

    try:
        summary_response = ai_client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "user", "content": f"Summarize this lecture in 2-3 sentences: {request.content[:2000]}"}
            ]
        )
        summary = summary_response.choices[0].message.content
    except:
        summary = ""

    new_lecture = Lecture(
        user_id=request.user_id,
        topic=request.topic,
        subject=request.subject,
        content=request.content,
        summary=summary,
        difficulty=request.difficulty,
        audio_file=request.audio_file
    )

    db.add(new_lecture)
    db.commit()
    db.refresh(new_lecture)

    return {
        "message": "Lecture saved",
        "lecture": {
            "id": new_lecture.id,
            "topic": new_lecture.topic,
            "subject": new_lecture.subject
        }
    }