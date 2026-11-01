'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Flame, Briefcase, BookOpen, Scale, Search, ArrowRight, Sparkles, ChevronRight, GraduationCap } from 'lucide-react';

export default function DepartmentsPage() {
  const [selectedSchool, setSelectedSchool] = useState('ALL');

  const schools = [
    {
      code: 'SoT',
      name: 'School of Technology',
      desc: 'Undergraduate, postgraduate, and doctoral engineering programs in Computer Science, ICT, Chemical, Mechanical, Civil, and Electrical Engineering.',
      icon: Building2,
      programs: [
        { name: 'B.Tech Computer Science & Engineering', level: 'Undergraduate', duration: '4 Years', credits: '168' },
        { name: 'B.Tech Information & Communication Technology', level: 'Undergraduate', duration: '4 Years', credits: '168' },
        { name: 'B.Tech Chemical Engineering', level: 'Undergraduate', duration: '4 Years', credits: '168' },
        { name: 'B.Tech Mechanical Engineering', level: 'Undergraduate', duration: '4 Years', credits: '168' },
        { name: 'M.Tech Data Science / Cyber Security', level: 'Postgraduate', duration: '2 Years', credits: '72' },
        { name: 'Ph.D. in Engineering & Technology', level: 'Doctoral', duration: '3-5 Years', credits: 'Research' }
      ]
    },
    {
      code: 'SoET',
      name: 'School of Energy Technology',
      desc: 'Specialized pioneer institute dedicated to the complete energy value chain: upstream petroleum, solar PV, hydrogen, energy storage, and sustainability.',
      icon: Flame,
      programs: [
        { name: 'B.Tech Petroleum Engineering', level: 'Undergraduate', duration: '4 Years', credits: '168' },
        { name: 'M.Tech Petroleum Engineering', level: 'Postgraduate', duration: '2 Years', credits: '72' },
        { name: 'M.Tech Energy Systems & Solar Technology', level: 'Postgraduate', duration: '2 Years', credits: '72' },
        { name: 'Ph.D. in Petroleum & Renewable Energy', level: 'Doctoral', duration: '3-5 Years', credits: 'Research' }
      ]
    },
    {
      code: 'SoM',
      name: 'School of Management (SPM)',
      desc: 'Leading business school imparting specialized management education in Energy & Infrastructure, Business Analytics, Finance, and Marketing.',
      icon: Briefcase,
      programs: [
        { name: 'MBA in Energy & Infrastructure', level: 'Postgraduate', duration: '2 Years', credits: '102' },
        { name: 'MBA in General Management', level: 'Postgraduate', duration: '2 Years', credits: '102' },
        { name: 'Executive MBA (For Working Professionals)', level: 'Executive', duration: '2 Years', credits: 'Weekend' },
        { name: 'Ph.D. in Management & Strategy', level: 'Doctoral', duration: '3-5 Years', credits: 'Research' }
      ]
    },
    {
      code: 'SLS',
      name: 'School of Liberal Studies',
      desc: 'Interdisciplinary education in Humanities, Social Sciences, Public Policy, Psychology, Commerce, and Business Administration.',
      icon: BookOpen,
      programs: [
        { name: 'B.A. (Honours) in Economics / International Relations / Psychology', level: 'Undergraduate', duration: '4 Years', credits: '160' },
        { name: 'B.B.A. (Honours) Business Administration', level: 'Undergraduate', duration: '4 Years', credits: '160' },
        { name: 'B.Com. (Honours) Finance & Accounting', level: 'Undergraduate', duration: '4 Years', credits: '160' },
        { name: 'M.A. in Public Policy & Administration', level: 'Postgraduate', duration: '2 Years', credits: '80' }
      ]
    },
    {
      code: 'SoL',
      name: 'School of Law',
      desc: 'Legal education fostering socially conscious jurists with specialization in Energy Laws, Corporate Compliance, Cyber Law, and Constitutional Law.',
      icon: Scale,
      programs: [
        { name: 'B.A. LL.B. (Honours) 5-Year Integrated', level: 'Undergraduate', duration: '5 Years', credits: '220' },
        { name: 'B.B.A. LL.B. (Honours) 5-Year Integrated', level: 'Undergraduate', duration: '5 Years', credits: '220' },
        { name: 'LL.M. in Energy, Corporate & Cyber Laws', level: 'Postgraduate', duration: '1 Year', credits: '28' }
      ]
    }
  ];

  const filteredSchools = selectedSchool === 'ALL'
    ? schools
    : schools.filter(s => s.code === selectedSchool);

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#e87722] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#002b49] font-semibold">Our Schools & Degree Programs</span>
        </div>

        {/* Page Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-4 border-l-8 border-l-[#002b49]">
          <div className="flex items-center gap-2">
            <span className="bg-[#e87722] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Academic Directory
            </span>
            <span className="text-xs text-slate-500 font-medium">
              39 Official Degree Programs
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#002b49] leading-tight">
            Our Constituent Schools & Departments
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            PDEU is composed of 5 flagship academic schools offering world-class bachelor's, master's, and doctoral programs aligned with national priorities and global industry standards.
          </p>

          {/* School Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <button
              onClick={() => setSelectedSchool('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedSchool === 'ALL'
                  ? 'bg-[#002b49] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Schools (5)
            </button>
            {schools.map((s) => (
              <button
                key={s.code}
                onClick={() => setSelectedSchool(s.code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSchool === s.code
                    ? 'bg-[#e87722] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {s.name} ({s.code})
              </button>
            ))}
          </div>
        </div>

        {/* Schools & Programs Display */}
        <div className="space-y-8">
          {filteredSchools.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.code} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#002b49]/10 text-[#002b49] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#002b49]" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-serif font-black text-[#002b49]">
                        {s.name} ({s.code})
                      </h2>
                      <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-[#002b49] font-bold text-xs shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-[#e87722]" />
                    <span>{s.programs.length} Programs</span>
                  </span>
                </div>

                {/* Programs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {s.programs.map((p, pIdx) => (
                    <div key={pIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#e87722]/50 hover:shadow-sm transition-all flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#e87722]">
                          {p.level}
                        </span>
                        <h3 className="font-bold text-sm text-[#002b49] leading-snug">
                          {p.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                        <span>Duration: {p.duration}</span>
                        <span className="font-medium text-slate-700">{p.credits} Credits</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Admissions 2026-27 Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#002b49] to-[#0c406b] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border-l-8 border-l-[#e87722]">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-serif">Ready to apply for Admissions 2026-27?</h3>
            <p className="text-xs text-slate-200">Explore eligibility criteria, ACPC seat distribution, All-India JEE Main quota, and important application dates.</p>
          </div>
          <Link
            href="/students"
            className="px-6 py-3 rounded-full bg-[#e87722] hover:bg-[#d96711] text-white font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-md"
          >
            <span>View Admissions Guidelines</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
