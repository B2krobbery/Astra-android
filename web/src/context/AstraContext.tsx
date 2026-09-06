import { calculateMarriageReadiness } from '../utils/profileReadiness';
import { PhotoService, PhotoRequestRecord } from '../services/PhotoService';
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

import {
  UserProfile,
  Candidate,
  AstrologyCompatibility,
  MatchConversation,
  ChatMessage,
  VerificationDetail,
  VerificationType,
  ThemeMode,
  AppLanguage,
  RegionalPreference,
  AiAgent,
  AdminMetrics,
  MarketingCampaign,
  ReferralData
} from '../types';

import { getVerificationDetail, initialAiAgents, initialAdminMetrics, initialMarketingCampaigns, initialReferralData, astroAiKnowledge, suggestedQuestions, initialAiMessages } from '../data/mockData';
import { translations } from '../data/translations';
import { AstrologyEngine } from '../data/astrologyEngine';

import { supabase } from '../lib/supabase';
import { AuthService } from '../services/auth';
import { ProfileService } from '../services/profiles';
import { DiscoveryService } from '../services/discovery';
import { ChatService } from '../services/chat';


const initialUserProfile: UserProfile = {} as UserProfile;

interface AstraContextType {
  sessionUser: any | null;
  signInWithOtp: (phone: string) => Promise<any>;
  verifyOtp: (phone: string, token: string) => Promise<any>;
  signOut: () => Promise<any>;
  deleteAccount: () => Promise<any>;

  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;

  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  userProfile: UserProfile;
  setUserIntent: (intent: 'Dating' | 'Marriage') => void;
  updateProfileInfo: (
    name: string,
    profession: string,
    education: string,
    city: string,
    lookingFor: string[],
    interests: string[],
    regionalPref?: RegionalPreference,
    bio?: string
  ) => void;
  updateBirthDetails: (dob: string, birthTime: string, birthCity: string, manglik?: string, nadi?: string) => void;
  updatePartnerPreferences: (religion: string, caste: string) => void;
  updateDatingPreferences: (education: string, location: string) => void;
  isPreferenceStrictFilterOn: boolean;
  setIsPreferenceStrictFilterOn: (val: boolean) => void;
  uploadUserProfilePhoto: (file: File) => void;
  uploadVoiceNote: (blob: Blob, prompt: string) => Promise<void>;
  deleteVoiceNote: () => Promise<void>;

  regionalPreference: RegionalPreference;
  setRegionalPreference: (pref: RegionalPreference) => void;
  refreshProfile: () => Promise<void>;

  candidates: Candidate[];
  filteredCandidates: Candidate[];
  candidateIndex: number;
  currentCandidate: Candidate | null;
  selectedCandidate: Candidate | null;
  selectCandidate: (candidate: Candidate) => void;
  likeCandidate: (candidate: Candidate, onMatch?: () => void, onNotMatch?: () => void) => void;
  passCandidate: (candidate: Candidate) => void;
  passedCandidatesHistory: Candidate[];
  pendingRequests: Candidate[];
  sentRequests: Candidate[];
  rewindCandidate: () => void;
  resetFeed: () => Promise<void>;
  lastMatchedCandidate: Candidate | null;

  isAnalyzingCompatibility: boolean;
  currentCompatibility: AstrologyCompatibility | null;
  checkCompatibility: (candidate: Candidate, onAnalyzed: () => void) => void;

  conversations: MatchConversation[];
  activeConversation: MatchConversation | null;
  openConversationForCandidate: (candidate: Candidate) => void;
  sendChatMessage: (text: string) => void;
  isChatTyping: boolean;

  astroAiMessages: ChatMessage[];
  askAstroAi: (question: string) => void;
  isAstroAiTyping: boolean;

  isChaanbeanOpen: boolean;
  chaanbeanTarget: Candidate | null;
  openChaanbean: (candidate?: Candidate) => void;
  closeChaanbean: () => void;
  
  
  
  

  // Referral State
  isReferralModalOpen: boolean;
  openReferralModal: () => void;
  closeReferralModal: () => void;
  referralData: ReferralData;

  // Admin AI & KPI State
  aiAgents: AiAgent[];
  runAiAgent: (agentId: string) => void;
  adminMetrics: AdminMetrics;
  marketingCampaigns: MarketingCampaign[];
  addMarketingCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'reach' | 'conversions'>) => void;
  toggleCampaignStatus: (campaignId: string) => void;
}

