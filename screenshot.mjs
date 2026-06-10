/**
 * screenshot.mjs — Melatoz visual review tool
 * Usage: node screenshot.mjs [--section=hero|products|benefits|steps|faq|contact|full]
 *
 * Spins up a local file server, takes screenshots at 5 breakpoints,
 * saves them to screenshots/ and opens them in Preview.
 */

import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const DIR   = fileURLToPath(new URL('.', import.meta.url));
const PORT  = 7788;
const OUT   = join(DIR, 'screenshots');
if (!existsSync(OUT)) mkdirSync(OUT);

// ── Breakpoints ────────────────────────────────────────────────
const VIEWPORTS = [
  { name: 'mobile-390',  width: 390,  height: 844 },
  { name: 'mobile-430',  width: 430,  height: 932 },
  { name: 'tablet-768',  width: 768,  height: 1024 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440',width: 1440, height: 900 },
];

// ── Sections to scroll to ─────────────────────────────────────
const SECTIONS = {
  hero:     null,
  benefits: '#beneficios',
  products: '#productos',
  steps:    '#como-comprar',
  faq:      '#faq',
  contact:  '#contacto',
};

// ── Mime types ────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
  '.ico':  'image/x-icon',
};

// ── Local file server ─────────────────────────────────────────
function startServer() {
  return new Promise(resolve => {
    const server = createServer(async (req, res) => {
      let path = req.url.split('?')[0];
      if (path === '/') path = '/index.html';
      const filePath = join(DIR, path);
      try {
        const data = await readFile(filePath);
        const mime = MIME[extname(filePath).toLowerCase()] || 'text/plain';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(PORT, () => {
      console.log(`  Server: http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

// ── Main ──────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const sectionArg = args.find(a => a.startsWith('--section='))?.split('=')[1] ?? 'full';
const openArg    = !args.includes('--no-open');

async function run() {
  const server   = await startServer();
  const browser  = await chromium.launch();
  const taken    = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });

    // Block Google Fonts to avoid network delay
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**',   r => r.abort());
    // Block Supabase — use fallback products.js
    await page.route('https://*.supabase.co/**', r => r.abort());

    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200); // let JS + CSS settle

    // Force all reveal elements visible (IntersectionObserver doesn't fire in headless without real scroll)
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    });

    // Scroll through page to trigger lazy-loaded content, then back to top
    await page.evaluate(async () => {
      const step = 400;
      const total = document.body.scrollHeight;
      for (let y = 0; y < total; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(600);

    // Wait for products to render (either cards or empty state)
    await page.waitForFunction(() => {
      const grid = document.getElementById('products-grid');
      if (!grid) return true;
      const text = grid.textContent || '';
      return text.trim() !== '' && !text.includes('Cargando');
    }, { timeout: 5000 }).catch(() => {}); // don't fail if products don't load

    // Close cart drawer if open, close product modal if open
    await page.evaluate(() => {
      document.getElementById('cart-drawer')?.classList.remove('open');
      document.getElementById('cart-overlay')?.classList.remove('open');
      document.getElementById('pdm-modal')?.classList.remove('open');
      document.getElementById('pdm-overlay')?.classList.remove('open');
      document.body.style.overflow = '';
    });

    await page.waitForTimeout(300);

    if (sectionArg === 'full') {
      // Full-page screenshot
      const file = join(OUT, `full_${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      taken.push(file);
      console.log(`  ✓ full  [${vp.width}px] → screenshots/full_${vp.name}.png`);
    } else {
      // Sections: take viewport screenshots at each section
      const toShoot = sectionArg === 'all'
        ? Object.keys(SECTIONS)
        : [sectionArg];

      for (const sec of toShoot) {
        const selector = SECTIONS[sec];
        if (selector) {
          try {
            await page.locator(selector).scrollIntoViewIfNeeded();
            await page.waitForTimeout(200);
          } catch {}
        } else {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(200);
        }
        const file = join(OUT, `${sec}_${vp.name}.png`);
        await page.screenshot({ path: file });
        taken.push(file);
        console.log(`  ✓ ${sec.padEnd(9)} [${vp.width}px] → screenshots/${sec}_${vp.name}.png`);
      }
    }

    await page.close();
  }

  await browser.close();
  server.close();

  if (openArg && taken.length > 0) {
    exec(`open ${taken.map(f => `"${f}"`).join(' ')}`);
    console.log(`\n  Opened ${taken.length} screenshots in Preview.`);
  }

  console.log('\n  Done.\n');
}

run().catch(e => { console.error(e); process.exit(1); });
