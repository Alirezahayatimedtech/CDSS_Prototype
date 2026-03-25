import React, { useEffect, useMemo, useState } from 'react';
import dagre from 'dagre';
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
} from '@xyflow/react';
import {
  buildGraphExport,
  buildPythonEdgeList,
  exportNote,
  focusPresets,
  groupOrder,
  mainPathNodeIds,
  primaryNarrative,
  sansEdges,
  sansNodes,
  SANS_GROUPS,
} from './sansRiskData.js';

const NODE_WIDTH = 228;
const NODE_HEIGHT = 76;

function layoutGraph(nodes, edges, direction) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    ranksep: 90,
    nodesep: 35,
    marginx: 24,
    marginy: 24,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);
    return {
      ...node,
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
      sourcePosition: direction === 'LR' ? 'right' : 'bottom',
      targetPosition: direction === 'LR' ? 'left' : 'top',
    };
  });
}

function makeNodeLabel(node) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {SANS_GROUPS[node.group].label}
      </div>
      <div className="text-sm font-semibold leading-tight text-slate-900">{node.label}</div>
    </div>
  );
}

function CopyButton({ label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
        active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/5 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function SansRiskGraph() {
  const [focusPreset, setFocusPreset] = useState('all');
  const [layoutDirection, setLayoutDirection] = useState('LR');
  const [showSpeculative, setShowSpeculative] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('Intracranial Pressure Changes');
  const [copyState, setCopyState] = useState('idle');
  const [reactFlow, setReactFlow] = useState(null);

  const adjacency = useMemo(() => {
    const incoming = new Map();
    const outgoing = new Map();
    const undirected = new Map();

    sansNodes.forEach((node) => {
      incoming.set(node.id, []);
      outgoing.set(node.id, []);
      undirected.set(node.id, new Set());
    });

    sansEdges.forEach((edge) => {
      incoming.get(edge.target).push(edge);
      outgoing.get(edge.source).push(edge);
      undirected.get(edge.source).add(edge.target);
      undirected.get(edge.target).add(edge.source);
    });

    return { incoming, outgoing, undirected };
  }, []);

  const visibleNodeIds = useMemo(() => {
    const presetNodeIds = focusPresets[focusPreset].nodeIds
      ? new Set(focusPresets[focusPreset].nodeIds)
      : new Set(sansNodes.map((node) => node.id));
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return presetNodeIds;
    }

    const matches = sansNodes.filter((node) => node.label.toLowerCase().includes(term));
    if (!matches.length) {
      return presetNodeIds;
    }

    const scoped = new Set();
    matches.forEach((node) => {
      if (!presetNodeIds.has(node.id)) {
        return;
      }
      scoped.add(node.id);
      adjacency.undirected.get(node.id).forEach((neighbor) => {
        if (presetNodeIds.has(neighbor)) {
          scoped.add(neighbor);
        }
      });
    });

    return scoped.size ? scoped : presetNodeIds;
  }, [adjacency.undirected, focusPreset, searchTerm]);

  const visibleEdges = useMemo(
    () =>
      sansEdges.filter(
        (edge) =>
          visibleNodeIds.has(edge.source) &&
          visibleNodeIds.has(edge.target) &&
          (showSpeculative || !edge.speculative)
      ),
    [showSpeculative, visibleNodeIds]
  );

  const visibleNodes = useMemo(
    () => sansNodes.filter((node) => visibleNodeIds.has(node.id)),
    [visibleNodeIds]
  );

  useEffect(() => {
    if (!visibleNodeIds.has(selectedNodeId) && visibleNodes.length) {
      setSelectedNodeId(visibleNodes[0].id);
    }
  }, [selectedNodeId, visibleNodeIds, visibleNodes]);

  const graphElements = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const mainPathSet = new Set(mainPathNodeIds);
    const selectedNeighbors = selectedNodeId ? adjacency.undirected.get(selectedNodeId) ?? new Set() : new Set();

    const baseNodes = visibleNodes.map((node) => {
      const group = SANS_GROUPS[node.group];
      const isSelected = node.id === selectedNodeId;
      const isSearchHit = term && node.label.toLowerCase().includes(term);
      const isNeighbor = selectedNeighbors.has(node.id);
      const isMainPath = mainPathSet.has(node.id);

      return {
        id: node.id,
        data: { label: makeNodeLabel(node) },
        style: {
          width: NODE_WIDTH,
          minHeight: NODE_HEIGHT,
          borderRadius: 22,
          border: `2px solid ${isSelected ? '#0f172a' : group.color}`,
          background: group.background,
          boxShadow: isSelected
            ? '0 0 0 4px rgba(15, 23, 42, 0.12), 0 18px 32px rgba(15, 23, 42, 0.16)'
            : isSearchHit
              ? '0 16px 30px rgba(2, 132, 199, 0.16)'
              : '0 12px 24px rgba(15, 23, 42, 0.08)',
          opacity: term && !isSearchHit && !isSelected && !isNeighbor ? 0.55 : 1,
        },
        className: isMainPath ? 'sans-main-path-node' : '',
      };
    });

    const baseEdges = visibleEdges.map((edge) => {
      const selectedConnection =
        edge.source === selectedNodeId || edge.target === selectedNodeId;
      const onMainPath =
        mainPathSet.has(edge.source) && mainPathSet.has(edge.target);

      const stroke = edge.speculative
        ? '#94a3b8'
        : selectedConnection
          ? '#0f172a'
          : onMainPath
            ? '#ea580c'
            : '#475569';

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: edge.speculative,
        style: {
          stroke,
          strokeWidth: selectedConnection ? 2.8 : onMainPath ? 2.4 : 1.8,
          strokeDasharray: edge.speculative ? '7 5' : '0',
          opacity: edge.speculative ? 0.85 : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stroke,
        },
      };
    });

    return {
      nodes: layoutGraph(baseNodes, baseEdges, layoutDirection),
      edges: baseEdges,
    };
  }, [
    adjacency.undirected,
    layoutDirection,
    searchTerm,
    selectedNodeId,
    visibleEdges,
    visibleNodes,
  ]);

  useEffect(() => {
    if (!reactFlow) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      reactFlow.fitView({ padding: 0.16, duration: 500 });
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [graphElements, reactFlow]);

  const selectedNode = useMemo(
    () => sansNodes.find((node) => node.id === selectedNodeId) ?? null,
    [selectedNodeId]
  );

  const selectedIncoming = selectedNode
    ? adjacency.incoming.get(selectedNode.id) ?? []
    : [];
  const selectedOutgoing = selectedNode
    ? adjacency.outgoing.get(selectedNode.id) ?? []
    : [];

  async function copyText(text, mode) {
    try {
      if (!navigator?.clipboard?.writeText) {
        setCopyState('unsupported');
        return;
      }

      await navigator.clipboard.writeText(text);
      setCopyState(mode);
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
    }
  }

  function handleDownloadJson() {
    const blob = new Blob([JSON.stringify(buildGraphExport(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sans-risk-dag.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  const speculativeCount = sansEdges.filter((edge) => edge.speculative).length;

  return (
    <div className="space-y-6">
      <div
        className="overflow-hidden rounded-[32px] border border-slate-200/70 p-6 text-white shadow-2xl"
        style={{
          background:
            'linear-gradient(135deg, #0f172a 0%, #164e63 42%, #ea580c 100%)',
        }}
      >
        <div className="grid gap-6 xl:grid-cols-4">
          <div className="xl:col-span-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
              NASA SANS Risk Workspace
            </div>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight">
              Interactive DAG explorer built from Appendix C, with a separate speculative-edge overlay.
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-200">
              {exportNote}
            </p>
          </div>
          <div className="grid gap-3 rounded-[28px] bg-white/10 p-4 backdrop-blur">
            <StatPill label="Nodes" value={sansNodes.length} />
            <StatPill label="Base Edges" value={sansEdges.length} />
            <StatPill label="Speculative" value={speculativeCount} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="space-y-6 xl:col-span-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Graph controls</div>
                <div className="mt-1 text-sm text-slate-600">
                  Focus a layer, switch layout direction, search nodes, or export the graph model.
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton
                  label="Copy edge list"
                  onClick={() => copyText(buildPythonEdgeList(), 'python')}
                  active={copyState === 'python'}
                />
                <CopyButton
                  label="Copy JSON"
                  onClick={() => copyText(JSON.stringify(buildGraphExport(), null, 2), 'json')}
                  active={copyState === 'json'}
                />
                <CopyButton
                  label="Download JSON"
                  onClick={handleDownloadJson}
                  active={false}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Focus presets
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(focusPresets).map(([presetId, preset]) => (
                    <button
                      key={presetId}
                      type="button"
                      onClick={() => setFocusPreset(presetId)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        focusPreset === presetId
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  {focusPresets[focusPreset].description}
                </div>
              </div>

              <div className="grid gap-3">
                <label className="block">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Search nodes
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Try optic, mission, MRI..."
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'LR', label: 'Left to Right' },
                    { id: 'TB', label: 'Top to Bottom' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLayoutDirection(option.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        layoutDirection === option.id
                          ? 'bg-sky-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowSpeculative((value) => !value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      showSpeculative
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {showSpeculative ? 'Hide speculative' : 'Show speculative'}
                  </button>
                  <button
                    type="button"
                    onClick={() => reactFlow?.fitView({ padding: 0.16, duration: 400 })}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Fit view
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              {copyState === 'json' && <span>Graph JSON copied to clipboard.</span>}
              {copyState === 'python' && <span>Python edge list copied to clipboard.</span>}
              {copyState === 'unsupported' && <span>Clipboard API is unavailable in this browser context.</span>}
              {copyState === 'error' && <span>Clipboard write failed.</span>}
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">SANS DAG view</div>
                <div className="mt-1 text-sm text-slate-500">
                  Visible nodes {visibleNodes.length} of {sansNodes.length}; visible edges {visibleEdges.length} of {sansEdges.length}.
                </div>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Selected: {selectedNodeId}
              </div>
            </div>
            <div style={{ height: 780 }}>
              <ReactFlow
                nodes={graphElements.nodes}
                edges={graphElements.edges}
                fitView
                onInit={setReactFlow}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable
                minZoom={0.2}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#d4d4d8" gap={18} />
                <MiniMap
                  pannable
                  zoomable
                  nodeColor={(node) => {
                    const source = sansNodes.find((item) => item.id === node.id);
                    return source ? SANS_GROUPS[source.group].color : '#64748b';
                  }}
                />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-1">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
            <div className="text-sm font-semibold text-slate-900">Legend</div>
            <div className="mt-4 space-y-3">
              {groupOrder.map((groupId) => {
                const group = SANS_GROUPS[groupId];
                const count = sansNodes.filter((node) => node.group === groupId).length;

                return (
                  <div key={groupId} className="rounded-2xl border border-slate-100 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="text-sm font-semibold text-slate-900">{group.label}</span>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {count}
                      </span>
                    </div>
                    <div className="mt-2 text-xs leading-6 text-slate-500">{group.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Node inspector</div>
              {selectedNode && (
                <div
                  className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{
                    backgroundColor: SANS_GROUPS[selectedNode.group].background,
                    color: SANS_GROUPS[selectedNode.group].color,
                  }}
                >
                  {SANS_GROUPS[selectedNode.group].label}
                </div>
              )}
            </div>
            {selectedNode && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{selectedNode.label}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">{selectedNode.detail}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Incoming
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{selectedIncoming.length}</div>
                    <div className="mt-2 space-y-2">
                      {selectedIncoming.slice(0, 5).map((edge) => (
                        <div key={edge.id} className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
                          {edge.source}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Outgoing
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{selectedOutgoing.length}</div>
                    <div className="mt-2 space-y-2">
                      {selectedOutgoing.slice(0, 5).map((edge) => (
                        <div key={edge.id} className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
                          {edge.target}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
            <div className="text-sm font-semibold text-slate-900">Narrative path</div>
            <div className="mt-4 space-y-3">
              {primaryNarrative.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
