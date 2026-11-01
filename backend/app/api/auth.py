import json
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.email_parser import parse_pdpu_email
from app.models.entities import User, StudentProfile
from app.schemas.schemas import LoginRequest, TokenResponse, UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/parse-email")
async def parse_email_endpoint(email: str):
    """
    Validates institutional email and dynamically extracts student attributes
    (e.g., 23bcp116@sot.pdpu.ac.in -> Batch 2027, B.Tech Computer Engineering, Roll 23BCP116).
    """
    parsed, error = parse_pdpu_email(email)
    if error:
        return {"valid": False, "error": error}
    return {"valid": True, "data": parsed}

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    clean_email = login_data.email.strip().lower()
    
    # 1. Enforce PDPU / PDEU College Email Domain Validation
    parsed_meta, error_msg = parse_pdpu_email(clean_email)
    if error_msg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    # 2. Check if user already exists
    result = await db.execute(
        select(User).where(
            User.email == clean_email,
            User.organization_id == login_data.organization_id
        )
    )
    user = result.scalar_one_or_none()
    
    # 3. If user doesn't exist yet, auto-provision profile from parsed college email metadata
    if not user:
        user_id = f"user_{clean_email.replace('@', '_').replace('.', '_')}"
        hashed_pwd = get_password_hash(login_data.password or "pdeu2026")
        
        user = User(
            id=user_id,
            organization_id=login_data.organization_id or "PDEU",
            email=clean_email,
            hashed_password=hashed_pwd,
            full_name=parsed_meta.get("full_name", f"Student {parsed_meta.get('roll_number', '')}"),
            role=parsed_meta.get("role", "student"),
            is_active=True
        )
        db.add(user)
        await db.flush()

        if user.role == "student":
            prof = StudentProfile(
                id=f"prof_{user.id}",
                user_id=user.id,
                organization_id=user.organization_id,
                roll_number=parsed_meta.get("roll_number", "23BCP001"),
                program=parsed_meta.get("program", "B.Tech Computer Engineering"),
                department=parsed_meta.get("department", "Computer Science & Engineering"),
                batch=parsed_meta.get("batch", "2027"),
                current_academic_year=parsed_meta.get("academic_year", "2026-2027"),
                current_semester=parsed_meta.get("current_semester", 7),
                completed_courses_json=json.dumps(parsed_meta.get("completed_courses", [])),
                cgpa=parsed_meta.get("cgpa", 8.5)
            )
            db.add(prof)
        
        await db.commit()
    else:
        # User exists: verify password (allow default demo password for smooth test)
        if login_data.password != "pdeu2026" and not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email, password, or organization."
            )

    # 4. Fetch student profile
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
            "email": "23bcp116@sot.pdpu.ac.in",
            "password": "pdeu2026",
            "batch": "2027",
            "semester": 7,
            "program": "B.Tech Computer Engineering",
            "roll": "23BCP116",
            "description": "2023-2027 Cohort (Semester 7) • Computer Engineering • Has completed Data Structures & Algorithms, eligible for ML"
        },
        {
            "id": "rohan",
            "name": "Rohan Patel",
            "role": "student",
            "email": "21bcp088@sot.pdpu.ac.in",
            "password": "pdeu2026",
            "batch": "2025",
            "semester": 7,
            "program": "B.Tech Computer Engineering",
            "roll": "21BCP088",
            "description": "2021-2025 Cohort (Semester 7) • Legacy 2025 curriculum, missing Algorithms prerequisite"
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
