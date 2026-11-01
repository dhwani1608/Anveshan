import datetime
import json
import re
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import get_password_hash
from app.models.entities import (
    Organization, User, StudentProfile, Document, DocumentVersion,
    DocumentChunk, Course, Regulation, Notice, ConflictRecord,
    KnowledgeEntity, KnowledgeRelationship
)
from app.services.ingestion_pipeline import ingestion_pipeline
from app.services.knowledge_graph import knowledge_graph_service
from app.services.conflict_detector import conflict_detector
from app.data.scraper_pdeu import load_pdeu_real_data

PDEU_CURRICULUM_2027 = """
# Pandit Deendayal Energy University (PDEU)
## School of Technology - Department of Computer Science & Engineering
### B.Tech Computer Engineering Curriculum & Course Structure (Batch 2027 / 2024-2028 Cohort) - Scheme 2025
Source: https://api.pdeu.ac.in/pdpu/resources/btech-ce-syllabus-2025.pdf
Degree Credit Requirement: 160 Total Academic Credits across 8 Semesters.

#### Program Structure Overview
The undergraduate B.Tech Computer Engineering curriculum at PDEU requires completing 160 credits across Basic Science (BSC), Engineering Science (ESC), Humanities & Social Sciences (HSC), Professional Core (PC), Program Electives (PE), Open Electives (OE), and Project/Internship (Pro) courses.

#### Semester I (First Year, Autumn Semester - 20 Credits)
1. **HSC English Communication** (2 Credits: 2-0-0)
   - Fundamental elements of language and digital communication, vocabulary, sentence construction, professional presentations.
2. **BSC Mathematics - I** (4 Credits: 3-1-0)
   - Differential calculus, indeterminate forms, Rolle's and Mean Value Theorems, Taylor's & Maclaurin series, multivariable calculus, linear algebra and matrices.
3. **BSC Applied Physics** (3 Credits: 3-0-0)
   - Wave optics, interference, diffraction, polarization, lasers and optical fibers, quantum mechanics, semiconductors and nanotechnology.
4. **BSC Applied Physics Laboratory** (1 Credit: 0-0-2)
   - Experimental optics, Newton's rings, diffraction grating, semiconductor bandgap, Hall effect.
5. **BSC Environmental Science** (2 Credits: 2-0-0)
   - Ecology, biodiversity, ecosystem services, environmental pollution control, sustainable natural resource governance.
6. **ESC Workshop Practices** (1 Credit: 0-0-2)
   - Hands-on practical trades: carpentry, bench fitting, tin smithy, welding, and electronic PCB breadboarding.
7. **BSC Engineering Graphics** (2 Credits: 0-0-4)
   - Orthographic and isometric projections, projection of solids and sections, CAD drafting fundamentals.
8. **ESC Computer Programming - I / Elementary Programming - I** (1 Credit: 1-0-0)
   - Principles of procedural algorithm design in C/C++, data types, conditional branching, iteration, functions.
9. **ESC Computer Programming - I Laboratory** (1 Credit: 0-0-2)
   - Hands-on C/C++ programming laboratory: writing, compiling, debugging, and testing structured programs.
10. **HSC Universal Human Values** (1 Credit: 1-0-0)
    - Holistic understanding of self, interpersonal relations, ethical human conduct, and environmental co-existence.
11. **HSC Indian Knowledge System** (2 Credits: 2-0-0)
    - Indigenous scientific heritage, Vedic mathematics, foundational Indian contributions to astronomy, metallurgy, architecture, and logic.

#### Semester II (First Year, Spring Semester - 20 Credits)
1. **HSC Professional Communication** (2 Credits: 2-0-0)
   - Advanced technical writing, proposal preparation, business correspondence, mock group discussions, interview techniques.
2. **BSC Mathematics - II** (4 Credits: 3-1-0)
   - Ordinary and partial differential equations, Laplace transforms and applications, Fourier series, vector calculus, Green's & Stokes' theorems.
3. **BSC Engineering Chemistry** (3 Credits: 3-0-0)
   - Electrochemistry, storage batteries (Li-ion), corrosion engineering, polymers and advanced composites, molecular spectroscopy, nanotechnology.
4. **BSC Engineering Chemistry Laboratory** (1 Credit: 0-0-2)
   - Wet chemical analysis, redox titrations, conductometry, pH metric titrations, polymer synthesis.
5. **ESC Elements of Electrical & Electronics Engineering (BEE)** (3 Credits: 3-0-0)
   - Single-phase and three-phase AC circuits, magnetic circuits, transformers, DC/AC machines, operational amplifiers, diodes and transistors.
6. **ESC Elements of Electrical & Electronics Engineering Laboratory** (1 Credit: 0-0-2)
   - Experimental validation of Ohm's and Kirchhoff's laws, RL/RC circuit response, transformer efficiency, rectifiers.
7. **ESC Biological Systems for Engineers** (2 Credits: 2-0-0)
   - Biomolecules, enzyme kinetics, genetic algorithms, cellular bio-mechanisms applied to computational and bio-inspired engineering.
8. **ESC Computer Programming - II / Elementary Programming - II** (1 Credit: 1-0-0)
   - Advanced C/C++ concepts: pointer arithmetic, dynamic memory allocation (malloc/free/new), structures, unions, file input/output, recursion.
9. **ESC Computer Programming - II Laboratory** (1 Credit: 0-0-2)
   - Implementation of dynamic memory management, pointer-based structures, file manipulation, and modular multi-file programming.
10. **HSC Organizational Behavior** (1 Credit: 1-0-0)
    - Individual behavior, personality traits, motivation theories, teamwork dynamics, conflict resolution, leadership models.
11. **HSC Extra-Curricular Activity** (Select 1: 1 Credit: 0-0-2):
    - Yoga, Health & Hygiene OR National Cadet Corps (NCC) OR National Service Scheme (NSS).

#### Semester III (Second Year, Autumn Semester - 21 Credits)
1. **Pro Civic and Social Service Internship (CSSI)** (1 Credit: 0-0-0)
   - Mandatory community engagement, rural outreach, social impact project.
2. **BSC Discrete Mathematics** (4 Credits: 3-1-0)
   - Propositional and predicate logic, set theory, relations, functions, algebraic structures, combinatorics, graph theory.
3. **PC Database Management System** (3 Credits: 3-0-0)
   - Entity-relationship modeling, relational algebra, SQL, normal forms (1NF to BCNF), transaction processing, concurrency control, ACID properties.
4. **PC Database Management System Laboratory** (1 Credit: 0-0-2)
   - DDL/DML queries, complex joins, subqueries, PL/SQL triggers, stored procedures on PostgreSQL/MySQL.
5. **PC Digital Logic and Design** (4 Credits: 3-1-0)
   - Number systems, Boolean algebra, Karnaugh maps, combinational logic (adders, multiplexers, encoders), sequential circuits, flip-flops, counters, registers.
6. **PC Data Structures** (3 Credits: 3-0-0)
   - Linear data structures (arrays, linked lists, stacks, queues), non-linear structures (binary trees, AVL trees, heaps, graphs), sorting and hashing.
7. **PC Data Structures Laboratory** (1 Credit: 0-0-2)
   - C/C++ implementations of dynamic data structures, tree traversals, shortest path algorithms.
8. **PC Object Oriented Programming** (3 Credits: 3-0-0)
   - OOP paradigms, classes, inheritance, polymorphism, abstract classes, interfaces, exception handling, multithreading in Java/C++.
9. **PC Object Oriented Programming Laboratory** (1 Credit: 0-0-2)

#### Semester IV (Second Year, Spring Semester - 23 Credits)
1. **OE Open Elective 1** (From Other School) (3 Credits: 3-0-0)
   - Course Options: Open-Source Technologies OR Introduction to Data Science.
2. **PC Design Thinking** (1 Credit: 0-0-2)
   - Human-centered design, empathize, define, ideate, prototype, test methodology.
3. **PC Probability and Statistics Theory** (3 Credits: 3-0-0)
   - Probability axioms, random variables, binomial, Poisson, normal distributions, sampling distributions, hypothesis testing, linear regression.
4. **PC Computer Organization and Architecture (COA)** (4 Credits: 3-1-0)
   - Machine instructions, addressing modes, processor datapath and control unit, arithmetic unit, pipelining, memory hierarchy, cache coherence, I/O organization.
5. **PC Software Engineering** (3 Credits: 3-0-0)
   - Software process models, Agile Scrum, requirements analysis (SRS), architectural design, UML modeling, software testing (black box, white box), CI/CD.
6. **PC Software Engineering Laboratory** (1 Credit: 0-0-2)
7. **PC Theory of Computation (TOC)** (4 Credits: 3-1-0)
   - Deterministic and non-deterministic finite automata (DFA/NFA), regular expressions, context-free grammars, pushdown automata, Turing machines, decidability.
8. **PC Design and Analysis of Algorithm (DAA)** (3 Credits: 3-0-0)
   - Asymptotic analysis, divide-and-conquer, greedy method, dynamic programming, backtracking, branch-and-bound, graph algorithms, NP-completeness.
9. **PC Design and Analysis of Algorithm Laboratory** (1 Credit: 0-0-2)

#### Semester V (Third Year, Autumn Semester - 24 Credits)
1. **OE Open Elective 2** (3 Credits: NPTEL/SWAYAM/MOOC approved basket)
2. **ESC Introduction to Artificial Intelligence** (3 Credits: 3-0-0)
   - Informed and uninformed search strategies, A*, heuristic search, adversarial game search, knowledge representation, first-order logic, intro to learning.
3. **HSC Engineering Economics** (3 Credits: 3-0-0)
   - Cost analysis, time value of money, capital budgeting, depreciation, inflation analysis.
4. **PE Program Elective 1** (3 Credits: 3-0-0)
   - Tracks: Data Mining & Data Warehousing (AI/ML), Object-Oriented Modeling & Design (Industry), Computer Graphics (Vision), Advanced Data Structures & Algorithms (Computing), Data Communication (Networks).
5. **PC Computer Networks** (3 Credits: 3-0-0)
   - OSI/TCP-IP architecture, physical layer, data link layer (Ethernet, CSMA/CD), network layer (IPv4/IPv6, routing protocols OSPF/BGP), transport layer (TCP/UDP, congestion control), application layer (DNS, HTTP).
6. **PC Computer Networks Laboratory** (1 Credit: 0-0-2)
   - Packet sniffing using Wireshark, socket programming in Python/C, Cisco Packet Tracer network simulation.
7. **PC Compiler Design** (3 Credits: 3-0-0)
   - Lexical analysis, context-free syntax analysis, LL and LR parser generators, syntax-directed translation, symbol tables, intermediate code generation, basic code optimization.
8. **PC Compiler Design Laboratory** (1 Credit: 0-0-2)
   - Lex and Yacc compiler construction tools, mini-compiler frontend implementation.
9. **PC Operating System** (3 Credits: 3-0-0)
   - Process synchronization, semaphores, monitors, CPU scheduling, deadlock handling, memory virtualization, paging, segmentation, file system architecture.
10. **PC Operating System Laboratory** (1 Credit: 0-0-2)
    - POSIX thread programming, IPC mechanisms, Linux system calls, CPU scheduling algorithm simulation.

#### Semester VI (Third Year, Spring Semester - 20 Credits)
1. **OE Open Elective 3** (3 Credits: Web Development OR Object Oriented Programming & Design)
2. **PE Program Elective 2** (3 Credits: Soft Computing, UI/UX Design, Digital Image Processing, Blockchain Technology, Mobile Computing)
3. **PE Program Elective 3** (3 Credits: Deep Learning, Secure Software Engineering, Computer Vision, Big Data Analytics, Wireless Sensor Networks)
4. **PC Cryptography and Network Security** (3 Credits: 3-0-0)
   - Classical ciphers, DES, AES, RSA, Diffie-Hellman key exchange, Elliptic Curve Cryptography, SHA-256 hash functions, digital signatures, firewall architectures.
5. **PC Cryptography and Network Security Laboratory** (1 Credit: 0-0-2)
6. **PC Web & Mobile Development Essentials** (1 Credit: 1-0-0)
   - Frontend web frameworks, responsive UI, REST API consumption, mobile cross-platform app basics.
7. **PC Web & Mobile Development Essentials Laboratory** (2 Credits: 0-0-4)
8. **PC Distributed Computing** (3 Credits: 3-0-0)
   - Distributed system models, RPC, distributed clocks, mutual exclusion, Paxos and Raft consensus algorithms, distributed file systems, map-reduce paradigm.
9. **PC Distributed Computing Laboratory** (1 Credit: 0-0-2)

#### Semester VII (Fourth Year, Autumn Semester - 20 Credits)
1. **Pro Summer Internship** (2 Credits: 0-0-0)
   - Evaluation of 6-8 weeks summer industrial internship completed at industry partner firm.
2. **OE Open Elective 4** (3 Credits: Green IT OR Global Data Security & Privacy Laws)
3. **ESC Industry 4.0** (2 Credits: 2-0-0)
   - Industrial Internet of Things (IIoT), smart factory automation, additive manufacturing, cyber-physical integration.
4. **ESC Industry 4.0 Laboratory** (1 Credit: 0-0-2)
5. **PE Program Elective 4** (3 Credits: Agent-based Learning, Agile and DevOps, Natural Language Processing, Cloud Computing, Internet of Things)
6. **PE Program Elective 5** (3 Credits: Machine Learning in Cyber Security, Web Application Testing, Speech Processing, Quantum Computing, Autonomous Systems)
7. **PC Machine Learning** (3 Credits: 3-0-0)
   - Supervised learning (Linear/Logistic regression, SVM, Decision trees, Random Forests), Unsupervised learning (K-Means, PCA), Neural networks, gradient descent, model evaluation.
   - Prerequisites: CS201 Data Structures and CS302 Design & Analysis of Algorithms.
8. **PC Machine Learning Laboratory** (1 Credit: 0-0-2)
   - Python machine learning pipelines using Scikit-Learn, Pandas, NumPy, and PyTorch.
9. **PC Cyber Laws and Ethics** (1 Credit: 1-0-0)
   - Information Technology Act (IT Act 2000/2008), data privacy regulations (DPDP Act 2023), intellectual property rights, professional engineering ethics.
10. **Pro Seminar** (1 Credit)

#### Semester VIII (Fourth Year, Spring Semester - 12 Credits)
1. **Pro Major / Comprehensive Project** (12 Credits)
   - Capstone real-world engineering project carried out in industry or research lab, requiring submission of comprehensive technical dissertation and oral defense.
"""

