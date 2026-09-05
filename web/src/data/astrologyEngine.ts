import { Candidate, UserProfile, AstrologyCompatibility } from '../types';

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

function stringHashCode(str: string): number {
  if (!str) return 0;
  const s = String(str);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export class AstrologyEngine {
  static calculateNakshatra(dob: string, time: string, city: string): string {
    const seed = stringHashCode(dob + time + city);
    const index = seed % NAKSHATRAS.length;
    return NAKSHATRAS[index];
  }

  static calculateRashi(dob: string, time: string, city: string): string {
    const seed = stringHashCode(dob) * 31 + stringHashCode(time + city);
    const index = Math.abs(seed) % RASHIS.length;
    return RASHIS[index];
  }

  static calculateNadi(nakshatra: string): string {
    if (!nakshatra) return 'Unknown';
    const aadi = ['Ashwini', 'Ardra', 'Punarvasu', 'Uttara Phalguni', 'Hasta', 'Jyeshtha', 'Mula', 'Shatabhisha', 'Purva Bhadrapada'];
    const madhya = ['Bharani', 'Mrigashira', 'Pushya', 'Purva Phalguni', 'Chitra', 'Anuradha', 'Purva Ashadha', 'Dhanishta', 'Uttara Bhadrapada'];
    const antya = ['Krittika', 'Rohini', 'Ashlesha', 'Magha', 'Svati', 'Vishakha', 'Uttara Ashadha', 'Shravana', 'Revati'];
    
    if (aadi.includes(nakshatra)) return 'Aadi (First)';
    if (madhya.includes(nakshatra)) return 'Madhya (Middle)';
    if (antya.includes(nakshatra)) return 'Antya (Last)';
    return 'Unknown';
  }

  static calculateManglikDosha(dob: string, time: string, city: string): string {
    // This is a simulated prototype calculation. Real Manglik Dosha requires complex ephemeris for Mars position.
    const seed = stringHashCode(dob + time + city);
    const mod = seed % 100;
    if (mod < 25) return 'Yes'; // 25% chance High Manglik
    if (mod < 45) return 'Anshik (Partial)'; // 20% chance Partial
    return 'No'; // 55% chance Non-Manglik
  }

  static calculateCompatibility(user: UserProfile, candidate: Candidate): AstrologyCompatibility {
    // Deterministic prototype calculation based on IDs
    const userHash = stringHashCode(user.name + user.nakshatra);
    const candHash = stringHashCode(candidate.id + candidate.nakshatra);
    
    // Generate scores between 60 and 98
    const baseScore = 60 + ((userHash + candHash) % 39);
    const emotional = Math.min(99, baseScore + ((userHash % 5) - 2));
    const nakshatraScore = Math.min(99, baseScore + ((candHash % 7) - 3));
    const rashiScore = Math.min(99, baseScore + ((userHash % 3) - 1));
    const overall = Math.round((emotional + nakshatraScore + rashiScore) / 3);

    let level = 'Compatible Match';
    if (overall >= 85) level = 'Highly Compatible';
    else if (overall >= 75) level = 'Very Compatible';
    else level = 'Moderate Match';

    const gunaMatched = Math.min(36, Math.max(18, Math.round((overall * 36) / 100)));

    return {
      candidateName: candidate.name,
      score: overall,
      level,
      emotionalScore: emotional,
      nakshatraScore: nakshatraScore,
      rashiScore: rashiScore,
      overallHarmonyScore: overall,
      reasonTitle: 'Prototype Compatibility Analysis',
      reasonDescription: '(PROTOTYPE) Your profiles show alignment based on simulated Vedic metrics. Actual engine not connected.',
      userNakshatra: user.nakshatra || 'Unknown',
      candidateNakshatra: candidate.nakshatra || 'Unknown',
      gunaScore: `${gunaMatched}/36 Gunas Matched`
    };
  }

  static getAstroAiResponse(question: string, user: UserProfile): string {
    return `Based on your birth Nakshatra (${user.nakshatra || 'Rohini'}), celestial transits indicate high emotional alignment and positive relationship energy.`;
  }
}
