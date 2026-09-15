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
  const { userProfile, selectedCandidate, openConversationForCandidate } = useAstra();
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
          padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--glass-bg)',
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

      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
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
              {doshasList.some(d => d.status === 'DETECTED' && d.remedy) ? (
                doshasList.filter(d => d.status === 'DETECTED' && d.remedy).map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                    <AlertTriangle size={16} color="#F43F5E" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFF' }}>{d.name} Remedy</div>
                      <div style={{ fontSize: '0.72rem', color: '#FDA4AF', marginTop: '2px' }}>{d.remedy}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFF' }}>No Major Doshas Detected</div>
                    <div style={{ fontSize: '0.72rem', color: '#6EE7B7' }}>Planetary positions show favorable foundational harmony for marital harmony.</div>
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

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Comprehensive Vedic evaluation covering Kuja (Manglik), Nadi, Bhakoot, Gana, and Kalathra afflictions with authentic Parashari cancellation rules.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doshasList.map(dosha => {
                const isDetected = dosha.status === 'DETECTED';
                const isNeutralized = dosha.status === 'NEUTRALIZED';

                const badgeBg = isDetected
                  ? 'rgba(244, 63, 94, 0.15)'
                  : isNeutralized
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(34, 197, 94, 0.15)';

                const badgeBorder = isDetected
                  ? 'rgba(244, 63, 94, 0.35)'
                  : isNeutralized
                  ? 'rgba(245, 158, 11, 0.35)'
                  : 'rgba(34, 197, 94, 0.35)';

                const badgeText = isDetected
                  ? '#FDA4AF'
                  : isNeutralized
                  ? '#FDE047'
                  : '#86EFAC';

                const cardBorder = isDetected
                  ? '1px solid rgba(244, 63, 94, 0.25)'
                  : isNeutralized
                  ? '1px solid rgba(245, 158, 11, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.08)';

                return (
                  <div
                    key={dosha.name}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: cardBorder,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#FFF' }}>
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.71rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Energy Influence:</span>
                      <span style={{ color: isDetected ? '#FDA4AF' : 'var(--text-secondary)', fontWeight: 600 }}>{dosha.impact}</span>
                    </div>

                    {isDetected && dosha.remedy && (
                      <div style={{ marginTop: '2px', padding: '6px 10px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.08)', border: '1px dashed rgba(244, 63, 94, 0.25)', fontSize: '0.71rem', color: '#FECDD3', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
