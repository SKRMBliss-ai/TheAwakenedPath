import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Zap, PenLine, Heart, Play, Pause,
  CheckCircle2, ArrowRight,
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
import { cn } from '../../lib/utils';

// ─── Per-step fixed colors (Learn · Practice · Reflect · Live It) ─────────────
const STEP_COLORS = ['#B8973A', '#9575CD', '#C65F9D', '#2E9E7A'] as const;

const CARD_IMAGES_DARK = [
  'learn_dark.png',
  'practice_dark.png',
  'reflect_dark.png',
  'liveit_dark.png',
];

const CARD_IMAGES_LIGHT = [
  'learn_light.png',
  'practice_light.png',
  'reflect_light.png',
  'liveit_light.png',
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
  ctaLabel: string;
  onClick: () => void;
}

function DashboardCard({
  idx, Icon, stepLabel, title, subtitle,
  isDone, isLocked, isActive, ctaLabel, onClick,
}: DashboardCardProps) {
  const color = STEP_COLORS[idx];
  const { mode } = useTheme();

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileTap={!isDone && !isLocked ? { scale: 0.97 } : {}}
      className={cn(
        "relative text-left w-full aspect-square transition-all duration-500 overflow-hidden group"
      )}
      style={{
        padding: '24px',
        borderRadius: '24px',
        border: `1px solid ${isActive ? color + '80' : 'var(--border-default)'}`,
        background: isActive 
          ? `color-mix(in srgb, ${color} ${mode === 'dark' ? '12%' : '8%'}, var(--bg-surface))` 
          : isDone 
            ? (mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.95)')
            : (mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)'),
        backdropFilter: 'blur(8px)',
        boxShadow: isActive 
          ? `0 0 0 1px ${color}50, 0 12px 40px ${color}25` 
          : (isDone || isLocked ? 'none' : `0 4px 20px rgba(0,0,0,0.04)`),
        cursor: isLocked || isDone ? 'default' : 'pointer',
      }}
      onClick={!isDone && !isLocked ? onClick : undefined}
    >
      {/* Glow on hover */}
      {!isDone && !isLocked && !isActive && (
        <div 
          className="absolute inset-0 rounded-[24px] pointer-events-none transition-all duration-500 opacity-0 group-hover:opacity-100"
          style={{
             boxShadow: `inset 0 0 0 1px ${color}40, 0 8px 32px ${color}${mode === 'dark' ? '20' : '15'}`,
             background: `radial-gradient(circle at top right, ${color}${mode === 'dark' ? '15' : '08'}, transparent 60%)`
          }}
        />
      )}

      {/* Subtle top edge gradient */}
      <div
        className="absolute top-0 left-0 right-0 opacity-40 transition-all duration-500 group-hover:opacity-100"
        style={{
          height: isActive ? 3 : 1.5,
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />

      {/* Center Image - Glowing & Full-Span */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-1000"
        style={{ 
          opacity: isLocked ? 0.2 : (mode === 'dark' ? 0.75 : 0.45),
          mixBlendMode: mode === 'dark' ? 'color-dodge' : 'multiply'
        }}
      >
        <img 
          src={`/assets/dashboard/${mode === 'dark' ? CARD_IMAGES_DARK[idx] : CARD_IMAGES_LIGHT[idx]}`} 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          style={{ 
            opacity: isLocked ? 0.15 : (isDone ? 0.5 : 0.85),
            filter: mode === 'dark' ? 'brightness(1) contrast(1.1)' : 'brightness(1.05) contrast(1.1)'
          }}
        />
      </div>

      {/* Content Layer: Corner-based Layout */}
      <div className="relative z-10 h-full flex flex-col justify-between w-full">
        {/* Top Section: Corners and Centered Title */}
        <div className="flex items-start justify-between w-full relative">
          {/* Top Left: Step label */}
          <div className="flex flex-col">
            <span
              className="font-sans text-[10px] font-black tracking-[0.25em] uppercase"
              style={{ 
                color: isLocked ? 'var(--text-disabled)' : color,
                opacity: isLocked ? 0.6 : 1
              }}
            >
              {stepLabel}
            </span>
          </div>

          {/* Top Center: Title - High Visibility */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center -top-1">
            <div
              className="font-serif font-black leading-tight transition-all duration-300 whitespace-nowrap"
              style={{
                fontSize: 22,
                color: isLocked ? 'var(--text-disabled)' : (mode === 'dark' ? '#ffffff' : 'var(--text-primary)'),
                letterSpacing: '-0.01em',
                textShadow: mode === 'dark' && !isLocked ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
              }}
            >
              {title}
            </div>
          </div>

          {/* Top Right: Status Badge / Icon */}
          <div className="flex items-center">
            {isDone ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: color + '18', border: `1px solid ${color}40` }}
              >
                <CheckCircle2 size={14} style={{ color }} />
              </motion.div>
            ) : (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ 
                  border: `1px solid ${isLocked ? 'var(--text-disabled)30' : color + '40'}`,
                  opacity: isLocked ? 0.3 : 0.8
                }}
              >
                <Icon size={14} style={{ color: isLocked ? 'var(--text-disabled)' : color }} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Subtitle and CTA */}
        <div className="flex items-end justify-between w-full gap-4 mt-8">
          {/* Bottom Left: Subtitle/Details */}
          <div className="flex-1 overflow-hidden">
            <div
              className="font-serif italic text-[12px] leading-relaxed line-clamp-2 text-left transition-all duration-300"
              style={{ 
                color: isLocked ? 'var(--text-disabled)' : 'var(--text-secondary)',
                opacity: isLocked ? 0.5 : 1
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Bottom Right: Action CTA */}
          <div className="flex flex-shrink-0">
            {isDone ? (
               <div
                className="py-1.5 px-3 rounded-full text-[9px] font-black tracking-widest uppercase"
                style={{ color, opacity: 1 }}
              >
                Done
              </div>
            ) : isLocked ? (
               <div
                className="py-1.5 px-3 rounded-full text-[9px] font-black tracking-widest uppercase"
                style={{ color: 'var(--text-disabled)', opacity: 0.6 }}
              >
                Locked
              </div>
            ) : (
              <div
                className="py-1.5 px-4 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5"
                style={{
                  background: color + '15',
                  color: color,
                  border: `1px solid ${color}30`,
                }}
              >
                {ctaLabel}
                <ArrowRight size={12} className={isActive ? "rotate-90" : ""} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Inline Practice Panel ────────────────────────────────────────────────────

function InlinePracticePanel({
  practice, color, onComplete, onGoToRoom,
}: {
  practice: { name: string; tagline?: string; steps: { instruction: string; duration?: number }[] };
  color: string;
  onComplete: () => void;
  onGoToRoom: () => void;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const total = practice.steps.length;
  const isLast = stepIdx === total - 1;

  const handleNext = () => {
    if (isLast) { setDone(true); onComplete(); }
    else setStepIdx((s: number) => s + 1);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-[24px] text-center"
        style={{
          background: `color-mix(in srgb, ${color} 10%, var(--bg-surface))`,
          border: `1.5px solid ${color}30`,
        }}
      >
        <div className="text-3xl mb-3 drop-shadow-md">✦</div>
        <p className="font-serif italic text-lg" style={{ color: 'var(--text-primary)' }}>Practice complete.</p>
        <p className="text-[12px] mt-1.5 opacity-60" style={{ color: 'var(--text-muted)' }}>"{practice.name}" done for today</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-[24px] overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: `1.5px solid ${color}35`,
        boxShadow: `0 8px 32px ${color}12`,
      }}
    >
      <div className="p-6 pb-4">
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

      <div className="px-6 pb-6">
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
  prompt, color, onSave, onGoToJournal,
}: {
  prompt: string;
  color: string;
  onSave: (text: string) => void;
  onGoToJournal: () => void;
}) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim());
    setSaved(true);
  };

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-[24px] text-center"
        style={{
          background: `color-mix(in srgb, ${color} 10%, var(--bg-surface))`,
          border: `1.5px solid ${color}30`,
        }}
      >
        <div className="text-3xl mb-3 drop-shadow-md">✦</div>
        <p className="font-serif italic text-lg" style={{ color: 'var(--text-primary)' }}>Reflection saved.</p>
        <p className="text-[12px] mt-1.5 opacity-60" style={{ color: 'var(--text-muted)' }}>Your words are held.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-[24px] overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: `1.5px solid ${color}35`,
        boxShadow: `0 8px 32px ${color}12`,
      }}
    >
      <div className="p-6">
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
  const { status, category } = useVoiceStatus();
  const { mode } = useTheme();
  const isActive = VoiceService.currentUrl === track.previewUrl;
  const isPlaying = isActive && status === 'playing' && category === 'music';

  // Lavender theme colors
  const color = '#9575CD';
  const soundBorderColor = mode === 'dark' ? 'rgba(192,160,238,.35)' : 'rgba(120,90,190,.4)';
  const soundBgColor    = mode === 'dark' ? 'rgba(192,160,238,.07)' : 'rgba(150,110,220,.06)';
  const soundLabelColor = mode === 'dark' ? 'rgba(192,160,238,.8)'  : 'rgba(100,70,170,.9)';
  const soundIconColor  = mode === 'dark' ? 'rgba(192,160,238,.8)'  : 'rgba(100,70,170,.9)';

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) VoiceService.pause();
    else if (isActive && status === 'paused') VoiceService.resume('music');
    else VoiceService.playAudioURL(track.previewUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      whileTap={{ scale: 0.985 }}
      className="relative rounded-[24px] overflow-hidden flex items-center gap-[14px] cursor-pointer transition-all duration-500 group"
      style={{
        padding: '18px 20px',
        border: `1px solid ${soundBorderColor}`,
        background: soundBgColor,
        boxShadow: 'var(--shadow)',
      }}
      onClick={() => onNavigate('music')}
    >
      {/* Glow on hover */}
      <div 
        className="absolute inset-0 rounded-[24px] pointer-events-none transition-all duration-500 opacity-0 group-hover:opacity-100"
        style={{
           boxShadow: `inset 0 0 0 1px ${color}40, 0 8px 32px ${color}${mode === 'dark' ? '20' : '15'}`,
           background: `radial-gradient(circle at top right, ${color}${mode === 'dark' ? '12' : '06'}, transparent 70%)`
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 opacity-40 group-hover:opacity-100 transition-all duration-500"
        style={{
          height: 1.5,
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />

      {/* Icon badge */}
      <div
        className="w-12 h-12 rounded-[18px] flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-500"
        style={{
          background: mode === 'dark' ? 'rgba(192,160,238,.12)' : 'rgba(140,100,210,.1)',
          border: `1px solid ${soundBorderColor}`,
        }}
      >
        <Music2 size={22} style={{ color: soundIconColor }} />
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

  const learnDone         = record?.learnCompleted === true;
  const practiceCompleted = isAnyPracticeDone;
  const reflectDone       = record?.reflectCompleted === true;
  const integrateDone     = record?.integrateCompleted === true;
  const doneCount = [learnDone, practiceCompleted, reflectDone, integrateDone].filter(Boolean).length;
  const allDone = doneCount === 4;

  if (!questionMeta || !practice) return null;

  const handleLearn = () => {
    if (isAccessValid) markLearn();
    onNavigate('wisdom_untethered', questionId, 'video');
  };

  const handlePractice = () => {
    if (practiceCompleted) return;
    setActivePanel(prev => prev === 'practice' ? null : 'practice');
  };

  const handleReflect = () => {
    if (reflectDone) return;
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
      {/* ── Section label ───────────────────────────────────────────────────── */}
      <div
        className="font-sans text-[10px] font-black tracking-[0.25em] uppercase mb-[12px] opacity-40 ml-1"
        style={{ color: 'var(--text-primary)' }}
      >
        Today's journey
      </div>

      {/* ── Row 1 (Steps 1 & 2) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <DashboardCard
          idx={0}
          Icon={BookOpen}
          stepLabel="Step 1"
          title="Learn"
          subtitle={`${questionMeta.shortTitle} · 4 min read`}
          isDone={learnDone}
          isLocked={false}
          isActive={false}
          ctaLabel="Begin"
          onClick={handleLearn}
        />
        <DashboardCard
          idx={1}
          Icon={Zap}
          stepLabel="Step 2"
          title="Practice"
          subtitle={practice.tagline ?? 'A moment of practice is a moment of freedom.'}
          isDone={practiceCompleted}
          isLocked={!learnDone}
          isActive={activePanel === 'practice'}
          ctaLabel="Start"
          onClick={handlePractice}
        />
      </div>

      {/* ── Practice Panel (Expands below Row 1) ──────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activePanel === 'practice' && !practiceCompleted && (
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
              onGoToRoom={() => { setActivePanel(null); onNavigate('situations'); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Row 2 (Steps 3 & 4) ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <DashboardCard
          idx={2}
          Icon={PenLine}
          stepLabel="Step 3"
          title="Reflect"
          subtitle="Journal · after practice"
          isDone={reflectDone}
          isLocked={!practiceCompleted}
          isActive={activePanel === 'reflect'}
          ctaLabel="Write"
          onClick={handleReflect}
        />
        <DashboardCard
          idx={3}
          Icon={Heart}
          stepLabel="Step 4"
          title="Live It"
          subtitle="Sacred commitment · after reflect"
          isDone={integrateDone}
          isLocked={!reflectDone}
          isActive={false}
          ctaLabel="I Commit"
          onClick={() => { if (!integrateDone) setShowCommitment(true); }}
        />
      </div>

      {/* ── Reflect Panel (Expands below Row 2) ───────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activePanel === 'reflect' && !reflectDone && (
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

      {/* ── All Done banner ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-6 rounded-[24px] text-center relative overflow-hidden"
            style={{
              background: `color-mix(in srgb, ${color} 10%, var(--bg-surface))`,
              border: `1.5px solid ${color}44`,
              boxShadow: `0 12px 40px ${color}15`,
            }}
          >
            <div 
              className="absolute inset-0 opacity-20"
              style={{ background: `radial-gradient(circle at 50% 50%, ${color}40, transparent 70%)` }}
            />
            <div className="relative z-10">
              <div className="text-3xl mb-3 drop-shadow-lg">✦</div>
              <p className="font-serif italic text-lg leading-snug px-4" style={{ color }}>
                "All four complete. Your presence is your gift today."
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress row ────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between rounded-[22px] mb-5"
        style={{
          padding: '14px 20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
        }}
      >
        <span className="font-sans text-[10px] font-bold tracking-[.15em] uppercase opacity-60" style={{ color: 'var(--text-primary)' }}>
          Today's path
        </span>
        <div className="flex gap-[8px]">
          {([learnDone, practiceCompleted, reflectDone, integrateDone] as boolean[]).map((d, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-700"
              style={{
                width: 8,
                height: 8,
                background: d ? STEP_COLORS[i] : 'var(--border-default)',
                boxShadow: d ? `0 0 10px ${STEP_COLORS[i]}cc` : 'none',
              }}
            />
          ))}
        </div>
        <span
          className="font-sans text-[12px] font-black tabular-nums tracking-[.05em]"
          style={{ color: doneCount > 0 ? '#B8973A' : 'var(--text-muted)' }}
        >
          {doneCount}<span className="text-[10px] opacity-40 mx-0.5">/</span>4
        </span>
      </div>

      {/* ── Soundscape of the Day ───────────────────────────────────────────── */}
      <div
        className="font-sans text-[10px] font-black tracking-[0.25em] uppercase mb-[12px] opacity-40 ml-1 mt-2"
        style={{ color: 'var(--text-primary)' }}
      >
        Soundscape of the day
      </div>
      <SoundscapeCard onNavigate={onNavigate} />

      {/* ── Explore button ──────────────────────────────────────────────────── */}
      <div className="text-center pt-8 pb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('situations')}
          className="font-sans text-[11px] font-bold tracking-[.25em] uppercase px-8 py-[14px] rounded-[24px] transition-all duration-300 relative group"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-default)',
            color: 'var(--text-muted)',
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Explore all practices <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
          <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </div>

      {/* ── Sacred Commitment modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showCommitment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/55 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', stiffness: 330, damping: 26 }}
              className="max-w-sm w-full rounded-[40px] p-10 text-center space-y-7 shadow-2xl relative overflow-hidden"
              style={{
                background: 'var(--bg-primary, #0C0A0F)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none rounded-[40px]"
                style={{ background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${color}12, transparent)` }}
              />
              <div className="relative z-10 space-y-5">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto"
                  style={{ background: `${color}18`, border: `2px solid ${color}44` }}
                >
                  <Heart size={28} style={{ color }} />
                </div>
                <h3 className="text-2xl font-serif font-light" style={{ color: 'var(--text-primary)' }}>
                  Sacred Commitment
                </h3>
                <p className="text-base font-serif italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
