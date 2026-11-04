'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, CitationItem, UserContext, GeminiStatus } from '@/lib/types';
import {
  Sparkles, Send, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle,
  FileText, ExternalLink, Network, ArrowRight, CornerDownRight, ShieldAlert,
  GraduationCap, Clock, RefreshCw, ChevronDown, ChevronUp, Copy, Check, BookOpen,
  Globe, Eye, Key, Cpu, X, RotateCcw, User, Compass, HelpCircle as QuestionIcon,
  Award, Phone, Mail, MapPin, School, Minus, ChevronRight, CheckCheck
} from 'lucide-react';
import { EvidenceModal } from './EvidenceModal';
import { VisualReasoningGraph } from './VisualReasoningGraph';
import { askAnveshanQuery, getGeminiStatus, setGeminiApiKey } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTheme, AnveshanTheme } from '@/context/ThemeContext';
import { parsePDPUEmail } from '@/lib/emailParser';

interface AssistantChatProps {
  initialSuggested?: { category: string; text: string; description: string }[];
}

// Inline academic doodle background pattern
const AcademicDoodleBackground: React.FC<{ theme: AnveshanTheme }> = ({ theme }) => {
  const isCrimson = theme === 'crimson';
  const isLight = theme === 'light';
  // Subtle red lineart in crimson mode, amber in light, white in dark
  const strokeColor = isCrimson ? '%23ef4444' : isLight ? '%23b45309' : '%23ffffff';
  const opacity = isCrimson ? '0.025' : isLight ? '0.08' : '0.035';

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='${strokeColor}' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round' opacity='${opacity}'%3E%3Cpath d='M20 20 L35 15 L50 20 L35 25 Z M35 25 L35 34'/%3E%3Cpath d='M85 20 Q95 15 105 20 L105 35 Q95 30 85 35 Z'/%3E%3Ccircle cx='25' cy='85' r='8'/%3E%3Cpath d='M25 70 L25 77 M25 93 L25 100 M10 85 L17 85 M33 85 L40 85'/%3E%3Cpath d='M80 80 L95 95 M80 95 L95 80'/%3E%3Cpath d='M60 40 L60 55 M52 48 L68 48'/%3E%3Cpath d='M10 50 L20 45 L30 50 L20 55 Z'/%3E%3Cpath d='M85 55 A8 8 0 0 1 95 65 A8 8 0 0 1 85 75'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }}
    />
  );
};

