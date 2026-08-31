import { Lock, Sparkles, HeartHandshake, CircleCheck, Heart, ArrowRight } from 'lucide-react';
import { GymScreen } from './ui/GymScreen';
import { GymCard } from './ui/GymCard';
import { GymButton } from './ui/GymButton';
import { GymMark } from './ui/GymMark';
import type { GymRoute } from './lib/gymRouter';

/**
 * /mindgymforall — the entry experience.
 *
 * The one screen whose job is to say what this product IS ("the practice gym
 * for the mind"), state the core idea (life happens, something gets stuck,
 * bring it into the gym), and hand the visitor to the gym that fits them.
 * It holds no data, no auth and no practice state on purpose: it is the
 * cheapest possible place to validate the new visual direction on real devices.
 */
export default function MindGymForAll({ onEnter }: { onEnter: (route: GymRoute) => void }) {
  return (
    <GymScreen surface="all" width="wide">
      <header className="flex items-center gap-3 pt-6 pb-2 sm:pt-8 [@media(max-height:520px)]:pt-3">
        <GymMark />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: 'var(--gym-ink-muted)' }}
        >
          My Best Every Day
        </span>
      </header>

      {/* On phone and iPad portrait this is one column: hero, then the two gyms.
          From lg (iPad landscape / desktop) the hero takes the left column and
          the gyms stack down the right, as in the mockup. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:items-center lg:min-h-[70vh]">
        <section className="pt-6 sm:pt-8 lg:pt-0 [@media(max-height:520px)]:pt-2">
          <h1
            className="font-normal"
            style={{
              fontFamily: 'var(--gym-font-display)',
              // Fluid rather than stepped: the headline is the one element where
              // a breakpoint jump between a 390px phone and a 744px iPad mini
              // would be visible as a lurch.
              //
              // Constrained by viewport HEIGHT as well as width. On a landscape
              // phone (844x390) width alone drives this to its 4rem ceiling and
              // the headline then swallows the entire short viewport, pushing
              // both gym CTAs two screens down. `min(10vw, 13vh)` keeps it in
              // proportion to whichever axis is actually scarce.
              fontSize: 'clamp(2.25rem, min(10vw, 13vh), 4rem)',
              lineHeight: 1.04,
              letterSpacing: '-0.015em',
              color: 'var(--gym-ink)',
            }}
          >
            My Best
            <br />
            Every Day
          </h1>

          <p
            className="mt-3 font-medium"
            style={{
              fontFamily: 'var(--gym-font-display)',
              fontSize: 'clamp(1.15rem, 3.6vw, 1.45rem)',
              color: 'var(--gym-accent)',
            }}
          >
            The Practice Gym for the Mind
          </p>

          <div
            className="mt-5 sm:mt-6 space-y-1.5 text-[15px] sm:text-[16px] lg:text-[17px] [@media(max-height:520px)]:mt-3"
            style={{ color: 'var(--gym-ink-soft)', lineHeight: 1.65 }}
          >
            <p>Life gives us experiences.</p>
            <p>Sometimes everything feels fine and we want to grow.</p>
            <p>Sometimes something gets stuck in our mind.</p>
          </div>

          <p
            className="mt-5 sm:mt-6 text-[16px] sm:text-[17px] lg:text-[18px] font-semibold [@media(max-height:520px)]:mt-3"
            style={{ color: 'var(--gym-accent)', lineHeight: 1.5 }}
          >
            Bring it into the gym.
            <br />
            Let&apos;s work with it.
          </p>
        </section>

        {/* iPad portrait earns a second column here; below that they stack, and
            from lg they stack again inside the narrower right-hand column. */}
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-0 lg:grid-cols-1 lg:gap-5 [@media(max-height:520px)]:mt-5">
          <EntryCard
            tone="accent"
            emoji="🧒"
            title="Kids Gym"
            who="For ages 5–10"
            blurb="Play, explore and strengthen your mind."
            cta="Enter Kids Gym"
            onClick={() => onEnter('kids')}
          />
          <EntryCard
            tone="accent2"
            emoji="🧘"
            title="Adult Gym"
            who="For teens & adults"
            blurb="Build awareness, resilience and conscious choice."
            cta="Enter Adult Gym"
            onClick={() => onEnter('adults')}
          />
        </div>
      </div>

      <footer className="mt-12 sm:mt-16 pb-10">
        <div
          className="flex items-start gap-2.5 rounded-[var(--gym-radius-card)] px-4 py-3.5 sm:px-5"
          style={{ background: 'var(--gym-surface)', border: '1px solid var(--gym-line)' }}
        >
          <Heart size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" style={{ color: 'var(--gym-accent-2)' }} />
          <p className="text-[14px] sm:text-[15px]" style={{ color: 'var(--gym-ink-soft)', lineHeight: 1.55 }}>
            <span style={{ fontFamily: 'var(--gym-font-display)', fontSize: '1.1em' }}>
              &ldquo;You don&apos;t have to be perfect. You just have to practise.&rdquo;
            </span>
            <br />
            <span style={{ color: 'var(--gym-ink-muted)' }}>Every day. In your own gym.</span>
          </p>
        </div>

        {/* 2-up on a phone so nothing truncates at 320px; 4-up from iPad. */}
        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <Assurance icon={Lock} label="Private & Secure" />
          <Assurance icon={Sparkles} label="Science & Wisdom Inspired" />
          <Assurance icon={HeartHandshake} label="Built with Care for Every Age" />
          <Assurance icon={CircleCheck} label="You're in Control" />
        </ul>
      </footer>
    </GymScreen>
  );
}

