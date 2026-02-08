'use client';

import { useState } from 'react';
import { PieChart, Search, FileBarChart, BarChart3, Users, ScrollText, ShieldCheck, Leaf, Download, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

const reportTemplates = [
  { id: 'spend', title: 'Spend Analysis', description: 'Comprehensive breakdown of procurement spend by category, vendor, and department.', icon: BarChart3, color: 'bg-indigo-50 text-indigo-600' },
  { id: 'savings', title: 'Savings Summary', description: 'AI-identified savings opportunities and realized savings across all categories.', icon: PieChart, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'supplier', title: 'Supplier Performance', description: 'Vendor scorecard with trust scores, delivery metrics, and risk assessments.', icon: Users, color: 'bg-blue-50 text-blue-600' },
  { id: 'contract', title: 'Contract Expiration', description: 'Upcoming contract renewals, expirations, and auto-renewal notifications.', icon: ScrollText, color: 'bg-amber-50 text-amber-600' },
  { id: 'compliance', title: 'Compliance Audit', description: 'Policy compliance rates, violations, and regulatory adherence report.', icon: ShieldCheck, color: 'bg-rose-50 text-rose-600' },
  { id: 'esg', title: 'ESG Report', description: 'Environmental, Social, and Governance metrics across the supply chain.', icon: Leaf, color: 'bg-teal-50 text-teal-600' },
];

const scheduledReports = [
  { title: 'Weekly Spend Summary', frequency: 'Weekly', nextRun: 'Mon, Feb 10 9:00 AM', enabled: true },
  { title: 'Monthly Compliance Report', frequency: 'Monthly', nextRun: 'Mar 1, 2026 8:00 AM', enabled: true },
  { title: 'Quarterly Vendor Review', frequency: 'Quarterly', nextRun: 'Apr 1, 2026 9:00 AM', enabled: false },
];

export default function ReportsPage() {
  const [nlQuery, setNlQuery] = useState('');
  const [subscriptions, setSubscriptions] = useState(scheduledReports.map(r => r.enabled));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Generate, schedule, and explore procurement reports</p>
      </div>

      {/* NL Query Input */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={nlQuery}
            onChange={e => setNlQuery(e.target.value)}
            placeholder="Ask a question about your data..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['How much did we spend on software last quarter?', 'Which vendors have expiring contracts?', 'Show me top AI agent savings'].map(q => (
            <button
              key={q}
              onClick={() => setNlQuery(q)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Pre-built Report Templates */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reportTemplates.map(report => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className={`inline-flex rounded-xl p-3 ${report.color.split(' ')[0]} mb-4`}>
                  <Icon className={`h-6 w-6 ${report.color.split(' ')[1]}`} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{report.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 mb-4">{report.description}</p>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  Generate
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Subscriptions */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">Scheduled Reports</h2>
        </div>
        <div className="space-y-3">
          {scheduledReports.map((report, i) => (
            <div key={report.title} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <FileBarChart className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{report.title}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">{report.frequency}</span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-500">Next: {report.nextRun}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const newSubs = [...subscriptions];
                  newSubs[i] = !newSubs[i];
                  setSubscriptions(newSubs);
                }}
                className="transition-colors"
              >
                {subscriptions[i] ? (
                  <ToggleRight className="h-7 w-7 text-indigo-600" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-slate-300" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
