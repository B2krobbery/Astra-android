import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2, Volume2, Sparkles, AlertCircle } from 'lucide-react';
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
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioUrl]);

  // Recording Timer Effect
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordTime(prev => {
          if (prev >= 15) {
            handleStopRecord();
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

  // Real Audio Playback Handling
  const handleTogglePlay = () => {
    if (!audioRef.current && audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlayProgress(0);
      };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setPlayProgress(progress || 0);
        }
      };
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      }
    } else {
      // Fallback timer playback simulation if audio blob URL not supported
      setIsPlaying(!isPlaying);
    }
  };

  const handleStartRecord = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasVoiceNote(true);
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setRecordTime(0);
      setIsRecording(true);
      setHasVoiceNote(false);
    } catch (err: any) {
      console.error('Microphone Access Error:', err);
      setPermissionError('Microphone permission required. Please allow microphone access in your device settings.');
    }
  };

  const handleStopRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleDeleteVoiceNote = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
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

      {/* Permission Error Banner */}
      {permissionError && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #EF4444',
            color: '#FCA5A5',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
          <span>{permissionError}</span>
        </div>
      )}

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
              onClick={handleTogglePlay}
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
