'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Compass, Shield, BookOpen, Sparkles, ArrowRight, Building2, Users, FileText, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  const leadership = [
    {
      name: 'Dr. Mukesh D. Ambani',
      role: 'President, Pandit Deendayal Energy University',
      designation: 'Chairman & Managing Director, Reliance Industries Limited',
      desc: 'Envisioned PDEU as an institution of international repute producing future energy and technological leaders.'
    },
    {
      name: 'Dr. Hasmukh Adhia, IAS (Retd.)',
      role: 'Vice Chairman - Board of Governors',
      designation: 'Former Union Finance Secretary & Revenue Secretary, Govt of India',
      desc: 'Guides university governance, fiscal policies, and strategic institutional growth.'
    },
    {
      name: 'Prof. S. Sundar Manoharan',
      role: 'Director General, PDEU',
      designation: 'Eminent Scientist, Former Vice Chancellor',
      desc: 'Leads academic affairs, global university partnerships, and high-impact scientific research programs.'
    }
  ];

  const milestones = [
    { year: '2007', title: 'Established by Gujarat Act No. 14', desc: 'Inaugurated as Pandit Deendayal Petroleum University (PDPU) by the Government of Gujarat.' },
    { year: '2015', title: 'Expansion to SLS & SoT', desc: 'Introduced multidisciplinary schools for liberal studies, computing, and technology.' },
    { year: '2021', title: 'Re-christened as PDEU', desc: 'Gujarat Legislature enacted Act No. 7 of 2021, expanding mandate across clean and renewable energy.' },
    { year: '2023', title: 'NAAC A++ Accreditation', desc: 'Awarded highest grade A++ with CGPA 3.39/4.0 by National Assessment and Accreditation Council.' }
  ];

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#e87722] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#002b49] font-semibold">About PDEU</span>
        </div>

        {/* Page Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-4 border-l-8 border-l-[#002b49]">
          <div className="flex items-center gap-2">
            <span className="bg-[#e87722] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              About University
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Gandhinagar, Gujarat, India
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#002b49] leading-tight">
            Pandit Deendayal Energy University
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Pandit Deendayal Energy University (formerly PDPU) was established by the Gujarat State Legislature to provide high-quality education and research in Energy, Technology, Management, and Liberal Arts. Recognized by UGC and graded <strong>A++ by NAAC</strong>, PDEU is ranked among the top 100 universities across India.
          </p>
        </div>

        {/* Key Accreditations & Facts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-[#002b49]">
            <div className="text-2xl font-black font-serif text-[#002b49]">NAAC A++</div>
            <div className="text-xs font-bold text-slate-700">Accredited with CGPA 3.39</div>
            <p className="text-xs text-slate-500 leading-relaxed">Highest tier of academic excellence certified by UGC NAAC committee.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-[#e87722]">
            <div className="text-2xl font-black font-serif text-[#e87722]">NIRF Top 100</div>
            <div className="text-xs font-bold text-slate-700">Ministry of Education</div>
            <p className="text-xs text-slate-500 leading-relaxed">Consistently ranked among the premier universities and engineering institutes in India.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-[#002b49]">
            <div className="text-2xl font-black font-serif text-[#002b49]">100 Acres</div>
            <div className="text-xs font-bold text-slate-700">Knowledge Corridor</div>
            <p className="text-xs text-slate-500 leading-relaxed">Modern eco-friendly green campus with 45 MW Solar Park and Siemens CoE.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-[#e87722]">
            <div className="text-2xl font-black font-serif text-[#e87722]">₹42.00 LPA</div>
            <div className="text-xs font-bold text-slate-700">Highest Placement CTC</div>
            <p className="text-xs text-slate-500 leading-relaxed">Graduates recruited by ONGC, Reliance, Shell, Amazon, TCS, L&T.</p>
          </div>
        </div>

        {/* Statutory Governance & Leadership */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e87722]">
              Leadership & Governance
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#002b49] mt-1">
              Board of Governors & Executive Leadership
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              PDEU operates under the statutory provisions of the Pandit Deendayal Energy University Act (Gujarat Act No. 7 of 2021).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadership.map((lead, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#002b49] text-[#e87722] flex items-center justify-center font-serif font-bold text-lg">
                  {lead.name[3]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#002b49]">{lead.name}</h3>
                  <div className="text-xs text-[#e87722] font-semibold">{lead.role}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">{lead.designation}</div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
                  {lead.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* University Milestones Timeline */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-serif font-black text-[#002b49]">Institutional Journey & Evolution</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xl font-black font-serif text-[#e87722]">{m.year}</div>
                <div className="text-xs font-bold text-[#002b49]">{m.title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Inquiries Callout */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#002b49] to-[#0c406b] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border-l-8 border-l-[#e87722]">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-serif">Have questions about PDEU governance or policies?</h3>
            <p className="text-xs text-slate-200">Connect with the Office of Academic Affairs or consult the official University Act & Gazettes directory.</p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-full bg-[#e87722] hover:bg-[#d96711] text-white font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-md"
          >
            <span>Contact University Affairs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
