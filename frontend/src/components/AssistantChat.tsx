'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, CitationItem } from '@/lib/types';
import {
  Sparkles, Send, CheckCircle2, FileText, Globe, Eye,
  RotateCcw, RefreshCw, ChevronDown, ChevronUp, ExternalLink,
  BookOpen, CheckCheck, UserCheck, GraduationCap, User, ArrowRight,
  AlertCircle, ShieldCheck, MapPin, Phone, Mail, Building, Smile, Paperclip
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
            <h4 key={idx} className="text-xs sm:text-sm font-bold text-red-700 pt-1.5 pb-0.5 uppercase tracking-wide">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }

        // Bullet points
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[•\-\*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
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

  // Student Intake Form State (empty by default, no prefilled dummy value)
  const [studentInput, setStudentInput] = useState('');
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
          content: 'Relevant information could not be retrieved at this moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'INSUFFICIENT_EVIDENCE',
          direct_answer: 'Relevant official information could not be retrieved at this moment.\n\n📞 **For official assistance, please contact PDEU**:\n• **Reception / EPABX**: +91 79 2327 5060 / +91 79 2327 5000\n• **Admissions Helpline**: +91 79 2327 5098 / +91 79 2327 5077\n• **Email**: info@pdeu.ac.in',
          related_actions: ['Call PDEU Reception (+91 79 2327 5060)', 'PDEU Tuition Fees', 'Merit Scholarships']
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

  const alumniStarterPrompts = [
    { label: '📜 Official Transcripts Request', query: 'How can I request official transcripts and grade cards from PDEU?' },
    { label: '🎓 Degree Certificate Verification', query: 'What is the procedure for degree certificate verification or duplicate degree at PDEU?' },
    { label: '🌐 PDEU Alumni Association', query: 'How do I register for the official PDEU Alumni Association network?' },
    { label: '📄 Migration Certificate Procedure', query: 'What is the process to obtain a Migration Certificate from PDEU?' },
    { label: '💼 Placement & Alumni Records', query: 'What were the placement statistics and top recruiters for Batch ' + (studentInfo?.batch || '2025') + '?' }
  ];

  const activeStarterPrompts = isGuest
    ? guestStarterPrompts
    : (studentInfo?.isPassedOut ? alumniStarterPrompts : studentStarterPrompts);

  return (
    <div className="relative flex flex-col h-full w-full justify-between bg-[#f0f2f5] text-slate-900 font-sans min-h-0 overflow-hidden">
      {/* =========================================================================
          INTAKE VIEW: 2 Distinct Options (PDEU Student Login vs Guest Aspirant)
          Header: Welcome to PDEU | Footer: Powered by Anveshan
          Scrollable, responsive, no bottom cutoff
          ========================================================================= */}
      {showIntake ? (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col items-center min-h-0 bg-radial from-red-50/50 via-white to-slate-100 scroll-smooth">
          <div className="w-full max-w-sm sm:max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden my-auto shrink-0 animate-in zoom-in-95 duration-200 mb-4">
            {/* Header: Exact text "Welcome to PDEU" */}
            <div className="p-3.5 sm:p-4 pb-2.5 text-center border-b border-slate-100 bg-gradient-to-b from-red-50/60 to-white">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-serif font-black text-xl flex items-center justify-center mx-auto shadow-sm mb-1.5">
                P
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Welcome to PDEU
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Please select how you would like to continue
              </p>

              {/* 2 Choice Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl mt-3 border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setActiveTab('student'); setStudentError(null); }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'student'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>PDEU Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('guest'); setGuestError(null); }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'guest'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Guest / Aspirant</span>
                </button>
              </div>
            </div>

            {/* TAB 1: PDEU STUDENT LOGIN (Clean, without fill 23bcp116 button) */}
            {activeTab === 'student' && (
              <form onSubmit={handleStudentSubmit} className="p-3.5 sm:p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>PDEU Student Email or Roll ID</span>
                    <span className="text-[10px] text-red-600 font-normal">pdpu.ac.in</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      placeholder="e.g. 23bcp116@sot.pdpu.ac.in or 23bcp116"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-900 font-medium transition-all"
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    Just enter your email ID — your Batch, Branch, Roll Number, and Semester are automatically deduced!
                  </p>
                </div>

                {studentError && (
                  <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{studentError}</span>
                  </div>
                )}

                {/* Instant Decoded Identity Preview Card */}
                {parsedPreview && parsedPreview.isValid && (
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-50/80 via-white to-red-50/40 border border-red-200/90 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-1 border-b border-red-100">
                      <div className="flex items-center gap-1.5 text-red-700 font-extrabold text-[11px] uppercase tracking-wide">
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span>Verified PDEU Student</span>
                      </div>
                      <span className="bg-red-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                        {parsedPreview.rollNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Program / Branch</span>
                        <span className="font-bold text-slate-800 truncate block">{parsedPreview.program}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Batch & Cohort</span>
                        <span className="font-bold text-red-700">
                          Batch {parsedPreview.batch} {parsedPreview.isPassedOut && <span className="text-amber-700 text-[10px] font-semibold">(Alumni)</span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">School</span>
                        <span className="font-medium text-slate-700 truncate block">{parsedPreview.school}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Current Status</span>
                        <span className={`font-bold inline-block ${
                          parsedPreview.isPassedOut
                            ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200'
                            : 'text-slate-800'
                        }`}>
                          {parsedPreview.currentStatus || (parsedPreview.isPassedOut ? 'Passed out' : `Semester ${parsedPreview.currentSemester}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!parsedPreview?.isValid}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2 group mt-1"
                >
                  <span>Start Chatting</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            )}

            {/* TAB 2: GUEST / ASPIRANT INTAKE FORM */}
            {activeTab === 'guest' && (
              <form onSubmit={handleGuestSubmit} className="p-3.5 sm:p-4 space-y-2">
                <input
                  type="text"
                  value={guestFullName}
                  onChange={(e) => setGuestFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 placeholder-slate-400 font-medium"
                  required
                />

                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 placeholder-slate-400 font-medium"
                  required
                />

                <div className="flex gap-2">
                  <div className="w-20 px-2 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-700 font-bold flex items-center justify-between shrink-0 select-none">
                    <span>IN +91</span>
                    <span className="text-[9px] text-slate-400">▼</span>
                  </div>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Mobile number"
                    maxLength={10}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 placeholder-slate-400 font-medium"
                    required
                  />
                </div>

                <div className="relative">
                  <select
                    value={guestDiscipline}
                    onChange={(e) => handleDisciplineChange(e.target.value)}
                    className="w-full appearance-none px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 font-medium pr-8"
                  >
                    {Object.keys(PDEU_OFFERED_PROGRAMS).map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={guestProgram}
                    onChange={(e) => setGuestProgram(e.target.value)}
                    className="w-full appearance-none px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 font-medium pr-8"
                  >
                    {(PDEU_OFFERED_PROGRAMS[guestDiscipline] || []).map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={guestState}
                    onChange={(e) => setGuestState(e.target.value)}
                    className="w-full appearance-none px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 font-medium pr-8"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>

                {guestError && (
                  <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                    <span>{guestError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 shadow-md transition-all flex items-center justify-center gap-2 group mt-1"
                >
                  <span>Start Chatting</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            )}

            {/* Footer matching exact requirement */}
            <div className="py-2.5 px-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium tracking-wide">
              Powered by Anveshan
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           ACTIVE CHAT VIEW: WhatsApp Feel (Conversational, User-Friendly & Clean)
           ========================================================================= */
        <>
          {/* WhatsApp-Style Contact Subheader / Switcher */}
          <div className="px-3.5 py-1.5 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between shrink-0 text-xs shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              {studentInfo ? (
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-2 h-2 rounded-full ${studentInfo.isPassedOut ? 'bg-amber-500' : 'bg-emerald-500'} shrink-0`} />
                  <span className="font-semibold text-slate-700 truncate text-[11px]">
                    🎓 <strong className="text-red-700">{studentInfo.rollNumber}</strong> • {studentInfo.program} (Batch {studentInfo.batch}{studentInfo.isPassedOut ? ', Passed out' : ''})
                  </span>
                </div>
              ) : guestInfo ? (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate text-[11px]">
                    👤 {guestInfo.name} • {guestInfo.program}
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 text-[11px]">PDEU Academic Explorer</span>
              )}
            </div>

            {/* Switch / Change Identity Button */}
            <button
              onClick={() => setShowIntake(true)}
              className="text-[10px] font-bold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 px-2 py-0.5 rounded-full border border-slate-200 transition-colors shadow-2xs shrink-0 flex items-center gap-1"
              title="Switch identity or log in"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Switch</span>
            </button>
          </div>

          {/* WhatsApp Chat Canvas (Wallpaper with subtle doodle micro-dots) */}
          <div
            className="flex-1 overflow-y-auto space-y-3 p-3 sm:p-4 min-h-0"
            style={{
              backgroundColor: '#efeae2',
              backgroundImage: 'radial-gradient(#d1d5db 0.75px, transparent 0.75px)',
              backgroundSize: '16px 16px'
            }}
          >
            {/* WhatsApp "Today" Date Chip */}
            <div className="flex justify-center my-1">
              <span className="bg-white/80 backdrop-blur-xs text-slate-500 text-[10px] font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-2xs border border-slate-200/50">
                Today
              </span>
            </div>

            {/* Security / Grounded Notice Chip */}
            <div className="flex justify-center mb-2">
              <div className="bg-[#fff9ea] border border-[#ffe082]/70 text-[#795548] text-[10px] px-3 py-1 rounded-lg text-center max-w-xs shadow-2xs">
                🔒 Official PDEU Grounded Engine • Verified against university handbooks & circulars
              </div>
            </div>

            {/* Initial Welcome Speech Bubble from PDEU Assistant */}
            <div className="flex flex-col items-start pr-4 max-w-[90%] sm:max-w-[85%] space-y-1.5">
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-none p-3.5 shadow-xs text-xs sm:text-sm text-slate-800 space-y-2">
                {studentInfo ? (
                  <p className="leading-relaxed">
                    Hello <strong>{studentInfo.rollNumber === '23BCP116' ? 'Dhwani Vyas' : studentInfo.rollNumber}</strong>! 👋 Welcome to <strong>PDEU Assistant</strong>.{' '}
                    {studentInfo.isPassedOut ? (
                      <>
                        I have loaded your <strong>{studentInfo.program}</strong> alumni profile for <strong>Batch {studentInfo.batch} (Passed out)</strong>.
                        <br /><br />
                        How can I assist you today? You can ask about official transcripts, degree verification, migration certificates, or PDEU alumni services!
                      </>
                    ) : (
                      <>
                        I have loaded your <strong>{studentInfo.program}</strong> academic profile for <strong>Batch {studentInfo.batch} (Semester {studentInfo.currentSemester})</strong>.
                        <br /><br />
                        How can I assist you today? You can ask about your syllabus, course prerequisites, attendance regulations, or campus placements!
                      </>
                    )}
                  </p>
                ) : guestInfo ? (
                  <p className="leading-relaxed">
                    Hello <strong>{guestInfo.name}</strong>! 👋 Welcome to <strong>Pandit Deendayal Energy University (PDEU)</strong>. I am your academic & admissions assistant for <strong>{guestInfo.program}</strong> at <strong>{guestInfo.discipline}</strong>.
                    <br /><br />
                    How may I assist you today with fees, scholarships, hostel accommodation, or the admissions process?
                  </p>
                ) : (
                  <p className="leading-relaxed">
                    Hello! 👋 Welcome to <strong>Pandit Deendayal Energy University (PDEU)</strong>. I am <strong>PDEU Assistant</strong>. Feel free to ask me anything regarding PDEU admissions, fees, syllabus, or campus life!
                  </p>
                )}

                <div className="text-[10px] text-slate-400 font-mono text-right select-none pt-0.5">
                  10:33 AM
                </div>
              </div>

              {/* Starter Quick Chips */}
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
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

            {/* Conversation Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                {/* User Message (Right Aligned Red Bubble with WhatsApp Tail and ✓✓ Checkmarks) */}
                {msg.sender === 'user' && (
                  <div className="flex flex-col items-end pl-6 sm:pl-10">
                    <div className="bg-red-600 text-white rounded-2xl rounded-tr-none px-3.5 py-2 max-w-[85%] sm:max-w-[80%] text-xs sm:text-sm font-medium shadow-xs leading-relaxed">
                      <div>{msg.content}</div>
                      {/* WhatsApp timestamp + checkmarks */}
                      <div className="flex items-center justify-end gap-1 text-[10px] text-white/80 mt-1 select-none font-mono">
                        <span>{msg.timestamp}</span>
                        <span className="text-white font-bold text-xs tracking-tighter">✓✓</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assistant Message (Left Aligned White Bubble with Tail) */}
                {msg.sender === 'assistant' && (
                  <div className="flex flex-col items-start pr-4 sm:pr-8 max-w-[92%] sm:max-w-[85%] space-y-1.5">
                    <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-none p-3.5 shadow-xs text-xs sm:text-sm text-slate-800 space-y-2">
                      <FormattedText content={msg.direct_answer || msg.content} />

                      {/* Interactive PDEU Helpdesk Card when information is not available / insufficient evidence */}
                      {(msg.status === 'INSUFFICIENT_EVIDENCE' ||
                        (msg.direct_answer &&
                          (msg.direct_answer.includes('+91 79 2327 5060') ||
                            msg.direct_answer.toLowerCase().includes('not available') ||
                            msg.direct_answer.toLowerCase().includes('could not be located')))) && (
                        <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-red-50/90 via-amber-50/60 to-red-50/50 border border-red-200/80 text-[11px] space-y-1.5 animate-in fade-in">
                          <div className="flex items-center gap-1.5 font-bold text-red-800 text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span>PDEU Official Helpdesk & Inquiries</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-tight">
                            Have specific queries not covered in handbooks? Connect directly with PDEU:
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <a
                              href="tel:+917923275060"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px] hover:bg-red-700 shadow-2xs transition-colors"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>+91 79 2327 5060</span>
                            </a>
                            <a
                              href="tel:+917923275000"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-700 font-bold text-[10px] hover:bg-red-50 shadow-2xs transition-colors"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>+91 79 2327 5000</span>
                            </a>
                            <a
                              href="tel:+917923275098"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[10px] hover:bg-slate-50 transition-colors"
                              title="Admissions Helpline"
                            >
                              <Phone className="w-2.5 h-2.5 text-slate-500" />
                              <span>Admissions: 5098</span>
                            </a>
                            <a
                              href="mailto:info@pdeu.ac.in"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[10px] hover:bg-slate-50 transition-colors"
                            >
                              <Mail className="w-2.5 h-2.5 text-slate-500" />
                              <span>info@pdeu.ac.in</span>
                            </a>
                          </div>
                        </div>
                      )}

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
                        <div className="text-[10px] text-slate-400 font-mono text-right select-none pt-0.5">
                          {msg.timestamp}
                        </div>
                      )}
                    </div>

                    {/* Follow-up Quick Chips */}
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

            {/* WhatsApp "typing..." Bubble Indicator */}
            {loading && (
              <div className="flex items-center gap-2 p-2.5 rounded-2xl rounded-tl-none border border-slate-200 bg-white text-xs text-slate-600 max-w-xs shadow-xs animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600 shrink-0" />
                <span className="font-medium text-slate-700">PDEU Assistant is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp-Style Bottom Input Bar */}
          <div className="p-2 sm:p-2.5 bg-[#f0f2f5] border-t border-slate-200/90 shrink-0 space-y-1">
            <div className="flex items-center gap-1.5">
              {/* White Pill Message Input */}
              <div className="flex-1 bg-white rounded-full border border-slate-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all px-3 py-1.5 flex items-center gap-2 shadow-2xs">
                <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0 select-none cursor-pointer hover:text-slate-600" />
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-xs sm:text-sm focus:outline-none text-slate-900 placeholder-slate-400 font-normal"
                />
              </div>

              {/* Circular Send Button (WhatsApp Style) */}
              <button
                onClick={() => handleSend()}
                disabled={!inputQuery.trim() || loading}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-sm shrink-0 active:scale-95"
                title="Send message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>

            {/* Exact Footer Text Requested */}
            <div className="text-center text-[10px] text-slate-400 font-medium pt-0.5 select-none">
              Powered by Anveshan
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
