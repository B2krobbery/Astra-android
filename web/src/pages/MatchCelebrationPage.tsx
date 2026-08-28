import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { Sparkles, MessageCircle, Heart } from 'lucide-react';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';

export const MatchCelebrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, lastMatchedCandidate, selectedCandidate, openConversationForCandidate } = useAstra();
  const candidate = lastMatchedCandidate || selectedCandidate;

  const handleStartChatting = () => {
    openConversationForCandidate(candidate);
    navigate('/chat-detail');
  };

  return (
    <div
      style={{
        padding: '32px 24px',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 35%, rgba(244, 63, 94, 0.4) 0%, rgba(42, 14, 26, 0.95) 60%, var(--bg-primary) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber-light)' }}>
          <Sparkles size={24} className="spin-slow" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Cosmic Match Aligned
          </span>
        </div>

        <h1 className="heading-font" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#FFF' }}>
          It's a Cosmic Match! ✨
        </h1>

        <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '300px' }}>
          You and <strong style={{ color: 'var(--accent-amber-light)' }}>{candidate.name}</strong> share an{' '}
          <strong style={{ color: 'var(--accent-amber-light)' }}>{candidate.compatibilityScore}% Kundali score</strong>.
        </p>

        {/* Dual Avatars with Heart Glow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '-12px', marginTop: '16px', position: 'relative' }}>
          <CandidateAvatar src={userProfile.photoUrl} name={userProfile.name} size={90} isVerified={userProfile.policeVerified} />
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              margin: '0 -16px',
              border: '3px solid var(--bg-primary)',
              boxShadow: '0 0 20px rgba(244, 63, 94, 0.8)'
            }}
          >
            <Heart size={22} fill="#FFF" color="#FFF" />
          </div>
          <CandidateAvatar src={candidate.photoUrls[0]} name={candidate.name} size={90} isVerified={candidate.isVerified} />
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <PrimaryButton onClick={handleStartChatting}>
          <MessageCircle size={18} /> Send Message to {candidate.name}
        </PrimaryButton>

        <SecondaryOutlineButton onClick={() => navigate('/discover')}>
          Keep Discovering Stars
        </SecondaryOutlineButton>
      </div>
    </div>
  );
};
