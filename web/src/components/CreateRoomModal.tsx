import React, { useState } from 'react';
import { X, Users, MapPin, Sparkles } from 'lucide-react';
import { RoomCategory } from '../types';
import { RoomService } from '../services/RoomService';
import { useAstra } from '../context/AstraContext';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (roomId: string) => void;
}

const CATEGORIES: { key: RoomCategory; label: string; icon: string }[] = [
  { key: 'Sports', label: 'Sports (Cricket, etc.)', icon: '🏏' },
  { key: 'Chai & Coffee', label: 'Chai & Coffee', icon: '☕' },
  { key: 'Fitness', label: 'Fitness & Badminton', icon: '🏸' },
  { key: 'Social', label: 'Casual Hangout', icon: '🗣️' },
  { key: 'Music', label: 'Music & Jamming', icon: '🎵' },
  { key: 'Tech', label: 'Tech & Networking', icon: '💻' },
  { key: 'Other', label: 'Other Activity', icon: '✨' }
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onRoomCreated }) => {
  const { userCoords, userProfile } = useAstra();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RoomCategory>('Sports');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(userProfile.location || 'Nearby');
  const [maxParticipants, setMaxParticipants] = useState<number>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a room name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const room = await RoomService.createRoom({
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        locationName: locationName.trim() || 'Nearby',
        latitude: userCoords?.latitude,
        longitude: userCoords?.longitude,
        radiusKm: 25,
        maxParticipants
      });

      onClose();
      onRoomCreated(room.id);
    } catch (err: any) {
      console.error('Failed to create room:', err);
      setErrorMsg(err.message || 'Failed to create room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'linear-gradient(135deg, #181524 0%, #0E0C16 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          padding: '20px',
          color: '#F8FAFC',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🏏</span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
              Create Activity Room
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '8px 12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#FCA5A5', fontSize: '0.8rem', marginBottom: '14px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Room Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              ROOM TITLE / ACTIVITY NAME *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Wanna play cricket this Sunday? 🏏"
              maxLength={80}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                color: '#F8FAFC',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Category Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              CATEGORY
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {CATEGORIES.map(cat => {
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid var(--accent-amber)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? 'var(--accent-amber-light)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 700 : 500,
                      textAlign: 'left'
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description / Plan */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              ACTIVITY DETAILS / MEETING POINT
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Planning a casual cricket match at Shivaji Ground, 4 PM. We have tennis balls & bats, looking for 4-5 more players!"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-color)',
                color: '#F8FAFC',
                fontSize: '0.85rem',
                resize: 'none'
              }}
            />
          </div>

          {/* Location / Area Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              AREA / VENUE LOCATION
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="var(--accent-rose)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="e.g. Indiranagar, Bangalore"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-color)',
                  color: '#F8FAFC',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              📍 Only users within ~25 km radius can discover this room.
            </p>
          </div>

          {/* Max Participants */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                MAX PARTICIPANTS
              </label>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                {maxParticipants} People
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[6, 10, 15, 20].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMaxParticipants(num)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '10px',
                    border: maxParticipants === num ? '1px solid var(--accent-amber)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: maxParticipants === num ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: maxParticipants === num ? 'var(--accent-amber-light)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '8px',
              padding: '14px',
              borderRadius: '9999px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
              color: '#0B0B0E',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.35)'
            }}
          >
            <Sparkles size={18} />
            {isSubmitting ? 'Creating Room...' : 'Launch Room (Active for 48h)'}
          </button>
        </form>
      </div>
    </div>
  );
};
