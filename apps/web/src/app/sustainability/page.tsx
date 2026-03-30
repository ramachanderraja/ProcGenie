'use client';

import { Leaf, Cloud, Factory, Truck, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { listSuppliers, getEsgScores, getCarbonFootprints, getRegulatoryAlerts, type Supplier, type PaginatedResult, type EsgScore, type CarbonFootprint, type RegulatoryAlert } from '@/services/api';
import { useApi } from '@/hooks/useApi';

function scoreColor(score: number) {
  if (score >= 85) return 'text-emerald-600 font-bold';
  if (score >= 70) return 'text-blue-600 font-semibold';
  if (score >= 60) return 'text-amber-600 font-semibold';
  return 'text-red-600 font-semibold';
}

function scoreBg(score: number) {
  if (score >= 85) return 'bg-emerald-50';
  if (score >= 70) return 'bg-blue-50';
  if (score >= 60) return 'bg-amber-50';
  return 'bg-red-50';
}

const targets = [
  { label: 'Carbon Reduction', progress: 67, color: 'bg-emerald-500' },
  { label: 'Green Procurement', progress: 45, color: 'bg-blue-500' },
  { label: 'Diversity Spend', progress: 72, color: 'bg-purple-500' },
  { label: 'Circular Economy', progress: 38, color: 'bg-amber-500' },
];

const staticAlerts = [
  { title: 'EU CSRD Reporting Deadline', description: 'Corporate Sustainability Reporting Directive requires Scope 3 disclosure by Q2 2026.', severity: 'High' },
  { title: 'SEC Climate Rule Update', description: 'Updated SEC climate disclosure rules take effect March 2026. Review materiality assessments.', severity: 'Medium' },
  { title: 'ISO 14001 Certification Renewal', description: 'Environmental management system certification expires April 2026. Schedule audit.', severity: 'Low' },
];

export default function SustainabilityPage() {
  const { data: suppliersData, loading: suppliersLoading } = useApi<PaginatedResult<Supplier>>(() => listSuppliers({ limit: 50 }), []);
  const { data: esgData, loading: esgLoading } = useApi<PaginatedResult<EsgScore>>(() => getEsgScores(), []);
  const { data: carbonData, loading: carbonLoading } = useApi<CarbonFootprint[]>(() => getCarbonFootprints(), []);
  const { data: alertsData, loading: alertsLoading } = useApi<PaginatedResult<RegulatoryAlert>>(() => getRegulatoryAlerts(), []);

  const suppliers = suppliersData?.items ?? [];
  const esgScores = esgData?.items ?? [];
  const carbonFootprints = carbonData ?? [];
  const regulatoryAlerts = alertsData?.items ?? [];

  // Build a map of supplierId -> EsgScore for quick lookup
  const esgMap = new Map<string, EsgScore>();
  for (const esg of esgScores) {
    esgMap.set(esg.supplierId, esg);
  }

  // Suppliers that have ESG scores (from either embedded esgScore or the esgScores API)
  const suppliersWithEsg = suppliers.filter(s => s.esgScore || esgMap.has(s.id));

  // Compute carbon totals by scope, falling back to static values
  const scope1 = carbonFootprints.filter(c => c.scope === 'Scope 1').reduce((sum, c) => sum + c.emissionsTonsCo2, 0);
  const scope2 = carbonFootprints.filter(c => c.scope === 'Scope 2').reduce((sum, c) => sum + c.emissionsTonsCo2, 0);
  const scope3 = carbonFootprints.filter(c => c.scope === 'Scope 3').reduce((sum, c) => sum + c.emissionsTonsCo2, 0);

  const carbonItems = [
    { label: 'Scope 1 Emissions', value: carbonFootprints.length > 0 ? `${scope1.toFixed(1)}t` : '12.4t', icon: Factory, desc: 'Direct emissions', color: 'bg-amber-50 text-amber-600' },
    { label: 'Scope 2 Emissions', value: carbonFootprints.length > 0 ? `${scope2.toFixed(1)}t` : '45.8t', icon: Cloud, desc: 'Indirect energy', color: 'bg-blue-50 text-blue-600' },
    { label: 'Scope 3 Emissions', value: carbonFootprints.length > 0 ? `${scope3.toFixed(1)}t` : '234.6t', icon: Truck, desc: 'Supply chain', color: 'bg-purple-50 text-purple-600' },
  ];

  // Use API alerts if available, otherwise static
  const alerts = regulatoryAlerts.length > 0
    ? regulatoryAlerts.map(a => ({ title: a.title, description: a.description, severity: a.severity }))
    : staticAlerts;

  const isLoading = suppliersLoading || esgLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sustainability & ESG Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Environmental, Social, and Governance performance tracking</p>
      </div>

      {/* Carbon Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {carbonItems.map(item => (
          <div key={item.label} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{item.label}</span>
              <div className={`rounded-xl p-2.5 ${item.color.split(' ')[0]}`}>
                <item.icon className={`h-5 w-5 ${item.color.split(' ')[1]}`} />
              </div>
            </div>
            {carbonLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                <span className="text-sm text-slate-400">Loading...</span>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Supplier ESG Rankings */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Supplier ESG Rankings</h2>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="ml-3 text-sm text-slate-500">Loading suppliers...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vendor</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Environmental</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Social</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Governance</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Overall</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {suppliersWithEsg.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">No suppliers with ESG scores found</td>
                  </tr>
                ) : (
                  suppliersWithEsg
                    .sort((a, b) => {
                      const aEsg = a.esgScore || esgMap.get(a.id);
                      const bEsg = b.esgScore || esgMap.get(b.id);
                      const aOverall = aEsg ? ('overallScore' in aEsg ? (aEsg as EsgScore).overallScore : (aEsg as { overall: number }).overall) : 0;
                      const bOverall = bEsg ? ('overallScore' in bEsg ? (bEsg as EsgScore).overallScore : (bEsg as { overall: number }).overall) : 0;
                      return bOverall - aOverall;
                    })
                    .map(supplier => {
                      const esg = supplier.esgScore || esgMap.get(supplier.id);
                      if (!esg) return null;
                      // Support both API shapes: EsgScore from API has environmentalScore/socialScore/governanceScore/overallScore
                      // Mock data might have environmental/social/governance/overall
                      const env = 'environmentalScore' in esg ? (esg as EsgScore).environmentalScore : (esg as unknown as { environmental: number }).environmental;
                      const social = 'socialScore' in esg ? (esg as EsgScore).socialScore : (esg as unknown as { social: number }).social;
                      const gov = 'governanceScore' in esg ? (esg as EsgScore).governanceScore : (esg as unknown as { governance: number }).governance;
                      const overall = 'overallScore' in esg ? (esg as EsgScore).overallScore : (esg as unknown as { overall: number }).overall;

                      return (
                        <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                                {supplier.companyName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                              </div>
                              <span className="text-sm font-medium text-slate-900">{supplier.companyName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex rounded-md px-2 py-0.5 text-sm ${scoreColor(env)}`}>
                              {env}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex rounded-md px-2 py-0.5 text-sm ${scoreColor(social)}`}>
                              {social}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex rounded-md px-2 py-0.5 text-sm ${scoreColor(gov)}`}>
                              {gov}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex rounded-lg px-2.5 py-1 text-sm font-bold ${scoreBg(overall)} ${scoreColor(overall)}`}>
                              {overall}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {supplier.tier ? (
                              <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                                {supplier.tier}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">--</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sustainability Targets */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">Sustainability Targets</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {targets.map(target => (
            <div key={target.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{target.label}</span>
                <span className="text-sm font-bold text-slate-900">{target.progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full ${target.color} transition-all`}
                  style={{ width: `${target.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory Alerts */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">Regulatory Alerts</h2>
        </div>
        {alertsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            <span className="ml-2 text-sm text-slate-500">Loading alerts...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alerts.map(alert => (
              <div key={alert.title} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    alert.severity === 'High' ? 'text-red-500' :
                    alert.severity === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{alert.title}</h3>
                    <span className={`text-[10px] font-medium ${
                      alert.severity === 'High' ? 'text-red-600' :
                      alert.severity === 'Medium' ? 'text-amber-600' : 'text-blue-600'
                    }`}>{alert.severity} Priority</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">{alert.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
