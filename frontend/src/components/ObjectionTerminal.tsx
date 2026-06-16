"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const OBJECTIONS = [
  {
    id: 1,
    question: "¿Por qué no construir esto en Node.js o Python?",
    answer: "Porque el I/O intensivo destruye el Event Loop de Node bajo concurrencia extrema. Python sufre por el GIL. Rust garantiza seguridad de memoria sin Garbage Collector, ofreciendo latencias predecibles sub-milísegundo vitales para webhooks B2B."
  },
  {
    id: 2,
    question: "¿Qué pasa si Meta/WhatsApp se cae temporalmente?",
    answer: "Temporal.io abstrae el tiempo. Si la API de Meta responde con 503, el Worker suspende la ejecución, serializa el estado, y reintenta con backoff exponencial. Cero pérdida de estado. Cero colas SQS rotas."
  },
  {
    id: 3,
    question: "¿Cómo garantizan el multi-tenant y la seguridad de datos?",
    answer: "No usamos PostgreSQL con claves foráneas simuladas. Usamos SurrealDB con segregación dura de Namespaces por tenant. A nivel de infraestructura, un tenant no puede leer los nodos del grafo de otro. Aislamiento criptográfico."
  }
];

export default function ObjectionTerminal() {
  const [activeObjection, setActiveObjection] = useState<number | null>(null);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (activeObjection === null) return;
    
    const targetText = OBJECTIONS.find(o => o.id === activeObjection)?.answer || "";
    setTypedText("");
    setIsTyping(true);
    
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(targetText.substring(0, i));
      i++;
      if (i > targetText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20); // Velocidad de typeo

    return () => clearInterval(interval);
  }, [activeObjection]);

  return (
    <section className="w-full max-w-4xl mx-auto py-24 px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-6">
          Escepticismo <span className="text-green-500">Arquitectónico.</span>
        </h2>
        <p className="text-zinc-400 text-lg font-light">
          No creas en promesas de marketing. Exige respuestas de ingeniería. Ejecuta las objeciones más duras en la terminal.
        </p>
      </div>

      <div className="bg-[#050505] border border-green-500/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.05)] font-mono">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a0a] border-b border-green-500/20">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          <span className="ml-4 text-xs text-zinc-500">root@axiom-architecture:~</span>
        </div>

        {/* Terminal Body */}
        <div className="p-6 md:p-10 space-y-8 min-h-[400px]">
          {/* Opciones */}
          <div className="space-y-4">
            <p className="text-zinc-500 text-sm mb-4">Seleccione vector de ataque lógico:</p>
            {OBJECTIONS.map((obj) => (
              <button
                key={obj.id}
                onClick={() => setActiveObjection(obj.id)}
                className={`block w-full text-left px-4 py-3 rounded border transition-all ${
                  activeObjection === obj.id 
                    ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                    : 'bg-transparent border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="text-green-500 mr-2">$</span> {obj.question}
              </button>
            ))}
          </div>

          {/* Respuesta (Output) */}
          <div className="mt-8 pt-8 border-t border-white/5 min-h-[120px]">
            {activeObjection ? (
              <div className="text-green-400 leading-relaxed">
                {typedText}
                <motion.span 
                  className="inline-block w-2 h-4 bg-green-400 ml-1 translate-y-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
              </div>
            ) : (
              <div className="text-zinc-600 italic">
                Esperando input del usuario...
                <motion.span 
                  className="inline-block w-2 h-4 bg-zinc-600 ml-1 translate-y-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
