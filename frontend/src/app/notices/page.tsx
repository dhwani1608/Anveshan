import React from 'react';
import Link from 'next/link';
import { Bell, FileText, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function NoticesPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Campus Circulars & Orders
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white">
          Official University Notices
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Official circulars, regulatory announcements, and administrative memorandums published by Academic Affairs.
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Notice 1: Conflict Source B */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-rose-900/50 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Circular No. 2026/04 (Active)
            </span>
            <span className="text-slate-400">15th January 2026</span>
          </div>
          <h3 className="text-lg font-bold text-white font-serif">
            Attendance Concession Guidelines for University-Sanctioned Extra-Curricular Events and Technical Hackathons
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Students representing PDEU in national-level technical hackathons (including Smart India Hackathon) or inter-university sports championships may be granted an attendance concession reducing the required minimum attendance threshold from <strong>80% down to 75%</strong>, subject to prior endorsement from Faculty Mentor and HOD approval.
          </p>
          <div className="text-[11px] text-amber-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            * Anveshan Notice: This circular introduces a 75% concession that conflicts with statutory Regulation REG-ACAD-04 (80%).
          </div>
        </div>

        {/* Notice 2: Statutory Regulation REG-ACAD-04 */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
              Regulation REG-ACAD-04
            </span>
            <span className="text-slate-400">Continuous Enforcement</span>
          </div>
          <h3 className="text-lg font-bold text-white font-serif">
            Statutory Attendance Code for B.Tech Candidates
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every candidate must secure a strict minimum attendance of <strong>80%</strong> in aggregate across all registered courses. Students falling between 70% and 79% may only be condoned on genuine certified medical grounds approved by the Director SOT. Below 70% incurs Withheld grade.
          </p>
        </div>

        {/* Notice 3: Elective Registration */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-semibold">
              Academic Affairs Order
            </span>
            <span className="text-slate-400">28th September 2026</span>
          </div>
          <h3 className="text-lg font-bold text-white font-serif">
            Odd Semester 2026-2027 Professional Elective Group III Selection
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Final-year B.Tech CSE students (Batch 2027) may submit their elective preferences for Deep Learning (CS421) or NLP (CS422). Prerequisites will be validated automatically through the transcript database.
          </p>
        </div>
      </div>
    </div>
  );
}
