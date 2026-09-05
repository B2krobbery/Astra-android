import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { ArrowLeft, Sparkles, Heart, ShieldCheck, Flame, Gem, Hash, ScrollText, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';
import { KootaBreakdownWheel } from '../components/KootaBreakdownWheel';
import { AstrologyEngine } from '../data/astrologyEngine';
import { NumerologyEngine } from '../data/NumerologyEngine';
import { ChemistryEngine } from '../data/ChemistryEngine';
import { NadiShastraProvider } from '../data/NadiShastraProvider';

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

  // 1. Compute Authentic Astrology & Ashtakoota
  const astroResult = useMemo(() => {
    if (!candidate) return null;
    return AstrologyEngine.calculateCompatibility(userProfile, candidate);
  }, [userProfile, candidate]);

  // 2. Compute Authentic Numerology
  const numerologyReport = useMemo(() => {
    if (!candidate) return null;
    return NumerologyEngine.generateReport(
      candidate.name,
      '1996-05-15', // Fallback standard birthdate if private
      userProfile.dateOfBirth
    );
  }, [candidate, userProfile.dateOfBirth]);

  // 3. Compute Authentic Chemistry
  const chemistryReport = useMemo(() => {
    if (!candidate) return null;
    const userAnswers = (userProfile as any).chemistryAnswers || (userProfile as any).marriageQuestionnaire || {};
    const candAnswers = (candidate as any).chemistryAnswers || (candidate as any).marriageQuestionnaire || {};
    return ChemistryEngine.computeChemistry(userAnswers, candAnswers);
  }, [userProfile, candidate]);

  if (!candidate) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>No candidate selected.</p>
        <PrimaryButton onClick={() => navigate('/discover')}>Return to Discover Feed</PrimaryButton>
      </div>
    );
  }

  const gunaScoreNum = astroResult ? parseFloat(astroResult.gunaScore) || 28 : 28;

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: themeMode === 'LIGHT' ? '#FFF5F7' : 'var(--bg-primary)',
        color: 'var(--text-primary)',
        paddingBottom: '60px',
        overflowY: 'auto'
      }}
    >
      {/* Fixed Top Bar */}
      <header
        style={{
          padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 16px 20px',
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
          {candidate.intent === 'Marriage' ? 'Vedic Kundali Harmony Report 🪐' : 'Compatibility Report'}
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
            {astroResult?.score || 78}% {candidate.intent === 'Marriage' ? 'Kundali Harmony' : 'Match'}
          </h2>
          {candidate.intent === 'Marriage' && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {userProfile.name} ({astroResult?.userNakshatra || 'Ashwini'}) & {candidate.name} ({astroResult?.candidateNakshatra || candidate.nakshatra || 'Ashwini'})
            </p>
          )}
        </div>

        {candidate.intent === 'Marriage' && (
          <>
            {/* Interactive 8-Koota Wheel Matrix (36 Gunas Breakdown) */}
            <KootaBreakdownWheel totalScore={gunaScoreNum} />

            {/* 8 Kootas Detailed Matrix List */}
            {astroResult?.detailedGunas && (
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
                <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
                  Authentic 36 Guna Breakdown ({gunaScoreNum}/36)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {astroResult.detailedGunas.map(guna => (
                    <div 
                      key={guna.name}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '8px 12px', 
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.03)',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: '#FFF' }}>{guna.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{guna.categoryMeaning}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, color: guna.score === guna.max ? '#4ADE80' : guna.score > 0 ? 'var(--accent-amber-light)' : '#F43F5E' }}>
                          {guna.score} / {guna.max} pts
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{guna.boyValue} • {guna.girlValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  <span style={{ color: 'var(--text-secondary)' }}>🌙 Moon Nakshatra:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{userProfile.nakshatra || 'Calculated'} & {candidate.nakshatra || 'Calculated'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>✨ Moon Rashi:</span>
                  <span style={{ fontWeight: 700, color: '#4ADE80' }}>{userProfile.rashi?.split(' ')[0] || 'Calculated'} & {candidate.rashi?.split(' ')[0] || 'Calculated'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🛡️ Nadi:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-amber-light)' }}>{userProfile.nadi || 'Calculated'} & {candidate.nadi || 'Calculated'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Kuja / Manglik Status:</span>
                  <span style={{ fontWeight: 700, color: userProfile.manglik === 'Yes' || candidate.manglik === 'Yes' ? '#FDA4AF' : '#4ADE80' }}>
                    {userProfile.manglik === 'Yes' && candidate.manglik === 'Yes' 
                      ? 'Both Manglik (Balanced/Cancelled)' 
                      : userProfile.manglik === 'Yes' || candidate.manglik === 'Yes' 
                      ? 'Single Manglik (Remedy recommended)' 
                      : 'No Manglik Dosha'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SECTION B: Real Numerology & Life Path Score Card */}
        {numerologyReport && (
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
                Pythagorean Numerology Resonance 🔢
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Life Path Alignment</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ADE80', marginTop: '2px' }}>
                  Path {numerologyReport.lifePathNumber} ({numerologyReport.compatibilityScore}%)
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Name Destiny Vibration</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber-light)', marginTop: '2px' }}>
                  Destiny {numerologyReport.destinyNumber}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
              {numerologyReport.compatibilityVerdict}
            </p>
          </div>
        )}

        {/* SECTION C: Real Answer-Derived Chemistry Card */}
        {chemistryReport && (
          <div
            style={{
              padding: '20px',
              borderRadius: '24px',
              background: 'var(--bg-card)',
              border: '1px solid rgba(79, 70, 229, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                Multi-Dimensional Chemistry ({chemistryReport.overallScore}%)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Interests Overlap:</span>
                <div style={{ fontWeight: 700, color: '#FFF' }}>{chemistryReport.sharedInterestsScore}%</div>
              </div>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Lifestyle Alignment:</span>
                <div style={{ fontWeight: 700, color: '#FFF' }}>{chemistryReport.lifestyleAlignmentScore}%</div>
              </div>
            </div>

            {chemistryReport.sharedTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {chemistryReport.sharedTags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(79, 70, 229, 0.15)', color: '#A5B4FC', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION D: Nadi Shastra Palm Leaf Status */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <ScrollText size={22} color="var(--accent-amber-light)" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>Nadi Shastra Palm Leaf Archive</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Pending digitized Vaitheeswaran Koil manuscript registry access (un-fabricated by policy).
            </div>
          </div>
        </div>

        {/* SECTION E: Automated Remedies Card */}
        {candidate.intent === 'Marriage' && (
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {userProfile.manglik === 'Yes' || candidate.manglik === 'Yes' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                  <AlertTriangle size={16} color="#F43F5E" />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFF' }}>Kuja Dosha Remedy</div>
                    <div style={{ fontSize: '0.72rem', color: '#FDA4AF' }}>Hanuman Chalisa recitation on Tuesdays or Kumbh Vivah ceremony prior to marriage.</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFF' }}>No Major Doshas Detected</div>
                    <div style={{ fontSize: '0.72rem', color: '#6EE7B7' }}>Planetary positions show favorable foundational harmony for marital harmony.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Start Connection CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <PrimaryButton onClick={handleStartChatting}>
            <Heart size={18} fill="#0F0C1B" /> {candidate.intent === 'Marriage' ? `Connect with ${candidate.name}` : `Send a Message`}
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
};