PDEU_CURRICULUM_2025 = """
# Pandit Deendayal Energy University (PDEU)
## School of Technology - Department of Computer Science & Engineering
### B.Tech CSE Curriculum & Course Structure (Batch 2025 Cohort) - Version 1.4
Degree Credit Requirement: 168 Total Credits.

#### Semester VII Course Distribution (Legacy Structure)
The 7th semester under the 2025 Scheme comprises 20 credits:
1. **CS405 Compiler Design** (Mandatory Core, 4 Credits: 3-1-0)
   - Prerequisites: CS305 Theory of Computation.
   - Lexical analysis, syntax analysis, LL/LR parsing, intermediate code representation, code optimization.
2. **CS406 Mobile Application Development** (Core, 3 Credits: 2-0-2)
   - Android Native development, Kotlin, SQLite, REST client integration.
3. **Elective Group II** (Select 1 Course, 3 Credits):
   - **CS401 Machine Learning** (Offered as Elective under 2025 Scheme; Prerequisite: CS201 Data Structures only).
   - **CS410 Internet of Things** (Prerequisite: CS304 Computer Networks).
4. **CS490 Industry Internship / Project Phase-I** (4 Credits).
"""

PDEU_ACADEMIC_REGULATIONS = """
# Pandit Deendayal Energy University (PDEU)
## Academic Regulations for Bachelor of Technology (B.Tech) Programs - Regulation Code: REG-ACAD-04

### Section 4.2 Minimum Attendance Requirement
1. Every undergraduate candidate enrolled in B.Tech programs must secure a strict minimum attendance of 80% in aggregate across all lectures, tutorials, and practical sessions for each registered course in an academic semester.
2. Students with attendance falling between 70% and 79% may be condoned strictly on genuine medical grounds, certified by the University Chief Medical Officer (CMO) and subject to formal written approval by the Director, School of Technology.
3. Any student having attendance below 70% under any circumstance shall be awarded a 'W' (Withheld / Debarred) grade and will not be permitted to appear in the End-Semester Examination. The student must re-register for the course during the subsequent academic cycle.

### Section 6.1 Degree Requirements
A student must accumulate a minimum of 168 academic credits and maintain a minimum Cumulative Performance Index (CPI) of 5.0 out of 10.0 with no standing backlogs in core courses to be eligible for the award of the B.Tech degree.
"""

