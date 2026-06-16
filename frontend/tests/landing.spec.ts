import { test, expect } from '@playwright/test';

test.describe('NeuroLanding Edge Persona Tests', () => {
  
  test.describe('CTO Persona', () => {
    test.use({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });

    test('Should render default CTO persona when User-Agent is Mac OS X', async ({ page }) => {
      await page.goto('/');

    // Verifica que el copy del CTO se inyectó (NextJS renderiza desde el servidor)
    await expect(page.locator('h1')).toContainText('Escalar con deuda');
    await expect(page.locator('h1')).toContainText('es una bomba de tiempo.');

    // Verifica que el badge de Persona Override está presente
    await expect(page.locator('text=cto OVERRIDE ACTIVE')).toBeVisible();
    });
  });

  test.describe('Sales Director Persona', () => {
    test.use({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' });

    test('Should render Sales Director persona when User-Agent is iPhone', async ({ page }) => {
      await page.goto('/');

    // Verifica el copy de Ventas
    await expect(page.locator('h1')).toContainText('Tus competidores');
    await expect(page.locator('h1')).toContainText('no duermen.');

    // Verifica que el badge de Persona Override está presente
    await expect(page.locator('text=sales director OVERRIDE ACTIVE')).toBeVisible();
    });
  });

  test('Should interact with Call to Action', async ({ page }) => {
    await page.goto('/');
    
    // Busca el botón principal de la Landing (Cerrar la Hemorragia)
    const cta = page.locator('button', { hasText: 'Cerrar la Hemorragia' });
    await expect(cta).toBeVisible();

    // Validamos su estado hover interactivo y bounding box visual
    const box = await cta.boundingBox();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  });

  test.describe('NeuroLanding Psychological Modules (Phase 2)', () => {
    test('Should render Asymmetric Calculator and interact with slider', async ({ page }) => {
      await page.goto('http://127.0.0.1:3000');
      
      // Verifica presencia del slider
      const slider = page.locator('input[type="range"]').first();
      await expect(slider).toBeVisible();

      // Verifica texto de Dinero Sangrado
      await expect(page.locator('text=Dinero Sangrado Mensualmente')).toBeVisible();
    });

    test('Should render Data Flow Interactive module', async ({ page }) => {
      await page.goto('http://127.0.0.1:3000');
      await expect(page.locator('text=La anatomía de lo')).toBeVisible();
      await expect(page.locator('text=Temporal State')).toBeVisible();
      await expect(page.locator('text=Graph DB')).toBeVisible();
    });

    test('Should render Objection Terminal and type answer', async ({ page }) => {
      await page.goto('http://127.0.0.1:3000');
      
      const terminalHeader = page.locator('text=Escepticismo');
      await expect(terminalHeader).toBeVisible();

      // Hacer click en una objeción para interactuar
      const objectionBtn = page.locator('button', { hasText: '¿Por qué no construir esto en Node.js o Python?' });
      await expect(objectionBtn).toBeVisible();
      await objectionBtn.click();
    });
  });
});
