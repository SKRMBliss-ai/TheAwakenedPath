import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, Download, Heart, MessageSquare, Clock, Music, Volume2, Sparkles, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { type SacredTrack, SACRED_TRACKS } from './musicData';
import { getRegionalPrice, getWhatsAppLink } from './priceService';
import { useTheme } from '../../theme/ThemeSystem';
import { useAuth } from '../auth/AuthContext';
import { useRazorpay } from '../../hooks/useRazorpay';
import { VoiceService, useVoiceStatus } from '../../services/voiceService';
import styles from './MusicHub.module.css';

const MusicCard = ({ 
  track, 
  onDownload, 
  isProcessing, 
  status,
  category,
  activeTrackId,
  isOwned 
}: { 
  track: SacredTrack, 
  onDownload: (t: SacredTrack) => void, 
  isProcessing: boolean,
  status: 'idle' | 'playing' | 'paused' | 'buffering',
  category: 'tts' | 'music' | null,
  activeTrackId: string | null,
  isOwned: boolean
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [localProcessing, setLocalProcessing] = useState(false);
  const isVisiblePlaying = activeTrackId === track.id && status === 'playing' && category === 'music' && !localProcessing;
  const isActive = activeTrackId === track.id;
  const regionalPrice = getRegionalPrice(track.priceUSD);
  const { mode } = useTheme();

  const togglePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isVisiblePlaying) {
      VoiceService.pause();
    } else if (isActive && status === 'paused') {
      VoiceService.resume('music');
    } else {
      setLocalProcessing(true);
      try {
        let urlToPlay = localUrl;
        if (!urlToPlay) {
          urlToPlay = await VoiceService.getCloakedUrl(track.id, track.audioPath);
          setLocalUrl(urlToPlay);
        }
        await VoiceService.playAudioURL(urlToPlay, undefined, track.id);
      } catch (err: any) {
        console.error("Playback manifest error:", err);
        alert("Unable to reach the sacred vault. Please check your connection.");
      } finally {
        setLocalProcessing(false);
      }
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const menuIcons = {
    Calm: <Volume2 size={14} />,
    Uplifting: <Zap size={14} />,
    Deep: <Sparkles size={14} />,
    Healing: <Heart size={14} />,
    Meditation: <Clock size={14} />
  };

  const coverSrc = track.coverImage 
    ? (mode === 'dark' ? track.coverImage.dark : track.coverImage.light)
    : (mode === 'dark' ? '/sacred-bg-dark.webp' : '/sacred-bg-light.webp');

  return (
    <div className={styles.trackCard} onClick={toggleFlip}>
      <div className={styles.flipRibbon}>
        <div className={styles.flipRibbonInner}>Flip</div>
      </div>
      <motion.div 
        className={styles.cardInner}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* FRONT SIDE */}
        <div className={styles.cardFront}>
          <img 
            src={coverSrc} 
            alt={track.title} 
            className={styles.frontImage} 
            crossOrigin="anonymous"
          />
          <div className={styles.frontOverlay}>
            <button 
              onClick={togglePlay}
              className={cn(
                styles.playButton, 
                isVisiblePlaying && styles.playing,
                localProcessing && styles.loading
              )}
              disabled={localProcessing}
            >
              {localProcessing ? (
                <div className="relative flex items-center justify-center w-full h-full">
                  <Loader2 size={24} className="animate-spin text-black" />
                </div>
              ) : isVisiblePlaying ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" className="ml-1" />
              )}
            </button>
          </div>
          <div className={styles.frontInfo}>
            <h3 className={styles.frontTitle}>{track.title}</h3>
            <p className={styles.frontArtist}>{track.artist}</p>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className={styles.cardBack}>
          <div className={styles.backContent}>
            <div className={styles.backHeader}>
              <div className={styles.titleGroup}>
                <h3 className={styles.backTitle}>{track.title}</h3>
                <div className={styles.moodBadge} onClick={(e) => e.stopPropagation()}>
                  {menuIcons[track.mood]}
                  <span>{track.mood}</span>
                </div>
              </div>
              <div className={styles.duration} onClick={(e) => e.stopPropagation()}>
                <Clock size={12} />
                <span>{track.duration}</span>
              </div>
            </div>
            
            <p className={styles.description}>{track.description}</p>
          </div>

          <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
            <div className={styles.priceTag}>
              <span className={styles.amount}>{regionalPrice.currency} {regionalPrice.amount}</span>
            </div>
            
            <div className={styles.buttons}>
              <button 
                onClick={(e) => { e.stopPropagation(); onDownload(track); }}
                className={styles.buyButton}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : isOwned ? (
                  <>
                    <Download size={16} />
                    <span>Download</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Pay & Download</span>
                  </>
                )}
              </button>
              
              <a 
                href={getWhatsAppLink(track.title)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.waButton}
                onClick={(e) => e.stopPropagation()}
              >
                <MessageSquare size={16} />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const MusicHub = () => {
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { profile } = useAuth();
  const { checkOut, isProcessing: isCheckoutProcessing } = useRazorpay();
  const { status, category, trackId: activeTrackId } = useVoiceStatus(); 
  const [localOwned, setLocalOwned] = useState<string[]>([]);
  
  const ownedTracks = useMemo(() => {
    return Array.from(new Set([
      ...(profile?.purchasedCourses || []),
      ...localOwned
    ]));
  }, [profile?.purchasedCourses, localOwned]);

  useEffect(() => {
    SACRED_TRACKS.forEach(track => {
      if (track.coverImage) {
        document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'preload', as: 'image', href: track.coverImage.dark }));
        document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'preload', as: 'image', href: track.coverImage.light }));
      }
    });

    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = 'https://firebasestorage.googleapis.com';
    document.head.appendChild(link);
  }, []);

  const filteredTracks = activeMood 
    ? SACRED_TRACKS.filter(t => t.mood === activeMood)
    : SACRED_TRACKS;

  const handleDownload = async (track: SacredTrack) => {
    const isOwned = ownedTracks.includes(track.id);

    if (isOwned) {
      try {
        const blobUrl = await VoiceService.getCloakedUrl(track.id, track.audioPath);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${track.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        alert("Verification failed. If you have collected this track, please try again or contact guidance.");
      }
      return;
    }

    if (!profile) {
      alert("Please sign in to proceed with the purchase.");
      return;
    }

    const price = getRegionalPrice(track.priceUSD);
    
    setProcessingId(track.id);
    
    checkOut(
      profile.uid,
      profile.email || '',
      profile.displayName || 'Friend',
      track.id,
      price.currency,
      async () => {
        setProcessingId(null);
        setLocalOwned(prev => [...prev, track.id]);
        alert(`Deep Gratitude. Your purchase of "${track.title}" is confirmed. Your high-quality download will begin now.`);
        
        try {
          const blobUrl = await VoiceService.getCloakedUrl(track.id, track.audioPath);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${track.title}.mp3`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error("Auto-download failed:", err);
        }
      }
    );
  };

  // Reset processingId if isCheckoutProcessing becomes false (for cancellation)
  useEffect(() => {
    if (!isCheckoutProcessing) {
      setProcessingId(null);
    }
  }, [isCheckoutProcessing]);

  return (
    <div className={styles.container}>
      <header className={styles.hubHeader}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.headerGlow}
        />
        <div className={styles.headerContent}>
          <div className={styles.eyebrow}>
            <Music size={14} />
            <span>Sacred Soundscapes</span>
          </div>
          <h1 className={styles.title}>Transcend Through <em>Vibration</em></h1>
          <p className={styles.subtitle}>
            Premium sacred sonic journeys designed for deep contemplation and cellular resonance. 
            Available for individual collection.
          </p>
        </div>
      </header>

      <div className={styles.filterBar}>
        {['All', 'Meditation', 'Calm', 'Uplifting', 'Deep', 'Healing'].map(mood => (
          <button
            key={mood}
            onClick={() => setActiveMood(mood === 'All' ? null : mood)}
            className={cn(
              styles.filterTab, 
              (mood === 'All' ? activeMood === null : activeMood === mood) && styles.activeTab
            )}
          >
            {mood}
          </button>
        ))}
      </div>

      <div className={styles.trackGrid}>
        <AnimatePresence mode='popLayout'>
          {filteredTracks.map(track => {
            console.log(`[MusicHub] Rendering track ${track.id}: isProcessing=${isCheckoutProcessing && processingId === track.id} (globalProccessing=${isCheckoutProcessing}, pID=${processingId})`);
            return (
              <MusicCard 
                key={track.id} 
                track={track} 
                onDownload={handleDownload} 
                isProcessing={isCheckoutProcessing && processingId === track.id}
                activeTrackId={activeTrackId}
                status={status}
                category={category}
                isOwned={ownedTracks.includes(track.id)}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <footer className={styles.hubFooter}>
        <div className={styles.customRequest}>
          <Sparkles className={styles.footerIcon} />
          <h3>Need a Longer Session?</h3>
          <p className="hidden md:block">We can create extended versions (1h, 3h, or 10h) of any track for your deep meditation or sleep.</p>
          <a 
            href={getWhatsAppLink('Sacred Sounds Custom', '3')}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerWa}
          >
            Request Extensions (1h - 10h)
          </a>
        </div>
      </footer>
    </div>
  );
};
