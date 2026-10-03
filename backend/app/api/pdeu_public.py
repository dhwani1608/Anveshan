from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/public", tags=["Public PDEU Portal"])

@router.get("/overview")
async def get_public_overview() -> Dict[str, Any]:
    return {
        "university_name": "Pandit Deendayal Energy University (PDEU)",
        "accreditation": "NAAC A++ Accredited | NIRF Ranked Technical University",
        "location": "Knowledge Corridor, Raisan, Gandhinagar, Gujarat 382007",
        "schools": [
            {"code": "SOT", "name": "School of Technology", "programs": ["Computer Science & Engineering", "Information & Communication Tech", "Chemical", "Mechanical", "Civil"]},
            {"code": "SOET", "name": "School of Energy Technology", "programs": ["Petroleum Engineering", "Solar Energy"]},
            {"code": "SLS", "name": "School of Liberal Studies", "programs": ["Public Policy", "Economics", "Psychology"]},
            {"code": "SPM", "name": "School of Petroleum Management", "programs": ["MBA Energy & Infrastructure", "MBA General"]}
        ],
        "department_highlight": {
            "name": "Department of Computer Science & Engineering",
            "head": "Dr. Sameer Patel",
            "established": 2016,
            "research_areas": [
                "Artificial Intelligence & Machine Learning",
                "Cyber Security & Cryptography",
                "Cloud Systems & DevOps",
                "High Performance Computing"
            ],
            "total_students": 1200,
            "laboratories": [
                "AI & GPU Supercomputing Laboratory",
                "Cyber Security & Forensics Center",
                "IoT & Embedded Systems Lab",
                "Cloud Computing Innovation Lab"
            ]
        },
        "notices": [
            {
                "id": "not_01",
                "title": "Registration for Odd Semester (2026-2027) Electives open now",
                "date": "28 Sept 2026",
                "category": "Academic"
            },
            {
                "id": "not_02",
                "title": "Academic Circular No. 2026/04: Attendance Concession for Hackathons",
                "date": "15 Jan 2026",
                "category": "Circular"
            },
            {
                "id": "not_03",
                "title": "Mandatory 80% Minimum Attendance Enforcement for End-Sem Exams",
                "date": "10 Aug 2026",
                "category": "Regulation"
            }
        ]
    }
