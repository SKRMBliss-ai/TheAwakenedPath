import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SOCIAL_LINKS } from './SocialFab';
import GlobalKnowledgeDock from '../site/GlobalKnowledgeDock';
import SiteChatWidget from '../../features/chat/SiteChatWidget';

/**
 * One floating control for the whole app.
 *
 * The corner used to hold five of them — the guide, the Watcher's Pause, the
 * sound toggle, the chat launcher and the WhatsApp FAB — mounted by four
 * different parents that each assumed they owned the bottom-right. They
 * overlapped, and a stack of five circles reads as clutter rather than tools.
 *
 * Two presentations, because the right answer differs by screen:
 *
 *   Desktop — a slim rail pinned to the right edge, always visible. There is
 *     room for it, and a tool you can see is a tool you will use.
 *   Mobile — one button above the bottom nav that expands on tap. A permanent
 *     rail on a phone would eat a strip of a screen that has none to spare,
 *     and would sit over content while scrolling.
 *
 * Only one is mounted at a time (a media query, not `hidden`), so the tools
 * inside — which hold audio state — are never mounted twice.
 *
 * The panels the dock opens (chat, knowledge) are the SAME components as
 * before; they hand their launcher to this dock rather than drawing their own.
 */

/** True from the `lg` breakpoint up, tracked live so a resize switches shells. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    // `resize` as well as `change`: under device emulation (and in a few
    // mobile browsers on rotate) the media query updates without ever firing
    // its own event, which would strand the rail on a phone-width screen.
    const sync = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    return () => {
      mq.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);
  return isDesktop;
}

interface DockItemProps {
  label: string;
  onClick?: () => void;
  href?: string;
  /** Brand colour for the social entries; otherwise the surface treatment. */
  bg?: string;
  children: ReactNode;
}

function DockItem({ label, onClick, href, bg, children }: DockItemProps) {
  const cls = cn(
    'relative w-10 h-10 rounded-full flex items-center justify-center border transition-transform',
    'hover:scale-110 active:scale-95',
    bg
      ? 'border-transparent text-white'
      : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  );
  const style = bg ? { background: bg } : undefined;
  const tip = (
    <span className="absolute right-full mr-3 whitespace-nowrap rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-1 text-[11px] font-medium text-[var(--text-primary)] opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 backdrop-blur-xl">
      {label}
    </span>
  );

  return (
    <div className="group relative flex items-center">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={cls} style={style}>
          {tip}{children}
        </a>
      ) : (
        <button onClick={onClick} aria-label={label} className={cls} style={style}>
          {tip}{children}
        </button>
      )}
    </div>
  );
}

const ChatIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
  </svg>
);

const HubIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
  </svg>
);

interface MindGymDockProps {
  /** The app's own tools, in the order they should stack. */
  tools?: ReactNode;
  /** Hidden entirely inside the full-screen meditation room. */
  hidden?: boolean;
  /** True while sound is playing, so the closed mobile button can show it. */
  active?: boolean;
}

export function MindGymDock({ tools, hidden, active }: MindGymDockProps) {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);

  // A panel takes over the screen, and the rail is pinned to the same edge the
  // chat panel occupies — leaving it up puts it on top of the panel's own
  // controls. It steps aside until the panel closes.
  const panelOpen = chatOpen || knowledgeOpen;
  const away = hidden || panelOpen;

  // Shared by both shells, so the two never drift apart.
  const entries = (
    <>
      {tools}
      <DockItem label="Ask the studio assistant" onClick={() => { setChatOpen(true); setOpen(false); }}>
        <ChatIcon />
      </DockItem>
      <DockItem label="Knowledge Hub" onClick={() => { setKnowledgeOpen(true); setOpen(false); }}>
        <HubIcon />
      </DockItem>

      {/* The five social links stay behind one entry — a rail of ten icons is
          a menu, not a dock. */}
      <AnimatePresence>
        {connectOpen && SOCIAL_LINKS.map((l) => (
          <motion.div
            key={l.url}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <DockItem label={l.label} href={l.url} bg={l.bg}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d={l.path} /></svg>
            </DockItem>
          </motion.div>
        ))}
      </AnimatePresence>
      <DockItem
        label={connectOpen ? 'Hide ways to connect' : 'Connect with us'}
        onClick={() => setConnectOpen((c) => !c)}
      >
        {connectOpen
          ? <X className="w-4 h-4" />
          : <svg width="19" height="19" viewBox="0 0 24 24" fill="#25D366"><path d={SOCIAL_LINKS[0].path} /></svg>}
      </DockItem>
    </>
  );

  const panels = (
    <>
      <SiteChatWidget hideLauncher open={chatOpen} onOpenChange={setChatOpen} />
      <GlobalKnowledgeDock hideLauncher open={knowledgeOpen} onOpenChange={setKnowledgeOpen} />
    </>
  );

  // ── Desktop: a permanent rail on the right edge ────────────────────────
  if (isDesktop) {
    return (
      <>
        {panels}
        <div
          className={cn(
            'fixed right-0 top-1/2 -translate-y-1/2 z-[140] transition-all duration-500',
            away ? 'opacity-0 pointer-events-none translate-x-14' : 'opacity-100',
          )}
        >
          <div className="flex flex-col items-center gap-2.5 py-3.5 px-2 rounded-l-2xl border border-r-0 border-[var(--border-subtle)] bg-[var(--bg-secondary)]/90 backdrop-blur-2xl shadow-2xl">
            {entries}
          </div>
        </div>
      </>
    );
  }

  // ── Mobile: one button above the bottom nav, expanding upward ──────────
  return (
    <>
      {panels}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[139]"
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          'fixed right-4 bottom-24 z-[140] flex flex-col items-end gap-3 transition-all duration-500',
          away ? 'opacity-0 pointer-events-none translate-x-10' : 'opacity-100',
        )}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-end gap-3"
            >
              {entries}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Close tools' : 'Open tools'}
          className={cn(
            'relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all',
            'border-2 active:scale-95 overflow-hidden',
            open
              ? 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)]'
              : 'border-[var(--accent-primary)]/60 bg-[#2A1E40]',
          )}
        >
          {open ? <X className="w-6 h-6" /> : (
            <>
              <img src="/guide-avatar.webp" alt="" className="w-full h-full object-cover" />
              <span className={cn(
                'absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[#2A1E40]',
                active ? 'bg-[#25D366]' : 'bg-[var(--accent-primary)]',
              )} />
            </>
          )}
        </button>
      </div>
    </>
  );
}
