'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle2, Brain, Download, Search, DollarSign } from 'lucide-react';
import { mockAnalyticsData, mockMonthlyAnalytics } from '@/services/mockData';
import { StatCard } from '@/components/ui/StatCard';

const timeOptions = ['30d', 'MTD', 'YTD'] as const;

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<string>('YTD');
  const [nlQuery, setNlQuery] = useState('');

  const maxSpend = Math.max(...mockMonthlyAnalytics.map(m => m.spend));
  const maxSupplierSpend = Math.max(...mockAnalyticsData.topSuppliers.map(s => s.spend));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Spend Insights</h1>
          <p className="mt-1 text-sm text-slate-500">Data-driven procurement intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-slate-100 p-1">
            {timeOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setTimeRange(opt)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeRange === opt
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Pipeline" value="$4.2M" icon={DollarSign} color="indigo" trend="+12%" trendUp />
        <StatCard label="Avg Cycle Time" value="1.4d" icon={Clock} color="green" trend="-0.2d" trendUp />
        <StatCard label="Match Rate" value="92%" icon={CheckCircle2} color="indigo" />
        <StatCard label="AI Confidence" value="98.4%" icon={Brain} color="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Spend by Category */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">Spend by Category</h2>
          <div className="space-y-3">
            {mockAnalyticsData.spendByCategory.map(cat => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{cat.category}</span>
                  <span className="text-xs font-semibold text-slate-900">
                    ${(cat.amount / 1000000).toFixed(1)}M
                    <span className="ml-1 text-slate-400 font-normal">({cat.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Trends - Bar Chart */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">Monthly Spend Velocity</h2>
          <div className="flex items-end gap-2 h-48">
            {mockMonthlyAnalytics.map(m => {
              const height = (m.spend / maxSpend) * 100;
              const monthLabel = m.month.split('-')[1];
              const monthNames: Record<string, string> = { '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec', '01': 'Jan', '02': 'Feb' };
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <span className="text-[10px] font-medium text-slate-500">${(m.spend / 1000000).toFixed(1)}M</span>
                  <div
                    className="w-full rounded-t-md bg-indigo-500 hover:bg-indigo-600 transition-colors min-h-[4px]"
                    style={{ height: `${height}%` }}
                    title={`${monthNames[monthLabel] || monthLabel}: $${(m.spend / 1000000).toFixed(2)}M`}
                  />
                  <span className="text-[10px] text-slate-400">{monthNames[monthLabel] || monthLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Suppliers by Spend */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-5">Top 5 Suppliers by Spend</h2>
        <div className="space-y-3">
          {mockAnalyticsData.topSuppliers.map((supplier, i) => (
            <div key={supplier.name} className="flex items-center gap-4">
              <span className="w-6 text-right text-xs font-bold text-slate-400">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900 truncate">{supplier.name}</span>
                  <span className="text-sm font-bold font-mono text-slate-700">
                    ${(supplier.spend / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${(supplier.spend / maxSupplierSpend) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Natural Language Query */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">Ask About Your Data</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={nlQuery}
            onChange={e => setNlQuery(e.target.value)}
            placeholder="e.g., What is our top spending category this quarter? Which vendors have the best ESG scores?"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Top spending categories', 'Vendor savings opportunities', 'Contract renewal forecast', 'AI agent performance'].map(q => (
            <button
              key={q}
              onClick={() => setNlQuery(q)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
