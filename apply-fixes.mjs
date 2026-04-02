import fs from 'fs';

let content = fs.readFileSync('src/features/courses/wisdom-untethered/Chap1Question3.tsx', 'utf8');

const infographic = `const Infographic = ({ children, viewBox="0 0 400 400" }: { children: React.ReactNode, viewBox?: string }) => (
  <svg viewBox={viewBox} style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1', display: 'block', overflow: 'visible' }}>
    <defs>
      <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
        <feMerge>
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {children}
  </svg>
);

const SVG_COMPONENTS = [
  () => (
    <Infographic>
      <rect x="150" y="150" width="100" height="100" fill="none" stroke="var(--gold)" strokeWidth="4" filter="url(#neonGlow)"/>
      <circle cx="200" cy="200" r="10" fill="var(--gold)" />
      <path d="M 200 130 C 150 50, 250 50, 200 130" stroke="var(--text-primary)" fill="none" strokeWidth="2" opacity="0.6"/>
      <path d="M 200 270 C 150 350, 250 350, 200 270" stroke="var(--text-primary)" fill="none" strokeWidth="2" opacity="0.6"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">THE NARROW FRAME</text>
    </Infographic>
  ),
  () => (
    <Infographic>
      <circle cx="200" cy="200" r="80" fill="none" stroke="var(--text-primary)" strokeWidth="1" strokeDasharray="5 5" opacity="0.5"/>
      <circle cx="200" cy="200" r="30" fill="none" stroke="var(--gold)" strokeWidth="3" filter="url(#neonGlow)"/>
      <path d="M 50 200 Q 200 300 350 200 Q 200 100 50 200" fill="none" stroke="var(--gold)" strokeWidth="1.5" opacity="0.8"/>
      <circle cx="40" cy="80" r="2" fill="var(--gold)" opacity="0.8"/>
      <circle cx="320" cy="70" r="1.5" fill="var(--gold)" opacity="0.6"/>
      <circle cx="280" cy="340" r="2.5" fill="var(--gold)" opacity="0.4"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">A SMALL PLANET</text>
    </Infographic>
  ),
  () => (
    <Infographic>
      <circle cx="120" cy="200" r="40" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeDasharray="4 4" opacity="0.6"/>
      <circle cx="120" cy="200" r="10" fill="var(--text-primary)" opacity="0.4"/>
      <circle cx="280" cy="200" r="100" fill="none" stroke="var(--gold)" strokeWidth="3" filter="url(#neonGlow)"/>
      <circle cx="280" cy="200" r="20" fill="var(--gold)" opacity="0.8"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">THE WIDER VIEW</text>
    </Infographic>
  ),
  () => (
    <Infographic>
      <circle cx="200" cy="200" r="120" fill="none" stroke="var(--text-primary)" strokeWidth="1" strokeDasharray="2 8" opacity="0.3"/>
      <path d="M 200 80 L 200 180" stroke="var(--gold)" strokeWidth="4" filter="url(#neonGlow)"/>
      <path d="M 200 180 L 260 240" stroke="var(--gold)" strokeWidth="2" opacity="0.8"/>
      <circle cx="200" cy="200" r="10" fill="none" stroke="var(--text-primary)" strokeWidth="2"/>
      <circle cx="200" cy="200" r="4" fill="var(--gold)"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">THE ONE-SECOND SHIFT</text>
    </Infographic>
  ),
  () => (
    <Infographic>
      <rect x="150" y="100" width="100" height="150" fill="none" stroke="var(--text-primary)" strokeWidth="2" opacity="0.5"/>
      <path d="M 150 250 L 100 320 M 250 250 L 300 320" stroke="var(--text-primary)" strokeWidth="2" opacity="0.3"/>
      <circle cx="200" cy="175" r="40" fill="none" stroke="var(--gold)" strokeWidth="3" filter="url(#neonGlow)"/>
      <circle cx="200" cy="175" r="8" fill="var(--gold)"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">THE THRESHOLD</text>
    </Infographic>
  ),
  () => (
    <Infographic>
      <circle cx="200" cy="200" r="20" fill="var(--bg-primary)" stroke="var(--text-primary)" strokeWidth="2"/>
      <path d="M 200 220 Q 280 280 180 300 T 120 220 T 260 140 T 200 180" fill="none" stroke="var(--gold)" strokeWidth="2" strokeDasharray="5 5" opacity="0.7"/>
      <path d="M 200 180 Q 120 120 220 100 T 280 180 T 140 260 T 200 220" fill="none" stroke="var(--text-primary)" strokeWidth="2" opacity="0.5"/>
      <circle cx="200" cy="200" r="4" fill="var(--gold)" filter="url(#neonGlow)"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">ENDLESS ORBIT</text>
    </Infographic>
  ),
  () => (
    <Infographic>
      <path d="M 100 200 Q 150 150 200 200 T 300 200" fill="none" stroke="var(--text-primary)" strokeWidth="2" opacity="0.3" strokeDasharray="4 4"/>
      <path d="M 100 200 L 300 200" stroke="var(--gold)" strokeWidth="4" filter="url(#neonGlow)"/>
      <circle cx="200" cy="200" r="15" fill="var(--gold)" />
      <path d="M 200 150 L 200 185" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.8"/>
      <polygon points="195,180 205,180 200,190" fill="var(--text-primary)" opacity="0.8"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">DIRECTING FOCUS</text>
    </Infographic>
  ),
  () => (
    <Infographic>
      <circle cx="200" cy="200" r="20" fill="var(--gold)"/>
      <circle cx="200" cy="200" r="60" fill="none" stroke="var(--gold)" strokeWidth="3" opacity="0.8" filter="url(#subtleGlow)"/>
      <circle cx="200" cy="200" r="100" fill="none" stroke="var(--text-primary)" strokeWidth="1.5" opacity="0.5" strokeDasharray="8 4"/>
      <circle cx="200" cy="200" r="140" fill="none" stroke="var(--text-primary)" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 8"/>
      <path d="M 200 25 L 200 65 M 200 375 L 200 335 M 25 200 L 65 200 M 375 200 L 335 200" stroke="var(--gold)" strokeWidth="2" opacity="0.6"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">EXPANSION</text>
    </Infographic>
  ),
  () => (
    <Infographic>
      <circle cx="200" cy="200" r="100" fill="none" stroke="var(--gold)" strokeWidth="2" filter="url(#neonGlow)"/>
      <line x1="100" y1="200" x2="300" y2="200" stroke="var(--gold)" strokeWidth="1" opacity="0.5"/>
      <line x1="200" y1="100" x2="200" y2="300" stroke="var(--gold)" strokeWidth="1" opacity="0.5"/>
      <circle cx="200" cy="200" r="30" fill="var(--bg-primary)" stroke="var(--text-primary)" strokeWidth="3"/>
      <circle cx="200" cy="200" r="10" fill="var(--gold)" filter="url(#subtleGlow)"/>
      <text x="200" y="380" fill="var(--text-secondary)" textAnchor="middle" fontFamily="var(--serif)" fontSize="18" letterSpacing="4">PROFOUND STILLNESS</text>
    </Infographic>
  )
];\n\n`;

