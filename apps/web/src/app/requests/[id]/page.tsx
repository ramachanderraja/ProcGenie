'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  Building2,
  ShieldAlert,
  Check,
  X,
  Clock,
  Send,
  Sparkles,
  Gauge,
  AlertTriangle,
  FileText,
  MessageSquare,
  GitBranch,
  Zap,
  Loader2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getRequest, type IntakeRequest } from '@/services/api';
import { useApi } from '@/hooks/useApi';

type TabKey = 'overview' | 'discussion' | 'workflow';

function formatAmount(amount: number, currency?: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RequestDetailPage() {
  const params = useParams()!;
  const id = params.id as string;
  const { data: request, loading, error } = useApi<IntakeRequest>(() => getRequest(id), [id]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [newComment, setNewComment] = useState('');

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="mb-4 h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-500">Loading request details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText className="mb-4 h-12 w-12 text-red-300" />
        <h2 className="text-lg font-semibold text-slate-900">Failed to load request</h2>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
        <Link
          href="/requests"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Link>
      </div>
    );
  }

  // Not found state
  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText className="mb-4 h-12 w-12 text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-900">Request not found</h2>
        <p className="mt-1 text-sm text-slate-500">The request &quot;{id}&quot; could not be found.</p>
        <Link
          href="/requests"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Link>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'discussion', label: 'Discussion', icon: MessageSquare },
    { key: 'workflow', label: 'Workflow', icon: GitBranch },
  ];

  // Approval steps may not exist on the API response yet
  const approvalSteps = (request as unknown as Record<string, unknown>).approvalSteps as
    | { id: string; name: string; status: string; approverName: string; timestamp?: string }[]
    | undefined;

  // Comments may not exist on the API response yet
  const comments = ((request as unknown as Record<string, unknown>).comments as
    | { id: string; author: string; role: string; text: string; timestamp: string }[]
    | undefined) ?? [];

  const stepStatusStyles: Record<string, string> = {
    approved: 'bg-emerald-500 text-white border-emerald-500',
    current: 'bg-indigo-500 text-white border-indigo-500 animate-pulse',
    pending: 'bg-white text-slate-400 border-slate-300',
    rejected: 'bg-red-500 text-white border-red-500',
    skipped: 'bg-slate-300 text-white border-slate-300',
  };

  const stepLineStyles: Record<string, string> = {
    approved: 'bg-emerald-500',
    current: 'bg-indigo-300',
    pending: 'bg-slate-200',
    rejected: 'bg-red-300',
    skipped: 'bg-slate-200',
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    alert('Comment sending is not yet implemented.');
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/requests"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{request.title}</h1>
            <StatusBadge status={request.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="font-mono text-xs rounded bg-slate-100 px-2 py-0.5">{request.requestNumber}</span>
            <span>Requested by <span className="font-medium text-slate-700">{request.requesterId}</span></span>
            <span>{request.category}</span>
            <span>{formatDate(request.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Approval Stepper - only show if approvalSteps exist */}
      {approvalSteps && approvalSteps.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Approval Progress</h3>
          <div className="flex items-center">
            {approvalSteps.map((step, i) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${stepStatusStyles[step.status] ?? stepStatusStyles['pending']}`}
                  >
                    {step.status === 'approved' ? (
                      <Check className="h-5 w-5" />
                    ) : step.status === 'rejected' ? (
                      <X className="h-5 w-5" />
                    ) : step.status === 'current' ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium text-slate-700">{step.name}</p>
                    <p className="text-[11px] text-slate-400">{step.approverName}</p>
                    {step.timestamp && <p className="text-[11px] text-slate-400">{step.timestamp}</p>}
                  </div>
                </div>
                {i < approvalSteps.length - 1 && (
                  <div className={`mx-2 h-0.5 flex-1 rounded ${stepLineStyles[step.status] ?? stepLineStyles['pending']}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs & Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab navigation */}
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Mini stat cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Banknote className="h-4 w-4" />
                    <span className="text-xs font-medium">Amount</span>
                  </div>
                  <p className="mt-1 text-xl font-bold text-slate-900">{formatAmount(request.estimatedTotal, request.currency)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Building2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Priority</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{request.priority}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="text-xs font-medium">Confidence</span>
                  </div>
                  <p className={`mt-1 text-xl font-bold ${
                    (request.aiAnalysis?.confidenceScore ?? 0) >= 70
                      ? 'text-emerald-600'
                      : (request.aiAnalysis?.confidenceScore ?? 0) >= 40
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}>
                    {request.aiAnalysis?.confidenceScore != null
                      ? `${Math.round(request.aiAnalysis.confidenceScore * 100)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{request.description ?? 'N/A'}</p>
              </div>

              {/* Business Justification - only show if the field exists */}
              {typeof (request as unknown as Record<string, unknown>).businessJustification === 'string' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Business Justification</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {String((request as unknown as Record<string, unknown>).businessJustification)}
                  </p>
                </div>
              )}

              {/* Line Items - show if items exist */}
              {request.items && request.items.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Line Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
                          <th className="pb-2 pr-4">#</th>
                          <th className="pb-2 pr-4">Description</th>
                          <th className="pb-2 pr-4 text-right">Qty</th>
                          <th className="pb-2 pr-4 text-right">Unit Price</th>
                          <th className="pb-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {request.items.map((item, i) => (
                          <tr key={item.id} className="text-slate-700">
                            <td className="py-2 pr-4 text-slate-400">{i + 1}</td>
                            <td className="py-2 pr-4">{item.description}</td>
                            <td className="py-2 pr-4 text-right">{item.quantity} {item.unitOfMeasure ?? ''}</td>
                            <td className="py-2 pr-4 text-right">{item.estimatedUnitPrice != null ? formatAmount(item.estimatedUnitPrice, request.currency) : 'N/A'}</td>
                            <td className="py-2 text-right font-medium">{item.totalPrice != null ? formatAmount(item.totalPrice, request.currency) : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {request.aiAnalysis && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-indigo-900">AI Analysis</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium text-indigo-600">Suggested Category</span>
                      <p className="mt-0.5 text-sm font-semibold text-indigo-900">{request.aiAnalysis?.suggestedCategory ?? 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-indigo-600">Category</span>
                      <p className="mt-0.5 text-sm font-semibold text-indigo-900">{request.category}</p>
                    </div>
                  </div>

                  {request.aiAnalysis?.riskAssessment && (
                    <div className="mt-4">
                      <span className="text-xs font-medium text-indigo-600">Risk Assessment</span>
                      <p className="mt-1 text-xs text-indigo-800">{request.aiAnalysis.riskAssessment}</p>
                    </div>
                  )}

                  {request.aiAnalysis?.recommendations && request.aiAnalysis.recommendations.length > 0 && (
                    <div className="mt-4">
                      <span className="text-xs font-medium text-indigo-600">Recommendations</span>
                      <ul className="mt-2 space-y-1.5">
                        {request.aiAnalysis.recommendations.map((note, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-indigo-800">
                            <Check className="h-3 w-3 flex-shrink-0 text-emerald-500" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {request.aiAnalysis?.suggestedSuppliers && request.aiAnalysis.suggestedSuppliers.length > 0 && (
                    <div className="mt-4">
                      <span className="text-xs font-medium text-indigo-600">Suggested Suppliers</span>
                      <ul className="mt-2 space-y-1.5">
                        {request.aiAnalysis.suggestedSuppliers.map((supplier, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-indigo-800">
                            <Building2 className="h-3 w-3 flex-shrink-0 text-indigo-500" />
                            {supplier}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Show placeholder if no AI analysis */}
              {!request.aiAnalysis && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-indigo-900">AI Analysis</h3>
                  </div>
                  <p className="text-sm text-indigo-700">No AI analysis available for this request yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Discussion Tab */}
          {activeTab === 'discussion' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Comment thread */}
                <div className="divide-y divide-slate-50">
                  {comments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="mb-3 h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">No comments yet</p>
                      <p className="mt-1 text-xs text-slate-400">Be the first to add a comment.</p>
                    </div>
                  )}
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-5">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          comment.role === 'AI'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {comment.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{comment.author}</span>
                            <span className="text-xs text-slate-400">{timeAgo(comment.timestamp)}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* New comment input */}
                <div className="border-t border-slate-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                      AC
                    </div>
                    <div className="min-w-0 flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={handleSendComment}
                          disabled={!newComment.trim()}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Tab */}
          {activeTab === 'workflow' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-sm font-semibold text-slate-900">Approval Timeline</h3>
              {(!approvalSteps || approvalSteps.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GitBranch className="mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No approval workflow configured</p>
                  <p className="mt-1 text-xs text-slate-400">Approval steps will appear here once configured.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-5 top-0 h-full w-0.5 bg-slate-200" />

                  <div className="space-y-6">
                    {approvalSteps.map((step) => (
                      <div key={step.id} className="relative flex items-start gap-4 pl-12">
                        {/* Step indicator */}
                        <div
                          className={`absolute left-2.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            step.status === 'approved'
                              ? 'border-emerald-500 bg-emerald-500'
                              : step.status === 'rejected'
                              ? 'border-red-500 bg-red-500'
                              : step.status === 'current'
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {step.status === 'approved' ? (
                            <Check className="h-3 w-3 text-white" />
                          ) : step.status === 'rejected' ? (
                            <X className="h-3 w-3 text-white" />
                          ) : step.status === 'current' ? (
                            <Clock className="h-3 w-3 text-white" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{step.name}</p>
                              <p className="text-xs text-slate-500">{step.approverName}</p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  step.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : step.status === 'rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : step.status === 'current'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {step.status === 'current' ? 'Awaiting' : step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                              </span>
                              {step.timestamp && (
                                <p className="mt-0.5 text-[11px] text-slate-400">{step.timestamp}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Request Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Request Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Request #</dt>
                <dd className="font-medium text-slate-900">{request.requestNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Category</dt>
                <dd className="font-medium text-slate-900">{request.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Priority</dt>
                <dd className="font-medium text-slate-900">{request.priority}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Currency</dt>
                <dd className="font-medium text-slate-900">{request.currency}</dd>
              </div>
              {request.costCenter && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Cost Center</dt>
                  <dd className="font-medium text-slate-900">{request.costCenter}</dd>
                </div>
              )}
              {request.glAccount && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">GL Account</dt>
                  <dd className="font-medium text-slate-900">{request.glAccount}</dd>
                </div>
              )}
              {request.neededByDate && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Needed By</dt>
                  <dd className="font-medium text-slate-900">{formatDate(request.neededByDate)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">Created</dt>
                <dd className="font-medium text-slate-900">{formatDate(request.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Updated</dt>
                <dd className="font-medium text-slate-900">{formatDate(request.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Process Insights */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">Process Insights</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Approval Velocity</span>
                  <span className="text-xs font-semibold text-emerald-600">85%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 w-[85%] rounded-full bg-emerald-500" />
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500">Bottleneck</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-sm font-medium text-slate-700">Finance Queue</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">Avg. 2.3 day wait time</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500">Similar Requests</span>
                <p className="mt-0.5 text-sm font-medium text-slate-700">12 in last 90 days</p>
                <p className="text-xs text-slate-400">Avg. cycle: 4.1 days</p>
              </div>
            </div>
          </div>

          {/* Recent Activity - only show if approvalSteps exist */}
          {approvalSteps && approvalSteps.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Request Activity</h3>
              <div className="space-y-3">
                {approvalSteps
                  .filter((s) => s.timestamp)
                  .map((step) => (
                    <div key={step.id} className="flex items-start gap-2.5">
                      <div
                        className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                          step.status === 'approved' ? 'bg-emerald-500' : step.status === 'rejected' ? 'bg-red-500' : 'bg-indigo-500'
                        }`}
                      />
                      <div>
                        <p className="text-xs text-slate-700">
                          <span className="font-medium">{step.approverName}</span>{' '}
                          {step.status === 'approved' ? 'approved' : step.status === 'rejected' ? 'rejected' : 'is reviewing'}{' '}
                          at {step.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{step.timestamp}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* AI Quick Actions */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-indigo-900">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <button className="w-full rounded-lg bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 shadow-sm hover:bg-indigo-50 transition-colors">
                Escalate for Priority Review
              </button>
              <button className="w-full rounded-lg bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 shadow-sm hover:bg-indigo-50 transition-colors">
                Request Additional Information
              </button>
              <button className="w-full rounded-lg bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 shadow-sm hover:bg-indigo-50 transition-colors">
                Compare with Similar Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
