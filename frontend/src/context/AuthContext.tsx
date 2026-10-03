'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Persona } from '@/lib/types';
import { fetchPersonas, loginUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  personas: Persona[];
  activePersona: Persona | null;
  switchPersona: (personaId: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  personas: [],
  activePersona: null,
  switchPersona: async () => {},
  login: async () => {},
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
        
        // Default to Dhwani Vyas for seamless instant demo
        const defaultPersona = personaList.find(p => p.id === 'dhwani') || personaList[0];
        if (defaultPersona) {
          setActivePersona(defaultPersona);
          try {
            const authData = await loginUser(defaultPersona.email, defaultPersona.password);
            setUser(authData.user);
            setToken(authData.token);
          } catch (e) {
            // Local fallback user representation
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
          }
        }
      } catch (err) {
        console.error('Failed to init auth context:', err);
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
    } catch (e) {
      console.error('Error switching persona:', e);
      // Fallback update
      setUser({
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
      });
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActivePersona(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        personas,
        activePersona,
        switchPersona,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
