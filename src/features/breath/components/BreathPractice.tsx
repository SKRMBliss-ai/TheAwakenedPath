
import { Zap, Moon, Sparkles } from 'lucide-react';

interface Practice {
    id: number;
    title: string;
    icon: string;
    xp: number;
    duration: number;
    type: string;
    book: string;
    level: string;
    breathPattern?: number[];
    steps: any[];
}

interface BreathPracticeProps {
    practices: Practice[];
    setActivePractice: (practice: Practice) => void;
}

export const BreathPractice: React.FC<BreathPracticeProps> = ({ practices, setActivePractice }) => {
    return (
        <div className="space-y-12">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <h2 className="text-5xl font-serif font-bold text-white tracking-tight">Guidance</h2>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-[#ABCEC9] font-bold mb-2">Sacred Mastery</p>
                    <span className="text-4xl font-serif text-white">72%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {practices.map((p, index) => {
                    // Use custom premium designs for specific practices if they match by title or index
                    const isFocus = p.title.toLowerCase().includes('focus');
                    const isRest = p.title.toLowerCase().includes('rest');
                    const Icon = isFocus ? Zap : (isRest ? Moon : Sparkles);
                    const accentColor = isFocus ? '#C65F9D' : (isRest ? '#818CF8' : '#ABCEC9');

                    return (
                        <div
                            key={p.id}
                            onClick={() => setActivePractice(p)}
                            className="p-10 relative overflow-hidden group cursor-pointer transition-all duration-700 card-glow h-[320px] flex flex-col justify-between rounded-[40px] hover:border-white/20 bg-[#2E2335]"
                        >
                            <Icon className="card-graphic opacity-5" style={{ color: accentColor, width: '300px', height: '300px', bottom: '-20%', right: '-20%' }} />

                            <div
                                className="relative z-10 w-14 h-14 rounded-[20px] flex items-center justify-center shadow-inner mb-4 border transition-all duration-500"
                                style={{
                                    backgroundColor: `${accentColor}10`,
                                    borderColor: `${accentColor}20`
                                }}
                            >
                                <Icon className="w-6 h-6" style={{ color: accentColor }} />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-3xl font-serif font-bold text-white mb-2 group-hover:text-white transition-colors">{p.title}</h3>
                                <div className="flex items-center gap-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{p.type} • {p.level}</p>
                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ABCEC9]">+{p.xp} XP</p>
                                </div>
                            </div>

                            <div className="relative z-10 pt-6 border-t border-white/5 flex justify-between items-center group-hover:border-white/10 transition-colors">
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">Begin Journey</span>
                                <div className="light-dot" style={{ boxShadow: `0 0 15px ${accentColor}`, backgroundColor: accentColor }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
