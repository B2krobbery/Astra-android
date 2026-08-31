import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { CandidateCardView } from '../components/CandidateCardView';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { FloatingHeartsBackground } from '../components/FloatingHeartsBackground';
import { Sparkles, Moon, Sun, ShieldCheck, Share2, Bot, Globe } from 'lucide-react';
import { RegionalPreference } from '../types';

export const DiscoverFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    candidates,
    userProfile,
    likeCandidate,
    passCandidate,
    checkCompatibility,
    selectCandidate,
    showUserVerification,
    openReferralModal,
    setRegionalPreference,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    t
  } = useAstra();

  const toggleLanguage = () => {
    if (language === 'EN') setLanguage('ML');
    else if (language === 'ML') setLanguage('HI');
    else setLanguage('EN');
  };

  const toggleTheme = () => {
    if (themeMode === 'DARK') setThemeMode('LIGHT');
    else setThemeMode('DARK');
  };

  const currentCandidate = candidates[0];

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        background: themeMode === 'LIGHT' ? '#FFF5F7' : '#0F0C1B'
      }}
    >
      {/* Floating Celestial Hearts & Orbs Background */}
      <FloatingHeartsBackground />

      {/* FIXED TOP HEADER CONTAINER */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          maxWidth: '480px',
          margin: '0 auto',
          zIndex: 40,
          background: themeMode === 'LIGHT' ? 'rgba(255, 245, 247, 0.78)' : 'rgba(15, 12, 27, 0.78)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Top Header Bar */}
        <header
          style={{
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-amber)" className="spin-slow" />
            <h1 className="heading-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
              ASTRA
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              style={{
                padding: '5px 9px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                color: 'var(--accent-amber-light)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Globe size={12} /> {language === 'EN' ? 'മലയാളം' : language === 'ML' ? 'हिंदी' : 'English'}
            </button>

            {/* Admin Panel Link */}
            <button
              onClick={() => navigate('/admin/ai-agents')}
              style={{
                padding: '5px 9px',
                borderRadius: '9999px',
                background: 'rgba(79, 70, 229, 0.2)',
                border: '1px solid var(--accent-indigo)',
                color: 'var(--accent-indigo)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Bot size={13} /> {t('btn_admin')}
            </button>

            {/* Referral Modal Button */}
            <button
              onClick={openReferralModal}
              style={{
                padding: '5px 9px',
                borderRadius: '9999px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber-light)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Share2 size={12} /> Invite
            </button>

            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              title="Toggle Theme"
            >
              {themeMode === 'DARK' ? <Sun size={15} color="#FCD34D" /> : <Moon size={15} color="#4F46E5" />}
            </button>
          </div>
        </header>

        {/* Profile Nudge Banner */}
        {userProfile.completionPercentage < 100 && (
          <div
            onClick={() => showUserVerification('POLICE' as any)}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)',
              borderBottom: '1px solid var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} color="var(--accent-amber-light)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('profile_nudge')}
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-amber-light)', flexShrink: 0 }}>
              Complete
            </span>
          </div>
        )}

        {/* Regional Preference Selector Strip */}
        <div
          style={{
            padding: '6px 16px',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto'
          }}
        >
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Globe size={12} /> {t('filter_label')}
          </span>
          {[
            { key: 'ALL', label: t('filter_all') },
            { key: 'KERALA', label: t('filter_kerala') },
            { key: 'NORTH_INDIA', label: t('filter_north') },
            { key: 'WEST_INDIA', label: t('filter_west') },
            { key: 'NRI', label: t('filter_nri') }
          ].map(item => {
            const isSelected = userProfile.regionalPreference === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setRegionalPreference(item.key as RegionalPreference)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: isSelected ? 'var(--accent-amber-light)' : 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: isSelected ? 800 : 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MIDDLE CANDIDATE CARD VIEWPORT (Single Clean Card) */}
      <main
        style={{
          paddingTop: userProfile.completionPercentage < 100 ? '132px' : '96px',
          paddingBottom: '72px',
          paddingLeft: '16px',
          paddingRight: '16px',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: currentCandidate ? 'center' : 'center'
        }}
      >
        {currentCandidate ? (
          <div
            style={{
              width: '100%',
              height: userProfile.completionPercentage < 100 ? 'calc(100vh - 215px)' : 'calc(100vh - 175px)',
              maxHeight: '720px',
              minHeight: '520px',
              marginTop: '4px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CandidateCardView
              key={currentCandidate.id}
              candidate={currentCandidate}
              onCardClick={() => {
                selectCandidate(currentCandidate);
                navigate('/candidate-detail');
              }}
              onLikeClick={() => likeCandidate(currentCandidate, () => navigate('/match-celebration'))}
              onPassClick={() => passCandidate(currentCandidate)}
              onCheckCompatibility={() =>
                checkCompatibility(currentCandidate, () => navigate('/horoscope-compatibility'))
              }
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Sparkles size={48} color="var(--accent-amber)" style={{ margin: '0 auto 16px' }} className="spin-slow" />
            <h2 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {t('all_caught_up')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px', maxWidth: '280px', margin: '8px auto 0' }}>
              {t('check_back_tomorrow')}
            </p>
          </div>
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <AstraBottomNavigation />
    </div>
  );
};
