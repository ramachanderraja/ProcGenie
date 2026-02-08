'use client';

import { Bot, Zap, Target, DollarSign, Activity } from 'lucide-react';
import { mockAgents } from '@/services/mockData';
import { StatCard } from '@/components/ui/StatCard';

const autonomyColors: Record<string, string> = {
  'Level 4 - Autonomous': 'bg-emerald-50 text-emerald-700',
  'Level 3 - Supervised': 'bg-amber-50 text-amber-700',
  'Level 2 - Advisory': 'bg-blue-50 text-blue-700',
  'Full Autonomy': 'bg-emerald-50 text-emerald-700',
  'Supervised': 'bg-amber-50 text-amber-700',
  'Human-Assisted': 'bg-blue-50 text-blue-700',
};

const domainColors: Record<string, string> = {
  'Intake Management': 'bg-blue-50 text-blue-700',
  'Analytics': 'bg-purple-50 text-purple-700',
  'Contract Management': 'bg-indigo-50 text-indigo-700',
  'Buying & Execution': 'bg-amber-50 text-amber-700',
  'Supplier Management': 'bg-teal-50 text-teal-700',
  'Compliance': 'bg-rose-50 text-rose-700',
  'Sustainability': 'bg-emerald-50 text-emerald-700',
  'Orchestration': 'bg-cyan-50 text-cyan-700',
  'User Support': 'bg-slate-100 text-slate-700',
  'Security': 'bg-red-50 text-red-700',
  'Platform': 'bg-violet-50 text-violet-700',
  'Integration': 'bg-orange-50 text-orange-700',
  'Workflow': 'bg-fuchsia-50 text-fuchsia-700',
  'Accounts Payable': 'bg-lime-50 text-lime-700',
  'Sourcing': 'bg-sky-50 text-sky-700',
};

const totalTasks = mockAgents.reduce((s, a) => s + a.tasksCompleted, 0);
const avgAccuracy = (mockAgents.reduce((s, a) => s + a.accuracy, 0) / mockAgents.length).toFixed(1);
const totalSavings = mockAgents.reduce((s, a) => s + a.savingsGenerated, 0);

// Recent agent actions for timeline
const recentActions = mockAgents
  .filter(a => a.lastActive)
  .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
  .slice(0, 8);

export default function AgentsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Agent Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor and manage all autonomous procurement agents</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Agents Active" value={mockAgents.filter(a => a.status === 'Active').length} icon={Bot} color="indigo" />
        <StatCard label="Tasks Today" value="247" icon={Zap} color="green" />
        <StatCard label="Avg Accuracy" value={`${avgAccuracy}%`} icon={Target} color="indigo" />
        <StatCard label="Total Savings" value={`$${(totalSavings / 1000000).toFixed(1)}M`} icon={DollarSign} color="green" trend="+18% MoM" trendUp />
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockAgents.map(agent => (
          <div key={agent.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <Bot className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{agent.name}</h3>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${domainColors[agent.domain] || 'bg-slate-100 text-slate-700'}`}>
                    {agent.domain}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${autonomyColors[agent.autonomyLevel] || 'bg-slate-100 text-slate-700'}`}>
                  {agent.autonomyLevel}
                </span>
              </div>
            </div>

            {/* Status Dot */}
            <div className="flex items-center gap-1.5 mb-4">
              <span className={`h-2 w-2 rounded-full ${
                agent.status === 'Active' ? 'bg-emerald-500 animate-pulse' :
                agent.status === 'Idle' ? 'bg-amber-400' : 'bg-slate-400'
              }`} />
              <span className="text-xs text-slate-500">{agent.status}</span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] font-medium text-slate-500 uppercase">Tasks</p>
                <p className="text-lg font-bold text-slate-900">{agent.tasksCompleted.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] font-medium text-slate-500 uppercase">Accuracy</p>
                <p className="text-lg font-bold text-slate-900">{agent.accuracy}%</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] font-medium text-slate-500 uppercase">Savings</p>
                <p className="text-lg font-bold text-emerald-600">
                  {agent.savingsGenerated > 0 ? `$${(agent.savingsGenerated / 1000).toFixed(0)}K` : '--'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] font-medium text-slate-500 uppercase">Escalation</p>
                <p className="text-lg font-bold text-slate-900">{agent.humanEscalationRate}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Agent Actions Timeline */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">Recent Agent Actions</h2>
        </div>
        <div className="space-y-4">
          {recentActions.map((agent, i) => (
            <div key={agent.id} className="flex items-start gap-3">
              <div className="relative flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full ${agent.status === 'Active' ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                {i < recentActions.length - 1 && <div className="w-px h-full bg-slate-200 absolute top-3" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{agent.name}</span>
                    {' '}completed {agent.tasksCompleted.toLocaleString()} tasks with {agent.accuracy}% accuracy
                  </p>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                    {new Date(agent.lastActive).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
