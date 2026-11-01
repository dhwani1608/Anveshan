'use client';

import React, { useState } from 'react';
import {
  Sparkles, X, MessageSquare, Maximize2, Minimize2, GraduationCap,
  User, PanelRightClose, PanelRightOpen, Sun, Moon, Palette,
  RotateCcw, SlidersHorizontal, ChevronRight, Compass
} from 'lucide-react';
import { AssistantChat } from './AssistantChat';
import { useAuth } from '@/context/AuthContext';
import { useTheme, AnveshanTheme, AnveshanViewMode } from '@/context/ThemeContext';
import Link from 'next/link';

export const FloatingAssistant: React.FC = () => {
  const { user, isGuest } = useAuth();
  const {
    theme,
    setTheme,
    viewMode,
    setViewMode,
    isAiOpen,
    setIsAiOpen,
    toggleAi
  } = useTheme();

  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themeOptions: { id: AnveshanTheme; label: string; icon: string; previewClass: string }[] = [
    { id: 'pdeu', label: 'PDEU Heritage', icon: '🏛️', previewClass: 'bg-[#002b49] border-[#e87722]' },
    { id: 'dark', label: 'Dark Obsidian', icon: '🌙', previewClass: 'bg-slate-900 border-amber-400' },
    { id: 'light', label: 'Light Academic', icon: '☀️', previewClass: 'bg-white border-slate-300' },
    { id: 'emerald', label: 'Emerald Sage', icon: '🌲', previewClass: 'bg-[#064e3b] border-emerald-400' }
  ];

  // Container styling depending on active view mode and theme
  const getContainerClasses = () => {
    switch (viewMode) {
      case 'sidebar':
        return 'fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[560px] lg:w-[620px] z-50 flex flex-col shadow-2xl border-l animate-in slide-in-from-right duration-300';
      case 'expanded':
        return 'fixed inset-2 sm:inset-6 z-50 flex flex-col rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200';
      case 'floating':
      default:
        return 'fixed bottom-20 right-4 sm:right-6 w-[95vw] sm:w-[540px] h-[720px] max-h-[86vh] z-50 flex flex-col rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200';
    }
  };

  // Header background theme styles
  const getHeaderStyles = () => {
    switch (theme) {
      case 'light':
        return 'bg-white border-b border-slate-200 text-slate-900';
      case 'dark':
        return 'bg-slate-900/95 border-b border-slate-800 text-white';
      case 'emerald':
        return 'bg-gradient-to-r from-[#064e3b] via-[#043e2f] to-[#064e3b] border-b border-[#0f766e] text-white';
      case 'pdeu':
      default:
        return 'bg-gradient-to-r from-[#002b49] via-[#003865] to-[#002b49] border-b border-[#0c406b] text-white';
    }
  };

  const getContainerBackground = () => {
    switch (theme) {
      case 'light': return 'bg-slate-50 border-slate-300';
      case 'dark': return 'bg-[#090d16] border-slate-800';
      case 'emerald': return 'bg-[#031711] border-[#0f766e]';
      case 'pdeu': default: return 'bg-[#001728] border-[#0c406b]';
    }
  };

  return (
    <>
      {/* Backdrop overlay for Sidebar mode on mobile screens */}
      {isAiOpen && viewMode === 'sidebar' && (
        <div
          onClick={() => setIsAiOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm sm:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {!isAiOpen && (
          <div className="hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-md hover:bg-orange-50 text-slate-900 pl-4 pr-3 py-2 rounded-full shadow-xl border border-slate-200 hover:border-[#e87722] text-xs font-bold transition-all hover:scale-105 group">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping mr-1" />
            <span className="text-[#002b49] group-hover:text-[#e87722]">Ask Anveshan AI</span>
            
            {/* Quick Mode Button in Pill */}
            <button
              onClick={() => {
                setViewMode('sidebar');
                setIsAiOpen(true);
              }}
              className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-[#e87722] hover:text-white text-[10px] font-mono text-slate-600 transition-colors"
              title="Open directly in right docked sidebar"
            >
              Sidebar 📌
            </button>
          </div>
        )}

        {/* Main Floating Bubble Toggle */}
        <button
          onClick={toggleAi}
          className={`relative group p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-2 ring-4 ${
            isAiOpen
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-white ring-rose-500/30'
              : 'bg-gradient-to-r from-[#002b49] to-[#0c406b] hover:from-[#e87722] hover:to-[#f37021] text-white border-white ring-[#e87722]/30'
          }`}
          title={isAiOpen ? 'Close Anveshan Assistant' : 'Open Anveshan AI Assistant'}
          aria-label="Toggle Anveshan AI Assistant"
        >
          {isAiOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e87722]"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Main AI Window / Sidebar Drawer */}
      {isAiOpen && (
        <div className={`${getContainerClasses()} ${getContainerBackground()}`}>
          {/* Top Assistant Navigation & Controls Bar */}
          <div className={`p-3.5 sm:p-4 ${getHeaderStyles()} flex items-center justify-between gap-2 shadow-sm shrink-0`}>
            {/* Identity & Status */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#e87722] flex items-center justify-center font-bold text-white shadow-md shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-wide truncate">ANVESHAN AI</h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-medium shrink-0">
                    PDEU Copilot
                  </span>
                </div>
                <div className="text-[11px] opacity-80 flex items-center gap-1.5 mt-0.5 truncate">
                  {!isGuest && user ? (
                    <span className="flex items-center gap-1 font-medium truncate">
                      <GraduationCap className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{user.profile?.roll_number || user.full_name}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 opacity-60 shrink-0" />
                      <span>Guest Mode • </span>
                      <Link href="/login" className="underline hover:text-white">
                        Sign In (@pdpu.ac.in)
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Controls: Theme Picker & View Mode Switcher */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Theme Dropdown / Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-black/15 hover:bg-black/25 text-xs font-medium flex items-center gap-1.5 transition-all border border-white/10"
                  title="Switch Color Theme"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline capitalize text-[11px] font-semibold">{theme}</span>
                </button>

                {showThemeMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 text-xs space-y-1 animate-in fade-in slide-in-from-top-1 text-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Choose AI Theme
                    </div>
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setTheme(opt.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all text-left ${
                          theme === opt.id
                            ? 'bg-[#e87722] text-white font-bold shadow-sm'
                            : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </div>
                        <span className={`w-3 h-3 rounded-full border-2 ${opt.previewClass}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode Toggle: Sidebar 📌 vs Floating 🪟 vs Fullscreen ⛶ */}
              <div className="hidden sm:flex items-center bg-black/15 rounded-lg p-0.5 border border-white/10 text-xs">
                <button
                  onClick={() => setViewMode('sidebar')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'sidebar'
                      ? 'bg-[#e87722] text-white font-bold shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:bg-white/10'
                  }`}
                  title="Dock to Right Sidebar"
                >
                  <PanelRightOpen className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setViewMode('floating')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'floating'
                      ? 'bg-[#e87722] text-white font-bold shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:bg-white/10'
                  }`}
                  title="Floating Card Mode"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setViewMode(viewMode === 'expanded' ? 'sidebar' : 'expanded')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'expanded'
                      ? 'bg-[#e87722] text-white font-bold shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:bg-white/10'
                  }`}
                  title={viewMode === 'expanded' ? 'Restore View' : 'Maximize Fullscreen'}
                >
                  {viewMode === 'expanded' ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsAiOpen(false)}
                className="p-1.5 rounded-lg opacity-80 hover:opacity-100 hover:bg-white/15 transition-colors ml-1"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Chat Canvas */}
          <div className="flex-1 overflow-hidden flex flex-col p-2.5 sm:p-4">
            <AssistantChat />
          </div>
        </div>
      )}
    </>
  );
};
