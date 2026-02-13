import React from 'react';
import { Home, Target, BookOpen, User, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FloatingIslandProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    onNavigate?: () => void;
    isAdmin?: boolean;
}

const FloatingIsland: React.FC<FloatingIslandProps> = ({ activeTab, setActiveTab, onNavigate, isAdmin }) => {
    const tabs = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'intelligence', icon: Sparkles, label: 'Power of Now' },
        { id: 'chapters', icon: BookOpen, label: 'Journal' },
        { id: 'journey', icon: Target, label: 'Breath' },
        { id: 'panic', icon: AlertCircle, label: 'Panic' },
        { id: 'profile', icon: User, label: 'Profile' },
    ].filter(tab => isAdmin || tab.id === 'chapters');

    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

    return (
        <div className="floating-island">
            {/* Magnetic Indicator */}
            <div
                className="nav-indicator"
                style={{
                    width: `calc(100% / ${tabs.length} - 8px)`,
                    left: `calc((${activeIndex} * 100% / ${tabs.length}) + 4px)`
                }}
            />

            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            onNavigate?.();
                        }}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-2 transition-all duration-500 outline-none",
                            isActive ? "text-[#3a2a3c] scale-110" : "text-white/70 hover:text-white/90"
                        )}
                        style={{ width: `calc(100% / ${tabs.length})` }}
                    >
                        <Icon className={cn("w-5 h-5", isActive ? "drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" : "")} />
                        <span className={cn("text-[8px] font-bold mt-1 uppercase tracking-tighter transition-all duration-500",
                            isActive ? "opacity-100" : "opacity-60")}>
                            {tab.label}
                        </span>

                        {/* Bioluminescent Glow */}
                        {isActive && (
                            <div className="absolute -bottom-1 w-1 h-1 bg-[#ABCEC9] rounded-full shadow-[0_0_10px_#ABCEC9]" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default FloatingIsland;
