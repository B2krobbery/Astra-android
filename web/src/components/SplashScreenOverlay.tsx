import React, { useState, useEffect } from 'react';
import { Sparkles, Moon } from 'lucide-react';
import { useAstra } from '../context/AstraContext';

const STATUS_MESSAGES = [
  '💫 Calculating planetary transits...',
  '🪐 Aligning Rohini & Ashwini stars...',
  '✨ Preparing your celestial feed...'
];

export const SplashScreenOverlay: React.FC = () => {
  const { t } = useAstra();
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Progress interval (0 to 100% in ~2.1 seconds)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 4;
        if (next > 35 && next <= 70) setStatusIndex(1);
        if (next > 70) setStatusIndex(2);
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      // Start fade out animation
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 400); // 400ms fade out
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0F0C1B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto'
      }}
    >
      {/* Background Nebulae Effects */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(79, 70, 229, 0.1) 60%, transparent 80%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }}
      />

      {/* Pulsing Outer Aura Ring */}
      <div
        style={{
          position: 'relative',
          width: 110,
          height: 110,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 0 40px rgba(245, 158, 11, 0.25)',
          marginBottom: '24px'
        }}
      >
        <Sparkles size={48} color="#FBBF24" className="spin-slow" />
        <Moon
          size={22}
          color="#818CF8"
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px'
          }}
        />
      </div>

      {/* Brand Title */}
      <h1
        className="heading-font"
        style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          letterSpacing: '0.12em',
          background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '6px',
          textAlign: 'center'
        }}
      >
        {t('app_name')}
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: '0.85rem',
          color: 'rgba(248, 250, 252, 0.75)',
          fontWeight: 500,
          marginBottom: '36px',
          letterSpacing: '0.04em',
          textAlign: 'center'
        }}
      >
        Modern Matchmaking, Guided by the Stars ✨
      </p>

      {/* Progress Bar Container */}
      <div
        style={{
          width: '220px',
          height: '6px',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          marginBottom: '16px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
            borderRadius: '9999px',
            transition: 'width 0.08s ease-out',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.8)'
          }}
        />
      </div>

      {/* Dynamic Vedic Status Message */}
      <p
        style={{
          fontSize: '0.78rem',
          color: '#FBBF24',
          fontWeight: 600,
          minHeight: '20px',
          textAlign: 'center',
          transition: 'opacity 0.2s ease'
        }}
      >
        {STATUS_MESSAGES[statusIndex]}
      </p>
    </div>
  );
};
