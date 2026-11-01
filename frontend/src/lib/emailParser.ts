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
  error?: string;
}

const BRANCH_MAP: Record<string, { degree: string; program: string; department: string; defaultSchool: string; duration: number }> = {
  bcp: { degree: 'B.Tech', program: 'Computer Engineering', department: 'Computer Science & Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bcs: { degree: 'B.Tech', program: 'Computer Science & Engineering', department: 'Computer Science & Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bit: { degree: 'B.Tech', program: 'Information & Communication Technology', department: 'Information & Communication Technology', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bme: { degree: 'B.Tech', program: 'Mechanical Engineering', department: 'Mechanical Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bch: { degree: 'B.Tech', program: 'Chemical Engineering', department: 'Chemical Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bcv: { degree: 'B.Tech', program: 'Civil Engineering', department: 'Civil Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bee: { degree: 'B.Tech', program: 'Electrical Engineering', department: 'Electrical Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bpe: { degree: 'B.Tech', program: 'Petroleum Engineering', department: 'Petroleum Engineering', defaultSchool: 'School of Energy Technology (SoET)', duration: 4 },
  bse: { degree: 'B.Tech', program: 'Solar & Renewable Energy', department: 'Solar & Renewable Energy', defaultSchool: 'School of Energy Technology (SoET)', duration: 4 },
  bae: { degree: 'B.Tech', program: 'Automobile Engineering', department: 'Mechanical Engineering', defaultSchool: 'School of Technology (SoT)', duration: 4 },
  bba: { degree: 'BBA (Hons.)', program: 'Business Administration', department: 'Management Studies', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  bcm: { degree: 'B.Com (Hons.)', program: 'Commerce', department: 'Commerce', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  bcom: { degree: 'B.Com (Hons.)', program: 'Commerce', department: 'Commerce', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  bar: { degree: 'B.A. (Hons.)', program: 'Liberal Studies', department: 'Liberal Studies', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  ba: { degree: 'B.A. (Hons.)', program: 'Liberal Studies', department: 'Liberal Studies', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  bsc: { degree: 'B.Sc (Hons.)', program: 'Applied Sciences', department: 'Sciences', defaultSchool: 'School of Liberal Studies (SLS)', duration: 4 },
  mtp: { degree: 'M.Tech', program: 'Petroleum Engineering', department: 'Petroleum Engineering', defaultSchool: 'School of Energy Technology (SoET)', duration: 2 },
  mte: { degree: 'M.Tech', program: 'Energy Systems', department: 'Energy Technology', defaultSchool: 'School of Energy Technology (SoET)', duration: 2 },
  mtc: { degree: 'M.Tech', program: 'Cyber Security / CS', department: 'Computer Science & Engineering', defaultSchool: 'School of Technology (SoT)', duration: 2 },
  mba: { degree: 'MBA', program: 'Energy & Infrastructure', department: 'School of Management', defaultSchool: 'School of Management (SoM)', duration: 2 },
  msc: { degree: 'M.Sc', program: 'Applied Sciences', department: 'Sciences', defaultSchool: 'School of Technology (SoT)', duration: 2 },
  phd: { degree: 'Ph.D.', program: 'Doctoral Research', department: 'Research Affairs', defaultSchool: 'Doctoral Studies', duration: 3 }
};

export function parsePDPUEmail(rawEmail: string): ParsedStudentInfo {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email) {
    return { isValid: false, isStudent: false, email, role: 'student', error: 'Email cannot be blank.' };
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
      error: 'Only institutional emails ending with @pdpu.ac.in (or @sot.pdpu.ac.in) are allowed.'
    };
  }

  const [local, domain] = email.split('@');
  const subdomainParts = (domain || '').split('.');
  const schoolSub = subdomainParts.length >= 3 && !['pdpu', 'pdeu'].includes(subdomainParts[0]) ? subdomainParts[0] : null;

  // Check student pattern: e.g. 23bcp116
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
      role: 'student'
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
