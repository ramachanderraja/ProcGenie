'use client';

import Link from 'next/link';
import { Building2, Plus, Shield, Star, ChevronRight } from 'lucide-react';
import { mockVendors } from '@/services/mockData';
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

export default function VendorsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Directory</h1>
          <p className="mt-1 text-sm text-slate-500">{mockVendors.length} vendors in your network</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Vendor
        </button>
      </div>

      {/* Table */}
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
              {mockVendors.map(vendor => (
                <tr key={vendor.id} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5">
                    <Link href={`/vendors/${vendor.id}`} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                        {vendor.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{vendor.name}</span>
                          {vendor.isPreferred && (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Preferred
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{vendor.id}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{vendor.category}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`rounded-lg p-1 ${getTrustBg(vendor.trustScore)}`}>
                        <Shield className={`h-4 w-4 ${getTrustColor(vendor.trustScore)}`} />
                      </div>
                      <span className={`text-sm font-bold ${getTrustColor(vendor.trustScore)}`}>
                        {vendor.trustScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-0.5">
                      {renderStars(vendor.performanceRating)}
                      <span className="ml-1.5 text-xs text-slate-500">{vendor.performanceRating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-mono text-sm font-medium text-slate-900">
                      ${(vendor.spendLast12M / 1000).toFixed(0)}K
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={vendor.onboardingStatus} />
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/vendors/${vendor.id}`}>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </Link>
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
