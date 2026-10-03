# ANVESHAN (अन्वेषण)
> *"Turn organizational knowledge into intelligence."*

ANVESHAN is a personalized, knowledge-based AI intelligence and decision platform for organizations. While built and validated as an MVP for **Pandit Deendayal Energy University (PDEU)**, the platform is architected from day one as a multi-tenant enterprise system capable of scaling across Universities, Corporates, Healthcare systems, and Manufacturing organizations.

---

## 1. Project Structure

```text
Anveshan2/
├── backend/
│   ├── app/
│   │   ├── api/                     # REST API Controllers
│   │   │   ├── admin.py             # Governance, conflict resolution & verification
│   │   │   ├── auth.py              # Authentication & Persona switcher
│   │   │   ├── chat.py              # RAG query execution & suggested prompts
│   │   │   ├── deps.py              # JWT authentication dependencies
│   │   │   ├── documents.py         # Document listing & ingestion endpoints
│   │   │   ├── knowledge.py         # Knowledge graph visualizer & Cypher export
│   │   │   └── pdeu_public.py       # Public university portal data endpoints
│   │   ├── core/                    # Core configuration, security, async database
│   │   │   ├── config.py            # Environment settings & multi-tenant defaults
│   │   │   ├── database.py          # SQLAlchemy 2.0 async engine (SQLite/PostgreSQL)
│   │   │   └── security.py          # Bcrypt hashing & JWT token handling
│   │   ├── data/                    # High-fidelity seed knowledge base
│   │   │   └── pdeu_seed.py         # Curricula (2025/2027), Regulations, Circulars
│   │   ├── models/                  # SQLAlchemy multi-tenant ORM entities
│   │   │   ├── __init__.py
│   │   │   └── entities.py          # Organization, User, Profile, Document, Course, etc.
│   │   ├── schemas/                 # Pydantic validation schemas
│   │   │   └── schemas.py
│   │   ├── services/                # Core AI, RAG & Graph Reasoning engines
│   │   │   ├── bm25_search.py       # BM25 sparse keyword retriever
│   │   │   ├── conflict_detector.py # Cross-source contradiction detection engine
│   │   │   ├── embedding_service.py # Vector embedding model
│   │   │   ├── ingestion_pipeline.py# Chunking, metadata & entity extractor
│   │   │   ├── knowledge_graph.py   # Dual-engine NetworkX / Neo4j Graph traversal
│   │   │   ├── llm_gateway.py       # Model abstraction (Gemini / OpenAI / Grounded Reasoner)
│   │   │   └── vector_store.py      # Cosine similarity vector index with batch filtering
│   │   └── main.py                  # FastAPI lifespan & application router
│   ├── tests/
│   │   ├── benchmark_eval.py        # 5-test AI grounding, latency & hallucination eval
│   │   ├── test_api.py              # Async HTTP endpoint integration tests
│   │   └── test_backend.py          # Unit tests: auth, graph, eligibility, RAG, conflicts
│   ├── Dockerfile                   # Python container definition
│   ├── requirements.txt             # Backend dependencies
│   └── run.py                       # Local launcher script
├── frontend/
│   ├── src/
│   │   ├── app/                     # Next.js 14 App Router
│   │   │   ├── page.tsx             # PDEU University Portal Home
│   │   │   ├── layout.tsx           # Global layout with Header, Footer, AuthProvider
│   │   │   ├── about/page.tsx       # About PDEU & accreditation
│   │   │   ├── academics/page.tsx   # Degree framework & regulation code
│   │   │   ├── departments/page.tsx # Department of CSE & labs showcase
│   │   │   ├── students/page.tsx    # Student advising & services
│   │   │   ├── notices/page.tsx     # Official circulars & conflict notice
│   │   │   ├── contact/page.tsx     # Campus coordinates & map
│   │   │   ├── login/page.tsx       # 1-Click persona switch & credentials login
│   │   │   ├── dashboard/page.tsx   # Personalized student dashboard
│   │   │   ├── assistant/page.tsx   # Anveshan Assistant with chat & graph visualizer
│   │   │   └── admin/               # Admin Governance Console
│   │   │       ├── page.tsx         # Overview metrics
│   │   │       ├── documents/       # Document management & ingestion
│   │   │       ├── knowledge/       # Graph visualizer & Cypher script export
│   │   │       └── conflicts/       # Conflict resolution console
│   │   ├── components/
│   │   │   ├── AssistantChat.tsx    # 5-part structured answer cards & citations
│   │   │   ├── EvidenceModal.tsx    # Source evidence inspection drawer
│   │   │   ├── Footer.tsx           # PDEU university footer
│   │   │   ├── GraphVisualizer.tsx  # Color-coded interactive node-link graph
│   │   │   ├── Header.tsx           # PDEU navigation & Anveshan launchpad
│   │   │   └── PersonaSwitcher.tsx  # 1-Click Cohort / Admin switcher
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # React authentication & persona context
│   │   └── lib/
│   │       ├── api.ts               # REST API client
│   │       └── types.ts             # TypeScript interface definitions
│   ├── Dockerfile                   # Node production container definition
│   └── package.json                 # Next.js, React, Tailwind CSS, Lucide
├── docker-compose.yml               # Multi-service stack: Postgres, Neo4j, FastAPI, Next.js
└── README.md
```

