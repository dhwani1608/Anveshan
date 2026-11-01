"""
Comprehensive Real Data Benchmark & Grounded Reasoning Test for PDEU
Verifies RAG retrieval accuracy, Knowledge Graph traversals, grounded citations,
conflict detection, and zero-hallucination guardrails across real scraped PDEU knowledge.
"""

import sys
import os
import asyncio
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import engine, Base, AsyncSessionLocal
from app.data.pdeu_seed import seed_pdeu_data
from app.services.rag_engine import RAGEngine

TEST_CASES = [
    {
        "id": "TC_REAL_01",
        "category": "REAL_PLACEMENTS",
        "question": "What is the highest and average placement package at PDEU, and which top companies recruit from here?",
        "user_context": {
            "name": "Dhwani Vyas",
            "roll_number": "23BCSE101",
            "program": "B.Tech",
            "department": "Computer Science & Engineering",
            "batch": "2027",
            "semester": 7,
            "completed_courses": ["CS201 Data Structures", "CS302 Algorithms"],
            "cgpa": 8.92
        },
        "expected_status": "ANSWERED",
        "must_contain": ["42", "8.5", "ONGC", "Reliance"],
        "expected_citation_domain": "pdeu.ac.in"
    },
    {
        "id": "TC_REAL_02",
        "category": "REAL_ADMISSIONS",
        "question": "How does the admission process work for B.Tech at PDEU? What is the ACPC vs JEE Main quota?",
        "user_context": {
            "name": "Prospective Student",
            "batch": "2028",
            "semester": 1,
            "completed_courses": []
        },
        "expected_status": "ANSWERED",
        "must_contain": ["ACPC", "JEE", "50%"],
        "expected_citation_domain": "pdeu.ac.in"
    },
    {
        "id": "TC_REAL_03",
        "category": "REAL_SAFETY_REGULATION",
        "question": "What is the anti-ragging policy at PDEU and what is the 24x7 toll-free helpline number to report harassment?",
        "user_context": {
            "name": "First Year Student",
            "batch": "2028",
            "semester": 1,
            "completed_courses": []
        },
        "expected_status": "ANSWERED",
        "must_contain": ["1800-180-5522", "Zero Tolerance"],
        "expected_citation_domain": "pdeu.ac.in"
    },
    {
        "id": "TC_REAL_04",
        "category": "REAL_GOVERNANCE_LEADERSHIP",
        "question": "Who is the President of PDEU and what is the statutory governing authority under Gujarat Act?",
        "user_context": {
            "name": "Faculty Member",
            "batch": "ALL",
            "semester": 1,
            "completed_courses": []
        },
        "expected_status": "ANSWERED",
        "must_contain": ["Mukesh", "Ambani", "Hasmukh Adhia", "Act No. 7"],
        "expected_citation_domain": "pdeu.ac.in"
    },
    {
        "id": "TC_REAL_05",
        "category": "REAL_CAMPUS_DIRECTORY",
        "question": "Where is the PDEU campus located in Gandhinagar and what are the contact numbers?",
        "user_context": {
            "name": "Visitor",
            "batch": "ALL",
            "semester": 1,
            "completed_courses": []
        },
        "expected_status": "ANSWERED",
        "must_contain": ["Knowledge Corridor", "Gandhinagar", "382426"],
        "expected_citation_domain": "pdeu.ac.in"
    },
    {
        "id": "TC_REAL_06",
        "category": "PERSONALIZED_STUDENT_ELIGIBILITY",
        "question": "Can I take CS401 Machine Learning next semester?",
        "user_context": {
            "name": "Dhwani Vyas",
            "roll_number": "23BCSE101",
            "program": "B.Tech CSE",
            "department": "Computer Science & Engineering",
            "batch": "2027",
            "semester": 7,
            "completed_courses": ["CS201 Data Structures", "CS302 Design & Analysis of Algorithms"],
            "cgpa": 8.92
        },
        "expected_status": "ANSWERED",
        "must_contain": ["eligible", "CS401"],
        "expected_citation_domain": "pdeu.ac.in"
    },
    {
        "id": "TC_REAL_07",
        "category": "PERSONALIZED_STUDENT_INELIGIBLE",
        "question": "Can I take CS401 Machine Learning next semester?",
        "user_context": {
            "name": "Rohan Patel",
            "roll_number": "21BCSE088",
            "program": "B.Tech CSE",
            "department": "Computer Science & Engineering",
            "batch": "2025",
            "semester": 7,
            "completed_courses": ["CS201 Data Structures"],  # Missing CS302
            "cgpa": 7.85
        },
        "expected_status": "ANSWERED",
        "must_contain": ["ineligible", "missing"],
        "expected_citation_domain": "pdeu.ac.in"
    },
    {
        "id": "TC_REAL_08",
        "category": "CONFLICT_DETECTION_REASONING",
        "question": "What is the minimum attendance requirement at PDEU and what happens if I attend a hackathon?",
        "user_context": {
            "name": "Dhwani Vyas",
            "roll_number": "23BCSE101",
            "program": "B.Tech CSE",
            "department": "Computer Science & Engineering",
            "batch": "2027",
            "semester": 7,
            "completed_courses": []
        },
        "expected_status": "CONFLICT_DETECTED",
        "must_contain": ["80%", "75%", "concession"],
        "expected_citation_domain": "pdeu.ac.in"
    },
    {
        "id": "TC_REAL_09",
        "category": "ZERO_HALLUCINATION_GUARDRAIL",
        "question": "What is the weekly dinner mess menu on Friday evening at PDEU hostel?",
        "user_context": {
            "name": "Hostel Student",
            "batch": "2027",
            "semester": 7,
            "completed_courses": []
        },
        "expected_status": "INSUFFICIENT_EVIDENCE",
        "must_contain": ["cannot determine", "insufficient"],
        "expected_citation_domain": None
    }
]

