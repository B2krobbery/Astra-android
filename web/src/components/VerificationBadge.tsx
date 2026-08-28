import React from 'react';
import { GraduationCap, ShieldCheck, CreditCard } from 'lucide-react';
import { VerificationType } from '../types';

interface VerificationBadgeProps {
  type: VerificationType;
  label?: string;
  isVerified?: boolean;
  onClick?: () => void;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type,
  label,
  isVerified = true,
  onClick
}) => {
  const getIcon = () => {
    switch (type) {
      case VerificationType.EDUCATION:
        return <GraduationCap size={14} color="#38BDF8" />;
      case VerificationType.POLICE:
        return <ShieldCheck size={14} color="#4ADE80" />;
      case VerificationType.CREDIT:
        return <CreditCard size={14} color="#FBBF24" />;
    }
  };

  const getDefaultLabel = () => {
    switch (type) {
      case VerificationType.EDUCATION:
        return 'Education Verified';
      case VerificationType.POLICE:
        return 'Police Verified';
      case VerificationType.CREDIT:
        return 'Credit Score 780+';
    }
  };

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '9999px',
        background: isVerified ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${isVerified ? 'var(--border-color)' : 'rgba(255, 255, 255, 0.05)'}`,
        color: isVerified ? 'var(--text-primary)' : 'var(--text-muted)',
        fontSize: '0.75rem',
        fontWeight: 500,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease'
      }}
    >
      {getIcon()}
      <span>{label || getDefaultLabel()}</span>
    </button>
  );
};
