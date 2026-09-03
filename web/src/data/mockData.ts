import {
  Candidate,
  MatchConversation,
  ChatMessage,
  VerificationDetail,
  VerificationType,
  AiAgent,
  AdminMetrics,
  MarketingCampaign,
  ReferralData
} from '../types';

export const mockCandidates: Candidate[] = [
  {
    id: 'ananya_1',
    intent: 'Marriage',
    name: 'Ananya',
    age: 24,
    gender: 'Female',
    profession: 'Architect',
    location: 'Bengaluru',
    regionalCategory: 'SOUTH_INDIA',
    education: 'IIT Roorkee · B.Arch',
    bio: 'Designer of spaces by day, collector of stories by night. Usually found in a quiet corner of a cafe in Indiranagar or exploring the ruins of Hampi. Believer in warm filter coffee, slow mornings, and deep alignment of stars.',
    photoUrls: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop'
    ],
    isVerified: true,
    educationVerified: true,
    policeVerified: true,
    creditVerified: true,
    educationDetails: 'IIT Roorkee · Bachelor of Architecture (Honors)',
    policeDetails: 'Digital Verification Authority · Complete background check clear',
    creditDetails: 'Experian Verified · Score 785 · Prime credit profile',
    interests: ['Modern Architecture', 'Photography', 'Jazz', 'Trekking', 'Vedic Astrology', 'Filter Coffee'],
    nakshatra: 'Rohini',
    rashi: 'Vrishabha (Taurus)',
    nadi: 'Antya (Last)',
    manglik: 'No',
    religion: 'Hindu',
    caste: 'Brahmin',
    compatibilityScore: 87,
    emotionalScore: 91,
    nakshatraScore: 88,
    rashiScore: 84,
    overallScore: 87,
    compatibilityNote: 'Your profiles show strong compatibility in emotional temperament and communication. Your Nakshatra combination also scores positively under the selected compatibility system, suggesting a natural flow of energy.',
    matchReasons: [
      '✨ 28/36 Guna Milan (Rohini & Ashwini Harmony)',
      '🎓 Both from Top Design/Tech Institutions (IIT Bombay & IIT Roorkee)',
      '☕ Shared passion for Specialty Coffee & Modern Architecture',
      '📍 Both located in Indiranagar, Bengaluru'
    ]
  },
  {
    id: 'sneha_2',
    intent: 'Marriage',
    name: 'Sneha',
    age: 26,
    gender: 'Female',
    profession: 'UI/UX Lead',
    location: 'Mumbai',
    regionalCategory: 'WEST_INDIA',
    education: 'NID Ahmedabad',
    bio: 'Crafting digital experiences with empathy. Avid vinyl collector and weekend cyclist along Marine Drive. Fond of ancient temple architecture and star charts.',
    photoUrls: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
    ],
    isVerified: true,
    educationVerified: true,
    policeVerified: true,
    creditVerified: true,
    educationDetails: 'National Institute of Design · Master of Design',
    policeDetails: 'Mumbai City Police Verification Portal · Clear',
    creditDetails: 'CIBIL Score 790 · Verified prime rating',
    interests: ['UI/UX Design', 'Vinyl Records', 'Cycling', 'Coffee Brewing', 'Vedic Philosophy'],
    nakshatra: 'Ashwini',
    rashi: 'Mesha (Aries)',
    nadi: 'Aadi (First)',
    manglik: 'Anshik (Partial)',
    religion: 'Hindu',
    caste: 'Brahmin',
    compatibilityScore: 82,
    emotionalScore: 94,
    nakshatraScore: 89,
    rashiScore: 90,
    overallScore: 91,
    compatibilityNote: 'Ashwini and Rohini create an inspiring combination of dynamism and creative beauty, bringing mutual encouragement and shared values.',
    matchReasons: [
      '✨ 31/36 Guna Milan High Harmony',
      '🎨 Creative synergy (Product Design & Architecture)',
      '🚴 Shared lifestyle: Weekend cycling & Vinyl records'
    ]
  },
  {
    id: 'aditi_3',
    intent: 'Dating',
    name: 'Aditi',
    age: 25,
    gender: 'Female',
    profession: 'Data Scientist',
    location: 'Hyderabad',
    regionalCategory: 'KERALA',
    education: 'BITS Pilani',
    bio: 'Decoding patterns in data and constellations in the night sky. Loves classical Kuchipudi, Himalayan hikes, and spicy Andhra cuisine.',
    photoUrls: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop'
    ],
    isVerified: true,
    educationVerified: true,
    policeVerified: true,
    creditVerified: true,
    educationDetails: 'BITS Pilani · M.Sc Data Science & B.E Computer Science',
    policeDetails: 'Cyberabad Police Verification System · Clear',
    creditDetails: 'Equifax Score 795 · Excellent standing',
    interests: ['Machine Learning', 'Classical Dance', 'Hiking', 'Books', 'Stargazing'],
    compatibilityScore: 86,
    matchReasons: [
      '✨ High Intellectual Alignment',
      '🌴 South Indian / Kerala Heritage Alignment',
      '📚 Both enjoy analytics & deep reading'
    ]
  },
  {
    id: 'kavya_4',
    intent: 'Dating',
    name: 'Kavya',
    age: 27,
    gender: 'Female',
    profession: 'Brand Strategist',
    location: 'Delhi NCR',
    regionalCategory: 'NORTH_INDIA',
    education: 'IIM Bangalore',
    bio: 'Balancing marketing strategy by day, acoustic guitar by sunset. Big believer in honest conversations, weekend tennis, and cosmic serendipity.',
    photoUrls: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop'
    ],
    isVerified: true,
    educationVerified: true,
    policeVerified: true,
    creditVerified: true,
    educationDetails: 'IIM Bangalore · MBA in Marketing & Strategy',
    policeDetails: 'Delhi Police Character Verification · Clear',
    creditDetails: 'Experian Verified · 810 Score',
    interests: ['Brand Strategy', 'Acoustic Guitar', 'Tennis', 'Indie Music', 'Art Galleries'],
    compatibilityScore: 81,
    matchReasons: [
      '✨ Creative and Strategic Mindset Alignment',
      '🎸 Shared passion for Indie Music & Guitar',
      '🎾 Both enjoy weekend Tennis'
    ]
  }
];

