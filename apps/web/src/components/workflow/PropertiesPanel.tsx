'use client';

import { useState } from 'react';
import type { Node } from '@xyflow/react';
import {
  Play,
  UserCheck,
  GitBranch,
  Zap,
  Brain,
  Clock,
  Square,
  GitFork,
  Trash2,
  Plus,
  X,
} from 'lucide-react';

interface PropertiesPanelProps {
  node: Node;
  onNodeDataChange: (nodeId: string, newData: Record<string, unknown>) => void;
  onDeleteNode: (nodeId: string) => void;
  className?: string;
}

const nodeIcons: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  start: { icon: Play, color: 'text-emerald-600', label: 'Start' },
  approval: { icon: UserCheck, color: 'text-amber-600', label: 'Approval' },
  condition: { icon: GitBranch, color: 'text-blue-600', label: 'Condition' },
  action: { icon: Zap, color: 'text-indigo-600', label: 'Action' },
  ai_review: { icon: Brain, color: 'text-purple-600', label: 'AI Review' },
  wait: { icon: Clock, color: 'text-slate-600', label: 'Wait' },
  end: { icon: Square, color: 'text-red-500', label: 'End' },
  parallel: { icon: GitFork, color: 'text-cyan-600', label: 'Parallel' },
};

export function PropertiesPanel({
  node,
  onNodeDataChange,
  onDeleteNode,
  className,
}: PropertiesPanelProps) {
  const nodeType = node.type || 'action';
  const info = nodeIcons[nodeType] || nodeIcons.action;
  const Icon = info.icon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = node.data as Record<string, any>;

  const updateData = (updates: Record<string, unknown>) => {
    onNodeDataChange(node.id, { ...data, ...updates });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      onDeleteNode(node.id);
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
        <Icon className={`h-5 w-5 ${info.color}`} />
        <h3 className="text-sm font-semibold text-slate-800">{info.label} Properties</h3>
      </div>

      {/* Label field (common to all) */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-600 mb-1">Label</label>
        <input
          type="text"
          value={(data.label as string) || ''}
          onChange={(e) => updateData({ label: e.target.value })}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Type-specific fields */}
      <div className="space-y-4">
        {nodeType === 'start' && <StartFields data={data} updateData={updateData} />}
        {nodeType === 'approval' && <ApprovalFields data={data} updateData={updateData} />}
        {nodeType === 'condition' && <ConditionFields data={data} updateData={updateData} />}
        {nodeType === 'action' && <ActionFields data={data} updateData={updateData} />}
        {nodeType === 'ai_review' && <AiReviewFields data={data} updateData={updateData} />}
        {nodeType === 'wait' && <WaitFields data={data} updateData={updateData} />}
        {nodeType === 'end' && <EndFields data={data} updateData={updateData} />}
        {nodeType === 'parallel' && <ParallelFields data={data} updateData={updateData} />}
      </div>

      {/* Delete button */}
      <div className="mt-8 pt-4 border-t border-slate-100">
        <button
          onClick={handleDelete}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete Node
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Type-specific field components
// ─────────────────────────────────────────────────────────────────────────────

interface FieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  updateData: (updates: Record<string, unknown>) => void;
}

function StartFields({ data, updateData }: FieldProps) {
  const conditions: { field: string; operator: string; value: string }[] =
    data.conditions || [];

  const addCondition = () => {
    updateData({ conditions: [...conditions, { field: '', operator: 'eq', value: '' }] });
  };

  const removeCondition = (idx: number) => {
    updateData({ conditions: conditions.filter((_: unknown, i: number) => i !== idx) });
  };

  const updateCondition = (idx: number, key: string, value: string) => {
    const updated = [...conditions];
    updated[idx] = { ...updated[idx], [key]: value };
    updateData({ conditions: updated });
  };

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Entity Type</label>
        <select
          value={(data.entityType as string) || ''}
          onChange={(e) => updateData({ entityType: e.target.value })}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Select...</option>
          <option value="REQUEST">Request</option>
          <option value="CONTRACT">Contract</option>
          <option value="INVOICE">Invoice</option>
          <option value="PURCHASE_ORDER">Purchase Order</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Trigger Event</label>
        <select
          value={(data.event as string) || 'submitted'}
          onChange={(e) => updateData({ event: e.target.value })}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="submitted">Submitted</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-600">Conditions</label>
          <button
            onClick={addCondition}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {conditions.map((c: { field: string; operator: string; value: string }, idx: number) => (
          <div key={idx} className="flex items-center gap-1.5 mb-2">
            <input
              type="text"
              placeholder="field"
              value={c.field}
              onChange={(e) => updateCondition(idx, 'field', e.target.value)}
              className="h-8 w-1/3 rounded border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none"
            />
            <select
              value={c.operator}
              onChange={(e) => updateCondition(idx, 'operator', e.target.value)}
              className="h-8 w-1/4 rounded border border-slate-200 bg-slate-50 px-1 text-xs text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none"
            >
              <option value="eq">=</option>
              <option value="neq">!=</option>
              <option value="gt">&gt;</option>
              <option value="gte">&gt;=</option>
              <option value="lt">&lt;</option>
              <option value="lte">&lt;=</option>
              <option value="in">in</option>
              <option value="contains">contains</option>
            </select>
            <input
              type="text"
              placeholder="value"
              value={c.value}
              onChange={(e) => updateCondition(idx, 'value', e.target.value)}
              className="h-8 flex-1 rounded border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none"
            />
            <button
              onClick={() => removeCondition(idx)}
              className="p-1 text-slate-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function ApprovalFields({ data, updateData }: FieldProps) {
  const approvers: string[] = data.approvers || [];

  const addApprover = () => {
    updateData({ approvers: [...approvers, ''] });
  };

  const removeApprover = (idx: number) => {
    updateData({ approvers: approvers.filter((_: unknown, i: number) => i !== idx) });
  };

  const updateApprover = (idx: number, value: string) => {
    const updated = [...approvers];
    updated[idx] = value;
    updateData({ approvers: updated });
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-600">Approvers</label>
          <button
            onClick={addApprover}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {approvers.map((a: string, idx: number) => (
          <div key={idx} className="flex items-center gap-1.5 mb-2">
            <input
              type="text"
              placeholder="role:manager or user:id"
              value={a}
              onChange={(e) => updateApprover(idx, e.target.value)}
              className="h-8 flex-1 rounded border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none"
            />
            <button
              onClick={() => removeApprover(idx)}
              className="p-1 text-slate-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Approval Mode</label>
        <select
          value={(data.approvalMode as string) || 'any'}
          onChange={(e) => updateData({ approvalMode: e.target.value })}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="any">Any</option>
          <option value="all">All</option>
          <option value="sequential">Sequential</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">SLA (hours)</label>
        <input
          type="number"
          min={1}
          value={(data.slaHours as number) || 24}
          onChange={(e) => updateData({ slaHours: parseInt(e.target.value) || 24 })}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </>
  );
}

function ConditionFields({ data, updateData }: FieldProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Field</label>
        <input
          type="text"
          placeholder="e.g. estimatedTotal"
          value={(data.field as string) || ''}
          onChange={(e) => updateData({ field: e.target.value })}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Operator</label>
        <select
          value={(data.operator as string) || 'eq'}
          onChange={(e) => updateData({ operator: e.target.value })}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="eq">Equals (=)</option>
          <option value="neq">Not Equals (!=)</option>
          <option value="gt">Greater Than (&gt;)</option>
          <option value="gte">Greater or Equal (&gt;=)</option>
          <option value="lt">Less Than (&lt;)</option>
          <option value="lte">Less or Equal (&lt;=)</option>
          <option value="in">In</option>
          <option value="contains">Contains</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Value</label>
        <input
          type="text"
          placeholder="e.g. 5000"
          value={data.value != null ? String(data.value) : ''}
          onChange={(e) => updateData({ value: e.target.value })}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </>
  );
}

function ActionFields({ data, updateData }: FieldProps) {
  const actionType = (data.actionType as string) || 'update_status';
  const config = (data.config as Record<string, string>) || {};

  const updateConfig = (key: string, value: string) => {
    updateData({ config: { ...config, [key]: value } });
  };

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Action Type</label>
        <select
          value={actionType}
          onChange={(e) => updateData({ actionType: e.target.value })}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="update_status">Update Status</option>
          <option value="create_entity">Create Entity</option>
          <option value="send_notification">Send Notification</option>
          <option value="call_api">Call API</option>
        </select>
      </div>
      {actionType === 'update_status' && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">New Status</label>
          <input
            type="text"
            placeholder="e.g. APPROVED"
            value={config.status || ''}
            onChange={(e) => updateConfig('status', e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      )}
      {actionType === 'send_notification' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Recipient</label>
            <input
              type="text"
              placeholder="e.g. role:legal_team"
              value={config.recipient || ''}
              onChange={(e) => updateConfig('recipient', e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
            <textarea
              placeholder="Notification message..."
              value={config.message || ''}
              onChange={(e) => updateConfig('message', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>
        </>
      )}
      {actionType === 'create_entity' && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Entity Type</label>
          <select
            value={config.entityType || ''}
            onChange={(e) => updateConfig('entityType', e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Select...</option>
            <option value="REQUEST">Request</option>
            <option value="CONTRACT">Contract</option>
            <option value="INVOICE">Invoice</option>
            <option value="PURCHASE_ORDER">Purchase Order</option>
          </select>
        </div>
      )}
      {actionType === 'call_api' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={config.url || ''}
              onChange={(e) => updateConfig('url', e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Method</label>
            <select
              value={config.method || 'POST'}
              onChange={(e) => updateConfig('method', e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </>
      )}
    </>
  );
}

function AiReviewFields({ data, updateData }: FieldProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Prompt Template</label>
        <textarea
          placeholder="Describe what the AI should analyze..."
          value={(data.promptTemplate as string) || ''}
          onChange={(e) => updateData({ promptTemplate: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Confidence Threshold (%)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={(data.confidenceThreshold as number) || 70}
            onChange={(e) => updateData({ confidenceThreshold: parseInt(e.target.value) })}
            className="flex-1 accent-purple-600"
          />
          <span className="text-sm font-medium text-slate-700 w-10 text-right">
            {(data.confidenceThreshold as number) || 70}%
          </span>
        </div>
      </div>
    </>
  );
}

function WaitFields({ data, updateData }: FieldProps) {
  const waitType = (data.type as string) || 'duration';

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Wait Type</label>
        <select
          value={waitType}
          onChange={(e) => updateData({ type: e.target.value })}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="duration">Duration</option>
          <option value="event">Event</option>
        </select>
      </div>
      {waitType === 'duration' && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Duration (hours)</label>
          <input
            type="number"
            min={1}
            value={(data.durationHours as number) || 24}
            onChange={(e) => updateData({ durationHours: parseInt(e.target.value) || 24 })}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      )}
      {waitType === 'event' && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Event Name</label>
          <input
            type="text"
            placeholder="e.g. payment.received"
            value={(data.eventName as string) || ''}
            onChange={(e) => updateData({ eventName: e.target.value })}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      )}
    </>
  );
}

function EndFields({ data, updateData }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">Final Status</label>
      <input
        type="text"
        placeholder="e.g. approved, rejected, completed"
        value={(data.finalStatus as string) || ''}
        onChange={(e) => updateData({ finalStatus: e.target.value })}
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function ParallelFields({ data, updateData }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">Join Mode</label>
      <select
        value={(data.joinMode as string) || 'all'}
        onChange={(e) => updateData({ joinMode: e.target.value })}
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        <option value="all">All (wait for all branches)</option>
        <option value="any">Any (first branch wins)</option>
      </select>
    </div>
  );
}
