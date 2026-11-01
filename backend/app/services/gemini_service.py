import json
import os
import re
from typing import Dict, Any, List, Optional, Tuple
import httpx
from app.core.config import settings

DEFAULT_PDEU_URLS = {
    "doc_pdeu_curr_2027": "https://api.pdeu.ac.in/pdpu/resources/btech-ce-syllabus-2025.pdf",
    "doc_pdeu_curr_2025": "https://api.pdeu.ac.in/pdpu/resources/btech-ce-syllabus-2025.pdf",
    "doc_pdeu_placements_career": "https://pdeu.ac.in/placements",
    "doc_pdeu_admissions": "https://pdeu.ac.in/admissions",
    "doc_pdeu_anti_ragging_policy": "https://pdeu.ac.in/anti-ragging",
    "doc_pdeu_act_legislation": "https://api.pdeu.ac.in/pdpu/resources/pdeu-act-2021.pdf",
    "doc_pdeu_academic_programs": "https://pdeu.ac.in/courses",
    "doc_pdeu_governance": "https://pdeu.ac.in/about",
    "doc_pdeu_general_info": "https://pdeu.ac.in/about",
    "doc_pdeu_acad_reg": "https://pdeu.ac.in/regulations/academic-handbook-2026.pdf",
    "doc_pdeu_circular_04": "https://pdeu.ac.in/circulars/2026-04-attendance.pdf"
}

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or settings.GEMINI_API_KEY
        self.primary_model = "gemini-2.0-flash"
        self.fallback_model = "gemini-1.5-flash"

    def get_effective_key(self, runtime_key: Optional[str] = None) -> Optional[str]:
        if runtime_key and runtime_key.strip():
            return runtime_key.strip()
        env_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or settings.GEMINI_API_KEY
        if env_key and env_key.strip():
            return env_key.strip()
        return None

    def has_active_key(self, runtime_key: Optional[str] = None) -> bool:
        return bool(self.get_effective_key(runtime_key))

    async def understand_and_expand_query(
        self,
        raw_query: str,
        user_context: Dict[str, Any],
        runtime_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Uses Gemini NLP to analyze user prompt intent, correct typos, normalize academic entities,
        and generate positive search terms and negative domain exclusion filters.
        """
        key = self.get_effective_key(runtime_key)
        
        # 1. If Gemini API key is available, use Gemini for NLP Query Analysis
        if key:
            try:
                gemini_nlp = await self._gemini_nlp_query_parse(raw_query, user_context, key)
                if gemini_nlp:
                    return gemini_nlp
            except Exception as e:
                print(f"[Gemini NLP] Live query expansion failed ({e}), using local NLP engine.")

        # 2. Local Semantic NLP Query Understanding Engine (Zero-dependency fallback)
        return self._local_nlp_query_parse(raw_query, user_context)

    async def _gemini_nlp_query_parse(
        self,
        raw_query: str,
        user_context: Dict[str, Any],
        key: str
    ) -> Optional[Dict[str, Any]]:
        prompt = f"""
You are the NLP Query Understanding layer for PDEU (Pandit Deendayal Energy University) Anveshan Academic Intelligence.
Analyze this user query and produce search optimization parameters for accurate knowledge retrieval.

User Query: "{raw_query}"
Student Context:
- Name: {user_context.get('student_name', 'Student')}
- Program: {user_context.get('program', 'B.Tech Computer Science & Engineering')}
- Batch: {user_context.get('batch', '2027')}
- Current Semester: {user_context.get('semester', 7)}

Return ONLY a JSON object with keys:
{{
  "intent": "curriculum_lookup" | "placements" | "regulations" | "admissions" | "governance" | "anti_ragging" | "general",
  "target_program": "B.Tech Computer Engineering" or specific program,
  "target_year_or_sem": "First Year" | "Second Year" | "Third Year" | "Final Year" | null,
  "expanded_search_query": "natural keywords optimized for dense/sparse retrieval",
  "positive_keywords": ["list", "of", "high-priority", "terms"],
  "negative_keywords": ["unrelated", "cross-domain", "terms", "to", "exclude"],
  "preferred_document_ids": ["doc_pdeu_curr_2027", "doc_pdeu_placements_career", etc.]
}}
"""
        models_to_try = [self.primary_model, self.fallback_model]
        async with httpx.AsyncClient(timeout=8.0) as client:
            for model in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
                try:
                    resp = await client.post(
                        url,
                        json={
                            "contents": [{"parts": [{"text": prompt}]}],
                            "generationConfig": {"responseMimeType": "application/json"}
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(text)
                        parsed["source"] = f"gemini-nlp-{model}"
                        return parsed
                except Exception:
                    continue
        return None

    def _local_nlp_query_parse(self, raw_query: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        High-precision local NLP rule-based parser. Corrects typos and tags intent.
        """
        q = raw_query.lower()
        program = user_context.get("program", "B.Tech Computer Engineering")
        batch = user_context.get("batch", "2027")

        # Intent detection
        is_placement = any(w in q for w in ["salary", "package", "placement", "pacakage", "highest", "average", "ctc", "recruiter", "lpa", "job", "career"])
        is_curriculum = any(w in q for w in ["course", "curriculum", "syllabus", "subject", "credit", "sem", "semester", "first year", "second year", "1st year", "2nd year", "prerequisite", "elective"])
        is_attendance = any(w in q for w in ["attendance", "concession", "hackathon", "absent", "medical", "debarred", "condone", "relaxation", "80%", "75%"])
        is_governance = any(w in q for w in ["president", "chancellor", "ambani", "adhia", "director general", "governance", "act", "statutory", "board of governors", "bog"])
        is_admissions = any(w in q for w in ["admission", "acpc", "jee", "gujcet", "cutoff", "quota", "seat", "fees", "eligibility"])
        is_anti_ragging = any(w in q for w in ["ragging", "harassment", "helpline", "complaint", "anti-ragging"])

        intent = "general"
        target_year_or_sem = None
        positive_keywords = []
        negative_keywords = []
        preferred_doc_ids = []

        if is_placement:
            intent = "placements"
            positive_keywords = ["placement", "highest package", "average package", "42 LPA", "8.5 LPA", "recruiters", "ONGC", "Reliance", "Amazon"]
            negative_keywords = ["attendance", "circular 2026/04", "hackathon", "medical", "exam debarment", "reg-acad-04"]
            preferred_doc_ids = ["doc_pdeu_placements_career"]
            expanded_query = "PDEU highest placement package average CTC corporate recruiters ONGC Reliance Amazon Microsoft salary statistics"

        elif is_curriculum:
            intent = "curriculum_lookup"
            # Detect year / semester
            if any(w in q for w in ["first year", "1st year", "freshman", "sem 1", "sem 2", "semester 1", "semester 2", "sem i", "sem ii"]):
                target_year_or_sem = "First Year"
                positive_keywords = ["Semester I", "Semester II", "Computer Programming", "Mathematics - I", "Applied Physics", "Engineering Graphics", "Engineering Chemistry", "BEE", "20 Credits"]
                expanded_query = "B.Tech Computer Engineering First Year Course Structure Semester 1 Semester 2 Mathematics Physics Chemistry Programming 40 credits"
            elif any(w in q for w in ["second year", "2nd year", "sophomore", "sem 3", "sem 4", "semester 3", "semester 4", "sem iii", "sem iv"]):
                target_year_or_sem = "Second Year"
                positive_keywords = ["Semester III", "Semester IV", "Data Structures", "Discrete Mathematics", "DBMS", "Operating Systems", "Digital Logic"]
                expanded_query = "B.Tech Computer Engineering Second Year Course Structure Semester 3 Semester 4 Data Structures DBMS Operating Systems Discrete Mathematics"
            else:
                positive_keywords = ["B.Tech Computer Engineering", "Curriculum", "Course Structure", "Credit Breakdown", "Batch 2027"]
                expanded_query = f"{program} Curriculum Course Structure Credit Breakdown Syllabus"

            # Filter out cross-domain unrelated branches
            if "cse" in q or "computer" in q or "ce" in q or "bcp" in q or "bcs" in q or "b.tech" in program.lower():
                negative_keywords = ["solar", "m.tech", "petroleum", "chemical", "energy systems", "mba", "liberal studies", "bba"]

            preferred_doc_ids = ["doc_pdeu_curr_2027", "doc_pdeu_curr_2025"]

        elif is_attendance:
            intent = "regulations"
            positive_keywords = ["attendance", "REG-ACAD-04", "80% attendance", "Circular 2026/04", "75% concession", "hackathon", "sports"]
            negative_keywords = ["placement", "salary", "package", "highest package"]
            preferred_doc_ids = ["doc_pdeu_circular_04", "doc_pdeu_acad_reg"]
            expanded_query = "PDEU student attendance requirement REG-ACAD-04 80 percent Circular 2026 04 hackathon concession 75 percent"

        elif is_governance:
            intent = "governance"
            positive_keywords = ["President Mukesh Ambani", "Dr Hasmukh Adhia", "Prof Sundar Manoharan", "Gujarat Act No 7 of 2021", "Board of Governors"]
            negative_keywords = ["attendance", "course structure"]
            preferred_doc_ids = ["doc_pdeu_governance", "doc_pdeu_act_legislation"]
            expanded_query = "PDEU statutory governance President Mukesh Ambani BoG Director General Gujarat Act 2021"

        elif is_admissions:
            intent = "admissions"
            positive_keywords = ["B.Tech Admissions", "ACPC Gujarat 50%", "All India JEE Main 50%", "Eligibility", "GUJCET"]
            preferred_doc_ids = ["doc_pdeu_admissions"]
            expanded_query = "PDEU B.Tech Admissions ACPC Gujarat quota All India JEE Main eligibility seat distribution"

        elif is_anti_ragging:
            intent = "anti_ragging"
            positive_keywords = ["Anti-Ragging Policy", "Toll Free Helpline 1800-180-5522", "Zero Tolerance", "FIR", "UGC Regulations"]
            preferred_doc_ids = ["doc_pdeu_anti_ragging_policy"]
            expanded_query = "PDEU Anti Ragging policy 24x7 toll free helpline number 1800-180-5522 zero tolerance"

        else:
            expanded_query = raw_query

        return {
            "intent": intent,
            "target_program": program,
            "target_year_or_sem": target_year_or_sem,
            "expanded_search_query": expanded_query,
            "positive_keywords": positive_keywords,
            "negative_keywords": negative_keywords,
            "preferred_document_ids": preferred_doc_ids,
            "source": "local-nlp-engine"
        }

    async def generate_grounded_answer(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        graph_traversals: List[Dict[str, Any]],
        user_context: Dict[str, Any],
        conflicts: List[Dict[str, Any]],
        course_eligibility: Optional[Dict[str, Any]] = None,
        runtime_key: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Uses Gemini API (gemini-2.0-flash / gemini-1.5-flash) to synthesize a direct, highly grounded,
        well-structured response citing official PDEU handbooks and policies.
        """
        key = self.get_effective_key(runtime_key)
        if not key:
            return None

        # Build clean evidence blocks
        evidence_snippets = []
        for i, c in enumerate(retrieved_chunks[:5]):
            doc_title = c.get("document_title", "PDEU Official Document")
            sec = c.get("section_title", "General")
            page = c.get("page_number", 1)
            content = c.get("content", "").strip()[:800]
            evidence_snippets.append(
                f"[Source {i+1}]: {doc_title} (Section: {sec}, Page: {page})\n\"{content}\""
            )

        evidence_text = "\n\n".join(evidence_snippets)

        system_prompt = """
You are ANVESHAN, the authoritative official Academic Intelligence & Decision Reasoning Agent for Pandit Deendayal Energy University (PDEU, formerly PDPU), Gandhinagar.

Your mission is to provide accurate, articulate, helpful, and completely grounded answers to student and faculty inquiries based strictly on official PDEU handbooks, curricula, circulars, and statutes.

STRICT INSTRUCTIONS:
1. DIRECT ANSWER: Provide a clear, direct, and unambiguous answer in the first 1-2 sentences. Avoid robotic phrasing like "According to official PDEU records... Click Here for...".
2. EXPLANATION: Provide an articulate, structured academic explanation using GitHub Flavored Markdown (bullet points, bold highlights, sub-headers ###, course codes, and credit hours where applicable).
3. NO HALLUCINATION: Only state facts corroborated by the provided evidence chunks or student context.
4. CITATIONS: Extract authoritative citations for every factual statement with exact document titles and page numbers.
5. CONFLICTS: If the query involves a contradiction between a general policy and a newer circular (e.g. 80% vs 75% for hackathons), explicitly highlight both regulations.

You must respond with ONLY a valid JSON object matching this schema:
{
  "status": "ANSWERED" | "CONFLICT_DETECTED" | "INSUFFICIENT_EVIDENCE",
  "direct_answer": "Crisp 1-2 sentence direct answer",
  "explanation": "Structured detailed academic breakdown with markdown",
  "model_used": "Gemini 2.0 Flash Grounded",
  "citations": [
    {
      "citation_id": 1,
      "document_id": "doc_id",
      "document_title": "Full Official Title",
      "version": "v2.1",
      "page_number": 1,
      "section": "Section name",
      "verification_status": "AUTHORITATIVE",
      "source_url": "https://...",
      "snippet": "Short excerpt verbatim"
    }
  ],
  "graph_traversal": [
    {"source": "Subject", "relation": "PREDICATE", "target": "Object"}
  ],
  "conflicts": [],
  "related_actions": ["Download Source PDF", "Action 2"]
}
"""

        user_prompt = f"""
Student Profile Context:
- Student: {user_context.get('student_name', 'Student')}
- Program: {user_context.get('program', 'B.Tech Computer Engineering')}
- Enrolled Cohort / Batch: {user_context.get('batch', '2027')}
- Current Semester: {user_context.get('semester', 7)}
- Completed Courses: {user_context.get('completed_courses', [])}

User Question: "{query}"

Official PDEU Evidence Chunks:
{evidence_text}

Conflict Detections: {json.dumps(conflicts)}
Course Eligibility: {json.dumps(course_eligibility or {})}

Formulate the official response as structured JSON:
"""

        models = [self.primary_model, self.fallback_model]
        async with httpx.AsyncClient(timeout=18.0) as client:
            for model in models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
                try:
                    resp = await client.post(
                        url,
                        json={
                            "system_instruction": {"parts": [{"text": system_prompt}]},
                            "contents": [{"parts": [{"text": user_prompt}]}],
                            "generationConfig": {
                                "responseMimeType": "application/json",
                                "temperature": 0.2
                            }
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])
                        if parts:
                            raw_text = parts[0].get("text", "").strip()
                            # Clean possible markdown fences
                            if raw_text.startswith("```json"):
                                raw_text = raw_text[7:]
                            if raw_text.endswith("```"):
                                raw_text = raw_text[:-3]
                            parsed = json.loads(raw_text.strip())
                            parsed["model_used"] = f"Gemini ({model})"
                            parsed["user_context"] = user_context

                            # Ensure URLs in citations
                            for c in parsed.get("citations", []):
                                doc_id = c.get("document_id", "")
                                if not c.get("source_url") or c.get("source_url") == "https://pdeu.ac.in":
                                    c["source_url"] = DEFAULT_PDEU_URLS.get(doc_id, "https://pdeu.ac.in")

                            return parsed
                except Exception as e:
                    print(f"[Gemini Service] Model {model} call failed: {e}")
                    continue

        return None

gemini_service = GeminiService()
