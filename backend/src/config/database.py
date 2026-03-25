from sqlalchemy import create_engine
#sqlalchemy is toolkit and create engine is a function that creates a new instance of the database connection
from sqlalchemy.ext.declarative import declarative_base
#sqlalchemy.ext.declarative is a module that provides a base class for declarative class definitions
from sqlalchemy.orm import sessionmaker
#sqlalchemy.orm is a module that provides a set of high-level API for working with relational databases
# sessionmaker is a factory for creating new Session objects
import os 
#os is a module that provides a way of using operating system dependent functionality
# load_dotenv function loads environment variables from a .env file into the environment
# dotenv is a module that loads environment variables from a .env file into the environment
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pohana.db")
# if DATABASE_URL is not set, use sqlite database located at ./pohana.db
# create an engine instance
# connect_args={"check_same_thread": False} is required for SQLite to allow multiple threads to access the database
# echo=True enables logging of all SQL statements executed by the engine
# create a new instance of the database connection
# create a new engine instance
# bind the engine to the sessionmaker


engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=True
)
# create a configured "Session" class
#SessionLocal is a factory for creating new Session objects
# bind the engine to the sessionmaker
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
    )

Base = declarative_base()
# Base is a base class for declarative class definitions
# It maintains a catalog of classes and tables relative to that base
# It is used to create the database schema

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()