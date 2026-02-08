'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Inbox,
  FileText,
  ScrollText,
  Target,
  FileCheck,
  Receipt,
  Building2,
  Bot,
  Leaf,
  BarChart3,
  PieChart,
  Link2,
  Settings,
  Sparkles,
} from 'lucide-react';
import { mockRequests } from '@/services/mockData';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const pendingApprovalCount = mockRequests.filter(
  (r) => r.status === 'Pending Approval'
).length;

const navSections: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'New Request', href: '/intake', icon: PlusCircle },
      { label: 'My Approvals', href: '/approvals', icon: Inbox, badge: pendingApprovalCount },
      { label: 'My Requests', href: '/requests', icon: FileText },
    ],
  },
  {
    title: 'PROCUREMENT',
    items: [
      { label: 'Contracts', href: '/contracts', icon: ScrollText },
      { label: 'Sourcing', href: '/sourcing', icon: Target },
      { label: 'Purchase Orders', href: '/purchase-orders', icon: FileCheck },
      { label: 'Invoices', href: '/invoices', icon: Receipt },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Vendors', href: '/vendors', icon: Building2 },
      { label: 'AI Agents', href: '/agents', icon: Bot },
      { label: 'Sustainability', href: '/sustainability', icon: Leaf },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { label: 'Insights', href: '/insights', icon: BarChart3 },
      { label: 'Reports', href: '/reports', icon: PieChart },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { label: 'Integrations', href: '/integrations', icon: Link2 },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname() ?? '/dashboard';

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">ProcGenie</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">S2P Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'border-l-2 border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] flex-shrink-0 ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-semibold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            AC
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">Alex Comptroller</p>
            <p className="truncate text-xs text-slate-500">Finance Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
