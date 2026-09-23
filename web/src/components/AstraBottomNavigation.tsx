import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flame, MessageCircle, Sparkles, User } from 'lucide-react';
import { AstraTab } from '../types';
import { useAstra } from '../context/AstraContext';

export const AstraBottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, themeMode, pendingRequests, conversations } = useAstra();

  const hasUnread = (pendingRequests && pendingRequests.length > 0) || (conversations && conversations.some((c: any) => c.unreadCount > 0));

  const tabs = [
    { key: AstraTab.DISCOVER, label: t('tab_discover'), icon: Flame, path: '/discover' },
    { key: AstraTab.MATCHES, label: t('tab_matches'), icon: MessageCircle, path: '/matches', hasBadge: hasUnread },
    { key: AstraTab.ASTRO_AI, label: t('tab_astro_ai'), icon: Sparkles, path: '/astro-ai' },
    { key: AstraTab.PROFILE, label: t('tab_profile'), icon: User, path: '/profile' }
  ];

  return (
    <nav
      className="glass-bottom-nav floating-tube-nav"
      style={{
        position: 'fixed',
        bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
        left: '16px',
        right: '16px',
        maxWidth: '390px',
        margin: '0 auto',
        height: '62px',
        padding: '0 10px',
        background: themeMode === 'LIGHT'
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(15, 12, 24, 0.88)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderRadius: '9999px',
        border: themeMode === 'LIGHT'
          ? '1px solid rgba(0, 0, 0, 0.08)'
          : '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        boxShadow: themeMode === 'LIGHT'
          ? '0 12px 32px -4px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          : '0 16px 36px -6px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.06) inset, inset 0 1px 0 rgba(255, 255, 255, 0.16)'
      }}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path || (tab.key === AstraTab.DISCOVER && location.pathname === '/');

        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              cursor: 'pointer',
              flex: 1,
              height: '100%',
              position: 'relative',
              padding: '4px 0',
              borderRadius: '9999px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon
                size={21}
                color={isActive ? 'var(--accent-amber)' : themeMode === 'LIGHT' ? '#64748B' : 'rgba(255, 255, 255, 0.45)'}
                strokeWidth={isActive ? 2.4 : 1.8}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))' : 'none',
                  transition: 'transform 0.2s ease, filter 0.2s ease',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)'
                }}
              />
              {tab.hasBadge && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -4,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#EF4444',
                    boxShadow: '0 0 6px #EF4444'
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: '0.67rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent-amber-light)' : themeMode === 'LIGHT' ? '#64748B' : 'rgba(255, 255, 255, 0.45)',
                letterSpacing: '0.2px',
                transition: 'color 0.2s ease'
              }}
            >
              {tab.label}
            </span>
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--accent-amber)',
                boxShadow: isActive ? '0 0 6px var(--accent-amber)' : 'none',
                opacity: isActive ? 1 : 0,
                transition: 'opacity 0.2s ease'
              }}
            />
          </button>
        );
      })}
    </nav>
  );
};