// Inline formatting helper for **bold** and `code` with theme awareness
function renderInlineFormatting(text: string, theme: AnveshanTheme) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  const isCrimson = theme === 'crimson';
  const isLight = theme === 'light';

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong
          key={i}
          className={`font-bold ${
            isCrimson ? 'text-red-950 font-extrabold' : isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeStyle =
        isCrimson
          ? 'bg-red-50 text-red-800 border border-red-200 font-semibold'
          : isLight
          ? 'bg-amber-100 text-amber-900 font-semibold'
          : theme === 'emerald'
          ? 'bg-[#064132] text-emerald-300'
          : theme === 'pdeu'
          ? 'bg-[#002b49] text-amber-300 border border-[#0f4c75]'
          : 'bg-slate-800 text-amber-300';

      return (
        <code key={i} className={`${codeStyle} px-1.5 py-0.5 rounded font-mono text-[11px]`}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Formatted markdown renderer component with theme support
const FormattedText: React.FC<{ content: string; theme: AnveshanTheme }> = ({ content, theme }) => {
  if (!content) return null;
  const lines = content.split('\n');
  const isCrimson = theme === 'crimson';
  const isLight = theme === 'light';

  return (
    <div className={`space-y-2 text-xs leading-relaxed ${isCrimson ? 'text-slate-900' : isLight ? 'text-slate-800' : 'text-slate-200'}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ###
        if (trimmed.startsWith('### ')) {
          const headerColor =
            isCrimson
              ? 'text-red-700 border-red-200'
              : isLight
              ? 'text-[#002b49] border-slate-200'
              : theme === 'emerald'
              ? 'text-emerald-300 border-emerald-900/50'
              : theme === 'pdeu'
              ? 'text-amber-400 border-[#0c406b]'
              : 'text-amber-400 border-slate-800';

          return (
            <div key={idx} className={`pt-2.5 pb-1 border-t mt-3 first:mt-0 first:border-0 first:pt-0 ${headerColor}`}>
              <h4 className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <BookOpen className="w-3.5 h-3.5" />
                {trimmed.replace('### ', '')}
              </h4>
            </div>
          );
        }

        // Header ####
        if (trimmed.startsWith('#### ')) {
          return (
            <h5
              key={idx}
              className={`text-xs font-bold mt-2 mb-1 ${
                isCrimson ? 'text-red-800' : isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {trimmed.replace('#### ', '')}
            </h5>
          );
        }

        // Bullet points with emoji or dot
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[•\-\*]\s+/, '');
          const dotColor =
            isCrimson
              ? 'text-red-600'
              : isLight
              ? 'text-[#e87722]'
              : theme === 'emerald'
              ? 'text-emerald-400'
              : 'text-amber-400';

          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className={`${dotColor} font-bold shrink-0 mt-0.5`}>•</span>
              <div className={isCrimson ? 'text-slate-900' : isLight ? 'text-slate-800' : 'text-slate-200'}>
                {renderInlineFormatting(bulletText, theme)}
              </div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className={isCrimson ? 'text-slate-900 font-normal' : isLight ? 'text-slate-800' : 'text-slate-300'}>
            {renderInlineFormatting(trimmed, theme)}
          </p>
        );
      })}
    </div>
  );
};

export const AssistantChat: React.FC<AssistantChatProps> = ({ initialSuggested = [] }) => {
  const { user, token, activePersona } = useAuth();
  const { theme, setTheme } = useTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);
  const [expandedAudits, setExpandedAudits] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Student Profile / Lead Generation Intake Form Modal
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeForm, setIntakeForm] = useState({
    fullName: user?.full_name || 'Dhwani Vyas',
    email: user?.email || '23bcp116@sot.pdpu.ac.in',
    countryCode: '+91',
    mobile: '',
    discipline: 'School of Technology (SoT)',
    program: 'B.Tech Computer Science & Engineering',
    batch: '2027',
    state: 'Gujarat'
  });

  // Gemini Live NLP & API status
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatus | null>(null);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keySuccessMsg, setKeySuccessMsg] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    async function loadGemini() {
      const st = await getGeminiStatus();
      const localKey = typeof window !== 'undefined' ? localStorage.getItem('anveshan_gemini_key') : null;
      if (localKey && !st.active) {
        st.active = true;
      }
      setGeminiStatus(st);
      if (localKey) setGeminiKeyInput(localKey);
    }
    loadGemini();
  }, []);

  // Live Auto-Detection from PDPU student email in Intake Form
  const handleEmailChange = (val: string) => {
    const nextForm = { ...intakeForm, email: val };
    const parsed = parsePDPUEmail(val);
    if (parsed.isValid && parsed.isStudent) {
      if (parsed.school) nextForm.discipline = parsed.school;
      if (parsed.degree && parsed.program) nextForm.program = `${parsed.degree} ${parsed.program}`;
      if (parsed.batch) nextForm.batch = parsed.batch;
    }
    setIntakeForm(nextForm);
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiKeyInput.trim()) return;
    setSavingKey(true);
    setKeySuccessMsg('');
    try {
      await setGeminiApiKey(geminiKeyInput);
      setGeminiStatus(prev => prev ? { ...prev, active: true } : { active: true, model: 'gemini-2.0-flash', provider: 'gemini', nlp_engine: 'Google Gemini 2.0 Flash' });
      setKeySuccessMsg('Gemini API key activated for NLP query parsing & grounded reasoning!');
      setTimeout(() => {
        setShowGeminiModal(false);
        setKeySuccessMsg('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to save Gemini key');
    } finally {
      setSavingKey(false);
    }
  };

  const toggleAudit = (id: string) => {
    setExpandedAudits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (confirm('Start a fresh conversation? This clears current messages in this view.')) {
      setMessages([]);
    }
  };

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const response = await askAnveshanQuery(
        q,
        token || undefined,
        intakeForm.batch || (activePersona?.batch !== 'N/A' ? activePersona?.batch : undefined),
        activePersona?.semester || undefined
      );

      const assistantMessage: ChatMessage = {
        id: response.message_id || `asst_${Date.now()}`,
        sender: 'assistant',
        content: response.direct_answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: response.status,
        direct_answer: response.direct_answer,
        explanation: response.explanation,
        user_context: response.user_context,
        citations: response.citations,
        graph_traversal: response.graph_traversal,
        conflicts: response.conflicts,
        related_actions: response.related_actions,
        latency_ms: response.latency_ms,
        model_used: response.model_used,
        nlp_intent: response.nlp_intent
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          content: 'I encountered an issue verifying official records. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'INSUFFICIENT_EVIDENCE',
          direct_answer: 'Unable to connect to PDEU Grounded Engine. Please check your network or try again shortly.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isCrimson = theme === 'crimson';
  const isLight = theme === 'light';
  const isDark = theme === 'dark';
  const isEmerald = theme === 'emerald';
  const isPdeu = theme === 'pdeu';

  // Dynamic Theme Colors - Default Red & White with Crisp Pure White Background
  const containerBg = isCrimson
    ? 'bg-white text-slate-900'
    : isLight
    ? 'bg-[#fbf7ee] text-slate-800'
    : isDark
    ? 'bg-[#090d16] text-slate-100'
    : isEmerald
    ? 'bg-[#031711] text-emerald-100'
    : 'bg-[#001728] text-slate-100';

  const botBubbleStyle = isCrimson
    ? 'bg-white border-2 border-red-100 shadow-sm text-slate-900 border-l-4 border-l-red-600'
    : isLight
    ? 'bg-[#fef9eb] border border-[#fde68a] text-slate-900 shadow-sm'
    : isDark
    ? 'bg-[#0f172a] border border-slate-800 text-slate-100 shadow-md'
    : isEmerald
    ? 'bg-[#063327] border border-[#0e5c47] text-emerald-100 shadow-md'
    : 'bg-[#00223d] border border-[#0c406b] text-slate-100 shadow-md';

  const userBubbleStyle = isCrimson
    ? 'bg-[#dc2626] text-white shadow-md'
    : isLight
    ? 'bg-gradient-to-r from-[#002b49] to-[#003865] text-white shadow-md'
    : 'bg-gradient-to-r from-[#e87722] to-[#f37021] text-white shadow-md';

  const inputContainerStyle = isCrimson
    ? 'bg-white border-2 border-red-200 focus-within:border-red-600 shadow-md text-slate-900'
    : isLight
    ? 'bg-white border-amber-300/80 shadow-md focus-within:border-[#e87722] text-slate-900'
    : isDark
    ? 'bg-slate-900/90 border-slate-700 focus-within:border-amber-400 text-white'
    : isEmerald
    ? 'bg-[#052b21] border-[#0d5945] focus-within:border-emerald-400 text-white'
    : 'bg-[#002036] border-[#0c406b] focus-within:border-[#e87722] text-white';

  return (
    <div className={`relative flex flex-col h-full w-full justify-between overflow-hidden ${containerBg}`}>
      {/* 1. Academic Doodle Watermark Wallpaper */}
      <AcademicDoodleBackground theme={theme} />

      {/* 2. Top Student Persona & Quick Configuration Banner */}
      <div className={`relative z-10 px-3.5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs backdrop-blur-md ${
        isCrimson
          ? 'bg-white/95 border-red-100 text-slate-800 shadow-xs'
          : isLight
          ? 'bg-white/90 border-amber-200/60'
          : 'bg-black/25 border-white/10'
      }`}>
        {/* Persona Pill */}
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold shrink-0 ${
            isCrimson
              ? 'bg-red-50 border border-red-200 text-red-600'
              : 'bg-[#e87722]/15 border border-[#e87722]/30 text-[#e87722]'
          }`}>
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs truncate flex items-center gap-1.5">
              <span>{intakeForm.fullName}</span>
              <span className="opacity-40">•</span>
              <span className={`font-mono text-[11px] font-bold ${isCrimson ? 'text-red-600' : 'text-[#e87722]'}`}>
                {intakeForm.batch ? `Batch ${intakeForm.batch}` : 'Batch 2027'}
              </span>
            </div>
            <div className="text-[10px] opacity-70 truncate">
              {intakeForm.program}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Intake / Personalize Profile Button */}
          <button
            onClick={() => setShowIntakeModal(true)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
              isCrimson
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                : isLight
                ? 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            }`}
            title="Update Student Profile & Discipline"
          >
            <span>Personalize</span>
            <span>✏️</span>
          </button>

          {/* Gemini NLP Live Indicator */}
          <button
            onClick={() => setShowGeminiModal(true)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
              geminiStatus?.active
                ? isCrimson
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : isCrimson
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
            }`}
            title="Configure Google Gemini Live NLP API"
          >
            <Sparkles className={`w-3.5 h-3.5 ${geminiStatus?.active ? 'text-emerald-600' : isCrimson ? 'text-red-600' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">{geminiStatus?.active ? 'Gemini 2.0 Active' : 'Setup Gemini'}</span>
          </button>

          {/* Clear Chat */}
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className={`p-1 px-2 rounded-lg border transition-colors text-[11px] flex items-center gap-1 ${
                isCrimson
                  ? 'border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-700'
                  : 'border-slate-700/40 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400'
              }`}
              title="Clear Conversation History"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Messages Scroll Thread */}
      <div className="relative z-10 flex-1 overflow-y-auto space-y-4 px-3 sm:px-4 py-3 min-h-0 pr-2">
        {/* Welcome Hero Accolades Banner */}
        <div className="space-y-3 pt-1">
          {/* Accolades Banner Graphic */}
          <div className={`p-4 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
            isCrimson
              ? 'bg-gradient-to-br from-white via-red-50/40 to-white border-2 border-red-200 text-slate-900'
              : isLight
              ? 'bg-gradient-to-br from-white via-amber-50/50 to-orange-50/40 border-amber-200/80 text-slate-900'
              : 'bg-gradient-to-br from-[#002b49]/90 via-[#001f35]/95 to-[#001220] border-[#0c406b] text-white'
          }`}>
            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              {/* Crest Badge */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-700 via-rose-600 to-amber-500 p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[14px] flex flex-col items-center justify-center border border-red-200">
                  <span className="font-serif font-black text-red-700 text-xl leading-none">P</span>
                  <span className="text-[8px] font-sans font-bold text-red-600 tracking-widest uppercase">PDEU</span>
                </div>
              </div>

              {/* Title & Accolades */}
              <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase">
                    NAAC A++ (CGPA 3.52)
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isCrimson
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : isLight
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-black/30 text-amber-300 border-white/10'
                  }`}>
                    NIRF Top Ranked Technical University
                  </span>
                </div>
                <h4 className="font-serif font-black text-sm sm:text-base tracking-tight text-red-900">
                  PANDIT DEENDAYAL ENERGY UNIVERSITY
                </h4>
                <p className="text-[11px] opacity-80 line-clamp-2">
                  Recognized by UGC • Schools: Technology (SoT), Energy (SoET), Management (SoM), Liberal Studies (SLS)
                </p>
              </div>

              {/* Package Badge */}
              <div className="shrink-0 text-center sm:text-right hidden md:block">
                <div className="text-sm font-extrabold text-red-600">₹42.00 LPA</div>
                <div className="text-[10px] opacity-70 font-medium">Highest CTC</div>
              </div>
            </div>
          </div>

          {/* Assistant Welcome Speech Bubble */}
          <div className="flex items-start gap-2.5 max-w-xl">
            {/* PDEU Avatar */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-700 to-rose-600 p-0.5 shadow-sm shrink-0 flex items-center justify-center mt-1">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-red-700 font-serif font-black text-xs border border-red-100">
                P
              </div>
            </div>

            {/* Bubble */}
            <div className={`p-4 rounded-3xl rounded-tl-sm space-y-2.5 shadow-sm border ${botBubbleStyle}`}>
              <div className="text-xs sm:text-sm leading-relaxed font-normal">
                Hello and welcome to <strong>Pandit Deendayal Energy University (PDEU)</strong>. I am <strong>Anveshan</strong>, your official academic assistant. Ask me anything regarding <strong>B.Tech curricula</strong>, <strong>fees & scholarships</strong>, <strong>faculty</strong>, <strong>Raisan campus hostels</strong>, or <strong>placements</strong>.
              </div>

              <div className="flex items-center justify-between text-[10px] opacity-60 pt-1 border-t border-red-100">
                <span className="font-semibold text-red-700 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                  Grounded on Official PDEU Handbooks
                </span>
                <span>Raisan Campus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation History Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {/* User Message (Right Aligned Red Bubble with Crisp White Text) */}
            {msg.sender === 'user' && (
              <div className="flex justify-end items-end gap-2 pl-8">
                <div className={`p-3.5 sm:px-4 sm:py-3 rounded-3xl rounded-tr-sm max-w-lg space-y-1 shadow-md ${userBubbleStyle}`}>
                  <div className="text-xs sm:text-sm font-medium leading-relaxed text-white">
                    {msg.content}
                  </div>
                  <div className="text-[10px] text-white/80 text-right font-mono">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            )}

            {/* Assistant Message (Left Aligned White Card with Red Accents & Clickable Option Chips) */}
            {msg.sender === 'assistant' && (
              <div className="flex items-start gap-2.5 max-w-2xl pr-4">
                {/* Avatar Badge */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-700 to-rose-600 p-0.5 shadow-sm shrink-0 flex items-center justify-center mt-1">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-red-700 font-serif font-black text-xs border border-red-100">
                    P
                  </div>
                </div>

                {/* Message Body Card */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className={`p-4 rounded-3xl rounded-tl-sm space-y-3 shadow-md border ${botBubbleStyle}`}>
                    {/* Direct Grounded Answer */}
                    <div className="text-xs sm:text-sm leading-relaxed">
                      <FormattedText content={msg.direct_answer || msg.content} theme={theme} />
                    </div>

                    {/* Timestamp & Verification Footer */}
                    <div className="flex items-center justify-between text-[10px] opacity-65 pt-1.5 border-t border-red-100">
                      <div className="flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-red-700">Authoritative PDEU Record</span>
                        {msg.latency_ms && (
                          <span className="opacity-60">• {msg.latency_ms.toFixed(0)} ms</span>
                        )}
                      </div>
                      <span className="font-mono text-slate-500">{msg.timestamp}</span>
                    </div>

                    {/* Collapsible Verification Audit & Graph hop inspector */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleAudit(msg.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl border transition-colors text-[11px] font-semibold ${
                          isCrimson
                            ? 'bg-red-50/60 hover:bg-red-100/70 border-red-200 text-red-900'
                            : isLight
                            ? 'bg-amber-100/50 hover:bg-amber-100 border-amber-300/60 text-slate-800'
                            : 'bg-black/25 hover:bg-black/40 border-white/10 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Network className="w-3 h-3 text-red-600" />
                          <span>Show Evidence Citations & Reasoning Steps</span>
                          {msg.citations && msg.citations.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-bold">
                              {msg.citations.length} docs
                            </span>
                          )}
                        </div>
                        {expandedAudits[msg.id] ? (
                          <ChevronUp className="w-3.5 h-3.5 opacity-60" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        )}
                      </button>

                      {expandedAudits[msg.id] && (
                        <div className={`mt-2 p-3 rounded-2xl border space-y-3 animate-in fade-in duration-150 ${
                          isCrimson
                            ? 'bg-red-50/30 border-red-200'
                            : isLight
                            ? 'bg-white border-amber-200'
                            : 'bg-black/30 border-white/10'
                        }`}>
                          {/* Explanatory Academic Context */}
                          {msg.explanation && (
                            <div className="space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-red-800">
                                Official Curricular Breakdown:
                              </div>
                              <FormattedText content={msg.explanation} theme={theme} />
                            </div>
                          )}

                          {/* Visual Graph Steps */}
                          {msg.graph_traversal && msg.graph_traversal.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-red-200">
                              <VisualReasoningGraph steps={msg.graph_traversal} />
                            </div>
                          )}

                          {/* Official Document Sources */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-red-200">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-red-800">
                                Verified Handbooks & Circulars ({msg.citations.length})
                              </div>
                              <div className="grid grid-cols-1 gap-1.5">
                                {msg.citations.map((cit) => {
                                  const isPdf = cit.source_url?.toLowerCase().includes('.pdf');
                                  const targetHref = isPdf && cit.source_url
                                    ? `${cit.source_url}#page=${cit.page_number || 1}&view=FitH`
                                    : cit.source_url || '#';

                                  return (
                                    <div
                                      key={cit.citation_id}
                                      className="p-2 rounded-xl border flex items-center justify-between gap-2 bg-white border-red-200"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                          {isPdf ? (
                                            <FileText className="w-3 h-3 text-red-600 shrink-0" />
                                          ) : (
                                            <Globe className="w-3 h-3 text-blue-600 shrink-0" />
                                          )}
                                          <span className="font-bold text-xs truncate text-slate-900">
                                            {cit.document_title}
                                          </span>
                                        </div>
                                        <p className="text-[10px] opacity-70 italic truncate pl-4 text-slate-700">
                                          "{cit.snippet}"
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          onClick={() => setActiveCitation(cit)}
                                          className="px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold transition-all"
                                        >
                                          Preview
                                        </button>
                                        {cit.source_url && (
                                          <a
                                            href={targetHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2 py-0.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-[10px] font-bold transition-all"
                                          >
                                            Open ↗
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Quick-Reply Option Chips (Red & White Pill Buttons) */}
                  {msg.related_actions && msg.related_actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 pl-1">
                      {msg.related_actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSend(act)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                            isCrimson
                              ? 'bg-white hover:bg-red-600 text-red-600 hover:text-white border-2 border-red-500 shadow-red-100'
                              : isLight
                              ? 'bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] border border-[#f59e0b]/50 shadow-amber-200/50'
                              : isEmerald
                              ? 'bg-[#064e3b]/80 hover:bg-[#065f46] text-emerald-200 border border-emerald-500/40'
                              : isPdeu
                              ? 'bg-[#e87722]/20 hover:bg-[#e87722]/35 text-amber-300 border border-[#e87722]/50'
                              : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          <span>{act}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Spinner Indicator */}
        {loading && (
          <div className="flex items-center gap-2.5 p-4 rounded-3xl border shadow-sm max-w-sm animate-pulse text-xs ml-10 border-red-200 bg-red-50 text-red-900 font-semibold">
            <RefreshCw className="w-4 h-4 text-red-600 animate-spin shrink-0" />
            <div>
              Verifying official PDEU records & handbooks...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Bottom Controls: Quick Chips + Pill Input + Footer Branding */}
      <div className="relative z-10 px-3.5 sm:px-4 pb-3 pt-1 shrink-0 space-y-2 bg-white">
        {/* Quick Follow-up Question Pills above input */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-[11px] shrink-0">
          <button
            onClick={() => handleSend('What is the official PDEU tuition fee and institutional fee structure for B.Tech and MBA?')}
            className={`px-3 py-1 rounded-full border shrink-0 transition-all font-semibold flex items-center gap-1 hover:scale-105 ${
              isCrimson
                ? 'bg-white hover:bg-red-50 border-red-200 text-red-700 shadow-xs'
                : isLight
                ? 'bg-white hover:bg-amber-50 border-amber-300 text-slate-800'
                : 'bg-black/30 hover:bg-white/10 border-white/15 text-slate-200'
            }`}
          >
            <span>💰 PDEU Tuition Fees</span>
          </button>
          <button
            onClick={() => handleSend('What are the residential hostel options and mess charges on the Raisan PDEU campus?')}
            className={`px-3 py-1 rounded-full border shrink-0 transition-all font-semibold flex items-center gap-1 hover:scale-105 ${
              isCrimson
                ? 'bg-white hover:bg-red-50 border-red-200 text-red-700 shadow-xs'
                : isLight
                ? 'bg-white hover:bg-amber-50 border-amber-300 text-slate-800'
                : 'bg-black/30 hover:bg-white/10 border-white/15 text-slate-200'
            }`}
          >
            <span>🏠 Raisan Hostel & Mess</span>
          </button>
          <button
            onClick={() => handleSend('What scholarships are offered for ACPC and JEE Main rankers at PDEU?')}
            className={`px-3 py-1 rounded-full border shrink-0 transition-all font-semibold flex items-center gap-1 hover:scale-105 ${
              isCrimson
                ? 'bg-white hover:bg-red-50 border-red-200 text-red-700 shadow-xs'
                : isLight
                ? 'bg-white hover:bg-amber-50 border-amber-300 text-slate-800'
                : 'bg-black/30 hover:bg-white/10 border-white/15 text-slate-200'
            }`}
          >
            <span>🎖️ Merit Scholarships</span>
          </button>
          <button
            onClick={() => handleSend('What are the 1st year foundation courses for B.Tech Computer Engineering at PDEU?')}
            className={`px-3 py-1 rounded-full border shrink-0 transition-all font-semibold flex items-center gap-1 hover:scale-105 ${
              isCrimson
                ? 'bg-white hover:bg-red-50 border-red-200 text-red-700 shadow-xs'
                : isLight
                ? 'bg-white hover:bg-amber-50 border-amber-300 text-slate-800'
                : 'bg-black/30 hover:bg-white/10 border-white/15 text-slate-200'
            }`}
          >
            <span>📚 1st Year Syllabus (160 Credits)</span>
          </button>
          <button
            onClick={() => handleSend('give details of proffesor sidheshwar routray')}
            className={`px-3 py-1 rounded-full border shrink-0 transition-all font-semibold flex items-center gap-1 hover:scale-105 ${
              isCrimson
                ? 'bg-white hover:bg-red-50 border-red-200 text-red-700 shadow-xs'
                : isLight
                ? 'bg-white hover:bg-amber-50 border-amber-300 text-slate-800'
                : 'bg-black/30 hover:bg-white/10 border-white/15 text-slate-200'
            }`}
          >
            <span>👨‍🏫 Dr. Sidheswar Routray</span>
          </button>
          <button
            onClick={() => handleSend('What is the highest and average placement package at PDEU, and top recruiters?')}
            className={`px-3 py-1 rounded-full border shrink-0 transition-all font-semibold flex items-center gap-1 hover:scale-105 ${
              isCrimson
                ? 'bg-white hover:bg-red-50 border-red-200 text-red-700 shadow-xs'
                : isLight
                ? 'bg-white hover:bg-amber-50 border-amber-300 text-slate-800'
                : 'bg-black/30 hover:bg-white/10 border-white/15 text-slate-200'
            }`}
          >
            <span>💼 ₹42 LPA Placements</span>
          </button>
        </div>

        {/* Pill-Shaped Input Container with Circular Send Button */}
        <div className={`rounded-full p-1.5 pl-4 flex items-center gap-2 shadow-sm border transition-all ${inputContainerStyle}`}>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message about PDEU..."
            className="flex-1 bg-transparent py-2 text-xs sm:text-sm focus:outline-none font-medium text-slate-900 placeholder-slate-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 hover:scale-105 active:scale-95 disabled:opacity-40 text-white ${
              isCrimson
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
                : 'bg-gradient-to-r from-[#e87722] to-[#f37021] hover:from-[#d96711] hover:to-[#e87722]'
            }`}
            title="Send query"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* Footer Branding */}
        <div className="text-center pt-1.5 text-[10px] tracking-wide opacity-70 font-semibold uppercase flex items-center justify-center gap-1.5 text-slate-500">
          <span>powered by</span>
          <span className="font-extrabold text-red-600 tracking-wider">ANVESHAN AI</span>
          <span>•</span>
          <span>Pandit Deendayal Energy University</span>
        </div>
      </div>

      {/* Student Profile / Lead Generation Intake Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-red-200 space-y-4">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center font-bold mb-2 border border-red-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Welcome to PDEU Copilot</h3>
              <p className="text-xs text-slate-500">
                Please share your academic details to personalize your grounded curriculum experience
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              {/* Full Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={intakeForm.fullName}
                  onChange={(e) => setIntakeForm({ ...intakeForm, fullName: e.target.value })}
                  placeholder="e.g. Dhwani Vyas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:outline-none text-slate-900"
                />
              </div>

              {/* Email Address with live PDPU parser */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">College Email Address (@pdpu.ac.in)</label>
                <input
                  type="email"
                  value={intakeForm.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="e.g. 23bcp116@sot.pdpu.ac.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:outline-none text-slate-900 font-mono text-xs"
                />
                {intakeForm.email.includes('@') && parsePDPUEmail(intakeForm.email).isValid && (
                  <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>PDEU Student Detected: {intakeForm.program} • Batch {intakeForm.batch}</span>
                  </div>
                )}
              </div>

              {/* Mobile Number with +91 Country selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-red-600">
                  <div className="bg-slate-100 px-3 py-2.5 font-bold text-slate-700 flex items-center gap-1 border-r border-slate-300 text-xs shrink-0">
                    <span>IN +91</span>
                  </div>
                  <input
                    type="tel"
                    value={intakeForm.mobile}
                    onChange={(e) => setIntakeForm({ ...intakeForm, mobile: e.target.value })}
                    placeholder="98765 43210"
                    className="flex-1 px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Discipline / School Dropdown */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">School / Faculty</label>
                <select
                  value={intakeForm.discipline}
                  onChange={(e) => setIntakeForm({ ...intakeForm, discipline: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:outline-none bg-white text-slate-800"
                >
                  <option value="School of Technology (SoT)">School of Technology (SoT)</option>
                  <option value="School of Energy Technology (SoET)">School of Energy Technology (SoET)</option>
                  <option value="School of Management (SoM)">School of Management (SoM)</option>
                  <option value="School of Liberal Studies (SLS)">School of Liberal Studies (SLS)</option>
                </select>
              </div>

              {/* Program Dropdown */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Program of Study</label>
                <select
                  value={intakeForm.program}
                  onChange={(e) => setIntakeForm({ ...intakeForm, program: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:outline-none bg-white text-slate-800"
                >
                  <option value="B.Tech. Computer Engineering">B.Tech. Computer Engineering (CSE)</option>
                  <option value="B.Tech. Information and Communication Technology(ICT)">B.Tech. Information & Communication Technology (ICT)</option>
                  <option value="B.Tech. Computer Science and Business Systems">B.Tech. Computer Science & Business Systems (CSBS)</option>
                  <option value="B.Tech. Chemical Engineering">B.Tech. Chemical Engineering</option>
                  <option value="B.Tech. Petroleum Engineering">B.Tech. Petroleum Engineering</option>
                  <option value="B.Tech. Mechanical Engineering">B.Tech. Mechanical Engineering</option>
                  <option value="B.Tech. Civil Engineering">B.Tech. Civil Engineering</option>
                  <option value="B.Tech. Electrical Engineering">B.Tech. Electrical Engineering</option>
                  <option value="B.Tech. Biotechnology">B.Tech. Biotechnology</option>
                  <option value="Master of Business Administration">Master of Business Administration (MBA)</option>
                  <option value="B.Com (Hons.)">B.Com (Hons.)</option>
                  <option value="B.A/B.B.A( Hons.)">B.A. / B.B.A. (Hons.)</option>
                  <option value="B.Sc.(Hons.) Data Science">B.Sc. (Hons.) Data Science</option>
                </select>
              </div>

              {/* State Dropdown */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Admission Category / State</label>
                <select
                  value={intakeForm.state}
                  onChange={(e) => setIntakeForm({ ...intakeForm, state: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:outline-none bg-white text-slate-800"
                >
                  <option value="Gujarat">Gujarat (50% ACPC Quota)</option>
                  <option value="All India JEE">All India (50% JEE Main CRL Quota)</option>
                  <option value="NRI / NRI Sponsored">NRI / NRI Sponsored (15% Supernumerary)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIntakeModal(false)}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02]"
              >
                Start Chatting →
              </button>
              <button
                type="button"
                onClick={() => setShowIntakeModal(false)}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Continue as Student / Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Modal with Embedded PDF / Page Preview */}
      <EvidenceModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      {/* Google Gemini API Key Configuration Modal */}
      {showGeminiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Google Gemini API Configuration</h3>
                  <span className="text-[11px] text-slate-400">Live NLP & Intent Expansion</span>
                </div>
              </div>
              <button
                onClick={() => setShowGeminiModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2.5">
              <p className="leading-relaxed">
                Connect your Google Gemini API key to enable <strong>Gemini 2.0 Flash</strong> for real-time query parsing, typo correction, and grounded reasoning.
              </p>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] space-y-1">
                <span className="font-bold text-amber-300 block">Get your free Gemini API key:</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Google AI Studio Key Generator</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {keySuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{keySuccessMsg}</span>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-300 block">Gemini API Key</label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 focus-within:border-red-500 transition-all">
                <Key className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="bg-transparent flex-1 text-white font-mono text-xs focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowGeminiModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-medium text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!geminiKeyInput.trim() || savingKey}
                onClick={handleSaveGeminiKey}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>{savingKey ? 'Activating...' : 'Save & Activate'}</span>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
