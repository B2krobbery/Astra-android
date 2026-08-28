import React from 'react';

export const KundaliWheelIllustration: React.FC<{ size?: number }> = ({ size = 160 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" stroke="url(#kundaliGradient)" strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="100" cy="100" r="70" stroke="url(#kundaliGradient2)" strokeWidth="1.5" />
    <rect x="50" y="50" width="100" height="100" transform="rotate(45 100 100)" stroke="url(#kundaliGradient)" strokeWidth="1.5" />
    <line x1="30" y1="100" x2="170" y2="100" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
    <line x1="100" y1="30" x2="100" y2="170" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
    <circle cx="100" cy="100" r="8" fill="#F59E0B" />
    <circle cx="100" cy="30" r="4" fill="#818CF8" />
    <circle cx="170" cy="100" r="4" fill="#FCD34D" />
    <circle cx="100" cy="170" r="4" fill="#F43F5E" />
    <circle cx="30" y1="100" r="4" fill="#818CF8" />
    <defs>
      <linearGradient id="kundaliGradient" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="0.5" stopColor="#818CF8" />
        <stop offset="1" stopColor="#F43F5E" />
      </linearGradient>
      <linearGradient id="kundaliGradient2" x1="200" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FCD34D" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
  </svg>
);

export const CosmicConstellationIllustration: React.FC<{ size?: number }> = ({ size = 140 }) => (
  <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 40 L70 30 L120 60 L140 120 L80 140 L40 100 Z" stroke="rgba(129, 140, 248, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="30" cy="40" r="5" fill="#FCD34D" />
    <circle cx="70" cy="30" r="4" fill="#F59E0B" />
    <circle cx="120" cy="60" r="6" fill="#818CF8" />
    <circle cx="140" cy="120" r="4" fill="#F43F5E" />
    <circle cx="80" cy="140" r="5" fill="#F59E0B" />
    <circle cx="40" cy="100" r="4" fill="#818CF8" />
  </svg>
);

export const VerifiedShieldIllustration: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 10 L100 28 V62 C100 90 60 110 60 110 C60 110 20 90 20 62 V28 L60 10 Z" fill="url(#shieldGrad)" stroke="#F59E0B" strokeWidth="2" />
    <path d="M42 60 L54 72 L78 48" stroke="#0F0C1B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="shieldGrad" x1="20" y1="10" x2="100" y2="110" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FCD34D" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

export const AiBrainIllustration: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="70" cy="70" r="60" fill="url(#aiBrainGrad)" opacity="0.2" />
    <circle cx="70" cy="70" r="45" stroke="#818CF8" strokeWidth="2" strokeDasharray="6 6" />
    <circle cx="70" cy="70" r="16" fill="#F59E0B" />
    <path d="M70 25 V45 M70 95 V115 M25 70 H45 M95 70 H115 M38 38 L52 52 M88 88 L102 102 M102 38 L88 52 M52 88 L38 102" stroke="#FCD34D" strokeWidth="2" />
    <defs>
      <linearGradient id="aiBrainGrad" x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

export const ReferralGiftIllustration: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="50" width="80" height="50" rx="8" fill="url(#giftGrad)" stroke="#F59E0B" strokeWidth="2" />
    <rect x="15" y="38" width="90" height="16" rx="4" fill="#FCD34D" />
    <line x1="60" y1="38" x2="60" y2="100" stroke="#0F0C1B" strokeWidth="6" />
    <path d="M60 38 C40 18 20 30 40 38 C60 46 60 38 60 38 Z" fill="#F43F5E" />
    <path d="M60 38 C80 18 100 30 80 38 C60 46 60 38 60 38 Z" fill="#F43F5E" />
    <defs>
      <linearGradient id="giftGrad" x1="20" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2A0E1A" />
        <stop offset="1" stopColor="#78350F" />
      </linearGradient>
    </defs>
  </svg>
);
