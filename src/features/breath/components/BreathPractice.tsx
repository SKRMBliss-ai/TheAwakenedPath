import { PracticeCard, tokens } from '../../../components/ui/SacredUI';
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
        <div className="space-y-16">
            <div className="flex justify-between items-end border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-bold">The Somatic Field</p>
                    <h2 className="text-6xl font-serif font-light text-white tracking-tight">Guidance</h2>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#ABCEC9] font-bold mb-2">Sacred Mastery</p>
                    <span className="text-5xl font-serif text-white/90">72%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {practices.map((p) => {
                    const isFocus = p.title.toLowerCase().includes('focus');
                    const isRest = p.title.toLowerCase().includes('rest');
                    const Icon = isFocus ? Zap : (isRest ? Moon : Sparkles);
                    const accent = isFocus ? tokens.magenta : (isRest ? "#818CF8" : tokens.teal);

                    return (
                        <PracticeCard
                            key={p.id}
                            title={p.title}
                            type={p.type}
                            level={p.level}
                            xp={p.xp}
                            icon={Icon}
                            accent={accent}
                            onClick={() => setActivePractice(p)}
                        />
                    );
                })}
            </div>
        </div>
    );
};
