export type AppLanguage = 'EN' | 'ML' | 'HI';

export type ThemeMode = 'DARK' | 'LIGHT' | 'SYSTEM';

export enum VerificationType {
  EDUCATION = 'EDUCATION',
  POLICE = 'POLICE',
  CREDIT = 'CREDIT'
}

export type RegionalPreference = 'ALL' | 'KERALA' | 'NORTH_INDIA' | 'SOUTH_INDIA' | 'WEST_INDIA' | 'NRI';

export interface PartnerPreferences {
  preferredReligion?: string;
  preferredCaste?: string;
  preferredEducation?: string;
  preferredLocation?: string;
}

export interface Candidate {
  id: string;
  intent?: 'Dating' | 'Marriage';
  name: string;
  age: number;
  gender?: string;
  profession: string;
  location: string;
  regionalCategory?: RegionalPreference;
  education: string;
  bio: string;
  photoUrls: string[];
  avatarGradientStart?: number;
  avatarGradientEnd?: number;
  isVerified: boolean;
  educationVerified: boolean;
  policeVerified: boolean;
  creditVerified: boolean;
  educationDetails?: string;
  policeDetails?: string;
  creditDetails?: string;
  interests: string[];
  nakshatra?: string;
  rashi?: string;
  nadi?: string;
  manglik?: string;
  religion?: string;
  caste?: string;
  compatibilityScore: number;
  emotionalScore?: number;
  nakshatraScore?: number;
  rashiScore?: number;
  overallScore?: number;
  compatibilityNote?: string;
  matchReasons?: string[];
}

export interface UserProfile {
  name: string;
  intent?: 'Dating' | 'Marriage';
  age: number;
  gender: string;
  profession: string;
  education: string;
  location: string;
  regionalPreference: RegionalPreference;
  dateOfBirth: string;
  birthTime: string;
  birthCity: string;
  nakshatra: string;
  rashi: string;
  photoUrl: string;
  educationVerified: boolean;
  policeVerified: boolean;
  creditVerified: boolean;
  lookingFor: string[];
  interests: string[];
  completionPercentage: number;
  hasVoiceNote?: boolean;
  voiceNotePrompt?: string;
  voiceNoteDuration?: number;
  
  // Marriage specific fields
  birthLocation?: string;
  height?: string;
  bloodGroup?: string;
  motherTongue?: string;
  religion?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  education10th?: string;
  education12th?: string;
  higherEducation?: string;
  employer?: string;
  annualIncome?: string;
  healthInfo?: string;
  healthPrivacy?: string;
  diet?: string;
  alcohol?: string;
  smoking?: string;
  maritalStatus?: string;
  previousMarriage?: string;
  childrenStatus?: string;
  photoPrivacy?: string;
  nadi?: string;
  manglik?: string;
  partnerPreferences?: PartnerPreferences;
}

export interface AstrologyCompatibility {
  candidateName: string;
  score: number;
  level: string;
  emotionalScore: number;
  nakshatraScore: number;
  rashiScore: number;
  overallHarmonyScore: number;
  reasonTitle: string;
  reasonDescription: string;
  userNakshatra: string;
  candidateNakshatra?: string;
  gunaScore: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  message: string;
  timestamp: string;
  isFromUser: boolean;
}

export interface MatchConversation {
  candidate: Candidate;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface VerificationDetail {
  type: VerificationType;
  title: string;
  isVerified: boolean;
  statusText: string;
  institution: string;
  credential: string;
  verifiedDate: string;
  verificationId: string;
  partnerAuthority: string;
  description: string;
}

export enum AstraTab {
  DISCOVER = 'discover',
  MATCHES = 'matches',
  ASTRO_AI = 'astro_ai',
  PROFILE = 'profile'
}

// AI Admin & Marketing Types
export interface AiAgent {
  id: string;
  name: string;
  role: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  lastRun: string;
  description: string;
  logs: string[];
  promptTemplate: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeDau: number;
  activeMau: number;
  profileCompletionAvg: number;
  totalMatchesCreated: number;
  matchSuccessRate: number;
  totalMessagesExchanged: number;
  referralKFactor: number;
  regionalDistribution: Record<string, number>;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  channel: 'PUSH_NOTIFICATION' | 'EMAIL' | 'SOCIAL_AD' | 'REFERRAL_BOOST';
  targetAudience: string;
  reach: number;
  conversions: number;
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';
}

export interface ReferralData {
  referralCode: string;
  totalInvitesSent: number;
  successfulSignups: number;
  goldenBadgeUnlocked: boolean;
  unlimitedAiUnlocked: boolean;
}
