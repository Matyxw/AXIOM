import { headers } from 'next/headers';
import Link from 'next/link';
import { ReactNode } from 'react';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const tenantId = headersList.get('x-axiom-tenant-id') || 'Unknown Tenant';

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/[0.08] bg-[#020202] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.04]">
          <div className="font-semibold tracking-tight text-[14px] flex items-center gap-2 text-white">
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-white to-neutral-400 rounded-[3px] shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
            AXIOM SaaS
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-4">Workspace</div>
          <div className="text-[13px] font-medium text-white mb-8 truncate flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            {tenantId}
          </div>
          
          <nav className="flex flex-col gap-2">
            <Link href="/dashboard" className="text-[13px] text-neutral-400 hover:text-white px-3 py-2 rounded-md hover:bg-white/[0.04] transition-colors flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Overview
            </Link>
            <Link href="/dashboard/whatsapp" className="text-[13px] text-neutral-400 hover:text-white px-3 py-2 rounded-md hover:bg-white/[0.04] transition-colors flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              WhatsApp API
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.02)_0%,transparent_50%)] pointer-events-none z-0"></div>
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
