import React from 'react';

interface InfoProps {
  isDark: boolean;
  type: 'intro' | 'root_cause' | 'flawed_advisor' | 'one_root' | 'shift' | 'listener' | 'grip' | 'meditation';
}

export const Q2Infographic: React.FC<InfoProps> = ({ isDark, type }) => {
  const ink = isDark ? '#FDFAF4' : '#1C1814';
  const inkSoft = isDark ? 'rgba(253,250,244,0.6)' : 'rgba(28,24,20,0.6)';
  const bgSurface = isDark ? '#26221E' : '#F5EDD8';
  const bgPrimary = isDark ? '#1C1814' : '#FDFAF4';
  const gold = isDark ? '#E6C57D' : '#8B6D1B';
  const goldLight = isDark ? 'rgba(230, 197, 125, 0.15)' : 'rgba(184, 151, 58, 0.1)';

  const containerStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '4/3',
    backgroundColor: bgSurface,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: `0 10px 40px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
    fontFamily: '"DM Sans", sans-serif',
    border: `1px solid ${goldLight}`
  };

  switch (type) {
    case 'intro':
      return (
        <div style={containerStyle}>
          <svg viewBox="0 0 400 300" width="100%" height="100%">
            {/* The Bed/You */}
            <circle cx="200" cy="240" r="30" fill={goldLight} />
            <text x="200" y="245" textAnchor="middle" fill={ink} fontSize="14" fontWeight="500">YOU</text>
            
            {/* Thoughts branching out */}
            <path d="M 200 200 Q 140 140 80 100" stroke={gold} strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            <path d="M 200 200 Q 200 140 200 80" stroke={gold} strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            <path d="M 200 200 Q 260 140 320 100" stroke={gold} strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            
            {/* Thought Bubbles */}
            <g transform="translate(30, 60)">
              <rect x="0" y="0" width="100" height="40" rx="20" fill={bgPrimary} stroke={inkSoft} />
              <text x="50" y="24" textAnchor="middle" fill={ink} fontSize="12">Past Guilt</text>
            </g>

            <g transform="translate(150, 40)">
              <rect x="0" y="0" width="100" height="40" rx="20" fill={bgPrimary} stroke={inkSoft} />
              <text x="50" y="24" textAnchor="middle" fill={ink} fontSize="12">Future Worry</text>
            </g>

            <g transform="translate(270, 60)">
              <rect x="0" y="0" width="100" height="40" rx="20" fill={bgPrimary} stroke={inkSoft} />
              <text x="50" y="24" textAnchor="middle" fill={ink} fontSize="12">"What if..."</text>
            </g>

            <text x="200" y="285" textAnchor="middle" fill={inkSoft} fontSize="11" fontStyle="italic">The mind generates noise out of nowhere</text>
          </svg>
        </div>
      );

    case 'root_cause':
      return (
        <div style={containerStyle}>
          <svg viewBox="0 0 400 300" width="100%" height="100%">
            {/* Outer environment */}
            <text x="200" y="40" textAnchor="middle" fill={inkSoft} fontSize="12">Ambiguous Events / External World</text>
            
            {/* Shield (The Mind) */}
            <circle cx="200" cy="160" r="90" fill="none" stroke={gold} strokeWidth="2" strokeDasharray="8 4" />
            <text x="200" y="85" textAnchor="middle" fill={gold} fontSize="11" fontWeight="bold">THE MIND (Protecting)</text>

            {/* Core (You/Fear) */}
            <circle cx="200" cy="160" r="40" fill={goldLight} />
            <text x="200" y="155" textAnchor="middle" fill={ink} fontSize="12" fontWeight="bold">CORE</text>
            <text x="200" y="170" textAnchor="middle" fill={ink} fontSize="10">"Am I safe?"</text>

            {/* Arrows pointing in */}
            <path d="M 200 50 L 200 110" stroke={inkSoft} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <path d="M 100 100 L 140 130" stroke={inkSoft} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <path d="M 300 100 L 260 130" stroke={inkSoft} strokeWidth="2" markerEnd="url(#arrowhead)" />
            
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={inkSoft} />
              </marker>
            </defs>
          </svg>
        </div>
      );

    case 'flawed_advisor':
      return (
        <div style={containerStyle}>
          <svg viewBox="0 0 400 300" width="100%" height="100%">
            <defs>
              <marker id="goldArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={gold} />
              </marker>
            </defs>

            {/* Cyclic Loop */}
            <path d="M 120 150 A 80 80 0 1 1 280 150 A 80 80 0 1 1 120 150" fill="none" stroke={gold} strokeWidth="3" markerEnd="url(#goldArrow)" strokeDasharray="250 10" />
            
            {/* Top Node */}
            <g transform="translate(140, 50)">
              <rect x="0" y="0" width="120" height="40" rx="6" fill={bgPrimary} stroke={ink} strokeWidth="1.5" />
              <text x="60" y="24" textAnchor="middle" fill={ink} fontSize="12" fontWeight="bold">Anxious Mind</text>
            </g>

            {/* Bottom Node */}
            <g transform="translate(140, 210)">
              <rect x="0" y="0" width="120" height="40" rx="6" fill={bgPrimary} stroke={ink} strokeWidth="1.5" />
              <text x="60" y="24" textAnchor="middle" fill={ink} fontSize="12" fontWeight="bold">More Anxiety</text>
            </g>
            
            {/* Labels on sides */}
            <text x="320" y="150" textAnchor="middle" fill={inkSoft} fontSize="11" fontStyle="italic">Tries to solve</text>
            <text x="80" y="150" textAnchor="middle" fill={inkSoft} fontSize="11" fontStyle="italic">Generates</text>
            
            <text x="200" y="150" textAnchor="middle" fill={ink} fontSize="14" fontWeight="500">FLAWED</text>
            <text x="200" y="168" textAnchor="middle" fill={ink} fontSize="14" fontWeight="500">ADVISOR</text>
          </svg>
        </div>
      );

    case 'one_root':
      return (
        <div style={containerStyle}>
          <svg viewBox="0 0 400 300" width="100%" height="100%">
            {/* Center Root */}
            <circle cx="200" cy="150" r="35" fill={goldLight} stroke={gold} />
            <text x="200" y="145" textAnchor="middle" fill={ink} fontSize="12" fontWeight="bold">ROOT</text>
            <text x="200" y="160" textAnchor="middle" fill={ink} fontSize="10">"Am I okay?"</text>

            {/* Branches Outward */}
            <path d="M 200 115 L 200 50" stroke={gold} strokeWidth="2" fill="none" />
            <text x="200" y="40" textAnchor="middle" fill={inkSoft} fontSize="11">Work Message</text>
            
            <path d="M 230 135 L 320 90" stroke={gold} strokeWidth="2" fill="none" />
            <text x="330" y="80" textAnchor="middle" fill={inkSoft} fontSize="11">Social Event</text>

            <path d="M 230 165 L 320 210" stroke={gold} strokeWidth="2" fill="none" />
            <text x="330" y="225" textAnchor="middle" fill={inkSoft} fontSize="11">Past Mistake</text>

            <path d="M 170 165 L 80 210" stroke={gold} strokeWidth="2" fill="none" />
            <text x="70" y="225" textAnchor="middle" fill={inkSoft} fontSize="11">Future Plans</text>

            <path d="M 170 135 L 80 90" stroke={gold} strokeWidth="2" fill="none" />
            <text x="70" y="80" textAnchor="middle" fill={inkSoft} fontSize="11">Health Worry</text>

            <circle cx="200" cy="150" r="100" fill="none" stroke={inkSoft} strokeWidth="1" strokeDasharray="4 6" />
            <text x="200" y="280" textAnchor="middle" fill={ink} fontSize="12" fontWeight="bold">TEN THOUSAND FACES</text>
          </svg>
        </div>
      );

    case 'shift':
      return (
        <div style={containerStyle}>
          <svg viewBox="0 0 400 300" width="100%" height="100%">
            <defs>
              <marker id="redArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={inkSoft} />
              </marker>
            </defs>

            {/* The Mind Box */}
            <rect x="50" y="50" width="180" height="200" rx="8" fill={goldLight} stroke={gold} />
            <text x="140" y="80" textAnchor="middle" fill={ink} fontSize="12" fontWeight="bold">THE MIND (Narrator)</text>
            
            <rect x="70" y="100" width="140" height="30" rx="4" fill={bgSurface} />
            <text x="140" y="119" textAnchor="middle" fill={inkSoft} fontSize="11">"What if I fail?"</text>

            <rect x="70" y="140" width="140" height="30" rx="4" fill={bgSurface} />
            <text x="140" y="159" textAnchor="middle" fill={inkSoft} fontSize="11">"They are mad at me"</text>

            <rect x="70" y="180" width="140" height="30" rx="4" fill={bgSurface} />
            <text x="140" y="199" textAnchor="middle" fill={inkSoft} fontSize="11">"I must fix this"</text>

            {/* The Watcher stepping back */}
            <circle cx="320" cy="150" r="30" fill={bgPrimary} stroke={ink} strokeWidth="2" />
            <text x="320" y="146" textAnchor="middle" fill={ink} fontSize="12" fontWeight="bold">YOU</text>
            <text x="320" y="160" textAnchor="middle" fill={inkSoft} fontSize="10">(Watcher)</text>

            {/* Observation Line */}
            <path d="M 290 150 L 240 150" stroke={ink} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#redArrow)" />
            <text x="265" y="140" textAnchor="middle" fill={ink} fontSize="10" fontWeight="500">Observing</text>

            <text x="200" y="280" textAnchor="middle" fill={inkSoft} fontSize="12" fontStyle="italic">Stepping out of the narrative to watch it play out</text>
          </svg>
        </div>
      );

    case 'listener':
      return (
        <div style={containerStyle}>
          <svg viewBox="0 0 400 300" width="100%" height="100%">
            {/* Radio (Mind) */}
            <rect x="40" y="110" width="100" height="80" rx="8" fill={bgPrimary} stroke={gold} strokeWidth="2" />
            <circle cx="70" cy="150" r="15" fill={goldLight} />
            <rect x="100" y="130" width="20" height="10" fill={inkSoft} />
            <rect x="100" y="150" width="20" height="10" fill={inkSoft} />
            <text x="90" y="215" textAnchor="middle" fill={inkSoft} fontSize="11" fontWeight="bold">THE RADIO (Mind)</text>

            {/* Sound waves (Noise) */}
            <path d="M 160 120 Q 180 150 160 180" stroke={gold} strokeWidth="2" fill="none" />
            <path d="M 180 110 Q 210 150 180 190" stroke={gold} strokeWidth="2" fill="none" />
            <path d="M 200 100 Q 240 150 200 200" stroke={gold} strokeWidth="2" fill="none" />
            <text x="180" y="90" textAnchor="middle" fill={inkSoft} fontSize="10">Guilt, Fear, Doubt...</text>

            {/* Listener (You) */}
            <circle cx="320" cy="150" r="35" fill={bgPrimary} stroke={ink} strokeWidth="2" />
            <text x="320" y="148" textAnchor="middle" fill={ink} fontSize="12" fontWeight="bold">YOU</text>
            <text x="320" y="162" textAnchor="middle" fill={inkSoft} fontSize="10">(Listener)</text>
            
            <text x="200" y="260" textAnchor="middle" fill={ink} fontSize="12" fontStyle="italic">You are not the radio. You are the one who hears it.</text>
          </svg>
        </div>
      );

    case 'grip':
      return (
        <div style={containerStyle}>
          <svg viewBox="0 0 400 300" width="100%" height="100%">
            {/* Problem */}
            <rect x="60" y="120" width="80" height="60" rx="4" fill={bgPrimary} stroke={inkSoft} />
            <text x="100" y="154" textAnchor="middle" fill={ink} fontSize="14" fontWeight="bold">Issue</text>

            {/* The fading tether / grip */}
            <path d="M 140 150 L 280 150" stroke={gold} strokeWidth="6" opacity="0.2" fill="none" strokeDasharray="10 10" />
            <text x="210" y="140" textAnchor="middle" fill={gold} fontSize="12" fontStyle="italic">Energy Withdrawn</text>

            {/* The Watcher */}
            <circle cx="320" cy="150" r="40" fill={bgPrimary} stroke={ink} strokeWidth="2" />
            <text x="320" y="148" textAnchor="middle" fill={ink} fontSize="12" fontWeight="bold">YOU</text>
            
            <text x="200" y="240" textAnchor="middle" fill={inkSoft} fontSize="12">When you stop feeding it, the grip loosens naturally.</text>
          </svg>
        </div>
      );

    case 'meditation':
      return (
        <div style={containerStyle}>
          <svg viewBox="0 0 400 300" width="100%" height="100%">
            {/* The still center */}
            <circle cx="200" cy="150" r="45" fill={bgPrimary} stroke={gold} strokeWidth="3" />
            <text x="200" y="145" textAnchor="middle" fill={ink} fontSize="12" fontWeight="bold">AWARENESS</text>
            <text x="200" y="165" textAnchor="middle" fill={gold} fontSize="10" fontStyle="italic">Perfectly Still</text>

            {/* Floating clouds/thoughts */}
            <ellipse cx="100" cy="80" rx="30" ry="20" fill={goldLight} />
            <text x="100" y="83" textAnchor="middle" fill={inkSoft} fontSize="10">Thought</text>

            <ellipse cx="320" cy="100" rx="35" ry="20" fill={goldLight} />
            <text x="320" y="103" textAnchor="middle" fill={inkSoft} fontSize="10">Feeling</text>

            <ellipse cx="120" cy="240" rx="40" ry="20" fill={goldLight} />
            <text x="120" y="243" textAnchor="middle" fill={inkSoft} fontSize="10">Memory</text>

            <ellipse cx="280" cy="220" rx="30" ry="18" fill={goldLight} />
            <text x="280" y="223" textAnchor="middle" fill={inkSoft} fontSize="10">Plan</text>

            {/* Orbit lines to show detachment */}
            <circle cx="200" cy="150" r="110" fill="none" stroke={inkSoft} strokeWidth="1" strokeDasharray="2 8" opacity="0.5" />
          </svg>
        </div>
      );
  }
};