function EntryCard({
  tone,
  emoji,
  title,
  who,
  blurb,
  cta,
  onClick,
}: {
  tone: 'accent' | 'accent2';
  emoji: string;
  title: string;
  who: string;
  blurb: string;
  cta: string;
  onClick: () => void;
}) {
  const ink = tone === 'accent' ? 'var(--gym-accent)' : 'var(--gym-accent-2)';

  return (
    <GymCard tone={tone} radius="panel" className="flex flex-col">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h2
            className="font-semibold"
            style={{
              fontFamily: 'var(--gym-font-display)',
              fontSize: 'clamp(1.5rem, 5vw, 1.9rem)',
              lineHeight: 1.15,
              color: 'var(--gym-ink)',
            }}
          >
            {title}
          </h2>
          <p className="mt-1 text-[13px] sm:text-[14px] font-medium" style={{ color: ink }}>
            {who}
          </p>
          <p
            className="mt-2 text-[14px] sm:text-[15px]"
            style={{ color: 'var(--gym-ink-soft)', lineHeight: 1.55 }}
          >
            {blurb}
          </p>
        </div>

        <ArtSlot emoji={emoji} label={title} />
      </div>

      <GymButton tone={tone} onClick={onClick} className="mt-5" trailing={<ArrowRight size={17} strokeWidth={2.2} />}>
        {cta}
      </GymButton>
    </GymCard>
  );
}

/**
 * PLACEHOLDER FOR COMMISSIONED ARTWORK.
 *
 * The mockups show rendered character illustrations here (a boy for the Kids
 * Gym, a woman for the Adult Gym). Those assets do not exist in `public/` and
 * are a content dependency, not an engineering one — so this holds the exact
 * box they will occupy, tinted to the card, rather than substituting generic
 * stock art. Swap the emoji for an <img> and nothing around it moves.
 *
 * Sized in `clamp` so it never crowds the copy on a 320px phone and never looks
 * lost on an iPad.
 */
function ArtSlot({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div
      data-gym-art-slot={label}
      aria-hidden
      className="grid shrink-0 place-items-center"
      style={{
        width: 'clamp(64px, 20vw, 104px)',
        height: 'clamp(64px, 20vw, 104px)',
        borderRadius: 'var(--gym-radius-card)',
        background: 'linear-gradient(150deg, rgba(255,255,255,0.9), rgba(255,255,255,0.35))',
        border: '1px solid var(--gym-line)',
        fontSize: 'clamp(30px, 9vw, 46px)',
        lineHeight: 1,
      }}
    >
      <span>{emoji}</span>
    </div>
  );
}

function Assurance({
  icon: Icon,
  label,
}: {
  icon: typeof Lock;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2">
      <Icon size={15} strokeWidth={1.8} className="shrink-0" style={{ color: 'var(--gym-accent)' }} />
      <span className="text-[12px] sm:text-[12.5px] leading-tight" style={{ color: 'var(--gym-ink-muted)' }}>
        {label}
      </span>
    </li>
  );
}
