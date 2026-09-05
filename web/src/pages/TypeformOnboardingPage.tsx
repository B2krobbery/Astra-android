import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { ArrowLeft, ArrowRight, User, Briefcase, GraduationCap, MapPin, Calendar, Clock, Camera, Globe } from 'lucide-react';
import { AstrologyEngine } from '../data/astrologyEngine';
import { RegionalPreference } from '../types';
import { supabase } from '../lib/supabase';
export const TypeformOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userProfile, updateProfileInfo, updateBirthDetails, uploadUserProfilePhoto, language, setLanguage, t, updateDatingPreferences } = useAstra();

  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Form State
  const [name, setName] = useState(userProfile.name || '');
  const [gender, setGender] = useState(userProfile.gender || 'Male');
  const [profession, setProfession] = useState(userProfile.profession || '');
  const [education, setEducation] = useState(userProfile.higherEducation || userProfile.education || '');
  const [city, setCity] = useState(userProfile.location || '');
  const [regionalPref, setRegionalPref] = useState<RegionalPreference>(userProfile.regionalPreference || 'ALL');
  const [dob, setDob] = useState(userProfile.dateOfBirth || '');
  const [birthTime, setBirthTime] = useState(userProfile.birthTime || '');
  const [birthCity, setBirthCity] = useState(userProfile.birthLocation || '');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userProfile.lookingFor || []);
  const [preferredEducation, setPreferredEducation] = useState(userProfile.partnerPreferences?.preferredEducation || 'Any');
  const [preferredLocation, setPreferredLocation] = useState(userProfile.partnerPreferences?.preferredLocation || 'Any');

  const previewNakshatra = AstrologyEngine.calculateNakshatra(dob, birthTime, birthCity);
  const previewRashi = AstrologyEngine.calculateRashi(dob, birthTime, birthCity);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadUserProfilePhoto(e.target.files[0]);
    }
  };

  const saveToDatabase = async (isFinal: boolean) => {
    try {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) throw new Error("No user session");

      const updates: any = {
        display_name: name || null,
        gender: gender || null,
        profession: profession || null,
        higher_education: education || null,
        location: city || null,
        birth_location: birthCity || null,
        date_of_birth: dob || null,
        looking_for: selectedGoals,
        updated_at: new Date().toISOString()
      };
      
      if (isFinal) {
        updates.onboarding_completed = true;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Update private profiles table for sensitive birth data
      await supabase
        .from('private_profiles')
        .upsert({ id: user.id, birth_time: birthTime || null, updated_at: new Date().toISOString() });

      // Save match preferences
      await supabase
        .from('preferences')
        .upsert({ 
          user_id: user.id, 
          intent: userProfile?.intent || 'Dating', // Preserve intent if already set
          gender_preference: gender === 'Male' ? 'Female' : gender === 'Female' ? 'Male' : 'Everyone',
          preferred_religion: userProfile?.partnerPreferences?.preferredReligion === 'Any' ? null : userProfile?.partnerPreferences?.preferredReligion || null,
          preferred_caste: userProfile?.partnerPreferences?.preferredCaste === 'Any' ? null : userProfile?.partnerPreferences?.preferredCaste || null,
          preferred_education: preferredEducation === 'Any' ? null : preferredEducation,
          preferred_location: preferredLocation === 'Any' ? null : preferredLocation,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    } catch (error) {
      console.error('Error saving profile:', error);
      if (isFinal) {
        alert('Failed to save profile. Please try again.');
      }
      throw error;
    }
  };

  const nextStep = async () => {
    // Save locally
    updateProfileInfo(name, profession, education, city, selectedGoals, userProfile.interests, regionalPref);
    updateBirthDetails(dob, birthTime, birthCity);
    updateDatingPreferences(preferredEducation, preferredLocation);
    
    // Save to DB incrementally
    try {
      await saveToDatabase(false);
    } catch (e) {
      // Ignore intermediate save errors
    }

    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
    else navigate('/splash');
  };

  const handleComplete = async () => {
    try {
      await saveToDatabase(true);
      window.location.href = '/discover';
    } catch (error) {
      // Error handled in saveToDatabase
    }
  };

  const getStageTheme = () => {
    switch (step) {
      case 1:
      case 2:
        return 'linear-gradient(135deg, #1A1432 0%, #0F0C1B 100%)';
      case 3:
      case 4:
        return 'linear-gradient(135deg, #161B33 0%, #0F0C1B 100%)';
      case 5:
      case 6:
      case 7:
        return 'linear-gradient(135deg, #2A0E1A 0%, #0F0C1B 100%)';
      default:
        return '#0F0C1B';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: getStageTheme(),
        color: '#F8FAFC',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'background 0.5s ease',
        position: 'relative',
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

      {/* Top Header & Progress Bar */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button
            onClick={prevStep}
            style={{
              background: 'none',
              border: 'none',
              color: '#F8FAFC',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={18} color="#F8FAFC" /> Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Language Toggle Button */}
            <button
              onClick={() => setLanguage(language === 'EN' ? 'ML' : language === 'ML' ? 'HI' : 'EN')}
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid #4F46E5',
                color: '#A5B4FC',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Globe size={12} /> {language === 'EN' ? 'മലയാളം' : language === 'ML' ? 'हिंदी' : 'English'}
            </button>

            <span style={{ fontSize: '0.75rem', color: '#A5B4FC', fontWeight: 800 }}>
              Step {step} of {totalSteps}
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${(step / totalSteps) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Main Question Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '32px 0', position: 'relative', zIndex: 5 }}>
        {/* STEP 1: Name & Identity */}
        {step === 1 && (
          <div style={{ animation: 'floatOrb 0.3s ease-out' }}>
            <span style={{ fontSize: '0.8rem', color: '#A5B4FC', fontWeight: 600, textTransform: 'uppercase' }}>
              Personal Identity
            </span>
            <h2 className="heading-font" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', marginBottom: '16px', color: '#FFF' }}>
              {t('question_1')}
            </h2>

            <div style={{ position: 'relative' }}>
              <User size={20} color="#94A3B8" style={{ position: 'absolute', left: 16, top: 16 }} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '16px',
                  background: 'rgba(30, 24, 54, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFF',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Gender & Identity */}
        {step === 2 && (
          <div style={{ animation: 'floatOrb 0.3s ease-out' }}>
            <span style={{ fontSize: '0.8rem', color: '#A5B4FC', fontWeight: 600, textTransform: 'uppercase' }}>
              Identity & Orientation
            </span>
            <h2 className="heading-font" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', marginBottom: '16px', color: '#FFF' }}>
              {t('question_2')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Male', 'Female', 'Non-Binary / Other'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setGender(opt)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '16px',
                    border: gender === opt ? '2px solid #4F46E5' : '1px solid rgba(255, 255, 255, 0.15)',
                    background: gender === opt ? 'rgba(79, 70, 229, 0.2)' : 'rgba(30, 24, 54, 0.95)',
                    color: gender === opt ? '#A5B4FC' : '#FFF',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Profession & Education */}
        {step === 3 && (
          <div style={{ animation: 'floatOrb 0.3s ease-out' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', fontWeight: 600, textTransform: 'uppercase' }}>
              Career & Background
            </span>
            <h2 className="heading-font" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', marginBottom: '16px', color: '#FFF' }}>
              What do you do for work and study?
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>{t('question_3')}</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <Briefcase size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} />
                  <input
                    type="text"
                    value={profession}
                    onChange={e => setProfession(e.target.value)}
                    placeholder="e.g. Senior Product Designer"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '16px',
                      background: 'rgba(30, 24, 54, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFF'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>{t('question_4')}</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <GraduationCap size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} />
                  <input
                    type="text"
                    value={education}
                    onChange={e => setEducation(e.target.value)}
                    placeholder="e.g. IIT Bombay · B.Des"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '16px',
                      background: 'rgba(30, 24, 54, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFF'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Where do you currently live?</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <MapPin size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} />
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '16px',
                      background: 'rgba(30, 24, 54, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFF'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Regional Preferences */}
        {step === 4 && (
          <div style={{ animation: 'floatOrb 0.3s ease-out' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', fontWeight: 600, textTransform: 'uppercase' }}>
              Regional & Community Filter
            </span>
            <h2 className="heading-font" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', marginBottom: '16px', color: '#FFF' }}>
              {t('question_5')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'ALL', label: t('filter_all') },
                { key: 'KERALA', label: t('filter_kerala') },
                { key: 'NORTH_INDIA', label: t('filter_north') },
                { key: 'WEST_INDIA', label: t('filter_west') },
                { key: 'NRI', label: t('filter_nri') }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRegionalPref(item.key as any)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '16px',
                    border: regionalPref === item.key ? '2px solid #4F46E5' : '1px solid rgba(255, 255, 255, 0.15)',
                    background: regionalPref === item.key ? 'rgba(79, 70, 229, 0.2)' : 'rgba(30, 24, 54, 0.95)',
                    color: regionalPref === item.key ? '#A5B4FC' : '#FFF',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Profile Photo Upload */}
        {step === 5 && (
          <div style={{ textAlign: 'center', animation: 'floatOrb 0.3s ease-out' }}>
            <span style={{ fontSize: '0.8rem', color: '#A5B4FC', fontWeight: 600, textTransform: 'uppercase' }}>
              Photo Verification
            </span>
            <h2 className="heading-font" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', marginBottom: '16px', color: '#FFF' }}>
              {t('question_7')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={userProfile.photoUrl}
                  alt="Profile Preview"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #4F46E5',
                    boxShadow: 'var(--shadow-cosmic)'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  border: 'none',
                  color: '#0F0C1B',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Camera size={18} /> {t('btn_upload_photo')}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Relationship Goals */}
        {step === 6 && (
          <div style={{ animation: 'floatOrb 0.3s ease-out' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', fontWeight: 600, textTransform: 'uppercase' }}>
              Intentions & Desires
            </span>
            <h2 className="heading-font" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', marginBottom: '16px', color: '#FFF' }}>
              {t('question_8')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Long-term Relationship with Marriage Intent',
                'Deep Emotional & Spiritual Harmony',
                'Shared Cultural & Family Values',
                'Vedic Astrology & Kundali Compatibility'
              ].map(goal => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => {
                      if (isSelected) setSelectedGoals(prev => prev.filter(g => g !== goal));
                      else setSelectedGoals(prev => [...prev, goal]);
                    }}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #4F46E5' : '1px solid rgba(255, 255, 255, 0.15)',
                      background: isSelected ? 'rgba(79, 70, 229, 0.2)' : 'rgba(30, 24, 54, 0.95)',
                      color: isSelected ? '#A5B4FC' : '#FFF',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: Dating Partner Preferences */}
        {step === 7 && (
          <div style={{ animation: 'floatOrb 0.3s ease-out' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', fontWeight: 600, textTransform: 'uppercase' }}>
              Your Preferences
            </span>
            <h2 className="heading-font" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px', marginBottom: '16px', color: '#FFF' }}>
              Who are you looking for?
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Set your preferences so we can find your perfect match.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '6px', display: 'block' }}>Preferred Education</label>
                <select
                  value={preferredEducation}
                  onChange={e => setPreferredEducation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    background: 'rgba(30, 24, 54, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFF',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="Any">Any Education Level</option>
                  <option value="B.Tech">B.Tech / Engineering</option>
                  <option value="MBA">MBA / Business</option>
                  <option value="MBBS">Medical / MBBS</option>
                  <option value="PhD">PhD / Doctorate</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '6px', display: 'block' }}>Preferred Location</label>
                <select
                  value={preferredLocation}
                  onChange={e => setPreferredLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    background: 'rgba(30, 24, 54, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFF',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="Any">Any Location</option>
                  <option value="Bangalore, IN">Bangalore</option>
                  <option value="Mumbai, IN">Mumbai</option>
                  <option value="Delhi, IN">Delhi</option>
                  <option value="Pune, IN">Pune</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Button */}
      <button
        onClick={nextStep}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '9999px',
          border: 'none',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          color: '#0F0C1B',
          fontWeight: 800,
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-cosmic)',
          position: 'relative',
          zIndex: 5
        }}
      >
        {step === totalSteps ? t('btn_complete') : t('btn_continue')} <ArrowRight size={18} />
      </button>
    </div>
  );
};
