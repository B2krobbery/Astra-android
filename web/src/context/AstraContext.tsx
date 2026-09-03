import React, { createContext, useContext, useState, useEffect } from 'react';

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
import { mockCandidates } from '../data/mockData';

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

  activeVerificationDetail: VerificationDetail | null;
  showVerification: (type: VerificationType, candidate?: Candidate) => void;
  showUserVerification: (type: VerificationType) => void;
  dismissVerification: () => void;
  verifyPoliceForUser: () => void;

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
  
  
  const loadBackendData = async () => {
    if (!sessionUser) return;
    try {
      const dbProfile = await ProfileService.getProfile(sessionUser.id);
      if (dbProfile) {
         let photoUrl = undefined;
         const { data: photoData } = await supabase.from('profile_photos').select('storage_path').eq('user_id', sessionUser.id).eq('is_primary', true).maybeSingle();
         if (photoData && photoData.storage_path) {
           photoUrl = photoData.storage_path.startsWith('http') 
             ? photoData.storage_path 
             : supabase.storage.from('avatars').getPublicUrl(photoData.storage_path).data.publicUrl;
         }

         setUserProfile({
           ...dbProfile,
           name: dbProfile.display_name || '',
           dateOfBirth: dbProfile.date_of_birth,
           birthLocation: dbProfile.birth_location,
           bloodGroup: dbProfile.blood_group,
           motherTongue: dbProfile.mother_tongue,
           subCaste: dbProfile.sub_caste,
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
           photoUrl: photoUrl,
           hasVoiceNote: !!dbProfile.voice_note_url,
           voiceNoteUrl: dbProfile.voice_note_url,
           voiceNotePrompt: dbProfile.voice_note_prompt
         } as any);
      }
      
      const dbCandidates = await DiscoveryService.getCandidates();
      if (dbCandidates) {
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
      console.error(e);
    }
  };

  useEffect(() => {
    if (sessionUser) loadBackendData();
  }, [sessionUser]);

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
    // Optimistic UI update
    const objectUrl = URL.createObjectURL(file);
    setUserProfile((prev: any) => ({
      ...prev,
      photoUrl: objectUrl,
      completionPercentage: Math.min(100, prev.completionPercentage + 5)
    }));

    if (!sessionUser) return;

    try {
      // 1. Upload to Supabase Storage (avatars bucket)
      const fileExt = file.name.split('.').pop();
      const filePath = `${sessionUser.id}/avatar_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        return;
      }

      // 2. Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // The profiles table doesn't have a photo_url column. 
      // We only use profile_photos table for photos.
      // Remove existing photos (since we only support 1 primary photo currently)
      await supabase.from('profile_photos').delete().eq('user_id', sessionUser.id);
      
      // Insert the new photo
      await supabase.from('profile_photos').insert({
        user_id: sessionUser.id,
        storage_path: publicUrl,
        is_primary: true
      });

      // Update local state with the actual public URL
      setUserProfile((prev: any) => ({
        ...prev,
        photoUrl: publicUrl
      }));
    } catch (e) {
      console.error('Failed to upload user photo to Supabase', e);
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
    return c.regionalCategory === userRegionalPref;
  });

  const activeCandidateList = filteredCandidates;
  const currentCandidate = activeCandidateList[0] || null;

  // Compatibility State
  const [isAnalyzingCompatibility, setIsAnalyzingCompatibility] = useState(false);
  const [currentCompatibility, setCurrentCompatibility] = useState<AstrologyCompatibility | null>(() =>
    AstrologyEngine.calculateCompatibility(initialUserProfile, mockCandidates[0])
  );

  // Messaging & Conversations
  const [conversations, setConversations] = useState<MatchConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<MatchConversation | null>(null);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Astro AI
  const [astroAiMessages, setAstroAiMessages] = useState<ChatMessage[]>(initialAiMessages);
  const [isAstroAiTyping, setIsAstroAiTyping] = useState(false);

  // Verification Modal
  const [activeVerificationDetail, setActiveVerificationDetail] = useState<VerificationDetail | null>(null);

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

  const updateBirthDetails = (dob: string, birthTime: string, birthCity: string, manglik?: string, nadi?: string) => {
    const nakshatra = AstrologyEngine.calculateNakshatra(dob, birthTime, birthCity);
    const rashi = AstrologyEngine.calculateRashi(dob, birthTime, birthCity);
    const autoNadi = AstrologyEngine.calculateNadi(nakshatra);

    setUserProfile((prev: any) => ({
      ...prev,
      dateOfBirth: dob,
      birthTime,
      birthCity,
      nakshatra,
      rashi,
      manglik: manglik || prev.manglik,
      nadi: nadi || autoNadi || prev.nadi
    }));
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

  const updateDatingPreferences = (education: string, location: string) => {
    setUserProfile((prev: any) => ({
      ...prev,
      partnerPreferences: {
        ...prev.partnerPreferences,
        preferredEducation: education,
        preferredLocation: location
      }
    }));
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

    try {
      // Save to backend
      const { isMatch } = await DiscoveryService.interact(candidate.id, 'LIKE');

      if (isMatch) {
        setLastMatchedCandidate(candidate);
        
        // Wait a small moment for the DB trigger to finish creating the conversation
        setTimeout(async () => {
          try {
            const [dbConversations, dbCandidates, dbPending, dbSent] = await Promise.all([
              ChatService.getConversations(),
              DiscoveryService.getCandidates(),
              DiscoveryService.getPendingRequests(),
              DiscoveryService.getSentRequests()
            ]);
            
            if (dbConversations) {
              setConversations(dbConversations as any);
            }
            if (dbCandidates) {
              setCandidates(dbCandidates);
            }
            if (dbPending) {
              setPendingRequests(dbPending);
            }
            if (dbSent) {
              setSentRequests(dbSent);
            }
            const match = dbConversations.find(c => c.candidate.id === candidate.id);
            if (match) {
                 setActiveConversation(match as any);
            }
          } catch (e) {
            console.error('Failed to load new conversation:', e);
          }
        }, 500);

        if (onMatch) {
          onMatch();
        }
      } else {
        if (onNotMatch) {
          onNotMatch();
        }
      }
    } catch (e) {
      console.error('Failed to like candidate:', e);
      if (onNotMatch) {
        onNotMatch();
      }
      // Optionally put them back in the feed if it failed
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
          // Avoid duplicates (since we also insert optimistically)
          if (prev.messages.some(m => m.id === newMsg.id)) return prev;
          return { ...prev, messages: [...prev.messages, newMsg] };
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
      senderName: userProfile.name,
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

    setTimeout(() => {
      const botResponse = AstrologyEngine.getAstroAiResponse(question, userProfile);
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

  const showVerification = (type: VerificationType, candidate?: Candidate) => {
    const target = candidate || currentCandidate || mockCandidates[0];
    const detail = getVerificationDetail(
      type,
      target.name,
      type === VerificationType.EDUCATION ? target.education : 'Digital Authority',
      type === VerificationType.EDUCATION
        ? target.educationDetails || 'Verified Degree'
        : type === VerificationType.POLICE
        ? target.policeDetails || 'Verified Background'
        : target.creditDetails || 'Verified Score'
    );
    setActiveVerificationDetail(detail);
  };

  const showUserVerification = (type: VerificationType) => {
    const detail = getVerificationDetail(
      type,
      userProfile.name,
      'DigiLocker & National Crime Registry',
      'Pending Verification Check'
    );
    setActiveVerificationDetail(detail);
  };

  const dismissVerification = () => {
    setActiveVerificationDetail(null);
  };

  const verifyPoliceForUser = () => {
    setUserProfile((prev: any) => ({
      ...prev,
      policeVerified: true,
      completionPercentage: 100
    }));
    dismissVerification();
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
        candidates,
        filteredCandidates,
        candidateIndex,
        currentCandidate,
        selectedCandidate,
        selectCandidate: setSelectedCandidate,
        likeCandidate,
        passCandidate,
        passedCandidatesHistory,
        pendingRequests,
        sentRequests,
        rewindCandidate,
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
        activeVerificationDetail,
        showVerification,
        showUserVerification,
        dismissVerification,
        verifyPoliceForUser,
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
