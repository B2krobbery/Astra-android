import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { supabase } from '../lib/supabase';
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
    updateProfileInfo,
    deleteAccount,
    language,
    setLanguage,
    t
  } = useAstra();

  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [editedName, setEditedName] = React.useState(userProfile.name);
  const [editedProfession, setEditedProfession] = React.useState(userProfile.profession);
  const [editedEducation, setEditedEducation] = React.useState(userProfile.education);
  const [editedLocation, setEditedLocation] = React.useState(userProfile.location);
  const [editedBio, setEditedBio] = React.useState(userProfile.bio || '');

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



  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto'
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
          onClick={async () => {
            await supabase.auth.signOut();
            navigate('/splash');
          }}
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
            {isEditingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  placeholder="Name"
                  style={{
                    background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0F0C1B',
                    border: '1.5px solid var(--accent-amber)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: themeMode === 'LIGHT' ? '#0F0C1B' : '#FFFFFF',
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
                    background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0F0C1B',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: themeMode === 'LIGHT' ? '#0F0C1B' : '#FFFFFF',
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
                    background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0F0C1B',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: themeMode === 'LIGHT' ? '#0F0C1B' : '#FFFFFF',
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
                    background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0F0C1B',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: themeMode === 'LIGHT' ? '#0F0C1B' : '#FFFFFF',
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
                    background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0F0C1B',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: themeMode === 'LIGHT' ? '#0F0C1B' : '#FFFFFF',
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
                    color: '#0F0C1B',
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
                  {userProfile.education} • {userProfile.location}
                </p>
              </>
            )}
          </div>

          {!isEditingProfile && (
            <button
              onClick={() => {
                setEditedName(userProfile.name);
                setEditedProfession(userProfile.profession);
                setEditedEducation(userProfile.education);
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
                { id: 'q1', text: 'Future career plans and goals' },
                { id: 'q2', text: 'Work-life balance' },
                { id: 'q3', text: 'Household responsibilities' },
                { id: 'q4', text: 'Finances and investments' },
                { id: 'q5', text: 'Family involvement' },
                { id: 'q6', text: 'Living arrangements' },
                { id: 'q7', text: 'Handling conflicts' },
                { id: 'q8', text: 'Starting a family' },
                { id: 'q9', text: 'Weekends and free time' },
                { id: 'q10', text: 'Most important quality in a partner' }
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
