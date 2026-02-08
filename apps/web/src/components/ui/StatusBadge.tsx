'use client';

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, { dot: string; bg: string; text: string }> = {
  // Green statuses
  'Approved': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Active': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Complete': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Connected': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Paid': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Fulfilled': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Matched': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Awarded': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Completed': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Closed': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  // Amber statuses
  'Pending Approval': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Pending': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'In Progress': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Processing': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Renewal Due': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Acknowledged': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Approval Required': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Under Review': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Evaluation': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Onboarding': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Open': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  // Red statuses
  'Rejected': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Expired': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Disconnected': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Exception': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Flagged': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Disputed': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Suspended': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Cancelled': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  // Blue statuses
  'Draft': { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  'Sent': { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  'Order Placed': { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  'Received': { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  // Purple statuses
  'Idle': { dot: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
  'Paused': { dot: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
};

const defaultColor = { dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' };

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = statusColors[status] || defaultColor;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
}
