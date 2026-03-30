'use client';

import type { DragEvent } from 'react';
import {
  Play,
  Square,
  UserCheck,
  GitBranch,
  GitFork,
  Zap,
  Brain,
  Clock,
} from 'lucide-react';

interface PaletteItem {
  type: string;
  label: string;
  description: string;
  icon: React.ElementType;
  borderColor: string;
  defaultData: Record<string, unknown>;
}

const paletteGroups: { title: string; items: PaletteItem[] }[] = [
  {
    title: 'Flow',
    items: [
      {
        type: 'start',
        label: 'Start',
        description: 'Entry point trigger',
        icon: Play,
        borderColor: '#10b981',
        defaultData: { label: 'Start', entityType: '', event: 'submitted', conditions: [] },
      },
      {
        type: 'end',
        label: 'End',
        description: 'Terminal node',
        icon: Square,
        borderColor: '#ef4444',
        defaultData: { label: 'End', finalStatus: '' },
      },
    ],
  },
  {
    title: 'Gates',
    items: [
      {
        type: 'approval',
        label: 'Approval',
        description: 'Human approval step',
        icon: UserCheck,
        borderColor: '#f59e0b',
        defaultData: { label: 'Approval', approvers: [], approvalMode: 'any', slaHours: 24 },
      },
      {
        type: 'condition',
        label: 'Condition',
        description: 'Branch on field value',
        icon: GitBranch,
        borderColor: '#3b82f6',
        defaultData: { label: 'Condition', field: '', operator: 'eq', value: '' },
      },
      {
        type: 'parallel',
        label: 'Parallel',
        description: 'Fork / join branches',
        icon: GitFork,
        borderColor: '#06b6d4',
        defaultData: { label: 'Parallel', joinMode: 'all' },
      },
    ],
  },
  {
    title: 'Automation',
    items: [
      {
        type: 'action',
        label: 'Action',
        description: 'Automated operation',
        icon: Zap,
        borderColor: '#6366f1',
        defaultData: { label: 'Action', actionType: 'update_status', config: {} },
      },
      {
        type: 'ai_review',
        label: 'AI Review',
        description: 'AI-powered analysis',
        icon: Brain,
        borderColor: '#a855f7',
        defaultData: { label: 'AI Review', promptTemplate: '', confidenceThreshold: 70 },
      },
      {
        type: 'wait',
        label: 'Wait',
        description: 'Pause for time / event',
        icon: Clock,
        borderColor: '#64748b',
        defaultData: { label: 'Wait', type: 'duration', durationHours: 24 },
      },
    ],
  },
];

interface NodePaletteProps {
  className?: string;
}

export function NodePalette({ className }: NodePaletteProps) {
  const onDragStart = (event: DragEvent, item: PaletteItem) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ type: item.type, data: item.defaultData }),
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={className}>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
        Add Steps
      </h3>
      <div className="space-y-5">
        {paletteGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-[11px] font-medium text-slate-400 uppercase tracking-wider px-1">
              {group.title}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5 cursor-grab shadow-sm hover:border-slate-200 hover:shadow transition-all active:cursor-grabbing"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-md"
                      style={{ backgroundColor: item.borderColor + '15' }}
                    >
                      <Icon className="h-4 w-4" style={{ color: item.borderColor }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                      <p className="text-[11px] text-slate-400 leading-tight">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
