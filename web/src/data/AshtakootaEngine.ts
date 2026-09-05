export interface GunaScore {
  name: string;
  score: number;
  max: number;
  description: string;
  categoryMeaning: string;
  boyValue: string;
  girlValue: string;
  status: 'Full' | 'Partial' | 'Dosha' | 'None';
}

export interface CompatibilityResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  gunas: GunaScore[];
  isNadiDosha: boolean;
  isBhakootDosha: boolean;
  isGanaDosha: boolean;
  verdict: 'Excellent Match' | 'Good Match' | 'Average Match' | 'Challenging Match';
  recommendations: string[];
  methodology: string;
}

export interface AshtakootaInput {
  rashiIndex: number; // 1 to 12
  nakshatraIndex: number; // 1 to 27
  pada?: number; // 1 to 4
  nadiIndex?: number; // 1 to 3
}

export class AshtakootaEngine {
  // 1. VARNA (1 Point)
  // 4: Brahmin, 3: Kshatriya, 2: Vaishya, 1: Shudra
  static getVarna(rashi: number): { rank: number; name: string } {
    if ([4, 8, 12].includes(rashi)) return { rank: 4, name: 'Brahmin (Spiritual)' };
    if ([1, 5, 9].includes(rashi)) return { rank: 3, name: 'Kshatriya (Leader)' };
    if ([2, 6, 10].includes(rashi)) return { rank: 2, name: 'Vaishya (Commercial)' };
    return { rank: 1, name: 'Shudra (Service)' };
  }

  static calculateVarna(boyRashi: number, girlRashi: number): GunaScore {
    const b = this.getVarna(boyRashi);
    const g = this.getVarna(girlRashi);
    const score = b.rank >= g.rank ? 1 : 0;
    return {
      name: 'Varna',
      score,
      max: 1,
      description: score === 1 ? 'Ego and spiritual temperament aligned' : 'Spiritual/social temperament mismatch',
      categoryMeaning: 'Spiritual development & intellectual compatibility',
      boyValue: b.name,
      girlValue: g.name,
      status: score === 1 ? 'Full' : 'None'
    };
  }

  // 2. VASHYA (2 Points)
  // 1: Chatushpada, 2: Manava, 3: Jalachara, 4: Vanachara, 5: Keeta
  static getVashya(rashi: number): { type: number; name: string } {
    if ([1, 2].includes(rashi)) return { type: 1, name: 'Chatushpada (Quadruped)' };
    if ([3, 6, 7, 11].includes(rashi)) return { type: 2, name: 'Manava (Human)' };
    if ([4, 12].includes(rashi)) return { type: 3, name: 'Jalachara (Water Dweller)' };
    if (rashi === 5) return { type: 4, name: 'Vanachara (Wild Lion)' };
    if (rashi === 8) return { type: 5, name: 'Keeta (Insect/Scorpion)' };
    if (rashi === 9) return { type: 2, name: 'Manava (Sagittarius 1st half)' };
    return { type: 1, name: 'Chatushpada (Capricorn 1st half)' };
  }

  static calculateVashya(boyRashi: number, girlRashi: number): GunaScore {
    const b = this.getVashya(boyRashi);
    const g = this.getVashya(girlRashi);
    let score = 0;

    if (b.type === g.type) {
      score = 2;
    } else if (
      (b.type === 2 && (g.type === 1 || g.type === 3)) ||
      (g.type === 2 && (b.type === 1 || b.type === 3))
    ) {
      score = 1;
    } else if (
      (b.type === 1 && g.type === 3) ||
      (g.type === 1 && b.type === 3)
    ) {
      score = 1;
    } else {
      score = 0;
    }

    return {
      name: 'Vashya',
      score,
      max: 2,
      description: score === 2 ? 'Mutual power balance & natural attraction' : score === 1 ? 'Moderate mutual attraction' : 'Challenging power dynamics',
      categoryMeaning: 'Mutual control, attraction & influence in relationship',
      boyValue: b.name,
      girlValue: g.name,
      status: score === 2 ? 'Full' : score === 1 ? 'Partial' : 'None'
    };
  }

