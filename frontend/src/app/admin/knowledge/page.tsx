'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Network, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { GraphVisualizer } from '@/components/GraphVisualizer';
import { fetchGraphData } from '@/lib/api';
import { GraphData } from '@/lib/types';

export default function AdminKnowledgePage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [cypherText, setCypherText] = useState<string>('');
  const [showCypherModal, setShowCypherModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const data = await fetchGraphData();
      setGraphData(data);
      
      try {
        const cRes = await fetch('http://127.0.0.1:8000/api/v1/knowledge/cypher');
        if (cRes.ok) {
          const cData = await cRes.json();
          setCypherText(cData.cypher);
        }
      } catch (err) {
        console.error('Failed to load cypher:', err);
      }
      setLoading(false);
    }
    init();
  }, []);

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
            Knowledge Graph Architecture
          </h1>
          <p className="text-xs text-slate-400">
            Multi-relational graph connecting Courses, Prerequisites, Regulations, and Student Cohorts.
          </p>
        </div>

        <button
          onClick={() => setShowCypherModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          <FileCode className="w-4 h-4 text-amber-400" />
          <span>Export Neo4j Cypher</span>
        </button>
      </div>

      {/* Graph Visualizer */}
      <GraphVisualizer data={graphData} />

      {/* Cypher Export Modal */}
      {showCypherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-serif">Neo4j Cypher Export</h3>
                <p className="text-xs text-slate-400">Ready to execute in Neo4j Browser or Enterprise AuraDB.</p>
              </div>
              <button
                onClick={() => setShowCypherModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <pre className="flex-1 overflow-auto p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 whitespace-pre leading-relaxed">
              {cypherText || '// Generating Cypher statements...'}
            </pre>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cypherText);
                  alert('Cypher queries copied to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Copy Cypher Script
              </button>
              <button
                onClick={() => setShowCypherModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