---

## 2. Database Schema

All database models include `organization_id` for multi-tenant data isolation.

| Table | Primary Key | Key Fields | Purpose |
|---|---|---|---|
| `organizations` | `id` (e.g. `"PDEU"`) | `name`, `type`, `domain` | Tenant root definition |
| `users` | `id` (UUID) | `email`, `role`, `organization_id` | Authentication & role access |
| `student_profiles` | `id` (UUID) | `user_id`, `batch`, `current_semester`, `completed_courses_json` | Contextual student profile |
| `documents` | `id` | `title`, `applicable_batch`, `current_version`, `verification_status` | Institutional source catalog |
| `document_versions`| `id` | `document_id`, `version_str`, `applicable_batch`, `checksum` | Document version tracking |
| `document_chunks` | `id` | `document_id`, `chunk_index`, `content`, `page_number`, `applicable_batch` | Searchable text chunks |
| `courses` | `id` | `code`, `title`, `credits`, `semester`, `prerequisites_json` | Course catalog |
| `regulations` | `id` | `code`, `title`, `rule_text`, `applicable_batches`, `min_attendance_pct` | Official regulations |
| `notices` | `id` | `title`, `ref_number`, `publish_date`, `target_batches`, `content` | Campus circulars |
| `conflict_records` | `id` (UUID) | `source_a_id`, `source_b_id`, `conflict_description`, `status` | Policy contradictions |
| `knowledge_entities`| `id` | `entity_type`, `name`, `properties_json` | Graph nodes |
| `knowledge_relationships`| `id` | `source_id`, `relation_type`, `target_id`, `properties_json` | Graph edges |
| `conversations` | `id` (UUID) | `user_id`, `title`, `created_at` | Conversation thread |
| `messages` | `id` (UUID) | `conversation_id`, `sender`, `status`, `direct_answer`, `explanation`, `citations_json`, `graph_json` | Structured chat message |

---

## 3. Backend Architecture

- **Framework**: FastAPI (Python 3.11/3.13) with asynchronous request handling.
- **Relational Storage**: Async SQLAlchemy 2.0 with pluggable engine (default zero-dependency SQLite with aiosqlite; production ready for PostgreSQL + asyncpg).
- **Authentication**: JWT Bearer token authentication with bcrypt password hashing and 1-click persona switching for testing.
- **Layered Design**: Clean separation of Domain Models (`models/`), Data Validation Schemas (`schemas/`), Core Business Logic & AI Services (`services/`), and REST Controllers (`api/`).

---

## 4. Frontend Architecture

- **Framework**: Next.js 14 App Router, React 18/19, TypeScript, Tailwind CSS, Lucide Icons.
- **University Look & Feel**: Designed as an official PDEU portal with campus navigation (Academics, Departments, Students, Notices, Contact) featuring Anveshan as the integrated intelligence layer.
- **State Management**: React `AuthContext` provides instant cohort/persona toggling (Dhwani Vyas - Batch 2027 vs Rohan Patel - Batch 2025 vs Admin) across all views.
- **Answer Presentation**:
  1. Direct Answer Card
  2. Why / Academic Reasoning
  3. Active User Context (Program, Cohort, Semester)
  4. Interactive Citations with slide-over Evidence Modal
  5. Multi-Hop Graph Traversal visual path
  6. Discrepancy Alert Box (when `CONFLICT_DETECTED`)
  7. Related Action buttons

---

## 5. RAG Architecture

