import { TwoPillars } from './TwoPillars';
import { CurriculumTrack } from './CurriculumTrack';
import { WeeklyLetter } from './WeeklyLetter';
import { YearView } from './YearView';
import { ReflectionSearch } from './ReflectionSearch';
import { MorningGlance } from './MorningGlance';
import { PostSit } from './PostSit';
import { SideRails } from './SideRails';
import type { Practice, PracticeAssignment } from './practiceOfWeek';

/**
 * DEV-ONLY visual harness.
 *
 * The real screens sit behind Firebase Auth, and signing in would send a live
 * passwordless email against production — so this renders the presentational
 * components against fixed sample data instead. It is mounted only when
 * import.meta.env.DEV is true and is tree-shaken out of production builds.
 *
 * Sample data only. Nothing here reads or writes Firestore.
 */

const samplePractice: Practice = {
  practiceId: 'sample',
  title: 'Right Intention',
  core: 'May my thoughts, words and actions serve clarity and kindness today.',
  purpose: 'To align the motive behind everything you think, say and do.',
  instructions: [
    'Feel the meaning rather than merely reciting it',
    'Bring to mind the kind of person you intend to be',
    'Notice resentment or harmful intention without judgment',
  ],
  dailyLife: [
    'Pause before speaking or acting',
    'Check the motive behind important choices',
    'Choose honesty without unnecessary harshness',
    'Look for an opportunity to help someone',
    'Notice when alignment is lost and begin again',
    'Review the day',
  ],
  alignSixfold: 'intention',
  alignVirtue: 'sincerity',
  dateIntroduced: '2026-08-18',
  originalWeek: 1,
};

const sampleAssignments: PracticeAssignment[] = [
  { weekNumber: 1, weekStart: '2026-08-18', weekEnd: '2026-08-24', practiceId: 'sample', assignmentType: 'new', assignedAt: '' },
  { weekNumber: 2, weekStart: '2026-08-25', weekEnd: '2026-08-31', practiceId: 'sample', assignmentType: 'resurfaced', assignedAt: '' },
];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--accent-primary)] border-b border-[var(--border-subtle)] pb-2">
      {title}
    </h2>
    {children}
  </section>
);

export default function PracticePathPreview() {
  return (
    <div className="min-h-screen bg-[var(--bg-base,#0C0910)] text-[var(--text-primary,#FDFAF4)] p-6 sm:p-10">
      <SideRails
        virtueProgress={{ sincerity: 7, commitment: 3, patience: 0 }}
        onOpenVirtue={() => {}}
        onOpenSixfold={() => {}}
      />

      <div className="max-w-5xl mx-auto space-y-12">
        <header>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">Dev preview</p>
          <h1 className="text-3xl font-serif font-light mt-1">Practice path components</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-2">
            Sample data. Not connected to Firestore.
          </p>
        </header>

        <Section title="Two pillars + flip cards + Sixfold">
          <TwoPillars
            virtueDays={3}
            virtueDoneToday={false}
            onToggleVirtue={() => {}}
            onOpenVirtue={() => {}}
            practice={samplePractice}
            practiceWeekStates={['practised', 'practised', 'engaged', 'none', 'none', 'none', 'none']}
            practiceDoneToday={false}
            onTogglePractice={() => {}}
            onOpenPractice={() => {}}
            practiceReflection=""
            onSaveReflection={() => {}}
            carried={{ text: 'Pause before the word, not after it.', week: 1, gap: 1 }}
            resurfaced={{ gap: 3, lastReflection: 'I noticed the urge to correct people.' }}
            onOpenSixfold={() => {}}
          />
        </Section>

        <Section title="Curriculum track">
          <CurriculumTrack completed={new Set(['question1', 'question2', 'question3'])} />
        </Section>

        <Section title="Weekly letter">
          <WeeklyLetter
            weekNumber={2}
            practiceTitle="Right Intention"
            sits={5}
            practisedDays={4}
            virtueDays={6}
            carriedIn="Pause before the word, not after it."
            longestReflection="The pause is easier when I am not tired."
          />
        </Section>

        <Section title="Year at a glance">
          <YearView
            assignments={sampleAssignments}
            practices={[samplePractice]}
            practisedByWeek={{ 1: 6, 2: 3 }}
            engagedByWeek={{ 1: 7, 2: 5 }}
          />
        </Section>

        <Section title="Reflection search">
          <ReflectionSearch
            entries={[
              { id: '1', text: 'The pause is easier when I am not tired.', date: '2026-08-19', source: 'Practice' },
              { id: '2', text: 'I noticed patience arriving before irritation today.', date: '2026-08-18', source: 'Evening reflection' },
              { id: '3', text: 'Sincerity is harder in writing than in speech.', date: '2026-08-17', source: 'Insight' },
            ]}
          />
        </Section>

        <Section title="Morning glance">
          <div className="rounded-2xl border border-[var(--border-subtle)]">
            <MorningGlance
              name="Sim"
              invitation="Say the core instruction once, slowly, feeling its meaning rather than reciting it."
              onBegin={() => {}}
              onOpenFullDay={() => {}}
            />
          </div>
        </Section>

        <Section title="Post-sit (inline, normally fullscreen)">
          <div className="relative h-[420px] rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
            <div className="absolute inset-0 [&>div]:!absolute">
              <PostSit open minutes={20} onChoose={() => {}} onSkip={() => {}} />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
