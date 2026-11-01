'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap, Sparkles, Search, ArrowRight, CheckCircle2,
  Clock, BookOpen, Layers, ShieldCheck, UserCheck
} from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, activePersona } = useAuth();
  const studentName = user?.full_name || activePersona?.name || 'Dhwani Vyas';
  const program = user?.profile?.program || activePersona?.program || 'B.Tech';
  const department = user?.profile?.department || 'Computer Science & Engineering';
  const batch = user?.profile?.batch || activePersona?.batch || '2027';
  const currentAcademicYear = user?.profile?.current_academic_year || (batch === '2027' ? '2026-2027' : '2024-2025');
  const semester = user?.profile?.current_semester || activePersona?.semester || 7;
  const rollNumber = user?.profile?.roll_number || activePersona?.roll || '23BCSE101';
  const cgpa = user?.profile?.cgpa || (batch === '2027' ? 8.92 : 7.85);
  const completedCourses = user?.profile?.completed_courses || (
    batch === '2027'
      ? ['CS201 Data Structures', 'CS202 Discrete Mathematics', 'CS301 DBMS', 'CS302 Algorithms', 'CS303 Operating Systems', 'CS304 Networks']
      : ['CS201 Data Structures', 'CS202 Discrete Mathematics', 'CS301 DBMS', 'CS303 Operating Systems']
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-semibold uppercase">
              Academic Session {currentAcademicYear}
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs">Roll: <strong className="text-white font-mono">{rollNumber}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            Welcome, {studentName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {program} • {department} • <strong className="text-amber-400">Batch {batch}</strong> (Semester {semester})
          </p>
        </div>

        {/* CGPA & Academic Standing Badge */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shrink-0">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Verified CGPA</span>
            <span className="text-2xl font-bold font-mono text-white">{cgpa}</span>
            <span className="text-[10px] text-emerald-400 block font-medium">Clear Standing (0 Backlogs)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Ask Anveshan + Completed Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ask Anveshan & Suggested */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Advising & Enrollment Status */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">SEMESTER {semester} ENROLLMENT AUDIT</h2>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active & Verified
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Academic records for cohort <strong>Batch {batch}</strong> ({batch === '2027' ? 'Curriculum v2.1' : 'Curriculum v1.4'}). All prerequisite chains for advanced electives have been synchronized with the PDEU Examination Cell.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Elective Group III</span>
                <strong className="text-xs text-amber-300 block">CS421 Deep Learning / CS422 NLP</strong>
                <span className="text-[10px] text-emerald-400 block font-medium">✓ Prerequisite CS401 Met</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Major Project Phase-I</span>
                <strong className="text-xs text-amber-300 block">CS491 Research Dissertation</strong>
                <span className="text-[10px] text-emerald-400 block font-medium">✓ 120+ Credits Accrued</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Questions about courses or regulations? Use the assistant at the bottom right.
              </span>
              <span className="text-[10px] text-amber-400 font-mono">24x7 Academic AI</span>
            </div>
          </div>

          {/* Applicable Curriculum Overview */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">
                Enrolled Curriculum: B.Tech CSE (Batch {batch})
              </h3>
              <span className="text-xs bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded font-mono">
                {batch === '2027' ? 'Version 2.1 (Current)' : 'Version 1.4 (Legacy Scheme)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {batch === '2027'
                ? "Your cohort follows the modernized AI/Cloud aligned structure. CS401 Machine Learning is a core 4-credit requirement in Semester 7, requiring CS201 Data Structures and CS302 Algorithms."
                : "Your cohort follows the 2025 scheme where Compiler Design (CS405) was mandatory core and Machine Learning was offered as an elective."}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Context Validated</span>
              </div>
              <div>Governing Code: REG-ACAD-04</div>
            </div>
          </div>
        </div>

        {/* Right Col: Verified Completed Courses Transcript */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">
                Verified Completed Courses
              </h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                {completedCourses.length} Passed
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Anveshan references these verified course completions when evaluating prerequisite graph eligibility.
            </p>

            <div className="space-y-2">
              {completedCourses.map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-200 font-medium">{c}</span>
                  <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Completed
                  </span>
                </div>
              ))}
            </div>

            {batch === '2025' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                ⚠️ Note: CS302 Design & Analysis of Algorithms is not listed in completed records. Machine Learning prerequisite will fail.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
