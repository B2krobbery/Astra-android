export interface NumerologyReport {
  lifePathNumber: number;
  lifePathDescription: string;
  destinyNumber: number;
  destinyDescription: string;
  soulUrgeNumber: number;
  soulUrgeDescription: string;
  personalityNumber: number;
  personalityDescription: string;
  compatibilityScore: number; // 0 - 100
  compatibilityVerdict: string;
  methodology: string;
}

export const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

export const LIFE_PATH_TRAITS: Record<number, string> = {
  1: 'The Leader: Independent, ambitious, pioneering, driven by self-reliance',
  2: 'The Peacemaker: Harmonious, diplomatic, intuitive, seeks cooperation and peace',
  3: 'The Creative Communicator: Expressive, optimistic, social, charming, artistic',
  4: 'The Builder: Practical, disciplined, loyal, grounded, values stability and trust',
  5: 'The Explorer: Dynamic, adaptable, versatile, passionate about freedom and growth',
  6: 'The Nurturer: Loving, supportive, family-centric, responsible, deeply caring',
  7: 'The Seeker: Analytical, spiritual, introspective, values wisdom and truth',
  8: 'The Achiever: Visionary, strategic, resilient, powerful, goal-oriented',
  9: 'The Humanitarian: Compassionate, generous, philosophical, universal lover',
  11: 'Master Intuitive: Highly spiritual, illuminating, visionary, inspiring',
  22: 'Master Builder: Turns high ideals into tangible reality, enduring impact',
  33: 'Master Teacher: Selfless devotion, uplifting humanity, profound empathy'
};

export class NumerologyEngine {
  /**
   * Reduces a positive integer to a single digit (1-9) while preserving Master Numbers (11, 22, 33)
   */
  static reduceDigits(num: number, preserveMasterNumbers = true): number {
    if (num <= 0) return 1;
    let current = num;

    while (current > 9) {
      if (preserveMasterNumbers && (current === 11 || current === 22 || current === 33)) {
        return current;
      }
      current = current
        .toString()
        .split('')
        .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
    }
    return current;
  }

  /**
   * Calculates Life Path Number from exact Date of Birth (YYYY-MM-DD)
   */
  static calculateLifePath(dobStr: string): number {
    if (!dobStr) return 1;
    const cleanDob = dobStr.replace(/[^0-9]/g, '');
    if (!cleanDob) return 1;

    // Standard Pythagorean method: reduce Year, Month, Day individually, then sum and reduce
    const parts = dobStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10) || 0;
      const month = parseInt(parts[1], 10) || 0;
      const day = parseInt(parts[2], 10) || 0;

      const reducedYear = this.reduceDigits(year, false);
      const reducedMonth = this.reduceDigits(month, false);
      const reducedDay = this.reduceDigits(day, false);

