import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { CandidateCardView } from '../components/CandidateCardView';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { FloatingHeartsBackground } from '../components/FloatingHeartsBackground';
import { Sparkles, Moon, Sun, ShieldCheck, Share2, Bot, Globe, RotateCcw } from 'lucide-react';
import { RegionalPreference } from '../types';

export const DiscoverFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentCandidate,
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
    t,
    isPreferenceStrictFilterOn,
    setIsPreferenceStrictFilterOn,
    passedCandidatesHistory,
    rewindCandidate,
    resetFeed
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

  // currentCandidate is provided by useAstra context directly now

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        background: themeMode === 'LIGHT' ? '#FFF5F7' : '#0F0C1B'
      }}
    >
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
            padding: 'calc(12px + env(safe-area-inset-top, 0px)) 16px 12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-amber)" className="spin-slow" />
            <h1 className="heading-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
              {t('app_name')}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              style={{
                padding: '4px 8px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                color: 'var(--accent-amber-light)',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Globe size={11} /> {language === 'EN' ? 'മലയാളം' : language === 'ML' ? 'हिंदी' : 'EN'}
            </button>

            {/* Admin Panel Link */}
            <button
              onClick={() => navigate('/admin/ai-agents')}
              style={{
                padding: '4px 8px',
                borderRadius: '9999px',
                background: 'rgba(79, 70, 229, 0.2)',
                border: '1px solid var(--accent-indigo)',
                color: 'var(--accent-indigo)',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Bot size={12} /> {t('btn_admin')}
            </button>

            {/* Referral Modal Button */}
            <button
              onClick={openReferralModal}
              title="Invite Friends"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Share2 size={13} />
            </button>

            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {themeMode === 'DARK' ? <Sun size={13} color="var(--accent-amber)" /> : <Moon size={13} />}
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

        {/* Strict Partner Preferences Toggle & Rewind Bar */}
        <div
          style={{
            padding: '6px 16px',
            background: 'rgba(236, 72, 153, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            margin: '0 16px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(236, 72, 153, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              🎯 For You
            </span>
            {passedCandidatesHistory.length > 0 && (
              <button 
                onClick={rewindCandidate} 
                style={{ 
                  background: 'rgba(245, 158, 11, 0.2)', 
                  border: '1px solid var(--accent-amber)', 
                  borderRadius: '50%',
                  color: 'var(--accent-amber)', 
                  cursor: 'pointer', 
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '8px'
                }}
                title="Rewind last pass"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setIsPreferenceStrictFilterOn(!isPreferenceStrictFilterOn)}
            style={{
              width: '40px',
              height: '22px',
              borderRadius: '11px',
              background: isPreferenceStrictFilterOn ? 'var(--accent-amber)' : 'rgba(255,255,255,0.2)',
              position: 'relative',
              cursor: 'pointer',
              border: 'none',
              transition: 'background 0.3s'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '2px',
              left: isPreferenceStrictFilterOn ? '20px' : '2px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#FFF',
              transition: 'left 0.3s cubic-bezier(0.68, -0.55, 0.26, 1.55)'
            }} />
          </button>
        </div>

        {/* Daily Shubh Muhurat & Reward Streak Ticker */}
        <div
          style={{
            padding: '6px 16px',
            background: 'rgba(245, 158, 11, 0.12)',
            borderTop: '1px solid rgba(245, 158, 11, 0.2)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: 'var(--accent-amber-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} color="var(--accent-amber)" />
            <span><strong>Today's Shubh Muhurat:</strong> Abhijit 11:48 AM – 12:36 PM</span>
          </div>
          <span style={{ fontWeight: 800, background: 'rgba(245, 158, 11, 0.25)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.65rem' }}>
            🔥 7-Day Streak (+350 pts)
          </span>
        </div>
      </div>

      {/* MIDDLE CANDIDATE CARD VIEWPORT (Single Clean Card) */}
      <main
        style={{
          paddingTop: userProfile.completionPercentage < 100 ? '184px' : '152px',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          paddingLeft: '16px',
          paddingRight: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {currentCandidate ? (
          <div
            style={{
              width: '100%',
              height: userProfile.completionPercentage < 100 ? 'calc(100vh - 225px)' : 'calc(100vh - 185px)',
              maxHeight: '660px',
              minHeight: '460px',
              margin: 'auto 0',
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
          <div style={{ textAlign: 'center', padding: '40px 20px', position: 'relative', zIndex: 10 }}>
            <Sparkles size={48} color="var(--accent-amber)" style={{ margin: '0 auto 16px' }} className="spin-slow" />
            <h2 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {t('all_caught_up')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px', maxWidth: '280px', margin: '8px auto 0' }}>
              {t('check_back_tomorrow')}
            </p>
            <button
              onClick={() => {
                const btn = document.getElementById('reset-feed-btn');
                if (btn) btn.innerHTML = 'Resetting...';
                resetFeed().then(() => {
                  if (btn) btn.innerHTML = 'Feed Reset!';
                  setTimeout(() => { if (btn) btn.innerHTML = 'Reset Feed (Dev Tool)'; }, 2000);
                });
              }}
              id="reset-feed-btn"
              style={{
                marginTop: '24px',
                padding: '8px 16px',
                borderRadius: '9999px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber-light)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} /> Reset Feed (Dev Tool)
            </button>
          </div>
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <AstraBottomNavigation />
    </div>
  );
};
