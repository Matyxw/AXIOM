export default function WhatsAppIntegrationPage() {
  return (
    <div className="p-10 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-medium tracking-tight mb-2">WhatsApp Cloud API</h1>
      <p className="text-neutral-400 font-light mb-10">Configure your Meta Developer application credentials to enable agent messaging.</p>

      <div className="bg-[#0A0A0A] border border-white/[0.05] rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          Connection Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-[11px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Phone Number ID</label>
            <input type="text" placeholder="e.g. 10450302920392" className="w-full bg-[#050505] border border-white/[0.1] rounded-lg px-4 py-3 text-[14px] text-white focus:outline-none focus:border-white/[0.3] transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-neutral-500 uppercase tracking-widest mb-2">System User Access Token</label>
            <input type="password" placeholder="EAAI..." className="w-full bg-[#050505] border border-white/[0.1] rounded-lg px-4 py-3 text-[14px] text-white focus:outline-none focus:border-white/[0.3] transition-all" />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-[11px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Webhook Verify Token</label>
          <div className="bg-[#050505] border border-white/[0.05] rounded-lg px-4 py-3 text-[14px] text-neutral-500 font-mono">
            Configurado en el servidor vía variable de entorno <code className="text-neutral-400">WA_VERIFY_TOKEN</code>
          </div>
          <p className="text-[12px] text-neutral-500 mt-2">El token se configura en el entorno del servidor, nunca se expone al cliente. Cópialo desde tu panel de configuración de infraestructura.</p>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/[0.05]">
          <button className="bg-white text-black hover:bg-neutral-200 px-6 py-3 rounded-lg text-[13px] font-semibold transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