export const newMatches: Candidate[] = [
  {
    id: 'ishani_m1',
    intent: 'Marriage',
    name: 'Ishani',
    age: 24,
    gender: 'Female',
    profession: 'Environmental Consultant',
    location: 'Bengaluru',
    regionalCategory: 'SOUTH_INDIA',
    education: 'IISc Bangalore',
    bio: 'Passionate about green architecture and solar energy.',
    photoUrls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'],
    isVerified: true,
    educationVerified: true,
    policeVerified: true,
    creditVerified: true,
    interests: ['Sustainability', 'Gardening', 'Astrology'],
    nakshatra: 'Anuradha',
    rashi: 'Vrishchika',
    compatibilityScore: 92
  }
];

export const initialConversations: MatchConversation[] = [
  {
    candidate: mockCandidates[0],
    lastMessage: 'The stars were right about that cafe!',
    timestamp: '2m ago',
    unreadCount: 1,
    messages: [
      { id: '1', senderName: 'User', message: 'Hey Ananya! I noticed we have an 87% compatibility score ✨', timestamp: '10:14 AM', isFromUser: true },
      { id: '2', senderName: 'Ananya', message: 'Haha, I noticed that too 😊', timestamp: '10:16 AM', isFromUser: false },
      { id: '3', senderName: 'User', message: 'And apparently our Nakshatras Rohini and Ashwini are in great harmony.', timestamp: '10:18 AM', isFromUser: true },
      { id: '4', senderName: 'Ananya', message: "Maybe they know something we don't ✨ Have you tried the filter coffee at CTR?", timestamp: '10:20 AM', isFromUser: false },
      { id: '5', senderName: 'User', message: 'CTR is iconic! Their benne dosa with filter coffee is perfection.', timestamp: '10:22 AM', isFromUser: true },
      { id: '6', senderName: 'Ananya', message: 'The stars were right about that cafe!', timestamp: '10:24 AM', isFromUser: false }
    ]
  },
  {
    candidate: mockCandidates[1],
    lastMessage: 'What does your Nakshatra say about...',
    timestamp: '1h ago',
    unreadCount: 1,
    messages: [
      { id: '1', senderName: 'Sneha', message: 'Hey Aarav! Love your taste in design and coffee brewing.', timestamp: '09:00 AM', isFromUser: false },
      { id: '2', senderName: 'User', message: 'Thanks Sneha! Always great to connect with fellow design minds.', timestamp: '09:15 AM', isFromUser: true },
      { id: '3', senderName: 'Sneha', message: 'What does your Nakshatra say about our match?', timestamp: '09:30 AM', isFromUser: false }
    ]
  }
];

