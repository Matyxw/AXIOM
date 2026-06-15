"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import dynamic from 'next/dynamic';

// WebGL Background lazy loaded para no penalizar el FCP (First Contentful Paint)
const ParticleBackground = dynamic(() => import('./ParticleBackground'), {
  ssr: false,
});

interface NeuroLandingProps {
  persona: string;
}

export default function NeuroLandingClient({ persona }: NeuroLandingProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } 
    },
  };

  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // A/B Testing Dinámico: Muta el copy según la decisión del servidor Edge
  const getCopy = () => {
    switch(persona) {
      case 'cto':
        return {
          title: "Escalar con deuda",
          subtitle: "es una bomba de tiempo.",
          description: "La deuda técnica de automatizaciones atadas con alambre (Zapier/Make) se paga con downtime. Migrá a infraestructura orquestada en Rust y Temporal.io."
        };
      case 'sales_director':
        return {
          title: "Tus competidores",
          subtitle: "no duermen.",
          description: "Estás perdiendo el 40% de tus ventas potenciales fuera del horario comercial. Detenemos la hemorragia hoy mismo con orquestación B2B autónoma."
        };
      default:
        return {
          title: "Orquestación B2B",
          subtitle: "inquebrantable.",
          description: "Infraestructura matemática para escalar operaciones B2B sin error humano."
        };
    }
  };

  const copy = getCopy();

  return (
    <div className="relative min-h-screen bg-black overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* EL LÍMITE ABSOLUTO: WebGL Particles 3D (Renderizado GPU) */}
      <ParticleBackground />

      {/* SVG Noise Grain */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.05), transparent 40%)`,
        }}
      ></div>

      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        
        <motion.div 
          className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto pt-32 pb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ y: yHero, opacity: opacityHero }}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse"></span>
              <span className="text-xs font-medium uppercase tracking-widest text-indigo-300">{persona.replace('_', ' ')} OVERRIDE ACTIVE</span>
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-center text-[10vw] sm:text-[90px] md:text-[110px] font-medium leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-800"
          >
            {copy.title}<br />
            <span className="text-zinc-500 italic font-serif opacity-80 tracking-normal pr-4">{copy.subtitle}</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="mt-12 max-w-2xl text-center text-lg md:text-xl font-light text-zinc-400 leading-relaxed"
          >
            {copy.description}
          </motion.p>

          <motion.div variants={itemVariants} className="mt-16 flex flex-col sm:flex-row items-center gap-8 relative">
            <div className="absolute inset-0 -z-10 bg-indigo-500/20 blur-[100px] rounded-full"></div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-full border border-indigo-400/30 bg-indigo-500/10 px-10 py-5 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-indigo-400/80 hover:bg-indigo-500/20 hover:shadow-[0_0_60px_rgba(99,102,241,0.4)]"
            >
              <span className="relative z-10 font-semibold text-indigo-100 tracking-wide text-lg flex items-center gap-3">
                Cerrar la Hemorragia
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform duration-300"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-[spin_3s_linear_infinite]"></div>
            </motion.button>
            <button className="font-medium text-zinc-500 transition-colors duration-300 hover:text-zinc-300 text-sm tracking-wide">
              Auditoría de Conversión Gratuita
            </button>
          </motion.div>
        </motion.div>

        {/* INTEGRACIONES MAGNÉTICAS */}
        <motion.div 
          className="w-full max-w-5xl mx-auto py-24 [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-6">
            {['WhatsApp Cloud API', 'SurrealDB', 'Temporal.io', 'Calendly', 'Stripe'].map((tech) => (
              <motion.div 
                key={tech}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="rounded-full border border-white/[0.04] bg-white/[0.01] px-6 py-3 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-white/10 hover:bg-white/[0.03] cursor-default transition-colors duration-500"
              >
                <span className="text-sm font-medium tracking-wide text-zinc-500 transition-colors duration-500 hover:text-zinc-200">{tech}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ARQUITECTURA */}
        <div className="w-full max-w-6xl mx-auto py-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="group relative overflow-hidden rounded-3xl border border-white/[0.03] bg-[#050505]/80 backdrop-blur-md p-10 hover:border-white/10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-colors duration-700"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/0 blur-[80px] group-hover:bg-orange-500/10 transition-colors duration-1000 rounded-full"></div>
            <div className="relative z-10">
              <div className="mb-12 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.01] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] group-hover:border-white/20 transition-all duration-500 text-orange-500 font-mono text-sm">
                .rs
              </div>
              <h3 className="mb-4 text-2xl font-medium tracking-tight text-zinc-100">Motor Rust</h3>
              <p className="text-zinc-500 leading-relaxed font-light">
                Cero pausas de Garbage Collection. Tu infraestructura procesa miles de leads simultáneos con latencia garantizada en milisegundos.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl border border-white/[0.03] bg-[#050505]/80 backdrop-blur-md p-10 hover:border-white/10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-colors duration-700"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/0 blur-[80px] group-hover:bg-blue-500/10 transition-colors duration-1000 rounded-full"></div>
            <div className="relative z-10">
              <div className="mb-12 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.01] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] group-hover:border-white/20 transition-all duration-500">
                <div className="w-5 h-5 border-[3px] border-blue-500/50 border-t-transparent rounded-full animate-spin group-hover:border-blue-400 transition-colors duration-500"></div>
              </div>
              <h3 className="mb-4 text-2xl font-medium tracking-tight text-zinc-100">Temporal.io</h3>
              <p className="text-zinc-500 leading-relaxed font-light">
                Ejecución duradera. Las caídas de servicios externos no existen. El flujo de ventas se congela y retoma matemáticamente donde quedó.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl border border-white/[0.03] bg-[#050505]/80 backdrop-blur-md p-10 hover:border-white/10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-colors duration-700"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/0 blur-[80px] group-hover:bg-purple-500/10 transition-colors duration-1000 rounded-full"></div>
            <div className="relative z-10">
              <div className="mb-12 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.01] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] group-hover:border-white/20 transition-all duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500/60 group-hover:text-purple-400 transition-colors duration-500" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <h3 className="mb-4 text-2xl font-medium tracking-tight text-zinc-100">Fuga Imposible</h3>
              <p className="text-zinc-500 leading-relaxed font-light">
                Separación por namespaces criptográficos en SurrealDB. La confianza de tus clientes nivel Enterprise está asegurada matemáticamente.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
