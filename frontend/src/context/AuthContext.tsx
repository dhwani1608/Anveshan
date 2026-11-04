'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Persona } from '@/lib/types';
import { fetchPersonas, loginUser } from '@/lib/api';
import { parsePDPUEmail, ParsedStudentInfo } from '@/lib/emailParser';

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  discipline: string;
  program: string;
  state: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  personas: Persona[];
  activePersona: Persona | null;
  studentInfo: ParsedStudentInfo | null;
  guestInfo: GuestInfo | null;
  isGuest: boolean;
  switchPersona: (personaId: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithStudentEmail: (rawEmailOrRoll: string) => ParsedStudentInfo;
  setGuestProfile: (guest: GuestInfo) => void;
  continueAsGuest: () => void;
  logout: () => void;
  resetSession: () => void;
  isLoading: boolean;
}

const GUEST_PERSONA: Persona = {
  id: 'guest',
  name: 'Guest Aspirant',
  role: 'student',
  email: 'guest@pdpu.ac.in',
  password: '',
  batch: '2027',
  semester: 1,
  program: 'Prospective Student (Admissions Context)',
  roll: 'GUEST',
  description: 'Unauthenticated Guest Visitor (PDEU Knowledge Base & Admissions Active)'
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  personas: [],
  activePersona: null,
  studentInfo: null,
  guestInfo: null,
  isGuest: true,
  switchPersona: async () => {},
  login: async () => {},
  loginWithStudentEmail: () => ({ isValid: false, isStudent: false, email: '', role: 'student' }),
  setGuestProfile: () => {},
  continueAsGuest: () => {},
  logout: () => {},
  resetSession: () => {},
  isLoading: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [studentInfo, setStudentInfo] = useState<ParsedStudentInfo | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const personaList = await fetchPersonas();
        setPersonas(personaList);

        // Check if there's an existing student session in localStorage
        const savedStudentStr = typeof window !== 'undefined' ? localStorage.getItem('pdeu_student_session') : null;
        if (savedStudentStr) {
          try {
            const parsedStudent: ParsedStudentInfo = JSON.parse(savedStudentStr);
            if (parsedStudent && parsedStudent.isValid) {
              setStudentInfo(parsedStudent);
              setActivePersona({
                id: parsedStudent.rollNumber ? parsedStudent.rollNumber.toLowerCase() : 'student',
                name: parsedStudent.rollNumber ? `Student (${parsedStudent.rollNumber})` : 'PDEU Student',
                role: 'student',
                email: parsedStudent.email,
                password: '',
                batch: parsedStudent.batch || '2027',
                semester: parsedStudent.currentSemester || 7,
                program: parsedStudent.program || 'B.Tech Computer Engineering',
                roll: parsedStudent.rollNumber || '23BCP116',
                description: `${parsedStudent.rollNumber} • ${parsedStudent.program} • ${parsedStudent.school}`
              });
              setUser({
                id: `usr_${parsedStudent.rollNumber?.toLowerCase() || 'student'}`,
                email: parsedStudent.email,
                full_name: parsedStudent.rollNumber === '23BCP116' ? 'Dhwani Vyas' : `Student ${parsedStudent.rollNumber}`,
                role: 'student',
                organization_id: 'PDEU',
                profile: {
                  id: `prof_${parsedStudent.rollNumber?.toLowerCase()}`,
                  roll_number: parsedStudent.rollNumber || '23BCP116',
                  program: parsedStudent.program || 'B.Tech Computer Engineering',
                  department: parsedStudent.department || 'Computer Science & Engineering',
                  batch: parsedStudent.batch || '2027',
                  current_academic_year: parsedStudent.academicYear || '2026-2027',
                  current_semester: parsedStudent.currentSemester || 7,
                  completed_courses: parsedStudent.completedCourses || [
                    'CS201 Data Structures',
                    'CS202 Discrete Mathematics',
                    'CS301 Database Systems',
                    'CS302 Design & Analysis of Algorithms'
                  ],
                  cgpa: 8.92
                }
              });
              return;
            }
          } catch (e) {
            console.warn('Failed to parse saved student session:', e);
          }
        }

        // Check if there's a saved guest session in localStorage
        const savedGuestStr = typeof window !== 'undefined' ? localStorage.getItem('pdeu_guest_session') : null;
        if (savedGuestStr) {
          try {
            const parsedGuest: GuestInfo = JSON.parse(savedGuestStr);
            if (parsedGuest && parsedGuest.name) {
              setGuestInfo(parsedGuest);
              setActivePersona({
                id: 'guest',
                name: parsedGuest.name,
                role: 'student',
                email: parsedGuest.email || 'guest@pdpu.ac.in',
                password: '',
                batch: '2027',
                semester: 1,
                program: parsedGuest.program || 'Aspirant Program',
                roll: 'GUEST',
                description: `Guest Aspirant • ${parsedGuest.discipline} • ${parsedGuest.program}`
              });
              return;
            }
          } catch (e) {
            console.warn('Failed to parse saved guest session:', e);
          }
        }

        // If no saved session, default to null so user gets prompted to choose Guest or Student!
        setActivePersona(null);
        setStudentInfo(null);
        setGuestInfo(null);
      } catch (err) {
        console.error('Failed to init auth context:', err);
        setActivePersona(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const loginWithStudentEmail = (rawEmailOrRoll: string): ParsedStudentInfo => {
    const parsed = parsePDPUEmail(rawEmailOrRoll);
    if (!parsed.isValid) {
      return parsed;
    }

    const isDhwani = parsed.rollNumber === '23BCP116';
    const studentUser: User = {
      id: `usr_${parsed.rollNumber?.toLowerCase()}`,
      email: parsed.email,
      full_name: isDhwani ? 'Dhwani Vyas' : `Student ${parsed.rollNumber}`,
      role: 'student',
      organization_id: 'PDEU',
      profile: {
        id: `prof_${parsed.rollNumber?.toLowerCase()}`,
        roll_number: parsed.rollNumber || 'STUDENT',
        program: parsed.program || 'B.Tech Computer Engineering',
        department: parsed.department || 'Computer Science & Engineering',
        batch: parsed.batch || '2027',
        current_academic_year: parsed.academicYear || '2026-2027',
        current_semester: parsed.currentSemester || 7,
        completed_courses: parsed.completedCourses || [
          'CS201 Data Structures',
          'CS202 Discrete Mathematics',
          'CS301 Database Systems',
          'CS302 Design & Analysis of Algorithms'
        ],
        cgpa: 8.92
      }
    };

    const newPersona: Persona = {
      id: parsed.rollNumber?.toLowerCase() || 'student',
      name: isDhwani ? 'Dhwani Vyas' : `Student ${parsed.rollNumber}`,
      role: 'student',
      email: parsed.email,
      password: '',
      batch: parsed.batch || '2027',
      semester: parsed.currentSemester || 7,
      program: parsed.program || 'B.Tech Computer Engineering',
      roll: parsed.rollNumber || 'STUDENT',
      description: `${parsed.rollNumber} • ${parsed.program} • ${parsed.school}`
    };

    setUser(studentUser);
    setStudentInfo(parsed);
    setGuestInfo(null);
    setActivePersona(newPersona);

    if (typeof window !== 'undefined') {
      localStorage.setItem('pdeu_student_session', JSON.stringify(parsed));
      localStorage.removeItem('pdeu_guest_session');
    }

    return parsed;
  };

  const setGuestProfile = (guest: GuestInfo) => {
    setGuestInfo(guest);
    setStudentInfo(null);
    setUser(null);

    const guestPersona: Persona = {
      id: 'guest',
      name: guest.name || 'Guest Aspirant',
      role: 'student',
      email: guest.email || 'guest@pdpu.ac.in',
      password: '',
      batch: '2027',
      semester: 1,
      program: guest.program || 'Aspirant Program',
      roll: 'GUEST',
      description: `Guest Aspirant • ${guest.discipline} • ${guest.program}`
    };

    setActivePersona(guestPersona);

    if (typeof window !== 'undefined') {
      localStorage.setItem('pdeu_guest_session', JSON.stringify(guest));
      localStorage.removeItem('pdeu_student_session');
    }
  };

  const resetSession = () => {
    setUser(null);
    setToken(null);
    setActivePersona(null);
    setStudentInfo(null);
    setGuestInfo(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pdeu_student_session');
      localStorage.removeItem('pdeu_guest_session');
      localStorage.removeItem('anveshan_token');
      localStorage.removeItem('anveshan_user');
    }
  };

  const switchPersona = async (personaId: string) => {
    const target = personas.find(p => p.id === personaId);
    if (!target) return;
    setIsLoading(true);
    try {
      setActivePersona(target);
      const authData = await loginUser(target.email, target.password);
      setUser(authData.user);
      setToken(authData.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('anveshan_token', authData.token);
        localStorage.setItem('anveshan_user', JSON.stringify(authData.user));
      }
    } catch (e) {
      console.error('Error switching persona:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const authData = await loginUser(email, pass);
      setUser(authData.user);
      setToken(authData.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('anveshan_token', authData.token);
        localStorage.setItem('anveshan_user', JSON.stringify(authData.user));
      }

      const parsed = parsePDPUEmail(authData.user.email);
      setActivePersona({
        id: authData.user.id,
        name: authData.user.full_name,
        role: authData.user.role,
        email: authData.user.email,
        password: '',
        batch: authData.user.profile?.batch || parsed.batch || '2027',
        semester: authData.user.profile?.current_semester || parsed.currentSemester || 7,
        program: authData.user.profile?.program || parsed.program || 'B.Tech Computer Engineering',
        roll: authData.user.profile?.roll_number || parsed.rollNumber || '23BCP116',
        description: `${authData.user.email} • ${parsed.school || 'School of Technology'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = () => {
    setUser(null);
    setToken(null);
    setGuestProfile({
      name: 'Guest Explorer',
      email: 'guest@pdpu.ac.in',
      phone: '',
      discipline: 'School of Technology (SoT)',
      program: 'B.Tech. Computer Engineering',
      state: 'Gujarat'
    });
  };

  const logout = () => {
    resetSession();
  };

  const isGuest = !studentInfo && (!user || user.id === 'guest');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        personas,
        activePersona,
        studentInfo,
        guestInfo,
        isGuest,
        switchPersona,
        login,
        loginWithStudentEmail,
        setGuestProfile,
        continueAsGuest,
        logout,
        resetSession,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