export const astroAiKnowledge: Record<string, string> = {
  'What is my Nakshatra?': 'Based on your birth details (14 July 1998 at 08:45 AM in Bengaluru), your Nakshatra is **Rohini** in the sign of **Vrishabha (Taurus)**. Governed by the Moon and Prajapati (the Creator), Rohini signifies charm, fertility, artistic elegance, and nurturing devotion. In relationships, Rohini individuals value loyalty, aesthetic beauty, and long-term emotional stability.',
  'What is Nadi Dosha?': 'In Vedic Guna Milan astrology, **Nadi** represents genetic and physiological energy resonance, carrying 8 out of 36 total points. **Nadi Dosha** occurs when both individuals share the same Nadi (Adi, Madhya, or Antya). However, ancient texts note that Nakshatra Pada differences, strong Jupiter alignment, or high Guna Milan score (above 28) effectively neutralize this dosha.',
  'Is my Nakshatra compatible with Rohini?': 'Rohini is ruled by the Moon and represents earthy fertility and romantic grace. It shares strong celestial compatibility with **Mrigashira, Ashwini, Revati, and Anuradha**. These pairings harmonize mutual emotional understanding, aesthetic appreciation, and grounded life pursuits.',
  'Are Rohini and Ashwini compatible?': 'Yes! Rohini (Moon-ruled, earthy beauty) and Ashwini (Ketu-ruled, swift fiery initiation) share an 87% overall alignment. Ashwini brings enthusiasm, adventurous spark, and initiative, while Rohini provides comforting stability, warmth, and enduring loyalty.',
  'What does my Nakshatra say about relationships?': 'Rohini brings deep romantic devotion, steadfast fidelity, and an appreciation for sensory comfort. In love, you cherish soulful conversation, quiet domestic peace, mutual respect, and creating a shared sanctuary with your partner.',
  'When is a good time for marriage?': 'In Vedic Muhurat calculations, auspicious timing (Shubh Vivah Muhurat) depends on favorable transits of **Brihaspati (Jupiter)** and **Shukra (Venus)** without combustion, during Shukla Paksha under auspicious Nakshatras like Rohini, Anuradha, or Uttara Phalguni.'
};

export const suggestedQuestions = [
  'Is my Nakshatra compatible with Rohini?',
  'What is Nadi Dosha?',
  'Are Rohini and Ashwini compatible?',
  'What does my Nakshatra say about relationships?',
  'When is a good time for marriage?'
];

export function getVerificationDetail(
  type: VerificationType,
  candidateName: string,
  institution: string,
  details: string
): VerificationDetail {
  switch (type) {
    case VerificationType.EDUCATION:
      return {
        type: VerificationType.EDUCATION,
        title: 'Education Verification',
        isVerified: true,
        statusText: 'Verified Degree & Alumni Status',
        institution,
        credential: details,
        verifiedDate: '15 Jan 2026',
        verificationId: 'EDU-AST-98231',
        partnerAuthority: 'Authorized Academic Verification Registry & DigiLocker Gateway',
        description: 'Degree certificates and enrollment records have been cryptographically verified through authorized academic repositories.'
      };
    case VerificationType.POLICE:
      return {
        type: VerificationType.POLICE,
        title: 'Police Verification',
        isVerified: true,
        statusText: 'Background Record Verified',
        institution: 'Digital Verification Authority',
        credential: details,
        verifiedDate: '22 Jan 2026',
        verificationId: 'POL-VER-77402',
        partnerAuthority: 'Authorized National Crime & Identity Registry Verification System',
        description: 'Identity and residential background verified with zero criminal or adverse legal records found.'
      };
    case VerificationType.CREDIT:
      return {
        type: VerificationType.CREDIT,
        title: 'Credit Profile Verification',
        isVerified: true,
        statusText: 'Verified Financial Health Score',
        institution: 'Experian & CIBIL Bureau',
        credential: details,
        verifiedDate: '05 Feb 2026',
        verificationId: 'CRD-AST-44190',
        partnerAuthority: 'Authorized Credit Information Bureau Partner',
        description: 'Demonstrates verified financial responsibility with prime tier credit score and no historical delinquency. Exact balances and numbers remain strictly confidential.'
      };
  }
}

