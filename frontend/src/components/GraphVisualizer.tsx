'use client';

import React, { useState } from 'react';
import { GraphData, GraphNode, GraphEdge } from '@/lib/types';
import { Network, Filter, ZoomIn, ZoomOut, RotateCcw, Info, Layers } from 'lucide-react';

interface GraphVisualizerProps {
  data: GraphData;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ data }) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const entityTypes = ['ALL', 'Course', 'Student', 'Batch', 'Regulation', 'Notice', 'Document', 'Program'];

  const filteredNodes = selectedType === 'ALL'
    ? data.nodes
    : data.nodes.filter(n => n.entity_type.toLowerCase() === selectedType.toLowerCase());

  const nodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = data.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

  const getNodeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'course': return 'bg-indigo-600 border-indigo-400 text-indigo-100 shadow-indigo-500/20';
      case 'regulation': return 'bg-amber-600 border-amber-400 text-amber-100 shadow-amber-500/20';
      case 'notice': return 'bg-rose-600 border-rose-400 text-rose-100 shadow-rose-500/20';
      case 'student': return 'bg-emerald-600 border-emerald-400 text-emerald-100 shadow-emerald-500/20';
      case 'batch': return 'bg-teal-600 border-teal-400 text-teal-100 shadow-teal-500/20';
      case 'document': return 'bg-slate-700 border-slate-500 text-slate-100 shadow-slate-500/20';
      default: return 'bg-purple-600 border-purple-400 text-purple-100 shadow-purple-500/20';
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col">
      {/* Controls Bar */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">PDEU Academic Knowledge Graph</h3>
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">
            {filteredNodes.length} Nodes • {filteredEdges.length} Relations
          </span>
        </div>

        {/* Entity Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          {entityTypes.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedType === t
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="relative min-h-[360px] max-h-[500px] overflow-auto p-6 bg-radial from-slate-900 to-slate-950 flex flex-wrap gap-4 items-center justify-center">
        {filteredNodes.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-12">
            No nodes found for entity type '{selectedType}'.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
            {filteredNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between shadow-md hover:scale-105 ${
                    isSelected ? 'ring-2 ring-amber-400 border-amber-300' : ''
                  } ${getNodeColor(node.entity_type)}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold tracking-wider uppercase opacity-80">
                      {node.entity_type}
                    </span>
                    <span className="text-[9px] font-mono opacity-70">
                      {node.id.split(':')[0]}
                    </span>
                  </div>
                  <div className="font-semibold text-white line-clamp-2">
                    {node.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Node Inspector Drawer */}
      {selectedNode && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-start justify-between gap-4 text-xs animate-in slide-in-from-bottom-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold uppercase">{selectedNode.entity_type}</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-slate-400">{selectedNode.id}</span>
            </div>
            <div className="text-sm font-semibold text-white">{selectedNode.name}</div>
            <div className="text-slate-400 text-[11px]">
              Connected relations in graph:
              <span className="text-slate-300 ml-1">
                {data.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} edges
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
