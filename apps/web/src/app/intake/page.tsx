'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  ShoppingCart,
  ScrollText,
  MessageSquare,
  Sparkles,
  Check,
  Star,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { mockCatalogItems } from '@/services/mockData';

type Step = 'prompt' | 'catalog' | 'review';

interface AIAnalysis {
  riskScore: number;
  channel: string;
  complianceNotes: string[];
  estimatedSavings: string;
}

const buyingChannels = [
  {
    icon: ShoppingCart,
    title: 'Catalog',
    description: 'Browse pre-approved items from preferred vendors with negotiated pricing.',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  {
    icon: ScrollText,
    title: 'Contract',
    description: 'Purchase against an existing contract or master service agreement.',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconColor: 'text-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'Quick Quote',
    description: 'Request competitive quotes from approved vendors for non-standard items.',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconColor: 'text-amber-600',
  },
];

const categories = [
  'IT Infrastructure',
  'Software',
  'Hardware',
  'Office Equipment',
  'Professional Services',
  'Raw Materials',
  'Marketing',
  'Facilities',
  'Other',
];

export default function IntakePage() {
  const [step, setStep] = useState<Step>('prompt');
  const [prompt, setPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Review form state
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

  const handlePromptSubmit = () => {
    if (!prompt.trim()) return;
    setAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      setAnalyzing(false);
      setStep('catalog');
    }, 1000);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleProceedToReview = () => {
    // Pre-fill from selected items
    if (selectedItems.length > 0) {
      const item = mockCatalogItems.find((c) => c.id === selectedItems[0]);
      if (item) {
        setTitle(item.name);
        setVendor(item.vendorName);
        setAmount(
          String(selectedItems.reduce((sum, id) => {
            const ci = mockCatalogItems.find((c) => c.id === id);
            return sum + (ci ? ci.price : 0);
          }, 0))
        );
      }
    }
    setStep('review');

    // Simulate AI analysis
    setTimeout(() => {
      setAiAnalysis({
        riskScore: 22,
        channel: 'Catalog',
        complianceNotes: [
          'All items from preferred vendors',
          'Within delegated authority limits',
          'Standard catalog pricing verified',
        ],
        estimatedSavings: '12%',
      });
    }, 1000);
  };

  const handleSubmitForApproval = () => {
    // In a real app, this would submit to the API
    alert('Request submitted for approval!');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-3">
        {[
          { key: 'prompt', label: 'Describe Need', num: 1 },
          { key: 'catalog', label: 'Select Items', num: 2 },
          { key: 'review', label: 'Review & Submit', num: 3 },
        ].map((s, i) => {
          const isActive = s.key === step;
          const isPast =
            (s.key === 'prompt' && (step === 'catalog' || step === 'review')) ||
            (s.key === 'catalog' && step === 'review');

          return (
            <div key={s.key} className="flex items-center gap-3">
              {i > 0 && (
                <div className={`h-px w-12 ${isPast || isActive ? 'bg-indigo-400' : 'bg-slate-200'}`} />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isPast
                      ? 'bg-indigo-600 text-white'
                      : isActive
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isPast ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-indigo-700' : isPast ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 1: Prompt */}
      {step === 'prompt' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">What do you need to buy?</h2>
                <p className="text-sm text-slate-500">
                  Describe your purchase need and our AI will recommend the best buying channel.
                </p>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you need to buy... For example: 'I need 15 high-performance laptops for the new data science team, with GPU capabilities for ML workloads. Budget is around $3,500 per unit. Needed by January 15th.'"
              rows={5}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={handlePromptSubmit}
                disabled={!prompt.trim() || analyzing}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Analyze Request
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Buying Channel Info Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {buyingChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div
                  key={channel.title}
                  className={`rounded-xl border p-5 ${channel.color}`}
                >
                  <Icon className={`mb-3 h-6 w-6 ${channel.iconColor}`} />
                  <h3 className="text-sm font-semibold">{channel.title}</h3>
                  <p className="mt-1 text-xs opacity-80">{channel.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Catalog */}
      {step === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Select from Catalog</h2>
              <p className="text-sm text-slate-500">
                AI recommends catalog items matching your description.
                {selectedItems.length > 0 && ` (${selectedItems.length} selected)`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('prompt')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleProceedToReview}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mockCatalogItems.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-400 ring-2 ring-indigo-100'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                  onClick={() => handleSelectItem(item.id)}
                >
                  {/* Placeholder image area */}
                  <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-slate-50">
                    <ShoppingCart className="h-8 w-8 text-slate-300" />
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.name}</h4>
                  <p className="mt-1 text-xs text-slate-500">{item.vendorName}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">
                      ${item.price.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium text-slate-600">4.5</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {item.deliveryTime}
                  </div>

                  <button
                    className={`mt-4 w-full rounded-lg py-2 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Review & Submit</h2>
              <p className="text-sm text-slate-500">Verify the details and submit for approval.</p>
            </div>
            <button
              onClick={() => setStep('catalog')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Request Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Request title"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Vendor</label>
                      <input
                        type="text"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                        placeholder="Vendor name"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount</label>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="$0.00"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitForApproval}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Submit for Approval
              </button>
            </div>

            {/* AI Analysis Panel */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">AI Analysis</h3>
                </div>

                {aiAnalysis ? (
                  <div className="space-y-4">
                    {/* Risk Score */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Risk Score</span>
                        <span className="text-xs font-semibold text-emerald-600">{aiAnalysis.riskScore}/100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            aiAnalysis.riskScore < 30
                              ? 'bg-emerald-500'
                              : aiAnalysis.riskScore < 60
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${aiAnalysis.riskScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Channel */}
                    <div>
                      <span className="text-xs font-medium text-slate-500">Recommended Channel</span>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <ShoppingCart className="h-3 w-3" />
                          {aiAnalysis.channel}
                        </span>
                      </div>
                    </div>

                    {/* Estimated Savings */}
                    <div>
                      <span className="text-xs font-medium text-slate-500">Estimated Savings</span>
                      <p className="mt-0.5 text-lg font-bold text-emerald-600">{aiAnalysis.estimatedSavings}</p>
                    </div>

                    {/* Compliance Notes */}
                    <div>
                      <span className="text-xs font-medium text-slate-500">Compliance Notes</span>
                      <ul className="mt-2 space-y-1.5">
                        {aiAnalysis.complianceNotes.map((note, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <ShieldCheck className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Loader2 className="mb-3 h-6 w-6 animate-spin text-indigo-400" />
                    <p className="text-sm text-slate-500">Analyzing request...</p>
                  </div>
                )}
              </div>

              {/* Warnings */}
              {aiAnalysis && aiAnalysis.riskScore > 50 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Risk Warning</p>
                      <p className="mt-0.5 text-xs text-amber-700">
                        This request has a risk score above 50. Additional approvals may be required.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
