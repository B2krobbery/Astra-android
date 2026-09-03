import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AstraProvider, useAstra } from './context/AstraContext';
import { SplashPage } from './pages/SplashPage';
import { TypeformOnboardingPage } from './pages/TypeformOnboardingPage';
import { MarriageOnboardingPage } from './pages/MarriageOnboardingPage';
import { ProfileOnboardingPage } from './pages/ProfileOnboardingPage';
import { AstrologySetupPage } from './pages/AstrologySetupPage';
import { DiscoverFeedPage } from './pages/DiscoverFeedPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { HoroscopeCompatibilityPage } from './pages/HoroscopeCompatibilityPage';
import { MatchCelebrationPage } from './pages/MatchCelebrationPage';
import { MatchesConversationsPage } from './pages/MatchesConversationsPage';
import { ChatDetailPage } from './pages/ChatDetailPage';
import { AstroAiAssistantPage } from './pages/AstroAiAssistantPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminAiPanelPage } from './pages/AdminAiPanelPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminMarketingPage } from './pages/AdminMarketingPage';
import { DigitalWeddingCardPage } from './pages/DigitalWeddingCardPage';
import { VerificationModal } from './components/VerificationModal';
import { ReferralModal } from './components/ReferralModal';
import { SplashScreenOverlay } from './components/SplashScreenOverlay';

const AppRoutes: React.FC = () => {
  const { activeVerificationDetail, dismissVerification, verifyPoliceForUser } = useAstra();

  return (
    <div className="app-container">
      {/* Animated Celestial Splash Screen Overlay on Initial App Load */}
      <SplashScreenOverlay />

      <Routes>
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
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>

      {/* Global Verification Modal Overlay */}
      {activeVerificationDetail && (
        <VerificationModal
          detail={activeVerificationDetail}
          onDismiss={dismissVerification}
          onVerifyAction={!activeVerificationDetail.isVerified ? verifyPoliceForUser : null}
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
