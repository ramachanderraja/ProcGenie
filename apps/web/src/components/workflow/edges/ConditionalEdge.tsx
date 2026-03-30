'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

const handleLabels: Record<string, { text: string; color: string; bg: string }> = {
  approved: { text: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  rejected: { text: 'Rejected', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  true: { text: 'True', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  false: { text: 'False', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  above_threshold: { text: 'Pass', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  below_threshold: { text: 'Fail', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export function ConditionalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceHandleId,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const handleInfo = sourceHandleId ? handleLabels[sourceHandleId] : null;
  const labelText = (data?.label as string) || handleInfo?.text;
  const labelColor = handleInfo?.color || 'text-slate-600';
  const labelBg = handleInfo?.bg || 'bg-slate-50 border-slate-200';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 1.5,
          stroke: '#94a3b8',
          ...style,
        }}
      />
      {labelText && (
        <EdgeLabelRenderer>
          <div
            className={`nodrag nopan absolute rounded-full border px-2 py-0.5 text-[10px] font-medium ${labelBg} ${labelColor}`}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            {labelText}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
