'use client';

import { useState } from 'react';
import { Link2, Plus, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { mockIntegrations } from '@/services/mockData';

function healthColor(health: number) {
  if (health >= 95) return 'bg-emerald-500';
  if (health >= 80) return 'bg-amber-500';
  if (health > 0) return 'bg-red-500';
  return 'bg-slate-200';
}

function healthTextColor(health: number) {
  if (health >= 95) return 'text-emerald-600';
  if (health >= 80) return 'text-amber-600';
  if (health > 0) return 'text-red-600';
  return 'text-slate-400';
}

const iconColors: Record<string, string> = {
  ERP: 'bg-blue-500',
  HRIS: 'bg-orange-500',
  CRM: 'bg-cyan-500',
  Finance: 'bg-emerald-500',
  P2P: 'bg-indigo-500',
  Contract: 'bg-amber-500',
  'Risk Data': 'bg-red-500',
  Identity: 'bg-purple-500',
};

export default function IntegrationsPage() {
  const [connections, setConnections] = useState<Record<string, boolean>>(
    Object.fromEntries(mockIntegrations.map(i => [i.id, i.status === 'Connected']))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="mt-1 text-sm text-slate-500">
          {mockIntegrations.filter(i => i.status === 'Connected').length} of {mockIntegrations.length} integrations connected
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockIntegrations.map(integration => {
          const isConnected = connections[integration.id];
          return (
            <div key={integration.id} className="relative rounded-2xl bg-white border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow overflow-hidden">
              {/* Connected Banner */}
              {isConnected && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" /> Connected
                  </span>
                </div>
              )}

              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold text-sm ${iconColors[integration.type] || 'bg-slate-500'}`}>
                  {integration.name.split(' ')[0].slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{integration.name}</h3>
                  <span className="text-xs text-slate-500">{integration.type}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Last Sync</span>
                  <span className="font-medium text-slate-700">
                    {integration.lastSync ? new Date(integration.lastSync).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </span>
                </div>

                {/* Sync Health Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Sync Health</span>
                    <span className={`font-semibold ${healthTextColor(integration.syncHealth)}`}>
                      {integration.syncHealth > 0 ? `${integration.syncHealth}%` : '--'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div
                      className={`h-1.5 rounded-full ${healthColor(integration.syncHealth)} transition-all`}
                      style={{ width: `${integration.syncHealth}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Records Synced</span>
                  <span className="font-medium font-mono text-slate-700">
                    {integration.recordsSynced > 0 ? integration.recordsSynced.toLocaleString() : '--'}
                  </span>
                </div>
              </div>

              {/* Connect/Disconnect Toggle */}
              <button
                onClick={() => setConnections(prev => ({ ...prev, [integration.id]: !prev[integration.id] }))}
                className={`w-full rounded-lg py-2 text-xs font-medium transition-colors ${
                  isConnected
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          );
        })}

        {/* Browse App Catalog Card */}
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer min-h-[240px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-3">
            <Plus className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Browse App Catalog</h3>
          <p className="text-xs text-slate-500">Discover and connect new integrations from our marketplace</p>
        </div>
      </div>
    </div>
  );
}
