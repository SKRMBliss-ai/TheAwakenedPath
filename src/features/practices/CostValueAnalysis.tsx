import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { TrendingDown, Sparkles, Activity } from 'lucide-react';

interface AnalysisRow {
  thought: string;
  action: string;
  value: 'None' | 'Low / conditional' | 'Real value';
  cost: string;
}

const ANALYSIS_DATA: AnalysisRow[] = [
  {
    thought: "Replaying a difficult conversation from 3 days ago",
    action: "Recreates discomfort in a moment that no longer exists",
    value: "None",
    cost: "Emotional drain, lost presence"
  },
  {
    thought: "“I can’t believe I said that in the meeting”",
    action: "Teaches nothing new — you already know what happened",
    value: "None",
    cost: "Self-erosion, repeated shame"
  },
  {
    thought: "Scrolling at midnight, mind restless",
    action: "Simulates activity while avoiding stillness",
    value: "None",
    cost: "Poor sleep, anxiety, emptiness"
  },
  {
    thought: "Comparing yourself to a colleague who got recognised",
    action: "Converts their win into a story about your inadequacy",
    value: "None",
    cost: "Resentment, diminished motivation"
  },
  {
    thought: "Rehearsing a conversation that may never happen",
    action: "Prepares for imaginary conflict, not real life",
    value: "None",
    cost: "Anxiety, wasted mental energy"
  },
  {
    thought: "Worrying about a decision already made",
    action: "Cannot undo the decision — only agitates",
    value: "None",
    cost: "Prolonged stress, no resolution"
  },
  {
    thought: "“What if something goes wrong tomorrow?”",
    action: "May flag a genuine risk — or may just be fear looping",
    value: "Low / conditional",
    cost: "Anxiety if followed without discernment"
  },
  {
    thought: "Noticing a pattern in how you react to criticism",
    action: "Reveals something real about yourself — actionable insight",
    value: "Real value",
    cost: "Minimal — only if you get lost in self-analysis"
  },
  {
    thought: "Planning how to approach a difficult conversation",
    action: "Prepares a real action in real time — problem-solving mode",
    value: "Real value",
    cost: "None, if done once and released"
  },
  {
    thought: "Working through a creative or logistical problem",
    action: "Uses the analytical mind for what it’s built for",
    value: "Real value",
    cost: "None"
  }
];

const ValueBadge = ({ value }: { value: AnalysisRow['value'] }) => {
  const configs = {
    'None': { label: 'None', class: 'bg-[var(--border-subtle)]/20 text-[var(--text-muted)] border-[var(--border-subtle)]/50' },
    'Low / conditional': { label: 'Low / conditional', class: 'bg-amber-400/10 text-amber-500 border-amber-400/30' },
    'Real value': { label: 'Real value', class: 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border-[var(--accent-primary)]/40 shadow-[0_0_12px_rgba(var(--accent-primary-rgb),0.2)]' }
  };

  const config = configs[value];
  
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border whitespace-nowrap",
      config.class
    )}>
      {config.label}
    </span>
  );
};

export function CostValueAnalysis() {
  return (
    <div className="w-full space-y-8">
      {/* Header section with theme background */}
      <div className="relative p-10 rounded-[40px] overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.03] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-secondary)] opacity-[0.03] blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-3 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-muted)]">
              Mental Economy
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-serif font-light text-[var(--text-primary)]">
            Cost-Value Analysis
          </h2>
          <p className="text-sm font-serif italic text-[var(--text-secondary)] max-w-lg mx-auto opacity-70">
            Witnessing how the mind spends your most precious currency: your aliveness.
          </p>
        </div>

        {/* The Analysis Table */}
        <div className="overflow-x-auto -mx-6 px-6 no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]/30">
                <th className="py-5 px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">The thought</th>
                <th className="py-5 px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">What it actually does</th>
                <th className="py-5 px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Value</th>
                <th className="py-5 px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]/15">
              {ANALYSIS_DATA.map((row, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-[var(--accent-primary)]/[0.02] transition-colors"
                >
                  <td className="py-6 px-4">
                    <p className="text-[14px] font-serif font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors duration-300">
                      {row.thought}
                    </p>
                  </td>
                  <td className="py-6 px-4">
                    <p className="text-[13px] text-[var(--text-secondary)] opacity-80 leading-relaxed max-w-[240px]">
                      {row.action}
                    </p>
                  </td>
                  <td className="py-6 px-4">
                    <ValueBadge value={row.value} />
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-start gap-2 max-w-[180px]">
                      {row.cost === "None" ? (
                        <Activity className="w-3.5 h-3.5 text-[var(--accent-primary)] opacity-40 mt-0.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400/60 mt-0.5" />
                      )}
                      <p className={cn(
                        "text-[12px] leading-tight",
                        row.cost === "None" ? "text-emerald-400/70" : "text-[var(--text-muted)]"
                      )}>
                        {row.cost}
                      </p>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <p className="text-[11px] font-serif italic text-[var(--text-secondary)] max-w-sm">
              Recognition is the first step. When you see a "None Value" thought, don't fight it—just label it: "Investment with zero return."
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Observing the mental economy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
