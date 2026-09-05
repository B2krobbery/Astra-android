import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft, ChevronRight, CheckCircle, Flame, Moon, MapPin, Search } from 'lucide-react';
import { useAstra } from '../context/AstraContext';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';
import { supabase } from '../lib/supabase';
const indianReligions = [{name: 'Hindu'}, {name: 'Muslim'}, {name: 'Christian'}, {name: 'Sikh'}, {name: 'Jain'}, {name: 'Buddhist'}, {name: 'Parsi'}, {name: 'Jewish'}, {name: 'Other'}]; // we'll use this for select options

const SECTIONS = [
  'Basic Info',
  'Location & Origin',
  'Religion & Community',
  'Education & Career',
  'Health & Lifestyle',
  'Family & Marriage',
  'Astrology & Birth',
  'Chemistry & Interests',
  'Partner Preferences',
  'Photo & Privacy',
];

export const MarriageOnboardingPage: React.FC = () => {
  const { userProfile, updateProfileInfo, uploadUserProfilePhoto, uploadVoiceNote } = useAstra();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Basic
  const [name, setName] = useState(userProfile.name || '');
  const [gender, setGender] = useState(userProfile.gender || 'Male');
  const [dateOfBirth, setDateOfBirth] = useState(userProfile.dateOfBirth || '');
  const [height, setHeight] = useState(userProfile.height || '');
  const [bloodGroup, setBloodGroup] = useState(userProfile.bloodGroup || '');
  
  // Location
  const [location, setLocation] = useState(userProfile.location || '');
  const [nativeLocation, setNativeLocation] = useState(userProfile.birthLocation || '');
  const [motherTongue, setMotherTongue] = useState(userProfile.motherTongue || '');
  
  // Religion
  const [religion, setReligion] = useState(userProfile.religion || '');
  const [caste, setCaste] = useState(userProfile.caste || '');
  const [subCaste, setSubCaste] = useState(userProfile.subCaste || '');
  const [region, setRegion] = useState(userProfile.region || '');
  const [state, setState] = useState(userProfile.state || '');
  const [cityDistrict, setCityDistrict] = useState(userProfile.cityDistrict || '');
  const [gotra, setGotra] = useState(userProfile.gotra || '');
  
  // Education & Career
  const [education10th, setEducation10th] = useState(userProfile.education10th || '');
  const [education12th, setEducation12th] = useState(userProfile.education12th || '');
  const [higherEducation, setHigherEducation] = useState(userProfile.higherEducation || '');
  const [profession, setProfession] = useState(userProfile.profession || '');
  const [employer, setEmployer] = useState(userProfile.employer || '');
  const [annualIncome, setAnnualIncome] = useState(userProfile.annualIncome || '');
  
  // Health & Lifestyle
  const [healthStatus, setHealthStatus] = useState(userProfile.healthInfo || 'Excellent');
  const [diet, setDiet] = useState(userProfile.diet || 'Vegetarian');
  const [alcohol, setAlcohol] = useState(userProfile.alcohol || 'Never');
  const [smoking, setSmoking] = useState(userProfile.smoking || 'Never');
  
  // Family & Marriage
  const [maritalStatus, setMaritalStatus] = useState(userProfile.maritalStatus || 'Never Married');
  
  // Astro
  const [birthTime, setBirthTime] = useState(userProfile.birthTime || '');
  const [birthCity, setBirthCity] = useState(userProfile.birthCity || '');

  // Preferences & Chemistry (simplified state for UI)
  const [preferredReligion, setPreferredReligion] = useState(userProfile.partnerPreferences?.preferredReligion || '');
  
  // Photos
  const [photoPreview, setPhotoPreview] = useState(userProfile.photoUrl || '');
  const [photoPrivacy, setPhotoPrivacy] = useState(userProfile.photoPrivacy || 'public');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateCompletion = () => {
    let completed = 0;
    const requiredFields = [
      name, gender, dateOfBirth, height, bloodGroup,
      location, nativeLocation, motherTongue,
      religion, caste, subCaste, region, state, cityDistrict, gotra,
      education10th, education12th, higherEducation, profession, employer, annualIncome,
      healthStatus, diet, maritalStatus,
      birthTime, birthCity
    ];
    requiredFields.forEach(field => {
      if (field && field.trim() !== '') completed += 1;
    });
    if (photoPreview) completed += 1;
    
    return Math.round((completed / (requiredFields.length + 1)) * 100);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      await uploadUserProfilePhoto(file);
    }
  };

  const saveToDatabase = async (isFinal: boolean) => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      const uid = data.session.user.id;

      // Update public.profiles
      await supabase.from('profiles').update({
        display_name: name,
        gender,
        date_of_birth: dateOfBirth,
        height,
        blood_group: bloodGroup,
        location,
        birth_location: nativeLocation,
        mother_tongue: motherTongue,
        religion,
        caste,
        sub_caste: subCaste,
        region,
        state,
        city_district: cityDistrict,
        gotra,
        education_10th: education10th,
        education_12th: education12th,
        higher_education: higherEducation,
        profession,
        employer,
        annual_income: annualIncome,
        health_status: healthStatus,
        diet,
        alcohol_frequency: alcohol,
        smoking_frequency: smoking,
        marital_status: maritalStatus,
        photo_privacy: photoPrivacy,
        onboarding_completed: isFinal && calculateCompletion() === 100
      }).eq('id', uid);

      // Update private_profiles
      if (birthTime || birthCity) {
        await supabase.from('private_profiles').upsert({
          id: uid,
          birth_time: birthTime,
          birth_city: birthCity
        });
      }

    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    await saveToDatabase(currentStep === SECTIONS.length - 1);
    setIsSaving(false);
    
    if (currentStep < SECTIONS.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      if (calculateCompletion() < 100) {
        alert("Please complete all required fields to reach 100% readiness.");
        return;
      }
      navigate('/app/discover');
    }
  };

  const renderSelect = (label: string, value: string, setter: any, options: string[]) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px', color: '#E2E8F0', fontSize: '0.95rem' }}>{label}</label>
      <select
        value={value}
        onChange={e => setter(e.target.value)}
        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '1rem', outline: 'none' }}
      >
        <option value="" disabled>Select {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const renderInput = (label: string, value: string, setter: any, type='text', placeholder='') => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px', color: '#E2E8F0', fontSize: '0.95rem' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => setter(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '1rem', outline: 'none' }}
      />
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Basic Information</h4>
            {renderInput('Full Name', name, setName, 'text', 'Enter your full name')}
            {renderSelect('Gender', gender, setGender, ['Male', 'Female', 'Other'])}
            {renderInput('Date of Birth', dateOfBirth, setDateOfBirth, 'date')}
            {renderInput('Height (e.g., 5\'10")', height, setHeight, 'text', 'e.g., 5\'10"')}
            {renderSelect('Blood Group', bloodGroup, setBloodGroup, ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])}
          </div>
        );
      case 1: // Location & Origin
        return (
          <div>
             <h4 style={{ color: 'white', marginBottom: '24px' }}>Location & Origin</h4>
             {renderInput('Current Location', location, setLocation, 'text', 'City, Country')}
             {renderInput('Native Location (Birth)', nativeLocation, setNativeLocation, 'text', 'Ancestral city or birth place')}
             {renderSelect('Mother Tongue', motherTongue, setMotherTongue, ['Hindi', 'English', 'Malayalam', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi', 'Other'])}
          </div>
        );
      case 2: // Religion & Community
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Religion & Community</h4>
            {renderSelect('Religion', religion, setReligion, indianReligions.map(r => r.name))}
            {renderInput('Caste / Community', caste, setCaste, 'text', 'Enter caste')}
            {renderInput('Sub-Caste', subCaste, setSubCaste, 'text', 'Enter sub-caste')}
            {renderInput('Gotra', gotra, setGotra, 'text', 'Enter gotra (if applicable)')}
            {renderInput('State of Origin', state, setState, 'text', 'e.g., Kerala, Maharashtra')}
            {renderInput('City / District', cityDistrict, setCityDistrict, 'text', 'e.g., Kochi, Pune')}
            {renderSelect('Region', region, setRegion, ['North', 'South', 'East', 'West', 'Central', 'North-East', 'NRI'])}
          </div>
        );
      case 3: // Education & Career
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Education & Career</h4>
            {renderInput('10th Board/School', education10th, setEducation10th, 'text', 'e.g., CBSE')}
            {renderInput('12th Board/School', education12th, setEducation12th, 'text', 'e.g., ISC, State Board')}
            {renderSelect('Highest Education', higherEducation, setHigherEducation, ['Bachelors', 'Masters', 'Doctorate', 'Diploma', 'Other'])}
            {renderInput('Profession', profession, setProfession, 'text', 'e.g., Software Engineer')}
            {renderInput('Employer / Business Name', employer, setEmployer, 'text', 'e.g., Google, Self-employed')}
            {renderSelect('Annual Income', annualIncome, setAnnualIncome, ['Below 5L', '5L - 10L', '10L - 20L', '20L - 30L', '30L - 50L', '50L+'])}
          </div>
        );
      case 4: // Health & Lifestyle
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Health & Lifestyle</h4>
            {renderSelect('Health Status', healthStatus, setHealthStatus, ['Excellent', 'Good', 'Average', 'Poor'])}
            {renderSelect('Diet', diet, setDiet, ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'])}
            {renderSelect('Alcohol', alcohol, setAlcohol, ['Never', 'Occasionally', 'Regularly'])}
            {renderSelect('Smoking', smoking, setSmoking, ['Never', 'Occasionally', 'Regularly'])}
          </div>
        );
      case 5: // Family & Marriage
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Family & Marriage</h4>
            {renderSelect('Marital Status', maritalStatus, setMaritalStatus, ['Never Married', 'Divorced', 'Widowed', 'Separated', 'Annulled'])}
          </div>
        );
      case 6: // Astrology & Birth
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Astrology & Birth (Strictly Private)</h4>
            {renderInput('Exact Birth Time', birthTime, setBirthTime, 'time')}
            {renderInput('Exact Birth City', birthCity, setBirthCity, 'text', 'e.g., Mumbai, India')}
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '16px' }}>This information is Tier 3 (Highly Sensitive) and is never displayed on your public profile. It is only used for Vedic astronomical compatibility calculations.</p>
          </div>
        );
      case 7: // Chemistry & Interests
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Chemistry (Beta)</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Detailed chemistry compatibility will be configured later in your profile.</p>
          </div>
        );
      case 8: // Partner Preferences
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Partner Preferences</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '24px' }}>Configure your strict preferences. These affect who you see in Discovery.</p>
            
            {renderSelect('Preferred Religion', preferredReligion, setPreferredReligion, ['Any', ...indianReligions.map(r => r.name)])}
            
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
              <h5 style={{ color: '#E2E8F0', margin: '0 0 12px 0' }}>Age Preference</h5>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="number" placeholder="Min" style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
                <input type="number" placeholder="Max" style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }} />
              </div>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }}>
                <option value="MUST_HAVE">Must Have</option>
                <option value="PREFERRED">Preferred</option>
                <option value="FLEXIBLE">Flexible</option>
                <option value="DEAL_BREAKER">Deal Breaker</option>
              </select>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
              <h5 style={{ color: '#E2E8F0', margin: '0 0 12px 0' }}>Diet Preference</h5>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', marginBottom: '10px' }}>
                <option value="">Any</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }}>
                <option value="MUST_HAVE">Must Have</option>
                <option value="PREFERRED">Preferred</option>
                <option value="FLEXIBLE">Flexible</option>
                <option value="DEAL_BREAKER">Deal Breaker</option>
              </select>
            </div>
            
          </div>
        );
      case 9: // Photo & Privacy
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Profile Photo & Privacy</h4>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed rgba(255,255,255,0.2)', cursor: 'pointer', position: 'relative'
              }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <Camera size={32} color="rgba(255,255,255,0.4)" />
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} accept="image/*" style={{ display: 'none' }} />

            {renderSelect('Photo Privacy', photoPrivacy, setPhotoPrivacy, ['public', 'private'])}
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '8px' }}>Private photos require you to manually accept requests from matches.</p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F0C1B', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: 'white', fontSize: '1.2rem', margin: 0 }}>{SECTIONS[currentStep]}</h2>
          <div style={{ color: '#A78BFA', fontWeight: 600, fontSize: '0.9rem' }}>{currentStep + 1} of {SECTIONS.length}</div>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
          {SECTIONS.map((_, i) => (
            <div key={i} style={{ flex: 1, background: i <= currentStep ? '#A78BFA' : 'transparent', borderRight: i < SECTIONS.length - 1 ? '1px solid #0F0C1B' : 'none' }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '0.8rem', color: calculateCompletion() === 100 ? '#10B981' : '#94A3B8' }}>
          <CheckCircle size={14} /> Profile {calculateCompletion()}% Complete (Required: 100%)
        </div>
      </div>
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          {renderCurrentStep()}
        </div>
      </div>
      <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '12px' }}>
        {currentStep > 0 && (
          <SecondaryOutlineButton onClick={() => setCurrentStep(c => c - 1)} style={{ flex: 1 }}>
            <ChevronLeft size={20} /> Back
          </SecondaryOutlineButton>
        )}
        <PrimaryButton onClick={handleSaveAndContinue} style={{ flex: 2, background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
          {isSaving ? 'Saving...' : currentStep === SECTIONS.length - 1 ? 'Finish Profile' : 'Continue'} 
        </PrimaryButton>
      </div>
    </div>
  );
};
