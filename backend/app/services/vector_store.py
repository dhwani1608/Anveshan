from typing import List, Dict, Any, Optional
import numpy as np
from app.services.embedding_service import embedding_service

class VectorStore:
    def __init__(self):
        # In-memory index for fast search; synced with DB DocumentChunk
        self.chunks: List[Dict[str, Any]] = []
        self.embeddings: List[List[float]] = []

    def clear(self):
        self.chunks = []
        self.embeddings = []

    def add_chunk(
        self,
        chunk_id: str,
        document_id: str,
        document_title: str,
        content: str,
        page_number: Optional[int],
        section_title: Optional[str],
        applicable_batch: str,
        category: str,
        verification_status: str,
        organization_id: str = "PDEU",
        embedding: Optional[List[float]] = None
    ):
        if embedding is None:
            embedding = embedding_service.get_embedding(content)
        
        self.chunks.append({
            "chunk_id": chunk_id,
            "document_id": document_id,
            "document_title": document_title,
            "content": content,
            "page_number": page_number,
            "section_title": section_title,
            "applicable_batch": applicable_batch,
            "category": category,
            "verification_status": verification_status,
            "organization_id": organization_id
        })
        self.embeddings.append(embedding)

    def similarity_search(
        self,
        query: str,
        organization_id: str = "PDEU",
        batch_filter: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        if not self.embeddings:
            return []

        query_vec = np.array(embedding_service.get_embedding(query), dtype=np.float32)
        norm_q = np.linalg.norm(query_vec)
        if norm_q > 0:
            query_vec = query_vec / norm_q

        scored_results = []
        for i, chunk in enumerate(self.chunks):
            # Tenant isolation
            if chunk.get("organization_id") != organization_id:
                continue

            # Batch version filtering (keep batch-matching or generic "ALL")
            if batch_filter and chunk.get("applicable_batch") not in ["ALL", batch_filter, None]:
                continue

            doc_vec = np.array(self.embeddings[i], dtype=np.float32)
            # Dot product (both vectors are normalized)
            score = float(np.dot(query_vec, doc_vec))
            scored_results.append((score, chunk))

        # Sort descending by score
        scored_results.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, chunk in scored_results[:top_k]:
            item = dict(chunk)
            item["score"] = score
            results.append(item)

        return results

vector_store = VectorStore()
