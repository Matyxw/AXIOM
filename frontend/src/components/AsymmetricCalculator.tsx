"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AsymmetricCalculator() {
  const [leads, setLeads] = useState(5000);
  const [ticket, setTicket] = useState(250);

  // Matemáticas del sangrado
  const latencyLossRate = 0.12; // 12% caen por latencia > 3s
  const webhookFailRate = 0.03; // 3% fallan silenciosamente en Zapier/Make
  const slowResponseRate = 0.25; // 25% no compran porque tardaron > 5 min en responder
  
  const totalLostLeads = Math.floor(leads * (latencyLossRate + webhookFailRate + slowResponseRate));
  const moneyBled = totalLostLeads * ticket;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section className="w-full max-w-5xl mx-auto py-24 px-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-500/5 blur-[120px] pointer-events-none rounded-[100%]"></div>
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Lado Izquierdo: Controles */}
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-4">
              El costo de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">fricción.</span>
            </h2>
            <p className="text-zinc-400 text-lg font-light leading-relaxed">
              No estás dejando de ganar. Estás perdiendo activamente. Calcula la hemorragia de tu infraestructura actual basada en métricas estándar de pérdida por latencia y caídas silenciosas.
            </p>
          </div>

          <div className="space-y-8 bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl shadow-[inset_0_0_20px_rgba(255,255,255,0.01)]">
            {/* Slider Leads */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium tracking-wide text-zinc-300 uppercase">Volumen de Leads / Mes</label>
                <span className="font-mono text-xl text-white">{leads.toLocaleString('en-US')}</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="50000" 
                step="500"
                value={leads}
                onChange={(e) => setLeads(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all"
              />
            </div>

            {/* Slider Ticket */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium tracking-wide text-zinc-300 uppercase">Ticket Promedio (LTV)</label>
                <span className="font-mono text-xl text-white">${ticket.toLocaleString('en-US')}</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="5000" 
                step="50"
                value={ticket}
                onChange={(e) => setTicket(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Lado Derecho: Display Matemático */}
        <motion.div 
          className="relative bg-[#050505] border border-red-500/20 rounded-3xl p-10 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.05)] group hover:border-red-500/40 transition-colors duration-500"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Grid de fondo tipo terminal */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444405_1px,transparent_1px),linear-gradient(to_bottom,#ef444405_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-center space-y-12">
            <div className="space-y-2">
              <h3 className="text-sm font-mono text-red-500/80 uppercase tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Dinero Sangrado Mensualmente
              </h3>
              <motion.div 
                key={moneyBled}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-medium tracking-tighter text-white"
                style={{ textShadow: "0 0 40px rgba(239,68,68,0.4)" }}
              >
                {formatCurrency(moneyBled)}
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-red-500/10">
              <div className="space-y-1">
                <p className="text-xs font-mono text-zinc-500 uppercase">Leads Perdidos</p>
                <p className="text-2xl font-medium text-zinc-200">{totalLostLeads.toLocaleString('en-US')}</p>
                <p className="text-xs text-zinc-600">Por fricción sistémica</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono text-zinc-500 uppercase">Tasa de Fallo Real</p>
                <p className="text-2xl font-medium text-zinc-200">40%</p>
                <p className="text-xs text-zinc-600">Sistemas asíncronos frágiles</p>
              </div>
            </div>

            <div className="pt-4">
              <button className="w-full py-4 px-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium tracking-wide hover:bg-red-500 hover:text-white transition-all duration-300">
                Frenar Hemorragia con Axiom
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
