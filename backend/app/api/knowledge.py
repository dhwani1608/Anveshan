from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from app.services.knowledge_graph import knowledge_graph_service

router = APIRouter(prefix="/knowledge", tags=["Knowledge Graph"])

@router.get("/graph")
async def get_graph_data(organization_id: str = "PDEU") -> Dict[str, Any]:
    """Returns nodes and edges for the visual graph representation."""
    return knowledge_graph_service.get_full_graph_data(organization_id=organization_id)

@router.get("/prerequisites/{course_code}")
async def get_course_prereqs(course_code: str) -> List[Dict[str, Any]]:
    """Returns prerequisites for a given course code."""
    prereqs = knowledge_graph_service.get_course_prerequisites(course_code)
    return prereqs

@router.get("/cypher")
async def export_cypher():
    """Generates Neo4j Cypher script to instantiate graph in enterprise Neo4j."""
    cypher_text = knowledge_graph_service.export_neo4j_cypher()
    return {"cypher": cypher_text}
