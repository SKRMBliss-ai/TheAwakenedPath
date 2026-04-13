import { useState, useRef } from 'react';
import { Play, Pause, Download, Volume2, MessageSquare, Music, Clock, Sparkles, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { type SacredTrack, SACRED_TRACKS } from './musicData';
import { getRegionalPrice, getWhatsAppLink } from './priceService';
import styles from './MusicHub.module.css';

const MusicCard = ({ track, onDownload }: { track: SacredTrack, onDownload: (t: SacredTrack) => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const regionalPrice = getRegionalPrice(track.priceUSD);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Pause all other audios first? (Simple version: just handle this one)
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const menuIcons = {
    Calm: <Volume2 size={14} />,
    Uplifting: <Zap size={14} />,
    Deep: <Sparkles size={14} />,
    Healing: <Heart size={14} />
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.trackCard}
    >
      <div className={styles.cardHeader}>
        <div className={styles.moodBadge}>
          {menuIcons[track.mood]}
          <span>{track.mood}</span>
        </div>
        <div className={styles.duration}>
          <Clock size={12} />
          <span>{track.duration}</span>
        </div>
      </div>

      <div className={styles.cardMain}>
        <div className={styles.titleGroup}>
          <h3 className={styles.trackTitle}>{track.title}</h3>
          <p className={styles.artistName}>{track.artist}</p>
        </div>
        
        <button 
          onClick={togglePlay}
          className={cn(styles.playButton, isPlaying && styles.playing)}
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
      </div>

      <p className={styles.description}>{track.description}</p>

      <div className={styles.actionRow}>
        <div className={styles.priceTag}>
          <span className={styles.currency}>{regionalPrice.currency}</span>
          <span className={styles.amount}>{regionalPrice.amount}</span>
        </div>
        
        <div className={styles.buttons}>
          <button 
            onClick={() => onDownload(track)}
            className={styles.buyButton}
          >
            <Download size={16} />
            <span>Pay & Download</span>
          </button>
          
          <a 
            href={getWhatsAppLink(track.title)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waButton}
            title="Request Extended Version"
          >
            <MessageSquare size={16} />
          </a>
        </div>
      </div>

      <audio 
        ref={audioRef}
        src={track.previewUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </motion.div>
  );
};

export const MusicHub = () => {
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const filteredTracks = activeMood 
    ? SACRED_TRACKS.filter(t => t.mood === activeMood)
    : SACRED_TRACKS;

  const handleDownload = (track: SacredTrack) => {
    // In a real app, this would trigger the Razorpay checkout
    // For now, we'll alert and show the intent
    const price = getRegionalPrice(track.priceUSD);
    alert(`Initializing secure payment of ${price.formatted} for ${track.title}.\n\nAfter payment, your high-quality MP3 download will begin automatically.`);
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
            <span>Sacred Sounds Sanctuary</span>
          </div>
          <h1 className={styles.title}>Transcend Through <em>Vibration</em></h1>
          <p className={styles.subtitle}>
            Premium AI-composed sonic journeys designed for deep contemplation and cellular resonance. 
            Available for individual collection.
          </p>
        </div>
      </header>

      <div className={styles.filterBar}>
        {['Calm', 'Uplifting', 'Deep', 'Healing'].map(mood => (
          <button
            key={mood}
            onClick={() => setActiveMood(activeMood === mood ? null : mood)}
            className={cn(styles.filterTab, activeMood === mood && styles.activeTab)}
          >
            {mood}
          </button>
        ))}
      </div>

      <div className={styles.trackGrid}>
        <AnimatePresence mode='popLayout'>
          {filteredTracks.map(track => (
            <MusicCard key={track.id} track={track} onDownload={handleDownload} />
          ))}
        </AnimatePresence>
      </div>

      <footer className={styles.hubFooter}>
        <div className={styles.customRequest}>
          <Sparkles className={styles.footerIcon} />
          <h3>Need a Longer Session?</h3>
          <p>We can generate extended versions (1h, 3h, or 10h) of any track for your deep meditation or sleep.</p>
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
    </div>
  );
};