// AI Admin Agents Initial State
export const initialAiAgents: AiAgent[] = [
  {
    id: 'agent_content',
    name: 'Astra Copywriter AI',
    role: 'Content & Push Notification Automation',
    status: 'IDLE',
    lastRun: '12m ago',
    description: 'Auto-generates daily horoscope teasers, personalized push notifications, and profile bio enhancement suggestions.',
    logs: [
      '[10:00 AM] Generated 4,200 personalized daily horoscopes for Rohini & Ashwini users.',
      '[10:15 AM] Sent push campaign: "Your stars are 89% aligned with Ananya today ✨"'
    ],
    promptTemplate: 'You are Astra Copywriter AI. Generate a romantic, celestial 1-line push notification for a {nakshatra} user.'
  },
  {
    id: 'agent_matchmaker',
    name: 'Kundali Matchmaker AI',
    role: 'Batch Scoring & Compatibility Engine',
    status: 'COMPLETED',
    lastRun: '5m ago',
    description: 'Calculates 36-Guna Milan scores, Nadi Dosha exceptions, and regional preference weights for active user feeds.',
    logs: [
      '[10:30 AM] Batch processed 18,400 user pairs.',
      '[10:32 AM] Identified 342 High Harmony (>30 Gunas) matches.'
    ],
    promptTemplate: 'Analyze Kundali parameters for User {user_id} and Candidate {candidate_id}. Return Guna score & harmony explanation.'
  },
  {
    id: 'agent_verification',
    name: 'Trust & Safety Audit AI',
    role: 'Verification Document OCR & Check',
    status: 'IDLE',
    lastRun: '1h ago',
    description: 'Scans university degrees, DigiLocker credentials, and police verification reports for tamper detection.',
    logs: [
      '[09:10 AM] Audited 42 verification submissions.',
      '[09:12 AM] Auto-approved 38 DigiLocker certificates with 100% confidence.'
    ],
    promptTemplate: 'Perform OCR and authenticity audit on document image {image_uri}.'
  },
  {
    id: 'agent_marketing',
    name: 'Growth & Referrals AI',
    role: 'Viral Coefficient & Referral Tracking',
    status: 'RUNNING',
    lastRun: 'Just now',
    description: 'Monitors user referral links, rewards Golden Badges for 2 successful invites, and automates marketing payouts.',
    logs: [
      '[10:45 AM] Tracked 128 new referral links shared.',
      '[10:46 AM] Awarded Golden Profile Status to 14 active users.'
    ],
    promptTemplate: 'Calculate viral K-factor for campaign {campaign_id} and generate conversion report.'
  },
  {
    id: 'agent_astro_copilot',
    name: 'Astro AI Assistant',
    role: 'In-App Celestial Consultation & Icebreakers',
    status: 'RUNNING',
    lastRun: 'Just now',
    description: 'Powers real-time chat co-pilot icebreakers and responds to user inquiries about Gunas, Nadi, and Muhurats.',
    logs: [
      '[10:48 AM] Responded to 820 Astro AI guide questions.',
      '[10:49 AM] Generated 140 personalized chat opener suggestions.'
    ],
    promptTemplate: 'You are Astro AI Guide. Answer the user question: {question} with ancient Vedic astrology insight.'
  }
];

export const initialAiMessages: ChatMessage[] = [
  {
    id: '1',
    senderName: 'Astro AI Guide',
    message: 'Namaste Aarav! I am your Astro AI Assistant. Ask me anything about Guna Milan, Nakshatra compatibility, or planetary transits ✨',
    timestamp: '10:00 AM',
    isFromUser: false
  }
];

export const initialAdminMetrics: AdminMetrics = {
  totalUsers: 24890,
  activeDau: 4820,
  activeMau: 18900,
  profileCompletionAvg: 85,
  totalMatchesCreated: 14230,
  matchSuccessRate: 94.2,
  totalMessagesExchanged: 98400,
  referralKFactor: 1.4,
  regionalDistribution: { 'South India': 45, 'North India': 30, 'West India': 25 }
};

export const initialMarketingCampaigns: MarketingCampaign[] = [
  {
    id: 'camp_1',
    title: 'Kerala & South Vedic Launch',
    status: 'ACTIVE',
    channel: 'SOCIAL_AD',
    targetAudience: 'South India (22-30)',
    reach: 14200,
    conversions: 3120
  },
  {
    id: 'camp_2',
    title: 'NRI High Harmony Drive',
    status: 'ACTIVE',
    channel: 'REFERRAL_BOOST',
    targetAudience: 'NRI Professionals',
    reach: 9800,
    conversions: 1840
  }
];

export const initialReferralData: ReferralData = {
  referralCode: 'ASTRA-AARAV-98',
  totalInvitesSent: 3,
  successfulSignups: 1,
  goldenBadgeUnlocked: false,
  unlimitedAiUnlocked: true
};