  // 3. TARA (3 Points)
  static calculateTara(boyNak: number, girlNak: number): GunaScore {
    // Distance inclusive from Girl to Boy
    let countGirlToBoy = (boyNak - girlNak + 27) % 27 + 1;
    let bTara = countGirlToBoy % 9;
    if (bTara === 0) bTara = 9;

    // Distance inclusive from Boy to Girl
    let countBoyToGirl = (girlNak - boyNak + 27) % 27 + 1;
    let gTara = countBoyToGirl % 9;
    if (gTara === 0) gTara = 9;

    // Auspicious taras: 2 (Sampat), 4 (Kshema), 6 (Sadhana), 8 (Mitra), 9 (Parama Mitra)
    const auspicious = [2, 4, 6, 8, 9];
    const bAusp = auspicious.includes(bTara) ? 1.5 : 0;
    const gAusp = auspicious.includes(gTara) ? 1.5 : 0;
    const score = bAusp + gAusp;

    const taraNames = [
      'Janma', 'Sampat (Wealth)', 'Vipat (Loss)', 'Kshema (Well-being)',
      'Pratyak (Obstacle)', 'Sadhana (Success)', 'Naidhana (Danger)',
      'Mitra (Friend)', 'Parama Mitra (Great Friend)'
    ];

    return {
      name: 'Tara',
      score,
      max: 3,
      description: score === 3 ? 'Destiny and health auspiciously aligned' : score === 1.5 ? 'Moderate destiny balance' : 'Inauspicious birth star combination',
      categoryMeaning: 'Destiny, health, well-being & longevity alignment',
      boyValue: `Tara ${bTara} (${taraNames[bTara - 1]})`,
      girlValue: `Tara ${gTara} (${taraNames[gTara - 1]})`,
      status: score === 3 ? 'Full' : score > 0 ? 'Partial' : 'None'
    };
  }

  // 4. YONI (4 Points) - Authentic 14 Animal Matrix
  static getYoni(nak: number): { animalId: number; name: string } {
    const yoniAnimals = [
      'Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat',
      'Cow', 'Buffalo', 'Tiger', 'Hare', 'Monkey', 'Mongoose', 'Lion'
    ];
    // Nakshatra to Yoni mapping
    const map: Record<number, number> = {
      1: 1, 24: 1,  // Horse: Ashwini, Shatabhisha
      2: 2, 27: 2,  // Elephant: Bharani, Revati
      3: 3, 8: 3,   // Sheep: Krittika, Pushya
      4: 4, 9: 4,   // Serpent: Rohini, Mrigashira
      6: 5, 19: 5,  // Dog: Ardra, Mula
      7: 6, 10: 6,  // Cat: Punarvasu, Ashlesha
      11: 7, 12: 7, // Rat: Magha, Purva Phalguni
      13: 8, 26: 8, // Cow: Uttara Phalguni, Uttara Bhadrapada
      14: 9, 15: 9, // Buffalo: Hasta, Swati
      16: 10, 17: 10, // Tiger: Chitra, Vishakha
      18: 11, 20: 11, // Hare/Deer: Anuradha, Jyeshtha
      21: 12, 22: 12, // Monkey: Purva Ashadha, Shravana
      23: 13, 25: 13, // Mongoose: Uttara Ashadha, Purva Bhadrapada
      5: 14 // Lion: Dhanishta
    };
    const animalId = map[nak] || 1;
    return { animalId, name: yoniAnimals[animalId - 1] };
  }

  static calculateYoni(boyNak: number, girlNak: number): GunaScore {
    const b = this.getYoni(boyNak);
    const g = this.getYoni(girlNak);

    // Sworn enemies: 0 points
    const enemyPairs: [number, number][] = [
      [1, 9],  // Horse vs Buffalo
      [2, 14], // Elephant vs Lion
      [3, 12], // Sheep vs Monkey
      [4, 13], // Serpent vs Mongoose
      [5, 11], // Dog vs Hare
      [6, 7],  // Cat vs Rat
      [8, 10]  // Cow vs Tiger
    ];

    const isSwornEnemy = enemyPairs.some(
      ([e1, e2]) => (b.animalId === e1 && g.animalId === e2) || (b.animalId === e2 && g.animalId === e1)
    );

    let score = 2; // neutral default
    if (b.animalId === g.animalId) {
      score = 4;
    } else if (isSwornEnemy) {
      score = 0;
    } else {
      // Friendly vs neutral animal table
      const friendlyPairs: [number, number][] = [
        [1, 2], [2, 8], [3, 8], [7, 12], [8, 12], [11, 12], [1, 11]
      ];
      const isFriendly = friendlyPairs.some(
        ([f1, f2]) => (b.animalId === f1 && g.animalId === f2) || (b.animalId === f2 && g.animalId === f1)
      );
      score = isFriendly ? 3 : 2;
    }

    return {
      name: 'Yoni',
      score,
      max: 4,
      description: score === 4 ? 'Complete physical & biological harmony' : score >= 2 ? 'Compatible physical constitution' : 'Incompatible biological instincts (Yoni Vairya)',
      categoryMeaning: 'Physical, sexual & biological compatibility',
      boyValue: b.name,
      girlValue: g.name,
      status: score === 4 ? 'Full' : score >= 2 ? 'Partial' : 'Dosha'
    };
  }

