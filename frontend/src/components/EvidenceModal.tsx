'use client';

import React from 'react';
import { CitationItem } from '@/lib/types';
import { X, FileText, CheckCircle2, ShieldCheck, AlertTriangle, ExternalLink, Calendar, Hash, Layers } from 'lucide-react';

interface EvidenceModalProps {
  citation: CitationItem | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AUTHORITATIVE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            AUTHORITATIVE SOURCE
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VERIFIED OFFICIAL
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            UNVERIFIED DRAFT
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-800/80 border-b border-slate-700 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge(citation.verification_status)}
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Version {citation.version}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">
                {citation.document_title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Section</span>
              <strong className="text-slate-200 font-medium">{citation.section || 'General'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Page Reference</span>
              <strong className="text-slate-200 font-medium">Page {citation.page_number || '1'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Organization</span>
              <strong className="text-amber-300 font-medium">PDEU</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Provenance</span>
              <strong className="text-emerald-400 font-medium">RAG Indexed</strong>
            </div>
          </div>

          {/* Verbatim Excerpt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Authoritative Excerpt & Chunk Evidence
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                ID: {citation.document_id}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 font-serif leading-relaxed italic border-l-4 border-l-amber-500">
              "{citation.snippet}"
            </div>
          </div>

          {/* Verification Audit Trail */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="font-semibold text-slate-300">Auditable Governance Record</div>
            <p>
              This evidence is extracted directly from the verified PDEU institutional knowledge base.
              The text chunk is indexed with strict cohort-level applicability, ensuring that students only receive answers grounded in their specific enrolled curriculum version.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/60 border-t border-slate-700 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Citation #{citation.citation_id} • Anveshan Grounding Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
