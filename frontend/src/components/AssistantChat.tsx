'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, CitationItem, GeminiStatus } from '@/lib/types';
import {
  Sparkles, Send, CheckCircle2, FileText, Globe, Eye,
  RotateCcw, RefreshCw, ChevronDown, ChevronUp, ExternalLink,
  BookOpen, CheckCheck
} from 'lucide-react';
import { EvidenceModal } from './EvidenceModal';
import { askAnveshanQuery, getGeminiStatus } from '@/lib/api';
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
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono text-xs border border-red-100">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Formatted clean text renderer
const FormattedText: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ###
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-xs sm:text-sm font-bold text-red-700 pt-2 pb-0.5 uppercase tracking-wide">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }

        // Bullet points
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[•\-\*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
              <div className="text-slate-800">
                {renderInlineFormatting(bulletText)}
              </div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-slate-800">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const AssistantChat: React.FC<AssistantChatProps> = () => {
  const { token, activePersona } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
        activePersona?.batch !== 'N/A' ? activePersona?.batch : '2027',
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
          direct_answer: 'Unable to connect to PDEU Grounded Engine. Please check your network and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Starter quick prompts for the welcome card
  const starterPrompts = [
    { label: '💰 B.Tech & MBA Fees', query: 'What is the official PDEU tuition fee and institutional fee structure for B.Tech and MBA?' },
    { label: '🏠 Raisan Hostels & Mess', query: 'What are the residential hostel options and mess charges on the Raisan PDEU campus?' },
    { label: '🎖️ Scholarships', query: 'What scholarships are offered for ACPC and JEE Main rankers at PDEU?' },
    { label: '📚 1st Year Syllabus', query: 'What are the 1st year foundation courses for B.Tech Computer Engineering at PDEU?' },
    { label: '👨‍🏫 Dr. Sidheswar Routray', query: 'give details of proffesor sidheshwar routray' },
    { label: '💼 ₹42 LPA Placements', query: 'What is the highest and average placement package at PDEU, and top recruiters?' }
  ];

  return (
    <div className="relative flex flex-col h-full w-full justify-between bg-white text-slate-900">
      {/* 1. Clean Scrollable Message Canvas */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3 sm:p-4 min-h-0">
        {/* Unified Welcome Hero Card (Clean & Compact, matching CU Assistant) */}
        <div className="max-w-md sm:max-w-lg space-y-2.5">
          {/* Card containing banner + greeting in a single speech bubble */}
          <div className="bg-red-50/50 border border-red-200/80 rounded-2xl rounded-tl-xs overflow-hidden shadow-xs">
            {/* Top Accolades Graphic */}
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 p-3 sm:p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-serif font-black text-red-700 text-lg shadow-sm shrink-0">
                  P
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.2 rounded-full uppercase tracking-wider">
                      NAAC A++ (3.52)
                    </span>
                    <span className="text-[10px] font-semibold bg-white/15 px-2 py-0.2 rounded-full">
                      NIRF Top Ranked
                    </span>
                  </div>
                  <h4 className="font-serif font-black text-xs sm:text-sm tracking-tight text-white mt-0.5 truncate">
                    PANDIT DEENDAYAL ENERGY UNIVERSITY
                  </h4>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="text-xs font-black text-amber-300">₹42 LPA</div>
                  <div className="text-[9px] text-white/80">Highest CTC</div>
                </div>
              </div>
            </div>

            {/* Bottom Greeting Text */}
            <div className="p-3.5 space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed bg-white">
              <p>
                Hello and welcome to <strong>Pandit Deendayal Energy University (PDEU)</strong>. I am <strong>Anveshan</strong>, your virtual assistant. Please let me know how may I assist you today?
              </p>
              <div className="text-[10px] text-slate-400 font-mono">
                10:33 AM
              </div>
            </div>
          </div>

          {/* Quick Starter Chips (clean pill buttons right beneath greeting) */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 pl-0.5">
              {starterPrompts.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-red-600 text-red-600 hover:text-white border border-red-300 transition-all shadow-xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Conversation Thread */}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1">
            {/* User Message (Right Aligned Red Bubble with Crisp White Text) */}
            {msg.sender === 'user' && (
              <div className="flex flex-col items-end pl-8">
                <div className="bg-red-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] text-xs sm:text-sm font-medium shadow-xs">
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 pr-1">
                  {msg.timestamp}
                </span>
              </div>
            )}

            {/* Assistant Message (Left Aligned White Bubble with Clear Bullet Points) */}
            {msg.sender === 'assistant' && (
              <div className="flex flex-col items-start pr-6 max-w-md sm:max-w-xl space-y-1.5">
                <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 text-xs sm:text-sm shadow-xs space-y-2">
                  {/* Clean Formatted Text */}
                  <FormattedText content={msg.direct_answer || msg.content} />

                  {/* Single Discreet Citation Link */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => setActiveCitation(msg.citations![0])}
                        className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Source: {msg.citations[0].document_title}</span>
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {!msg.citations && (
                    <div className="text-[10px] text-slate-400 font-mono pt-1 text-right">
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {/* Follow-up Quick Chips (rendered directly beneath bot bubble) */}
                {msg.related_actions && msg.related_actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5 pl-1">
                    {msg.related_actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSend(act)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-red-600 text-red-600 hover:text-white border border-red-300 transition-all shadow-xs"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl border border-red-100 bg-red-50/50 text-xs text-red-700 max-w-xs shadow-xs animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />
            <span className="font-semibold">Retrieving PDEU official records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 2. Simple Pill Input Bar (Matching CU Assistant Layout) */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0 space-y-1.5">
        <div className="rounded-full pl-4 pr-1 py-1 flex items-center gap-2 border border-slate-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all bg-white shadow-xs">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent py-1.5 text-xs sm:text-sm focus:outline-none text-slate-900 placeholder-slate-400 font-normal"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-sm shrink-0"
            title="Send"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* Clean Subtle Footer */}
        <div className="text-center text-[10px] text-slate-400 font-medium">
          powered by <span className="font-extrabold text-red-600">ANVESHAN AI</span> • Pandit Deendayal Energy University
        </div>
      </div>

      {/* Evidence Modal for PDF Preview */}
      <EvidenceModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />
    </div>
  );
};
