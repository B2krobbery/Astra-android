import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { ArrowLeft, Sparkles, MapPin, Briefcase, GraduationCap, ShieldCheck, CheckCircle2, Globe, UserX, AlertTriangle, Landmark, Activity, Utensils, Wine, Cigarette, Lock, ShieldAlert } from 'lucide-react';
import { VerificationBadge } from '../components/VerificationBadge';
import { VerificationType } from '../types';
import { PassCircleButton, LikeCircleButton, CosmicCheckButton } from '../components/AstraButtons';

export const CandidateDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCandidate, likeCandidate, passCandidate, checkCompatibility, openChaanbean, conversations, unfriendCandidate, t } = useAstra();
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [isUnfriending, setIsUnfriending] = useState(false);

  const candidate = selectedCandidate;
  if (!candidate) return null;

  const isFriend = conversations.some(c => c.candidate.id === candidate.id);

  const handleConfirmUnfriend = async () => {
    setIsUnfriending(true);
    try {
      await unfriendCandidate(candidate.id);
      setShowUnfriendModal(false);
      navigate('/matches');
    } catch (e) {
      console.error('Failed to unfriend:', e);
    } finally {
      setIsUnfriending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: 'var(--bg-primary)',
        paddingBottom: '88px',
        position: 'relative',
        overflowY: 'auto'
      }}
    >
      {/* Top Bar Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(11, 11, 14, 0.6)',
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

        {isFriend && (
          <button
            onClick={() => setShowUnfriendModal(true)}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '9999px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#EF4444',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <UserX size={14} /> Unfriend
          </button>
        )}
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
              color: '#0B0B0E',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-cosmic)'
            }}
          >
            <Sparkles size={16} fill="#0B0B0E" />
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
            <h4 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-amber-light)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--accent-amber-light)" /> {t('why_matched')} ({candidate.name})
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

        {/* Ancestral 4-Gotra Lineage Card */}
        {(candidate.gotra || candidate.motherFatherGotra || candidate.fatherMotherGotra || candidate.motherMotherGotra || candidate.religion || candidate.caste) && (
          <div
            style={{
              padding: '16px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Landmark size={15} style={{ color: 'var(--accent-gold)' }} /> Ancestral Gotra Lineage (4 Gotras)
              </h3>
              {(candidate.religion || candidate.caste) && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber-light)', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                  {[candidate.religion, candidate.caste, candidate.subCaste].filter(Boolean).join(' • ')}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Father's Father (Main)</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F3F4F6' }}>{candidate.gotra || 'Not Specified'}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Father's Mother</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F3F4F6' }}>{candidate.fatherMotherGotra || 'Not Specified'}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Mother's Father</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F3F4F6' }}>{candidate.motherFatherGotra || 'Not Specified'}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Mother's Mother</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F3F4F6' }}>{candidate.motherMotherGotra || 'Not Specified'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Verification Badges */}
        <div style={{ marginBottom: '20px' }}>
          <h3 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
            {t('trust_badges')}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {candidate.educationVerified && (
              <VerificationBadge
                type={VerificationType.EDUCATION}
                onClick={() => openChaanbean(candidate)}
              />
            )}
            {candidate.policeVerified && (
              <VerificationBadge
                type={VerificationType.POLICE}
                onClick={() => openChaanbean(candidate)}
              />
            )}
            {candidate.creditVerified && (
              <VerificationBadge
                type={VerificationType.CREDIT}
                onClick={() => openChaanbean(candidate)}
              />
            )}
          </div>
        </div>

        {/* Health & Lifestyle */}
        {(candidate.diet || candidate.alcohol || candidate.smoking || candidate.healthCondition !== undefined || candidate.intent === 'Marriage') && (
          <div
            style={{
              marginBottom: '20px',
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <h3
              className="heading-font"
              style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Activity size={15} style={{ color: 'var(--accent-gold)' }} /> Health &amp; Lifestyle
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: candidate.healthCondition ? '12px' : '0' }}>
              {candidate.diet && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '9999px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', fontSize: '0.78rem', color: '#86efac' }}>
                  <Utensils size={13} /> {candidate.diet}
                </span>
              )}
              {candidate.alcohol && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '9999px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', fontSize: '0.78rem', color: '#fde68a' }}>
                  <Wine size={13} /> Alcohol: {candidate.alcohol}
                </span>
              )}
              {candidate.smoking && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '9999px', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.25)', fontSize: '0.78rem', color: '#cbd5e1' }}>
                  <Cigarette size={13} /> Smoking: {candidate.smoking}
                </span>
              )}
              {/* Health Status Pill */}
              {(() => {
                const statusText = (candidate.healthStatus || '').trim();
                const lower = statusText.toLowerCase();
                let statusLabel = 'Not Disclosed';
                let sBg = 'rgba(59, 130, 246, 0.12)';
                let sBorder = 'rgba(59, 130, 246, 0.3)';
                let sColor = '#93c5fd';

                if (lower.includes('private') || lower.includes('inquiry')) {
                  statusLabel = 'Disclosed Privately';
                  sBg = 'rgba(245, 158, 11, 0.15)';
                  sBorder = 'rgba(245, 158, 11, 0.3)';
                  sColor = '#fde68a';
                } else if (lower.includes('excellent')) {
                  statusLabel = 'Excellent';
                  sBg = 'rgba(34, 197, 94, 0.12)';
                  sBorder = 'rgba(34, 197, 94, 0.3)';
                  sColor = '#86efac';
                } else if (lower === 'good') {
                  statusLabel = 'Good';
                } else if (statusText) {
                  statusLabel = statusText;
                }

                return (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    background: sBg,
                    border: `1px solid ${sBorder}`,
                    fontSize: '0.78rem',
                    color: sColor
                  }}>
                    <Lock size={13} /> Health: {statusLabel}
                  </span>
                );
              })()}

              {/* Disease / Pre-existing Condition Pill — always visible */}
              {(() => {
                const condText = (candidate.healthCondition || '').trim();
                const hasText = condText.length > 0;
                const displayLabel = hasText ? condText : 'None';

                return (
                  <>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      background: hasText ? 'rgba(239, 68, 68, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                      border: hasText ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(100, 116, 139, 0.25)',
                      fontSize: '0.78rem',
                      color: hasText ? '#fca5a5' : '#94a3b8'
                    }}>
                      <ShieldAlert size={13} /> Disease: {displayLabel}
                    </span>
                    {hasText && (
                      <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pre-existing Disease / Medical Condition Disclosure</span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                          {condText}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

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

        {/* Personal Values & Vision (Questionnaire) */}
        {candidate.marriageQuestionnaire && Object.keys(candidate.marriageQuestionnaire).length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>
              Personal Values & Vision
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'q11', text: 'Raising children religiously' },
                { id: 'q12', text: 'Hanging out with friends after marriage' },
                { id: 'q13', text: 'How would you like to celebrate your first wedding anniversary?' }
              ].map(q => {
                const answer = candidate.marriageQuestionnaire?.[q.id];
                if (!answer) return null;
                return (
                  <div key={q.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {q.text}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {answer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}


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

      {/* Unfriend Confirmation Modal */}
      {showUnfriendModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(11, 11, 14, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '2px solid #EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={28} color="#EF4444" />
            </div>

            <h3 className="heading-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Unfriend {candidate.name}?
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
              This will remove <strong>{candidate.name}</strong> from your Friend List and clear your connection.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowUnfriendModal(false)}
                disabled={isUnfriending}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnfriend}
                disabled={isUnfriending}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
                  border: 'none',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                {isUnfriending ? 'Unfriending...' : 'Unfriend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
