"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BorderBeam } from "@/components/ui/border-beam";
import NumberTicker from "@/components/ui/number-ticker";
import { MagneticButton } from "@/components/ui/magnetic-button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Background Particles Component (Aceternity style)
const Particles = () => {
  const container = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!container.current) return;
    const particles = container.current.children;
    gsap.set(particles, {
      x: "random(0, 100vw)",
      y: "random(0, 100vh)",
      opacity: "random(0.1, 0.4)",
      scale: "random(0.5, 1.5)",
    });

    gsap.to(particles, {
      y: "-=100vh",
      x: "+=random(-50, 50)",
      duration: "random(15, 25)",
      ease: "none",
      repeat: -1,
      modifiers: {
        y: gsap.utils.unitize((y) => parseFloat(y) % window.innerHeight)
      }
    });
  }, []);

  return (
    <div ref={container} className="fixed inset-0 z-[1] pointer-events-none overflow-hidden mix-blend-screen opacity-50">
      {[...Array(40)].map((_, i) => (
        <div key={i} className="absolute w-1 h-1 bg-indigo-400 rounded-full blur-[1px]"></div>
      ))}
    </div>
  );
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leads, setLeads] = useState(250);
  const [ticket, setTicket] = useState(1500);
  const lostRevenue = Math.floor(leads * 0.4) * ticket;

  useGSAP(() => {
    // Scroll Reveals
    gsap.from(".reveal-up", {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".reveal-up-trigger",
        start: "top 80%",
      }
    });

    gsap.from(".bento-card", {
      y: 80,
      opacity: 0,
      scale: 0.95,
      stagger: 0.1,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".bento-trigger",
        start: "top 75%",
      }
    });

    // Chat Simulator Animation
    const chatTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".chat-container",
        start: "top 60%",
      }
    });

    chatTl
      .to(".chat-msg-1", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
      .to(".typing-a-1", { opacity: 1, y: 0, duration: 0.3 }, "+=0.6")
      .to(".typing-a-1", { opacity: 0, duration: 0.2 }, "+=1.8")
      .to(".chat-msg-2", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
      .to(".terminal-log-1", { opacity: 1, x: 0, duration: 0.3 }, "-=0.2")
      .to(".terminal-log-2", { opacity: 1, x: 0, duration: 0.3 }, "+=0.5")
      .to(".terminal-log-3", { opacity: 1, x: 0, duration: 0.3 }, "+=0.2")
      .to(".typing-u-1", { opacity: 1, y: 0, duration: 0.3 }, "+=1.0")
      .to(".typing-u-1", { opacity: 0, duration: 0.2 }, "+=1.5")
      .to(".chat-msg-3", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
      .to(".terminal-log-4", { opacity: 1, x: 0, duration: 0.3 }, "-=0.2")
      .to(".typing-a-2", { opacity: 1, y: 0, duration: 0.3 }, "+=0.8")
      .to(".typing-a-2", { opacity: 0, duration: 0.2 }, "+=1.5")
      .to(".chat-msg-4", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
      .to(".terminal-log-5", { opacity: 1, x: 0, duration: 0.3 }, "-=0.2");

  }, { scope: containerRef });

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-black text-[#ededed] font-sans overflow-x-hidden selection:bg-indigo-500/30"
    >
      <Particles />

      {/* GLOBAL BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] mix-blend-screen" style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)' }}></div>
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vw] bg-indigo-500/[0.04] rounded-[100%] blur-[120px]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.04] bg-[#000000]/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-4 h-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-sm shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-shadow"></div>
            <span className="font-semibold tracking-wide text-[13px] text-white">AXIOM</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-neutral-400">
            <a href="#architecture" className="hover:text-white transition-colors">Infraestructura</a>
            <a href="#simulator" className="hover:text-white transition-colors">Motor</a>
            <a href="#roi" className="hover:text-white transition-colors">ROI</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-[13px] font-medium text-neutral-400 hover:text-white transition-colors">Login</a>
            <MagneticButton>
              <a href="#contact" className="block text-[12px] font-medium bg-white text-black px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Solicitar Acceso
              </a>
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 w-full pt-48 pb-24 flex flex-col items-center justify-center text-center px-6">
        <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-[12px] font-medium text-indigo-300 mb-8 backdrop-blur-sm shadow-[inset_0_0_15px_rgba(99,102,241,0.05)]">
          <span className="flex w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
          Orquestación Autónoma de Ventas B2B
        </div>
        
        <h1 className="text-5xl md:text-[80px] font-medium tracking-tight mb-6 leading-[1.05] max-w-5xl">
          El costo oculto de las <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 via-white to-neutral-400">
            horas no laborables.
          </span>
        </h1>
        
        <p className="text-[17px] md:text-[20px] text-neutral-400 max-w-2xl mb-10 leading-relaxed font-light">
          Infraestructura de ingeniería dura para cerrar ventas mientras duermes. Tus clientes compran a las 23:00hs, AXIOM les vende en 1.2 segundos.
        </p>
        
        <div className="flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-indigo-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-full pointer-events-none"></div>
          <MagneticButton>
            <a href="#contact" className="block relative z-10 bg-white text-black text-[14px] font-medium px-8 py-3.5 rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Evaluar Escalabilidad
            </a>
          </MagneticButton>
        </div>
      </section>

      {/* --- HERO 3D MOCKUP (WITH BORDER BEAM & BUSINESS COPY) --- */}
      <section className="relative z-20 w-full pb-40 flex justify-center px-6 perspective-[2000px]">
        <div className="relative w-full max-w-5xl h-[300px] md:h-[500px] border border-white/[0.05] bg-[#020202]/80 backdrop-blur-2xl rounded-2xl md:rounded-3xl shadow-[0_40px_100px_-20px_rgba(99,102,241,0.15)] overflow-hidden transform rotate-x-[12deg] rotate-y-[-2deg] rotate-z-[1deg] hover:rotate-x-0 hover:rotate-y-0 hover:rotate-z-0 transition-transform duration-1000 ease-out group">
          
          <BorderBeam size={300} duration={12} delay={9} colorFrom="#818cf8" colorTo="#c084fc" />

          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/[0.02] to-transparent"></div>
          <div className="h-12 border-b border-white/[0.04] bg-white/[0.01] flex items-center px-4 md:px-6 gap-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-48 md:w-64 h-6 bg-white/[0.03] border border-white/[0.04] rounded flex items-center justify-center text-[10px] text-neutral-500 font-mono tracking-widest">AXIOM_REVENUE_DASHBOARD</div>
            </div>
            <div className="w-[34px]"></div>
          </div>

          <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 h-full">
            <div className="col-span-1 md:col-span-2 flex flex-col gap-4 md:gap-6">
              <div className="flex-1 bg-white/[0.02] border border-white/[0.03] rounded-xl relative overflow-hidden group-hover:border-indigo-500/20 transition-colors duration-700 p-6 flex flex-col">
                <div className="text-[12px] font-mono text-neutral-400 mb-6 uppercase tracking-widest">Leads Rescatados Fuera de Horario</div>
                <div className="w-full flex-1 flex items-end justify-between px-2 pb-6 relative">
                  {[{d:'L',v:4}, {d:'M',v:6}, {d:'M',v:3}, {d:'J',v:8}, {d:'V',v:5}, {d:'S',v:9}, {d:'D',v:7}].map((item, i) => (
                    <div key={i} className="w-[10%] bg-indigo-500/30 rounded-t-sm relative group-hover:bg-indigo-500/50 transition-colors flex flex-col items-center justify-start" style={{ height: `${item.v * 10}%` }}>
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                      <span className="absolute -top-6 text-[10px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity">+{item.v}</span>
                      <span className="absolute -bottom-6 text-[10px] text-neutral-500 font-mono">{item.d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:flex col-span-1 flex-col gap-6">
               <div className="flex-1 bg-white/[0.02] border border-white/[0.03] rounded-xl p-6 flex flex-col justify-center">
                 <div className="text-[11px] font-mono text-neutral-500 mb-2 uppercase">Tiempo Promedio de Respuesta</div>
                 <div className="text-4xl text-white font-medium">1.2<span className="text-lg text-neutral-500 ml-1">segundos</span></div>
                 <div className="text-[12px] text-emerald-400 mt-2 flex items-center gap-1">
                   <span>↓ 98% más rápido que humanos</span>
                 </div>
               </div>
               <div className="flex-1 bg-white/[0.02] border border-white/[0.03] rounded-xl p-6">
                  <div className="text-[11px] font-mono text-neutral-500 mb-4 uppercase">Capital Recuperado</div>
                  <div className="text-3xl text-white font-medium flex items-center gap-2">
                    $<NumberTicker value={65400} />
                  </div>
                  <div className="w-full bg-white/[0.05] h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-3/4 h-full"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INTEGRATIONS BAR --- */}
      <section className="relative z-10 w-full pb-32 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center border-y border-white/[0.04] py-10 bg-white/[0.01]">
          <p className="text-[11px] text-neutral-500 font-mono tracking-widest uppercase mb-8">Integración Nativa Sin Fricción</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-opacity duration-700">
            <div className="text-xl font-bold tracking-tight flex items-center gap-2"><span className="text-green-500">W</span> WhatsApp</div>
            <div className="text-xl font-bold tracking-tight flex items-center gap-2"><span className="text-blue-500">C</span> Calendly</div>
            <div className="text-xl font-bold tracking-tight flex items-center gap-2"><span className="text-purple-500">S</span> SurrealDB</div>
            <div className="text-xl font-bold tracking-tight flex items-center gap-2"><span className="text-orange-500">T</span> Temporal</div>
          </div>
        </div>
      </section>

      {/* --- ARCHITECTURE BENTO GRID --- */}
      <section id="architecture" className="bento-trigger relative z-10 w-full py-32 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 max-w-2xl reveal-up">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">Ingeniería que no pide disculpas.</h2>
            <p className="text-neutral-400 text-[16px] font-light leading-relaxed">
              No somos un wrapper glorificado de OpenAI. Construimos el backend con los mismos lenguajes y bases de datos que soportan la infraestructura global moderna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bento-card bg-[#050505] border border-white/[0.06] rounded-2xl p-8 hover:bg-[#080808] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] group-hover:bg-orange-500/10 transition-colors"></div>
              <div className="w-10 h-10 border border-white/10 bg-white/[0.02] rounded-lg mb-6 flex items-center justify-center text-orange-400 font-mono text-[10px]">.rs</div>
              <h3 className="text-lg font-medium text-white mb-3">Motor en Rust</h3>
              <p className="text-neutral-500 text-[14px] font-light leading-relaxed">
                Concurrencia extrema. 0 pausas de recolección de basura. Respuestas en milisegundos bajo picos masivos de tráfico.
              </p>
            </div>
            
            <div className="bento-card bg-[#050505] border border-white/[0.06] rounded-2xl p-8 hover:bg-[#080808] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="w-10 h-10 border border-white/10 bg-white/[0.02] rounded-lg mb-6 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-blue-400 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium text-white mb-3">Temporal.io</h3>
              <p className="text-neutral-500 text-[14px] font-light leading-relaxed">
                Ejecución duradera. Si un servicio externo colapsa, la transacción se congela y retoma donde quedó. Cero ventas perdidas.
              </p>
            </div>

            <div className="bento-card bg-[#050505] border border-white/[0.06] rounded-2xl p-8 hover:bg-[#080808] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] group-hover:bg-purple-500/10 transition-colors"></div>
              <div className="w-10 h-10 border border-white/10 bg-white/[0.02] rounded-lg mb-6 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-400" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-3">Aislamiento por Tenant</h3>
              <p className="text-neutral-500 text-[14px] font-light leading-relaxed">
                Tus datos, prompts y leads están aislados criptográficamente por Namespace en SurrealDB. Seguridad B2B nivel banco.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- HYBRID SIMULATOR (CHAT + TERMINAL) --- */}
      <section id="simulator" className="relative z-10 w-full py-32 bg-[#020202] border-y border-white/[0.04] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 max-w-2xl text-center mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-6">Velocidad táctica en el punto de contacto.</h2>
            <p className="text-neutral-400 text-[16px] font-light leading-relaxed">
              La magia a la izquierda, la ingeniería a la derecha. Así es como AXIOM intercepta un lead a las 3:00 AM y despacha un cierre de ventas en menos de 2 segundos.
            </p>
          </div>
          
          <div className="chat-container flex flex-col lg:flex-row gap-6 items-stretch h-auto lg:min-h-[480px]">
            {/* WHATSAPP CHAT */}
            <div className="flex-1 bg-[#050505] border border-white/[0.08] rounded-xl p-6 relative overflow-hidden flex flex-col">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-6 pb-4 border-b border-white/[0.04]">Simulación Frontend (WhatsApp)</div>
              
              <div className="flex-1 flex flex-col justify-end gap-4 text-[13px]">
                <div className="chat-msg-1 opacity-0 translate-y-4 flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center shrink-0">U</div>
                  <div className="bg-[#111] text-neutral-300 rounded-xl rounded-tl-none p-3 border border-white/[0.04]">
                    Tienen disponibilidad para implementar en una empresa de 50 empleados esta semana?
                  </div>
                </div>
                
                <div className="typing-a-1 opacity-0 flex items-center gap-2 text-neutral-500 bg-[#111] w-fit p-2 rounded-xl rounded-tl-none border border-white/[0.04]">
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                </div>

                <div className="chat-msg-2 opacity-0 translate-y-4 flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center shrink-0">A</div>
                  <div className="bg-indigo-500/10 text-indigo-100 rounded-xl rounded-tl-none p-3 border border-indigo-500/20">
                    Sí, tenemos un bloque de implementación libre el jueves. Para 50 empleados, el plan Enterprise cubre todo. Te genero el link de reserva?
                  </div>
                </div>

                <div className="typing-u-1 opacity-0 flex items-center gap-2 text-neutral-500 bg-[#111] w-fit p-2 rounded-xl rounded-tl-none border border-white/[0.04]">
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                </div>

                <div className="chat-msg-3 opacity-0 translate-y-4 flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center shrink-0">U</div>
                  <div className="bg-[#111] text-neutral-300 rounded-xl rounded-tl-none p-3 border border-white/[0.04]">
                    Perfecto, pasámelo.
                  </div>
                </div>

                <div className="typing-a-2 opacity-0 flex items-center gap-2 text-neutral-500 bg-[#111] w-fit p-2 rounded-xl rounded-tl-none border border-white/[0.04]">
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                </div>

                <div className="chat-msg-4 opacity-0 translate-y-4 flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center shrink-0">A</div>
                  <div className="bg-indigo-500/10 text-indigo-100 rounded-xl rounded-tl-none p-3 border border-indigo-500/20 flex flex-col gap-2">
                    Listo. Aquí tienes tu acceso exclusivo para agendar el Setup:
                    <div className="bg-black/50 border border-white/10 rounded p-2 text-center hover:bg-white/5 cursor-pointer transition-colors text-blue-400">
                      🗓️ Agendar en Calendly
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* TERMINAL LOG */}
            <div className="flex-1 bg-[#050505] border border-white/[0.08] rounded-xl p-6 relative overflow-hidden flex flex-col font-mono text-[11px] md:text-[12px]">
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-6 pb-4 border-b border-white/[0.04]">Infraestructura Backend (Rust)</div>
              
              <div className="flex-1 flex flex-col justify-end gap-2 text-neutral-400">
                <div className="terminal-log-1 opacity-0 -translate-x-4 flex gap-3"><span className="text-emerald-400">RECV</span><span>POST /webhook/meta (wamid_12x98y)</span></div>
                <div className="terminal-log-2 opacity-0 -translate-x-4 flex gap-3"><span className="text-blue-400">EXEC</span><span>Verify HMAC-SHA256: OK (0.1ms)</span></div>
                <div className="terminal-log-3 opacity-0 -translate-x-4 flex gap-3"><span className="text-purple-400">SPWN</span><span>Temporal Workflow: Start IntentAnalyzer</span></div>
                <div className="terminal-log-4 opacity-0 -translate-x-4 flex gap-3"><span className="text-indigo-400">RAG </span><span>Context: "Enterprise Plan / 50 seats"</span></div>
                <div className="terminal-log-5 opacity-0 -translate-x-4 flex gap-3 text-white"><span className="text-emerald-500">DONE</span><span>Booking Link Generated. Latency: 1.22s</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MINIMALIST ROI CALCULATOR --- */}
      <section id="roi" className="relative z-10 w-full py-32 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">Calcula la fuga de capital.</h2>
          <p className="text-neutral-400 text-[16px] font-light leading-relaxed mb-16">
            El 40% de los leads se enfrían por falta de seguimiento. Mueve los controles para ver el impacto en tu facturación.
          </p>

          <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-12 items-center">
            
            <div className="flex-1 w-full flex flex-col gap-10 text-left">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] text-neutral-500 font-mono uppercase tracking-widest">Leads Mensuales</label>
                  <span className="text-[14px] font-mono text-white bg-white/[0.05] border border-white/10 px-3 py-1 rounded">{leads}</span>
                </div>
                <input 
                  type="range" min="50" max="1000" step="10" 
                  value={leads} onChange={(e) => setLeads(Number(e.target.value))} 
                  className="w-full h-[2px] bg-neutral-800 rounded-none appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] text-neutral-500 font-mono uppercase tracking-widest">Ticket Promedio (USD)</label>
                  <span className="text-[14px] font-mono text-white bg-white/[0.05] border border-white/10 px-3 py-1 rounded">${ticket}</span>
                </div>
                <input 
                  type="range" min="100" max="10000" step="100" 
                  value={ticket} onChange={(e) => setTicket(Number(e.target.value))} 
                  className="w-full h-[2px] bg-neutral-800 rounded-none appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <div className="w-[1px] h-32 bg-white/10 hidden md:block"></div>
            <div className="w-full h-[1px] bg-white/10 block md:hidden"></div>

            <div className="flex-1 w-full flex flex-col items-center justify-center text-center">
              <div className="text-[11px] text-neutral-500 font-mono uppercase tracking-widest mb-4">Pérdida Mensual Estimada</div>
              <div className="text-[56px] font-medium text-white tracking-tight leading-none mb-4 flex items-center">
                $<NumberTicker value={lostRevenue} />
              </div>
              <p className="text-[13px] text-neutral-400 font-light">
                Capital que AXIOM recuperaría operando 24/7.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section id="contact" className="relative z-10 w-full min-h-[80vh] pt-[200px] pb-48 bg-black flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_50%)] pointer-events-none"></div>
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 relative z-10">
          Implementación Selectiva.
        </h2>
        <p className="text-neutral-400 text-[17px] mb-12 max-w-lg leading-relaxed font-light relative z-10">
          Para garantizar latencia cero, habilitamos infraestructura dedicada solo para un volumen controlado de organizaciones.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md relative z-10">
          <input 
            type="email" 
            placeholder="Correo corporativo" 
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-5 py-3 text-[14px] text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-neutral-600"
          />
          <MagneticButton>
            <button className="bg-white text-black font-medium px-8 py-3 rounded-lg text-[14px] hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Solicitar
            </button>
          </MagneticButton>
        </div>
        <p className="text-[11px] text-neutral-600 mt-6 font-mono tracking-widest uppercase relative z-10">Analizaremos la viabilidad técnica antes de la sesión.</p>
      </section>

      {/* --- FOOTER --- */}
      <footer className="w-full border-t border-white/[0.04] bg-[#020202] py-8 flex justify-center relative z-10">
        <p className="text-[11px] text-neutral-600 font-mono tracking-widest uppercase">AXIOM Systems © 2026</p>
      </footer>
    </main>
  );
}
