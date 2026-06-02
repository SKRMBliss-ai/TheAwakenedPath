import { useRef, useEffect } from 'react';
import type { MeditationParticipant } from '../types';

const ParticipantTile = ({ participant, stream, isLocal = false, size = 'md' }:
  { participant: MeditationParticipant; stream?: MediaStream; isLocal?: boolean; size?: 'sm'|'md' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current && stream) { videoRef.current.srcObject = stream; videoRef.current.muted = true; }
  }, [stream]);

  const hasVideo = !!stream && participant.videoEnabled;
  const initials = participant.displayName.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const sz = size === 'sm' ? 'w-14 h-14' : 'w-20 h-20 md:w-24 md:h-24';

  return (
    <div className={`relative ${sz} rounded-2xl overflow-hidden flex-shrink-0 border border-amber-400/20 shadow-[0_0_12px_rgba(212,175,55,0.15)]`}>
      {hasVideo
        ? <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isLocal?'scale-x-[-1]':''}`} />
        : <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            {participant.avatarUrl
              ? <img src={participant.avatarUrl} alt={participant.displayName} className="w-full h-full object-cover opacity-70" />
              : <span className="text-amber-400 font-black text-lg">{initials}</span>}
          </div>
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1">
        <p className="text-white/80 text-[8px] font-bold truncate">{isLocal ? 'You' : participant.displayName.split(' ')[0]}</p>
      </div>
      {isLocal && <div className="absolute top-1 left-1 bg-amber-400/80 text-black text-[7px] font-black px-1 rounded">YOU</div>}
    </div>
  );
};

export default ParticipantTile;
