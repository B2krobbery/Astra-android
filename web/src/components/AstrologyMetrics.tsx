import React from 'react';
import { AstrologyCompatibility } from '../types';

interface MetricBarProps {
  label: string;
  score: number;
  color?: string;
}

export const MetricBar: React.FC<MetricBarProps> = ({ label, score, color = 'var(--accent-amber)' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{score}%</span>
    </div>
    <div
      style={{
        width: '100%',
        height: '8px',
        borderRadius: '9999px',
        background: 'var(--guna-bar-bg)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: `${score}%`,
          height: '100%',
          borderRadius: '9999px',
          background: color,
          transition: 'width 0.8s ease-out'
        }}
      />
    </div>
  </div>
);

export const GunaCircleMeter: React.FC<{ score: number; gunaText: string; level: string }> = ({
  score,
  gunaText,
  level
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '24px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(30, 24, 54, 0.9) 0%, rgba(42, 14, 26, 0.7) 100%)',
        border: '1px solid var(--border-glow)',
        boxShadow: 'var(--shadow-cosmic)',
        textAlign: 'center'
      }}
    >
      <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke="var(--accent-amber)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
            {score}%
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Alignment
          </span>
        </div>
      </div>

      <div>
        <h4 className="heading-font" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {level}
        </h4>
        <span
          style={{
            display: 'inline-block',
            marginTop: '4px',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid var(--accent-amber)',
            color: 'var(--accent-amber-light)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          ✨ {gunaText}
        </span>
      </div>
    </div>
  );
};
