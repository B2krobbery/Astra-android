import { VedicPrimitives } from './VedicAstrologyEngine';

export interface GunaScore {
  name: string;
  score: number;
  max: number;
  description: string;
}

export interface CompatibilityResult {
  totalScore: number;
  maxScore: number;
  gunas: GunaScore[];
  isNadiDosha: boolean;
  isBhakootDosha: boolean;
  isGanaDosha: boolean;
}

export const AshtakootaEngine = {
  // Varna Koota (1 point) - Spiritual/Ego compatibility
  getVarna(rashi: number): number {
    // 1: Brahmin (Cancer, Scorpio, Pisces)
    // 2: Kshatriya (Aries, Leo, Sagittarius)
    // 3: Vaishya (Taurus, Virgo, Capricorn)
    // 4: Shudra (Gemini, Libra, Aquarius)
    if ([4, 8, 12].includes(rashi)) return 1;
    if ([1, 5, 9].includes(rashi)) return 2;
    if ([2, 6, 10].includes(rashi)) return 3;
    return 4;
  },

  calculateVarna(boyRashi: number, girlRashi: number): GunaScore {
    const bVarna = this.getVarna(boyRashi);
    const gVarna = this.getVarna(girlRashi);
    // Boy varna should ideally be same or higher (lower number) than girl
    const score = (bVarna <= gVarna) ? 1 : 0;
    return { name: 'Varna', score, max: 1, description: 'Spiritual development and ego compatibility.' };
  },

  // Vashya Koota (2 points) - Mutual attraction/control
  getVashya(rashi: number): number {
    // 1: Chatuspada (Quadrupeds) - Aries, Taurus, Sagittarius(2nd half), Capricorn(1st half)
    // 2: Manav (Human) - Gemini, Virgo, Libra, Aquarius, Sagittarius(1st half)
    // 3: Jalchar (Water) - Cancer, Capricorn(2nd half), Pisces
    // 4: Vanachar (Wild) - Leo
    // 5: Keeta (Insect) - Scorpio
    if ([1, 2].includes(rashi)) return 1;
    if ([3, 6, 7, 11].includes(rashi)) return 2;
    if ([4, 12].includes(rashi)) return 3;
    if (rashi === 5) return 4;
    return 5;
  },

  calculateVashya(boyRashi: number, girlRashi: number): GunaScore {
    const bVashya = this.getVashya(boyRashi);
    const gVashya = this.getVashya(girlRashi);
    let score = 0;
    if (bVashya === gVashya) score = 2;
    else if ((bVashya === 2 && gVashya === 1) || (bVashya === 1 && gVashya === 2)) score = 1; // Partial
    else if ((bVashya === 2 && gVashya === 3) || (bVashya === 3 && gVashya === 2)) score = 1;
    // ... simplified matrix for MVP ...
    else score = 0.5; // fallback average
    return { name: 'Vashya', score, max: 2, description: 'Mutual attraction and inherent influence.' };
  },

  // Tara Koota (3 points) - Destiny/Health
  calculateTara(boyNak: number, girlNak: number): GunaScore {
    const diff = (girlNak - boyNak + 27) % 27;
    const bTara = (diff % 9) + 1;
    const diff2 = (boyNak - girlNak + 27) % 27;
    const gTara = (diff2 % 9) + 1;
    
    // 1,3,5,7 are inauspicious. 2,4,6,8,9 are auspicious.
    const bAusp = [2,4,6,8,9].includes(bTara) ? 1.5 : 0;
    const gAusp = [2,4,6,8,9].includes(gTara) ? 1.5 : 0;
    return { name: 'Tara', score: bAusp + gAusp, max: 3, description: 'Health, well-being, and destiny.' };
  },

  // Yoni Koota (4 points) - Physical intimacy
  getYoni(nak: number): number {
    // Simplified 14 Yonis mapping based on Nakshatra
    return (nak % 14) + 1; 
  },
  
  calculateYoni(boyNak: number, girlNak: number): GunaScore {
    const bYoni = this.getYoni(boyNak);
    const gYoni = this.getYoni(girlNak);
    let score = 0;
    if (bYoni === gYoni) score = 4;
    else if (Math.abs(bYoni - gYoni) % 7 === 0) score = 0; // Hostile
    else score = 2; // Neutral/Friendly
    return { name: 'Yoni', score, max: 4, description: 'Physical compatibility and intimacy.' };
  },

  // Graha Maitri (5 points) - Mental compatibility
  calculateGrahaMaitri(boyRashi: number, girlRashi: number): GunaScore {
    // Lords of Rashi: 1,8:Mars; 2,7:Venus; 3,6:Mercury; 4:Moon; 5:Sun; 9,12:Jupiter; 10,11:Saturn
    // Simplified score logic
    const diff = Math.abs(boyRashi - girlRashi);
    let score = 5;
    if (diff === 6) score = 0; // opposite
    else if (diff % 2 !== 0) score = 4;
    else score = 3;
    return { name: 'Graha Maitri', score, max: 5, description: 'Mental and intellectual compatibility.' };
  },

  // Gana Koota (6 points) - Temperament
  getGana(nak: number): number {
    // 1: Deva, 2: Manushya, 3: Rakshasa
    const rakshasa = [9, 14, 18, 19, 23, 24];
    const deva = [1, 5, 7, 8, 13, 15, 17, 22, 27];
    if (rakshasa.includes(nak)) return 3;
    if (deva.includes(nak)) return 1;
    return 2;
  },

  calculateGana(boyNak: number, girlNak: number): GunaScore {
    const bGana = this.getGana(boyNak);
    const gGana = this.getGana(girlNak);
    let score = 0;
    if (bGana === gGana) score = 6;
    else if (bGana === 1 && gGana === 2) score = 6;
    else if (bGana === 2 && gGana === 1) score = 5;
    else if (bGana === 3 && gGana === 1) score = 1;
    else if (bGana === 1 && gGana === 3) score = 0;
    else score = 0;
    return { name: 'Gana', score, max: 6, description: 'Temperament and character matching.' };
  },

  // Bhakoot (7 points) - Love/Emotional compatibility
  calculateBhakoot(boyRashi: number, girlRashi: number): GunaScore {
    let diff = (girlRashi - boyRashi);
    if (diff <= 0) diff += 12;
    // 1/7, 2/12, 5/9, 6/8 positions
    let score = 7;
    if (diff === 6 || diff === 8) score = 0; // Shadashtak
    if (diff === 2 || diff === 12) score = 0; // Dwirdwadash
    if (diff === 5 || diff === 9) score = 0; // Navpancham (some are inauspicious)
    return { name: 'Bhakoot', score, max: 7, description: 'Emotional bonding and mutual growth.' };
  },

  // Nadi Koota (8 points) - Genetic/Health
  calculateNadi(boyNadi: number, girlNadi: number): GunaScore {
    const score = (boyNadi === girlNadi) ? 0 : 8;
    return { name: 'Nadi', score, max: 8, description: 'Genetic compatibility and progeny.' };
  },

  match(boy: VedicPrimitives, girl: VedicPrimitives): CompatibilityResult {
    const gunas = [
      this.calculateVarna(boy.rashiIndex, girl.rashiIndex),
      this.calculateVashya(boy.rashiIndex, girl.rashiIndex),
      this.calculateTara(boy.nakshatraIndex, girl.nakshatraIndex),
      this.calculateYoni(boy.nakshatraIndex, girl.nakshatraIndex),
      this.calculateGrahaMaitri(boy.rashiIndex, girl.rashiIndex),
      this.calculateGana(boy.nakshatraIndex, girl.nakshatraIndex),
      this.calculateBhakoot(boy.rashiIndex, girl.rashiIndex),
      this.calculateNadi(boy.nadiIndex, girl.nadiIndex)
    ];

    const totalScore = gunas.reduce((acc, g) => acc + g.score, 0);
    
    return {
      totalScore,
      maxScore: 36,
      gunas,
      isNadiDosha: gunas[7].score === 0,
      isBhakootDosha: gunas[6].score === 0,
      isGanaDosha: gunas[5].score === 0
    };
  }
};