PDEU_CIRCULAR_2026_04 = """
# Pandit Deendayal Energy University (PDEU)
## Office of Academic Affairs & Student Welfare
### Academic Circular No: PDEU/ACAD/2026/04
**Date**: 15th January 2026  
**Subject**: Attendance Concession Guidelines for University-Sanctioned Extra-Curricular Events and Technical Hackathons

1. In recognition of competitive achievements representing PDEU at national and international forums, the University hereby modifies the attendance eligibility threshold for active student participants.
2. **Attendance Concession**: Students formally selected to represent PDEU in national-level technical hackathons (including Smart India Hackathon), inter-university sports championships, or cultural delegations may be granted an attendance concession reducing the required minimum attendance threshold from 80% down to 75%.
3. **Procedure**: The student must obtain written endorsement from the respective Faculty Mentor and the Head of Department (HOD) at least 7 working days prior to the event departure.
4. **Scope**: This concession applies only to officially verified days of participation and travel.
"""

async def _ensure_real_documents_in_db(db: AsyncSession):
    """Ensures that all real scraped PDEU documents and programs are persisted into SQLite/PostgreSQL."""
    real_data = load_pdeu_real_data(force_refresh=False)
    
    for key, doc_dict in real_data.items():
        doc_id = doc_dict["id"]
        res = await db.execute(select(Document).where(Document.id == doc_id))
        if not res.scalar_one_or_none():
            doc_obj = Document(
                id=doc_id,
                organization_id="PDEU",
                title=doc_dict["title"],
                category=doc_dict["category"],
                department=doc_dict.get("department", "Academics"),
                applicable_batch=doc_dict.get("applicable_batch", "ALL"),
                current_version=doc_dict.get("current_version", "2026.1"),
                verification_status=doc_dict.get("verification_status", "AUTHORITATIVE"),
                source_url=doc_dict.get("source_url", "https://pdeu.ac.in"),
                validity_period="2026-Present"
            )
            db.add(doc_obj)
            
            # Version record
            doc_ver = DocumentVersion(
                id=f"{doc_id}_v1",
                document_id=doc_id,
                version_str=doc_dict.get("current_version", "2026.1"),
                academic_year="2026-2027",
                applicable_batch="ALL",
                changelog="Authoritative ingest from official PDEU web portals and regulatory PDFs."
            )
            db.add(doc_ver)

    # Ensure B.Tech CSE Curriculum document has current source url and title
    curr_res = await db.execute(select(Document).where(Document.id == "doc_pdeu_curr_2027"))
    curr_doc = curr_res.scalar_one_or_none()
    if curr_doc:
        curr_doc.title = "B.Tech Computer Engineering Curriculum (2024-2028 Cohort)"
        curr_doc.source_url = "https://api.pdeu.ac.in/pdpu/resources/btech-ce-syllabus-2025.pdf"

    # Ingest structured courses if not present
    courses_doc = real_data.get("courses_document", {})
    structured_courses = courses_doc.get("structured_items", [])
    for idx, c in enumerate(structured_courses):
        c_code = f"PDEU-{c.get('school_code', 'GEN')}-{idx+101}"
        c_res = await db.execute(select(Course).where(Course.id == c_code))
        if not c_res.scalar_one_or_none():
            course_obj = Course(
                id=c_code,
                organization_id="PDEU",
                code=c_code,
                title=c["name"],
                department=c.get("department", "Engineering"),
                credits=4,
                semester=1,
                applicable_batch="ALL",
                description=f"{c['overview']} | Eligibility: {c['eligibility']}"
            )
            db.add(course_obj)

    # Ingest core 8-semester courses if missing
    for c_code, c_title, c_credits, c_sem, c_batch, c_desc in [
        ("CS101", "Computer Programming - I & Lab", 2, 1, "2027", "Procedural programming in C/C++, variables, control flow, functions, testing."),
        ("MA101", "Mathematics - I", 4, 1, "2027", "Calculus, mean value theorems, Taylor series, multivariable calculus, linear algebra and matrices."),
        ("PY101", "Applied Physics & Lab", 4, 1, "2027", "Optics, lasers, semiconductor physics, quantum mechanics, optical fibers, laboratory experiments."),
        ("EV101", "Environmental Science", 2, 1, "2027", "Ecosystems, biodiversity conservation, pollution control, sustainable natural resource governance."),
        ("HS101", "English Communication", 2, 1, "2027", "Language mechanics, vocabulary building, digital communication, professional writing."),
        ("HS102", "Indian Knowledge System", 2, 1, "2027", "Indigenous scientific traditions, Vedic mathematics, astronomy, metallurgical science."),
        ("CS102", "Computer Programming - II & Lab", 2, 2, "2027", "Advanced C/C++, pointer arithmetic, dynamic memory, structures, modular multi-file programming."),
        ("MA102", "Mathematics - II", 4, 2, "2027", "Differential equations, Laplace transforms, Fourier series, vector calculus, Green's & Stokes' theorems."),
        ("CY101", "Engineering Chemistry & Lab", 4, 2, "2027", "Electrochemistry, battery technology, polymers, spectroscopy, nanotechnology, wet chemical lab."),
        ("EE101", "Elements of Electrical & Electronics Engineering & Lab", 4, 2, "2027", "AC/DC circuit theory, transformers, op-amps, diodes, transistors, electrical lab."),
        ("BS101", "Biological Systems for Engineers", 2, 2, "2027", "Biomolecules, cellular mechanics, genetic algorithms, computational bio-inspired engineering."),
        ("HS103", "Professional Communication", 2, 2, "2027", "Technical reporting, executive summaries, proposal drafting, professional interview skills."),
        ("CS201", "Data Structures & Lab", 4, 3, "2027", "Arrays, linked lists, stacks, queues, trees, AVL trees, heaps, graphs, hashing algorithms."),
        ("CS202", "Discrete Mathematics", 4, 3, "2027", "Propositional logic, set theory, combinatorics, graph theory, algebraic structures."),
        ("CS301", "Database Management Systems & Lab", 4, 5, "2027", "Relational algebra, SQL, normalization (1NF-BCNF), ACID transactions, query optimization."),
        ("CS302", "Design & Analysis of Algorithms & Lab", 4, 4, "2027", "Divide and conquer, dynamic programming, greedy algorithms, NP-completeness, graph traversal."),
        ("CS303", "Operating Systems & Lab", 4, 5, "2027", "Process synchronization, semaphores, deadlock handling, memory paging, file systems."),
        ("CS304", "Computer Networks & Lab", 4, 5, "2027", "OSI/TCP-IP models, routing protocols (OSPF/BGP), socket programming, Wireshark packet analysis."),
        ("CS305", "Compiler Design & Lab", 4, 5, "2027", "Lexical analysis, syntax parsing (LL/LR), symbol tables, intermediate code representation."),
        ("CS306", "Computer Organization and Architecture", 4, 4, "2027", "Instruction sets, pipelining, cache memory hierarchies, memory interleaving, bus systems."),
        ("CS307", "Theory of Computation", 4, 4, "2027", "Automata theory, regular expressions, context-free grammars, Turing machines, decidability."),
        ("CS401", "Machine Learning & Lab", 4, 7, "2027", "Supervised/unsupervised learning, SVM, neural networks, PCA, PyTorch implementation."),
        ("CS402", "Cloud Computing & DevOps", 3, 7, "2027", "Virtualization, Docker containers, Kubernetes orchestration, AWS/GCP architecture, CI/CD."),
        ("CS403", "Cryptography & Network Security & Lab", 4, 6, "2027", "AES, RSA, ECC, digital signatures, hash functions, firewall architecture, Zero Trust."),
        ("CS404", "Distributed Computing & Lab", 4, 6, "2027", "Distributed systems, RPC, consensus algorithms (Paxos, Raft), map-reduce architectures."),
        ("CS421", "Deep Learning & Computer Vision", 3, 7, "2027", "CNNs, Vision Transformers, OpenCV, object detection, segmentation models."),
        ("CS491", "Major Project Phase-I", 3, 7, "2027", "Capstone literature survey, system architecture design, prototype proof of concept."),
        ("CS492", "Major / Comprehensive Project", 12, 8, "2027", "Full capstone engineering dissertation, industry implementation, and defense.")
    ]:
        c_db_id = f"course_{c_code}"
        c_res = await db.execute(select(Course).where(Course.id == c_db_id))
        if not c_res.scalar_one_or_none():
            db.add(Course(
                id=c_db_id,
                organization_id="PDEU",
                code=c_code,
                title=c_title,
                department="Computer Science & Engineering",
                credits=c_credits,
                semester=c_sem,
                applicable_batch=c_batch,
                description=c_desc,
                prerequisites_json=json.dumps([])
            ))

    await db.commit()
    print(f"[Anveshan Seed] Verified and synchronized real PDEU documents & degree programs in database.")


