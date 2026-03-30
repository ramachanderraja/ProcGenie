'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Node, Edge } from '@xyflow/react';
import {
  ArrowLeft,
  Save,
  Play,
  Pause,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  getWorkflow,
  updateWorkflow,
  activateWorkflow,
  archiveWorkflow,
  type WorkflowDefinition,
} from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { NodePalette } from '@/components/workflow/NodePalette';
import { PropertiesPanel } from '@/components/workflow/PropertiesPanel';

function formatStatus(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: workflow, loading, error, setData } = useApi<WorkflowDefinition>(
    () => getWorkflow(id),
    [id],
  );

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  // Editable workflow name
  const [editName, setEditName] = useState('');
  const nameInitialized = useRef(false);

  useEffect(() => {
    if (workflow && !nameInitialized.current) {
      setEditName(workflow.name);
      nameInitialized.current = true;
    }
  }, [workflow]);

  // Current graph state
  const graphRef = useRef<{ nodes: Node[]; edges: Edge[] }>({
    nodes: workflow?.graph?.nodes ?? [],
    edges: workflow?.graph?.edges ?? [],
  });

  // Update graphRef when workflow loads
  useEffect(() => {
    if (workflow?.graph) {
      graphRef.current = {
        nodes: workflow.graph.nodes ?? [],
        edges: workflow.graph.edges ?? [],
      };
    }
  }, [workflow]);

  // Canvas ref for imperative operations
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const handleGraphChange = useCallback((nodes: Node[], edges: Edge[]) => {
    graphRef.current = { nodes, edges };
  }, []);

  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      // Update the node in the canvas
      const wrapper = canvasWrapperRef.current?.querySelector('[data-workflow-canvas]');
      if (wrapper) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateFn = (wrapper as any).__updateNodeData;
        if (updateFn) updateFn(nodeId, newData);
      }

      // Also update selected node locally for the properties panel
      setSelectedNode((prev) => (prev && prev.id === nodeId ? { ...prev, data: newData } : prev));
    },
    [],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      const wrapper = canvasWrapperRef.current?.querySelector('[data-workflow-canvas]');
      if (wrapper) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deleteFn = (wrapper as any).__deleteNode;
        if (deleteFn) deleteFn(nodeId);
      }
      setSelectedNode(null);
    },
    [],
  );

  const handleSave = async () => {
    if (!workflow) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updated = await updateWorkflow(id, {
        name: editName,
        graph: {
          nodes: graphRef.current.nodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data,
          })),
          edges: graphRef.current.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            type: e.type,
            data: e.data,
          })),
        },
      });
      setData(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!workflow) return;
    setActivating(true);
    try {
      const isActive = workflow.status.toLowerCase() === 'active';
      const updated = isActive ? await archiveWorkflow(id) : await activateWorkflow(id);
      setData(updated);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-700">{error || 'Workflow not found'}</p>
        <Link
          href="/workflows"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Back to Workflows
        </Link>
      </div>
    );
  }

  const isActive = workflow.status.toLowerCase() === 'active';

  return (
    <div className="flex h-screen flex-col overflow-hidden -m-6">
      {/* Top Bar */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/workflows"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>

          {/* Editable name */}
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border-none bg-transparent text-lg font-semibold text-slate-900 focus:outline-none focus:ring-0 min-w-[200px]"
            placeholder="Workflow name..."
          />

          {/* Entity type pills */}
          <div className="flex gap-1 ml-2">
            {(workflow.entityTypes ?? []).map((et) => (
              <span
                key={et}
                className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {et.replace('_', ' ')}
              </span>
            ))}
          </div>

          {/* Status badge */}
          <StatusBadge status={formatStatus(workflow.status)} />
        </div>

        <div className="flex items-center gap-2">
          {/* Save feedback */}
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
          {saveError && (
            <span className="text-xs text-red-600">{saveError}</span>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>

          {/* Activate / Deactivate */}
          <button
            onClick={handleToggleActive}
            disabled={activating}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 ${
              isActive
                ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {activating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isActive ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[280px] flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4">
          {selectedNode ? (
            <PropertiesPanel
              node={selectedNode}
              onNodeDataChange={handleNodeDataChange}
              onDeleteNode={handleDeleteNode}
            />
          ) : (
            <NodePalette />
          )}
        </div>

        {/* Canvas */}
        <div ref={canvasWrapperRef} className="flex-1 bg-slate-50">
          <WorkflowCanvas
            initialNodes={workflow.graph?.nodes ?? []}
            initialEdges={(workflow.graph?.edges ?? []).map((e: Edge) => ({
              ...e,
              type:
                e.sourceHandle &&
                ['approved', 'rejected', 'true', 'false', 'above_threshold', 'below_threshold'].includes(e.sourceHandle)
                  ? 'conditional'
                  : e.type || 'default',
            }))}
            onGraphChange={handleGraphChange}
            onNodeSelect={handleNodeSelect}
          />
        </div>
      </div>
    </div>
  );
}
