'use client';

import React, { useState } from 'react';
import { ChatMessage, CitationItem, UserContext } from '@/lib/types';
import {
  Sparkles, Send, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle,
  FileText, ExternalLink, Network, ArrowRight, CornerDownRight, ShieldAlert,
  GraduationCap, Clock, RefreshCw
} from 'lucide-react';
import { EvidenceModal } from './EvidenceModal';
import { askAnveshanQuery } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface AssistantChatProps {
  initialSuggested?: { category: string; text: string; description: string }[];
}

export const AssistantChat: React.FC<AssistantChatProps> = ({ initialSuggested = [] }) => {
  const { user, token, activePersona } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);

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
        latency_ms: response.latency_ms
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
            GROUNDED ANSWER
          </span>
        );
      case 'CONFLICT_DETECTED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            POTENTIAL CONFLICT DETECTED
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Active Persona Context:</span>
            <div className="font-semibold text-slate-200">
              {activePersona?.name || 'Dhwani Vyas'} • {activePersona?.program || 'B.Tech CSE'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="bg-slate-800 text-amber-300 px-2 py-1 rounded border border-slate-700 text-[11px]">
            Batch: {activePersona?.batch || '2027'}
          </span>
          <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 text-[11px]">
            Sem: {activePersona?.semester || 7}
          </span>
          <span className="bg-emerald-950/60 text-emerald-300 px-2 py-1 rounded border border-emerald-800/40 text-[11px]">
            Org: PDEU
          </span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-6 min-h-[420px] p-2">
        {messages.length === 0 ? (
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold text-white font-serif">
                Welcome to ANVESHAN at PDEU
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your personalized academic intelligence layer. Ask questions regarding curricula, prerequisites, regulations, and departmental notices with verified citations.
              </p>
            </div>

            {/* Suggested Starter Questions */}
            {initialSuggested.length > 0 && (
              <div className="max-w-2xl mx-auto text-left space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Try asking Anveshan:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {initialSuggested.map((sq, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sq.text)}
                      className="text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all text-xs group"
                    >
                      <div className="font-medium text-slate-200 group-hover:text-amber-300 flex items-center justify-between">
                        <span>{sq.text}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400 shrink-0" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
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
                <div className="max-w-xl bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-medium px-4 py-2.5 rounded-2xl rounded-tr-none text-sm shadow-md">
                  {msg.content}
                </div>
              ) : (
                /* Structured Anveshan Assistant Card */
                <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-200">
                  {/* Assistant Header & Status Badge */}
                  <div className="p-4 bg-slate-800/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        A
                      </div>
                      <span className="font-semibold text-xs text-white">Anveshan Intelligence</span>
                      {getStatusBadge(msg.status)}
                    </div>
                    {msg.latency_ms && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {msg.latency_ms} ms
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-5 text-xs text-slate-300">
                    {/* 1. Direct Answer */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        1. Direct Answer
                      </div>
                      <div className="text-sm font-semibold text-white bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                        {msg.direct_answer || msg.content}
                      </div>
                    </div>

                    {/* Conflict Detected Alert Box if present */}
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

                    {/* 2. Explanation / Why */}
                    {msg.explanation && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          2. Why & Academic Reasoning
                        </div>
                        <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                          {msg.explanation}
                        </div>
                      </div>
                    )}

                    {/* 3. Relevant Context */}
                    {msg.user_context && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          3. Applied User Context
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700">
                            Student: <strong className="text-white">{msg.user_context.student_name}</strong>
                          </span>
                          <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700">
                            Program: <strong className="text-white">{msg.user_context.program}</strong>
                          </span>
                          <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700">
                            Batch: <strong className="text-amber-300">{msg.user_context.batch}</strong>
                          </span>
                          <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700">
                            Semester: <strong className="text-white">{msg.user_context.semester}</strong>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Knowledge Graph Traversal Path */}
                    {msg.graph_traversal && msg.graph_traversal.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Network className="w-3.5 h-3.5 text-amber-400" />
                          Multi-Hop Graph Reasoning Path
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                          {msg.graph_traversal.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-1.5 text-slate-300 overflow-x-auto">
                              <span className="text-amber-300 font-semibold">{step.source}</span>
                              <span className="text-slate-500">─[{step.relation}]─▶</span>
                              <span className="text-emerald-300">{step.target}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Evidence / Sources */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                          <span>4. Clickable Source Evidence ({msg.citations.length})</span>
                          <span className="text-[10px] text-slate-500 font-normal">Click to inspect chunk provenance</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.citations.map((cit) => (
                            <button
                              key={cit.citation_id}
                              onClick={() => setActiveCitation(cit)}
                              className="text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-2 group"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-center gap-1.5 font-semibold text-slate-200 group-hover:text-amber-300 text-xs">
                                  <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span className="line-clamp-1">{cit.document_title}</span>
                                </div>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                                  p. {cit.page_number || 1}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 italic line-clamp-2">
                                "{cit.snippet}"
                              </p>
                              <div className="text-[10px] text-amber-400 flex items-center gap-1 font-medium mt-1">
                                <span>View Authoritative Evidence</span>
                                <ExternalLink className="w-3 h-3" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. Related Actions */}
                    {msg.related_actions && msg.related_actions.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          5. Related Next Actions
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.related_actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleSend(`Tell me more about: ${act}`)}
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700 transition-colors flex items-center gap-1.5"
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
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 max-w-md animate-pulse">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            <div className="text-xs text-slate-300">
              Traversing PDEU Knowledge Graph & fusing hybrid vector chunks...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-2 shadow-2xl">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask about curriculum, prerequisites, or regulations for Batch ${activePersona?.batch || '2027'}...`}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || loading}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Evidence Modal */}
      <EvidenceModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />
    </div>
  );
};
