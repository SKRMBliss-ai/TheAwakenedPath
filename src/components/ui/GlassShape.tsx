

interface GlassShapeProps {
    icon: any; // Lucide icon
    color: string;
    variant: 'orb' | 'book' | 'pulse' | 'chart';
    className?: string;
}

export const GlassShape = ({ icon: Icon, color, variant, className }: GlassShapeProps) => {

    // Define unique SVG paths/shapes for each variant to simulate 3D glass objects
    const renderShape = () => {
        switch (variant) {
            case 'orb':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                        <defs>
                            <radialGradient id={`grad-${variant}`} cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                                <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                                <stop offset="40%" stopColor={color} stopOpacity="0.4" />
                                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
                            </radialGradient>
                            <filter id="glow-orb" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="15" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Ambient Glow */}
                        <circle cx="50" cy="50" r="45" fill={color} opacity="0.3" filter="blur(20px)" />
                        {/* Glass Body */}
                        <circle cx="50" cy="50" r="40" fill={`url(#grad-${variant})`} stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                        {/* Highlight */}
                        <ellipse cx="35" cy="35" rx="15" ry="10" fill="white" opacity="0.4" transform="rotate(-45 35 35)" />
                    </svg>
                );
            case 'book':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id={`grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                                <stop offset="100%" stopColor={color} stopOpacity="0.2" />
                            </linearGradient>
                        </defs>
                        <rect x="20" y="25" width="60" height="50" rx="4" fill={color} opacity="0.2" filter="blur(15px)" />
                        <path d="M25 30 C 25 30, 48 35, 50 30 C 52 35, 75 30, 75 30 L 75 70 C 75 70, 52 75, 50 70 C 48 75, 25 70, 25 70 Z"
                            fill={`url(#grad-${variant})`} stroke="white" strokeWidth="1" strokeOpacity="0.4" />
                        <path d="M50 30 L 50 70" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                    </svg>
                );
            case 'pulse':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                        <defs>
                            <radialGradient id={`grad-${variant}`} cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                                <stop offset="0%" stopColor="#FFD180" stopOpacity="0.9" />
                                <stop offset="50%" stopColor={color} stopOpacity="0.5" />
                                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
                            </radialGradient>
                            <filter id="glow-pulse" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="10" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Organic Blob Shape - Twisted Torus approximation */}
                        <path d="M 30,50 C 15,20 60,10 70,35 C 80,60 90,50 80,75 C 70,100 20,90 30,50 Z"
                            fill={`url(#grad-${variant})`} filter="url(#glow-pulse)" opacity="0.8" />

                        {/* Highlight */}
                        <path d="M 35,45 C 25,30 50,25 55,40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" filter="blur(1px)" />
                    </svg>
                );
            case 'chart':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id={`grad-${variant}`} x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                                <stop offset="100%" stopColor="white" stopOpacity="0.6" />
                            </linearGradient>
                        </defs>
                        <rect x="25" y="55" width="15" height="25" rx="3" fill={`url(#grad-${variant})`} stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                        <rect x="45" y="40" width="15" height="40" rx="3" fill={`url(#grad-${variant})`} stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                        <rect x="65" y="25" width="15" height="55" rx="3" fill={`url(#grad-${variant})`} stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Background Glow Aura */}
            <div className="absolute inset-0 rounded-full blur-2xl opacity-40 bg-gradient-to-br from-white/10 to-transparent"
                style={{ backgroundColor: color }} />

            {/* The 3D Glass SVG Shape */}
            <div className="relative w-full h-full z-0 opacity-80 scale-125">
                {renderShape()}
            </div>

            {/* Floating Icon Overlay */}
            <div className="absolute z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                <Icon className="w-1/2 h-1/2 text-white opacity-90" style={{ color: 'white' }} />
            </div>

            {/* Glossy reflection overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-30 pointer-events-none" />
        </div>
    );
};
