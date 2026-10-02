import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { ChatBubble } from '../components/ChatBubble';
import { Sparkles, MessageCircle, Bot, UserX, Users, AlertTriangle, RotateCcw, Plus, MapPin, Clock, Send, ShieldCheck, Heart, User, CheckCircle2, ChevronRight, Inbox, Check, X, Flame } from 'lucide-react';
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
    activeConversation,
    sendChatMessage,
    likeCandidate,
    passCandidate,
    checkCompatibility,
    cancelLike,
    t
  } = useAstra();

  const isDatingMode = userProfile.intent === 'Dating';
  const activeTabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'matches' | 'rooms'>(
    isDatingMode && activeTabParam === 'rooms' ? 'rooms' : 'matches'
  );
  const [desktopTab, setDesktopTab] = useState<'connections' | 'received' | 'sent' | 'rooms'>(
    isDatingMode && activeTabParam === 'rooms' ? 'rooms' : 'connections'
  );
  const [selectedRequestCandidate, setSelectedRequestCandidate] = useState<Candidate | null>(null);
  const [rooms, setRooms] = useState<CommunityRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [unfriendTarget, setUnfriendTarget] = useState<Candidate | null>(null);
  const [isUnfriending, setIsUnfriending] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [desktopInputText, setDesktopInputText] = useState('');
  const [showDesktopIcebreakers, setShowDesktopIcebreakers] = useState(false);

  // Auto-select first conversation on desktop if activeConversation is null
  useEffect(() => {
    if (!activeConversation && conversations.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      openConversationForCandidate(conversations[0].candidate);
    }
  }, [conversations, activeConversation]);

  // Auto-select candidate for review when on received or sent tabs on desktop
  useEffect(() => {
    if (desktopTab === 'received' && pendingRequests.length > 0) {
      if (!selectedRequestCandidate || !pendingRequests.some(c => c.id === selectedRequestCandidate.id)) {
        setSelectedRequestCandidate(pendingRequests[0]);
      }
    } else if (desktopTab === 'sent' && sentRequests.length > 0) {
      if (!selectedRequestCandidate || !sentRequests.some(c => c.id === selectedRequestCandidate.id)) {
        setSelectedRequestCandidate(sentRequests[0]);
      }
    }
  }, [desktopTab, pendingRequests, sentRequests, selectedRequestCandidate]);

  const handleDesktopSend = (textToSend?: string) => {
    const text = textToSend || desktopInputText;
    if (text.trim()) {
      sendChatMessage(text);
      setDesktopInputText('');
      setShowDesktopIcebreakers(false);
    }
  };

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

  const activeCandidate = activeConversation?.candidate;
  const desktopIcebreakers = activeCandidate ? [
    `I saw our Kundali score is ${activeCandidate.compatibilityScore}%! What's your take on Nakshatra alignment? ✨`,
    `Notice we both share a passion for travel and culture! What's your favorite destination so far? ✈️`,
    `Rohini and ${activeCandidate.nakshatra} are in auspicious alignment today! How has your week been going? 🌌`
  ] : [];

  const renderDesktopMasterDetail = () => (
    <div
      className="desktop-only"
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        height: 'calc(100vh - 68px)',
        display: 'flex',
        overflow: 'hidden'
      }}
    >
      {/* Left Sidebar (380px) */}
      <div
        style={{
          width: '380px',
          flexShrink: 0,
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: 'var(--bg-secondary)'
        }}
      >
        {/* Left Sidebar Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h2 className="heading-font" style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              {t('matches_page_title')}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {desktopTab === 'connections' && `${conversations.length} Active ${conversations.length === 1 ? 'Connection' : 'Connections'}`}
              {desktopTab === 'received' && `${pendingRequests.length} Incoming ${pendingRequests.length === 1 ? 'Request' : 'Requests'}`}
              {desktopTab === 'sent' && `${sentRequests.length} Sent ${sentRequests.length === 1 ? 'Request' : 'Requests'}`}
              {desktopTab === 'rooms' && `${rooms.length} Active ${rooms.length === 1 ? 'Room' : 'Rooms'}`}
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isManualRefreshing || isSyncingMatches}
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid var(--accent-amber)',
              color: 'var(--accent-amber-light)',
              fontWeight: 700,
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              opacity: isManualRefreshing ? 0.7 : 1
            }}
          >
            <RotateCcw
              size={13}
              className={isManualRefreshing || isSyncingMatches ? 'spin-slow' : ''}
              color="var(--accent-amber)"
            />
            <span>{isManualRefreshing ? 'Refreshing' : 'Refresh'}</span>
          </button>
        </div>

        {/* Segmented Desktop Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            padding: '4px 12px 0',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.08)'
          }}
        >
          <button
            onClick={() => setDesktopTab('connections')}
            style={{
              flex: 1,
              padding: '10px 4px',
              background: 'none',
              border: 'none',
              borderBottom: desktopTab === 'connections' ? '2px solid var(--accent-amber)' : '2px solid transparent',
              color: desktopTab === 'connections' ? 'var(--accent-amber-light)' : 'var(--text-muted)',
              fontWeight: desktopTab === 'connections' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageCircle size={13} />
            <span>Connections ({conversations.length})</span>
          </button>

          <button
            onClick={() => setDesktopTab('received')}
            style={{
              flex: 1,
              padding: '10px 4px',
              background: 'none',
              border: 'none',
              borderBottom: desktopTab === 'received' ? '2px solid var(--accent-amber)' : '2px solid transparent',
              color: desktopTab === 'received' ? 'var(--accent-amber-light)' : 'var(--text-muted)',
              fontWeight: desktopTab === 'received' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
          >
            <Inbox size={13} />
            <span>Received ({pendingRequests.length})</span>
            {pendingRequests.length > 0 && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--accent-amber)',
                  boxShadow: '0 0 6px var(--accent-amber)'
                }}
              />
            )}
          </button>

          <button
            onClick={() => setDesktopTab('sent')}
            style={{
              flex: 1,
              padding: '10px 4px',
              background: 'none',
              border: 'none',
              borderBottom: desktopTab === 'sent' ? '2px solid var(--accent-amber)' : '2px solid transparent',
              color: desktopTab === 'sent' ? 'var(--accent-amber-light)' : 'var(--text-muted)',
              fontWeight: desktopTab === 'sent' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <Send size={13} />
            <span>Sent ({sentRequests.length})</span>
          </button>

          {isDatingMode && (
            <button
              onClick={() => setDesktopTab('rooms')}
              style={{
                flex: 1,
                padding: '10px 4px',
                background: 'none',
                border: 'none',
                borderBottom: desktopTab === 'rooms' ? '2px solid var(--accent-amber)' : '2px solid transparent',
                color: desktopTab === 'rooms' ? 'var(--accent-amber-light)' : 'var(--text-muted)',
                fontWeight: desktopTab === 'rooms' ? 800 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🏏</span>
              <span>Rooms ({rooms.length})</span>
            </button>
          )}
        </div>

        {/* Left Scrollable Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {desktopTab === 'rooms' && isDatingMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
                  color: '#0B0B0E',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Create Activity Room
              </button>

              {rooms.map(r => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/rooms/${r.id}`)}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber-light)' }}>
                    {r.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {r.locationName || 'Nearby'} · {r.participantCount || 1} joined
                  </span>
                </div>
              ))}
            </div>
          ) : desktopTab === 'received' ? (
            /* Received Requests Sub-view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Incoming Requests ({pendingRequests.length})
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber-light)' }}>
                  Awaiting Response
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <Inbox size={36} color="var(--accent-amber)" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                    No Pending Requests
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.4 }}>
                    When someone likes your profile, their match request and astrological compatibility will appear here for you to accept or decline.
                  </p>
                  <button
                    onClick={() => navigate('/discover')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(135deg, var(--accent-amber), #D97706)',
                      border: 'none',
                      color: '#0B0B0E',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Explore Discover
                  </button>
                </div>
              ) : (
                pendingRequests.map(cand => {
                  const isSelected = selectedRequestCandidate?.id === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedRequestCandidate(cand)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '16px',
                        background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                        border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CandidateAvatar src={cand.photoUrls[0]} name={cand.name} size={48} isVerified={cand.isVerified} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {cand.name}, {cand.age}
                            </h4>
                            {cand.compatibilityScore > 0 && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--accent-amber-light)', fontWeight: 700, background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '9999px' }}>
                                {cand.compatibilityScore}% Match
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cand.profession || 'Professional'} · {cand.location || 'India'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Accept / Decline Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            likeCandidate(cand, () => navigate('/match-celebration'));
                          }}
                          style={{
                            flex: 1,
                            padding: '7px 10px',
                            borderRadius: '9999px',
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            border: 'none',
                            color: '#FFF',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          <Check size={13} strokeWidth={3} /> Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            passCandidate(cand);
                          }}
                          style={{
                            padding: '7px 12px',
                            borderRadius: '9999px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#EF4444',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={13} /> Decline
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : desktopTab === 'sent' ? (
            /* Sent Requests Sub-view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Sent Requests ({sentRequests.length})
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Pending Acceptance
                </span>
              </div>

              {sentRequests.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <Send size={36} color="var(--accent-amber)" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                    No Sent Requests
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.4 }}>
                    You haven't sent any match requests yet. Explore profiles in Discover and tap 'Send Interest' to connect!
                  </p>
                  <button
                    onClick={() => navigate('/discover')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(135deg, var(--accent-amber), #D97706)',
                      border: 'none',
                      color: '#0B0B0E',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Browse Profiles
                  </button>
                </div>
              ) : (
                sentRequests.map(cand => {
                  const isSelected = selectedRequestCandidate?.id === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedRequestCandidate(cand)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '16px',
                        background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                        border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        <CandidateAvatar src={cand.photoUrls[0]} name={cand.name} size={46} isVerified={cand.isVerified} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cand.name}, {cand.age}
                          </h4>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cand.profession || 'Professional'} · {cand.location || 'India'}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '9999px',
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            color: 'var(--accent-amber-light)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Clock size={11} /> Sent
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedRequestCandidate?.id === cand.id) {
                              setSelectedRequestCandidate(null);
                            }
                            cancelLike(cand);
                          }}
                          title="Withdraw Interest"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#F87171',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Connections Sub-view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Quick Jump Banner: Pending Requests */}
              {pendingRequests.length > 0 && (
                <div
                  onClick={() => setDesktopTab('received')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(212, 175, 55, 0.08) 100%)',
                    border: '1px solid var(--accent-amber)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="var(--accent-amber)" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
                      {pendingRequests.length} Incoming Match {pendingRequests.length === 1 ? 'Request' : 'Requests'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                    Review <ChevronRight size={14} />
                  </span>
                </div>
              )}

              {/* Quick Jump Pill: Sent Requests */}
              {sentRequests.length > 0 && (
                <div
                  onClick={() => setDesktopTab('sent')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      {sentRequests.length} Sent {sentRequests.length === 1 ? 'Interest' : 'Interests'} Pending
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    View &gt;
                  </span>
                </div>
              )}

              {/* Direct Matches List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Connections ({conversations.length})
                </span>

                {conversations.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                      No friends yet. Explore candidates in Discovery to connect!
                    </p>
                    <button
                      onClick={() => navigate('/discover')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Find Matches
                    </button>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const isSelected = activeConversation?.candidate?.id === conv.candidate.id;
                    return (
                      <div
                        key={conv.candidate.id}
                        onClick={() => openConversationForCandidate(conv.candidate)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '16px',
                          background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                          border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                          <CandidateAvatar src={conv.candidate.photoUrls[0]} name={conv.candidate.name} size={46} isVerified={conv.candidate.isVerified} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {conv.candidate.name}
                              </h4>
                              {conv.candidate.compatibilityScore > 0 && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--accent-amber-light)', fontWeight: 700 }}>
                                  {conv.candidate.compatibilityScore}%
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {conv.lastMessage || conv.candidate.profession || conv.candidate.location || 'Connected'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUnfriendTarget(conv.candidate);
                          }}
                          title="Unfriend connection"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <UserX size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Master Area (Flex 1) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
        {desktopTab === 'received' ? (
          selectedRequestCandidate ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              {/* Top Action Header */}
              <div
                style={{
                  height: '76px',
                  padding: '0 28px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-secondary)',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <CandidateAvatar src={selectedRequestCandidate.photoUrls[0]} name={selectedRequestCandidate.name} size={48} isVerified={selectedRequestCandidate.isVerified} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 className="heading-font" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {selectedRequestCandidate.name}, {selectedRequestCandidate.age}
                      </h3>
                      {selectedRequestCandidate.isVerified && <ShieldCheck size={18} color="var(--accent-amber)" />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>{selectedRequestCandidate.profession}</span>
                      <span>•</span>
                      <span>{selectedRequestCandidate.location}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--accent-amber-light)', fontWeight: 700 }}>
                        ✨ {selectedRequestCandidate.compatibilityScore}% Compatibility
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick action buttons in header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => {
                      passCandidate(selectedRequestCandidate);
                      setSelectedRequestCandidate(null);
                    }}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '9999px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#F87171',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <X size={15} /> Decline
                  </button>

                  <button
                    onClick={() => {
                      likeCandidate(selectedRequestCandidate);
                      setDesktopTab('connections');
                    }}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <Check size={16} /> Accept Request & Connect
                  </button>
                </div>
              </div>

              {/* Main Review Content Container */}
              <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Banner Alert */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.05) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
                      <Inbox size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {selectedRequestCandidate.name} sent you a Match Request
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Accepting this request will immediately unlock direct celestial messaging and full profile exchange.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      selectCandidate(selectedRequestCandidate);
                      navigate('/candidate-detail');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Full Dossier →
                  </button>
                </div>

                {/* 2-Column Overview Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
                  {/* Photos column */}
                  <div>
                    <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-card)', position: 'relative' }}>
                      <img
                        src={selectedRequestCandidate.photoUrls[0]}
                        alt={selectedRequestCandidate.name}
                        style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '16px',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                          color: '#FFFFFF'
                        }}
                      >
                        <div style={{ fontSize: '1rem', fontWeight: 800 }}>{selectedRequestCandidate.name}, {selectedRequestCandidate.age}</div>
                        <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.8)' }}>{selectedRequestCandidate.location} · {selectedRequestCandidate.height}</div>
                      </div>
                    </div>

                    {/* Thumbnail strip if multiple photos */}
                    {selectedRequestCandidate.photoUrls.length > 1 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        {selectedRequestCandidate.photoUrls.slice(0, 4).map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt=""
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              border: '1px solid var(--border-color)',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              selectCandidate(selectedRequestCandidate);
                              navigate('/candidate-detail');
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details & Astro Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Kundali Harmony Card */}
                    <div
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber-light)' }}>
                          Astro Harmony Breakdown
                        </span>
                        <button
                          onClick={() => {
                            selectCandidate(selectedRequestCandidate);
                            navigate('/horoscope-compatibility');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-amber)',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Sparkles size={13} /> Full 36 Guna Report →
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '4px' }}>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Guna Score</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                            {selectedRequestCandidate.compatibilityScore ? Math.round((selectedRequestCandidate.compatibilityScore / 100) * 36) : 28} / 36
                          </div>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nakshatra</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {selectedRequestCandidate.nakshatra || 'Rohini'}
                          </div>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rashi (Moon Sign)</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {selectedRequestCandidate.rashi || 'Vrishabha'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio & Background Card */}
                    <div
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        About {selectedRequestCandidate.name}
                      </span>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {selectedRequestCandidate.bio || 'Seeking a thoughtful partner aligned in cultural values and spiritual harmony.'}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          🎓 Education: <strong style={{ color: 'var(--text-primary)' }}>{selectedRequestCandidate.education || 'Master’s Degree'}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          💼 Career: <strong style={{ color: 'var(--text-primary)' }}>{selectedRequestCandidate.profession}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          📍 Residence: <strong style={{ color: 'var(--text-primary)' }}>{selectedRequestCandidate.location}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          🕊️ Gotra: <strong style={{ color: 'var(--text-primary)' }}>{selectedRequestCandidate.gotra || 'Kashyapa'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Decision Actions */}
                    <div style={{ display: 'flex', gap: '14px', marginTop: 'auto', paddingTop: '10px' }}>
                      <button
                        onClick={() => {
                          likeCandidate(selectedRequestCandidate);
                          setDesktopTab('connections');
                        }}
                        style={{
                          flex: 1,
                          padding: '14px 24px',
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          border: 'none',
                          color: '#FFFFFF',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 18px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Check size={18} /> Accept Request & Connect
                      </button>

                      <button
                        onClick={() => {
                          passCandidate(selectedRequestCandidate);
                          setSelectedRequestCandidate(null);
                        }}
                        style={{
                          padding: '14px 24px',
                          borderRadius: '14px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-muted)',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <X size={16} /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Inbox size={32} color="var(--accent-amber)" />
              </div>
              <h3 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No Pending Received Requests
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '380px', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                You have responded to all incoming requests. When new prospective matches express interest in your profile, they will appear here.
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
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Explore Discovery
              </button>
            </div>
          )
        ) : desktopTab === 'sent' ? (
          selectedRequestCandidate ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              {/* Top Header */}
              <div
                style={{
                  height: '76px',
                  padding: '0 28px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-secondary)',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <CandidateAvatar src={selectedRequestCandidate.photoUrls[0]} name={selectedRequestCandidate.name} size={48} isVerified={selectedRequestCandidate.isVerified} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 className="heading-font" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {selectedRequestCandidate.name}, {selectedRequestCandidate.age}
                      </h3>
                      {selectedRequestCandidate.isVerified && <ShieldCheck size={18} color="var(--accent-amber)" />}
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: 'var(--accent-amber-light)',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        Interest Sent · Pending
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>{selectedRequestCandidate.profession}</span> • <span>{selectedRequestCandidate.location}</span> • <span style={{ color: 'var(--accent-amber-light)' }}>✨ {selectedRequestCandidate.compatibilityScore}% Kundali Harmony</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => {
                      const cand = selectedRequestCandidate;
                      setSelectedRequestCandidate(null);
                      cancelLike(cand);
                    }}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '9999px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#F87171',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <X size={14} /> Withdraw
                  </button>
                  <button
                    onClick={() => {
                      selectCandidate(selectedRequestCandidate);
                      navigate('/candidate-detail');
                    }}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    View Full Dossier
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Waiting Status Card */}
                <div
                  style={{
                    padding: '18px 24px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.04) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}
                >
                  <Clock size={24} color="#60A5FA" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Awaiting Response from {selectedRequestCandidate.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Your matrimonial interest and celestial profile were shared. You will receive a notification and direct messaging will unlock as soon as they accept.
                    </div>
                  </div>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
                  <div>
                    <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                      <img
                        src={selectedRequestCandidate.photoUrls[0]}
                        alt={selectedRequestCandidate.name}
                        style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber-light)' }}>
                        Astrological Harmony
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Match Score</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{selectedRequestCandidate.compatibilityScore}%</div>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nakshatra</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedRequestCandidate.nakshatra || 'Bharani'}</div>
                        </div>
                        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dosha Balance</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#10B981' }}>Favorable</div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '20px',
                        borderRadius: '16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        Summary & Attributes
                      </span>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {selectedRequestCandidate.bio}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '6px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          💼 Profession: <strong style={{ color: 'var(--text-primary)' }}>{selectedRequestCandidate.profession}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          📍 Location: <strong style={{ color: 'var(--text-primary)' }}>{selectedRequestCandidate.location}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Send size={32} color="var(--accent-amber)" />
              </div>
              <h3 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No Sent Interests Yet
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '380px', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                You have not sent any requests yet. Discover prospective partners and click "Send Interest" to connect.
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
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Explore Discovery
              </button>
            </div>
          )
        ) : activeCandidate ? (
          <>
            {/* Chat Top Header */}
            <div
              style={{
                height: '68px',
                padding: '0 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-secondary)',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CandidateAvatar src={activeCandidate.photoUrls[0]} name={activeCandidate.name} size={44} isVerified={activeCandidate.isVerified} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 className="heading-font" style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                      {activeCandidate.name}, {activeCandidate.age}
                    </h3>
                    {activeCandidate.isVerified && <ShieldCheck size={16} color="var(--accent-amber)" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber-light)', fontWeight: 600 }}>
                    ✨ {activeCandidate.compatibilityScore}% Kundali Harmony · {activeCandidate.nakshatra}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => {
                    selectCandidate(activeCandidate);
                    navigate('/horoscope-compatibility');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '9999px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: 'var(--accent-amber-light)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} /> Kundali Match
                </button>
                <button
                  onClick={() => {
                    selectCandidate(activeCandidate);
                    navigate('/candidate-detail');
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Dossier
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  You connected with <strong>{activeCandidate.name}</strong>. Messages are end-to-end secured.
                </p>
              </div>

              {(activeConversation?.messages || []).map(msg => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </div>

            {/* Icebreaker Drawer */}
            {showDesktopIcebreakers && (
              <div
                style={{
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, rgba(30, 24, 54, 0.95) 0%, rgba(42, 14, 26, 0.95) 100%)',
                  borderTop: '1px solid var(--accent-amber)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber-light)' }}>
                  <Sparkles size={14} className="spin-slow" /> Astro AI Instant Celestial Icebreakers:
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                  {desktopIcebreakers.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDesktopSend(option)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: 'var(--text-primary)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleDesktopSend();
              }}
              style={{
                padding: '16px 24px',
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                onClick={() => setShowDesktopIcebreakers(!showDesktopIcebreakers)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '9999px',
                  background: showDesktopIcebreakers ? 'var(--accent-amber)' : 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid var(--accent-amber)',
                  color: showDesktopIcebreakers ? '#0B0B0E' : 'var(--accent-amber-light)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Sparkles size={14} /> AI Opener
              </button>

              <input
                type="text"
                value={desktopInputText}
                onChange={e => setDesktopInputText(e.target.value)}
                placeholder={`Message ${activeCandidate.name}...`}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: '9999px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />

              <button
                type="submit"
                disabled={!desktopInputText.trim()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: 'none',
                  background: desktopInputText.trim()
                    ? 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: desktopInputText.trim() ? '#0B0B0E' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: desktopInputText.trim() ? 'pointer' : 'default',
                  flexShrink: 0
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Sparkles size={32} color="var(--accent-amber)" />
            </div>
            <h3 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Select a Connection
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Choose a match from the sidebar to view their message thread, or find new partners in Discovery.
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
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Explore Discovery
            </button>
          </div>
        )}
      </div>
    </div>
  );

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
      {/* Desktop Master-Detail Workspace */}
      {renderDesktopMasterDetail()}

      {/* Mobile View (Strictly Preserved) */}
      <div className="mobile-only" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
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
      <AstraBottomNavigation />
      </div>

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
    </div>
  );
};
