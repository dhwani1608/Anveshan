'use client';

import React, { useState } from 'react';
import {
  Sparkles, X, MessageSquare, Maximize2, Minimize2, GraduationCap,
  User, PanelRightClose, PanelRightOpen, Sun, Moon, Palette,
  RotateCcw, SlidersHorizontal, ChevronRight, Compass, Minus, CheckCircle2
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
    { id: 'crimson', label: 'Red & White Academic', icon: '🔴', previewClass: 'bg-white border-red-600' },
    { id: 'light', label: 'Light Clean', icon: '☀️', previewClass: 'bg-white border-slate-300' },
    { id: 'pdeu', label: 'PDEU Heritage Navy', icon: '🏛️', previewClass: 'bg-[#002b49] border-[#e87722]' },
    { id: 'emerald', label: 'Emerald Sage', icon: '🌲', previewClass: 'bg-[#064e3b] border-emerald-400' },
    { id: 'dark', label: 'Dark Obsidian', icon: '🌙', previewClass: 'bg-slate-900 border-amber-400' }
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
      case 'crimson':
        return 'bg-gradient-to-r from-red-700 via-red-600 to-rose-700 border-b border-red-700 text-white';
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
      case 'crimson': return 'bg-white border-red-300 shadow-2xl';
      case 'light': return 'bg-white border-slate-300 shadow-2xl';
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
            <span className={theme === 'crimson' ? 'text-red-700 group-hover:text-red-800' : 'text-[#002b49] group-hover:text-[#e87722]'}>
              Ask PDEU Assistant
            </span>
            
            {/* Quick Mode Button in Pill */}
            <button
              onClick={() => {
                setViewMode('sidebar');
                setIsAiOpen(true);
              }}
              className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
                theme === 'crimson'
                  ? 'bg-red-50 hover:bg-red-600 hover:text-white text-red-700'
                  : 'bg-slate-100 hover:bg-[#e87722] hover:text-white text-slate-600'
              }`}
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
              ? 'bg-slate-900 hover:bg-black text-white border-white ring-slate-500/30'
              : theme === 'crimson'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-white ring-red-500/30'
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
          {/* Top Assistant Navigation Bar (Clean & uncluttered, matching university assistants) */}
          <div className="px-4 py-3 bg-red-600 text-white flex items-center justify-between shadow-sm shrink-0">
            {/* Identity & Status */}
            <div className="flex items-center gap-2.5 min-w-0">
              {/* PDEU Logo Badge */}
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-serif font-black text-red-700 text-base shadow-sm shrink-0">
                P
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold tracking-tight truncate">PDEU Assistant</h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <div className="text-[11px] font-medium text-red-100 flex items-center gap-1.5 opacity-90 truncate">
                  <span>Connected</span>
                </div>
              </div>
            </div>

            {/* Window Controls: Only Minimize & Close */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Minimize Button (Matching — in CU assistant) */}
              <button
                onClick={() => setIsAiOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Minimize Assistant"
                aria-label="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Close Button (Matching ✕ in CU assistant) */}
              <button
                onClick={() => setIsAiOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Assistant"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Chat Canvas Container */}
          <div className="flex-1 overflow-hidden flex flex-col relative bg-white">
            <AssistantChat />
          </div>
        </div>
      )}
    </>
  );
};
