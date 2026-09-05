import { Candidate, UserProfile, AstrologyCompatibility } from '../types';
import { VedicAstrologyEngine, VedicChart, VEDIC_NAKSHATRAS, VEDIC_RASHIS } from './VedicAstrologyEngine';
import { AshtakootaEngine, CompatibilityResult } from './AshtakootaEngine';
import { NumerologyEngine } from './NumerologyEngine';
import { ChemistryEngine } from './ChemistryEngine';
import { AstroAiService } from '../services/AstroAiService';

export const MAJOR_CITIES_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'delhi': { lat: 28.6139, lon: 77.2090 },
  'new delhi': { lat: 28.6139, lon: 77.2090 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'bengaluru': { lat: 12.9716, lon: 77.5946 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'hyderabad': { lat: 17.3850, lon: 78.4867 },
  'pune': { lat: 18.5204, lon: 73.8567 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'jaipur': { lat: 26.9124, lon: 75.7873 },
  'lucknow': { lat: 26.8467, lon: 80.9462 },
  'kochi': { lat: 9.9312, lon: 76.2673 },
  'cochin': { lat: 9.9312, lon: 76.2673 },
  'thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },
  'chandigarh': { lat: 30.7333, lon: 76.7794 },
  'indore': { lat: 22.7196, lon: 75.8577 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'patna': { lat: 25.5941, lon: 85.1376 },
  'nagpur': { lat: 21.1458, lon: 79.0882 },
  'varanasi': { lat: 25.3176, lon: 82.9739 },
  'surat': { lat: 21.1702, lon: 72.8311 }
};

export class AstrologyEngine {
  static getCoordinatesForCity(cityStr?: string): { lat: number; lon: number } {
    if (!cityStr) return { lat: 20.5937, lon: 78.9629 }; // Central India
    const clean = cityStr.trim().toLowerCase();
    for (const [name, coords] of Object.entries(MAJOR_CITIES_COORDINATES)) {
      if (clean.includes(name)) return coords;
    }
    return { lat: 20.5937, lon: 78.9629 };
  }

  static calculateChart(dob: string, time: string, city: string): VedicChart {
    const coords = this.getCoordinatesForCity(city);
    return VedicAstrologyEngine.calculateChart({
      dateOfBirth: dob || '1995-01-01',
      timeOfBirth: time || '12:00',
      latitude: coords.lat,
      longitude: coords.lon,
      timezoneOffsetMinutes: 330 // IST
    });
  }

  static calculateNakshatra(dob: string, time: string, city: string): string {
    const chart = this.calculateChart(dob, time, city);
    return chart.nakshatraName;
  }

  static calculateRashi(dob: string, time: string, city: string): string {
    const chart = this.calculateChart(dob, time, city);
    return chart.rashiName;
  }

  static calculateNadi(nakshatra: string): string {
    if (!nakshatra) return 'Unknown';
    const idx = VEDIC_NAKSHATRAS.indexOf(nakshatra);
    if (idx === -1) return 'Unknown';

    const nadiPattern = [1, 2, 3, 3, 2, 1, 1, 2, 3];
    const n = nadiPattern[idx % 9];
    if (n === 1) return 'Aadi (First)';
    if (n === 2) return 'Madhya (Middle)';
    return 'Antya (Last)';
  }

  static calculateManglikDosha(dob: string, time: string, city: string): string {
    const chart = this.calculateChart(dob, time, city);
    return chart.isManglik ? 'Yes' : 'No';
  }

  static calculateCompatibility(user: UserProfile, candidate: Candidate): AstrologyCompatibility {
    // 1. Resolve Seeker Chart
    let seekerNakIdx = VEDIC_NAKSHATRAS.indexOf(user.nakshatra || 'Ashwini') + 1;
    let seekerRashiIdx = VEDIC_RASHIS.findIndex(r => r.startsWith(user.rashi?.split(' ')[0] || 'Mesha')) + 1;
    if (seekerNakIdx <= 0) seekerNakIdx = 1;
    if (seekerRashiIdx <= 0) seekerRashiIdx = 1;

    let seekerChart: VedicChart | undefined;
    if (user.dateOfBirth && user.birthTime) {
      seekerChart = this.calculateChart(user.dateOfBirth, user.birthTime, user.birthLocation || user.location || '');
      seekerNakIdx = seekerChart.nakshatraIndex;
      seekerRashiIdx = seekerChart.rashiIndex;
    }

    // 2. Resolve Candidate Chart
    let candNakIdx = VEDIC_NAKSHATRAS.indexOf(candidate.nakshatra || 'Ashwini') + 1;
    let candRashiIdx = VEDIC_RASHIS.findIndex(r => r.startsWith(candidate.rashi?.split(' ')[0] || 'Mesha')) + 1;
    if (candNakIdx <= 0) candNakIdx = 1;
    if (candRashiIdx <= 0) candRashiIdx = 1;

    // 3. Authentic Ashtakoota 36 Guna Milan
    const matchResult = AshtakootaEngine.match(
      { rashiIndex: seekerRashiIdx, nakshatraIndex: seekerNakIdx, pada: seekerChart?.pada || 1 },
      { rashiIndex: candRashiIdx, nakshatraIndex: candNakIdx, pada: 1 }
    );

    // 4. Numerology Life Path & Destiny
    const numerology = NumerologyEngine.generateReport(
      candidate.name,
      '1995-05-15', // fallback if candidate DOB not directly disclosed in card
      user.dateOfBirth
    );

    // 5. Authentic Answer-Based Chemistry
    const userChemistryAnswers = (user as any).chemistryAnswers || (user as any).marriageQuestionnaire || {};
    const candChemistryAnswers = (candidate as any).chemistryAnswers || (candidate as any).marriageQuestionnaire || {};
    const chemistry = ChemistryEngine.computeChemistry(userChemistryAnswers, candChemistryAnswers);

    const overallGunaPercentage = matchResult.percentage;

    return {
      candidateName: candidate.name,
      score: overallGunaPercentage,
      level: matchResult.verdict,
      emotionalScore: chemistry.lifestyleAlignmentScore,
      nakshatraScore: Math.round((matchResult.totalScore / 36) * 100),
      rashiScore: matchResult.gunas.find(g => g.name === 'Bhakoot')?.score === 7 ? 100 : 40,
      overallHarmonyScore: Math.round((overallGunaPercentage * 0.6) + (chemistry.overallScore * 0.4)),
      reasonTitle: `Vedic Ashtakoota Milan (${matchResult.totalScore}/36 Gunas)`,
      reasonDescription: `${matchResult.verdict}. ${matchResult.recommendations.join(' ')}`,
      userNakshatra: user.nakshatra || (seekerChart?.nakshatraName ?? 'Ashwini'),
      candidateNakshatra: candidate.nakshatra || 'Unknown',
      gunaScore: `${matchResult.totalScore}/36 Gunas Matched`,
      detailedGunas: matchResult.gunas,
      intellectualScore: chemistry.sharedInterestsScore,
      physicalScore: matchResult.gunas.find(g => g.name === 'Yoni')?.score ? Math.round((matchResult.gunas.find(g => g.name === 'Yoni')!.score / 4) * 100) : 50,
      spiritualScore: matchResult.gunas.find(g => g.name === 'Varna')?.score ? 100 : 50
    };
  }

  static async getAstroAiResponse(
    question: string,
    user: UserProfile,
    compatibility?: AstrologyCompatibility
  ): Promise<string> {
    const context = {
      seekerName: user.name || 'User',
      candidateName: compatibility?.candidateName || 'Candidate',
      seekerChart: user.dateOfBirth && user.birthTime ? this.calculateChart(user.dateOfBirth, user.birthTime, user.birthLocation || '') : undefined,
      ashtakoota: compatibility?.detailedGunas ? {
        totalScore: parseFloat(compatibility.gunaScore) || 25,
        maxScore: 36,
        percentage: compatibility.score,
        gunas: compatibility.detailedGunas,
        isNadiDosha: compatibility.detailedGunas.find(g => g.name === 'Nadi')?.score === 0,
        isBhakootDosha: compatibility.detailedGunas.find(g => g.name === 'Bhakoot')?.score === 0,
        isGanaDosha: compatibility.detailedGunas.find(g => g.name === 'Gana')?.score === 0,
        verdict: compatibility.level as any,
        recommendations: [],
        methodology: 'Traditional Parashari 8-Koota Ashtakoota Milan'
      } : undefined
    };

    const result = await AstroAiService.interpretSynergy(question, context as any);
    return result.response;
  }
}
