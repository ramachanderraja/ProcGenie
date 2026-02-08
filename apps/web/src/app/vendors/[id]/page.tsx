'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Shield, Star, CheckCircle2, XCircle, AlertTriangle, Mail, Phone, Globe, FileText, ExternalLink } from 'lucide-react';
import { mockVendors, mockContracts } from '@/services/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';

function getTrustColor(score: number) {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-600';
}

function complianceIcon(status: string) {
  if (status.toLowerCase().includes('valid') || status.toLowerCase().includes('verified') || status.toLowerCase().includes('clear')) {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (status.toLowerCase().includes('pending') || status.toLowerCase().includes('warning')) {
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  }
  return <XCircle className="h-4 w-4 text-red-500" />;
}

function sentimentColor(sentiment: string) {
  if (sentiment === 'Positive') return 'text-emerald-600 bg-emerald-50';
  if (sentiment === 'Neutral') return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

export default function VendorDetailPage() {
  const params = useParams()!;
  const id = params.id as string;
  const vendor = mockVendors.find(v => v.id === id);

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Building2 className="h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-lg font-semibold text-slate-700">Vendor not found</h2>
        <Link href="/vendors" className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">Back to Vendors</Link>
      </div>
    );
  }

  const vendorContracts = mockContracts.filter(c => c.vendorName === vendor.name);

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
            {vendor.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{vendor.name}</h1>
              {vendor.isPreferred && (
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Preferred</span>
              )}
              {vendor.complianceStatus.taxValid.includes('Valid') && (
                <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Tax Verified</span>
              )}
              {vendor.documents.some(d => d.type === 'SOC2') && (
                <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">SOC2</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span>{vendor.category}</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono font-medium text-slate-700">${(vendor.spendLast12M / 1000).toFixed(0)}K annual spend</span>
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
            <p className="text-sm leading-relaxed text-slate-600">{vendor.description}</p>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{vendor.contactName} - {vendor.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <a href={vendor.website} className="text-indigo-600 hover:text-indigo-700">{vendor.website}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Console */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Compliance Console</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Bank Verification', value: vendor.complianceStatus.bankValid },
                { label: 'Tax ID', value: vendor.complianceStatus.taxValid },
                { label: 'Sanctions Check', value: vendor.complianceStatus.sanctionsCheck },
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {complianceIcon(item.value)}
                    <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-6">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Risk Scan */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">AI Risk Scan</h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-slate-500">Sentiment:</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${sentimentColor(vendor.riskScan.sentiment)}`}>
                {vendor.riskScan.sentiment}
              </span>
              <span className="text-xs text-slate-400 ml-auto">
                Last scanned: {new Date(vendor.riskScan.lastScanned).toLocaleDateString()}
              </span>
            </div>
            <ul className="space-y-1.5">
              {vendor.riskScan.findings.map((finding, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                  {finding}
                </li>
              ))}
            </ul>
          </div>

          {/* Document Center */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Document Center</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-2 text-left text-xs font-semibold text-slate-500">Document</th>
                    <th className="pb-2 text-left text-xs font-semibold text-slate-500">Type</th>
                    <th className="pb-2 text-left text-xs font-semibold text-slate-500">Status</th>
                    <th className="pb-2 text-left text-xs font-semibold text-slate-500">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vendor.documents.map(doc => (
                    <tr key={doc.id}>
                      <td className="py-2.5 flex items-center gap-2 text-sm text-slate-700">
                        <FileText className="h-4 w-4 text-slate-400" />
                        {doc.name}
                      </td>
                      <td className="py-2.5 text-xs text-slate-500">{doc.type}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${doc.status === 'Valid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-slate-500">{doc.expiryDate || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                      <p className="text-xs text-slate-500">{c.type} - ${c.value.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.status} />
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
              <div className={`text-5xl font-bold ${getTrustColor(vendor.trustScore)}`}>
                {vendor.trustScore}
              </div>
              <p className="mt-1 text-xs text-slate-500">Trust Score</p>
              <div className="flex items-center justify-center gap-0.5 mt-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(vendor.performanceRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
                <span className="ml-1.5 text-sm text-slate-500">{vendor.performanceRating}</span>
              </div>
            </div>

            {/* Trust Factor Bars */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase">Trust Factors</h4>
              {vendor.esgScore && (
                <>
                  {[
                    { label: 'Environmental', value: vendor.esgScore.environmental },
                    { label: 'Social', value: vendor.esgScore.social },
                    { label: 'Governance', value: vendor.esgScore.governance },
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
              )}
            </div>

            {/* ESG Overall */}
            {vendor.esgScore && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">ESG Overall</span>
                  <span className={`text-lg font-bold ${getTrustColor(vendor.esgScore.overall)}`}>
                    {vendor.esgScore.overall}
                  </span>
                </div>
              </div>
            )}

            {/* Diversity */}
            {vendor.diversityClassification && vendor.diversityClassification !== 'None' && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                  {vendor.diversityClassification}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
