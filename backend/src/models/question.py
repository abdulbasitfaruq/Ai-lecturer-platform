from sqlalchemy import Column, Integer, ForeignKey, Text, DataTime
from sqlalchemy.sql import func
from src.config.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    lecture_id = Column(Integer, ForeignKey("lectures.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Question(id={self.id}, lecture_id={self.lecture_id}, user_id={self.user_id})>"
    
    # Additional methods for CRUD operations can be added here as needed.
    #
    