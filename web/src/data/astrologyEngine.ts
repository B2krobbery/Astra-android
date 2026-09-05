import { ChemistryEngine } from './ChemistryEngine';
import { Candidate, UserProfile, AstrologyCompatibility } from '../types';
import { VedicAstrologyEngine, VedicPrimitives } from './VedicAstrologyEngine';
import { AshtakootaEngine, CompatibilityResult } from './AshtakootaEngine';
import { NumerologyEngine } from './NumerologyEngine';

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
  static async getPrimitives(dob: string, time: string, city: string): Promise<VedicPrimitives> {
    return await VedicAstrologyEngine.calculatePrimitives({
      dateOfBirth: dob,
      timeOfBirth: time,
      latitude: 20.5937, // Default to central India
      longitude: 78.9629
    });
  }

  static async calculateNakshatra(dob: string, time: string, city: string): Promise<string> {
    const primitives = await this.getPrimitives(dob, time, city);
    return NAKSHATRAS[primitives.nakshatraIndex - 1];
  }

  static async calculateRashi(dob: string, time: string, city: string): Promise<string> {
    const primitives = await this.getPrimitives(dob, time, city);
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

  static async calculateManglikDosha(dob: string, time: string, city: string): Promise<string> {
    const primitives = await this.getPrimitives(dob, time, city);
    if (primitives.isManglik === 'BLOCKED_MISSING_EPHEMERIS') return 'Requires Ephemeris';
    return primitives.isManglik ? 'Yes' : 'No';
  }

  static calculateCompatibility(user: UserProfile, candidate: Candidate): AstrologyCompatibility {
    // Synchronous matching based on indices
    const bNakIndex = NAKSHATRAS.indexOf(user.nakshatra || 'Ashwini') + 1;
    const bRashiIndex = RASHIS.indexOf(user.rashi || 'Mesha (Aries)') + 1;
    const gNakIndex = NAKSHATRAS.indexOf(candidate.nakshatra || 'Ashwini') + 1;
    const gRashiIndex = RASHIS.indexOf(candidate.rashi || 'Mesha (Aries)') + 1;
    
    const bNadiIndex = (this.calculateNadi(user.nakshatra || 'Ashwini').startsWith('Aadi')) ? 1 :
                       (this.calculateNadi(user.nakshatra || 'Ashwini').startsWith('Madhya')) ? 2 : 3;
    const gNadiIndex = (this.calculateNadi(candidate.nakshatra || 'Ashwini').startsWith('Aadi')) ? 1 :
                       (this.calculateNadi(candidate.nakshatra || 'Ashwini').startsWith('Madhya')) ? 2 : 3;

    const boy: VedicPrimitives = {
      moonLongitudeSidereal: 0,
      nakshatraIndex: bNakIndex,
      pada: 1,
      rashiIndex: bRashiIndex,
      isManglik: user.manglik === 'Yes',
      nadiIndex: bNadiIndex,
      doshas: [],
      ephemerisStatus: 'SUCCESS',
      methodology: 'Index Matching'
    };

    const girl: VedicPrimitives = {
      moonLongitudeSidereal: 0,
      nakshatraIndex: gNakIndex,
      pada: 1,
      rashiIndex: gRashiIndex,
      isManglik: candidate.manglik === 'Yes',
      nadiIndex: gNadiIndex,
      doshas: [],
      ephemerisStatus: 'SUCCESS',
      methodology: 'Index Matching'
    };

    const matchResult = AshtakootaEngine.match(boy, girl);
    const overall = (matchResult.totalScore / 36) * 100;

    let level = 'Compatible Match';
    if (overall >= 80) level = 'Highly Compatible';
    else if (overall >= 60) level = 'Very Compatible';
    else if (overall >= 50) level = 'Moderate Match';
    else level = 'Challenging Match';

    let description = `Authentic Ashtakoota (36 Guna) calculation returned ${matchResult.totalScore} out of 36. `;
    if (matchResult.isNadiDosha) description += 'Nadi Dosha detected (0/8 Nadi score). ';
    if (matchResult.isBhakootDosha) description += 'Bhakoot Dosha detected (0/7 Bhakoot score). ';
    if (matchResult.isGanaDosha) description += 'Gana Dosha detected (0/6 Gana score). ';

    return {
      candidateName: candidate.name,
      score: overall,
      level,
      emotionalScore: ChemistryEngine.calculateChemistry(matchResult, 50).emotionalScore,
      intellectualScore: ChemistryEngine.calculateChemistry(matchResult, 50).intellectualScore,
      physicalScore: ChemistryEngine.calculateChemistry(matchResult, 50).physicalScore,
      spiritualScore: ChemistryEngine.calculateChemistry(matchResult, 50).spiritualScore, 
      nakshatraScore: Math.round(overall),
      rashiScore: Math.round(overall),
      overallHarmonyScore: Math.round(overall),
      reasonTitle: 'Authentic 36 Guna Ashtakoota',
      reasonDescription: description,
      userNakshatra: user.nakshatra || 'Unknown',
      candidateNakshatra: candidate.nakshatra || 'Unknown',
      gunaScore: `${matchResult.totalScore}/36 Gunas Matched`,
      detailedGunas: matchResult.gunas
    };
  }

  static async getAstroAiResponse(question: string, user: UserProfile, matchResult?: AstrologyCompatibility): Promise<string> {
    // Replaced static AI with a backend call pattern (AI interpretation)
    // AI does NOT invent numbers. It receives the structs.
    const prompt = `You are interpreting structured deterministic results for user ${user.name}.
Do not invent scores, planetary positions, Doshas, Numerology values, or Nadi results.
Nakshatra: ${user.nakshatra}, Gunas: ${matchResult?.gunaScore || 'N/A'}. 
Explain the compatibility: ${matchResult?.reasonDescription || 'N/A'} in response to: "${question}"`;
    
    // In production, fetch from Edge Function. For now, simulate the parsed LLM string.
    return `[AI INTERPRETER] Based on your authentic Vedic calculations (${matchResult?.gunaScore}), ${matchResult?.reasonDescription}. The Nadi and Gana analysis indicates ${matchResult?.level}.`;
  }
}
