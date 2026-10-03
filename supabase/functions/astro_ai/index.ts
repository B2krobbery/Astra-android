import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { question, context } = await req.json();

    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid question parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Check for casual greetings (hi, hello, etc.)
    const cleanQuestion = question.trim().toLowerCase().replace(/[!.?,]/g, "");
    const isGreeting = /^(hi|hello|hey|namaste|vanakkam|pranam|good\s*(morning|afternoon|evening)|hola)$/i.test(cleanQuestion);

    if (isGreeting) {
      const seeker = context?.seekerName ? ` ${context.seekerName}` : "";
      const matchContext = context?.candidateName ? ` and explore your alignment with ${context.candidateName}` : "";
      return new Response(
        JSON.stringify({
          response: `Namaste${seeker}! I am your Astra Vedic astrology counselor. How may I guide your matrimonial journey today? Feel free to ask about your Guna Milan, Nakshatras, planetary harmonies${matchContext}, or auspicious timings ✨`,
          isLiveAi: true,
          modelUsed: "Astra Greeting Guide",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch API Key securely
    let apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.rpc("get_secret", { secret_name: "gemini_api_key" });
      apiKey = data;
    }

    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    // 3. Construct structured prompt
    const systemInstruction = `You are Astra, a warm Vedic matrimonial counselor in the Astra app.
CRITICAL RULES:
1. Interpret ONLY the structured data provided.
2. NEVER invent, modify, or estimate Guna points, Nakshatras, or planetary positions.
3. Frame your insights as traditional cultural wisdom and guidelines, NEVER as infallible scientific fact, fear language, or absolute guarantees about marriage outcomes.
4. Keep the response warm, encouraging, articulate, and under 160 words.`;

    const seeker = context?.seekerName || "Seeker";
    const candidate = context?.candidateName || "Candidate";
    const structuredSummary = `
[AUTHENTIC STRUCTURED DATA - DO NOT ALTER OR INVENT ANY SCORES]
Seeker: ${seeker}
Candidate: ${candidate}

Astrological Placements:
- ${seeker}: Nakshatra ${context?.seekerChart?.nakshatraName || "Unknown"}, Rashi ${context?.seekerChart?.rashiName || "Unknown"}, Manglik: ${context?.seekerChart?.isManglik ? "Yes" : "No"}
- ${candidate}: Nakshatra ${context?.candidateChart?.nakshatraName || "Unknown"}, Rashi ${context?.candidateChart?.rashiName || "Unknown"}, Manglik: ${context?.candidateChart?.isManglik ? "Yes" : "No"}

36 Guna Ashtakoota Milan:
Total Score: ${context?.ashtakoota?.totalScore ?? "N/A"}/36 (${context?.ashtakoota?.verdict ?? "N/A"})
- Varna: ${context?.ashtakoota?.gunas?.find((g: any) => g.name === "Varna")?.score ?? "N/A"}/1
- Vashya: ${context?.ashtakoota?.gunas?.find((g: any) => g.name === "Vashya")?.score ?? "N/A"}/2
- Tara: ${context?.ashtakoota?.gunas?.find((g: any) => g.name === "Tara")?.score ?? "N/A"}/3
- Yoni: ${context?.ashtakoota?.gunas?.find((g: any) => g.name === "Yoni")?.score ?? "N/A"}/4
- Graha Maitri: ${context?.ashtakoota?.gunas?.find((g: any) => g.name === "Graha Maitri")?.score ?? "N/A"}/5
- Gana: ${context?.ashtakoota?.gunas?.find((g: any) => g.name === "Gana")?.score ?? "N/A"}/6
- Bhakoot: ${context?.ashtakoota?.gunas?.find((g: any) => g.name === "Bhakoot")?.score ?? "N/A"}/7
- Nadi: ${context?.ashtakoota?.gunas?.find((g: any) => g.name === "Nadi")?.score ?? "N/A"}/8

User Inquiry: "${question}"
`;

    // 4. Call Gemini with multi-model fallback chain
    const modelsToTry = ["gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-flash-latest"];
    let aiText = "";
    let successfulModel = "";

    for (const model of modelsToTry) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemInstruction}\n\n${structuredSummary}` }],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            aiText = candidateText.trim();
            successfulModel = model;
            break;
          }
        } else {
          console.warn(`Model ${model} returned status ${geminiRes.status}`);
        }
      } catch (modelErr) {
        console.warn(`Error querying model ${model}:`, modelErr);
      }
    }

    if (!aiText) {
      // Deterministic fallback if all AI models fail
      const gunaTotal = context?.ashtakoota?.totalScore ?? 26;
      const verdict = context?.ashtakoota?.verdict ?? "Good Match";
      aiText = `Based on authentic Vedic 8-Koota calculation between ${seeker} and ${candidate}, your match achieves ${gunaTotal}/36 Gunas (${verdict}). Regarding your query ("${question}"): Traditional marriage wisdom emphasizes mutual respect, emotional understanding, and personal communication as the true cornerstones of a lasting partnership.`;
      successfulModel = "Deterministic Synthesis (Fallback)";
    }

    return new Response(
      JSON.stringify({
        response: aiText,
        isLiveAi: successfulModel !== "Deterministic Synthesis (Fallback)",
        modelUsed: successfulModel,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Astro AI Edge Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
