import datetime
import json
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

PDEU_CURRICULUM_2027 = """
# Pandit Deendayal Energy University (PDEU)
## School of Technology - Department of Computer Science & Engineering
### B.Tech CSE Curriculum & Course Structure (Batch 2027 Admission Cohort) - Version 2.1

#### Semester VII Course Distribution & Credits
The 7th semester for Batch 2027 students comprises 21 total credits distributed across core engineering subjects, specialized professional electives, and capstone project inception:

1. **CS401 Machine Learning** (Core, 4 Credits: 3-1-0)
   - **Prerequisites**: CS201 Data Structures and CS302 Design & Analysis of Algorithms with a minimum passing grade of C.
   - **Syllabus Overview**: Supervised Learning (Linear Regression, Logistic Regression, Decision Trees, Support Vector Machines), Unsupervised Learning (K-Means, Hierarchical Clustering, PCA), Neural Networks and Backpropagation, Model Evaluation Metrics (Precision, Recall, ROC-AUC), Ethical AI.
   - **Laboratory**: Implementation in Python using NumPy, Pandas, Scikit-Learn, and PyTorch.

2. **CS402 Cloud Computing & DevOps** (Core, 3 Credits: 3-0-0)
   - **Prerequisites**: CS303 Operating Systems and CS304 Computer Networks.
   - **Syllabus Overview**: Cloud virtualization, hypervisors, AWS/GCP/Azure architecture, containerization with Docker, Kubernetes orchestration, CI/CD pipelines, Infrastructure as Code (Terraform).

3. **CS403 Information & Cyber Security** (Core, 3 Credits: 3-0-0)
   - **Prerequisites**: CS202 Discrete Mathematics and CS304 Computer Networks.
   - **Syllabus Overview**: Classical and modern cryptography, AES, RSA, Elliptic Curve Cryptography, Public Key Infrastructure, Network Vulnerabilities, Firewalls, Zero Trust Security Models.

4. **Professional Elective Group III** (Select 1 Course, 3 Credits):
   - **CS421 Deep Learning & Computer Vision** (Prerequisite: CS401 Machine Learning)
   - **CS422 Natural Language Processing & LLMs** (Prerequisite: CS401 Machine Learning)
   - **CS423 Distributed Systems & Blockchain** (Prerequisite: CS303 Operating Systems)

5. **CS491 Major Project Phase-I** (Core, 3 Credits: 0-0-6)
   - Group formation (maximum 4 students), literature survey, problem formulation, preliminary architecture design, mid-term defense, and ethical clearance.
"""

