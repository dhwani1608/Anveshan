'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Mail, Phone, Sparkles, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#002b49] text-white text-xs border-t-4 border-[#e87722]">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: PDEU Brand & Recognition */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-serif font-black text-xl text-[#002b49] border-2 border-[#e87722]">
                P
              </div>
              <div>
                <span className="font-serif font-black text-white text-sm sm:text-base tracking-wide block">
                  PANDIT DEENDAYAL ENERGY UNIVERSITY
                </span>
                <span className="text-[10px] text-slate-300">
                  Formerly Pandit Deendayal Petroleum University (PDPU)
                </span>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              PDEU is recognized among the premier universities in India for engineering, technology, energy, management, and humanities. Accredited with NAAC 'A++' Grade (CGPA 3.52/4.0).
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#e87722] shrink-0 mt-0.5" />
                <span>Knowledge Corridor, Raisan, Gandhinagar - 382007, Gujarat, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#e87722] shrink-0" />
                <span>+91 79 2327 5060 / +91 79 2327 5077</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#e87722] shrink-0" />
                <span>info@pdeu.ac.in • academics@pdeu.ac.in</span>
              </div>
            </div>
          </div>

          {/* Col 2: About University */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#e87722] uppercase tracking-wider text-xs border-b border-[#0c406b] pb-1.5">
              About University
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About PDEU</Link></li>
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">Vision & Mission</Link></li>
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">Governance & Board</Link></li>
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">Accreditation (NAAC A++)</Link></li>
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">NIRF / IQAC Reports</Link></li>
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">International Relations</Link></li>
            </ul>
          </div>

          {/* Col 3: Academics & Schools */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#e87722] uppercase tracking-wider text-xs border-b border-[#0c406b] pb-1.5">
              Our Schools
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              <li><Link href="/departments" className="hover:text-amber-400 transition-colors">School of Technology (SoT)</Link></li>
              <li><Link href="/departments" className="hover:text-amber-400 transition-colors">School of Energy Technology</Link></li>
              <li><Link href="/departments" className="hover:text-amber-400 transition-colors">School of Management (SoM)</Link></li>
              <li><Link href="/departments" className="hover:text-amber-400 transition-colors">School of Liberal Studies (SLS)</Link></li>
              <li><Link href="/departments" className="hover:text-amber-400 transition-colors">School of Law (SoL)</Link></li>
              <li><Link href="/academics" className="hover:text-amber-400 transition-colors">B.Tech Regulations</Link></li>
            </ul>
          </div>

          {/* Col 4: Quick Portals & Anveshan */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#e87722] uppercase tracking-wider text-xs border-b border-[#0c406b] pb-1.5">
              Portals & AI
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              <li><Link href="/dashboard" className="hover:text-amber-400 transition-colors">ERP / Student Portal</Link></li>
              <li><Link href="/assistant" className="hover:text-amber-400 transition-colors font-semibold text-amber-300 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-[#e87722]" /> Ask Anveshan AI</Link></li>
              <li><Link href="/notices" className="hover:text-amber-400 transition-colors">Notices & Circulars</Link></li>
              <li><Link href="/admin" className="hover:text-amber-400 transition-colors">Admin Governance</Link></li>
              <li><Link href="/admin/knowledge" className="hover:text-amber-400 transition-colors">Knowledge Graph</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Directory</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#0c406b] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div>
            © 2026 Pandit Deendayal Energy University. All rights reserved.
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c2340] border border-[#1b3d63]">
            <Sparkles className="w-3.5 h-3.5 text-[#e87722]" />
            <span>Integrated with</span>
            <strong className="text-white">ANVESHAN</strong>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-mono">Org: PDEU</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
