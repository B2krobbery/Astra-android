package com.example.data

import com.example.data.models.AstrologyCompatibility
import com.example.data.models.Candidate
import com.example.data.models.UserProfile

/**
 * Astrology calculation layer.
 * Structured so that a real Vedic astrology engine (e.g. Swiss Ephemeris or Gemini Vedic API)
 * can be plugged in seamlessly.
 */
object AstrologyEngine {

    private val nakshatras = listOf(
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
        "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    )

    private val rashis = listOf(
        "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
        "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
        "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
    )

    fun calculateNakshatra(dob: String, time: String, city: String): String {
        // Deterministic hash based on inputs for realistic demonstration
        val seed = (dob.hashCode() + time.hashCode() + city.hashCode()).let { if (it < 0) -it else it }
        val index = seed % nakshatras.size
        return nakshatras[index]
    }

    fun calculateRashi(dob: String, time: String, city: String): String {
        val seed = (dob.hashCode() * 31 + time.hashCode() + city.hashCode()).let { if (it < 0) -it else it }
        val index = seed % rashis.size
        return rashis[index]
    }

    fun calculateCompatibility(user: UserProfile, candidate: Candidate): AstrologyCompatibility {
        val baseScore = candidate.compatibilityScore
        val emotional = candidate.emotionalScore
        val nakshatra = candidate.nakshatraScore
        val rashi = candidate.rashiScore
        val overall = candidate.overallScore

        val level = when {
            overall >= 85 -> "Highly Compatible"
            overall >= 75 -> "Very Compatible"
            else -> "Compatible Match"
        }

        return AstrologyCompatibility(
            candidateName = candidate.name,
            score = overall,
            level = level,
            emotionalScore = emotional,
            nakshatraScore = nakshatra,
            rashiScore = rashi,
            overallHarmonyScore = overall,
            reasonTitle = "Why this match?",
            reasonDescription = candidate.compatibilityNote,
            userNakshatra = user.nakshatra.ifEmpty { "Rohini" },
            candidateNakshatra = candidate.nakshatra,
            gunaScore = "${(overall * 36 / 100).coerceIn(24, 34)}/36 Gunas Matched"
        )
    }
}
