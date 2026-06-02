import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { meditationService } from './meditationService';
import { useMeditationStore } from '../../stores/meditationStore';
import type { MeditationScreen } from './types';

const MOODS = [
  {v:1,l:'Heavy',e:'😶'},{v:2,l:'Tense',e:'😐'},{v:3,l:'Okay',e:'🙂'},{v:4,l:'Calm',e:'😌'},{v:5,l:'Luminous',e:'✨'}
];

const MeditationJournal = ({ user, onNavigate }:
  { user: { uid: string; displayName: string | null }; onNavigate: (s: MeditationScreen) => void }) => {
  const { sessionId } = useMeditationStore();
  const [step, setStep] = useState<'mood_before'|'mood_after'|'reflection'|'done'>('mood_before');
  const [moodBefore, setMoodBefore] = useState(0);
  const [moodAfter, setMoodAfter] = useState(0);
  const [present, setPresent] = useState<boolean|null>(null);
  const [noticed, setNoticed] = useState('');
  const [oneWord, setOneWord] = useState('');
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0,10);

  const save = async () => {
    if (!oneWord.trim()) return;
    setSaving(true);
    try {
      await meditationService.saveJournalEntry({
        uid: user.uid, sessionId: sessionId ?? `manual_${today}`, date: today,
        moodBefore, moodAfter, stayedPresent: present ?? false, noticed, oneWord: oneWord.trim(), timestamp: Date.now()
      });
      setStep('done');
    } finally { setSaving(false); }
  };

  const finish = () => { useMeditationStore.getState().reset(); onNavigate('landing'); };

  return (
    <div className="min-h-screen bg-[#0a0d1a] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(212,175,55,0.05),transparent)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 'mood_before' && (
            <Card key="mb" title="How did you arrive?" sub="Before the session">
              <Moods v={moodBefore} onChange={setMoodBefore} />
              <Next onClick={() => setStep('mood_after')} disabled={!moodBefore} />
            </Card>
          )}
          {step === 'mood_after' && (
            <Card key="ma" title="How do you feel now?" sub="After the session">
              <Moods v={moodAfter} onChange={setMoodAfter} />
              <Next onClick={() => setStep('reflection')} disabled={!moodAfter} />
            </Card>
          )}
          {step === 'reflection' && (
            <Card key="r" title="A moment of reflection">
              <div className="space-y-5">
                <div>
                  <p className="text-white/50 text-xs font-bold mb-3 uppercase tracking-widest">Did you stay present?</p>
                  <div className="flex gap-3">
                    {[true,false].map(v=>(
                      <button key={String(v)} onClick={()=>setPresent(v)}
                        className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all ${present===v?'bg-amber-500/20 border-amber-400/40 text-amber-400':'bg-slate-800/40 border-white/8 text-white/40 hover:border-white/20'}`}>
                        {v?'🙏 Yes':'😅 Mind wandered'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-bold mb-2 uppercase tracking-widest">What did you notice?</p>
                  <textarea value={noticed} onChange={e=>setNoticed(e.target.value.slice(0,200))} rows={3}
                    placeholder="Breath, body, thoughts, stillness…"
                    className="w-full bg-slate-800/60 text-white/80 text-sm rounded-2xl px-4 py-3 placeholder-white/20 border border-white/8 outline-none resize-none focus:border-amber-400/30 transition-colors" />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-bold mb-2 uppercase tracking-widest">One word for today</p>
                  <input value={oneWord} onChange={e=>setOneWord(e.target.value.replace(/\s/g,'').slice(0,30))}
                    placeholder="Still, grateful, clear…"
                    className="w-full bg-slate-800/60 text-white/80 text-sm rounded-2xl px-4 py-3 placeholder-white/20 border border-white/8 outline-none focus:border-amber-400/30 transition-colors text-center font-bold" />
                </div>
                <button onClick={save} disabled={!oneWord.trim()||saving}
                  className="w-full py-4 rounded-2xl bg-amber-500 text-black font-black text-sm disabled:opacity-40 hover:bg-amber-400 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.3)]">
                  {saving ? 'Saving…' : 'Complete Practice'}
                </button>
              </div>
            </Card>
          )}
          {step === 'done' && (
            <motion.div key="done" initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} className="text-center py-12">
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2,type:'spring',damping:15}}
                className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={36} className="text-amber-400" strokeWidth={1.5} />
              </motion.div>
              <h2 className="text-white font-black text-xl mb-2">Practice complete.</h2>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">Small daily practice.<br/>Consistency over intensity.</p>
              <button onClick={finish} className="px-8 py-3 rounded-2xl bg-amber-500/15 border border-amber-400/25 text-amber-400 font-bold text-sm hover:bg-amber-500/25 active:scale-95 transition-all">
                Return to AWAKEN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Card = ({ title, sub, children }: { title:string; sub?:string; children:React.ReactNode }) => (
  <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-24}} transition={{type:'spring',damping:22}}
    className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-amber-400/10 p-6">
    {sub && <p className="text-white/25 text-[10px] uppercase tracking-[0.35em] font-bold mb-1">{sub}</p>}
    <h2 className="text-white font-black text-xl mb-6">{title}</h2>
    {children}
  </motion.div>
);

const Moods = ({ v, onChange }: { v:number; onChange:(n:number)=>void }) => (
  <div className="flex gap-2 mb-6">
    {MOODS.map(m=>(
      <button key={m.v} onClick={()=>onChange(m.v)}
        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${v===m.v?'bg-amber-500/15 border-amber-400/40 scale-105':'bg-slate-800/40 border-white/8 hover:border-white/20'}`}>
        <span className="text-2xl">{m.e}</span>
        <span className={`text-[8px] font-bold uppercase tracking-widest ${v===m.v?'text-amber-400':'text-white/30'}`}>{m.l}</span>
      </button>
    ))}
  </div>
);

const Next = ({ onClick, disabled }: { onClick:()=>void; disabled:boolean }) => (
  <button onClick={onClick} disabled={disabled}
    className="w-full py-4 rounded-2xl bg-amber-500/90 text-black font-black text-sm disabled:opacity-40 hover:bg-amber-400 transition-all flex items-center justify-center gap-2">
    Next <ChevronRight size={16} strokeWidth={3}/>
  </button>
);

export default MeditationJournal;
