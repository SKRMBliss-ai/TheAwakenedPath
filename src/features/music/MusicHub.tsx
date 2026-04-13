import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, Download, Volume2, MessageSquare, Music, Clock, Heart, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { type SacredTrack, SACRED_TRACKS } from './musicData';
import { getRegionalPrice, getWhatsAppLink } from './priceService';
import { useTheme } from '../../theme/ThemeSystem';
import { useAuth } from '../auth/AuthContext';
import { useRazorpay } from '../../hooks/useRazorpay';
import { VoiceService, useVoiceStatus } from '../../services/voiceService';
import { VoiceGuidance } from '../../components/ui/VoiceGuidance';
import styles from './MusicHub.module.css';

const MusicCard = ({ 
  track, 
  onDownload, 
  isProcessing, 
  isActive, 
  status,
  isOwned 
}: { 
  track: SacredTrack, 
  onDownload: (t: SacredTrack) => void, 
  isProcessing: boolean,
  isActive: boolean,
  status: 'idle' | 'playing' | 'paused' | 'buffering',
  isOwned: boolean
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isPlaying = isActive && status === 'playing';
  const regionalPrice = getRegionalPrice(track.priceUSD);
  const { mode } = useTheme();

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      VoiceService.pause();
    } else if (isActive && status === 'paused') {
      VoiceService.resume();
    } else {
      VoiceService.playAudioURL(track.previewUrl);
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const menuIcons = {
    Calm: <Volume2 size={14} />,
    Uplifting: <Zap size={14} />,
    Deep: <Sparkles size={14} />,
    Healing: <Heart size={14} />
  };

  const coverSrc = track.coverImage 
    ? (mode === 'dark' ? track.coverImage.dark : track.coverImage.light)
    : (mode === 'dark' ? '/sacred-bg-dark.png' : '/sacred-bg-light.png'); // Placeholder

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
          <img src={coverSrc} alt={track.title} className={styles.frontImage} />
          <div className={styles.frontOverlay}>
            <button 
              onClick={togglePlay}
              className={cn(styles.playButton, isPlaying && styles.playing)}
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
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
              <span className={styles.currency}>{regionalPrice.currency}</span>
              <span className={styles.amount}>{regionalPrice.amount}</span>
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

      {/* Audio/Video handling is now centralized in VoiceService */}
    </div>
  );
};

export const MusicHub = () => {
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const { profile } = useAuth();
  const { checkOut, isProcessing: isCheckoutProcessing } = useRazorpay();
  const status = useVoiceStatus(); 
  const [activeTrackUrl, setActiveTrackUrl] = useState<string | null>(null);
  const [localOwned, setLocalOwned] = useState<string[]>([]);
  
  // Combine Firestore profile owned with local temporary owned for immediate feedback
  const ownedTracks = useMemo(() => {
    return Array.from(new Set([
      ...(profile?.purchasedCourses || []),
      ...localOwned
    ]));
  }, [profile?.purchasedCourses, localOwned]);

  // Sync active track URL with VoiceService
  useEffect(() => {
    // Initial sync
    setActiveTrackUrl(VoiceService.currentUrl);
    
    // Subscribe to changes
    return VoiceService.subscribe(() => {
      setActiveTrackUrl(VoiceService.currentUrl);
    });
  }, []);

  const filteredTracks = activeMood 
    ? SACRED_TRACKS.filter(t => t.mood === activeMood)
    : SACRED_TRACKS;

  const handleDownload = (track: SacredTrack) => {
    const isOwned = ownedTracks.includes(track.id);

    if (isOwned) {
      // Direct Download for owned tracks
      const link = document.createElement('a');
      link.href = track.previewUrl; // Replace with high-quality URL in production
      link.download = `${track.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!profile) {
      alert("Please sign in to proceed with the purchase.");
      return;
    }

    const price = getRegionalPrice(track.priceUSD);
    
    // Trigger real Razorpay checkout
    checkOut(
      profile.uid,
      profile.email || '',
      profile.displayName || 'Traveler',
      track.id,
      price.currency,
      () => {
        // 1. Immediate UI Feedback
        setLocalOwned(prev => [...prev, track.id]);
        
        // 2. Clear Communication
        alert(`Deep Gratitude. Your purchase of "${track.title}" is confirmed. Your high-quality download will begin now.`);
        
        // 3. Trigger Download
        const link = document.createElement('a');
        link.href = track.previewUrl; // Replace with high-quality URL in production
        link.download = `${track.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    );
  };

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
        {['All', 'Calm', 'Uplifting', 'Deep', 'Healing'].map(mood => (
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
          {filteredTracks.map(track => (
            <MusicCard 
              key={track.id} 
              track={track} 
              onDownload={handleDownload} 
              isProcessing={isCheckoutProcessing}
              isActive={activeTrackUrl === track.previewUrl}
              status={status}
              isOwned={ownedTracks.includes(track.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      <footer className={styles.hubFooter}>
        <div className={styles.customRequest}>
          <Sparkles className={styles.footerIcon} />
          <h3>Need a Longer Session?</h3>
          <p>We can create extended versions (1h, 3h, or 10h) of any track for your deep meditation or sleep.</p>
          <a 
            href={getWhatsAppLink('Sacred Sounds Custom', '3')}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerWa}
          >
            Request Custom Length via WhatsApp
          </a>
        </div>
      </footer>

      <VoiceGuidance activeTab="music" isAccessValid={true} />
    </div>
  );
};
