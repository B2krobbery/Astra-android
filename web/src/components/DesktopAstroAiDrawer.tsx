import React, { useState, useRef, useEffect } from 'react';
import { useAstra } from '../context/AstraContext';
import { ChatBubble } from './ChatBubble';
import { Bot, Sparkles, Send, X, Minus, Maximize2 } from 'lucide-react';
import { suggestedQuestions } from '../data/mockData';

export const DesktopAstroAiDrawer: React.FC = () => {
  const {
    isAstroAiDrawerOpen,
    setIsAstroAiDrawerOpen,
    astroAiMessages,
    askAstroAi,
    isAstroAiTyping,
    t,
    themeMode
  } = useAstra();

  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or typing state change
  useEffect(() => {
    if (isAstroAiDrawerOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [astroAiMessages, isAstroAiTyping, isAstroAiDrawerOpen, isMinimized]);

  if (!isAstroAiDrawerOpen) return null;

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (trimmed) {
      askAstroAi(trimmed);
      setInputText('');
    }
  };

  const isLight = themeMode === 'LIGHT';

  // Minimized floating pill docked at bottom right
  if (isMinimized) {
    return (
      <div
        className="desktop-only"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 120,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          borderRadius: '9999px',
          background: isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(18, 14, 28, 0.95)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(245, 158, 11, 0.2)',
          cursor: 'pointer',
          animation: 'pulseGlow 4s ease-in-out infinite'
        }}
        onClick={() => setIsMinimized(false)}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--accent-amber)'
          }}
        >
          <Bot size={18} color="var(--accent-amber)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
              Astro AI Guide
            </span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 6px #10B981'
              }}
            />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Click to expand chat
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Expand"
        >
          <Maximize2 size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsAstroAiDrawerOpen(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="desktop-only"
      aria-label="Astro AI Assistant Drawer"
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        bottom: '24px',
        width: '460px',
        maxWidth: 'calc(100vw - 48px)',
        zIndex: 120,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 12, 24, 0.94)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        boxShadow:
          '0 24px 64px rgba(0, 0, 0, 0.65), 0 0 32px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        animation: 'astroDrawerIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
          background: isLight ? 'rgba(245, 158, 11, 0.06)' : 'rgba(245, 158, 11, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--accent-amber)',
              boxShadow: '0 0 14px rgba(245, 158, 11, 0.25)'
            }}
          >
            <Bot size={22} color="var(--accent-amber)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3
                className="heading-font"
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--accent-amber)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {t('astro_ai_guide')} ✨
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 6px #10B981'
                  }}
                />
                Active
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Vedic Astrology & Celestial Intelligence
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s ease, color 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            title="Minimize drawer"
          >
            <Minus size={17} />
          </button>

          <button
            type="button"
            onClick={() => setIsAstroAiDrawerOpen(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s ease, color 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            title="Close drawer"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          padding: '16px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {astroAiMessages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isAstroAiTyping && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              color: 'var(--accent-amber)',
              fontSize: '0.8rem',
              background: 'rgba(245, 158, 11, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              margin: '8px 0',
              width: 'fit-content'
            }}
          >
            <Sparkles size={16} className="spin-slow" />
            <span>Consulting ancient charts & planetary transits...</span>
          </div>
        )}

        {/* Suggested Questions Section */}
        <div style={{ marginTop: '16px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {t('suggested_inquiries')}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: 'var(--accent-amber)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.22)';
                  e.currentTarget.style.borderColor = 'var(--accent-amber)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                ✨ {q}
              </button>
            ))}
          </div>
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend(inputText);
        }}
        style={{
          padding: '14px 18px',
          background: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.25)',
          borderTop: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
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
            padding: '12px 18px',
            borderRadius: '9999px',
            background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
            border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--text-primary)',
            fontSize: '0.86rem',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent-amber)')}
          onBlur={e =>
            (e.target.style.borderColor = isLight
              ? 'rgba(0, 0, 0, 0.12)'
              : 'rgba(255, 255, 255, 0.12)')
          }
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: 'none',
            background: inputText.trim()
              ? 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)'
              : 'rgba(255, 255, 255, 0.08)',
            color: inputText.trim() ? '#0B0B0E' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'default',
            boxShadow: inputText.trim() ? '0 4px 12px rgba(245, 158, 11, 0.35)' : 'none',
            transition: 'transform 0.15s ease, background 0.2s ease'
          }}
          onMouseEnter={e => {
            if (inputText.trim()) e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
          }}
          title="Send inquiry"
        >
          <Send size={18} />
        </button>
      </form>
    </aside>
  );
};
