'use client';

import React, { useState } from 'react';
import {
  Sparkles, X, Minus, MessageSquare, GraduationCap,
  User, CheckCircle2, RotateCcw
} from 'lucide-react';
import { AssistantChat } from './AssistantChat';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export const FloatingAssistant: React.FC = () => {
  const { user, isGuest } = useAuth();
  const {
    isAiOpen,
    setIsAiOpen,
    toggleAi
  } = useTheme();

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {!isAiOpen && (
          <div
            onClick={toggleAi}
            className="cursor-pointer hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md hover:bg-red-50 text-slate-900 pl-4 pr-3.5 py-2.5 rounded-full shadow-xl border border-slate-200 hover:border-red-500 text-xs font-bold transition-all hover:scale-105 group"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping mr-0.5" />
            <span className="text-red-700 font-extrabold group-hover:text-red-800">
              Ask PDEU Assistant
            </span>
          </div>
        )}

        {/* Main Floating Bubble Toggle */}
        <button
          onClick={toggleAi}
          className={`relative group p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-2 ring-4 ${
            isAiOpen
              ? 'bg-slate-900 hover:bg-black text-white border-white ring-slate-500/30'
              : 'bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-white ring-red-500/30'
          }`}
          title={isAiOpen ? 'Close PDEU Assistant' : 'Chat with PDEU Assistant'}
          aria-label="Toggle PDEU Assistant"
        >
          {isAiOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Floating Messenger Window (Floating, NOT covering full height, WhatsApp Messenger feel) */}
      {isAiOpen && (
        <div className="fixed bottom-20 right-3 sm:right-6 w-[94vw] sm:w-[420px] md:w-[440px] h-[580px] sm:h-[620px] max-h-[82vh] z-50 flex flex-col rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden bg-white animate-in zoom-in-95 duration-200">
          {/* WhatsApp-Style Top Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-red-700 via-red-600 to-rose-600 text-white flex items-center justify-between shadow-sm shrink-0">
            {/* Identity & Status */}
            <div className="flex items-center gap-3 min-w-0">
              {/* WhatsApp Profile Avatar */}
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-serif font-black text-red-700 text-lg shadow-sm border border-white/40 shrink-0">
                  P
                </div>
                {/* Active Green Dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white"></span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold tracking-tight truncate leading-tight">
                    PDEU Assistant
                  </h3>
                </div>
                <div className="text-[11px] font-medium text-red-100/90 flex items-center gap-1 truncate leading-tight mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                  <span>online • Gandhinagar Campus</span>
                </div>
              </div>
            </div>

            {/* Window Controls: Minimize & Close */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsAiOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                title="Minimize Assistant"
                aria-label="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAiOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                title="Close Assistant"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Chat Canvas Container */}
          <div className="flex-1 overflow-hidden flex flex-col relative bg-[#f8f9fa]">
            <AssistantChat />
          </div>
        </div>
      )}
    </>
  );
};
