"use client";

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleSwarm = () => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  // Parámetros de la nube espacial
  const count = 3000;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generar posiciones aleatorias y velocidades base
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  // Capturamos el mouse en un ref sin triggerear re-renders de React, directo al motor
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalizamos el mouse de -1 a 1 para Three.js
      mouse.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // El núcleo del motor físico que corre a 60-120 FPS
  useFrame((state) => {
    if (!mesh.current) return;

    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      
      // La partícula avanza en su matemática caótica
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      // Gravedad del mouse: Inercia hacia donde esté el puntero
      particle.mx += (mouse.current.x * 10 - particle.mx) * 0.01;
      particle.my += (mouse.current.y * 10 - particle.my) * 0.01;

      // Calcular posiciones
      dummy.position.set(
        (particle.mx / 10) + a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) + b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );

      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    
    // Anunciarle a WebGL que la matriz mutó
    mesh.current.instanceMatrix.needsUpdate = true;
    
    // Rotación sutil de la cámara general
    state.camera.position.x += (mouse.current.x * 5 - state.camera.position.x) * 0.02;
    state.camera.position.y += (-mouse.current.y * 5 - state.camera.position.y) * 0.02;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      {/* Geometría: Micro-cubos o Esferas (Cristales) */}
      <sphereGeometry args={[0.04, 8, 8]} />
      {/* Material Luminoso, el color se mezcla con el fondo */}
      <meshBasicMaterial color="#6366f1" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
};

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full">
      <Canvas camera={{ fov: 75, position: [0, 0, 40] }}>
        <ParticleSwarm />
      </Canvas>
    </div>
  );
}
