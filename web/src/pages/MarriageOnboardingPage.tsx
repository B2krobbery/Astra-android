import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft, ChevronRight, CheckCircle, Flame, Moon, MapPin, Search, Sparkles, AlertCircle } from 'lucide-react';
import { useAstra } from '../context/AstraContext';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';
import { supabase } from '../lib/supabase';
import { calculateMarriageReadiness } from '../utils/profileReadiness';
import { AstrologyEngine } from '../data/astrologyEngine';

import { indianReligions } from '../data/indianCastes';

const SECTIONS = [
  'Basic Info',
  'Location & Origin',
  'Religion & Community',
  'Education & Career',
  'Health & Lifestyle',
  'Family & Marriage',
  'Astrology & Birth',
  'Chemistry & Interests',
  'Values & Vision',
  'Partner Preferences',
  'Photo & Privacy',
];

export const MarriageOnboardingPage: React.FC = () => {
  const { userProfile, updateProfileInfo, uploadUserProfilePhoto, refreshProfile } = useAstra();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Basic
  const [name, setName] = useState(userProfile.name || '');
  const [gender, setGender] = useState(userProfile.gender || 'Male');
  const [dateOfBirth, setDateOfBirth] = useState(userProfile.dateOfBirth || '');
  const [height, setHeight] = useState(userProfile.height || '');
  const [bloodGroup, setBloodGroup] = useState(userProfile.bloodGroup || 'B+');
  
  // Location
  const [location, setLocation] = useState(userProfile.location || '');
  const [nativeLocation, setNativeLocation] = useState((userProfile as any).nativeLocation || (userProfile as any).native_location || '');
  const [motherTongue, setMotherTongue] = useState(userProfile.motherTongue || 'Hindi');
  
  // Religion
  const [religion, setReligion] = useState(userProfile.religion || 'Hindu');
  const [caste, setCaste] = useState(userProfile.caste || '');
  const [subCaste, setSubCaste] = useState(userProfile.subCaste || '');
  const [region, setRegion] = useState((userProfile as any).region || 'North India');
  const [state, setState] = useState((userProfile as any).state || '');
  const [cityDistrict, setCityDistrict] = useState((userProfile as any).cityDistrict || (userProfile as any).city_district || '');
  const [gotra, setGotra] = useState(userProfile.gotra || '');
  
  // Education & Career
  const [education10th, setEducation10th] = useState(userProfile.education10th || '');
  const [education12th, setEducation12th] = useState(userProfile.education12th || '');
  const [higherEducation, setHigherEducation] = useState(userProfile.higherEducation || userProfile.education || '');
  const [profession, setProfession] = useState(userProfile.profession || '');
  const [employer, setEmployer] = useState(userProfile.employer || '');
  const [annualIncome, setAnnualIncome] = useState(userProfile.annualIncome || '₹15 - ₹25 LPA');
  
  // Health & Lifestyle
  const [healthStatus, setHealthStatus] = useState((userProfile as any).healthStatus || userProfile.healthInfo || 'Excellent');
  const [diet, setDiet] = useState(userProfile.diet || 'Vegetarian');
  const [alcohol, setAlcohol] = useState(userProfile.alcohol || 'Never');
  const [smoking, setSmoking] = useState(userProfile.smoking || 'Never');
  
  // Family & Marriage
  const [maritalStatus, setMaritalStatus] = useState(userProfile.maritalStatus || 'Never Married');
  
  // Astro
  const [birthTime, setBirthTime] = useState(userProfile.birthTime || '');
  const [birthCity, setBirthCity] = useState(userProfile.birthCity || userProfile.birthLocation || (userProfile as any).birth_location || '');

  // Preferences
  const [preferredReligion, setPreferredReligion] = useState(userProfile.partnerPreferences?.preferredReligion || 'Any');
  const [preferredCaste, setPreferredCaste] = useState(userProfile.partnerPreferences?.preferredCaste || 'Any');
  const [preferredSubCaste, setPreferredSubCaste] = useState(userProfile.partnerPreferences?.preferredSubCaste || 'Any');
  const [preferredGotra, setPreferredGotra] = useState(userProfile.partnerPreferences?.preferredGotra || 'Any (Except My Own)');
  const [preferredDiet, setPreferredDiet] = useState('Any');
  const [minAgePref, setMinAgePref] = useState('21');
  const [maxAgePref, setMaxAgePref] = useState('32');
  const [religionTier, setReligionTier] = useState<'MUST_HAVE' | 'PREFERRED' | 'FLEXIBLE' | 'DEAL_BREAKER'>((userProfile.partnerPreferences?.tierReligion as any) || 'MUST_HAVE');
  const [casteTier, setCasteTier] = useState<'MUST_HAVE' | 'PREFERRED' | 'FLEXIBLE' | 'DEAL_BREAKER'>((userProfile.partnerPreferences?.tierCaste as any) || 'PREFERRED');
  const [subCasteTier, setSubCasteTier] = useState<'MUST_HAVE' | 'PREFERRED' | 'FLEXIBLE' | 'DEAL_BREAKER'>((userProfile.partnerPreferences?.tierSubCaste as any) || 'FLEXIBLE');
  const [gotraTier, setGotraTier] = useState<'MUST_HAVE' | 'PREFERRED' | 'FLEXIBLE' | 'DEAL_BREAKER'>((userProfile.partnerPreferences?.tierGotra as any) || 'DEAL_BREAKER');
  const [dietTier, setDietTier] = useState<'MUST_HAVE' | 'PREFERRED' | 'FLEXIBLE' | 'DEAL_BREAKER'>((userProfile.partnerPreferences?.tierDiet as any) || 'DEAL_BREAKER');
  
  // Photos
  const [photoPreview, setPhotoPreview] = useState(userProfile.photoUrl || '');
  const [photoPrivacy, setPhotoPrivacy] = useState(userProfile.photoPrivacy || 'public');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Questionnaire
  const [questionnaire, setQuestionnaire] = useState<Record<string, string>>(userProfile.marriageQuestionnaire || {});

  const hasHydrated = useRef(false);

  useEffect(() => {
    if (Object.keys(userProfile).length > 0 && !hasHydrated.current) {
      setName(userProfile.name || '');
      setGender(userProfile.gender || 'Male');
      setDateOfBirth(userProfile.dateOfBirth || '');
      setHeight(userProfile.height || '');
      setBloodGroup(userProfile.bloodGroup || 'B+');
      
      setLocation(userProfile.location || '');
      setNativeLocation((userProfile as any).nativeLocation || (userProfile as any).native_location || '');
      setMotherTongue(userProfile.motherTongue || 'Hindi');
      
      setReligion(userProfile.religion || 'Hindu');
      setCaste(userProfile.caste || '');
      setSubCaste(userProfile.subCaste || '');
      setRegion((userProfile as any).region || 'North India');
      setState((userProfile as any).state || '');
      setCityDistrict((userProfile as any).cityDistrict || (userProfile as any).city_district || '');
      setGotra(userProfile.gotra || '');
      
      setEducation10th(userProfile.education10th || '');
      setEducation12th(userProfile.education12th || '');
      setHigherEducation(userProfile.higherEducation || userProfile.education || '');
      setProfession(userProfile.profession || '');
      setEmployer(userProfile.employer || '');
      setAnnualIncome(userProfile.annualIncome || '₹15 - ₹25 LPA');
      
      setHealthStatus((userProfile as any).healthStatus || userProfile.healthInfo || 'Excellent');
      setDiet(userProfile.diet || 'Vegetarian');
      setAlcohol(userProfile.alcohol || 'Never');
      setSmoking(userProfile.smoking || 'Never');
      
      setMaritalStatus(userProfile.maritalStatus || 'Never Married');
      
      setBirthTime(userProfile.birthTime || '');
      setBirthCity(userProfile.birthCity || userProfile.birthLocation || (userProfile as any).birth_location || '');
      
      setPreferredReligion(userProfile.partnerPreferences?.preferredReligion || 'Any');
      setPreferredCaste(userProfile.partnerPreferences?.preferredCaste || 'Any');
      setPreferredSubCaste(userProfile.partnerPreferences?.preferredSubCaste || 'Any');
      setPreferredGotra(userProfile.partnerPreferences?.preferredGotra || 'Any (Except My Own)');
      
      setReligionTier((userProfile.partnerPreferences?.tierReligion as any) || 'MUST_HAVE');
      setCasteTier((userProfile.partnerPreferences?.tierCaste as any) || 'PREFERRED');
      setSubCasteTier((userProfile.partnerPreferences?.tierSubCaste as any) || 'FLEXIBLE');
      setGotraTier((userProfile.partnerPreferences?.tierGotra as any) || 'DEAL_BREAKER');
      setDietTier((userProfile.partnerPreferences?.tierDiet as any) || 'DEAL_BREAKER');
      
      setPhotoPreview(userProfile.photoUrl || '');
      setPhotoPrivacy(userProfile.photoPrivacy || 'public');

      hasHydrated.current = true;
    }
  }, [userProfile]);

  // Authoritative Readiness Calculation
  const currentProfileData = {
    name,
    gender,
    dateOfBirth,
    height,
    bloodGroup,
    location,
    nativeLocation,
    motherTongue,
    religion,
    caste,
    subCaste,
    region,
    state,
    cityDistrict,
    gotra,
    education10th,
    education12th,
    higherEducation,
    profession,
    employer,
    annualIncome,
    healthStatus,
    diet,
    maritalStatus,
    birthTime,
    birthLocation: birthCity || nativeLocation,
    photoUrl: photoPreview
  };

  const readiness = calculateMarriageReadiness(currentProfileData, photoPreview);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoPreview(event.target.result as string);
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

      // Calculate Astrology Chart accurately
      let nakshatra = userProfile.nakshatra || '';
      let rashi = userProfile.rashi || '';
      let nadi = userProfile.nadi || '';
      let manglik = userProfile.manglik || 'No';
      let pada = 1;

      if (dateOfBirth && birthTime) {
        const chart = AstrologyEngine.calculateChart(dateOfBirth, birthTime, birthCity || location);
        nakshatra = chart.nakshatraName;
        rashi = chart.rashiName;
        nadi = chart.nadiName;
        manglik = chart.isManglik ? 'Yes' : 'No';
        pada = chart.pada;
      }

      const coords = AstrologyEngine.getCoordinatesForCity(birthCity || location);

      // 1. Update public.profiles
      const isCompleted = readiness.isComplete;
      await supabase.from('profiles').update({
        display_name: name,
        gender,
        date_of_birth: dateOfBirth,
        height,
        blood_group: bloodGroup,
        location,
        birth_location: birthCity,
        native_location: nativeLocation,
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
        nakshatra,
        rashi,
        nadi,
        manglik,
        nakshatra_pada: pada,
        onboarding_completed: isCompleted,
        intent: 'Marriage',
        marriage_questionnaire: questionnaire,
        updated_at: new Date().toISOString()
      }).eq('id', uid);

      // 2. Update private_profiles (No invalid columns!)
      if (birthTime) {
        await supabase.from('private_profiles').upsert({
          id: uid,
          birth_time: birthTime,
          birth_latitude: coords.lat,
          birth_longitude: coords.lon,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }

      // 3. Update Preferences & Tiers
      await supabase.from('preferences').upsert({
        user_id: uid,
        preferred_religion: preferredReligion === 'Any' ? null : preferredReligion,
        preferred_caste: preferredCaste === 'Any' ? null : preferredCaste,
        preferred_sub_caste: preferredSubCaste === 'Any' ? null : preferredSubCaste,
        preferred_gotra: preferredGotra === 'Any' ? null : preferredGotra,
        tier_religion: religionTier,
        tier_caste: casteTier,
        tier_sub_caste: subCasteTier,
        tier_gotra: gotraTier,
        tier_diet: dietTier,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      // Update Local Context State
      updateProfileInfo(name, profession, higherEducation, location, [], [], undefined, '');
      await refreshProfile();

    } catch (e) {
      console.error('Failed to save marriage profile to DB:', e);
    }
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    setSaveMessage('');
    const isFinal = currentStep === SECTIONS.length - 1;
    await saveToDatabase(isFinal);
    setIsSaving(false);
    
    if (!isFinal) {
      setCurrentStep(c => c + 1);
    } else {
      if (!readiness.isComplete) {
        setSaveMessage(`Profile is ${readiness.percentage}% complete. Marriage discovery requires 100%. Missing: ${readiness.missingFields.slice(0, 3).join(', ')}...`);
        return;
      }
      navigate('/discover');
    }
  };

  const renderSelect = (label: string, value: string, setter: (v: string) => void, options: string[]) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>{label}</label>
      <select 
        value={value} 
        onChange={e => setter(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFF', fontSize: '0.9rem' }}
      >
        {options.map(opt => <option key={opt} value={opt} style={{ background: '#0F0C1B' }}>{opt}</option>)}
      </select>
    </div>
  );

  const renderInput = (label: string, value: string, setter: (v: string) => void, placeholder: string, type = 'text') => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => setter(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFF', fontSize: '0.9rem' }}
      />
    </div>
  );

  const renderTextarea = (label: string, value: string, setter: (v: string) => void, placeholder: string) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '6px' }}>{label}</label>
      <textarea 
        value={value} 
        onChange={e => setter(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFF', fontSize: '0.9rem', resize: 'vertical' }}
      />
    </div>
  );

  const renderStepContent = () => {
    switch(currentStep) {
      case 0: // Basic
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Basic Details</h4>
            {renderInput('Full Name', name, setName, 'e.g. Rahul Sharma')}
            {renderSelect('Gender', gender, setGender, ['Male', 'Female'])}
            {renderInput('Date of Birth', dateOfBirth, setDateOfBirth, 'YYYY-MM-DD', 'date')}
            {renderInput('Height', height, setHeight, "e.g. 5'10\"")}
            {renderSelect('Blood Group', bloodGroup, setBloodGroup, ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])}
          </div>
        );
      case 1: // Location & Origin
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Location & Origin</h4>
            {renderInput('Current City / Location', location, setLocation, 'e.g. Bangalore, Karnataka')}
            {renderInput('Native Location', nativeLocation, setNativeLocation, 'e.g. Varanasi, Uttar Pradesh')}
            {renderInput('Mother Tongue', motherTongue, setMotherTongue, 'e.g. Hindi, Malayalam, Tamil')}
          </div>
        );
      case 2: // Religion & Community
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Religion & Community</h4>
            {renderSelect('Religion', religion, setReligion, indianReligions.map(r => r.name))}
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px' }}>Caste / Community</label>
              <select
                value={caste}
                onChange={e => { setCaste(e.target.value); setSubCaste(''); }}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}
              >
                <option value="">Select Caste</option>
                {indianReligions.find(r => r.name === religion)?.castes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                <option value="Any">Any</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px' }}>Sub-Caste</label>
              {(indianReligions.find(r => r.name === religion)?.castes.find(c => c.name === caste)?.subCastes?.length || 0) > 0 ? (
                <select
                  value={subCaste}
                  onChange={e => setSubCaste(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}
                >
                  <option value="">Select Sub-Caste</option>
                  {indianReligions.find(r => r.name === religion)?.castes.find(c => c.name === caste)?.subCastes.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  <option value="Any">Any</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Saraswat, Iyer, Kanyakubja"
                  value={subCaste}
                  onChange={e => setSubCaste(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}
                />
              )}
            </div>
            {renderSelect('Cultural Region', region, setRegion, ['North India', 'South India', 'West India', 'East India', 'Central India', 'Kerala', 'NRI'])}
            {renderInput('State', state, setState, 'e.g. Maharashtra')}
            {renderInput('City / District', cityDistrict, setCityDistrict, 'e.g. Pune')}
            {renderInput('Gotra', gotra, setGotra, 'e.g. Kashyapa, Vatsa, Bharadwaja')}
          </div>
        );
      case 3: // Education & Career
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Education & Career</h4>
            {renderInput('10th Standard Education', education10th, setEducation10th, 'e.g. CBSE 94% / St. Marys School')}
            {renderInput('12th Standard Education', education12th, setEducation12th, 'e.g. CBSE Science 92% / DPS RK Puram')}
            {renderInput('Higher Education & Degree', higherEducation, setHigherEducation, 'e.g. B.Tech Computer Science, IIT Delhi')}
            {renderInput('Profession / Job Title', profession, setProfession, 'e.g. Senior Software Architect')}
            {renderInput('Employer / Company', employer, setEmployer, 'e.g. Microsoft / Self-Employed')}
            {renderSelect('Annual Income', annualIncome, setAnnualIncome, ['₹5 - ₹10 LPA', '₹10 - ₹15 LPA', '₹15 - ₹25 LPA', '₹25 - ₹50 LPA', '₹50 LPA+'])}
          </div>
        );
      case 4: // Health & Lifestyle
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Health & Lifestyle</h4>
            {renderSelect('Health Status', healthStatus, setHealthStatus, ['Excellent (No issues)', 'Good', 'Disclosed under private inquiry'])}
            {renderSelect('Diet Preference', diet, setDiet, ['Vegetarian', 'Eggetarian', 'Non-Vegetarian', 'Vegan', 'Jain Vegetarian'])}
            {renderSelect('Alcohol Habit', alcohol, setAlcohol, ['Never', 'Socially', 'Occasionally'])}
            {renderSelect('Smoking Habit', smoking, setSmoking, ['Never', 'Occasionally'])}
          </div>
        );
      case 5: // Family & Marriage
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Family & Marriage</h4>
            {renderSelect('Marital Status', maritalStatus, setMaritalStatus, ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'])}
          </div>
        );
      case 6: // Astrology & Birth
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Birth Details (for Kundali & Ashtakoota)</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px' }}>
              Used strictly to calculate authentic Sidereal Planetary coordinates, Nakshatra, Rashi, and 36 Guna Milan. Birth time is kept private.
            </p>
            {renderInput('Exact Birth Time', birthTime, setBirthTime, 'HH:MM (24 hr format, e.g. 14:30)', 'time')}
            {renderInput('Birth City / Place', birthCity, setBirthCity, 'e.g. New Delhi')}
          </div>
        );
      case 7: // Chemistry & Interests
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Interests & Chemistry</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px' }}>
              Your answers power genuine, multi-dimensional lifestyle & personality compatibility matching.
            </p>
            {renderInput('Sports you love/play', (userProfile as any).chemistryAnswers?.sports?.join(', ') || 'Cricket, Badminton', () => {}, 'Comma-separated')}
            {renderInput('Favorite Movies / Shows', (userProfile as any).chemistryAnswers?.movies?.join(', ') || 'Interstellar, 3 Idiots', () => {}, 'Comma-separated')}
            {renderInput('Music & Artists', (userProfile as any).chemistryAnswers?.music?.join(', ') || 'A.R. Rahman, Classical', () => {}, 'Comma-separated')}
          </div>
        );
      case 8: // Values & Vision
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Values & Vision</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px' }}>
              These answers will be displayed directly on your profile to help matches understand your personal values.
            </p>
            {renderTextarea('Future career plans and goals', questionnaire['q1'] || '', v => setQuestionnaire(prev => ({ ...prev, q1: v })), 'e.g. Planning to start a business or grow in tech')}
            {renderTextarea('Work-life balance', questionnaire['q2'] || '', v => setQuestionnaire(prev => ({ ...prev, q2: v })), 'e.g. Weekends are strictly for family')}
            {renderTextarea('Household responsibilities', questionnaire['q3'] || '', v => setQuestionnaire(prev => ({ ...prev, q3: v })), 'e.g. Expect to split 50/50')}
            {renderTextarea('Finances and investments', questionnaire['q4'] || '', v => setQuestionnaire(prev => ({ ...prev, q4: v })), 'e.g. Prefer to invest heavily in real estate')}
            {renderTextarea('Family involvement', questionnaire['q5'] || '', v => setQuestionnaire(prev => ({ ...prev, q5: v })), 'e.g. Very close to my parents, visit them often')}
            {renderTextarea('Living arrangements', questionnaire['q6'] || '', v => setQuestionnaire(prev => ({ ...prev, q6: v })), 'e.g. Plan to live independently after marriage')}
            {renderTextarea('Handling conflicts', questionnaire['q7'] || '', v => setQuestionnaire(prev => ({ ...prev, q7: v })), 'e.g. Direct communication and compromise')}
            {renderTextarea('Starting a family', questionnaire['q8'] || '', v => setQuestionnaire(prev => ({ ...prev, q8: v })), 'e.g. Want kids after 2-3 years of marriage')}
            {renderTextarea('Weekends and free time', questionnaire['q9'] || '', v => setQuestionnaire(prev => ({ ...prev, q9: v })), 'e.g. Hiking, trying new restaurants, or relaxing at home')}
            {renderTextarea('Most important quality in a partner', questionnaire['q10'] || '', v => setQuestionnaire(prev => ({ ...prev, q10: v })), 'e.g. Honesty, ambition, and a good sense of humor')}
          </div>
        );
      case 9: // Partner Preferences
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Partner Preferences & Criteria</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '24px' }}>
              Set strict MUST HAVE, PREFERRED, and DEAL BREAKER criteria for your matrimonial search.
            </p>
            
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
              <h5 style={{ color: '#E2E8F0', margin: '0 0 8px 0' }}>Religion Preference</h5>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={preferredReligion} 
                  onChange={e => setPreferredReligion(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#0F0C1B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}
                >
                  <option value="Any">Any Religion</option>
                  {indianReligions.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                </select>
                <select 
                  value={religionTier} 
                  onChange={e => setReligionTier(e.target.value as any)}
                  style={{ width: '130px', padding: '10px', borderRadius: '8px', background: '#0F0C1B', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber-light)', fontWeight: 700 }}
                >
                  <option value="MUST_HAVE">MUST HAVE</option>
                  <option value="PREFERRED">PREFERRED</option>
                  <option value="FLEXIBLE">FLEXIBLE</option>
                  <option value="DEAL_BREAKER">DEAL BREAKER</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
              <h5 style={{ color: '#E2E8F0', margin: '0 0 8px 0' }}>Caste Preference</h5>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={preferredCaste}
                  onChange={e => { setPreferredCaste(e.target.value); setPreferredSubCaste('Any'); }}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#0F0C1B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}
                >
                  <option value="Any">Any Caste</option>
                  {indianReligions.find(r => r.name === (preferredReligion === 'Any' ? religion : preferredReligion))?.castes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <select 
                  value={casteTier} 
                  onChange={e => setCasteTier(e.target.value as any)}
                  style={{ width: '130px', padding: '10px', borderRadius: '8px', background: '#0F0C1B', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber-light)', fontWeight: 700 }}
                >
                  <option value="MUST_HAVE">MUST HAVE</option>
                  <option value="PREFERRED">PREFERRED</option>
                  <option value="FLEXIBLE">FLEXIBLE</option>
                  <option value="DEAL_BREAKER">DEAL BREAKER</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
              <h5 style={{ color: '#E2E8F0', margin: '0 0 8px 0' }}>Sub-Caste Preference</h5>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(indianReligions.find(r => r.name === (preferredReligion === 'Any' ? religion : preferredReligion))?.castes.find(c => c.name === preferredCaste)?.subCastes?.length || 0) > 0 ? (
                  <select
                    value={preferredSubCaste}
                    onChange={e => setPreferredSubCaste(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#0F0C1B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}
                  >
                    <option value="Any">Any Sub-Caste</option>
                    {indianReligions.find(r => r.name === (preferredReligion === 'Any' ? religion : preferredReligion))?.castes.find(c => c.name === preferredCaste)?.subCastes.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Kanyakubja, Any"
                    value={preferredSubCaste}
                    onChange={e => setPreferredSubCaste(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}
                  />
                )}
                <select 
                  value={subCasteTier} 
                  onChange={e => setSubCasteTier(e.target.value as any)}
                  style={{ width: '130px', padding: '10px', borderRadius: '8px', background: '#0F0C1B', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber-light)', fontWeight: 700 }}
                >
                  <option value="MUST_HAVE">MUST HAVE</option>
                  <option value="PREFERRED">PREFERRED</option>
                  <option value="FLEXIBLE">FLEXIBLE</option>
                  <option value="DEAL_BREAKER">DEAL BREAKER</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
              <h5 style={{ color: '#E2E8F0', margin: '0 0 8px 0' }}>Gotra Preference</h5>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={preferredGotra} 
                  onChange={e => setPreferredGotra(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#0F0C1B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}
                >
                  <option value="Any">Any Gotra</option>
                  <option value="Any (Except My Own)">Any (Except My Own)</option>
                </select>
                <select 
                  value={gotraTier} 
                  onChange={e => setGotraTier(e.target.value as any)}
                  style={{ width: '130px', padding: '10px', borderRadius: '8px', background: '#0F0C1B', border: '1px solid #F43F5E', color: '#FDA4AF', fontWeight: 700 }}
                >
                  <option value="MUST_HAVE">MUST HAVE</option>
                  <option value="PREFERRED">PREFERRED</option>
                  <option value="FLEXIBLE">FLEXIBLE</option>
                  <option value="DEAL_BREAKER">DEAL BREAKER</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
              <h5 style={{ color: '#E2E8F0', margin: '0 0 8px 0' }}>Diet Preference</h5>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={preferredDiet} 
                  onChange={e => setPreferredDiet(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#0F0C1B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}
                >
                  <option value="Any">Any Diet</option>
                  <option value="Vegetarian">Strictly Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                </select>
                <select 
                  value={dietTier} 
                  onChange={e => setDietTier(e.target.value as any)}
                  style={{ width: '130px', padding: '10px', borderRadius: '8px', background: '#0F0C1B', border: '1px solid #F43F5E', color: '#FDA4AF', fontWeight: 700 }}
                >
                  <option value="MUST_HAVE">MUST HAVE</option>
                  <option value="PREFERRED">PREFERRED</option>
                  <option value="FLEXIBLE">FLEXIBLE</option>
                  <option value="DEAL_BREAKER">DEAL BREAKER</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
              <h5 style={{ color: '#E2E8F0', margin: '0 0 8px 0' }}>Age Range Preference</h5>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  value={minAgePref} 
                  onChange={e => setMinAgePref(e.target.value)} 
                  placeholder="Min" 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }} 
                />
                <input 
                  type="number" 
                  value={maxAgePref} 
                  onChange={e => setMaxAgePref(e.target.value)} 
                  placeholder="Max" 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }} 
                />
              </div>
            </div>
          </div>
        );
      case 10: // Photo & Privacy
        return (
          <div>
            <h4 style={{ color: 'white', marginBottom: '24px' }}>Profile Photo & Privacy</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '2px dashed var(--accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.05)',
                  marginBottom: '12px'
                }}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={32} color="var(--accent-amber)" />
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoSelect} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Upload a clear photo (4–5 recommended)</span>
            </div>

            {renderSelect('Photo Privacy Setting', photoPrivacy, setPhotoPrivacy, [
              'public',
              'private'
            ])}
            <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              {photoPrivacy === 'private' ? '🔒 Private: Hidden until you accept an explicit photo request.' : '🌐 Public: Visible on discovery cards to verified members.'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F0C1B', color: '#FFF', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        
        {/* Top Header & Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button 
            onClick={() => currentStep > 0 ? setCurrentStep(c => c - 1) : navigate('/discover')}
            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={20} /> Back
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-amber-light)' }}>
            Step {currentStep + 1} of {SECTIONS.length}
          </span>
        </div>

        {/* Readiness Meter */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', marginBottom: '24px', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>
              Marriage Readiness: {readiness.percentage}%
            </span>
            <span style={{ fontSize: '0.75rem', color: readiness.isComplete ? '#10B981' : 'var(--accent-amber-light)', fontWeight: 800 }}>
              {readiness.isComplete ? '🟢 100% Complete' : `${readiness.missingFields.length} fields remaining`}
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${readiness.percentage}%`, 
                height: '100%', 
                background: readiness.isComplete ? '#10B981' : 'linear-gradient(90deg, #F59E0B, #10B981)',
                transition: 'width 0.3s ease'
              }} 
            />
          </div>
          {readiness.missingFields.length > 0 && (
            <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#94A3B8' }}>
              Required to reach 100%: {readiness.missingFields.slice(0, 4).join(', ')}{readiness.missingFields.length > 4 ? ` and ${readiness.missingFields.length - 4} more` : ''}
            </div>
          )}
        </div>

        {/* Dynamic Step Content */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '24px' }}>
          {renderStepContent()}
        </div>

        {saveMessage && (
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FDA4AF', fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} color="#F43F5E" />
            {saveMessage}
          </div>
        )}

        {/* Save & Continue */}
        <PrimaryButton onClick={handleSaveAndContinue} disabled={isSaving}>
          {isSaving ? 'Saving...' : currentStep === SECTIONS.length - 1 ? 'Complete & Enter Matrimony' : 'Save & Continue'}
        </PrimaryButton>
      </div>
    </div>
  );
};
