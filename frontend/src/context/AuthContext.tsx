'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Persona } from '@/lib/types';
import { fetchPersonas, loginUser } from '@/lib/api';
import { parsePDPUEmail } from '@/lib/emailParser';

interface AuthContextType {
  user: User | null;
  token: string | null;
  personas: Persona[];
  activePersona: Persona | null;
  isGuest: boolean;
  switchPersona: (personaId: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  isLoading: boolean;
}

const GUEST_PERSONA: Persona = {
  id: 'guest',
  name: 'Guest Explorer',
  role: 'student',
  email: 'guest@pdpu.ac.in',
  password: '',
  batch: '2027',
  semester: 7,
  program: 'B.Tech (Guest Context)',
  roll: 'GUEST',
  description: 'Unauthenticated Guest Visitor (PDEU Knowledge Base & Assistant Active)'
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  personas: [],
  activePersona: null,
  isGuest: true,
  switchPersona: async () => {},
  login: async () => {},
  continueAsGuest: () => {},
  logout: () => {},
  isLoading: false
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const personaList = await fetchPersonas();
        setPersonas(personaList);

        // Check if there's an existing session in localStorage
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('anveshan_token') : null;
        const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('anveshan_user') : null;

        if (savedToken && savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            setUser(savedUser);
            setToken(savedToken);

            const parsed = parsePDPUEmail(savedUser.email);
            setActivePersona({
              id: savedUser.id,
              name: savedUser.full_name,
              role: savedUser.role,
              email: savedUser.email,
              password: '',
              batch: savedUser.profile?.batch || parsed.batch || '2027',
              semester: savedUser.profile?.current_semester || parsed.currentSemester || 7,
              program: savedUser.profile?.program || parsed.program || 'B.Tech',
              roll: savedUser.profile?.roll_number || parsed.rollNumber || 'STUDENT',
              description: `${savedUser.email} • ${parsed.school || 'PDEU'}`
            });
            return;
          } catch (e) {
            console.warn('Invalid saved session');
          }
        }

        // Default Persona for immediate demonstration
        const defaultPersona = personaList.find(p => p.id === 'dhwani') || personaList[0];
        if (defaultPersona) {
          setActivePersona(defaultPersona);
          setUser({
            id: defaultPersona.id,
            email: defaultPersona.email,
            full_name: defaultPersona.name,
            role: defaultPersona.role as any,
            organization_id: 'PDEU',
            profile: {
              id: 'prof_dhwani',
              roll_number: defaultPersona.roll,
              program: defaultPersona.program,
              department: 'Computer Science & Engineering',
              batch: defaultPersona.batch,
              current_academic_year: '2026-2027',
              current_semester: defaultPersona.semester,
              completed_courses: [
                'CS201 Data Structures',
                'CS202 Discrete Mathematics',
                'CS301 Database Systems',
                'CS302 Design & Analysis of Algorithms'
              ],
              cgpa: 8.92
            }
          });
        } else {
          setActivePersona(GUEST_PERSONA);
        }
      } catch (err) {
        console.error('Failed to init auth context:', err);
        setActivePersona(GUEST_PERSONA);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

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
      // Fallback local update
      const fallbackUser: User = {
        id: target.id,
        email: target.email,
        full_name: target.name,
        role: target.role as any,
        organization_id: 'PDEU',
        profile: target.role === 'student' ? {
          id: `prof_${target.id}`,
          roll_number: target.roll,
          program: target.program,
          department: 'Computer Science & Engineering',
          batch: target.batch,
          current_academic_year: target.batch === '2027' ? '2026-2027' : '2024-2025',
          current_semester: target.semester,
          completed_courses: target.batch === '2027'
            ? ['CS201 Data Structures', 'CS302 Design & Analysis of Algorithms', 'CS301 DBMS']
            : ['CS201 Data Structures', 'CS301 DBMS'],
          cgpa: target.batch === '2027' ? 8.92 : 7.85
        } : null
      };
      setUser(fallbackUser);
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

      // Synchronize activePersona with parsed student email info
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
    setActivePersona(GUEST_PERSONA);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('anveshan_token');
      localStorage.removeItem('anveshan_user');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActivePersona(GUEST_PERSONA);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('anveshan_token');
      localStorage.removeItem('anveshan_user');
    }
  };

  const isGuest = !user || user.id === 'guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        personas,
        activePersona,
        isGuest,
        switchPersona,
        login,
        continueAsGuest,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
