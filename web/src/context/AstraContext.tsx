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


const initialUserProfile: UserProfile = {} as UserProfile;

interface AstraContextType {
  sessionUser: any | null;
  signInWithOtp: (phone: string) => Promise<any>;
  verifyOtp: (phone: string, token: string) => Promise<any>;
  signOut: () => Promise<any>;

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
    regionalPref?: RegionalPreference
  ) => void;
  updateBirthDetails: (dob: string, birthTime: string, birthCity: string, manglik?: string, nadi?: string) => void;
  updatePartnerPreferences: (religion: string, caste: string) => void;
  updateDatingPreferences: (education: string, location: string) => void;
  isPreferenceStrictFilterOn: boolean;
  setIsPreferenceStrictFilterOn: (val: boolean) => void;
  uploadUserProfilePhoto: (file: File) => void;

  regionalPreference: RegionalPreference;
  setRegionalPreference: (pref: RegionalPreference) => void;

  candidates: Candidate[];
  filteredCandidates: Candidate[];
  candidateIndex: number;
  currentCandidate: Candidate | null;
  selectedCandidate: Candidate | null;
  selectCandidate: (candidate: Candidate) => void;
  likeCandidate: (candidate: Candidate, onMatch: () => void) => void;
  passCandidate: (candidate: Candidate) => void;
  passedCandidatesHistory: Candidate[];
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
         setUserProfile(dbProfile as any);
      }
      
      const dbCandidates = await DiscoveryService.getCandidates();
      if (dbCandidates) {
         setCandidates(dbCandidates as any);
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

  const setUserIntent = (intent: 'Dating' | 'Marriage') => {
    setUserProfile((prev: any) => ({ ...prev, intent }));
  };

  const uploadUserProfilePhoto = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setUserProfile((prev: any) => ({
          ...prev,
          photoUrl: reader.result as string,
          completionPercentage: Math.min(100, prev.completionPercentage + 5)
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Candidates & Regional Filtering
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [passedCandidatesHistory, setPassedCandidatesHistory] = useState<Candidate[]>([]);
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

  const updateProfileInfo = (
    name: string,
    profession: string,
    education: string,
    city: string,
    lookingFor: string[],
    interests: string[],
    regionalPref?: RegionalPreference
  ) => {
    setUserProfile((prev: any) => ({
      ...prev,
      name: name || prev.name,
      profession: profession || prev.profession,
      education: education || prev.education,
      location: city || prev.location,
      lookingFor: lookingFor?.length ? lookingFor : prev.lookingFor,
      interests: interests?.length ? interests : prev.interests,
      regionalPreference: regionalPref || prev.regionalPreference
    }));
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

  const likeCandidate = (candidate: Candidate, onMatch: () => void) => {
    setLastMatchedCandidate(candidate);

    const existing = conversations.find(c => c.candidate.id === candidate.id);
    if (!existing) {
      const newConvo: MatchConversation = {
        candidate,
        lastMessage: `You both matched with ${candidate.compatibilityScore}% compatibility ✨`,
        timestamp: 'Just now',
        unreadCount: 1,
        messages: [
          {
            id: `welcome_${Date.now()}`,
            senderName: candidate.name,
            message: `Hi! Our stars have aligned (${candidate.compatibilityScore}% compatibility) 😊`,
            timestamp: 'Just now',
            isFromUser: false
          }
        ]
      };
      setConversations((prev: any) => [newConvo, ...prev]);
      setActiveConversation(newConvo);
    } else {
      setActiveConversation(existing);
    }

    // Save to backend
    DiscoveryService.interact(candidate.id, 'LIKE').catch(console.error);

    setCandidates((prev: any) => {
      return prev.filter((c: any) => c.id !== candidate.id);
    });

    if (onMatch && candidate.compatibilityScore > 85) {
      onMatch();
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

  const openConversationForCandidate = (candidate: Candidate) => {
    const convo = conversations.find(c => c.candidate.id === candidate.id);
    if (convo) {
      setActiveConversation(convo);
    } else {
      const newConvo: MatchConversation = {
        candidate,
        lastMessage: `Matched based on ${candidate.nakshatra} harmony`,
        timestamp: 'Just now',
        unreadCount: 0,
        messages: []
      };
      setConversations((prev: any) => [newConvo, ...prev]);
      setActiveConversation(newConvo);
    }
  };

  const sendChatMessage = (text: string) => {
    if (!activeConversation || !text.trim()) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
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
    setIsChatTyping(true);

    setTimeout(() => {
      const aiReply = {
        id: `msg_reply_${Date.now()}`,
        senderName: activeConversation.candidate.name,
        message: `That aligns wonderfully with my ${activeConversation.candidate.nakshatra} energy! Tell me more ✨`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFromUser: false
      };

      setConversations((prev: any) =>
        prev.map((c: any) => {
          if (c.candidate.id === activeConversation.candidate.id) {
            return {
              ...c,
              lastMessage: aiReply.message,
              timestamp: 'Just now',
              messages: [...c.messages, aiReply]
            };
          }
          return c;
        })
      );

      setActiveConversation((prev: any) => (prev ? { ...prev, messages: [...prev.messages, aiReply] } : null));
      setIsChatTyping(false);
    }, 1800);
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
      value={{sessionUser, signInWithOtp: AuthService.signInWithOtp, verifyOtp: AuthService.verifyOtp, signOut: AuthService.signOut, 
        language,
        setLanguage,
        t,
        themeMode,
        setThemeMode,
        userProfile,
        setUserIntent,
        updateProfileInfo,
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
