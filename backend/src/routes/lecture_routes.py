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
        paragraph = ""
        full_content = ""

        for chunk in stream_lecture(request.topic, request.subject, request.difficulty):
            full_content += chunk

            # Send each text chunk to frontend
            data = json.dumps({"type": "text", "content": chunk})
            yield f"data: {data}\n\n"

            # Collect text into paragraphs
            paragraph += chunk

            # When we hit a double newline, a paragraph is complete
            if "\n\n" in paragraph:
                parts = paragraph.split("\n\n")
                # Process all complete paragraphs
                for complete_paragraph in parts[:-1]:
                    clean_text = complete_paragraph.strip()
                    if len(clean_text) > 20:
                        try:
                            chunk_id = str(uuid.uuid4())[:8]
                            audio_file = generate_audio_chunk(clean_text, chunk_id, request.voice)
                            audio_data = json.dumps({"type": "audio", "filename": audio_file})
                            yield f"data: {audio_data}\n\n"
                        except Exception as e:
                            print(f"Audio chunk failed: {str(e)}")
                # Keep the incomplete part
                paragraph = parts[-1]

        # Handle the last paragraph
        if paragraph.strip() and len(paragraph.strip()) > 20:
            try:
                chunk_id = str(uuid.uuid4())[:8]
                audio_file = generate_audio_chunk(paragraph.strip(), chunk_id, request.voice)
                audio_data = json.dumps({"type": "audio", "filename": audio_file})
                yield f"data: {audio_data}\n\n"
            except Exception as e:
                print(f"Audio chunk failed: {str(e)}")

        # Send the complete content at the end
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

        # Generate audio for the complete answer
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

    
    
        
        