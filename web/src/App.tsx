import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AstraProvider, useAstra } from './context/AstraContext';
import { ChaanbeanModal } from './components/ChaanbeanModal';
import { ReferralModal } from './components/ReferralModal';
import { SplashScreenOverlay } from './components/SplashScreenOverlay';

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

import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from './lib/supabase';

const AppRoutes: React.FC = () => {
  const { isChaanbeanOpen, chaanbeanTarget, closeChaanbean } = useAstra();
  const navigate = useNavigate();

  React.useEffect(() => {
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
          // Clear hash from URL for cleaner history
          window.history.replaceState(null, '', window.location.pathname);
          // Reload page to let AstraContext pick up the session cleanly and redirect
          window.location.reload();
        });
      }
    }
  }, [navigate]);

  return (
    <div className="app-container">
      {/* Animated Celestial Splash Screen Overlay on Initial App Load */}
      <SplashScreenOverlay />

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
