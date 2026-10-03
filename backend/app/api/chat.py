import json
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

router = APIRouter(prefix="/chat", tags=["Chat & Intelligence"])

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
        semester_override=query_req.semester_override
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
        "latency_ms": rag_result.get("latency_ms", 12.5)
    }

@router.get("/suggested-questions")
async def get_suggested_questions():
    return [
        {
            "category": "Curriculum & Eligibility",
            "text": "Can I take Machine Learning next semester?",
            "description": "Evaluates prerequisites (Data Structures & Algorithms) against your completed transcript and batch."
        },
        {
            "category": "Semester Planning",
            "text": "Which courses can I take next semester?",
            "description": "Retrieves the semester 7 course distribution, core requirements, and elective groups for your cohort."
        },
        {
            "category": "Regulations & Conflict Detection",
            "text": "What are the attendance requirements?",
            "description": "Triggers conflict detection between general Regulation REG-ACAD-04 (80%) and Hackathon Circular 2026/04 (75%)."
        },
        {
            "category": "Cohort Version Awareness",
            "text": "Which regulations and curriculum apply to my batch?",
            "description": "Demonstrates version sensitivity across Batch 2027 vs Batch 2025 curriculum frameworks."
        },
        {
            "category": "Reliability & Grounding",
            "text": "What is the hostel mess menu for next Sunday?",
            "description": "Demonstrates refusal to hallucinate when knowledge is absent (INSUFFICIENT_EVIDENCE state)."
        }
    ]
