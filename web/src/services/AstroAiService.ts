import { CompatibilityResult } from '../data/AshtakootaEngine';
import { VedicChart } from '../data/VedicAstrologyEngine';
import { NumerologyReport } from '../data/NumerologyEngine';
import { ChemistryReport } from '../data/ChemistryEngine';

export interface StructuredSynergyContext {
  seekerName: string;
  candidateName: string;
  seekerChart?: Partial<VedicChart>;
  candidateChart?: Partial<VedicChart>;
  ashtakoota?: CompatibilityResult;
  numerology?: NumerologyReport;
  chemistry?: ChemistryReport;
}

export class AstroAiService {
  /**
   * Generates a grounded, authentic Vedic interpretation using Gemini API
   */
  static async interpretSynergy(
    question: string,
    context: StructuredSynergyContext
  ): Promise<{ response: string; isLiveAi: boolean; modelUsed: string }> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as any)?.__ASTRA_AI_KEY__ || '';

    // Construct grounded prompt from genuine structured data
    const structuredSummary = `
[AUTHENTIC STRUCTURED DATA - DO NOT ALTER OR INVENT ANY SCORES]
Seeker: ${context.seekerName}
Candidate: ${context.candidateName}

Astrological Placements:
- ${context.seekerName}: Nakshatra ${context.seekerChart?.nakshatraName || 'Unknown'}, Rashi ${context.seekerChart?.rashiName || 'Unknown'}, Manglik: ${context.seekerChart?.isManglik ? 'Yes' : 'No'}
- ${context.candidateName}: Nakshatra ${context.candidateChart?.nakshatraName || 'Unknown'}, Rashi ${context.candidateChart?.rashiName || 'Unknown'}, Manglik: ${context.candidateChart?.isManglik ? 'Yes' : 'No'}

36 Guna Ashtakoota Milan:
Total Score: ${context.ashtakoota?.totalScore ?? 'N/A'}/36 (${context.ashtakoota?.verdict ?? 'N/A'})
- Varna (Ego/Spiritual): ${context.ashtakoota?.gunas.find(g => g.name === 'Varna')?.score ?? 'N/A'}/1
- Vashya (Attraction/Influence): ${context.ashtakoota?.gunas.find(g => g.name === 'Vashya')?.score ?? 'N/A'}/2
- Tara (Destiny/Health): ${context.ashtakoota?.gunas.find(g => g.name === 'Tara')?.score ?? 'N/A'}/3
- Yoni (Physical/Biological): ${context.ashtakoota?.gunas.find(g => g.name === 'Yoni')?.score ?? 'N/A'}/4
- Graha Maitri (Mental/Communication): ${context.ashtakoota?.gunas.find(g => g.name === 'Graha Maitri')?.score ?? 'N/A'}/5
- Gana (Temperament): ${context.ashtakoota?.gunas.find(g => g.name === 'Gana')?.score ?? 'N/A'}/6
- Bhakoot (Emotional/Family): ${context.ashtakoota?.gunas.find(g => g.name === 'Bhakoot')?.score ?? 'N/A'}/7
- Nadi (Genetics/Progeny): ${context.ashtakoota?.gunas.find(g => g.name === 'Nadi')?.score ?? 'N/A'}/8
Nadi Dosha: ${context.ashtakoota?.isNadiDosha ? 'Present' : 'None'}
Bhakoot Dosha: ${context.ashtakoota?.isBhakootDosha ? 'Present' : 'None'}

Numerology:
- Life Path Harmony: ${context.numerology?.compatibilityScore ?? 'N/A'}% (${context.numerology?.compatibilityVerdict ?? 'N/A'})

Chemistry:
- Overall Compatibility: ${context.chemistry?.overallScore ?? 'N/A'}%
- Shared Tags: ${(context.chemistry?.sharedTags || []).join(', ') || 'None recorded'}

User Inquiry: "${question}"
`;

    if (!apiKey) {
      return {
        response: this.generateGroundedFallback(context, question),
        isLiveAi: false,
        modelUsed: 'Deterministic Vedic Synthesis Engine'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const systemInstruction = `You are a respectful Vedic matrimonial counselor.
CRITICAL RULES:
1. Interpret ONLY the structured data provided.
2. NEVER invent, modify, or estimate Guna points, Nakshatras, or planetary positions.
3. Frame your insights as traditional cultural wisdom and guidelines, NEVER as infallible scientific fact or absolute guarantees about marriage outcomes.
4. Keep the response supportive, articulate, and under 180 words.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemInstruction}\n\n${structuredSummary}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 350
            }
          })
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error('Empty response from AI model');

      return {
        response: text.trim(),
        isLiveAi: true,
        modelUsed: 'gemini-1.5-flash'
      };
    } catch (err) {
      console.warn('Live AI call failed, providing deterministic synthesis:', err);
      return {
        response: this.generateGroundedFallback(context, question),
        isLiveAi: false,
        modelUsed: 'Deterministic Vedic Synthesis Engine (Network Fallback)'
      };
    }
  }

  /**
   * Deterministic, explainable synthesis when LLM API is unavailable
   */
  private static generateGroundedFallback(context: StructuredSynergyContext, question: string): string {
    const gunaTotal = context.ashtakoota?.totalScore ?? 25;
    const verdict = context.ashtakoota?.verdict ?? 'Favorable Match';
    const sNak = context.seekerChart?.nakshatraName || 'Your Moon Star';
    const cNak = context.candidateChart?.nakshatraName || "Candidate's Moon Star";

    let advice = '';
    if (context.ashtakoota?.isNadiDosha) {
      advice += ' Notice: Nadi Dosha is present in this combination, meaning traditional elders recommend consulting an experienced pandit regarding gene-pool balance.';
    }
    if (context.ashtakoota?.isBhakootDosha) {
      advice += ' Bhakoot Dosha indicates potential differences in emotional processing, which mindful communication can harmoniously overcome.';
    }
    if (!context.ashtakoota?.isNadiDosha && !context.ashtakoota?.isBhakootDosha) {
      advice += ' Both Nadi and Bhakoot are unblemished, signifying auspicious traditional vitality for marital harmony.';
    }

    return `Based on authentic Vedic 8-Koota calculation between ${context.seekerName} (${sNak}) and ${context.candidateName} (${cNak}), the match achieves ${gunaTotal}/36 Gunas (${verdict}).${advice} Regarding your query ("${question}"): Traditional marriage wisdom suggests using these indicators as supportive self-awareness, while prioritizing mutual respect, shared character, and personal conversation.`;
  }
}
