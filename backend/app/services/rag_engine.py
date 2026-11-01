import time
from typing import Dict, Any, List, Optional
from app.services.vector_store import vector_store
from app.services.bm25_search import bm25_service
from app.services.knowledge_graph import knowledge_graph_service
from app.services.conflict_detector import conflict_detector
from app.services.llm_gateway import llm_gateway
from app.services.gemini_service import gemini_service

class RAGEngine:
    def __init__(self):
        pass

    async def execute_query(
        self,
        question: str,
        user_context: Dict[str, Any],
        organization_id: str = "PDEU",
        batch_override: Optional[str] = None,
        semester_override: Optional[int] = None,
        gemini_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Resolve Effective Student Context
        effective_batch = batch_override or user_context.get("batch", "2027")
        effective_semester = semester_override or user_context.get("semester", 7)
        student_completed = user_context.get("completed_courses", [])
        
        context_payload = {
            "student_name": user_context.get("full_name", user_context.get("name", "Dhwani Vyas")),
            "roll_number": user_context.get("roll_number", "23BCSE101"),
            "program": user_context.get("program", "B.Tech Computer Science & Engineering"),
            "department": user_context.get("department", "Computer Science & Engineering"),
            "batch": effective_batch,
            "semester": effective_semester,
            "completed_courses": student_completed,
            "cgpa": user_context.get("cgpa", 8.8)
        }

        # 2. NLP Semantic Intent Understanding & Query Expansion (via Gemini or Local NLP Engine)
        nlp_intent = await gemini_service.understand_and_expand_query(
            raw_query=question,
            user_context=context_payload,
            runtime_key=gemini_api_key
        )
        expanded_search_query = nlp_intent.get("expanded_search_query", question)

        # 3. Hybrid Retrieval: Vector Search (Dense)
        # Query using both original prompt and expanded NLP semantic query
        vector_results_raw = vector_store.similarity_search(
            query=question,
            organization_id=organization_id,
            batch_filter=effective_batch,
            top_k=6
        )
        vector_results_expanded = vector_store.similarity_search(
            query=expanded_search_query,
            organization_id=organization_id,
            batch_filter=effective_batch,
            top_k=6
        )
        # Combine unique vector results
        seen_vec_ids = set()
        combined_vector_results = []
        for r in vector_results_expanded + vector_results_raw:
            cid = r.get("chunk_id", "")
            if cid not in seen_vec_ids:
                seen_vec_ids.add(cid)
                combined_vector_results.append(r)

        # 4. Hybrid Retrieval: BM25 Search (Sparse)
        bm25_results_raw = bm25_service.search(
            query=question,
            organization_id=organization_id,
            batch_filter=effective_batch,
            top_k=6
        )
        bm25_results_expanded = bm25_service.search(
            query=expanded_search_query,
            organization_id=organization_id,
            batch_filter=effective_batch,
            top_k=6
        )
        seen_bm25_ids = set()
        combined_bm25_results = []
        for r in bm25_results_expanded + bm25_results_raw:
            cid = r.get("chunk_id", "")
            if cid not in seen_bm25_ids:
                seen_bm25_ids.add(cid)
                combined_bm25_results.append(r)

        # 5. Semantic Fusion, Relevance Filtering & Re-ranking with Negative Domain Filtering
        fused_chunks = self._fuse_and_rerank(
            combined_vector_results,
            combined_bm25_results,
            nlp_intent=nlp_intent
        )

        # 6. Knowledge Graph Retrieval & Multi-Hop Path Querying
        graph_traversals = knowledge_graph_service.query_subgraph(
            query=question,
            organization_id=organization_id,
            batch=effective_batch
        )

        # Check course eligibility if query asks about a course
        course_eligibility = None
        q_lower = question.lower()
        if "machine learning" in q_lower or "cs401" in q_lower:
            course_eligibility = knowledge_graph_service.check_course_eligibility("CS401", student_completed)

        # 7. Conflict Detection
        conflicts = conflict_detector.check_conflicts(
            query=question,
            retrieved_chunks=fused_chunks,
            organization_id=organization_id
        )

        # 8. Grounded Generation (Gemini 2.0 Flash or Grounded Fallback)
        response = await llm_gateway.generate_grounded_answer(
            query=question,
            retrieved_chunks=fused_chunks,
            graph_traversals=graph_traversals,
            user_context=context_payload,
            conflicts=conflicts,
            course_eligibility=course_eligibility,
            runtime_key=gemini_api_key
        )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        response["latency_ms"] = elapsed_ms
        response["nlp_intent"] = nlp_intent.get("intent", "general")
        response["nlp_source"] = nlp_intent.get("source", "local-nlp-engine")
        return response

    def _fuse_and_rerank(
        self,
        vector_results: List[Dict[str, Any]],
        bm25_results: List[Dict[str, Any]],
        nlp_intent: Dict[str, Any],
        k: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Reciprocal Rank Fusion (RRF) with semantic intent scoring and negative cross-domain filtering.
        Eliminates irrelevant chunks (e.g. attendance for salary, or solar energy for CSE).
        """
        scores: Dict[str, float] = {}
        chunk_map: Dict[str, Dict[str, Any]] = {}

        intent = nlp_intent.get("intent", "general")
        preferred_docs = set(nlp_intent.get("preferred_document_ids", []))
        negative_keywords = [w.lower() for w in nlp_intent.get("negative_keywords", [])]
        positive_keywords = [w.lower() for w in nlp_intent.get("positive_keywords", [])]

        for rank, item in enumerate(vector_results):
            cid = item.get("chunk_id", f"vec_{rank}")
            chunk_map[cid] = item
            scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank + 1))

        for rank, item in enumerate(bm25_results):
            cid = item.get("chunk_id", f"bm25_{rank}")
            if cid not in chunk_map:
                chunk_map[cid] = item
            scores[cid] = scores.get(cid, 0.0) + (1.0 / (k + rank + 1))

        # Apply Semantic Intent & Negative Domain Adjustments
        final_scores: Dict[str, float] = {}
        for cid, base_score in scores.items():
            chunk = chunk_map[cid]
            doc_id = chunk.get("document_id", "")
            title = chunk.get("document_title", "").lower()
            content = chunk.get("content", "").lower()
            section = chunk.get("section_title", "").lower()
            combined_text = f"{title} {section} {content}"

            # Strict domain filters:
            # If intent is placements, discard attendance and curriculum circulars
            if intent == "placements" and doc_id in ["doc_pdeu_circular_04", "doc_pdeu_acad_reg"]:
                continue
            # If intent is regulations (attendance), discard placements
            if intent == "regulations" and doc_id in ["doc_pdeu_placements_career"]:
                continue
            # If intent is curriculum lookup for computer engineering, discard solar, m.tech, etc.
            if intent == "curriculum_lookup":
                if any(neg in combined_text for neg in ["solar", "m. tech energy", "m.tech petroleum", "school of liberal studies", "bba"]):
                    continue

            score = base_score

            # Boost preferred authoritative document IDs
            if doc_id in preferred_docs:
                score *= 2.5

            # Positive keyword match boost
            matches = sum(1 for kw in positive_keywords if kw in combined_text)
            score += matches * 0.015

            # Soft negative keyword penalty
            penalties = sum(1 for neg in negative_keywords if neg in combined_text)
            score -= penalties * 0.02

            if score > 0:
                final_scores[cid] = score

        # Sort by adjusted fused score descending
        sorted_cids = sorted(final_scores.keys(), key=lambda c: final_scores[c], reverse=True)
        return [chunk_map[cid] for cid in sorted_cids[:5]]

rag_engine = RAGEngine()
