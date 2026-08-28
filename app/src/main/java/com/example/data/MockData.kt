package com.example.data

import com.example.data.models.Candidate
import com.example.data.models.ChatMessage
import com.example.data.models.MatchConversation
import com.example.data.models.VerificationDetail
import com.example.data.models.VerificationType

object MockData {

    val candidates = listOf(
        Candidate(
            id = "ananya_1",
            name = "Ananya",
            age = 24,
            profession = "Architect",
            location = "Bengaluru",
            education = "IIT Roorkee · B.Arch",
            bio = "Designer of spaces by day, collector of stories by night. Usually found in a quiet corner of a cafe in Indiranagar or exploring the ruins of Hampi. Believer in warm filter coffee, slow mornings, and deep alignment of stars.",
            photoUrls = listOf(
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop"
            ),
            avatarGradientStart = 0xFF722F37,
            avatarGradientEnd = 0xFFD4A373,
            isVerified = true,
            educationVerified = true,
            policeVerified = true,
            creditVerified = true,
            educationDetails = "IIT Roorkee · Bachelor of Architecture (Honors)",
            policeDetails = "Digital Verification Authority · Complete background check clear",
            creditDetails = "Experian Verified · Score 785 · Prime credit profile",
            interests = listOf("Modern Architecture", "Photography", "Jazz", "Trekking", "Vedic Astrology", "Filter Coffee"),
            nakshatra = "Rohini",
            rashi = "Vrishabha (Taurus)",
            compatibilityScore = 87,
            emotionalScore = 91,
            nakshatraScore = 88,
            rashiScore = 84,
            overallScore = 87,
            compatibilityNote = "Your profiles show strong compatibility in emotional temperament and communication. Your Nakshatra combination also scores positively under the selected compatibility system, suggesting a natural flow of energy."
        ),
        Candidate(
            id = "siddharth_2",
            name = "Siddharth",
            age = 27,
            profession = "Product Designer",
            location = "Mumbai",
            education = "NID Ahmedabad",
            bio = "Crafting digital experiences with empathy. Avid vinyl collector and weekend cyclist along Marine Drive. Fond of ancient temple architecture and star charts.",
            photoUrls = listOf(
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
            ),
            avatarGradientStart = 0xFF2A5298,
            avatarGradientEnd = 0xFF1E3C72,
            isVerified = true,
            educationVerified = true,
            policeVerified = true,
            creditVerified = true,
            educationDetails = "National Institute of Design · Master of Design",
            policeDetails = "Mumbai City Police Verification Portal · Clear",
            creditDetails = "CIBIL Score 790 · Verified prime rating",
            interests = listOf("UI/UX Design", "Vinyl Records", "Cycling", "Coffee Brewing", "Vedic Philosophy"),
            nakshatra = "Ashwini",
            rashi = "Mesha (Aries)",
            compatibilityScore = 91,
            emotionalScore = 94,
            nakshatraScore = 89,
            rashiScore = 90,
            overallScore = 91,
            compatibilityNote = "Ashwini and Rohini create an inspiring combination of dynamism and creative beauty, bringing mutual encouragement and shared values."
        ),
        Candidate(
            id = "aditi_3",
            name = "Aditi",
            age = 25,
            profession = "Data Scientist",
            location = "Hyderabad",
            education = "BITS Pilani",
            bio = "Decoding patterns in data and constellations in the night sky. Loves classical Kuchipudi, Himalayan hikes, and spicy Andhra cuisine.",
            photoUrls = listOf(
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop"
            ),
            avatarGradientStart = 0xFF5C1D2E,
            avatarGradientEnd = 0xFFB8860B,
            isVerified = true,
            educationVerified = true,
            policeVerified = true,
            creditVerified = true,
            educationDetails = "BITS Pilani · M.Sc Data Science & B.E Computer Science",
            policeDetails = "Cyberabad Police Verification System · Clear",
            creditDetails = "Equifax Score 795 · Excellent standing",
            interests = listOf("Machine Learning", "Classical Dance", "Hiking", "Books", "Stargazing"),
            nakshatra = "Hasta",
            rashi = "Kanya (Virgo)",
            compatibilityScore = 86,
            emotionalScore = 88,
            nakshatraScore = 85,
            rashiScore = 86,
            overallScore = 86,
            compatibilityNote = "Hasta and your Nakshatra exhibit high intellectual bonding and mutual respect for personal growth and spiritual equilibrium."
        ),
        Candidate(
            id = "kabir_4",
            name = "Kabir",
            age = 28,
            profession = "Fintech Strategist",
            location = "Delhi NCR",
            education = "IIM Bangalore",
            bio = "Balancing spreadsheets by day, playing acoustic guitar by sunset. Big believer in honest conversations, weekend tennis, and cosmic serendipity.",
            photoUrls = listOf(
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop"
            ),
            avatarGradientStart = 0xFF4A1523,
            avatarGradientEnd = 0xFF7A273D,
            isVerified = true,
            educationVerified = true,
            policeVerified = true,
            creditVerified = true,
            educationDetails = "IIM Bangalore · MBA in Finance & Strategy",
            policeDetails = "Delhi Police Character Verification · Clear",
            creditDetails = "Experian Verified · 810 Score",
            interests = listOf("Acoustic Guitar", "Tennis", "Podcasts", "Philosophy", "Travel"),
            nakshatra = "Svati",
            rashi = "Tula (Libra)",
            compatibilityScore = 92,
            emotionalScore = 93,
            nakshatraScore = 91,
            rashiScore = 92,
            overallScore = 92,
            compatibilityNote = "Svati brings an airy harmony and diplomatic warmth that seamlessly complements your grounded emotional strength."
        ),
        Candidate(
            id = "priyanka_5",
            name = "Priyanka",
            age = 26,
            profession = "Fashion Curator",
            location = "Jaipur",
            education = "NIFT Delhi",
            bio = "Reviving indigenous textiles and heritage crafts. Passionate about art history, Rajasthani heritage, and finding joy in little everyday rituals.",
            photoUrls = listOf(
                "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop"
            ),
            avatarGradientStart = 0xFF8A2BE2,
            avatarGradientEnd = 0xFFC59B27,
            isVerified = true,
            educationVerified = true,
            policeVerified = true,
            creditVerified = true,
            educationDetails = "NIFT New Delhi · Master in Textile & Fashion",
            policeDetails = "Jaipur Police Verification · Verified",
            creditDetails = "TransUnion CIBIL · 775 Verified",
            interests = listOf("Heritage Art", "Textile Design", "Pottery", "Poetry", "Culinary Arts"),
            nakshatra = "Pushya",
            rashi = "Karka (Cancer)",
            compatibilityScore = 89,
            emotionalScore = 95,
            nakshatraScore = 87,
            rashiScore = 88,
            overallScore = 89,
            compatibilityNote = "Pushya brings deep nurturing energy and emotional safety, fostering unconditional warmth and long-lasting mutual trust."
        )
    )

