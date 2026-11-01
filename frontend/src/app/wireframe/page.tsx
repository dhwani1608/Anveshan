'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, ShieldCheck, Zap, BarChart3, Clock, ArrowRight,
  CheckCircle2, AlertTriangle, HelpCircle, Layers, Users, BookOpen,
  Filter, Cpu, Compass, Activity, BrainCircuit
} from 'lucide-react';

export default function WireframeFlowPage() {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [activePersona, setActivePersona] = useState<'dhwani' | 'rohan'>('dhwani');
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const stages = [
    {
      id: 1,
      title: '1. Portal & 3-Hr Deployment',
      subtitle: 'USP #1: Live in 3 hrs, perfected in 7 days',
      badge: 'Speed',
      color: 'border-amber-500 text-amber-400'
    },
    {
      id: 2,
      title: '2. Persona & Cohort Filtering',
      subtitle: 'Context-Aware Curriculum Resolution',
      badge: 'Context',
      color: 'border-blue-500 text-blue-400'
    },
    {
      id: 3,
      title: '3. Zero-Hallucination Engine',
      subtitle: 'USP #2: 3-State Truth Reliability Guarantee',
      badge: 'Reliability',
      color: 'border-emerald-500 text-emerald-400'
    },
    {
      id: 4,
      title: '4. Questions → Business Intel',
      subtitle: 'USP #3: Transforming chat inquiries into strategy',
      badge: 'Intelligence',
      color: 'border-purple-500 text-purple-400'
    },
    {
      id: 5,
      title: '5. User Interaction Telemetry',
      subtitle: 'USP #4: Deep session time & interaction depth analytics',
      badge: 'Analytics',
      color: 'border-rose-500 text-rose-400'
    }
  ];

  const handleSimulate = (type: string) => {
    if (type === 'ml') {
      if (activePersona === 'dhwani') {
        setSimulationResult("ANSWERED: Yes, you are eligible for CS401 Machine Learning in Semester 7. Both prerequisites CS201 Data Structures and CS302 Algorithms were passed with Grade A in your verified transcript. Citation: B.Tech CSE Curriculum 2027 v2.1, Page 24.");
      } else {
        setSimulationResult("INELIGIBLE: You cannot register for CS401 Machine Learning. Your completed courses record shows you are missing mandatory prerequisite CS302 Design & Analysis of Algorithms. Citation: Legacy B.Tech Curriculum 2025, Page 18.");
      }
    } else if (type === 'attendance') {
      setSimulationResult("CONFLICT_DETECTED: Discrepancy flagged between Academic Regulation REG-ACAD-04 (Mandatory 80% attendance) and Circular 2026/04 (75% concession for national hackathons). Anveshan highlights both sources for Dean review.");
    } else if (type === 'mess') {
      setSimulationResult("INSUFFICIENT_EVIDENCE: I cannot determine the answer from the verified PDEU academic knowledge base. Zero hallucination enforced — Anveshan will never invent catering schedules or unverified policies.");
    } else if (type === 'courses') {
      setSimulationResult("ANSWERED: Semester 7 (Batch 2027) includes 3 Core Courses (CS401 ML, CS402 Cloud & DevOps, CS403 InfoSec), 1 Professional Elective Group III (Deep Learning/NLP), and CS491 Major Project Phase-I.");
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider">
              Interactive User Flow Wireframe
            </span>
            <span className="text-xs text-slate-500 font-mono">• PDEU MVP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
            ANVESHAN: High-Fidelity User Flow & 4 Core USPs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Walk step-by-step through the real user journey: from PDEU website browsing to cohort context filtering, anti-hallucination guardrails, and executive decision intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <span>PDEU Portal Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
          >
            <span>Admin View</span>
          </Link>
        </div>
      </div>

      {/* Stage Stepper Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stages.map((st) => {
          const isActive = activeStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setActiveStage(st.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg scale-[1.02]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider">
                <span>Stage 0{st.id}</span>
                <span className={`px-1.5 py-0.2 rounded font-bold ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                  {st.badge}
                </span>
              </div>
              <div className="text-xs font-semibold leading-tight line-clamp-2">
                {st.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Stage Views */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">

        {/* STAGE 1: Portal & 3-Hr Deployment */}
        {activeStage === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-sm text-amber-300 block">
                  USP #1: Live chatbot at your fingertips in 3 hours, perfected in 7 days
                </strong>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Traditional enterprise AI takes months of data preparation. Anveshan takes raw organizational URLs and PDFs, parses them into chunks, builds the hybrid vector + knowledge graph layer, and deploys both an embedded hero smart search and a floating copilot within 3 hours. Human feedback continuously refines it over 7 days.
                </p>
              </div>
            </div>

            {/* Wireframe Mockup */}
            <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono text-slate-400">
                <span>UI Mockup: PDEU Official Portal (Cloned from pdeu.ac.in)</span>
                <span className="text-emerald-400">Deployment Status: Live</span>
              </div>

              {/* Header Wireframe */}
              <div className="bg-white p-3 rounded-xl flex items-center justify-between text-slate-900 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#002b49] text-[#e87722] flex items-center justify-center font-bold font-serif">P</div>
                  <div>
                    <strong className="text-xs font-serif block text-[#002b49]">PANDIT DEENDAYAL ENERGY UNIVERSITY</strong>
                    <span className="text-[10px] text-slate-500">Gandhinagar, Gujarat</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-semibold text-slate-700">
                  <span>About</span>
                  <span>Academics</span>
                  <span>Admissions</span>
                  <span className="bg-[#e87722] text-white px-2.5 py-1 rounded-full text-[11px] font-bold">
                    Ask Anveshan AI
                  </span>
                </div>
              </div>

              {/* Hero Banner Wireframe with AI search */}
              <div className="bg-[#002b49] text-white p-6 rounded-2xl space-y-3 border-2 border-dashed border-[#e87722]">
                <span className="bg-[#e87722] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  USP 1 INTEGRATION
                </span>
                <h3 className="text-xl font-serif font-black">
                  Explore PDEU Knowledge with Verified Cognitive Intelligence
                </h3>
                <div className="bg-white rounded-xl p-2 flex items-center gap-2 text-slate-800">
                  <span className="text-amber-500 text-xs ml-1">🔍</span>
                  <span className="text-xs text-slate-400 flex-1">"Can I take Machine Learning next semester?"</span>
                  <button onClick={() => setActiveStage(2)} className="px-3 py-1.5 rounded-lg bg-[#e87722] text-white font-bold text-xs">
                    Try Query →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: Cohort Context Resolution */}
        {activeStage === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
              <Layers className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-sm text-blue-300 block">
                  Context Resolution: Cohort-Aware Knowledge Retrieval
                </strong>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generic AI hallucinates because it treats an entire organization as one flat document. Anveshan binds the student's admission batch (2027 vs 2025) and transcript to ensure the retrieval engine searches exclusively applicable regulations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Persona Toggle */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select User Context to Test
                </h4>

                <div className="space-y-2">
                  <div
                    onClick={() => { setActivePersona('dhwani'); setSimulationResult(null); }}
                    className={`cursor-pointer p-3.5 rounded-xl border text-xs space-y-1 transition-all ${
                      activePersona === 'dhwani'
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>Dhwani Vyas (Batch 2027)</span>
                      <span className="text-amber-300 font-mono text-[11px]">Sem 7 • CPI 8.92</span>
                    </div>
                    <p className="text-[11px] text-emerald-400">✓ Completed CS201 Data Structures & CS302 Algorithms</p>
                  </div>

                  <div
                    onClick={() => { setActivePersona('rohan'); setSimulationResult(null); }}
                    className={`cursor-pointer p-3.5 rounded-xl border text-xs space-y-1 transition-all ${
                      activePersona === 'rohan'
                        ? 'bg-amber-500/10 border-amber-500/50 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>Rohan Patel (Batch 2025)</span>
                      <span className="text-slate-400 font-mono text-[11px]">Sem 7 • CPI 7.85</span>
                    </div>
                    <p className="text-[11px] text-rose-400">✕ Missing CS302 Algorithms Prerequisite</p>
                  </div>
                </div>
              </div>

              {/* Inquiry Simulator */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Trigger Test Queries
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button onClick={() => handleSimulate('ml')} className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-slate-200">
                    "Can I take Machine Learning?"
                  </button>
                  <button onClick={() => handleSimulate('attendance')} className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-slate-200">
                    "What is attendance rule?"
                  </button>
                  <button onClick={() => handleSimulate('mess')} className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-slate-200">
                    "Hostel mess menu?"
                  </button>
                  <button onClick={() => handleSimulate('courses')} className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-slate-200">
                    "Which Sem 7 courses?"
                  </button>
                </div>

                {simulationResult && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 text-xs text-slate-200 leading-relaxed space-y-1">
                    <strong className="text-amber-300 block text-[11px] uppercase">Engine Output:</strong>
                    <div>{simulationResult}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: Zero-Hallucination Reliability */}
        {activeStage === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-sm text-emerald-300 block">
                  USP #2: Reliability — If we don't have the answer, we won't give it. We will never hallucinate.
                </strong>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Anveshan categorizes every single response into one of three strict states. It provides verifiable evidence or clearly explains why it cannot answer.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3">
                <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 w-fit">
                  STATE 1: ANSWERED
                </div>
                <h4 className="text-sm font-bold text-white">Full Grounded Evidence</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Answers backed by verbatim text excerpts, page numbers, and authoritative status badges.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 text-[11px] text-slate-300 font-mono">
                  Citation: B.Tech CSE Curriculum 2027 v2.1 • p. 24
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-3">
                <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 w-fit">
                  STATE 2: CONFLICT DETECTED
                </div>
                <h4 className="text-sm font-bold text-white">Contradiction Warning</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When two official documents disagree (e.g. 80% regulation vs 75% hackathon circular), it displays both side-by-side.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 text-[11px] text-rose-300 font-mono">
                  REG-ACAD-04 (80%) vs Circular 2026/04 (75%)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3">
                <div className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 w-fit">
                  STATE 3: INSUFFICIENT EVIDENCE
                </div>
                <h4 className="text-sm font-bold text-white">Transparent Refusal</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If the answer is not in the organization's verified documents (e.g. hostel mess menu), it explicitly refuses rather than guessing.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 text-[11px] text-amber-300 font-mono">
                  0% Hallucination Tolerance Guaranteed
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: Questions to Business Intelligence */}
        {activeStage === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
              <BrainCircuit className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-sm text-purple-300 block">
                  USP #3: We convert questions (data) to business intelligence for convenience
                </strong>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every user inquiry is an unsolicited data point on student demand, policy friction, and operational bottlenecks. Anveshan aggregates these questions into executive decision insights.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500">Executive Insight 1</span>
                <h4 className="text-base font-bold text-white">Elective Demand Forecast</h4>
                <div className="text-2xl font-bold font-mono text-amber-400">842 Inquiries</div>
                <p className="text-xs text-slate-400">
                  CS401 Machine Learning has 3.4x more demand than Cloud Computing.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-300">
                  <strong>Decision:</strong> Open 2 additional elective lab sections before enrollment opens.
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500">Executive Insight 2</span>
                <h4 className="text-base font-bold text-white">Policy Ambiguity Alert</h4>
                <div className="text-2xl font-bold font-mono text-rose-400">612 Inquiries</div>
                <p className="text-xs text-slate-400">
                  Confusion regarding attendance relaxation thresholds during exam weeks.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-300">
                  <strong>Decision:</strong> Dean Academics issued clarifying addendum to all students.
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500">Executive Insight 3</span>
                <h4 className="text-base font-bold text-white">Prerequisite Block Rate</h4>
                <div className="text-2xl font-bold font-mono text-blue-400">19.4% Blocked</div>
                <p className="text-xs text-slate-400">
                  Students blocked from AI courses due to missing CS302 Algorithms.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-300">
                  <strong>Decision:</strong> Offer fast-track bridge course during summer semester.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5: User Interaction Telemetry */}
        {activeStage === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <Activity className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-sm text-rose-300 block">
                  USP #4: Deep analysis of user interactions (time spent, questions asked, chat sessions)
                </strong>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-time telemetry tracking engagement depth, question complexity, source inspection frequency, and satisfaction ratings across cohorts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Avg Chat Dwell Time</span>
                <div className="text-2xl font-bold font-mono text-white">3m 42s</div>
                <span className="text-[10px] text-emerald-400">High Engagement</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono">First-Touch Resolution</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">92.6%</div>
                <span className="text-[10px] text-slate-400">1-Query Answers</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Citation Click Rate</span>
                <div className="text-2xl font-bold font-mono text-amber-400">41.8%</div>
                <span className="text-[10px] text-slate-400">Source Verifications</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Peak Inquiries</span>
                <div className="text-2xl font-bold font-mono text-purple-400">7 PM – 11 PM</div>
                <span className="text-[10px] text-slate-400">After Lecture Hours</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Cohort</th>
                    <th className="p-3.5">Queries</th>
                    <th className="p-3.5">Avg Dwell Time</th>
                    <th className="p-3.5">Top Topic</th>
                    <th className="p-3.5">Satisfaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-3.5 font-bold text-amber-400">Batch 2027 (Final Year)</td>
                    <td className="p-3.5 font-mono">1,842</td>
                    <td className="p-3.5 font-mono">4m 12s</td>
                    <td className="p-3.5">CS401 ML Eligibility & Capstone Defense</td>
                    <td className="p-3.5 font-bold text-emerald-400">4.8 / 5.0</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-300">Batch 2025 (Legacy)</td>
                    <td className="p-3.5 font-mono">614</td>
                    <td className="p-3.5 font-mono">2m 45s</td>
                    <td className="p-3.5">Internship Credit Equivalence</td>
                    <td className="p-3.5 font-bold text-emerald-400">4.6 / 5.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
