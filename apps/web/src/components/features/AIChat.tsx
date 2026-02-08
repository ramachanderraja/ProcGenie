'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const botResponses: Record<string, string> = {
  policy: 'Our procurement policy requires all purchases above $10,000 to go through a competitive bidding process with at least 3 qualified vendors. For purchases above $50,000, a formal RFP is required with evaluation by the Sourcing Committee.',
  approval: 'The approval workflow follows this hierarchy: Under $5K - Auto-approved, $5K-$25K - Manager approval, $25K-$100K - Director + Finance, $100K-$500K - VP + Legal, Over $500K - C-Suite + Board review. AI agents can auto-route based on category and risk score.',
  vendor: 'To onboard a new vendor, submit a Vendor Registration Request through the Supplier Portal. Required documents include: W-9/W-8BEN, Certificate of Insurance, Bank verification letter, and compliance certifications. Our AI agent performs automated due diligence including sanctions screening, financial health check, and ESG assessment.',
  contract: 'Contract renewal notifications are sent 90 days before expiration. The AI Contract Analyst reviews terms, benchmarks pricing against market data, and flags unfavorable clauses. Auto-renewal contracts can be paused through the Contract Management module.',
  savings: 'Our AI Savings Scout has identified $2.4M in potential savings this quarter across tail spend consolidation ($890K), contract renegotiation ($720K), demand management ($480K), and supplier switching ($310K). The average realization rate is 68%.',
  compliance: 'ProcGenie enforces SOX compliance through automated three-way matching, segregation of duties controls, and immutable audit trails. All policy exceptions require documented justification and are flagged for quarterly compliance review.',
  default: 'I can help you with procurement policies, approval workflows, vendor onboarding, contract management, savings opportunities, and compliance requirements. What would you like to know more about?',
};

function getBotResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('policy') || lower.includes('rule') || lower.includes('guideline')) return botResponses.policy;
  if (lower.includes('approv') || lower.includes('workflow') || lower.includes('hierarchy')) return botResponses.approval;
  if (lower.includes('vendor') || lower.includes('supplier') || lower.includes('onboard')) return botResponses.vendor;
  if (lower.includes('contract') || lower.includes('renew') || lower.includes('expir')) return botResponses.contract;
  if (lower.includes('saving') || lower.includes('cost') || lower.includes('spend') || lower.includes('budget')) return botResponses.savings;
  if (lower.includes('complian') || lower.includes('audit') || lower.includes('sox') || lower.includes('regulat')) return botResponses.compliance;
  return botResponses.default;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: 'Hello! I\'m the ProcGenie Policy Assistant. I can help you with procurement policies, approval workflows, vendor questions, and more. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: getBotResponse(trimmed),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'What is our approval policy?',
    'How do I onboard a vendor?',
    'Show me savings opportunities',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Chat Panel */}
      {isOpen && (
        <div className="mb-4 flex w-[400px] flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-fade-in" style={{ height: '520px' }}>
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-600 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Policy Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-indigo-200">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                  msg.role === 'bot' ? 'bg-indigo-100' : 'bg-slate-200'
                }`}>
                  {msg.role === 'bot' ? (
                    <Bot className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <User className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'bot'
                    ? 'bg-white border border-slate-100 text-slate-700'
                    : 'bg-indigo-600 text-white'
                }`}>
                  <p className="text-[13px] leading-relaxed">{msg.content}</p>
                  <p className={`mt-1 text-[10px] ${
                    msg.role === 'bot' ? 'text-slate-400' : 'text-indigo-200'
                  }`}>
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
                  <Bot className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Questions (show only if 1 message) */}
            {messages.length === 1 && !isTyping && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Quick questions</p>
                {quickQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => {
                        const userMsg: ChatMessage = {
                          id: `user-${Date.now()}`,
                          role: 'user',
                          content: q,
                          timestamp: new Date(),
                        };
                        setMessages(prev => [...prev, userMsg]);
                        setInput('');
                        setIsTyping(true);
                        setTimeout(() => {
                          const botMsg: ChatMessage = {
                            id: `bot-${Date.now()}`,
                            role: 'bot',
                            content: getBotResponse(q),
                            timestamp: new Date(),
                          };
                          setMessages(prev => [...prev, botMsg]);
                          setIsTyping(false);
                        }, 800 + Math.random() * 700);
                      }, 50);
                    }}
                    className="block w-full text-left rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about policies, approvals, vendors..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              AI-powered assistant &middot; Responses may not be 100% accurate
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 ${
          isOpen
            ? 'bg-slate-700 hover:bg-slate-800'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}
