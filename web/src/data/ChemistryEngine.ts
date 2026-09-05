export interface ChemistryAnswers {
  sports?: string[];
  movies?: string[];
  shows?: string[];
  favoriteCharacters?: string[];
  music?: string[];
  hobbies?: string[];
  travelStyle?: string; // 'Backpacking', 'Luxury', 'Nature & Mountains', 'Beach & Relax', 'Spiritual/Pilgrimage'
  weekendHabits?: string; // 'Quiet Time at Home', 'Exploring Cafes & Outdoors', 'Socializing with Friends & Family', 'Sports & Fitness'
  personalityTraits?: string[]; // 'Calm & Thoughtful', 'Energetic & Spontaneous', 'Organized & Ambitious', 'Empathetic & Creative'
  whatTheyLove?: string[]; // 'Family Traditions', 'Independent Thinking', 'Pet Animals', 'Reading & Lifelong Learning'
  partnerExpectations?: string[]; // 'Emotional Maturity', 'Shared Cultural Values', 'Supportive of Career', 'Sense of Humor'
  diet?: string;
  lifestyle?: {
    alcohol?: string;
    smoking?: string;
  };
}

export interface ChemistryReport {
  overallScore: number; // 0 - 100
  sharedInterestsScore: number;
  lifestyleAlignmentScore: number;
  personalityAlignmentScore: number;
  expectationsAlignmentScore: number;
  sharedTags: string[];
  dimensionBreakdown: {
    dimension: string;
    score: number;
    explanation: string;
  }[];
  verdict: string;
  methodology: string;
}

export class ChemistryEngine {
  /**
   * Calculates Jaccard / Overlap coefficient between two string arrays (case-insensitive)
   */
  static calculateOverlap(list1?: string[], list2?: string[]): { common: string[]; score: number } {
    if (!list1?.length || !list2?.length) return { common: [], score: 50 }; // Neutral baseline

    const set1 = new Set(list1.map(s => s.trim().toLowerCase()));
    const set2 = new Set(list2.map(s => s.trim().toLowerCase()));

    const common: string[] = [];
    for (const item of set1) {
      if (set2.has(item)) {
        common.push(item);
      }
    }

    const totalUnique = new Set([...set1, ...set2]).size;
    const score = totalUnique > 0 ? Math.round((common.length / totalUnique) * 100) : 50;

    // Minimum baseline 40 to account for open-ended answers
    const calibratedScore = Math.min(100, Math.max(40, 40 + (common.length * 20)));
    return { common, score: calibratedScore };
  }

  /**
   * Evaluates lifestyle compatibility (diet, alcohol, smoking habits)
   */
  static evaluateLifestyle(user: ChemistryAnswers, candidate: ChemistryAnswers): { score: number; tags: string[] } {
    let score = 80;
    const tags: string[] = [];

    // Diet comparison
    const uDiet = (user.diet || '').toLowerCase();
    const cDiet = (candidate.diet || '').toLowerCase();

    if (uDiet && cDiet) {
      if (uDiet === cDiet) {
        score += 15;
        tags.push(`Shared ${user.diet} Diet`);
      } else if (
        (uDiet.includes('veg') && cDiet.includes('non-veg')) ||
        (uDiet.includes('non-veg') && cDiet.includes('veg'))
      ) {
        score -= 10;
      }
    }

    // Weekend style comparison
    if (user.weekendHabits && candidate.weekendHabits) {
      if (user.weekendHabits.toLowerCase() === candidate.weekendHabits.toLowerCase()) {
        score += 10;
        tags.push(`Both prefer: ${user.weekendHabits}`);
      }
    }

    // Travel style comparison
    if (user.travelStyle && candidate.travelStyle) {
      if (user.travelStyle.toLowerCase() === candidate.travelStyle.toLowerCase()) {
        score += 10;
        tags.push(`Similar Travel Style: ${user.travelStyle}`);
      }
    }

    return {
      score: Math.min(100, Math.max(30, score)),
      tags
    };
  }

