import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { AstraTab } from '../types';
import {
  Flame,
  MessageCircle,
  Sparkles,
  User,
  Share2,
  Globe,
  Sun,
  Moon,
  LogOut,
  Compass
} from 'lucide-react';

export const DesktopNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    t,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    userProfile,
    pendingRequests,
    conversations,
    openReferralModal,
    signOut,
    isAstroAiDrawerOpen,
    toggleAstroAiDrawer
  } = useAstra();

  const isDatingMode = userProfile.intent === 'Dating';
  const hasUnread =
    (pendingRequests && pendingRequests.length > 0) ||
    (conversations && conversations.some((c: any) => c.unreadCount > 0));

  const navItems = [
    { key: AstraTab.DISCOVER, label: t('tab_discover'), icon: Flame, path: '/discover' },
    { key: AstraTab.MATCHES, label: t('tab_matches'), icon: MessageCircle, path: '/matches', badge: hasUnread },
    { key: 'KUNDALI', label: 'Kundali Match', icon: Compass, path: '/horoscope-compatibility' },
    { key: AstraTab.ASTRO_AI, label: t('tab_astro_ai'), icon: Sparkles, path: '/astro-ai' },
    { key: AstraTab.PROFILE, label: t('tab_profile'), icon: User, path: '/profile' }
  ];

  const toggleLanguage = () => {
    if (language === 'EN') setLanguage('ML');
    else if (language === 'ML') setLanguage('HI');
    else setLanguage('EN');
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'DARK' ? 'LIGHT' : 'DARK');
  };

  // Do not show desktop navigation on initial splash or onboarding
  const isAuthOrOnboarding =
    location.pathname === '/' ||
    location.pathname === '/splash' ||
    location.pathname.startsWith('/onboarding') ||
    location.pathname === '/marriage-onboarding';

  if (isAuthOrOnboarding) return null;

  return (
    <header
      className="desktop-only"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        width: '100%',
        height: '68px',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background:
          themeMode === 'LIGHT'
            ? 'rgba(255, 255, 255, 0.88)'
            : 'rgba(15, 12, 24, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom:
          themeMode === 'LIGHT'
            ? '1px solid rgba(0, 0, 0, 0.08)'
            : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* Left: Brand Logo & Mode Badge */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        onClick={() => navigate('/discover')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--accent-amber)" />
          <span
            className="heading-font"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '1px',
              background: 'linear-gradient(135deg, #FFF 0%, var(--accent-amber-light) 60%, var(--accent-amber) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            MANGALSUTRA
          </span>
        </div>

        <span
          style={{
            fontSize: '0.68rem',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: isDatingMode ? 'rgba(236, 72, 153, 0.15)' : 'rgba(212, 175, 55, 0.15)',
            color: isDatingMode ? '#F472B6' : 'var(--accent-amber-light)',
            border: isDatingMode ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(212, 175, 55, 0.3)'
          }}
        >
          {isDatingMode ? 'Dating' : 'Matrimony'}
        </span>
      </div>

      {/* Center: Desktop Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isAstroAi = item.key === AstraTab.ASTRO_AI;
          const isActive = isAstroAi
            ? isAstroAiDrawerOpen
            : (location.pathname === item.path ||
               (item.key === AstraTab.DISCOVER && (location.pathname === '/' || location.pathname === '/discover')) ||
               (item.key === AstraTab.MATCHES && (location.pathname === '/matches' || location.pathname === '/chat-detail' || location.pathname.startsWith('/rooms'))) ||
               (item.key === 'KUNDALI' && location.pathname === '/horoscope-compatibility'));

          return (
            <button
              key={item.key}
              onClick={() => {
                if (isAstroAi) {
                  toggleAstroAiDrawer();
                } else {
                  navigate(item.path);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '9999px',
                border: 'none',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)'
                  : 'transparent',
                color: isActive ? 'var(--accent-amber-light)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Icon size={17} color={isActive ? 'var(--accent-amber)' : 'currentColor'} />
              <span>{item.label}</span>

              {item.badge && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--accent-rose)',
                    boxShadow: '0 0 8px var(--accent-rose)',
                    marginLeft: '-2px'
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Quick Controls & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Streak Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: 'var(--accent-amber-light)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
          title="7-Day Vedic Streak"
        >
          <span>🔥</span>
          <span>7 Streak</span>
        </div>

        {/* Invite Friends */}
        <button
          onClick={openReferralModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid var(--accent-amber)',
            color: 'var(--accent-amber-light)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Share2 size={13} />
          <span>Invite</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 10px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Globe size={13} />
          <span>{language}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
          title="Toggle Theme"
        >
          {themeMode === 'DARK' ? <Sun size={14} color="var(--accent-amber)" /> : <Moon size={14} />}
        </button>

        {/* User Mini Avatar */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '6px',
            padding: '4px 10px 4px 4px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer'
          }}
        >
          {userProfile.photoUrl ? (
            <img
              src={userProfile.photoUrl}
              alt={userProfile.name}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-amber-light)'
              }}
            >
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userProfile.name || 'Profile'}
          </span>
        </div>

        {/* Quick Logout */}
        <button
          onClick={() => signOut()}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Sign Out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};
