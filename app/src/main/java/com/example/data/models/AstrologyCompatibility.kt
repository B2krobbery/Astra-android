package com.example.data.models

data class AstrologyCompatibility(
    val candidateName: String,
    val score: Int,
    val level: String = "Highly Compatible",
    val emotionalScore: Int = 91,
    val nakshatraScore: Int = 88,
    val rashiScore: Int = 84,
    val overallHarmonyScore: Int = 87,
    val reasonTitle: String = "Why this match?",
    val reasonDescription: String = "Your profiles show strong compatibility in emotional temperament and communication. Your Nakshatra combination also scores positively under the selected compatibility system, suggesting a natural flow of energy.",
    val userNakshatra: String = "Rohini",
    val candidateNakshatra: String = "Ashwini",
    val gunaScore: String = "29/36 Gunas Matched"
)
