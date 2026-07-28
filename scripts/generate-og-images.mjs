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
    eyebrow: 'SOULFUL INTELLIGENCE STUDIO',
    title: 'Where Soul Meets Intelligence',
    subtitle: 'Mind Gym · Guided Courses · Free Tools & Practices',
    tag: 'skrmblissai.in'
  },
  {
    filename: 'course.png',
    eyebrow: '7-EPISODE GUIDED COURSE',
    title: 'Understanding Feelings & Emotions',
    subtitle: 'Break the pattern. Live with clarity & somatic presence.',
    tag: 'Sim Katyal & Soulful Intelligence Studio'
  },
  {
    filename: 'mindgym.png',
    eyebrow: 'DAILY PRACTICE APP',
    title: 'Mind Gym',
    subtitle: 'A quieter mind, one 5-minute practice at a time.',
    tag: 'Mindfulness & Witness Journaling'
  },
  {
    filename: 'quiz.png',
    eyebrow: '2-MINUTE SELF-ASSESSMENT',
    title: 'Know Your Emotional Health',
    subtitle: 'Evaluate your emotional awareness, stress, & presence patterns.',
    tag: 'Free Assessment · skrmblissai.in'
  },
  {
    filename: 'guides.png',
    eyebrow: 'MINDFULNESS & PRESENCE',
    title: 'Guides & Knowledge Hub',
    subtitle: 'Authoritative guides on overthinking, presence, & emotional freedom.',
    tag: 'Soulful Intelligence Studio'
  },
  {
    filename: 'guide-feelings-vs-emotions.png',
    eyebrow: 'SOULFUL INTELLIGENCE · GUIDE',
    title: 'Feelings vs Emotions: The Guide to Inner Freedom',
    subtitle: 'Discover the crucial difference between raw somatic feelings & mental emotional loops.',
    tag: 'Emotional Intelligence'
  },
  {
    filename: 'guide-witness-consciousness-guide.png',
    eyebrow: 'SOULFUL INTELLIGENCE · GUIDE',
    title: 'Witness Consciousness: The Seat of the Observer',
    subtitle: 'Learn to abide as calm awareness behind thoughts & heavy emotions.',
    tag: 'Presence & Eckhart Tolle Teachings'
  },
  {
    filename: 'guide-stopping-overthinking-naturally.png',
    eyebrow: 'SOULFUL INTELLIGENCE · GUIDE',
    title: 'How to Stop Overthinking: 5 Somatic Rituals',
    subtitle: 'Simple, actionable rituals to quiet racing thoughts and settle your nervous system.',
    tag: 'Overthinking & Somatic Healing'
  },
  {
    filename: 'guide-power-of-now-presence-guide.png',
    eyebrow: 'SOULFUL INTELLIGENCE · GUIDE',
    title: 'The Power of Now: Practices for Daily Presence',
    subtitle: 'Practical exercises inspired by Eckhart Tolle & Michael Singer for everyday life.',
    tag: 'Presence & Mindfulness'
  },
  {
    filename: 'guide-why-do-i-overthink.png',
    eyebrow: 'SOULFUL INTELLIGENCE · GUIDE',
    title: 'Why Do I Overthink Everything?',
    subtitle: 'The neuroscience & psychological mechanics behind chronic overthinking.',
    tag: 'Mind & Mental Clarity'
  },
  {
    filename: 'guide-meditation-for-beginners.png',
    eyebrow: 'SOULFUL INTELLIGENCE · GUIDE',
    title: 'Meditation for Beginners: A Gentle Guide',
    subtitle: 'No rigid rules. Learn how to sit with yourself with ease & self-compassion.',
    tag: 'Meditation & Breathwork'
  },
  {
    filename: 'guide-how-to-stop-overthinking-at-night.png',
    eyebrow: 'SOULFUL INTELLIGENCE · GUIDE',
    title: 'How to Stop Overthinking at Night',
    subtitle: '4 somatic steps to calm bedtime racing thoughts & achieve restful sleep.',
    tag: 'Sleep & Nighttime Calming'
  }
];

