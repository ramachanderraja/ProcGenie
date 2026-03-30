'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Shield, Star, CheckCircle2, XCircle, AlertTriangle, Mail, Globe, FileText, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { getSupplier, listContracts, performRiskScan, type Supplier, type Contract, type PaginatedResult, type SupplierRiskProfile } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/ui/StatusBadge';

function getTrustColor(score: number) {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-600';
}

/** Convert API status (e.g. ACTIVE, ONBOARDING) to display form */
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function riskLevelColor(score: number): string {
  if (score <= 30) return 'bg-emerald-500';
  if (score <= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function riskLevelLabel(score: number): string {
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Medium';
  return 'High';
}

export default function VendorDetailPage() {
  const params = useParams()!;
  const id = params.id as string;
  const { data: vendor, loading, error } = useApi<Supplier>(() => getSupplier(id), [id]);
  const { data: contractsData } = useApi<PaginatedResult<Contract>>(() => listContracts({ supplierId: id }), [id]);
  const [riskScanResult, setRiskScanResult] = useState<SupplierRiskProfile | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const vendorContracts = contractsData?.items ?? [];

  const handleRiskScan = async () => {
    setScanning(true);
    setScanError(null);
    try {
      const result = await performRiskScan(id);
      setRiskScanResult(result);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Failed to run risk scan');
    } finally {
      setScanning(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-5 w-28 rounded bg-slate-200 animate-pulse" />
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm animate-pulse">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="h-4 w-32 rounded bg-slate-100" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 animate-pulse">
                <div className="h-5 w-32 rounded bg-slate-200 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 animate-pulse">
              <div className="h-5 w-36 rounded bg-slate-200 mb-4" />
              <div className="h-16 w-16 mx-auto rounded bg-slate-200 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-3 rounded bg-slate-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/vendors" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Vendors
        </Link>
        <div className="flex flex-col items-center justify-center py-24">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-700">Failed to load vendor</h2>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <Link href="/vendors" className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">Back to Vendors</Link>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Building2 className="h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-lg font-semibold text-slate-700">Vendor not found</h2>
        <Link href="/vendors" className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">Back to Vendors</Link>
      </div>
    );
  }

  const rating = vendor.overallScore || 0;
  const trustScore = Math.round(rating * 20); // Convert 0-5 to 0-100
  const isPreferred = vendor.tier === 'STRATEGIC';
  const category = vendor.categories?.[0] || vendor.industry || 'General';
  const riskProfile = riskScanResult || vendor.riskProfile;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <Link href="/vendors" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Vendors
      </Link>

      {/* Header Card */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
            {vendor.companyName.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{vendor.companyName}</h1>
              {isPreferred && (
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Preferred</span>
              )}
              <StatusBadge status={formatStatus(vendor.status)} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span>{category}</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-400">{vendor.supplierCode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-900">About</h2>
            <p className="text-sm leading-relaxed text-slate-600">{vendor.description || 'No description available.'}</p>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Contact</h3>
              <div className="space-y-2">
                {vendor.contactName && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{vendor.contactName}{vendor.contactEmail ? ` - ${vendor.contactEmail}` : ''}</span>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <a href={vendor.website} className="text-indigo-600 hover:text-indigo-700">{vendor.website}</a>
                  </div>
                )}
                {!vendor.contactName && !vendor.website && (
                  <p className="text-sm text-slate-400">No contact information available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Risk Profile / AI Risk Scan */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">AI Risk Scan</h2>
              <button
                onClick={handleRiskScan}
                disabled={scanning}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {scanning && <Loader2 className="h-3 w-3 animate-spin" />}
                {scanning ? 'Scanning...' : 'Run Scan'}
              </button>
            </div>

            {scanError && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                <p className="text-xs text-red-700">{scanError}</p>
              </div>
            )}

            {riskProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-slate-500">Overall Risk:</span>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    riskProfile.overallRiskScore <= 30 ? 'bg-emerald-50 text-emerald-700' :
                    riskProfile.overallRiskScore <= 60 ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {riskLevelLabel(riskProfile.overallRiskScore)} ({riskProfile.overallRiskScore})
                  </span>
                  <span className="text-xs text-slate-400 ml-auto">
                    Last assessed: {formatDate(riskProfile.lastAssessmentDate)}
                  </span>
                </div>

                {/* Risk Factor Bars */}
                <div className="space-y-3">
                  {[
                    { label: 'Financial Risk', value: riskProfile.financialRisk },
                    { label: 'Operational Risk', value: riskProfile.operationalRisk },
                    { label: 'Compliance Risk', value: riskProfile.complianceRisk },
                    { label: 'Reputational Risk', value: riskProfile.reputationalRisk },
                    { label: 'Geopolitical Risk', value: riskProfile.geopoliticalRisk },
                  ].map(factor => (
                    <div key={factor.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">{factor.label}</span>
                        <span className="text-xs font-semibold text-slate-900">{factor.value}/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${riskLevelColor(factor.value)}`}
                          style={{ width: `${factor.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Risk Factors */}
                {riskProfile.riskFactors && riskProfile.riskFactors.length > 0 && (
                  <div className="pt-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Risk Factors</h4>
                    <ul className="space-y-1.5">
                      {riskProfile.riskFactors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mitigation Actions */}
                {riskProfile.mitigationActions && riskProfile.mitigationActions.length > 0 && (
                  <div className="pt-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Mitigation Actions</h4>
                    <ul className="space-y-1.5">
                      {riskProfile.mitigationActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Shield className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No risk scan data available. Run a scan to assess this vendor.</p>
              </div>
            )}
          </div>

          {/* Associated Contracts */}
          {vendorContracts.length > 0 && (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Associated Contracts</h2>
              <div className="space-y-2">
                {vendorContracts.map(c => (
                  <Link
                    key={c.id}
                    href={`/contracts/${c.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.title}</p>
                      <p className="text-xs text-slate-500">{c.type} - ${(c.totalValue || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={formatStatus(c.status)} />
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Performance Scorecard */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-5">Performance Scorecard</h3>

            {/* Trust Score */}
            <div className="text-center mb-6">
              <div className={`text-5xl font-bold ${getTrustColor(trustScore)}`}>
                {trustScore}
              </div>
              <p className="mt-1 text-xs text-slate-500">Trust Score</p>
              <div className="flex items-center justify-center gap-0.5 mt-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
                <span className="ml-1.5 text-sm text-slate-500">{rating.toFixed(1)}</span>
              </div>
            </div>

            {/* ESG Trust Factors */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase">Trust Factors</h4>
              {vendor.esgScore ? (
                <>
                  {[
                    { label: 'Environmental', value: vendor.esgScore.environmentalScore },
                    { label: 'Social', value: vendor.esgScore.socialScore },
                    { label: 'Governance', value: vendor.esgScore.governanceScore },
                  ].map(factor => (
                    <div key={factor.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">{factor.label}</span>
                        <span className="text-xs font-semibold text-slate-900">{factor.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${factor.value >= 80 ? 'bg-emerald-500' : factor.value >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${factor.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-xs text-slate-400">ESG data not available.</p>
              )}
            </div>

            {/* ESG Overall */}
            {vendor.esgScore && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">ESG Overall</span>
                  <span className={`text-lg font-bold ${getTrustColor(vendor.esgScore.overallScore)}`}>
                    {vendor.esgScore.overallScore}
                  </span>
                </div>
              </div>
            )}

            {/* Tier */}
            {vendor.tier && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                  {formatStatus(vendor.tier)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
