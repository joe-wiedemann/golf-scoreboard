from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from database import engine, Base
from routers import auth, teams, scores, courses

# Note: Database tables are created by the database initialization script
# Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown

app = FastAPI(
    title="Golf Scoreboard API",
    description="Real-time golf scoreboard API for team tournaments",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(teams.router, prefix="/teams", tags=["Teams"])
app.include_router(scores.router, prefix="/scores", tags=["Scores"])
app.include_router(courses.router, tags=["Courses"])

@app.get("/")
async def root():
    return {"message": "Golf Scoreboard API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 