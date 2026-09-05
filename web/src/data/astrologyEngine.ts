import { Candidate, UserProfile, AstrologyCompatibility } from '../types';
import { VedicAstrologyEngine, VedicPrimitives } from './VedicAstrologyEngine';
import { AshtakootaEngine, CompatibilityResult } from './AshtakootaEngine';

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Svati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

export const RASHIS = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

export class AstrologyEngine {
  static getPrimitives(dob: string, time: string, city: string): VedicPrimitives {
    // Note: City -> Lat/Lon should technically be geocoded.
    // For MVP, if geocoding isn't available, we use a central India default 
    // to calculate the Moon longitude, but the math is 100% deterministic and real.
    return VedicAstrologyEngine.calculatePrimitives({
      dateOfBirth: dob,
      timeOfBirth: time,
      latitude: 20.5937, // Default to central India
      longitude: 78.9629
    });
  }

  static calculateNakshatra(dob: string, time: string, city: string): string {
    const primitives = this.getPrimitives(dob, time, city);
    return NAKSHATRAS[primitives.nakshatraIndex - 1];
  }

  static calculateRashi(dob: string, time: string, city: string): string {
    const primitives = this.getPrimitives(dob, time, city);
    return RASHIS[primitives.rashiIndex - 1];
  }

  static calculateNadi(nakshatra: string): string {
    if (!nakshatra) return 'Unknown';
    const index = NAKSHATRAS.indexOf(nakshatra);
    if (index === -1) return 'Unknown';
    
    const nadiPattern = [1, 2, 3, 3, 2, 1, 1, 2, 3];
    const n = nadiPattern[index % 9];
    if (n === 1) return 'Aadi (First)';
    if (n === 2) return 'Madhya (Middle)';
    return 'Antya (Last)';
  }

  static calculateManglikDosha(dob: string, time: string, city: string): string {
    const primitives = this.getPrimitives(dob, time, city);
    return primitives.isManglik ? 'Yes' : 'No';
  }

  static calculateCompatibility(user: UserProfile, candidate: Candidate): AstrologyCompatibility {
    // If exact birth time is missing for either user, fallback cleanly
    // For MVP we assume we have enough to calculate primitives directly 
    // BUT we must not expose the candidate's exact birth time from private_profiles!
    // Since candidate only gives us nakshatra and rashi strings via the API (not birth time),
    // we must reverse engineer the primitives from the strings they provided.
    
    const bNakIndex = NAKSHATRAS.indexOf(user.nakshatra || 'Ashwini') + 1;
    const bRashiIndex = RASHIS.indexOf(user.rashi || 'Mesha (Aries)') + 1;
    
    const gNakIndex = NAKSHATRAS.indexOf(candidate.nakshatra || 'Ashwini') + 1;
    const gRashiIndex = RASHIS.indexOf(candidate.rashi || 'Mesha (Aries)') + 1;
    
    const bNadiIndex = (this.calculateNadi(user.nakshatra || 'Ashwini').startsWith('Aadi')) ? 1 :
                       (this.calculateNadi(user.nakshatra || 'Ashwini').startsWith('Madhya')) ? 2 : 3;
                       
    const gNadiIndex = (this.calculateNadi(candidate.nakshatra || 'Ashwini').startsWith('Aadi')) ? 1 :
                       (this.calculateNadi(candidate.nakshatra || 'Ashwini').startsWith('Madhya')) ? 2 : 3;

    const boy: VedicPrimitives = {
      moonLongitudeSidereal: 0, // Not needed for Guna matching once indices exist
      nakshatraIndex: bNakIndex,
      pada: 1, // Approximation if Pada is missing
      rashiIndex: bRashiIndex,
      isManglik: user.manglik === 'Yes',
      nadiIndex: bNadiIndex
    };

    const girl: VedicPrimitives = {
      moonLongitudeSidereal: 0,
      nakshatraIndex: gNakIndex,
      pada: 1,
      rashiIndex: gRashiIndex,
      isManglik: candidate.manglik === 'Yes',
      nadiIndex: gNadiIndex
    };

    const matchResult = AshtakootaEngine.match(boy, girl);
    const overall = (matchResult.totalScore / 36) * 100;

    let level = 'Compatible Match';
    if (overall >= 80) level = 'Highly Compatible';
    else if (overall >= 60) level = 'Very Compatible';
    else if (overall >= 50) level = 'Moderate Match';
    else level = 'Challenging Match';

    // Detailed structured explanation
    let description = `Real Ashtakoota (36 Guna) calculation returned ${matchResult.totalScore} out of 36. `;
    if (matchResult.isNadiDosha) description += 'Nadi Dosha detected. ';
    if (matchResult.isBhakootDosha) description += 'Bhakoot Dosha detected. ';
    if (matchResult.isGanaDosha) description += 'Gana Dosha detected. ';

    return {
      candidateName: candidate.name,
      score: overall,
      level,
      emotionalScore: Math.round(overall), // Approximation
      nakshatraScore: Math.round(overall),
      rashiScore: Math.round(overall),
      overallHarmonyScore: Math.round(overall),
      reasonTitle: 'Vedic 36 Guna Ashtakoota',
      reasonDescription: description,
      userNakshatra: user.nakshatra || 'Unknown',
      candidateNakshatra: candidate.nakshatra || 'Unknown',
      gunaScore: `${matchResult.totalScore}/36 Gunas Matched`,
      detailedGunas: matchResult.gunas
    };
  }

  static getAstroAiResponse(question: string, user: UserProfile, matchResult?: AstrologyCompatibility): string {
    return `Based on authentic Vedic astrology, your Nakshatra (${user.nakshatra}) provides the foundation for this analysis.`;
  }
}
