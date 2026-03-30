'use client';

import { FileCheck, Eye, Copy, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { listPurchaseOrders, type PurchaseOrder, type PaginatedResult } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/ui/StatusBadge';

/** Map status values → Tailwind classes. API returns lowercase. */
const statusStyleMap: Record<string, string> = {
  draft: 'bg-slate-50 text-slate-700',
  pending_approval: 'bg-amber-50 text-amber-700',
  approved: 'bg-blue-50 text-blue-700',
  sent: 'bg-blue-50 text-blue-700',
  acknowledged: 'bg-amber-50 text-amber-700',
  partially_received: 'bg-purple-50 text-purple-700',
  fully_received: 'bg-emerald-50 text-emerald-700',
  invoiced: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

function formatStatusLabel(status: string): string {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function PurchaseOrdersPage() {
  const { data, loading, error } = useApi<PaginatedResult<PurchaseOrder>>(() => listPurchaseOrders(), []);
  const purchaseOrders = data?.items ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
        <p className="mt-1 text-sm text-slate-500">Track and manage all purchase orders</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>Failed to load purchase orders: {error}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">PO #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Request Ref</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3.5"><div className="h-4 w-20 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-32 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-40 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-24 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-16 animate-pulse rounded bg-slate-200" /></td>
                    <td className="px-4 py-3.5"><div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" /></td>
                  </tr>
                ))
              ) : purchaseOrders.length === 0 && !error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-sm font-semibold text-indigo-600">{po.poNumber}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{po.supplierName || po.supplierId?.slice(0, 8) || 'N/A'}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[240px] truncate">{po.title}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500">
                      {new Date(po.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-sm font-medium text-slate-900">
                        {po.currency === 'USD' ? '$' : po.currency + ' '}{po.totalAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyleMap[po.status] || 'bg-slate-100 text-slate-700'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          po.status === 'fully_received' || po.status === 'invoiced' ? 'bg-emerald-500' :
                          po.status === 'partially_received' ? 'bg-purple-500' :
                          po.status === 'acknowledged' || po.status === 'pending_approval' ? 'bg-amber-500' :
                          po.status === 'approved' || po.status === 'sent' ? 'bg-blue-500' :
                          po.status === 'draft' ? 'bg-slate-400' : 'bg-red-500'
                        }`} />
                        {formatStatusLabel(po.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {po.requestId ? (
                        <span className="font-mono text-xs text-slate-500">{po.requestId}</span>
                      ) : (
                        <span className="text-xs text-slate-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" title="Copy PO#">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" title="More">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
