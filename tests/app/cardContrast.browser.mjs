import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { expect } = require('@playwright/test');

function contrast(first, second) {
  const luminance = rgb => {
    const linear = rgb.map(channel => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export async function checkCardContrast(page, card, openEditor, chooseCardTheme, artifacts) {
  const cases = await page.evaluate(async () => {
    const { CARD_THEMES, cardColorHex, cardDisplayPalette } = await import('/src/services/cardAppearance.js');
    const context = document.createElement('canvas').getContext('2d');
    const colors = new Map();
    const rgb = color => {
      if (!colors.has(color)) {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        colors.set(color, [...context.getImageData(0, 0, 1, 1).data].slice(0, 3));
      }
      return colors.get(color);
    };
    const cases = [];
    const keys = ['primary', 'accent', 'success', 'info'];
    for (const theme of CARD_THEMES) {
      const sourceColors = Object.entries(theme.tokens).filter(([key]) => key.startsWith('--color-')).map(([, value]) => value);
      for (const key of keys) {
        const background = cardColorHex(theme[key]);
        const palette = cardDisplayPalette(background, 'RPG', theme.value);
        cases.push({
          theme: theme.label, background, backgroundRgb: rgb(background),
          sourceColors, alternatives: sourceColors.map(rgb),
          metrics: keys.map(key => ({ key, original: theme[key], originalRgb: rgb(theme[key]), color: palette[key], rgb: rgb(palette[key]) })),
        });
      }
    }
    return cases;
  });
  for (const sample of cases) {
    let bestContrast = 1;
    for (const candidate of sample.alternatives) bestContrast = Math.max(bestContrast, contrast(sample.backgroundRgb, candidate));
    for (const metric of sample.metrics) {
      const label = sample.theme + ' ' + sample.background + ' ' + metric.key;
      assert.ok(contrast(sample.backgroundRgb, metric.rgb) >= Math.min(4.5, bestContrast) - 0.01, label + ': broj ostaje čitljiv');
      assert.ok(sample.sourceColors.includes(metric.color), label + ': boja dolazi iz odabrane teme');
      if (contrast(sample.backgroundRgb, metric.originalRgb) >= 4.5) assert.equal(metric.color, metric.original, label + ': čitljiva izvorna boja ostaje odabrana');
    }
  }

  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const editor = await openEditor();
    await chooseCardTheme(editor, 'Wireframe');
    await editor.getByLabel('Vlastita boja kartice', { exact: true }).fill('#d4d4d4');
    const preview = editor.locator('#gaming-card-preview');
    await expect(preview.locator('g > rect').first()).toHaveAttribute('fill', '#d4d4d4');
    const previewColors = await preview.locator('.card-playtime text:first-child, .card-metric text:first-child').evaluateAll(nodes => nodes.map(node => node.getAttribute('fill')));
    await preview.screenshot({ path: join(artifacts, 'wireframe-preview-' + width + '.png') });
    await editor.getByRole('button', { name: 'Spremi izgled', exact: true }).click();
    await expect(card.locator('g > rect').first()).toHaveAttribute('fill', '#d4d4d4');
    const cardColors = await card.locator('.card-playtime text:first-child, .card-metric text:first-child').evaluateAll(nodes => nodes.map(node => node.getAttribute('fill')));
    assert.deepEqual(cardColors, previewColors, 'Pregled i spremljena kartica koriste iste boje');
    const exported = await page.evaluate(async () => {
      const svg = document.querySelector('#gaming-card');
      const blob = await window.auditView().gamingCardRef.exportImage();
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      const root = svg.getBoundingClientRect();
      const scale = bitmap.width / root.width;
      const metrics = [];
      for (const node of svg.querySelectorAll('.card-playtime text:first-child, .card-metric text:first-child')) {
        const bounds = node.getBoundingClientRect();
        const pixels = context.getImageData(Math.floor((bounds.x - root.x) * scale), Math.floor((bounds.y - root.y) * scale), Math.ceil(bounds.width * scale), Math.ceil(bounds.height * scale)).data;
        let visiblePixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (Math.abs(pixels[i] - 212) + Math.abs(pixels[i + 1] - 212) + Math.abs(pixels[i + 2] - 212) > 60) visiblePixels++;
        }
        context.fillStyle = getComputedStyle(node).fill;
        context.fillRect(0, 0, 1, 1);
        metrics.push({ rgb: [...context.getImageData(0, 0, 1, 1).data].slice(0, 3), visiblePixels });
      }
      bitmap.close();
      return { type: blob.type, metrics };
    });
    assert.equal(exported.type, 'image/png');
    assert.equal(exported.metrics.length, 4);
    for (const metric of exported.metrics) {
      assert.ok(contrast([212, 212, 212], metric.rgb) >= 4.5, 'Wireframe broj ima dovoljan kontrast');
      assert.ok(metric.visiblePixels > 20, 'PNG sadrži vidljive piksele svakog broja');
    }
    const ready = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Preuzmi karticu', exact: true }).click();
    const download = await ready;
    assert.equal(await download.failure(), null);
    await download.saveAs(join(artifacts, 'wireframe-export-' + width + '.png'));
  }
  console.log('✓ Kontrast statistika: ' + cases.length + ' kombinacija paleta/podloga i Wireframe pregled/PNG na mobitelu i računalu');
}
