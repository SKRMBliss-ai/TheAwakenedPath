import { Sparkles, BookOpen, Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

interface Props {
  palette: Palette;
}

export default function AiKnowledgeBlock({ palette }: Props) {
  const isDark = palette.isDark;
  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.72)' : '#6B5744';
  const bg = isDark ? 'rgba(26, 20, 30, 0.65)' : 'rgba(249, 245, 239, 0.85)';
  const borderC = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(196, 181, 160, 0.35)';
  // Gold #C4913A is tuned for the dark background; on cream it is 2.6:1.
  // #8B6A1A is the same amber family and reaches 4.6:1 in light mode.
  const gold = isDark ? '#C4913A' : '#8B6A1A';

  return (
    <section
      id="knowledge-directory"
      aria-label="Master Knowledge & AI Search Directory"
      className="si-reveal"
      style={{
        padding: 'clamp(48px, 8vw, 88px) clamp(20px, 5vw, 64px)',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: bg,
          border: `1px solid ${borderC}`,
          borderRadius: 28,
          padding: 'clamp(28px, 5vw, 56px)',
          boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.4)' : '0 12px 40px rgba(60,40,20,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: gold,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 12,
            }}
          >
            <Sparkles size={14} color={gold} />
            <span>Master Knowledge &amp; Guidance Hub</span>
          </span>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 400,
              color: ink,
              margin: '0 0 16px',
              lineHeight: 1.18,
            }}
          >
            Understanding Presence, Emotional Intelligence &amp; Mind Training
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(14px, 1.8vw, 16px)',
              color: inkSub,
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            An authoritative, direct-answer guide to dissolving overthinking, mastering feelings versus emotions, and cultivating witness consciousness.
          </p>
        </div>

        {/* 4 Core AI Answer & Definition Chunks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginBottom: 48,
          }}
        >
          {/* Chunk 1 */}
          <article
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${borderC}`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: ink, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} color={gold} />
              <span>Feelings vs. Emotions</span>
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 13.5, color: inkSub, lineHeight: 1.65, margin: 0 }}>
              <dfn style={{ fontStyle: 'normal', fontWeight: 700, color: ink }}>Physical Feelings</dfn> are raw, immediate somatic sensations in the body (tightness in chest, warmth, flutter). <dfn style={{ fontStyle: 'normal', fontWeight: 700, color: ink }}>Emotions</dfn> are mental stories and memory loops constructed by the mind around those raw physical sensations.
            </p>
          </article>

          {/* Chunk 2 */}
          <article
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${borderC}`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: ink, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} color={gold} />
              <span>Witness Consciousness</span>
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 13.5, color: inkSub, lineHeight: 1.65, margin: 0 }}>
              Witness Consciousness is the state of abiding as the calm, unshakeable awareness that observes thoughts, emotions, and bodily sensations without identifying with or reacting to them—a core principle taught by Eckhart Tolle and Michael Singer.
            </p>
          </article>

          {/* Chunk 3 */}
          <article
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${borderC}`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: ink, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color={gold} />
              <span>MindGym App Ritual</span>
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 13.5, color: inkSub, lineHeight: 1.65, margin: 0 }}>
              MindGym is a daily digital training space combining 5-minute presence breathwork, somatic body-map scanning, witness reflection journaling, and habit tracking to dissolve stress and cultivate inner calm.
            </p>
          </article>
        </div>

        {/* Semantic Internal Linking Pathways */}
        <div
          style={{
            borderTop: `1px dashed ${borderC}`,
            paddingTop: 32,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink }}>
            Explore Programs &amp; Resources:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a
              href="/feelingsandemotioncourse"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 999,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.08)',
                color: ink,
                fontSize: 12.5,
                fontFamily: SANS,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>Feelings &amp; Emotion Course</span>
              <ArrowRight size={13} color={gold} />
            </a>
            <a
              href="/tiny-kids-transformations"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 999,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.08)',
                color: ink,
                fontSize: 12.5,
                fontFamily: SANS,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>Kids Live Challenge</span>
              <ArrowRight size={13} color={gold} />
            </a>
            <a
              href="/mindgym"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 999,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.08)',
                color: ink,
                fontSize: 12.5,
                fontFamily: SANS,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>MindGym App</span>
              <ArrowRight size={13} color={gold} />
            </a>
            <a
              href="/knowyouremotionalhealth"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 999,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.08)',
                color: ink,
                fontSize: 12.5,
                fontFamily: SANS,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>Emotional Health Quiz</span>
              <ArrowRight size={13} color={gold} />
            </a>
            <a
              href="/aboutmindgym"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 999,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.08)',
                color: ink,
                fontSize: 12.5,
                fontFamily: SANS,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>Witness Journaling Guide</span>
              <ArrowRight size={13} color={gold} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
