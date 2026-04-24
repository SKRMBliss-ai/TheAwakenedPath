import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Zap, PenLine, Heart, Play, Pause,
  CheckCircle2, ArrowRight, Lock,
  Music2, Send, ExternalLink,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PRACTICE_LIBRARY } from './practiceLibrary';
import { useDailyPractice } from './useDailyPractice';
import { QUESTION_META } from './TodayPath';
import type { WeeklyAssignment } from '../../hooks/useWeeklyAssignment';
import type { CourseProgress } from '../../hooks/useCourseTracking';
import { SACRED_TRACKS } from '../music/musicData';
import { VoiceService, useVoiceStatus } from '../../services/voiceService';
import { useTheme } from '../../theme/ThemeSystem';


// ─── Per-step fixed colors (Learn · Practice · Reflect · Live It) ─────────────
const STEP_COLORS = ['#B8973A', '#9575CD', '#C65F9D', '#2E9E7A'] as const;

const CARD_IMAGES_DARK = [
  'learn_dark.webp',
  'practice_dark.webp',
  'reflect_dark.webp',
  'liveit_dark.webp',
];

const CARD_IMAGES_LIGHT = [
  'learn_light.webp',
  'practice_light.webp',
  'reflect_light.webp',
  'liveit_light.webp',
];

// ─── helpers ──────────────────────────────────────────────────────────────────

const FALLBACK_ASSIGNMENT: WeeklyAssignment = {
  questionId: 'question1',
  questionNumber: 1,
  weekNumber: 0,
  daysRemaining: 7,
  weekLabel: 'Your first week',
  isFirstWeek: true,
};

function getDailyTrack() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return SACRED_TRACKS[dayOfYear % SACRED_TRACKS.length];
}

// ─── Grid props ───────────────────────────────────────────────────────────────

interface DashboardGridProps {
  userId: string | undefined | null;
  progress?: CourseProgress;
  weeklyAssignment?: WeeklyAssignment;
  onNavigate: (tab: string, questionId?: string, view?: 'explanation' | 'video' | 'practice') => void;
  isAccessValid?: boolean;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface DashboardCardProps {
  idx: number;
  Icon: LucideIcon;
  stepLabel: string;
  title: string;
  subtitle: string;
  isDone?: boolean;
  isLocked?: boolean;
  isActive?: boolean;
  onClick: () => void;
}

function DashboardCard({
  idx, Icon, stepLabel, title, subtitle,
  isDone, isLocked, isActive, onClick,
}: DashboardCardProps) {
  const color = STEP_COLORS[idx];
  const { mode } = useTheme();

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      whileHover={!isLocked ? { y: -2 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className="relative text-left w-full overflow-hidden group"
      style={{
        height: '176px',
        borderRadius: '20px',
        border: `1px solid ${
          isActive ? color + '55'
          : isDone ? color + '28'
          : 'var(--border-default)'
        }`,
        background: isActive
          ? `color-mix(in srgb, ${color} ${mode === 'dark' ? '9%' : '6%'}, var(--bg-surface))`
          : 'var(--bg-surface)',
        backdropFilter: 'blur(10px)',
        boxShadow: isActive
          ? `0 6px 28px ${color}18`
          : 'none',
        cursor: isLocked && !isDone ? 'default' : 'pointer',
        transition: 'border-color 0.4s ease, background 0.4s ease, box-shadow 0.4s ease, transform 0.3s ease',
      }}
      onClick={isLocked && !isDone ? undefined : onClick}
    >
      {/* Subtle background image texture */}
      {!isLocked && (
        <div className="absolute inset-0 overflow-hidden rounded-[20px]">
          <img
            src={`/assets/dashboard/${mode === 'dark' ? CARD_IMAGES_DARK[idx] : CARD_IMAGES_LIGHT[idx]}`}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            style={{
              opacity: isDone ? 0.07 : mode === 'dark' ? 0.14 : 0.10,
              filter: mode === 'dark'
                ? 'brightness(1.3) saturate(0.8)'
                : 'brightness(0.8) saturate(0.6)',
            }}
          />
        </div>
      )}

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 transition-all duration-500"
        style={{
          height: isActive ? 2 : 1,
          background: isLocked
            ? 'var(--border-subtle)'
            : `linear-gradient(90deg, ${color}${isActive ? 'cc' : '70'}, transparent 75%)`,
          opacity: isLocked ? 0.3 : 1,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-5">
        {/* Top row: step label + state icon */}
        <div className="flex items-start justify-between">
          <span
            className="text-[9px] font-black uppercase tracking-[0.28em]"
            style={{
              color: isLocked ? 'var(--text-disabled)' : color,
              opacity: isLocked ? 0.45 : 1,
            }}
          >
            {stepLabel}
          </span>

          {isDone ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: color + '18', border: `1px solid ${color}35` }}
            >
              <CheckCircle2 size={12} style={{ color }} />
            </motion.div>
          ) : isLocked ? (
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'var(--border-subtle)',
                border: '1px solid var(--border-default)',
              }}
            >
              <Lock size={10} style={{ color: 'var(--text-disabled)' }} />
            </div>
          ) : (
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
              style={{
                background: color + '14',
                border: `1px solid ${color}28`,
              }}
            >
              <Icon size={12} style={{ color }} />
            </div>
          )}
        </div>

