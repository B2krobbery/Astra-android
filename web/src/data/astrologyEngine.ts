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
    const emotional = candidate.emotionalScore ?? 90;
    const nakshatra = candidate.nakshatraScore ?? 88;
    const rashi = candidate.rashiScore ?? 84;
    const overall = candidate.overallScore ?? candidate.compatibilityScore ?? 87;

    let level = 'Compatible Match';
    if (overall >= 85) level = 'Highly Compatible';
    else if (overall >= 75) level = 'Very Compatible';

    const gunaMatched = Math.min(34, Math.max(24, Math.round((overall * 36) / 100)));

    return {
      candidateName: candidate.name,
      score: overall,
      level,
      emotionalScore: emotional,
      nakshatraScore: nakshatra,
      rashiScore: rashi,
      overallHarmonyScore: overall,
      reasonTitle: 'Why this match?',
      reasonDescription: candidate.compatibilityNote || 'Your profiles show strong compatibility in emotional temperament and communication under Vedic principles.',
      userNakshatra: user.nakshatra || 'Rohini',
      candidateNakshatra: candidate.nakshatra,
      gunaScore: `${gunaMatched}/36 Gunas Matched`
    };
  }

  static getAstroAiResponse(question: string, user: UserProfile): string {
    return `Based on your birth Nakshatra (${user.nakshatra || 'Rohini'}), celestial transits indicate high emotional alignment and positive relationship energy.`;
  }
}
