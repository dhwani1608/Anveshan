import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Reach PDEU
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white">
          Contact Campus & Administration
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Get in touch with the Office of Academic Affairs, CSE Department, or Admissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white font-serif">University Address & Coordinates</h3>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Pandit Deendayal Energy University</strong>
                <span>Knowledge Corridor, Raisan, Gandhinagar - 382007, Gujarat, India</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>+91 79 2327 5060 / +91 79 2327 5077</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>info@pdeu.ac.in • academics@pdeu.ac.in</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Monday to Friday: 9:00 AM – 5:30 PM IST</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white font-serif">Department of CSE Inquiries</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            For course prerequisite clearances, capstone allocations, or curriculum inquiries:
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
            <div><strong>Head of Department:</strong> Dr. Sameer Patel</div>
            <div><strong>Email:</strong> cse.hod@pdeu.ac.in</div>
            <div><strong>Location:</strong> Block E, School of Technology</div>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs pt-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Anveshan AI automatically handles routine prerequisite inquiries.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
