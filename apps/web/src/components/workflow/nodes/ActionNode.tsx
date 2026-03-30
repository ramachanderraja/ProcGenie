'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { BaseNode } from './BaseNode';

function ActionNodeInner({ data, selected }: NodeProps) {
  const actionType = (data.actionType as string) || '';
  const subtitle = actionType
    ? actionType.replace(/_/g, ' ')
    : 'Configure action';

  return (
    <BaseNode
      borderColor="#6366f1"
      icon={<Zap className="h-4 w-4 text-indigo-600" />}
      label={(data.label as string) || 'Action'}
      subtitle={subtitle}
      selected={selected}
      hasInput={true}
      hasOutput={true}
    />
  );
}

export const ActionNode = memo(ActionNodeInner);
