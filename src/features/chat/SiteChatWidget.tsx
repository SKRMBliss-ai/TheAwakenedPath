/**
 * SiteChatWidget.tsx
 *
 * The assistant bubble in the corner of the public pages. Talks to the
 * `siteChat` callable, which holds the system prompt and the product facts
 * server-side — this component deliberately knows nothing about what the
 * assistant is allowed to say.
 *
 * It sits ABOVE the WhatsApp SocialFab (which owns bottom-right at 24px) rather
 * than beside it, so the two never overlap on narrow screens. Human handoff is
 * a quick reply inside the panel, so the two are complementary rather than
 * competing for the same job.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { useSiteTheme } from '../../lib/siteTheme';
import { KIDS_TEACHER_IMG } from '../landing/kidsChallengeData';

const SANS = "'Outfit', system-ui, -apple-system, sans-serif";

const WHATSAPP_URL = 'https://wa.me/918217581238';
/** Sim's face, reused from the kids-challenge data so there is one source for
 *  the portrait. Named "assistant" rather than "Sim" throughout: it is an
 *  assistant standing in for her, and implying she is personally typing would
 *  be a small lie to every visitor. */
const ASSISTANT_NAME = 'Sim’s Assistant';
const ASSISTANT_AVATAR = KIDS_TEACHER_IMG;

/** Kept to the last 12 turns — the callable caps this again server-side. */
const MAX_HISTORY = 12;

interface Msg {
  role: 'user' | 'assistant';
  text: string;
}

const GREETING: Msg = {
  role: 'assistant',
  text: 'Hello — I can help you find the right course, explain how the kids challenge works, or pass you to the team. What brings you here today?',
};

const QUICK_REPLIES = [
  { label: 'Which course is right for me?', send: 'Which course is right for me?' },
  { label: 'Tell me about the kids challenge', send: 'Tell me about the 3-day kids challenge for children.' },
  { label: 'What does it cost?', send: 'How does the pricing work?' },
  { label: 'I already bought — where is my access?', send: 'I have already purchased. Where do I find my access?' },
];

