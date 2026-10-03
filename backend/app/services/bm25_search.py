import re
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi

class BM25SearchService:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.bm25: Optional[BM25Okapi] = None
        self.corpus_tokens: List[List[str]] = []

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"\b[a-zA-Z0-9_-]{2,}\b", text.lower())

    def index_chunks(self, chunks: List[Dict[str, Any]]):
        self.chunks = chunks
        self.corpus_tokens = [self._tokenize(c.get("content", "")) for c in chunks]
        if self.corpus_tokens:
            self.bm25 = BM25Okapi(self.corpus_tokens)
        else:
            self.bm25 = None

    def search(
        self,
        query: str,
        organization_id: str = "PDEU",
        batch_filter: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        if not self.bm25 or not self.chunks:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        doc_scores = self.bm25.get_scores(query_tokens)
        scored_pairs = []

        for idx, score in enumerate(doc_scores):
            chunk = self.chunks[idx]
            # Multi-tenant isolation
            if chunk.get("organization_id") != organization_id:
                continue

            # Context batch filtering
            if batch_filter and chunk.get("applicable_batch") not in ["ALL", batch_filter, None]:
                continue

            if score > 0:
                scored_pairs.append((float(score), chunk))

        scored_pairs.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, chunk in scored_pairs[:top_k]:
            item = dict(chunk)
            item["bm25_score"] = score
            results.append(item)
        return results

bm25_service = BM25SearchService()
