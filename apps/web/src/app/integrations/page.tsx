'use client';

import { useState } from 'react';
import { Plus, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { listIntegrations, activateIntegration, deactivateIntegration, testConnection, type Integration } from '@/services/api';
import { useApi } from '@/hooks/useApi';

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
  const { data: integrations, loading, error, refetch } = useApi<Integration[]>(() => listIntegrations(), []);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const allIntegrations = integrations ?? [];
  const connectedCount = allIntegrations.filter(i => i.status === 'Connected' || i.status === 'Active').length;

  const handleToggleConnection = async (integration: Integration) => {
    setActionLoading(prev => ({ ...prev, [integration.id]: true }));
    try {
      const isConnected = integration.status === 'Connected' || integration.status === 'Active';
      if (isConnected) {
        await deactivateIntegration(integration.id);
      } else {
        await activateIntegration(integration.id);
      }
      refetch();
    } catch {
      alert('Failed to update integration status');
    } finally {
      setActionLoading(prev => ({ ...prev, [integration.id]: false }));
    }
  };

  const handleTestConnection = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [`test-${id}`]: true }));
    try {
      const result = await testConnection(id);
      alert(result.success ? `Connection successful (${result.latencyMs}ms)` : `Connection failed: ${result.message}`);
    } catch {
      alert('Test connection failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [`test-${id}`]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-sm text-slate-500">Loading integrations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600">Failed to load integrations</p>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
          <button onClick={refetch} className="mt-3 text-sm text-indigo-600 hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="mt-1 text-sm text-slate-500">
          {connectedCount} of {allIntegrations.length} integrations connected
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {allIntegrations.map(integration => {
          const isConnected = integration.status === 'Connected' || integration.status === 'Active';
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
                    {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
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
                    {integration.totalRecordsSynced > 0 ? integration.totalRecordsSynced.toLocaleString() : '--'}
                  </span>
                </div>
              </div>

              {/* Connect/Disconnect Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleConnection(integration)}
                  disabled={actionLoading[integration.id]}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                    isConnected
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {actionLoading[integration.id] ? 'Processing...' : isConnected ? 'Disconnect' : 'Connect'}
                </button>
                {isConnected && (
                  <button
                    onClick={() => handleTestConnection(integration.id)}
                    disabled={actionLoading[`test-${integration.id}`]}
                    className="rounded-lg py-2 px-3 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {actionLoading[`test-${integration.id}`] ? '...' : 'Test'}
                  </button>
                )}
              </div>
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
