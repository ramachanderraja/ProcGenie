'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { listRequests, submitRequest, cancelRequest } from '@/services/api';
import type { IntakeRequest, PaginatedResult } from '@/services/api';
import { useApi } from '@/hooks/useApi';

type SortKey = 'date' | 'amount' | 'priority';
type PriorityFilter = 'All' | 'Critical' | 'High' | 'Medium' | 'Low';

const priorityOrder: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Convert API status like PENDING_APPROVAL to display form Pending Approval */
function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ApprovalsPage() {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const { data, loading, error, refetch } = useApi<PaginatedResult<IntakeRequest>>(
    () => listRequests({ status: 'pending_approval' }),
    [],
  );

  const requests = data?.items ?? [];

  const pendingRequests = useMemo(() => {
    let filtered = [...requests];

    if (priorityFilter !== 'All') {
      filtered = filtered.filter((r) => r.priority === priorityFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.estimatedTotal - a.estimatedTotal;
        case 'priority':
          return (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [requests, priorityFilter, sortBy]);

  const handleApprove = async (id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await submitRequest(id);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReject = async (id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await cancelRequest(id);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const priorityColors: Record<string, string> = {
    Critical: 'bg-red-50 text-red-700 border-red-200',
    High: 'bg-amber-50 text-amber-700 border-amber-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    Low: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  // ── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="mt-4 text-sm text-slate-500">Loading pending approvals...</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-300 bg-white py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Failed to load approvals</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{error}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Approvals</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and approve pending procurement requests.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Priority filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Priority:</span>
          <div className="flex gap-1">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as PriorityFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  priorityFilter === p
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="date">Newest First</option>
            <option value="amount">Highest Amount</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Approval Cards */}
      {pendingRequests.length > 0 ? (
        <div className="space-y-4">
          {pendingRequests.map((request) => {
            const isProcessing = processingIds.has(request.id);

            return (
              <div
                key={request.id}
                className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Left: Request details */}
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/requests/${request.id}`}
                            className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                          >
                            {request.title}
                          </Link>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${priorityColors[request.priority] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            {request.priority}
                          </span>
                          {(request.aiAnalysis?.confidenceScore ?? 0) < 40 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                              <AlertTriangle className="h-3 w-3" />
                              High Risk
                            </span>
                          )}
                        </div>
                        <span className="mt-1 font-mono text-xs text-slate-400">{request.requestNumber ?? request.id}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500">
                      <span>
                        Requester: <span className="font-medium text-slate-700">{request.requesterId ?? 'N/A'}</span>
                      </span>
                      <span>
                        Department: <span className="font-medium text-slate-700">N/A</span>
                      </span>
                      <span>
                        Vendor: <span className="font-medium text-slate-700">N/A</span>
                      </span>
                      <span>
                        Date: <span className="font-medium text-slate-700">{formatDate(request.createdAt)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-slate-900">{formatAmount(request.estimatedTotal)}</span>
                      <StatusBadge status={formatStatus(request.status)} />
                    </div>
                  </div>

                  {/* Right: Action buttons */}
                  <div className="flex flex-shrink-0 flex-col gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject
                    </button>
                    <Link
                      href={`/requests/${request.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCheck className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">All caught up!</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            You have no pending approvals. All procurement requests have been reviewed.
          </p>
        </div>
      )}
    </div>
  );
}
