'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Users, CheckSquare, Bell, Shield, Brain, Save } from 'lucide-react';
import { mockAgents } from '@/services/mockData';

const tabs = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'ai', label: 'AI Governance', icon: Brain },
] as const;

const users = [
  { name: 'Alex Comptroller', email: 'alex.comptroller@acme.com', role: 'Finance Admin', status: 'Active', lastLogin: '2026-02-08 09:15 AM' },
  { name: 'Lisa Park', email: 'lisa.park@acme.com', role: 'Procurement Lead', status: 'Active', lastLogin: '2026-02-08 08:45 AM' },
  { name: 'Sarah Chen', email: 'sarah.chen@acme.com', role: 'Engineering Manager', status: 'Active', lastLogin: '2026-02-07 04:30 PM' },
  { name: 'Kevin Zhang', email: 'kevin.zhang@acme.com', role: 'IT Security Lead', status: 'Active', lastLogin: '2026-02-08 07:20 AM' },
  { name: 'Rachel Foster', email: 'rachel.foster@acme.com', role: 'General Counsel', status: 'Active', lastLogin: '2026-02-07 06:00 PM' },
  { name: 'Tom Rivera', email: 'tom.rivera@acme.com', role: 'Marketing Director', status: 'Active', lastLogin: '2026-02-06 03:15 PM' },
  { name: 'Carlos Mendez', email: 'carlos.mendez@acme.com', role: 'Manufacturing Lead', status: 'Inactive', lastLogin: '2026-01-28 11:00 AM' },
  { name: 'Emily Watson', email: 'emily.watson@acme.com', role: 'Facilities Manager', status: 'Active', lastLogin: '2026-02-08 08:00 AM' },
];

const thresholds = [
  { range: '<$1K', approver: 'Department Manager', sla: '4 hours', escalation: 'Auto-approve after SLA' },
  { range: '$1K-$10K', approver: 'Department Manager + Finance', sla: '1 business day', escalation: 'Finance Director' },
  { range: '$10K-$50K', approver: 'Procurement Lead', sla: '2 business days', escalation: 'VP Procurement' },
  { range: '$50K-$250K', approver: 'VP + CFO Review', sla: '5 business days', escalation: 'CEO' },
  { range: '>$250K', approver: 'CFO + CEO + Board', sla: '10 business days', escalation: 'Board Chair' },
];

const notifEvents = [
  'New Request Submitted',
  'Approval Required',
  'Request Approved/Rejected',
  'Contract Expiring',
  'Invoice Exception',
  'Vendor Risk Alert',
  'AI Agent Escalation',
  'PO Status Change',
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [orgName, setOrgName] = useState('Acme Corporation');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('America/New_York');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [ssoProvider, setSsoProvider] = useState('Azure AD');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [emailNotifs, setEmailNotifs] = useState<Record<string, boolean>>(Object.fromEntries(notifEvents.map(e => [e, true])));
  const [slackNotifs, setSlackNotifs] = useState<Record<string, boolean>>(Object.fromEntries(notifEvents.map((e, i) => [e, i < 5])));
  const [inAppNotifs, setInAppNotifs] = useState<Record<string, boolean>>(Object.fromEntries(notifEvents.map(e => [e, true])));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage platform configuration and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-lg">
            <h2 className="text-lg font-semibold text-slate-900">General Settings</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>JPY</option>
                <option>CAD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option>America/New_York</option>
                <option>America/Chicago</option>
                <option>America/Denver</option>
                <option>America/Los_Angeles</option>
                <option>Europe/London</option>
                <option>Europe/Berlin</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        )}

        {/* Users & Roles Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Users & Roles</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">Name</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">Email</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">Role</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(user => (
                    <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-sm font-medium text-slate-900">{user.name}</td>
                      <td className="py-3 text-sm text-slate-600">{user.email}</td>
                      <td className="py-3">
                        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-slate-500">{user.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Approval Thresholds</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">Threshold</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">Required Approver(s)</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">SLA</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">Escalation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {thresholds.map(t => (
                    <tr key={t.range} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-mono text-sm font-semibold text-indigo-600">{t.range}</td>
                      <td className="py-3 text-sm text-slate-700">{t.approver}</td>
                      <td className="py-3 text-sm text-slate-600">{t.sla}</td>
                      <td className="py-3 text-sm text-slate-500">{t.escalation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Notification Preferences</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left text-xs font-semibold uppercase text-slate-500">Event</th>
                    <th className="pb-3 text-center text-xs font-semibold uppercase text-slate-500">Email</th>
                    <th className="pb-3 text-center text-xs font-semibold uppercase text-slate-500">Slack</th>
                    <th className="pb-3 text-center text-xs font-semibold uppercase text-slate-500">In-App</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {notifEvents.map(event => (
                    <tr key={event}>
                      <td className="py-3 text-sm text-slate-700">{event}</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setEmailNotifs(prev => ({ ...prev, [event]: !prev[event] }))}
                          className={`h-5 w-9 rounded-full transition-colors ${emailNotifs[event] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                          <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${emailNotifs[event] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setSlackNotifs(prev => ({ ...prev, [event]: !prev[event] }))}
                          className={`h-5 w-9 rounded-full transition-colors ${slackNotifs[event] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                          <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${slackNotifs[event] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setInAppNotifs(prev => ({ ...prev, [event]: !prev[event] }))}
                          className={`h-5 w-9 rounded-full transition-colors ${inAppNotifs[event] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                          <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${inAppNotifs[event] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-lg">
            <h2 className="text-lg font-semibold text-slate-900">Security Settings</h2>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Multi-Factor Authentication</h3>
                <p className="text-xs text-slate-500 mt-0.5">Require MFA for all users</p>
              </div>
              <button
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={`h-6 w-11 rounded-full transition-colors ${mfaEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${mfaEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SSO Provider</label>
              <select
                value={ssoProvider}
                onChange={e => setSsoProvider(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option>Azure AD</option>
                <option>Okta</option>
                <option>Google Workspace</option>
                <option>OneLogin</option>
                <option>None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={e => setSessionTimeout(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              <Save className="h-4 w-4" /> Save Security Settings
            </button>
          </div>
        )}

        {/* AI Governance Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">AI Governance</h2>

            {/* Per-Agent Autonomy */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Agent Autonomy Levels</h3>
              <div className="space-y-2">
                {mockAgents.slice(0, 10).map(agent => (
                  <div key={agent.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-slate-900">{agent.name}</span>
                      <span className="ml-2 text-xs text-slate-400">{agent.domain}</span>
                    </div>
                    <select
                      defaultValue={agent.autonomyLevel}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      <option>Level 4 - Autonomous</option>
                      <option>Level 3 - Supervised</option>
                      <option>Level 2 - Advisory</option>
                      <option>Level 1 - Manual</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Guardrails */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Global Guardrails</h3>
              <div className="space-y-3">
                {[
                  { label: 'Require human approval for transactions > $100K', default: true },
                  { label: 'Enable AI audit trail logging', default: true },
                  { label: 'Allow autonomous vendor communication', default: false },
                  { label: 'Enable AI-generated contract modifications', default: false },
                  { label: 'Auto-escalate low-confidence decisions', default: true },
                ].map(guardrail => (
                  <div key={guardrail.label} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                    <span className="text-sm text-slate-700">{guardrail.label}</span>
                    <button
                      className={`h-5 w-9 rounded-full transition-colors ${guardrail.default ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${guardrail.default ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
