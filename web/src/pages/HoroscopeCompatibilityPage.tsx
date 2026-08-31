import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { ArrowLeft, Sparkles, Heart, ShieldCheck, Flame, Gem, Hash, ScrollText, CheckCircle2 } from 'lucide-react';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';
import { KootaBreakdownWheel } from '../components/KootaBreakdownWheel';

export const HoroscopeCompatibilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, selectedCandidate, openConversationForCandidate, themeMode } = useAstra();
  const candidate = selectedCandidate;

  const handleStartChatting = () => {
    if (candidate) {
      openConversationForCandidate(candidate);
      navigate('/chat-detail');
    }
  };

  if (!candidate) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>No candidate selected.</p>
        <PrimaryButton onClick={() => navigate('/discover')}>Return to Discover Feed</PrimaryButton>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: themeMode === 'LIGHT' ? '#FFF5F7' : 'var(--bg-primary)',
        color: 'var(--text-primary)',
        paddingBottom: '40px'
      }}
    >
      {/* Fixed Top Bar */}
      <header
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: themeMode === 'LIGHT' ? 'rgba(255, 245, 247, 0.85)' : 'rgba(15, 12, 27, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <button
          onClick={() => navigate('/discover')}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="heading-font" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
          Vedic Synergy Report 🪐
        </h1>
      </header>

      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px', margin: '0 auto' }}>
        {/* Avatars Header */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
            <CandidateAvatar src={userProfile.photoUrl} name={userProfile.name} size={76} isVerified={userProfile.policeVerified} />
            <div
              style={{
                width: 36,
                height: 36,
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
            {userProfile.name} ({userProfile.nakshatra || 'Rohini'}) & {candidate.name} ({candidate.nakshatra})
          </p>
        </div>

        {/* Interactive 8-Koota Wheel Matrix (36 Gunas Breakdown) */}
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
            gap: '12px',
            boxShadow: 'var(--shadow-card)'
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

        {/* SECTION A: Numerology & Life Path Score Card */}
        <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-amber)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-cosmic)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hash size={20} color="var(--accent-amber)" />
            <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
              Nadi Shastra & Name Numerology 🔢
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Life Path Alignment</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ADE80', marginTop: '2px' }}>Path 7 & 9 (88%)</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Name Vibration</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber-light)', marginTop: '2px' }}>Harmony 6</div>
            </div>
          </div>
        </div>

        {/* SECTION A: Automated Remedies & Recommended Pujas Card */}
        <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(42, 14, 26, 0.9) 0%, rgba(30, 24, 54, 0.9) 100%)',
            border: '1.5px solid var(--accent-rose)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-cosmic)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={20} color="#F43F5E" />
            <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, color: '#FDA4AF' }}>
              Automated Remedies & Recommended Pujas 🪔
            </h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            To resolve slight 7th House Rahu transits and ensure marital harmony, Vedic astrologers recommend:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
              <CheckCircle2 size={16} color="#F43F5E" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>Rahu-Ketu Shanti Puja</div>
                <div style={{ fontSize: '0.72rem', color: '#FDA4AF' }}>Suggested before wedding finalization</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Gem size={16} color="var(--accent-amber)" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>Yellow Sapphire (Pukhraj) Gemstone</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber-light)' }}>Enhances Jupiter's blessing for longevity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Connection & Digital Wedding Card CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <PrimaryButton onClick={handleStartChatting}>
            <Heart size={18} fill="#0F0C1B" /> Connect with {candidate.name}
          </PrimaryButton>

          <SecondaryOutlineButton onClick={() => navigate('/wedding-cards')}>
            <ScrollText size={18} /> Create Wedding Card & Order Prints
          </SecondaryOutlineButton>
        </div>
      </main>
    </div>
  );
};
