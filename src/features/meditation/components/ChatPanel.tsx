import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeSystem';
import { meditationService } from '../meditationService';
import { useMeditationStore } from '../../../stores/meditationStore';
import type { MeditationMessage } from '../types';

const EMOJIS = ['🙏','💛','✨','🌿','🕊️','🌊','🔥','🌸'];
const BLOCKED = /https?:\/\/|www\./i;
const COOLDOWN = 30_000, MAX = 100;

const ChatPanel = ({ sessionId, user, onClose }:
  { sessionId: string; user: { uid: string; displayName: string | null; photoURL: string | null }; onClose: () => void }) => {
  const { mode } = useTheme();
  const { messages, addEmojiReaction, notificationsMuted } = useMeditationStore();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [lastSent, setLastSent] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageId = useRef<string>('');

  useEffect(() => {
    if (!lastSent) return;
    const id = setInterval(() => setCooldown(Math.max(0, Math.ceil((COOLDOWN - (Date.now()-lastSent))/1000))), 500);
    return () => clearInterval(id);
  }, [lastSent]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages.length]);

  // Play notification sound when new message arrives (text only, not emoji, not from self, not muted)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.id !== lastMessageId.current && lastMsg.uid !== user.uid && lastMsg.type === 'text' && !notificationsMuted) {
      lastMessageId.current = lastMsg.id;
      playNotificationSound();
    }
  }, [messages, user.uid, notificationsMuted]);

  const playNotificationSound = useCallback(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  const send = useCallback(async () => {
    const t = draft.trim(); if (!t) return;
    if (t.length > MAX) { setError(`Max ${MAX} chars`); return; }
    if (BLOCKED.test(t)) { setError('Links not allowed'); return; }
    if (Date.now() - lastSent < COOLDOWN) return;
    setError(''); setDraft(''); setLastSent(Date.now());
    await meditationService.sendMessage(sessionId, {
      uid: user.uid, displayName: user.displayName || 'Practitioner',
      avatarUrl: user.photoURL || undefined, text: t, type: 'text', sessionId
    });
  }, [draft, lastSent, sessionId, user]);

  const sendEmoji = useCallback(async (e: string) => {
    addEmojiReaction(e);
    await meditationService.sendMessage(sessionId, { uid: user.uid, displayName: user.displayName || 'Practitioner', text: e, type: 'emoji', sessionId });
  }, [sessionId, user, addEmojiReaction]);

  const fmt = (ts: number) => { const d=new Date(ts); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed right-0 top-0 bottom-0 w-80 max-w-[92vw] z-[10010] flex flex-col"
      style={{
        background: 'var(--bg-surface)',
        borderLeft: '1.5px solid var(--border-default)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.25)',
        marginTop: 0,
        paddingTop: 0,
        backdropFilter: 'none',
        opacity: 1,
      }}
    >
      {/* Header */}
      <div
        className="flex flex-col px-5 py-3 gap-2 flex-shrink-0 relative w-full"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          marginLeft: 0,
          marginRight: 0,
          marginTop: 0,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-black text-xs leading-tight flex-1" style={{ color: 'var(--text-primary)' }}>Practice Space</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-base)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-[8px] uppercase tracking-widest leading-tight" style={{ color: 'var(--text-muted)' }}>Kind words only</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 px-4 space-y-3" style={{ background: 'var(--bg-surface)' }}>
        {messages.length === 0 && (
          <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Be the first to share a kind word.
          </p>
        )}
        {messages.map(m => <Bubble key={m.id} msg={m} isOwn={m.uid===user.uid} fmt={fmt} mode={mode} />)}
        <div ref={bottomRef} />
      </div>

      {/* Emoji strip */}
      <div
        className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0"
        style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        {EMOJIS.map(e => (
          <button
            key={e}
            onClick={() => sendEmoji(e)}
            className="text-xl hover:scale-125 transition-transform flex-shrink-0"
          >
            {e}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="px-4 pb-5 pt-2 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        {error && <p className="text-red-400 text-[10px] mb-1">{error}</p>}
        <div className="flex gap-2 items-end">
          <textarea
            value={draft}
            onChange={e => { setDraft(e.target.value.slice(0, MAX)); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Share a kind thought…"
            rows={1}
            className="flex-1 text-sm rounded-xl px-3 py-2 outline-none resize-none transition-colors"
            style={{
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              border: '1.5px solid var(--border-default)',
              maxHeight: 72,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
          />
          <button
            onClick={send}
            disabled={cooldown > 0 || !draft.trim()}
            className="p-2.5 rounded-xl bg-amber-500/90 text-black disabled:opacity-30 hover:bg-amber-400 active:scale-95 transition-all flex-shrink-0"
          >
            {cooldown > 0 ? <span className="text-[10px] font-black w-4 text-center">{cooldown}s</span> : <Send size={14} />}
          </button>
        </div>
        <p className="text-[9px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
          {draft.length}/{MAX} · 30s cooldown
        </p>
      </div>
    </motion.div>
  );
};

const Bubble = ({ msg, isOwn, fmt, mode }: { msg: MeditationMessage; isOwn: boolean; fmt:(ts:number)=>string; mode: 'dark' | 'light' }) => {
  if (msg.type === 'emoji') return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-center gap-1.5">
        {!isOwn && <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{msg.displayName.split(' ')[0]}</span>}
        <span className="text-3xl">{msg.text}</span>
        <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{fmt(msg.timestamp)}</span>
      </div>
    </div>
  );

  const ownBubbleStyle = mode === 'dark'
    ? { background: 'rgba(212,175,55,0.2)', color: 'var(--text-primary)', border: '1px solid rgba(212,175,55,0.3)' }
    : { background: 'rgba(212,175,55,0.15)', color: '#1a1a2e', border: '1px solid rgba(212,175,55,0.4)' };

  const otherBubbleStyle = mode === 'dark'
    ? { background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)' }
    : { background: '#f0f0f8', color: '#1a1a2e', border: '1px solid rgba(0,0,0,0.1)' };

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      {!isOwn && (
        <span className="text-[9px] mb-0.5 ml-1" style={{ color: 'var(--text-muted)' }}>
          {msg.displayName.split(' ')[0]}
        </span>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
        style={isOwn ? ownBubbleStyle : otherBubbleStyle}
      >
        {msg.text}{' '}
        <span className="text-[8px] ml-1" style={{ color: 'var(--text-muted)' }}>{fmt(msg.timestamp)}</span>
      </div>
    </div>
  );
};

export default ChatPanel;
