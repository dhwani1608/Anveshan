'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { parsePDPUEmail, ParsedStudentInfo } from '@/lib/emailParser';
import {
  Sparkles, GraduationCap, ShieldAlert, ArrowRight, Lock, Mail,
  CheckCircle2, AlertCircle, User, BookOpen, Building2, Calendar, Compass, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { personas, switchPersona, login, continueAsGuest, isLoading, isGuest, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('pdeu2026');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Live real-time parsing of the entered email
  const parsedEmailInfo: ParsedStudentInfo = useMemo(() => {
    return parsePDPUEmail(email);
  }, [email]);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your university email.');
      return;
    }

    if (!parsedEmailInfo.isValid) {
      setError(parsedEmailInfo.error || 'Only emails ending with @pdpu.ac.in are allowed.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (personaId: string) => {
    setError('');
    await switchPersona(personaId);
    router.push('/');
  };

  const handleGuestContinue = () => {
    continueAsGuest();
    router.push('/');
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#e87722] border border-orange-200 text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Official University Portal</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#002b49] tracking-tight">
          Pandit Deendayal Energy University
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          Institutional access with official college email (<span className="font-mono font-semibold text-[#002b49]">@pdpu.ac.in</span>). 
          Login is <strong className="text-[#002b49]">not compulsory</strong> — you can freely explore and use the AI as a guest.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Email Login Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#002b49] font-serif">
                Sign In with College Email
              </h2>
              <p className="text-xs text-slate-500">
                Automatic academic profile extraction from your PDPU email ID
              </p>
            </div>
            <span className="text-[11px] font-mono bg-blue-50 text-[#002b49] px-2.5 py-1 rounded-lg border border-blue-100 font-semibold">
              @pdpu.ac.in
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                University Email Address <span className="text-rose-500">*</span>
              </label>
              <div className={`flex items-center bg-slate-50 border rounded-2xl px-3.5 py-2.5 transition-all ${
                email && !parsedEmailInfo.isValid
                  ? 'border-rose-400 ring-2 ring-rose-100'
                  : email && parsedEmailInfo.isValid
                  ? 'border-emerald-400 ring-2 ring-emerald-100'
                  : 'border-slate-300 focus-within:border-[#e87722] focus-within:bg-white'
              }`}>
                <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. 23bcp116@sot.pdpu.ac.in"
                  className="bg-transparent flex-1 text-slate-900 text-sm font-medium focus:outline-none placeholder-slate-400"
                />
                {email && parsedEmailInfo.isValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 pl-1">
                Format: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">[Year][Branch][Roll]@sot.pdpu.ac.in</code>
              </p>
            </div>

            {/* Live Auto-Parsed Student Profile Card */}
            {email && parsedEmailInfo.isValid && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-slate-50 border border-blue-200/80 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#002b49] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Detected PDEU Student Profile
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-[#002b49] font-bold">
                    Roll: {parsedEmailInfo.rollNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <span className="text-slate-500 block text-[10px]">Program & Degree</span>
                    <strong className="text-[#002b49] font-bold">{parsedEmailInfo.program}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <span className="text-slate-500 block text-[10px]">Cohort / Batch</span>
                    <strong className="text-[#e87722] font-bold">
                      {parsedEmailInfo.cohortString} (Batch {parsedEmailInfo.batch})
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <span className="text-slate-500 block text-[10px]">School & Department</span>
                    <strong className="text-slate-800 font-medium">{parsedEmailInfo.school}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-blue-100">
                    <span className="text-slate-500 block text-[10px]">Academic Status</span>
                    <strong className={parsedEmailInfo.isPassedOut ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {parsedEmailInfo.currentStatus || (parsedEmailInfo.isPassedOut ? 'Passed out' : `Semester ${parsedEmailInfo.currentSemester}`)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Domain Validation Alert */}
            {email && !parsedEmailInfo.isValid && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Only emails ending with <strong>@pdpu.ac.in</strong> are allowed.</span>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block">Password</label>
                <span className="text-[10px] text-slate-500 font-mono">Demo: pdeu2026</span>
              </div>
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 focus-within:border-[#e87722] focus-within:bg-white transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-transparent flex-1 text-slate-900 text-sm font-medium focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || (Boolean(email) && !parsedEmailInfo.isValid)}
              className="w-full py-3 rounded-2xl bg-[#002b49] hover:bg-[#003865] disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#002b49]/20"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In with College Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Guest Divider */}
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                OR
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Continue as Guest Button */}
            <button
              onClick={handleGuestContinue}
              className="w-full mt-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-300"
            >
              <Compass className="w-4 h-4 text-[#e87722]" />
              <span>Continue as Guest (No Login Required)</span>
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Browse academic programs, circulars, and ask the AI assistant freely without an account.
            </p>
          </div>
        </div>

        {/* Right Column: 1-Click Quick Demo Accounts & Rule Guide */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Demo Personas Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e87722]" />
              <h3 className="font-bold text-sm text-[#002b49]">
                1-Click Preset Student Accounts
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Select an account to test curriculum and prerequisite reasoning instantly:
            </p>

            <div className="space-y-2.5">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleQuickLogin(p.id)}
                  disabled={isLoading}
                  className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200 hover:border-[#e87722]/50 transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#002b49] group-hover:text-[#e87722]">
                      {p.role === 'admin' ? (
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>{p.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200">
                      {p.batch !== 'N/A' ? `Batch ${p.batch}` : 'Admin'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {p.email}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Email Rule Anatomy Explainer */}
          <div className="p-5 rounded-3xl bg-slate-100 border border-slate-200 space-y-3 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-bold text-[#002b49]">
              <Building2 className="w-4 h-4 text-[#e87722]" />
              <span>How PDEU Email Coding Works:</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div className="text-[#002b49] font-bold">23bcp116@sot.pdpu.ac.in</div>
              <div className="text-slate-500 text-[10px]">
                • <strong className="text-[#002b49]">23</strong> = Admission Year 2023 (Cohort 2023-2027)<br />
                • <strong className="text-[#002b49]">BCP</strong> = Bachelor in Computer Engineering<br />
                • <strong className="text-[#002b49]">116</strong> = Student Roll Number (#116)<br />
                • <strong className="text-[#002b49]">sot</strong> = School of Technology
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              When you sign in with your email, Anveshan automatically matches your curriculum version, semester, and course eligibility without manual setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
