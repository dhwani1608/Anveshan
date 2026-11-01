'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, CitationItem, UserContext, GeminiStatus } from '@/lib/types';
import {
  Sparkles, Send, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle,
  FileText, ExternalLink, Network, ArrowRight, CornerDownRight, ShieldAlert,
  GraduationCap, Clock, RefreshCw, ChevronDown, ChevronUp, Copy, Check, BookOpen,
  Globe, Eye, Key, Cpu, X, RotateCcw, User, Compass, HelpCircle as QuestionIcon
} from 'lucide-react';
import { EvidenceModal } from './EvidenceModal';
import { VisualReasoningGraph } from './VisualReasoningGraph';
import { askAnveshanQuery, getGeminiStatus, setGeminiApiKey } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTheme, AnveshanTheme } from '@/context/ThemeContext';

interface AssistantChatProps {
  initialSuggested?: { category: string; text: string; description: string }[];
}

// Inline formatting helper for **bold** and `code` with theme awareness
function renderInlineFormatting(text: string, theme: AnveshanTheme) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  const isLight = theme === 'light';

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong
          key={i}
          className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeStyle =
        theme === 'light'
          ? 'bg-slate-200 text-slate-800 font-semibold'
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
  const isLight = theme === 'light';

  return (
    <div className={`space-y-2 text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ###
        if (trimmed.startsWith('### ')) {
          const headerColor =
            theme === 'light'
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
                isLight ? 'text-slate-800' : 'text-white'
              }`}
            >
              {trimmed.replace('#### ', '')}
            </h5>
          );
        }

        // Bullet points
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[•\-\*]\s+/, '');
          const dotColor =
            theme === 'light'
              ? 'text-[#e87722]'
              : theme === 'emerald'
              ? 'text-emerald-400'
              : 'text-amber-400';

          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className={`${dotColor} font-bold shrink-0 mt-0.5`}>•</span>
              <div className={isLight ? 'text-slate-800' : 'text-slate-200'}>
                {renderInlineFormatting(bulletText, theme)}
              </div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className={isLight ? 'text-slate-700' : 'text-slate-300'}>
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

  const handleSaveGeminiKey = async () => {
    if (!geminiKeyInput.trim()) return;
    setSavingKey(true);
    setKeySuccessMsg('');
    try {
      await setGeminiApiKey(geminiKeyInput);
      setGeminiStatus(prev => prev ? { ...prev, active: true } : { active: true, model: 'gemini-2.0-flash', provider: 'gemini', nlp_engine: 'Google Gemini 2.0 Flash' });
      setKeySuccessMsg('Gemini API key activated for NLP query parsing & grounded generation!');
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
        activePersona?.batch !== 'N/A' ? activePersona?.batch : undefined,
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
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        content: `Error retrieving grounded answer: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'INSUFFICIENT_EVIDENCE',
        direct_answer: 'Unable to complete knowledge retrieval.',
        explanation: 'There was an issue communicating with the Anveshan reasoning engine. Please ensure the backend is running.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Popular starter prompts for instant access
  const quickPrompts = [
    { label: '👨‍🏫 Prof. Sidheswar Routray', query: 'give details of proffesor sidheshwar routray' },
    { label: '📚 B.Tech CSE Curriculum', query: 'show me the complete first year course structure for B.Tech Computer Engineering' },
    { label: '💼 Placement Packages', query: 'What is the highest and average placement package at PDEU, and top recruiters?' },
    { label: '⏱️ 80% vs 75% Attendance', query: 'What is the attendance requirement and hackathon concession at PDEU?' },
    { label: '🛡️ Anti-Ragging Policy', query: 'What is the anti-ragging policy at PDEU and the 24x7 helpline number?' }
  ];

  // Theme-aware style tokens
  const isLight = theme === 'light';
  const isDark = theme === 'dark';
  const isEmerald = theme === 'emerald';
  const isPdeu = theme === 'pdeu';

  const cardBg =
    isLight ? 'bg-white border-slate-200 text-slate-800' :
    isDark ? 'bg-slate-900 border-slate-800 text-slate-200' :
    isEmerald ? 'bg-[#052b21] border-[#0d5945] text-emerald-100' :
    'bg-[#032036] border-[#0c406b] text-slate-200';

  const cardHeaderBg =
    isLight ? 'bg-slate-100 border-slate-200 text-slate-900' :
    isDark ? 'bg-slate-850 border-slate-800 text-white' :
    isEmerald ? 'bg-[#06382b] border-[#0d5945] text-white' :
    'bg-[#002b49] border-[#0c406b] text-white';

  const directAnswerBoxStyle =
    isLight ? 'bg-amber-50/70 border-amber-200 border-l-4 border-l-[#e87722] text-slate-900' :
    isDark ? 'bg-slate-950/80 border-slate-800 border-l-4 border-l-amber-400 text-white' :
    isEmerald ? 'bg-[#031c15] border-[#0d5945] border-l-4 border-l-emerald-400 text-white' :
    'bg-[#001728] border-[#0c406b] border-l-4 border-l-[#e87722] text-white';

  const explanationBoxStyle =
    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' :
    isDark ? 'bg-slate-950/50 border-slate-800/80 text-slate-300' :
    isEmerald ? 'bg-[#031c15]/80 border-[#0d5945]/70 text-emerald-100' :
    'bg-[#001728]/70 border-[#0c406b]/80 text-slate-200';

  const userBubbleStyle =
    isLight ? 'bg-[#002b49] text-white' :
    isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' :
    isEmerald ? 'bg-emerald-600 text-white' :
    'bg-[#e87722] text-white font-semibold';

  const inputBarStyle =
    isLight ? 'bg-white border-2 border-slate-300 focus-within:border-[#e87722] text-slate-900' :
    isDark ? 'bg-slate-900 border-2 border-slate-800 focus-within:border-amber-400 text-white' :
    isEmerald ? 'bg-[#052b21] border-2 border-[#0d5945] focus-within:border-emerald-400 text-white' :
    'bg-[#032036] border-2 border-[#0c406b] focus-within:border-[#e87722] text-white';

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ANSWERED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            GROUNDED & VERIFIED
          </span>
        );
      case 'CONFLICT_DETECTED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            DISCREPANCY FLAGGED
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            INSUFFICIENT EVIDENCE (NO GUESSING)
          </span>
        );
      case 'PARTIALLY_ANSWERED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            PARTIALLY ANSWERED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full justify-between gap-3">
      {/* 1. Context & Active Persona Banner */}
      <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-sm transition-all ${cardBg}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#e87722]/15 border border-[#e87722]/30 text-[#e87722] flex items-center justify-center font-bold">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] opacity-70 block font-medium">Student Persona:</span>
            <div className="font-bold text-xs sm:text-sm">
              {activePersona?.name || 'Dhwani Vyas'} • {activePersona?.program || 'B.Tech CSE'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Gemini NLP Live Indicator */}
          <button
            onClick={() => setShowGeminiModal(true)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
              geminiStatus?.active
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
            }`}
            title="Configure Google Gemini Live NLP API"
          >
            <Sparkles className={`w-3.5 h-3.5 ${geminiStatus?.active ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{geminiStatus?.active ? 'Gemini 2.0 Active' : 'Setup Gemini API'}</span>
          </button>

          {/* Persona Pills */}
          <span className="px-2 py-0.8 rounded-lg border text-[11px] font-mono opacity-90 border-slate-700/50">
            Batch: {activePersona?.batch || '2027'}
          </span>
          <span className="px-2 py-0.8 rounded-lg border text-[11px] font-mono opacity-90 border-slate-700/50">
            Sem: {activePersona?.semester || 7}
          </span>

          {/* Reset / Clear Chat Button */}
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-1 px-2 rounded-lg border border-slate-700/50 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition-colors text-[11px] flex items-center gap-1"
              title="Clear Conversation History"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Messages Canvas Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2 min-h-0 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-6 sm:py-10 space-y-5">
            <div className="inline-flex p-3 rounded-2xl bg-[#e87722]/15 text-[#e87722] border border-[#e87722]/30 shadow-sm animate-bounce-slow">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5 px-3">
              <h3 className="text-lg sm:text-xl font-bold font-serif tracking-tight">
                Welcome to ANVESHAN at PDEU
              </h3>
              <p className="text-xs opacity-75 leading-relaxed font-normal">
                Ask authoritative questions about faculty, course curricula, prerequisites, placement CTC, exam eligibility, and circulars with verified citations.
              </p>
            </div>

            {/* Suggested Starter Topics */}
            <div className="max-w-xl mx-auto text-left space-y-2 pt-2 px-2">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 px-1">
                Popular inquiries to explore:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.query)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs group flex items-center justify-between gap-2 shadow-sm ${
                      isLight
                        ? 'bg-white hover:bg-orange-50/70 border-slate-200 hover:border-[#e87722]/50 text-slate-800'
                        : isDark
                        ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-amber-400/40 text-slate-200'
                        : isEmerald
                        ? 'bg-[#052b21] hover:bg-[#083d2f] border-[#0d5945] hover:border-emerald-400 text-emerald-100'
                        : 'bg-[#032036] hover:bg-[#062c4a] border-[#0c406b] hover:border-[#e87722] text-slate-200'
                    }`}
                  >
                    <span className="font-semibold group-hover:text-[#e87722] transition-colors truncate">
                      {item.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#e87722] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* User Bubble */}
              {msg.sender === 'user' ? (
                <div className={`max-w-xl ${userBubbleStyle} px-4 py-2.5 rounded-2xl rounded-tr-none text-xs sm:text-sm shadow-md`}>
                  {msg.content}
                </div>
              ) : (
                /* Structured Anveshan Assistant Card */
                <div className={`w-full rounded-2xl border shadow-xl overflow-hidden animate-in fade-in duration-200 ${cardBg}`}>
                  {/* Card Header & Badge */}
                  <div className={`p-3.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${cardHeaderBg}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#e87722] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        A
                      </div>
                      <span className="font-bold text-xs">Anveshan Intelligence</span>
                      {getStatusBadge(msg.status)}
                    </div>

                    <div className="flex items-center gap-2.5">
                      {msg.model_used && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          {msg.model_used}
                        </span>
                      )}
                      {msg.latency_ms && (
                        <span className="text-[10px] opacity-60 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {msg.latency_ms} ms
                        </span>
                      )}
                      <button
                        onClick={() => copyToClipboard(msg.id, `${msg.direct_answer}\n\n${msg.explanation || ''}`)}
                        className="opacity-60 hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10"
                        title="Copy answer to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3.5 text-xs">
                    {/* Direct Answer Box */}
                    <div className={`p-3.5 rounded-xl border space-y-2.5 shadow-sm ${directAnswerBoxStyle}`}>
                      <div className="text-xs sm:text-sm font-semibold leading-relaxed">
                        {renderInlineFormatting(msg.direct_answer || msg.content, theme)}
                      </div>

                      {/* Top Clickable Citations Bar */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 border-t border-black/10 space-y-1.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-[#e87722]" />
                            <span>Direct Official Sources:</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {msg.citations.slice(0, 3).map((cit) => {
                              const isPdf = cit.source_url?.toLowerCase().includes('.pdf');
                              const targetHref = isPdf && cit.source_url
                                ? `${cit.source_url}#page=${cit.page_number || 1}&view=FitH`
                                : cit.source_url || '#';

                              return (
                                <div
                                  key={cit.citation_id}
                                  className={`inline-flex items-center gap-1.5 p-1 px-2 rounded-full border text-[11px] ${
                                    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-black/20 border-white/10 text-slate-200'
                                  }`}
                                >
                                  {/* In-app Preview */}
                                  <button
                                    onClick={() => setActiveCitation(cit)}
                                    className="flex items-center gap-1 hover:text-[#e87722] transition-colors"
                                    title="View embedded PDF / Evidence inspection"
                                  >
                                    {isPdf ? (
                                      <FileText className="w-3 h-3 text-rose-400 shrink-0" />
                                    ) : (
                                      <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                                    )}
                                    <span className="max-w-[170px] truncate font-medium">
                                      {cit.document_title}
                                    </span>
                                    {cit.page_number && (
                                      <span className="text-[9px] font-mono bg-black/15 px-1 rounded">
                                        p.{cit.page_number}
                                      </span>
                                    )}
                                  </button>

                                  {/* Direct Link to Open PDF / Web in New Tab */}
                                  {cit.source_url && (
                                    <a
                                      href={targetHref}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded-full bg-black/10 hover:bg-[#e87722] hover:text-white transition-all ml-0.5"
                                      title={isPdf ? `Open Actual PDF at Page ${cit.page_number || 1} in New Tab` : 'Open Live PDEU Page in New Tab'}
                                    >
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Conflict Alert Box if present */}
                    {msg.conflicts && msg.conflicts.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
                        <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Institutional Discrepancy Flagged
                        </div>
                        <p className="text-[11px] text-rose-200 leading-relaxed">
                          {msg.conflicts[0].description}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="p-2 rounded-lg bg-black/20 border border-rose-900/50">
                            <strong className="text-rose-300 block mb-0.5">
                              Source A: {msg.conflicts[0].source_a_title}
                            </strong>
                            <span className="italic opacity-90">
                              "{msg.conflicts[0].source_a_snippet}"
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/20 border border-rose-900/50">
                            <strong className="text-rose-300 block mb-0.5">
                              Source B: {msg.conflicts[0].source_b_title}
                            </strong>
                            <span className="italic opacity-90">
                              "{msg.conflicts[0].source_b_snippet}"
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Formatted Academic Breakdown / Explanation */}
                    {msg.explanation && (
                      <div className={`p-3.5 rounded-xl border ${explanationBoxStyle}`}>
                        <FormattedText content={msg.explanation} theme={theme} />
                      </div>
                    )}

                    {/* Collapsible Verification Audit & Visual Graph */}
                    <div className="pt-1">
                      <button
                        onClick={() => toggleAudit(msg.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-colors text-xs font-medium ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200/70 border-slate-200' : 'bg-black/20 hover:bg-black/35 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Network className="w-3.5 h-3.5 text-[#e87722]" />
                          <span>Show Verification Audit & Visual Reasoning Graph</span>
                          {msg.graph_traversal && msg.graph_traversal.length > 0 && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-black/20 text-[#e87722] font-mono font-bold">
                              {msg.graph_traversal.length} hops
                            </span>
                          )}
                        </div>
                        {expandedAudits[msg.id] ? (
                          <ChevronUp className="w-4 h-4 opacity-60" />
                        ) : (
                          <ChevronDown className="w-4 h-4 opacity-60" />
                        )}
                      </button>

                      {expandedAudits[msg.id] && (
                        <div className={`mt-2 p-3.5 rounded-xl border space-y-4 animate-in fade-in duration-150 ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'
                        }`}>
                          {/* Student Context Applied */}
                          {msg.user_context && (
                            <div className="space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                                Applied Student Persona Context
                              </div>
                              <div className="flex flex-wrap gap-1.5 text-[11px]">
                                <span className="bg-black/10 px-2 py-0.5 rounded border border-black/10">
                                  Student: <strong>{msg.user_context.student_name}</strong>
                                </span>
                                <span className="bg-black/10 px-2 py-0.5 rounded border border-black/10">
                                  Program: <strong>{msg.user_context.program}</strong>
                                </span>
                                <span className="bg-black/10 px-2 py-0.5 rounded border border-black/10">
                                  Batch: <strong>{msg.user_context.batch}</strong>
                                </span>
                                <span className="bg-black/10 px-2 py-0.5 rounded border border-black/10">
                                  Semester: <strong>{msg.user_context.semester}</strong>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Visual Graph Steps */}
                          {msg.graph_traversal && msg.graph_traversal.length > 0 && (
                            <div className="space-y-1.5">
                              <VisualReasoningGraph steps={msg.graph_traversal} />
                            </div>
                          )}

                          {/* Full Citations List */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-black/10">
                              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                                Authoritative Knowledge Sources ({msg.citations.length})
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {msg.citations.map((cit) => {
                                  const isPdf = cit.source_url?.toLowerCase().includes('.pdf');
                                  const targetHref = isPdf && cit.source_url
                                    ? `${cit.source_url}#page=${cit.page_number || 1}&view=FitH`
                                    : cit.source_url || '#';

                                  return (
                                    <div
                                      key={cit.citation_id}
                                      className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                                        isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'
                                      }`}
                                    >
                                      <div className="space-y-0.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          {isPdf ? (
                                            <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                          ) : (
                                            <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                          )}
                                          <span className="font-bold text-xs truncate">
                                            {cit.document_title}
                                          </span>
                                          {cit.page_number && (
                                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/10 font-bold">
                                              p.{cit.page_number}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] opacity-70 italic line-clamp-1 pl-5">
                                          "{cit.snippet}"
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0 pl-5 sm:pl-0">
                                        {cit.source_url && (
                                          <a
                                            href={targetHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                            <span>Open {isPdf ? 'PDF' : 'Web'} ↗</span>
                                          </a>
                                        )}
                                        <button
                                          onClick={() => setActiveCitation(cit)}
                                          className="px-2.5 py-1 rounded-lg bg-black/10 hover:bg-black/20 text-xs font-medium flex items-center gap-1 transition-all border border-black/10"
                                        >
                                          <Eye className="w-3 h-3 text-[#e87722]" />
                                          <span>Preview</span>
                                        </button>
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

                    {/* Recommended Follow-up Actions */}
                    {msg.related_actions && msg.related_actions.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-black/10">
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                          Recommended Follow-ups:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.related_actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleSend(`Tell me more about: ${act}`)}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors flex items-center gap-1 font-medium ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                                  : 'bg-black/20 hover:bg-black/35 border-white/10 text-slate-200'
                              }`}
                            >
                              <CornerDownRight className="w-3 h-3 text-[#e87722]" />
                              <span>{act}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Spinner Indicator */}
        {loading && (
          <div className={`flex items-center gap-2.5 p-3.5 rounded-2xl border shadow-md max-w-sm animate-pulse text-xs ${cardBg}`}>
            <RefreshCw className="w-4 h-4 text-[#e87722] animate-spin shrink-0" />
            <div className="font-medium">
              Reasoning over PDEU Knowledge Graph & verifying official handbooks...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Follow-up Question Pills above input */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-[11px] shrink-0">
        <span className="opacity-50 text-[10px] font-bold uppercase tracking-wider shrink-0 pl-1">
          Quick Ask:
        </span>
        <button
          onClick={() => handleSend('give details of proffesor sidheshwar routray')}
          className="px-2.5 py-1 rounded-full border shrink-0 hover:border-[#e87722] transition-colors font-medium opacity-85 hover:opacity-100 border-slate-700/50"
        >
          👨‍🏫 Prof. Sidheswar Routray
        </button>
        <button
          onClick={() => handleSend('What is the highest and average placement package at PDEU, and top recruiters?')}
          className="px-2.5 py-1 rounded-full border shrink-0 hover:border-[#e87722] transition-colors font-medium opacity-85 hover:opacity-100 border-slate-700/50"
        >
          💼 Placements & CTC
        </button>
        <button
          onClick={() => handleSend('What is the attendance requirement and hackathon concession at PDEU?')}
          className="px-2.5 py-1 rounded-full border shrink-0 hover:border-[#e87722] transition-colors font-medium opacity-85 hover:opacity-100 border-slate-700/50"
        >
          ⏱️ 80% Attendance Rule
        </button>
      </div>

      {/* 4. Chat Input Box */}
      <div className={`rounded-2xl p-2 flex items-center gap-2 shadow-lg transition-all shrink-0 ${inputBarStyle}`}>
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask anything about PDEU faculty, curriculum, placements, or regulations...`}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm focus:outline-none font-medium"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || loading}
          className="p-2.5 rounded-xl bg-[#e87722] hover:bg-[#d96711] disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-orange-500/20 shrink-0"
          title="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Evidence Modal with Embedded PDF / Page Preview */}
      <EvidenceModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      {/* Google Gemini API Key Setup Modal */}
      {showGeminiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#e87722]/20 text-[#e87722]">
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
                Connect your Google Gemini API key to enable <strong>Gemini 2.0 Flash</strong> for query parsing, typo correction, and grounded reasoning.
              </p>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] space-y-1">
                <span className="font-bold text-amber-300 block">Get your free Gemini API key:</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e87722] hover:underline flex items-center gap-1 font-semibold"
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
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 focus-within:border-[#e87722] transition-all">
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
                className="px-5 py-2 rounded-xl bg-[#e87722] hover:bg-[#d96711] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
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
