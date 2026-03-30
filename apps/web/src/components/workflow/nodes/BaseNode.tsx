'use client';

import { memo, type ReactNode } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export interface BaseNodeData {
  label: string;
  subtitle?: string;
  [key: string]: unknown;
}

interface BaseNodeProps {
  borderColor: string;
  icon: ReactNode;
  label: string;
  subtitle?: string;
  selected?: boolean;
  hasInput?: boolean;
  hasOutput?: boolean;
  /** For dual-output nodes: renders two handles at bottom-left/bottom-right */
  dualOutputs?: { leftId: string; leftLabel: string; rightId: string; rightLabel: string };
}

function BaseNodeInner({
  borderColor,
  icon,
  label,
  subtitle,
  selected,
  hasInput = true,
  hasOutput = true,
  dualOutputs,
}: BaseNodeProps) {
  return (
    <div
      className={`relative w-[180px] rounded-lg bg-white shadow-sm border ${
        selected ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'
      }`}
      style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
    >
      {/* Input handle */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
        />
      )}

      {/* Node content */}
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <div className="mt-0.5 flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-slate-800 leading-tight truncate">
            {label}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-slate-500 leading-snug truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Single output handle */}
      {hasOutput && !dualOutputs && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
        />
      )}

      {/* Dual output handles */}
      {dualOutputs && (
        <>
          <div className="flex justify-between px-3 pb-1">
            <span className="text-[9px] text-slate-400">{dualOutputs.leftLabel}</span>
            <span className="text-[9px] text-slate-400">{dualOutputs.rightLabel}</span>
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id={dualOutputs.leftId}
            className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white"
            style={{ left: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={dualOutputs.rightId}
            className="!w-2.5 !h-2.5 !bg-red-400 !border-2 !border-white"
            style={{ left: '70%' }}
          />
        </>
      )}
    </div>
  );
}

export const BaseNode = memo(BaseNodeInner);
