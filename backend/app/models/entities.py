import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(50), primary_key=True)  # e.g., "PDEU"
    name = Column(String(255), nullable=False)
    type = Column(String(50), default="UNIVERSITY")  # UNIVERSITY, CORPORATE, HEALTHCARE, etc.
    domain = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(50), ForeignKey("organizations.id"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student")  # student, faculty, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="users")
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    organization_id = Column(String(50), nullable=False, index=True)
    roll_number = Column(String(50), nullable=False)
    program = Column(String(100), default="B.Tech")
    department = Column(String(100), default="Computer Science & Engineering")
    batch = Column(String(50), nullable=False)  # e.g. "2027" or "2025" (Admission Cohort)
    current_academic_year = Column(String(50), default="2026-2027")  # Separate concept from batch
    current_semester = Column(Integer, default=7)
    completed_courses_json = Column(Text, default="[]")  # List of codes like ["CS201", "CS202", "CS301"]
    cgpa = Column(Float, default=8.5)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="student_profile")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(100), primary_key=True)
    organization_id = Column(String(50), ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # CURRICULUM, REGULATION, NOTICE, COURSE_SYLLABUS
    department = Column(String(100), nullable=True)
    applicable_batch = Column(String(50), default="ALL", index=True)  # "2027", "2025", "ALL"
    current_version = Column(String(50), default="1.0")
    verification_status = Column(String(50), default="AUTHORITATIVE")  # AUTHORITATIVE, VERIFIED, UNVERIFIED, OUTDATED
    source_url = Column(String(500), nullable=True)
    file_path = Column(String(500), nullable=True)
    validity_period = Column(String(100), nullable=True)
    last_verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(String(100), primary_key=True)
    document_id = Column(String(100), ForeignKey("documents.id"), nullable=False, index=True)
    version_str = Column(String(50), nullable=False)
    academic_year = Column(String(50), nullable=False)
    applicable_batch = Column(String(50), nullable=False)
    checksum = Column(String(100), nullable=True)
    changelog = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="versions")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(100), primary_key=True)
    document_id = Column(String(100), ForeignKey("documents.id"), nullable=False, index=True)
    organization_id = Column(String(50), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    section_title = Column(String(255), nullable=True)
    applicable_batch = Column(String(50), default="ALL", index=True)
    category = Column(String(50), nullable=True)
    embedding_json = Column(Text, nullable=True)
    token_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="chunks")

class Course(Base):
    __tablename__ = "courses"

    id = Column(String(50), primary_key=True)  # e.g., "CS401"
    organization_id = Column(String(50), nullable=False, index=True)
    code = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    department = Column(String(100), default="Computer Science & Engineering")
    credits = Column(Integer, default=4)
    semester = Column(Integer, default=7)
    applicable_batch = Column(String(50), default="ALL")
    description = Column(Text, nullable=True)
    prerequisites_json = Column(Text, default="[]")  # e.g. ["CS201", "CS302"]

class Regulation(Base):
    __tablename__ = "regulations"

    id = Column(String(50), primary_key=True)
    organization_id = Column(String(50), nullable=False, index=True)
    code = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="ACADEMIC")  # ATTENDANCE, EXAM, GRADING, PROMOTION
    rule_text = Column(Text, nullable=False)
    applicable_batches = Column(String(100), default="ALL")
    min_attendance_pct = Column(Float, nullable=True)
    status = Column(String(50), default="AUTHORITATIVE")

class Notice(Base):
    __tablename__ = "notices"

    id = Column(String(50), primary_key=True)
    organization_id = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    ref_number = Column(String(100), nullable=False)
    publish_date = Column(String(50), nullable=False)
    target_batches = Column(String(100), default="ALL")
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)

class ConflictRecord(Base):
    __tablename__ = "conflict_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(100), nullable=False)
    source_a_id = Column(String(100), nullable=False)
    source_a_title = Column(String(255), nullable=False)
    source_a_snippet = Column(Text, nullable=False)
    source_b_id = Column(String(100), nullable=False)
    source_b_title = Column(String(255), nullable=False)
    source_b_snippet = Column(Text, nullable=False)
    conflict_description = Column(Text, nullable=False)
    status = Column(String(50), default="DETECTED")  # DETECTED, VERIFIED_CONFLICT, RESOLVED
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class KnowledgeEntity(Base):
    __tablename__ = "knowledge_entities"

    id = Column(String(100), primary_key=True)  # unique node id e.g. "course:CS401"
    organization_id = Column(String(50), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)  # University, Department, Program, Batch, Course, Regulation
    name = Column(String(255), nullable=False)
    properties_json = Column(Text, default="{}")

class KnowledgeRelationship(Base):
    __tablename__ = "knowledge_relationships"

    id = Column(String(100), primary_key=True, default=generate_uuid)
    organization_id = Column(String(50), nullable=False, index=True)
    source_id = Column(String(100), nullable=False, index=True)
    relation_type = Column(String(50), nullable=False, index=True)
    target_id = Column(String(100), nullable=False, index=True)
    properties_json = Column(Text, default="{}")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(50), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), default="Academic Inquiry")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    status = Column(String(50), default="ANSWERED")  # ANSWERED, PARTIALLY_ANSWERED, INSUFFICIENT_EVIDENCE, CONFLICT_DETECTED
    direct_answer = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    reasoning_json = Column(Text, nullable=True)
    citations_json = Column(Text, default="[]")
    graph_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
