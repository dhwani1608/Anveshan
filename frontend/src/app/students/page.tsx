import React from 'react';
import Link from 'next/link';
import { Users, GraduationCap, Calendar, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';

export default function StudentsPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Student Resources
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white">
          Student Services & Academic Advising
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Access your personalized academic transcripts, course registration portals, and the Anveshan AI assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Student Dashboard</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            View your active admission cohort, registered semester courses, verified CGPA, and completed prerequisites.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Academic Calendar</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Key dates for Odd Semester 2026-2027: Mid-Semester Exams, End-Semester Practical Defense, and Project Submission.
          </p>
          <Link
            href="/notices"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <span>View Calendar Notices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Anveshan Assistant</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instant answers tailored to your specific cohort. Verify course eligibility without waiting for faculty office hours.
          </p>
          <Link
            href="/assistant"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Ask Anveshan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
