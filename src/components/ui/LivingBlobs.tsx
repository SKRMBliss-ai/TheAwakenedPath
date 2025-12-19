import React from 'react';

const LivingBlobs: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Blob 1 */}
            <div
                className="living-blob w-[300px] h-[300px] -top-20 -left-20"
                style={{
                    background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)',
                    animationDelay: '0s'
                }}
            />
            {/* Blob 2 */}
            <div
                className="living-blob w-[400px] h-[400px] top-[40%] -right-20"
                style={{
                    background: 'radial-gradient(circle, var(--card-glow-pulse) 0%, transparent 70%)',
                    animationDelay: '-4s'
                }}
            />
            {/* Blob 3 */}
            <div
                className="living-blob w-[250px] h-[250px] -bottom-10 left-[20%]"
                style={{
                    background: 'radial-gradient(circle, var(--brand-secondary) 0%, transparent 70%)',
                    animationDelay: '-2s'
                }}
            />

            {/* Gooey Filter Definition */}
            <svg className="hidden">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -15" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>
        </div>
    );
};

export default LivingBlobs;