async def seed_pdeu_data(db: AsyncSession):
    # Check if already seeded
    existing_org = await db.execute(select(Organization).where(Organization.id == "PDEU"))
    if existing_org.scalar_one_or_none():
        print("[Anveshan Seed] PDEU organization already exists in database.")
        await _ensure_real_documents_in_db(db)
        _seed_memory_indexes()
        return

    print("[Anveshan Seed] Seeding PDEU University Organization and Knowledge Base...")

    # 1. Organization
    org = Organization(
        id="PDEU",
        name="Pandit Deendayal Energy University",
        type="UNIVERSITY",
        domain="pdeu.ac.in",
        created_at=datetime.datetime.utcnow()
    )
    db.add(org)
    await db.flush()

    # 2. Users: Student Dhwani (Batch 2027), Student Rohan (Batch 2025), and Admin
    dhwani_user = User(
        id="user_dhwani_2027",
        organization_id="PDEU",
        email="23bcp116@sot.pdpu.ac.in",
        hashed_password=get_password_hash("pdeu2026"),
        full_name="Dhwani Vyas",
        role="student",
        is_active=True
    )
    db.add(dhwani_user)

    dhwani_alt = User(
        id="user_dhwani_alt",
        organization_id="PDEU",
        email="dhwani@pdeu.ac.in",
        hashed_password=get_password_hash("pdeu2026"),
        full_name="Dhwani Vyas",
        role="student",
        is_active=True
    )
    db.add(dhwani_alt)

    rohan_user = User(
        id="user_rohan_2025",
        organization_id="PDEU",
        email="21bcp088@sot.pdpu.ac.in",
        hashed_password=get_password_hash("pdeu2026"),
        full_name="Rohan Patel",
        role="student",
        is_active=True
    )
    db.add(rohan_user)

    admin_user = User(
        id="user_admin_pdeu",
        organization_id="PDEU",
        email="admin@pdpu.ac.in",
        hashed_password=get_password_hash("admin2026"),
        full_name="Prof. A. K. Sharma (Dean Academics)",
        role="admin",
        is_active=True
    )
    db.add(admin_user)
    await db.flush()

    # 3. Student Profiles
    dhwani_profile = StudentProfile(
        id="profile_dhwani",
        user_id=dhwani_user.id,
        organization_id="PDEU",
        roll_number="23BCP116",
        program="B.Tech Computer Engineering",
        department="Computer Science & Engineering",
        batch="2027",
        current_academic_year="2026-2027",
        current_semester=7,
        completed_courses_json=json.dumps([
            "CS201 Data Structures",
            "CS202 Discrete Mathematics",
            "CS301 Database Management Systems",
            "CS302 Design & Analysis of Algorithms",
            "CS303 Operating Systems",
            "CS304 Computer Networks"
        ]),
        cgpa=8.92
    )
    db.add(dhwani_profile)

    dhwani_alt_profile = StudentProfile(
        id="profile_dhwani_alt",
        user_id=dhwani_alt.id,
        organization_id="PDEU",
        roll_number="23BCP116",
        program="B.Tech Computer Engineering",
        department="Computer Science & Engineering",
        batch="2027",
        current_academic_year="2026-2027",
        current_semester=7,
        completed_courses_json=json.dumps([
            "CS201 Data Structures",
            "CS202 Discrete Mathematics",
            "CS301 Database Management Systems",
            "CS302 Design & Analysis of Algorithms",
            "CS303 Operating Systems",
            "CS304 Computer Networks"
        ]),
        cgpa=8.92
    )
    db.add(dhwani_alt_profile)

    rohan_profile = StudentProfile(
        id="profile_rohan",
        user_id=rohan_user.id,
        organization_id="PDEU",
        roll_number="21BCP088",
        program="B.Tech Computer Engineering",
        department="Computer Science & Engineering",
        batch="2025",
        current_academic_year="2024-2025",
        current_semester=7,
        completed_courses_json=json.dumps([
            "CS201 Data Structures",
            "CS202 Discrete Mathematics",
            "CS301 Database Management Systems",
            "CS303 Operating Systems"
        ]),
        cgpa=7.85
    )
    db.add(rohan_profile)

    # 4. Standard Curriculum & Conflict Documents
    doc_curr_2027 = Document(
        id="doc_pdeu_curr_2027",
        organization_id="PDEU",
        title="B.Tech CSE Curriculum 2027 (v2.1)",
        category="CURRICULUM",
        department="Computer Science & Engineering",
        applicable_batch="2027",
        current_version="2.1",
        verification_status="AUTHORITATIVE",
        source_url="https://pdeu.ac.in/academics/curriculum/cse-2027-v2.1.pdf",
        validity_period="2023-2027"
    )
    db.add(doc_curr_2027)

    doc_curr_2025 = Document(
        id="doc_pdeu_curr_2025",
        organization_id="PDEU",
        title="B.Tech CSE Curriculum 2025 (v1.4)",
        category="CURRICULUM",
        department="Computer Science & Engineering",
        applicable_batch="2025",
        current_version="1.4",
        verification_status="VERIFIED",
        source_url="https://pdeu.ac.in/academics/curriculum/cse-2025-v1.4.pdf",
        validity_period="2021-2025"
    )
    db.add(doc_curr_2025)

    doc_acad_reg = Document(
        id="doc_pdeu_acad_reg",
        organization_id="PDEU",
        title="PDEU Academic Regulations Handbook (REG-ACAD-04)",
        category="REGULATION",
        department="Academic Affairs",
        applicable_batch="ALL",
        current_version="4.0",
        verification_status="AUTHORITATIVE",
        source_url="https://pdeu.ac.in/regulations/academic-handbook-2026.pdf",
        validity_period="2024-Present"
    )
    db.add(doc_acad_reg)

    doc_circular_04 = Document(
        id="doc_pdeu_circular_04",
        organization_id="PDEU",
        title="Circular 2026/04: Attendance Concession for Hackathons",
        category="NOTICE",
        department="Academic Affairs",
        applicable_batch="ALL",
        current_version="1.0",
        verification_status="VERIFIED",
        source_url="https://pdeu.ac.in/circulars/2026-04-attendance.pdf",
        validity_period="Academic Year 2025-2026"
    )
    db.add(doc_circular_04)

    # 5. Pre-register Conflict Record
    conflict_record = ConflictRecord(
        id="conflict_attendance_01",
        organization_id="PDEU",
        title="Attendance Threshold Contradiction",
        topic="attendance",
        source_a_id="doc_pdeu_acad_reg",
        source_a_title="Academic Regulations REG-ACAD-04 (Section 4.2)",
        source_a_snippet="Every candidate must secure a strict minimum attendance of 80% in aggregate. Below 70% awarded Withheld/Debarred grade.",
        source_b_id="doc_pdeu_circular_04",
        source_b_title="Circular No. 2026/04 (Section 2.1)",
        source_b_snippet="Students representing PDEU in national hackathons or sports championships may be granted attendance concession down to 75%.",
        conflict_description="Regulation REG-ACAD-04 specifies a mandatory 80% minimum attendance for all students, while Circular 2026/04 introduces an approved 75% relaxation for extracurricular and technical representatives without formal amendment to the parent regulation.",
        status="DETECTED"
    )
    db.add(conflict_record)

    # 6. Core Courses across all 8 Semesters (Official 160 Credit Curriculum)
    courses_seed = [
        ("CS101", "Computer Programming - I & Lab", 2, 1, "2027", "Procedural programming in C/C++, algorithm design, variables, control flow, functions, testing."),
        ("MA101", "Mathematics - I", 4, 1, "2027", "Calculus, mean value theorems, Taylor series, multivariable calculus, linear algebra and matrices."),
        ("PY101", "Applied Physics & Lab", 4, 1, "2027", "Optics, lasers, semiconductor physics, quantum mechanics, optical fibers, laboratory experiments."),
        ("EV101", "Environmental Science", 2, 1, "2027", "Ecosystems, biodiversity conservation, pollution control, sustainable natural resource governance."),
        ("HS101", "English Communication", 2, 1, "2027", "Language mechanics, vocabulary building, digital communication, professional writing."),
        ("HS102", "Indian Knowledge System", 2, 1, "2027", "Indigenous scientific traditions, Vedic mathematics, astronomy, metallurgical science."),
        ("CS102", "Computer Programming - II & Lab", 2, 2, "2027", "Advanced C/C++, pointer arithmetic, dynamic memory, structures, modular multi-file programming."),
        ("MA102", "Mathematics - II", 4, 2, "2027", "Differential equations, Laplace transforms, Fourier series, vector calculus, Green's & Stokes' theorems."),
        ("CY101", "Engineering Chemistry & Lab", 4, 2, "2027", "Electrochemistry, battery technology, polymers, spectroscopy, nanotechnology, wet chemical lab."),
        ("EE101", "Elements of Electrical & Electronics Engineering & Lab", 4, 2, "2027", "AC/DC circuit theory, transformers, op-amps, diodes, transistors, electrical lab."),
        ("BS101", "Biological Systems for Engineers", 2, 2, "2027", "Biomolecules, cellular mechanics, genetic algorithms, computational bio-inspired engineering."),
        ("HS103", "Professional Communication", 2, 2, "2027", "Technical reporting, executive summaries, proposal drafting, professional interview skills."),
        ("CS201", "Data Structures & Lab", 4, 3, "2027", "Arrays, linked lists, stacks, queues, trees, AVL trees, heaps, graphs, hashing algorithms."),
        ("CS202", "Discrete Mathematics", 4, 3, "2027", "Propositional logic, set theory, combinatorics, graph theory, algebraic structures."),
        ("CS301", "Database Management Systems & Lab", 4, 5, "2027", "Relational algebra, SQL, normalization (1NF-BCNF), ACID transactions, query optimization."),
        ("CS302", "Design & Analysis of Algorithms & Lab", 4, 4, "2027", "Divide and conquer, dynamic programming, greedy algorithms, NP-completeness, graph traversal."),
        ("CS303", "Operating Systems & Lab", 4, 5, "2027", "Process synchronization, semaphores, deadlock handling, memory paging, file systems."),
        ("CS304", "Computer Networks & Lab", 4, 5, "2027", "OSI/TCP-IP models, routing protocols (OSPF/BGP), socket programming, Wireshark packet analysis."),
        ("CS305", "Compiler Design & Lab", 4, 5, "2027", "Lexical analysis, syntax parsing (LL/LR), symbol tables, intermediate code representation."),
        ("CS306", "Computer Organization and Architecture", 4, 4, "2027", "Instruction sets, pipelining, cache memory hierarchies, memory interleaving, bus systems."),
        ("CS307", "Theory of Computation", 4, 4, "2027", "Automata theory, regular expressions, context-free grammars, Turing machines, decidability."),
        ("CS401", "Machine Learning & Lab", 4, 7, "2027", "Supervised/unsupervised learning, SVM, neural networks, PCA, PyTorch implementation."),
        ("CS402", "Cloud Computing & DevOps", 3, 7, "2027", "Virtualization, Docker containers, Kubernetes orchestration, AWS/GCP architecture, CI/CD."),
        ("CS403", "Cryptography & Network Security & Lab", 4, 6, "2027", "AES, RSA, ECC, digital signatures, hash functions, firewall architecture, Zero Trust."),
        ("CS404", "Distributed Computing & Lab", 4, 6, "2027", "Distributed systems, RPC, consensus algorithms (Paxos, Raft), map-reduce architectures."),
        ("CS421", "Deep Learning & Computer Vision", 3, 7, "2027", "CNNs, Vision Transformers, OpenCV, object detection, segmentation models."),
        ("CS491", "Major Project Phase-I", 3, 7, "2027", "Capstone literature survey, system architecture design, prototype proof of concept."),
        ("CS492", "Major / Comprehensive Project", 12, 8, "2027", "Full capstone engineering dissertation, industry implementation, and defense.")
    ]

    for c_code, c_title, c_credits, c_sem, c_batch, c_desc in courses_seed:
        prereqs = []
        if c_code == "CS102":
            prereqs = ["CS101"]
        elif c_code == "CS201":
            prereqs = ["CS102"]
        elif c_code == "CS302":
            prereqs = ["CS201"]
        elif c_code == "CS401":
            prereqs = ["CS201", "CS302"]
        elif c_code == "CS402":
            prereqs = ["CS303", "CS304"]
        elif c_code == "CS403":
            prereqs = ["CS202", "CS304"]
        elif c_code == "CS421":
            prereqs = ["CS401"]

        course_obj = Course(
            id=f"course_{c_code}",
            organization_id="PDEU",
            code=c_code,
            title=c_title,
            department="Computer Science & Engineering",
            credits=c_credits,
            semester=c_sem,
            applicable_batch=c_batch,
            description=c_desc,
            prerequisites_json=json.dumps(prereqs)
        )
        db.add(course_obj)

    await db.commit()
    print("[Anveshan Seed] Initial database models successfully committed.")

    # Synchronize real scraped documents as well
    await _ensure_real_documents_in_db(db)

    # Populate In-Memory Vector Store, BM25, and Knowledge Graph
    _seed_memory_indexes()