PDEU_CURRICULUM_2025 = """
# Pandit Deendayal Energy University (PDEU)
## School of Technology - Department of Computer Science & Engineering
### B.Tech CSE Curriculum & Course Structure (Batch 2025 Cohort) - Version 1.4

#### Semester VII Course Distribution (Legacy Structure)
The 7th semester under the 2025 Scheme comprises 20 credits:

1. **CS405 Compiler Design** (Mandatory Core, 4 Credits: 3-1-0)
   - **Prerequisites**: CS305 Theory of Computation.
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

async def seed_pdeu_data(db: AsyncSession):
    # Check if already seeded
    existing_org = await db.execute(select(Organization).where(Organization.id == "PDEU"))
    if existing_org.scalar_one_or_none():
        print("[Anveshan Seed] PDEU organization already seeded in database.")
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
        email="dhwani@pdeu.ac.in",
        hashed_password=get_password_hash("pdeu2026"),
        full_name="Dhwani Vyas",
        role="student",
        is_active=True
    )
    db.add(dhwani_user)

    rohan_user = User(
        id="user_rohan_2025",
        organization_id="PDEU",
        email="rohan@pdeu.ac.in",
        hashed_password=get_password_hash("pdeu2026"),
        full_name="Rohan Patel",
        role="student",
        is_active=True
    )
    db.add(rohan_user)

    admin_user = User(
        id="user_admin_pdeu",
        organization_id="PDEU",
        email="admin@pdeu.ac.in",
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
        roll_number="23BCSE101",
        program="B.Tech",
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

    rohan_profile = StudentProfile(
        id="profile_rohan",
        user_id=rohan_user.id,
        organization_id="PDEU",
        roll_number="21BCSE088",
        program="B.Tech",
        department="Computer Science & Engineering",
        batch="2025",
        current_academic_year="2024-2025",
        current_semester=7,
        completed_courses_json=json.dumps([
            "CS201 Data Structures",
            "CS202 Discrete Mathematics",
            "CS301 Database Management Systems",
            "CS303 Operating Systems"
        ]),  # Missing CS302 Algorithms
        cgpa=7.85
    )
    db.add(rohan_profile)

    # 4. Documents & Versions
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

    # 6. Courses
    courses_seed = [
        ("CS201", "Data Structures", 4, 3, "2027", "Core data structures, arrays, trees, graphs, search algorithms."),
        ("CS202", "Discrete Mathematics", 4, 3, "2027", "Propositional logic, set theory, combinatorics, graph theory."),
        ("CS301", "Database Management Systems", 4, 5, "2027", "Relational algebra, SQL, normalization, ACID transactions."),
        ("CS302", "Design & Analysis of Algorithms", 4, 5, "2027", "Divide and conquer, dynamic programming, greedy algorithms, NP-completeness."),
        ("CS303", "Operating Systems", 4, 6, "2027", "Process scheduling, deadlocks, memory management, file systems."),
        ("CS304", "Computer Networks", 4, 6, "2027", "OSI model, TCP/IP, routing protocols, socket programming."),
        ("CS401", "Machine Learning", 4, 7, "2027", "Supervised and unsupervised learning, gradient descent, neural networks."),
        ("CS402", "Cloud Computing & DevOps", 3, 7, "2027", "Virtualization, Docker, Kubernetes, AWS architecture, CI/CD."),
        ("CS403", "Information & Cyber Security", 3, 7, "2027", "Cryptography, AES, RSA, PKI, firewall, ethical hacking."),
        ("CS421", "Deep Learning & Computer Vision", 3, 7, "2027", "CNNs, RNNs, Transformers, OpenCV, object detection."),
        ("CS491", "Major Project Phase-I", 3, 7, "2027", "Literature survey, system architecture, prototype implementation.")
    ]

    for c_code, c_title, c_credits, c_sem, c_batch, c_desc in courses_seed:
        prereqs = []
        if c_code == "CS302":
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
    print("[Anveshan Seed] Database models successfully committed.")

    # Populate In-Memory Vector Store, BM25, and Knowledge Graph
    _seed_memory_indexes()

def _seed_memory_indexes():
    print("[Anveshan Seed] Populating Vector Store, BM25, and Knowledge Graph...")

    # Ingest text documents into chunks, vector store, BM25, and graph
    ingestion_pipeline.chunk_document(
        document_id="doc_pdeu_curr_2027",
        document_title="B.Tech CSE Curriculum 2027 (v2.1)",
        content=PDEU_CURRICULUM_2027,
        applicable_batch="2027",
        category="CURRICULUM",
        verification_status="AUTHORITATIVE",
        organization_id="PDEU"
    )

    ingestion_pipeline.chunk_document(
        document_id="doc_pdeu_curr_2025",
        document_title="B.Tech CSE Curriculum 2025 (v1.4)",
        content=PDEU_CURRICULUM_2025,
        applicable_batch="2025",
        category="CURRICULUM",
        verification_status="VERIFIED",
        organization_id="PDEU"
    )

    ingestion_pipeline.chunk_document(
        document_id="doc_pdeu_acad_reg",
        document_title="PDEU Academic Regulations Handbook (REG-ACAD-04)",
        content=PDEU_ACADEMIC_REGULATIONS,
        applicable_batch="ALL",
        category="REGULATION",
        verification_status="AUTHORITATIVE",
        organization_id="PDEU"
    )

    ingestion_pipeline.chunk_document(
        document_id="doc_pdeu_circular_04",
        document_title="Circular 2026/04: Attendance Concession for Hackathons",
        content=PDEU_CIRCULAR_2026_04,
        applicable_batch="ALL",
        category="NOTICE",
        verification_status="VERIFIED",
        organization_id="PDEU"
    )

    # Populate Knowledge Graph Nodes & Relationships
    kg = knowledge_graph_service

    # Universities & Departments
    kg.add_entity("univ:pdeu", "University", "Pandit Deendayal Energy University")
    kg.add_entity("dept:cse", "Department", "Computer Science & Engineering")
    kg.add_entity("prog:btech_cse", "Program", "B.Tech Computer Science & Engineering")
    kg.add_relationship("univ:pdeu", "CONTAINS", "dept:cse")
    kg.add_relationship("dept:cse", "OFFERS", "prog:btech_cse")

    # Batches
    kg.add_entity("batch:2027", "Batch", "Batch 2027")
    kg.add_entity("batch:2025", "Batch", "Batch 2025")
    kg.add_relationship("prog:btech_cse", "HAS_COHORT", "batch:2027")
    kg.add_relationship("prog:btech_cse", "HAS_COHORT", "batch:2025")

    # Students
    kg.add_entity("student:dhwani", "Student", "Dhwani Vyas", properties={"roll": "23BCSE101", "cgpa": 8.92})
    kg.add_relationship("student:dhwani", "ENROLLED_IN", "prog:btech_cse")
    kg.add_relationship("student:dhwani", "BELONGS_TO", "batch:2027")

    kg.add_entity("student:rohan", "Student", "Rohan Patel", properties={"roll": "21BCSE088", "cgpa": 7.85})
    kg.add_relationship("student:rohan", "ENROLLED_IN", "prog:btech_cse")
    kg.add_relationship("student:rohan", "BELONGS_TO", "batch:2025")

    # Courses & Prerequisite Hierarchy
    kg.add_entity("course:CS201", "Course", "CS201 Data Structures")
    kg.add_entity("course:CS202", "Course", "CS202 Discrete Mathematics")
    kg.add_entity("course:CS301", "Course", "CS301 Database Systems")
    kg.add_entity("course:CS302", "Course", "CS302 Design & Analysis of Algorithms")
    kg.add_entity("course:CS303", "Course", "CS303 Operating Systems")
    kg.add_entity("course:CS304", "Course", "CS304 Computer Networks")
    kg.add_entity("course:CS401", "Course", "CS401 Machine Learning")
    kg.add_entity("course:CS402", "Course", "CS402 Cloud Computing & DevOps")
    kg.add_entity("course:CS403", "Course", "CS403 Information & Cyber Security")
    kg.add_entity("course:CS421", "Course", "CS421 Deep Learning")
    kg.add_entity("course:CS491", "Course", "CS491 Major Project Phase-I")

    # Prerequisites
    kg.add_relationship("course:CS302", "REQUIRES", "course:CS201", properties={"min_grade": "C"})
    kg.add_relationship("course:CS401", "REQUIRES", "course:CS201", properties={"min_grade": "C"})
    kg.add_relationship("course:CS401", "REQUIRES", "course:CS302", properties={"min_grade": "C"})
    kg.add_relationship("course:CS402", "REQUIRES", "course:CS303")
    kg.add_relationship("course:CS402", "REQUIRES", "course:CS304")
    kg.add_relationship("course:CS403", "REQUIRES", "course:CS202")
    kg.add_relationship("course:CS403", "REQUIRES", "course:CS304")
    kg.add_relationship("course:CS421", "REQUIRES", "course:CS401", properties={"min_grade": "B"})

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

    print("[Anveshan Seed] In-Memory indexes populated successfully.")
