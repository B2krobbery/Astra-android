import React, { useState, useEffect } from 'react';
import { Candidate } from '../types';
import { Sparkles, MapPin, Briefcase, GraduationCap, ShieldCheck, ChevronRight } from 'lucide-react';
import { VerificationBadge } from './VerificationBadge';
import { VerificationType } from '../types';
import { VoiceIntroCard } from './VoiceIntroCard';
import { preloadImages } from '../utils/imagePreloader';

interface CandidateCardViewProps {
  candidate: Candidate;
  onCardClick: () => void;
  onLikeClick: () => void;
  onPassClick: () => void;
  onCheckCompatibility: () => void;
  isStaticPreview?: boolean;
}

export const CandidateCardView: React.FC<CandidateCardViewProps> = ({
  candidate,
  onCardClick,
  onLikeClick,
  onPassClick,
  onCheckCompatibility,
  isStaticPreview = false
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [exitDirection, setExitDirection] = useState<'LIKE' | 'PASS' | null>(null);

  // Preload all candidate photos immediately on mount / photoIndex change
  useEffect(() => {
    if (candidate?.photoUrls) {
      preloadImages(candidate.photoUrls);
    }
  }, [candidate]);

  useEffect(() => {
    setIsImageLoaded(false);
    setIsImageError(false);
  }, [photoIndex, candidate?.id]);

  const currentPhotoSrc = candidate.photoUrls?.[photoIndex] || candidate.photoUrls?.[0];
  const isFallbackAvatar =
    !currentPhotoSrc ||
    currentPhotoSrc.includes('ui-avatars.com') ||
    isImageError;

  const initials = candidate.name
    ? candidate.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'VI';

  const nextPhoto = () => {
    if (photoIndex < candidate.photoUrls.length - 1) {
      setPhotoIndex(prev => prev + 1);
    } else {
      setPhotoIndex(0);
    }
  };

  const prevPhoto = () => {
    if (photoIndex > 0) {
      setPhotoIndex(prev => prev - 1);
    } else {
      setPhotoIndex(candidate.photoUrls.length - 1);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isStaticPreview || exitDirection) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    setDragOffset({ x: 0, y: 0 });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isStaticPreview || !isDragging || exitDirection) return;
    const deltaX = e.clientX - dragStartX;
    setDragOffset({ x: deltaX, y: 0 });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isStaticPreview || !isDragging || exitDirection) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    const totalDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (totalDist < 10) {
      // Tap gesture on upper 65% of card
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      if (relativeY < rect.height * 0.65) {
        if (relativeX < rect.width * 0.5) {
          prevPhoto();
        } else {
          nextPhoto();
        }
      }
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    if (dragOffset.x > 100) {
      // Smooth Fly-Off Animation to the Right (LIKE)
      setExitDirection('LIKE');
      setTimeout(() => {
        onLikeClick();
      }, 220);
    } else if (dragOffset.x < -100) {
      // Smooth Fly-Off Animation to the Left (PASS)
      setExitDirection('PASS');
      setTimeout(() => {
        onPassClick();
      }, 220);
    } else {
      // Return to center with spring snap
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Determine Transform & Transition
  const getTransform = () => {
    if (isStaticPreview) return 'none';
    if (exitDirection === 'LIKE') {
      return 'translate3d(600px, -30px, 0) rotate(26deg)';
    }
    if (exitDirection === 'PASS') {
      return 'translate3d(-600px, -30px, 0) rotate(-26deg)';
    }
    const rotationAngle = (dragOffset.x / 300) * 14;
    return `translate3d(${dragOffset.x}px, 0, 0) rotate(${rotationAngle}deg)`;
  };

  const getBoxShadow = () => {
    if (dragOffset.x > 20) {
      const alpha = Math.min(0.45, (dragOffset.x / 200) * 0.45);
      return `0 16px 48px rgba(34, 197, 94, ${alpha}), var(--shadow-card)`;
    }
    if (dragOffset.x < -20) {
      const alpha = Math.min(0.45, (-dragOffset.x / 200) * 0.45);
      return `0 16px 48px rgba(244, 63, 94, ${alpha}), var(--shadow-card)`;
    }
    return 'var(--shadow-card)';
  };

  return (
    <div
      className="candidate-glass-card"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '480px',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: getBoxShadow(),
        background: '#0D0C13',
        border: '1px solid var(--border-color)',
        cursor: isStaticPreview ? 'default' : isDragging ? 'grabbing' : 'grab',
        transform: getTransform(),
        opacity: exitDirection ? 0 : 1,
        transition: exitDirection
          ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease-out'
          : isDragging
          ? 'none'
          : 'transform 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease',
        touchAction: 'none'
      }}
    >
      {/* Shimmer Placeholder Background while image is downloading */}
      {!isImageLoaded && !isFallbackAvatar && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(110deg, #181822 30%, #2A2A38 50%, #181822 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear',
            zIndex: 1
          }}
        />
      )}

      {/* Fallback Luxury Vedic Cosmic Silhouette OR Real Photo Viewport */}
      {isFallbackAvatar ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 32%, #261B3D 0%, #140E24 55%, #08070D 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '170px',
            zIndex: 2,
            overflow: 'hidden'
          }}
        >
          {/* Subtle cosmic starry backdrop glow */}
          <div
            style={{
              position: 'absolute',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.16) 0%, transparent 70%)',
              filter: 'blur(25px)',
              pointerEvents: 'none'
            }}
          />

          {/* Sacred Astrological Mandala Ring */}
          <div
            style={{
              position: 'relative',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: '2px solid rgba(212, 175, 55, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 35px rgba(212, 175, 55, 0.25), inset 0 0 25px rgba(212, 175, 55, 0.15)',
              background: 'rgba(21, 17, 34, 0.8)',
              backdropFilter: 'blur(12px)'
            }}
          >
            {/* Outer Decorative Dashed Orbital Ring */}
            <div
              style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '50%',
                border: '1px dashed rgba(212, 175, 55, 0.35)',
                animation: 'spin-slow 40s linear infinite'
              }}
            />

            {/* Regal Monogram Initials */}
            <span
              style={{
                fontFamily: 'serif',
                fontSize: '2.8rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FFF4CC 0%, #D4AF37 50%, #B8942E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '2px'
              }}
            >
              {initials}
            </span>
          </div>

          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '9999px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: 'var(--accent-amber-light)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}
          >
            <Sparkles size={12} color="var(--accent-amber)" />
            <span>Vedic Matrimonial Alliance</span>
          </div>
        </div>
      ) : (
        <img
          src={currentPhotoSrc}
          alt={candidate.name}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setIsImageError(true)}
          decoding="async"
          loading="eager"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            opacity: isImageLoaded ? 1 : 0,
            transition: 'opacity 0.28s ease-in-out',
            position: 'relative',
            zIndex: 2
          }}
        />
      )}

      {/* Dynamic Real-time LIKE Stamp */}
      {!isStaticPreview && (dragOffset.x > 15 || exitDirection === 'LIKE') && (
        <div
          style={{
            position: 'absolute',
            top: '36px',
            left: '26px',
            padding: '8px 22px',
            borderRadius: '16px',
            border: '3px solid #22C55E',
            color: '#22C55E',
            fontWeight: 900,
            fontSize: '1.4rem',
            transform: `rotate(-14deg) scale(${exitDirection === 'LIKE' ? 1.15 : Math.min(1.1, 0.85 + dragOffset.x / 300)})`,
            zIndex: 35,
            background: 'rgba(10, 10, 14, 0.75)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)',
            opacity: exitDirection === 'LIKE' ? 1 : Math.min(1, dragOffset.x / 75),
            transition: exitDirection === 'LIKE' ? 'all 0.2s ease' : 'none',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          LIKE ✨
        </div>
      )}

      {/* Dynamic Real-time PASS Stamp */}
      {!isStaticPreview && (dragOffset.x < -15 || exitDirection === 'PASS') && (
        <div
          style={{
            position: 'absolute',
            top: '36px',
            right: '26px',
            padding: '8px 22px',
            borderRadius: '16px',
            border: '3px solid #F43F5E',
            color: '#F43F5E',
            fontWeight: 900,
            fontSize: '1.4rem',
            transform: `rotate(14deg) scale(${exitDirection === 'PASS' ? 1.15 : Math.min(1.1, 0.85 + -dragOffset.x / 300)})`,
            zIndex: 35,
            background: 'rgba(10, 10, 14, 0.75)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 30px rgba(244, 63, 94, 0.5)',
            opacity: exitDirection === 'PASS' ? 1 : Math.min(1, -dragOffset.x / 75),
            transition: exitDirection === 'PASS' ? 'all 0.2s ease' : 'none',
            pointerEvents: 'none'
          }}
        >
          PASS
        </div>
      )}

      {/* Story Segmented Photo Indicators */}
      {candidate.photoUrls && candidate.photoUrls.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '16px',
            right: '16px',
            display: 'flex',
            gap: '4px',
            zIndex: 25,
            pointerEvents: 'none'
          }}
        >
          {candidate.photoUrls.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: '3px',
                borderRadius: '9999px',
                background: idx === photoIndex ? '#FFF' : 'rgba(255, 255, 255, 0.35)',
                transition: 'background 0.2s ease'
              }}
            />
          ))}
        </div>
      )}

      {/* Deep Seamless Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 20%, rgba(8, 7, 12, 0.25) 50%, rgba(8, 7, 12, 0.88) 75%, #08070C 100%)',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      {/* Compatibility Badge Pill */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '16px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8942E 100%)',
          color: '#0B0B0E',
          fontWeight: 800,
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
          zIndex: 25
        }}
      >
        <Sparkles size={13} fill="#0B0B0E" />
        {candidate.compatibilityScore}% {candidate.intent === 'Marriage' ? 'Kundali Match' : 'Match'}
      </div>

      {/* Bottom Content Card Details */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px 18px 18px 18px',
          color: '#FFF',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          gap: '9px'
        }}
      >
        {/* Name, Age & Verified Shield */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 className="heading-font" style={{ fontSize: '1.65rem', fontWeight: 800, textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
            {candidate.name}, {candidate.age}
          </h2>
          {candidate.isVerified && (
            <ShieldCheck size={20} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))' }} />
          )}
        </div>

        {/* Micro-Pill Metadata Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
          {candidate.profession && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <Briefcase size={12} color="var(--accent-amber)" />
              <span>{candidate.profession}</span>
            </div>
          )}

          {candidate.location && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <MapPin size={12} color="var(--accent-rose)" />
              <span>{candidate.location}</span>
            </div>
          )}

          {candidate.distanceKm !== undefined && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(34, 197, 94, 0.18)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ADE80',
                fontWeight: 600
              }}
            >
              <MapPin size={12} color="#4ADE80" />
              <span>{candidate.distanceKm < 1 ? '< 1 km away' : `${candidate.distanceKm} km away`}</span>
            </div>
          )}

          {candidate.intent === 'Marriage' && candidate.religion && candidate.caste && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <span>{candidate.religion}, {candidate.caste}</span>
            </div>
          )}

          {candidate.nakshatra && candidate.rashi && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(212, 175, 55, 0.18)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: 'var(--accent-amber-light)',
                fontWeight: 700
              }}
            >
              <Sparkles size={11} color="var(--accent-amber)" />
              <span>{candidate.nakshatra} ({candidate.rashi.split(' ')[0]})</span>
            </div>
          )}
        </div>

        {/* Voice Intro Floating Capsule */}
        <VoiceIntroCard
          candidateName={candidate.name}
          promptText={candidate.voiceNotePrompt || candidate.bio || "Hi, I'd love to connect and see where this goes!"}
          audioUrl={candidate.voiceNoteUrl}
        />

        {/* Action Button Bar */}
        <div onPointerDown={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
          <button
            onClick={onCheckCompatibility}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: 'var(--accent-amber-light)',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={13} color="var(--accent-amber)" /> {candidate.intent === 'Marriage' ? 'Check Kundali' : 'View Compatibility'}
          </button>

          <button
            onClick={onCardClick}
            style={{
              padding: '10px 16px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8942E 100%)',
              border: 'none',
              color: '#0B0B0E',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
              transition: 'transform 0.15s ease'
            }}
          >
            View <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
