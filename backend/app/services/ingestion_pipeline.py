import uuid
import re
from typing import List, Dict, Any, Optional
from app.services.vector_store import vector_store
from app.services.bm25_search import bm25_service
from app.services.knowledge_graph import knowledge_graph_service

class IngestionPipeline:
    def __init__(self):
        self.all_indexed_chunks: List[Dict[str, Any]] = []

    def chunk_document(
        self,
        document_id: str,
        document_title: str,
        content: str,
        applicable_batch: str = "ALL",
        category: str = "ACADEMIC",
        verification_status: str = "AUTHORITATIVE",
        organization_id: str = "PDEU"
    ) -> List[Dict[str, Any]]:
        # Split text into meaningful sections by double newline or headers
        raw_sections = [s.strip() for s in re.split(r"\n\s*\n|(?=###?\s+)", content) if len(s.strip()) > 30]
        chunks = []

        for idx, sec in enumerate(raw_sections):
            chunk_id = f"{document_id}_chunk_{idx+1}"
            
            # Extract section title if present
            section_match = re.search(r"^(?:###?\s+)?([A-Za-z0-9\s:_-]{3,50})\n", sec)
            section_title = section_match.group(1).strip() if section_match else f"Section {idx+1}"
            
            # Approximate page number (roughly 800 characters per page)
            page_number = (idx // 2) + 1

            chunk_item = {
                "chunk_id": chunk_id,
                "document_id": document_id,
                "document_title": document_title,
                "content": sec,
                "page_number": page_number,
                "section_title": section_title,
                "applicable_batch": applicable_batch,
                "category": category,
                "verification_status": verification_status,
                "organization_id": organization_id
            }
            chunks.append(chunk_item)
            
            # Add to vector store
            vector_store.add_chunk(
                chunk_id=chunk_id,
                document_id=document_id,
                document_title=document_title,
                content=sec,
                page_number=page_number,
                section_title=section_title,
                applicable_batch=applicable_batch,
                category=category,
                verification_status=verification_status,
                organization_id=organization_id
            )

        self.all_indexed_chunks.extend(chunks)
        # Re-index BM25 with full set
        bm25_service.index_chunks(self.all_indexed_chunks)

        # Extract entities and relationships to enrich knowledge graph
        self._extract_entities_and_relations(document_id, document_title, content, applicable_batch, organization_id)

        return chunks

    def _extract_entities_and_relations(
        self,
        document_id: str,
        document_title: str,
        content: str,
        applicable_batch: str,
        organization_id: str
    ):
        doc_node_id = f"doc:{document_id}"
        knowledge_graph_service.add_entity(
            entity_id=doc_node_id,
            entity_type="Document",
            name=document_title,
            organization_id=organization_id,
            properties={"applicable_batch": applicable_batch}
        )

        # Look for course codes like CS401, CS201
        course_codes = re.findall(r"\b(CS[0-9]{3})\b", content)
        for code in set(course_codes):
            course_node_id = f"course:{code}"
            knowledge_graph_service.add_entity(
                entity_id=course_node_id,
                entity_type="Course",
                name=f"Course {code}",
                organization_id=organization_id
            )
            # Connect document to course
            knowledge_graph_service.add_relationship(
                source_id=doc_node_id,
                relation_type="DESCRIBES",
                target_id=course_node_id,
                organization_id=organization_id
            )

        # Connect to batch if batch specific
        if applicable_batch != "ALL":
            batch_node_id = f"batch:{applicable_batch}"
            knowledge_graph_service.add_entity(
                entity_id=batch_node_id,
                entity_type="Batch",
                name=f"Batch {applicable_batch}",
                organization_id=organization_id
            )
            knowledge_graph_service.add_relationship(
                source_id=doc_node_id,
                relation_type="VALID_FOR",
                target_id=batch_node_id,
                organization_id=organization_id
            )

ingestion_pipeline = IngestionPipeline()
