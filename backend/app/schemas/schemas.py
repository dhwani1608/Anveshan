from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    organization_id: Optional[str] = "PDEU"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class StudentProfileSchema(BaseModel):
    id: str
    roll_number: str
    program: str
    department: str
    batch: str
    current_academic_year: str
    current_semester: int
    completed_courses: List[str]
    cgpa: float

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    organization_id: str
    profile: Optional[StudentProfileSchema] = None

# Chat & RAG Schemas
class ChatQueryRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None
    organization_id: Optional[str] = "PDEU"
    batch_override: Optional[str] = None
    semester_override: Optional[int] = None

class CitationItem(BaseModel):
    citation_id: int
    document_id: str
    document_title: str
    version: str
    page_number: Optional[int] = None
    section: Optional[str] = None
    verification_status: str  # AUTHORITATIVE, VERIFIED, UNVERIFIED, OUTDATED
    snippet: str

class GraphStep(BaseModel):
    source: str
    relation: str
    target: str

class ConflictItem(BaseModel):
    id: str
    title: str
    source_a_title: str
    source_a_snippet: str
    source_b_title: str
    source_b_snippet: str
    description: str

class ChatQueryResponse(BaseModel):
    conversation_id: str
    message_id: str
    status: str  # ANSWERED, PARTIALLY_ANSWERED, INSUFFICIENT_EVIDENCE, CONFLICT_DETECTED
    direct_answer: str
    explanation: str
    user_context: Dict[str, Any]
    citations: List[CitationItem]
    graph_traversal: List[GraphStep]
    conflicts: List[ConflictItem]
    related_actions: List[str]
    retrieval_method: str = "hybrid_vector_bm25_graph"
    latency_ms: float

# Document & Ingestion Schemas
class DocumentCreate(BaseModel):
    title: str
    category: str
    department: Optional[str] = "Computer Science & Engineering"
    applicable_batch: Optional[str] = "ALL"
    current_version: Optional[str] = "1.0"
    verification_status: Optional[str] = "AUTHORITATIVE"
    source_url: Optional[str] = None
    validity_period: Optional[str] = None
    raw_content: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str
    organization_id: str
    title: str
    category: str
    department: Optional[str]
    applicable_batch: str
    current_version: str
    verification_status: str
    source_url: Optional[str]
    validity_period: Optional[str]
    chunk_count: Optional[int] = 0

# Knowledge Graph Schemas
class GraphNode(BaseModel):
    id: str
    name: str
    entity_type: str
    properties: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    relation: str
    target: str
    properties: Dict[str, Any] = {}

class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# Admin Conflict Resolution
class ConflictResolutionRequest(BaseModel):
    conflict_id: str
    resolution_status: str  # RESOLVED, VERIFIED_CONFLICT, DISMISSED
    notes: str
