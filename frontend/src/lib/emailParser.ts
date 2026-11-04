export interface ParsedStudentInfo {
  isValid: boolean;
  isStudent: boolean;
  email: string;
  admissionYear?: number;
  graduationYear?: number;
  batch?: string;
  cohortString?: string;
  branchCode?: string;
  degree?: string;
  program?: string;
  department?: string;
  school?: string;
  rollNumber?: string;
  rollCode?: string;
  currentSemester?: number;
  academicYear?: string;
  role: 'student' | 'admin' | 'faculty';
  completedCourses?: string[];
  currentCourses?: string[];
  error?: string;
}

// Authoritative mapping of PDEU Branch Codes to Degree Programs
export const BRANCH_MAP: Record<string, { degree: string; program: string; department: string; defaultSchool: string; duration: number }> = {
  // Undergraduate Engineering (SoT & SoET)
  bcp: { degree: 'B.Tech', program: 'Computer Engineering', department: 'Computer Science & Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bcs: { degree: 'B.Tech', program: 'Computer Science & Engineering', department: 'Computer Science & Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  csbs: { degree: 'B.Tech', program: 'Computer Science & Business Systems', department: 'Computer Science & Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bsb: { degree: 'B.Tech', program: 'Computer Science & Business Systems', department: 'Computer Science & Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bit: { degree: 'B.Tech', program: 'Information & Communication Technology', department: 'Information & Communication Technology', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bec: { degree: 'B.Tech', program: 'Electronics & Communication Engineering', department: 'Electronics & Communication Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  ece: { degree: 'B.Tech', program: 'Electronics & Communication Engineering', department: 'Electronics & Communication Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bme: { degree: 'B.Tech', program: 'Mechanical Engineering', department: 'Mechanical Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bcv: { degree: 'B.Tech', program: 'Civil Engineering', department: 'Civil Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bch: { degree: 'B.Tech', program: 'Chemical Engineering', department: 'Chemical Engineering', defaultSchool: 'School of Energy Technology (SoET)', duration: 4 },
  bpe: { degree: 'B.Tech', program: 'Petroleum Engineering', department: 'Petroleum Engineering', defaultSchool: 'School of Energy Technology (SoET)', duration: 4 },
  bee: { degree: 'B.Tech', program: 'Electrical Engineering', department: 'Electrical Engineering', defaultSchool: 'School of Energy Technology (SoET)', duration: 4 },
  bbt: { degree: 'B.Tech', program: 'Biotechnology', department: 'Biotechnology', defaultSchool: 'School of Energy Technology (SoET)', duration: 4 },
  bse: { degree: 'B.Tech', program: 'Solar & Renewable Energy', department: 'Solar & Renewable Energy', defaultSchool: 'School of Energy Technology (SoET)', duration: 4 },
  bae: { degree: 'B.Tech', program: 'Automobile Engineering', department: 'Mechanical Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },

  // Sciences & Liberal Studies
  bds: { degree: 'B.Sc. (Hons.)', program: 'Data Science', department: 'Mathematics', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bph: { degree: 'B.Sc. (Hons.)', program: 'Physics', department: 'Physics', defaultSchool: 'School of Energy Technology (SoET)', duration: 4 },
  bcy: { degree: 'B.Sc. (Hons.)', program: 'Chemistry', department: 'Chemistry', defaultSchool: 'School of Energy Technology (SoET)', duration: 4 },
  bsc: { degree: 'B.Sc. (Hons.)', program: 'Applied Sciences', department: 'Sciences', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  bba: { degree: 'BBA (Hons.)', program: 'Business Administration', department: 'Management Studies', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  bcm: { degree: 'B.Com. (Hons.)', program: 'Commerce', department: 'Commerce', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  bcom: { degree: 'B.Com. (Hons.)', program: 'Commerce', department: 'Commerce', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  bar: { degree: 'B.A. (Hons.)', program: 'Liberal Studies', department: 'Liberal Studies', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  ba: { degree: 'B.A. (Hons.)', program: 'Liberal Studies', department: 'Liberal Studies', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },

  // Postgraduate Programs
  mba: { degree: 'MBA', program: 'Energy & Infrastructure', department: 'School of Management', defaultSchool: 'School of Management (SoM)', duration: 2 },
  mtp: { degree: 'M.Tech', program: 'Petroleum Engineering', department: 'Petroleum Engineering', defaultSchool: 'School of Energy Technology (SoET)', duration: 2 },
  mte: { degree: 'M.Tech', program: 'Energy Systems', department: 'Energy Technology', defaultSchool: 'School of Energy Technology (SoET)', duration: 2 },
  mtc: { degree: 'M.Tech', program: 'Cyber Security', department: 'Computer Science & Engineering', defaultSchool: 'School of Technology (SoT)', duration: 2 },
  mai: { degree: 'M.Tech', program: 'Artificial Intelligence', department: 'Computer Science & Engineering', defaultSchool: 'School of Technology (SoT)', duration: 2 },
  mds: { degree: 'M.Tech', program: 'Data Science', department: 'Computer Science & Engineering', defaultSchool: 'School of Technology (SoT)', duration: 2 },
  mvl: { degree: 'M.Tech', program: 'VLSI Design', department: 'Electronics & Communication', defaultSchool: 'School of Technology (SoT)', duration: 2 },
  msc: { degree: 'M.Sc.', program: 'Applied Sciences', department: 'Sciences', defaultSchool: 'School of Technology (SoT)', duration: 2 },
  mpa: { degree: 'M.A.', program: 'Public Policy & Administration', department: 'Public Policy', defaultSchool: 'School of Liberal Studies (SLS)', duration: 2 },
  phd: { degree: 'Ph.D.', program: 'Doctoral Research', department: 'Research Affairs', defaultSchool: 'Doctoral Studies', duration: 3 }
};

// Real PDEU Academic Schools and their exclusively offered programs
export const PDEU_OFFERED_PROGRAMS: Record<string, string[]> = {
  'School of Technology (SoT)': [
    'B.Tech. Computer Engineering',
    'B.Tech. Information & Communication Technology (ICT)',
    'B.Tech. Computer Science & Business Systems (CSBS)',
    'B.Tech. Electronics & Communication Engineering (ECE)',
    'B.Tech. Mechanical Engineering',
    'B.Tech. Civil Engineering',
    'B.Sc. (Hons.) Data Science',
    'M.Tech. Artificial Intelligence',
    'M.Tech. Data Science',
    'M.Tech. Cyber Security',
    'M.Tech. VLSI Design'
  ],
  'School of Energy Technology (SoET)': [
    'B.Tech. Chemical Engineering',
    'B.Tech. Petroleum Engineering',
    'B.Tech. Electrical Engineering',
    'B.Tech. Biotechnology',
    'B.Sc. (Hons.) Physics',
    'B.Sc. (Hons.) Chemistry',
    'M.Tech. Petroleum Engineering',
    'M.Tech. Chemical Engineering',
    'M.Tech. Energy Systems (Solar Energy)'
  ],
  'School of Management (SoM)': [
    'Master of Business Administration (MBA - Energy & Infrastructure)',
    'Master of Business Administration (MBA - General Management)'
  ],
  'School of Liberal Studies (SLS)': [
    'B.A. (Hons.) Liberal Studies',
    'B.B.A. (Hons.) Business Administration',
    'B.Com. (Hons.) Commerce',
    'M.A. Public Policy & Administration',
    'M.A. Psychology',
    'M.A. Economics',
    'M.A. English & Media'
  ]
};

export function parsePDPUEmail(rawInput: string): ParsedStudentInfo {
  let email = (rawInput || '').trim().toLowerCase();
  if (!email) {
    return { isValid: false, isStudent: false, email, role: 'student', error: 'Email cannot be blank.' };
  }

  // Allow entering just the roll number or email prefix (e.g. 23bcp116)
  if (!email.includes('@')) {
    email = `${email}@sot.pdpu.ac.in`;
  }

  // Must end with pdpu.ac.in or pdeu.ac.in
  const isValidDomain =
    email.endsWith('@pdpu.ac.in') ||
    email.endsWith('.pdpu.ac.in') ||
    email.endsWith('@pdeu.ac.in') ||
    email.endsWith('.pdeu.ac.in');

  if (!isValidDomain) {
    return {
      isValid: false,
      isStudent: false,
      email,
      role: 'student',
      error: 'Only institutional emails ending with @pdpu.ac.in (e.g. 23bcp116@sot.pdpu.ac.in) are allowed.'
    };
  }

  const [local, domain] = email.split('@');
  const subdomainParts = (domain || '').split('.');
  const schoolSub = subdomainParts.length >= 3 && !['pdpu', 'pdeu'].includes(subdomainParts[0]) ? subdomainParts[0] : null;

  // Pattern: e.g. 23bcp116 (2 digits year + 3-4 letters branch + 1-4 digits roll)
  const studentMatch = local.match(/^([0-9]{2})([a-z]{3,4})([0-9]{1,4})$/);
  if (studentMatch) {
    const admYearShort = studentMatch[1];
    const admYear = 2000 + parseInt(admYearShort, 10);
    const branchCode = studentMatch[2];
    const roll = studentMatch[3];
    const canonicalRoll = `${admYearShort.toUpperCase()}${branchCode.toUpperCase()}${roll}`;

    const config = BRANCH_MAP[branchCode] || {
      degree: 'B.Tech',
      program: `Engineering (${branchCode.toUpperCase()})`,
      department: 'Engineering',
      defaultSchool: 'School of Technology (SoT)',
      duration: 4
    };

    let school = config.defaultSchool;
    if (schoolSub === 'sot') school = 'School of Technology (SoT)';
    else if (schoolSub === 'soet') school = 'School of Energy Technology (SoET)';
    else if (schoolSub === 'sls') school = 'School of Liberal Studies (SLS)';
    else if (schoolSub === 'spm' || schoolSub === 'som') school = 'School of Management (SoM)';

    const gradYear = admYear + config.duration;
    const batch = String(gradYear);
    const cohortString = `${admYear}-${gradYear}`;

    // Anchor: 2026-2027 Academic Year
    const currentYear = 2026;
    const yearsDone = currentYear - admYear;
    const currentSem = Math.min(config.duration * 2, Math.max(1, yearsDone * 2 + 1));

    // Curriculum foundation for B.Tech CSE (e.g. 23BCP116)
    const completedCourses = branchCode === 'bcp' || branchCode === 'bcs'
      ? [
          '24HS101T English Communication',
          '24MA101T Mathematics - I',
          '24PH101T Engineering Physics',
          '24CV101T Elements of Civil Engineering',
          '24ME101T Elements of Mechanical Engineering',
          '24BT101T Environmental Studies',
          '24MA102T Mathematics - II',
          '24CS101T Computer Programming in C/Python',
          'CS201 Data Structures',
          'CS202 Discrete Mathematics',
          'CS301 Database Systems',
          'CS302 Design & Analysis of Algorithms'
        ]
      : ['Foundation Mathematics', 'Physics Lab', 'Programming in C', 'Engineering Graphics'];

    const currentCourses = branchCode === 'bcp' || branchCode === 'bcs'
      ? [
          'CS401 Machine Learning & AI Applications',
          'CS402 Cloud Computing & Distributed Systems',
          'CS421 Deep Learning Elective',
          'Capstone Project Phase - I'
        ]
      : ['Core Specialization Course', 'Elective III', 'Industry Immersion'];

    return {
      isValid: true,
      isStudent: true,
      email,
      admissionYear: admYear,
      graduationYear: gradYear,
      batch,
      cohortString,
      branchCode: branchCode.toUpperCase(),
      degree: config.degree,
      program: `${config.degree} ${config.program}`,
      department: config.department,
      school,
      rollNumber: canonicalRoll,
      rollCode: roll,
      currentSemester: currentSem,
      academicYear: '2026-2027',
      role: 'student',
      completedCourses,
      currentCourses
    };
  }

  // Non-student (Faculty or Administrator)
  const isAdmin = local.includes('admin') || local.includes('dean') || local.includes('registrar');
  return {
    isValid: true,
    isStudent: false,
    email,
    batch: 'N/A',
    cohortString: 'Faculty / Staff',
    branchCode: isAdmin ? 'ADMIN' : 'FAC',
    program: isAdmin ? 'Academic Governance' : 'Faculty & Research',
    degree: 'Faculty',
    department: 'Academic Affairs',
    school: 'Pandit Deendayal Energy University',
    rollNumber: isAdmin ? 'FAC-001' : local.toUpperCase(),
    rollCode: '001',
    currentSemester: 0,
    academicYear: '2026-2027',
    role: isAdmin ? 'admin' : 'faculty'
  };
}
