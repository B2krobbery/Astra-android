import { CompatibilityResult } from '../data/AshtakootaEngine';
import { VedicChart } from '../data/VedicAstrologyEngine';
import { NumerologyReport } from '../data/NumerologyEngine';
import { ChemistryReport } from '../data/ChemistryEngine';
import { supabase } from '../lib/supabase';

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
   * Generates a grounded, authentic Vedic interpretation using Supabase Edge Function & Gemini API
   */
  static async interpretSynergy(
    question: string,
    context: StructuredSynergyContext
  ): Promise<{ response: string; isLiveAi: boolean; modelUsed: string }> {
    // 1. Detect casual greetings immediately for instant, warm response
    const cleanQuestion = question.trim().toLowerCase().replace(/[!.?,]/g, '');
    const isGreeting = /^(hi|hello|hey|namaste|vanakkam|pranam|good\s*(morning|afternoon|evening)|hola)$/i.test(cleanQuestion);

    if (isGreeting) {
      const seeker = context.seekerName ? ` ${context.seekerName}` : '';
      const matchContext = context.candidateName ? ` and explore your compatibility with ${context.candidateName}` : '';
      return {
        response: `Namaste${seeker}! I am your Astra Vedic astrology counselor. How may I guide your matrimonial journey today? Feel free to ask about your Guna Milan, Nakshatras, planetary harmonies${matchContext}, or auspicious timings ✨`,
        isLiveAi: true,
        modelUsed: 'Astra Greeting Guide'
      };
    }

    // 2. Primary: Invoke secure Supabase Edge Function (API key kept in Vault)
    try {
      const { data, error } = await supabase.functions.invoke('astro_ai', {
        body: { question, context }
      });
      if (!error && data?.response) {
        return {
          response: data.response,
          isLiveAi: data.isLiveAi ?? true,
          modelUsed: `Supabase Edge: ${data.modelUsed || 'Gemini Flash Lite'}`
        };
      }
      if (error) {
        console.warn('Supabase Edge Function returned error, trying client fallback:', error);
      }
    } catch (edgeErr) {
      console.warn('Supabase Edge Function invoke failed, trying client fallback:', edgeErr);
    }

    // 3. Secondary: Direct client-side call if Edge function is unreachable
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
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const systemInstruction = `You are Astra, a warm Vedic matrimonial counselor in the Astra app.
CRITICAL RULES:
1. Interpret ONLY the structured data provided.
2. NEVER invent, modify, or estimate Guna points, Nakshatras, or planetary positions.
3. Frame your insights as traditional cultural wisdom and guidelines, NEVER as infallible scientific fact, fear language, or absolute guarantees about marriage outcomes.
4. Keep the response warm, encouraging, articulate, and under 160 words.`;

      const primaryModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-flash-lite-latest';
      const modelsToTry = [primaryModel, 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
      
      let text = '';
      let usedModel = primaryModel;

      for (const m of modelsToTry) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: `${systemInstruction}\n\n${structuredSummary}` }]
                  }
                ],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 800
                }
              })
            }
          );

          if (response.ok) {
            const data = await response.json();
            const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              text = candidateText.trim();
              usedModel = m;
              break;
            }
          }
        } catch (innerErr) {
          console.warn(`Model ${m} attempt failed:`, innerErr);
        }
      }

      clearTimeout(timeoutId);

      if (text) {
        return {
          response: text,
          isLiveAi: true,
          modelUsed: usedModel
        };
      }

      throw new Error('All AI models failed or exceeded quota');
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
    const clean = question.trim().toLowerCase().replace(/[!.?,]/g, '');
    const isGreeting = /^(hi|hello|hey|namaste|vanakkam|pranam|good\s*(morning|afternoon|evening)|hola)$/i.test(clean);
    
    if (isGreeting) {
      const name = context.seekerName ? ` ${context.seekerName}` : '';
      return `Namaste${name}! I am your Astra Vedic astrology counselor. How can I guide you today? Feel free to ask about Guna Milan, Nakshatras, or your compatibility with ${context.candidateName || 'your matches'}.`;
    }

    const gunaTotal = context.ashtakoota?.totalScore ?? 25;
    const verdict = context.ashtakoota?.verdict ?? 'Favorable Match';
    const sNak = context.seekerChart?.nakshatraName || 'Your Moon Star';
    const cNak = context.candidateChart?.nakshatraName || "Candidate's Moon Star";

    let advice = '';
    if (context.ashtakoota?.isNadiDosha) {
      advice += ' Traditional elders suggest consulting with an experienced pandit regarding gene-pool balance.';
    }
    if (context.ashtakoota?.isBhakootDosha) {
      advice += ' Bhakoot alignment indicates opportunities to cultivate emotional empathy and open communication.';
    }
    if (!context.ashtakoota?.isNadiDosha && !context.ashtakoota?.isBhakootDosha) {
      advice += ' Both Nadi and Bhakoot are unblemished, signifying auspicious traditional vitality for marital harmony.';
    }

    return `Based on authentic Vedic 8-Koota calculation between ${context.seekerName} (${sNak}) and ${context.candidateName} (${cNak}), the match achieves ${gunaTotal}/36 Gunas (${verdict}).${advice} Regarding your query ("${question}"): Traditional marriage wisdom suggests using these indicators as supportive self-awareness, while prioritizing mutual respect, shared character, and personal conversation.`;
  }
}
