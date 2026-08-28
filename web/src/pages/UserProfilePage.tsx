import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { VerificationBadge } from '../components/VerificationBadge';
import { VerificationType, ThemeMode, AppLanguage } from '../types';
import { Edit, Moon, Sun, Monitor, ShieldCheck, Sparkles, LogOut, Share2, Bot, Camera, Globe } from 'lucide-react';

import { UserVoiceRecorderCard } from '../components/UserVoiceRecorderCard';

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    userProfile,
    themeMode,
    setThemeMode,
    showUserVerification,
    verifyPoliceForUser,
    openReferralModal,
    uploadUserProfilePhoto,
    language,
    setLanguage,
    t
  } = useAstra();

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadUserProfilePhoto(e.target.files[0]);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        paddingBottom: '88px'
      }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Top Bar */}
      <header
        style={{
          padding: '16px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h1 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
          {t('profile_title')} ✨
        </h1>
        <button
          onClick={() => navigate('/splash')}
          style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* User Card with Photo Upload Overlay */}
        <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            <CandidateAvatar src={userProfile.photoUrl} name={userProfile.name} size={72} isVerified={userProfile.policeVerified} />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--accent-amber)',
                color: '#0F0C1B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)'
              }}
              title={t('btn_upload_photo')}
            >
              <Camera size={14} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h2 className="heading-font" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {userProfile.name}, {userProfile.age}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {userProfile.profession}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: '6px',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber-light)',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Camera size={12} /> {t('btn_upload_photo')}
            </button>
          </div>

          <button
            onClick={() => navigate('/onboarding-typeform')}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Edit size={18} />
          </button>
        </div>

        {/* User Voice Note Recorder */}
        <UserVoiceRecorderCard />

        {/* Language Selection Selector (English / മലയാളം) */}
        <div
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Globe size={18} color="var(--accent-amber)" />
            <h3 className="heading-font" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              App Language / ഭാഷ തിരഞ്ഞെടുക്കുക
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { code: 'EN', label: 'English' },
              { code: 'ML', label: 'മലയാളം' },
              { code: 'HI', label: 'हिंदी (Hindi)' }
            ].map(lang => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as AppLanguage)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '14px',
                    border: isSelected ? '1.5px solid var(--accent-amber)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                    color: isSelected ? 'var(--accent-amber-light)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Completion Meter (0-100%) */}
        <div
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{t('profile_completion')}:</span>
            <span style={{ fontWeight: 800, color: 'var(--accent-amber-light)' }}>
              {userProfile.completionPercentage}% Complete
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${userProfile.completionPercentage}%`,
                height: '100%',
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, var(--accent-amber) 0%, #4ADE80 100%)',
                transition: 'width 0.6s ease'
              }}
            />
          </div>
        </div>

        {/* Viral Referral Banner */}
        <div
          onClick={openReferralModal}
          style={{
            padding: '16px 20px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
            border: '1px solid var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Share2 size={24} color="var(--accent-rose)" />
            <div>
              <h4 className="heading-font" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFF' }}>
                {t('invite_friends')}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Unlock Unlimited Astro AI Predictions & Golden Profile Status
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
            Invite
          </span>
        </div>

        {/* Admin AI Control Panel Quick Link */}
        <div
          onClick={() => navigate('/admin/ai-agents')}
          style={{
            padding: '16px 20px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(30, 24, 54, 0.9) 100%)',
            border: '1px solid var(--accent-indigo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bot size={24} color="var(--accent-indigo)" />
            <div>
              <h4 className="heading-font" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFF' }}>
                AI Admin Panel & Operations
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Manage Content, Verification & Marketing AI Agents
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
            Open Admin
          </span>
        </div>

        {/* 3x Trusted Badge Verification Section */}
        <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(30, 24, 54, 0.9) 0%, rgba(42, 14, 26, 0.7) 100%)',
            border: '1px solid var(--accent-amber)',
            boxShadow: 'var(--shadow-cosmic)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={20} color="var(--accent-amber)" />
            <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-amber-light)' }}>
              {t('trust_badges')}
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Verified badges increase match responses by 3.2x on Astra.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <VerificationBadge
                type={VerificationType.EDUCATION}
                onClick={() => showUserVerification(VerificationType.EDUCATION)}
              />
              <span style={{ fontSize: '0.75rem', color: '#4ADE80', fontWeight: 600 }}>DigiLocker Verified</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <VerificationBadge
                type={VerificationType.POLICE}
                isVerified={userProfile.policeVerified}
                onClick={() => showUserVerification(VerificationType.POLICE)}
              />
              {userProfile.policeVerified ? (
                <span style={{ fontSize: '0.75rem', color: '#4ADE80', fontWeight: 600 }}>Clear Record</span>
              ) : (
                <button
                  onClick={verifyPoliceForUser}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: 'var(--accent-amber)',
                    border: 'none',
                    color: '#0F0C1B',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Verify Now
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <VerificationBadge
                type={VerificationType.CREDIT}
                onClick={() => showUserVerification(VerificationType.CREDIT)}
              />
              <span style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: 600 }}>Prime 780+</span>
            </div>
          </div>
        </div>

        {/* Theme Settings Selector */}
        <div
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <h3 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>
            App Theme Mode
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['DARK', 'LIGHT', 'SYSTEM'] as ThemeMode[]).map(mode => {
              const isSelected = themeMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '14px',
                    border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    color: isSelected ? 'var(--accent-amber-light)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {mode === 'DARK' && <Moon size={16} />}
                  {mode === 'LIGHT' && <Sun size={16} />}
                  {mode === 'SYSTEM' && <Monitor size={16} />}
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Astrology Edit Link */}
        <button
          onClick={() => navigate('/onboarding-typeform')}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            background: 'rgba(79, 70, 229, 0.15)',
            border: '1px solid var(--accent-indigo)',
            color: 'var(--accent-indigo)',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={16} /> {t('edit_kundali')}
        </button>
      </main>

      <AstraBottomNavigation />
    </div>
  );
};
