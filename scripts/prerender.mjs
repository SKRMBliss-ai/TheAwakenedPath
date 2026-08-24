// Post-build prerender: renders each content route with a real browser and
// writes the fully-rendered HTML to dist/<route>/index.html, so crawlers and
// AI answer-engines (GPTBot, ClaudeBot, PerplexityBot) — which don't run JS —
// see real per-page content, titles, canonicals and schema instead of the
// empty SPA shell. Firebase serves these static files before the `**` SPA
// rewrite. Uses puppeteer-core against the locally-installed Chrome (no
// Chromium download).
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 5199;

// Content / marketing routes worth prerendering. The Mind Gym app (/mindgym)
// and the separately-built portfolio (/twinsouls) are intentionally excluded.
const ROUTES = [
  '/',
  // The app itself. Prerendered only so crawlers get its own title/description/
  // canonical — without this it falls through to the SPA shell and reads as a
  // duplicate of the home page. Visitors still get the live app (createRoot
  // re-renders over whatever was baked in).
  '/mindgym',
  '/feelingsandemotioncourse',
  '/tiny-kids-transformations',
  '/tiny-kids-transformations/register',
  '/tiny-kids-transformations/flyer',
  '/knowyouremotionalhealth',
  '/aboutmindgym',
  '/policies',
  '/guides',
  '/guides/feelings-vs-emotions',
  '/guides/witness-consciousness-guide',
  '/guides/stopping-overthinking-naturally',
  '/guides/power-of-now-presence-guide',
  '/guides/why-do-i-overthink',
  '/guides/meditation-for-beginners',
  '/guides/how-to-stop-overthinking-at-night',
  '/guides/breaking-overthinking-anxiety-cycle',
  '/knowledge',
  '/glossary/presence',
  '/glossary/witness-consciousness',
  '/glossary/pain-body',
  '/glossary/somatic-tracking',
  '/videos/ep1-feelings-and-emotions',
  '/videos/ep2-art-of-witnessing',
];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.txt': 'text/plain', '.xml': 'application/xml', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

// Static file server over dist, with SPA fallback to index.html (mirrors the
// Firebase `**` rewrite) so every route boots the app.
function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        let filePath = join(DIST, urlPath);
        let s = existsSync(filePath) ? await stat(filePath) : null;
        if (s && s.isDirectory()) { filePath = join(filePath, 'index.html'); s = existsSync(filePath) ? await stat(filePath) : null; }
        if (!s) {
          if (extname(urlPath)) { res.writeHead(404); return res.end('not found'); }
          filePath = join(DIST, 'index.html'); // SPA fallback
        }
        const body = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(500); res.end('error');
      }
    });
    server.listen(PORT, () => resolve(server));
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return c;
  throw new Error('No Chrome/Edge found. Set CHROME_PATH env var.');
}

async function run() {
  const server = await startServer();
  const executablePath = findChrome();
  console.log('prerender: using browser at', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  let ok = 0, failed = 0;
  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle2', timeout: 30000 });
      // Wait until React has rendered substantial content into #root, OR until
      // usePageSeo has stamped this page's own canonical. Content routes hit the
      // first condition; app routes (which sit behind auth and never paint much
      // headless) hit the second — enough to give crawlers a correct, unique
      // title/description/canonical instead of the shared SPA shell.
      await page.waitForFunction(
        () => {
          const r = document.querySelector('#root');
          if (r && r.innerText.trim().length > 250) return true;
          return !!document.querySelector('link[rel="canonical"][data-seo-dynamic="1"]');
        },
        { timeout: 20000 },
      );
      // Give usePageSeo's effect a beat to inject title/canonical/JSON-LD.
      await new Promise((r) => setTimeout(r, 400));

      const html = '<!doctype html>\n' + await page.evaluate(() => document.documentElement.outerHTML);
      const outPath = route === '/'
        ? join(DIST, 'index.html')
        : join(DIST, route.replace(/^\//, ''), 'index.html');
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, html, 'utf-8');

      const title = await page.title();
      console.log(`  ✓ ${route.padEnd(42)} → ${title.slice(0, 60)}`);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${route} — ${e.message}`);
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log(`prerender: ${ok} ok, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

run().catch((e) => { console.error(e); process.exit(1); });
