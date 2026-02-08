'use client';

import { useState } from 'react';
import { Target, TrendingDown, Briefcase, CalendarClock, Plus, X, Users, Calendar } from 'lucide-react';
import { mockSourcingProjects } from '@/services/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/StatCard';

const typeColors: Record<string, string> = {
  RFP: 'bg-indigo-50 text-indigo-700',
  RFQ: 'bg-blue-50 text-blue-700',
  RFI: 'bg-purple-50 text-purple-700',
  'Reverse Auction': 'bg-amber-50 text-amber-700',
};

const vendorColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];

export default function SourcingPage() {
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBudget, setNewBudget] = useState('');

  const activeCount = mockSourcingProjects.filter(p => ['Active', 'Evaluation'].includes(p.status)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sourcing & RFPs</h1>
          <p className="mt-1 text-sm text-slate-500">Manage sourcing events and vendor selection</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Potential Savings"
          value="$142K"
          icon={TrendingDown}
          color="green"
          trend="from active projects"
        />
        <StatCard
          label="Active Projects"
          value={activeCount}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          label="Upcoming Renewals"
          value={5}
          icon={CalendarClock}
          color="amber"
          trend="Next 90 days"
        />
      </div>

      {/* Project Cards */}
      <div className="space-y-4">
        {mockSourcingProjects.map(project => (
          <div key={project.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{project.title}</h3>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[project.type] || 'bg-slate-100 text-slate-700'}`}>
                    {project.type}
                  </span>
                  <StatusBadge status={project.status} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Target className="h-3.5 w-3.5" />
                    {project.owner}
                  </span>
                  <span className="font-mono font-medium text-slate-700">
                    ${project.budget.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Due {project.dueDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Vendor Avatars */}
                <div className="flex items-center">
                  {project.vendors.slice(0, 4).map((vendor, i) => (
                    <div
                      key={i}
                      title={vendor}
                      className={`flex h-8 w-8 -ml-2 first:ml-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white ${vendorColors[i % vendorColors.length]}`}
                    >
                      {vendor.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                  ))}
                  {project.vendors.length > 4 && (
                    <div className="flex h-8 w-8 -ml-2 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-600">
                      +{project.vendors.length - 4}
                    </div>
                  )}
                  {project.vendors.length === 0 && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> No vendors yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Create Sourcing Event</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g., Cloud Infrastructure RFP"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={e => setNewBudget(e.target.value)}
                    placeholder="100,000"
                    className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2.5 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
