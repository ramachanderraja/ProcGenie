'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle2, Calendar, DollarSign, User, RotateCcw } from 'lucide-react';
import { mockContracts } from '@/services/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';

const riskColors: Record<string, string> = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function ContractDetailPage() {
  const params = useParams()!;
  const id = params.id as string;
  const contract = mockContracts.find(c => c.id === id);

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

  const ai = contract.aiAnalysis;

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
              <StatusBadge status={contract.status} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {contract.type}
              </span>
              <span>{contract.vendorName}</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-400">{contract.id}</span>
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
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${riskColors[kt.riskLevel]}`}>
                          {kt.riskLevel === 'High' && <AlertTriangle className="h-3 w-3" />}
                          {kt.riskLevel === 'Low' && <CheckCircle2 className="h-3 w-3" />}
                          {kt.riskLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clauses */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">Key Clauses</h3>
                  {[
                    { title: 'Indemnification', content: ai.indemnificationClause },
                    { title: 'Confidentiality', content: ai.confidentialityClause },
                    { title: 'Governing Law', content: ai.governingLaw },
                    { title: 'Termination', content: ai.terminationClause },
                  ].filter(c => c.content).map((clause, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 p-4">
                      <h4 className="text-sm font-semibold text-slate-800 mb-1.5">{clause.title}</h4>
                      <p className="text-sm leading-relaxed text-slate-600">{clause.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-12 text-center">
              <Shield className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-sm font-semibold text-slate-700">No AI Analysis Available</h3>
              <p className="mt-1 text-sm text-slate-500">AI analysis has not been generated for this contract yet.</p>
              <button className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
                Generate Analysis
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
                <StatusBadge status={contract.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Value
                </span>
                <span className="text-sm font-semibold font-mono text-slate-900">
                  ${contract.value.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Payment Terms</span>
                <span className="text-sm font-medium text-slate-700">{contract.paymentTerms}</span>
              </div>
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Start Date
                </span>
                <span className="text-sm font-medium text-slate-700">{contract.startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> End Date
                </span>
                <span className="text-sm font-medium text-slate-700">{contract.endDate}</span>
              </div>
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Auto-Renewal
                </span>
                <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${contract.autoRenewal ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span className={`h-2 w-2 rounded-full ${contract.autoRenewal ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  {contract.autoRenewal ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Owner
                </span>
                <span className="text-sm font-medium text-slate-700">{contract.owner}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
