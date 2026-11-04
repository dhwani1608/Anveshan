'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AnveshanTheme = 'crimson' | 'light' | 'pdeu' | 'dark' | 'emerald';
export type AnveshanViewMode = 'sidebar' | 'floating' | 'expanded';

interface ThemeContextType {
  theme: AnveshanTheme;
  setTheme: (t: AnveshanTheme) => void;
  viewMode: AnveshanViewMode;
  setViewMode: (m: AnveshanViewMode) => void;
  isAiOpen: boolean;
  setIsAiOpen: (open: boolean) => void;
  toggleAi: () => void;
  openSidebar: () => void;
  openFloating: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Red & White theme with crisp white background
  const [theme, setThemeState] = useState<AnveshanTheme>('crimson');
  const [viewMode, setViewModeState] = useState<AnveshanViewMode>('sidebar');
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('anveshan_theme') as AnveshanTheme | null;
      if (savedTheme && ['crimson', 'light', 'pdeu', 'dark', 'emerald'].includes(savedTheme)) {
        setThemeState(savedTheme);
      } else {
        setThemeState('crimson');
      }
      const savedMode = localStorage.getItem('anveshan_view_mode') as AnveshanViewMode | null;
      if (savedMode && ['sidebar', 'floating', 'expanded'].includes(savedMode)) {
        setViewModeState(savedMode);
      }
    }
  }, []);

  const setTheme = (t: AnveshanTheme) => {
    setThemeState(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('anveshan_theme', t);
    }
  };

  const setViewMode = (m: AnveshanViewMode) => {
    setViewModeState(m);
    if (typeof window !== 'undefined') {
      localStorage.setItem('anveshan_view_mode', m);
    }
  };

  const toggleAi = () => {
    setIsAiOpen(prev => !prev);
  };

  const openSidebar = () => {
    setViewMode('sidebar');
    setIsAiOpen(true);
  };

  const openFloating = () => {
    setViewMode('floating');
    setIsAiOpen(true);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      viewMode,
      setViewMode,
      isAiOpen,
      setIsAiOpen,
      toggleAi,
      openSidebar,
      openFloating
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
