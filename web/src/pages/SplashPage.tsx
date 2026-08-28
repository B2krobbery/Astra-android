import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CelestialLogo } from '../components/CelestialLogo';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { CosmicBackgroundCanvas } from '../components/CosmicBackgroundCanvas';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: '32px 24px',
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(42, 14, 26, 0.75) 0%, var(--bg-primary) 70%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Interactive Background Starfield Canvas */}
      <CosmicBackgroundCanvas />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 5 }}>
        <CelestialLogo size="large" />

        <p
          style={{
            maxWidth: '300px',
            marginTop: '20px',
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}
        >
          Modern Matchmaking, Guided by the Stars ✨
          <br />
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
            Interactive Typeform Onboarding & Verified Trust Badges
          </span>
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', zIndex: 5 }}>
        <PrimaryButton onClick={() => navigate('/onboarding-typeform')}>
          Start Interactive Onboarding <ArrowRight size={18} />
        </PrimaryButton>

        <SecondaryOutlineButton onClick={() => navigate('/onboarding-typeform')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>G</span> Continue with Google
          </span>
        </SecondaryOutlineButton>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          <ShieldCheck size={14} color="var(--accent-amber)" /> 100% Verified Profiles & DigiLocker Gateway
        </div>
      </div>
    </div>
  );
};
