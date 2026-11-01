import re
from typing import Dict, Any, Optional, Tuple

BRANCH_CATALOG = {
    'bcp': ('B.Tech', 'Computer Engineering', 'Computer Science & Engineering', 'School of Technology', 4),
    'bcs': ('B.Tech', 'Computer Science & Engineering', 'Computer Science & Engineering', 'School of Technology', 4),
    'bit': ('B.Tech', 'Information & Communication Technology', 'Information & Communication Technology', 'School of Technology', 4),
    'bme': ('B.Tech', 'Mechanical Engineering', 'Mechanical Engineering', 'School of Technology', 4),
    'bch': ('B.Tech', 'Chemical Engineering', 'Chemical Engineering', 'School of Technology', 4),
    'bcv': ('B.Tech', 'Civil Engineering', 'Civil Engineering', 'School of Technology', 4),
    'bee': ('B.Tech', 'Electrical Engineering', 'Electrical Engineering', 'School of Technology', 4),
    'bpe': ('B.Tech', 'Petroleum Engineering', 'Petroleum Engineering', 'School of Energy Technology', 4),
    'bse': ('B.Tech', 'Solar & Renewable Energy', 'Solar & Renewable Energy', 'School of Energy Technology', 4),
    'bae': ('B.Tech', 'Automobile Engineering', 'Mechanical Engineering', 'School of Technology', 4),
    'bba': ('BBA (Hons.)', 'Business Administration', 'Management Studies', 'School of Liberal Studies', 4),
    'bcm': ('B.Com (Hons.)', 'Commerce', 'Commerce', 'School of Liberal Studies', 4),
    'bcom': ('B.Com (Hons.)', 'Commerce', 'Commerce', 'School of Liberal Studies', 4),
    'bar': ('B.A. (Hons.)', 'Liberal Studies', 'Liberal Studies', 'School of Liberal Studies', 4),
    'ba': ('B.A. (Hons.)', 'Liberal Studies', 'Liberal Studies', 'School of Liberal Studies', 4),
    'bsc': ('B.Sc (Hons.)', 'Applied Sciences', 'Sciences', 'School of Liberal Studies', 4),
    'mtp': ('M.Tech', 'Petroleum Engineering', 'Petroleum Engineering', 'School of Energy Technology', 2),
    'mte': ('M.Tech', 'Energy Systems', 'Energy Technology', 'School of Energy Technology', 2),
    'mtc': ('M.Tech', 'Cyber Security / CS', 'Computer Science & Engineering', 'School of Technology', 2),
    'mba': ('MBA', 'Energy & Infrastructure Management', 'School of Management', 'School of Management', 2),
    'msc': ('M.Sc', 'Applied Sciences', 'Sciences', 'School of Technology', 2),
    'phd': ('Ph.D.', 'Doctoral Research', 'Research Affairs', 'Doctoral Studies', 3),
}