async def run_benchmark():
    print("=" * 80)
    print("ANVESHAN BENCHMARK EVALUATION ON REAL PDEU DATA")
    print("Tagline: 'Turn organizational knowledge into intelligence.'")
    print("=" * 80)

    # 1. Initialize DB and Seed
    print("\n[Setup] Initializing database tables and loading real PDEU data...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_pdeu_data(session)

    rag = RAGEngine()
    total_tests = len(TEST_CASES)
    passed_tests = 0
    latencies = []

    print(f"\n[Execution] Running {total_tests} comprehensive test cases against real knowledge base...\n")

    for tc in TEST_CASES:
        t0 = time.time()
        resp = await rag.execute_query(
            question=tc["question"],
            user_context=tc["user_context"],
            organization_id="PDEU"
        )
        elapsed_ms = (time.time() - t0) * 1000
        latencies.append(elapsed_ms)

        status = resp.get("status")
        direct_ans = resp.get("direct_answer", "")
        explanation = resp.get("explanation", "")
        citations = resp.get("citations", [])
        graph = resp.get("graph_traversal", [])
        full_text = f"{direct_ans} {explanation}".lower()

        # Validation Checks
        status_ok = (status == tc["expected_status"])
        content_ok = all(k.lower() in full_text for k in tc["must_contain"])
        citation_ok = True
        if tc["expected_citation_domain"]:
            citation_ok = any(
                tc["expected_citation_domain"] in c.get("source_url", "") or
                tc["expected_citation_domain"] in c.get("document_title", "").lower()
                for c in citations
            )

        test_passed = status_ok and content_ok and citation_ok
        if test_passed:
            passed_tests += 1
            mark = "PASS [OK]"
        else:
            mark = "FAIL [X]"

        print(f"[{mark}] {tc['id']} - {tc['category']}")
        print(f"       Question: {tc['question']}")
        print(f"       Status: {status} (Expected: {tc['expected_status']}) | Latency: {elapsed_ms:.1f}ms")
        print(f"       Direct Answer: {direct_ans[:140]}...")
        if citations:
            print(f"       Citations ({len(citations)}): {[c.get('source_url', c.get('document_title')) for c in citations[:2]]}")
        if graph:
            graph_previews = [f"{g.get('source')} -> {g.get('relation')} -> {g.get('target')}" for g in graph[:2]]
            print(f"       Graph Paths ({len(graph)}): {graph_previews}")
        if not test_passed:
            print(f"       DEBUG FAIL: status_ok={status_ok}, content_ok={content_ok}, citation_ok={citation_ok}")
            print(f"       Full Text: {full_text[:300]}")
        print("-" * 80)

    accuracy_pct = (passed_tests / total_tests) * 100
    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0

    print("\n" + "=" * 80)
    print("BENCHMARK SUMMARY RESULTS")
    print("=" * 80)
    print(f"Total Tests Executed : {total_tests}")
    print(f"Tests Passed         : {passed_tests} / {total_tests}")
    print(f"Accuracy Rate        : {accuracy_pct:.1f}%")
    print(f"Average RAG Latency  : {avg_latency:.2f} ms")
    print(f"P95 Latency          : {sorted(latencies)[int(len(latencies)*0.95)]:.2f} ms")
    print("=" * 80)

    if passed_tests == total_tests:
        print("\n>>> ALL TEST CASES PASSED! Anveshan is operating successfully on real PDEU data.")
        return 0
    else:
        print(f"\n>>> {total_tests - passed_tests} TEST(S) FAILED. Check debug logs above.")
        return 1

if __name__ == "__main__":
    code = asyncio.run(run_benchmark())
    sys.exit(code)
