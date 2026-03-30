'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle2, Calendar, DollarSign, User, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { getContract, analyzeContract, type Contract, type ContractAnalysisResult } from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/ui/StatusBadge';

const riskColors: Record<string, string> = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

/** Convert API status (e.g. ACTIVE, RENEWAL_DUE) to display form */
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ContractDetailPage() {
  const params = useParams()!;
  const id = params.id as string;
  const { data: contract, loading, error } = useApi<Contract>(() => getContract(id), [id]);
  const [analysisResult, setAnalysisResult] = useState<ContractAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleGenerateAnalysis = async () => {
    if (!contract) return;
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeContract({ contractText: 'Sample text for ' + contract.title });
      setAnalysisResult(result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
          <div className="space-y-3 animate-pulse">
            <div className="h-6 w-64 rounded bg-slate-200" />
            <div className="flex gap-3">
              <div className="h-4 w-20 rounded bg-slate-100" />
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-100" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 animate-pulse">
              <div className="h-5 w-48 rounded bg-slate-200 mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-4 w-5/6 rounded bg-slate-100" />
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 animate-pulse">
              <div className="h-5 w-32 rounded bg-slate-200 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 rounded bg-slate-100" />
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </div>
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
        <Link href="/contracts" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Contracts
        </Link>
        <div className="flex flex-col items-center justify-center py-24">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-700">Failed to load contract</h2>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <Link href="/contracts" className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <FileText className="h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-lg font-semibold text-slate-700">Contract not found</h2>
        <Link href="/contracts" className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Back to Contracts
        </Link>
      </div>
    );
  }

  // Use the analysis from the API response, or the locally generated one
  const ai = analysisResult || contract.aiAnalysis;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Link
        href="/contracts"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contracts
      </Link>

      {/* Header */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{contract.title}</h1>
              <StatusBadge status={formatStatus(contract.status)} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {contract.type}
              </span>
              <span>{contract.supplierName || 'N/A'}</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-400">{contract.contractNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left - AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {ai ? (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">AI Contract Analysis</h2>
                </div>
              </div>

              {/* Summary */}
              <div className="p-6 space-y-6">
                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                  <p className="text-sm leading-relaxed text-indigo-900">{ai.summary}</p>
                </div>

                {/* Key Terms */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Key Terms</h3>
                  <div className="space-y-2">
                    {ai.keyTerms.map((kt, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{kt.term}</p>
                          <p className="text-sm text-slate-500">{kt.value}</p>
                        </div>
                        {'riskLevel' in kt ? (
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${riskColors[(kt as { riskLevel: string }).riskLevel] || riskColors['Medium']}`}>
                            {(kt as { riskLevel: string }).riskLevel === 'High' && <AlertTriangle className="h-3 w-3" />}
                            {(kt as { riskLevel: string }).riskLevel === 'Low' && <CheckCircle2 className="h-3 w-3" />}
                            {(kt as { riskLevel: string }).riskLevel}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">{kt.section}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risky Clauses */}
                {ai.riskyClauses && ai.riskyClauses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900">Risky Clauses</h3>
                    {ai.riskyClauses.map((rc, i) => (
                      <div key={i} className="rounded-lg border border-slate-100 p-4">
                        <h4 className="text-sm font-semibold text-slate-800 mb-1.5">{rc.clause}</h4>
                        <p className="text-sm leading-relaxed text-red-600 mb-1">{rc.risk}</p>
                        <p className="text-sm leading-relaxed text-slate-600">{rc.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {ai.recommendations && ai.recommendations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900">Recommendations</h3>
                    <ul className="space-y-1.5">
                      {ai.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-12 text-center">
              <Shield className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-sm font-semibold text-slate-700">No AI Analysis Available</h3>
              <p className="mt-1 text-sm text-slate-500">AI analysis has not been generated for this contract yet.</p>
              {analysisError && (
                <p className="mt-2 text-sm text-red-600">{analysisError}</p>
              )}
              <button
                onClick={handleGenerateAnalysis}
                disabled={analyzing}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {analyzing && <Loader2 className="h-4 w-4 animate-spin" />}
                {analyzing ? 'Analyzing...' : 'Generate Analysis'}
              </button>
            </div>
          )}
        </div>

        {/* Right - Metadata */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Contract Details</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <StatusBadge status={formatStatus(contract.status)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Value
                </span>
                <span className="text-sm font-semibold font-mono text-slate-900">
                  ${(contract.totalValue || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Payment Terms</span>
                <span className="text-sm font-medium text-slate-700">{contract.paymentTerms || 'N/A'}</span>
              </div>
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Start Date
                </span>
                <span className="text-sm font-medium text-slate-700">{formatDate(contract.startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> End Date
                </span>
                <span className="text-sm font-medium text-slate-700">{formatDate(contract.endDate)}</span>
              </div>
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Auto-Renewal
                </span>
                <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${contract.autoRenew ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span className={`h-2 w-2 rounded-full ${contract.autoRenew ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  {contract.autoRenew ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Owner
                </span>
                <span className="text-sm font-medium text-slate-700">N/A</span>
              </div>
              {contract.governingLaw && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Governing Law</span>
                  <span className="text-sm font-medium text-slate-700">{contract.governingLaw}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
