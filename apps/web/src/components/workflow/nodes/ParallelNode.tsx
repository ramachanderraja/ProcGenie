'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitFork } from 'lucide-react';

function ParallelNodeInner({ data, selected }: NodeProps) {
  const joinMode = (data.joinMode as string) || 'all';
  const label = (data.label as string) || 'Parallel';

  return (
    <div
      className={`relative w-[180px] rounded-lg bg-white shadow-sm border ${
        selected ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'
      }`}
      style={{ borderLeftWidth: '4px', borderLeftColor: '#06b6d4' }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
      />

      {/* Node content */}
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <div className="mt-0.5 flex-shrink-0">
          <GitFork className="h-4 w-4 text-cyan-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate">
            {label}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 leading-snug truncate">
            Join: {joinMode}
          </p>
        </div>
      </div>

      {/* Single output handle (branches connect from here) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
      />
    </div>
  );
}

export const ParallelNode = memo(ParallelNodeInner);