        {/* Bottom: subtitle + title + done badge */}
        <div>
          <p
            className="font-serif italic text-[11px] mb-[5px] leading-tight line-clamp-1"
            style={{
              color: isLocked ? 'var(--text-disabled)' : 'var(--text-muted)',
              opacity: isLocked ? 0.4 : 0.65,
            }}
          >
            {subtitle}
          </p>

          <div className="flex items-baseline gap-2">
            <h3
              className="font-serif leading-none"
              style={{
                fontSize: '23px',
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: isLocked ? 'var(--text-disabled)' : 'var(--text-primary)',
              }}
            >
              {title}
            </h3>
            {isDone && (
              <span
                className="text-[8px] font-black uppercase tracking-[0.18em] px-2 py-[3px] rounded-full flex-shrink-0"
                style={{ background: color + '18', color }}
              >
                done
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Inline Practice Panel ────────────────────────────────────────────────────

function InlinePracticePanel({
  practice, color, onComplete, onGoToRoom, isDone = false,
}: {
  practice: { name: string; tagline?: string; steps: { instruction: string; duration?: number }[] };
  color: string;
  onComplete: () => void;
  onGoToRoom: () => void;
  isDone?: boolean;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const total = practice.steps.length;
  const isLast = stepIdx === total - 1;

  const handleNext = () => {
    if (isLast) { setDone(true); onComplete(); }
    else setStepIdx((s: number) => s + 1);
  };

  if (done || isDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="p-6 rounded-[20px]"
        style={{
          background: `color-mix(in srgb, ${color} 7%, var(--bg-surface))`,
          border: `1px solid ${color}28`,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.3em] mb-1.5" style={{ color }}>
              Practice Complete
            </p>
            <h3 className="text-[20px] font-serif font-light leading-tight" style={{ color: 'var(--text-primary)' }}>{practice.name}</h3>
            <p className="text-[11px] font-sans font-medium mt-1 opacity-60" style={{ color: 'var(--text-secondary)' }}>
              Done for today
            </p>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: color, color: 'white' }}
          >
            <CheckCircle2 size={20} />
          </motion.div>
        </div>

        <div className="space-y-3 mb-6">
          {practice.steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-3 p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)]/40"
            >
              <div className="text-[12px] font-black opacity-30 mt-0.5" style={{ color }}>0{i + 1}</div>
              <p className="text-[13px] font-serif italic leading-relaxed text-[var(--text-secondary)]">
                {step.instruction}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onGoToRoom}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] transition-opacity hover:opacity-80 active:scale-95"
            style={{ color: 'var(--text-muted)', opacity: 0.55 }}
          >
            <ExternalLink size={11} />
            View full room
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-[20px] overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 24px ${color}10`,
      }}
    >
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.3em] mb-1" style={{ color }}>
              Today's Practice
            </p>
            <h3 className="text-[18px] font-serif leading-tight" style={{ color: 'var(--text-primary)' }}>{practice.name}</h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-0.5" style={{ color: 'var(--text-muted)' }}>Step</p>
            <p className="text-2xl font-black leading-none tabular-nums" style={{ color }}>
              {stepIdx + 1}<span className="text-sm font-normal opacity-40" style={{ color: 'var(--text-muted)' }}>/{total}</span>
            </p>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            animate={{ width: `${((stepIdx + 1) / total) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <div className="px-5 pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="p-5 rounded-2xl mb-5"
            style={{
              background: `color-mix(in srgb, ${color} 8%, var(--bg-surface))`,
              border: `1px solid ${color}25`,
            }}
          >
            <p className="text-[14px] font-serif leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>
              {practice.steps[stepIdx].instruction}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <button
            onClick={onGoToRoom}
            className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <ExternalLink size={12} />
            Full Room
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className="flex-1 py-3.5 rounded-[20px] font-black uppercase tracking-[.15em] text-[11px] text-white"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              boxShadow: `0 8px 20px ${color}35`,
            }}
          >
            {isLast ? 'Complete Practice ✓' : 'Next Step →'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Inline Reflect Panel ─────────────────────────────────────────────────────

function InlineReflectPanel({
  prompt, color, onSave, onGoToJournal, existingJournal = '',
}: {
  prompt: string;
  color: string;
  onSave: (text: string) => void;
  onGoToJournal: () => void;
  existingJournal?: string;
}) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim());
    setSaved(true);
  };

  if (saved || existingJournal) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="p-6 rounded-[20px]"
        style={{
          background: `color-mix(in srgb, ${color} 7%, var(--bg-surface))`,
          border: `1px solid ${color}28`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: color + '20' }}>
            <PenLine size={14} style={{ color }} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#B8973A]">Reflection Logged</p>
            <p className="text-[14px] font-serif italic text-[var(--text-primary)]">"{prompt}"</p>
          </div>
        </div>

        <div className="bg-[var(--bg-primary)]/40 p-5 rounded-2xl border border-[var(--border-default)] mb-6">
          <p className="text-[14px] font-sans leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap italic">
            {text || existingJournal}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onGoToJournal}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] transition-opacity hover:opacity-80 active:scale-95"
            style={{ color: 'var(--text-muted)', opacity: 0.55 }}
          >
            <ExternalLink size={11} />
            View full journal
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-[20px] overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 24px ${color}10`,
      }}
    >
      <div className="p-5">
        <p className="text-[10px] font-black uppercase tracking-[.35em] mb-1.5 opacity-60" style={{ color }}>
          Reflect
        </p>
        <p className="text-[15px] font-serif italic mb-5 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          "{prompt}"
        </p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write freely from the heart…"
          rows={4}
          className="w-full bg-transparent text-[14px] font-serif resize-none outline-none leading-relaxed pb-4 placeholder:opacity-30 focus:placeholder:opacity-10 transition-all"
          style={{
            color: 'var(--text-primary)',
            borderBottom: `1px solid ${color}25`,
          }}
        />
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={onGoToJournal}
            className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <ExternalLink size={12} />
            Full Journal
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={!text.trim()}
            className="flex items-center gap-2.5 px-6 py-3 rounded-[20px] font-black uppercase tracking-wider text-[11px] text-white disabled:opacity-30 transition-all"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              boxShadow: text.trim() ? `0 8px 20px ${color}35` : 'none',
            }}
          >
            <Send size={13} />
            Save Reflection
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Soundscape card ──────────────────────────────────────────────────────────

function SoundscapeCard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const track = getDailyTrack();
  const { status, category, trackId: activeTrackId } = useVoiceStatus();
  const { mode } = useTheme();

  const [localUrl, setLocalUrl] = useState<string | null>(null);

  const isActive = activeTrackId === track.id;
  const isPlaying = isActive && status === 'playing' && category === 'music';

  // Lavender theme colors
  const color = '#9575CD';
  const soundBorderColor = mode === 'dark' ? 'rgba(192,160,238,.35)' : 'rgba(120,90,190,.4)';
  const soundBgColor = mode === 'dark' ? 'rgba(192,160,238,.07)' : 'rgba(150,110,220,.06)';
  const soundLabelColor = mode === 'dark' ? 'rgba(192,160,238,.8)' : 'rgba(100,70,170,.9)';
  const soundIconColor = mode === 'dark' ? 'rgba(192,160,238,.8)' : 'rgba(100,70,170,.9)';

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      VoiceService.pause();
    } else if (isActive && status === 'paused') {
      VoiceService.resume('music');
    } else {
      try {
        let urlToPlay = localUrl;
        if (!urlToPlay) {
          urlToPlay = await VoiceService.getCloakedUrl(track.id, track.audioPath);
          setLocalUrl(urlToPlay);
        }
        VoiceService.playAudioURL(urlToPlay, undefined, track.id);
      } catch (err) {
        // Fallback to preview if secure fails (optional)
        VoiceService.playAudioURL(track.previewUrl, undefined, track.id);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      className="relative rounded-[20px] overflow-hidden flex items-center gap-4 cursor-pointer transition-all duration-400 group"
      style={{
        padding: '16px 18px',
        border: `1px solid ${soundBorderColor}`,
        background: soundBgColor,
      }}
      onClick={() => onNavigate('music')}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none transition-all duration-500 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 80% 50%, ${color}${mode === 'dark' ? '10' : '07'}, transparent 70%)`
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 transition-all duration-500"
        style={{
          height: 1,
          background: `linear-gradient(90deg, ${color}70, transparent 70%)`,
          opacity: 0.5,
        }}
      />

      {/* Icon badge */}
      <div
        className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-300 group-hover:scale-105"
        style={{
          background: mode === 'dark' ? 'rgba(192,160,238,.10)' : 'rgba(140,100,210,.08)',
          border: `1px solid ${soundBorderColor}`,
        }}
      >
        <Music2 size={20} style={{ color: soundIconColor }} />
      </div>

      {/* Info copy */}
      <div className="flex-1 min-w-0 relative z-10">
        <div
          className="font-sans text-[9px] font-bold tracking-[.25em] uppercase mb-[4px]"
          style={{ color: soundLabelColor }}
        >
          Sacred sounds
        </div>
        <div className="font-serif text-[17px] leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
          {track.title}
        </div>
        <div className="font-serif italic text-[12px] mt-0.5 truncate opacity-70" style={{ color: 'var(--text-muted)' }}>
          {track.mood} · {track.duration}
        </div>
      </div>

      {/* Play/Pause control */}
      <button
        onClick={handlePlay}
        aria-label={isPlaying ? 'Pause soundscape' : 'Play soundscape'}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-300 active:scale-90"
        style={{
          background: isPlaying
            ? (mode === 'dark' ? 'rgba(192,160,238,.3)' : 'rgba(120,80,200,.2)')
            : (mode === 'dark' ? 'rgba(192,160,238,.12)' : 'rgba(120,80,200,.08)'),
          border: `1px solid ${soundBorderColor}`,
          boxShadow: isPlaying ? `0 0 15px ${soundIconColor}30` : 'none',
        }}
      >
        {isPlaying
          ? <Pause size={16} fill={soundIconColor} style={{ color: soundIconColor }} />
          : <Play size={16} fill={soundIconColor} style={{ color: soundIconColor, marginLeft: 2 }} />
        }
      </button>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardGrid({
  userId,
  weeklyAssignment,
  onNavigate,
  isAccessValid,
}: DashboardGridProps) {
  const assignment = weeklyAssignment ?? FALLBACK_ASSIGNMENT;
  const { questionId } = assignment;
  const questionMeta = QUESTION_META[questionId] ?? QUESTION_META['question1'];
  const practice = PRACTICE_LIBRARY[questionId];
  const color = practice?.color ?? '#B8973A';
  const requiredTriggers = questionId === 'question3' ? 3 : 1;

  const {
    isAnyPracticeDone, record,
    markLearn, markDone, markReflect, markIntegrate, saveNote,
  } = useDailyPractice(userId, questionId, requiredTriggers);

  const [showCommitment, setShowCommitment] = useState(false);
  const [activePanel, setActivePanel] = useState<'practice' | 'reflect' | null>(null);

  const learnDone = record?.learnCompleted === true;
  const practiceCompleted = isAnyPracticeDone;
  const reflectDone = record?.reflectCompleted === true;
  const integrateDone = record?.integrateCompleted === true;
  const doneCount = [learnDone, practiceCompleted, reflectDone, integrateDone].filter(Boolean).length;
  const allDone = doneCount === 4;

  if (!questionMeta || !practice) return null;

  const handleLearn = () => {
    if (isAccessValid) markLearn();
    onNavigate('wisdom_untethered', isAccessValid ? questionId : 'question1', 'video');
  };

  const handlePractice = () => {
    setActivePanel(prev => prev === 'practice' ? null : 'practice');
  };

  const handleReflect = () => {
    setActivePanel(prev => prev === 'reflect' ? null : 'reflect');
  };

  const handlePracticeComplete = async () => {
    if (isAccessValid) await markDone();
    setActivePanel(null);
  };

  const handleReflectSave = async (text: string) => {
    if (isAccessValid) {
      await saveNote(text);
      await markReflect();
    }
    setActivePanel(null);
  };

  const confirmIntegrate = () => {
    if (isAccessValid) markIntegrate();
    setShowCommitment(false);
  };

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-0.5 mb-5">
        <AnimatePresence mode="wait">
          {allDone ? (
            <motion.div
              key="done-msg"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <span className="font-sans text-[12px] font-semibold tracking-wide" style={{ color: '#B8973A' }}>
                ✦ Your presence is your gift today.
              </span>
            </motion.div>
          ) : (
            <motion.p
              key="path-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-sans text-[10px] font-bold tracking-[0.28em] uppercase"
              style={{ color: 'var(--text-muted)', opacity: 0.5 }}
            >
              Today's journey
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          {/* Progress pips */}
          <div className="flex items-center gap-[5px]">
            {([learnDone, practiceCompleted, reflectDone, integrateDone] as boolean[]).map((d, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-600"
                style={{
                  width: d ? 8 : 6,
                  height: d ? 8 : 6,
                  background: d ? STEP_COLORS[i] : 'var(--border-default)',
                  boxShadow: d ? `0 0 8px ${STEP_COLORS[i]}99` : 'none',
                  opacity: d ? 1 : 0.35,
                }}
              />
            ))}
          </div>
          {/* Count */}
          <span
            className="font-sans text-[13px] font-bold tabular-nums"
            style={{ color: doneCount > 0 ? '#B8973A' : 'var(--text-disabled)', letterSpacing: '-0.01em' }}
          >
            {doneCount}<span className="opacity-35 mx-px text-[11px]">/</span>4
          </span>
        </div>
      </div>

      {/* ── Row 1 (Steps 1 & 2) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <DashboardCard
          idx={0}
          Icon={BookOpen}
          stepLabel="Step 1"
          title="Learn"
          subtitle={`${questionMeta.shortTitle} · 4 min read`}
          isDone={learnDone}
          isLocked={false}
          isActive={false}
          onClick={handleLearn}
        />
        <DashboardCard
          idx={1}
          Icon={Zap}
          stepLabel="Step 2"
          title="Practice"
          subtitle={practice.tagline ?? 'A moment of practice is a moment of freedom.'}
          isDone={practiceCompleted}
          isLocked={!learnDone && !practiceCompleted}
          isActive={activePanel === 'practice'}
          onClick={handlePractice}
        />
      </div>

      {/* ── Practice Panel (Expands below Row 1) ──────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activePanel === 'practice' && (
          <motion.div
            key="practice-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-5"
          >
            <InlinePracticePanel
              practice={practice}
              color={color}
              onComplete={handlePracticeComplete}
              onGoToRoom={() => onNavigate('wisdom_untethered', questionId, 'practice')}
              isDone={practiceCompleted}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Row 2 (Steps 3 & 4) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <DashboardCard
          idx={2}
          Icon={PenLine}
          stepLabel="Step 3"
          title="Reflect"
          subtitle="Journal · after practice"
          isDone={reflectDone}
          isLocked={!practiceCompleted && !reflectDone}
          isActive={activePanel === 'reflect'}
          onClick={handleReflect}
        />
        <DashboardCard
          idx={3}
          Icon={Heart}
          stepLabel="Step 4"
          title="Live It"
          subtitle="Sacred commitment · after reflect"
          isDone={integrateDone}
          isLocked={!reflectDone && !integrateDone}
          isActive={false}
          onClick={() => { setShowCommitment(true); }}
        />
      </div>

      {/* ── Reflect Panel (Expands below Row 2) ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activePanel === 'reflect' && (
          <motion.div
            key="reflect-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-5"
          >
            <InlineReflectPanel
              prompt={questionMeta.journalPrompt}
              color={color}
              onSave={handleReflectSave}
              existingJournal={record?.note || ''}
              onGoToJournal={() => {
                localStorage.setItem('awakened-journal-prompt', questionMeta.journalPrompt);
                localStorage.setItem('awakened-reflect-question-id', questionId);
                setActivePanel(null);
                onNavigate('chapters');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Large banner removed in favor of integrated top header message */}

      {/* Redundant progress row removed in favor of top header */}

      {/* ── Soundscape of the Day ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3 mt-6 px-0.5">
        <p
          className="font-sans text-[9px] font-bold tracking-[0.3em] uppercase"
          style={{ color: 'var(--text-muted)', opacity: 0.45 }}
        >
          Soundscape
        </p>
        <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)', opacity: 0.4 }} />
      </div>
      <SoundscapeCard onNavigate={onNavigate} />

      {/* ── Explore button ──────────────────────────────────────────────────── */}
      <div className="flex justify-center pt-7 pb-3">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('situations')}
          className="group flex items-center gap-2 font-sans text-[10px] font-bold tracking-[0.28em] uppercase transition-all duration-300"
          style={{ color: 'var(--text-muted)', opacity: 0.6 }}
        >
          Explore all practices
          <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>
      </div>

      {/* ── Sacred Commitment modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showCommitment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/55 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="max-w-xs w-full rounded-[28px] p-8 text-center space-y-6 relative overflow-hidden"
              style={{
                background: 'var(--bg-surface)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-default)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none rounded-[40px]"
                style={{ background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${color}12, transparent)` }}
              />
              <div className="relative z-10 space-y-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background: `${color}15`, border: `1px solid ${color}35` }}
                >
                  <Heart size={24} style={{ color }} />
                </div>
                <h3 className="text-xl font-serif font-light" style={{ color: 'var(--text-primary)' }}>
                  Sacred Commitment
                </h3>
                <p className="text-[15px] font-serif italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  "{questionMeta.dailyIntent}"
                </p>
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    onClick={confirmIntegrate}
                    className="w-full py-4 rounded-2xl font-black uppercase tracking-[.15em] text-sm transition-all hover:scale-[1.02] active:scale-[.98] text-white shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                      boxShadow: `0 8px 24px ${color}40`,
                    }}
                  >
                    I Promise to Live This
                  </button>
                  <button
                    onClick={() => setShowCommitment(false)}
                    className="w-full py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Not yet — I need more time
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
