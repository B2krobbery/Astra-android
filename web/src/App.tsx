import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AstraProvider, useAstra } from './context/AstraContext';
import { ChaanbeanModal } from './components/ChaanbeanModal';
import { ReferralModal } from './components/ReferralModal';
import { SplashScreenOverlay } from './components/SplashScreenOverlay';
import { DesktopNavigation } from './components/DesktopNavigation';
import { DesktopAstroAiDrawer } from './components/DesktopAstroAiDrawer';

const SplashPage = React.lazy(() => import('./pages/SplashPage').then(m => ({ default: m.SplashPage })));
const TypeformOnboardingPage = React.lazy(() => import('./pages/TypeformOnboardingPage').then(m => ({ default: m.TypeformOnboardingPage })));
const MarriageOnboardingPage = React.lazy(() => import('./pages/MarriageOnboardingPage').then(m => ({ default: m.MarriageOnboardingPage })));
const ProfileOnboardingPage = React.lazy(() => import('./pages/ProfileOnboardingPage').then(m => ({ default: m.ProfileOnboardingPage })));
const AstrologySetupPage = React.lazy(() => import('./pages/AstrologySetupPage').then(m => ({ default: m.AstrologySetupPage })));
const DiscoverFeedPage = React.lazy(() => import('./pages/DiscoverFeedPage').then(m => ({ default: m.DiscoverFeedPage })));
const CandidateDetailPage = React.lazy(() => import('./pages/CandidateDetailPage').then(m => ({ default: m.CandidateDetailPage })));
const HoroscopeCompatibilityPage = React.lazy(() => import('./pages/HoroscopeCompatibilityPage').then(m => ({ default: m.HoroscopeCompatibilityPage })));
const MatchCelebrationPage = React.lazy(() => import('./pages/MatchCelebrationPage').then(m => ({ default: m.MatchCelebrationPage })));
const MatchesConversationsPage = React.lazy(() => import('./pages/MatchesConversationsPage').then(m => ({ default: m.MatchesConversationsPage })));
const ChatDetailPage = React.lazy(() => import('./pages/ChatDetailPage').then(m => ({ default: m.ChatDetailPage })));
const AstroAiAssistantPage = React.lazy(() => import('./pages/AstroAiAssistantPage').then(m => ({ default: m.AstroAiAssistantPage })));
const UserProfilePage = React.lazy(() => import('./pages/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const AdminAiPanelPage = React.lazy(() => import('./pages/AdminAiPanelPage').then(m => ({ default: m.AdminAiPanelPage })));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminMarketingPage = React.lazy(() => import('./pages/AdminMarketingPage').then(m => ({ default: m.AdminMarketingPage })));
const DigitalWeddingCardPage = React.lazy(() => import('./pages/DigitalWeddingCardPage').then(m => ({ default: m.DigitalWeddingCardPage })));
const RoomChatPage = React.lazy(() => import('./pages/RoomChatPage').then(m => ({ default: m.RoomChatPage })));

import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from './lib/supabase';

const AppRoutes: React.FC = () => {
  const { isChaanbeanOpen, chaanbeanTarget, closeChaanbean, openConversationById, activeConversation } = useAstra();
  const navigate = useNavigate();
  const [inAppToast, setInAppToast] = React.useState<{ title: string; body: string; image?: string; conversationId?: string; senderId?: string } | null>(null);
  const toastTimerRef = React.useRef<any>(null);

  React.useEffect(() => {
    // 1. Handle notification tap deep-linking (background / closed state)
    const handleOpenConvo = async (e: any) => {
      const { conversationId, senderId } = e.detail || {};
      if (conversationId || senderId) {
        await openConversationById(conversationId, senderId);
        navigate('/chat-detail');
      }
    };
    window.addEventListener('astra:open_conversation', handleOpenConvo);

    // 2. Handle foreground push notification (app open)
    const handlePushReceived = (e: any) => {
      const { notification, data } = e.detail || {};
      const convoId = data?.conversation_id;
      // If user is currently in /chat-detail for this conversation, suppress in-app banner
      if (window.location.pathname === '/chat-detail' && activeConversation?.id === convoId) {
        return;
      }

      setInAppToast({
        title: notification?.title || 'New Message',
        body: notification?.body || '',
        image: notification?.image || notification?.largeBody,
        conversationId: convoId,
        senderId: data?.sender_id
      });

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setInAppToast(null);
      }, 5500);
    };
    window.addEventListener('astra:push_received', handlePushReceived);

    CapacitorApp.addListener('appUrlOpen', (event) => {
      const url = new URL(event.url);
      if (url.protocol === 'astra:') {
        // Handle Supabase Auth redirect deep link
        const hash = url.hash;
        if (hash) {
          // If using implicit flow, pass hash to supabase
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            navigate('/discover');
          }
        }
        
        // Also handle PKCE query parameters if present
        if (url.searchParams.has('code')) {
           supabase.auth.exchangeCodeForSession(url.searchParams.get('code')!).then(() => {
             navigate('/discover');
           });
        }
      }
    });

    // Handle Web browser OAuth redirect (implicit flow)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(() => {
          window.history.replaceState(null, '', window.location.pathname);
          window.location.reload();
        });
      }
    }

    // Handle Web browser OAuth redirect (PKCE flow with ?code=...)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
      const code = urlParams.get('code')!;
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/discover');
        }
      });
    }

    return () => {
      window.removeEventListener('astra:open_conversation', handleOpenConvo);
      window.removeEventListener('astra:push_received', handlePushReceived);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [navigate, openConversationById, activeConversation]);

  return (
    <div className="app-container">
      {/* Foreground In-App Push Notification Banner */}
      {inAppToast && (
        <div
          onClick={async () => {
            const { conversationId, senderId } = inAppToast;
            setInAppToast(null);
            if (conversationId || senderId) {
              await openConversationById(conversationId || '', senderId);
              navigate('/chat-detail');
            }
          }}
          style={{
            position: 'fixed',
            top: 'calc(12px + env(safe-area-inset-top, 0px))',
            left: '16px',
            right: '16px',
            maxWidth: '420px',
            margin: '0 auto',
            zIndex: 9999,
            padding: '12px 16px',
            borderRadius: '18px',
            background: 'rgba(15, 12, 24, 0.95)',
            border: '1.5px solid var(--accent-amber)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.25)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            animation: 'fadeInOut 0.3s ease-out'
          }}
        >
          {inAppToast.image ? (
            <img
              src={inAppToast.image}
              alt=""
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-amber)', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', border: '1.5px solid var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--accent-amber-light)', fontWeight: 800 }}>
              ✨
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-amber-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {inAppToast.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
              {inAppToast.body}
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 700, flexShrink: 0 }}>
            Reply &gt;
          </span>
        </div>
      )}

      {/* Animated Celestial Splash Screen Overlay on Initial App Load */}
      <SplashScreenOverlay />

      {/* Desktop Top Navigation Header (hidden on mobile, visible on desktop >= 1024px) */}
      <DesktopNavigation />

      {/* Persistent Floating Astro AI Assistant Drawer (Desktop only, >= 1024px) */}
      <DesktopAstroAiDrawer />

      <React.Suspense fallback={<div className="glass-page" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spin-slow" style={{ fontSize: "2rem" }}>✨</span></div>}><Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/onboarding-typeform" element={<TypeformOnboardingPage />} />
        <Route path="/marriage-onboarding" element={<MarriageOnboardingPage />} />
        <Route path="/onboarding-profile" element={<ProfileOnboardingPage />} />
        <Route path="/onboarding-astrology" element={<AstrologySetupPage />} />
        <Route path="/discover" element={<DiscoverFeedPage />} />
        <Route path="/candidate-detail" element={<CandidateDetailPage />} />
        <Route path="/horoscope-compatibility" element={<HoroscopeCompatibilityPage />} />
        <Route path="/match-celebration" element={<MatchCelebrationPage />} />
        <Route path="/matches" element={<MatchesConversationsPage />} />
        <Route path="/chat-detail" element={<ChatDetailPage />} />
        <Route path="/rooms/:id" element={<RoomChatPage />} />
        <Route path="/astro-ai" element={<AstroAiAssistantPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/wedding-cards" element={<DigitalWeddingCardPage />} />
        <Route path="/admin/ai-agents" element={<AdminAiPanelPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/marketing" element={<AdminMarketingPage />} />
        <Route path="/admin" element={<Navigate to="/admin/ai-agents" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes></React.Suspense>

      {/* Global Verification Modal Overlay */}
      {isChaanbeanOpen && (
        <ChaanbeanModal
          targetUser={chaanbeanTarget}
          onDismiss={closeChaanbean}
        />
      )}

      {/* Global Viral Referral Gift Modal */}
      <ReferralModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AstraProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AstraProvider>
  );
};

export default App;
