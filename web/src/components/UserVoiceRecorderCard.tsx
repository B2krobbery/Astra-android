import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2, Volume2, Sparkles } from 'lucide-react';
import { useAstra } from '../context/AstraContext';

const samplePrompts = [
  "My ideal Sunday in Bengaluru & favorite filter coffee spots...",
  "My Nakshatra superpower & what drives my ambition...",
  "The quickest way to win my heart & make me laugh...",
  "Why I'm excited to meet a compatible celestial match..."
];

export const UserVoiceRecorderCard: React.FC = () => {
  const { userProfile, updateProfileInfo, t } = useAstra();
  
  const [selectedPrompt, setSelectedPrompt] = useState(
    userProfile.voiceNotePrompt || samplePrompts[0]
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [hasVoiceNote, setHasVoiceNote] = useState(!!userProfile.hasVoiceNote);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);

  // Recording Timer Effect
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordTime(prev => {
          if (prev >= 15) {
            setIsRecording(false);
            setHasVoiceNote(true);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Playback Timer Effect
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + (100 / (recordTime || 12) / 10);
        });
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, recordTime]);

  const handleStartRecord = () => {
    setRecordTime(0);
    setIsRecording(true);
    setHasVoiceNote(false);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    setHasVoiceNote(true);
  };

  const handleDeleteVoiceNote = () => {
    setHasVoiceNote(false);
    setIsPlaying(false);
    setRecordTime(0);
    setPlayProgress(0);
  };

  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(42, 14, 26, 0.9) 0%, rgba(30, 24, 54, 0.9) 100%)',
        border: '1.5px solid var(--accent-amber)',
        boxShadow: 'var(--shadow-cosmic)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mic size={20} color="var(--accent-amber)" />
          <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
            Voice Intro Note 🎙️
          </h3>
        </div>
        {hasVoiceNote && (
          <span style={{ fontSize: '0.75rem', color: '#4ADE80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> Recorded (0:{String(recordTime || 12).padStart(2, '0')})
          </span>
        )}
      </div>

      {/* Voice Prompt Dropdown Selector */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select Audio Prompt Question</label>
        <select
          value={selectedPrompt}
          onChange={e => setSelectedPrompt(e.target.value)}
          disabled={isRecording}
          style={{
            width: '100%',
            marginTop: '4px',
            padding: '10px 14px',
            borderRadius: '14px',
            background: '#0F0C1B',
            border: '1px solid var(--border-color)',
            color: '#FFF',
            fontSize: '0.8rem'
          }}
        >
          {samplePrompts.map((p, idx) => (
            <option key={idx} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Recording / Playback View */}
      {isRecording ? (
        <div
          style={{
            padding: '16px',
            borderRadius: '18px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F43F5E' }} className="pulse-glow" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>
              Recording... 0:{String(recordTime).padStart(2, '0')} / 0:15
            </span>
          </div>

          <button
            onClick={handleStopRecord}
            style={{
              padding: '8px 14px',
              borderRadius: '9999px',
              border: 'none',
              background: '#F43F5E',
              color: '#FFF',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Square size={14} fill="#FFF" /> Stop
          </button>
        </div>
      ) : hasVoiceNote ? (
        <div
          style={{
            padding: '16px',
            borderRadius: '18px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <p style={{ fontSize: '0.8rem', color: '#F8FAFC', fontStyle: 'italic' }}>
            "{selectedPrompt}"
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
                color: '#0F0C1B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isPlaying ? <Pause size={16} fill="#0F0C1B" /> : <Play size={16} fill="#0F0C1B" style={{ marginLeft: 2 }} />}
            </button>

            {/* Waveform Visualization */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '3px', height: '24px' }}>
              {[40, 70, 90, 50, 80, 60, 95, 45, 85, 65, 35, 75, 55, 90, 40].map((h, idx) => {
                const isActive = (idx / 15) * 100 <= playProgress;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      height: isPlaying ? `${Math.max(20, h * (0.6 + Math.random() * 0.5))}%` : `${h}%`,
                      borderRadius: '9999px',
                      background: isActive ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.2)',
                      transition: 'height 0.15s ease'
                    }}
                  />
                );
              })}
            </div>

            <button
              onClick={handleDeleteVoiceNote}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
              title="Delete Voice Note"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleStartRecord}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
            border: 'none',
            color: '#0F0C1B',
            fontWeight: 800,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-cosmic)'
          }}
        >
          <Mic size={18} /> Record 15s Voice Intro Note
        </button>
      )}
    </div>
  );
};
