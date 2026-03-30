'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Building2, Plus, Shield, Star, ChevronRight, AlertCircle } from 'lucide-react';
import { listSuppliers, type Supplier, type PaginatedResult } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/ui/StatusBadge';

function getTrustColor(score: number) {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-600';
}

function getTrustBg(score: number) {
  if (score >= 90) return 'bg-emerald-50';
  if (score >= 80) return 'bg-blue-50';
  if (score >= 70) return 'bg-amber-50';
  return 'bg-red-50';
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />);
    } else if (i === full && hasHalf) {
      stars.push(<Star key={i} className="h-3.5 w-3.5 fill-amber-200 text-amber-400" />);
    } else {
      stars.push(<Star key={i} className="h-3.5 w-3.5 text-slate-200" />);
    }
  }
  return stars;
}

/** Convert API status (e.g. ACTIVE, ONBOARDING) to display form */
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export default function VendorsPage() {
  const { data, loading, error } = useApi<PaginatedResult<Supplier>>(() => listSuppliers(), []);

  const suppliers = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Directory</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? '...' : `${suppliers.length} vendors in your network`}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Vendor
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-100" />
              </div>
              <div className="h-4 w-16 rounded bg-slate-200" />
              <div className="h-4 w-12 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Trust Score</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Performance</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Annual Spend</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {suppliers.map(supplier => {
                  const rating = supplier.overallScore || 0;
                  const trustScore = Math.round(rating * 20); // Convert 0-5 to 0-100
                  const category = supplier.categories?.[0] || supplier.industry || 'General';
                  const isPreferred = supplier.tier === 'STRATEGIC';

                  return (
                    <tr key={supplier.id} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3.5">
                        <Link href={`/vendors/${supplier.id}`} className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                            {supplier.companyName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{supplier.companyName}</span>
                              {isPreferred && (
                                <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  Preferred
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">{supplier.supplierCode}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{category}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className={`rounded-lg p-1 ${getTrustBg(trustScore)}`}>
                            <Shield className={`h-4 w-4 ${getTrustColor(trustScore)}`} />
                          </div>
                          <span className={`text-sm font-bold ${getTrustColor(trustScore)}`}>
                            {trustScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-0.5">
                          {renderStars(rating)}
                          <span className="ml-1.5 text-xs text-slate-500">{rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-mono text-sm font-medium text-slate-400">
                          N/A
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={formatStatus(supplier.status)} />
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/vendors/${supplier.id}`}>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {suppliers.length === 0 && (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No vendors found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
