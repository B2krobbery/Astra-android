import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flame, MessageCircle, Sparkles, User } from 'lucide-react';
import { AstraTab } from '../types';
import { useAstra } from '../context/AstraContext';

export const AstraBottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, themeMode } = useAstra();

  const tabs = [
    { key: AstraTab.DISCOVER, label: t('tab_discover'), icon: Flame, path: '/discover' },
    { key: AstraTab.MATCHES, label: t('tab_matches'), icon: MessageCircle, path: '/matches' },
    { key: AstraTab.ASTRO_AI, label: t('tab_astro_ai'), icon: Sparkles, path: '/astro-ai' },
    { key: AstraTab.PROFILE, label: t('tab_profile'), icon: User, path: '/profile' }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '480px',
        margin: '0 auto',
        padding: '8px 0 calc(12px + env(safe-area-inset-bottom, 0px)) 0',
        background: themeMode === 'LIGHT' ? 'rgba(255, 245, 247, 0.88)' : 'rgba(15, 12, 27, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(245, 158, 11, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
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
              gap: '4px',
              color: isActive ? 'var(--accent-amber)' : 'var(--text-muted)',
              cursor: 'pointer',
              width: '25%',
              transition: 'color 0.2s ease, transform 0.15s ease'
            }}
          >
            <div
              style={{
                padding: '4px 14px',
                borderRadius: '9999px',
                background: isActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon size={20} color={isActive ? 'var(--accent-amber)' : 'var(--text-muted)'} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 700 : 500 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
