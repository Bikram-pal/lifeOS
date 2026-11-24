import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Network,
  Save,
  RotateCcw,
  Search,
  FileText,
  StickyNote,
  FolderKanban,
  CheckSquare,
  ArrowRight,
  Trash2,
  Link2,
  Undo2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { graphService } from '../../services/graph.service';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

// ─── Custom Node ────────────────────────────────────────────────────────────
const CustomGraphNode = ({ data, selected }) => {
  const typeStyles = {
    document: {
      border: 'border-primary-500/70',
      bg: 'bg-primary-950/40',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      icon: <FileText className="w-4 h-4 text-primary-400" />,
      badge: 'Document',
      badgeColor: 'text-primary-300 bg-primary-950/80 border-primary-800/60',
    },
    note: {
      border: 'border-violet-500/70',
      bg: 'bg-violet-950/40',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]',
      icon: <StickyNote className="w-4 h-4 text-violet-400" />,
      badge: 'Note',
      badgeColor: 'text-violet-300 bg-violet-950/80 border-violet-800/60',
    },
    project: {
      border: 'border-emerald-500/70',
      bg: 'bg-emerald-950/40',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      icon: <FolderKanban className="w-4 h-4 text-emerald-400" />,
      badge: 'Project',
      badgeColor: 'text-emerald-300 bg-emerald-950/80 border-emerald-800/60',
    },
    task: {
      border: 'border-amber-500/70',
      bg: 'bg-amber-950/40',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      icon: <CheckSquare className="w-4 h-4 text-amber-400" />,
      badge: 'Task',
      badgeColor: 'text-amber-300 bg-amber-950/80 border-amber-800/60',
    },
  };

  const style = typeStyles[data.nodeType] || typeStyles.document;

  return (
    <div
      className={`relative px-4 py-3 rounded-xl border backdrop-blur-md transition-all select-none min-w-[200px] max-w-[240px] ${
        style.bg
      } ${style.border} ${selected ? `${style.glow} ring-2 ring-white/50 scale-105` : 'hover:border-slate-400'}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-[#0E1424]"
      />

      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          {style.icon}
          <span
            className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${style.badgeColor}`}
          >
            {style.badge}
          </span>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-100 truncate" title={data.label}>
        {data.label}
      </p>

      {data.subtitle && (
        <p className="text-[10px] text-slate-400 truncate mt-0.5">
          {data.subtitle}
        </p>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-primary-400 !border-2 !border-[#0E1424]"
      />
    </div>
  );
};

// ─── Custom Deletable Edge ────────────────────────────────────────────────────
// Clicking the pill opens the confirmation modal (via data.onRequestDelete)
// — it does NOT immediately delete. Direct keyboard delete is handled separately.
const DeletableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#818cf8' : style.stroke || '#6366f1',
          strokeWidth: selected ? 2.5 : 1.5,
          filter: selected ? 'drop-shadow(0 0 6px rgba(99,102,241,0.6))' : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`nodrag nopan flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] shadow-xl group transition-all cursor-pointer border ${
            selected
              ? 'bg-indigo-950/80 border-indigo-500/70 text-indigo-200'
              : 'bg-[#0F172A] border-[#233054] hover:border-rose-500/80 text-slate-300'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            // Open modal to confirm — do not delete immediately
            data?.onRequestDelete?.(id);
          }}
          title="Click to remove this connection"
        >
          <span className={`font-medium text-[10px] ${selected ? 'text-indigo-200' : 'text-slate-300 group-hover:text-white'}`}>
            {label || 'connected'}
          </span>
          <span
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-xs font-bold leading-none transition-colors ${
              selected
                ? 'bg-indigo-800 text-indigo-200'
                : 'bg-slate-800 group-hover:bg-rose-950 text-slate-400 group-hover:text-rose-400'
            }`}
          >
            ×
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
export const KnowledgeGraphPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState(null);
  // edgePendingDelete: the edge the user wants to confirm-delete via the modal
  const [edgePendingDelete, setEdgePendingDelete] = useState(null);

  // Tracks the last DB-persisted edgeId so we can undo it
  const lastCreatedEdgeId = useRef(null);

  // Stable maps for label lookup in modal
  const nodeLabelMap = useMemo(() => {
    const m = {};
    nodes.forEach((n) => { m[n.id] = n.data?.label || n.id; });
    return m;
  }, [nodes]);

  // Define custom types — must be stable references
  const nodeTypes = useMemo(() => ({ custom: CustomGraphNode }), []);
  const edgeTypes = useMemo(() => ({ deletable: DeletableEdge }), []);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const { data: graphData, isLoading } = useQuery({
    queryKey: ['knowledge-graph'],
    queryFn: graphService.getGraphData,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const deleteEdgeMutation = useMutation({
    mutationFn: (edgeId) => graphService.deleteEdge(edgeId),
    onSuccess: (_, edgeId) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      if (lastCreatedEdgeId.current === edgeId) lastCreatedEdgeId.current = null;
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph'] });
      toast.success('Connection removed');
      setEdgePendingDelete(null);
    },
    onError: () => toast.error('Failed to remove connection'),
  });

  const handleDeleteEdge = useCallback(
    (edgeId) => { deleteEdgeMutation.mutate(edgeId); },
    [deleteEdgeMutation]
  );

  // Opens the confirmation modal for a given edge id
  const handleRequestDelete = useCallback(
    (edgeId) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (edge) setEdgePendingDelete(edge);
    },
    [edges]
  );

  // Undo the most recently created edge
  const handleUndoLastEdge = useCallback(() => {
    if (!lastCreatedEdgeId.current) {
      toast.info('Nothing to undo');
      return;
    }
    handleDeleteEdge(lastCreatedEdgeId.current);
    toast.success('Last connection undone');
  }, [handleDeleteEdge]);

  // Connect mutation — saves edge to DB and captures the returned DB edgeId
  const connectMutation = useMutation({
    mutationFn: (edgePayload) => graphService.createEdge(edgePayload),
    onSuccess: (res, variables) => {
      const dbEdgeId = res?.data?.edgeId || variables.tempId;
      // Swap the temp React Flow edge id with the real DB edgeId
      setEdges((eds) =>
        eds.map((e) =>
          e.id === variables.tempId
            ? {
                ...e,
                id: dbEdgeId,
                data: { ...e.data, onRequestDelete: handleRequestDelete },
              }
            : e
        )
      );
      lastCreatedEdgeId.current = dbEdgeId;
      toast.success('Connection linked');
    },
    onError: (_, variables) => {
      // Roll back the optimistic edge
      setEdges((eds) => eds.filter((e) => e.id !== variables.tempId));
      toast.error('Failed to link connection');
    },
  });

  // ── Sync when query data arrives ──────────────────────────────────────────
  useEffect(() => {
    if (graphData?.data) {
      setNodes(graphData.data.nodes || []);
      const formattedEdges = (graphData.data.edges || []).map((e) => ({
        ...e,
        type: 'deletable',
        data: {
          ...e.data,
          onRequestDelete: handleRequestDelete,
        },
      }));
      setEdges(formattedEdges);
    }
  }, [graphData]); // intentionally exclude handleRequestDelete to avoid re-syncing on every render

  // ── Save layout ───────────────────────────────────────────────────────────
  const saveLayoutMutation = useMutation({
    mutationFn: (currentNodes) => graphService.saveGraphLayout(currentNodes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph'] });
      toast.success('Knowledge Graph layout saved!');
    },
    onError: () => toast.error('Failed to save layout'),
  });

  // ── Flow Handlers ─────────────────────────────────────────────────────────
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => {
      // Use a temp id until the server responds with the real edgeId
      const tempId = `temp-edge-${params.source}-${params.target}-${Date.now()}`;
      const newEdge = {
        ...params,
        id: tempId,
        type: 'deletable',
        animated: true,
        data: { onRequestDelete: handleRequestDelete },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      connectMutation.mutate({
        tempId,
        source: params.source,
        target: params.target,
        label: 'connected',
      });
    },
    [connectMutation, handleRequestDelete]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  // Clicking an edge opens the remove-connection modal
  const onEdgeClick = useCallback(
    (_, edge) => {
      setEdgePendingDelete(edge);
    },
    []
  );

  // Keyboard delete (Backspace / Delete) — opens modal for confirmation
  const onEdgesDelete = useCallback(
    (deletedEdges) => {
      if (deletedEdges.length === 1) {
        setEdgePendingDelete(deletedEdges[0]);
        // Re-add the edge so it isn't removed until confirmed
        setEdges((eds) => {
          const alreadyPresent = eds.some((e) => e.id === deletedEdges[0].id);
          if (alreadyPresent) return eds;
          return [...eds, deletedEdges[0]];
        });
      } else {
        // For multi-select bulk delete, open the first and proceed
        deletedEdges.forEach((e) => handleDeleteEdge(e.id));
      }
    },
    [handleDeleteEdge]
  );

  // ── Filter + search ───────────────────────────────────────────────────────
  const visibleNodes = useMemo(() => {
    return nodes.map((node) => {
      const matchesType = filterType === 'ALL' || node.data.nodeType === filterType;
      const matchesSearch =
        !search.trim() || node.data.label.toLowerCase().includes(search.toLowerCase());
      return { ...node, hidden: !matchesType || !matchesSearch };
    });
  }, [nodes, filterType, search]);

  // ── Auto Layout ───────────────────────────────────────────────────────────
  const handleAutoLayout = () => {
    const colMap = { document: 80, note: 380, project: 680, task: 980 };
    const counters = { document: 0, note: 0, project: 0, task: 0 };

    const organized = nodes.map((n) => {
      const type = n.data.nodeType || 'document';
      const x = colMap[type] || 80;
      const y = 80 + (counters[type] || 0) * 160;
      counters[type] = (counters[type] || 0) + 1;
      return { ...n, position: { x, y } };
    });

    setNodes(organized);
    toast.success('Nodes organised by category');
  };

  const stats = graphData?.data?.stats || {
    totalNodes: 0,
    totalEdges: 0,
    documents: 0,
    notes: 0,
    projects: 0,
    tasks: 0,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-400" />
            Knowledge Graph
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Interactive visual network — drag nodes to connect, click edges to remove.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Undo last connection */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Undo2 className="w-3.5 h-3.5" />}
            onClick={handleUndoLastEdge}
            title="Undo the last connection you drew"
          >
            Undo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleAutoLayout}
          >
            Auto Layout
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-3.5 h-3.5" />}
            isLoading={saveLayoutMutation.isPending}
            onClick={() => saveLayoutMutation.mutate(nodes)}
          >
            Save Positions
          </Button>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <Card className="p-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Entities' },
              { id: 'document', label: `Documents (${stats.documents})` },
              { id: 'note', label: `Notes (${stats.notes})` },
              { id: 'project', label: `Projects (${stats.projects})` },
              { id: 'task', label: `Tasks (${stats.tasks})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filterType === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[#111726] text-slate-300 hover:bg-[#1D2847] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar & Stats */}
          <div className="flex items-center gap-3">
            <div className="w-60">
              <Input
                placeholder="Find node by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-[#111726] border border-[#233054] px-3 py-1.5 rounded-lg">
              <span>Nodes: <strong className="text-white">{stats.totalNodes}</strong></span>
              <span>•</span>
              <span>Edges: <strong className="text-white">{edges.length}</strong></span>
            </div>
          </div>
        </div>
      </Card>

      {/* Hint bar */}
      <div className="flex items-center gap-4 text-[11px] text-slate-500 px-1">
        <span>🖱 Drag from a node handle to connect</span>
        <span>•</span>
        <span>🖱 Click an edge label to remove it</span>
        <span>•</span>
        <span>⌨ Select an edge + Backspace opens confirmation</span>
        <span>•</span>
        <span>↩ Use Undo to remove the last connection</span>
      </div>

      {/* React Flow Graph Canvas */}
      <div className="h-[680px] w-full rounded-2xl border border-[#233054] bg-[#0A0E1A] overflow-hidden relative shadow-2xl">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Rendering interactive knowledge network...
          </div>
        ) : (
          <ReactFlow
            nodes={visibleNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onEdgesDelete={onEdgesDelete}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
            minZoom={0.2}
            maxZoom={2}
          >
            <Background color="#1D2847" gap={20} size={1} />
            <Controls className="!bg-[#161F36] !border-[#233054] !fill-slate-300 !text-slate-300 rounded-xl overflow-hidden shadow-lg" />
            <MiniMap
              nodeColor={(n) => {
                const colors = {
                  document: '#3B82F6',
                  note: '#8B5CF6',
                  project: '#10B981',
                  task: '#F59E0B',
                };
                return colors[n.data?.nodeType] || '#6366F1';
              }}
              maskColor="rgba(11, 15, 25, 0.85)"
              className="!bg-[#0E1424] !border-[#233054] rounded-xl overflow-hidden"
            />
          </ReactFlow>
        )}
      </div>

      {/* Node Detail Modal */}
      {selectedNode && (
        <Modal
          isOpen={!!selectedNode}
          onClose={() => setSelectedNode(null)}
          title={`Entity Inspector: ${selectedNode.data?.label || ''}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#111726] p-3 rounded-lg border border-[#233054]">
              <span className="text-xs text-slate-400">Type</span>
              <Badge variant="primary" className="uppercase font-mono text-[10px]">
                {selectedNode.data?.nodeType}
              </Badge>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Title / Name</label>
              <p className="text-sm font-semibold text-slate-100 bg-[#111726] p-3 rounded-lg border border-[#233054]">
                {selectedNode.data?.label}
              </p>
            </div>

            {selectedNode.data?.subtitle && (
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Status / Meta</label>
                <p className="text-xs text-slate-300 bg-[#111726] p-3 rounded-lg border border-[#233054]">
                  {selectedNode.data?.subtitle}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#233054]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedNode(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  const type = selectedNode.data?.nodeType;
                  if (type === 'document' || type === 'note') navigate('/vault');
                  else if (type === 'project') navigate('/projects');
                  else if (type === 'task') navigate('/tasks');
                  setSelectedNode(null);
                }}
              >
                Go to Module
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edge Remove Confirmation Modal */}
      {edgePendingDelete && (
        <Modal
          isOpen={!!edgePendingDelete}
          onClose={() => setEdgePendingDelete(null)}
          title="Remove Connection?"
        >
          <div className="space-y-4">
            {/* Show friendly node names */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#111726] border border-[#233054]">
              <Link2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <span className="text-slate-400">From: </span>
                  <strong className="text-white">
                    {nodeLabelMap[edgePendingDelete.source] || edgePendingDelete.source}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400">To: </span>
                  <strong className="text-white">
                    {nodeLabelMap[edgePendingDelete.target] || edgePendingDelete.target}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400">Label: </span>
                  <span className="italic text-slate-300">
                    {edgePendingDelete.label || 'connected'}
                  </span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              This will permanently unlink the relationship and cannot be re-created automatically.
              You can re-draw the edge manually from the canvas if needed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#233054]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEdgePendingDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                isLoading={deleteEdgeMutation.isPending}
                onClick={() => handleDeleteEdge(edgePendingDelete.id)}
              >
                Remove Connection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
