'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { BaseNode } from './BaseNode';

function ConditionNodeInner({ data, selected }: NodeProps) {
  const field = (data.field as string) || '';
  const operator = (data.operator as string) || 'eq';
  const value = data.value;
  const subtitle = field ? `${field} ${operator} ${value ?? ''}` : 'Set condition';

  return (
    <BaseNode
      borderColor="#3b82f6"
      icon={<GitBranch className="h-4 w-4 text-blue-600" />}
      label={(data.label as string) || 'Condition'}
      subtitle={subtitle}
      selected={selected}
      hasInput={true}
      hasOutput={false}
      dualOutputs={{
        leftId: 'true',
        leftLabel: 'True',
        rightId: 'false',
        rightLabel: 'False',
      }}
    />
  );
}

export const ConditionNode = memo(ConditionNodeInner);
