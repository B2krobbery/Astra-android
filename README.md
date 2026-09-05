# ✨ Mangalsutra (Astra)

### Modern Matchmaking & Serious Matrimonial, Guided by the Stars.

**Mangalsutra** is a modern Indian matrimonial and matchmaking platform built with **React 18, TypeScript, Vite, Capacitor 8, Android (SDK 36)**, and **Supabase**. It pairs culturally rich Vedic astrology compatibility with modern dating and serious marriage experiences, strict privacy protections, background verification, and native Android Google Authentication.

---

## 📱 Architecture & Key Features

```text
                             ┌──────────────────────────────────┐
                             │       MANGALSUTRA PLATFORM       │
                             │   Dual Mode: Marriage & Dating   │
                             └─────────────────┬────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             │                                 │                                 │
             ▼                                 ▼                                 ▼
   💍 Matrimonial & Dating             🌌 Vedic Astrology               🔒 Privacy & Trust
   • Two-User Intent Routing           • IAU SOFA Astronomical Math     • Split Private Profiles
   • 100% Deterministic Readiness      • Lahiri Chitrapaksha Ayanamsa   • Photo Request Workflow
   • Tiered Partner Preferences        • 36-Guna Ashtakoota Milan       • Native Google Sign-In
   • Discovery Candidate Ranking       • Manglik & Nadi Dosha Audits    • Chaanbean Verification
```

---

### 1. 🌌 High-Precision Vedic Astrology Engine
Unlike mock or hardcoded matrimonial apps, Mangalsutra features a **deterministic astronomical ephemeris pipeline** grounded in `astronomy-engine` (IAU SOFA-validated orbital algorithms):
- **Ephemeris Calculations:** Converts exact UTC timestamps and latitude/longitude coordinates into topocentric celestial positions.
- **Lahiri Chitrapaksha Ayanamsa:** Calculates true precession of the equinoxes to transform tropical longitudes into Vedic sidereal coordinates.
- **Kundali & Planetary Positions:** Computes exact planetary degrees, Bhavas (houses), Rashis (zodiac signs), 27 Nakshatras, and 4 Nakshatra Padas for Moon, Sun, Mars, Jupiter, Saturn, Rahu, and Ketu.
- **Authentic 36-Guna Ashtakoota Milan:**
  - Varna (1 point)
  - Vashya (2 points)
  - Tara (3 points)
  - Yoni (4 points — accounts for natural animal enmity)
  - Graha Maitri (5 points — planetary friendship matrices)
  - Gana (6 points — Deva, Manushya, Rakshasa)
  - Bhakoot (7 points — handles 6/8 Shadashtak, 9/5 Navapancham, 12/2 Dwi-Dwadash)
  - Nadi (8 points — Aadi, Madhya, Antya with automatic **Nadi Dosha** detection)
- **Manglik Dosha Detection:** Analyzes Mars placement in Houses 1, 4, 7, 8, and 12 with full cancellation and severity rules (High / Medium / Low).

---

### 2. 💍 Dual Intent: Serious Matrimonial vs. Dating
- **Marriage Mode:** Full matrimonial biodata collection including Gotra, Sub-caste, Family Background, Diet, Smoking/Drinking habits, Marital History (Never Married, Divorced, Widowed, Annulled), Children Status, and Annual Income.
- **Deterministic Readiness Engine:** Dynamically calculates profile completion (0–100%) against mandatory matrimonial milestones before unlocking full matchmaking discovery.
- **Tiered Partner Preferences:** Supports Must-Have and Flexible preference filtering across Religion, Caste, Education, Location, and Diet.

---

### 3. 🔐 Security & SSDLC Compliance
- **Private Profile Split:** Extremely sensitive attributes (exact birth time, exact coordinates) are isolated in `public.private_profiles` with strict owner-only RLS (`auth.uid() = id`).
- **Photo Privacy & Request Workflow:** Profiles can toggle photo privacy between `public` and `private`. Private photos require explicit mutual requests (`public.photo_requests`) before access is granted.
- **Database Triggers:** Instant, safe profile provisioning via `public.handle_new_user()` on `auth.users`.

---

### 4. ⚡ Native Android Google Sign-In & Supabase Auth
- **Android Credential Manager & Play Services:** Powered by `capacitor-native-google-one-tap-signin` for Android 14/15/compileSdk 36.
- **GoTrue ID Token Handoff:** Native Android retrieves Google ID tokens and authorizes directly with Supabase via `supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })`.
- **Hybrid Support:** Falls back to browser OAuth during web development.
- **Preserved Multi-Auth:** SMS Phone OTP and Email/Password authentication remain 100% active and functional alongside Google Sign-In.

