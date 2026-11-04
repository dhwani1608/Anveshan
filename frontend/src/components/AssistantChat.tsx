'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, CitationItem } from '@/lib/types';
import {
  Sparkles, Send, CheckCircle2, FileText, Globe, Eye,
  RotateCcw, RefreshCw, ChevronDown, ChevronUp, ExternalLink,
  BookOpen, CheckCheck, UserCheck, GraduationCap, User, ArrowRight,
  AlertCircle, ShieldCheck, MapPin, Phone, Mail, Building
} from 'lucide-react';
import { EvidenceModal } from './EvidenceModal';
import { askAnveshanQuery } from '@/lib/api';
import { useAuth, GuestInfo } from '@/context/AuthContext';
import { parsePDPUEmail, ParsedStudentInfo, PDEU_OFFERED_PROGRAMS } from '@/lib/emailParser';

interface AssistantChatProps {
  initialSuggested?: { category: string; text: string; description: string }[];
}

const INDIAN_STATES = [
  'Gujarat',
  'Maharashtra',
  'Rajasthan',
  'Madhya Pradesh',
  'Delhi (NCT)',
  'Uttar Pradesh',
  'Karnataka',
  'Telangana',
  'Haryana',
  'Punjab',
  'Bihar',
  'West Bengal',
  'Tamil Nadu',
  'Kerala',
  'Odisha',
  'Jharkhand',
  'Chhattisgarh',
  'Uttarakhand',
  'Assam',
  'Other State / UT / International'
];

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
  const {
    token,
    activePersona,
    studentInfo,
    guestInfo,
    isGuest,
    loginWithStudentEmail,
    setGuestProfile,
    resetSession
  } = useAuth();

  // Intake Modal Mode: 'student' | 'guest'
  const [activeTab, setActiveTab] = useState<'student' | 'guest'>('student');
  const [showIntake, setShowIntake] = useState<boolean>(!activePersona);

  // Student Intake Form State
  const [studentInput, setStudentInput] = useState('23bcp116@sot.pdpu.ac.in');
  const [parsedPreview, setParsedPreview] = useState<ParsedStudentInfo | null>(null);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Guest Intake Form State (matching CU assistant fields)
  const [guestFullName, setGuestFullName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestDiscipline, setGuestDiscipline] = useState('School of Technology (SoT)');
  const [guestProgram, setGuestProgram] = useState(PDEU_OFFERED_PROGRAMS['School of Technology (SoT)'][0]);
  const [guestState, setGuestState] = useState('Gujarat');
  const [guestError, setGuestError] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parse student input in real-time as user types
  useEffect(() => {
    if (studentInput.trim()) {
      const parsed = parsePDPUEmail(studentInput.trim());
      setParsedPreview(parsed);
      if (!parsed.isValid && parsed.error) {
        setStudentError(parsed.error);
      } else {
        setStudentError(null);
      }
    } else {
      setParsedPreview(null);
      setStudentError(null);
    }
  }, [studentInput]);

  // When guest discipline changes, update the available program list
  const handleDisciplineChange = (newDiscipline: string) => {
    setGuestDiscipline(newDiscipline);
    const programs = PDEU_OFFERED_PROGRAMS[newDiscipline] || [];
    if (programs.length > 0) {
      setGuestProgram(programs[0]);
    }
  };

  // If activePersona is set, ensure showIntake is false
  useEffect(() => {
    if (activePersona) {
      setShowIntake(false);
    } else {
      setShowIntake(true);
    }
  }, [activePersona]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle student login submit
  const handleStudentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentInput.trim()) {
      setStudentError('Please enter your PDEU student email or roll ID.');
      return;
    }
    const result = loginWithStudentEmail(studentInput.trim());
    if (!result.isValid) {
      setStudentError(result.error || 'Invalid PDEU student email.');
      return;
    }
    setShowIntake(false);
    setMessages([]); // Reset conversation for fresh personalized session
  };

  // Handle guest intake submit
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestFullName.trim()) {
      setGuestError('Please enter your full name.');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setGuestError('Please enter a valid email address.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.replace(/\D/g, '').length < 10) {
      setGuestError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setGuestError(null);
    setGuestProfile({
      name: guestFullName.trim(),
      email: guestEmail.trim(),
      phone: guestPhone.trim(),
      discipline: guestDiscipline,
      program: guestProgram,
      state: guestState
    });
    setShowIntake(false);
    setMessages([]); // Reset conversation for fresh guest session
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
      const effectiveBatch = studentInfo?.batch || activePersona?.batch || '2027';
      const effectiveSemester = studentInfo?.currentSemester || activePersona?.semester || 7;

      const response = await askAnveshanQuery(
        q,
        token || undefined,
        effectiveBatch !== 'N/A' ? effectiveBatch : '2027',
        effectiveSemester || undefined
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

  // Starter quick prompts adapted for Student vs Guest
  const studentStarterPrompts = [
    { label: '🤖 Can I take Machine Learning?', query: 'Can I take Machine Learning next semester?' },
    { label: '📋 Attendance Regulations', query: 'What are the attendance requirements and regulations for my batch?' },
    { label: '📘 4th Year CSE Curriculum', query: 'What is the curriculum and elective list for B.Tech Computer Engineering Batch 2027?' },
    { label: '👨‍🏫 Dr. Sidheswar Routray', query: 'give details of proffesor sidheshwar routray' },
    { label: '💼 Placement Records', query: 'What are the highest and average placement packages for CSE at PDEU?' }
  ];

  const guestStarterPrompts = [
    { label: '💰 B.Tech & MBA Fee Structure', query: 'What is the official PDEU tuition fee and institutional fee structure for B.Tech and MBA?' },
    { label: '🏠 Raisan Hostels & Mess', query: 'What are the residential hostel options and mess charges on the Raisan PDEU campus?' },
    { label: '🎖️ Scholarships (JEE & ACPC)', query: 'What scholarships are offered for ACPC and JEE Main rankers at PDEU?' },
    { label: '📚 1st Year Syllabus & Foundation', query: 'What are the 1st year foundational courses for engineering at PDEU?' },
    { label: '🎓 PDEU Accreditation & NIRF', query: 'What is PDEU NAAC accreditation score and NIRF ranking?' }
  ];

  const activeStarterPrompts = isGuest ? guestStarterPrompts : studentStarterPrompts;

  return (
    <div className="relative flex flex-col h-full w-full justify-between bg-white text-slate-900">
      {/* =========================================================================
          INTAKE VIEW: 2 Distinct Options (PDEU Student Login vs Guest Aspirant)
          Styled directly like the CU Assistant intake screenshot
          ========================================================================= */}
      {showIntake ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-radial from-red-50/40 via-white to-slate-50">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header matching CU Assistant Card */}
            <div className="p-5 pb-4 text-center border-b border-slate-100 bg-gradient-to-b from-red-50/60 to-white">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-serif font-black text-2xl flex items-center justify-center mx-auto shadow-md mb-2">
                P
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Welcome to PDEU Assistant!
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Please select how you would like to continue
              </p>

              {/* 2 Choice Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl mt-4 border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setActiveTab('student'); setStudentError(null); }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'student'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>PDEU Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('guest'); setGuestError(null); }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'guest'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Guest / Aspirant</span>
                </button>
              </div>
            </div>

            {/* TAB 1: PDEU STUDENT LOGIN */}
            {activeTab === 'student' && (
              <form onSubmit={handleStudentSubmit} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>PDEU Student Email or Roll ID</span>
                    <span className="text-[10px] text-red-600 font-normal">pdpu.ac.in required</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      placeholder="e.g. 23bcp116@sot.pdpu.ac.in or 23bcp116"
                      className="w-full pl-3.5 pr-20 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-900 font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setStudentInput('23bcp116@sot.pdpu.ac.in')}
                      className="absolute right-2 top-2 text-[10px] font-bold text-red-700 bg-red-100 hover:bg-red-200 px-2 py-1 rounded-md transition-colors"
                      title="Insert sample Dhwani Vyas (23BCP116)"
                    >
                      Fill 23bcp116
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Just enter your email ID — your Batch, Branch, Roll Number, and Semester are automatically deduced!
                  </p>
                </div>

                {studentError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{studentError}</span>
                  </div>
                )}

                {/* Instant Decoded Identity Preview Card */}
                {parsedPreview && parsedPreview.isValid && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-50/80 via-white to-red-50/40 border border-red-200/90 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-1.5 border-b border-red-100">
                      <div className="flex items-center gap-1.5 text-red-700 font-extrabold text-[11px] uppercase tracking-wide">
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span>Verified PDEU Profile</span>
                      </div>
                      <span className="bg-red-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                        {parsedPreview.rollNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Program / Branch</span>
                        <span className="font-bold text-slate-800">{parsedPreview.program}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Batch & Year</span>
                        <span className="font-bold text-red-700">Batch {parsedPreview.batch} ({parsedPreview.cohortString})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">School</span>
                        <span className="font-medium text-slate-700">{parsedPreview.school}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Status</span>
                        <span className="font-bold text-slate-800">Semester {parsedPreview.currentSemester} (Year 4)</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!parsedPreview?.isValid}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Start Chatting as Student</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            )}

            {/* TAB 2: GUEST / ASPIRANT INTAKE FORM (Matching CU Chatbot screenshot) */}
            {activeTab === 'guest' && (
              <form onSubmit={handleGuestSubmit} className="p-5 space-y-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={guestFullName}
                    onChange={(e) => setGuestFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 placeholder-slate-400 font-medium"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 placeholder-slate-400 font-medium"
                    required
                  />
                </div>

                {/* Mobile Number with IN +91 */}
                <div className="flex gap-2">
                  <div className="w-24 px-2.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-700 font-bold flex items-center justify-between shrink-0 select-none">
                    <span>IN +91</span>
                    <span className="text-[10px] text-slate-400">▼</span>
                  </div>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Mobile number"
                    maxLength={10}
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 placeholder-slate-400 font-medium"
                    required
                  />
                </div>

                {/* Discipline (School) Dropdown */}
                <div className="space-y-1">
                  <div className="relative">
                    <select
                      value={guestDiscipline}
                      onChange={(e) => handleDisciplineChange(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 font-medium pr-8"
                    >
                      {Object.keys(PDEU_OFFERED_PROGRAMS).map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Program / Branch Dropdown (Strictly real PDEU programs) */}
                <div className="space-y-1">
                  <div className="relative">
                    <select
                      value={guestProgram}
                      onChange={(e) => setGuestProgram(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 font-medium pr-8"
                    >
                      {(PDEU_OFFERED_PROGRAMS[guestDiscipline] || []).map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* State Dropdown */}
                <div className="space-y-1">
                  <div className="relative">
                    <select
                      value={guestState}
                      onChange={(e) => setGuestState(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 font-medium pr-8"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {guestError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{guestError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 shadow-md transition-all flex items-center justify-center gap-2 group mt-2"
                >
                  <span>Start Chatting as Guest</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
              powered by <span className="font-extrabold text-red-600">PDEU ASSISTANT</span> • NAAC A++ Accredited
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           ACTIVE CHAT VIEW: Clean red & white interface with profile indicator
           ========================================================================= */
        <>
          {/* Top Profile / Persona Banner with Switch/Login Button */}
          <div className="px-3.5 py-2 bg-gradient-to-r from-red-50 via-white to-red-50/40 border-b border-red-100 flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {studentInfo ? (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-red-700 truncate">
                    🎓 {studentInfo.rollNumber} • {studentInfo.program} (Batch {studentInfo.batch})
                  </span>
                </div>
              ) : guestInfo ? (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold text-slate-700 truncate">
                    👤 Guest: {guestInfo.name} • {guestInfo.program}
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 font-medium">PDEU Academic Explorer</span>
              )}
            </div>

            {/* Switch / Change Identity Button */}
            <button
              onClick={() => setShowIntake(true)}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 px-2.5 py-1 rounded-full border border-red-200 transition-colors shadow-2xs shrink-0 flex items-center gap-1"
              title="Switch identity or log in"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Switch / Login</span>
            </button>
          </div>

          {/* Clean Scrollable Message Canvas */}
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

                {/* Bottom Greeting Text tailored to Student vs Guest */}
                <div className="p-3.5 space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed bg-white">
                  {studentInfo ? (
                    <p>
                      Hello <strong>{studentInfo.rollNumber === '23BCP116' ? 'Dhwani Vyas' : studentInfo.rollNumber}</strong>! Welcome to <strong>PDEU Assistant</strong>. I have loaded your <strong>{studentInfo.program}</strong> academic profile for <strong>Batch {studentInfo.batch} (Semester {studentInfo.currentSemester})</strong>. What would you like to know about your curriculum, prerequisites, attendance rules, or placements?
                    </p>
                  ) : guestInfo ? (
                    <p>
                      Hello <strong>{guestInfo.name}</strong>! Welcome to <strong>Pandit Deendayal Energy University (PDEU)</strong>. I am your virtual admissions assistant for <strong>{guestInfo.program}</strong> at <strong>{guestInfo.discipline}</strong>. How may I assist you today with fees, scholarships, hostels, or admissions?
                    </p>
                  ) : (
                    <p>
                      Hello and welcome to <strong>Pandit Deendayal Energy University (PDEU)</strong>. I am <strong>PDEU Assistant</strong>, your virtual academic assistant. Please let me know how may I assist you today!
                    </p>
                  )}
                  <div className="text-[10px] text-slate-400 font-mono">
                    Official PDEU Academic Assistant • Connected
                  </div>
                </div>
              </div>

              {/* Quick Starter Chips (clean pill buttons right beneath greeting) */}
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 pl-0.5">
                  {activeStarterPrompts.map((p, idx) => (
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

          {/* Simple Pill Input Bar (Matching CU Assistant Layout) */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0 space-y-1.5">
            <div className="rounded-full pl-4 pr-1 py-1 flex items-center gap-2 border border-slate-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all bg-white shadow-xs">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message about PDEU..."
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
              powered by <span className="font-extrabold text-red-600">PDEU ASSISTANT</span> • Pandit Deendayal Energy University
            </div>
          </div>

          {/* Evidence Modal for PDF Preview */}
          <EvidenceModal
            citation={activeCitation}
            onClose={() => setActiveCitation(null)}
          />
        </>
      )}
    </div>
  );
};
