'use client';

import React, { useState } from 'react';
import { Sparkles, X, MessageSquare, Maximize2, Minimize2, GraduationCap, User } from 'lucide-react';
import { AssistantChat } from './AssistantChat';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export const FloatingAssistant: React.FC = () => {
  const { activePersona, user, isGuest } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Floating Trigger Button (Bottom Right - The Single Access Point) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white hover:bg-orange-50 text-slate-900 px-4 py-2 rounded-full shadow-2xl border-2 border-[#e87722] text-xs font-bold transition-all hover:scale-105 group"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[#002b49] group-hover:text-[#e87722]">Ask Anveshan AI</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-[#002b49] to-[#0c406b] hover:from-[#e87722] hover:to-[#f37021] text-white shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white ring-4 ring-[#e87722]/30"
          title="Open Anveshan AI Assistant"
          aria-label="Toggle Anveshan AI Assistant"
        >
          {isOpen ? (
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

      {/* Floating Dialog / Slide-over Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 shadow-2xl overflow-hidden flex flex-col bg-slate-900 border border-slate-700 ${
            isExpanded
              ? 'inset-3 sm:inset-8 rounded-3xl'
              : 'bottom-20 right-4 sm:right-6 w-[95vw] sm:w-[540px] h-[680px] max-h-[85vh] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#002b49] via-[#003865] to-[#002b49] text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#e87722] flex items-center justify-center font-bold text-white shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-wide">ANVESHAN AI</h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-medium">
                    PDEU Assistant
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                  {!isGuest && user ? (
                    <span className="text-emerald-300 flex items-center gap-1 font-medium">
                      <GraduationCap className="w-3 h-3 text-emerald-400" />
                      {user.profile?.roll_number || user.full_name} ({user.profile?.batch ? `Batch ${user.profile.batch}` : 'PDEU'})
                    </span>
                  ) : (
                    <span className="text-slate-300 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Guest Mode •{' '}
                      <Link href="/login" className="text-amber-300 underline hover:text-white">
                        Sign In (@pdpu.ac.in)
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                title={isExpanded ? 'Restore' : 'Expand Fullscreen'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Assistant Chat Body */}
          <div className="flex-1 overflow-hidden p-3 sm:p-4 bg-slate-950 flex flex-col">
            <AssistantChat />
          </div>
        </div>
      )}
    </>
  );
};
