import { VedicPrimitives } from './VedicAstrologyEngine';
import { CompatibilityResult } from './AshtakootaEngine';

export interface CoreChemistry {
  emotionalScore: number;
  intellectualScore: number;
  physicalScore: number;
  spiritualScore: number;
  overallScore: number;
}

export const ChemistryEngine = {
  calculateChemistry(gunaResult: CompatibilityResult, numerologyScore: number): CoreChemistry {
    const varnaScore = gunaResult.gunas.find(g => g.name === 'Varna')?.score || 0;
    const vashyaScore = gunaResult.gunas.find(g => g.name === 'Vashya')?.score || 0;
    const yoniScore = gunaResult.gunas.find(g => g.name === 'Yoni')?.score || 0;
    const grahaScore = gunaResult.gunas.find(g => g.name === 'Graha Maitri')?.score || 0;
    const ganaScore = gunaResult.gunas.find(g => g.name === 'Gana')?.score || 0;
    const bhakootScore = gunaResult.gunas.find(g => g.name === 'Bhakoot')?.score || 0;
    const nadiScore = gunaResult.gunas.find(g => g.name === 'Nadi')?.score || 0;

    const emotional = ((bhakootScore + nadiScore) / 15) * 100;
    const physical = ((vashyaScore + yoniScore) / 6) * 100;
    const intellectual = (grahaScore / 5) * 100;
    const spiritual = ((varnaScore + ganaScore) / 7) * 100;

    const finalIntellectual = Math.round((intellectual * 0.7) + (numerologyScore * 0.3));
    const finalSpiritual = Math.round((spiritual * 0.7) + (numerologyScore * 0.3));

    return {
      emotionalScore: Math.round(emotional),
      intellectualScore: finalIntellectual,
      physicalScore: Math.round(physical),
      spiritualScore: finalSpiritual,
      overallScore: Math.round((emotional + finalIntellectual + physical + finalSpiritual) / 4)
    };
  }
};
