'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockRequests } from '@/services/mockData';

const statusTabs = [
  'All',
  'Draft',
  'Pending Approval',
  'Approved',
  'Rejected',
  'Order Placed',
  'Received',
];

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RequestsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredRequests = useMemo(() => {
    return mockRequests.filter((request) => {
      const matchesSearch =
        search === '' ||
        request.title.toLowerCase().includes(search.toLowerCase()) ||
        request.id.toLowerCase().includes(search.toLowerCase()) ||
        request.requester.toLowerCase().includes(search.toLowerCase()) ||
        request.vendorName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        activeTab === 'All' || request.status === activeTab;

      return matchesSearch && matchesStatus;
    });
  }, [search, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track and manage all your procurement requests.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, ID, requester, or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {tab !== 'All' && (
                <span className="ml-1.5 text-xs text-slate-400">
                  {mockRequests.filter((r) => r.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Department
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-mono text-xs text-slate-500">{request.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{request.title}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {request.requester}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {request.department}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                    {formatAmount(request.amount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {request.createdAt}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link
                      href={`/requests/${request.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      View
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No requests found</p>
            <p className="mt-1 text-xs text-slate-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
