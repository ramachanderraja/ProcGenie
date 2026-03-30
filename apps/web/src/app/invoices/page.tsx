'use client';

import { useState } from 'react';
import { Receipt, Upload, Search, FileText, AlertTriangle, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { listInvoices, type Invoice, type PaginatedResult } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/StatCard';
import { AlertCircle } from 'lucide-react';

const matchColors: Record<string, { dot: string; bg: string; text: string }> = {
  '3-Way Match': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  '2-Way Match': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Matched': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'FULL_MATCH': { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'PARTIAL_MATCH': { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Pending Match': { dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' },
  'Pending': { dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' },
  'NO_MATCH': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Exception': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'EXCEPTION': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
};

function getMatchStatus(invoice: Invoice): string {
  if (invoice.matchResults && invoice.matchResults.length > 0) {
    return invoice.matchResults[0].matchStatus;
  }
  return 'Pending';
}

export default function InvoicesPage() {
  const [search, setSearch] = useState('');

  const { data, loading, error } = useApi<PaginatedResult<Invoice>>(
    () => listInvoices({ search }),
    [search],
  );
  const invoices = data?.items ?? [];

  const openCount = invoices.filter(i => ['pending', 'open', 'received'].includes(i.status?.toLowerCase())).length;
  const approvalCount = invoices.filter(i => ['approved', 'approval_required', 'pending_approval'].includes(i.status?.toLowerCase())).length;
  const exceptionCount = invoices.filter(i => {
    const ms = getMatchStatus(i);
    return ms.includes('Exception') || ms.includes('EXCEPTION') || ms === 'Pending' || ms === 'NO_MATCH';
  }).length;
  const paidCount = invoices.filter(i => i.status?.toLowerCase() === 'paid').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices (AP)</h1>
          <p className="mt-1 text-sm text-slate-500">Accounts payable invoice management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors">
            <Upload className="h-4 w-4" />
            Upload Invoice
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>Failed to load invoices: {error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Invoices" value={loading ? '...' : openCount} icon={Receipt} color="indigo" />
        <StatCard label="Approval Required" value={loading ? '...' : approvalCount} icon={Clock} color="amber" />
        <StatCard label="Matching Exceptions" value={loading ? '...' : exceptionCount} icon={AlertTriangle} color="red" />
        <StatCard label="Processed MTD" value={loading ? '...' : paidCount} icon={CheckCircle2} color="green" />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">PO Ref</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Match Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3.5"><div className="h-4 w-24 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-32 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-20 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-24 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-200" /></td>
                  </tr>
                ))
              ) : invoices.length === 0 && !error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map(invoice => {
                  const matchStatus = getMatchStatus(invoice);
                  const mColors = matchColors[matchStatus] || matchColors['Pending'];
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="font-mono text-sm font-medium text-slate-900">{invoice.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{invoice.supplierName}</td>
                      <td className="px-4 py-3.5">
                        {invoice.purchaseOrderId ? (
                          <span className="font-mono text-xs text-indigo-600">{invoice.purchaseOrderId}</span>
                        ) : (
                          <span className="text-xs text-slate-400">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">
                        {new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-sm font-medium text-slate-900">
                        ${invoice.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${mColors.bg} ${mColors.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${mColors.dot}`} />
                          {matchStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                          Review <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
