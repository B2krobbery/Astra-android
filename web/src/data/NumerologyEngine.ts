export interface NumerologyResult {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  compatibilityScore: number;
  description: string;
}

export const NumerologyEngine = {
  calculateSingleDigit(num: number): number {
    if (num === 11 || num === 22 || num === 33) return num; // Master numbers
    let current = num;
    while (current > 9) {
      current = current.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return current;
  },

  calculateLifePath(dateStr: string): number {
    if (!dateStr) return 0;
    const [year, month, day] = dateStr.split('-').map(s => this.calculateSingleDigit(parseInt(s, 10)));
    return this.calculateSingleDigit(year + month + day);
  },

  getLetterValue(letter: string): number {
    const pythagoreanMap: Record<string, number> = {
      A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8, I:9,
      J:1, K:2, L:3, M:4, N:5, O:6, P:7, Q:8, R:9,
      S:1, T:2, U:3, V:4, W:5, X:6, Y:7, Z:8
    };
    return pythagoreanMap[letter.toUpperCase()] || 0;
  },

  calculateNameNumbers(name: string) {
    if (!name) return { destiny: 0, soulUrge: 0, personality: 0 };
    const cleanName = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    
    let total = 0;
    let vowelTotal = 0;
    let consonantTotal = 0;

    for (const char of cleanName) {
      const val = this.getLetterValue(char);
      total += val;
      if (vowels.includes(char)) vowelTotal += val;
      else consonantTotal += val;
    }

    return {
      destiny: this.calculateSingleDigit(total),
      soulUrge: this.calculateSingleDigit(vowelTotal),
      personality: this.calculateSingleDigit(consonantTotal)
    };
  },

  calculateCompatibility(userLifePath: number, candidateLifePath: number): number {
    if (!userLifePath || !candidateLifePath) return 0;
    // 1-9 compatibility matrix (simplified for score generation 0-100)
    // Same numbers usually get along, 1 matches well with 3,5,7, etc.
    const scoreMap: Record<number, Record<number, number>> = {
      1: {1:60, 2:40, 3:90, 4:30, 5:90, 6:40, 7:90, 8:40, 9:50},
      2: {1:40, 2:80, 3:60, 4:90, 5:40, 6:90, 7:40, 8:90, 9:60},
      3: {1:90, 2:60, 3:80, 4:40, 5:90, 6:60, 7:60, 8:40, 9:90},
      4: {1:30, 2:90, 3:40, 4:80, 5:30, 6:80, 7:90, 8:90, 9:40},
      5: {1:90, 2:40, 3:90, 4:30, 5:80, 6:40, 7:90, 8:40, 9:60},
      6: {1:40, 2:90, 3:60, 4:80, 5:40, 6:80, 7:40, 8:90, 9:90},
      7: {1:90, 2:40, 3:60, 4:90, 5:90, 6:40, 7:80, 8:40, 9:60},
      8: {1:40, 2:90, 3:40, 4:90, 5:40, 6:90, 7:40, 8:80, 9:60},
      9: {1:50, 2:60, 3:90, 4:40, 5:60, 6:90, 7:60, 8:60, 9:80},
    };
    return scoreMap[userLifePath]?.[candidateLifePath] || 50;
  }
};
