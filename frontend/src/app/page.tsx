'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Search, ArrowRight, ShieldCheck, BookOpen, Layers,
  GraduationCap, Bell, CheckCircle2, ChevronRight, Award, Compass,
  Building2, Flame, Users, Briefcase, ExternalLink, Lightbulb, Scale
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { activePersona } = useAuth();

  const schools = [
    {
      code: 'SoT',
      name: 'School of Technology',
      desc: 'B.Tech in Computer Science & Engineering, ICT, Chemical, Mechanical, Civil & Electrical.',
      href: '/departments',
      icon: Building2,
      color: 'border-l-4 border-l-[#002b49]'
    },
    {
      code: 'SoET',
      name: 'School of Energy Technology',
      desc: 'Programs in Petroleum Engineering, Solar & Renewable Energy, Energy Storage & Sustainability.',
      href: '/departments',
      icon: Flame,
      color: 'border-l-4 border-l-[#e87722]'
    },
    {
      code: 'SoM',
      name: 'School of Management (SPM)',
      desc: 'MBA in Energy & Infrastructure, General Management, Analytics and Executive PGDM.',
      href: '/departments',
      icon: Briefcase,
      color: 'border-l-4 border-l-[#002b49]'
    },
    {
      code: 'SLS',
      name: 'School of Liberal Studies',
      desc: 'Undergraduate & Postgraduate honors in Economics, Psychology, Public Administration & BBA.',
      href: '/departments',
      icon: BookOpen,
      color: 'border-l-4 border-l-[#e87722]'
    },
    {
      code: 'SoL',
      name: 'School of Law',
      desc: 'Integrated 5-Year BA LL.B (Hons), BBA LL.B (Hons), and specialized LL.M programs.',
      href: '/departments',
      icon: Scale,
      color: 'border-l-4 border-l-[#002b49]'
    }
  ];

  return (
    <div className="flex flex-col w-full bg-slate-50 text-slate-800">
      {/* 1. Official Announcements Marquee / Ticker */}
      <div className="bg-[#0c2340] text-white py-2 px-4 border-b border-[#1b3d63] text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="flex items-center gap-1 bg-[#e87722] text-white font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded shrink-0">
            <Bell className="w-3 h-3" />
            Notice
          </span>
          <div className="overflow-x-auto whitespace-nowrap text-slate-200 text-xs flex items-center gap-6 py-0.5">
            <Link href="/notices" className="hover:text-amber-400 transition-colors">
              📢 <strong>Circular 2026/04:</strong> Attendance Concession for National Hackathons & Sports Delegations.
            </Link>
            <span className="text-slate-500">•</span>
            <Link href="/notices" className="hover:text-amber-400 transition-colors">
              📢 <strong>REG-ACAD-04:</strong> Strict 80% Minimum Attendance Mandate for End-Semester Exam Eligibility.
            </Link>
            <span className="text-slate-500">•</span>
            <Link href="/students" className="hover:text-amber-400 transition-colors">
              📢 <strong>Admissions 2026-27:</strong> B.Tech, M.Tech, and MBA Online Registrations Open Now.
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Hero Section (PDEU Authentic Style) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#002b49] via-[#083861] to-[#002b49] text-white py-16 sm:py-24 border-b-4 border-[#e87722]">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Accreditation Tagline */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#e87722] text-white text-xs font-bold px-3 py-1 rounded shadow-sm uppercase tracking-wide">
              NAAC 'A++' Accredited
            </span>
            <span className="text-xs text-slate-300 font-medium tracking-wide">
              CGPA 3.52/4.0 • Ranked Among Top Technical Universities in India • NIRF Top 100
            </span>
          </div>

          {/* Hero Headlines */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-tight">
              PANDIT DEENDAYAL <br />
              <span className="text-[#e87722]">ENERGY UNIVERSITY</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-200 font-light max-w-2xl leading-relaxed">
              Empowering global leaders across Technology, Clean Energy, Management, and Liberal Studies with cutting-edge academic excellence.
            </p>
          </div>

          {/* Hero University Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#e87722] tracking-wider block">NIRF Ranking</span>
              <strong className="text-xl sm:text-2xl font-bold font-mono text-white">Top 100</strong>
              <span className="text-[11px] text-slate-300 block">Engineering & University</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">Highest Package</span>
              <strong className="text-xl sm:text-2xl font-bold font-mono text-white">₹42.00 LPA</strong>
              <span className="text-[11px] text-slate-300 block">B.Tech Engineering & CSE</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#e87722] tracking-wider block">Campus Spread</span>
              <strong className="text-xl sm:text-2xl font-bold font-mono text-white">100 Acres</strong>
              <span className="text-[11px] text-slate-300 block">Knowledge Corridor, Gandhinagar</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">Average CTC</span>
              <strong className="text-xl sm:text-2xl font-bold font-mono text-white">₹8.50 LPA</strong>
              <span className="text-[11px] text-slate-300 block">Annual University Average</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/students"
              className="px-6 py-3.5 rounded-xl bg-[#e87722] hover:bg-[#d96711] text-white font-bold text-xs sm:text-sm shadow-lg transition-all"
            >
              Admissions 2026-27 (ACPC & JEE)
            </Link>
            <Link
              href="/departments"
              className="px-6 py-3.5 rounded-xl bg-white text-[#002b49] hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition-colors"
            >
              Explore Schools & Programs
            </Link>
            <Link
              href="/academics"
              className="px-6 py-3.5 rounded-xl bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold text-xs sm:text-sm transition-colors"
            >
              Academic Regulations & Handbooks
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl bg-[#002b49] border border-amber-500/40 text-amber-300 hover:bg-[#003865] font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal ({activePersona?.name || 'Dhwani Vyas'})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. University Distinction Numbers Bar */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-slate-100">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black font-serif text-[#002b49]">NAAC A++</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Accreditation (CGPA 3.52)</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black font-serif text-[#e87722]">100+ Crore</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Funded Research Projects</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black font-serif text-[#002b49]">100+ Hi-Tech</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Research & Computing Labs</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black font-serif text-[#e87722]">₹42 LPA</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Highest Placement Package</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Constituent Schools (PDEU Flagship Structure) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e87722]">
                Academic Excellence
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#002b49] mt-1">
                Our Constituent Schools
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-1">
                PDEU offers multidisciplinary education through 5 specialized schools, integrating technical rigor with management and humanistic perspectives.
              </p>
            </div>
            <Link
              href="/departments"
              className="text-xs font-bold text-[#002b49] hover:text-[#e87722] flex items-center gap-1 shrink-0"
            >
              <span>View All Departments</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${s.color}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#002b49]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">{s.code}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#002b49] font-serif">{s.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e87722] hover:text-[#d96711] pt-2 border-t border-slate-100"
                  >
                    <span>View Programs & Faculty</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}

            {/* 6th Card: Research & Innovation Centers */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#002b49] to-[#0c406b] text-white shadow-md flex flex-col justify-between space-y-4 border-l-4 border-l-[#e87722]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#e87722] flex items-center justify-center text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-white/20 text-white px-2 py-0.5 rounded font-bold">
                    Innovation
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif">Centers of Excellence & Research</h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  World-class translational facilities including the Siemens Centre of Excellence in Industry 4.0, 45 MW Solar Park, and Innovation & Incubation Centre (IIC).
                </p>
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white pt-2 border-t border-white/10"
              >
                <span>Explore Research & Labs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Department of Computer Science & Engineering Spotlight */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e87722]">
                School of Technology (SoT)
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#002b49] leading-tight">
                Department of Computer Science & Engineering
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The Department of CSE at PDEU offers world-class undergraduate and postgraduate programs specializing in Artificial Intelligence, Cloud Systems, and Cyber Security.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="block text-[#002b49] font-bold">160 Credits</strong>
                  <span className="text-slate-500 text-[11px]">B.Tech Degree Requirement</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="block text-[#e87722] font-bold">Batch 2027 v2.1</strong>
                  <span className="text-slate-500 text-[11px]">Active AI/ML Curriculum</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="block text-[#002b49] font-bold">GPU Supercomputing</strong>
                  <span className="text-slate-500 text-[11px]">AI & Deep Learning Facility</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="block text-[#e87722] font-bold">Strict 80% Rule</strong>
                  <span className="text-slate-500 text-[11px]">Academic Code REG-ACAD-04</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/departments"
                  className="px-5 py-2.5 rounded-xl bg-[#002b49] hover:bg-[#003865] text-white font-bold text-xs transition-colors shadow-sm"
                >
                  View CSE Syllabus & Labs
                </Link>
                <Link
                  href="/academics"
                  className="text-xs font-bold text-[#e87722] hover:text-[#d96711] flex items-center gap-1"
                >
                  <span>Academic Handbooks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Card: Department Placement & Industry Marquee */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#002b49] via-[#003358] to-[#002b49] text-white shadow-xl space-y-6 border border-slate-700">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#e87722] text-white flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">CSE Placement & Marquee Career Outcomes</h3>
                    <span className="text-[10px] text-slate-300">Training & Placement Cell Records</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  90%+ Placed
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Highest CTC</span>
                    <strong className="text-xl font-bold font-mono text-white">₹42.00 LPA</strong>
                    <span className="text-[10px] text-slate-300 block">CSE & Engineering</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Average CTC</span>
                    <strong className="text-xl font-bold font-mono text-white">₹8.50 LPA</strong>
                    <span className="text-[10px] text-slate-300 block">Engineering Cohort</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <span className="text-slate-300 font-bold text-[11px] block">Top Corporate Recruiters:</span>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded font-medium">ONGC</span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded font-medium">Reliance Industries</span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded font-medium">Amazon</span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded font-medium">Microsoft</span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded font-medium">Infosys</span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded font-medium">TCS</span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded font-medium">Shell</span>
                  </div>
                </div>
              </div>

              <Link
                href="/departments"
                className="w-full py-2.5 rounded-xl bg-[#e87722] hover:bg-[#d96711] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span>Explore Department Programs & Placements</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Campus Life & Key Centers */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e87722]">
              Life at PDEU
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#002b49]">
              Innovation, Research & Student Life
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Sprawling green campus in Gandhinagar with state-of-the-art residential, sports, and cultural facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h3 className="font-bold text-[#002b49] text-base">PDEU IIC Incubation Centre</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nurturing 100+ student-led startups with seed funding, technical mentorship, and intellectual property patent filing support.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h3 className="font-bold text-[#002b49] text-base">International Relations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Academic MoUs and student exchange partnerships with renowned universities in the US, Europe, Australia, and Singapore.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h3 className="font-bold text-[#002b49] text-base">Campus Hostels & Sports Complex</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Modern student hostels with high-speed campus Wi-Fi, multi-cuisine cafeterias, and Olympic-grade sports amenities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
