from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from database import get_db
from models import Team
from routers.auth import get_password_hash, verify_token

router = APIRouter()

@router.get("/")
async def get_teams(db: Session = Depends(get_db)):
    """Get all teams (without sensitive information)"""
    teams = db.query(Team).all()
    return [
        {
            "id": team.id,
            "name": team.name,
            "players": json.loads(team.players) if team.players else []
        }
        for team in teams
    ]

@router.get("/{team_id}")
async def get_team(team_id: int, db: Session = Depends(get_db)):
    """Get specific team details"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    return {
        "id": team.id,
        "name": team.name,
        "players": json.loads(team.players) if team.players else []
    }

@router.post("/")
async def create_team(name: str, password: str, players: List[str] = None, db: Session = Depends(get_db)):
    """Create a new team (admin function)"""
    # Check if team name already exists
    existing_team = db.query(Team).filter(Team.name == name).first()
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team name already exists"
        )
    
    # Hash password
    hashed_password = get_password_hash(password)
    
    # Convert players list to JSON string
    players_json = json.dumps(players) if players else None
    
    # Create new team
    team = Team(
        name=name,
        password_hash=hashed_password,
        players=players_json
    )
    
    db.add(team)
    db.commit()
    db.refresh(team)
    
    return {
        "id": team.id,
        "name": team.name,
        "players": players or []
    } 