import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { PrimaryButton } from '../components/AstraButtons';
import { ArrowLeft, User, Briefcase, GraduationCap, MapPin, Sparkles } from 'lucide-react';

export const ProfileOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, updateProfileInfo } = useAstra();

  const [profession, setProfession] = useState(userProfile.profession);
  const [education, setEducation] = useState(userProfile.education);
  const [city, setCity] = useState(userProfile.location);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileInfo(profession, education, city, userProfile.lookingFor, userProfile.interests);
    navigate('/onboarding-astrology');
  };

  return (
    <div
      style={{
        padding: '24px 20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--bg-primary)'
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
            Step 1 of 2
          </span>
          <button
            onClick={() => navigate('/onboarding-astrology')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Skip
          </button>
        </div>

        <h2 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
          Create Your Profile ✨
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Let matches know about your journey and achievements.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Profession
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="text"
                value={profession}
                onChange={e => setProfession(e.target.value)}
                placeholder="e.g. Senior Product Designer"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Education
            </label>
            <div style={{ position: 'relative' }}>
              <GraduationCap size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="text"
                value={education}
                onChange={e => setEducation(e.target.value)}
                placeholder="e.g. IIT Bombay · B.Des"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Current City
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '24px' }}>
        <PrimaryButton onClick={handleSubmit}>
          Next: Setup Astrology Chart <Sparkles size={18} />
        </PrimaryButton>
      </div>
    </div>
  );
};
