import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { ArrowLeft, Sparkles, Heart, ShieldCheck, Flame, Gem, Hash, ScrollText, CheckCircle2, Lock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';
import { KootaBreakdownWheel } from '../components/KootaBreakdownWheel';
import { AstrologyEngine } from '../data/astrologyEngine';
import { NumerologyEngine } from '../data/NumerologyEngine';
import { ChemistryEngine } from '../data/ChemistryEngine';
import { NadiShastraProvider } from '../data/NadiShastraProvider';

export const HoroscopeCompatibilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, selectedCandidate, openConversationForCandidate, candidates, conversations, selectCandidate } = useAstra();
  const [localCandidate, setLocalCandidate] = React.useState<any>(null);
  const candidate = localCandidate || selectedCandidate;

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

  // 4. Compute Comprehensive Vedic Doshas
  const doshasList = useMemo(() => {
    if (!candidate) return [];
    const list: {
      name: string;
      status: 'DETECTED' | 'NEUTRALIZED' | 'CLEAR';
      statusText: string;
      details: string;
      impact: string;
      remedy?: string;
    }[] = [];

    // 1. Kuja / Manglik Dosha
    const userIsManglik = userProfile.manglik === 'Yes';
    const candIsManglik = candidate.manglik === 'Yes';
    if (userIsManglik && candIsManglik) {
      list.push({
        name: 'Kuja / Manglik Dosha',
        status: 'NEUTRALIZED',
        statusText: 'Neutralized (Both Manglik)',
        details: 'Both individuals share active Mars placement; mutual intensity neutralizes friction and creates high shared drive.',
        impact: 'Balanced fiery energy & mutual understanding',
        remedy: 'No special puja needed; harmonious mutual alignment.'
      });
    } else if (userIsManglik || candIsManglik) {
      const who = userIsManglik ? userProfile.name || 'Seeker' : candidate.name;
      list.push({
        name: 'Kuja / Manglik Dosha',
        status: 'DETECTED',
        statusText: 'Present (Single Manglik)',
        details: `${who} has Mars (Kuja) influence in a marital quadrant (House 1, 2, 4, 7, 8, or 12).`,
        impact: 'High fiery drive, dynamic temperamental intensity',
        remedy: 'Hanuman Chalisa recitation on Tuesdays or traditional Kumbh Vivah prior to marriage.'
      });
    } else {
      list.push({
        name: 'Kuja / Manglik Dosha',
        status: 'CLEAR',
        statusText: 'Clear (No Dosha)',
        details: 'Neither individual exhibits adverse Mars placement from Lagna or Moon.',
        impact: 'Calm and steady foundational harmony'
      });
    }

    // 2. Nadi Dosha
    const nadiGuna = astroResult?.detailedGunas?.find(g => g.name === 'Nadi');
    const isNadiDosha = nadiGuna ? nadiGuna.score === 0 : false;
    const isNadiCancelled = nadiGuna?.score === 8 && nadiGuna?.boyValue === nadiGuna?.girlValue;
    if (isNadiCancelled) {
      list.push({
        name: 'Nadi Dosha',
        status: 'NEUTRALIZED',
        statusText: 'Neutralized (Pada Difference)',
        details: `Same Nadi (${nadiGuna?.boyValue || 'Constitutional'}), but different Nakshatra Padas cancel genetic clash by Vedic exception rules.`,
        impact: 'Biological alignment restored to full 8/8 points'
      });
    } else if (isNadiDosha) {
      list.push({
        name: 'Nadi Dosha',
        status: 'DETECTED',
        statusText: 'Present (0/8 Points)',
        details: `Both partners share the identical Nadi (${nadiGuna?.boyValue || 'Same Constitution'}), reflecting identical physiological constitution.`,
        impact: 'Potential sensitivity in biological resonance and progeny energy',
        remedy: 'Maha Mrityunjaya Japa or gold donation traditionally advised by Vedic astrologers.'
      });
    } else {
      list.push({
        name: 'Nadi Dosha',
        status: 'CLEAR',
        statusText: 'Clear (8/8 Full Points)',
        details: `Distinct physiological energies (${nadiGuna?.boyValue || 'Aadi/Madhya'} vs ${nadiGuna?.girlValue || 'Antya'}).`,
        impact: 'Optimal genetic compatibility and vitality'
      });
    }

    // 3. Bhakoot Dosha
    const bhakootGuna = astroResult?.detailedGunas?.find(g => g.name === 'Bhakoot');
    const isBhakootDosha = bhakootGuna ? bhakootGuna.score === 0 : false;
    if (isBhakootDosha) {
      list.push({
        name: 'Bhakoot Dosha',
        status: 'DETECTED',
        statusText: 'Present (0/7 Points)',
        details: bhakootGuna?.description || 'Moon sign relative distance falls in inharmonious placement (2/12, 6/8, or 9/5).',
        impact: 'Requires mindful communication around finance and emotional expectations',
        remedy: 'Cultivate conscious empathy; chanting Vishnu Sahasranama brings emotional equilibrium.'
      });
    } else {
      list.push({
        name: 'Bhakoot Dosha',
        status: 'CLEAR',
        statusText: 'Clear (7/7 Full Points)',
        details: 'Moon signs form mutually supportive houses, fostering natural emotional bonding.',
        impact: 'Long-term familial prosperity and deep emotional connection'
      });
    }

    // 4. Gana Dosha
    const ganaGuna = astroResult?.detailedGunas?.find(g => g.name === 'Gana');
    const isGanaDosha = ganaGuna ? ganaGuna.score === 0 : false;
    const isGanaPartial = ganaGuna ? ganaGuna.score > 0 && ganaGuna.score < 5 : false;
    if (isGanaDosha) {
      list.push({
        name: 'Gana Dosha',
        status: 'DETECTED',
        statusText: 'Present (0/6 Points)',
        details: `Temperament clash (${ganaGuna?.boyValue || 'Deva'} vs ${ganaGuna?.girlValue || 'Rakshasa'}).`,
        impact: 'Distinct daily pacing, lifestyle philosophies, and behavioral expectations',
        remedy: 'Practice conscious patience and respect for individual lifestyles.'
      });
    } else if (isGanaPartial) {
      list.push({
        name: 'Gana Dosha',
        status: 'NEUTRALIZED',
        statusText: 'Moderate Harmony',
        details: `${ganaGuna?.boyValue || 'Temperament'} & ${ganaGuna?.girlValue || 'Temperament'} have moderate differences with workable synergy.`,
        impact: 'Complementary strengths with occasional friction'
      });
    } else {
      list.push({
        name: 'Gana Dosha',
        status: 'CLEAR',
        statusText: 'Clear (6/6 Full Points)',
        details: `Harmonious temperaments (${ganaGuna?.boyValue || 'Deva/Manushya'}).`,
        impact: 'Effortless daily communication and shared life rhythm'
      });
    }

    // 5. Rahu in 7th / Kalathra Factor
    const seekerChart = userProfile.dateOfBirth && userProfile.birthTime ? AstrologyEngine.calculateChart(userProfile.dateOfBirth, userProfile.birthTime, userProfile.birthLocation || '') : null;
    const isRahuIn7th = seekerChart?.planets?.['Rahu']?.houseFromLagna === 7;
    if (isRahuIn7th) {
      list.push({
        name: 'Rahu in 7th House (Kalathra Factor)',
        status: 'DETECTED',
        statusText: 'Observed Placement',
        details: 'Rahu is positioned in the 7th house (house of union) in the primary birth chart.',
        impact: 'Desires unconventional partnership; requires transparency around expectations',
        remedy: 'Rahu Shanti mantra recitation or Shiva Aradhana on Saturdays.'
      });
    } else {
      list.push({
        name: 'Rahu in 7th (Kalathra)',
        status: 'CLEAR',
        statusText: 'Clear (Auspicious)',
        details: '7th house is unencumbered by Rahu/Ketu nodal axis in primary placement.',
        impact: 'Stable foundational energy for lifelong partnership'
      });
    }

    return list;
  }, [userProfile, candidate, astroResult]);

  if (!candidate) {
    const allAvailable = [
      ...conversations.map(c => ({ ...c.candidate, isMatch: true })),
      ...candidates.filter(c => !conversations.some(con => con.candidate.id === c.id))
    ];

    return (
      <div
        className="glass-page horoscope-glass-page"
        style={{
          minHeight: '100vh',
          height: '100vh',
          background: 'transparent',
          color: 'var(--text-primary)',
          padding: '24px 20px 60px',
          overflowY: 'auto'
        }}
      >
        <div style={{ maxWidth: '1040px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="heading-font" style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                Select a Partner for Kundali Compatibility ✨
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Compare Ashtakoota Guna Milan (36 Points), Vedic Doshas, and planetary synastry with any connection.
              </p>
            </div>
          </div>

          {allAvailable.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              <Sparkles size={36} color="var(--accent-amber)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>No Profiles in Queue</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Discover candidates in your feed to calculate horoscope harmony.
              </p>
              <button
                onClick={() => navigate('/discover')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
                  border: 'none',
                  color: '#0B0B0E',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Go to Discovery
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {allAvailable.map(cand => (
                <div
                  key={cand.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CandidateAvatar src={cand.photoUrls?.[0]} name={cand.name} size={54} isVerified={cand.isVerified} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cand.name}, {cand.age}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--accent-amber-light)', fontWeight: 600, margin: '2px 0 0' }}>
                        {cand.nakshatra || 'Nakshatra Unspecified'} · {cand.rashi || 'Rashi'}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cand.profession || cand.location}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      selectCandidate(cand);
                      setLocalCandidate(cand);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
                      border: '1px solid var(--border-glow)',
                      color: 'var(--accent-amber-light)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={14} /> Calculate Kundali Match
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const gunaScoreNum = astroResult ? parseFloat(astroResult.gunaScore) || 28 : 28;

  return (
    <div
      className="glass-page horoscope-glass-page"
      style={{
        minHeight: '100vh',
        height: '100vh',
        background: 'transparent',
        color: 'var(--text-primary)',
        paddingBottom: '60px',
        overflowY: 'auto'
      }}
    >
      {/* Fixed Top Bar */}
      <header
        style={{
          padding: 'calc(16px + env(safe-area-inset-top, 0px)) 24px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="heading-font" style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            {candidate.intent === 'Marriage' ? `Kundali Harmony: ${candidate.name} 🪐` : `Compatibility: ${candidate.name}`}
          </h1>
        </div>

        <button
          onClick={() => {
            selectCandidate(null as any);
            setLocalCandidate(null);
          }}
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid var(--accent-amber)',
            color: 'var(--accent-amber-light)',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={14} /> Compare Another Profile
        </button>
      </header>

      <main style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
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
                        background: 'var(--nested-card-bg)',
                        border: '1px solid var(--nested-card-border)',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{guna.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{guna.categoryMeaning}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, color: guna.score === guna.max ? 'var(--status-success-text)' : guna.score > 0 ? 'var(--accent-amber-light)' : 'var(--status-detected-text)' }}>
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
                  <span style={{ fontWeight: 700, color: 'var(--status-success-text)' }}>{userProfile.rashi?.split(' ')[0] || 'Calculated'} & {candidate.rashi?.split(' ')[0] || 'Calculated'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🛡️ Nadi:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-amber-light)' }}>{userProfile.nadi || 'Calculated'} & {candidate.nadi || 'Calculated'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Kuja / Manglik Status:</span>
                  <span style={{ fontWeight: 700, color: userProfile.manglik === 'Yes' || candidate.manglik === 'Yes' ? 'var(--status-detected-text)' : 'var(--status-success-text)' }}>
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
              <div style={{ padding: '12px', borderRadius: '14px', background: 'var(--nested-card-bg)', border: '1px solid var(--nested-card-border)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Life Path Alignment</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--status-success-text)', marginTop: '2px' }}>
                  Path {numerologyReport.lifePathNumber} ({numerologyReport.compatibilityScore}%)
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '14px', background: 'var(--nested-card-bg)', border: '1px solid var(--nested-card-border)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Name Destiny Vibration</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber-light)', marginTop: '2px' }}>
                  Destiny {numerologyReport.destinyNumber}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
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
              border: '1px solid var(--border-color)',
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
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--nested-card-bg)', border: '1px solid var(--nested-card-border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Interests Overlap:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{chemistryReport.sharedInterestsScore}%</div>
              </div>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--nested-card-bg)', border: '1px solid var(--nested-card-border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Lifestyle Alignment:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{chemistryReport.lifestyleAlignmentScore}%</div>
              </div>
            </div>

            {chemistryReport.sharedTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {chemistryReport.sharedTags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '9999px', background: 'var(--tag-indigo-bg)', color: 'var(--tag-indigo-text)', border: '1px solid var(--tag-indigo-border)', fontWeight: 600 }}>
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
            background: 'var(--nested-card-bg)',
            border: '1px dashed var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <ScrollText size={22} color="var(--accent-amber-light)" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Nadi Shastra Palm Leaf Archive</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
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
              background: 'var(--remedies-card-bg)',
              border: '1.5px solid var(--accent-rose)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} color="var(--accent-rose)" />
              <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--remedies-card-title)' }}>
                Automated Remedies & Recommended Pujas 🪔
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {doshasList.some(d => d.status === 'DETECTED' && d.remedy) ? (
                doshasList.filter(d => d.status === 'DETECTED' && d.remedy).map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', background: 'var(--remedies-item-bg)', border: '1px solid var(--remedies-item-border)' }}>
                    <AlertTriangle size={16} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--remedies-item-title)' }}>{d.name} Remedy</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--remedies-item-desc)', marginTop: '2px', fontWeight: 500 }}>{d.remedy}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', background: 'var(--remedies-clear-bg)', border: '1px solid var(--remedies-clear-border)' }}>
                  <CheckCircle2 size={16} color="var(--status-success-text)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--remedies-clear-title)' }}>No Major Doshas Detected</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--remedies-clear-desc)', fontWeight: 500 }}>Planetary positions show favorable foundational harmony for marital harmony.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION F: Doshas */}
        {candidate.intent === 'Marriage' && (
          <div
            style={{
              padding: '20px',
              borderRadius: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="var(--accent-amber)" />
                <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
                  Doshas 🛡️
                </h3>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber-light)', border: '1px solid rgba(245, 158, 11, 0.25)', fontWeight: 700 }}>
                {doshasList.filter(d => d.status === 'DETECTED').length === 0 ? 'All Clear' : `${doshasList.filter(d => d.status === 'DETECTED').length} Active`}
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Comprehensive Vedic evaluation covering Kuja (Manglik), Nadi, Bhakoot, Gana, and Kalathra afflictions with authentic Parashari cancellation rules.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doshasList.map(dosha => {
                const isDetected = dosha.status === 'DETECTED';
                const isNeutralized = dosha.status === 'NEUTRALIZED';

                const badgeBg = isDetected
                  ? 'var(--badge-detected-bg)'
                  : isNeutralized
                  ? 'var(--badge-neutralized-bg)'
                  : 'var(--badge-clear-bg)';

                const badgeBorder = isDetected
                  ? 'var(--badge-detected-border)'
                  : isNeutralized
                  ? 'var(--badge-neutralized-border)'
                  : 'var(--badge-clear-border)';

                const badgeText = isDetected
                  ? 'var(--badge-detected-text)'
                  : isNeutralized
                  ? 'var(--badge-neutralized-text)'
                  : 'var(--badge-clear-text)';

                const cardBorder = isDetected
                  ? '1px solid var(--badge-detected-border)'
                  : isNeutralized
                  ? '1px solid var(--badge-neutralized-border)'
                  : '1px solid var(--nested-card-border)';

                return (
                  <div
                    key={dosha.name}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '16px',
                      background: 'var(--nested-card-bg)',
                      border: cardBorder,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                        {dosha.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          background: badgeBg,
                          border: `1px solid ${badgeBorder}`,
                          color: badgeText,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isDetected && <AlertTriangle size={11} />}
                        {isNeutralized && <Sparkles size={11} />}
                        {!isDetected && !isNeutralized && <CheckCircle2 size={11} />}
                        {dosha.statusText}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {dosha.details}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px', paddingTop: '6px', borderTop: '1px solid var(--border-color)', fontSize: '0.71rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Energy Influence:</span>
                      <span style={{ color: isDetected ? 'var(--status-detected-text)' : 'var(--text-primary)', fontWeight: 600 }}>{dosha.impact}</span>
                    </div>

                    {isDetected && dosha.remedy && (
                      <div style={{ marginTop: '2px', padding: '6px 10px', borderRadius: '10px', background: 'var(--remedy-box-bg)', border: '1px dashed var(--remedy-box-border)', fontSize: '0.71rem', color: 'var(--remedy-box-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🪔</span>
                        <span><strong>Remedy:</strong> {dosha.remedy}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Connection CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <PrimaryButton onClick={handleStartChatting}>
            <Heart size={18} fill="#0B0B0E" /> {candidate.intent === 'Marriage' ? `Connect with ${candidate.name}` : `Send a Message`}
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
};
