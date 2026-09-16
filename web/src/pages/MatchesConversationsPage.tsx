import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { Sparkles, MessageCircle, Bot, UserX, Users, AlertTriangle, RotateCcw, Plus, MapPin, Clock } from 'lucide-react';
import { Candidate, CommunityRoom } from '../types';
import { RoomService } from '../services/RoomService';
import { CreateRoomModal } from '../components/CreateRoomModal';

export const MatchesConversationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    userProfile,
    conversations,
    isSyncingMatches,
    pendingRequests,
    sentRequests,
    openConversationForCandidate,
    selectCandidate,
    unfriendCandidate,
    refreshData,
    userCoords,
    t
  } = useAstra();

  const isDatingMode = userProfile.intent === 'Dating';
  const activeTabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'matches' | 'rooms'>(
    isDatingMode && activeTabParam === 'rooms' ? 'rooms' : 'matches'
  );
  const [rooms, setRooms] = useState<CommunityRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [unfriendTarget, setUnfriendTarget] = useState<Candidate | null>(null);
  const [isUnfriending, setIsUnfriending] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const loadRooms = async () => {
    if (!isDatingMode) return;
    setIsLoadingRooms(true);
    try {
      const data = await RoomService.getActiveRooms(userCoords?.latitude, userCoords?.longitude, selectedCategory);
      setRooms(data);
    } catch (e) {
      console.error('Failed to load rooms:', e);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (isDatingMode && activeTab === 'rooms') {
      loadRooms();
    }
  }, [isDatingMode, activeTab, selectedCategory, userCoords?.latitude, userCoords?.longitude]);

  const handleManualRefresh = async () => {
    if (isManualRefreshing) return;
    setIsManualRefreshing(true);
    try {
      if (isDatingMode && activeTab === 'rooms') {
        await loadRooms();
      } else {
        await refreshData();
      }
    } catch (e) {
      console.error('Manual refresh error:', e);
    } finally {
      setTimeout(() => setIsManualRefreshing(false), 600);
    }
  };

  const handleConfirmUnfriend = async () => {
    if (!unfriendTarget) return;
    setIsUnfriending(true);
    try {
      await unfriendCandidate(unfriendTarget.id);
      setUnfriendTarget(null);
    } catch (e) {
      console.error('Failed to unfriend candidate:', e);
    } finally {
      setIsUnfriending(false);
    }
  };

  return (
    <div
      className="glass-page matches-glass-page"
      style={{
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-primary)',
        paddingBottom: '88px'
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 16px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <h1 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
          {t('matches_page_title')}
        </h1>

        <button
          onClick={handleManualRefresh}
          disabled={isManualRefreshing || isSyncingMatches}
          style={{
            padding: '8px 14px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid var(--accent-amber)',
            color: 'var(--accent-amber-light)',
            fontWeight: 700,
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
            transition: 'all 0.2s ease',
            opacity: isManualRefreshing ? 0.7 : 1
          }}
        >
          <RotateCcw
            size={14}
            className={isManualRefreshing || isSyncingMatches ? 'spin-slow' : ''}
            color="var(--accent-amber)"
          />
          <span>{isManualRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </header>

      {/* Top Segmented Tabs: Matches vs Community Rooms (ONLY in Dating Mode) */}
      {isDatingMode && (
        <div
          style={{
            display: 'flex',
            padding: '0 20px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            gap: '16px'
          }}
        >
          <button
            onClick={() => setActiveTab('matches')}
            style={{
              padding: '12px 4px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'matches' ? '2px solid var(--accent-amber)' : '2px solid transparent',
              color: activeTab === 'matches' ? 'var(--accent-amber-light)' : 'var(--text-muted)',
              fontWeight: activeTab === 'matches' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageCircle size={16} /> Direct Matches ({conversations.length})
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            style={{
              padding: '12px 4px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'rooms' ? '2px solid var(--accent-amber)' : '2px solid transparent',
              color: activeTab === 'rooms' ? 'var(--accent-amber-light)' : 'var(--text-muted)',
              fontWeight: activeTab === 'rooms' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🏏</span> Community Rooms ({rooms.length})
          </button>
        </div>
      )}

      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {isDatingMode && activeTab === 'rooms' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Create Room CTA Card */}
            <div
              style={{
                padding: '16px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
                border: '1px solid var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-amber-light)', margin: 0 }}>
                  Start an Activity Room
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Organize cricket, badminton, chai, or hangout within 25 km!
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
                  color: '#0B0B0E',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Plus size={16} /> Create
              </button>
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { key: 'ALL', label: 'All', icon: '✨' },
                { key: 'Sports', label: 'Cricket & Sports', icon: '🏏' },
                { key: 'Chai & Coffee', label: 'Chai & Coffee', icon: '☕' },
                { key: 'Fitness', label: 'Badminton & Fitness', icon: '🏸' },
                { key: 'Social', label: 'Hangout', icon: '🗣️' },
                { key: 'Tech', label: 'Tech', icon: '💻' }
              ].map(cat => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--accent-amber-light)' : 'var(--text-muted)',
                      fontSize: '0.72rem',
                      fontWeight: isSelected ? 700 : 500,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Rooms List */}
            {isLoadingRooms ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Sparkles size={24} className="spin-slow" color="var(--accent-amber)" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.85rem' }}>Discovering local rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🏏</span>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  No active rooms found in this category
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
                  Be the pioneer! Create a room and invite nearby folks to play or meetup.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: 'var(--accent-amber)',
                    color: '#0B0B0E',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  + Create First Room
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rooms.map(r => {
                  const categoryEmoji: Record<string, string> = {
                    'Sports': '🏏',
                    'Chai & Coffee': '☕',
                    'Fitness': '🏸',
                    'Social': '🗣️',
                    'Music': '🎵',
                    'Tech': '💻',
                    'Other': '✨'
                  };
                  return (
                    <div
                      key={r.id}
                      onClick={() => navigate(`/rooms/${r.id}`)}
                      style={{
                        padding: '16px',
                        borderRadius: '20px',
                        background: 'var(--bg-card)',
                        border: r.isJoined ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.15s ease, border-color 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: '14px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.4rem',
                              flexShrink: 0
                            }}
                          >
                            {categoryEmoji[r.category] || '✨'}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-amber-light)', margin: 0 }}>
                              {r.name}
                            </h4>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Host: {r.creatorName}
                            </span>
                          </div>
                        </div>

                        {r.isJoined && (
                          <span style={{ padding: '3px 8px', borderRadius: '9999px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ADE80', fontSize: '0.68rem', fontWeight: 700 }}>
                            Joined
                          </span>
                        )}
                      </div>

                      {r.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          {r.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Users size={12} color="var(--accent-amber)" /> {r.participantCount}/{r.maxParticipants}
                          </span>
                          {r.distanceKm !== undefined && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#4ADE80' }}>
                              <MapPin size={11} /> {r.distanceKm < 1 ? '< 1 km' : `${r.distanceKm} km`}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={11} color="var(--accent-rose)" /> {r.locationName}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                          {r.isJoined ? 'Open Chat >' : 'Join Room >'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Celestial Friend List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} color="var(--accent-amber)" /> Friend List ({conversations.length})
            </span>
          </div>

          {isSyncingMatches && conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Sparkles size={16} className="spin-slow" color="var(--accent-amber)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber-light)', fontWeight: 600 }}>Syncing your friend list...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                No friends added yet. Connect with candidates in Discovery to build your friend list!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {conversations.map(conv => (
                <div
                  key={conv.candidate.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '20px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  <div
                    onClick={() => {
                      selectCandidate(conv.candidate);
                      navigate('/candidate-detail');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, cursor: 'pointer' }}
                  >
                    <CandidateAvatar src={conv.candidate.photoUrls[0]} name={conv.candidate.name} size={52} isVerified={conv.candidate.isVerified} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 className="heading-font" style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                        {conv.candidate.name}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.candidate.profession || conv.candidate.location || 'Connected Match'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons: Chat & Unfriend */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        openConversationForCandidate(conv.candidate);
                        navigate('/chat-detail');
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, var(--accent-amber), #D97706)',
                        color: '#0B0B0E',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      <MessageCircle size={14} /> Chat
                    </button>
                    <button
                      onClick={() => setUnfriendTarget(conv.candidate)}
                      title="Unfriend"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      <UserX size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Horizontal Pending Requests Scroll Strip */}
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pending Requests ({pendingRequests.length})
          </span>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              marginTop: '12px',
              paddingBottom: '8px'
            }}
          >
            {pendingRequests.length === 0 && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                No pending requests right now. Keep exploring!
              </div>
            )}
            {pendingRequests.map(candidate => (
              <div
                key={candidate.id}
                onClick={() => {
                  selectCandidate(candidate);
                  navigate('/candidate-detail');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <div style={{ position: 'relative' }}>
                  <CandidateAvatar src={candidate.photoUrls[0]} name={candidate.name} size={64} isVerified={candidate.isVerified} />
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'var(--accent-rose)',
                      border: '2px solid var(--bg-primary)',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {candidate.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Sent Requests Scroll Strip */}
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Sent Requests ({sentRequests.length})
          </span>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              marginTop: '12px',
              paddingBottom: '8px'
            }}
          >
            {sentRequests.length === 0 && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                You haven't sent any likes yet!
              </div>
            )}
            {sentRequests.map(candidate => (
              <div
                key={candidate.id}
                onClick={() => {
                  selectCandidate(candidate);
                  navigate('/candidate-detail');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <div style={{ position: 'relative' }}>
                  <CandidateAvatar src={candidate.photoUrls[0]} name={candidate.name} size={64} isVerified={candidate.isVerified} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {candidate.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Astro AI Assistant Banner Link */}
        <div
          onClick={() => navigate('/astro-ai')}
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(42, 14, 26, 0.9) 0%, rgba(30, 24, 54, 0.9) 100%)',
            border: '1px solid var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-cosmic)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bot size={22} color="var(--accent-amber)" />
            </div>
            <div>
              <h3 className="heading-font" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
                {t('astro_ai_guide')}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t('ask_astro_ai')}
              </p>
            </div>
          </div>
          <Sparkles size={18} color="var(--accent-amber-light)" className="spin-slow" />
        </div>
        </>
        )}
      </main>

      {/* Create Room Modal (ONLY in Dating Mode) */}
      {isDatingMode && (
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onRoomCreated={(newId) => navigate(`/rooms/${newId}`)}
        />
      )}

      {/* Unfriend Confirmation Modal */}
      {unfriendTarget && (
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
              Unfriend {unfriendTarget.name}?
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
              This will remove <strong>{unfriendTarget.name}</strong> from your Friend List and clear your connection.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setUnfriendTarget(null)}
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

      <AstraBottomNavigation />
    </div>
  );
};
