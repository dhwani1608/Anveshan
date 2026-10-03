import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.entities import User, StudentProfile
from app.schemas.schemas import LoginRequest, TokenResponse, UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(
            User.email == login_data.email,
            User.organization_id == login_data.organization_id
        )
    )
    user = result.scalar_one_or_none()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email, password, or organization."
        )

    # Fetch profile if student
    profile_data = None
    if user.role == "student":
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        prof = p_res.scalar_one_or_none()
        if prof:
            profile_data = {
                "id": prof.id,
                "roll_number": prof.roll_number,
                "program": prof.program,
                "department": prof.department,
                "batch": prof.batch,
                "current_academic_year": prof.current_academic_year,
                "current_semester": prof.current_semester,
                "completed_courses": json.loads(prof.completed_courses_json or "[]"),
                "cgpa": prof.cgpa
            }

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_id": user.organization_id,
            "profile": profile_data
        }
    }

@router.get("/me")
async def get_me(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile_data = None
    if user.role == "student":
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        prof = p_res.scalar_one_or_none()
        if prof:
            profile_data = {
                "id": prof.id,
                "roll_number": prof.roll_number,
                "program": prof.program,
                "department": prof.department,
                "batch": prof.batch,
                "current_academic_year": prof.current_academic_year,
                "current_semester": prof.current_semester,
                "completed_courses": json.loads(prof.completed_courses_json or "[]"),
                "cgpa": prof.cgpa
            }

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "organization_id": user.organization_id,
        "profile": profile_data
    }

@router.get("/personas")
async def get_personas():
    """Returns preset personas for quick testing in UI without typing passwords."""
    return [
        {
            "id": "dhwani",
            "name": "Dhwani Vyas",
            "role": "student",
            "email": "dhwani@pdeu.ac.in",
            "password": "pdeu2026",
            "batch": "2027",
            "semester": 7,
            "program": "B.Tech CSE",
            "roll": "23BCSE101",
            "description": "Batch 2027 student (Has completed Data Structures & Algorithms, eligible for ML)"
        },
        {
            "id": "rohan",
            "name": "Rohan Patel",
            "role": "student",
            "email": "rohan@pdeu.ac.in",
            "password": "pdeu2026",
            "batch": "2025",
            "semester": 7,
            "program": "B.Tech CSE",
            "roll": "21BCSE088",
            "description": "Batch 2025 student (Legacy 2025 curriculum, missing Algorithms prerequisite)"
        },
        {
            "id": "admin",
            "name": "Prof. A. K. Sharma",
            "role": "admin",
            "email": "admin@pdeu.ac.in",
            "password": "admin2026",
            "batch": "N/A",
            "semester": 0,
            "program": "Dean Academics",
            "roll": "FAC-001",
            "description": "University Administrator (Can manage documents, resolve conflicts, inspect graph)"
        }
    ]
