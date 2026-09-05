import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { PrimaryButton } from '../components/AstraButtons';
import { ArrowLeft, Calendar, Clock, MapPin, Sparkles, Moon } from 'lucide-react';
import { AstrologyEngine } from '../data/astrologyEngine';

export const AstrologySetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, updateBirthDetails } = useAstra();

  const [dob, setDob] = useState(userProfile.dateOfBirth);
  const [time, setTime] = useState(userProfile.birthTime);
  const [city, setCity] = useState(userProfile.birthCity);

  // Removed
  // Removed

  
  const [previewNakshatra, setPreviewNakshatra] = useState<string | null>(null);
  const [previewRashi, setPreviewRashi] = useState<string | null>(null);

  React.useEffect(() => {
    if (dob && time && city) {
      setPreviewNakshatra(AstrologyEngine.calculateNakshatra(dob, time, city));
      setPreviewRashi(AstrologyEngine.calculateRashi(dob, time, city));
    }
  }, [dob, time, city]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    updateBirthDetails(dob, time, city);
    navigate('/discover');
  };

  return (
    <div
      style={{
        padding: '24px 20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'radial-gradient(circle at 50% 20%, rgba(30, 24, 54, 0.9) 0%, var(--bg-primary) 80%)'
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
            Step 2 of 2
          </span>
          <button
            onClick={() => navigate('/discover')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Skip
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}
          >
            <Moon size={28} color="var(--accent-amber)" />
          </div>
          <h2 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
            Vedic Birth Chart ✨
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Enter your exact birth parameters for Nakshatra & Guna Milan calculations.
          </p>
        </div>

        {/* Inputs */}
        <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Date of Birth
            </label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="text"
                value={dob}
                onChange={e => setDob(e.target.value)}
                placeholder="e.g. 14 July 1998"
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
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Birth Time
            </label>
            <div style={{ position: 'relative' }}>
              <Clock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="e.g. 08:45 AM"
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
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Birth Place / City
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

        {/* Dynamic Calculation Live Card */}
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(42, 14, 26, 0.7) 0%, rgba(30, 24, 54, 0.7) 100%)',
            border: '1px solid var(--accent-amber)',
            boxShadow: 'var(--shadow-cosmic)',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber-light)', textTransform: 'uppercase' }}>
            Calculated Celestial Placement
          </span>
          <h3 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
            {previewNakshatra || '...'} Nakshatra
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Moon Sign: {previewRashi || '...'}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <PrimaryButton onClick={handleCalculate}>
          Align My Stars & Enter Astra <Sparkles size={18} />
        </PrimaryButton>
      </div>
    </div>
  );
};