const AstraContext = createContext<AstraContextType | undefined>(undefined);

export const AstraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Supabase Phase 1 State
  const [sessionUser, setSessionUser] = useState<any | null>(null);
  const isUploadingPhoto = useRef(false);
  
  
  // Keep a stable ref to the current sessionUser so loadBackendData always has fresh auth
  const sessionUserRef = useRef<any>(null);
  useEffect(() => { sessionUserRef.current = sessionUser; }, [sessionUser]);

  const loadBackendData = useCallback(async () => {
    const currentUser = sessionUserRef.current;
    if (!currentUser) return;
    try {
      const dbProfile = await ProfileService.getProfile(currentUser.id);
      if (dbProfile) {
         let photoUrl = undefined;

         // Primary source: avatar_storage_path stored directly on profiles (reliable)
         const avatarPath = dbProfile.avatar_storage_path;
         if (avatarPath) {
           const { data: signedData } = await supabase.storage.from('avatars').createSignedUrl(avatarPath, 3600);
           if (signedData) photoUrl = signedData.signedUrl;
         }

         // Fallback: profile_photos table (for backward compat / other users)
         if (!photoUrl) {
           const { data: photoData } = await supabase.from('profile_photos').select('storage_path').eq('user_id', currentUser.id).eq('is_primary', true).maybeSingle();
           if (photoData && photoData.storage_path) {
             if (photoData.storage_path.startsWith('http')) {
               photoUrl = photoData.storage_path;
             } else {
               const { data: signedData } = await supabase.storage.from('avatars').createSignedUrl(photoData.storage_path, 3600);
               if (signedData) photoUrl = signedData.signedUrl;
             }
           }
         }

         const { data: privateProfileData } = await supabase.from('private_profiles').select('birth_time').eq('id', currentUser.id).maybeSingle();
         const fetchedBirthTime = privateProfileData?.birth_time || '';

         const { data: preferencesData } = await supabase.from('preferences').select('preferred_education, preferred_location, preferred_religion, preferred_caste, preferred_sub_caste, preferred_gotra, tier_religion, tier_caste, tier_sub_caste, tier_gotra, tier_diet').eq('user_id', currentUser.id).maybeSingle();

         const readinessResult = calculateMarriageReadiness({ ...dbProfile, birth_time: fetchedBirthTime }, photoUrl);
         const completionPercentage = readinessResult.percentage;

         setUserProfile((prev: any) => ({
           ...dbProfile,
           name: dbProfile.display_name || '',
           dateOfBirth: dbProfile.date_of_birth,
           birthTime: fetchedBirthTime,
           birthLocation: dbProfile.birth_location || '',
           birthCity: dbProfile.birth_location || dbProfile.birthCity || '',
           nativeLocation: dbProfile.native_location || '',
           bloodGroup: dbProfile.blood_group,
           nakshatra: dbProfile.nakshatra || '',
           rashi: dbProfile.rashi || '',
           manglik: dbProfile.manglik || 'No',
           motherTongue: dbProfile.mother_tongue,
           subCaste: dbProfile.sub_caste,
           cityDistrict: dbProfile.city_district || dbProfile.cityDistrict || '',
           region: dbProfile.region || '',
           state: dbProfile.state || '',
           education10th: dbProfile.education_10th,
           education12th: dbProfile.education_12th,
           higherEducation: dbProfile.higher_education,
           annualIncome: dbProfile.annual_income,
           healthInfo: dbProfile.health_info,
           healthPrivacy: dbProfile.health_privacy,
           maritalStatus: dbProfile.marital_status,
           previousMarriage: dbProfile.previous_marriage,
           childrenStatus: dbProfile.children_status,
           photoPrivacy: dbProfile.photo_privacy,
           lookingFor: dbProfile.looking_for || [],
           regionalPreference: dbProfile.regional_preference,
           bio: dbProfile.bio,
           photoUrl: isUploadingPhoto.current ? prev.photoUrl : photoUrl,
           hasVoiceNote: !!dbProfile.voice_note_url,
           voiceNoteUrl: dbProfile.voice_note_url,
           voiceNotePrompt: dbProfile.voice_note_prompt,
           marriageQuestionnaire: dbProfile.marriage_questionnaire,
           completionPercentage,
           partnerPreferences: {
             preferredEducation: preferencesData?.preferred_education || 'Any',
             preferredLocation: preferencesData?.preferred_location || 'Any',
             preferredReligion: preferencesData?.preferred_religion || 'Any',
             preferredCaste: preferencesData?.preferred_caste || 'Any',
             preferredSubCaste: preferencesData?.preferred_sub_caste || 'Any',
             preferredGotra: preferencesData?.preferred_gotra || 'Any (Except My Own)',
             tierReligion: preferencesData?.tier_religion,
             tierCaste: preferencesData?.tier_caste,
             tierSubCaste: preferencesData?.tier_sub_caste,
             tierGotra: preferencesData?.tier_gotra,
             tierDiet: preferencesData?.tier_diet
           }
         } as any));
      }

      // Load discovery candidates
      let dbCandidates = await DiscoveryService.getCandidates({});
      if (dbCandidates && dbCandidates.length > 0) {
         setCandidates(dbCandidates as any);
      }
      
      const dbConversations = await ChatService.getConversations();
      if (dbConversations) {
        setConversations(dbConversations as any);
      }

      const dbPending = await DiscoveryService.getPendingRequests();
      if (dbPending) {
        setPendingRequests(dbPending as any);
      }
      
      const dbSent = await DiscoveryService.getSentRequests();
      if (dbSent) {
        setSentRequests(dbSent as any);
      }
    } catch (e) {
      console.error('[loadBackendData] error:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionUser) loadBackendData();
  }, [sessionUser, loadBackendData]);

  useEffect(() => {
    AuthService.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
    });
    const { data: authListener } = AuthService.onAuthStateChange((session) => {
      setSessionUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  // Language & Translation
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('astra_language') as AppLanguage) || 'EN';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('astra_language', lang);
  };

  const t = (key: string): string => {
    return (translations as any)[language]?.[key] || (translations as any)['EN']?.[key] || key;
  };

  // Theme Mode
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('astra_theme_mode') as ThemeMode) || 'DARK';
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('astra_theme_mode', mode);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'DARK') {
      root.setAttribute('data-theme', 'dark');
    } else if (themeMode === 'LIGHT') {
      root.setAttribute('data-theme', 'light');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, [themeMode]);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({} as UserProfile);

  const setUserIntent = async (intent: 'Dating' | 'Marriage') => {
    setUserProfile((prev: any) => ({ ...prev, intent }));
    if (sessionUser) {
      try {
        await supabase.from('preferences').update({ intent }).eq('user_id', sessionUser.id);
      } catch (e) {
        console.error('Failed to update intent:', e);
      }
    }
  };

  const uploadUserProfilePhoto = async (file: File) => {
    // Optimistic UI update with local blob URL
    const objectUrl = URL.createObjectURL(file);
    setUserProfile((prev: any) => ({
      ...prev,
      photoUrl: objectUrl,
      completionPercentage: Math.min(100, (prev.completionPercentage || 0) + 20)
    }));

    if (!sessionUser) return;

    isUploadingPhoto.current = true;
    try {
      // 1. Upload file to Supabase Storage (avatars bucket)
      const fileExt = file.name.split('.').pop();
      const filePath = `${sessionUser.id}/avatar_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading photo to storage:', uploadError);
        return;
      }

      // 2. Store path directly on profiles table (simple UPDATE, same RLS as all other profile edits)
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ avatar_storage_path: filePath, updated_at: new Date().toISOString() })
        .eq('id', sessionUser.id);

      if (profileUpdateError) {
        console.error('Error saving avatar path to profile:', profileUpdateError);
        return;
      }

      // 3. Also keep profile_photos in sync (best-effort, non-blocking)
      supabase.from('profile_photos')
        .update({ storage_path: filePath })
        .eq('user_id', sessionUser.id)
        .eq('is_primary', true)
        .then(({ error }) => {
          if (error) {
            // If update found no rows, insert
            supabase.from('profile_photos').insert({
              user_id: sessionUser.id,
              storage_path: filePath,
              is_primary: true
            }).then(({ error: ie }) => {
              if (ie) console.error('profile_photos sync error:', ie);
            });
          }
        });

      // 4. Create signed URL and update local state
      const { data: signedData } = await supabase.storage
        .from('avatars')
        .createSignedUrl(filePath, 3600);

      setUserProfile((prev: any) => ({
        ...prev,
        photoUrl: signedData?.signedUrl || objectUrl
      }));
    } catch (e) {
      console.error('Failed to upload user photo to Supabase', e);
    } finally {
      isUploadingPhoto.current = false;
    }
  };

  const uploadVoiceNote = async (blob: Blob, prompt: string) => {
    if (!sessionUser) return;
    try {
      const filePath = `${sessionUser.id}/voice_note_${Date.now()}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from('voice_notes')
        .upload(filePath, blob, { upsert: true, contentType: 'audio/webm' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('voice_notes')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      await supabase.from('profiles').update({
        voice_note_url: publicUrl,
        voice_note_prompt: prompt,
        updated_at: new Date().toISOString()
      }).eq('id', sessionUser.id);

      setUserProfile((prev: any) => ({
        ...prev,
        hasVoiceNote: true,
        voiceNoteUrl: publicUrl,
        voiceNotePrompt: prompt
      }));
    } catch (e) {
      console.error('Failed to upload voice note:', e);
      throw e;
    }
  };

  const deleteVoiceNote = async () => {
    if (!sessionUser) return;
    try {
      await supabase.from('profiles').update({
        voice_note_url: null,
        voice_note_prompt: null,
        updated_at: new Date().toISOString()
      }).eq('id', sessionUser.id);

      setUserProfile((prev: any) => ({
        ...prev,
        hasVoiceNote: false,
        voiceNoteUrl: undefined,
        voiceNotePrompt: undefined
      }));
    } catch (e) {
      console.error('Failed to delete voice note:', e);
      throw e;
    }
  };

  // Candidates & Regional Filtering
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [passedCandidatesHistory, setPassedCandidatesHistory] = useState<Candidate[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Candidate[]>([]);
  const [incomingPhotoRequests, setIncomingPhotoRequests] = useState<PhotoRequestRecord[]>([]);
  const loadIncomingPhotoRequests = async () => { const reqs = await PhotoService.getIncomingRequests(); setIncomingPhotoRequests(reqs); };
  const [sentRequests, setSentRequests] = useState<Candidate[]>([]);
  const [candidateIndex] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [lastMatchedCandidate, setLastMatchedCandidate] = useState<Candidate | null>(null);

  const [isPreferenceStrictFilterOn, setIsPreferenceStrictFilterOn] = useState(false);

  const filteredCandidates = candidates.filter((c: any) => {
    // Filter by Intent strictly
    if (userProfile.intent && c.intent && userProfile.intent !== c.intent) return false;

    // Strict Partner Preferences Check
    if (isPreferenceStrictFilterOn && userProfile.partnerPreferences) {
      const prefs = userProfile.partnerPreferences;
      
      if (userProfile.intent === 'Marriage') {
        if (prefs.preferredReligion && prefs.preferredReligion !== 'Any' && c.religion !== prefs.preferredReligion) return false;
        if (prefs.preferredCaste && prefs.preferredCaste !== 'Any' && c.caste !== prefs.preferredCaste) return false;
      } else {
        if (prefs.preferredEducation && prefs.preferredEducation !== 'Any' && !c.education.includes(prefs.preferredEducation)) return false;
        if (prefs.preferredLocation && prefs.preferredLocation !== 'Any' && c.location !== prefs.preferredLocation) return false;
      }
    }

    if (userProfile.gender === 'Male' && c.gender === 'Male') return false;
    if (userProfile.gender === 'Female' && c.gender === 'Female') return false;
    
    // Regional Prefs
    const userRegionalPref = userProfile.regionalPreference || 'ALL';
    if (userRegionalPref === 'ALL') return true;
    if (!c.regionalCategory || c.regionalCategory === 'ALL') return true;
    
    // Map the enum keys to the human readable strings used in the DB
    const regionalMapping: Record<string, string> = {
      'KERALA': 'Kerala',
      'NORTH_INDIA': 'North India',
      'SOUTH_INDIA': 'South India',
      'WEST_INDIA': 'West India',
      'EAST_INDIA': 'East India',
      'CENTRAL_INDIA': 'Central India',
      'NRI': 'NRI'
    };
    
    const mappedPref = regionalMapping[userRegionalPref] || userRegionalPref;
    if (userRegionalPref === 'KERALA') {
      return c.regionalCategory === 'Kerala' || c.regionalCategory === 'South India' || c.regionalCategory === 'ALL';
    }
    return c.regionalCategory === mappedPref || c.regionalCategory === 'ALL';
  });

  const activeCandidateList = filteredCandidates;
  const currentCandidate = activeCandidateList[0] || null;

  // Compatibility State
  const [isAnalyzingCompatibility, setIsAnalyzingCompatibility] = useState(false);
  const [currentCompatibility, setCurrentCompatibility] = useState<AstrologyCompatibility | null>(() =>
    AstrologyEngine.calculateCompatibility(initialUserProfile, ({ name: 'Unknown', education: 'Unknown', profession: 'Unknown', age: 25, location: 'Unknown', gender: 'Female', regionalCategory: 'ALL', photoUrls: [], isVerified: false } as any))
  );

  // Messaging & Conversations
  const [conversations, setConversations] = useState<MatchConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<MatchConversation | null>(null);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Astro AI
  const [astroAiMessages, setAstroAiMessages] = useState<ChatMessage[]>(initialAiMessages);
  const [isAstroAiTyping, setIsAstroAiTyping] = useState(false);

  // Verification Modal
  const [isChaanbeanOpen, setIsChaanbeanOpen] = useState(false);
  const [chaanbeanTarget, setChaanbeanTarget] = useState<Candidate | null>(null);

  // Referral Modal State
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referralData] = useState<ReferralData>(initialReferralData);

  // Admin AI Agents & Analytics State
  const [aiAgents, setAiAgents] = useState<AiAgent[]>(initialAiAgents);
  const [adminMetrics] = useState<AdminMetrics>(initialAdminMetrics);
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>(initialMarketingCampaigns);

  const setRegionalPreference = (pref: RegionalPreference) => {
    setUserProfile((prev: any) => ({ ...prev, regionalPreference: pref }));
  };

  const updateProfileInfo = async (
    name: string,
    profession: string,
    education: string,
    city: string,
    lookingFor: string[],
    interests: string[],
    regionalPref?: RegionalPreference,
    bio?: string
  ) => {
    const finalName = name || userProfile.name;
    const finalProfession = profession || userProfile.profession;
    const finalEducation = education || userProfile.education;
    const finalLocation = city || userProfile.location;
    const finalLookingFor = lookingFor?.length ? lookingFor : userProfile.lookingFor;
    const finalRegionalPref = regionalPref || userProfile.regionalPreference;
    const finalInterests = interests?.length ? interests : userProfile.interests;
    const finalBio = bio !== undefined ? bio : userProfile.bio;

    setUserProfile((prev: any) => ({
      ...prev,
      name: finalName,
      profession: finalProfession,
      education: finalEducation,
      higherEducation: finalEducation,
      location: finalLocation,
      lookingFor: finalLookingFor,
      interests: finalInterests,
      regionalPreference: finalRegionalPref,
      bio: finalBio
    }));

    if (sessionUser) {
      try {
        await supabase.from('profiles').update({
          display_name: finalName,
          profession: finalProfession,
          higher_education: finalEducation,
          location: finalLocation,
          looking_for: finalLookingFor,
          regional_preference: finalRegionalPref,
          bio: finalBio,
          updated_at: new Date().toISOString()
        }).eq('id', sessionUser.id);
      } catch (e) {
        console.error('Failed to update profile in DB', e);
      }
    }
  };

  const updateBirthDetails = async (dob: string, birthTime: string, birthCity: string) => {
    const chart = AstrologyEngine.calculateChart(dob, birthTime, birthCity);
    const coords = AstrologyEngine.getCoordinatesForCity(birthCity);

    setUserProfile((prev: any) => {
      const updated = {
        ...prev,
        dateOfBirth: dob,
        birthTime,
        birthLocation: birthCity,
        nakshatra: chart.nakshatraName,
        rashi: chart.rashiName,
        nadi: chart.nadiName,
        manglik: chart.isManglik ? 'Yes' : 'No',
        nakshatraPada: chart.pada
      };
      const r = calculateMarriageReadiness(updated, updated.photoUrl);
      return {
        ...updated,
        completionPercentage: r.percentage,
        onboardingCompleted: r.isComplete
      };
    });

    if (sessionUser) {
      try {
        await supabase.from('profiles').update({
          date_of_birth: dob,
          birth_location: birthCity,
          nakshatra: chart.nakshatraName,
          rashi: chart.rashiName,
          nadi: chart.nadiName,
          manglik: chart.isManglik ? 'Yes' : 'No',
          nakshatra_pada: chart.pada,
          updated_at: new Date().toISOString()
        }).eq('id', sessionUser.id);

        await supabase.from('private_profiles').upsert({
          id: sessionUser.id,
          birth_time: birthTime,
          birth_latitude: coords.lat,
          birth_longitude: coords.lon,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      } catch (e) {
        console.error('Failed to update birth details in DB', e);
      }
    }
  };

  const updatePartnerPreferences = (religion: string, caste: string) => {
    setUserProfile((prev: any) => ({
      ...prev,
      partnerPreferences: {
        ...prev.partnerPreferences,
        preferredReligion: religion,
        preferredCaste: caste
      }
    }));
  };

  const updateDatingPreferences = async (education: string, location: string) => {
    setUserProfile((prev: any) => ({
      ...prev,
      partnerPreferences: {
        ...prev.partnerPreferences,
        preferredEducation: education,
        preferredLocation: location
      }
    }));

    if (sessionUser) {
      try {
        await supabase.from('preferences').upsert({
          user_id: sessionUser.id,
          preferred_education: education === 'Any' ? null : education,
          preferred_location: location === 'Any' ? null : location,
          preferred_religion: userProfile?.partnerPreferences?.preferredReligion === 'Any' ? null : userProfile?.partnerPreferences?.preferredReligion,
          preferred_caste: userProfile?.partnerPreferences?.preferredCaste === 'Any' ? null : userProfile?.partnerPreferences?.preferredCaste,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      } catch (e) {
        console.error('Failed to update dating preferences', e);
      }
    }
  };

  const selectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setCurrentCompatibility(AstrologyEngine.calculateCompatibility(userProfile, candidate));
  };

  const likeCandidate = async (candidate: Candidate, onMatch?: () => void, onNotMatch?: () => void) => {
    // Remove from UI immediately for snappy feel
    setCandidates((prev: any) => {
      return prev.filter((c: any) => c.id !== candidate.id);
    });
    
    // Optimistically add to Sent Requests
    setSentRequests((prev: any) => [candidate, ...prev]);

    try {
      // Save to backend
      const { isMatch } = await DiscoveryService.interact(candidate.id, 'LIKE');

      if (isMatch) {
        setLastMatchedCandidate(candidate);
        if (onMatch) {
          onMatch();
        }
      } else {
        if (onNotMatch) {
          onNotMatch();
        }
      }

      // Always wait a moment for the DB to settle, then refresh all data
      setTimeout(async () => {
        try {
          const [dbConversations, dbCandidates, dbPending, dbSent] = await Promise.all([
            
            ChatService.getConversations(),
            DiscoveryService.getCandidates(), // We should ideally pass filters here too, but this is init.
            DiscoveryService.getPendingRequests(),

            DiscoveryService.getSentRequests()
          ]);
          
          if (dbConversations) setConversations(dbConversations as any);
          if (dbCandidates) setCandidates(dbCandidates);
          if (dbPending) setPendingRequests(dbPending);
          if (dbSent) setSentRequests(dbSent);
          
          if (isMatch) {
            const match = dbConversations?.find(c => c.candidate.id === candidate.id);
            if (match) {
              setActiveConversation(match as any);
            }
          }
        } catch (e) {
          console.error('Failed to load updated data after like:', e);
        }
      }, 500);

    } catch (e) {
      console.error('Failed to like candidate:', e);
      // Remove from sent requests if failed
      setSentRequests((prev: any) => prev.filter((c: any) => c.id !== candidate.id));
      if (onNotMatch) {
        onNotMatch();
      }
    }
  };

  const passCandidate = (candidate: Candidate) => {
    setPassedCandidatesHistory(prev => [...prev, candidate]);
    
    // Save to backend
    DiscoveryService.interact(candidate.id, 'PASS').catch(console.error);

    setCandidates((prev: any) => {
      return prev.filter((c: any) => c.id !== candidate.id);
    });
  };

  const rewindCandidate = () => {
    setPassedCandidatesHistory(prev => {
      if (prev.length === 0) return prev;
      const lastPassed = prev[prev.length - 1];
      
      setCandidates(currentCandidates => [lastPassed, ...currentCandidates]);
      
      return prev.slice(0, prev.length - 1);
    });
  };

  const resetFeed = async () => {
    try {
      await DiscoveryService.resetInteractions();
      const dbCandidates = await DiscoveryService.getCandidates();
      if (dbCandidates) {
        setCandidates(dbCandidates as any);
      }
      setPassedCandidatesHistory([]);
      setSentRequests([]);
      setPendingRequests([]);
      setConversations([]);
    } catch (e) {
      console.error("Error resetting feed:", e);
    }
  };

  const checkCompatibility = (candidate: Candidate, onAnalyzed: () => void) => {
    setSelectedCandidate(candidate);
    setIsAnalyzingCompatibility(true);
    setTimeout(() => {
      setCurrentCompatibility(AstrologyEngine.calculateCompatibility(userProfile, candidate));
      setIsAnalyzingCompatibility(false);
      onAnalyzed();
    }, 1400);
  };

  const openConversationForCandidate = async (candidate: Candidate) => {
    // 1. Try to see if the backend has a REAL conversation for this candidate
    let realConvoId = null;
    try {
      const dbConversations = await ChatService.getConversations();
      if (dbConversations) {
        setConversations(dbConversations as any);
        const match = dbConversations.find(c => c.candidate.id === candidate.id);
        if (match) {
          realConvoId = match.id;
        }
      }
    } catch (e) {
      console.error('Failed to sync conversations before opening:', e);
    }

    // 2. Find or create the conversation object
    let convo = conversations.find(c => c.candidate.id === candidate.id);
    if (!convo || (realConvoId && convo.id.startsWith('mock_'))) {
      // If we found a real one, but local was mock, update local.
      convo = {
        id: realConvoId || `temp_${Date.now()}`,
        candidate,
        lastMessage: '',
        timestamp: 'Just now',
        unreadCount: 0,
        messages: []
      };
      setConversations((prev: any) => {
        const filtered = prev.filter((p: any) => p.candidate.id !== candidate.id);
        return [convo, ...filtered];
      });
    }

    // If we have a real convo ID that isn't attached to convo yet (e.g. from state closure)
    if (realConvoId && convo.id !== realConvoId) {
       convo.id = realConvoId;
    }

    setActiveConversation(convo as any);

    if (convo && !convo.id.startsWith('temp_') && !convo.id.startsWith('mock_')) {
      // Fetch messages from backend
      const msgs = await ChatService.getMessages(convo.id);
      setActiveConversation(prev => prev ? { ...prev, messages: msgs } : null);

      // Set up real-time subscription
      const sub = ChatService.subscribeToMessages(convo.id, (newMsg) => {
        setActiveConversation(prev => {
          if (!prev) return prev;
          
          // Remove any temporary optimistic message with the exact same text that we just sent
          const filteredMessages = prev.messages.filter(m => 
            !(m.id.startsWith('temp_') && m.message === newMsg.message && m.isFromUser === newMsg.isFromUser)
          );

          // Avoid duplicates if the real message was already inserted
          if (filteredMessages.some(m => m.id === newMsg.id)) return prev;
          
          return { ...prev, messages: [...filteredMessages, newMsg] };
        });
        
        setConversations(prevConvos => prevConvos.map(c => {
          if (c.id === convo.id) {
            return {
              ...c,
              lastMessage: newMsg.message,
              timestamp: 'Just now'
            };
          }
          return c;
        }));
      });
      
      // Cleanup previous subscription? Handled globally or on unmount ideally, 
      // but for now we rely on Supabase handling channel duplication.
    }
  };

  const sendChatMessage = async (text: string) => {
    if (!activeConversation || !text.trim()) return;

    const userMsg = {
      id: `temp_${Date.now()}`,
      senderName: 'You', // Consistently use 'You' to match real-time incoming messages
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromUser: true
    };

    setConversations((prev: any) =>
      prev.map((c: any) => {
        if (c.candidate.id === activeConversation.candidate.id) {
          return {
            ...c,
            lastMessage: text,
            timestamp: 'Just now',
            messages: [...c.messages, userMsg]
          };
        }
        return c;
      })
    );

    setActiveConversation((prev: any) => (prev ? { ...prev, messages: [...prev.messages, userMsg] } : null));
    
    if (activeConversation) {
      if (activeConversation.id.startsWith('temp_') || activeConversation.id.startsWith('mock_')) {
        alert("You can't send messages until you both match!");
        // Revert optimistic UI update
        setActiveConversation((prev: any) => (prev ? { ...prev, messages: prev.messages.filter((m: any) => m.id !== userMsg.id) } : null));
        return;
      }

      try {
        await ChatService.sendMessage(activeConversation.id, text);
      } catch (error) {
        console.error('Failed to send message:', error);
        alert("Failed to send message. Please try again.");
      }
    }
  };

  const askAstroAi = (question: string) => {
    const userMsg: ChatMessage = {
      id: `ai_${Date.now()}`,
      senderName: userProfile.name,
      message: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromUser: true
    };

    setAstroAiMessages((prev: any) => [...prev, userMsg]);
    setIsAstroAiTyping(true);

    setTimeout(async () => {
      const botResponse = await AstrologyEngine.getAstroAiResponse(question, userProfile, currentCandidate ? AstrologyEngine.calculateCompatibility(userProfile, currentCandidate) : undefined);
      const aiMsg: ChatMessage = {
        id: `ai_resp_${Date.now()}`,
        senderName: 'Astro AI Guide',
        message: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFromUser: false
      };
      setAstroAiMessages((prev: any) => [...prev, aiMsg]);
      setIsAstroAiTyping(false);
    }, 1600);
  };

  const openChaanbean = (candidate?: Candidate) => {
    setChaanbeanTarget(candidate || null);
    setIsChaanbeanOpen(true);
  };
  const closeChaanbean = () => {
    setIsChaanbeanOpen(false);
    setChaanbeanTarget(null);
  };

  

  

  

  const openReferralModal = () => setIsReferralModalOpen(true);
  const closeReferralModal = () => setIsReferralModalOpen(false);

  const runAiAgent = (agentId: string) => {
    setAiAgents((prev: any) =>
      prev.map((agent: any) => {
        if (agent.id === agentId) {
          return {
            ...agent,
            status: 'RUNNING',
            lastRun: 'Just now',
            logs: [`[${new Date().toLocaleTimeString()}] Executing autonomous AI cycle...`, ...agent.logs]
          };
        }
        return agent;
      })
    );

    setTimeout(() => {
      setAiAgents((prev: any) =>
        prev.map((agent: any) => {
          if (agent.id === agentId) {
            return {
              ...agent,
              status: 'COMPLETED',
              logs: [`[${new Date().toLocaleTimeString()}] Autonomous cycle completed successfully.`, ...agent.logs]
            };
          }
          return agent;
        })
      );
    }, 2000);
  };

  const addMarketingCampaign = (campaignData: Omit<MarketingCampaign, 'id' | 'reach' | 'conversions'>) => {
    const newCamp: MarketingCampaign = {
      id: `camp_${Date.now()}`,
      reach: 0,
      conversions: 0,
      ...campaignData
    };
    setMarketingCampaigns((prev: any) => [newCamp, ...prev]);
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setMarketingCampaigns((prev: any) =>
      prev.map((c: any) => (c.id === campaignId ? { ...c, status: c.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE' } : c))
    );
  };

  return (
    <AstraContext.Provider
      value={{sessionUser, signInWithOtp: AuthService.signInWithOtp, verifyOtp: AuthService.verifyOtp, signOut: AuthService.signOut, deleteAccount: AuthService.deleteAccount,
        language,
        setLanguage,
        t,
        themeMode,
        setThemeMode,
        userProfile,
        setUserIntent,
        updateProfileInfo,
        uploadVoiceNote,
        deleteVoiceNote,
        updateBirthDetails,
        updatePartnerPreferences,
        updateDatingPreferences,
        isPreferenceStrictFilterOn,
        setIsPreferenceStrictFilterOn,
        uploadUserProfilePhoto,
        regionalPreference: userProfile.regionalPreference,
        setRegionalPreference,
        refreshProfile: loadBackendData,
        candidates,
        filteredCandidates,
        candidateIndex,
        currentCandidate: filteredCandidates[candidateIndex] || null,
        selectedCandidate,
        selectCandidate: setSelectedCandidate,
        likeCandidate,
        passCandidate,
        passedCandidatesHistory,
        pendingRequests,
        sentRequests,
        rewindCandidate,
        resetFeed,
        lastMatchedCandidate,
        isAnalyzingCompatibility,
        currentCompatibility,
        checkCompatibility,
        conversations,
        activeConversation,
        openConversationForCandidate,
        sendChatMessage,
        isChatTyping,
        astroAiMessages,
        askAstroAi,
        isAstroAiTyping,
        isChaanbeanOpen, chaanbeanTarget, openChaanbean, closeChaanbean,
        
        
        
        
        isReferralModalOpen,
        openReferralModal,
        closeReferralModal,
        referralData,
        aiAgents,
        runAiAgent,
        adminMetrics,
        marketingCampaigns,
        addMarketingCampaign,
        toggleCampaignStatus
      }}
    >
      {children}
    </AstraContext.Provider>
  );
};

export const useAstra = () => {
  const context = useContext(AstraContext);
  if (!context) {
    throw new Error('useAstra must be used within an AstraProvider');
  }
  return context;
};
