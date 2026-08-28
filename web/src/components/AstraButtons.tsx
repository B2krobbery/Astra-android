import React from 'react';
import { Heart, X, Sparkles } from 'lucide-react';
import { useAstra } from '../context/AstraContext';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, fullWidth = true, style, ...props }) => (
  <button
    {...props}
    style={{
      width: fullWidth ? '100%' : 'auto',
      padding: '14px 24px',
      borderRadius: '9999px',
      border: 'none',
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: '#0F0C1B',
      fontWeight: 800,
      fontSize: '0.95rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
      transition: 'transform 0.15s ease, opacity 0.15s ease',
      ...style
    }}
    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
  >
    {children}
  </button>
);

export const SecondaryOutlineButton: React.FC<PrimaryButtonProps> = ({ children, fullWidth = true, style, ...props }) => (
  <button
    {...props}
    style={{
      width: fullWidth ? '100%' : 'auto',
      padding: '14px 24px',
      borderRadius: '9999px',
      border: '2px solid var(--accent-amber)',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      fontWeight: 700,
      fontSize: '0.9rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.15s ease',
      ...style
    }}
  >
    {children}
  </button>
);

export const LikeCircleButton: React.FC<{ onClick: () => void; size?: number }> = ({ onClick, size = 60 }) => (
  <button
    onClick={onClick}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: 'none',
      background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
      color: '#FFF',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(244, 63, 94, 0.4)',
      transition: 'transform 0.15s ease'
    }}
    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
  >
    <Heart size={size * 0.45} fill="#FFF" />
  </button>
);

export const PassCircleButton: React.FC<{ onClick: () => void; size?: number }> = ({ onClick, size = 60 }) => (
  <button
    onClick={onClick}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: '1.5px solid var(--border-color)',
      background: 'var(--bg-card)',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'var(--shadow-card)',
      transition: 'transform 0.15s ease'
    }}
    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
  >
    <X size={size * 0.45} />
  </button>
);

export const CosmicCheckButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useAstra();
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: '9999px',
        border: '1.5px solid var(--accent-indigo)',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        fontWeight: 700,
        fontSize: '0.85rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 4px 16px rgba(79, 70, 229, 0.25)'
      }}
    >
      <Sparkles size={16} color="var(--accent-amber-light)" className="spin-slow" />
      {t('btn_check_harmony')}
    </button>
  );
};
