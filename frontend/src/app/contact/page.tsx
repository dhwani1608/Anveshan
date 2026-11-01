'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const contacts = [
    {
      title: 'General Inquiries & Campus Reception',
      phone: '+91 79 2327 5060 / +91 79 2327 5000',
      email: 'info@pdeu.ac.in',
      hours: 'Mon – Fri: 9:00 AM – 5:30 PM IST',
      location: 'Administrative Block, Ground Floor'
    },
    {
      title: 'Undergraduate Admissions Helpdesk',
      phone: '+91 79 2327 5077 / +91 79 2327 5090',
      email: 'btechadmission@pdeu.ac.in',
      hours: 'Mon – Sat: 9:30 AM – 6:00 PM IST',
      location: 'Block C, Admissions Complex'
    },
    {
      title: 'Office of Dean (Academics)',
      phone: '+91 79 2327 5012',
      email: 'dean.academics@pdeu.ac.in',
      hours: 'Mon – Fri: 10:00 AM – 5:00 PM IST',
      location: 'Academic Affairs Secretariat'
    },
    {
      title: 'Training & Corporate Placements',
      phone: '+91 79 2327 5385',
      email: 'placements@pdeu.ac.in',
      hours: 'Mon – Fri: 9:00 AM – 6:00 PM IST',
      location: 'Corporate Relations Centre'
    },
    {
      title: 'Anti-Ragging Committee (24x7)',
      phone: '1800-180-5522 (Toll Free National Helpline)',
      email: 'antiragging@pdeu.ac.in',
      hours: '24 Hours / 7 Days Active Emergency Protocol',
      location: 'Proctorial Board Office'
    },
    {
      title: 'Student Hostels & Residence Office',
      phone: '+91 79 2327 5200',
      email: 'hostel@pdeu.ac.in',
      hours: '24/7 Hostel Warden On-Call',
      location: 'High-Rise Hostel Towers (Boys & Girls)'
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#e87722] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#002b49] font-semibold">Contact & Campus Location</span>
        </div>

        {/* Page Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-4 border-l-8 border-l-[#002b49]">
          <div className="flex items-center gap-2">
            <span className="bg-[#e87722] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Campus Directory
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Gandhinagar, Gujarat, India
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#002b49] leading-tight">
            Contact PDEU & Campus Directory
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Connect with admissions helplines, academic administration, corporate placement officers, or campus security.
          </p>
        </div>

        {/* Campus Address Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#002b49] text-[#e87722] flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-serif font-black text-[#002b49]">
                  Pandit Deendayal Energy University
                </h2>
                <p className="text-sm text-slate-600 font-medium">
                  Knowledge Corridor, Raisan Village, Gandhinagar - 382426, Gujarat, India.
                </p>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4 pt-1">
                  <span>✈ 14 km from Ahmedabad International Airport</span>
                  <span>🚆 8 km from Gandhinagar Capital Railway Station</span>
                </div>
              </div>
            </div>

            <Link
              href="https://maps.google.com/?q=Pandit+Deendayal+Energy+University+Gandhinagar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#002b49] hover:bg-[#003865] text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </Link>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((c, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#002b49] font-serif">
                  {c.title}
                </h3>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#e87722] shrink-0" />
                    <span className="font-medium text-slate-800">{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#002b49] shrink-0" />
                    <span>{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{c.hours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-500">
                {c.location}
              </div>
            </div>
          ))}
        </div>

        {/* Campus Map & Directions Info */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#002b49] to-[#0c406b] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border-l-8 border-l-[#e87722]">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-serif">Visiting the PDEU Gandhinagar Campus?</h3>
            <p className="text-xs text-slate-200">The university is situated along the Knowledge Corridor in Raisan, Gandhinagar, just 14 km from Ahmedabad Airport.</p>
          </div>
          <a
            href="https://maps.google.com/?q=Pandit+Deendayal+Energy+University+Gandhinagar"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-[#e87722] hover:bg-[#d96711] text-white font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-md"
          >
            <span>Open Campus Map</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