content = content.replace('interface Chap1Question3Props {', infographic + 'interface Chap1Question3Props {');
content = content.replace(/const ALL_SLIDES = \[[\s\S]*?\];/g, '');
content = content.replace(/ALL_SLIDES\.length/g, 'SVG_COMPONENTS.length');
content = content.replace(/ALL_SLIDES\[lightboxIndex\]/g, 'SVG_COMPONENTS[lightboxIndex]');

content = content.replace(/<img src=\{getImgPath\((.*?)\)\} alt=([^>]+) className=\{styles\.clickableImg\} \/>/g, (match, p1, p2) => {
  const match2 = p1.match(/Slide(\d)\.jpeg/);
  if (match2) {
    const i = parseInt(match2[1]) - 1;
    return `{SVG_COMPONENTS[${i}]()}`;
  }
  return match;
});

// Update lightboxImg rendering
content = content.replace(
  /<img src=\{getImgPath\(SVG_COMPONENTS\[lightboxIndex\]\)\} alt=\{\`Slide \$\{lightboxIndex \+ 1\}\`\} \/>/g,
  '{SVG_COMPONENTS[lightboxIndex]()}'
);

content = content.replace(/const getImgPath = \(name: string\) => `\/WisdomUntethered\/Chap1\/Question3\/\$\{isDark \? '' : 'Light\/'\}\$\{name\}`;/g, '');


fs.writeFileSync('src/features/courses/wisdom-untethered/Chap1Question3.tsx', content);
