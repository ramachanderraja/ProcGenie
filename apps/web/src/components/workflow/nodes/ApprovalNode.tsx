'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { UserCheck } from 'lucide-react';
import { BaseNode } from './BaseNode';

function ApprovalNodeInner({ data, selected }: NodeProps) {
  const approvers = (data.approvers as string[]) || [];
  const mode = (data.approvalMode as string) || 'any';
  const subtitle =
    approvers.length > 0
      ? approvers.map((a: string) => a.replace(/^(user:|role:)/, '')).join(', ')
      : `Mode: ${mode}`;

  return (
    <BaseNode
      borderColor="#f59e0b"
      icon={<UserCheck className="h-4 w-4 text-amber-600" />}
      label={(data.label as string) || 'Approval'}
      subtitle={subtitle}
      selected={selected}
      hasInput={true}
      hasOutput={false}
      dualOutputs={{
        leftId: 'approved',
        leftLabel: 'Approved',
        rightId: 'rejected',
        rightLabel: 'Rejected',
      }}
    />
  );
}

export const ApprovalNode = memo(ApprovalNodeInner);
