'use client';

import React, { useState, useMemo } from 'react';
import { GraphStep } from '@/lib/types';
import {
  Building2, Briefcase, TrendingUp, Trophy, GraduationCap,
  BookOpen, ShieldCheck, Check, Copy, Network, Layers, Sparkles
} from 'lucide-react';

interface VisualReasoningGraphProps {
  steps: GraphStep[];
}

interface NodeData {
  id: string;
  label: string;
  type: 'university' | 'service' | 'metric' | 'course' | 'requirement' | 'general';
  col: number;
  row: number;
  x: number;
  y: number;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  relation: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export const VisualReasoningGraph: React.FC<VisualReasoningGraphProps> = ({ steps }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [copiedNode, setCopiedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'text'>('visual');

  const copyNodeName = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedNode(name);
    setTimeout(() => setCopiedNode(null), 1800);
  };

  // Classify node types based on names
  const getNodeType = (name: string): NodeData['type'] => {
    const lower = name.toLowerCase();
    if (lower.includes('pdeu') || lower.includes('university')) return 'university';
    if (lower.includes('placement') || lower.includes('cell') || lower.includes('office') || lower.includes('council')) return 'service';
    if (lower.includes('lpa') || lower.includes('₹') || lower.includes('package') || lower.includes('%') || lower.includes('average') || lower.includes('highest')) return 'metric';
    if (lower.includes('cs') || lower.includes('math') || lower.includes('physics') || lower.includes('programming') || lower.includes('course') || lower.includes('semester') || lower.includes('sem')) return 'course';
    if (lower.includes('credit') || lower.includes('requirement') || lower.includes('cpi') || lower.includes('attendance') || lower.includes('rule')) return 'requirement';
    return 'general';
  };

  const getNodeStyles = (type: NodeData['type'], isHovered: boolean, isConnected: boolean) => {
    let base = 'transition-all duration-200 border rounded-xl p-3 shadow-lg select-none cursor-pointer ';
    if (isHovered) {
      base += 'scale-105 ring-2 ring-amber-400 z-30 ';
    } else if (isConnected) {
      base += 'ring-1 ring-amber-400/60 z-20 ';
    }

    switch (type) {
      case 'university':
        return base + 'bg-gradient-to-br from-blue-950/90 to-slate-900 border-blue-500/50 text-blue-200 shadow-blue-500/10';
      case 'service':
        return base + 'bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-500/50 text-amber-200 shadow-amber-500/10';
      case 'metric':
        return base + 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/50 text-emerald-200 shadow-emerald-500/10';
      case 'course':
        return base + 'bg-gradient-to-br from-purple-950/80 to-slate-900 border-purple-500/50 text-purple-200 shadow-purple-500/10';
      case 'requirement':
        return base + 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-500/50 text-cyan-200 shadow-cyan-500/10';
      default:
        return base + 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 text-slate-200 shadow-slate-500/10';
    }
  };

  const getNodeIcon = (type: NodeData['type']) => {
    switch (type) {
      case 'university': return <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'service': return <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'metric': return <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'course': return <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'requirement': return <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      default: return <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  // Build DAG Layout (Col 0, Col 1, Col 2...)
  const { nodes, edges, width, height } = useMemo(() => {
    if (!steps || steps.length === 0) {
      return { nodes: [], edges: [], width: 600, height: 200 };
    }

    const uniqueNodeIds = new Set<string>();
    const inDegrees: Record<string, number> = {};
    const outDegrees: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    steps.forEach(s => {
      uniqueNodeIds.add(s.source);
      uniqueNodeIds.add(s.target);
      inDegrees[s.target] = (inDegrees[s.target] || 0) + 1;
      outDegrees[s.source] = (outDegrees[s.source] || 0) + 1;
      adj[s.source] = adj[s.source] || [];
      adj[s.source].push(s.target);
    });

    const nodeArray = Array.from(uniqueNodeIds);
    const nodeCols: Record<string, number> = {};

    // Roots (inDegree == 0) -> Col 0
    nodeArray.forEach(id => {
      if (!inDegrees[id]) {
        nodeCols[id] = 0;
      }
    });

    // If no explicit root found (e.g. cycle), pick the first source
    if (Object.keys(nodeCols).length === 0 && steps.length > 0) {
      nodeCols[steps[0].source] = 0;
    }

    // Assign column levels based on steps progression
    let changed = true;
    let iteration = 0;
    while (changed && iteration < 5) {
      changed = false;
      iteration++;
      steps.forEach(s => {
        const u = s.source;
        const v = s.target;
        const uCol = nodeCols[u] !== undefined ? nodeCols[u] : 0;
        const targetCol = uCol + 1;
        if (nodeCols[v] === undefined || nodeCols[v] < targetCol) {
          nodeCols[v] = targetCol;
          changed = true;
        }
      });
    }

    // Group nodes by column
    const columns: Record<number, string[]> = {};
    nodeArray.forEach(id => {
      const col = nodeCols[id] !== undefined ? nodeCols[id] : 1;
      columns[col] = columns[col] || [];
      columns[col].push(id);
    });

    const colKeys = Object.keys(columns).map(Number).sort((a, b) => a - b);
    const numCols = Math.max(colKeys.length, 2);

    const colWidth = 260;
    const rowHeight = 90;
    const padX = 40;
    const padY = 40;

    const maxRows = Math.max(...colKeys.map(k => columns[k].length), 1);
    const totalWidth = Math.max(numCols * colWidth + padX * 2, 700);
    const totalHeight = Math.max(maxRows * rowHeight + padY * 2, 220);

    const calculatedNodes: Record<string, NodeData> = {};

    colKeys.forEach((colIdx, cPos) => {
      const colNodes = columns[colIdx];
      const count = colNodes.length;
      colNodes.forEach((nodeId, rPos) => {
        // Center nodes vertically in each column
        const availableHeight = totalHeight - padY * 2;
        const stepY = count === 1 ? availableHeight / 2 : (availableHeight / (count + 1)) * (rPos + 1);
        const x = padX + cPos * colWidth;
        const y = padY + stepY;

        calculatedNodes[nodeId] = {
          id: nodeId,
          label: nodeId.replace(/^univ:/, '').replace(/^course:/, ''),
          type: getNodeType(nodeId),
          col: cPos,
          row: rPos,
          x,
          y
        };
      });
    });

    // Calculate edge coordinates
    const calculatedEdges: EdgeData[] = steps.map((s, idx) => {
      const src = calculatedNodes[s.source];
      const tgt = calculatedNodes[s.target];
      return {
        id: `e_${idx}`,
        source: s.source,
        target: s.target,
        relation: s.relation,
        fromX: src ? src.x + 190 : 0,
        fromY: src ? src.y + 24 : 0,
        toX: tgt ? tgt.x - 10 : 0,
        toY: tgt ? tgt.y + 24 : 0
      };
    });

    return {
      nodes: Object.values(calculatedNodes),
      edges: calculatedEdges,
      width: totalWidth,
      height: totalHeight
    };
  }, [steps]);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header Controls */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-amber-400" />
            Active Multi-Hop Knowledge Graph Traversal
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {nodes.length} entities • {edges.length} hops
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px]">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-2 py-0.5 rounded font-medium transition-all ${
              viewMode === 'visual'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Visual Graph
          </button>
          <button
            onClick={() => setViewMode('text')}
            className={`px-2 py-0.5 rounded font-medium transition-all ${
              viewMode === 'text'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Trace Log
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        /* Visual SVG Graph View */
        <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border border-slate-800/90 shadow-2xl overflow-x-auto p-4">
          <div
            className="relative"
            style={{ width: `${width}px`, height: `${height}px`, minWidth: '100%' }}
          >
            {/* SVG Connecting Edges & Floating Relation Pills */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={width}
              height={height}
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              <defs>
                {/* Arrowhead marker */}
                <marker
                  id="graph-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#e87722" />
                </marker>
                {/* Highlighted Arrowhead */}
                <marker
                  id="graph-arrow-active"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#fbbf24" />
                </marker>
                {/* Edge Gradient */}
                <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Render Bezier Connector Paths */}
              {edges.map((edge) => {
                const isHovered =
                  hoveredNode === edge.source || hoveredNode === edge.target;
                const dx = Math.abs(edge.toX - edge.fromX);
                const cp1x = edge.fromX + dx * 0.45;
                const cp2x = edge.toX - dx * 0.45;
                const pathD = `M ${edge.fromX} ${edge.fromY} C ${cp1x} ${edge.fromY}, ${cp2x} ${edge.toY}, ${edge.toX} ${edge.toY}`;

                return (
                  <g key={edge.id}>
                    {/* Shadow/Glow path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isHovered ? '#fbbf24' : '#e87722'}
                      strokeWidth={isHovered ? 4 : 2}
                      strokeOpacity={isHovered ? 0.6 : 0.25}
                    />
                    {/* Main directed bezier path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isHovered ? '#fbbf24' : 'url(#edge-gradient)'}
                      strokeWidth={isHovered ? 2.5 : 1.75}
                      strokeDasharray={isHovered ? 'none' : '5,4'}
                      markerEnd={
                        isHovered
                          ? 'url(#graph-arrow-active)'
                          : 'url(#graph-arrow)'
                      }
                      className="transition-all duration-200"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Edge Relation Floating Badges (HTML absolute overlay) */}
            {edges.map((edge) => {
              const midX = (edge.fromX + edge.toX) / 2;
              const midY = (edge.fromY + edge.toY) / 2;
              const isHovered =
                hoveredNode === edge.source || hoveredNode === edge.target;

              return (
                <div
                  key={`badge_${edge.id}`}
                  style={{
                    position: 'absolute',
                    left: `${midX}px`,
                    top: `${midY}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className={`pointer-events-none px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-wider transition-all duration-200 shadow-md ${
                    isHovered
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 scale-105 z-20'
                      : 'bg-slate-950/90 text-amber-300 border-amber-500/40 z-10'
                  }`}
                >
                  {edge.relation}
                </div>
              );
            })}

            {/* Render Node Cards */}
            {nodes.map((node) => {
              const isHovered = hoveredNode === node.id;
              const isConnected =
                !isHovered &&
                edges.some(
                  e =>
                    (e.source === hoveredNode && e.target === node.id) ||
                    (e.target === hoveredNode && e.source === node.id)
                );

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '190px'
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => copyNodeName(node.label)}
                  title="Click to copy node name"
                  className={getNodeStyles(node.type, isHovered, isConnected)}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="flex items-center gap-1 text-[9px] font-mono uppercase font-bold tracking-wider opacity-75">
                      {getNodeIcon(node.type)}
                      <span>{node.type}</span>
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {copiedNode === node.label ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
                      )}
                    </span>
                  </div>

                  <div className="font-semibold text-xs leading-snug break-words">
                    {node.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Hover node to highlight traversal path • Click to copy
            </span>
            <span className="font-mono text-slate-400">
              Live PDEU Subgraph Projection
            </span>
          </div>
        </div>
      ) : (
        /* Text-based Trace Log View */
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
          {steps.map((step, sIdx) => (
            <div
              key={sIdx}
              className="flex items-center gap-2 text-slate-300 overflow-x-auto p-1.5 rounded hover:bg-slate-900 transition-colors"
            >
              <span className="text-amber-300 font-semibold">{step.source}</span>
              <span className="text-slate-500 font-mono">─[{step.relation}]─▶</span>
              <span className="text-emerald-300 font-semibold">{step.target}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
