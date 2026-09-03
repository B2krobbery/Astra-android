import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { ArrowLeft, Sparkles, MapPin, Briefcase, GraduationCap, ShieldCheck, CheckCircle2, Globe } from 'lucide-react';
import { VerificationBadge } from '../components/VerificationBadge';
import { VerificationType } from '../types';
import { PassCircleButton, LikeCircleButton, CosmicCheckButton } from '../components/AstraButtons';

export const CandidateDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCandidate, likeCandidate, passCandidate, checkCompatibility, showVerification, t } = useAstra();
  const candidate = selectedCandidate;
  if (!candidate) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        paddingBottom: '88px',
        position: 'relative'
      }}
    >
      {/* Top Bar Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(15, 12, 27, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Main Image Header */}
      <div style={{ position: 'relative', width: '100%', height: '360px' }}>
        <img
          src={candidate.photoUrls[0]}
          alt={candidate.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, var(--bg-primary) 100%)'
          }}
        />

        {/* Compatibility Floating Badge */}
        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
              color: '#0F0C1B',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-cosmic)'
            }}
          >
            <Sparkles size={16} fill="#0F0C1B" />
            {candidate.compatibilityScore}% {t('compatibility_score')}
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div style={{ padding: '0 20px', marginTop: '-20px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 className="heading-font" style={{ fontSize: '2rem', fontWeight: 800 }}>
            {candidate.name}, {candidate.age}
          </h1>
          {candidate.isVerified && <ShieldCheck size={24} color="var(--accent-amber)" />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={16} color="var(--accent-indigo)" /> {candidate.profession}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GraduationCap size={16} color="var(--accent-indigo)" /> {candidate.education}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="var(--accent-indigo)" /> {candidate.location}
          </div>
        </div>

        {/* Explicit Match Reason Breakdown Card */}
        {candidate.matchReasons && candidate.matchReasons.length > 0 && (
          <div
            style={{
              padding: '16px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(79, 70, 229, 0.12) 100%)',
              border: '1px solid var(--accent-amber)',
              marginBottom: '20px'
            }}
          >
            <h4 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-amber-light)', marginBottom: '10px' }}>
              💡 {t('why_matched')} ({candidate.name})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {candidate.matchReasons.map((reason, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={16} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Astrology Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(30, 24, 54, 0.8) 0%, rgba(42, 14, 26, 0.7) 100%)',
            border: '1px solid var(--border-glow)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber-light)', fontWeight: 600, textTransform: 'uppercase' }}>
              {t('vedic_placement')}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)' }}>Guna Milan Verified</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nakshatra</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>{candidate.nakshatra}</p>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rashi (Moon Sign)</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>{candidate.rashi}</p>
            </div>
          </div>
        </div>

        {/* Verification Badges */}
        <div style={{ marginBottom: '20px' }}>
          <h3 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
            {t('trust_badges')}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {candidate.educationVerified && (
              <VerificationBadge
                type={VerificationType.EDUCATION}
                onClick={() => showVerification(VerificationType.EDUCATION, candidate)}
              />
            )}
            {candidate.policeVerified && (
              <VerificationBadge
                type={VerificationType.POLICE}
                onClick={() => showVerification(VerificationType.POLICE, candidate)}
              />
            )}
            {candidate.creditVerified && (
              <VerificationBadge
                type={VerificationType.CREDIT}
                onClick={() => showVerification(VerificationType.CREDIT, candidate)}
              />
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: '20px' }}>
          <h3 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
            {t('about_me')}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {candidate.bio}
          </p>
        </div>

        {/* Interests */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
            {t('passions')}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {candidate.interests.map((interest, idx) => (
              <span
                key={idx}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)'
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <CosmicCheckButton
            onClick={() => {
              checkCompatibility(candidate, () => navigate('/horoscope-compatibility'));
            }}
          />
        </div>
      </div>

      {/* Floating Action Footer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: '480px',
          margin: '0 auto',
          padding: '12px 24px 20px',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-backdrop)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 40
        }}
      >
        <PassCircleButton
          onClick={() => {
            passCandidate(candidate);
            navigate(-1);
          }}
          size={58}
        />
        <LikeCircleButton
          onClick={() => {
            likeCandidate(candidate, () => navigate('/match-celebration'), () => navigate(-1));
          }}
          size={64}
        />
      </div>
    </div>
  );
};
