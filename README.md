# ✨ Mangalsutra (Astra)

### Modern Matchmaking & Serious Matrimonial, Guided by the Stars.

**Mangalsutra** is a modern Indian matrimonial and matchmaking platform built with **React 18, TypeScript, Vite 5, Capacitor 8, Android SDK 36**, and **Supabase**. It pairs culturally rich Vedic astrology compatibility with serious marriage experiences, strict privacy protections, background verification, and native Android Google Authentication.

---

## 📱 Architecture Overview

```text
                             ┌──────────────────────────────────────┐
                             │          MANGALSUTRA PLATFORM         │
                             │    Dual Mode: Marriage & Dating       │
                             └─────────────────┬────────────────────┘
                                               │
             ┌─────────────────────────────────┼──────────────────────────────────┐
             │                                 │                                  │
             ▼                                 ▼                                  ▼
   💍 Matrimonial & Discovery          🌌 Vedic Astrology               🔒 Privacy & Trust
   • 9-Step Marriage Onboarding        • IAU SOFA Astronomical Math      • Split Private Profiles
   • Tiered Partner Preferences        • Lahiri Chitrapaksha Ayanamsa    • Photo Request Workflow
   • Ancestral 4-Gotra Lineage         • 36-Guna Ashtakoota Milan        • Native Google Sign-In
   • Discovery Candidate Ranking       • Manglik & Nadi Dosha Audits     • Chaanbean Verification
   • Health & Lifestyle Matching       • Nakshatra & Rashi Compatibility  • Admin Dashboard
   • 12-Question Values & Vision       • Numerology & Chemistry Engine   • Voice Intro Profiles
```

---

## 🌟 Key Features

### 1. 🌌 High-Precision Vedic Astrology Engine
A **deterministic astronomical ephemeris pipeline** grounded in `astronomy-engine` (IAU SOFA-validated):
- **Ephemeris Calculations:** Converts UTC timestamps + lat/long into topocentric celestial positions
- **Lahiri Chitrapaksha Ayanamsa:** True precession to transform tropical → Vedic sidereal coordinates
- **Kundali & Planetary Positions:** Moon, Sun, Mars, Jupiter, Saturn, Rahu, Ketu — degrees, Bhavas, Rashis, 27 Nakshatras, 4 Padas
- **Authentic 36-Guna Ashtakoota Milan:**
  - Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), Nadi (8)
  - Automatic Nadi Dosha, Bhakoot Dosha, and Gana Dosha detection
- **Manglik Dosha Detection:** Houses 1, 4, 7, 8, 12 — severity levels (High / Medium / Low) with cancellations
- **Chemistry Engine:** Lifestyle compatibility scoring (diet, alcohol, smoking)
- **Numerology Engine:** Pythagorean Life Path compatibility matrix (0–100%)

---

### 2. 💍 9-Step Marriage Onboarding
Full matrimonial biodata collection across 9 steps:

| Step | Section | Fields |
|------|---------|--------|
| 1 | **Basic Info** | Name, Age, Gender, Height, Location |
| 2 | **Religion & Caste** | Religion, Caste, Sub-caste, Ancestral 4-Gotra Lineage |
| 3 | **Education & Career** | Education, Profession, Annual Income |
| 4 | **Family Background** | Family type, Father/Mother occupation, Siblings |
| 5 | **Lifestyle** | Diet, Alcohol, Smoking, Health Status, Pre-existing Conditions |
| 6 | **Astrology** | Nakshatra, Rashi, Birth time, Manglik status |
| 7 | **About Me** | Bio, Hobbies, Languages, Photo |
| 8 | **Values & Vision** | 12 questions (life goals, children, religion, friendships, etc.) |
| 9 | **Partner Preferences** | Tiered preferences (Must-Have / Preferred / Flexible / Deal-Breaker) |

---

### 3. 🏛️ Ancestral 4-Gotra Lineage System
Each user records all four lineage gotras for traditional matrimonial compatibility:
- 👴 **Father's Father** — Primary/Main Gotra
- 👵 **Father's Mother** — Paternal grandmother's lineage
- 👴 **Mother's Father** — Maternal grandfather's lineage
- 👵 **Mother's Mother** — Maternal grandmother's lineage

Displayed on profile cards with Religion • Caste • SubCaste badge. Gotra preferences use case-insensitive partial matching (`ILIKE`) so `"Kashyap"` matches `"Kashyapa"` regardless of capitalization.

---