    val newMatches = listOf(
        Candidate(
            id = "ishani_m1",
            name = "Ishani",
            age = 24,
            profession = "Environmental Consultant",
            location = "Bengaluru",
            education = "IISc Bangalore",
            bio = "Passionate about green architecture and solar energy.",
            photoUrls = listOf("https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"),
            interests = listOf("Sustainability", "Gardening", "Astrology"),
            nakshatra = "Anuradha",
            rashi = "Vrishchika",
            compatibilityScore = 92
        ),
        Candidate(
            id = "rohan_m2",
            name = "Rohan",
            age = 26,
            profession = "AI Researcher",
            location = "Bengaluru",
            education = "IIT Madras",
            bio = "Building intelligent systems with ethical alignment.",
            photoUrls = listOf("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop"),
            interests = listOf("AI", "Chess", "Stargazing"),
            nakshatra = "Mrigashira",
            rashi = "Mithuna",
            compatibilityScore = 88
        ),
        Candidate(
            id = "meera_m3",
            name = "Meera",
            age = 25,
            profession = "Classical Musician",
            location = "Chennai",
            education = "Kalakshetra Foundation",
            bio = "Carnatic vocalist exploring acoustic fusion rhythms.",
            photoUrls = listOf("https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop"),
            interests = listOf("Carnatic Music", "Veena", "Yoga"),
            nakshatra = "Revati",
            rashi = "Meena",
            compatibilityScore = 94
        ),
        Candidate(
            id = "arjun_m4",
            name = "Arjun",
            age = 27,
            profession = "Aerospace Engineer",
            location = "Bengaluru",
            education = "IIT Kharagpur",
            bio = "Working on satellite propulsion systems and cosmic telemetry.",
            photoUrls = listOf("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop"),
            interests = listOf("Aerospace", "Trekking", "Cosmology"),
            nakshatra = "Shravana",
            rashi = "Makara",
            compatibilityScore = 90
        )
    )