/** Turn "/kidschallenge" and bare URLs in the reply into real links. */
function renderWithLinks(text: string, linkColor: string) {
  const parts = text.split(/(https?:\/\/[^\s)]+|\/[a-z][a-z0-9/-]{2,})/gi);
  return parts.map((part, i) => {
    if (/^https?:\/\//i.test(part) || /^\/[a-z]/i.test(part)) {
      const isExternal = /^https?:\/\//i.test(part);
      return (
        <a
          key={i}
          href={part}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          style={{ color: linkColor, fontWeight: 700, textDecoration: 'underline' }}
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Where the launcher sits, given that SocialFab owns the same corner.
 *
 * SocialFab rests at bottom:24 but lifts to 88 on mobile app routes to clear
 * Mind Gym's bottom nav. The chat launcher stacks above it either way, so the
 * two never overlap — mirroring SocialFab's own rule rather than hard-coding a
 * second one that could drift away from it.
 */
function useLauncherBottom() {
  const compute = () => {
    if (typeof window === 'undefined') return 92;
    const isMobile = window.innerWidth < 1024;
    const p = window.location.pathname;
    const isAppRoute = p.startsWith('/mindgym') || p === '/app';
    // SocialFab: 88 raised / 24 resting, 56 tall, plus a 12 gap.
    return isMobile && isAppRoute ? 156 : 92;
  };

  const [bottom, setBottom] = useState(compute);
  useEffect(() => {
    const onResize = () => setBottom(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return bottom;
}

/**
 * `hideLauncher` + `open`/`onOpenChange` let a parent dock own the button, so
 * the corner holds one floating control instead of one per widget.
 */
interface SiteChatWidgetProps {
  hideLauncher?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SiteChatWidget({ hideLauncher, open, onOpenChange }: SiteChatWidgetProps = {}) {
  const { palette } = useSiteTheme();
  const isDark = palette.isDark;
  const launcherBottom = useLauncherBottom();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const setIsOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ink = palette.INK;
  const inkSub = palette.INK2;
  const surface = isDark ? 'rgba(20,15,26,0.97)' : 'rgba(255,255,255,0.98)';
  const borderC = palette.BORDER;
  const linkColor = isDark ? '#FFDF9E' : '#5B3A82';

  // Pin to the newest message whenever the thread grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Escape closes, matching the knowledge dock.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const history = messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setIsSending(true);

    try {
      const fn = httpsCallable<
        { message: string; history: { role: string; text: string }[]; page: string },
        { reply: string; degraded?: boolean }
      >(functions, 'siteChat');
      const res = await fn({ message: trimmed, history, page: window.location.pathname });
      setMessages((prev) => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch (err) {
      console.error('siteChat failed', err);
      // The throttle is a normal thing to hit while typing quickly — say so
      // plainly instead of implying the studio is unreachable.
      const code = (err as { code?: string })?.code;
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: code === 'functions/resource-exhausted'
          ? 'That is a lot of questions at once — give me a moment and try again.'
          : `Sorry — I could not reach the studio just now. The team answers directly on WhatsApp: ${WHATSAPP_URL}`,
      }]);
    } finally {
      setIsSending(false);
    }
  }, [messages, isSending]);

  return (
    <>
      {/* ── Launcher ─────────────────────────────────────────────────────── */}
      {!isOpen && !hideLauncher && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat with the studio assistant"
          className="si-chat-fab"
          style={{
            position: 'fixed', right: 24, bottom: launcherBottom, zIndex: 129,
            display: 'flex', alignItems: 'center',
            padding: 7, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #4A3260 0%, #2A1E40 100%)',
            color: '#FFF6E4',
            fontFamily: SANS, fontSize: 13.5, fontWeight: 700,
            boxShadow: '0 12px 34px -8px rgba(42,30,64,0.7)',
          }}
        >
          <span className="si-chat-fab-avatar" style={{ position: 'relative', flexShrink: 0, display: 'flex' }}>
            <img
              src={ASSISTANT_AVATAR}
              alt=""
              loading="lazy"
              style={{
                width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
                objectPosition: 'center 20%', display: 'block',
                border: '2px solid rgba(255,223,158,0.55)',
              }}
            />
            {/* Presence dot, matching the panel header's "online" cue. */}
            <span aria-hidden="true" style={{
              position: 'absolute', right: -1, bottom: -1,
              width: 11, height: 11, borderRadius: '50%',
              background: '#4ADE80', border: '2px solid #2A1E40',
            }} />
          </span>
          <span className="si-chat-fab-label">Talk to me</span>
        </button>
      )}

      {/* ── Panel ────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="si-chat-panel"
          role="dialog"
          aria-label="Chat with the studio assistant"
          style={{
            position: 'fixed', right: 24, bottom: 24, zIndex: 131,
            width: 380, maxWidth: 'calc(100vw - 32px)',
            height: 560, maxHeight: 'calc(100vh - 48px)',
            display: 'flex', flexDirection: 'column',
            borderRadius: 24, overflow: 'hidden',
            background: surface,
            border: `1px solid ${borderC}`,
            boxShadow: '0 30px 80px -12px rgba(20,14,26,0.55)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #4A3260 0%, #2A1E40 100%)',
            flexShrink: 0,
          }}>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'rgba(255,246,228,0.85)', padding: 4, display: 'flex',
              }}
            >
              <X size={20} />
            </button>
            <img
              src={ASSISTANT_AVATAR}
              alt=""
              loading="lazy"
              style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                objectFit: 'cover', objectPosition: 'center 20%', display: 'block',
                border: '2px solid rgba(255,223,158,0.5)',
              }}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: 'block', fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: '#FFF6E4',
              }}>{ASSISTANT_NAME}</span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,246,228,0.75)',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80' }} />
                Usually replies in a moment
              </span>
            </span>

          </div>

          {/* Thread */}
          <div
            ref={scrollRef}
            style={{
              flex: 1, overflowY: 'auto', padding: '16px 14px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '86%',
                  padding: '11px 15px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user'
                    ? palette.PURPLE_STRONG
                    : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(74,50,96,0.06)'),
                  color: m.role === 'user' ? palette.ON_ACCENT : ink,
                  border: m.role === 'user' ? 'none' : `1px solid ${borderC}`,
                  fontFamily: SANS, fontSize: 14, lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}
              >
                {m.role === 'assistant' ? renderWithLinks(m.text, linkColor) : m.text}
              </div>
            ))}

            {isSending && (
              <div
                aria-live="polite"
                style={{
                  alignSelf: 'flex-start', display: 'flex', gap: 5,
                  padding: '13px 16px', borderRadius: '18px 18px 18px 4px',
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(74,50,96,0.06)',
                  border: `1px solid ${borderC}`,
                }}
              >
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{
                    width: 6, height: 6, borderRadius: '50%', background: inkSub,
                    animation: `si-chat-dot 1.1s ease-in-out ${d * 0.16}s infinite`,
                  }} />
                ))}
              </div>
            )}

            {/* Quick replies — only while the thread is still just the greeting,
                so they prompt a first message without cluttering a real chat. */}
            {messages.length === 1 && !isSending && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginTop: 6 }}>
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => send(q.send)}
                    style={{
                      padding: '9px 15px', borderRadius: 999, cursor: 'pointer',
                      background: 'transparent', border: `1px solid ${borderC}`,
                      color: ink, fontFamily: SANS, fontSize: 12.5, fontWeight: 600,
                      textAlign: 'right', transition: 'background .2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {q.label}
                  </button>
                ))}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '9px 15px', borderRadius: 999,
                    background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.45)',
                    color: isDark ? '#7EE2A8' : '#128C4B',
                    fontFamily: SANS, fontSize: 12.5, fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  Chat with the team on WhatsApp
                </a>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 12px 10px', borderTop: `1px solid ${borderC}`, flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the courses…"
              aria-label="Your message"
              maxLength={1500}
              style={{
                flex: 1, minWidth: 0,
                padding: '12px 16px', borderRadius: 999,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.05)',
                border: `1px solid ${borderC}`,
                color: ink, fontFamily: SANS, fontSize: 14, outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              aria-label="Send message"
              style={{
                width: 42, height: 42, borderRadius: '50%', border: 'none', flexShrink: 0,
                display: 'grid', placeItems: 'center',
                cursor: input.trim() && !isSending ? 'pointer' : 'default',
                background: input.trim() && !isSending ? palette.PURPLE_STRONG : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(74,50,96,0.1)'),
                color: input.trim() && !isSending ? palette.ON_ACCENT : inkSub,
                transition: 'background .2s ease',
              }}
            >
              <Send size={17} />
            </button>
          </form>

          <p style={{
            margin: 0, padding: '0 16px 11px', textAlign: 'center',
            fontFamily: SANS, fontSize: 10.5, color: inkSub, opacity: 0.75, lineHeight: 1.45,
          }}>
            An assistant, not a counsellor — for anything personal,{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ color: linkColor, fontWeight: 700 }}>
              talk to the team
            </a>.
          </p>
        </div>
      )}

      <style>{`
        @keyframes si-chat-dot {
          0%, 60%, 100% { opacity: .3; transform: translateY(0); }
          30%           { opacity: 1;  transform: translateY(-3px); }
        }

        /* The launcher rests as just her face and grows a label on hover —
           the same behaviour as the knowledge dock on the other corner, so the
           two floating controls feel like one system. Animating max-width (not
           width) keeps the label's natural size the target, so the text never
           needs a hard-coded pixel width. */
        .si-chat-fab {
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .si-chat-fab:hover,
        .si-chat-fab:focus-visible {
          transform: translateY(-2px);
        }
        .si-chat-fab-label {
          max-width: 0;
          overflow: hidden;
          white-space: nowrap;
          opacity: 0;
          transition: max-width .32s cubic-bezier(0.2,0.8,0.2,1), opacity .22s ease, margin-left .32s cubic-bezier(0.2,0.8,0.2,1);
        }
        .si-chat-fab:hover .si-chat-fab-label,
        .si-chat-fab:focus-visible .si-chat-fab-label {
          max-width: 160px;
          opacity: 1;
          margin-left: 10px;
          margin-right: 12px;
        }
        /* Under 520px the launcher label costs more than it earns, and the
           panel should use the full width rather than float in the corner. */
        @media (max-width: 520px) {
          /* Only the inset is nudged here. The bottom offset is computed in JS
             so the Mind Gym nav-bar lift is not clobbered by an !important. */
          .si-chat-fab { right: 16px !important; }
          /* No hover on touch, so the label would never appear — and a tap
             should open the panel, not reveal a word. */
          .si-chat-fab-label { display: none; }
          .si-chat-panel {
            right: 8px !important; left: 8px !important; bottom: 8px !important;
            /* max-width must go too: the inline calc(100vw - 32px) is narrower
               than left:8/right:8, so it wins and the panel sits off-centre. */
            width: auto !important; max-width: none !important;
            height: calc(100vh - 80px) !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .si-chat-fab, .si-chat-fab-label { transition: none !important; }
          @keyframes si-chat-dot { 0%, 100% { opacity: .5; transform: none; } }
        }
      `}</style>
    </>
  );
}
