import React, { useState } from 'react';
import { useAstra } from '../context/AstraContext';
import { X, Copy, Check, Sparkles, Award, Gift } from 'lucide-react';
import { ReferralGiftIllustration } from './Illustrations';

export const ReferralModal: React.FC = () => {
  const { isReferralModalOpen, closeReferralModal, referralData } = useAstra();
  const [copied, setCopied] = useState(false);

  if (!isReferralModalOpen) return null;

  const referralUrl = `https://astra.match/invite?code=${referralData.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={closeReferralModal}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(135deg, rgba(30, 24, 54, 0.95) 0%, rgba(42, 14, 26, 0.95) 100%)',
          border: '1px solid var(--accent-amber)',
          borderRadius: '28px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: 'var(--shadow-cosmic)',
          animation: 'floatOrb 0.3s ease-out',
          position: 'relative'
        }}
      >
        <button
          onClick={closeReferralModal}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        <ReferralGiftIllustration size={100} />

        <h3 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '12px' }}>
          Invite Friends & Unlock Golden Badge ✨
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
          Share your unique celestial referral link. When 2 friends join, you unlock the <strong style={{ color: 'var(--accent-amber-light)' }}>Golden Celestial Badge</strong> & <strong style={{ color: 'var(--accent-indigo)' }}>Unlimited Astro AI Predictions</strong>!
        </p>

        {/* Copy Box */}
        <div
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '10px 14px',
            borderRadius: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {referralUrl}
          </span>
          <button
            onClick={handleCopy}
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              border: 'none',
              background: copied ? '#4ADE80' : 'var(--accent-amber)',
              color: '#0F0C1B',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Reward Status Progress */}
        <div
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '14px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Invites Status:</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-amber-light)' }}>
              {referralData.successfulSignups} / 2 Signed Up
            </span>
          </div>

          <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.1)' }}>
            <div
              style={{
                width: `${(referralData.successfulSignups / 2) * 100}%`,
                height: '100%',
                borderRadius: '9999px',
                background: 'var(--accent-amber)'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#4ADE80', marginTop: '4px' }}>
            <Award size={14} /> Golden Badge Unlocked!
          </div>
        </div>
      </div>
    </div>
  );
};
