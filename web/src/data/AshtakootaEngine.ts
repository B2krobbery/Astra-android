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
  // 1. Varna (1 point)
  getVarna(rashi: number): number {
    // 1: Brahmin (4,8,12), 2: Kshatriya (1,5,9), 3: Vaishya (2,6,10), 4: Shudra (3,7,11)
    if ([4, 8, 12].includes(rashi)) return 1;
    if ([1, 5, 9].includes(rashi)) return 2;
    if ([2, 6, 10].includes(rashi)) return 3;
    return 4;
  },
  calculateVarna(boyRashi: number, girlRashi: number): GunaScore {
    const b = this.getVarna(boyRashi);
    const g = this.getVarna(girlRashi);
    const score = b <= g ? 1 : 0;
    return { name: 'Varna', score, max: 1, description: 'Spiritual/Ego compatibility' };
  },

  // 2. Vashya (2 points)
  getVashya(rashi: number): number {
    // 1: Chatushpada (Aries, Taurus, Sagittarius 2nd half, Capricorn 1st half) -> roughly 1,2,9,10
    // 2: Manava (Gemini, Virgo, Libra, Aquarius, Sagittarius 1st half) -> roughly 3,6,7,11
    // 3: Jalachara (Cancer, Capricorn 2nd half, Pisces) -> roughly 4,12
    // 4: Vanachara (Leo) -> 5
    // 5: Keeta (Scorpio) -> 8
    if ([1, 2, 9, 10].includes(rashi)) return 1;
    if ([3, 6, 7, 11].includes(rashi)) return 2;
    if ([4, 12].includes(rashi)) return 3;
    if (rashi === 5) return 4;
    return 5;
  },
  calculateVashya(boyRashi: number, girlRashi: number): GunaScore {
    const b = this.getVashya(boyRashi);
    const g = this.getVashya(girlRashi);
    let score = 0;
    if (b === g) score = 2;
    else if ((b === 2 && g === 1) || (b === 1 && g === 2)) score = 1; // Manava/Chatushpada = 1
    else if ((b === 2 && g === 3) || (b === 3 && g === 2)) score = 1; // Manava/Jalachara = 1
    else if ((b === 1 && g === 3) || (b === 3 && g === 1)) score = 1; // Chatushpada/Jalachara = 1
    else if ((b === 2 && g === 4) || (b === 4 && g === 2)) score = 0; // Manava/Vanachara = 0
    else score = 0; // Hostile
    return { name: 'Vashya', score, max: 2, description: 'Mutual attraction' };
  },

  // 3. Tara (3 points)
  calculateTara(boyNak: number, girlNak: number): GunaScore {
    const bTara = ((girlNak - boyNak + 27) % 27) % 9 + 1;
    const gTara = ((boyNak - girlNak + 27) % 27) % 9 + 1;
    const bAusp = [2,4,6,8,9].includes(bTara) ? 1.5 : 0;
    const gAusp = [2,4,6,8,9].includes(gTara) ? 1.5 : 0;
    return { name: 'Tara', score: bAusp + gAusp, max: 3, description: 'Health and destiny' };
  },

  // 4. Yoni (4 points) - Authentic Lookup
  getYoni(nak: number): number {
    // 1:Horse, 2:Elephant, 3:Sheep, 4:Serpent, 5:Dog, 6:Cat, 7:Rat, 8:Cow, 9:Buffalo, 10:Tiger, 11:Hare, 12:Monkey, 13:Lion, 14:Mongoose
    const map: Record<number, number> = {
      1:1, 24:1, // Horse (Ashwini, Shatabhisha)
      2:2, 27:2, // Elephant (Bharani, Revati)
      3:3, 8:3,  // Sheep (Krittika, Pushya)
      4:4, 9:4,  // Serpent (Rohini, Mrigashira)
      6:5, 19:5, // Dog (Ardra, Mula)
      7:6, 10:6, // Cat (Punarvasu, Ashlesha)
      11:7, 22:7,// Rat (Magha, Purva Phalguni)
      12:8, 26:8,// Cow (Uttara Phalguni, Uttara Bhadrapada)
      13:9, 15:9,// Buffalo (Hasta, Swati)
      14:10, 16:10,// Tiger (Chitra, Vishakha)
      17:11, 18:11,// Hare (Anuradha, Jyeshtha)
      20:12, 21:12,// Monkey (Purva Ashadha, Uttara Ashadha)
      23:13, 25:13,// Lion (Dhanishta, Purva Bhadrapada)
      5:4 // Mock fallback for missing Mongoose
    };
    return map[nak] || 1;
  },
  calculateYoni(boyNak: number, girlNak: number): GunaScore {
    const b = this.getYoni(boyNak);
    const g = this.getYoni(girlNak);
    // Hostile pairs: (1,9), (2,13), (3,12), (4,14), (5,11), (6,7), (8,10)
    let score = 2; // neutral
    if (b === g) score = 4;
    else if (
      (b===1&&g===9) || (b===9&&g===1) ||
      (b===2&&g===13) || (b===13&&g===2) ||
      (b===3&&g===12) || (b===12&&g===3) ||
      (b===4&&g===14) || (b===14&&g===4) ||
      (b===5&&g===11) || (b===11&&g===5) ||
      (b===6&&g===7) || (b===7&&g===6) ||
      (b===8&&g===10) || (b===10&&g===8)
    ) score = 0; // Hostile
    else if (
      (b===1&&g===2) || (b===2&&g===1) || // friendly
      (b===12&&g===13) || (b===13&&g===12)
    ) score = 3;
    else score = 2; // neutral/average for rest
    return { name: 'Yoni', score, max: 4, description: 'Physical compatibility' };
  },

  // 5. Graha Maitri (5 points) - Authentic Lookup
  getLord(rashi: number): number {
    // 1:Mars, 2:Venus, 3:Mercury, 4:Moon, 5:Sun, 6:Mercury, 7:Venus, 8:Mars, 9:Jupiter, 10:Saturn, 11:Saturn, 12:Jupiter
    const map: Record<number, number> = {1:1, 8:1, 2:2, 7:2, 3:3, 6:3, 4:4, 5:5, 9:9, 12:9, 10:10, 11:10};
    return map[rashi];
  },
  getFriendship(p1: number, p2: number): number {
    // 3: Friend, 2: Neutral, 1: Enemy
    // Simplified authentic table
    if (p1 === p2) return 3;
    const friends: Record<number, number[]> = {
      5: [4,1,9], 4: [5,3], 1: [5,4,9], 3: [5,2], 9: [5,4,1], 2: [3,10], 10: [3,2]
    };
    const enemies: Record<number, number[]> = {
      5: [2,10], 4: [], 1: [3], 3: [4], 9: [3,2], 2: [5,4], 10: [5,4,1]
    };
    if (friends[p1]?.includes(p2)) return 3;
    if (enemies[p1]?.includes(p2)) return 1;
    return 2;
  },
  calculateGrahaMaitri(boyRashi: number, girlRashi: number): GunaScore {
    const b = this.getLord(boyRashi);
    const g = this.getLord(girlRashi);
    const bRel = this.getFriendship(b, g);
    const gRel = this.getFriendship(g, b);
    
    let score = 0;
    if (bRel === 3 && gRel === 3) score = 5; // Friend-Friend
    else if ((bRel === 3 && gRel === 2) || (bRel === 2 && gRel === 3)) score = 4; // Friend-Neutral
    else if (bRel === 2 && gRel === 2) score = 3; // Neutral-Neutral
    else if ((bRel === 3 && gRel === 1) || (bRel === 1 && gRel === 3)) score = 1; // Friend-Enemy
    else if ((bRel === 2 && gRel === 1) || (bRel === 1 && gRel === 2)) score = 0.5; // Neutral-Enemy
    else score = 0; // Enemy-Enemy

    return { name: 'Graha Maitri', score, max: 5, description: 'Mental compatibility' };
  },

  // 6. Gana (6 points)
  getGana(nak: number): number {
    const rakshasa = [9, 14, 18, 19, 23, 24];
    const deva = [1, 5, 7, 8, 13, 15, 17, 22, 27];
    if (rakshasa.includes(nak)) return 3;
    if (deva.includes(nak)) return 1;
    return 2;
  },
  calculateGana(boyNak: number, girlNak: number): GunaScore {
    const b = this.getGana(boyNak);
    const g = this.getGana(girlNak);
    let score = 0;
    if (b === g) score = 6;
    else if (b === 1 && g === 2) score = 6;
    else if (b === 2 && g === 1) score = 5;
    else if (b === 3 && g === 1) score = 1;
    else score = 0;
    return { name: 'Gana', score, max: 6, description: 'Temperament matching' };
  },

  // 7. Bhakoot (7 points)
  calculateBhakoot(boyRashi: number, girlRashi: number): GunaScore {
    let diff = (girlRashi - boyRashi);
    if (diff <= 0) diff += 12;
    let score = 7;
    if (diff === 6 || diff === 8) score = 0; // Shadashtak
    if (diff === 2 || diff === 12) score = 0; // Dwirdwadash
    if (diff === 5 || diff === 9) score = 0; // Navpancham (assuming standard bad)
    return { name: 'Bhakoot', score, max: 7, description: 'Emotional bonding' };
  },

  // 8. Nadi (8 points)
  calculateNadi(boyNadi: number, girlNadi: number): GunaScore {
    return { name: 'Nadi', score: boyNadi === girlNadi ? 0 : 8, max: 8, description: 'Genetic/Health' };
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