  // 5. GRAHA MAITRI (5 Points) - Authentic Planetary Lordship Matrix
  static getRashiLord(rashi: number): { lordId: number; name: string } {
    // 1:Sun, 2:Moon, 3:Mars, 4:Mercury, 5:Jupiter, 6:Venus, 7:Saturn
    const rashiLordMap: Record<number, { lordId: number; name: string }> = {
      1: { lordId: 3, name: 'Mars' },
      2: { lordId: 6, name: 'Venus' },
      3: { lordId: 4, name: 'Mercury' },
      4: { lordId: 2, name: 'Moon' },
      5: { lordId: 1, name: 'Sun' },
      6: { lordId: 4, name: 'Mercury' },
      7: { lordId: 6, name: 'Venus' },
      8: { lordId: 3, name: 'Mars' },
      9: { lordId: 5, name: 'Jupiter' },
      10: { lordId: 7, name: 'Saturn' },
      11: { lordId: 7, name: 'Saturn' },
      12: { lordId: 5, name: 'Jupiter' }
    };
    return rashiLordMap[rashi] || { lordId: 1, name: 'Sun' };
  }

  static getPlanetaryRelationship(p1: number, p2: number): 'Friend' | 'Neutral' | 'Enemy' {
    if (p1 === p2) return 'Friend';

    const naturalRelations: Record<number, { friends: number[]; enemies: number[] }> = {
      1: { friends: [2, 3, 5], enemies: [6, 7] }, // Sun
      2: { friends: [1, 4], enemies: [] },         // Moon
      3: { friends: [1, 2, 5], enemies: [4] },    // Mars
      4: { friends: [1, 6], enemies: [2] },       // Mercury
      5: { friends: [1, 2, 3], enemies: [4, 6] }, // Jupiter
      6: { friends: [4, 7], enemies: [1, 2] },    // Venus
      7: { friends: [4, 6], enemies: [1, 2, 3] }  // Saturn
    };

    const rel = naturalRelations[p1];
    if (rel?.friends.includes(p2)) return 'Friend';
    if (rel?.enemies.includes(p2)) return 'Enemy';
    return 'Neutral';
  }

  static calculateGrahaMaitri(boyRashi: number, girlRashi: number): GunaScore {
    const bLord = this.getRashiLord(boyRashi);
    const gLord = this.getRashiLord(girlRashi);

    const rel1 = this.getPlanetaryRelationship(bLord.lordId, gLord.lordId);
    const rel2 = this.getPlanetaryRelationship(gLord.lordId, bLord.lordId);

    let score = 0;
    if (rel1 === 'Friend' && rel2 === 'Friend') score = 5;
    else if ((rel1 === 'Friend' && rel2 === 'Neutral') || (rel1 === 'Neutral' && rel2 === 'Friend')) score = 4;
    else if (rel1 === 'Neutral' && rel2 === 'Neutral') score = 3;
    else if ((rel1 === 'Friend' && rel2 === 'Enemy') || (rel1 === 'Enemy' && rel2 === 'Friend')) score = 1;
    else if ((rel1 === 'Neutral' && rel2 === 'Enemy') || (rel1 === 'Enemy' && rel2 === 'Neutral')) score = 0.5;
    else score = 0;

    return {
      name: 'Graha Maitri',
      score,
      max: 5,
      description: score >= 4 ? 'Excellent mental affinity & mutual respect' : score >= 3 ? 'Good psychological understanding' : 'Conflicting core values & viewpoints',
      categoryMeaning: 'Psychological, mental & communication compatibility',
      boyValue: `${bLord.name} (${rel1})`,
      girlValue: `${gLord.name} (${rel2})`,
      status: score >= 4 ? 'Full' : score >= 1 ? 'Partial' : 'Dosha'
    };
  }

