'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, FileText } from 'lucide-react';
import { fetchConflicts, resolveConflict } from '@/lib/api';
import { ConflictItem } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export default function AdminConflictsPage() {
  const { token } = useAuth();
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await fetchConflicts();
    setConflicts(data);
    setLoading(false);
  }

  const handleResolve = async (conflictId: string, status: string) => {
    const notes = resolutionNotes[conflictId] || `Marked as ${status} by Academic Dean`;
    await resolveConflict(conflictId, status, notes, token || undefined);
    setStatusMessage(`Updated conflict ${conflictId} to status: ${status}`);
    setTimeout(() => setStatusMessage(''), 4000);
    loadData();
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link href="/admin" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Overview</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-white">
            Institutional Conflict Detection Console
          </h1>
          <p className="text-xs text-slate-400">
            Anveshan automatically flags contradictory policies across statutes, circulars, and departmental memos.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Scan</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Conflict List */}
      <div className="space-y-6">
        {conflicts.map((conf) => (
          <div
            key={conf.id}
            className="rounded-2xl bg-slate-900 border border-rose-900/40 p-6 space-y-5 shadow-xl"
          >
            {/* Conflict Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-semibold uppercase">
                      Active Conflict
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: {conf.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-serif">{conf.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResolve(conf.id, 'RESOLVED')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleResolve(conf.id, 'VERIFIED_CONFLICT')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-xs border border-slate-700 transition-colors"
                >
                  Flag for Dean Review
                </button>
              </div>
            </div>

            {/* Conflict Description */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400 block mb-1">Contradiction Analysis:</strong>
              {conf.description}
            </div>

            {/* Side by side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source A */}
              <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Source A: {conf.source_a_title}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 text-xs text-slate-300 font-serif italic border-l-2 border-l-blue-500">
                  "{conf.source_a_snippet}"
                </div>
                <div className="text-[10px] text-slate-500">
                  Authority: Statutory Academic Regulation Handbook
                </div>
              </div>

              {/* Source B */}
              <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                  <FileText className="w-4 h-4 text-rose-400" />
                  <span>Source B: {conf.source_b_title}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 text-xs text-slate-300 font-serif italic border-l-2 border-l-rose-500">
                  "{conf.source_b_snippet}"
                </div>
                <div className="text-[10px] text-slate-500">
                  Authority: Executive Academic Circular
                </div>
              </div>
            </div>

            {/* Resolution Notes Box */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                value={resolutionNotes[conf.id] || ''}
                onChange={(e) => setResolutionNotes({ ...resolutionNotes, [conf.id]: e.target.value })}
                placeholder="Add administrative resolution note or legal directive..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleResolve(conf.id, 'RESOLVED')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
              >
                Save Directive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
