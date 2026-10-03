'use client';

import React, { useState } from 'react';
import { Sparkles, X, MessageSquare, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { AssistantChat } from './AssistantChat';
import Link from 'next/link';

export const FloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-white text-slate-800 px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200 text-xs font-semibold animate-bounce duration-1000">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Ask Anveshan AI</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-[#002b49] to-[#0c406b] hover:from-[#e87722] hover:to-[#f37021] text-white shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white"
          title="Open Anveshan AI Assistant"
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
              ? 'inset-4 sm:inset-10 rounded-2xl'
              : 'bottom-20 right-4 sm:right-6 w-[95vw] sm:w-[480px] h-[640px] max-h-[85vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#002b49] via-[#003865] to-[#002b49] text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#e87722] flex items-center justify-center font-bold text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-wide">ANVESHAN</h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-medium">
                    PDEU Layer
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Connected Organizational Knowledge & Decision Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/assistant"
                target="_blank"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Open Fullscreen Page"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                title={isExpanded ? 'Restore' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assistant Chat Body */}
          <div className="flex-1 overflow-hidden p-4 bg-slate-950 flex flex-col">
            <AssistantChat />
          </div>
        </div>
      )}
    </>
  );
};
