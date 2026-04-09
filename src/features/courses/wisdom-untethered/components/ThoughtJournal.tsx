import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RotateCcw, AlertCircle, Eye, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface JournalRow {
  thought: string;
  category: 'value' | 'cost' | 'watch';
}

const DEFAULT_ROWS: JournalRow[] = [
  { thought: "Focusing on the task at hand", category: 'value' },
  { thought: "Remembering a past mistake", category: 'cost' },
  { thought: "Judging a coworker's tone", category: 'watch' },
];

interface ThoughtJournalProps {
  onClose: () => void;
  inline?: boolean;
  defaultTab?: 'example' | 'journal';
}

export function ThoughtJournal({ onClose, inline, defaultTab }: ThoughtJournalProps) {
  const [activeTab, setActiveTab] = useState<'example' | 'journal'>(defaultTab || 'example');
  const [rows, setRows] = useState<JournalRow[]>(DEFAULT_ROWS);
  const [userThought, setUserThought] = useState('');
  
  const timerRef = useRef<any>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddThought = () => {
    if (!userThought.trim()) return;
    setRows([...rows, { thought: userThought, category: 'watch' }]);
    setUserThought('');
    if (!isTimerRunning) setIsTimerRunning(true);
  };

  const updateCategory = (index: number, cat: JournalRow['category']) => {
    const newRows = [...rows];
    newRows[index].category = cat;
    setRows(newRows);
  };

  const content = (
    <div className={cn(
      "relative bg-[#FDFAF4] dark:bg-[#0c0910] overflow-hidden flex flex-col",
      inline ? "w-full h-full" : "w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-[#e0d5be] dark:border-[var(--border-subtle)]"
    )} onClick={e => e.stopPropagation()}>
      
      {/* Header Tabs */}
      <div className="flex border-b border-[#e0d5be] dark:border-[var(--border-subtle)]">
        <button 
          onClick={() => setActiveTab('example')}
          className={cn(
            "flex-1 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all",
            activeTab === 'example' ? "bg-[#1C1814] text-[#E6C57D]" : "bg-[#f5f0e8] text-[#8B6D1B] dark:bg-[#1a1714] dark:text-[#B8973A]/60"
          )}
        >
          Relationship Example
        </button>
        <button 
          onClick={() => setActiveTab('journal')}
          className={cn(
            "flex-1 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all",
            activeTab === 'journal' ? "bg-[#1C1814] text-[#E6C57D]" : "bg-[#f5f0e8] text-[#8B6D1B] dark:bg-[#1a1714] dark:text-[#B8973A]/60"
          )}
        >
          5-Min Thought Journal
        </button>
        {!inline && (
          <button onClick={onClose} className="px-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-[#8B6D1B]" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'example' ? (
            <motion.div 
              key="example"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 space-y-8"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B8973A]">The Situation</span>
                <h3 className="text-2xl font-serif font-light text-[#1C1814] dark:text-white italic">
                  "Why didn't they call me back?"
                </h3>
                <p className="text-sm text-[#5C4D2E] dark:text-[var(--text-secondary)] leading-relaxed">
                  You notice a growing tightness in your chest. Your mind begins weaving a story: "I must have said something wrong," or "They don't value me as much as I thought." These are <em>personal</em> thoughts.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30">
                  <h4 className="text-xs font-bold uppercase text-rose-400 mb-3 tracking-widest">The Mental Noise (Cost)</h4>
                  <ul className="text-sm space-y-3 text-rose-900 dark:text-rose-200 opacity-80">
                    <li className="flex gap-2"><span>×</span> Searching for reasons in the past</li>
                    <li className="flex gap-2"><span>×</span> Imagining future rejection</li>
                    <li className="flex gap-2"><span>×</span> Replaying the last conversation</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-rose-200 dark:border-rose-900/50">
                    <p className="text-[11px] font-bold text-rose-400">RESULT: High Anxiety / Low Presence</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                  <h4 className="text-xs font-bold uppercase text-emerald-400 mb-3 tracking-widest">The Watcher (Value)</h4>
                  <ul className="text-sm space-y-3 text-emerald-900 dark:text-emerald-200 opacity-80">
                    <li className="flex gap-2"><span>✓</span> Noticing the tightness as an object</li>
                    <li className="flex gap-2"><span>✓</span> Recognizing the story as just a story</li>
                    <li className="flex gap-2"><span>✓</span> Returning to the breath</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-900/50">
                    <p className="text-[11px] font-bold text-emerald-400">RESULT: Inner Peace / Action Readiness</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#FDFAF4] border border-[#e0d5be] dark:bg-[#1a1714] dark:border-[var(--border-subtle)]">
                <p className="text-sm italic font-serif text-[#1C1814] dark:text-white text-center">
                  "The watcher is never hurt by the story. The watcher is simply present for it."
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="journal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 flex flex-col h-full space-y-8"
            >
              {/* Timer & Input */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                    isTimerRunning ? "border-[#B8973A] bg-[#B8973A]/5 shadow-[0_0_15px_rgba(184,151,58,0.2)]" : "border-[#e0d5be] opacity-50"
                  )}>
                    <span className="text-xl font-mono font-bold text-[#1C1814] dark:text-white">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#1C1814] dark:text-white uppercase tracking-wider">Thought Stream</h3>
                    <p className="text-xs text-[#8B6D1B] opacity-70">Capture every thought that drifts by.</p>
                  </div>
                </div>
                
                <div className="flex-1 w-full max-w-md flex gap-2">
                  <input 
                    type="text" 
                    value={userThought}
                    onChange={(e) => setUserThought(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddThought()}
                    placeholder="Enter a thought..."
                    className="flex-1 bg-white dark:bg-[#0c0910] border border-[#e0d5be] dark:border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#B8973A] dark:text-white"
                  />
                  <button 
                    onClick={handleAddThought}
                    className="px-6 py-3 bg-[#1C1814] text-[#E6C57D] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Thought Table */}
              <div className="flex-1 min-h-[300px] border border-[#e0d5be] dark:border-[var(--border-subtle)] rounded-xl overflow-hidden bg-white/50 dark:bg-black/20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f0e8] dark:bg-[#1a1714] border-b border-[#e0d5be] dark:border-[var(--border-subtle)]">
                      <th className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B6D1B]">The Witnessed Thought</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B6D1B] text-center w-[200px]">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0d5be] dark:divide-[var(--border-subtle)]">
                    {rows.map((row, i) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i}
                        className="group"
                      >
                        <td className="p-4 text-sm text-[#1C1814] dark:text-white font-serif">{row.thought}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => updateCategory(i, 'value')}
                              className={cn(
                                "flex flex-col items-center gap-1 group/btn transition-all",
                                row.category === 'value' ? "opacity-100 scale-110" : "opacity-30 hover:opacity-100"
                              )}
                            >
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Eye className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="text-[8px] font-bold uppercase text-emerald-600">Value</span>
                            </button>
                            <button 
                              onClick={() => updateCategory(i, 'cost')}
                              className={cn(
                                "flex flex-col items-center gap-1 group/btn transition-all",
                                row.category === 'cost' ? "opacity-100 scale-110" : "opacity-30 hover:opacity-100"
                              )}
                            >
                              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                              </div>
                              <span className="text-[8px] font-bold uppercase text-rose-600">Cost</span>
                            </button>
                            <button 
                              onClick={() => updateCategory(i, 'watch')}
                              className={cn(
                                "flex flex-col items-center gap-1 group/btn transition-all",
                                row.category === 'watch' ? "opacity-100 scale-110" : "opacity-30 hover:opacity-100"
                              )}
                            >
                              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-amber-600" />
                              </div>
                              <span className="text-[8px] font-bold uppercase text-amber-600">Watch</span>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center pt-4">
                <button 
                  onClick={() => {
                    setRows(DEFAULT_ROWS);
                    setTimeLeft(300);
                    setIsTimerRunning(false);
                  }}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#B8973A] hover:text-[#8B6D1B] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Session
                </button>
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={cn(
                    "px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all",
                    isTimerRunning ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                  )}
                >
                  {isTimerRunning ? "Stop Exploration" : "Start 5-Min Timer"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        className="w-full max-w-4xl max-h-[90vh]"
      >
        {content}
      </motion.div>
    </motion.div>
  );
}
