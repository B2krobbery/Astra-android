import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { CandidateCardView } from '../components/CandidateCardView';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { FloatingHeartsBackground } from '../components/FloatingHeartsBackground';
import { Sparkles, Moon, Sun, ShieldCheck, Share2, Globe, RotateCcw, MapPin, X, Heart, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { RegionalPreference } from '../types';
import { preloadImages } from '../utils/imagePreloader';
import { DesktopDiscoverView } from '../components/DesktopDiscoverView';

export const DiscoverFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentCandidate,
    userProfile,
    likeCandidate,
    passCandidate,
    checkCompatibility,
    selectCandidate,
    openChaanbean,
    openReferralModal,
    setRegionalPreference,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    t,
    isPreferenceStrictFilterOn,
    setIsPreferenceStrictFilterOn,
    isNearbyOnly,
    enableNearbyDiscovery,
    disableNearbyDiscovery,
    passedCandidatesHistory,
    rewindCandidate,
    resetFeed,
    candidates,
    filteredCandidates
  } = useAstra();

  const isDatingMode = userProfile.intent === 'Dating';
  const [isAcquiringLocation, setIsAcquiringLocation] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  const handleToggleNearby = async () => {
    setLocationError(null);
    if (isNearbyOnly) {
      await disableNearbyDiscovery();
    } else {
      setIsAcquiringLocation(true);
      try {
        await enableNearbyDiscovery(25);
      } catch (err: any) {
        setLocationError(err.message || 'Unable to access location');
        setTimeout(() => setLocationError(null), 4000);
      } finally {
        setIsAcquiringLocation(false);
      }
    }
  };

  const toggleLanguage = () => {
    if (language === 'EN') setLanguage('ML');
    else if (language === 'ML') setLanguage('HI');
    else setLanguage('EN');
  };

  const toggleTheme = () => {
    if (themeMode === 'DARK') setThemeMode('LIGHT');
    else setThemeMode('DARK');
  };

  // Preload upcoming candidate images in the background so swipes render instantly (0ms)
  React.useEffect(() => {
    if (filteredCandidates && filteredCandidates.length > 0) {
      const upcomingPhotos: string[] = [];
      filteredCandidates.slice(0, 4).forEach(c => {
        if (c.photoUrls && c.photoUrls.length > 0) {
          upcomingPhotos.push(...c.photoUrls);
        }
      });
      if (upcomingPhotos.length > 0) {
        preloadImages(upcomingPhotos);
      }
    }
  }, [filteredCandidates]);

  // Desktop Keyboard Shortcuts (Arrow Left = Pass, Arrow Right = Like, Space/Up = Detail, K = Kundali)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (!currentCandidate) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        passCandidate(currentCandidate);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        likeCandidate(currentCandidate, () => navigate('/match-celebration'));
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        selectCandidate(currentCandidate);
        navigate('/candidate-detail');
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        checkCompatibility(currentCandidate, () => navigate('/horoscope-compatibility'));
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        rewindCandidate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCandidate, passCandidate, likeCandidate, selectCandidate, checkCompatibility, rewindCandidate, navigate]);

  return (
    <div
      className="glass-page discover-glass-page"
      style={{
        height: '100vh',
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'transparent'
      }}
    >
      <FloatingHeartsBackground />

      {/* DESKTOP DUAL-PANE VIEWPORT (>= 1024px) */}
      <DesktopDiscoverView />

      {/* LUXURY SLIM TOP BAR (Mobile Only) */}
      <div
        className="mobile-only"
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          maxWidth: '100%',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          background: themeMode === 'LIGHT' ? 'rgba(255, 245, 247, 0.95)' : 'rgba(11, 9, 18, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <header
          style={{
            padding: 'calc(10px + env(safe-area-inset-top, 0px)) 16px 10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* Logo & Mode Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexShrink: 1 }}>
            <Sparkles size={17} color="var(--accent-amber)" className="spin-slow" style={{ flexShrink: 0 }} />
            <h1 className="heading-font" style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--accent-amber-light)', margin: 0, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              {t('app_name')}
            </h1>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '9999px',
                background: isDatingMode ? 'rgba(236, 72, 153, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                color: isDatingMode ? '#F472B6' : 'var(--accent-amber-light)',
                border: isDatingMode ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(212, 175, 55, 0.3)',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {isDatingMode ? 'Dating' : 'Matrimony'}
            </span>
          </div>

          {/* Quick Actions: Streak & Filter Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Streak Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 8px',
                borderRadius: '9999px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'var(--accent-amber-light)',
                fontSize: '0.68rem',
                fontWeight: 800,
                whiteSpace: 'nowrap'
              }}
              title="7-Day Streak"
            >
              🔥 7
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '5px 10px',
                borderRadius: '9999px',
                background: showFilters || isNearbyOnly ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: showFilters || isNearbyOnly ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                color: showFilters || isNearbyOnly ? 'var(--accent-amber-light)' : 'var(--text-primary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              title="Preferences & Filters"
            >
              <SlidersHorizontal size={13} />
              <span>Filters</span>
              {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </header>

        {/* Directly visible Regional / Country Filter Strip */}
        <div
          style={{
            padding: '6px 16px 8px 16px',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            borderBottom: showFilters ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Globe size={12} /> {t('filter_label')}:
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

        {/* Collapsible Filter Drawer */}
        {showFilters && (
          <div
            style={{
              padding: '10px 16px 12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: themeMode === 'LIGHT' ? 'rgba(255, 250, 251, 0.98)' : 'rgba(15, 12, 24, 0.98)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {/* Quick Actions: Share, Language, Theme */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <button
                onClick={openReferralModal}
                style={{
                  flex: 1.2,
                  padding: '6px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid var(--accent-amber)',
                  color: 'var(--accent-amber-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Share2 size={13} />
                <span>Invite Friends</span>
              </button>

              <button
                onClick={toggleLanguage}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <Globe size={12} />
                <span>Lang</span>
              </button>

              <button
                onClick={toggleTheme}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                {themeMode === 'DARK' ? <Sun size={12} color="var(--accent-amber)" /> : <Moon size={12} />}
                <span>{themeMode === 'DARK' ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {/* Nearby & Strict Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <button
                onClick={handleToggleNearby}
                disabled={isAcquiringLocation}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  border: isNearbyOnly ? '1px solid #22C55E' : '1px solid var(--border-color)',
                  background: isNearbyOnly ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: isNearbyOnly ? '#4ADE80' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <MapPin size={12} color={isNearbyOnly ? '#4ADE80' : 'var(--text-muted)'} />
                {isAcquiringLocation ? 'Locating...' : isNearbyOnly ? 'Nearby (<25km) Active' : 'Nearby (<25km)'}
              </button>

              <button
                onClick={() => setIsPreferenceStrictFilterOn(!isPreferenceStrictFilterOn)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  border: isPreferenceStrictFilterOn ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                  background: isPreferenceStrictFilterOn ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: isPreferenceStrictFilterOn ? 'var(--accent-amber-light)' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Sparkles size={12} color={isPreferenceStrictFilterOn ? 'var(--accent-amber)' : 'var(--text-muted)'} />
                {isPreferenceStrictFilterOn ? 'Strict: ON' : 'Strict: OFF'}
              </button>
            </div>

            {/* Shubh Muhurat info line */}
            <div style={{ fontSize: '0.68rem', color: 'rgba(212, 175, 55, 0.85)', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>
              <Sparkles size={11} color="var(--accent-amber)" />
              <span><strong>Today's Shubh Muhurat:</strong> Abhijit 11:48 AM – 12:36 PM</span>
            </div>
          </div>
        )}

        {/* Profile Completion Nudge (Only if < 100%) */}
        {userProfile.completionPercentage < 100 && (
          <div
            onClick={() => openChaanbean()}
            style={{
              padding: '5px 16px',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.18) 0%, rgba(79, 70, 229, 0.18) 100%)',
              borderTop: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={13} color="var(--accent-amber-light)" />
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Profile {userProfile.completionPercentage}% complete
              </span>
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
              Complete now &gt;
            </span>
          </div>
        )}
      </div>

      {/* MIDDLE CANDIDATE CARD & FLOATING ACTION BAR (Mobile Only) */}
      <main
        className="discover-main mobile-only"
        style={{
          marginTop: '0px',
          marginBottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
          padding: '6px 16px 4px 16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {userProfile.intent === 'Marriage' && userProfile.completionPercentage < 100 ? (
          <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center', margin: 'auto' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', border: '2px solid var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <ShieldCheck size={36} color="var(--accent-amber)" />
            </div>
            <h2 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Matrimonial Discovery Locked
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px', maxWidth: '340px' }}>
              To ensure verified, genuine alliances and mutual trust for all families, Mangalsutra requires a 100% completed profile before accessing discovery.
            </p>
            <div style={{ width: '100%', maxWidth: '300px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                <span>Profile Readiness</span>
                <span style={{ color: 'var(--accent-amber-light)' }}>{userProfile.completionPercentage}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${userProfile.completionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #10B981)' }} />
              </div>
            </div>
            <button
              onClick={() => navigate('/marriage-onboarding')}
              style={{ padding: '14px 32px', borderRadius: '9999px', background: 'linear-gradient(135deg, var(--accent-amber), #D97706)', color: '#0B0B0E', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-cosmic)' }}
            >
              Complete Marriage Profile
            </button>
          </div>
        ) : currentCandidate ? (
          <div
            style={{
              width: '100%',
              maxWidth: '410px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0
            }}
          >
            {/* Card Deck Viewport */}
            <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, borderRadius: '24px' }}>
              {/* Background Card 3 (Bottom of deck) */}
              {filteredCandidates[2] && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: 'scale(0.92) translateY(18px)',
                    transformOrigin: 'bottom center',
                    opacity: 0.5,
                    filter: 'brightness(0.65)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    transition: 'all 0.35s ease',
                    zIndex: 1
                  }}
                >
                  <CandidateCardView
                    candidate={filteredCandidates[2]}
                    isStaticPreview={true}
                    onCardClick={() => {}}
                    onLikeClick={() => {}}
                    onPassClick={() => {}}
                    onCheckCompatibility={() => {}}
                  />
                </div>
              )}

              {/* Background Card 2 (Middle of deck) */}
              {filteredCandidates[1] && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: 'scale(0.96) translateY(9px)',
                    transformOrigin: 'bottom center',
                    opacity: 0.82,
                    filter: 'brightness(0.8)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    transition: 'all 0.35s ease',
                    zIndex: 2
                  }}
                >
                  <CandidateCardView
                    candidate={filteredCandidates[1]}
                    isStaticPreview={true}
                    onCardClick={() => {}}
                    onLikeClick={() => {}}
                    onPassClick={() => {}}
                    onCheckCompatibility={() => {}}
                  />
                </div>
              )}

              {/* Active Top Interactive Card */}
              <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 10 }}>
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
            </div>

            {/* Tactical Floating Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '18px',
                paddingTop: '10px',
                paddingBottom: '2px',
                zIndex: 20
              }}
            >
              {/* Rewind Button */}
              <button
                onClick={rewindCandidate}
                disabled={passedCandidatesHistory.length === 0}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: passedCandidatesHistory.length > 0 ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: passedCandidatesHistory.length > 0 ? 'pointer' : 'default',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s ease',
                  opacity: passedCandidatesHistory.length > 0 ? 1 : 0.4
                }}
                title="Rewind last pass"
              >
                <RotateCcw size={18} />
              </button>

              {/* Pass Button */}
              <button
                onClick={() => passCandidate(currentCandidate)}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(185, 28, 28, 0.28) 100%)',
                  backdropFilter: 'blur(16px)',
                  border: '2px solid rgba(239, 68, 68, 0.55)',
                  color: '#F87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
                  transition: 'transform 0.15s ease, box-shadow 0.2s ease'
                }}
                title="Pass"
              >
                <X size={28} strokeWidth={2.8} />
              </button>

              {/* Kundali / Astro Button */}
              <button
                onClick={() =>
                  checkCompatibility(currentCandidate, () => navigate('/horoscope-compatibility'))
                }
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(184, 148, 46, 0.3) 100%)',
                  backdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(212, 175, 55, 0.65)',
                  color: 'var(--accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(212, 175, 55, 0.25)',
                  transition: 'transform 0.15s ease'
                }}
                title={userProfile.intent === 'Marriage' ? 'Check Kundali' : 'Check Compatibility'}
              >
                <Sparkles size={22} fill="var(--accent-amber)" />
              </button>

              {/* Like Button */}
              <button
                onClick={() =>
                  likeCandidate(currentCandidate, () => navigate('/match-celebration'))
                }
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 28px rgba(16, 185, 129, 0.45)',
                  transition: 'transform 0.15s ease, box-shadow 0.2s ease'
                }}
                title="Like"
              >
                <Heart size={30} fill="#FFF" />
              </button>
            </div>

            {/* Desktop Keyboard Hints */}
            <div
              className="desktop-only"
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                paddingTop: '6px',
                fontSize: '0.72rem',
                color: 'var(--text-muted)'
              }}
            >
              <span><kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>←</kbd> Pass</span>
              <span><kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>→</kbd> Like</span>
              <span><kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>K</kbd> Kundali</span>
              <span><kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>Space</kbd> Details</span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', position: 'relative', zIndex: 10 }}>
            <Sparkles size={48} color="var(--accent-amber)" style={{ margin: '0 auto 16px' }} className="spin-slow" />
            <h2 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: themeMode === 'LIGHT' ? '#0F172A' : '#F8FAFC' }}>
              {t('all_caught_up')}
            </h2>
            <p style={{ color: themeMode === 'LIGHT' ? '#475569' : '#94A3B8', fontSize: '0.9rem', marginTop: '8px', maxWidth: '280px', margin: '8px auto 0' }}>
              {t('check_back_tomorrow')}
            </p>

            {userProfile.regionalPreference !== 'ALL' && candidates.length > 0 && (
              <button
                onClick={() => setRegionalPreference('ALL')}
                style={{
                  marginTop: '16px',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, var(--accent-amber), #D97706)',
                  color: '#0B0B0E',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Globe size={16} /> Show All Regions ({candidates.length} profiles available)
              </button>
            )}

            <br />
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
                marginTop: '16px',
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
