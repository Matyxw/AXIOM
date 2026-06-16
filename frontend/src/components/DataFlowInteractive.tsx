"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function DataFlowInteractive() {
  return (
    <section className="w-full max-w-6xl mx-auto py-32 px-6">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-6">
          La anatomía de lo <span className="text-indigo-400">Inquebrantable.</span>
        </h2>
        <p className="text-zinc-400 text-lg font-light max-w-2xl mx-auto">
          Un framework no escala. Una arquitectura distribuida sí. Sigue el flujo de un evento crítico a través de la infraestructura matemática.
        </p>
      </div>

      <div className="relative bg-[#050505] border border-white/[0.05] rounded-3xl p-8 md:p-16 overflow-hidden">
        {/* Fondo de grid técnico */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Node 1: WhatsApp */}
          <div className="relative flex flex-col items-center">
            <motion.div 
              className="w-20 h-20 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center relative z-10 backdrop-blur-xl"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(37,211,102,0.2)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </motion.div>
            <span className="mt-4 text-xs font-mono text-zinc-500 uppercase">1. Webhook Ingest</span>
          </div>

          {/* Path 1 */}
          <div className="hidden md:block flex-1 h-[1px] bg-gradient-to-r from-[#25D366]/30 to-orange-500/30 relative">
            <motion.div 
              className="absolute top-1/2 left-0 w-3 h-3 rounded-full bg-white shadow-[0_0_15px_#fff] -translate-y-1/2"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Node 2: Rust / Axum */}
          <div className="relative flex flex-col items-center">
            <motion.div 
              className="w-24 h-24 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center relative z-10 backdrop-blur-xl"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(249,115,22,0.2)" }}
            >
              <span className="text-orange-500 font-mono font-bold text-xl">.rs</span>
            </motion.div>
            <span className="mt-4 text-xs font-mono text-zinc-500 uppercase">2. Axum Engine</span>
          </div>

          {/* Path 2 */}
          <div className="hidden md:block flex-1 h-[1px] bg-gradient-to-r from-orange-500/30 to-blue-500/30 relative">
            <motion.div 
              className="absolute top-1/2 left-0 w-3 h-3 rounded-full bg-white shadow-[0_0_15px_#fff] -translate-y-1/2"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1.5 }}
            />
          </div>

          {/* Node 3: Temporal.io */}
          <div className="relative flex flex-col items-center">
            <motion.div 
              className="w-24 h-24 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center relative z-10 backdrop-blur-xl"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59,130,246,0.2)" }}
            >
              <div className="w-8 h-8 border-[3px] border-blue-500/50 border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
            <span className="mt-4 text-xs font-mono text-zinc-500 uppercase">3. Temporal State</span>
          </div>

          {/* Path 3 */}
          <div className="hidden md:block flex-1 h-[1px] bg-gradient-to-r from-blue-500/30 to-purple-500/30 relative">
            <motion.div 
              className="absolute top-1/2 left-0 w-3 h-3 rounded-full bg-white shadow-[0_0_15px_#fff] -translate-y-1/2"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 3 }}
            />
          </div>

          {/* Node 4: SurrealDB */}
          <div className="relative flex flex-col items-center">
            <motion.div 
              className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center relative z-10 backdrop-blur-xl"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168,85,247,0.2)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </motion.div>
            <span className="mt-4 text-xs font-mono text-zinc-500 uppercase">4. Graph DB</span>
          </div>

        </div>

        {/* Info Panel inferior */}
        <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="text-white font-medium mb-2">Ingesta Idempotente</h4>
            <p className="text-zinc-500 text-sm">Prevención de duplicados en &lt; 4ms vía validación criptográfica en memoria.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Resiliencia Autónoma</h4>
            <p className="text-zinc-500 text-sm">Si la IA falla, Temporal suspende el hilo, guarda el estado, y reintenta matemáticamente.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Data Multitenant</h4>
            <p className="text-zinc-500 text-sm">Separación dura a nivel de namespace. Tu data nunca toca la de otro cliente.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
