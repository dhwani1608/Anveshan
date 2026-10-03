'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles, BookOpen, Layers, Users, Bell, Mail, ShieldCheck,
  ChevronDown, Search, GraduationCap, Award, ExternalLink, Menu, X
} from 'lucide-react';
import { PersonaSwitcher } from './PersonaSwitcher';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const mainNav = [
    {
      title: 'About University',
      href: '/about',
      submenu: [
        { label: 'About PDEU', href: '/about' },
        { label: 'Vision & Mission', href: '/about' },
        { label: 'Governance & Leadership', href: '/about' },
        { label: 'University Policies', href: '/academics' },
        { label: 'NIRF & IQAC', href: '/about' },
        { label: 'Accreditation (NAAC A++)', href: '/about' }
      ]
    },
    {
      title: 'Academics',
      href: '/academics',
      submenu: [
        { label: 'Our Schools (SoT, SoET, SLS, SoM, SoL)', href: '/departments' },
        { label: 'School of Technology (SoT)', href: '/departments' },
        { label: 'Department of Computer Science', href: '/departments' },
        { label: 'Undergraduate B.Tech Regulations', href: '/academics' },
        { label: 'System of Evaluation', href: '/academics' },
        { label: 'Faculty Directory', href: '/departments' }
      ]
    },
    {
      title: 'Admissions',
      href: '/students',
      badge: '2026-27 Open',
      submenu: [
        { label: 'B.Tech Admissions 2026', href: '/students' },
        { label: 'M.Tech & PG Admissions', href: '/students' },
        { label: 'MBA Admissions (SoM)', href: '/students' },
        { label: 'Ph.D Programs', href: '/students' },
        { label: 'International Admissions', href: '/students' }
      ]
    },
    {
      title: 'Research',
      href: '/departments',
      submenu: [
        { label: 'Centers of Excellence', href: '/departments' },
        { label: 'Funded Research Projects', href: '/departments' },
        { label: 'Innovation & Incubation (IIC)', href: '/departments' },
        { label: 'Supercomputing & GPU Facilities', href: '/departments' }
      ]
    },
    {
      title: 'Students & Campus',
      href: '/students',
      submenu: [
        { label: 'Personalized Student Dashboard', href: '/dashboard' },
        { label: 'Student Grievance Redressal', href: '/notices' },
        { label: 'Hostels & Residential Campus', href: '/students' },
        { label: 'Sports & Cultural Activities', href: '/students' },
        { label: 'Anti-Ragging Committee', href: '/notices' }
      ]
    },
    {
      title: 'Notices',
      href: '/notices'
    }
  ];

  return (
    <header className="w-full sticky top-0 z-40 shadow-md">
      {/* 1. Official PDEU Top Utility Bar */}
      <div className="bg-[#002b49] text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-[#0c385c]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-[#e87722] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] animate-pulse">
              Admissions 2026-27 Open
            </span>
            <span className="hidden md:inline text-slate-300">
              NAAC 'A++' Grade Accredited (CGPA 3.52/4.0) | NIRF Top Ranked
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <Link href="/admin" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Governance</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/dashboard" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ERP / Student Login</span>
            </Link>
            <span className="text-slate-600">|</span>
            <PersonaSwitcher />
          </div>
        </div>
      </div>

      {/* 2. Main PDEU Brand Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* PDEU Official Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-full bg-[#002b49] border-2 border-[#e87722] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="font-serif font-black text-2xl tracking-tighter text-[#e87722]">
                P
              </span>
            </div>
            <div>
              <div className="font-serif font-black text-lg sm:text-2xl text-[#002b49] tracking-tight group-hover:text-[#e87722] transition-colors leading-none">
                PANDIT DEENDAYAL ENERGY UNIVERSITY
              </div>
              <div className="text-[10px] sm:text-xs font-sans text-slate-600 tracking-wide mt-1 font-medium">
                Formerly Pandit Deendayal Petroleum University (PDPU) • UGC Recognized • NAAC A++ Grade
              </div>
            </div>
          </Link>

          {/* Anveshan Highlight Button in Header */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/assistant"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#002b49] to-[#0c406b] hover:from-[#e87722] hover:to-[#f37021] text-white font-bold text-xs shadow-md shadow-[#002b49]/20 transition-all border border-[#e87722]/40"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>ANVESHAN AI COGNITIVE LAYER</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. Secondary Navigation Bar with PDEU Primary Color */}
      <nav className="bg-[#002b49] border-b border-[#0c385c] hidden lg:block text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            {mainNav.map((item, idx) => (
              <div
                key={idx}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.title)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`px-4 py-3 block font-semibold transition-colors flex items-center gap-1 border-b-2 ${
                    pathname === item.href
                      ? 'border-[#e87722] text-[#e87722]'
                      : 'border-transparent text-white hover:text-[#e87722] hover:border-[#e87722]'
                  }`}
                >
                  <span>{item.title}</span>
                  {item.submenu && <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />}
                  {item.badge && (
                    <span className="ml-1 bg-[#e87722] text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Submenu Dropdown */}
                {item.submenu && activeDropdown === item.title && (
                  <div className="absolute left-0 top-full w-64 bg-white text-slate-800 shadow-2xl border border-slate-200 py-2 rounded-b-xl z-50 animate-in fade-in slide-in-from-top-1">
                    {item.submenu.map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        href={sub.href}
                        className="block px-4 py-2 hover:bg-slate-100 text-xs text-slate-700 hover:text-[#002b49] font-medium border-b border-slate-100 last:border-0 transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Direct CTA Tab for Anveshan */}
          <div className="flex items-center gap-3">
            <Link
              href="/assistant"
              className="flex items-center gap-1.5 bg-[#e87722] hover:bg-[#d96711] text-white px-3.5 py-1.5 rounded-full font-bold text-xs transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Anveshan</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3 text-white text-sm">
          {mainNav.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block font-semibold py-1 hover:text-[#e87722]"
              >
                {item.title}
              </Link>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 text-center rounded-xl bg-[#e87722] text-white font-bold text-xs"
            >
              Open Anveshan AI Assistant
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 text-center rounded-xl bg-slate-800 text-white font-bold text-xs"
            >
              Personalized Student Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
