import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_OG = join(__dirname, '..', 'public', 'og');

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

const OG_SPECS = [
  {
    filename: 'home.png',
    eyebrow: 'SOULFUL INTELLIGENCE',
    bigTitle: 'SOUL & INTELLECT',
    sub: 'Mind Gym · Guided Courses · Wellbeing',
    symbol: '✨'
  },
  {
    filename: 'course.png',
    eyebrow: '7-EPISODE GUIDED COURSE',
    bigTitle: 'FEELINGS & EMOTIONS',
    sub: 'Break the pattern. Live with clarity.',
    symbol: '🎬'
  },
  {
    filename: 'mindgym.png',
    eyebrow: 'DAILY PRACTICE APP',
    title: 'MIND GYM',
    bigTitle: 'MIND GYM',
    sub: 'Daily Mindfulness & Journaling App',
    symbol: '🧘'
  },
  {
    filename: 'quiz.png',
    eyebrow: '2-MINUTE SELF-ASSESSMENT',
    bigTitle: 'EMOTIONAL HEALTH',
    sub: 'Evaluate Your Awareness & Stress',
    symbol: '🌿'
  },
  {
    filename: 'guides.png',
    eyebrow: 'WISDOM & PRACTICE',
    bigTitle: 'KNOWLEDGE HUB',
    sub: 'Guides on Overthinking & Presence',
    symbol: '📚'
  },
  {
    filename: 'guide-feelings-vs-emotions.png',
    eyebrow: 'GUIDE',
    bigTitle: 'FEELINGS VS EMOTIONS',
    sub: 'The Guide to Inner Freedom',
    symbol: '⚡'
  },
  {
    filename: 'guide-witness-consciousness-guide.png',
    eyebrow: 'GUIDE',
    bigTitle: 'WITNESS CONSCIOUSNESS',
    sub: 'The Seat of the Observer',
    symbol: '👁️'
  },
  {
    filename: 'guide-stopping-overthinking-naturally.png',
    eyebrow: 'GUIDE',
    bigTitle: 'STOP OVERTHINKING',
    sub: '5 Somatic Presence Rituals',
    symbol: '🍃'
  },
  {
    filename: 'guide-power-of-now-presence-guide.png',
    eyebrow: 'GUIDE',
    bigTitle: 'THE POWER OF NOW',
    sub: 'Practices for Daily Presence',
    symbol: '☀️'
  },
  {
    filename: 'guide-why-do-i-overthink.png',
    eyebrow: 'GUIDE',
    bigTitle: 'WHY WE OVERTHINK',
    sub: 'Mind & Mental Clarity Guide',
    symbol: '🧠'
  },
  {
    filename: 'guide-meditation-for-beginners.png',
    eyebrow: 'GUIDE',
    bigTitle: 'MEDITATION 101',
    sub: 'Beginner\'s Guide to Meditation',
    symbol: '🕊️'
  },
  {
    filename: 'guide-how-to-stop-overthinking-at-night.png',
    eyebrow: 'GUIDE',
    bigTitle: 'OVERTHINKING AT NIGHT',
    sub: '4 Somatic Steps to Restful Sleep',
    symbol: '🌙'
  }
];

function generateHtml(spec) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Outfit:wght@700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    background: #FFFDF9;
    color: #1A120B;
    font-family: 'Outfit', sans-serif;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 50px;
  }

  /* Rich inner frame */
  .frame {
    position: absolute;
    top: 20px; left: 20px; right: 20px; bottom: 20px;
    border: 3px solid #C4913A;
    border-radius: 24px;
    pointer-events: none;
  }

  /* Center-focused emblem circle (Square-crop safe zone) */
  .center-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 900px;
    z-index: 10;
  }

  .badge-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #1C1326;
    color: #FFDF9E;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    padding: 8px 24px;
    border-radius: 999px;
    margin-bottom: 24px;
    box-shadow: 0 6px 20px rgba(28, 19, 38, 0.15);
  }

  .big-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 76px;
    font-weight: 700;
    line-height: 1.05;
    color: #1C1326;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .sub-title {
    font-size: 24px;
    font-weight: 700;
    color: #8C621E;
    letter-spacing: 0.04em;
  }

  /* Bottom watermark */
  .watermark {
    position: absolute;
    bottom: 34px;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.22em;
    color: #C4913A;
    text-transform: uppercase;
  }

  /* Decorative Sacred Geometry SVG background */
  .geo-bg {
    position: absolute;
    width: 520px;
    height: 520px;
    opacity: 0.08;
    pointer-events: none;
  }
</style>
</head>
<body>
  <div class="frame"></div>

  <svg class="geo-bg" viewBox="0 0 200 200" fill="none" stroke="#C4913A" stroke-width="1.5">
    <circle cx="100" cy="100" r="95" />
    <circle cx="100" cy="100" r="70" />
    <circle cx="100" cy="100" r="45" />
    <polygon points="100,5 182,150 18,150" />
    <polygon points="100,195 182,50 18,50" />
  </svg>

  <div class="center-card">
    <div class="badge-row">
      <span>${spec.symbol}</span>
      <span>${spec.eyebrow}</span>
    </div>
    <h1 class="big-title">${spec.bigTitle}</h1>
    <p class="sub-title">${spec.sub}</p>
  </div>

  <div class="watermark">SKRMBLISSAI.IN · SOULFUL INTELLIGENCE STUDIO</div>
</body>
</html>`;
}

async function main() {
  await mkdir(PUBLIC_OG, { recursive: true });
  const executablePath = findChrome();
  console.log('Generating Graphic-First Square-Safe OG images using browser at:', executablePath);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const spec of OG_SPECS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
    
    const html = generateHtml(spec);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 400));

    const rawBuffer = await page.screenshot({ type: 'png' });
    await page.close();

    const finalPng = await sharp(rawBuffer)
      .resize(1200, 630)
      .png({ compressionLevel: 8, palette: true })
      .toBuffer();

    const outPath = join(PUBLIC_OG, spec.filename);
    await writeFile(outPath, finalPng);
    console.log(`  ✓ Generated public/og/${spec.filename} (${(finalPng.length / 1024).toFixed(1)} KB)`);
  }

  await browser.close();
  console.log('Square-Safe Graphic OG image generation complete!');
}

main().catch(err => {
  console.error('OG Image Generation Failed:', err);
  process.exit(1);
});
