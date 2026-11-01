'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, FileText, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, Download, ExternalLink } from 'lucide-react';

export default function NoticesPage() {
  const notices = [
    {
      type: 'CONFLICT_ALERT',
      badge: 'Circular No. 2026/04',
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-300',
      date: '15th January 2026',
      title: 'Attendance Concession Guidelines for University-Sanctioned Extra-Curricular Events and Technical Hackathons',
      desc: 'Students formally representing PDEU in national hackathons (such as Smart India Hackathon) or inter-university sports championships may be granted an attendance relaxation reducing the mandatory attendance threshold from 80% down to 75%, subject to prior written approval from the Faculty Mentor and Head of Department.',
      note: 'Notice: This circular introduces a 75% relaxation that interacts with statutory Regulation REG-ACAD-04 (80%). Anveshan actively alerts students to secure written approval.'
    },
    {
      type: 'STATUTORY',
      badge: 'Academic Code REG-ACAD-04',
      badgeColor: 'bg-[#002b49]/10 text-[#002b49] border-[#002b49]/20',
      date: 'Continuous Standing Rule',
      title: 'Statutory Minimum Attendance Mandate for B.Tech Candidates',
      desc: 'Every undergraduate candidate enrolled in B.Tech programs must secure a strict minimum attendance of 80% in aggregate across lectures, tutorials, and practical sessions. Students with attendance between 70% and 79% may be condoned solely on genuine medical grounds certified by the University CMO.',
      note: 'Sanction: Attendance below 70% results in immediate W (Withheld/Debarred) grade and debarment from End-Semester Examinations.'
    },
    {
      type: 'REGULATION',
      badge: 'UGC & PDEU Policy',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      date: 'Mandatory Annual Protocol',
      title: 'Zero Tolerance Anti-Ragging Policy & National Helpline Protocol',
      desc: 'PDEU strictly enforces a zero-tolerance policy against any form of ragging or harassment across academic blocks, student hostels, and campus transit. Any student found guilty faces immediate expulsion, debarment from placements, and criminal FIR with Gandhinagar Police.',
      note: '24x7 National Anti-Ragging Toll-Free Helpline: 1800-180-5522 | helpline@antiragging.in'
    },
    {
      type: 'ACADEMIC_ORDER',
      badge: 'Academic Affairs Notice',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      date: 'Odd Semester 2026-2027',
      title: 'Professional Elective Group III Selection for B.Tech CSE (Batch 2027)',
      desc: 'Final-year students may register for CS421 Deep Learning & Computer Vision or CS422 NLP. Prerequisites (CS401 Machine Learning) are validated dynamically prior to enrollment approval.',
      note: 'Deadline for online submission via ERP: 15th August 2026.'
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#e87722] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#002b49] font-semibold">Official Notices & Circulars</span>
        </div>

        {/* Page Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-4 border-l-8 border-l-[#002b49]">
          <div className="flex items-center gap-2">
            <span className="bg-[#e87722] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Notice Board
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Academic Affairs & Student Welfare
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#002b49] leading-tight">
            Official Circulars & Regulatory Notices
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            All notifications, regulatory codes, and departmental memorandums published here are verified and indexed by Anveshan to give you accurate, citation-backed answers.
          </p>
        </div>

        {/* Notices Stream */}
        <div className="space-y-6">
          {notices.map((n, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className={`px-3 py-1 rounded-full font-bold border ${n.badgeColor}`}>
                  {n.badge}
                </span>
                <span className="text-slate-500 font-medium">{n.date}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-serif font-black text-[#002b49] leading-snug">
                {n.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {n.desc}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium leading-relaxed">
                {n.note}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-[#002b49]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official University Record • Grounded in Knowledge Base</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Status: Active & Enforced</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
