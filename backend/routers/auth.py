from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import json
import os

from database import get_db
from models import Team

class LoginRequest(BaseModel):
    team_name: str
    password: str

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        team_id: int = payload.get("sub")
        if team_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return team_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/login")
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # Find team by name
    team = db.query(Team).filter(Team.name == login_data.team_name).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid team name or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, team.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid team name or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(team.id)}, expires_delta=access_token_expires
    )
    
    # Parse players JSON
    players = []
    if team.players:
        try:
            players = json.loads(team.players)
        except json.JSONDecodeError:
            players = []
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "team": {
            "id": team.id,
            "name": team.name,
            "players": players
        }
    }

@router.get("/me")
async def get_current_team(team_id: int = Depends(verify_token), db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Parse players JSON
    players = []
    if team.players:
        try:
            players = json.loads(team.players)
        except json.JSONDecodeError:
            players = []
    
    return {
        "team": {
            "id": team.id,
            "name": team.name,
            "players": players
        }
    }

@router.post("/logout")
async def logout():
    # JWT tokens are stateless, so we just return success
    # In a real application, you might want to implement a token blacklist
    return {"message": "Successfully logged out"} 