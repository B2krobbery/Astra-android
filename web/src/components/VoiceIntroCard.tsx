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
      style={{
        padding: '8px 14px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(24, 20, 36, 0.78) 0%, rgba(14, 12, 22, 0.85) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        width: '100%',
        maxWidth: '100%',
        transition: 'border-color 0.25s ease'
      }}
    >
      {/* Play/Pause Gold Button */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={togglePlay}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8942E 100%)',
          color: '#0B0B0E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: isPlaying
            ? '0 0 16px rgba(212, 175, 55, 0.65)'
            : '0 2px 10px rgba(212, 175, 55, 0.25)',
          transition: 'transform 0.15s ease, box-shadow 0.25s ease'
        }}
      >
        {isPlaying ? (
          <Pause size={16} fill="#0B0B0E" />
        ) : (
          <Play size={16} fill="#0B0B0E" style={{ marginLeft: 2 }} />
        )}
      </button>

      {/* Center Details: Prompt & Mini Dynamic Equalizer */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mic size={11} color="var(--accent-amber)" />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--accent-amber-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {candidateName}'s Voice Note
          </span>
        </div>

        {/* Equalizer Visualizer Bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5px', height: '14px', width: '100%' }}>
          {[35, 65, 90, 45, 100, 75, 50, 95, 70, 40, 85, 60, 90, 80, 50, 85].map((heightPct, idx) => {
            const barProgress = (idx / 16) * 100;
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
                    : 'rgba(255, 255, 255, 0.18)',
                  transition: 'height 0.15s ease, background 0.15s ease'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Right Duration Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          padding: '3px 8px',
          borderRadius: '9999px',
          flexShrink: 0
        }}
      >
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-amber-light)' }}>
          0:{isPlaying ? String(Math.floor((progress / 100) * durationSeconds)).padStart(2, '0') : durationSeconds}
        </span>
      </div>
    </div>
  );
};