function generateHtml(spec) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    background: radial-gradient(circle at 80% 20%, #251635 0%, #0C0910 65%, #050407 100%);
    color: #F4F1EA;
    font-family: 'Outfit', sans-serif;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify: space-between;
    padding: 60px 70px;
  }

  /* Subtle border frame */
  .frame {
    position: absolute;
    top: 20px; left: 20px; right: 20px; bottom: 20px;
    border: 1px solid rgba(196, 145, 58, 0.22);
    border-radius: 20px;
    pointer-events: none;
  }

  /* Sacred Geometry Decorative Motif background */
  .motif {
    position: absolute;
    right: -80px;
    bottom: -80px;
    width: 440px;
    height: 440px;
    opacity: 0.07;
    pointer-events: none;
  }

  .motif-top {
    position: absolute;
    left: -100px;
    top: -100px;
    width: 380px;
    height: 380px;
    opacity: 0.05;
    pointer-events: none;
  }

  /* Content area */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }

  .brand-badge {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #C4913A 0%, #E6C57D 50%, #8A611E 100%);
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(196, 145, 58, 0.3);
  }

  .logo-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #0C0910;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #E6C57D;
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    font-size: 20px;
  }

  .brand-name {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.22em;
    color: #E6C57D;
    text-transform: uppercase;
  }

  .eyebrow-pill {
    background: rgba(196, 145, 58, 0.12);
    border: 1px solid rgba(230, 197, 125, 0.3);
    color: #E6C57D;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 999px;
  }

  .main {
    margin-top: 40px;
    margin-bottom: auto;
    z-index: 10;
    max-width: 1000px;
  }

  .title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 54px;
    font-weight: 500;
    line-height: 1.12;
    color: #FDFAF4;
    letter-spacing: -0.01em;
    margin-bottom: 20px;
    text-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }

  .subtitle {
    font-size: 20px;
    line-height: 1.5;
    color: rgba(244, 241, 234, 0.78);
    font-weight: 400;
    max-width: 860px;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 22px;
    z-index: 10;
  }

  .domain {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: rgba(230, 197, 125, 0.9);
    text-transform: uppercase;
  }

  .tag {
    font-size: 12px;
    font-weight: 500;
    color: rgba(244, 241, 234, 0.5);
    letter-spacing: 0.08em;
  }
</style>
</head>
<body>
  <div class="frame"></div>

  <!-- Sacred Geometry SVG motifs -->
  <svg class="motif-top" viewBox="0 0 200 200" fill="none" stroke="#C4913A" stroke-width="0.8">
    <circle cx="100" cy="100" r="90" />
    <circle cx="100" cy="100" r="60" />
    <polygon points="100,10 178,145 22,145" />
    <polygon points="100,190 178,55 22,55" />
  </svg>

  <svg class="motif" viewBox="0 0 200 200" fill="none" stroke="#E6C57D" stroke-width="0.8">
    <circle cx="100" cy="100" r="95" />
    <circle cx="100" cy="100" r="70" />
    <circle cx="100" cy="100" r="45" />
    <polygon points="100,5 182,150 18,150" />
    <polygon points="100,195 182,50 18,50" />
  </svg>

  <div class="header">
    <div class="brand-badge">
      <div class="logo-icon"><div class="logo-inner">SI</div></div>
      <div class="brand-name">Soulful Intelligence Studio</div>
    </div>
    <div class="eyebrow-pill">${spec.eyebrow}</div>
  </div>

  <div class="main">
    <h1 class="title">${spec.title}</h1>
    <p class="subtitle">${spec.subtitle}</p>
  </div>

  <div class="footer">
    <div class="domain">https://www.skrmblissai.in</div>
    <div class="tag">${spec.tag}</div>
  </div>
</body>
</html>`;
}

async function main() {
  await mkdir(PUBLIC_OG, { recursive: true });
  const executablePath = findChrome();
  console.log('Generating OG images using browser at:', executablePath);

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
    // Small pause to allow web fonts to render
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 400));

    const rawBuffer = await page.screenshot({ type: 'png' });
    await page.close();

    // Compress with sharp to ensure crisp PNG under 300KB
    const finalPng = await sharp(rawBuffer)
      .resize(1200, 630)
      .png({ compressionLevel: 8, palette: true })
      .toBuffer();

    const outPath = join(PUBLIC_OG, spec.filename);
    await writeFile(outPath, finalPng);
    console.log(`  ✓ Generated public/og/${spec.filename} (${(finalPng.length / 1024).toFixed(1)} KB)`);
  }

  await browser.close();
  console.log('OG image generation complete!');
}

main().catch(err => {
  console.error('OG Image Generation Failed:', err);
  process.exit(1);
});
