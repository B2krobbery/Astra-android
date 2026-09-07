import React from 'react';
import { Sparkles, HeartHandshake, Crown, Gem, Flame, Moon } from 'lucide-react';
import { useAstra } from '../context/AstraContext';

export type LogoIconType = 'mangalsutra' | 'heart' | 'crown' | 'gem' | 'flame' | 'moon';

interface CelestialLogoProps {
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
  customLogoUrl?: string;
  iconType?: LogoIconType;
}

export const CelestialLogo: React.FC<CelestialLogoProps> = ({
  size = 'medium',
  showSubtitle = true,
  customLogoUrl,
  iconType = 'mangalsutra'
}) => {
  const { t } = useAstra();
  const iconSize = size === 'small' ? 24 : size === 'large' ? 56 : 36;
  const badgeSize = iconSize * 1.8;

  const renderIcon = () => {
    if (customLogoUrl) {
      return (
        <img
          src={customLogoUrl}
          alt="Brand Logo"
          style={{
            width: iconSize * 1.2,
            height: iconSize * 1.2,
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))'
          }}
        />
      );
    }

    switch (iconType) {
      case 'heart':
        return <HeartHandshake size={iconSize} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' }} />;
      case 'crown':
        return <Crown size={iconSize} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' }} />;
      case 'gem':
        return <Gem size={iconSize} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' }} />;
      case 'flame':
        return <Flame size={iconSize} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' }} />;
      case 'moon':
        return <Moon size={iconSize} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' }} />;
      case 'mangalsutra':
      default:
        return (
          /* Man & Woman Sacred Union Symbol (Interlocking ♂ & ♀ with Golden Heart) */
          <svg
            width={iconSize * 1.3}
            height={iconSize * 1.3}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.7))' }}
          >
            {/* Encircling Sacred Heart of Union */}
            <path
              d="M 32 54 C 16 40 8 28 14 17 C 20 8 30 13 32 19 C 34 13 44 8 50 17 C 56 28 48 40 32 54 Z"
              fill="url(#union-heart-fill)"
              stroke="url(#union-gold-gradient)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Interlocking Male (♂) & Female (♀) Symbols */}
            {/* Female Circle (Left) */}
            <circle cx="25" cy="27" r="7.5" stroke="#FDA4AF" strokeWidth="2.5" fill="none" />
            {/* Male Circle (Right - Intertwined) */}
            <circle cx="39" cy="27" r="7.5" stroke="#93C5FD" strokeWidth="2.5" fill="none" />

            {/* Male Arrow (♂ Upper Right) */}
            <path
              d="M 44.5 21.5 L 53 13 M 53 13 H 46 M 53 13 V 20"
              stroke="#60A5FA"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Female Cross (♀ Lower Left) */}
            <path
              d="M 25 34.5 V 44 M 20.5 39.5 H 29.5"
              stroke="#F43F5E"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Central Sparkle of Love & Destiny */}
            <path
              d="M 32 24 L 33.2 27 L 36.2 27.5 L 33.8 29.5 L 34.5 32.5 L 32 30.8 L 29.5 32.5 L 30.2 29.5 L 27.8 27.5 L 30.8 27 Z"
              fill="#FDE68A"
            />

            <defs>
              <linearGradient id="union-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#F43F5E" />
              </linearGradient>
              <radialGradient id="union-heart-fill" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="rgba(244, 63, 94, 0.35)" />
                <stop offset="70%" stopColor="rgba(212, 175, 55, 0.1)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div
        className="pulse-glow"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: badgeSize,
          height: badgeSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(79, 70, 229, 0.06) 70%, transparent 100%)',
          border: '1px solid rgba(212, 175, 55, 0.22)',
          boxShadow: 'var(--shadow-cosmic)',
          marginBottom: '8px'
        }}
      >
        {renderIcon()}
        <Sparkles
          size={iconSize * 0.45}
          color="var(--accent-amber-light)"
          className="spin-slow"
          style={{ position: 'absolute', top: '8%', right: '12%' }}
        />
      </div>
      <h1
        className="heading-font"
        style={{
          fontSize: size === 'small' ? '1.25rem' : size === 'large' ? '2.25rem' : '1.75rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #FFF 0%, var(--accent-amber-light) 60%, var(--accent-indigo) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '1px'
        }}
      >
        {t('app_name')}
      </h1>
      {showSubtitle && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginTop: '2px' }}>
          Vedic Matchmaking ✨
        </p>
      )}
    </div>
  );
};
