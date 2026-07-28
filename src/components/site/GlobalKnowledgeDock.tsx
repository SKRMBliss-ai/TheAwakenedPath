import { useState, useEffect } from 'react';
import { Search, Compass, BookOpen, Sparkles, X, ChevronRight, Play, Heart, ArrowRight } from 'lucide-react';
import { useSiteTheme } from '../../lib/siteTheme';
import { searchKnowledgeBase, type SearchResultItem, GLOSSARY_REGISTRY, LEARNING_JOURNEYS } from '../../features/content/data/contentEngineData';
import { useAuth } from '../../features/auth/AuthContext';
import { isAdminEmail } from '../../config/admin';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

export default function GlobalKnowledgeDock() {
  const { user } = useAuth();
  const { palette } = useSiteTheme();
  const isDark = palette.isDark;
  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.72)' : '#6B5744';
  const bg = isDark ? 'rgba(20,15,26,0.95)' : 'rgba(255,255,255,0.96)';
  const borderC = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(196,181,160,0.35)';
  // Gold #C4913A is tuned for the dark background; on cream it is 2.6:1.
  // #8B6A1A is the same amber family and reaches 4.6:1 in light mode.
  const gold = isDark ? '#C4913A' : '#8B6A1A';

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
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Knowledge Dock & Search (Ctrl+K)"
        className="group fixed bottom-[80px] lg:bottom-6 left-4 lg:left-[296px] z-[90] flex items-center gap-0 p-3 hover:gap-2.5 hover:px-4 rounded-full text-[#FFDF9E] border border-[#FFDF9E]/30 shadow-[0_8px_24px_rgba(0,0,0,0.35)] cursor-pointer font-sans text-xs font-bold backdrop-blur-xl transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #3A234E 0%, #1E122A 100%)',
        }}
        title="Knowledge Hub & Search (⌘K)"
      >
        <Compass size={18} color="#FFDF9E" className="flex-shrink-0 transition-transform duration-300 group-hover:rotate-45" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 transition-all duration-300 text-[11px] uppercase tracking-wider text-[#FFDF9E]">
          Knowledge Hub
        </span>
        <span className="hidden group-hover:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold text-white/80 bg-white/10 transition-colors">
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
              {isAdminEmail(user?.email) && (
                <a
                  href="/editorial"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: '1px solid rgba(196,145,58,0.4)',
                    background: 'rgba(196,145,58,0.15)',
                    color: gold,
                    fontSize: 12.5,
                    fontWeight: 700,
                    fontFamily: SANS,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginLeft: 'auto',
                  }}
                >
                  <span>🧠 Editorial Hub</span>
                </a>
              )}
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
