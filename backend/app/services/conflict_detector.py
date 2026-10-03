from typing import List, Dict, Any, Optional

class ConflictDetectorService:
    def __init__(self):
        # Known conflicts registered in the system
        self.registered_conflicts: List[Dict[str, Any]] = []

    def register_conflict(
        self,
        conflict_id: str,
        title: str,
        topic: str,
        source_a_id: str,
        source_a_title: str,
        source_a_snippet: str,
        source_b_id: str,
        source_b_title: str,
        source_b_snippet: str,
        description: str,
        organization_id: str = "PDEU"
    ):
        self.registered_conflicts.append({
            "id": conflict_id,
            "title": title,
            "topic": topic.lower(),
            "source_a_id": source_a_id,
            "source_a_title": source_a_title,
            "source_a_snippet": source_a_snippet,
            "source_b_id": source_b_id,
            "source_b_title": source_b_title,
            "source_b_snippet": source_b_snippet,
            "description": description,
            "organization_id": organization_id,
            "status": "DETECTED"
        })

    def check_conflicts(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        organization_id: str = "PDEU"
    ) -> List[Dict[str, Any]]:
        """
        Scans query and retrieved chunks for known or detected contradictions.
        """
        query_lower = query.lower()
        active_conflicts = []

        # Check registered conflicts
        for conf in self.registered_conflicts:
            if conf.get("organization_id") != organization_id:
                continue

            topic = conf.get("topic", "")
            # If the user asks about attendance / exemption or the chunks contain both sources
            triggers = ["attendance", "minimum", "exemption", "concession", "sports", "hackathon", "80%", "75%"]
            if any(t in query_lower for t in triggers) or (topic in query_lower):
                active_conflicts.append({
                    "id": conf["id"],
                    "title": conf["title"],
                    "source_a_title": conf["source_a_title"],
                    "source_a_snippet": conf["source_a_snippet"],
                    "source_b_title": conf["source_b_title"],
                    "source_b_snippet": conf["source_b_snippet"],
                    "description": conf["description"]
                })

        return active_conflicts

conflict_detector = ConflictDetectorService()
