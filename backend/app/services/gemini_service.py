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
    "doc_pdeu_circular_04": "https://pdeu.ac.in/circulars/2026-04-attendance.pdf",
    "doc_pdeu_faculty_directory": "https://pdeu.ac.in/faculties-and-staff",
    "doc_pdeu_hostel_facilities": "https://pdeu.ac.in/campus-life"
}

def is_valid_gemini_key(key: Optional[str]) -> bool:
    if not key or not isinstance(key, str):
        return False
    k = key.strip()
    if len(k) < 20:
        return False
    if k.lower() in ["x", "none", "null", "undefined", "your_gemini_api_key_here"]:
        return False
    return True

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or settings.GEMINI_API_KEY
        self.primary_model = "gemini-2.0-flash"
        self.fallback_model = "gemini-1.5-flash"

    def get_effective_key(self, runtime_key: Optional[str] = None) -> Optional[str]:
        if is_valid_gemini_key(runtime_key):
            return runtime_key.strip()
        env_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or settings.GEMINI_API_KEY
        if is_valid_gemini_key(env_key):
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
        Falls back to High-Precision Local NLP Engine if Gemini key is missing or calls fail.
        """
        # First check fast conversational greetings/smalltalk before any remote call
        local_parsed = self._local_nlp_query_parse(raw_query, user_context)
        if local_parsed.get("intent") in ["greeting", "bot_info", "smalltalk", "gratitude"]:
            return local_parsed

        key = self.get_effective_key(runtime_key)
        
        # If valid Gemini API key is available, use Gemini for NLP Query Analysis
        if key:
            try:
                gemini_nlp = await self._gemini_nlp_query_parse(raw_query, user_context, key)
                if gemini_nlp:
                    return gemini_nlp
            except Exception as e:
                print(f"[Gemini NLP] Live query expansion failed ({e}), using local NLP engine.")

        # Zero-dependency local NLP engine fallback
        return local_parsed

    async def _gemini_nlp_query_parse(
        self,
        raw_query: str,
        user_context: Dict[str, Any],
        key: str
    ) -> Optional[Dict[str, Any]]:
        prompt = f"""
You are the NLP Query Understanding layer for PDEU (Pandit Deendayal Energy University) PDEU Assistant.
Analyze this user query and produce search optimization parameters for accurate knowledge retrieval.

User Query: "{raw_query}"
Student Context:
- Name: {user_context.get('student_name', 'Student')}
- Program: {user_context.get('program', 'B.Tech Computer Science & Engineering')}
- Batch: {user_context.get('batch', '2027')}
- Current Semester: {user_context.get('semester', 7)}

