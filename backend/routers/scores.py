from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from pydantic import BaseModel

from database import get_db
from models import Score, Team
from routers.auth import verify_token

class ScoreRequest(BaseModel):
    hole_number: int
    score: int

router = APIRouter()

@router.post("/")
async def submit_score(
    score_data: ScoreRequest,
    team_id: int = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Submit a score for a specific hole"""
    
    # Validate hole number
    if score_data.hole_number < 1 or score_data.hole_number > 18:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hole number must be between 1 and 18"
        )
    
    # Validate score
    if score_data.score < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Score must be at least 1"
        )
    
    # Check if team exists
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if score already exists for this team and hole
    existing_score = db.query(Score).filter(
        Score.team_id == team_id,
        Score.hole_number == score_data.hole_number
    ).first()
    
    if existing_score:
        # Update existing score
        existing_score.score = score_data.score
        existing_score.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_score)
        return {"message": "Score updated successfully", "score": existing_score}
    else:
        # Create new score
        new_score = Score(
            team_id=team_id,
            hole_number=score_data.hole_number,
            score=score_data.score
        )
        db.add(new_score)
        db.commit()
        db.refresh(new_score)
        return {"message": "Score submitted successfully", "score": new_score}

@router.get("/leaderboard")
async def get_leaderboard(db: Session = Depends(get_db)):
    """Get the current leaderboard with team rankings"""
    
    # Get all teams with their total scores and holes played
    leaderboard_data = db.query(
        Team.id,
        Team.name,
        func.coalesce(func.sum(Score.score), 0).label('total_score'),
        func.count(Score.id).label('holes_played'),
        func.max(Score.updated_at).label('last_updated')
    ).outerjoin(Score).group_by(Team.id, Team.name).order_by(
        func.coalesce(func.sum(Score.score), 0).asc()  # Lower score is better
    ).all()
    
    return [
        {
            "team_id": row.id,
            "team_name": row.name,
            "total_score": row.total_score,
            "holes_played": row.holes_played,
            "last_updated": row.last_updated.isoformat() if row.last_updated else None
        }
        for row in leaderboard_data
    ]

@router.get("/team/{team_id}")
async def get_team_scores(team_id: int, db: Session = Depends(get_db)):
    """Get all scores for a specific team"""
    
    # Check if team exists
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Get all scores for the team
    scores = db.query(Score).filter(Score.team_id == team_id).order_by(Score.hole_number).all()
    
    return {
        "team": {
            "id": team.id,
            "name": team.name
        },
        "scores": [
            {
                "hole_number": score.hole_number,
                "score": score.score,
                "created_at": score.created_at.isoformat(),
                "updated_at": score.updated_at.isoformat() if score.updated_at else None
            }
            for score in scores
        ],
        "total_score": sum(score.score for score in scores),
        "holes_played": len(scores)
    } 