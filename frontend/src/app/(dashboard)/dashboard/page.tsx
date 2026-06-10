import { headers } from 'next/headers';

export default async function DashboardOverview() {
  const headersList = await headers();
  const tenantId = headersList.get('x-axiom-tenant-id') || 'Unknown Tenant';

  return (
    <div className="p-10 max-w-6xl mx-auto w-full">
      <h1 className="text-3xl font-medium tracking-tight mb-2">Workspace Overview</h1>
      <p className="text-neutral-400 font-light mb-10">Monitor the performance and active flows of your agents.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-white/[0.02] blur-[40px] rounded-full"></div>
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest mb-4">Total Leads</div>
          <div className="text-4xl font-medium">0</div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-white/[0.02] blur-[40px] rounded-full"></div>
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest mb-4">Active Workflows</div>
          <div className="text-4xl font-medium">0</div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-white/[0.02] blur-[40px] rounded-full"></div>
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest mb-4">Conversion Rate</div>
          <div className="text-4xl font-medium">0%</div>
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-2xl p-8 min-h-[300px]">
        <h2 className="text-lg font-medium mb-6">Recent Activity</h2>
        <div className="flex items-center justify-center h-[200px] text-neutral-500 font-light text-[14px]">
          No activity recorded yet for {tenantId}. Connect WhatsApp to start processing leads.
        </div>
      </div>
    </div>
  );
}
