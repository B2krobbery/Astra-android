import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface CandidateAvatarProps {
  src: string;
  name: string;
  size?: number;
  isVerified?: boolean;
  onClick?: () => void;
}

export const CandidateAvatar: React.FC<CandidateAvatarProps> = ({
  src,
  name,
  size = 56,
  isVerified = true,
  onClick
}) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          padding: '2px',
          background: 'linear-gradient(135deg, var(--accent-amber) 0%, var(--accent-indigo) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#0F0C1B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)',
              fontSize: size * 0.4,
              fontWeight: 800,
              textTransform: 'uppercase'
            }}
          >
            {name ? name.charAt(0) : '?'}
          </div>
        )}
      </div>
      {isVerified && (
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            background: 'var(--accent-amber)',
            borderRadius: '50%',
            width: size * 0.35,
            height: size * 0.35,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--bg-primary)'
          }}
          title="Verified Profile"
        >
          <ShieldCheck size={size * 0.22} color="#0F0C1B" />
        </div>
      )}
    </div>
  );
};
