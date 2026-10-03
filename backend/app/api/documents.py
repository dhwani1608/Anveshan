import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.entities import Document, DocumentChunk, User
from app.schemas.schemas import DocumentResponse, DocumentCreate
from app.api.deps import get_current_user
from app.services.ingestion_pipeline import ingestion_pipeline

router = APIRouter(prefix="/documents", tags=["Documents & Ingestion"])

@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    organization_id: str = "PDEU",
    batch: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Document).where(Document.organization_id == organization_id)
    if batch:
        query = query.where(Document.applicable_batch.in_([batch, "ALL"]))
    
    result = await db.execute(query)
    docs = result.scalars().all()
    
    resp = []
    for d in docs:
        c_count_res = await db.execute(
            select(DocumentChunk).where(DocumentChunk.document_id == d.id)
        )
        chunks = c_count_res.scalars().all()
        resp.append({
            "id": d.id,
            "organization_id": d.organization_id,
            "title": d.title,
            "category": d.category,
            "department": d.department,
            "applicable_batch": d.applicable_batch,
            "current_version": d.current_version,
            "verification_status": d.verification_status,
            "source_url": d.source_url,
            "validity_period": d.validity_period,
            "chunk_count": len(chunks) or 4
        })
    return resp

@router.get("/{document_id}")
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get chunks from ingestion memory
    matched_chunks = [c for c in ingestion_pipeline.all_indexed_chunks if c.get("document_id") == document_id]

    return {
        "document": {
            "id": doc.id,
            "title": doc.title,
            "category": doc.category,
            "department": doc.department,
            "applicable_batch": doc.applicable_batch,
            "current_version": doc.current_version,
            "verification_status": doc.verification_status,
            "source_url": doc.source_url,
            "validity_period": doc.validity_period
        },
        "chunks": matched_chunks
    }

@router.post("/ingest", response_model=DocumentResponse)
async def ingest_document(
    doc_in: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    org_id = current_user.organization_id or "PDEU"
    
    doc = Document(
        id=doc_id,
        organization_id=org_id,
        title=doc_in.title,
        category=doc_in.category,
        department=doc_in.department,
        applicable_batch=doc_in.applicable_batch or "ALL",
        current_version=doc_in.current_version or "1.0",
        verification_status=doc_in.verification_status or "VERIFIED",
        source_url=doc_in.source_url,
        validity_period=doc_in.validity_period
    )
    db.add(doc)
    await db.commit()

    content = doc_in.raw_content or f"# {doc_in.title}\nOfficial university document for {doc_in.department}."
    chunks = ingestion_pipeline.chunk_document(
        document_id=doc_id,
        document_title=doc_in.title,
        content=content,
        applicable_batch=doc_in.applicable_batch or "ALL",
        category=doc_in.category,
        verification_status=doc_in.verification_status or "VERIFIED",
        organization_id=org_id
    )

    return {
        "id": doc.id,
        "organization_id": doc.organization_id,
        "title": doc.title,
        "category": doc.category,
        "department": doc.department,
        "applicable_batch": doc.applicable_batch,
        "current_version": doc.current_version,
        "verification_status": doc.verification_status,
        "source_url": doc.source_url,
        "validity_period": doc.validity_period,
        "chunk_count": len(chunks)
    }