### 4. 🎯 Tiered Partner Preferences & Discovery
- **Must-Have / Preferred / Flexible / Deal-Breaker** tiers for Religion, Caste, Sub-caste, Gotra, Education, Diet, Location
- **Supabase RPC** (`get_discovery_candidates`) does all filtering/ranking in Postgres — case-insensitive via `ILIKE`
- **Scoring:** Preferred matches boost rank score; Must-Haves are hard filters; Deal-Breakers exclude candidates
- **SubCaste** shown on swipe cards alongside Religion and Caste

---

### 5. 🔐 Security & Privacy
- **Private Profile Split:** Sensitive data (exact birth time, coordinates) in `public.private_profiles` with owner-only RLS
- **Photo Privacy & Requests:** Photos can be public or private. Private photos require explicit mutual requests via `public.photo_requests`
- **Chaanbean Verification:** In-app background verification flow with trust badges
- **Database Triggers:** Safe profile provisioning via `public.handle_new_user()` on `auth.users`
- **RLS on all tables:** Every table enforces Row Level Security

---

### 6. ⚡ Native Android Google Sign-In
- **Capacitor Native Google One-Tap Sign-In** (`capacitor-native-google-one-tap-signin ^7.0.3`) for Android 14/15/compileSdk 36
- **GoTrue ID Token Handoff:** `supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })`
- **Fallback:** Browser OAuth during web development
- **Multi-Auth:** Google, SMS Phone OTP, and Email/Password all active

---

### 7. 🎙️ Voice Intro & Media
- **Voice Intro Recordings:** Users record audio profile introductions visible to matches
- **Photo Request Workflow:** Swipe-based photo access with mutual consent
- **Digital Wedding Card:** Shareable digital biodata card generator

---

### 8. 🛡️ Admin Dashboard
- **Admin Dashboard** — user analytics, profile stats
- **Admin AI Panel** — AI-powered moderation and insights
- **Admin Marketing Panel** — campaign and referral management

---

## 📂 Project Structure

