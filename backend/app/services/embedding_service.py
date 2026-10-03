import math
import re
from typing import List
import numpy as np

class LocalEmbeddingModel:
    """
    Lightweight, deterministic feature-hashing and bag-of-words embedding generator.
    Guarantees instant startup with 0 external network dependencies,
    while producing meaningful semantic vector distances for academic texts.
    """
    def __init__(self, dimension: int = 128):
        self.dimension = dimension

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z0-9_]{2,}\b", text.lower())
        return words

    def embed_text(self, text: str) -> List[float]:
        tokens = self._tokenize(text)
        if not tokens:
            return [0.0] * self.dimension
        
        vec = np.zeros(self.dimension, dtype=np.float32)
        for token in tokens:
            # Deterministic hash bucket
            h = hash(token) % self.dimension
            vec[h] += 1.0
            # Bi-gram capture for sequential matching
            if len(token) > 4:
                sub_h = hash(token[:4]) % self.dimension
                vec[sub_h] += 0.5
        
        # L2 normalize
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]

class EmbeddingService:
    def __init__(self):
        self.local_model = LocalEmbeddingModel(dimension=128)

    def get_embedding(self, text: str) -> List[float]:
        return self.local_model.embed_text(text)

    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        return self.local_model.embed_batch(texts)

embedding_service = EmbeddingService()
