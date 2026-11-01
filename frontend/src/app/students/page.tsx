'use client';

import React from 'react';
import Link from 'next/link';
import { Users, GraduationCap, Calendar, BookOpen, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Phone, Mail, Award } from 'lucide-react';

export default function StudentsPage() {
  const quotas = [
    {
      title: 'ACPC Gujarat Seats (50% Quota)',
      tag: 'State Quota',
      desc: 'Administered through the Admission Committee for Professional Courses (ACPC), Government of Gujarat.',
      criteria: 'Qualified GUJCET + 10+2 with Physics, Mathematics & Chemistry/CS from Gujarat Board or CBSE/ICSE in Gujarat.',
      portal: 'acpc.gujarat.gov.in'
    },
    {
      title: 'All India JEE (Main) Seats (50% Quota)',
      tag: 'National Quota',
      desc: 'Direct admissions conducted by PDEU based on the Common Rank List (CRL) in JEE (Main).',
      criteria: 'Valid JEE (Main) CRL + Minimum 45% aggregate in 10+2 PCM (40% for SC/ST candidates).',
      portal: 'pdeu.ac.in/admissions'
    },
    {
      title: 'NRI / Sponsored Seats (15% Quota)',
      tag: 'Supernumerary',
      desc: 'Reserved for Non-Resident Indians (NRIs), Overseas Citizens of India (OCI), and Persons of Indian Origin (PIO).',
      criteria: 'Evaluated on high school academic transcript grades and SAT score benchmarks.',
      portal: 'pdeu.ac.in/international'
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#e87722] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#002b49] font-semibold">Admissions & Student Life</span>
        </div>

        {/* Page Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-4 border-l-8 border-l-[#002b49]">
          <div className="flex items-center gap-2">
            <span className="bg-[#e87722] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              Admissions 2026-27 Open
            </span>
            <span className="text-xs text-slate-500 font-medium">
              B.Tech • M.Tech • MBA • M.A. • Ph.D.
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#002b49] leading-tight">
            Admissions, Student Portal & Campus Life
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Welcome prospective candidates and enrolled PDEU students. Explore official seat distribution quotas, eligibility rules, and personalized academic services powered by the Anveshan AI assistant.
          </p>
        </div>

        {/* Quota Distribution */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e87722]">
              Seat Allocation
            </span>
            <h2 className="text-2xl font-serif font-black text-[#002b49] mt-0.5">
              B.Tech Admission Channels & Eligibility
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quotas.map((q, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#002b49]/10 text-[#002b49] px-2.5 py-1 rounded">
                      {q.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#002b49] font-serif">
                    {q.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {q.desc}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    <strong className="text-slate-700 block">Eligibility:</strong>
                    {q.criteria}
                  </div>
                  <div className="text-[11px] font-mono text-[#e87722] font-semibold">
                    Portal: {q.portal}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enrolled Student Resources (Dashboard, ERP, Anveshan) */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e87722]">
              Enrolled Students
            </span>
            <h2 className="text-2xl font-serif font-black text-[#002b49] mt-0.5">
              Personalized Student Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#002b49] text-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="font-bold text-[#002b49] text-base">Student ERP & Transcript</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Log in to inspect your enrolled cohort (Batch 2027 / 2025), completed prerequisites, and GPA standing.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002b49] hover:text-[#e87722] pt-2"
              >
                <span>Open Student Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#e87722] text-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#002b49] text-base">Curriculum & Course Outlines</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluate next semester course choices, syllabus prerequisites, and credit rules across all cohorts.
                </p>
              </div>
              <Link
                href="/academics"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e87722] hover:text-[#d96711] pt-2"
              >
                <span>Explore Curricula & Handbooks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#002b49] text-base">Anti-Ragging Protocol</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Zero tolerance harassment policy. 24x7 National Helpline (1800-180-5522) and university grievance cell.
                </p>
              </div>
              <Link
                href="/notices"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2"
              >
                <span>Read Anti-Ragging Policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Admissions Helpdesk Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#002b49] to-[#0c406b] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border-l-8 border-l-[#e87722]">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-serif">Have questions regarding cutoffs, counseling, or fees?</h3>
            <p className="text-xs text-slate-200">Admissions helpline: +91 79 2327 5060 / 5077 • Email: btechadmission@pdeu.ac.in</p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-full bg-[#e87722] hover:bg-[#d96711] text-white font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-md"
          >
            <span>Contact Admissions Office</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