---

## 📂 Project Structure

```
Astra-android/
├── web/                                 # React + Vite web and Capacitor core
│   ├── src/
│   │   ├── components/                  # UI components & buttons
│   │   ├── context/                     # AstraContext (global state, auth listener)
│   │   ├── data/                        # Astrology engine, translations, questionnaires
│   │   ├── lib/                         # Supabase client & Capacitor Preferences storage
│   │   ├── pages/                       # Splash, Discover, MarriageOnboarding, Horoscope, Chat
│   │   ├── services/                    # AuthService, ProfileService, DiscoveryService, PhotoService
│   │   └── utils/                       # ProfileReadiness calculator
│   ├── android/                         # Capacitor Android native project
│   │   ├── app/                         # Android application module (compileSdk 36)
│   │   │   ├── build.gradle             # Application dependencies & packaging
│   │   │   └── src/main/AndroidManifest.xml
│   │   ├── build.gradle                 # Root Gradle build script with SDK 36 alignment
│   │   └── variables.gradle             # Android SDK & dependency version definitions
│   ├── supabase/
│   │   └── migrations/                  # Versioned SQL migrations (RLS, schema, triggers)
│   └── tests/                           # Engine & integration test suites
│       ├── AshtakootaEngine.test.ts
│       ├── ChemistryEngine.test.ts
│       ├── NumerologyEngine.test.ts
│       ├── VedicAstrologyEngine.test.ts
│       ├── profileReadiness.test.ts
│       └── authService.test.ts
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js:** v18+ (tested on Node.js v20+)
- **Java JDK:** OpenJDK 21
- **Android SDK:** API 36 with Build-Tools 36.0.0
- **Supabase Account / Project**

### 1. Clone & Install Dependencies
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

### 3. Run Web Development Server
```bash
cd web
npm run dev
```

### 4. Run Automated Test Suites
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

## 🤖 Building & Running on Android

### 1. Build Frontend & Sync Capacitor
```bash
cd web
npm run build
npx cap sync android
```

### 2. Configure Local Android SDK
Ensure `web/android/local.properties` contains your Android SDK path:
```properties
sdk.dir=/path/to/your/Android/Sdk
```

### 3. Build Debug APK (Pre-signed for Testing)
```bash
cd web/android
./gradlew assembleDebug
```
The debug APK will be generated at:
```
web/android/app/build/outputs/apk/debug/app-debug.apk
```

### 4. Build Release APK
```bash
cd web/android
./gradlew assembleRelease
```
The release APK will be generated at:
```
web/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### 5. Install on Device via ADB
```bash
adb install -r web/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔑 Google Authentication & Cloud Console Setup

To enable real Google Sign-In with Supabase:

1. **Google Cloud Console ([console.cloud.google.com](https://console.cloud.google.com)):**
   - Create an **Android OAuth Client ID**:
     - **Package Name:** `com.aistudio.astra.vedicmatch`
     - **SHA-1 Fingerprint:** `7D:1B:5D:36:B0:4C:B5:E6:10:10:C2:7E:43:EC:8C:27:05:98:66:22`
     - **SHA-256 Fingerprint:** `3A:AA:07:8A:32:FC:C6:77:BB:66:EA:01:94:99:49:89:A2:1D:99:F3:45:01:09:05:30:BF:91:A2:82:B0:9C:D3`
   - Create a **Web Application OAuth Client ID**:
     - Copy the **Client ID** and **Client Secret**.

2. **Supabase Dashboard (Authentication -> Providers -> Google):**
   - Turn on Google authentication.
   - Set **Client ID (for OAuth)** to your Web Client ID.
   - Set **Client Secret (for OAuth)** to your Web Client Secret.
   - Under **Authorized Client IDs**, enter both your Android Client ID and Web Client ID.

3. **Application Environment:**
   - Set `VITE_GOOGLE_CLIENT_ID` in `web/.env` to the Web Client ID.

---

## 📦 Releases

Download the latest verified builds from GitHub Releases:
- **Upstream Releases:** [B2krobbery/Astra-android/releases](https://github.com/B2krobbery/Astra-android/releases/tag/v1.0.0-android)
- **Fork Releases:** [marvelpokemaster/Astra-android/releases](https://github.com/marvelpokemaster/Astra-android/releases/tag/v1.0.0-android)

---

## 📄 License
Private and Proprietary. All rights reserved.
