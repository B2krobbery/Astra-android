import React from 'react';
import { useAstra } from '../context/AstraContext';

const FLOATING_ITEMS_LIGHT = [
  { icon: '💖', left: '10%', size: '1.4rem', duration: '7s', delay: '0s' },
  { icon: '🌸', left: '22%', size: '1.2rem', duration: '9s', delay: '2s' },
  { icon: '❤️', left: '35%', size: '1.5rem', duration: '6s', delay: '1s' },
  { icon: '✨', left: '48%', size: '1.1rem', duration: '11s', delay: '3s' },
  { icon: '💕', left: '62%', size: '1.4rem', duration: '8s', delay: '0.5s' },
  { icon: '🌸', left: '75%', size: '1.3rem', duration: '10s', delay: '4s' },
  { icon: '💖', left: '88%', size: '1.6rem', duration: '7.5s', delay: '1.5s' },
  { icon: '⭐', left: '15%', size: '1.0rem', duration: '12s', delay: '5s' },
  { icon: '💕', left: '40%', size: '1.3rem', duration: '8.5s', delay: '3.5s' },
  { icon: '✨', left: '68%', size: '1.2rem', duration: '9.5s', delay: '2.5s' },
  { icon: '🌸', left: '82%', size: '1.4rem', duration: '6.8s', delay: '4.5s' }
];

const FLOATING_ITEMS_DARK = [
  { icon: '💖', left: '10%', size: '1.4rem', duration: '7s', delay: '0s' },
  { icon: '✨', left: '22%', size: '1.1rem', duration: '9s', delay: '2s' },
  { icon: '❤️', left: '35%', size: '1.6rem', duration: '6s', delay: '1s' },
  { icon: '🪐', left: '48%', size: '1.2rem', duration: '11s', delay: '3s' },
  { icon: '💖', left: '62%', size: '1.5rem', duration: '8s', delay: '0.5s' },
  { icon: '✨', left: '75%', size: '1.3rem', duration: '10s', delay: '4s' },
  { icon: '❤️', left: '88%', size: '1.7rem', duration: '7.5s', delay: '1.5s' },
  { icon: '⭐', left: '15%', size: '1.0rem', duration: '12s', delay: '5s' },
  { icon: '💕', left: '40%', size: '1.4rem', duration: '8.5s', delay: '3.5s' },
  { icon: '✨', left: '68%', size: '1.2rem', duration: '9.5s', delay: '2.5s' },
  { icon: '💖', left: '82%', size: '1.5rem', duration: '6.8s', delay: '4.5s' }
];

export const FloatingHeartsBackground: React.FC = () => {
  const { themeMode } = useAstra();
  const isLight = themeMode === 'LIGHT';
  const floatingItems = isLight ? FLOATING_ITEMS_LIGHT : FLOATING_ITEMS_DARK;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: isLight
          ? 'linear-gradient(180deg, #FFF5F7 0%, #FEE2E2 40%, #FCE7F3 100%)'
          : 'radial-gradient(ellipse at 50% 30%, #1D1536 0%, #0F0C1B 70%, #080610 100%)',
        transition: 'background 0.3s ease'
      }}
    >
      {/* Glowing Ambient Nebula / Rose Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '20%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: isLight
            ? 'radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, rgba(245, 158, 11, 0.1) 50%, transparent 80%)'
            : 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(225, 29, 72, 0.08) 50%, transparent 80%)',
          filter: 'blur(50px)',
          animation: 'pulseGlow 6s ease-in-out infinite alternate'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: isLight
            ? 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(129, 140, 248, 0.08) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(245, 158, 11, 0.06) 60%, transparent 80%)',
          filter: 'blur(60px)',
          animation: 'pulseGlow 8s ease-in-out infinite alternate-reverse'
        }}
      />

      {/* Floating Hearts & Stars */}
      {floatingItems.map((item, idx) => (
        <span
          key={idx}
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: item.left,
            fontSize: item.size,
            opacity: isLight ? 0.85 : 0.7,
            animation: `floatUp ${item.duration} linear infinite`,
            animationDelay: item.delay,
            filter: isLight
              ? 'drop-shadow(0 2px 6px rgba(244, 63, 94, 0.3))'
              : 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))'
          }}
        >
          {item.icon}
        </span>
      ))}

      {/* CSS Keyframes */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }

        @keyframes pulseGlow {
          0% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
