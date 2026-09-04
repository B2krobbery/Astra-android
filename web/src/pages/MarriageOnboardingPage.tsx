import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';
import { ChevronLeft, ChevronRight, CheckCircle, Upload, Shield, Sparkles, Camera } from 'lucide-react';
import { useAstra } from '../context/AstraContext';
import { supabase } from '../lib/supabase';
import { indianReligions, Religion, Caste } from '../data/indianCastes';
import { commonSubcastes, commonGotras } from '../data/indianSubcastesGotras';
import { CandidateAvatar } from '../components/CandidateAvatar';

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
  'Photos & Privacy',
  'Personal Values & Vision',
  'Partner Preferences'
];

export const MarriageOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, updateBirthDetails, updatePartnerPreferences, uploadUserProfilePhoto } = useAstra();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadUserProfilePhoto(e.target.files[0]);
    }
  };
  
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
  
  // Custom Autocomplete State for Caste
  const [casteSearchQuery, setCasteSearchQuery] = useState('');
  const [isCasteDropdownOpen, setIsCasteDropdownOpen] = useState(false);
  
  const [gotra, setGotra] = useState(userProfile?.gotra || '');
  const [gotraSearchQuery, setGotraSearchQuery] = useState('');
  const [isGotraDropdownOpen, setIsGotraDropdownOpen] = useState(false);

  const [subCasteSearchQuery, setSubCasteSearchQuery] = useState('');
  const [isSubCasteDropdownOpen, setIsSubCasteDropdownOpen] = useState(false);

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

  // Step 6: Astrology & Numerology
  const [manglik, setManglik] = useState(userProfile?.manglik || 'Don\'t Know');
  const [nadi, setNadi] = useState(userProfile?.nadi || '');
  // Step 7: Interests
  const [interests, setInterests] = useState<string[]>(userProfile?.lookingFor || []);

  // Step 8: Photos & Privacy
  const [photoPrivacy, setPhotoPrivacy] = useState(userProfile?.photoPrivacy || 'public');

  // Step 9: Partner Preferences
  const [preferredReligion, setPreferredReligion] = useState(userProfile?.partnerPreferences?.preferredReligion || '');
  const [preferredCaste, setPreferredCaste] = useState(userProfile?.partnerPreferences?.preferredCaste || '');

  // Step 10: Personal Values & Vision
  const [marriageQuestionnaire, setMarriageQuestionnaire] = useState<Record<string, string>>(userProfile?.marriageQuestionnaire || {});

  // -- Cascading Logic --
  const selectedReligionObj = indianReligions.find(r => r.name === religion);


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
    if (currentStep === 6) {
      updateBirthDetails(dateOfBirth, birthTime, birthLocation, manglik, nadi);
    }

    if (currentStep < SECTIONS.length - 1) {
      setCurrentStep(curr => curr + 1);
      return;
    }

    // Final Save
    setIsSaving(true);
    updatePartnerPreferences(preferredReligion, preferredCaste);
    
    try {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) throw new Error("No user session");

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
        marriage_questionnaire: marriageQuestionnaire,
        onboarding_completed: true,
        intent: 'Marriage',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Update private profiles table for sensitive birth data
      await supabase
        .from('private_profiles')
        .upsert({ id: user.id, birth_time: birthTime, updated_at: new Date().toISOString() });

      // Save match preferences
      await supabase
        .from('preferences')
        .upsert({ 
          user_id: user.id, 
          preferred_religion: preferredReligion,
          preferred_caste: preferredCaste,
          gender_preference: gender === 'Male' ? 'Female' : gender === 'Female' ? 'Male' : 'Everyone',
          updated_at: new Date().toISOString()
        });

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

  const renderCasteSelect = () => {
    const options = selectedReligionObj?.castes.map(c => c.name) || [];
    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(casteSearchQuery.toLowerCase()));

    return (
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>Community / Caste</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={isCasteDropdownOpen ? casteSearchQuery : (caste || '')}
            onChange={e => {
              setCasteSearchQuery(e.target.value);
              setIsCasteDropdownOpen(true);
            }}
            onFocus={() => {
              setCasteSearchQuery('');
              setIsCasteDropdownOpen(true);
            }}
            placeholder={caste || "Search Community / Caste"}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1E1836', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '1rem', outline: 'none' }}
          />
          {isCasteDropdownOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '200px', overflowY: 'auto', background: '#1E1836', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', zIndex: 10, marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                <div 
                  key={opt}
                  onClick={() => {
                    setCaste(opt);
                    setIsCasteDropdownOpen(false);
                    setCasteSearchQuery('');
                  }}
                  style={{ padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#FFF', fontSize: '0.95rem' }}
                >
                  {opt}
                </div>
              )) : (
                <div style={{ padding: '12px 14px', color: '#94A3B8', fontSize: '0.95rem' }}>No matches found</div>
              )}
            </div>
          )}
        </div>
        {/* Transparent overlay to close dropdown when clicking outside */}
        {isCasteDropdownOpen && (
          <div 
            onClick={() => setIsCasteDropdownOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }}
          />
        )}
      </div>
    );
  };

  const renderSubCasteSelect = () => {
    const options = commonSubcastes;
    const filteredOptions = subCasteSearchQuery.trim() === '' 
      ? options 
      : options.filter((c: string) => c.toLowerCase().includes(subCasteSearchQuery.toLowerCase()));

    // Keep whatever the user typed so they can save custom values!
    const displayValue = isSubCasteDropdownOpen ? subCasteSearchQuery : (subCaste || '');

    return (
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>Sub-Caste (Optional)</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={displayValue}
            onChange={e => {
              setSubCasteSearchQuery(e.target.value);
              setSubCaste(e.target.value); // Continuously save so custom input works
              setIsSubCasteDropdownOpen(true);
            }}
            onFocus={() => {
              setSubCasteSearchQuery(subCaste || '');
              setIsSubCasteDropdownOpen(true);
            }}
            placeholder="Search or type Sub-Caste"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1E1836', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '1rem', outline: 'none' }}
          />
          {isSubCasteDropdownOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '200px', overflowY: 'auto', background: '#1E1836', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', zIndex: 10, marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {filteredOptions.length > 0 ? filteredOptions.map((opt: string) => (
                <div 
                  key={opt}
                  onClick={() => {
                    setSubCaste(opt);
                    setIsSubCasteDropdownOpen(false);
                    setSubCasteSearchQuery('');
                  }}
                  style={{ padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#FFF', fontSize: '0.95rem' }}
                >
                  {opt}
                </div>
              )) : (
                <div 
                  onClick={() => {
                    // It's already in subCaste state, just close dropdown
                    setIsSubCasteDropdownOpen(false);
                  }}
                  style={{ padding: '12px 14px', cursor: 'pointer', color: 'var(--accent-amber)', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  Press Enter or Tap here to save "{subCasteSearchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
        {isSubCasteDropdownOpen && (
          <div 
            onClick={() => setIsSubCasteDropdownOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }}
          />
        )}
      </div>
    );
  };

  const renderGotraSelect = () => {
    const options = commonGotras;
    const filteredOptions = gotraSearchQuery.trim() === '' 
      ? options 
      : options.filter((c: string) => c.toLowerCase().includes(gotraSearchQuery.toLowerCase()));

    const displayValue = isGotraDropdownOpen ? gotraSearchQuery : (gotra || '');

    return (
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>Gotra (Optional)</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={displayValue}
            onChange={e => {
              setGotraSearchQuery(e.target.value);
              setGotra(e.target.value); // Continuously save for custom input
              setIsGotraDropdownOpen(true);
            }}
            onFocus={() => {
              setGotraSearchQuery(gotra || '');
              setIsGotraDropdownOpen(true);
            }}
            placeholder="Search or type Gotra"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1E1836', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '1rem', outline: 'none' }}
          />
          {isGotraDropdownOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '200px', overflowY: 'auto', background: '#1E1836', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', zIndex: 10, marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {filteredOptions.length > 0 ? filteredOptions.map((opt: string) => (
                <div 
                  key={opt}
                  onClick={() => {
                    setGotra(opt);
                    setIsGotraDropdownOpen(false);
                    setGotraSearchQuery('');
                  }}
                  style={{ padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#FFF', fontSize: '0.95rem' }}
                >
                  {opt}
                </div>
              )) : (
                <div 
                  onClick={() => setIsGotraDropdownOpen(false)}
                  style={{ padding: '12px 14px', cursor: 'pointer', color: 'var(--accent-amber)', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  Press Enter or Tap here to save "{gotraSearchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
        {isGotraDropdownOpen && (
          <div 
            onClick={() => setIsGotraDropdownOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }}
          />
        )}
      </div>
    );
  };

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
            {religion && renderCasteSelect()}
            {caste && renderSubCasteSelect()}
            {renderGotraSelect()}
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
          <div style={{ textAlign: 'left', padding: '10px 0' }}>
            <h4 style={{ color: 'white', marginBottom: '8px' }}>Vedic Astrology Details</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '24px' }}>
              Your Rashi and Nakshatra are calculated automatically from your birth details. Please confirm your Manglik and Nadi status.
            </p>
            
            {renderSelect('Manglik (Kuja) Dosha', manglik, setManglik, ['Yes', 'No', 'Anshik (Partial)', 'Don\'t Know'])}
            {renderSelect('Nadi', nadi, setNadi, ['Aadi (First)', 'Madhya (Middle)', 'Antya (Last)', 'Don\'t Know'])}
            
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  import('../data/astrologyEngine').then(({ AstrologyEngine }) => {
                    const tempNakshatra = AstrologyEngine.calculateNakshatra(dateOfBirth, birthTime, birthLocation);
                    setNadi(AstrologyEngine.calculateNadi(tempNakshatra));
                    setManglik(AstrologyEngine.calculateManglikDosha(dateOfBirth, birthTime, birthLocation));
                  });
                }}
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid var(--accent-amber)',
                  color: 'var(--accent-amber)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✨ Auto-Calculate for me
              </button>
            </div>
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
            <div style={{ position: 'relative', cursor: 'pointer', display: 'inline-block', marginBottom: '24px' }} onClick={() => fileInputRef.current?.click()}>
              <CandidateAvatar src={userProfile?.photoUrl} name={userProfile?.name || 'User'} size={96} isVerified={userProfile?.policeVerified} />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--accent-amber)',
                  color: '#0F0C1B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)'
                }}
              >
                <Camera size={16} />
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />

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
              <h5 style={{ color: 'white', fontSize: '1.1rem', margin: '0 0 8px 0' }}>Private</h5>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>Photos are hidden. You must manually reveal them to individual matches.</p>
            </div>
          </div>
        );
      case 10:
        return (
          <div style={{ textAlign: 'left', padding: '10px 0' }}>
            <h4 style={{ color: 'white', marginBottom: '8px' }}>Personal Values & Vision</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '24px' }}>
              Answer these questions to help potential matches understand you better.
            </p>
            {[
              { id: 'q1', text: 'What are your future career plans and goals?' },
              { id: 'q2', text: 'How do you balance your work life and personal life?' },
              { id: 'q3', text: 'What is your view on sharing household responsibilities?' },
              { id: 'q4', text: 'How do you manage your finances and investments?' },
              { id: 'q5', text: 'How important is family involvement in your daily life?' },
              { id: 'q6', text: 'What are your preferences regarding living arrangements after marriage?' },
              { id: 'q7', text: 'How do you usually handle disagreements or conflicts?' },
              { id: 'q8', text: 'What are your views on starting a family and raising children?' },
              { id: 'q9', text: 'How do you like to spend your weekends and free time?' },
              { id: 'q10', text: 'What is the most important quality you seek in a partner?' }
            ].map(q => (
              <div key={q.id} style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#E2E8F0', fontSize: '0.95rem' }}>
                  {q.text}
                </label>
                <textarea
                  value={marriageQuestionnaire[q.id] || ''}
                  onChange={(e) => setMarriageQuestionnaire(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Your answer..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFF',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            ))}
          </div>
        );
      case 11:
        return (
          <div style={{ textAlign: 'left', padding: '10px 0' }}>
            <h4 style={{ color: 'white', marginBottom: '8px' }}>Partner Preferences</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '24px' }}>
              We'll use this to build a strict 'Preferences' feed for you.
            </p>
            {renderSelect('Preferred Religion', preferredReligion, setPreferredReligion, ['Any', ...indianReligions.map(r => r.name)])}
            {preferredReligion && preferredReligion !== 'Any' && (
               renderSelect('Preferred Caste', preferredCaste, setPreferredCaste, ['Any', ...(indianReligions.find(r => r.name === preferredReligion)?.castes.map(c => c.name) || [])])
            )}
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