def _seed_memory_indexes():
    print("[Anveshan Seed] Populating Vector Store, BM25, and Knowledge Graph with real PDEU knowledge...")
    # Clean previous in-memory state for fresh indexing
    ingestion_pipeline.clear()

    # 1. Ingest Base Curricula & Regulations (Version testing & Conflict preservation)
    ingestion_pipeline.chunk_document(
        document_id="doc_pdeu_curr_2027",
        document_title="B.Tech Computer Engineering Curriculum (2024-2028 Cohort)",
        content=PDEU_CURRICULUM_2027,
        applicable_batch="2027",
        category="CURRICULUM",
        verification_status="AUTHORITATIVE",
        organization_id="PDEU",
        source_url="https://api.pdeu.ac.in/pdpu/resources/btech-ce-syllabus-2025.pdf"
    )

    ingestion_pipeline.chunk_document(
        document_id="doc_pdeu_curr_2025",
        document_title="B.Tech CSE Curriculum 2025 (v1.4)",
        content=PDEU_CURRICULUM_2025,
        applicable_batch="2025",
        category="CURRICULUM",
        verification_status="VERIFIED",
        organization_id="PDEU",
        source_url="https://pdeu.ac.in/academics/curriculum/cse-2025-v1.4.pdf"
    )

    ingestion_pipeline.chunk_document(
        document_id="doc_pdeu_acad_reg",
        document_title="PDEU Academic Regulations Handbook (REG-ACAD-04)",
        content=PDEU_ACADEMIC_REGULATIONS,
        applicable_batch="ALL",
        category="REGULATION",
        verification_status="AUTHORITATIVE",
        organization_id="PDEU",
        source_url="https://pdeu.ac.in/regulations/academic-handbook-2026.pdf"
    )

    ingestion_pipeline.chunk_document(
        document_id="doc_pdeu_circular_04",
        document_title="Circular 2026/04: Attendance Concession for Hackathons",
        content=PDEU_CIRCULAR_2026_04,
        applicable_batch="ALL",
        category="NOTICE",
        verification_status="VERIFIED",
        organization_id="PDEU",
        source_url="https://pdeu.ac.in/circulars/2026-04-attendance.pdf"
    )

    # 2. Ingest All Real Scraped PDEU Documents
    real_data = load_pdeu_real_data(force_refresh=False)
    for doc_key, doc in real_data.items():
        if doc.get("id") == "doc_pdeu_curr_2027":
            continue  # Already ingested with structured semester formatting above
        ingestion_pipeline.chunk_document(
            document_id=doc["id"],
            document_title=doc["title"],
            content=doc["content"],
            applicable_batch=doc.get("applicable_batch", "ALL"),
            category=doc.get("category", "ACADEMIC"),
            verification_status=doc.get("verification_status", "AUTHORITATIVE"),
            organization_id="PDEU",
            source_url=doc.get("source_url", "https://pdeu.ac.in")
        )

    # 3. Populate Comprehensive Knowledge Graph
    kg = knowledge_graph_service

    # Universities & Schools
    kg.add_entity("univ:pdeu", "University", "Pandit Deendayal Energy University", properties={
        "accreditation": "NAAC A++",
        "location": "Gandhinagar, Gujarat",
        "nirf": "Top 100",
        "president": "Dr. Mukesh D. Ambani"
    })
    
    schools = [
        ("school:sot", "School of Technology", "SoT"),
        ("school:soet", "School of Energy Technology", "SoET"),
        ("school:sls", "School of Liberal Studies", "SLS"),
        ("school:som", "School of Management", "SoM"),
        ("school:sol", "School of Law", "SoL")
    ]
    for s_id, s_name, s_code in schools:
        kg.add_entity(s_id, "School", s_name, properties={"short_name": s_code})
        kg.add_relationship("univ:pdeu", "HAS_SCHOOL", s_id)

    # Departments
    departments = [
        ("dept:cse", "Computer Science & Engineering", "school:sot"),
        ("dept:ict", "Information & Communication Technology", "school:sot"),
        ("dept:mech", "Mechanical Engineering", "school:sot"),
        ("dept:chem", "Chemical Engineering", "school:sot"),
        ("dept:civil", "Civil Engineering", "school:sot"),
        ("dept:elec", "Electrical Engineering", "school:sot"),
        ("dept:petro", "Petroleum Engineering", "school:soet"),
        ("dept:solar", "Solar & Renewable Energy", "school:soet"),
        ("dept:mgmt", "Petroleum & Energy Management", "school:som"),
        ("dept:sls_admin", "Liberal Studies & Public Policy", "school:sls"),
        ("dept:law", "School of Law Studies", "school:sol")
    ]
    for d_id, d_name, parent_school in departments:
        kg.add_entity(d_id, "Department", d_name)
        kg.add_relationship(parent_school, "CONTAINS", d_id)

    # Programs
    kg.add_entity("prog:btech_cse", "Program", "B.Tech Computer Science & Engineering", properties={
        "total_credits": 160,
        "duration": "4 Years (8 Semesters)",
        "accreditation": "AICTE / NBA"
    })
    kg.add_relationship("dept:cse", "OFFERS", "prog:btech_cse")
    kg.add_entity("prog:btech_petro", "Program", "B.Tech Petroleum Engineering")
    kg.add_relationship("dept:petro", "OFFERS", "prog:btech_petro")
    kg.add_entity("prog:mba_energy", "Program", "MBA Energy & Infrastructure")
    kg.add_relationship("dept:mgmt", "OFFERS", "prog:mba_energy")

    # Degree Requirements Entity
    kg.add_entity("req:degree_160_credits", "Requirement", "160 Total Academic Credits")
    kg.add_relationship("prog:btech_cse", "REQUIRES_TOTAL", "req:degree_160_credits")

    # Batches
    kg.add_entity("batch:2027", "Batch", "Batch 2027")
    kg.add_entity("batch:2025", "Batch", "Batch 2025")
    kg.add_relationship("prog:btech_cse", "HAS_COHORT", "batch:2027")
    kg.add_relationship("prog:btech_cse", "HAS_COHORT", "batch:2025")

    # Academic Semesters (8-Semester Structure)
    sem_defs = [
        ("sem:1", "Semester I (20 Credits)", 1, 20),
        ("sem:2", "Semester II (20 Credits)", 2, 20),
        ("sem:3", "Semester III (21 Credits)", 3, 21),
        ("sem:4", "Semester IV (23 Credits)", 4, 23),
        ("sem:5", "Semester V (24 Credits)", 5, 24),
        ("sem:6", "Semester VI (20 Credits)", 6, 20),
        ("sem:7", "Semester VII (20 Credits)", 7, 20),
        ("sem:8", "Semester VIII (12 Credits)", 8, 12),
    ]
    for s_id, s_name, s_num, s_cr in sem_defs:
        kg.add_entity(s_id, "Semester", s_name, properties={"number": s_num, "credits": s_cr})
        kg.add_relationship("prog:btech_cse", "HAS_SEMESTER", s_id)

    # Semester I & II First Year Courses & Relationships
    first_year_sem1 = [
        ("course:CS101", "CS101 Computer Programming - I & Lab (2 Cr)"),
        ("course:MA101", "MA101 Mathematics - I (4 Cr)"),
        ("course:PY101", "PY101 Applied Physics & Lab (4 Cr)"),
        ("course:EV101", "EV101 Environmental Science (2 Cr)"),
        ("course:HS101", "HS101 English Communication (2 Cr)"),
        ("course:HS102", "HS102 Indian Knowledge System (2 Cr)")
    ]
    for c_id, c_name in first_year_sem1:
        kg.add_entity(c_id, "Course", c_name)
        kg.add_relationship("sem:1", "INCLUDES_CORE", c_id)

    first_year_sem2 = [
        ("course:CS102", "CS102 Computer Programming - II & Lab (2 Cr)"),
        ("course:MA102", "MA102 Mathematics - II (4 Cr)"),
        ("course:CY101", "CY101 Engineering Chemistry & Lab (4 Cr)"),
        ("course:EE101", "EE101 BEE & Lab (4 Cr)"),
        ("course:HS103", "HS103 Professional Communication (2 Cr)"),
        ("course:BS101", "BS101 Biological Systems for Engineers (2 Cr)")
    ]
    for c_id, c_name in first_year_sem2:
        kg.add_entity(c_id, "Course", c_name)
        kg.add_relationship("sem:2", "INCLUDES_CORE", c_id)

    # Higher Semesters Core Nodes
    kg.add_entity("course:CS201", "Course", "CS201 Data Structures & Lab (4 Cr)")
    kg.add_entity("course:CS202", "Course", "CS202 Discrete Mathematics (4 Cr)")
    kg.add_relationship("sem:3", "INCLUDES_CORE", "course:CS201")
    kg.add_relationship("sem:3", "INCLUDES_CORE", "course:CS202")

    kg.add_entity("course:CS302", "Course", "CS302 Design & Analysis of Algorithms & Lab (4 Cr)")
    kg.add_entity("course:CS306", "Course", "CS306 Computer Organization & Architecture (4 Cr)")
    kg.add_relationship("sem:4", "INCLUDES_CORE", "course:CS302")
    kg.add_relationship("sem:4", "INCLUDES_CORE", "course:CS306")

    kg.add_entity("course:CS303", "Course", "CS303 Operating Systems & Lab (4 Cr)")
    kg.add_entity("course:CS304", "Course", "CS304 Computer Networks & Lab (4 Cr)")
    kg.add_relationship("sem:5", "INCLUDES_CORE", "course:CS303")
    kg.add_relationship("sem:5", "INCLUDES_CORE", "course:CS304")

    kg.add_entity("course:CS403", "Course", "CS403 Cryptography & Network Security (4 Cr)")
    kg.add_entity("course:CS404", "Course", "CS404 Distributed Computing (4 Cr)")
    kg.add_relationship("sem:6", "INCLUDES_CORE", "course:CS403")
    kg.add_relationship("sem:6", "INCLUDES_CORE", "course:CS404")

    kg.add_entity("course:CS401", "Course", "CS401 Machine Learning & Lab (4 Cr)")
    kg.add_entity("course:CS402", "Course", "CS402 Industry 4.0 & Lab (3 Cr)")
    kg.add_entity("course:CS421", "Course", "CS421 Deep Learning & Vision (3 Cr)")
    kg.add_relationship("sem:7", "INCLUDES_CORE", "course:CS401")
    kg.add_relationship("sem:7", "INCLUDES_CORE", "course:CS402")

    kg.add_entity("course:CS492", "Course", "CS492 Major Capstone Project (12 Cr)")
    kg.add_relationship("sem:8", "INCLUDES_CORE", "course:CS492")

    # Prerequisite Graph Hierarchy
    kg.add_relationship("course:CS102", "REQUIRES", "course:CS101")
    kg.add_relationship("course:CS201", "REQUIRES", "course:CS102")
    kg.add_relationship("course:CS302", "REQUIRES", "course:CS201", properties={"min_grade": "C"})
    kg.add_relationship("course:CS401", "REQUIRES", "course:CS201", properties={"min_grade": "C"})
    kg.add_relationship("course:CS401", "REQUIRES", "course:CS302", properties={"min_grade": "C"})
    kg.add_relationship("course:CS421", "REQUIRES", "course:CS401", properties={"min_grade": "B"})

    # Students
    kg.add_entity("student:dhwani", "Student", "Dhwani Vyas", properties={"roll": "23BCSE101", "cgpa": 8.92})
    kg.add_relationship("student:dhwani", "ENROLLED_IN", "prog:btech_cse")
    kg.add_relationship("student:dhwani", "BELONGS_TO", "batch:2027")

    kg.add_entity("student:rohan", "Student", "Rohan Patel", properties={"roll": "21BCSE088", "cgpa": 7.85})
    kg.add_relationship("student:rohan", "ENROLLED_IN", "prog:btech_cse")
    kg.add_relationship("student:rohan", "BELONGS_TO", "batch:2025")

    # Governance & Leadership Entities
    kg.add_entity("leader:mukesh_ambani", "Governance", "Dr. Mukesh D. Ambani", properties={"title": "President"})
    kg.add_entity("leader:hasmukh_adhia", "Governance", "Dr. Hasmukh Adhia, IAS (Retd.)", properties={"title": "Vice Chairman - BoG"})
    kg.add_entity("leader:sundar_manoharan", "Governance", "Prof. S. Sundar Manoharan", properties={"title": "Director General"})
    kg.add_relationship("univ:pdeu", "PRESIDENT", "leader:mukesh_ambani")
    kg.add_relationship("univ:pdeu", "VICE_CHAIRMAN", "leader:hasmukh_adhia")
    kg.add_relationship("univ:pdeu", "DIRECTOR_GENERAL", "leader:sundar_manoharan")

    # Placement Cell Entities
    kg.add_entity("service:placements", "Service", "PDEU Training & Placement Cell", properties={
        "highest_package": "₹42.00 LPA",
        "average_package": "₹8.50 LPA",
        "placement_rate": "90%+"
    })
    kg.add_relationship("univ:pdeu", "OPERATES", "service:placements")

    # Admissions Cell Entities
    kg.add_entity("service:admissions", "Service", "PDEU Admissions Office", properties={
        "acpc_quota": "50%",
        "jee_main_quota": "50%",
        "nri_quota": "15% supernumerary"
    })
    kg.add_relationship("univ:pdeu", "OPERATES", "service:admissions")

    # Anti-Ragging Cell & Policy
    kg.add_entity("policy:anti_ragging", "Policy", "Zero Tolerance Anti-Ragging Policy", properties={
        "helpline": "1800-180-5522",
        "status": "AUTHORITATIVE"
    })
    kg.add_relationship("univ:pdeu", "ENFORCES", "policy:anti_ragging")

    # Real Faculty Members from scraped roster (linked for faculty queries)
    faculty_data = real_data.get("faculty_document", {}).get("structured_items", [])
    for fac in faculty_data[:15]:
        fac_node_id = f"fac:{fac['name'].replace(' ', '_').lower()}"
        kg.add_entity(fac_node_id, "Faculty", fac["name"], properties={
            "designation": fac.get("designation"),
            "email": fac.get("email"),
            "school": fac.get("school")
        })
        kg.add_relationship("univ:pdeu", "EMPLOYS", fac_node_id)

    # Regulations & Notices
    kg.add_entity("reg:acad_04", "Regulation", "REG-ACAD-04 Attendance Requirement")
    kg.add_entity("notice:circ_04", "Notice", "Circular 2026/04 Hackathon Concession")
    kg.add_relationship("reg:acad_04", "GOVERNS", "prog:btech_cse")
    kg.add_relationship("notice:circ_04", "APPLIES_TO", "prog:btech_cse")
    kg.add_relationship("notice:circ_04", "CONFLICTS_WITH", "reg:acad_04")

    # Conflict registration in detector
    conflict_detector.register_conflict(
        conflict_id="conflict_attendance_01",
        title="Attendance Threshold Contradiction (80% vs 75%)",
        topic="attendance",
        source_a_id="doc_pdeu_acad_reg",
        source_a_title="Academic Regulations REG-ACAD-04 (Section 4.2)",
        source_a_snippet="Every candidate must secure a strict minimum attendance of 80% in aggregate across all lectures, tutorials, and practical sessions.",
        source_b_id="doc_pdeu_circular_04",
        source_b_title="Circular No. 2026/04 (Section 2.1)",
        source_b_snippet="Students representing PDEU in national hackathons or sports championships may be granted an attendance concession reducing minimum attendance from 80% down to 75%.",
        description="Regulation REG-ACAD-04 mandates 80% attendance, whereas Circular 2026/04 grants a 75% relaxation for hackathon delegates without an official constitutional amendment."
    )

    print(f"[Anveshan Seed] In-Memory indexes populated successfully with real PDEU knowledge ({len(ingestion_pipeline.all_indexed_chunks)} total chunks indexed).")