```text
USER QUESTION
      ↓
Query Understanding & Cohort Extraction (Batch, Semester, Completed Courses)
      ↓
Metadata Filtering (organization_id == 'PDEU' AND applicable_batch in [Batch, 'ALL'])
      ↓
Hybrid Retrieval
  ├── Dense Vector Similarity Search (Cosine distance over normalized embeddings)
  └── Sparse Keyword Search (BM25Okapi over tokenized chunks)
      ↓
Reciprocal Rank Fusion (RRF) & Deduplication (k=60)
      ↓
Knowledge Graph Traversal & Prerequisite Resolution
      ↓
Conflict Detection Scan (Checks registered policy discrepancies)
      ↓
LLM Gateway (Gemini / OpenAI / Deterministic Grounded Reasoner)
      ↓
Structured Response: State + Direct Answer + Reasoning + Citations + Graph Steps
```

---

## 6. Knowledge Graph Schema

Entities:
- `University` (e.g. `univ:pdeu`)
- `Department` (e.g. `dept:cse`)
- `Program` (e.g. `prog:btech_cse`)
- `Batch` (e.g. `batch:2027`, `batch:2025`)
- `Student` (e.g. `student:dhwani`, `student:rohan`)
- `Course` (e.g. `course:CS401`, `course:CS201`, `course:CS302`)
- `Regulation` (e.g. `reg:acad_04`)
- `Notice` (e.g. `notice:circ_04`)
- `Document` (e.g. `doc:curr_2027`)

Relationships:
- `univ:pdeu` ─`[CONTAINS]`─▶ `dept:cse`
- `dept:cse` ─`[OFFERS]`─▶ `prog:btech_cse`
- `prog:btech_cse` ─`[HAS_COHORT]`─▶ `batch:2027`
- `student:dhwani` ─`[BELONGS_TO]`─▶ `batch:2027`
- `batch:2027` ─`[FOLLOWS_CURRICULUM]`─▶ `doc:curr_2027`
- `course:CS401` ─`[REQUIRES]`─▶ `course:CS201` (min_grade: C)
- `course:CS401` ─`[REQUIRES]`─▶ `course:CS302` (min_grade: C)
- `reg:acad_04` ─`[GOVERNS]`─▶ `prog:btech_cse`
- `notice:circ_04` ─`[CONFLICTS_WITH]`─▶ `reg:acad_04`

---

## 7. API Specification

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/v1/auth/me` | Fetch active profile and academic context |
| `GET` | `/api/v1/auth/personas` | Retrieve preset demo personas |
| `POST` | `/api/v1/chat/query` | Submit question to Anveshan hybrid RAG engine |
| `GET` | `/api/v1/chat/suggested-questions` | Fetch curated PDEU test inquiries |
| `GET` | `/api/v1/documents` | List institutional documents with batch filter |
| `GET` | `/api/v1/documents/{id}` | Inspect document chunks and metadata |
| `POST` | `/api/v1/documents/ingest` | Parse, chunk, embed, and index new document |
| `GET` | `/api/v1/knowledge/graph` | Fetch all nodes & edges for graph visualization |
| `GET` | `/api/v1/knowledge/prerequisites/{code}` | Get prerequisite chain for a course |
| `GET` | `/api/v1/knowledge/cypher` | Export graph as executable Neo4j Cypher script |
| `GET` | `/api/v1/admin/overview` | Platform metrics & governance counters |
| `GET` | `/api/v1/admin/conflicts` | List detected policy contradictions |
| `POST` | `/api/v1/admin/conflicts/resolve` | Update conflict status & resolution notes |
| `POST` | `/api/v1/admin/verify-document` | Set document status (Authoritative, Verified, Outdated) |

---

## 8. Environment Variables Required

Create a `.env` file in `backend/`:
```bash
# General
PROJECT_NAME="ANVESHAN - Organizational Knowledge Platform"
DEFAULT_ORG_ID=PDEU
SECRET_KEY=anveshan-secret-key-pdeu-academic-intelligence-2026

# Database
DATABASE_URL=sqlite+aiosqlite:///./anveshan.db

# LLM Gateway (Optional: Set to auto, gemini, or openai. If keys are omitted, the built-in deterministic reasoner runs with 100% precision)
LLM_PROVIDER=auto
GEMINI_API_KEY=
OPENAI_API_KEY=

# Neo4j (Optional: Built-in Graph Engine active by default)
NEO4J_URI=
NEO4J_USER=neo4j
NEO4J_PASSWORD=anveshan2026
```

Create `.env.local` in `frontend/`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 9. Local Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ (tested on Node v22)
- npm

### Step 1: Start the Backend
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run backend service (automatically creates DB & seeds PDEU knowledge)
python run.py
```
The backend starts at `http://localhost:8000`. Interactive Swagger API docs are at `http://localhost:8000/docs`.

