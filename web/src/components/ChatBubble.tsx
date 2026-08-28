import React from 'react';
import { ChatMessage } from '../types';
import { Sparkles } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.isFromUser;
  const isAstroAi = message.senderName === 'Astro AI';

  const getBubbleBackground = () => {
    if (isUser) {
      return 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-indigo-dark) 100%)';
    }
    if (isAstroAi) {
      return 'var(--ai-bubble-bg)';
    }
    return 'var(--bg-card)';
  };

  const getBubbleTextColor = () => {
    if (isUser) return '#FFFFFF';
    if (isAstroAi) return 'var(--ai-bubble-text)';
    return 'var(--text-primary)';
  };

  const getBubbleBorder = () => {
    if (isUser) return 'none';
    if (isAstroAi) return '1px solid var(--ai-bubble-border)';
    return '1px solid var(--border-color)';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        {!isUser && isAstroAi && (
          <Sparkles size={12} color="var(--accent-amber)" />
        )}
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {message.senderName} · {message.timestamp}
        </span>
      </div>
      <div
        style={{
          maxWidth: '82%',
          padding: '12px 16px',
          borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
          background: getBubbleBackground(),
          color: getBubbleTextColor(),
          border: getBubbleBorder(),
          fontSize: '0.875rem',
          fontWeight: 400,
          lineHeight: 1.45,
          boxShadow: isUser ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'var(--shadow-card)',
          whiteSpace: 'pre-wrap'
        }}
      >
        {message.message}
      </div>
    </div>
  );
};
