import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { supabase } from '../lib/supabase';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { VerificationBadge } from '../components/VerificationBadge';
import { VerificationType, ThemeMode, AppLanguage } from '../types';
import { Edit, Moon, Sun, Monitor, ShieldCheck, Sparkles, LogOut, Share2, Bot, Camera, Globe, Landmark, Activity, Utensils, Wine, Cigarette, Lock, ShieldAlert } from 'lucide-react';

import { UserVoiceRecorderCard } from '../components/UserVoiceRecorderCard';

const LogoutLoadingOverlay: React.FC = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(11, 11, 14, 0.96)',
    backdropFilter: 'blur(12px)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '24px'
  }}>
    <style>{`
      @keyframes logoutSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes logoutPulse {
        0%, 100% { opacity: 0.35; transform: scale(0.95); }
        50% { opacity: 0.85; transform: scale(1.06); }
      }
    `}</style>
    <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '2px solid var(--accent-amber)',
        animation: 'logoutPulse 1.8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', inset: '6px', borderRadius: '50%',
        border: '3px solid transparent',
        borderTopColor: '#D4AF37',
        borderRightColor: '#F59E0B',
        animation: 'logoutSpin 0.9s linear infinite'
      }} />
      <Sparkles size={28} color="var(--accent-amber)" />
    </div>
    <div style={{ textAlign: 'center', padding: '0 24px' }}>
      <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
        Signing out of Astra…
      </h3>
      <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8' }}>
        Securing your session &amp; clearing local data
      </p>
    </div>
  </div>
);

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    userProfile,
    themeMode,
    setThemeMode,
    openChaanbean,
    
    openReferralModal,
    uploadUserProfilePhoto,
    updateProfileInfo,
    deleteAccount,
    language,
    setLanguage,
    t
  } = useAstra();

  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [editedName, setEditedName] = React.useState(userProfile.name);
  const [editedProfession, setEditedProfession] = React.useState(userProfile.profession);
  const [editedEducation, setEditedEducation] = React.useState(userProfile.higherEducation || userProfile.education);
  const [editedLocation, setEditedLocation] = React.useState(userProfile.location);
  const [editedBio, setEditedBio] = React.useState(userProfile.bio || '');

  // Optional fields the user hasn't filled yet (intent-aware)
  const OPTIONAL_PROFILE_FIELDS = userProfile.intent === 'Marriage' ? [
    { key: 'subCaste',        label: 'Sub-Caste',          getValue: (p: any) => p.subCaste || p.sub_caste },
    { key: 'gotra',           label: 'Gotra',               getValue: (p: any) => p.gotra },
    { key: 'birthTime',       label: 'Birth Time',          getValue: (p: any) => p.birthTime || p.birth_time },
    { key: 'bio',             label: 'About Me / Bio',      getValue: (p: any) => p.bio },
    { key: 'healthCondition', label: 'Health Conditions',   getValue: (p: any) => p.healthInfo || p.pre_existing_conditions || p.healthCondition },
  ] : [
    { key: 'bio',             label: 'About Me / Bio',      getValue: (p: any) => p.bio },
  ];
  const missingOptionalFields = OPTIONAL_PROFILE_FIELDS.filter(
    f => !f.getValue(userProfile) || String(f.getValue(userProfile)).trim() === ''
  );

  const handleSaveProfile = () => {
    if (editedName.trim()) {
      updateProfileInfo(
        editedName.trim(),
        editedProfession.trim(),
        editedEducation.trim(),
        editedLocation.trim(),
        userProfile.lookingFor,
        userProfile.interests,
        userProfile.regionalPreference,
        editedBio.trim()
      );
    }
    setIsEditingProfile(false);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadUserProfilePhoto(e.target.files[0]);
    }
  };

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (isConfirmed) {
      try {
        await deleteAccount();
        navigate('/');
      } catch (e) {
        console.error("Failed to delete account:", e);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      await new Promise(res => setTimeout(res, 700));
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      navigate('/splash');
    }
  };



  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto'
      }}
    >
      {isLoggingOut && <LogoutLoadingOverlay />}

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
          padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 16px 20px',
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
          onClick={handleLogout}
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
            alignItems: isEditingProfile ? 'flex-start' : 'center',
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
                color: '#0B0B0E',
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
            {isEditingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  placeholder="Name"
                  style={{
                    background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0B0B0E',
                    border: '1.5px solid var(--accent-amber)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: themeMode === 'LIGHT' ? '#0B0B0E' : '#FFFFFF',
                    fontSize: '1rem',
                    fontWeight: 700,
                    width: '100%',
                    outline: 'none'
                  }}
                  autoFocus
                />
                <input
                  type="text"
                  value={editedProfession}
                  onChange={e => setEditedProfession(e.target.value)}
                  placeholder="Profession"
                  style={{
                    background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0B0B0E',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: themeMode === 'LIGHT' ? '#0B0B0E' : '#FFFFFF',
                    fontSize: '0.9rem',
                    width: '100%',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  value={editedEducation}
                  onChange={e => setEditedEducation(e.target.value)}
                  placeholder="Education"
                  style={{
                    background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0B0B0E',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: themeMode === 'LIGHT' ? '#0B0B0E' : '#FFFFFF',
                    fontSize: '0.9rem',
                    width: '100%',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  value={editedLocation}
                  onChange={e => setEditedLocation(e.target.value)}
                  placeholder="Location"
                  style={{
                    background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0B0B0E',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: themeMode === 'LIGHT' ? '#0B0B0E' : '#FFFFFF',
                    fontSize: '0.9rem',
                    width: '100%',
                    outline: 'none'
                  }}
                />
                <textarea
                  value={editedBio}
                  onChange={e => setEditedBio(e.target.value)}
                  placeholder="Write a short bio or 'Voice Note' text here..."
                  style={{
                    background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0B0B0E',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: themeMode === 'LIGHT' ? '#0B0B0E' : '#FFFFFF',
                    fontSize: '0.9rem',
                    width: '100%',
                    minHeight: '60px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
                <button
                  onClick={handleSaveProfile}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'var(--accent-amber)',
                    color: '#0B0B0E',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  Save Profile
                </button>
              </div>
            ) : (
              <>
                <h2 className="heading-font" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  {userProfile.name}, {userProfile.age}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
                  {userProfile.profession}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {(userProfile.higherEducation || userProfile.education)} • {userProfile.location}
                </p>
              </>
            )}
          </div>

          {!isEditingProfile && (
            <button
              onClick={() => {
                setEditedName(userProfile.name);
                setEditedProfession(userProfile.profession);
                setEditedEducation(userProfile.higherEducation || userProfile.education);
                setEditedLocation(userProfile.location);
                setEditedBio(userProfile.bio || '');
                setIsEditingProfile(true);
              }}
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
              title="Edit Profile"
            >
              <Edit size={18} />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            if (userProfile.intent === 'Marriage') navigate('/marriage-onboarding');
            else navigate('/onboarding-typeform');
          }}
          style={{
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid var(--accent-amber)',
            color: 'var(--accent-amber-light)',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Edit size={18} />
          Edit Full Profile (Re-take Onboarding)
        </button>

        {/* Optional Fields Nudge Card */}
        {missingOptionalFields.length > 0 && (
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'rgba(245, 158, 11, 0.07)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles size={16} color="var(--accent-amber)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-amber-light)' }}>
                Boost Your Visibility
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0 0 12px' }}>
              Fill these optional fields to appear in more searches &amp; get better matches
            </p>
            {/* Missing field pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {missingOptionalFields.map(f => (
                <span key={f.key} style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: 'var(--accent-amber-light)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  + {f.label}
                </span>
              ))}
            </div>
            <button
              onClick={() => {
                if (userProfile.intent === 'Marriage') navigate('/marriage-onboarding');
                else navigate('/onboarding-typeform');
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber-light)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Fill Now →
            </button>
          </div>
        )}

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
                onClick={() => openChaanbean()}
              />
              <span style={{ fontSize: '0.75rem', color: '#4ADE80', fontWeight: 600 }}>DigiLocker Verified</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <VerificationBadge
                type={VerificationType.POLICE}
                isVerified={userProfile.policeVerified}
                onClick={() => openChaanbean()}
              />
              {userProfile.policeVerified ? (
                <span style={{ fontSize: '0.75rem', color: '#4ADE80', fontWeight: 600 }}>Clear Record</span>
              ) : (
                <button
                  onClick={() => openChaanbean()}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: 'var(--accent-amber)',
                    border: 'none',
                    color: '#0B0B0E',
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
                onClick={() => openChaanbean()}
              />
            </div>
          </div>
        </div>

        {/* Ancestral 4-Gotra Lineage Section */}
        {userProfile.intent === 'Marriage' && (
          <div
            style={{
              padding: '20px',
              borderRadius: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Landmark size={16} style={{ color: 'var(--accent-gold)' }} /> Ancestral Gotra Lineage (4 Gotras)
              </h3>
              {(userProfile.religion || userProfile.caste) && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber-light)', background: 'rgba(245, 158, 11, 0.12)', padding: '4px 10px', borderRadius: '8px' }}>
                  {[userProfile.religion, userProfile.caste, userProfile.subCaste].filter(Boolean).join(' • ')}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Father's Father (Main)</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F3F4F6' }}>{userProfile.gotra || 'Not Specified'}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Father's Mother</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F3F4F6' }}>{userProfile.fatherMotherGotra || 'Not Specified'}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Mother's Father</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F3F4F6' }}>{userProfile.motherFatherGotra || 'Not Specified'}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Mother's Mother</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F3F4F6' }}>{userProfile.motherMotherGotra || 'Not Specified'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Health & Lifestyle Section */}
        <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} style={{ color: 'var(--accent-gold)' }} /> Health &amp; Lifestyle
            </h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: userProfile.healthCondition ? '12px' : '0' }}>
            {userProfile.diet && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', fontSize: '0.8rem', color: '#86efac' }}>
                <Utensils size={13} /> {userProfile.diet}
              </span>
            )}
            {userProfile.alcohol && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', fontSize: '0.8rem', color: '#fde68a' }}>
                <Wine size={13} /> Alcohol: {userProfile.alcohol}
              </span>
            )}
            {userProfile.smoking && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.25)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <Cigarette size={13} /> Smoking: {userProfile.smoking}
              </span>
            )}
            {/* Health Status Pill */}
            {(() => {
              const statusText = (userProfile.healthStatus || '').trim();
              const lower = statusText.toLowerCase();
              let statusLabel = 'Not Disclosed';
              let sBg = 'rgba(59, 130, 246, 0.12)';
              let sBorder = 'rgba(59, 130, 246, 0.3)';
              let sColor = '#93c5fd';

              if (lower.includes('private') || lower.includes('inquiry')) {
                statusLabel = 'Disclosed Privately';
                sBg = 'rgba(245, 158, 11, 0.15)';
                sBorder = 'rgba(245, 158, 11, 0.3)';
                sColor = '#fde68a';
              } else if (lower.includes('excellent')) {
                statusLabel = 'Excellent';
                sBg = 'rgba(34, 197, 94, 0.12)';
                sBorder = 'rgba(34, 197, 94, 0.3)';
                sColor = '#86efac';
              } else if (lower === 'good') {
                statusLabel = 'Good';
              } else if (statusText) {
                statusLabel = statusText;
              }

              return (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: sBg,
                  border: `1px solid ${sBorder}`,
                  fontSize: '0.8rem',
                  color: sColor
                }}>
                  <Lock size={13} /> Health: {statusLabel}
                </span>
              );
            })()}

            {/* Disease / Pre-existing Condition Pill — always visible */}
            {(() => {
              const condText = (userProfile.healthCondition || '').trim();
              const hasText = condText.length > 0;
              const displayLabel = hasText ? condText : 'None';

              return (
                <>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: hasText ? 'rgba(239, 68, 68, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                    border: hasText ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(100, 116, 139, 0.25)',
                    fontSize: '0.8rem',
                    color: hasText ? '#fca5a5' : '#94a3b8'
                  }}>
                    <ShieldAlert size={13} /> Disease: {displayLabel}
                  </span>
                  {hasText && (
                    <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pre-existing Disease / Medical Condition Disclosure</span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {condText}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
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

        {/* Personal Values & Vision (Questionnaire) */}
        {userProfile.marriageQuestionnaire && Object.keys(userProfile.marriageQuestionnaire).length > 0 && (
          <div
            style={{
              padding: '16px',
              borderRadius: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px'
            }}
          >
            <h3 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>
              Personal Values & Vision
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'q11', text: 'Raising children religiously' },
                { id: 'q12', text: 'Hanging out with friends after marriage' },
                { id: 'q13', text: 'How would you like to celebrate your first wedding anniversary?' }
              ].map(q => {
                const answer = userProfile.marriageQuestionnaire?.[q.id];
                if (!answer) return null;
                return (
                  <div key={q.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {q.text}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {answer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Astrology Edit Link */}
        <button
          onClick={() => navigate('/onboarding-astrology')}
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

        {/* Delete Account */}
        <button
          onClick={handleDeleteAccount}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          Delete Account
        </button>
      </main>

      <AstraBottomNavigation />
    </div>
  );
};
