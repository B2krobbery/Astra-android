import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { ArrowLeft, Sparkles, Heart, ShieldCheck } from 'lucide-react';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { PrimaryButton } from '../components/AstraButtons';
import { KootaBreakdownWheel } from '../components/KootaBreakdownWheel';

export const HoroscopeCompatibilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, selectedCandidate, openConversationForCandidate } = useAstra();
  const candidate = selectedCandidate;

  const handleStartChatting = () => {
    openConversationForCandidate(candidate);
    navigate('/chat-detail');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        paddingBottom: '88px',
        position: 'relative'
      }}
    >
      {/* Header Bar */}
      <header
        style={{
          padding: '16px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            Vedic Compatibility Analysis
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Guna Milan & Planetary Synastry Alignment
          </span>
        </div>
      </header>

      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Comparison Header Card */}
        <div
          style={{
            padding: '24px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, rgba(30, 24, 54, 0.9) 0%, rgba(42, 14, 26, 0.9) 100%)',
            border: '1px solid var(--accent-amber)',
            boxShadow: 'var(--shadow-cosmic)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <CandidateAvatar src={userProfile.photoUrl} name={userProfile.name} size={76} isVerified={userProfile.policeVerified} />
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={18} color="var(--accent-amber-light)" className="spin-slow" />
            </div>
            <CandidateAvatar src={candidate.photoUrls[0]} name={candidate.name} size={76} isVerified={candidate.isVerified} />
          </div>

          <h2 className="heading-font" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
            {candidate.compatibilityScore}% Kundali Harmony
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {userProfile.name} ({userProfile.nakshatra}) & {candidate.name} ({candidate.nakshatra})
          </p>
        </div>

        {/* Interactive 8-Koota Wheel Matrix */}
        <KootaBreakdownWheel totalScore={Math.round((candidate.compatibilityScore / 100) * 36)} />

        {/* Planetary Synastry Alignment Summary */}
        <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
            Planetary Placement Synergy
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>🌙 Moon Placement (Emotional Base):</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Vrishabha & Ashwini</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>✨ Venus Transit (Romance & Value):</span>
              <span style={{ fontWeight: 700, color: '#4ADE80' }}>5th House Trine</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>🛡️ Nadi Neutralization Status:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-amber-light)' }}>No Nadi Dosha</span>
            </div>
          </div>
        </div>

        {/* Start Connection CTA */}
        <PrimaryButton onClick={handleStartChatting}>
          <Heart size={18} fill="#0F0C1B" /> Connect with {candidate.name}
        </PrimaryButton>
      </main>
    </div>
  );
};
