import React from 'react';
import { Sparkles, Moon } from 'lucide-react';
import { useAstra } from '../context/AstraContext';

interface CelestialLogoProps {
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
}

export const CelestialLogo: React.FC<CelestialLogoProps> = ({ size = 'medium', showSubtitle = true }) => {
  const { t } = useAstra();
  const iconSize = size === 'small' ? 24 : size === 'large' ? 56 : 36;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div
        className="pulse-glow"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: iconSize * 1.8,
          height: iconSize * 1.8,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(79, 70, 229, 0.1) 70%, transparent 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: 'var(--shadow-cosmic)',
          marginBottom: '8px'
        }}
      >
        <Moon size={iconSize} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))' }} />
        <Sparkles
          size={iconSize * 0.5}
          color="var(--accent-amber-light)"
          className="spin-slow"
          style={{ position: 'absolute', top: '10%', right: '15%' }}
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
