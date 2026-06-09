"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Aceternity/MagicUI Background Particles Component
const Particles = () => {
  const container = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!container.current) return;
    const particles = container.current.children;
    gsap.set(particles, {
      x: "random(0, 100vw)",
      y: "random(0, 100vh)",
      opacity: "random(0.1, 0.5)",
      scale: "random(0.5, 1.5)",
    });

    gsap.to(particles, {
      y: "-=100vh",
      x: "+=random(-100, 100)",
      duration: "random(10, 20)",
      ease: "none",
      repeat: -1,
      modifiers: {
        y: gsap.utils.unitize((y) => parseFloat(y) % window.innerHeight)
      }
    });
  }, []);

  return (
    <div ref={container} className="fixed inset-0 z-[1] pointer-events-none overflow-hidden mix-blend-screen opacity-40">
      {[...Array(30)].map((_, i) => (
        <div key={i} className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"></div>
      ))}
    </div>
  );
};

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const revenueRef = useRef<HTMLDivElement>(null);
  
  // --- STATE ---
  const [leads, setLeads] = useState(100);
  const [ticket, setTicket] = useState(500);
  const lostRevenue = Math.floor(leads * 30 * 0.4) * ticket;

  // --- NAVIGATION HANDLERS ---
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTarget = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // MagicUI Number Ticker Effect
  useEffect(() => {
    if (revenueRef.current) {
      gsap.to(revenueRef.current, {
        innerHTML: lostRevenue,
        duration: 0.8,
        ease: "power2.out",
        snap: { innerHTML: 1 },
        onUpdate: function() {
          const val = Math.round(Number(this.targets()[0].innerHTML));
          this.targets()[0].innerHTML = `$${val.toLocaleString('en-US')}`;
        }
      });
    }
  }, [lostRevenue]);

  useGSAP(() => {
    // 1. HERO ANIMATION
    const tl = gsap.timeline();
    
    tl.to(".hero-nav", { y: 0, opacity: 1, duration: 1, ease: "power3.out" })
      .from(".hero-badge", { opacity: 0, scale: 0.8, duration: 1, ease: "back.out(1.5)" }, "-=0.5")
      .from(".hero-word", {
        y: 60,
        opacity: 0,
        scale: 0.9,
        stagger: 0.03,
        duration: 1,
        ease: "power4.out"
      }, "-=0.6")
      .from(".hero-desc", { opacity: 0, y: 20, duration: 1.5, ease: "power3.out" }, "-=0.6")
      .from(".hero-btn", { opacity: 0, y: 10, scale: 0.95, duration: 1, ease: "power3.out" }, "-=0.8")
      .from(".trusted-by", { opacity: 0, y: 10, duration: 1 }, "-=0.5");

    gsap.to(".hero-content-wrapper", {
      yPercent: 30,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // 2. CHAT SIMULATOR 
    gsap.fromTo(".chat-container", 
      { y: 100, scale: 0.95, opacity: 0 },
      { 
        y: 0, scale: 1, opacity: 1, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".product-section",
          start: "top 80%",
          end: "center center",
          scrub: 1
        }
      }
    );

    gsap.from(".chat-msg", {
      scrollTrigger: {
        trigger: ".chat-container",
        start: "top 60%",
      },
      y: 30,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: "power3.out"
    });

    // 3. ARCHITECTURE BENTO 
    gsap.from(".bento-item", {
      scrollTrigger: {
        trigger: ".architecture-section",
        start: "top 70%",
        end: "center center",
        scrub: 1
      },
      y: 80,
      opacity: 0,
      scale: 0.95,
      stagger: 0.1
    });

    // 4. ROI CALCULATOR
    gsap.from(".roi-title > *", {
      scrollTrigger: {
        trigger: ".roi-section",
        start: "top 75%",
      },
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: "power3.out"
    });

    gsap.to(".roi-box", {
      y: -30,
      scrollTrigger: {
        trigger: ".roi-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5
      }
    });

    // 5. TESTIMONIAL
    gsap.from(".testimonial-card", {
      scrollTrigger: {
        trigger: ".testimonial-section",
        start: "top 70%",
        end: "center center",
        scrub: 1
      },
      scale: 0.95,
      y: 40,
      opacity: 0
    });

    // Magnetic Button Effect setup
    const buttons = document.querySelectorAll('.magnetic-btn');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e: any) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width/2) * 0.3;
        const y = (e.clientY - rect.top - rect.height/2) * 0.3;
        gsap.to(btn, { x, y, duration: 0.3, ease: "power2.out" });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      });
    });

  }, { scope: container });

  const splitText = (text: string, isGradient: boolean = false) => {
    return text.split(" ").map((word, i) => (
      <span key={i} className="inline-block overflow-hidden pb-2 align-bottom">
        <span className={`hero-word inline-block origin-bottom ${isGradient ? 'text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500' : 'text-white'}`}>
          {word}&nbsp;
        </span>
      </span>
    ));
  };

  return (
    <main ref={container} className="bg-[#000000] text-[#ededed] font-sans overflow-x-hidden selection:bg-neutral-800 selection:text-white relative">
      
      <Particles />
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center items-start overflow-hidden">
        <div className="absolute top-[-20%] w-[100vw] h-[60vw] bg-white/[0.015] rounded-[100%] blur-[120px]"></div>
      </div>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none mix-blend-screen" style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)' }}></div>
      
      <nav className="hero-nav opacity-0 -translate-y-5 fixed top-0 z-50 w-full border-b border-white/[0.04] bg-[#000000]/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo - Scroll to Top */}
          <div onClick={scrollToTop} className="font-semibold tracking-tight text-[14px] flex items-center gap-2 text-white cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-white to-neutral-400 rounded-[3px] shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
            AXIOM
          </div>
          {/* Action Link - Scroll to Form */}
          <a href="#contact" onClick={(e) => scrollToTarget(e, 'contact')} className="text-[13px] font-medium text-neutral-300 hover:text-white transition-colors">
            Solicitar Acceso
          </a>
        </div>
      </nav>

      <section className="hero-section relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20 pb-10 z-10">
        <div className="hero-content-wrapper w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
          
          <div className="hero-badge inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.02] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] backdrop-blur-sm px-3 py-1.5 text-[12px] font-medium text-neutral-400 mb-8 cursor-default hover:bg-white/[0.05] transition-colors duration-500">
            Agentes de conversión B2B
          </div>
          
          <h1 className="text-6xl md:text-[88px] font-medium tracking-tight mb-6 leading-[1.05] flex flex-wrap justify-center max-w-4xl">
            {splitText("El costo oculto de")}
            <br className="hidden md:block"/>
            {splitText("las horas no laborables.", true)}
          </h1>
          
          <p className="hero-desc text-[17px] md:text-[19px] text-neutral-400 max-w-2xl mb-12 leading-relaxed font-light">
            Tus clientes toman decisiones a las 22:00hs. Tu equipo atiende a las 09:00hs. AXIOM cubre la brecha: un motor en Rust que agenda y cobra 24/7.
          </p>
          
          <div className="hero-btn flex flex-col sm:flex-row items-center gap-4 mb-20 z-20 relative">
            <a href="#roi" onClick={(e) => scrollToTarget(e, 'roi')} className="magnetic-btn relative overflow-hidden rounded-lg bg-white text-black text-[14px] font-semibold px-8 py-3.5 hover:bg-neutral-200 transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] flex items-center gap-2 group">
              <span className="relative z-10 flex items-center gap-2">
                Ver métricas de fuga
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </span>
            </a>
          </div>

          <div className="trusted-by w-full max-w-3xl border-t border-white/[0.04] pt-8 mt-4 overflow-hidden relative">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-6 text-left">Auditado e implementado por empresas líderes</p>
            <div className="flex gap-12 items-center opacity-40 mix-blend-screen grayscale">
              <div className="text-xl font-black tracking-tighter hover:text-white transition-colors duration-500 cursor-default">ACME.CORP</div>
              <div className="text-xl font-serif italic hover:text-white transition-colors duration-500 cursor-default">NovaGlobal</div>
              <div className="text-xl font-bold uppercase tracking-widest hover:text-white transition-colors duration-500 cursor-default">Stratos</div>
              <div className="text-xl font-mono hover:text-white transition-colors duration-500 cursor-default">/OASIS</div>
              <div className="text-xl font-medium tracking-tight hover:text-white transition-colors duration-500 cursor-default">LUMINA</div>
            </div>
          </div>

        </div>
      </section>

      <section id="product" className="product-section relative z-20 w-full min-h-screen flex flex-col items-center justify-center py-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-5xl mx-auto px-6 relative">
          <div className="chat-container relative w-full rounded-2xl border border-white/[0.08] bg-[#050505]/80 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden flex flex-col">
            
            <div className="h-12 border-b border-white/[0.04] bg-white/[0.01] flex items-center justify-between px-5 relative z-10">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700/50"></div>
              </div>
              <div className="text-[11px] font-mono tracking-widest text-neutral-500 uppercase">Log: axiom_runtime_p0</div>
              <div className="w-10"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 h-auto min-h-[500px] relative z-10 bg-transparent">
              <div className="hidden md:flex flex-col border-r border-white/[0.04] bg-[#020202]/50 p-6 col-span-1 text-[12px]">
                <div className="text-[10px] font-mono text-neutral-600 mb-3 uppercase tracking-widest">Profile</div>
                <div className="text-neutral-300 mb-2 flex items-center justify-between"><span>Origin</span> <span className="text-neutral-500">IG_AD</span></div>
                <div className="text-neutral-300 mb-2 flex items-center justify-between"><span>Score</span> <span className="text-emerald-400">89/100</span></div>
                <div className="text-neutral-300 mb-8 flex items-center justify-between"><span>Time</span> <span className="text-neutral-500">23:45</span></div>
                
                <div className="text-[10px] font-mono text-neutral-600 mb-3 uppercase tracking-widest">Execution</div>
                <div className="text-neutral-300 mb-2 flex items-center justify-between"><span>Tactic</span> <span className="text-neutral-500">Bypass</span></div>
                <div className="text-neutral-300 mb-2 flex items-center justify-between"><span>Status</span> <span className="text-white flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active</span></div>
              </div>
              
              <div className="col-span-1 md:col-span-3 flex flex-col justify-end p-8 bg-transparent relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-6 max-w-xl text-[14px] font-sans">
                  
                  <div className="chat-msg flex items-start gap-4">
                    <div className="w-7 h-7 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[11px] text-neutral-400 shrink-0 shadow-sm">U</div>
                    <div className="bg-[#111111]/80 border border-white/[0.04] text-neutral-300 rounded-2xl rounded-tl-sm px-5 py-3.5 leading-relaxed font-light shadow-sm">
                      El servicio se ve bien, pero $3,500 de setup me parece elevado en comparación con otras propuestas. Lo vamos a pensar.
                    </div>
                  </div>
                  
                  <div className="chat-msg flex items-start gap-4">
                    <div className="w-7 h-7 rounded-md bg-white border border-white flex items-center justify-center text-[11px] text-black font-semibold shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.2)]">A</div>
                    <div className="text-neutral-200 px-1 py-1 leading-relaxed font-light">
                      Entiendo perfectamente. Es importante aclarar que nuestra infraestructura reduce el tiempo de implementación de 3 meses a 1 semana. <br/><br/>
                      Al priorizar calidad, solo admitimos a dos clientes nuevos este mes y cerramos cupos mañana a primera hora. ¿Deseas que genere el enlace de pago para asegurar el espacio de tu empresa, o prefieres dejarlo pasar?
                    </div>
                  </div>
                  
                  <div className="chat-msg flex items-start gap-4">
                    <div className="w-7 h-7 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[11px] text-neutral-400 shrink-0 shadow-sm">U</div>
                    <div className="bg-[#111111]/80 border border-white/[0.04] text-neutral-300 rounded-2xl rounded-tl-sm px-5 py-3.5 leading-relaxed font-light shadow-sm">
                      Es un buen punto lo de los tiempos. Mandame el link de pago y lo cerramos hoy mismo.
                    </div>
                  </div>

                  <div className="chat-msg flex items-start gap-4 pb-2">
                    <div className="w-7 h-7 rounded-md bg-white border border-white flex items-center justify-center text-[11px] text-black font-semibold shrink-0">A</div>
                    <div className="text-neutral-200 px-1 py-1 flex flex-col gap-3 font-light">
                      Decisión acertada. Aquí tienes el enlace de facturación segura.
                      <div className="chat-action relative overflow-hidden inline-flex items-center gap-3 border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.1] transition-colors rounded-xl px-5 py-3.5 text-[13px] text-white mt-2 w-fit cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] group">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]"></span>
                        <svg className="relative z-10" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
                        <span className="relative z-10">Pago de Setup ($3,500.00 USD)</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="architecture-section relative z-30 w-full min-h-screen flex flex-col items-center justify-center py-20 bg-[#000000]">
        <div className="max-w-5xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white">Ingeniería implacable, no simples prompts.</h2>
            <p className="text-neutral-400 text-[16px] mt-4 font-light">Diseñado nativamente para tolerancia a fallos y retención de memoria a largo plazo.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bento-item bg-[#050505] border border-white/[0.05] rounded-2xl p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.05] flex items-center justify-center mb-6">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <h3 className="text-white text-[16px] font-medium mb-2">Motor en Rust</h3>
              <p className="text-neutral-500 text-[14px] font-light leading-relaxed">Concurrencia extrema. 0 pausas de recolección de basura. Respuestas en milisegundos bajo picos masivos de tráfico.</p>
            </div>
            
            <div className="bento-item bg-[#050505] border border-white/[0.05] rounded-2xl p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.05] flex items-center justify-center mb-6">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <h3 className="text-white text-[16px] font-medium mb-2">Orquestación Temporal</h3>
              <p className="text-neutral-500 text-[14px] font-light leading-relaxed">Persistencia de estado. Si Meta o los LLMs colapsan, la transacción se congela y retoma exacto donde quedó. Cero ventas perdidas.</p>
            </div>
            
            <div className="bento-item bg-[#050505] border border-white/[0.05] rounded-2xl p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] relative overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.05] flex items-center justify-center mb-6 relative z-10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
              </div>
              <h3 className="text-white text-[16px] font-medium mb-2 relative z-10">Aislamiento Criptográfico</h3>
              <p className="text-neutral-500 text-[14px] font-light leading-relaxed relative z-10">Seguridad B2B. Sus datos comerciales, prompts y leads están aislados por namespace mediante SurrealDB.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="roi" className="roi-section relative z-40 w-full min-h-screen border-y border-white/[0.03] flex flex-col items-center justify-center py-20 overflow-hidden bg-[#020202]">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <div className="roi-title flex-1 w-full">
              <h2 className="text-4xl md:text-[48px] font-medium tracking-tight text-white mb-6 leading-[1.1]">
                Cuantificando la pérdida <br/><span className="text-neutral-500">de oportunidades.</span>
              </h2>
              <p className="text-neutral-400 text-[17px] leading-relaxed mb-12 max-w-lg font-light">
                Basado en datos de la industria, el 40% de los leads originados en campañas digitales se enfrían por falta de seguimiento inmediato.
              </p>
              
              <div className="flex flex-col gap-10 max-w-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[12px] text-neutral-400 font-medium uppercase tracking-widest">Volumen Mensual</label>
                    <span className="text-[14px] font-mono text-white bg-neutral-900 px-3 py-1 rounded-md border border-white/10">{leads * 30} leads</span>
                  </div>
                  <input type="range" min="10" max="1000" step="10" value={leads} onChange={(e) => setLeads(Number(e.target.value))} className="w-full h-[2px] bg-neutral-800 rounded-none appearance-none cursor-pointer accent-white"/>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[12px] text-neutral-400 font-medium uppercase tracking-widest">Ticket Promedio</label>
                    <span className="text-[14px] font-mono text-white bg-neutral-900 px-3 py-1 rounded-md border border-white/10">${ticket.toLocaleString('en-US')}</span>
                  </div>
                  <input type="range" min="100" max="10000" step="100" value={ticket} onChange={(e) => setTicket(Number(e.target.value))} className="w-full h-[2px] bg-neutral-800 rounded-none appearance-none cursor-pointer accent-white"/>
                </div>
              </div>
            </div>

            <div className="roi-box w-full lg:w-[480px] bg-[#050505]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-10 relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.04)_0%,transparent_50%)] pointer-events-none"></div>
              
              <h3 className="text-neutral-500 text-[11px] font-mono mb-4 uppercase tracking-[0.15em] relative z-10">Fuga de Capital (Mensual)</h3>
              
              <div ref={revenueRef} className="text-[56px] font-medium text-white tracking-tight mb-8 leading-none relative z-10">
                ${lostRevenue.toLocaleString('en-US')}
              </div>
              
              <div className="w-full h-[1px] bg-gradient-to-r from-white/[0.1] to-transparent my-6 relative z-10"></div>
              
              <p className="text-[14px] text-neutral-400 leading-relaxed font-light relative z-10">
                Este es el capital que no ingresa a tu empresa por demoras. <strong className="text-white font-normal">AXIOM absorbe esta cuota</strong> interactuando con tus clientes de forma nativa e instantánea.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      <section className="testimonial-section relative z-50 w-full min-h-screen flex flex-col items-center justify-center py-20 bg-[#000000] overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <div className="testimonial-card relative bg-[#020202] border border-white/[0.05] rounded-3xl p-10 md:p-16 text-center shadow-[inset_0_0_100px_rgba(255,255,255,0.02)] overflow-hidden">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_80%)] pointer-events-none"></div>

            <svg className="absolute top-8 left-8 text-neutral-800 w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
            <p className="text-[20px] md:text-[24px] font-light text-neutral-300 leading-relaxed mb-8 relative z-10">
              "Teníamos un embudo roto. Nuestros vendedores tardaban 2 horas en responder consultas de $5,000 USD. Implementamos AXIOM y en el primer mes <strong className="text-white font-medium">recuperamos $65,000 que antes se perdían por demoras nocturnas.</strong> No es un bot, es infraestructura crítica comercial."
            </p>
            <div className="flex flex-col items-center relative z-10">
              <div className="w-12 h-12 rounded-full bg-neutral-800 border border-white/10 mb-3 flex items-center justify-center text-[12px] text-white">RC</div>
              <div className="text-[14px] font-medium text-white">Roberto C.</div>
              <div className="text-[12px] text-neutral-500 font-mono mt-1">CEO @ Stratos Consulting</div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="cta-section relative w-full min-h-screen flex flex-col items-center justify-center bg-[#050505] overflow-hidden border-t border-white/[0.03] py-20 z-[60]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02)_0%,transparent_60%)] pointer-events-none"></div>
        
        <div className="cta-content max-w-2xl mx-auto px-6 text-center flex flex-col items-center relative z-10 w-full">
          
          <h2 className="text-4xl md:text-[56px] font-medium tracking-tight text-white mb-6">
            Implementación Selectiva.
          </h2>
          
          <p className="text-neutral-400 text-[17px] mb-12 max-w-lg leading-relaxed font-light">
            Para mantener el estándar de calidad, habilitamos infraestructura dedicada solo para un número controlado de organizaciones.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-md group" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Correo Corporativo" className="flex-1 w-full bg-[#000000] border border-white/[0.1] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] rounded-lg px-5 py-4 text-[14px] text-white focus:outline-none focus:border-white/[0.3] transition-all" />
            <button type="submit" className="magnetic-btn w-full sm:w-auto bg-white text-black font-semibold px-8 py-4 rounded-lg text-[14px] hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Solicitar Evaluación
            </button>
          </form>
          
          <p className="text-[12px] text-neutral-500 mt-8 max-w-sm leading-relaxed font-light">
            Analizaremos la escalabilidad técnica de sus operaciones previo a la agendación de la sesión.
          </p>
        </div>
      </section>
      
      <footer className="w-full border-t border-white/[0.03] bg-black py-8 flex justify-center relative z-[70]">
        <p className="text-[11px] text-neutral-600 font-mono tracking-widest uppercase">AXIOM Systems © 2026</p>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </main>
  );
}
