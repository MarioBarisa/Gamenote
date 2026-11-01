import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const banner = (await readFile('src/assets/newAssets/GamenoteBannerDarkMode.png')).toString('base64');
  await page.setContent(`<html><body style="margin:0;width:1200px;height:630px;background:#1d232a;color:#f5f6f8;font-family:Arial;display:flex;align-items:center;justify-content:center;text-align:center"><div><img src="data:image/png;base64,${banner}" style="width:500px"><h1 style="font-size:66px;margin:30px 0">Tvoj gaming dnevnik<span style="color:#F9461F">.</span></h1><p style="font-size:28px;color:#bfc4cd">Biblioteka · Bilješke · Napredak</p><p style="font-size:22px;color:#F9461F;margin-top:45px">gamenote.eu</p></div></body></html>`);
  await page.screenshot({ path: 'public/social-preview.png' });
} finally {
  await browser.close();
}
