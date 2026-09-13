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
}

export const CandidateCardView: React.FC<CandidateCardViewProps> = ({
  candidate,
  onCardClick,
  onLikeClick,
  onPassClick,
  onCheckCompatibility
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [exitDirection, setExitDirection] = useState<'LIKE' | 'PASS' | null>(null);

  const [dragStartY, setDragStartY] = useState(0);

  // Preload all candidate photos immediately on mount / photoIndex change
  useEffect(() => {
    if (candidate?.photoUrls) {
      preloadImages(candidate.photoUrls);
    }
  }, [candidate]);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [photoIndex, candidate?.id]);

  const currentPhotoSrc = candidate.photoUrls[photoIndex] || candidate.photoUrls[0];

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
    if (exitDirection) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    setDragOffset({ x: 0, y: 0 });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || exitDirection) return;
    const deltaX = e.clientX - dragStartX;
    setDragOffset({ x: deltaX, y: 0 });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || exitDirection) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    const totalDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (totalDist < 10) {
      // Tap gesture
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      // Upper 65% of card: Photo tap controls (Left 50% = Prev, Right 50% = Next)
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
      // Gently return to center if under threshold
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Determine Transform & Transition
  const getTransform = () => {
    if (exitDirection === 'LIKE') {
      return 'translate3d(600px, 0, 0) rotate(30deg)';
    }
    if (exitDirection === 'PASS') {
      return 'translate3d(-600px, 0, 0) rotate(-30deg)';
    }
    const rotationAngle = (dragOffset.x / 300) * 15;
    return `translate3d(${dragOffset.x}px, 0, 0) rotate(${rotationAngle}deg)`;
  };

  return (
    <div
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
        boxShadow: 'var(--shadow-card)',
        background: '#121217',
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: getTransform(),
        opacity: exitDirection ? 0 : 1,
        transition: exitDirection
          ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease-out'
          : isDragging
          ? 'none'
          : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        touchAction: 'none'
      }}
    >
      {/* Shimmer Placeholder Background while image is downloading */}
      {!isImageLoaded && (
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

      {/* Photo Viewport */}
      <img
        src={currentPhotoSrc}
        alt={candidate.name}
        onLoad={() => setIsImageLoaded(true)}
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

      {/* Swipe Feedback Overlay Badges */}
      {(dragOffset.x > 120 || exitDirection === 'LIKE') && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '30px',
            padding: '8px 20px',
            borderRadius: '16px',
            border: '3px solid #4ADE80',
            color: '#4ADE80',
            fontWeight: 900,
            fontSize: '1.4rem',
            transform: 'rotate(-15deg)',
            zIndex: 30,
            background: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          LIKE ✨
        </div>
      )}
      {(dragOffset.x < -120 || exitDirection === 'PASS') && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '30px',
            padding: '8px 20px',
            borderRadius: '16px',
            border: '3px solid #F43F5E',
            color: '#F43F5E',
            fontWeight: 900,
            fontSize: '1.4rem',
            transform: 'rotate(15deg)',
            zIndex: 30,
            background: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          PASS
        </div>
      )}

      {/* Story Segmented Photo Indicators */}
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

      {/* Gradient Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 35%, rgba(11, 11, 14, 0.88) 70%, #0B0B0E 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Compatibility Badge Pill */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '16px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8942E 100%)',
          color: '#0B0B0E',
          fontWeight: 800,
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 16px rgba(212, 175, 55, 0.25)',
          zIndex: 25
        }}
      >
        <Sparkles size={14} fill="#0B0B0E" />
        {candidate.compatibilityScore}% {candidate.intent === 'Marriage' ? 'Kundali Match' : 'Match'}
      </div>

      {/* Bottom Content Card Details */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          color: '#FFF',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 className="heading-font" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {candidate.name}, {candidate.age}
          </h2>
          {candidate.isVerified && <ShieldCheck size={22} color="var(--accent-amber)" />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={15} color="var(--accent-indigo)" /> {candidate.profession}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color="var(--accent-indigo)" /> {candidate.location}
          </div>
          {candidate.intent === 'Marriage' && candidate.religion && candidate.caste && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} color="var(--accent-indigo)" /> {candidate.religion}, {candidate.caste}{candidate.subCaste ? ` • ${candidate.subCaste}` : ''}
            </div>
          )}
        </div>

        {candidate.nakshatra && candidate.rashi && (
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid var(--accent-amber)',
              color: 'var(--accent-amber-light)',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              alignSelf: 'flex-start'
            }}
          >
            ✨ {candidate.nakshatra} ({candidate.rashi.split(' ')[0]})
          </div>
        )}

        {/* Voice Intro Card */}
        <VoiceIntroCard
          candidateName={candidate.name}
          promptText={candidate.voiceNotePrompt || candidate.bio || "Hi, I'd love to connect and see where this goes!"}
          audioUrl={candidate.voiceNoteUrl}
        />

        {/* Action Button Bar */}
        <div onPointerDown={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            onClick={onCheckCompatibility}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={14} color="var(--accent-amber)" /> {candidate.intent === 'Marriage' ? 'Check Kundali Harmony' : 'View Compatibility'}
          </button>

          <button
            onClick={onCardClick}
            style={{
              padding: '12px 16px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8942E 100%)',
              border: 'none',
              color: '#0B0B0E',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            View <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