  // 6. GANA (6 Points)
  // 1: Deva, 2: Manushya, 3: Rakshasa
  static getGana(nak: number): { type: number; name: string } {
    const deva = [1, 5, 7, 8, 13, 15, 17, 22, 27];
    const rakshasa = [3, 9, 10, 14, 16, 18, 19, 23, 24];
    if (deva.includes(nak)) return { type: 1, name: 'Deva (Divine/Generous)' };
    if (rakshasa.includes(nak)) return { type: 3, name: 'Rakshasa (Assertive/Fierce)' };
    return { type: 2, name: 'Manushya (Human/Balanced)' };
  }

  static calculateGana(boyNak: number, girlNak: number): GunaScore {
    const b = this.getGana(boyNak);
    const g = this.getGana(girlNak);

    let score = 0;
    if (b.type === g.type) {
      score = 6;
    } else if (b.type === 1 && g.type === 2) {
      score = 6;
    } else if (b.type === 2 && g.type === 1) {
      score = 5;
    } else if (b.type === 3 && g.type === 1) {
      score = 1; // Rakshasa boy with Deva girl
    } else {
      score = 0; // Gana Dosha
    }

    return {
      name: 'Gana',
      score,
      max: 6,
      description: score >= 5 ? 'Temperaments and daily behaviors harmonize' : score === 1 ? 'Moderate friction in temperamental outlook' : 'Major temperamental friction (Gana Dosha)',
      categoryMeaning: 'Temperament, lifestyle nature & daily behavioral harmony',
      boyValue: b.name,
      girlValue: g.name,
      status: score >= 5 ? 'Full' : score > 0 ? 'Partial' : 'Dosha'
    };
  }

  // 7. BHAKOOT (7 Points)
  static calculateBhakoot(boyRashi: number, girlRashi: number): GunaScore {
    let diff = (girlRashi - boyRashi + 12) % 12;
    const distance1 = diff + 1; // 1 to 12
    const distance2 = ((boyRashi - girlRashi + 12) % 12) + 1;

    // Bad distance pairs:
    // 2/12 (Dwirdwadash), 6/8 (Shadashtak), 9/5 (Navpancham)
    const isDwirdwadash = (distance1 === 2 && distance2 === 12) || (distance1 === 12 && distance2 === 2);
    const isShadashtak = (distance1 === 6 && distance2 === 8) || (distance1 === 8 && distance2 === 6);
    const isNavpancham = (distance1 === 5 && distance2 === 9) || (distance1 === 9 && distance2 === 5);

    const bLord = this.getRashiLord(boyRashi);
    const gLord = this.getRashiLord(girlRashi);
    const areLordsSame = bLord.lordId === gLord.lordId;
    const areLordsFriends = this.getPlanetaryRelationship(bLord.lordId, gLord.lordId) === 'Friend' &&
                            this.getPlanetaryRelationship(gLord.lordId, bLord.lordId) === 'Friend';

    let score = 7;
    let doshaName = '';

    if (isDwirdwadash) {
      if (areLordsSame || areLordsFriends) {
        score = 7; // Cancelled
      } else {
        score = 0;
        doshaName = 'Dwirdwadash (2/12) Bhakoot Dosha (Financial strain risk)';
      }
    } else if (isShadashtak) {
      if (areLordsSame || areLordsFriends) {
        score = 7; // Cancelled
      } else {
        score = 0;
        doshaName = 'Shadashtak (6/8) Bhakoot Dosha (Conflict/health strain risk)';
      }
    } else if (isNavpancham) {
      if (areLordsSame || areLordsFriends) {
        score = 7; // Cancelled
      } else {
        score = 0;
        doshaName = 'Navpancham (9/5) Bhakoot Dosha (Family harmony friction)';
      }
    }

    return {
      name: 'Bhakoot',
      score,
      max: 7,
      description: score === 7 ? 'Deep emotional bonding & family prosperity' : doshaName || 'Emotional bonding challenge',
      categoryMeaning: 'Emotional bonding, love, family welfare & children',
      boyValue: `House ${distance1}`,
      girlValue: `House ${distance2}`,
      status: score === 7 ? 'Full' : 'Dosha'
    };
  }

