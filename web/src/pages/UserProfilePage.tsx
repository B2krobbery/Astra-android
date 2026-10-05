import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { supabase } from '../lib/supabase';
import { AstraBottomNavigation } from '../components/AstraBottomNavigation';
import { CandidateAvatar } from '../components/CandidateAvatar';
import { VerificationBadge } from '../components/VerificationBadge';
import {
  VerificationType,
  ThemeMode,
  AppLanguage,
  FamilyMarriageContributions,
  FAMILY_CONTRIBUTION_OPTIONS,
  GroomMarriageBudgetPreferences,
  GROOM_MARRIAGE_BUDGET_RANGES,
  WEDDING_EXPENSE_COVERAGE_OPTIONS,
  WEDDING_ARRANGEMENTS_EXPECTED_OPTIONS
} from '../types';
import { Edit, Moon, Sun, Monitor, ShieldCheck, Sparkles, LogOut, Share2, Bot, Camera, Globe, Landmark, Activity, Utensils, Wine, Cigarette, Lock, ShieldAlert, Trash2, AlertCircle, Gift, EyeOff, Check, X, Wallet } from 'lucide-react';

import { UserVoiceRecorderCard } from '../components/UserVoiceRecorderCard';

const LogoutLoadingOverlay: React.FC = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(10, 7, 20, 0.7)',
    backdropFilter: 'var(--glass-backdrop)',
    WebkitBackdropFilter: 'var(--glass-backdrop)',
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
    profilePhotos,
    uploadUserProfilePhotos,
    setPrimaryProfilePhoto,
    deleteProfilePhoto,
    updateProfileInfo,
    updateFamilyContributions,
    updateGroomBudgetPreferences,
    deleteAccount,
    signOut,
    language,
    setLanguage,
    t
  } = useAstra();

  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = React.useState(false);
  const [photoUploadError, setPhotoUploadError] = React.useState('');
  const [editedName, setEditedName] = React.useState(userProfile.name);
  const [editedProfession, setEditedProfession] = React.useState(userProfile.profession);
  const [editedEducation, setEditedEducation] = React.useState(userProfile.higherEducation || userProfile.education);
  const [editedLocation, setEditedLocation] = React.useState(userProfile.location);
  const [editedBio, setEditedBio] = React.useState(userProfile.bio || '');

  const [isEditingContributions, setIsEditingContributions] = React.useState(false);
  const [tempContributions, setTempContributions] = React.useState<FamilyMarriageContributions>(() => {
    const fc = userProfile.familyContributions || (userProfile.marriageQuestionnaire as any)?.family_contributions;
    return fc || { contributions: [], notes: '', privacy: 'MATCHES_ONLY' };
  });
  const [isSavingContributions, setIsSavingContributions] = React.useState(false);

  React.useEffect(() => {
    const fc = userProfile.familyContributions || (userProfile.marriageQuestionnaire as any)?.family_contributions;
    if (fc) {
      setTempContributions(fc);
    }
  }, [userProfile.familyContributions, userProfile.marriageQuestionnaire]);

  const handleSaveContributions = async () => {
    setIsSavingContributions(true);
    try {
      await updateFamilyContributions(tempContributions);
      setIsEditingContributions(false);
    } catch (err) {
      console.error('Failed to update contributions:', err);
    } finally {
      setIsSavingContributions(false);
    }
  };

  const [isEditingGroomBudget, setIsEditingGroomBudget] = React.useState(false);
  const [tempGroomBudget, setTempGroomBudget] = React.useState<GroomMarriageBudgetPreferences>(() => {
    const gb = userProfile.groomBudgetPreferences || (userProfile.marriageQuestionnaire as any)?.groom_budget_preferences;
    return gb || {
      expectedBudget: '',
      expenseCoveredBy: '',
      weddingArrangementsExpected: [],
      familyExpectationsNotes: '',
      financialExpectationsOtherFamily: '',
      privacy: 'MATCHES_ONLY'
    };
  });
  const [isSavingGroomBudget, setIsSavingGroomBudget] = React.useState(false);

  React.useEffect(() => {
    const gb = userProfile.groomBudgetPreferences || (userProfile.marriageQuestionnaire as any)?.groom_budget_preferences;
    if (gb) {
      setTempGroomBudget(gb);
    }
  }, [userProfile.groomBudgetPreferences, userProfile.marriageQuestionnaire]);

  const handleSaveGroomBudget = async () => {
    setIsSavingGroomBudget(true);
    try {
      await updateGroomBudgetPreferences(tempGroomBudget);
      setIsEditingGroomBudget(false);
    } catch (err) {
      console.error('Failed to update groom budget preferences:', err);
    } finally {
      setIsSavingGroomBudget(false);
    }
  };

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

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setIsUploadingPhotos(true);
    setPhotoUploadError('');
    try {
      const result = await uploadUserProfilePhotos(files);
      if (result.errors.length > 0) {
        setPhotoUploadError(result.errors.join(' '));
      }
    } catch (err: any) {
      setPhotoUploadError(err?.message || 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploadingPhotos(false);
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
      await signOut();
      await new Promise(res => setTimeout(res, 600));
      navigate('/', { replace: true });
    } catch (e: any) {
      console.error("Sign out error:", e);
      alert(e?.message || "Sign out failed. Please try again.");
      setIsLoggingOut(false);
    }
  };



  return (
    <div
      className="glass-page profile-glass-page"
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
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
      />

      {/* Top Bar */}
      <header
        className="mobile-only"
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

      <main style={{ padding: '24px 20px 48px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
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

        {/* Compact photo gallery with primary/set/delete controls */}
        <div
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Camera size={16} color="var(--accent-amber)" />
            <h3 className="heading-font" style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
              Your Photos
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            {[0, 1, 2, 3, 4].map((slotIdx) => {
              const photo = profilePhotos[slotIdx];
              if (photo) {
                return (
                  <div key={photo.id} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: '10px', overflow: 'hidden', border: photo.isPrimary ? '2px solid var(--accent-amber)' : '1px solid var(--border-color)' }}>
                    <img src={photo.url} alt={`Photo ${slotIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {photo.isPrimary && (
                      <span style={{ position: 'absolute', top: 3, left: 3, background: 'var(--accent-amber)', color: '#0B0B0E', fontSize: '0.55rem', fontWeight: 800, padding: '1px 5px', borderRadius: '5px' }}>
                        Primary
                      </span>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', gap: '3px', padding: '3px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                      {!photo.isPrimary && (
                        <button
                          onClick={() => setPrimaryProfilePhoto(photo.id)}
                          style={{ flex: 1, padding: '3px', borderRadius: '5px', background: 'rgba(245, 158, 11, 0.9)', color: '#0B0B0E', border: 'none', fontSize: '0.55rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Make primary
                        </button>
                      )}
                      <button
                        onClick={() => deleteProfilePhoto(photo.id)}
                        style={{ width: 22, height: 20, borderRadius: '5px', background: 'rgba(239, 68, 68, 0.9)', color: '#FFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Delete photo"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={`empty-${slotIdx}`}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '10px', border: '2px dashed var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <Camera size={18} color="var(--accent-amber)" />
                </div>
              );
            })}
          </div>

          {isUploadingPhotos && (
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber-light)', marginBottom: '6px' }}>Uploading photos…</div>
          )}
          {photoUploadError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#FDA4AF', padding: '6px 8px', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px' }}>
              <AlertCircle size={13} color="#F43F5E" />
              {photoUploadError}
            </div>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Upload up to 5 photos (JPEG, PNG, or WebP; 5 MB each).</span>
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

        {/* Family Marriage Contributions (Bride Only) */}
        {userProfile.gender === 'Female' && (
          <div
            style={{
              padding: '18px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, var(--bg-card) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold, #D4AF37)',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }}>
                  <Gift size={16} />
                </div>
                <div>
                  <h3 className="heading-font" style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#FFF' }}>
                    Family Marriage Contributions
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold, #D4AF37)' }}>
                    Optional &amp; Respectful Communication
                  </span>
                </div>
              </div>

              {!isEditingContributions ? (
                <button
                  type="button"
                  onClick={() => setIsEditingContributions(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    color: 'var(--accent-gold, #D4AF37)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Edit size={12} /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const fc = userProfile.familyContributions || (userProfile.marriageQuestionnaire as any)?.family_contributions;
                      setTempContributions(fc || { contributions: [], notes: '', privacy: 'MATCHES_ONLY' });
                      setIsEditingContributions(false);
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveContributions}
                    disabled={isSavingContributions}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: 'var(--accent-gold, #D4AF37)',
                      border: 'none',
                      color: '#0B0B0E',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: isSavingContributions ? 'wait' : 'pointer'
                    }}
                  >
                    {isSavingContributions ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {!isEditingContributions ? (
              <div>
                {/* Privacy Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  {tempContributions.privacy === 'PUBLIC' ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60A5FA',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      <Globe size={11} /> Visible to All Candidates
                    </span>
                  ) : tempContributions.privacy === 'PRIVATE' ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: 'rgba(148, 163, 184, 0.12)',
                      color: '#94A3B8',
                      border: '1px solid rgba(148, 163, 184, 0.25)'
                    }}>
                      <EyeOff size={11} /> Private (Only visible to you)
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--accent-gold, #D4AF37)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                      <Lock size={11} /> Visible to Mutual Matches Only
                    </span>
                  )}
                </div>

                {/* Selected Contributions */}
                {tempContributions.contributions && tempContributions.contributions.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {tempContributions.contributions.map((c: string) => (
                      <span
                        key={c}
                        style={{
                          fontSize: '0.78rem',
                          padding: '5px 10px',
                          borderRadius: '12px',
                          background: 'rgba(212, 175, 55, 0.12)',
                          color: '#FDE047',
                          border: '1px solid rgba(212, 175, 55, 0.3)'
                        }}
                      >
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic', margin: '0 0 10px 0' }}>
                    No specific contributions selected yet. Tap &apos;Edit&apos; to share your family&apos;s preferences.
                  </p>
                )}

                {/* Family Notes */}
                {tempContributions.notes && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '10px'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold, #D4AF37)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Family Notes:
                    </span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                      {tempContributions.notes}
                    </p>
                  </div>
                )}

                <p style={{ fontSize: '0.7rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  ✨ Strictly voluntary communication to align wedding arrangements with mutual respect and transparency. Never a dowry or financial requirement.
                </p>
              </div>
            ) : (
              /* Inline Edit Mode */
              <div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px', lineHeight: 1.4 }}>
                  Select the wedding arrangements or logistics your family is happy to contribute toward:
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {FAMILY_CONTRIBUTION_OPTIONS.map((opt) => {
                    const isSelected = tempContributions.contributions?.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          let next: string[];
                          if (opt === 'No specific contribution / Prefer to discuss') {
                            next = isSelected ? [] : ['No specific contribution / Prefer to discuss'];
                          } else {
                            const withoutNone = (tempContributions.contributions || []).filter(x => x !== 'No specific contribution / Prefer to discuss');
                            next = isSelected ? withoutNone.filter(x => x !== opt) : [...withoutNone, opt];
                          }
                          setTempContributions(prev => ({ ...prev, contributions: next }));
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '16px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#FDE047' : '#94A3B8',
                          border: isSelected ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{opt}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '4px' }}>
                    Family Notes &amp; Expectations (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., We would love to host a warm traditional wedding reception and welcome discussing event arrangements mutually..."
                    value={tempContributions.notes || ''}
                    onChange={e => setTempContributions(prev => ({ ...prev, notes: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFF',
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '6px' }}>
                    Privacy Control
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { key: 'MATCHES_ONLY', label: 'Matches', icon: Lock },
                      { key: 'PUBLIC', label: 'Public', icon: Globe },
                      { key: 'PRIVATE', label: 'Private', icon: EyeOff },
                    ].map(item => {
                      const isChosen = (tempContributions.privacy || 'MATCHES_ONLY') === item.key;
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setTempContributions(prev => ({ ...prev, privacy: item.key as any }))}
                          style={{
                            padding: '8px 6px',
                            borderRadius: '10px',
                            background: isChosen ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                            border: isChosen ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <IconComp size={13} color={isChosen ? '#FDE047' : '#94A3B8'} />
                          <span style={{ fontSize: '0.7rem', color: isChosen ? '#FDE047' : '#E2E8F0', fontWeight: 600 }}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Marriage Budget & Family Preferences (Groom Only) */}
        {userProfile.gender === 'Male' && (
          <div
            style={{
              padding: '18px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, var(--bg-card) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold, #D4AF37)',
                  border: '1px solid rgba(212, 175, 55, 0.3)'
                }}>
                  <Wallet size={16} />
                </div>
                <div>
                  <h3 className="heading-font" style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#FFF' }}>
                    Marriage Budget &amp; Family Preferences
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold, #D4AF37)' }}>
                    Optional &amp; Respectful Communication
                  </span>
                </div>
              </div>

              {!isEditingGroomBudget ? (
                <button
                  type="button"
                  onClick={() => setIsEditingGroomBudget(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    color: 'var(--accent-gold, #D4AF37)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Edit size={12} /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const gb = userProfile.groomBudgetPreferences || (userProfile.marriageQuestionnaire as any)?.groom_budget_preferences;
                      setTempGroomBudget(gb || {
                        expectedBudget: '',
                        expenseCoveredBy: '',
                        weddingArrangementsExpected: [],
                        familyExpectationsNotes: '',
                        financialExpectationsOtherFamily: '',
                        privacy: 'MATCHES_ONLY'
                      });
                      setIsEditingGroomBudget(false);
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGroomBudget}
                    disabled={isSavingGroomBudget}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: 'var(--accent-gold, #D4AF37)',
                      border: 'none',
                      color: '#0B0B0E',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: isSavingGroomBudget ? 'wait' : 'pointer'
                    }}
                  >
                    {isSavingGroomBudget ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {!isEditingGroomBudget ? (
              <div>
                {/* Privacy Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  {tempGroomBudget.privacy === 'PUBLIC' ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60A5FA',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      <Globe size={11} /> Visible to All Candidates
                    </span>
                  ) : tempGroomBudget.privacy === 'PRIVATE' ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: 'rgba(148, 163, 184, 0.12)',
                      color: '#94A3B8',
                      border: '1px solid rgba(148, 163, 184, 0.25)'
                    }}>
                      <EyeOff size={11} /> Private (Only visible to you)
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--accent-gold, #D4AF37)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                      <Lock size={11} /> Visible to Mutual Matches Only
                    </span>
                  )}
                </div>

                {/* Key Summary Cards: Budget & Expense Coverage */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                      Expected Budget
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: tempGroomBudget.expectedBudget ? '#FDE047' : '#94A3B8' }}>
                      {tempGroomBudget.expectedBudget || 'Not specified'}
                    </span>
                  </div>

                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '3px' }}>
                      Expense Coverage
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: tempGroomBudget.expenseCoveredBy ? '#E2E8F0' : '#94A3B8' }}>
                      {tempGroomBudget.expenseCoveredBy || 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* Expected Arrangements */}
                {tempGroomBudget.weddingArrangementsExpected && tempGroomBudget.weddingArrangementsExpected.length > 0 ? (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold, #D4AF37)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Arrangements Expected:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {tempGroomBudget.weddingArrangementsExpected.map((arr: string) => (
                        <span
                          key={arr}
                          style={{
                            fontSize: '0.78rem',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: 'rgba(212, 175, 55, 0.12)',
                            color: '#FDE047',
                            border: '1px solid rgba(212, 175, 55, 0.3)'
                          }}
                        >
                          ✓ {arr}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Family Notes */}
                {tempGroomBudget.familyExpectationsNotes && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '10px'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold, #D4AF37)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Family Expectations &amp; Preferences:
                    </span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                      {tempGroomBudget.familyExpectationsNotes}
                    </p>
                  </div>
                )}

                {/* Financial Expectations from other family */}
                {tempGroomBudget.financialExpectationsOtherFamily && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '10px'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold, #D4AF37)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Expectations from the Other Family:
                    </span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                      {tempGroomBudget.financialExpectationsOtherFamily}
                    </p>
                  </div>
                )}

                {!tempGroomBudget.expectedBudget && !tempGroomBudget.expenseCoveredBy && (!tempGroomBudget.weddingArrangementsExpected || tempGroomBudget.weddingArrangementsExpected.length === 0) && !tempGroomBudget.familyExpectationsNotes && !tempGroomBudget.financialExpectationsOtherFamily && (
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic', margin: '0 0 10px 0' }}>
                    No budget preferences set yet. Tap &apos;Edit&apos; to share your wedding preferences.
                  </p>
                )}

                <p style={{ fontSize: '0.7rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  ✨ Strictly voluntary to align family expectations smoothly. Astra promotes dignified unions free of financial coercion or dowry.
                </p>
              </div>
            ) : (
              /* Inline Edit Mode */
              <div>
                {/* Expected Budget */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '6px' }}>
                    Expected Marriage Budget (Optional)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {GROOM_MARRIAGE_BUDGET_RANGES.map((b) => {
                      const isSelected = tempGroomBudget.expectedBudget === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setTempGroomBudget(prev => ({
                            ...prev,
                            expectedBudget: isSelected ? '' : b
                          }))}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '16px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            color: isSelected ? '#FDE047' : '#94A3B8',
                            border: isSelected ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? '✓ ' : ''}{b}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Who covers expenses */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '6px' }}>
                    Who Will Primarily Cover Wedding Expenses? (Optional)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {WEDDING_EXPENSE_COVERAGE_OPTIONS.map((cov) => {
                      const isSelected = tempGroomBudget.expenseCoveredBy === cov;
                      return (
                        <button
                          key={cov}
                          type="button"
                          onClick={() => setTempGroomBudget(prev => ({
                            ...prev,
                            expenseCoveredBy: isSelected ? '' : cov
                          }))}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '16px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            color: isSelected ? '#FDE047' : '#94A3B8',
                            border: isSelected ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? '✓ ' : ''}{cov}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wedding arrangements expected */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '6px' }}>
                    Wedding Arrangements Expected (Select all that apply)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {WEDDING_ARRANGEMENTS_EXPECTED_OPTIONS.map((arr) => {
                      const isSelected = tempGroomBudget.weddingArrangementsExpected?.includes(arr);
                      return (
                        <button
                          key={arr}
                          type="button"
                          onClick={() => {
                            let next: string[];
                            const current = tempGroomBudget.weddingArrangementsExpected || [];
                            if (arr === 'Open to discuss mutually') {
                              next = isSelected ? [] : ['Open to discuss mutually'];
                            } else {
                              const withoutOpen = current.filter(x => x !== 'Open to discuss mutually');
                              next = isSelected ? withoutOpen.filter(x => x !== arr) : [...withoutOpen, arr];
                            }
                            setTempGroomBudget(prev => ({ ...prev, weddingArrangementsExpected: next }));
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '16px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            color: isSelected ? '#FDE047' : '#94A3B8',
                            border: isSelected ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}{arr}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Family expectations / preferences */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '4px' }}>
                    Family Expectations &amp; Preferences (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., We value a warm, intimate ceremony celebrating cultural traditions with mutual simplicity and happiness."
                    value={tempGroomBudget.familyExpectationsNotes || ''}
                    onChange={e => setTempGroomBudget(prev => ({ ...prev, familyExpectationsNotes: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFF',
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Financial expectations from the other family */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '4px' }}>
                    Financial Expectations from the Other Family (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., We expect zero dowry or mandatory gifts. Any sharing of venue or celebration expenses is strictly voluntary."
                    value={tempGroomBudget.financialExpectationsOtherFamily || ''}
                    onChange={e => setTempGroomBudget(prev => ({ ...prev, financialExpectationsOtherFamily: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFF',
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Privacy Control */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#E2E8F0', fontWeight: 600, marginBottom: '6px' }}>
                    Privacy Control
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { key: 'MATCHES_ONLY', label: 'Matches', icon: Lock },
                      { key: 'PUBLIC', label: 'Public', icon: Globe },
                      { key: 'PRIVATE', label: 'Private', icon: EyeOff },
                    ].map(item => {
                      const isChosen = (tempGroomBudget.privacy || 'MATCHES_ONLY') === item.key;
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setTempGroomBudget(prev => ({ ...prev, privacy: item.key as any }))}
                          style={{
                            padding: '8px 6px',
                            borderRadius: '10px',
                            background: isChosen ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                            border: isChosen ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <IconComp size={13} color={isChosen ? '#FDE047' : '#94A3B8'} />
                          <span style={{ fontSize: '0.7rem', color: isChosen ? '#FDE047' : '#E2E8F0', fontWeight: 600 }}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
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
