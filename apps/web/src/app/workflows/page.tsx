'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Workflow,
  Plus,
  Search,
  ChevronRight,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { listWorkflows, createWorkflow, type WorkflowDefinition } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/StatCard';

const tabs = ['All', 'Active', 'Draft', 'Archived'] as const;

const ENTITY_TYPE_OPTIONS = [
  { value: 'REQUEST', label: 'Request' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'PURCHASE_ORDER', label: 'Purchase Order' },
] as const;

const WORKFLOW_TYPE_OPTIONS = [
  { value: 'approval', label: 'Approval' },
  { value: 'review', label: 'Review' },
  { value: 'sourcing', label: 'Sourcing' },
  { value: 'contract', label: 'Contract' },
  { value: 'invoice', label: 'Invoice' },
] as const;

function formatStatus(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('approval');
  const [newEntityTypes, setNewEntityTypes] = useState<string[]>([]);

  const { data, loading, error, refetch } = useApi<WorkflowDefinition[]>(
    () => listWorkflows(),
    [],
  );

  const workflows = useMemo(() => {
    let items = data ?? [];

    // Filter by tab
    if (activeTab !== 'All') {
      const tabStatus = activeTab.toLowerCase();
      items = items.filter(
        (w) => w.status.toLowerCase() === tabStatus,
      );
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.description?.toLowerCase().includes(q) ||
          w.entityTypes?.some((et) => et.toLowerCase().includes(q)),
      );
    }

    return items;
  }, [data, activeTab, search]);

  const totalCount = data?.length ?? 0;
  const activeCount = useMemo(
    () => (data ?? []).filter((w) => w.status.toLowerCase() === 'active').length,
    [data],
  );
  const draftCount = useMemo(
    () => (data ?? []).filter((w) => w.status.toLowerCase() === 'draft').length,
    [data],
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createWorkflow({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        type: newType,
        entityTypes: newEntityTypes,
        status: 'draft',
        graph: { nodes: [], edges: [] },
      });
      setShowCreateModal(false);
      setNewName('');
      setNewDescription('');
      setNewType('approval');
      setNewEntityTypes([]);
      router.push(`/workflows/${created.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create workflow');
    } finally {
      setCreating(false);
    }
  };

  const toggleEntityType = (value: string) => {
    setNewEntityTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workflow Designer</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage automated workflows across all procurement modules
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Workflow
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Workflows"
          value={loading ? '...' : totalCount}
          icon={Workflow}
          color="indigo"
        />
        <StatCard
          label="Active"
          value={loading ? '...' : activeCount}
          icon={Workflow}
          color="green"
        />
        <StatCard
          label="Drafts"
          value={loading ? '...' : draftCount}
          icon={Workflow}
          color="amber"
        />
      </div>

      {/* Search & Filter Tabs */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-4 mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-4 w-16 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Entity Types
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Version
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Last Modified
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {workflows.map((wf) => (
                  <tr
                    key={wf.id}
                    className="group cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => router.push(`/workflows/${wf.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                          <Workflow className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[240px] group-hover:text-indigo-600 transition-colors">
                            {wf.name}
                          </p>
                          {wf.description && (
                            <p className="text-xs text-slate-400 truncate max-w-[240px]">
                              {wf.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(wf.entityTypes ?? []).map((et) => (
                          <span
                            key={et}
                            className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                          >
                            {et.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={formatStatus(wf.status)} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-sm text-slate-600">
                      v{wf.version}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">
                      {formatDate(wf.updatedAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && workflows.length === 0 && (
          <div className="py-12 text-center">
            <Workflow className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No workflows found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Create your first workflow
            </button>
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Create Workflow</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Workflow Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Intake Approval Workflow"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe what this workflow does..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </div>

              {/* Entity Types */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Entity Types
                </label>
                <div className="flex flex-wrap gap-3">
                  {ENTITY_TYPE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newEntityTypes.includes(opt.value)}
                        onChange={() => toggleEntityType(opt.value)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Workflow Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  {WORKFLOW_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {createError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{createError}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
