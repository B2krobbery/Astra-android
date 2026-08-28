import React from 'react';
import { ShieldCheck, X, CheckCircle, Award } from 'lucide-react';
import { VerificationDetail } from '../types';

interface VerificationModalProps {
  detail: VerificationDetail;
  onDismiss: () => void;
  onVerifyAction?: (() => void) | null;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  detail,
  onDismiss,
  onVerifyAction
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onClick={onDismiss}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-card)',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          border: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-card)',
          animation: 'floatOrb 0.3s ease-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={24} color="var(--accent-amber)" />
            </div>
            <div>
              <h3 className="heading-font" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {detail.title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-amber-light)' }}>
                {detail.statusText}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={22} />
          </button>
        </div>

        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Institution / Portal
            </span>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{detail.institution}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Credential Summary
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{detail.credential}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Verified: {detail.verifiedDate}</span>
            <span>ID: {detail.verificationId}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Award size={18} color="var(--accent-indigo)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {detail.description}
          </p>
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Verified by {detail.partnerAuthority}
        </div>

        {onVerifyAction ? (
          <button
            onClick={() => {
              onVerifyAction();
              onDismiss();
            }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '9999px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
              color: '#0F0C1B',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Submit Character Certificate for Verification
          </button>
        ) : (
          <button
            onClick={onDismiss}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '9999px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close Verification Details
          </button>
        )}
      </div>
    </div>
  );
};