```
Astra-android/
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AstraBottomNavigation.tsx   # Bottom nav (Discover, Matches, Profile, AI)
│   │   │   ├── AstraButtons.tsx            # Shared button styles
│   │   │   ├── AstrologyMetrics.tsx        # MetricBar & GunaCircleMeter UI
│   │   │   ├── CandidateAvatar.tsx         # Profile photo with fallback
│   │   │   ├── CandidateCardView.tsx       # Swipe card (religion, caste, subCaste, nakshatra)
│   │   │   ├── CelestialLogo.tsx           # Animated brand logo
│   │   │   ├── ChaanbeanModal.tsx          # Background verification modal
│   │   │   ├── ChatBubble.tsx              # Chat message bubble
│   │   │   ├── CosmicBackgroundCanvas.tsx  # Animated star canvas
│   │   │   ├── FloatingHeartsBackground.tsx
│   │   │   ├── KootaBreakdownWheel.tsx     # 8-Koota radial chart
│   │   │   ├── PreferenceTierEditor.tsx    # Tier selector (Must-Have → Deal-Breaker)
│   │   │   ├── ReferralModal.tsx           # Referral sharing modal
│   │   │   ├── SplashScreenOverlay.tsx     # App launch overlay
│   │   │   ├── UserVoiceRecorderCard.tsx   # Audio recording & playback
│   │   │   ├── VerificationBadge.tsx       # Trust badge display
│   │   │   ├── VerificationModal.tsx       # Verification flow
│   │   │   └── VoiceIntroCard.tsx          # Voice intro playback card
│   │   ├── context/
│   │   │   └── AstraContext.tsx            # Global state, auth, profile, preferences
│   │   ├── data/
│   │   │   ├── AshtakootaEngine.ts         # 36-Guna Ashtakoota calculator
│   │   │   ├── AstroAiService.ts           # AI astrology service
│   │   │   ├── ChemistryEngine.ts          # Lifestyle compatibility scorer
│   │   │   ├── NumerologyEngine.ts         # Pythagorean life path engine
│   │   │   ├── astrologyEngine.ts          # Ephemeris → Vedic pipeline
│   │   │   ├── mockData.ts                 # Dev/demo seed data
│   │   │   └── translations.ts             # i18n (English, Tamil, Malayalam, Hindi)
│   │   ├── lib/
│   │   │   ├── supabase.ts                 # Supabase client
│   │   │   └── storage.ts                  # Capacitor Preferences wrapper
│   │   ├── pages/
│   │   │   ├── AdminAiPanelPage.tsx        # Admin AI moderation panel
│   │   │   ├── AdminDashboardPage.tsx      # Admin analytics dashboard
│   │   │   ├── AdminMarketingPage.tsx      # Admin marketing & referrals
│   │   │   ├── AstroAiAssistantPage.tsx    # Astro AI chat assistant
│   │   │   ├── AstrologySetupPage.tsx      # Birth detail setup for kundali
│   │   │   ├── CandidateDetailPage.tsx     # Full candidate profile view
│   │   │   ├── ChatDetailPage.tsx          # 1:1 match conversation
│   │   │   ├── DigitalWeddingCardPage.tsx  # Shareable digital biodata card
│   │   │   ├── DiscoverFeedPage.tsx        # Swipe/discover feed
│   │   │   ├── HoroscopeCompatibilityPage.tsx # Kundali compatibility detail
│   │   │   ├── MarriageOnboardingPage.tsx  # 9-step matrimonial onboarding
│   │   │   ├── MatchCelebrationPage.tsx    # Mutual match celebration screen
│   │   │   ├── MatchesConversationsPage.tsx # Matches & conversations list
│   │   │   ├── ProfileOnboardingPage.tsx   # Quick profile setup
│   │   │   ├── SplashPage.tsx              # Login / splash screen
│   │   │   ├── TypeformOnboardingPage.tsx  # Dating mode onboarding
│   │   │   └── UserProfilePage.tsx         # Own profile with edit & gotra sections
│   │   ├── services/
│   │   │   ├── AstroAiService.ts           # Gemini AI integration
│   │   │   ├── PhotoService.ts             # Photo upload & request management
│   │   │   ├── auth.ts                     # AuthService (Google, OTP, Email)
│   │   │   ├── chat.ts                     # Chat/messaging service
│   │   │   ├── discovery.ts                # getCandidates → Supabase RPC mapper
│   │   │   └── profiles.ts                 # Profile CRUD helpers
│   │   ├── styles/                         # Global CSS variables & themes
│   │   ├── types/
│   │   │   └── index.ts                    # Candidate, UserProfile, PartnerPreferences types
│   │   └── utils/
│   │       └── profileReadiness.ts         # 0–100% completion calculator
│   ├── android/                            # Capacitor Android native project
│   │   ├── app/
│   │   │   ├── build.gradle                # compileSdk 36, applicationId, signing
│   │   │   └── src/main/AndroidManifest.xml
│   │   ├── build.gradle                    # Root Gradle (SDK 36)
│   │   └── variables.gradle                # Android SDK & dependency versions
│   ├── supabase/
│   │   └── migrations/                     # 24 versioned SQL migrations
│   └── tests/
│       ├── AshtakootaEngine.test.ts
│       ├── ChemistryEngine.test.ts
│       ├── NumerologyEngine.test.ts
│       ├── VedicAstrologyEngine.test.ts
│       ├── profileReadiness.test.ts
│       └── authService.test.ts
├── seed_backend_profiles.sql               # Seed data for dev/testing
└── README.md
```

---

## 🗄️ Database Schema (Supabase / Postgres)

### Key Tables

| Table | Purpose |
|---|---|
| `public.profiles` | All user profile fields (name, caste, gotra, health, lifestyle, questionnaire JSONB, etc.) |
| `public.private_profiles` | Sensitive data: exact birth time, coordinates (owner-only RLS) |
| `public.preferences` | Partner preference tiers (must_have, preferred, flexible, deal_breaker) |
| `public.connections` | Like / pass / match state between two users |
| `public.photo_requests` | Private photo access request + approval workflow |
| `public.conversations` | Match conversation threads |
| `public.messages` | Chat messages within conversations |
| `public.notifications` | Real-time notification payloads |
| `public.referrals` | Referral codes and tracking |

### Key RPC Functions

| Function | Description |
|---|---|
| `get_discovery_candidates()` | Ranked candidate list filtered by user's tiered preferences (case-insensitive ILIKE) |
| `unmatch_candidate()` | Removes mutual connection |
| `handle_new_user()` | Trigger: auto-provisions profile on new signup |

