from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fastapi.middleware.cors
from src.config.database import engine, Base
from src.models import user, lectures  # Ensure models are imported to create tables
from src.routes.auth_routes import router as auth_router
from src.routes.lecture_routes import router as lecture_router



app = FastAPI(
    title="AI Lecturer Platform Backend",
    description="Backend service for the AI Lecturer Platform",
    version="1.0.0",
)

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(lecture_router)


@app.on_event("startup")
# line 20 means when the application starts up, it will call this function to create the database tables
async def startup_event():
    print("Create database tables")
    Base.metadata.create_all(bind=engine)
    # This line creates all tables defined in the SQLAlchemy models
    # It uses the engine defined in the database configuration to connect to the database
    # It ensures that the database schema is up-to-date with the models
    print("Database tables created")
    
@app.get("/")
async def home():
    return {"message": "Welcome to the AI Lecturer Platform Backend"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
