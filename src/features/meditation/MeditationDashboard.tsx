import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Calendar, Award } from 'lucide-react';
import { meditationService } from './meditationService';
import type { MeditationStreak, MeditationJournalEntry } from './types';

const BADGE_META: Record<string, { l:string; e:string }> = {
  streak_7:{l:'7-Day Streak',e:'🔥'}, streak_30:{l:'30-Day',e:'⚡'}, streak_100:{l:'100-Day',e:'🌟'},
  sessions_10:{l:'10 Sessions',e:'🌱'}, sessions_50:{l:'50 Sessions',e:'🌿'}, sessions_100:{l:'100 Sessions',e:'🏆'},
  minutes_100:{l:'100 Minutes',e:'⏳'}, minutes_1000:{l:'1,000 Minutes',e:'💎'},
};

const MeditationDashboard = ({ user }: { user: { uid: string } }) => {
  const [streak, setStreak] = useState<MeditationStreak|null>(null);
  const [entries, setEntries] = useState<MeditationJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c=false;
    Promise.all([meditationService.getStreak(user.uid), meditationService.getJournalEntries(user.uid,30)])
      .then(([s,e]) => { if(!c) { setStreak(s); setEntries(e); setLoading(false); } });
    return () => { c=true; };
  }, [user.uid]);

  const last30 = Array.from({length:30},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(29-i)); return d.toISOString().slice(0,10); });
  const hitMap = new Set(entries.map(e=>e.date));

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-t-amber-400 border-white/10 animate-spin"/></div>;

  return (
    <div className="space-y-4 pb-6">
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon:<Flame size={18} className="text-amber-400"/>, l:'Current Streak', v:`${streak?.currentStreak??0}`, u:'days' },
          { icon:<Award size={18} className="text-amber-400"/>, l:'Longest Streak', v:`${streak?.longestStreak??0}`, u:'days' },
          { icon:<Calendar size={18} className="text-teal-400"/>, l:'Total Sessions', v:`${streak?.totalSessions??0}`, u:'sessions' },
          { icon:<Clock size={18} className="text-purple-400"/>, l:'Time Practiced', v:`${streak?.totalMinutes??0}`, u:'minutes' },
        ].map(s=>(
          <motion.div key={s.l} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
            className="bg-slate-800/50 rounded-2xl border border-white/8 p-4">
            <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-white/35 text-[9px] uppercase tracking-widest font-bold">{s.l}</span></div>
            <div className="flex items-baseline gap-1">
              <span className="text-white font-black text-2xl tabular-nums">{s.v}</span>
              <span className="text-white/30 text-xs">{s.u}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 30-day grid */}
      <div className="bg-slate-800/50 rounded-2xl border border-white/8 p-4">
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3">30-Day Consistency</p>
        <div className="grid gap-1" style={{ gridTemplateColumns:'repeat(30,1fr)' }}>
          {last30.map(d=>(
            <div key={d} title={d} className={`aspect-square rounded-sm ${hitMap.has(d)?'bg-amber-400/80':'bg-white/5'}`} />
          ))}
        </div>
      </div>

      {/* Badges */}
      {streak && streak.badges.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl border border-white/8 p-4">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3">Milestones</p>
          <div className="flex flex-wrap gap-2">
            {streak.badges.map(b=>{
              const m=BADGE_META[b.type]??{l:b.type,e:'🏅'};
              return (
                <div key={b.id} className="flex items-center gap-1.5 bg-slate-900/60 rounded-xl px-3 py-1.5 border border-white/8">
                  <span className="text-base">{m.e}</span>
                  <span className="text-amber-400 text-[10px] font-bold">{m.l}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl border border-white/8 p-4">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3">Recent Reflections</p>
          <div className="space-y-3">
            {entries.slice(0,5).map(e=>{
              const moods=['','😶','😐','🙂','😌','✨'];
              return (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className="text-xl">{moods[e.moodAfter]??'🙂'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-bold truncate">{e.oneWord||'—'}</p>
                    {e.noticed && <p className="text-white/30 text-[10px] truncate">{e.noticed}</p>}
                  </div>
                  <span className="text-white/20 text-[10px] flex-shrink-0">{new Date(e.date).toLocaleDateString('en',{month:'short',day:'numeric'})}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!streak && entries.length===0 && (
        <p className="text-white/20 text-sm text-center py-6">Join your first session to begin your practice journey.</p>
      )}
    </div>
  );
};

export default MeditationDashboard;
