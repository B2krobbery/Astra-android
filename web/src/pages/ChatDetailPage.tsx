import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { ArrowLeft, Send, Sparkles, ShieldCheck, Phone, Video } from 'lucide-react';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { ChatBubble } from '../components/ChatBubble';

export const ChatDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeConversation, sendChatMessage, selectedCandidate, userProfile } = useAstra();
  const [inputText, setInputText] = useState('');
  const [showIcebreakers, setShowIcebreakers] = useState(false);

  const candidate = activeConversation?.candidate || selectedCandidate;
  const messages = activeConversation?.messages || [];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (text.trim()) {
      sendChatMessage(text);
      setInputText('');
      setShowIcebreakers(false);
    }
  };

  const icebreakerOptions = [
    `I saw our Kundali score is ${candidate.compatibilityScore}%! What's your take on Nakshatra alignment? ✨`,
    `Notice we both share a passion for specialty coffee! What's your favorite spot in town? ☕`,
    `Rohini and ${candidate.nakshatra} are in high harmony today! How is your week going? 🌌`
  ];

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)'
      }}
    >
      {/* Top Bar Header */}
      <header
        style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} />
          </button>

          <CandidateAvatar src={candidate.photoUrls[0]} name={candidate.name} size={42} isVerified={candidate.isVerified} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800 }}>
                {candidate.name}
              </h2>
              {candidate.isVerified && <ShieldCheck size={16} color="var(--accent-amber)" />}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber-light)', fontWeight: 600 }}>
              ✨ {candidate.compatibilityScore}% Kundali Match
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
          <Phone size={18} style={{ cursor: 'pointer' }} />
          <Video size={18} style={{ cursor: 'pointer' }} />
        </div>
      </header>

      {/* Messages Thread */}
      <main style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </main>

      {/* Astro AI Icebreaker Assistant Pill Drawer */}
      {showIcebreakers && (
        <div
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, rgba(30, 24, 54, 0.95) 0%, rgba(42, 14, 26, 0.95) 100%)',
            borderTop: '1px solid var(--accent-amber)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber-light)' }}>
            <Sparkles size={14} className="spin-slow" /> Astro AI Instant Celestial Icebreakers:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {icebreakerOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(option)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {/* Ask Astro AI Icebreaker Button */}
        <button
          type="button"
          onClick={() => setShowIcebreakers(!showIcebreakers)}
          style={{
            padding: '8px 12px',
            borderRadius: '9999px',
            background: showIcebreakers ? 'var(--accent-amber)' : 'rgba(245, 158, 11, 0.15)',
            border: '1px solid var(--accent-amber)',
            color: showIcebreakers ? '#0F0C1B' : 'var(--accent-amber-light)',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Sparkles size={14} /> AI Opener
        </button>

        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`Message ${candidate.name}...`}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '9999px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem'
          }}
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            background: inputText.trim()
              ? 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            color: inputText.trim() ? '#0F0C1B' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'default'
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
