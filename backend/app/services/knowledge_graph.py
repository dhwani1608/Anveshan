import json
from typing import List, Dict, Any, Optional, Set
import networkx as nx

class KnowledgeGraphService:
    def __init__(self):
        # NetworkX multi-directed graph holding knowledge nodes & edges
        self.graph = nx.MultiDiGraph()
        self.node_metadata: Dict[str, Dict[str, Any]] = {}

    def clear(self):
        self.graph.clear()
        self.node_metadata.clear()

    def add_entity(
        self,
        entity_id: str,
        entity_type: str,
        name: str,
        organization_id: str = "PDEU",
        properties: Optional[Dict[str, Any]] = None
    ):
        props = properties or {}
        props.update({
            "id": entity_id,
            "entity_type": entity_type,
            "name": name,
            "organization_id": organization_id
        })
        self.graph.add_node(entity_id, **props)
        self.node_metadata[entity_id] = props

    def add_relationship(
        self,
        source_id: str,
        relation_type: str,
        target_id: str,
        organization_id: str = "PDEU",
        properties: Optional[Dict[str, Any]] = None
    ):
        props = properties or {}
        props.update({
            "relation_type": relation_type,
            "organization_id": organization_id
        })
        self.graph.add_edge(source_id, target_id, key=relation_type, **props)

    def get_course_prerequisites(self, course_id_or_code: str) -> List[Dict[str, Any]]:
        """Finds all prerequisites required for a given course."""
        prereqs = []
        target_node = None
        code_query = course_id_or_code.lower().strip()
        for n, data in self.graph.nodes(data=True):
            n_id = str(data.get("id", n)).lower()
            n_name = str(data.get("name", "")).lower()
            if (
                n_id == code_query
                or n_id == f"course:{code_query}"
                or n_id.endswith(f":{code_query}")
                or code_query == n_name
                or f" {code_query} " in f" {n_name} "
            ):
                target_node = n
                break
        
        if not target_node:
            return []

        # Outgoing edges with relation_type == "REQUIRES"
        for _, neighbor, edge_data in self.graph.out_edges(target_node, data=True):
            if edge_data.get("relation_type") in ["REQUIRES", "PREREQUISITE_FOR"]:
                prereqs.append({
                    "course_id": neighbor,
                    "course_name": self.graph.nodes[neighbor].get("name", neighbor),
                    "min_grade": edge_data.get("min_grade", "C")
                })
        return prereqs

    def check_course_eligibility(
        self,
        course_code: str,
        student_completed_courses: List[str]
    ) -> Dict[str, Any]:
        """
        Evaluates whether a student meets the prerequisite graph requirements for a course.
        """
        prereqs = self.get_course_prerequisites(course_code)
        if not prereqs:
            return {
                "eligible": True,
                "missing_prerequisites": [],
                "fulfilled_prerequisites": [],
                "reason": f"Course '{course_code}' has no prerequisites."
            }

        completed_set = {c.strip().upper() for c in student_completed_courses}
        missing = []
        fulfilled = []

        for p in prereqs:
            p_code = p["course_id"].replace("course:", "").upper()
            p_name = p["course_name"].upper()
            
            # Check code or title matching in completed list
            matched = any(p_code in comp or p_name in comp for comp in completed_set)
            if matched:
                fulfilled.append(p)
            else:
                missing.append(p)

        is_eligible = len(missing) == 0
        return {
            "eligible": is_eligible,
            "missing_prerequisites": missing,
            "fulfilled_prerequisites": fulfilled,
            "reason": (
                f"Eligible: All prerequisites fulfilled."
                if is_eligible else
                f"Ineligible: Missing prerequisites: {', '.join([m['course_name'] for m in missing])}."
            )
        }

    def query_subgraph(
        self,
        query: str,
        organization_id: str = "PDEU",
        batch: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """
        Traverses nodes matching keywords in the query and returns structured
        source -> relation -> target paths.
        """
        query_lower = query.lower()
        matched_nodes: Set[str] = set()

        for node_id, data in self.graph.nodes(data=True):
            if data.get("organization_id") != organization_id:
                continue
            name = str(data.get("name", "")).lower()
            entity_type = str(data.get("entity_type", "")).lower()
            node_str = str(node_id).lower()

            # Word match or substring match
            if any(term in query_lower for term in name.split()) or any(term in name for term in query_lower.split() if len(term) > 3):
                matched_nodes.add(node_id)
            elif "prerequisite" in query_lower and entity_type == "course":
                matched_nodes.add(node_id)
            elif "curriculum" in query_lower and (entity_type in ["course", "batch", "program"]):
                matched_nodes.add(node_id)
            elif "attendance" in query_lower and entity_type in ["regulation", "notice"]:
                matched_nodes.add(node_id)

        traversals: List[Dict[str, str]] = []
        visited_edges: Set[str] = set()

        for node in matched_nodes:
            # Check outgoing edges
            for u, v, data in self.graph.out_edges(node, data=True):
                edge_key = f"{u}->{data.get('relation_type')}->{v}"
                if edge_key not in visited_edges:
                    visited_edges.add(edge_key)
                    u_name = self.graph.nodes[u].get("name", u)
                    v_name = self.graph.nodes[v].get("name", v)
                    traversals.append({
                        "source": u_name,
                        "relation": data.get("relation_type", "RELATED_TO"),
                        "target": v_name
                    })

            # Check incoming edges
            for u, v, data in self.graph.in_edges(node, data=True):
                edge_key = f"{u}->{data.get('relation_type')}->{v}"
                if edge_key not in visited_edges:
                    visited_edges.add(edge_key)
                    u_name = self.graph.nodes[u].get("name", u)
                    v_name = self.graph.nodes[v].get("name", v)
                    traversals.append({
                        "source": u_name,
                        "relation": data.get("relation_type", "RELATED_TO"),
                        "target": v_name
                    })

        return traversals[:8]

    def get_full_graph_data(self, organization_id: str = "PDEU") -> Dict[str, Any]:
        """Returns node and edge lists formatted for frontend visual rendering."""
        nodes = []
        for n, data in self.graph.nodes(data=True):
            if data.get("organization_id") == organization_id:
                nodes.append({
                    "id": n,
                    "name": data.get("name", n),
                    "entity_type": data.get("entity_type", "Entity"),
                    "properties": {k: v for k, v in data.items() if k not in ["name", "entity_type"]}
                })

        edges = []
        for u, v, k, data in self.graph.edges(data=True, keys=True):
            if data.get("organization_id") == organization_id:
                edges.append({
                    "id": f"{u}-{k}-{v}",
                    "source": u,
                    "target": v,
                    "relation": data.get("relation_type", k),
                    "properties": {pk: pv for pk, pv in data.items() if pk != "relation_type"}
                })

        return {"nodes": nodes, "edges": edges}

    def export_neo4j_cypher(self) -> str:
        """Generates executable Neo4j Cypher queries for enterprise deployment."""
        cypher_lines = ["// Anveshan Knowledge Graph Cypher Schema & Seed"]
        for n, data in self.graph.nodes(data=True):
            props_str = ", ".join([f"{k}: '{v}'" for k, v in data.items() if isinstance(v, str)])
            lbl = data.get("entity_type", "Entity")
            cypher_lines.append(f"MERGE (n:{lbl} {{id: '{n}'}}) SET n += {{{props_str}}};")

        for u, v, data in self.graph.edges(data=True):
            rel = data.get("relation_type", "RELATED_TO")
            cypher_lines.append(f"MATCH (a {{id: '{u}'}}), (b {{id: '{v}'}}) MERGE (a)-[:{rel}]->(b);")

        return "\n".join(cypher_lines)

knowledge_graph_service = KnowledgeGraphService()
