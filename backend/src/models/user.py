from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from src.config.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User(username={self.username}, email={self.email})>"
    # The User class defines the structure of the users table in the database
    # It includes fields for id, username, email, password, full_name, created_at, and updated_at
    # The id field is the primary key and is auto-incremented
    # The username and email fields are unique and indexed for fast lookup
    # The password field is stored as a string (hashed password)
    # The created_at field automatically records when a user is created, and updated_at records when a user is updated
# this function is used to represent the User object as a string, which can be helpful for debugging and logging purposes
    # this file is for defining the User model for the database using SQLAlchemy ORM
    #
    