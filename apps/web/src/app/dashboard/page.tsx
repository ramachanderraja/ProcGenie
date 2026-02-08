'use client';

import Link from 'next/link';
import {
  Banknote,
  Clock,
  FileCheck,
  TrendingUp,
  PlusCircle,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Bot,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockRequests, mockActivityFeed, mockAgents } from '@/services/mockData';

const quickActions = [
  { label: 'New Request', icon: PlusCircle, href: '/intake', color: 'bg-indigo-600 hover:bg-indigo-700' },
  { label: 'Quick Quote', icon: MessageSquare, href: '/intake', color: 'bg-white hover:bg-slate-50 border border-slate-200 !text-slate-700' },
  { label: 'Renew Contract', icon: RefreshCw, href: '/contracts', color: 'bg-white hover:bg-slate-50 border border-slate-200 !text-slate-700' },
  { label: 'Check Policy', icon: ShieldCheck, href: '/settings', color: 'bg-white hover:bg-slate-50 border border-slate-200 !text-slate-700' },
];

const activityTypeIcons: Record<string, string> = {
  approval: 'text-emerald-500',
  request: 'text-blue-500',
  contract: 'text-purple-500',
  vendor: 'text-amber-500',
  system: 'text-slate-400',
  ai: 'text-indigo-500',
};

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const topAgents = [...mockAgents]
    .sort((a, b) => b.savingsGenerated - a.savingsGenerated)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 text-white shadow-lg">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Zap className="h-3 w-3" />
            AI-Powered Procurement
          </div>
          <h1 className="text-3xl font-bold">Need to buy something?</h1>
          <p className="mt-2 text-indigo-100 max-w-lg">
            ProcGenie&apos;s AI will analyze your request, recommend the optimal buying channel, and route approvals automatically.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Start Request
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              View Buying Policies
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="In-Flight Spend" value="$2.4M" icon={Banknote} color="indigo" trend="+8%" trendUp />
        <StatCard label="Pending My Action" value={7} icon={Clock} color="amber" />
        <StatCard label="Approved MTD" value={23} icon={FileCheck} color="green" trend="+12%" trendUp />
        <StatCard label="Savings Identified" value="$342K" icon={TrendingUp} color="indigo" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors ${action.color}`}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Intake Pipeline - spans 2 columns */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">Active Intake Pipeline</h3>
              <Link
                href="/requests"
                className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Requester</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mockRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3">
                        <span className="font-mono text-xs text-slate-500">{request.id}</span>
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          href={`/requests/${request.id}`}
                          className="text-sm font-medium text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {request.title}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-600">
                        {request.requester}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium text-slate-900">
                        {formatAmount(request.amount)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-slate-500">
                        {request.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {mockActivityFeed.slice(0, 6).map((entry) => (
                <div key={entry.id} className="px-5 py-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${activityTypeIcons[entry.type] ? activityTypeIcons[entry.type].replace('text-', 'bg-') : 'bg-slate-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{entry.user}</span>{' '}
                        {entry.action}{' '}
                        <span className="font-medium">{entry.target}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">{timeAgo(entry.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agent Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">AI Agent Summary</h3>
              </div>
            </div>
            <div className="divide-y divide-slate-50 px-5">
              {topAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{agent.name}</p>
                    <p className="text-xs text-slate-500">{agent.tasksCompleted.toLocaleString()} tasks completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(agent.savingsGenerated)}
                    </p>
                    <p className="text-xs text-slate-400">savings</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <Link
                href="/agents"
                className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View All Agents
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
