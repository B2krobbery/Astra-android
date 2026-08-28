package com.example.state

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.AstrologyEngine
import com.example.data.MockData
import com.example.data.models.AstrologyCompatibility
import com.example.data.models.Candidate
import com.example.data.models.ChatMessage
import com.example.data.models.MatchConversation
import com.example.data.models.UserProfile
import com.example.data.models.VerificationDetail
import com.example.data.models.VerificationType
import com.example.ui.theme.ThemeMode
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class AstraViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = application.getSharedPreferences("astra_theme_prefs", Context.MODE_PRIVATE)

    private val _themeMode = MutableStateFlow(
        try {
            val saved = prefs.getString("theme_mode", ThemeMode.DARK.name)
            ThemeMode.valueOf(saved ?: ThemeMode.DARK.name)
        } catch (e: Exception) {
            ThemeMode.DARK
        }
    )
    val themeMode: StateFlow<ThemeMode> = _themeMode.asStateFlow()

    fun setThemeMode(mode: ThemeMode) {
        _themeMode.value = mode
        prefs.edit().putString("theme_mode", mode.name).apply()
    }

    private val _userProfile = MutableStateFlow(UserProfile())
    val userProfile: StateFlow<UserProfile> = _userProfile.asStateFlow()

    private val _candidates = MutableStateFlow(MockData.candidates)
    val candidates: StateFlow<List<Candidate>> = _candidates.asStateFlow()

    private val _candidateIndex = MutableStateFlow(0)
    val candidateIndex: StateFlow<Int> = _candidateIndex.asStateFlow()

    val currentCandidate: StateFlow<Candidate?> = MutableStateFlow<Candidate?>(null).apply {
        // Will update dynamically
    }

    private val _selectedCandidate = MutableStateFlow<Candidate?>(MockData.candidates.firstOrNull())
    val selectedCandidate: StateFlow<Candidate?> = _selectedCandidate.asStateFlow()

    private val _likedCandidateIds = MutableStateFlow<Set<String>>(emptySet())
    val likedCandidateIds: StateFlow<Set<String>> = _likedCandidateIds.asStateFlow()

    private val _lastMatchedCandidate = MutableStateFlow<Candidate?>(null)
    val lastMatchedCandidate: StateFlow<Candidate?> = _lastMatchedCandidate.asStateFlow()

    private val _conversations = MutableStateFlow(MockData.initialConversations)
    val conversations: StateFlow<List<MatchConversation>> = _conversations.asStateFlow()

    private val _activeConversation = MutableStateFlow<MatchConversation?>(MockData.initialConversations.firstOrNull())
    val activeConversation: StateFlow<MatchConversation?> = _activeConversation.asStateFlow()

    private val _isChatTyping = MutableStateFlow(false)
    val isChatTyping: StateFlow<Boolean> = _isChatTyping.asStateFlow()

    // Astro AI Chat
    private val _astroAiMessages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                id = "ai_1",
                senderName = "Astro AI",
                message = "Namaste! I'm your Astro AI guide. How can I help you navigate your connections today?",
                timestamp = "Just now",
                isFromUser = false
            ),
            ChatMessage(
                id = "ai_2",
                senderName = "Aarav",
                message = "What is my Nakshatra? I was born in Bengaluru at 10:30 AM.",
                timestamp = "Just now",
                isFromUser = true
            ),
            ChatMessage(
                id = "ai_3",
                senderName = "Astro AI",
                message = "Based on your birth details, your Nakshatra is Rohini. This suggests a charming, creative, and nurturing personality. People with Rohini Nakshatra often value stable and beautiful relationships.",
                timestamp = "Just now",
                isFromUser = false
            )
        )
    )
    val astroAiMessages: StateFlow<List<ChatMessage>> = _astroAiMessages.asStateFlow()

    private val _isAstroAiTyping = MutableStateFlow(false)
    val isAstroAiTyping: StateFlow<Boolean> = _isAstroAiTyping.asStateFlow()

    // Compatibility Checking Animation State
    private val _isAnalyzingCompatibility = MutableStateFlow(false)
    val isAnalyzingCompatibility: StateFlow<Boolean> = _isAnalyzingCompatibility.asStateFlow()

    private val _currentCompatibility = MutableStateFlow<AstrologyCompatibility?>(
        AstrologyEngine.calculateCompatibility(UserProfile(), MockData.candidates.first())
    )
    val currentCompatibility: StateFlow<AstrologyCompatibility?> = _currentCompatibility.asStateFlow()

    // Verification Dialog / Modal
    private val _activeVerificationDetail = MutableStateFlow<VerificationDetail?>(null)
    val activeVerificationDetail: StateFlow<VerificationDetail?> = _activeVerificationDetail.asStateFlow()

    fun updateProfileInfo(
        profession: String,
        education: String,
        city: String,
        lookingFor: List<String>,
        interests: List<String>
    ) {
        _userProfile.update { current ->
            current.copy(
                profession = profession.ifBlank { current.profession },
                education = education.ifBlank { current.education },
                location = city.ifBlank { current.location },
                lookingFor = if (lookingFor.isNotEmpty()) lookingFor else current.lookingFor,
                interests = if (interests.isNotEmpty()) interests else current.interests
            )
        }
    }

    fun updateBirthDetails(dob: String, time: String, city: String) {
        val calculatedNakshatra = AstrologyEngine.calculateNakshatra(dob, time, city)
        val calculatedRashi = AstrologyEngine.calculateRashi(dob, time, city)

        _userProfile.update {
            it.copy(
                dateOfBirth = dob,
                birthTime = time,
                birthCity = city,
                nakshatra = calculatedNakshatra,
                rashi = calculatedRashi
            )
        }
    }

    fun selectCandidate(candidate: Candidate) {
        _selectedCandidate.value = candidate
        _currentCompatibility.value = AstrologyEngine.calculateCompatibility(_userProfile.value, candidate)
    }

    fun checkCompatibility(candidate: Candidate, onAnalyzed: () -> Unit) {
        _selectedCandidate.value = candidate
        _isAnalyzingCompatibility.value = true
        viewModelScope.launch {
            delay(1400) // celestial analysis animation
            _currentCompatibility.value = AstrologyEngine.calculateCompatibility(_userProfile.value, candidate)
            _isAnalyzingCompatibility.value = false
            onAnalyzed()
        }
    }

    fun likeCandidate(candidate: Candidate, onMatch: () -> Unit) {
        _likedCandidateIds.update { it + candidate.id }
        _lastMatchedCandidate.value = candidate

        // Auto create or activate conversation
        val existing = _conversations.value.find { it.candidate.id == candidate.id }
        if (existing == null) {
            val newConvo = MatchConversation(
                candidate = candidate,
                lastMessage = "You both matched with ${candidate.compatibilityScore}% compatibility ✨",
                timestamp = "Just now",
                unreadCount = 1,
                messages = listOf(
                    ChatMessage(
                        id = "welcome_1",
                        senderName = candidate.name,
                        message = "Hi! Our stars have aligned (${candidate.compatibilityScore}% compatibility) 😊",
                        timestamp = "Just now",
                        isFromUser = false
                    )
                )
            )
            _conversations.update { listOf(newConvo) + it }
            _activeConversation.value = newConvo
        } else {
            _activeConversation.value = existing
        }

        // Advance feed candidate
        advanceFeed()
        onMatch()
    }

    fun passCandidate(candidate: Candidate) {
        advanceFeed()
    }

    private fun advanceFeed() {
        val currentList = _candidates.value
        if (currentList.isNotEmpty()) {
            val nextIndex = (_candidateIndex.value + 1) % currentList.size
            _candidateIndex.value = nextIndex
            _selectedCandidate.value = currentList[nextIndex]
        }
    }

    fun openConversationForCandidate(candidate: Candidate) {
        val convo = _conversations.value.find { it.candidate.id == candidate.id }
            ?: MatchConversation(
                candidate = candidate,
                lastMessage = "Matched based on ${candidate.nakshatra} harmony",
                timestamp = "Just now",
                unreadCount = 0,
                messages = listOf(
                    ChatMessage("1", candidate.name, "Namaste! Glad our charts connected ✨", "10:00 AM", false)
                )
            ).also { newConvo ->
                _conversations.update { listOf(newConvo) + it }
            }
        _activeConversation.value = convo
    }

    fun sendChatMessage(text: String) {
        if (text.isBlank()) return
        val active = _activeConversation.value ?: return

        val userMsg = ChatMessage(
            id = System.currentTimeMillis().toString(),
            senderName = _userProfile.value.name,
            message = text,
            timestamp = "Just now",
            isFromUser = true
        )

        val updatedMessages = active.messages + userMsg
        val updatedConvo = active.copy(
            messages = updatedMessages,
            lastMessage = text,
            timestamp = "Just now"
        )

        _activeConversation.value = updatedConvo
        _conversations.update { list ->
            list.map { if (it.candidate.id == active.candidate.id) updatedConvo else it }
        }

        // Simulate intelligent reply after short delay
        viewModelScope.launch {
            _isChatTyping.value = true
            delay(1600)
            _isChatTyping.value = false

            val replyText = generateCandidateReply(active.candidate, text)
            val candidateReply = ChatMessage(
                id = (System.currentTimeMillis() + 1).toString(),
                senderName = active.candidate.name,
                message = replyText,
                timestamp = "Just now",
                isFromUser = false
            )

            val finalMessages = updatedMessages + candidateReply
            val finalConvo = updatedConvo.copy(
                messages = finalMessages,
                lastMessage = replyText,
                timestamp = "Just now"
            )

            _activeConversation.value = finalConvo
            _conversations.update { list ->
                list.map { if (it.candidate.id == active.candidate.id) finalConvo else it }
            }
        }
    }

    private fun generateCandidateReply(candidate: Candidate, userMessage: String): String {
        val lower = userMessage.lowercase()
        return when {
            "astrology" in lower || "nakshatra" in lower || "stars" in lower || "chart" in lower ->
                "I know, right? ${candidate.nakshatra} and your chart have such an effortless vibe. What's your favorite celestial observation?"
            "coffee" in lower || "cafe" in lower || "drink" in lower || "meet" in lower ->
                "Haha, filter coffee or artisanal pour-over? I know a quaint spot in town with great peaceful ambient music!"
            "design" in lower || "architect" in lower || "work" in lower || "tech" in lower ->
                "That's exciting! I love finding harmony in structure and aesthetics. Tell me more about what you're building."
            else ->
                "Haha, I agree! It really feels like our stars are on the same wavelength ✨"
        }
    }

    fun askAstroAi(question: String) {
        if (question.isBlank()) return
        val userMsg = ChatMessage(
            id = System.currentTimeMillis().toString(),
            senderName = _userProfile.value.name,
            message = question,
            timestamp = "Just now",
            isFromUser = true
        )

        _astroAiMessages.update { it + userMsg }

        viewModelScope.launch {
            _isAstroAiTyping.value = true
            delay(1400)
            _isAstroAiTyping.value = false

            val answer = MockData.astroAiKnowledge[question]
                ?: "Based on Vedic principles and your celestial placements, your stars indicate a harmonious phase for cultivating genuine partnerships with emotional depth and long-term resonance."

            val aiReply = ChatMessage(
                id = (System.currentTimeMillis() + 1).toString(),
                senderName = "Astro AI",
                message = answer,
                timestamp = "Just now",
                isFromUser = false
            )

            _astroAiMessages.update { it + aiReply }
        }
    }

    fun showVerification(type: VerificationType, candidate: Candidate? = null) {
        val c = candidate ?: _selectedCandidate.value ?: MockData.candidates.first()
        _activeVerificationDetail.value = when (type) {
            VerificationType.EDUCATION -> MockData.getVerificationDetail(type, c.name, c.education, c.educationDetails)
            VerificationType.POLICE -> MockData.getVerificationDetail(type, c.name, "Police Verification Portal", c.policeDetails)
            VerificationType.CREDIT -> MockData.getVerificationDetail(type, c.name, "Credit Bureau", c.creditDetails)
        }
    }

    fun showUserVerification(type: VerificationType) {
        val user = _userProfile.value
        _activeVerificationDetail.value = when (type) {
            VerificationType.EDUCATION -> MockData.getVerificationDetail(
                type, user.name, "IIT Bombay", "Bachelor of Technology · Computer Science (Verified via DigiLocker)"
            )
            VerificationType.POLICE -> VerificationDetail(
                type = VerificationType.POLICE,
                title = "Police Verification",
                isVerified = user.policeVerified,
                statusText = if (user.policeVerified) "Verified Character Certificate" else "Verification Pending",
                institution = "State Police Citizen Portal",
                credential = "Identity & background verification in progress",
                verifiedDate = "Pending Submission",
                verificationId = "POL-REQ-0039",
                partnerAuthority = "Authorized Police Verification Gateway",
                description = "You can verify your police character certificate to unlock the 3x Trusted Badge on your profile."
            )
            VerificationType.CREDIT -> MockData.getVerificationDetail(
                type, user.name, "CIBIL / Experian", "Verified Prime Credit Score (780+) · Zero Defaults"
            )
        }
    }

    fun dismissVerification() {
        _activeVerificationDetail.value = null
    }

    fun verifyPoliceForUser() {
        _userProfile.update { it.copy(policeVerified = true) }
        showUserVerification(VerificationType.POLICE)
    }
}
