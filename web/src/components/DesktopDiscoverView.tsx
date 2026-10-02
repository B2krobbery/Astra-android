import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import {
  RotateCcw,
  X,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Compass,
  MessageCircle,
  SlidersHorizontal,
  Share2,
  Globe,
  Utensils,
  Wine,
  Cigarette,
  Search,
  Check,
  ArrowUpDown
} from 'lucide-react';
import { Candidate, RegionalPreference } from '../types';
import { preloadImages } from '../utils/imagePreloader';

export const DesktopDiscoverView: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredCandidates,
    userProfile,
    likeCandidate,
    passCandidate,
    checkCompatibility,
    selectCandidate,
    openReferralModal,
    setRegionalPreference,
    themeMode,
    isPreferenceStrictFilterOn,
    setIsPreferenceStrictFilterOn,
    isNearbyOnly,
    enableNearbyDiscovery,
    disableNearbyDiscovery,
    resetFeed,
    conversations,
    openConversationForCandidate,
    pendingRequests,
    sentRequests,
    cancelLike
  } = useAstra();

  // Search & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'HARMONY' | 'NEARBY' | 'NEWEST'>('HARMONY');

  // Interactive Candidate States
  const [activePhotoMap, setActivePhotoMap] = useState<Record<string, number>>({});
  const [likedCandidateIds, setLikedCandidateIds] = useState<Set<string>>(new Set());
  const [dismissedCandidateIds, setDismissedCandidateIds] = useState<Set<string>>(new Set());

  // Location / Reset Status
  const [isAcquiringLocation, setIsAcquiringLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const isDatingMode = userProfile.intent === 'Dating';

  // Preload top candidate photos
  useEffect(() => {
    const urlsToPreload: string[] = [];
    filteredCandidates.slice(0, 5).forEach(c => {
      if (c.photoUrls && c.photoUrls.length > 0) {
        urlsToPreload.push(...c.photoUrls.slice(0, 2));
      }
    });
    if (urlsToPreload.length > 0) {
      preloadImages(urlsToPreload);
    }
  }, [filteredCandidates]);

  // Handle Photo Cycling for a specific candidate
  const handleNextPhoto = (candidateId: string, maxPhotos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (maxPhotos <= 1) return;
    setActivePhotoMap(prev => ({
      ...prev,
      [candidateId]: ((prev[candidateId] || 0) + 1) % maxPhotos
    }));
  };

  const handlePrevPhoto = (candidateId: string, maxPhotos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (maxPhotos <= 1) return;
    setActivePhotoMap(prev => ({
      ...prev,
      [candidateId]: ((prev[candidateId] || 0) - 1 + maxPhotos) % maxPhotos
    }));
  };

  const handleSetPhotoIndex = (candidateId: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoMap(prev => ({ ...prev, [candidateId]: idx }));
  };

  // Nearby discovery toggle
  const handleToggleNearby = async () => {
    setLocationError(null);
    if (isNearbyOnly) {
      await disableNearbyDiscovery();
    } else {
      setIsAcquiringLocation(true);
      try {
        await enableNearbyDiscovery(25);
      } catch (err: any) {
        setLocationError(err.message || 'Location access unavailable');
        setTimeout(() => setLocationError(null), 4000);
      } finally {
        setIsAcquiringLocation(false);
      }
    }
  };

  // Reset Feed action
  const handleResetFeed = async () => {
    setIsResetting(true);
    setLikedCandidateIds(new Set());
    setDismissedCandidateIds(new Set());
    try {
      await resetFeed();
    } finally {
      setTimeout(() => setIsResetting(false), 800);
    }
  };

  // Candidate Actions (Like / Pass)
  const handleLike = (candidate: Candidate) => {
    setLikedCandidateIds(prev => new Set(prev).add(candidate.id));
    likeCandidate(candidate, () => {
      navigate('/match-celebration');
    });
  };

  const handlePass = (candidate: Candidate) => {
    setDismissedCandidateIds(prev => new Set(prev).add(candidate.id));
    passCandidate(candidate);
  };

  // Filter & Sort Candidate Catalog
  const visibleCandidates = useMemo(() => {
    let list = filteredCandidates.filter(c => !dismissedCandidateIds.has(c.id));

    // Keyword search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.profession && c.profession.toLowerCase().includes(q)) ||
        (c.education && c.education.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.caste && c.caste.toLowerCase().includes(q)) ||
        (c.rashi && c.rashi.toLowerCase().includes(q)) ||
        (c.nakshatra && c.nakshatra.toLowerCase().includes(q))
      );
    }

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'HARMONY') {
        const scoreA = a.compatibilityScore ?? 85;
        const scoreB = b.compatibilityScore ?? 85;
        return scoreB - scoreA;
      }
      if (sortBy === 'NEARBY') {
        const distA = a.distanceKm ?? 9999;
        const distB = b.distanceKm ?? 9999;
        return distA - distB;
      }
      if (sortBy === 'NEWEST') {
        return (b.id || '').localeCompare(a.id || '');
      }
      return 0;
    });

    return list;
  }, [filteredCandidates, dismissedCandidateIds, searchQuery, sortBy]);

  return (
    <div
      className="desktop-only"
      style={{
        width: '100%',
        height: 'calc(100vh - 68px)',
        display: 'flex',
        overflow: 'hidden',
        background: 'transparent'
      }}
    >
      {/* ================= LEFT STICKY SIDEBAR (Filters & Controls) ================= */}
      <aside
        style={{
          width: '380px',
          minWidth: '360px',
          maxWidth: '400px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: themeMode === 'LIGHT' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
          background: themeMode === 'LIGHT' ? 'rgba(255, 255, 255, 0.78)' : 'rgba(15, 12, 24, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflowY: 'auto',
          padding: '20px 18px',
          gap: '18px',
          flexShrink: 0
        }}
      >
        {/* User Profile Readiness Card */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            padding: '14px 16px',
            borderRadius: '16px',
            background: themeMode === 'LIGHT' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-amber), #D97706)',
                  color: '#0B0B0E',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(212, 175, 55, 0.6)'
                }}
              >
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {userProfile.name || 'Your Profile'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      background: isDatingMode ? 'rgba(236, 72, 153, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                      color: isDatingMode ? '#F472B6' : 'var(--accent-amber-light)',
                      border: isDatingMode ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    {isDatingMode ? 'Dating' : 'Matrimony'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {userProfile.caste || userProfile.motherTongue || 'Ready to match'}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber-light)', fontWeight: 700 }}>
              Edit &gt;
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
              <span>Profile Verification Readiness</span>
              <span style={{ color: userProfile.completionPercentage === 100 ? '#10B981' : 'var(--accent-amber-light)', fontWeight: 700 }}>
                {userProfile.completionPercentage}%
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
              <div
                style={{
                  width: userProfile.completionPercentage + '%',
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-amber), #10B981)',
                  borderRadius: '9999px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Discovery Filter Controls */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: themeMode === 'LIGHT' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={15} color="var(--accent-amber)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Discovery Filters
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '6px' }}>
              {visibleCandidates.length} in feed
            </span>
          </div>

          {/* Strict Filter & Nearby Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsPreferenceStrictFilterOn(!isPreferenceStrictFilterOn)}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '10px',
                background: isPreferenceStrictFilterOn ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: isPreferenceStrictFilterOn ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                color: isPreferenceStrictFilterOn ? 'var(--accent-amber-light)' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={12} color={isPreferenceStrictFilterOn ? 'var(--accent-amber)' : 'var(--text-muted)'} />
              <span>Strict: {isPreferenceStrictFilterOn ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={handleToggleNearby}
              disabled={isAcquiringLocation}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '10px',
                background: isNearbyOnly ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: isNearbyOnly ? '1px solid #22C55E' : '1px solid var(--border-color)',
                color: isNearbyOnly ? '#4ADE80' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <MapPin size={12} color={isNearbyOnly ? '#4ADE80' : 'var(--text-muted)'} />
              <span>{isAcquiringLocation ? 'Locating...' : isNearbyOnly ? '<25km ON' : '<25km OFF'}</span>
            </button>
          </div>

          {locationError && (
            <div style={{ fontSize: '0.68rem', color: '#F87171', padding: '4px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)' }}>
              {locationError}
            </div>
          )}

          {/* Regional / Country Preference Chips */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '7px' }}>
              Regional Preference
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { key: 'ALL', label: 'All Regions' },
                { key: 'KERALA', label: 'Kerala' },
                { key: 'NORTH_INDIA', label: 'North India' },
                { key: 'WEST_INDIA', label: 'West India' },
                { key: 'NRI', label: 'NRI' }
              ].map(item => {
                const isSelected = userProfile.regionalPreference === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setRegionalPreference(item.key as RegionalPreference)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: '9999px',
                      border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                      color: isSelected ? 'var(--accent-amber-light)' : 'var(--text-muted)',
                      fontSize: '0.72rem',
                      fontWeight: isSelected ? 800 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shubh Muhurat info ticker */}
          <div
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              fontSize: '0.7rem',
              color: 'var(--accent-amber-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={12} color="var(--accent-amber)" />
            <span><strong>Today's Shubh Muhurat:</strong> Abhijit 11:48 AM – 12:36 PM</span>
          </div>
        </div>

        {/* Matches & Quick Conversations Peek */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageCircle size={15} color="var(--accent-amber)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Matches & Messages
              </span>
            </div>
            <button
              onClick={() => navigate('/matches')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-amber-light)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
            >
              View All ({conversations.length})
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              paddingRight: '2px'
            }}
          >
            {conversations.length > 0 ? (
              conversations.slice(0, 4).map(conv => {
                const hasUnread = (conv.unreadCount || 0) > 0;
                const participant = conv.candidate;
                const avatarUrl = participant?.photoUrls?.[0];
                return (
                  <div
                    key={conv.id}
                    onClick={() => participant && openConversationForCandidate(participant)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: hasUnread ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: hasUnread ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: '#1E1B4B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        overflow: 'hidden'
                      }}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (participant?.name || 'M').charAt(0)
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {participant?.name || 'Match'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.lastMessage || 'Say hello...'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>💫</div>
                No active conversations yet. Like profiles on the right to match and spark conversations!
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer Shortcuts */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button
            onClick={openReferralModal}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '9999px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--accent-amber-light)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Share2 size={12} />
            <span>Invite Friends</span>
          </button>

          <button
            onClick={() => navigate('/horoscope-compatibility')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Compass size={12} />
            <span>Kundali Tool</span>
          </button>
        </div>
      </aside>

      {/* ================= RIGHT MAIN CATALOG STAGE (Flipkart/Amazon/Shaadi Style) ================= */}
      <main
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          background: 'transparent'
        }}
      >
        {/* Sticky Utility & Search Header */}
        <div
          style={{
            padding: '16px 32px 14px',
            background: themeMode === 'LIGHT' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(11, 9, 18, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            zIndex: 20,
            flexShrink: 0
          }}
        >
          {/* Results Count & Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Verified Matrimonial Matches
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--accent-amber-light)',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }}
              >
                {visibleCandidates.length} Profiles
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Hand-picked verified matrimonial matches sorted by Vedic alignment and partner criteria
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Instant Search Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 12px',
                borderRadius: '10px',
                background: themeMode === 'LIGHT' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                width: '260px'
              }}
            >
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search name, job, city, caste..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '10px',
                background: themeMode === 'LIGHT' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)'
              }}
            >
              <ArrowUpDown size={13} color="var(--accent-amber)" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <option value="HARMONY" style={{ background: '#120F1F', color: '#FFF' }}>Highest Vedic Harmony</option>
                <option value="NEARBY" style={{ background: '#120F1F', color: '#FFF' }}>Nearest Location</option>
                <option value="NEWEST" style={{ background: '#120F1F', color: '#FFF' }}>Newest Profiles</option>
              </select>
            </div>

            {/* Reset Feed */}
            <button
              onClick={handleResetFeed}
              disabled={isResetting}
              title="Reset Feed"
              style={{
                padding: '7px 12px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <RotateCcw size={13} className={isResetting ? 'spin-slow' : ''} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Scrollable Candidate Catalog Feed */}
        <div
          className="desktop-catalog-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px 48px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center'
          }}
        >
          {visibleCandidates.length > 0 ? (
            visibleCandidates.map(candidate => {
              const photos = candidate.photoUrls && candidate.photoUrls.length > 0 ? candidate.photoUrls : [];
              const activeIdx = activePhotoMap[candidate.id] || 0;
              const currentPhoto = photos[activeIdx] || '';
              const isLiked = likedCandidateIds.has(candidate.id) || sentRequests.some(s => s.id === candidate.id);
              const isPendingIncoming = pendingRequests.some(p => p.id === candidate.id);
              const compatibilityScore = candidate.compatibilityScore ?? 86;

              return (
                <div
                  key={candidate.id}
                  className="desktop-catalog-card"
                  style={{
                    width: '100%',
                    maxWidth: '1040px',
                    minHeight: '380px',
                    flexShrink: 0,
                    borderRadius: '20px',
                    background: themeMode === 'LIGHT' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(20, 16, 32, 0.88)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: themeMode === 'LIGHT' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.28)',
                    display: 'flex',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* ------------ 1. LEFT PHOTO COLUMN (Carousel & Badges) ------------ */}
                  <div
                    style={{
                      width: '320px',
                      minWidth: '300px',
                      maxWidth: '340px',
                      height: '100%',
                      minHeight: '380px',
                      position: 'relative',
                      background: '#0B0B0E',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {currentPhoto ? (
                      <img
                        src={currentPhoto}
                        alt={candidate.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center 20%',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                          color: '#FFF'
                        }}
                      >
                        <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '6px' }}>
                          {candidate.name ? candidate.name.charAt(0) : 'U'}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>No photo uploaded</div>
                      </div>
                    )}

                    {/* Top Badges Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        right: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        zIndex: 10
                      }}
                    >
                      {/* Govt ID Verified */}
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          background: 'rgba(16, 185, 129, 0.85)',
                          color: '#FFF',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        <ShieldCheck size={11} />
                        <span>Govt ID Verified</span>
                      </span>

                      {/* Intent Badge */}
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          background: candidate.intent === 'Dating' ? 'rgba(236, 72, 153, 0.85)' : 'rgba(212, 175, 55, 0.85)',
                          color: candidate.intent === 'Dating' ? '#FFF' : '#0B0B0E',
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        {candidate.intent || 'Matrimony'}
                      </span>
                    </div>

                    {/* Multi-Photo Carousel Dots */}
                    {photos.length > 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '38px',
                          left: '12px',
                          right: '12px',
                          display: 'flex',
                          gap: '4px',
                          zIndex: 10
                        }}
                      >
                        {photos.map((_, idx) => (
                          <div
                            key={idx}
                            onClick={e => handleSetPhotoIndex(candidate.id, idx, e)}
                            style={{
                              flex: 1,
                              height: '3px',
                              borderRadius: '9999px',
                              background: idx === activeIdx ? '#FFF' : 'rgba(255, 255, 255, 0.4)',
                              boxShadow: idx === activeIdx ? '0 0 6px rgba(255, 255, 255, 0.8)' : 'none',
                              cursor: 'pointer'
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Carousel Left / Right Arrows */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={e => handlePrevPhoto(candidate.id, photos.length, e)}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '8px',
                            transform: 'translateY(-50%)',
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.55)',
                            backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 15
                          }}
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <button
                          onClick={e => handleNextPhoto(candidate.id, photos.length, e)}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: 'auto',
                            right: '8px',
                            transform: 'translateY(-50%)',
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.55)',
                            backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 15
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}

                    {/* Bottom Location Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '16px 12px 10px',
                        background: 'linear-gradient(180deg, transparent 0%, rgba(11, 9, 18, 0.95) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#FFF',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        zIndex: 10
                      }}
                    >
                      <MapPin size={13} color="var(--accent-amber)" />
                      <span>{candidate.location}</span>
                      {candidate.distanceKm !== undefined && (
                        <span style={{ color: 'var(--accent-amber-light)' }}>
                          • {Math.round(candidate.distanceKm)} km away
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ------------ 2. MIDDLE DETAILS COLUMN (Flipkart/Amazon Specs) ------------ */}
                  <div
                    style={{
                      flex: 1,
                      padding: '20px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRight: themeMode === 'LIGHT' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
                      minWidth: 0
                    }}
                  >
                    <div>
                      {/* Name, Age & Verified Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 className="heading-font" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                            {candidate.name}, {candidate.age}
                          </h3>
                          {candidate.isVerified && (
                            <span title="Verified Member">
                              <CheckCircle2 size={18} color="#10B981" />
                            </span>
                          )}
                        </div>

                        {/* Chaanbean Trust Badge */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#4ADE80',
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}
                        >
                          <ShieldCheck size={12} />
                          <span>Chaanbean Verified</span>
                        </div>
                      </div>

                      {/* Profession & Education */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
                        {candidate.profession && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            <Briefcase size={14} color="var(--accent-amber)" />
                            <span>{candidate.profession}</span>
                          </div>
                        )}
                        {candidate.education && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            <GraduationCap size={14} color="var(--accent-amber)" />
                            <span>{candidate.education}</span>
                          </div>
                        )}
                      </div>

                      {/* Bio Quote */}
                      {candidate.bio && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '14px', fontStyle: 'italic' }}>
                          "{candidate.bio}"
                        </p>
                      )}

                      {/* Cultural & Astrological Heritage Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '8px',
                          padding: '12px',
                          borderRadius: '12px',
                          background: themeMode === 'LIGHT' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          marginBottom: '14px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                            Community / Caste
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {candidate.caste || 'Not Specified'}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                            Gotra
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {candidate.gotra || 'Not Specified'}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                            Rashi (Moon)
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {candidate.rashi || 'Not Specified'}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                            Nakshatra
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {candidate.nakshatra || 'Not Specified'}
                          </div>
                        </div>
                      </div>

                      {/* Lifestyle & Dietary Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {candidate.diet && (
                          <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Utensils size={11} color="var(--accent-amber)" />
                            {candidate.diet}
                          </span>
                        )}
                        {candidate.alcohol && (
                          <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Wine size={11} color="var(--accent-amber)" />
                            Drink: {candidate.alcohol}
                          </span>
                        )}
                        {candidate.smoking && (
                          <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Cigarette size={11} color="var(--accent-amber)" />
                            Smoke: {candidate.smoking}
                          </span>
                        )}
                        {candidate.height && (
                          <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                            Height: {candidate.height}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick View Full Profile Link */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '10px' }}>
                      <button
                        onClick={() => {
                          selectCandidate(candidate);
                          navigate('/candidate-detail');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-amber-light)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0
                        }}
                      >
                        <span>View Full Vedic Biodata & Dossier</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>

                  {/* ------------ 3. RIGHT ASTROLOGY & ACTION COLUMN ------------ */}
                  <div
                    style={{
                      width: '270px',
                      minWidth: '250px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: themeMode === 'LIGHT' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.2)',
                      flexShrink: 0
                    }}
                  >
                    {/* Vedic Harmony Widget Box */}
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(245, 158, 11, 0.05) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Compass size={15} color="var(--accent-amber)" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
                            Vedic Match
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: 'rgba(212, 175, 55, 0.25)',
                            color: 'var(--accent-amber-light)',
                            border: '1px solid rgba(212, 175, 55, 0.4)'
                          }}
                        >
                          {compatibilityScore}% Harmony
                        </span>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                        Based on Janam Kundali Nakshatra, Rashi & Ashtakoota 36 Guna analysis.
                      </div>

                      <button
                        onClick={() => checkCompatibility(candidate, () => navigate('/horoscope-compatibility'))}
                        style={{
                          marginTop: '4px',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid var(--accent-amber)',
                          color: 'var(--accent-amber-light)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <Sparkles size={11} />
                        <span>Calculate 36 Gunas &gt;</span>
                      </button>
                    </div>

                    {/* Action Buttons (Send Interest, Skip Profile) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                      {isLiked ? (
                        /* Interest Already Sent — show status + withdraw */
                        <>
                          <div
                            style={{
                              width: '100%',
                              padding: '11px 16px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              border: 'none',
                              color: '#FFF',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '7px',
                              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
                            }}
                          >
                            <Check size={16} strokeWidth={3} />
                            <span>Interest Sent ✓</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLikedCandidateIds(prev => {
                                const next = new Set(prev);
                                next.delete(candidate.id);
                                return next;
                              });
                              cancelLike(candidate);
                            }}
                            style={{
                              width: '100%',
                              padding: '9px 16px',
                              borderRadius: '12px',
                              background: 'rgba(245, 158, 11, 0.08)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              color: 'var(--accent-amber-light)',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                              e.currentTarget.style.color = '#F87171';
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                              e.currentTarget.style.color = 'var(--accent-amber-light)';
                              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)';
                            }}
                          >
                            <X size={14} />
                            <span>Withdraw Interest</span>
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Send Interest (Like) Button */}
                          <button
                            onClick={() => handleLike(candidate)}
                            style={{
                              width: '100%',
                              padding: '11px 16px',
                              borderRadius: '12px',
                              background: isPendingIncoming
                                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, var(--accent-amber), #D97706)',
                              border: 'none',
                              color: isPendingIncoming ? '#FFF' : '#0B0B0E',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '7px',
                              boxShadow: isPendingIncoming
                                ? '0 6px 20px rgba(16, 185, 129, 0.35)'
                                : '0 6px 20px rgba(212, 175, 55, 0.35)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isPendingIncoming ? (
                              <>
                                <CheckCircle2 size={16} />
                                <span>Accept Match Request</span>
                              </>
                            ) : (
                              <>
                                <Heart size={16} fill="#0B0B0E" />
                                <span>Send Interest</span>
                              </>
                            )}
                          </button>

                          {/* Skip / Pass Button */}
                          <button
                            onClick={() => handlePass(candidate)}
                            style={{
                              width: '100%',
                              padding: '9px 16px',
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-muted)',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                              e.currentTarget.style.color = '#F87171';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--border-color)';
                              e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                          >
                            <X size={14} />
                            <span>Skip Profile</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div
              style={{
                padding: '60px 30px',
                textAlign: 'center',
                maxWidth: '520px',
                margin: 'auto',
                background: themeMode === 'LIGHT' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(20, 16, 32, 0.8)',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '14px' }}>✨</div>
              <h3 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                You've Explored All Matches!
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '22px' }}>
                Try selecting <strong>"All Regions"</strong>, toggling <strong>Strict Filters OFF</strong>, or resetting your feed to discover new alignments.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={() => setRegionalPreference('ALL')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid var(--accent-amber)',
                    color: 'var(--accent-amber-light)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Show All India
                </button>
                <button
                  onClick={handleResetFeed}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, var(--accent-amber), #D97706)',
                    border: 'none',
                    color: '#0B0B0E',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Reset Feed
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
