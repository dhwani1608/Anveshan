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
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-serif">
              ANVESHAN Academic Assistant
            </h1>
            <p className="text-[11px] text-slate-400">
              Personalized Knowledge Layer • Pandit Deendayal Energy University
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Assistant Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'graph'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Knowledge Graph</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col">
          <AssistantChat initialSuggested={suggested} />
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>
              Explore the interconnected entities (Courses, Prerequisites, Regulations, Batches, and Documents) that power Anveshan's multi-hop reasoning.
            </span>
            <span className="font-mono text-amber-400 font-semibold text-[11px]">
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
