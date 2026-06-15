"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Page() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Seguimiento dinámico del mouse para el spotlight radial
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animaciones de Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } 
    },
  };

  // Parallax scroll
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* 1. MOTOR DE ILUMINACIÓN Y TEXTURA */}
      
      {/* SVG Noise Grain (La textura táctil) */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Spotlight Radial del Mouse */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.07), transparent 40%)`,
        }}
      ></div>

      {/* Grid de fondo arquitectónico hyper-sutil */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* MAIN CONTENT CANVAS */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        
        <motion.div 
          className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto pt-32 pb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ y: yHero, opacity: opacityHero }}
        >
          {/* Badge Elevado */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.01] px-4 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
              <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">Motor Orquestador B2B</span>
            </div>
          </motion.div>

          {/* TÍTULO HERO (Tipografía Extrema) */}
          <motion.h1 
            variants={itemVariants}
            className="text-center text-[12vw] sm:text-[100px] md:text-[140px] font-medium leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-800"
          >
            Orquestación<br />
            <span className="text-zinc-500 italic font-serif opacity-80 tracking-normal pr-4">autónoma</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="mt-12 max-w-2xl text-center text-lg md:text-xl font-light text-zinc-500 leading-relaxed"
          >
            El costo oculto de las horas no laborables desaparece. Construido sobre un motor concurrente en Rust, aislando cada byte de tus clientes B2B.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-12 flex flex-col sm:flex-row items-center gap-6">
            <button className="group relative overflow-hidden rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <span className="relative z-10 font-medium text-white tracking-wide">Desplegar Instancia</span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-pulse"></div>
            </button>
            <button className="font-medium text-zinc-500 transition-colors duration-300 hover:text-white">
              Leer Documentación
            </button>
          </motion.div>
        </motion.div>

        {/* 4. INTEGRACIONES MAGNÉTICAS (Glassmorphism Píldoras) */}
        <motion.div 
          className="w-full max-w-5xl mx-auto py-24 [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-6">
            {['WhatsApp Cloud API', 'SurrealDB', 'Temporal.io', 'Calendly', 'Stripe'].map((tech, i) => (
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

        {/* 5. ARQUITECTURA (Tarjetas Físicas Suspendidas) */}
        <div className="w-full max-w-6xl mx-auto py-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="group relative overflow-hidden rounded-3xl border border-white/[0.03] bg-[#050505] p-10 hover:border-white/10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-colors duration-700"
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
            className="group relative overflow-hidden rounded-3xl border border-white/[0.03] bg-[#050505] p-10 hover:border-white/10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-colors duration-700"
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
            className="group relative overflow-hidden rounded-3xl border border-white/[0.03] bg-[#050505] p-10 hover:border-white/10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-colors duration-700"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/0 blur-[80px] group-hover:bg-purple-500/10 transition-colors duration-1000 rounded-full"></div>
            <div className="relative z-10">
              <div className="mb-12 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.01] shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] group-hover:border-white/20 transition-all duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500/60 group-hover:text-purple-400 transition-colors duration-500" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <h3 className="mb-4 text-2xl font-medium tracking-tight text-zinc-100">Isolación Criptográfica</h3>
              <p className="text-zinc-500 leading-relaxed font-light">
                Separación por namespaces en SurrealDB. La fuga de datos entre inquilinos (Tenants) es matemáticamente imposible.
              </p>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
