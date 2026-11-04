'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssistantChat } from '@/components/AssistantChat';
import { GraphVisualizer } from '@/components/GraphVisualizer';
import { fetchSuggestedQuestions, fetchGraphData } from '@/lib/api';
import { GraphData } from '@/lib/types';
import { Network, MessageSquare, Sparkles, Layers } from 'lucide-react';

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  const [suggested, setSuggested] = useState<{ category: string; text: string; description: string }[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [activeTab, setActiveTab] = useState<'chat' | 'graph'>('chat');

  useEffect(() => {
    async function loadData() {
      const sq = await fetchSuggestedQuestions();
      setSuggested(sq);
      const gd = await fetchGraphData();
      setGraphData(gd);
    }
    loadData();
  }, []);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col space-y-4">
      {/* Top Controls: Switch between Chat & Knowledge Graph */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#e87722] border border-orange-200 flex items-center justify-center font-bold text-sm shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#002b49] font-serif">
              ANVESHAN Academic Assistant
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Personalized Knowledge Layer • Pandit Deendayal Energy University
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white border border-slate-300 p-1 rounded-xl text-xs shadow-sm">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-[#002b49] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#002b49]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#e87722]" />
            <span>Assistant Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'graph'
                ? 'bg-[#002b49] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#002b49]'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-[#e87722]" />
            <span>Knowledge Graph</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col items-center justify-center py-2">
          <div className="w-full max-w-lg h-[620px] max-h-[82vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col bg-white">
            <AssistantChat initialSuggested={suggested} />
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-sm flex items-center justify-between">
            <span>
              Explore the interconnected entities (Courses, Prerequisites, Regulations, Batches, and Documents) that power Anveshan's multi-hop reasoning.
            </span>
            <span className="font-mono text-[#e87722] font-semibold text-[11px] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              Engine: In-Memory / Neo4j APOC
            </span>
          </div>
          <GraphVisualizer data={graphData} />
        </div>
      )}
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Anveshan Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
