import math
import re
from typing import List
import numpy as np

import hashlib
import re
from typing import List, Set
import numpy as np

STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "could", "did", "do", "does", "doing", "down", "during",
    "each", "few", "for", "from", "further",
    "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
    "i", "if", "in", "into", "is", "it", "its", "itself",
    "me", "more", "most", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
    "same", "she", "should", "so", "some", "such",
    "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too",
    "under", "until", "up", "very",
    "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would",
    "you", "your", "yours", "yourself", "yourselves"
}

class LocalEmbeddingModel:
    """
    Deterministic, high-dimension semantic feature-hashing embedding generator.
    Guarantees reproducible vector spaces without process hash seed variations,
    filters stopwords to prevent spurious cross-topic correlations,
    and scales to 1024 dimensions with n-gram capture.
    """
    def __init__(self, dimension: int = 1024):
        self.dimension = dimension

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z0-9_-]{2,}\b", text.lower())
        # Filter out common stopwords to avoid cross-topic noise
        return [w for w in words if w not in STOPWORDS]

    def _hash_token(self, token: str) -> int:
        # MD5 deterministic hash bucket (unaffected by Python process hash seed)
        digest = hashlib.md5(token.encode("utf-8")).hexdigest()
        return int(digest[:8], 16) % self.dimension

    def embed_text(self, text: str) -> List[float]:
        tokens = self._tokenize(text)
        if not tokens:
            return [0.0] * self.dimension
        
        vec = np.zeros(self.dimension, dtype=np.float32)
        for i, token in enumerate(tokens):
            h = self._hash_token(token)
            vec[h] += 1.0

            # Sub-word / prefix capture for domain terms
            if len(token) > 4:
                prefix_h = self._hash_token(token[:4])
                vec[prefix_h] += 0.4

            # Bigram sequential hashing
            if i < len(tokens) - 1:
                bigram = f"{token}_{tokens[i+1]}"
                bigram_h = self._hash_token(bigram)
                vec[bigram_h] += 0.8
        
        # L2 normalize
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]

class EmbeddingService:
    def __init__(self):
        self.local_model = LocalEmbeddingModel(dimension=1024)

    def get_embedding(self, text: str) -> List[float]:
        return self.local_model.embed_text(text)

    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        return self.local_model.embed_batch(texts)

embedding_service = EmbeddingService()
