import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { RefreshCw, Activity, CheckCircle, Mail, ExternalLink, Share2, MessageCircle, Eye } from 'lucide-react';

// Standalone analytics for the Daily Emotional Insight Engine
// (/knowyouremotionalhealth). Queries activity_logs directly — INCLUDING
// anonymous users — so the "how many took it" counts are accurate.

type Log = { activityType: string; userEmail?: string; timestamp?: any };

const PAGE = '/knowyouremotionalhealth';

function istDateKey(d: Date): string {
    // YYYY-MM-DD in IST
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export default function EmotionalHealthStats() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Single-field equality query (no composite index needed).
            const q = query(collection(db, 'activity_logs'), where('location', '==', PAGE), limit(5000));
            const snap = await getDocs(q);
            setLogs(snap.docs.map(d => d.data() as Log));
        } catch (e) {
            console.error('EmotionalHealthStats fetch failed:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const stats = useMemo(() => {
        const count = (t: string) => logs.filter(l => l.activityType === t).length;
        const visits = count('PAGE_VISIT_EMOTIONAL_HEALTH');
        const starts = count('EMOTIONAL_HEALTH_START');
        const completes = count('EMOTIONAL_HEALTH_COMPLETE');
        const emails = count('EMAIL_FORM_SUBMIT');
        const ctaMindGym = count('EMOTIONAL_HEALTH_CTA');
        const whatsapp = count('CONTACT_WHATSAPP_CLICK');
        const emailClick = count('CONTACT_EMAIL_CLICK');
        const shares = count('EMOTIONAL_HEALTH_SHARE');
        const completionRate = starts ? Math.round((completes / starts) * 100) : 0;

        // Daily completions for the last 14 days (IST)
        const byDay: Record<string, number> = {};
        logs.filter(l => l.activityType === 'EMOTIONAL_HEALTH_COMPLETE').forEach(l => {
            const ts = l.timestamp?.toDate ? l.timestamp.toDate() : (l.timestamp ? new Date(l.timestamp) : null);
            if (!ts) return;
            const k = istDateKey(ts);
            byDay[k] = (byDay[k] || 0) + 1;
        });
        const days: { date: string; count: number }[] = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86_400_000);
            const k = istDateKey(d);
            days.push({ date: k, count: byDay[k] || 0 });
        }
        const todayKey = istDateKey(new Date());
        const completedToday = byDay[todayKey] || 0;
        const peakDay = days.reduce((m, d) => Math.max(m, d.count), 0) || 1;

        return { visits, starts, completes, completedToday, emails, ctaMindGym, whatsapp, emailClick, shares, completionRate, days, peakDay };
    }, [logs]);

    const cardStyle = 'rounded-xl p-3 text-center';
    const cardBg = { background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' };

    return (
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(176,137,95,0.06)', border: '0.5px solid rgba(176,137,95,0.25)' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" style={{ color: '#B0895F' }} />
                    <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Emotional Health Engine</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(176,137,95,0.15)', color: '#B0895F' }}>/knowyouremotionalhealth</span>
                </div>
                <button onClick={fetchLogs} disabled={loading}
                    className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full"
                    style={{ border: '0.5px solid rgba(255,255,255,0.15)', color: 'var(--text-secondary)' }}>
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Funnel */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                {[
                    { icon: <Eye className="w-3.5 h-3.5" />, label: 'Visited', value: stats.visits },
                    { icon: <Activity className="w-3.5 h-3.5" />, label: 'Started', value: stats.starts },
                    { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Completed', value: stats.completes },
                    { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Done today', value: stats.completedToday },
                    { icon: <Mail className="w-3.5 h-3.5" />, label: 'Emails captured', value: stats.emails },
                ].map((m, i) => (
                    <div key={i} className={cardStyle} style={cardBg}>
                        <div className="flex items-center justify-center gap-1 mb-1" style={{ color: '#B0895F' }}>{m.icon}</div>
                        <div className="text-[20px] font-semibold" style={{ color: 'var(--text-primary)' }}>{m.value}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
                    </div>
                ))}
            </div>
            <p className="text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
                Completion rate (completed ÷ started): <span style={{ color: '#B0895F', fontWeight: 600 }}>{stats.completionRate}%</span>
            </p>

            {/* Link clicks */}
            <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Link clicks</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                {[
                    { icon: <ExternalLink className="w-3.5 h-3.5" />, label: 'MindGym CTA', value: stats.ctaMindGym, hint: 'Begin meeting what surfaced → app' },
                    { icon: <MessageCircle className="w-3.5 h-3.5" />, label: 'WhatsApp', value: stats.whatsapp, hint: 'Floating WhatsApp icon' },
                    { icon: <Mail className="w-3.5 h-3.5" />, label: 'Email', value: stats.emailClick, hint: 'Floating / footer email' },
                    { icon: <Share2 className="w-3.5 h-3.5" />, label: 'Shared card', value: stats.shares, hint: 'Share insight card' },
                ].map((m, i) => (
                    <div key={i} className={cardStyle} style={cardBg} title={m.hint}>
                        <div className="flex items-center justify-center gap-1 mb-1" style={{ color: '#B0895F' }}>{m.icon}</div>
                        <div className="text-[20px] font-semibold" style={{ color: 'var(--text-primary)' }}>{m.value}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
                    </div>
                ))}
            </div>

            {/* Daily completions, last 14 days */}
            <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Daily completions · last 14 days (IST)</p>
            <div className="space-y-1.5">
                {stats.days.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] w-16 tabular-nums" style={{ color: 'var(--text-muted)' }}>{d.date.slice(5)}</span>
                        <div className="flex-1 h-3 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="h-3 rounded" style={{ width: `${(d.count / stats.peakDay) * 100}%`, background: '#B0895F', minWidth: d.count ? '4px' : 0 }} />
                        </div>
                        <span className="text-[11px] w-7 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{d.count || ''}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