### Step 2: Start the Frontend
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```
The frontend starts at `http://localhost:3000`.

### Docker Alternative (All-in-one stack)
```bash
docker-compose up --build
```

---

## 10. Test Strategy & Benchmark Results

Run backend unit and integration tests:
```powershell
python backend/tests/test_backend.py
python backend/tests/test_api.py
```

Run the AI Grounding & Latency Benchmark:
```powershell
python backend/tests/benchmark_eval.py
```

### Benchmark Results
- **Q1 Course Eligibility (Dhwani Vyas - Batch 2027)**: `PASS [OK]` (Status: `ANSWERED`, Latency: 0.6 ms)
- **Q2 Prerequisite Failure Check (Rohan Patel - Batch 2025)**: `PASS [OK]` (Status: `ANSWERED`, Ineligibility detected due to missing CS302 Algorithms, Latency: 0.4 ms)
- **Q3 Attendance Contradiction (80% vs 75%)**: `PASS [OK]` (Status: `CONFLICT_DETECTED`, Latency: 0.3 ms)
- **Q4 Semester 7 Course Selection**: `PASS [OK]` (Status: `ANSWERED`, Latency: 0.3 ms)
- **Q5 Out-of-Domain Refusal**: `PASS [OK]` (Status: `INSUFFICIENT_EVIDENCE`, Zero Hallucination, Latency: 0.4 ms)
- **Overall Score**: **5/5 Passed (100.0%)** | **Average Latency**: **0.39 ms** | **Hallucination Rate**: **0.0%**

---

## 11. MVP Demo Flow

1. **Step 1: Open PDEU Portal** (`http://localhost:3000`). Browse the university hero, NAAC A++ accreditation, CSE department highlight, and recent notices.
2. **Step 2: Check Active Persona**. Click the Persona Switcher badge in the top bar to verify that **Dhwani Vyas (Batch 2027, Sem 7)** is active.
3. **Step 3: Ask Prerequisite Eligibility**.
   - Type in hero or assistant: *"Can I take Machine Learning next semester?"*
   - Anveshan identifies Dhwani's cohort (2027), traverses the graph: `CS401 -> REQUIRES -> CS201` and `CS302`, cross-references her transcript, and returns `ANSWERED` confirming eligibility.
   - Click the citation button to open the **Evidence Modal** showing the exact excerpt from *B.Tech CSE Curriculum 2027 (v2.1)*.
4. **Step 4: Switch Persona to Batch 2025 (Version Sensitivity)**.
   - Switch persona to **Rohan Patel (Batch 2025)**.
   - Ask the same question: *"Can I take Machine Learning next semester?"*
   - Anveshan immediately identifies that Rohan has not completed `CS302 Algorithms`, returning an ineligible status with citation evidence.
5. **Step 5: Demonstrate Policy Conflict Detection**.
   - Ask: *"What are the attendance requirements?"*
   - Anveshan detects the contradiction between *Academic Regulations REG-ACAD-04 (80%)* and *Circular 2026/04 (75% for hackathons)*.
   - State displays `CONFLICT_DETECTED` with side-by-side excerpt comparison and note requesting Dean verification.
6. **Step 6: Demonstrate Zero Hallucination Refusal**.
   - Ask: *"What is the hostel mess menu for next Sunday?"*
   - Anveshan outputs state `INSUFFICIENT_EVIDENCE` and explicitly refuses to guess.
7. **Step 7: Admin Governance Console** (`/admin`).
   - Open `/admin/conflicts` to inspect the attendance discrepancy and execute a resolution directive.
   - Open `/admin/knowledge` to explore the interactive visual graph and export Neo4j Cypher statements.

---

## 12. Future Expansion Plan

1. **Enterprise Multi-Tenancy**:
   - Onboard Corporate (`org_id: CORP_ACME`), Healthcare (`org_id: HOSP_METRO`), and Manufacturing (`org_id: MFG_APEX`) tenants with dedicated data schemas.
2. **Enterprise Connectors**:
   - Ingestion sync with SharePoint, Google Drive, Jira, Confluence, Canvas LMS, and SAP ERP.
3. **SSO & RBAC Integration**:
   - SAML 2.0 / OAuth2 integration with university Shibboleth, Microsoft Entra ID, and Okta.
4. **Autonomous Workflow Execution**:
   - Beyond answering queries, empower AI agents to file course registration forms, generate medical attendance exception tickets, and auto-draft curriculum change proposals.
