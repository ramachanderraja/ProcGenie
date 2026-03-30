'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle2, Brain, Download, Search, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { getSpendDashboard, getSpendTrends, naturalLanguageQuery, type SpendDashboardData, type SpendTrendData, type NLQueryResult } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { StatCard } from '@/components/ui/StatCard';

const timeOptions = ['30d', 'MTD', 'YTD'] as const;

interface DetailItem {
  metric: string;
  value: string | number;
  trend: string;
}

function NlQueryResultPanel({ result }: { result: NLQueryResult }) {
  const data = result.data as Record<string, string | number | DetailItem[]> | null;
  const keyInsight = data?.keyInsight ? String(data.keyInsight) : null;
  const recommendation = data?.recommendation ? String(data.recommendation) : null;
  const details = Array.isArray(data?.details) ? (data.details as DetailItem[]) : [];

  return (
    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
      <p className="text-xs font-medium text-indigo-600 mb-2">
        {'AI Analysis (Confidence: ' + result.confidence + '%)'}
      </p>
      <p className="text-sm text-slate-700 mb-3">{result.interpretation}</p>
      <div className="space-y-2">
        {keyInsight && (
          <p className="text-sm font-medium text-slate-900">{keyInsight}</p>
        )}
        {recommendation && (
          <p className="text-xs text-slate-600 italic">{'Recommendation: ' + recommendation}</p>
        )}
        {details.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {details.map((d, i) => (
              <div key={i} className="rounded-lg bg-white border border-slate-100 p-2.5">
                <p className="text-[11px] text-slate-500">{d.metric}</p>
                <p className="text-sm font-semibold text-slate-900">{String(d.value)}</p>
                {d.trend && <p className="text-[11px] text-emerald-600">{d.trend}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<string>('YTD');
  const [nlQuery, setNlQuery] = useState('');
  const [nlResult, setNlResult] = useState<NLQueryResult | null>(null);
  const [nlLoading, setNlLoading] = useState(false);

  const { data: dashData, loading: dashLoading, error: dashError } = useApi(() => getSpendDashboard(), []);
  const { data: trends, loading: trendsLoading, error: trendsError } = useApi(() => getSpendTrends(), []);

  const handleNlQuery = async (query: string) => {
    if (!query.trim()) return;
    setNlQuery(query);
    setNlLoading(true);
    setNlResult(null);
    try {
      const result = await naturalLanguageQuery(query);
      setNlResult(result);
    } catch {
      setNlResult(null);
    } finally {
      setNlLoading(false);
    }
  };

  const trendList = trends ?? [];
  const maxSpend = trendList.length > 0 ? Math.max(...trendList.map(m => m.spend)) : 1;
  const topSuppliers = dashData?.topSuppliers ?? [];
  const maxSupplierSpend = topSuppliers.length > 0 ? Math.max(...topSuppliers.map(s => s.spend)) : 1;
  const spendByCategory = dashData?.spendByCategory ?? [];

  const isLoading = dashLoading || trendsLoading;
  const loadError = dashError || trendsError;

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

      {/* Loading / Error States */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="ml-3 text-sm text-slate-500">Loading spend data...</span>
        </div>
      )}

      {loadError && !isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">Failed to load data: {loadError}</p>
          </div>
        </div>
      )}

      {!isLoading && !loadError && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Spend"
              value={dashData ? `$${(dashData.totalSpend / 1000000).toFixed(1)}M` : '--'}
              icon={DollarSign}
              color="indigo"
              trend="+12%"
              trendUp
            />
            <StatCard
              label="Total Savings"
              value={dashData ? `$${(dashData.totalSavings / 1000000).toFixed(1)}M` : '--'}
              icon={TrendingUp}
              color="green"
              trend={dashData ? `${dashData.savingsPercentage.toFixed(1)}%` : undefined}
              trendUp
            />
            <StatCard
              label="Contract Compliance"
              value={dashData ? `${dashData.contractCompliance}%` : '--'}
              icon={CheckCircle2}
              color="indigo"
            />
            <StatCard
              label="Active POs"
              value={dashData?.activePOs ?? '--'}
              icon={Brain}
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Spend by Category */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-5">Spend by Category</h2>
              <div className="space-y-3">
                {spendByCategory.map(cat => (
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
                {trendList.map(m => {
                  const height = (m.spend / maxSpend) * 100;
                  const periodLabel = m.period.split('-')[1] || m.period;
                  const monthNames: Record<string, string> = { '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec', '01': 'Jan', '02': 'Feb' };
                  return (
                    <div key={m.period} className="flex-1 flex flex-col items-center justify-end gap-1">
                      <span className="text-[10px] font-medium text-slate-500">${(m.spend / 1000000).toFixed(1)}M</span>
                      <div
                        className="w-full rounded-t-md bg-indigo-500 hover:bg-indigo-600 transition-colors min-h-[4px]"
                        style={{ height: `${height}%` }}
                        title={`${monthNames[periodLabel] || periodLabel}: $${(m.spend / 1000000).toFixed(2)}M`}
                      />
                      <span className="text-[10px] text-slate-400">{monthNames[periodLabel] || periodLabel}</span>
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
              {topSuppliers.slice(0, 5).map((supplier, i) => (
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
        </>
      )}

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
            onKeyDown={e => { if (e.key === 'Enter') handleNlQuery(nlQuery); }}
            placeholder="e.g., What is our top spending category this quarter? Which vendors have the best ESG scores?"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Top spending categories', 'Vendor savings opportunities', 'Contract renewal forecast', 'AI agent performance'].map(q => (
            <button
              key={q}
              onClick={() => handleNlQuery(q)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* NL Query Results */}
        {nlLoading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing your question with AI...
          </div>
        )}
        {nlResult && !nlLoading && (
          <NlQueryResultPanel result={nlResult} />
        )}
      </div>
    </div>
  );
}
