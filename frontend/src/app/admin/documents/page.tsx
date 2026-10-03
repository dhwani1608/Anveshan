'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchDocuments, verifyDocument } from '@/lib/api';
import { DocumentItem } from '@/lib/types';
import {
  FileText, Upload, Plus, ShieldCheck, CheckCircle2, AlertTriangle,
  ExternalLink, ArrowLeft, RefreshCw, Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDocumentsPage() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // New document form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('CURRICULUM');
  const [newDepartment, setNewDepartment] = useState('Computer Science & Engineering');
  const [newBatch, setNewBatch] = useState('2027');
  const [newVersion, setNewVersion] = useState('1.0');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  async function loadDocs() {
    setLoading(true);
    const docs = await fetchDocuments();
    setDocuments(docs);
    setLoading(false);
  }

  const handleStatusChange = async (docId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'AUTHORITATIVE' ? 'VERIFIED' : currentStatus === 'VERIFIED' ? 'OUTDATED' : 'AUTHORITATIVE';
    await verifyDocument(docId, nextStatus, token || undefined);
    loadDocs();
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/documents/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          department: newDepartment,
          applicable_batch: newBatch,
          current_version: newVersion,
          verification_status: 'VERIFIED',
          raw_content: newContent
        })
      });
      if (res.ok) {
        setShowUploadModal(false);
        setNewTitle('');
        setNewContent('');
        loadDocs();
      }
    } catch (err) {
      console.error('Ingest failed:', err);
    } finally {
      setIsSubmitting(false);
    }
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
            Document Repository & Ingestion Pipeline
          </h1>
          <p className="text-xs text-slate-400">
            Authoritative institutional knowledge sources for Pandit Deendayal Energy University.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest New Document</span>
        </button>
      </div>

      {/* Documents Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Indexed Official Documents ({documents.length})</h3>
          <button onClick={loadDocs} className="text-slate-400 hover:text-white p-1">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Document Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Batch Cohort</th>
                <th className="p-3.5">Version</th>
                <th className="p-3.5">Status (Click to toggle)</th>
                <th className="p-3.5">Validity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-white">{doc.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{doc.id}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {doc.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-amber-300">
                    {doc.applicable_batch}
                  </td>
                  <td className="p-3.5 font-mono">
                    v{doc.current_version}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleStatusChange(doc.id, doc.verification_status)}
                      className="group flex items-center gap-1.5"
                    >
                      {doc.verification_status === 'AUTHORITATIVE' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          AUTHORITATIVE
                        </span>
                      ) : doc.verification_status === 'VERIFIED' ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          OUTDATED
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {doc.validity_period || 'Permanent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-serif">
              Ingest Document into Anveshan Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              The ingestion engine will automatically chunk the text, compute embeddings, attach cohort metadata, and extract entities into the Knowledge Graph.
            </p>

            <form onSubmit={handleIngest} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. B.Tech CSE Elective Catalog 2027"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="CURRICULUM">CURRICULUM</option>
                    <option value="REGULATION">REGULATION</option>
                    <option value="NOTICE">NOTICE</option>
                    <option value="SYLLABUS">SYLLABUS</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Applicable Batch</label>
                  <select
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="2027">2027</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="ALL">ALL Cohorts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Content (Markdown / Text)</label>
                <textarea
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste official policy text, course syllabus, or circular details here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {isSubmitting ? 'Ingesting...' : 'Parse & Index Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
