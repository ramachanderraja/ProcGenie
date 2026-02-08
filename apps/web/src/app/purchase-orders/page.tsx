'use client';

import { FileCheck, Eye, Copy, MoreHorizontal } from 'lucide-react';
import { mockPurchaseOrders } from '@/services/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';

const statusStyleMap: Record<string, string> = {
  Issued: 'bg-blue-50 text-blue-700',
  Sent: 'bg-blue-50 text-blue-700',
  Acknowledged: 'bg-amber-50 text-amber-700',
  Shipped: 'bg-purple-50 text-purple-700',
  Received: 'bg-emerald-50 text-emerald-700',
  Paid: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Draft: 'bg-slate-50 text-slate-700',
  Cancelled: 'bg-red-50 text-red-700',
  Fulfilled: 'bg-purple-50 text-purple-700',
};

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
        <p className="mt-1 text-sm text-slate-500">Track and manage all purchase orders</p>
      </div>

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
              {mockPurchaseOrders.map((po, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-sm font-semibold text-indigo-600">{po.poNumber}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-700">{po.vendorName}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[240px] truncate">{po.description}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">
                    {new Date(po.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-mono text-sm font-medium text-slate-900">
                      ${po.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyleMap[po.status] || 'bg-slate-100 text-slate-700'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        po.status === 'Received' || po.status === 'Paid' ? 'bg-emerald-500' :
                        po.status === 'Shipped' || po.status === 'Fulfilled' ? 'bg-purple-500' :
                        po.status === 'Acknowledged' || po.status === 'Pending' ? 'bg-amber-500' :
                        po.status === 'Issued' || po.status === 'Sent' ? 'bg-blue-500' :
                        po.status === 'Draft' ? 'bg-slate-400' : 'bg-red-500'
                      }`} />
                      {po.status}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
