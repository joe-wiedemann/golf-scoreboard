from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List
from database import get_db
from models import Course, Team, Score
from sqlalchemy import func

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/current")
def get_current_course(db: Session = Depends(get_db)):
    """Get the current course configuration"""
    course = db.query(Course).first()
    if not course:
        raise HTTPException(status_code=404, detail="No course configured")
    
    return {
        "id": course.id,
        "name": course.name,
        "hole_pars": course.hole_pars,
        "total_par": course.total_par
    }

@router.get("/leaderboard")
def get_leaderboard_with_par(db: Session = Depends(get_db)):
    """Get leaderboard with scores relative to par for holes played so far"""
    course = db.query(Course).first()
    if not course:
        raise HTTPException(status_code=404, detail="No course configured")
    
    teams = db.query(Team).all()
    leaderboard = []
    for team in teams:
        # Get all scores for the team
        scores = db.query(Score).filter(Score.team_id == team.id).all()
        scores_dict = {score.hole_number: score.score for score in scores}
        total_score = sum(scores_dict.values())
        holes_played = len(scores_dict)
        total_par = sum([course.hole_pars.get(str(hole), 0) for hole in scores_dict.keys()])
        relative_to_par = total_score - total_par if holes_played > 0 else 0
        par_display = f"{relative_to_par:+d}" if relative_to_par != 0 else "E"
        leaderboard.append({
            "id": team.id,
            "name": team.name,
            "players": team.players,
            "total_score": total_score,
            "holes_played": holes_played,
            "total_par": total_par,
            "relative_to_par": relative_to_par,
            "par_display": par_display
        })
    # Sort by relative to par (best first)
    leaderboard.sort(key=lambda x: x['relative_to_par'])
    return {
        "course_name": course.name,
        "total_par": course.total_par,
        "leaderboard": leaderboard
    }

@router.get("/team/{team_id}/scorecard")
def get_team_scorecard(team_id: int, db: Session = Depends(get_db)):
    """Get detailed scorecard for a team with par information"""
    course = db.query(Course).first()
    if not course:
        raise HTTPException(status_code=404, detail="No course configured")
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get all scores for the team
    scores = db.query(Score).filter(Score.team_id == team_id).all()
    scores_dict = {score.hole_number: score.score for score in scores}
    
    # Build scorecard with par information
    scorecard = []
    total_score = 0
    total_par = 0
    
    for hole_num in range(1, 19):
        par = course.hole_pars.get(str(hole_num), 0)
        score = scores_dict.get(hole_num, 0)
        relative_to_par = score - par if score > 0 else 0
        
        scorecard.append({
            "hole": hole_num,
            "par": par,
            "score": score,
            "relative_to_par": relative_to_par,
            "par_display": f"{relative_to_par:+d}" if relative_to_par != 0 else "E"
        })
        
        if score > 0:
            total_score += score
            total_par += par
    
    total_relative_to_par = total_score - total_par
    
    return {
        "team_name": team.name,
        "players": team.players,
        "course_name": course.name,
        "scorecard": scorecard,
        "total_score": total_score,
        "total_par": total_par,
        "total_relative_to_par": total_relative_to_par,
        "total_par_display": f"{total_relative_to_par:+d}" if total_relative_to_par != 0 else "E"
    } 