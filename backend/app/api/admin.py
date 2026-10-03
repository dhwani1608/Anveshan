from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models.entities import Document, ConflictRecord, User
from app.schemas.schemas import ConflictResolutionRequest
from app.api.deps import get_current_user
from app.services.conflict_detector import conflict_detector
from app.services.knowledge_graph import knowledge_graph_service

router = APIRouter(prefix="/admin", tags=["Admin Governance"])

@router.get("/overview")
async def get_admin_overview(
    organization_id: str = "PDEU",
    db: AsyncSession = Depends(get_db)
):
    docs_res = await db.execute(select(Document).where(Document.organization_id == organization_id))
    docs = docs_res.scalars().all()
    
    conflicts_res = await db.execute(select(ConflictRecord).where(ConflictRecord.organization_id == organization_id))
    conflicts = conflicts_res.scalars().all()

    graph_data = knowledge_graph_service.get_full_graph_data(organization_id=organization_id)

    return {
        "organization_id": organization_id,
        "total_documents": len(docs),
        "authoritative_documents": len([d for d in docs if d.verification_status == "AUTHORITATIVE"]),
        "verified_documents": len([d for d in docs if d.verification_status == "VERIFIED"]),
        "detected_conflicts": len(conflicts),
        "graph_nodes_count": len(graph_data.get("nodes", [])),
        "graph_edges_count": len(graph_data.get("edges", [])),
        "active_batches": ["2027", "2025", "2024"]
    }

@router.get("/conflicts")
async def list_conflicts(
    organization_id: str = "PDEU",
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ConflictRecord).where(ConflictRecord.organization_id == organization_id))
    conflicts = result.scalars().all()
    return conflicts

@router.post("/conflicts/resolve")
async def resolve_conflict(
    res_req: ConflictResolutionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ConflictRecord).where(ConflictRecord.id == res_req.conflict_id))
    conf = result.scalar_one_or_none()
    if not conf:
        raise HTTPException(status_code=404, detail="Conflict record not found.")

    conf.status = res_req.resolution_status
    conf.resolution_notes = res_req.notes
    await db.commit()

    return {"message": f"Conflict '{conf.title}' status updated to {res_req.resolution_status}."}

@router.post("/verify-document")
async def verify_document(
    document_id: str,
    status: str,  # AUTHORITATIVE, VERIFIED, OUTDATED, UNVERIFIED
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc.verification_status = status
    await db.commit()
    return {"message": f"Document '{doc.title}' marked as {status}."}
