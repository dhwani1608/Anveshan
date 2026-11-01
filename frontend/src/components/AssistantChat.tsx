'use client';

import React, { useState, useEffect } from 'react';
import { ChatMessage, CitationItem, UserContext, GeminiStatus } from '@/lib/types';
import {
  Sparkles, Send, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle,
  FileText, ExternalLink, Network, ArrowRight, CornerDownRight, ShieldAlert,
  GraduationCap, Clock, RefreshCw, ChevronDown, ChevronUp, Copy, Check, BookOpen,
  Globe, Eye, Key, Cpu, X
} from 'lucide-react';
import { EvidenceModal } from './EvidenceModal';
import { VisualReasoningGraph } from './VisualReasoningGraph';
import { askAnveshanQuery, getGeminiStatus, setGeminiApiKey } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface AssistantChatProps {
  initialSuggested?: { category: string; text: string; description: string }[];
}

// Inline formatting helper for **bold** and `code`
function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Formatted markdown renderer component
const FormattedText: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ###
        if (trimmed.startsWith('### ')) {
          return (
            <div key={idx} className="pt-2 pb-1 border-t border-slate-800/80 mt-3 first:mt-0 first:border-0 first:pt-0">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                {trimmed.replace('### ', '')}
              </h4>
            </div>
          );
        }

        // Header ####
        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={idx} className="text-xs font-semibold text-slate-200 mt-2 mb-1">
              {trimmed.replace('#### ', '')}
            </h5>
          );
        }

        // Bullet points
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[•\-\*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
              <div className="text-slate-200">{renderInlineFormatting(bulletText)}</div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-slate-300">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const AssistantChat: React.FC<AssistantChatProps> = ({ initialSuggested = [] }) => {
  const { user, token, activePersona } = useAuth();
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
            POTENTIAL CONFLICT FLAGGED
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            INSUFFICIENT EVIDENCE (REFUSED HALLUCINATION)
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
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-4">
      {/* Context Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 text-[#e87722] flex items-center justify-center font-bold">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block font-medium">Active Student Persona:</span>
            <div className="font-bold text-[#002b49] text-sm">
              {activePersona?.name || 'Dhwani Vyas'} • {activePersona?.program || 'B.Tech CSE'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setShowGeminiModal(true)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-sans font-bold flex items-center gap-1.5 transition-colors ${
              geminiStatus?.active
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-orange-50 text-[#e87722] border-orange-200 hover:bg-orange-100'
            }`}
            title="Configure Gemini Live NLP API"
          >
            <Sparkles className={`w-3.5 h-3.5 ${geminiStatus?.active ? 'text-emerald-600' : 'text-[#e87722]'}`} />
            <span>{geminiStatus?.active ? 'Gemini 2.0 Active' : 'Setup Gemini API'}</span>
          </button>
          <span className="bg-slate-100 text-[#002b49] px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold">
            Batch: {activePersona?.batch || '2027'}
          </span>
          <span className="bg-slate-100 text-[#002b49] px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold">
            Sem: {activePersona?.semester || 7}
          </span>
          <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 text-[11px] font-bold">
            Org: PDEU
          </span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-6 min-h-[420px] p-2">
        {messages.length === 0 ? (
          <div className="text-center py-10 space-y-6">
            <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-[#e87722] border border-orange-200 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold text-[#002b49] font-serif tracking-tight">
                Welcome to ANVESHAN at PDEU
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Your personalized academic intelligence layer. Ask questions regarding curricula, prerequisites, regulations, and departmental notices with verified citations.
              </p>
            </div>

            {/* Suggested Starter Questions */}
            {initialSuggested.length > 0 && (
              <div className="max-w-2xl mx-auto text-left space-y-2.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider px-1">
                  Try asking Anveshan:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {initialSuggested.map((sq, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sq.text)}
                      className="text-left p-3.5 rounded-xl bg-white hover:bg-orange-50/60 border border-slate-200 hover:border-[#e87722]/50 shadow-sm transition-all text-xs group"
                    >
                      <div className="font-semibold text-[#002b49] group-hover:text-[#e87722] flex items-center justify-between">
                        <span>{sq.text}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#e87722] shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {sq.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* User Bubble */}
              {msg.sender === 'user' ? (
                <div className="max-w-xl bg-[#002b49] text-white font-medium px-4 py-2.5 rounded-2xl rounded-tr-none text-sm shadow-md">
                  {msg.content}
                </div>
              ) : (
                /* Structured Anveshan Assistant Card */
                <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-200">
                  {/* Assistant Header & Status Badge */}
                  <div className="p-4 bg-slate-800/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        A
                      </div>
                      <span className="font-semibold text-xs text-white">Anveshan Intelligence</span>
                      {getStatusBadge(msg.status)}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {msg.model_used && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          {msg.model_used}
                        </span>
                      )}
                      {msg.latency_ms && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {msg.latency_ms} ms
                        </span>
                      )}
                      <button
                        onClick={() => copyToClipboard(msg.id, `${msg.direct_answer}\n\n${msg.explanation || ''}`)}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
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

                  <div className="p-5 space-y-4 text-xs text-slate-300">
                    {/* Direct Answer */}
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="text-sm font-semibold text-white leading-relaxed">
                        {renderInlineFormatting(msg.direct_answer || msg.content)}
                      </div>

                      {/* Top Clickable Citations Bar (Direct Actual PDF & Web Opening) */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-400" />
                            <span>Direct Official Sources:</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {msg.citations.slice(0, 3).map((cit) => {
                              const isPdf = cit.source_url?.toLowerCase().includes('.pdf');
                              const targetHref = isPdf && cit.source_url
                                ? `${cit.source_url}#page=${cit.page_number || 1}&view=FitH`
                                : cit.source_url || '#';

                              return (
                                <div
                                  key={cit.citation_id}
                                  className="inline-flex items-center gap-1.5 p-1 px-2.5 rounded-full bg-slate-850 border border-slate-700 text-[11px] text-slate-200"
                                >
                                  {/* Open in Interactive Embedded Viewer */}
                                  <button
                                    onClick={() => setActiveCitation(cit)}
                                    className="flex items-center gap-1 text-slate-200 hover:text-amber-300 transition-colors"
                                    title="View embedded PDF / Evidence inspection"
                                  >
                                    {isPdf ? (
                                      <FileText className="w-3 h-3 text-rose-400 shrink-0" />
                                    ) : (
                                      <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                                    )}
                                    <span className="max-w-[190px] truncate font-medium">
                                      {cit.document_title}
                                    </span>
                                    {cit.page_number && (
                                      <span className="text-[9px] font-mono text-amber-300 bg-slate-800 px-1.5 py-0.2 rounded">
                                        p.{cit.page_number}
                                      </span>
                                    )}
                                  </button>

                                  {/* Direct Link to Open Actual PDF in New Tab */}
                                  {cit.source_url && (
                                    <a
                                      href={targetHref}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-all ml-1 shrink-0"
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
                      <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 space-y-3">
                        <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Institutional Discrepancy Flagged
                        </div>
                        <p className="text-[11px] text-rose-200/90 leading-relaxed">
                          {msg.conflicts[0].description}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-900/60">
                            <strong className="text-rose-300 block mb-1">
                              Source A: {msg.conflicts[0].source_a_title}
                            </strong>
                            <span className="text-slate-300 italic">
                              "{msg.conflicts[0].source_a_snippet}"
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-900/60">
                            <strong className="text-rose-300 block mb-1">
                              Source B: {msg.conflicts[0].source_b_title}
                            </strong>
                            <span className="text-slate-300 italic">
                              "{msg.conflicts[0].source_b_snippet}"
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] text-rose-400/80 italic">
                          * Anveshan requires administrative verification before considering either rule definitive.
                        </div>
                      </div>
                    )}

                    {/* Formatted Academic Breakdown / Explanation */}
                    {msg.explanation && (
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                        <FormattedText content={msg.explanation} />
                      </div>
                    )}

                    {/* Collapsible Audit Trail & Graph Traversal Accordion */}
                    <div className="pt-2">
                      <button
                        onClick={() => toggleAudit(msg.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 transition-colors text-xs font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <Network className="w-3.5 h-3.5 text-amber-400" />
                          <span>Show Verification Audit & Visual Reasoning Graph</span>
                          {msg.graph_traversal && msg.graph_traversal.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono">
                              {msg.graph_traversal.length} graph hops
                            </span>
                          )}
                        </div>
                        {expandedAudits[msg.id] ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {expandedAudits[msg.id] && (
                        <div className="mt-2.5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-5 animate-in fade-in duration-150">
                          {/* Applied Persona Context */}
                          {msg.user_context && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Applied Student Context
                              </div>
                              <div className="flex flex-wrap gap-2 text-[11px]">
                                <span className="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-800">
                                  Student: <strong className="text-white">{msg.user_context.student_name}</strong>
                                </span>
                                <span className="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-800">
                                  Program: <strong className="text-white">{msg.user_context.program}</strong>
                                </span>
                                <span className="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-800">
                                  Batch: <strong className="text-amber-300">{msg.user_context.batch}</strong>
                                </span>
                                <span className="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-800">
                                  Semester: <strong className="text-white">{msg.user_context.semester}</strong>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Visual Knowledge Graph Component */}
                          {msg.graph_traversal && msg.graph_traversal.length > 0 && (
                            <div className="space-y-2">
                              <VisualReasoningGraph steps={msg.graph_traversal} />
                            </div>
                          )}

                          {/* Complete Evidence Sources with Direct Actual PDF Links */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-800/80">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Authoritative Evidence Sources ({msg.citations.length})
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Click button to open actual PDF or live page
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2.5">
                                {msg.citations.map((cit) => {
                                  const isPdf = cit.source_url?.toLowerCase().includes('.pdf');
                                  const targetHref = isPdf && cit.source_url
                                    ? `${cit.source_url}#page=${cit.page_number || 1}&view=FitH`
                                    : cit.source_url || '#';

                                  return (
                                    <div
                                      key={cit.citation_id}
                                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-slate-700 transition-all"
                                    >
                                      <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                          {isPdf ? (
                                            <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                                          ) : (
                                            <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                                          )}
                                          <span className="font-semibold text-slate-200 text-xs">
                                            {cit.document_title}
                                          </span>
                                          {cit.page_number && (
                                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                                              Page {cit.page_number}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-slate-400 italic line-clamp-1 pl-6">
                                          "{cit.snippet}"
                                        </p>
                                      </div>

                                      {/* Action Buttons: Open Actual PDF vs In-App Viewer */}
                                      <div className="flex items-center gap-2 shrink-0 pl-6 sm:pl-0">
                                        {/* Direct Actual PDF Link */}
                                        {cit.source_url && (
                                          <a
                                            href={targetHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                                          >
                                            <ExternalLink className="w-3 h-3 text-rose-400" />
                                            <span>Open Actual {isPdf ? 'PDF' : 'Webpage'} ↗</span>
                                          </a>
                                        )}

                                        {/* Embedded Viewer Button */}
                                        <button
                                          onClick={() => setActiveCitation(cit)}
                                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium flex items-center gap-1.5 transition-all"
                                        >
                                          <Eye className="w-3 h-3 text-amber-400" />
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

                    {/* Related Actions */}
                    {msg.related_actions && msg.related_actions.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Recommended Actions
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.related_actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleSend(`Tell me more about: ${act}`)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700 transition-colors flex items-center gap-1.5"
                            >
                              <CornerDownRight className="w-3 h-3 text-amber-400" />
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

        {loading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-md max-w-md animate-pulse">
            <RefreshCw className="w-4 h-4 text-[#e87722] animate-spin" />
            <div className="text-xs text-slate-700 font-medium">
              Traversing PDEU Knowledge Graph & fusing hybrid vector chunks...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="bg-white border-2 border-slate-200 focus-within:border-[#e87722] rounded-2xl p-2 flex items-center gap-2 shadow-lg transition-all">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask about curriculum, placements, admissions, or regulations for Batch ${activePersona?.batch || '2027'}...`}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || loading}
          className="p-2.5 rounded-xl bg-[#e87722] hover:bg-[#d96711] disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-orange-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Evidence Modal with Embedded PDF Viewer */}
      <EvidenceModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      {/* Google Gemini API Key Configuration Modal */}
      {showGeminiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-100 text-[#e87722]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#002b49]">Google Gemini API Setup</h3>
                  <span className="text-[11px] text-slate-500">Live NLP & Grounded Reasoning</span>
                </div>
              </div>
              <button
                onClick={() => setShowGeminiModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p className="leading-relaxed">
                Connect your Google Gemini API key to enable <strong>Gemini 2.0 Flash</strong> for advanced query understanding, typo correction, entity normalization, and deep grounded response formulation.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                <span className="font-bold text-slate-700 block">Need a free Gemini API key?</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e87722] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Get your key instantly at Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {keySuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{keySuccessMsg}</span>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">Gemini API Key</label>
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus-within:border-[#e87722] focus-within:bg-white transition-all">
                <Key className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="bg-transparent flex-1 text-slate-900 font-mono text-xs focus:outline-none placeholder-slate-400"
                />
              </div>
              <span className="text-[10px] text-slate-400 block pl-1">
                Keys are securely persisted in backend environment & local session.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGeminiModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                disabled={!geminiKeyInput.trim() || savingKey}
                onClick={handleSaveGeminiKey}
                className="px-5 py-2 rounded-xl bg-[#002b49] hover:bg-[#003865] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>{savingKey ? 'Activating...' : 'Save & Activate Gemini NLP'}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
