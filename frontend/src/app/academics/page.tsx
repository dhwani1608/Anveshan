import React from 'react';
import Link from 'next/link';
import { Layers, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';

export default function AcademicsPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Academic Structure & Policies
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white">
          Undergraduate Degree Framework
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Comprehensive curriculum structure for the 4-Year Bachelor of Technology (B.Tech) degree governed by official university regulations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Regulations */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <FileText className="w-4 h-4" />
            <span>Academic Code: REG-ACAD-04</span>
          </div>
          <h3 className="text-xl font-bold text-white font-serif">Minimum Attendance Mandate</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every candidate must secure a strict minimum attendance of <strong>80%</strong> in aggregate across all lectures, tutorials, and practical sessions. Students with attendance between 70% and 79% may be condoned solely on genuine medical grounds certified by the University Medical Officer.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400">
            <strong>Below 70% Threshold:</strong> Results in immediate 'W' (Withheld/Debarred) grade, requiring re-registration in the subsequent cycle.
          </div>
        </div>

        {/* Degree Requirements */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Graduation Benchmark</span>
          </div>
          <h3 className="text-xl font-bold text-white font-serif">Credit & CPI Requirements</h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>168 Minimum Credits:</strong> Required across 8 academic semesters.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Minimum CPI:</strong> Cumulative Performance Index of 5.0 / 10.0 with 0 backlogs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Capstone Requirement:</strong> Successful defense of CS491 Major Project Phase-I and Phase-II.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Ask Anveshan banner */}
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-300">Need clarification on your specific batch curriculum?</h4>
          <p className="text-xs text-slate-400">Anveshan automatically extracts the right curriculum based on your admission year.</p>
        </div>
        <Link
          href="/assistant?q=Which%20regulations%20apply%20to%20my%20batch%3F"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
        >
          <span>Ask Anveshan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
