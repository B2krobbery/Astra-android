import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';

interface VoiceIntroCardProps {
  candidateName: string;
  durationSeconds?: number;
  promptText?: string;
  audioUrl?: string;
}

export const VoiceIntroCard: React.FC<VoiceIntroCardProps> = ({
  candidateName,
  durationSeconds = 15,
  promptText = "Hi, I'd love to connect and see where this goes!",
  audioUrl
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync audioUrl changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [audioUrl]);

  // Fallback timer if no real audioUrl provided
  useEffect(() => {
    let timer: any;
    if (!audioUrl && isPlaying) {
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + (100 / (durationSeconds * 10));
        });
      }, 100);
    } else if (!audioUrl) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, durationSeconds, audioUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (audioUrl) {
      if (!audioRef.current) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          setProgress(0);
        };

        audio.ontimeupdate = () => {
          if (audio.duration && !isNaN(audio.duration)) {
            setProgress((audio.currentTime / audio.duration) * 100);
          }
        };

        audio.onerror = (err) => {
          console.error("Audio playback error:", err);
          setIsPlaying(false);
        };
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Failed to play audio:", err);
          setIsPlaying(false);
        });
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        padding: '5px 12px 5px 6px',
        borderRadius: '9999px',
        background: 'rgba(14, 11, 22, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        width: 'fit-content',
        maxWidth: '100%',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Play/Pause Gold Button */}
      <button
        onClick={togglePlay}
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8942E 100%)',
          color: '#0B0B0E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: isPlaying ? '0 0 10px rgba(212, 175, 55, 0.7)' : '0 1px 4px rgba(0,0,0,0.3)',
          transition: 'transform 0.15s ease'
        }}
      >
        {isPlaying ? (
          <Pause size={11} fill="#0B0B0E" />
        ) : (
          <Play size={11} fill="#0B0B0E" style={{ marginLeft: 1 }} />
        )}
      </button>

      {/* Label & Dynamic Visualizer Bars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Mic size={10} color="var(--accent-amber)" />
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--accent-amber-light)',
            letterSpacing: '0.2px',
            whiteSpace: 'nowrap'
          }}
        >
          Voice Intro
        </span>

        {/* Mini Waveform Bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '11px', width: '44px' }}>
          {[40, 80, 50, 100, 60, 90, 45, 75].map((heightPct, idx) => {
            const barProgress = (idx / 8) * 100;
            const isActive = barProgress <= progress;
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: isPlaying
                    ? `${Math.max(25, heightPct * (0.4 + Math.random() * 0.7))}%`
                    : `${Math.max(20, heightPct * 0.45)}%`,
                  borderRadius: '9999px',
                  background: isActive
                    ? 'linear-gradient(180deg, #FDE68A 0%, #D4AF37 100%)'
                    : 'rgba(255, 255, 255, 0.25)',
                  transition: 'height 0.15s ease'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.65)', flexShrink: 0 }}>
        0:{isPlaying ? String(Math.floor((progress / 100) * durationSeconds)).padStart(2, '0') : durationSeconds}
      </span>
    </div>
  );
};
