'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserCheck, ChevronDown, Sparkles, GraduationCap, ShieldAlert } from 'lucide-react';

export const PersonaSwitcher: React.FC = () => {
  const { personas, activePersona, switchPersona, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs border border-amber-500/30 transition-all shadow-sm"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-400 font-medium">Cohort / Persona:</span>
        <span className="font-semibold text-amber-300">
          {activePersona ? `${activePersona.name} (${activePersona.batch !== 'N/A' ? `Batch ${activePersona.batch}` : 'Admin'})` : 'Select Persona'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Demo Persona Switcher
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
              Multi-Context Testing
            </span>
          </div>

          <div className="p-2 space-y-1">
            {personas.map((p) => {
              const isSelected = activePersona?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    switchPersona(p.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg transition-all flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'hover:bg-slate-800 border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-sm text-slate-100">
                      {p.role === 'admin' ? (
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                      )}
                      {p.name}
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                      p.role === 'admin' ? 'bg-rose-950/60 text-rose-300' : 'bg-slate-800 text-amber-300'
                    }`}>
                      {p.batch !== 'N/A' ? `Batch ${p.batch}` : 'Dean Admin'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Context instantly updates retrieval & graph</span>
            <span className="text-amber-400 font-medium">Live</span>
          </div>
        </div>
      )}
    </div>
  );
};