      return this.reduceDigits(reducedYear + reducedMonth + reducedDay, true);
    }

    // Fallback: sum of all digits
    const total = cleanDob.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    return this.reduceDigits(total, true);
  }

  /**
   * Calculates Destiny (all letters), Soul Urge (vowels), Personality (consonants) from full name
   */
  static calculateNameNumbers(fullName: string): { destiny: number; soulUrge: number; personality: number } {
    if (!fullName) return { destiny: 1, soulUrge: 1, personality: 1 };
    const clean = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    const vowels = ['A', 'E', 'I', 'O', 'U'];

    let totalSum = 0;
    let vowelSum = 0;
    let consonantSum = 0;

    for (const char of clean) {
      const val = PYTHAGOREAN_MAP[char] || 0;
      totalSum += val;
      if (vowels.includes(char)) {
        vowelSum += val;
      } else {
        consonantSum += val;
      }
    }

    return {
      destiny: this.reduceDigits(totalSum, true),
      soulUrge: this.reduceDigits(vowelSum, true),
      personality: this.reduceDigits(consonantSum, true)
    };
  }

  /**
   * Calculates deterministic compatibility between two Life Path numbers
   * Authentic Pythagorean compatibility matrix (0 - 100)
   */
  static calculateLifePathHarmony(lp1: number, lp2: number): { score: number; description: string } {
    // Reduce master numbers for matrix lookup
    const r1 = lp1 > 9 ? (lp1 === 11 ? 2 : lp1 === 22 ? 4 : 6) : lp1;
    const r2 = lp2 > 9 ? (lp2 === 11 ? 2 : lp2 === 22 ? 4 : 6) : lp2;

    const matrix: Record<number, Record<number, number>> = {
      1: { 1: 75, 2: 70, 3: 92, 4: 65, 5: 90, 6: 60, 7: 85, 8: 68, 9: 78 },
      2: { 1: 70, 2: 85, 3: 75, 4: 90, 5: 60, 6: 95, 7: 72, 8: 88, 9: 80 },
      3: { 1: 92, 2: 75, 3: 88, 4: 55, 5: 95, 6: 82, 7: 70, 8: 60, 9: 90 },
      4: { 1: 65, 2: 90, 3: 55, 4: 85, 5: 50, 6: 88, 7: 82, 8: 92, 9: 60 },
      5: { 1: 90, 2: 60, 3: 95, 4: 50, 5: 85, 6: 65, 7: 88, 8: 70, 9: 75 },
      6: { 1: 60, 2: 95, 3: 82, 4: 88, 5: 65, 6: 90, 7: 68, 8: 85, 9: 92 },
      7: { 1: 85, 2: 72, 3: 70, 4: 82, 5: 88, 6: 68, 7: 90, 8: 60, 9: 80 },
      8: { 1: 68, 2: 88, 3: 60, 4: 92, 5: 70, 6: 85, 7: 60, 8: 82, 9: 65 },
      9: { 1: 78, 2: 80, 3: 90, 4: 60, 5: 75, 6: 92, 7: 80, 8: 65, 9: 88 }
    };

    const score = matrix[r1]?.[r2] || 75;
    let description = 'Neutral energetic resonance';
    if (score >= 90) description = 'Exceptional energetic affinity & natural life rhythm';
    else if (score >= 80) description = 'Strong supportive vibration with mutual enrichment';
    else if (score >= 70) description = 'Complementary perspectives fostering mutual growth';
    else description = 'Requires intentional communication to bridge differing pacing';

    return { score, description };
  }

  static calculateHarmony(lp1: number, lp2: number): number {
    return this.calculateLifePathHarmony(lp1, lp2).score;
  }

  /**
   * Generates full Numerology analysis report for a profile
   */
  static generateReport(fullName: string, dobStr: string, partnerDobStr?: string): NumerologyReport {
    const lp = this.calculateLifePath(dobStr);
    const nameNumbers = this.calculateNameNumbers(fullName);

    let compatibilityScore = 80;
    let compatibilityVerdict = 'Harmonious vibrational frequency';

    if (partnerDobStr) {
      const partnerLp = this.calculateLifePath(partnerDobStr);
      const harmony = this.calculateLifePathHarmony(lp, partnerLp);
      compatibilityScore = harmony.score;
      compatibilityVerdict = harmony.description;
    }

    return {
      lifePathNumber: lp,
      lifePathDescription: LIFE_PATH_TRAITS[lp] || 'Analytical, evolving seeker',
      destinyNumber: nameNumbers.destiny,
      destinyDescription: LIFE_PATH_TRAITS[nameNumbers.destiny] || 'Dynamic destiny path',
      soulUrgeNumber: nameNumbers.soulUrge,
      soulUrgeDescription: LIFE_PATH_TRAITS[nameNumbers.soulUrge] || 'Inner emotional sanctuary',
      personalityNumber: nameNumbers.personality,
      personalityDescription: LIFE_PATH_TRAITS[nameNumbers.personality] || 'Outer social presentation',
      compatibilityScore,
      compatibilityVerdict,
      methodology: 'Traditional Pythagorean Numerology (Master Numbers Preserved)'
    };
  }
}
