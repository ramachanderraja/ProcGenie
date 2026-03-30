'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Brain } from 'lucide-react';
import { BaseNode } from './BaseNode';

function AiReviewNodeInner({ data, selected }: NodeProps) {
  const threshold = data.confidenceThreshold as number | undefined;
  const subtitle = threshold != null
    ? `Threshold: ${threshold}%`
    : 'Configure AI review';

  return (
    <BaseNode
      borderColor="#a855f7"
      icon={<Brain className="h-4 w-4 text-purple-600" />}
      label={(data.label as string) || 'AI Review'}
      subtitle={subtitle}
      selected={selected}
      hasInput={true}
      hasOutput={false}
      dualOutputs={{
        leftId: 'above_threshold',
        leftLabel: 'Pass',
        rightId: 'below_threshold',
        rightLabel: 'Fail',
      }}
    />
  );
}

export const AiReviewNode = memo(AiReviewNodeInner);
