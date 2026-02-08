import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AIChat } from '@/components/features/AIChat';

export const metadata: Metadata = {
  title: 'ProcGenie - S2P Orchestration Platform',
  description: 'Next-generation Source-to-Pay Orchestration Platform for Fortune 500 enterprises. 10 modules, 120+ features, 15 AI agents.',
  keywords: ['procurement', 'source-to-pay', 'S2P', 'orchestration', 'AI', 'enterprise'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
        <AIChat />
      </body>
    </html>
  );
}