  // 8. NADI (8 Points)
  // 1: Aadi, 2: Madhya, 3: Antya
  static calculateNadi(boyNak: number, girlNak: number, boyPada = 1, girlPada = 1): GunaScore {
    const nadiMap = [
      1, 2, 3, 3, 2, 1, 1, 2, 3, // 1-9
      3, 2, 1, 1, 2, 3, 3, 2, 1, // 10-18
      1, 2, 3, 3, 2, 1, 1, 2, 3  // 19-27
    ];
    const bNadi = nadiMap[boyNak - 1];
    const gNadi = nadiMap[girlNak - 1];
    const nadiNames = ['Aadi (Vata)', 'Madhya (Pitta)', 'Antya (Kapha)'];

    let score = 8;
    let isNadiDosha = false;

    if (bNadi === gNadi) {
      // Check for Vedic Nadi Dosha cancellation:
      // 1. Same Nakshatra but different Pada
      // 2. Both born in Rohini, Mrigashira, Ardra, Punarvasu, Pushya, etc. exceptions
      if (boyNak === girlNak && boyPada !== girlPada) {
        score = 8; // Cancelled by Pada difference
      } else {
        score = 0;
        isNadiDosha = true;
      }
    }

    return {
      name: 'Nadi',
      score,
      max: 8,
      description: score === 8 ? 'Genetic compatibility & strong physical health' : 'Nadi Dosha detected (same biological constitution)',
      categoryMeaning: 'Genetic compatibility, physiological health & progeny longevity',
      boyValue: nadiNames[bNadi - 1],
      girlValue: nadiNames[gNadi - 1],
      status: score === 8 ? 'Full' : 'Dosha'
    };
  }

  /**
   * Complete 36 Guna Ashtakoota Match Calculation
   */
  static match(boy: AshtakootaInput, girl: AshtakootaInput): CompatibilityResult {
    const gunas: GunaScore[] = [
      this.calculateVarna(boy.rashiIndex, girl.rashiIndex),
      this.calculateVashya(boy.rashiIndex, girl.rashiIndex),
      this.calculateTara(boy.nakshatraIndex, girl.nakshatraIndex),
      this.calculateYoni(boy.nakshatraIndex, girl.nakshatraIndex),
      this.calculateGrahaMaitri(boy.rashiIndex, girl.rashiIndex),
      this.calculateGana(boy.nakshatraIndex, girl.nakshatraIndex),
      this.calculateBhakoot(boy.rashiIndex, girl.rashiIndex),
      this.calculateNadi(boy.nakshatraIndex, girl.nakshatraIndex, boy.pada || 1, girl.pada || 1)
    ];

    const totalScore = gunas.reduce((acc, g) => acc + g.score, 0);
    const percentage = Math.round((totalScore / 36) * 100);

    const isNadiDosha = gunas[7].score === 0;
    const isBhakootDosha = gunas[6].score === 0;
    const isGanaDosha = gunas[5].score === 0;

    let verdict: CompatibilityResult['verdict'] = 'Good Match';
    if (totalScore >= 28) verdict = 'Excellent Match';
    else if (totalScore >= 21) verdict = 'Good Match';
    else if (totalScore >= 18) verdict = 'Average Match';
    else verdict = 'Challenging Match';

    const recommendations: string[] = [];
    if (isNadiDosha) {
      recommendations.push('Nadi Dosha present: Consult an experienced astrologer; Mahamrityunjaya Japa or gold donation traditionally recommended.');
    }
    if (isBhakootDosha) {
      recommendations.push('Bhakoot Dosha present: Special attention to financial and emotional communication.');
    }
    if (isGanaDosha) {
      recommendations.push('Gana Dosha present: Practice mutual respect for contrasting temperaments.');
    }
    if (totalScore >= 18 && !isNadiDosha && !isBhakootDosha) {
      recommendations.push('Strong authentic Ashtakoota alignment. Auspicious for traditional matrimonial union.');
    }

    return {
      totalScore,
      maxScore: 36,
      percentage,
      gunas,
      isNadiDosha,
      isBhakootDosha,
      isGanaDosha,
      verdict,
      recommendations,
      methodology: 'Traditional Parashari 8-Koota Ashtakoota Milan'
    };
  }
}