Return ONLY a JSON object with keys:
{{
  "intent": "faculty_lookup" | "curriculum_lookup" | "placements" | "regulations" | "admissions" | "governance" | "anti_ragging" | "fees" | "hostel" | "scholarship" | "general",
  "target_program": "B.Tech Computer Engineering" or specific program,
  "target_year_or_sem": "First Year" | "Second Year" | "Third Year" | "Final Year" | null,
  "expanded_search_query": "natural keywords optimized for dense/sparse retrieval",
  "positive_keywords": ["list", "of", "high-priority", "terms"],
  "negative_keywords": ["unrelated", "cross-domain", "terms", "to", "exclude"],
  "preferred_document_ids": ["doc_pdeu_faculty_directory", "doc_pdeu_curr_2027", "doc_pdeu_placements_career", etc.]
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
        High-precision local NLP conversational & semantic parser.
        Corrects typos, classifies intent, and tags target academic entities.
        """
        q = raw_query.strip().lower()
        q_clean = re.sub(r"[^\w\s]", "", q).strip()
        program = user_context.get("program", "B.Tech Computer Engineering")
        batch = user_context.get("batch", "2027")

        # 1. Conversational Greetings & Social Openers
        greeting_words = {
            "hello", "hi", "hey", "hola", "sup", "yo", "namaste", "good morning",
            "good evening", "good afternoon", "greetings", "wassup", "start", "start chat"
        }
        is_greeting = q_clean in greeting_words or any(q_clean.startswith(w + " ") for w in ["hello", "hi", "hey", "good morning", "good evening", "good afternoon", "namaste"])
        if is_greeting:
            return {
                "intent": "greeting",
                "target_program": program,
                "target_year_or_sem": None,
                "expanded_search_query": raw_query,
                "positive_keywords": ["hello", "welcome", "pdeu assistant"],
                "negative_keywords": [],
                "preferred_document_ids": [],
                "source": "conversational-nlp-engine"
            }

        # 2. Bot Identity & Capabilities
        is_bot_info = any(w in q for w in [
            "who are you", "what are you", "what is your name", "what can you do", "help me",
            "how does this work", "capabilities", "what do you do", "introduce yourself", "about yourself"
        ])
        if is_bot_info:
            return {
                "intent": "bot_info",
                "target_program": program,
                "target_year_or_sem": None,
                "expanded_search_query": raw_query,
                "positive_keywords": ["pdeu assistant", "capabilities"],
                "negative_keywords": [],
                "preferred_document_ids": [],
                "source": "conversational-nlp-engine"
            }

        # 3. Conversational Smalltalk
        is_smalltalk = any(w in q for w in ["how are you", "how are u", "how do you do", "whats up", "what's up", "how's it going"])
        if is_smalltalk:
            return {
                "intent": "smalltalk",
                "target_program": program,
                "target_year_or_sem": None,
                "expanded_search_query": raw_query,
                "positive_keywords": ["fine", "ready to help"],
                "negative_keywords": [],
                "preferred_document_ids": [],
                "source": "conversational-nlp-engine"
            }

        # 4. Gratitude & Closing
        is_gratitude = any(w in q for w in ["thank you", "thanks", "thx", "thank u", "bye", "goodbye", "cya", "ok", "okay", "got it", "cool", "awesome", "perfect"])
        if is_gratitude:
            return {
                "intent": "gratitude",
                "target_program": program,
                "target_year_or_sem": None,
                "expanded_search_query": raw_query,
                "positive_keywords": ["welcome"],
                "negative_keywords": [],
                "preferred_document_ids": [],
                "source": "conversational-nlp-engine"
            }

        # 5. University Domain Intents
        is_faculty = any(w in q for w in [
            "professor", "proffesor", "prof", "faculty", "teacher", "dr.", "dr ", "hod", "head of department",
            "routray", "siddheswar", "sidheshwar", "sidheswar", "shakti mishra", "nishant doshi",
            "rutvij", "thakkar", "who teaches", "cabin", "office", "instructor"
        ])
        is_placement = any(w in q for w in ["salary", "package", "placement", "pacakage", "highest", "average", "ctc", "recruiter", "lpa", "job", "career"])
        is_curriculum = any(w in q for w in ["course", "curriculum", "syllabus", "subject", "credit", "sem", "semester", "first year", "second year", "1st year", "2nd year", "prerequisite", "elective"])
        is_attendance = any(w in q for w in ["attendance", "concession", "hackathon", "absent", "medical", "debarred", "condone", "relaxation", "80%", "75%"])
        is_governance = any(w in q for w in ["president", "chancellor", "ambani", "adhia", "director general", "governance", "act", "statutory", "board of governors", "bog"])
        is_fees = any(w in q for w in ["fee", "fees", "tuition", "cost", "how much", "charges per sem", "semester fee", "annual fee"]) and not any(w in q for w in ["hostel", "mess"])
        is_hostel = any(w in q for w in ["hostel", "accommodation", "stay", "room", "mess", "food", "boarding", "residence", "dormitory"])
        is_scholarship = any(w in q for w in ["scholarship", "financial aid", "waiver", "freeship", "merit scholarship", "stipend"])
        is_admissions = any(w in q for w in ["admission", "acpc", "jee", "gujcet", "cutoff", "quota", "seat", "eligibility"])
        is_anti_ragging = any(w in q for w in ["ragging", "harassment", "helpline", "complaint", "anti-ragging"])
        is_alumni = any(w in q for w in ["transcript", "degree certificate", "migration certificate", "duplicate degree", "alumni", "passed out", "wes", "grade card"])

        intent = "general"
        target_year_or_sem = None
        positive_keywords = []
        negative_keywords = []
        preferred_doc_ids = []

        if is_faculty:
            intent = "faculty_lookup"
            preferred_doc_ids = ["doc_pdeu_faculty_directory"]
            negative_keywords = [
                "attendance", "circular 2026/04", "m.a. public policy", "m.a. english",
                "phd liberal studies", "phd literature", "degree level: phd", "fee structure"
            ]
            if any(w in q for w in ["routray", "siddheswar", "sidheshwar", "sidheswar"]):
                positive_keywords = [
                    "Dr. Sidheswar Routray", "Dr. Siddheswar Routray", "Sidheshwar Routray",
                    "Assistant Professor", "Computer Science and Engineering", "School of Technology",
                    "sidheswar.routray@sot.pdpu.ac.in", "KIIT University", "Jiangsu University",
                    "Machine Learning", "Image Processing", "German Patents", "Healthcare IoMT"
                ]
                expanded_query = "Dr Sidheswar Routray Dr Siddheswar Routray Assistant Professor Computer Science and Engineering School of Technology PDEU email research qualifications"
            elif any(w in q for w in ["shakti", "mishra", "hod"]):
                positive_keywords = ["Dr. Shakti Mishra", "Associate Professor", "HOD CSE", "Distributed Computing"]
                expanded_query = "Dr Shakti Mishra Associate Professor Head of Department CSE School of Technology PDEU"
            elif any(w in q for w in ["nishant", "doshi"]):
                positive_keywords = ["Dr. Nishant Doshi", "Associate Professor", "Cryptography", "Algorithms"]
                expanded_query = "Dr Nishant Doshi Associate Professor Computer Science Engineering School of Technology PDEU"
            else:
                positive_keywords = ["PDEU Faculty", "School of Technology", "Computer Science and Engineering", "Professor"]
                expanded_query = f"PDEU Faculty Directory School of Technology Computer Science Engineering {raw_query}"

        elif is_fees:
            intent = "fees"
            positive_keywords = ["B.Tech Tuition 125000", "Institutional Fee 13000", "Caution Deposit 10000", "MBA Tuition 190000", "M.Tech Tuition 67500"]
            negative_keywords = ["hostel", "mess", "food", "dormitory", "attendance"]
            preferred_doc_ids = ["doc_pdeu_academic_programs"]
            expanded_query = "PDEU approved fee structure B.Tech M.Tech MBA tuition semester charges caution deposit"

        elif is_hostel:
            intent = "hostel"
            positive_keywords = ["Hostel 3 Seater AC 95000", "3 Seater Non-AC 75000", "Mess 46000 52000", "Raisan Campus", "Caution Deposit 5000"]
            negative_keywords = ["placement", "salary", "package"]
            preferred_doc_ids = ["doc_pdeu_hostel_facilities"]
            expanded_query = "PDEU Raisan campus hostel accommodation room charges 3 seater AC Non-AC annual mess fee"

        elif is_scholarship:
            intent = "scholarship"
            positive_keywords = ["Merit Scholarship", "100% Tuition Waiver ACPC", "JEE Main All India Rank", "GATE Stipend 12400", "Ph.D. Fellowship"]
            preferred_doc_ids = ["doc_pdeu_academic_programs", "doc_pdeu_admissions"]
            expanded_query = "PDEU merit scholarships tuition fee waiver ACPC rank JEE Main rank GATE AICTE stipend"

        elif is_placement:
            intent = "placements"
            positive_keywords = ["placement", "highest package", "average package", "42 LPA", "8.5 LPA", "recruiters", "ONGC", "Reliance", "Amazon"]
            negative_keywords = ["attendance", "circular 2026/04", "hackathon", "medical", "exam debarment", "reg-acad-04"]
            preferred_doc_ids = ["doc_pdeu_placements_career"]
            expanded_query = "PDEU highest placement package average CTC corporate recruiters ONGC Reliance Amazon Microsoft salary statistics"

        elif is_curriculum:
            intent = "curriculum_lookup"
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

        elif is_alumni:
            intent = "alumni_services"
            positive_keywords = ["Official Transcripts", "Degree Certificate", "Migration Certificate", "Controller of Examinations", "Alumni Association"]
            preferred_doc_ids = ["doc_pdeu_acad_reg"]
            expanded_query = "PDEU Controller of Examinations official transcripts degree certificates verification migration alumni"

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
        conversational response modeled after natural university assistants.
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
You are PDEU Assistant, the official AI academic & admissions assistant for Pandit Deendayal Energy University (PDEU, formerly PDPU), Gandhinagar.

COMMUNICATION STYLE REQUIREMENTS (modeled like a high-end university assistant):
1. NATURAL & CONVERSATIONAL: Never output robotic raw citations or "According to official PDEU records...". Talk like a helpful, friendly academic counselor.
2. CLEAN FORMATTING: Use bold text, bullet points with relevant emojis (🎓 for degrees/programs, 💰 for fees, 🏠 for hostels, 🎖️ for scholarships, 💼 for placements, 👨‍🏫 for faculty, 📋 for rules).
3. FOLLOW-UP PROMPT: Conclude your direct answer with a polite, natural follow-up question (e.g. "Would you like fee details for a specific program?" or "Would you like to know about hostel accommodations?").
4. SUGGESTIONS: In "related_actions", provide 3 to 4 concise quick-reply buttons (e.g. ["B.Tech Programs", "Hostel & Mess", "Merit Scholarships"]).
5. FACTUAL GROUNDING: Rely strictly on provided evidence or student context. Never hallucinate. If evidence or relevant information is not available, set status to "INSUFFICIENT_EVIDENCE" and always provide the official PDEU contact details: Phone: +91 79 2327 5060 / +91 79 2327 5000 | Admissions: +91 79 2327 5098 | Email: info@pdeu.ac.in.

Return ONLY a valid JSON object matching this schema:
{
  "status": "ANSWERED" | "CONFLICT_DETECTED" | "INSUFFICIENT_EVIDENCE",
  "direct_answer": "Clean, conversational answer with emojis and follow-up question",
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
  "related_actions": ["Quick Action 1", "Quick Action 2", "Quick Action 3"]
}
"""
        user_prompt = f"""
Query: {query}
Student / User Context:
{json.dumps(user_context, indent=2)}

Retrieved Official Evidence:
{evidence_text if evidence_text else "Conversational query or general university knowledge"}
"""

        models_to_try = [self.primary_model, self.fallback_model]
        async with httpx.AsyncClient(timeout=12.0) as client:
            for model in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
                try:
                    resp = await client.post(
                        url,
                        json={
                            "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
                            "generationConfig": {"responseMimeType": "application/json"}
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(text)
                        parsed["model_used"] = f"Gemini ({model})"
                        return parsed
                except Exception as e:
                    print(f"[Gemini Service] Model {model} call error: {e}")
                    continue
        return None

gemini_service = GeminiService()
