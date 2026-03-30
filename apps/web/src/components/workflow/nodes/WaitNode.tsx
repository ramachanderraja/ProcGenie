'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { BaseNode } from './BaseNode';

function WaitNodeInner({ data, selected }: NodeProps) {
  const waitType = (data.type as string) || 'duration';
  const durationHours = data.durationHours as number | undefined;
  const eventName = data.eventName as string | undefined;
  const subtitle =
    waitType === 'duration'
      ? durationHours != null
        ? `${durationHours}h`
        : 'Set duration'
      : eventName || 'Set event';

  return (
    <BaseNode
      borderColor="#64748b"
      icon={<Clock className="h-4 w-4 text-slate-600" />}
      label={(data.label as string) || 'Wait'}
      subtitle={subtitle}
      selected={selected}
      hasInput={true}
      hasOutput={true}
    />
  );
}

export const WaitNode = memo(WaitNodeInner);
