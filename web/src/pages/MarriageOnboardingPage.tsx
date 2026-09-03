import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';
import { ChevronLeft, ChevronRight, CheckCircle, Upload, Shield } from 'lucide-react';
import { useAstra } from '../context/AstraContext';
import { supabase } from '../lib/supabase';
import { indianReligions, Religion, Caste } from '../data/indianCastes';

const SECTIONS = [
  'About You',
  'Religion & Community',
  'Education & Work',
  'Health',
  'Lifestyle',
  'Family & Marriage History',
  'Astrology',
  'Numerology & Nadi',
  'Interests',
  'Photos & Privacy'
];

export const MarriageOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAstra();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // -- Form State --
  // Step 0: About You
  const [name, setName] = useState(userProfile?.name || '');
  const [gender, setGender] = useState(userProfile?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(userProfile?.dateOfBirth || '');
  const [birthTime, setBirthTime] = useState(userProfile?.birthTime || '');
  const [birthLocation, setBirthLocation] = useState(userProfile?.birthLocation || '');
  const [height, setHeight] = useState(userProfile?.height || '');
  const [bloodGroup, setBloodGroup] = useState(userProfile?.bloodGroup || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [motherTongue, setMotherTongue] = useState(userProfile?.motherTongue || '');

  // Step 1: Religion & Community
  const [religion, setReligion] = useState(userProfile?.religion || '');
  const [caste, setCaste] = useState(userProfile?.caste || '');
  const [subCaste, setSubCaste] = useState(userProfile?.subCaste || '');
  const [gotra, setGotra] = useState(userProfile?.gotra || '');

  // Step 2: Education & Work
  const [education10th, setEducation10th] = useState(userProfile?.education10th || '');
  const [education12th, setEducation12th] = useState(userProfile?.education12th || '');
  const [higherEducation, setHigherEducation] = useState(userProfile?.higherEducation || '');
  const [profession, setProfession] = useState(userProfile?.profession || '');
  const [employer, setEmployer] = useState(userProfile?.employer || '');
  const [annualIncome, setAnnualIncome] = useState(userProfile?.annualIncome || '');

  // Step 3: Health
  const [healthInfo, setHealthInfo] = useState(userProfile?.healthInfo || '');
  const [healthPrivacy, setHealthPrivacy] = useState(userProfile?.healthPrivacy || 'private');

  // Step 4: Lifestyle
  const [diet, setDiet] = useState(userProfile?.diet || '');
  const [alcohol, setAlcohol] = useState(userProfile?.alcohol || '');
  const [smoking, setSmoking] = useState(userProfile?.smoking || '');

  // Step 5: Family & Marriage History
  const [maritalStatus, setMaritalStatus] = useState(userProfile?.maritalStatus || 'Never Married');
  const [previousMarriage, setPreviousMarriage] = useState(userProfile?.previousMarriage || '');
  const [childrenStatus, setChildrenStatus] = useState(userProfile?.childrenStatus || 'None');

  // Step 6: Astrology & Numerology (Skipping specific extra fields if they map to dob/time)
  
  // Step 7: Interests
  const [interests, setInterests] = useState<string[]>(userProfile?.lookingFor || []);

  // Step 8: Photos & Privacy
  const [photoPrivacy, setPhotoPrivacy] = useState(userProfile?.photoPrivacy || 'public');

  // -- Cascading Logic --
  const selectedReligionObj = indianReligions.find(r => r.name === religion);
  const selectedCasteObj = selectedReligionObj?.castes.find(c => c.name === caste);

  // Completion calculation
  const calculateCompletion = () => {
    let completed = 0;
    const requiredFields = [
      name, gender, dateOfBirth, height, motherTongue, 
      religion, caste, higherEducation, profession, 
      diet, maritalStatus
    ];
    requiredFields.forEach(field => {
      if (field && field.trim() !== '') completed += 1;
    });
    return Math.round((completed / requiredFields.length) * 100);
  };

  const handleSaveAndContinue = async () => {
    if (currentStep < SECTIONS.length - 1) {
      setCurrentStep(curr => curr + 1);
      return;
    }

    // Final Save
    setIsSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) throw new Error("No user session");

      const updates = {
        display_name: name,
        gender,
        date_of_birth: dateOfBirth,
        height,
        blood_group: bloodGroup,
        location,
        mother_tongue: motherTongue,
        religion,
        caste,
        sub_caste: subCaste,
        gotra,
        education_10th: education10th,
        education_12th: education12th,
        higher_education: higherEducation,
        profession,
        employer,
        annual_income: annualIncome,
        health_info: healthInfo,
        health_privacy: healthPrivacy,
        diet,
        alcohol,
        smoking,
        marital_status: maritalStatus,
        previous_marriage: previousMarriage,
        children_status: childrenStatus,
        photo_privacy: photoPrivacy,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.session.user.id);

      if (error) throw error;
      
      // Update private profiles table for sensitive birth data
      await supabase
        .from('private_profiles')
        .upsert({ id: session.session.user.id, birth_time: birthTime, updated_at: new Date().toISOString() });

      window.location.href = '/discover';

    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (label: string, value: string, setValue: (v: string) => void, placeholder: string, type = "text") => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '1rem', outline: 'none' }}
      />
    </div>
  );

  const renderSelect = (label: string, value: string, setValue: (v: string) => void, options: string[]) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>{label}</label>
      <select 
        value={value}
        onChange={e => setValue(e.target.value)}
        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1E1836', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '1rem', outline: 'none', appearance: 'none' }}
      >
        <option value="" disabled>Select {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            {renderField('Full Name', name, setName, 'Enter your legal name')}
            {renderSelect('Gender', gender, setGender, ['Male', 'Female', 'Other'])}
            {renderField('Date of Birth', dateOfBirth, setDateOfBirth, 'YYYY-MM-DD', 'date')}
            {renderField('Time of Birth', birthTime, setBirthTime, 'HH:MM AM/PM', 'time')}
            {renderField('Place of Birth', birthLocation, setBirthLocation, 'City, State')}
            {renderField('Height (cm/ft)', height, setHeight, 'e.g. 5 ft 8 in')}
            {renderSelect('Blood Group', bloodGroup, setBloodGroup, ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])}
            {renderField('Current Location', location, setLocation, 'City, State')}
            {renderField('Mother Tongue', motherTongue, setMotherTongue, 'e.g. Hindi, Tamil')}
          </>
        );
      case 1:
        return (
          <>
            {renderSelect('Religion', religion, (val) => { setReligion(val); setCaste(''); setSubCaste(''); }, indianReligions.map(r => r.name))}
            {religion && renderSelect('Community / Caste', caste, (val) => { setCaste(val); setSubCaste(''); }, selectedReligionObj?.castes.map(c => c.name) || [])}
            {caste && renderSelect('Sub-Caste', subCaste, setSubCaste, selectedCasteObj?.subCastes || [])}
            {renderField('Gotra (Optional)', gotra, setGotra, 'Enter Gotra')}
          </>
        );
      case 2:
        return (
          <>
            {renderField('10th Board/School', education10th, setEducation10th, 'e.g. CBSE')}
            {renderField('12th Board/School', education12th, setEducation12th, 'e.g. ISC')}
            {renderField('Higher Education', higherEducation, setHigherEducation, 'e.g. B.Tech, MBA')}
            {renderField('Profession', profession, setProfession, 'e.g. Software Engineer')}
            {renderField('Employer / Business Name', employer, setEmployer, 'e.g. Google, Self-Employed')}
            {renderSelect('Annual Income', annualIncome, setAnnualIncome, ['Under ₹5 Lakhs', '₹5-10 Lakhs', '₹10-20 Lakhs', '₹20-50 Lakhs', 'Over ₹50 Lakhs', 'Prefer not to say'])}
          </>
        );
      case 3:
        return (
          <>
            {renderField('Pre-existing Health Conditions (Optional)', healthInfo, setHealthInfo, 'Any health info you wish to share')}
            {renderSelect('Health Info Privacy', healthPrivacy, setHealthPrivacy, ['public', 'private'])}
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Private health information is only revealed to matched profiles.</p>
          </>
        );
      case 4:
        return (
          <>
            {renderSelect('Diet', diet, setDiet, ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain'])}
            {renderSelect('Drinking', alcohol, setAlcohol, ['Never', 'Occasionally', 'Regularly'])}
            {renderSelect('Smoking', smoking, setSmoking, ['Never', 'Occasionally', 'Regularly'])}
          </>
        );
      case 5:
        return (
          <>
            {renderSelect('Marital Status', maritalStatus, setMaritalStatus, ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce', 'Annulled'])}
            {maritalStatus !== 'Never Married' && (
              <>
                {renderField('Previous Marriage Details', previousMarriage, setPreviousMarriage, 'Optional details')}
                {renderSelect('Children Status', childrenStatus, setChildrenStatus, ['None', 'Yes, living with me', 'Yes, not living with me'])}
              </>
            )}
          </>
        );
      case 6:
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Astrology details are automatically generated!</h4>
            <p style={{ color: '#94A3B8' }}>We use your Date, Time, and Place of birth to calculate your Kundali, Rashi, and Nakshatra for matching.</p>
          </div>
        );
      case 7:
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Numerology & Nadi</h4>
            <p style={{ color: '#94A3B8' }}>Your Nadi and Numerology scores will be computed in real-time when comparing with potential spouses.</p>
          </div>
        );
      case 8:
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Interests & Hobbies</h4>
            <p style={{ color: '#94A3B8' }}>(We will add a detailed interests selector in the next phase. For now, this is tracked via your Bio on your profile page.)</p>
          </div>
        );
      case 9:
        return (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Shield size={48} color="#A78BFA" style={{ marginBottom: '16px' }} />
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Photo Privacy</h4>
            <p style={{ color: '#94A3B8', marginBottom: '24px' }}>How would you like your photos to be displayed?</p>
            
            <div 
              onClick={() => setPhotoPrivacy('public')}
              style={{ border: `2px solid ${photoPrivacy === 'public' ? '#8B5CF6' : 'rgba(255,255,255,0.1)'}`, padding: '16px', borderRadius: '12px', marginBottom: '12px', cursor: 'pointer', background: photoPrivacy === 'public' ? 'rgba(139, 92, 246, 0.1)' : 'transparent' }}
            >
              <h5 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Public</h5>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>Anyone can see your photos on your profile.</p>
            </div>
            
            <div 
              onClick={() => setPhotoPrivacy('private')}
              style={{ border: `2px solid ${photoPrivacy === 'private' ? '#8B5CF6' : 'rgba(255,255,255,0.1)'}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', background: photoPrivacy === 'private' ? 'rgba(139, 92, 246, 0.1)' : 'transparent' }}
            >
              <h5 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Private (Secure)</h5>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>Photos are hidden. You must manually grant access to specific connections.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F0C1B', padding: '0', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header & Progress */}
      <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: 'white', fontSize: '1.2rem', margin: 0 }}>{SECTIONS[currentStep]}</h2>
          <div style={{ color: '#A78BFA', fontWeight: 600, fontSize: '0.9rem' }}>{currentStep + 1} of {SECTIONS.length}</div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
          {SECTIONS.map((_, i) => (
            <div key={i} style={{ flex: 1, background: i <= currentStep ? '#A78BFA' : 'transparent', borderRight: i < SECTIONS.length - 1 ? '1px solid #0F0C1B' : 'none', transition: 'background 0.3s' }} />
          ))}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '0.8rem', color: calculateCompletion() === 100 ? '#10B981' : '#94A3B8' }}>
          <CheckCircle size={14} /> Profile {calculateCompletion()}% Complete
        </div>
      </div>

      {/* Form Body */}
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          {renderCurrentStep()}
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
        {currentStep > 0 && (
          <SecondaryOutlineButton onClick={() => setCurrentStep(c => c - 1)} style={{ flex: 1 }}>
            <ChevronLeft size={20} /> Back
          </SecondaryOutlineButton>
        )}
        <PrimaryButton onClick={handleSaveAndContinue} style={{ flex: 2, background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
          {isSaving ? 'Saving...' : currentStep === SECTIONS.length - 1 ? 'Finish Profile' : 'Continue'} 
          {!isSaving && currentStep < SECTIONS.length - 1 && <ChevronRight size={20} />}
        </PrimaryButton>
      </div>
    </div>
  );
};
