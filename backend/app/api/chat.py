import json
import os
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.entities import User, StudentProfile, Conversation, Message
from app.schemas.schemas import ChatQueryRequest, ChatQueryResponse
from app.api.deps import get_current_user
from app.services.rag_engine import rag_engine
from app.services.gemini_service import gemini_service
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["Chat & Intelligence"])

class SetGeminiKeyRequest(BaseModel):
    api_key: str

@router.get("/gemini-status")
async def get_gemini_status():
    has_key = gemini_service.has_active_key()
    return {
        "active": has_key,
        "model": "gemini-2.0-flash",
        "provider": "gemini" if has_key else "local-grounded",
        "nlp_engine": "Google Gemini 2.0 Flash" if has_key else "High-Precision Local Semantic NLP"
    }

@router.post("/set-gemini-key")
async def set_gemini_key_endpoint(req: SetGeminiKeyRequest):
    clean_key = req.api_key.strip()
    if not clean_key:
        raise HTTPException(status_code=400, detail="API key cannot be empty.")
    
    # Set runtime environment
    os.environ["GEMINI_API_KEY"] = clean_key
    gemini_service.api_key = clean_key

    # Persist to backend/.env
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
    try:
        lines = []
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                lines = [line for line in f if not line.startswith("GEMINI_API_KEY=")]
        lines.append(f"GEMINI_API_KEY={clean_key}\n")
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(lines)
    except Exception as e:
        print(f"[SetGeminiKey] Error saving to .env: {e}")

    return {
        "success": True,
        "message": "Gemini API key successfully saved and activated for NLP & Grounded Generation.",
        "model": "gemini-2.0-flash"
    }

@router.post("/query", response_model=ChatQueryResponse)
async def ask_anveshan(
    query_req: ChatQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org_id = query_req.organization_id or current_user.organization_id or "PDEU"
    
    # 1. Fetch student context
    student_profile = None
    if current_user.role == "student":
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
        student_profile = p_res.scalar_one_or_none()

    user_context = {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "program": student_profile.program if student_profile else "B.Tech",
        "department": student_profile.department if student_profile else "Computer Science & Engineering",
        "batch": query_req.batch_override or (student_profile.batch if student_profile else "2027"),
        "semester": query_req.semester_override or (student_profile.current_semester if student_profile else 7),
        "roll_number": student_profile.roll_number if student_profile else "23BCSE101",
        "completed_courses": json.loads(student_profile.completed_courses_json or "[]") if student_profile else [
            "CS201 Data Structures", "CS202 Discrete Mathematics", "CS301 DBMS", "CS302 Algorithms"
        ],
        "cgpa": student_profile.cgpa if student_profile else 8.8
    }

    # 2. Get or create conversation
    conv_id = query_req.conversation_id or str(uuid.uuid4())
    conv_res = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conversation = conv_res.scalar_one_or_none()
    if not conversation:
        conversation = Conversation(
            id=conv_id,
            organization_id=org_id,
            user_id=current_user.id,
            title=query_req.question[:60]
        )
        db.add(conversation)
        await db.flush()

    # 3. Execute Hybrid RAG + Graph + Context Reasoning
    rag_result = await rag_engine.execute_query(
        question=query_req.question,
        user_context=user_context,
        organization_id=org_id,
        batch_override=query_req.batch_override,
        semester_override=query_req.semester_override,
        gemini_api_key=query_req.gemini_api_key
    )

    # 4. Save User & Assistant Messages
    msg_id = str(uuid.uuid4())
    user_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        sender="user",
        content=query_req.question,
        status="ANSWERED"
    )
    db.add(user_msg)

    assistant_msg = Message(
        id=msg_id,
        conversation_id=conversation.id,
        sender="assistant",
        content=rag_result.get("direct_answer", ""),
        direct_answer=rag_result.get("direct_answer", ""),
        explanation=rag_result.get("explanation", ""),
        status=rag_result.get("status", "ANSWERED"),
        citations_json=json.dumps(rag_result.get("citations", [])),
        graph_json=json.dumps(rag_result.get("graph_traversal", []))
    )
    db.add(assistant_msg)
    await db.commit()

    return {
        "conversation_id": conversation.id,
        "message_id": msg_id,
        "status": rag_result.get("status", "ANSWERED"),
        "direct_answer": rag_result.get("direct_answer", ""),
        "explanation": rag_result.get("explanation", ""),
        "user_context": rag_result.get("user_context", user_context),
        "citations": rag_result.get("citations", []),
        "graph_traversal": rag_result.get("graph_traversal", []),
        "conflicts": rag_result.get("conflicts", []),
        "related_actions": rag_result.get("related_actions", []),
        "retrieval_method": "hybrid_vector_bm25_graph",
        "latency_ms": rag_result.get("latency_ms", 12.5),
        "model_used": rag_result.get("model_used", "Gemini 2.0 Flash Grounded"),
        "nlp_intent": rag_result.get("nlp_intent", "general")
    }

@router.get("/suggested-questions")
async def get_suggested_questions():
    return [
        {
            "category": "Real PDEU Placements",
            "text": "What is the highest and average placement package at PDEU, and which top companies recruit from here?",
            "description": "Real placement statistics: ₹42.00 LPA highest package, ₹8.50 LPA average, and marquee corporate recruiters."
        },
        {
            "category": "Real PDEU Admissions",
            "text": "How does the admission process work for B.Tech at PDEU? What is the ACPC vs JEE Main quota?",
            "description": "50% ACPC Gujarat quota (GUJCET) + 50% All India JEE Main quota + NRI guidelines and eligibility thresholds."
        },
        {
            "category": "Real Safety & Regulations",
            "text": "What is the anti-ragging policy at PDEU and what is the 24x7 toll-free helpline number to report harassment?",
            "description": "Authoritative UGC & PDEU anti-ragging policy and 24x7 toll-free National Helpline 1800-180-5522."
        },
        {
            "category": "Real University Governance",
            "text": "Who is the President of PDEU and what is the statutory governing authority under Gujarat Act?",
            "description": "Statutory leadership under Gujarat Act No. 7 of 2021: President Dr. Mukesh D. Ambani, Dr. Hasmukh Adhia, and BoG."
        },
        {
            "category": "Curriculum & Eligibility",
            "text": "Can I take Machine Learning next semester?",
            "description": "Evaluates prerequisites (Data Structures & Algorithms) against your completed transcript and batch."
        },
        {
            "category": "Regulations & Conflict Detection",
            "text": "What are the attendance requirements?",
            "description": "Triggers conflict detection between general Regulation REG-ACAD-04 (80%) and Hackathon Circular 2026/04 (75%)."
        },
        {
            "category": "Reliability & Grounding",
            "text": "What is the hostel mess menu for next Sunday?",
            "description": "Demonstrates refusal to hallucinate when knowledge is absent (INSUFFICIENT_EVIDENCE state)."
        }
    ]
