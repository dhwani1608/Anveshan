import pytest
import asyncio
import os
import sys

# Ensure backend root is in pythonpath
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, Base, AsyncSessionLocal
from app.data.pdeu_seed import seed_pdeu_data
from app.services.knowledge_graph import knowledge_graph_service
from app.services.rag_engine import rag_engine
from app.services.vector_store import vector_store
from app.services.bm25_search import bm25_service
from app.services.conflict_detector import conflict_detector
from app.core.security import verify_password, get_password_hash

@pytest.mark.asyncio
async def test_full_pipeline():
    # 1. Setup DB schema and seed data
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        await seed_pdeu_data(session)

    # 2. Test Security Hash
    hashed = get_password_hash("pdeu2026")
    assert verify_password("pdeu2026", hashed) is True
    assert verify_password("wrong_password", hashed) is False

    # 3. Test Knowledge Graph Structure
    prereqs_ml = knowledge_graph_service.get_course_prerequisites("CS401")
    assert len(prereqs_ml) >= 2
    prereq_names = [p["course_name"] for p in prereqs_ml]
    assert any("Data Structures" in p for p in prereq_names)
    assert any("Algorithms" in p for p in prereq_names)

    # 4. Test Course Eligibility Evaluation
    # Dhwani has both CS201 and CS302
    dhwani_eval = knowledge_graph_service.check_course_eligibility(
        "CS401",
        ["CS201 Data Structures", "CS302 Design & Analysis of Algorithms"]
    )
    assert dhwani_eval["eligible"] is True
    assert len(dhwani_eval["missing_prerequisites"]) == 0

    # Rohan has only CS201, missing CS302
    rohan_eval = knowledge_graph_service.check_course_eligibility(
        "CS401",
        ["CS201 Data Structures"]
    )
    assert rohan_eval["eligible"] is False
    assert len(rohan_eval["missing_prerequisites"]) > 0

    # 5. Test Conflict Detection
    conflicts = conflict_detector.check_conflicts(
        query="What are the minimum attendance requirements?",
        retrieved_chunks=[],
        organization_id="PDEU"
    )
    assert len(conflicts) > 0
    assert "80%" in conflicts[0]["title"] or "Contradiction" in conflicts[0]["title"]

    # 6. Test RAG Query Execution for Course Eligibility
    context_dhwani = {
        "full_name": "Dhwani Vyas",
        "batch": "2027",
        "semester": 7,
        "completed_courses": ["CS201 Data Structures", "CS302 Design & Analysis of Algorithms"]
    }
    ans = await rag_engine.execute_query(
        question="Can I take Machine Learning next semester?",
        user_context=context_dhwani,
        organization_id="PDEU"
    )
    assert ans["status"] == "ANSWERED"
    assert "CS401 Machine Learning" in ans["direct_answer"] or "eligible" in ans["direct_answer"].lower()
    assert len(ans["citations"]) > 0
    assert len(ans["graph_traversal"]) > 0

    # 7. Test Attendance Query Triggers Conflict Detected State
    ans_att = await rag_engine.execute_query(
        question="What are the attendance requirements for exams?",
        user_context=context_dhwani,
        organization_id="PDEU"
    )
    assert ans_att["status"] == "CONFLICT_DETECTED"
    assert len(ans_att["conflicts"]) > 0

    # 8. Test Grounding & Refusal on Insufficient Evidence
    ans_unknown = await rag_engine.execute_query(
        question="What is the hostel mess menu for next Sunday?",
        user_context=context_dhwani,
        organization_id="PDEU"
    )
    assert ans_unknown["status"] == "INSUFFICIENT_EVIDENCE"
    assert "cannot determine" in ans_unknown["direct_answer"].lower()

    # 9. Test Multi-Tenant Isolation
    empty_res = vector_store.similarity_search(
        query="Machine Learning",
        organization_id="ANOTHER_COMPANY_001"
    )
    assert len(empty_res) == 0

    print("\n[TESTS PASSED] All 9 core architecture test assertions succeeded!")

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())
