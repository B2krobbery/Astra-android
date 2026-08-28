package com.example.data.models

data class UserProfile(
    val name: String = "Rahul",
    val age: Int = 24,
    val profession: String = "Software Engineer",
    val education: String = "IIT Bombay · B.Tech",
    val location: String = "Bengaluru",
    val bio: String = "Building the future of tech by day, exploring the stars by night. Love filter coffee, indie music, and deep conversations about the cosmos.",
    val photoUrl: String = "",
    val completionPercentage: Int = 82,
    val dateOfBirth: String = "14 July 1998",
    val birthTime: String = "08:45 AM",
    val birthCity: String = "Bengaluru, Karnataka",
    val nakshatra: String = "Shatabhisha",
    val rashi: String = "Kumbha Rashi",
    val lookingFor: List<String> = listOf("Long-term partner", "Long-term, open to short"),
    val interests: List<String> = listOf("Tech", "Star Gazing", "Filter Coffee", "Hiking", "Vinyl Records"),
    val minAgePreference: Int = 22,
    val maxAgePreference: Int = 28,
    val educationVerified: Boolean = true,
    val policeVerified: Boolean = false,
    val creditVerified: Boolean = true
)
