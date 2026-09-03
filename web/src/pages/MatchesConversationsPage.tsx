import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { Sparkles, MessageCircle, Bot } from 'lucide-react';

export const MatchesConversationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { conversations, candidates, pendingRequests, sentRequests, openConversationForCandidate, selectCandidate, t } = useAstra();

  return (
    <div
      style={{
        minHeight: '100vh',
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
        {/* Horizontal Matches Scroll Strip */}
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

        {/* Recent Conversations List */}
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t('recent_conversations')} ({conversations.length})
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {conversations.map(conv => (
              <div
                key={conv.candidate.id}
                onClick={() => {
                  openConversationForCandidate(conv.candidate);
                  navigate('/chat-detail');
                }}
                style={{
                  padding: '14px',
                  borderRadius: '20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <CandidateAvatar src={conv.candidate.photoUrls[0]} name={conv.candidate.name} size={52} isVerified={conv.candidate.isVerified} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="heading-font" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                      {conv.candidate.name}
                    </h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {conv.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AstraBottomNavigation />
    </div>
  );
};
