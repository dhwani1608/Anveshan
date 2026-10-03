import React from 'react';
import Link from 'next/link';
import { Award, Compass, Shield, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          About Pandit Deendayal Energy University
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white">
          A Legacy of Academic Excellence & Innovation
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Established in Gandhinagar, Gujarat, PDEU has emerged as one of India's premier technical universities, accredited with NAAC A++ grade.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">NAAC A++ Accreditation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ranked among the topmost technical and energy universities in India, recognized for research output, modern laboratories, and industry immersion.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Constituent Schools</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Home to School of Technology (SOT), School of Energy Technology (SOET), School of Liberal Studies (SLS), and School of Petroleum Management (SPM).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Anveshan Intelligence</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The university pioneers next-generation AI governance by deploying Anveshan to unify academic regulations, course graphs, and student eligibility.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white font-serif">Have questions about university rules?</h3>
          <p className="text-xs text-slate-400">Ask Anveshan directly for verified, cohort-specific answers.</p>
        </div>
        <Link
          href="/assistant"
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shrink-0"
        >
          <span>Ask Anveshan</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
