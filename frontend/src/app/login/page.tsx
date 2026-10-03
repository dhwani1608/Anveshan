'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, GraduationCap, ShieldAlert, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { personas, switchPersona, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handlePersonaSelect = async (personaId: string) => {
    await switchPersona(personaId);
    router.push('/dashboard');
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center max-w-lg mx-auto space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Sign In to PDEU Portal
        </h1>
        <p className="text-xs text-slate-400">
          Access your personalized academic profile and Anveshan organizational assistant.
        </p>
      </div>

      {/* Quick 1-Click Persona Cards */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 text-center">
          ⚡ 1-Click Demo Personas (Instant Cohort Switching)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePersonaSelect(p.id)}
              disabled={isLoading}
              className="text-left p-5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-800 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  {p.role === 'admin' ? <ShieldAlert className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {p.batch !== 'N/A' ? `Batch ${p.batch}` : 'Admin'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm group-hover:text-amber-300 transition-colors">
                  {p.name}
                </h3>
                <span className="text-[11px] text-slate-400 block">{p.program}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {p.description}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                <span>Select & Launch</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Login Card */}
      <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">
          Or Enter University Credentials
        </h3>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400">University Email</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
              <Mail className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dhwani@pdeu.ac.in"
                className="bg-transparent w-full focus:outline-none text-white text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Password</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
              <Lock className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent w-full focus:outline-none text-white text-xs"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
          >
            {isLoading ? 'Verifying...' : 'Sign In to Student Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}
