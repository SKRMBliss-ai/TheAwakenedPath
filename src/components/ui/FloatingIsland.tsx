import React from 'react';
import { Home, Target, BookOpen, User } from 'lucide-react';
import { cn } from '../../UntetheredSoulApp';

interface FloatingIslandProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    onNavigate?: () => void;
}

const FloatingIsland: React.FC<FloatingIslandProps> = ({ activeTab, setActiveTab, onNavigate }) => {
    const tabs = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'journey', icon: Target, label: 'Journey' },
        { id: 'chapters', icon: BookOpen, label: 'Chapters' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

    return (
        <div className="floating-island">
            {/* Magnetic Indicator */}
            <div
                className="nav-indicator"
                style={{
                    width: `calc(100% / ${tabs.length} - 8px)`,
                    transform: `translateX(calc(${activeIndex} * 100% + ${activeIndex === 0 ? '4px' : '4px'}))`
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
                            "relative flex flex-col items-center justify-center py-2 px-4 transition-all duration-500",
                            isActive ? "text-black scale-110" : "text-white/60 hover:text-white"
                        )}
                        style={{ width: `calc(100% / ${tabs.length})` }}
                    >
                        <Icon className={cn("w-6 h-6", isActive ? "drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" : "")} />
                        <span className={cn("text-[10px] font-bold mt-1 uppercase tracking-tighter transition-all duration-500",
                            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
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