  /**
   * Computes complete, authentic chemistry report from real candidate answers
   */
  static computeChemistry(user: ChemistryAnswers, candidate: ChemistryAnswers): ChemistryReport {
    // 1. Shared Interests: sports, movies, music, hobbies
    const sportsOverlap = this.calculateOverlap(user.sports, candidate.sports);
    const moviesOverlap = this.calculateOverlap(user.movies, candidate.movies);
    const musicOverlap = this.calculateOverlap(user.music, candidate.music);
    const hobbiesOverlap = this.calculateOverlap(user.hobbies, candidate.hobbies);

    const sharedInterestsScore = Math.round(
      (sportsOverlap.score + moviesOverlap.score + musicOverlap.score + hobbiesOverlap.score) / 4
    );

    // 2. Lifestyle Alignment
    const lifestyle = this.evaluateLifestyle(user, candidate);
    const lifestyleAlignmentScore = lifestyle.score;

    // 3. Personality Traits Overlap
    const personalityOverlap = this.calculateOverlap(user.personalityTraits, candidate.personalityTraits);
    const personalityAlignmentScore = personalityOverlap.score;

    // 4. Partner Expectations & Core Values Alignment
    const expectationsOverlap = this.calculateOverlap(user.partnerExpectations, candidate.partnerExpectations);
    const whatTheyLoveOverlap = this.calculateOverlap(user.whatTheyLove, candidate.whatTheyLove);

    const expectationsAlignmentScore = Math.round(
      (expectationsOverlap.score * 0.6) + (whatTheyLoveOverlap.score * 0.4)
    );

    // Overall Weighted Score
    // Shared Interests (25%) + Lifestyle (30%) + Personality (25%) + Expectations (20%)
    const overallScore = Math.round(
      (sharedInterestsScore * 0.25) +
      (lifestyleAlignmentScore * 0.30) +
      (personalityAlignmentScore * 0.25) +
      (expectationsAlignmentScore * 0.20)
    );

    const sharedTags: string[] = [
      ...sportsOverlap.common.map(s => `Both love ${s}`),
      ...moviesOverlap.common.map(m => `Shared favorite: ${m}`),
      ...musicOverlap.common.map(m => `Both listen to ${m}`),
      ...hobbiesOverlap.common.map(h => `Both enjoy ${h}`),
      ...lifestyle.tags,
      ...personalityOverlap.common.map(p => `Shared trait: ${p}`),
      ...expectationsOverlap.common.map(e => `Mutual priority: ${e}`)
    ];

    let verdict = 'Balanced everyday compatibility with complementary perspectives';
    if (overallScore >= 85) verdict = 'Extraordinary natural affinity across interests, values, and lifestyle';
    else if (overallScore >= 75) verdict = 'Strong mutual resonance with substantial common ground';
    else if (overallScore >= 60) verdict = 'Compatible foundation with opportunities for shared discovery';

    return {
      overallScore,
      sharedInterestsScore,
      lifestyleAlignmentScore,
      personalityAlignmentScore,
      expectationsAlignmentScore,
      sharedTags: sharedTags.slice(0, 8),
      dimensionBreakdown: [
        {
          dimension: 'Shared Interests',
          score: sharedInterestsScore,
          explanation: `${sharedInterestsScore}% alignment in sports, entertainment, and leisure pursuits`
        },
        {
          dimension: 'Lifestyle & Habits',
          score: lifestyleAlignmentScore,
          explanation: `${lifestyleAlignmentScore}% alignment in dietary habits, weekend pacing, and travel preferences`
        },
        {
          dimension: 'Personality Resonance',
          score: personalityAlignmentScore,
          explanation: `${personalityAlignmentScore}% alignment in temperament, social energy, and worldview`
        },
        {
          dimension: 'Relationship Expectations',
          score: expectationsAlignmentScore,
          explanation: `${expectationsAlignmentScore}% alignment in long-term matrimonial priorities and family values`
        }
      ],
      verdict,
      methodology: 'Multi-Dimensional Categorical Overlap & Value Matrix Analysis'
    };
  }
}
