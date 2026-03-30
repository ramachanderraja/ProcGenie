'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, Upload, DollarSign, CheckCircle2, Clock, CalendarDays, Search, ChevronRight, AlertCircle } from 'lucide-react';
import { listContracts, type Contract, type PaginatedResult } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/StatCard';

const tabs = ['All', 'Active', 'Renewal Due', 'Expired', 'Draft'] as const;

/** Convert API status (e.g. ACTIVE, RENEWAL_DUE) to display form */
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ContractsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');

  const { data, loading, error } = useApi<PaginatedResult<Contract>>(
    () => listContracts({
      search: search || undefined,
      status: activeTab === 'All' ? undefined : activeTab.toLowerCase().replace(' ', '_'),
    }),
    [search, activeTab],
  );

  const contracts = useMemo(() => data?.items ?? [], [data]);

  const totalValue = useMemo(() => contracts.reduce((sum, c) => sum + (c.totalValue || 0), 0), [contracts]);
  const activeCount = useMemo(() => contracts.filter(c => formatStatus(c.status) === 'Active').length, [contracts]);
  const renewalCount = useMemo(
    () => contracts.filter(c => formatStatus(c.status) === 'Renewal Due' || c.endDate <= '2026-04-30').length,
    [contracts],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contract Repository</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and monitor all contract agreements</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors">
          <Upload className="h-4 w-4" />
          Upload Contract
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Value"
          value={loading ? '...' : `$${(totalValue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="indigo"
          trend="+8.2% YoY"
          trendUp
        />
        <StatCard
          label="Active Contracts"
          value={loading ? '...' : activeCount}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Renewal Due"
          value={loading ? '...' : renewalCount}
          icon={Clock}
          color="amber"
          trend="Next 90 days"
        />
        <StatCard
          label="Avg Term"
          value="18.5 Mos"
          icon={CalendarDays}
          color="indigo"
        />
      </div>

      {/* Search & Filter Tabs */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-4 mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-4 w-16 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {contracts.map(contract => (
                  <tr key={contract.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link href={`/contracts/${contract.id}`} className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                          <FileText className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[240px] group-hover:text-indigo-600 transition-colors">{contract.title}</p>
                          <p className="text-xs text-slate-400">{contract.contractNumber}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">{contract.supplierName || contract.supplierId?.slice(0, 8) || 'N/A'}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {contract.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm font-medium font-mono text-slate-900">
                      ${(contract.totalValue || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{formatDate(contract.startDate)}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{formatDate(contract.endDate)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={formatStatus(contract.status)} />
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/contracts/${contract.id}`}>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && contracts.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No contracts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