    val initialConversations = listOf(
        MatchConversation(
            candidate = candidates[0], // Ananya
            lastMessage = "The stars were right about that cafe!",
            timestamp = "2m ago",
            unreadCount = 1,
            messages = listOf(
                ChatMessage("1", "User", "Hey Ananya! I noticed we have an 87% compatibility score ✨", "10:14 AM", true),
                ChatMessage("2", "Ananya", "Haha, I noticed that too 😊", "10:16 AM", false),
                ChatMessage("3", "User", "And apparently our Nakshatras Rohini and Ashwini are in great harmony.", "10:18 AM", true),
                ChatMessage("4", "Ananya", "Maybe they know something we don't ✨ Have you tried the filter coffee at CTR?", "10:20 AM", false),
                ChatMessage("5", "User", "CTR is iconic! Their benne dosa with filter coffee is perfection.", "10:22 AM", true),
                ChatMessage("6", "Ananya", "The stars were right about that cafe!", "10:24 AM", false)
            )
        ),
        MatchConversation(
            candidate = candidates[1], // Siddharth
            lastMessage = "What does your Nakshatra say about...",
            timestamp = "1h ago",
            unreadCount = 1,
            messages = listOf(
                ChatMessage("1", "Siddharth", "Hey Aarav! Love your taste in vinyl records and coffee brewing.", "09:00 AM", false),
                ChatMessage("2", "User", "Thanks Siddharth! Always great to connect with fellow design minds.", "09:15 AM", true),
                ChatMessage("3", "Siddharth", "What does your Nakshatra say about our match?", "09:30 AM", false)
            )
        ),
        MatchConversation(
            candidate = candidates[2], // Aditi
            lastMessage = "I just finished that book you suggested",
            timestamp = "Yesterday",
            unreadCount = 0,
            messages = listOf(
                ChatMessage("1", "User", "Hi Aditi, how was your weekend hike?", "Yesterday", true),
                ChatMessage("2", "Aditi", "I just finished that book you suggested", "Yesterday", false)
            )
        ),
        MatchConversation(
            candidate = candidates[3], // Kabir
            lastMessage = "Verified my credit profile today!",
            timestamp = "Yesterday",
            unreadCount = 0,
            messages = listOf(
                ChatMessage("1", "Kabir", "Verified my credit profile today!", "Yesterday", false)
            )
        ),
        MatchConversation(
            candidate = candidates[4], // Priyanka
            lastMessage = "Haha, that's so true about Leos.",
            timestamp = "2 days ago",
            unreadCount = 0,
            messages = listOf(
                ChatMessage("1", "Priyanka", "Haha, that's so true about Leos.", "2 days ago", false)
            )
        )
    )

