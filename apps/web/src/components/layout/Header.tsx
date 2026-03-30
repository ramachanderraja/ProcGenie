'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { useState, useCallback } from 'react';

function getPageTitle(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0] || 'dashboard';
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function Header() {
  const pathname = usePathname() ?? '/dashboard';
  const router = useRouter();
  const pageTitle = getPageTitle(pathname);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/requests?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
      }
    },
    [searchQuery, router],
  );

  // Static notifications for now (no notification API endpoint)
  const notifications = [
    { id: '1', title: 'New approval request', message: 'AWS Reserved Instances Q2 is pending your approval', type: 'info', read: false },
    { id: '2', title: 'Contract expiring soon', message: 'Adobe Creative Cloud license expires in 30 days', type: 'warning', read: false },
    { id: '3', title: 'PO approved', message: 'PO-2026-001 for Google Workspace has been approved', type: 'success', read: true },
    { id: '4', title: 'Risk alert', message: 'Dell Technologies risk scan shows neutral sentiment', type: 'warning', read: true },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Page title */}
      <h2 className="text-xl font-semibold text-slate-900">{pageTitle}</h2>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests, vendors, contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-72 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </form>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-slate-50 px-4 py-3 ${
                      !notification.read ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                          notification.type === 'error'
                            ? 'bg-red-500'
                            : notification.type === 'warning'
                            ? 'bg-amber-500'
                            : notification.type === 'success'
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 hover:ring-2 hover:ring-indigo-200 transition-all">
          AC
        </button>
      </div>
    </header>
  );
}
