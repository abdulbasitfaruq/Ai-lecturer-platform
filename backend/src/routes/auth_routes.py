from fastapi import  APIRouter, Depends
from sqlalchemy.orm import Session
from src.config.database import get_db
from pydantic import BaseModel, EmailStr
from src.controller.auth_controller import register_user,login_user

router = APIRouter(prefix="/auth", tags=["authentication"])

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    
@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(username=request.username, email=request.email, password=request.password, db=db)


@router.post("/login")
def login(request: RegisterRequest, db: Session = Depends(get_db)):
    return login_user(username=request.username, password=request.password, db=db)