    val astroAiKnowledge = mapOf(
        "What is my Nakshatra?" to "Based on your birth details (14 July 1998 at 08:45 AM in Bengaluru), your Nakshatra is **Rohini** in the sign of **Vrishabha (Taurus)**. Governed by the Moon and Prajapati (the Creator), Rohini signifies charm, fertility, artistic elegance, and nurturing devotion. In relationships, Rohini individuals value loyalty, aesthetic beauty, and long-term emotional stability.",
        "What is Nadi Dosha?" to "In Vedic Guna Milan astrology, **Nadi** represents genetic and physiological energy resonance, carrying 8 out of 36 total points. **Nadi Dosha** occurs when both individuals share the same Nadi (Adi, Madhya, or Antya). However, ancient texts note that Nakshatra Pada differences, strong Jupiter alignment, or high Guna Milan score (above 28) effectively neutralize this dosha.",
        "Is my Nakshatra compatible with Rohini?" to "Rohini is ruled by the Moon and represents earthy fertility and romantic grace. It shares strong celestial compatibility with **Mrigashira, Ashwini, Revati, and Anuradha**. These pairings harmonize mutual emotional understanding, aesthetic appreciation, and grounded life pursuits.",
        "Are Rohini and Ashwini compatible?" to "Yes! Rohini (Moon-ruled, earthy beauty) and Ashwini (Ketu-ruled, swift fiery initiation) share an 87% overall alignment. Ashwini brings enthusiasm, adventurous spark, and initiative, while Rohini provides comforting stability, warmth, and enduring loyalty.",
        "What does my Nakshatra say about relationships?" to "Rohini brings deep romantic devotion, steadfast fidelity, and an appreciation for sensory comfort. In love, you cherish soulful conversation, quiet domestic peace, mutual respect, and creating a shared sanctuary with your partner.",
        "When is a good time for marriage?" to "In Vedic Muhurat calculations, auspicious timing (Shubh Vivah Muhurat) depends on favorable transits of **Brihaspati (Jupiter)** and **Shukra (Venus)** without combustion, during Shukla Paksha under auspicious Nakshatras like Rohini, Anuradha, or Uttara Phalguni."
    )

    val suggestedQuestions = listOf(
        "Is my Nakshatra compatible with Rohini?",
        "What is Nadi Dosha?",
        "Are Rohini and Ashwini compatible?",
        "What does my Nakshatra say about relationships?",
        "When is a good time for marriage?"
    )

    fun getVerificationDetail(type: VerificationType, candidateName: String, institution: String, details: String): VerificationDetail {
        return when (type) {
            VerificationType.EDUCATION -> VerificationDetail(
                type = VerificationType.EDUCATION,
                title = "Education Verification",
                isVerified = true,
                statusText = "Verified Degree & Alumni Status",
                institution = institution,
                credential = details,
                verifiedDate = "15 Jan 2026",
                verificationId = "EDU-AST-98231",
                partnerAuthority = "Authorized Academic Verification Registry & DigiLocker Gateway",
                description = "Degree certificates and enrollment records have been cryptographically verified through authorized academic repositories."
            )
            VerificationType.POLICE -> VerificationDetail(
                type = VerificationType.POLICE,
                title = "Police Verification",
                isVerified = true,
                statusText = "Background Record Verified",
                institution = "Digital Verification Authority",
                credential = details,
                verifiedDate = "22 Jan 2026",
                verificationId = "POL-VER-77402",
                partnerAuthority = "Authorized National Crime & Identity Registry Verification System",
                description = "Identity and residential background verified with zero criminal or adverse legal records found."
            )
            VerificationType.CREDIT -> VerificationDetail(
                type = VerificationType.CREDIT,
                title = "Credit Profile Verification",
                isVerified = true,
                statusText = "Verified Financial Health Score",
                institution = "Experian & CIBIL Bureau",
                credential = details,
                verifiedDate = "05 Feb 2026",
                verificationId = "CRD-AST-44190",
                partnerAuthority = "Authorized Credit Information Bureau Partner",
                description = "Demonstrates verified financial responsibility with prime tier credit score and no historical delinquency. Exact balances and numbers remain strictly confidential."
            )
        }
    }
}
