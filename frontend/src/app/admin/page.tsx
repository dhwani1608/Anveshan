'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, FileText, Network, AlertTriangle, CheckCircle2,
  ArrowRight, Sparkles, Layers, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    total_documents: 4,
    authoritative_documents: 2,
    verified_documents: 2,
    detected_conflicts: 1,
    graph_nodes_count: 22,
    graph_edges_count: 18,
    active_batches: ['2027', '2025', '2024']
  });

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/admin/overview');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      }
    }
    loadOverview();
  }, []);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-semibold uppercase">
              Administrator Governance Console
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs font-mono">Tenant: PDEU</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Knowledge Base & Decision Governance
          </h1>
          <p className="text-xs text-slate-300">
            Oversee authoritative source documents, inspect graph connectivity, and resolve policy contradictions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs border border-slate-700">
            Dean of Academic Affairs
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Indexed Documents</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{metrics.total_documents}</div>
          <div className="text-[10px] text-slate-400">{metrics.authoritative_documents} marked Authoritative</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Knowledge Graph</span>
            <Network className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{metrics.graph_nodes_count}</div>
          <div className="text-[10px] text-slate-400">{metrics.graph_edges_count} Active Relationships</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-rose-900/50 space-y-2">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Detected Conflicts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{metrics.detected_conflicts}</div>
          <div className="text-[10px] text-rose-300">Admin Review Required</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>Active Batches</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.active_batches.length}</div>
          <div className="text-[10px] text-slate-400">{metrics.active_batches.join(', ')} Cohorts</div>
        </div>
      </div>

      {/* Governance Modules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Document Ingestion & Verification */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Document Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload curricula, examination rules, and circulars. Assign cohort applicability and update verification levels (Authoritative, Verified, Outdated).
            </p>
          </div>
          <Link
            href="/admin/documents"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <span>Manage Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Knowledge Graph Explorer */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Knowledge Graph Explorer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect multi-hop relationship chains between Courses, Prerequisites, Regulations, and Batches. Export Neo4j Cypher queries for enterprise sync.
            </p>
          </div>
          <Link
            href="/admin/knowledge"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <span>Explore Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Policy Conflict Resolution */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-rose-900/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Conflict Resolution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resolve policy discrepancies flagged by Anveshan, such as the 80% statutory attendance rule vs 75% hackathon circular concession.
            </p>
          </div>
          <Link
            href="/admin/conflicts"
            className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 font-semibold text-xs flex items-center justify-center gap-2 border border-rose-800/60 transition-colors"
          >
            <span>Resolve Conflicts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
