'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';
import { BaseNode } from './BaseNode';

function EndNodeInner({ data, selected }: NodeProps) {
  const finalStatus = (data.finalStatus as string) || '';
  const subtitle = finalStatus || 'Set final status';

  return (
    <BaseNode
      borderColor="#ef4444"
      icon={<Square className="h-4 w-4 text-red-500" />}
      label={(data.label as string) || 'End'}
      subtitle={subtitle}
      selected={selected}
      hasInput={true}
      hasOutput={false}
    />
  );
}

export const EndNode = memo(EndNodeInner);
