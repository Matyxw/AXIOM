# TEST E2E — NAVEGADOR SUBAGENTE AUTÓNOMO

> **INSTRUCCIÓN PARA EL AGENTE:**
> Al invocar `/test-e2e [Opcional: Ruta]`, debes detener tu razonamiento abstracto y lanzar inmediatamente un `browser_subagent`.

## 1. INSTRUCCIONES PARA EL SUBAGENTE
1. **URL:** Navega hacia `http://localhost:3000` (o la ruta especificada). Si el servidor no está encendido, debes correr `npm run dev` en background primero.
2. **Grabación:** Debes activar la grabación pasando el argumento `RecordingName = "axiom_ui_test"`.
3. **Comportamiento QA:** Pídele al subagente que actúe como un cliente B2B. Debe scrollear la landing page completa, verificar que las animaciones GSAP no estén rompiendo el layout, y probar clics en CTAs (Call to Actions).
4. **Reporte:** Cuando el subagente retorne, debes entregarle al usuario el video (`.webp`) renderizado en un Artifact, junto con un análisis despiadado sobre la latencia visual y la estética. Si el diseño se ve "barato", dilo sin anestesia.
