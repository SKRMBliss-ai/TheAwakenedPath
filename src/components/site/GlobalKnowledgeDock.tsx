import { useState, useEffect } from 'react';
import { Search, Compass, BookOpen, Sparkles, X, ChevronRight, Play, Heart, ArrowRight } from 'lucide-react';
import { useSiteTheme } from '../../lib/siteTheme';
import { searchKnowledgeBase, type SearchResultItem, GLOSSARY_REGISTRY, LEARNING_JOURNEYS } from '../../features/content/data/contentEngineData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

export default function GlobalKnowledgeDock() {
  const { palette } = useSiteTheme();
  const isDark = palette.isDark;
  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.72)' : '#6B5744';
  const bg = isDark ? 'rgba(20,15,26,0.95)' : 'rgba(255,255,255,0.96)';
  const borderC = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(196,181,160,0.35)';
  const gold = '#C4913A';

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'journeys' | 'glossary'>('search');

  useEffect(() => {
    if (query.trim()) {
      setResults(searchKnowledgeBase(query));
    } else {
      setResults([]);
    }
  }, [query]);

  // Keyboard shortcut Ctrl+K or Cmd+K to toggle search dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Knowledge Dock & Search (Ctrl+K)"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 90,
          background: 'linear-gradient(135deg, #4A3260 0%, #2A1B38 100%)',
          color: '#FFDF9E',
          border: '1px solid rgba(255,223,158,0.35)',
          borderRadius: 999,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          fontFamily: SANS,
          fontSize: 13,
          fontWeight: 700,
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s ease',
        }}
      >
        <Compass size={18} color="#FFDF9E" />
        <span className="si-dock-text">Knowledge Dock</span>
        <span
          style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '2px 7px',
            borderRadius: 6,
            fontSize: 10,
            color: '#fff',
            fontWeight: 800,
          }}
        >
          ⌘K
        </span>
      </button>

      {/* Slide-over Knowledge Dock Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 480,
              height: '100%',
              background: bg,
              color: ink,
              borderLeft: `1px solid ${borderC}`,
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-16px 0 48px rgba(0,0,0,0.5)',
              overflowY: 'auto',
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Compass size={20} color={gold} />
                <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: ink, margin: 0 }}>
                  Knowledge Hub &amp; Search
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Knowledge Dock"
                style={{ background: 'transparent', border: 'none', color: inkSub, cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Instant Search Bar */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <Search size={18} color={gold} style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="text"
                placeholder="Search articles, glossary, videos, FAQs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: 14,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.05)',
                  border: `1px solid ${borderC}`,
                  color: ink,
                  fontSize: 14,
                  fontFamily: SANS,
                  outline: 'none',
                }}
              />
            </div>

            {/* Navigation Segment Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: `1px solid ${borderC}`, paddingBottom: 12 }}>
              {(['search', 'journeys', 'glossary'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: 'none',
                    background: activeTab === tab ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(74,50,96,0.1)') : 'transparent',
                    color: activeTab === tab ? ink : inkSub,
                    fontSize: 12.5,
                    fontWeight: 700,
                    fontFamily: SANS,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'search' ? '🔍 Search' : tab === 'journeys' ? '📚 Journeys' : '📖 Glossary'}
                </button>
              ))}
            </div>

            {/* Tab 1: Instant Search Results or Quick Actions */}
            {activeTab === 'search' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {query.trim() ? (
                  results.length > 0 ? (
                    results.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        onClick={() => setIsOpen(false)}
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                          border: `1px solid ${borderC}`,
                          borderRadius: 14,
                          padding: 14,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 800, color: gold, textTransform: 'uppercase' }}>{res.category} • {res.type}</span>
                          <h4 style={{ fontFamily: SERIF, fontSize: 16, color: ink, margin: '2px 0 4px', fontWeight: 600 }}>{res.title}</h4>
                          <p style={{ fontFamily: SANS, fontSize: 12, color: inkSub, margin: 0 }}>{res.subtitle}</p>
                        </div>
                        <ChevronRight size={16} color={gold} />
                      </a>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: inkSub }}>
                      <p style={{ fontSize: 14, margin: 0 }}>No exact matches found for "{query}".</p>
                      <a href="/knowledge" onClick={() => setIsOpen(false)} style={{ color: gold, fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'inline-block', marginTop: 10 }}>Browse Master Knowledge Hub →</a>
                    </div>
                  )
                ) : (
                  <>
                    <span style={{ fontSize: 11, fontWeight: 800, color: gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      Popular Knowledge Hub Jumps
                    </span>
                    <a href="/knowledge" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(74,50,96,0.05)', color: ink, textDecoration: 'none', fontSize: 13.5, fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={16} color={gold} /> Master Knowledge Directory</span>
                      <ArrowRight size={14} color={gold} />
                    </a>
                    <a href="/mindgym" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(74,50,96,0.05)', color: ink, textDecoration: 'none', fontSize: 13.5, fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={16} color={gold} /> MindGym Daily App</span>
                      <ArrowRight size={14} color={gold} />
                    </a>
                    <a href="/feelingsandemotioncourse" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(74,50,96,0.05)', color: ink, textDecoration: 'none', fontSize: 13.5, fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Play size={16} color={gold} /> Feelings &amp; Emotion 7-Ep Course</span>
                      <ArrowRight size={14} color={gold} />
                    </a>
                    <a href="/knowyouremotionalhealth" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(74,50,96,0.05)', color: ink, textDecoration: 'none', fontSize: 13.5, fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Heart size={16} color={gold} /> 2-Min Emotional Health Quiz</span>
                      <ArrowRight size={14} color={gold} />
                    </a>
                  </>
                )}
              </div>
            )}

            {/* Tab 2: Learning Journeys */}
            {activeTab === 'journeys' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {LEARNING_JOURNEYS.map((j) => (
                  <div key={j.id} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)', border: `1px solid ${borderC}`, borderRadius: 16, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: gold, textTransform: 'uppercase' }}>{j.level} • {j.estimatedDays}</span>
                    </div>
                    <h4 style={{ fontFamily: SERIF, fontSize: 18, color: ink, margin: '0 0 6px', fontWeight: 600 }}>{j.title}</h4>
                    <p style={{ fontFamily: SANS, fontSize: 12.5, color: inkSub, margin: '0 0 12px', lineHeight: 1.5 }}>{j.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {j.steps.map((st, idx) => (
                        <a key={idx} href={st.resourceType === 'mindgym' ? '/mindgym' : `/guides/${st.resourceSlug}`} onClick={() => setIsOpen(false)} style={{ fontSize: 12, color: ink, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', padding: '6px 10px', borderRadius: 8 }}>
                          <ChevronRight size={12} color={gold} />
                          <span>{st.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Glossary Terms */}
            {activeTab === 'glossary' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.values(GLOSSARY_REGISTRY).map((term) => (
                  <a
                    key={term.slug}
                    href={`/glossary/${term.slug}`}
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                      border: `1px solid ${borderC}`,
                      borderRadius: 14,
                      padding: 14,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <h4 style={{ fontFamily: SERIF, fontSize: 17, color: ink, margin: 0, fontWeight: 600 }}>{term.term}</h4>
                        {term.phonetic && <span style={{ fontSize: 11, color: inkSub }}>{term.phonetic}</span>}
                      </div>
                      <p style={{ fontFamily: SANS, fontSize: 12, color: inkSub, margin: '4px 0 0', lineHeight: 1.5 }}>{term.shortDefinition}</p>
                    </div>
                    <ChevronRight size={16} color={gold} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