### Migrations (24 files, `web/supabase/migrations/`)
All schema changes are version-controlled SQL files applied in sequence, covering: initial schema, RLS policies, security hardening, discovery RPC iterations, photo request system, notification triggers, and 4-Gotra columns.

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | ^18.3.1 |
| Language | TypeScript | ^5.5.3 |
| Build tool | Vite | ^5.4.1 |
| Routing | React Router DOM | ^6.26.1 |
| Native bridge | Capacitor | ^8.5.0 |
| Android target | Android SDK | API 36 |
| Backend / DB | Supabase (Postgres + Auth + Storage) | ^2.112.4 |
| Astrology engine | astronomy-engine (IAU SOFA) | ^2.1.19 |
| Google Sign-In | capacitor-native-google-one-tap-signin | ^7.0.3 |
| Icons | lucide-react | ^0.439.0 |
| JDK | OpenJDK | 21 |
| Node.js | Node.js | v18+ (tested v20+) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (tested on v20+)
- **Java JDK** OpenJDK 21
- **Android SDK** API 36 with Build-Tools 36.0.0
- **Supabase** project (free tier works)

### 1. Clone & Install
```bash
git clone git@github.com:marvelpokemaster/Astra-android.git
cd Astra-android/web
npm install
```

### 2. Environment Configuration
Create `web/.env`:
```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_GOOGLE_CLIENT_ID=<your-google-web-client-id>.apps.googleusercontent.com
```

### 3. Apply Database Migrations
```bash
# Apply all migrations to your Supabase project via the SQL editor or Supabase CLI
cd web/supabase/migrations
# Apply each file in order: 20260831000000_phase1.sql → ... → 20260907000002_add_4_gotras.sql
```

### 4. Run Web Dev Server
```bash
cd web
npm run dev
```

### 5. Run Automated Tests
```bash
cd web
npx -y tsx tests/profileReadiness.test.ts
npx -y tsx tests/AshtakootaEngine.test.ts
npx -y tsx tests/ChemistryEngine.test.ts
npx -y tsx tests/NumerologyEngine.test.ts
npx -y tsx tests/VedicAstrologyEngine.test.ts
npx -y tsx tests/authService.test.ts
```

---

## 🤖 Building for Android

### 1. Build Frontend & Sync Capacitor
```bash
cd web
npm run build
npx cap sync android
```

### 2. Configure Local Android SDK
Ensure `web/android/local.properties` exists:
```properties
sdk.dir=/path/to/your/Android/Sdk
```

### 3. Build Debug APK
```bash
cd web/android
./gradlew assembleDebug
# Output: web/android/app/build/outputs/apk/debug/app-debug.apk
```

### 4. Build Release APK
```bash
cd web/android
./gradlew assembleRelease
# Output: web/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### 5. Install on Device via ADB
```bash
adb install -r web/android/app/build/outputs/apk/debug/app-debug.apk
```

### One-liner: Full Build + Copy APK
```bash
cd /path/to/Astra-android/web && npm run build && npx cap sync android && cd android && ./gradlew assembleDebug && cp app/build/outputs/apk/debug/app-debug.apk ~/app-debug.apk
```

---

## 🔑 Google Authentication Setup

### Google Cloud Console ([console.cloud.google.com](https://console.cloud.google.com))
1. Create an **Android OAuth Client ID:**
   - **Package Name:** `com.aistudio.astra.vedicmatch`
   - **SHA-1 Fingerprint:** `7D:1B:5D:36:B0:4C:B5:E6:10:10:C2:7E:43:EC:8C:27:05:98:66:22`
   - **SHA-256 Fingerprint:** `3A:AA:07:8A:32:FC:C6:77:BB:66:EA:01:94:99:49:89:A2:1D:99:F3:45:01:09:05:30:BF:91:A2:82:B0:9C:D3`
2. Create a **Web Application OAuth Client ID** — copy Client ID & Secret

### Supabase Dashboard (Authentication → Providers → Google)
1. Enable Google provider
2. Set **Client ID** → Web Client ID
3. Set **Client Secret** → Web Client Secret
4. Under **Authorized Client IDs** → add both Android Client ID and Web Client ID

### Environment
```env
VITE_GOOGLE_CLIENT_ID=<Web Client ID>.apps.googleusercontent.com
```

---

## 🌍 Localisation

The app supports 4 languages via `src/data/translations.ts`:

| Language | Code |
|---|---|
| English | `en` |
| Tamil | `ta` |
| Malayalam | `ml` |
| Hindi | `hi` |

---

## 📦 Releases

- **Upstream:** [B2krobbery/Astra-android/releases](https://github.com/B2krobbery/Astra-android/releases/tag/v1.0.0-android)
- **Fork:** [marvelpokemaster/Astra-android/releases](https://github.com/marvelpokemaster/Astra-android/releases/tag/v1.0.0-android)

---

## 📄 License

Private and Proprietary. All rights reserved.
