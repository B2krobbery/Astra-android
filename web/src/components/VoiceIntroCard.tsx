import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';

interface VoiceIntroCardProps {
  candidateName: string;
  durationSeconds?: number;
  promptText?: string;
}

export const VoiceIntroCard: React.FC<VoiceIntroCardProps> = ({
  candidateName,
  durationSeconds = 15,
  promptText = "My ideal Sunday in Indiranagar & favorite filter coffee spots..."
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + (100 / (durationSeconds * 10));
        });
      }, 100);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, durationSeconds]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(30, 24, 54, 0.9) 0%, rgba(42, 14, 26, 0.85) 100%)',
        border: '1px solid var(--border-glow)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mic size={14} color="var(--accent-rose)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber-light)', textTransform: 'uppercase' }}>
            {candidateName}'s Voice Note 🎙️
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          0:{isPlaying ? String(Math.floor((progress / 100) * durationSeconds)).padStart(2, '0') : durationSeconds}
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        "{promptText}"
      </p>

      {/* Audio Waveform Bar Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
        <button
          onClick={togglePlay}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
            color: '#0F0C1B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}
        >
          {isPlaying ? <Pause size={18} fill="#0F0C1B" /> : <Play size={18} fill="#0F0C1B" style={{ marginLeft: 2 }} />}
        </button>

        {/* Waveform Equalizer Visualizer */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '3px', height: '28px' }}>
          {[35, 60, 85, 40, 95, 70, 50, 90, 65, 40, 80, 55, 90, 75, 45, 85, 60, 30].map((heightPct, idx) => {
            const barProgress = (idx / 18) * 100;
            const isActive = barProgress <= progress;
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: isPlaying ? `${Math.max(20, (heightPct * (0.6 + Math.random() * 0.5)))}%` : `${heightPct}%`,
                  borderRadius: '9999px',
                  background: isActive ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.15)',
                  transition: 'height 0.15s ease, background 0.15s ease'
                }}
              />
            );
          })}
        </div>

        <Volume2 size={16} color="var(--text-muted)" />
      </div>
    </div>
  );
};