def parse_pdpu_email(email: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    """
    Validates institutional email and extracts student attributes according to official PDEU / PDPU conventions:
    e.g. 23bcp116@sot.pdpu.ac.in:
      - 23: 2023 admission year -> 2023-2027 batch cohort
      - bcp: Bachelor of Computer Engineering
      - 116: Roll number
      - sot: School of Technology
    """
    clean_email = email.strip().lower()
    
    # Must end with pdpu.ac.in or pdeu.ac.in
    is_valid_domain = (
        clean_email.endswith('@pdpu.ac.in') or 
        clean_email.endswith('.pdpu.ac.in') or
        clean_email.endswith('@pdeu.ac.in') or
        clean_email.endswith('.pdeu.ac.in')
    )
    
    if not is_valid_domain:
        return None, "Only institutional emails ending with @pdpu.ac.in are allowed."
    
    parts = clean_email.split('@')
    if len(parts) != 2:
        return None, "Malformed email format."
    
    local, domain = parts
    subdomain_parts = domain.split('.')
    school_subdomain = subdomain_parts[0] if len(subdomain_parts) >= 3 and subdomain_parts[0] not in ['pdpu', 'pdeu'] else None
    
    # Check student pattern e.g. 23bcp116
    student_match = re.match(r'^([0-9]{2})([a-z]{3,4})([0-9]{1,4})$', local)
    if student_match:
        adm_year_short = student_match.group(1)
        adm_year = 2000 + int(adm_year_short)
        branch = student_match.group(2)
        roll = student_match.group(3)
        canonical_roll = f"{adm_year_short.upper()}{branch.upper()}{roll}"
        
        deg, prog_name, dept, def_school, duration = BRANCH_CATALOG.get(
            branch, ('B.Tech', f'Engineering ({branch.upper()})', 'Engineering', 'School of Technology', 4)
        )
        
        school = def_school
        if school_subdomain == 'sot':
            school = 'School of Technology'
        elif school_subdomain == 'soet':
            school = 'School of Energy Technology'
        elif school_subdomain == 'sls':
            school = 'School of Liberal Studies'
        elif school_subdomain in ['spm', 'som']:
            school = 'School of Management'
            
        grad_year = adm_year + duration
        batch = str(grad_year)
        cohort_str = f"{adm_year}-{grad_year}"
        
        # Calculate current semester (Anchor: Academic Year 2026-2027)
        current_year = 2026
        years_done = current_year - adm_year
        current_sem = min(duration * 2, max(1, years_done * 2 + 1))
        
        # Determine completed courses appropriate for the calculated semester
        completed_courses = []
        if current_sem >= 3:
            completed_courses.extend(["CS101 Computer Programming - I", "MA101 Mathematics - I", "PY101 Applied Physics"])
        if current_sem >= 5:
            completed_courses.extend(["CS102 Computer Programming - II", "CS201 Data Structures", "CS202 Discrete Mathematics"])
        if current_sem >= 7:
            completed_courses.extend(["CS301 Database Systems", "CS302 Design & Analysis of Algorithms", "CS303 Operating Systems", "CS304 Computer Networks"])
        
        display_name = f"Student {canonical_roll}"
        if canonical_roll == "23BCSE101" or canonical_roll == "23BCP116":
            display_name = "Dhwani Vyas"
        elif canonical_roll == "21BCSE088" or canonical_roll == "21BCP088":
            display_name = "Rohan Patel"
        
        return {
            "is_student": True,
            "full_name": display_name,
            "email": clean_email,
            "role": "student",
            "admission_year": adm_year,
            "graduation_year": grad_year,
            "batch": batch,
            "cohort_string": cohort_str,
            "branch_code": branch.upper(),
            "program": f"{deg} {prog_name}",
            "degree": deg,
            "department": dept,
            "school": school,
            "roll_number": canonical_roll,
            "roll_code": roll,
            "current_semester": current_sem,
            "academic_year": "2026-2027",
            "completed_courses": completed_courses,
            "cgpa": 8.5
        }, None

    # Faculty / Administrator / Staff format
    is_admin = 'admin' in local or 'registrar' in local or 'dean' in local
    return {
        "is_student": False,
        "full_name": "Dean / Administrator" if is_admin else f"Prof. {local.capitalize()}",
        "email": clean_email,
        "role": "admin" if is_admin else "faculty",
        "admission_year": 2020,
        "graduation_year": 2026,
        "batch": "N/A",
        "cohort_string": "Faculty / Staff",
        "branch_code": "ADMIN" if is_admin else "FAC",
        "program": "Academic Governance" if is_admin else "Faculty & Research",
        "degree": "Faculty",
        "department": "Academic Affairs",
        "school": "Pandit Deendayal Energy University",
        "roll_number": "FAC-001" if is_admin else local.upper(),
        "roll_code": "001",
        "current_semester": 0,
        "academic_year": "2026-2027",
        "completed_courses": [],
        "cgpa": 10.0
    }, None
