import React, { useState, useRef, useEffect } from 'react';
import { useAstra } from '../context/AstraContext';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { ChatBubble } from '../components/ChatBubble';
import { Sparkles, Send, Bot } from 'lucide-react';
import { suggestedQuestions } from '../data/mockData';

export const AstroAiAssistantPage: React.FC = () => {
  const { astroAiMessages, askAstroAi, isAstroAiTyping, t } = useAstra();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [astroAiMessages, isAstroAiTyping]);

  const handleSend = (question: string) => {
    if (question.trim()) {
      askAstroAi(question);
      setInputText('');
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--bg-primary)'
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 16px 20px',
          background: 'var(--ai-header-bg)',
          borderBottom: '1px solid var(--accent-amber)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--accent-amber)'
          }}
        >
          <Bot size={22} color="var(--accent-amber)" />
        </div>
        <div>
          <h2 className="heading-font" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
            {t('astro_ai_guide')} ✨
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Vedic Astrology Intelligence
          </span>
        </div>
      </header>

      {/* Messages */}
      <main style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {astroAiMessages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isAstroAiTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: 'var(--accent-amber)', fontSize: '0.8rem' }}>
            <Sparkles size={16} className="spin-slow" />
            <span>Consulting ancient charts & planetary transits...</span>
          </div>
        )}

        {/* Suggested Questions Pills */}
        <div style={{ marginTop: '16px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            {t('suggested_inquiries')}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid var(--accent-amber)',
                  color: 'var(--accent-amber)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                ✨ {q}
              </button>
            ))}
          </div>
        </div>

        <div ref={messagesEndRef} />
      </main>

      {/* Input Box */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend(inputText);
        }}
        style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={t('ask_astro_ai')}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '9999px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem'
          }}
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          style={{
            width: 44,
            height: 44,
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
          <Send size={18} />
        </button>
      </form>

      <AstraBottomNavigation />
    </div>
  );
};
