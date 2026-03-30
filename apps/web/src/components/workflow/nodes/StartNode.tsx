'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import { BaseNode } from './BaseNode';

function StartNodeInner({ data, selected }: NodeProps) {
  const event = (data.event as string) || 'submitted';
  const entityType = (data.entityType as string) || '';
  const subtitle = entityType ? `${entityType}.${event}` : event;

  return (
    <BaseNode
      borderColor="#10b981"
      icon={<Play className="h-4 w-4 text-emerald-600" />}
      label={(data.label as string) || 'Start'}
      subtitle={subtitle}
      selected={selected}
      hasInput={false}
      hasOutput={true}
    />
  );
}

export const StartNode = memo(StartNodeInner);
