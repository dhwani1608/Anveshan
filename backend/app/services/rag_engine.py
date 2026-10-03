import time
from typing import Dict, Any, List, Optional
from app.services.vector_store import vector_store
from app.services.bm25_search import bm25_service
from app.services.knowledge_graph import knowledge_graph_service
from app.services.conflict_detector import conflict_detector
from app.services.llm_gateway import llm_gateway

class RAGEngine:
    def __init__(self):
        pass

    async def execute_query(
        self,
        question: str,
        user_context: Dict[str, Any],
        organization_id: str = "PDEU",
        batch_override: Optional[str] = None,
        semester_override: Optional[int] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Resolve Effective Context
        effective_batch = batch_override or user_context.get("batch", "2027")
        effective_semester = semester_override or user_context.get("semester", 7)
        student_completed = user_context.get("completed_courses", [])
        
        context_payload = {
            "student_name": user_context.get("full_name", user_context.get("name", "Dhwani Vyas")),
            "roll_number": user_context.get("roll_number", "23BCSE101"),
            "program": user_context.get("program", "B.Tech"),
            "department": user_context.get("department", "Computer Science & Engineering"),
            "batch": effective_batch,
            "semester": effective_semester,
            "completed_courses": student_completed,
            "cgpa": user_context.get("cgpa", 8.8)
        }

        # 2. Hybrid Retrieval: Vector Search
        vector_results = vector_store.similarity_search(
            query=question,
            organization_id=organization_id,
            batch_filter=effective_batch,
            top_k=5
        )

        # 3. Hybrid Retrieval: BM25 Keyword Search
        bm25_results = bm25_service.search(
            query=question,
            organization_id=organization_id,
            batch_filter=effective_batch,
            top_k=5
        )

        # 4. Reciprocal Rank Fusion (RRF) & Deduplication
        fused_chunks = self._fuse_and_rerank(vector_results, bm25_results)

        # 5. Knowledge Graph Retrieval & Multi-Hop Path Querying
        graph_traversals = knowledge_graph_service.query_subgraph(
            query=question,
            organization_id=organization_id,
            batch=effective_batch
        )

        # Check course eligibility if query asks about a course
        course_eligibility = None
        if "machine learning" in question.lower() or "cs401" in question.lower():
            course_eligibility = knowledge_graph_service.check_course_eligibility("CS401", student_completed)

        # 6. Conflict Detection
        conflicts = conflict_detector.check_conflicts(
            query=question,
            retrieved_chunks=fused_chunks,
            organization_id=organization_id
        )

        # 7. LLM Reasoning & Response Formulation
        response = await llm_gateway.generate_grounded_answer(
            query=question,
            retrieved_chunks=fused_chunks,
            graph_traversals=graph_traversals,
            user_context=context_payload,
            conflicts=conflicts,
            course_eligibility=course_eligibility
        )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        response["latency_ms"] = elapsed_ms
        return response

    def _fuse_and_rerank(
        self,
        vector_results: List[Dict[str, Any]],
        bm25_results: List[Dict[str, Any]],
        k: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Reciprocal Rank Fusion (RRF) to combine dense vector rankings with sparse BM25 scores.
        """
        scores: Dict[str, float] = {}
        chunk_map: Dict[str, Dict[str, Any]] = {}

        for rank, item in enumerate(vector_results):
            cid = item.get("chunk_id", f"vec_{rank}")
            chunk_map[cid] = item
            scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank + 1))

        for rank, item in enumerate(bm25_results):
            cid = item.get("chunk_id", f"bm25_{rank}")
            if cid not in chunk_map:
                chunk_map[cid] = item
            scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank + 1))

        # Sort by fused score
        sorted_cids = sorted(scores.keys(), key=lambda c: scores[c], reverse=True)
        return [chunk_map[cid] for cid in sorted_cids[:5]]

rag_engine = RAGEngine()
