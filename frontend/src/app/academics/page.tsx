'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, CheckCircle2, AlertCircle, FileText, ArrowRight, BookOpen, GraduationCap, Award, HelpCircle } from 'lucide-react';

export default function AcademicsPage() {
  const academicRules = [
    {
      code: 'REG-ACAD-04',
      title: 'Attendance Regulations (Section 4.2)',
      threshold: '80% Mandatory',
      desc: 'Aggregate 80% attendance is strictly enforced across theory lectures, tutorials, and laboratories. Students between 70% and 79% may be condoned solely on genuine medical grounds certified by the University Medical Officer.',
      below70: 'Below 70% results in immediate W grade (Withheld/Debarred from End-Semester Exams).'
    },
    {
      code: 'REG-EVAL-02',
      title: 'Grading & Examination Standards',
      threshold: '10-Point Scale',
      desc: 'Continuous internal assessment (Mid-Sem Exam, quizzes, labs, assignments) accounts for 50%, while End-Semester University Examinations account for 50%.',
      below70: 'Letter grades: O (10), A+ (9), A (8), B+ (7), B (6), C (5), P (4), F (0).'
    },
    {
      code: 'REG-DEG-01',
      title: 'B.Tech Degree Eligibility (Section 6.1)',
      threshold: '168 Total Credits',
      desc: 'Candidate must accumulate a minimum of 168 academic credits and maintain a Cumulative Performance Index (CPI) of at least 5.0 / 10.0 with 0 standing backlogs.',
      below70: 'Mandatory completion of Major Project Phase-I (CS491) & Industry Internship.'
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#e87722] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#002b49] font-semibold">Academics & Regulations</span>
        </div>

        {/* Page Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-4 border-l-8 border-l-[#002b49]">
          <div className="flex items-center gap-2">
            <span className="bg-[#e87722] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Academic Framework
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Curriculum, Degree Requirements & Regulations
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#002b49] leading-tight">
            Academic Regulations & Degree Guidelines
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Pandit Deendayal Energy University enforces rigorous academic standards, continuous evaluation, and a transparent credit-based semester system across all constituent undergraduate, postgraduate, and doctoral programs.
          </p>
        </div>

        {/* Academic Rules Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {academicRules.map((rule, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold bg-[#002b49]/10 text-[#002b49] px-2.5 py-1 rounded">
                    {rule.code}
                  </span>
                  <span className="text-xs font-bold text-[#e87722]">
                    {rule.threshold}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#002b49] font-serif">
                  {rule.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {rule.desc}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium">
                {rule.below70}
              </div>
            </div>
          ))}
        </div>

        {/* Conflict & Concession Alert Banner */}
        <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>Active Policy Interaction: Attendance Relaxation for Hackathons</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            While parent regulation <strong>REG-ACAD-04</strong> establishes an 80% attendance mandate, university <strong>Circular 2026/04</strong> permits a 75% relaxation for students representing PDEU in national hackathons or sports competitions with prior written endorsement from the HOD. Anveshan highlights both provisions to prevent debarment surprises.
          </p>
          <div className="pt-1">
            <Link
              href="/notices"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002b49] hover:text-[#e87722] underline underline-offset-2"
            >
              <span>View Official Circular 2026/04 Gazette</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Academic Exploration Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#002b49] to-[#0c406b] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border-l-8 border-l-[#e87722]">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-serif">Explore Department Curricula & Syllabi</h3>
            <p className="text-xs text-slate-200">Inspect full degree credit breakdowns, course outlines, and elective offerings across all PDEU schools.</p>
          </div>
          <Link
            href="/departments"
            className="px-6 py-3 rounded-full bg-[#e87722] hover:bg-[#d96711] text-white font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-md"
          >
            <span>Explore Department Programs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
