import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { Sparkles, MessageCircle, Bot, UserX, Users, AlertTriangle } from 'lucide-react';
import { Candidate } from '../types';

export const MatchesConversationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    conversations,
    pendingRequests,
    sentRequests,
    openConversationForCandidate,
    selectCandidate,
    unfriendCandidate,
    t
  } = useAstra();

  const [unfriendTarget, setUnfriendTarget] = useState<Candidate | null>(null);
  const [isUnfriending, setIsUnfriending] = useState(false);

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
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <h1 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
          {t('matches_page_title')}
        </h1>
      </header>

      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Celestial Friend List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} color="var(--accent-amber)" /> Friend List ({conversations.length})
            </span>
          </div>

          {conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '20px', border: '1px border var(--border-color)' }}>
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
      </main>

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
