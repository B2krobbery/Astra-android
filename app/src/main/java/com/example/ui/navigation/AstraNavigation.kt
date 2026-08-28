package com.example.ui.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.data.MockData
import com.example.state.AstraViewModel
import com.example.ui.components.AstraTab
import com.example.ui.components.VerificationBottomSheet
import com.example.ui.screens.AstroAiAssistantScreen
import com.example.ui.screens.AstrologySetupScreen
import com.example.ui.screens.CandidateDetailScreen
import com.example.ui.screens.ChatDetailScreen
import com.example.ui.screens.DiscoverFeedScreen
import com.example.ui.screens.HoroscopeCompatibilityScreen
import com.example.ui.screens.MatchCelebrationScreen
import com.example.ui.screens.MatchesConversationsScreen
import com.example.ui.screens.ProfileOnboardingScreen
import com.example.ui.screens.SplashScreen
import com.example.ui.screens.UserProfileScreen

object AstraDestinations {
    const val SPLASH = "splash"
    const val ONBOARDING_PROFILE = "onboarding_profile"
    const val ONBOARDING_ASTROLOGY = "onboarding_astrology"
    const val DISCOVER = "discover"
    const val CANDIDATE_DETAIL = "candidate_detail"
    const val HOROSCOPE_COMPATIBILITY = "horoscope_compatibility"
    const val MATCH_CELEBRATION = "match_celebration"
    const val MATCHES = "matches"
    const val CHAT_DETAIL = "chat_detail"
    const val ASTRO_AI = "astro_ai"
    const val USER_PROFILE = "user_profile"
}

@Composable
fun AstraApp(
    navController: NavHostController = rememberNavController(),
    viewModel: AstraViewModel = viewModel()
) {
    val userProfile by viewModel.userProfile.collectAsState()
    val candidates by viewModel.candidates.collectAsState()
    val candidateIndex by viewModel.candidateIndex.collectAsState()
    val selectedCandidate by viewModel.selectedCandidate.collectAsState()
    val conversations by viewModel.conversations.collectAsState()
    val activeConversation by viewModel.activeConversation.collectAsState()
    val isChatTyping by viewModel.isChatTyping.collectAsState()
    val astroAiMessages by viewModel.astroAiMessages.collectAsState()
    val isAstroAiTyping by viewModel.isAstroAiTyping.collectAsState()
    val currentCompatibility by viewModel.currentCompatibility.collectAsState()
    val isAnalyzingCompatibility by viewModel.isAnalyzingCompatibility.collectAsState()
    val activeVerificationDetail by viewModel.activeVerificationDetail.collectAsState()

    val currentCandidate = candidates.getOrNull(candidateIndex)

    Box(modifier = Modifier.fillMaxSize()) {
        NavHost(
            navController = navController,
            startDestination = AstraDestinations.SPLASH,
            enterTransition = { fadeIn(animationSpec = tween(300)) },
            exitTransition = { fadeOut(animationSpec = tween(300)) },
            popEnterTransition = { fadeIn(animationSpec = tween(300)) },
            popExitTransition = { fadeOut(animationSpec = tween(300)) }
        ) {
            // 1. Splash & Entry Screen
            composable(AstraDestinations.SPLASH) {
                SplashScreen(
                    onContinuePhone = { navController.navigate(AstraDestinations.ONBOARDING_PROFILE) },
                    onContinueGoogle = { navController.navigate(AstraDestinations.ONBOARDING_PROFILE) },
                    onCreateAccount = { navController.navigate(AstraDestinations.ONBOARDING_PROFILE) }
                )
            }

            // 2. Profile Onboarding
            composable(AstraDestinations.ONBOARDING_PROFILE) {
                ProfileOnboardingScreen(
                    initialProfile = userProfile,
                    onBack = { navController.popBackStack() },
                    onSkip = { navController.navigate(AstraDestinations.ONBOARDING_ASTROLOGY) },
                    onContinue = { profession, education, city, lookingFor, interests ->
                        viewModel.updateProfileInfo(profession, education, city, lookingFor, interests)
                        navController.navigate(AstraDestinations.ONBOARDING_ASTROLOGY)
                    }
                )
            }

            // 3. Astrology Setup
            composable(AstraDestinations.ONBOARDING_ASTROLOGY) {
                AstrologySetupScreen(
                    userProfile = userProfile,
                    onBack = { navController.popBackStack() },
                    onSkip = { navController.navigate(AstraDestinations.DISCOVER) },
                    onCalculate = { dob, time, city ->
                        viewModel.updateBirthDetails(dob, time, city)
                        navController.navigate(AstraDestinations.DISCOVER) {
                            popUpTo(AstraDestinations.SPLASH) { inclusive = true }
                        }
                    }
                )
            }

            // 4. Discover Feed
            composable(AstraDestinations.DISCOVER) {
                DiscoverFeedScreen(
                    currentCandidate = currentCandidate,
                    onCardClick = { candidate ->
                        viewModel.selectCandidate(candidate)
                        navController.navigate(AstraDestinations.CANDIDATE_DETAIL)
                    },
                    onLikeClick = { candidate ->
                        viewModel.likeCandidate(candidate) {
                            navController.navigate(AstraDestinations.MATCH_CELEBRATION)
                        }
                    },
                    onPassClick = { candidate ->
                        viewModel.passCandidate(candidate)
                    },
                    onCheckCompatibility = { candidate ->
                        viewModel.checkCompatibility(candidate) {
                            navController.navigate(AstraDestinations.HOROSCOPE_COMPATIBILITY)
                        }
                    },
                    currentTab = AstraTab.DISCOVER,
                    onTabSelected = { tab ->
                        navigateToTab(navController, tab)
                    }
                )
            }

            // 5. Candidate Detail Profile
            composable(AstraDestinations.CANDIDATE_DETAIL) {
                val candidate = selectedCandidate ?: MockData.candidates.first()
                CandidateDetailScreen(
                    candidate = candidate,
                    onBack = { navController.popBackStack() },
                    onLike = { c ->
                        viewModel.likeCandidate(c) {
                            navController.navigate(AstraDestinations.MATCH_CELEBRATION)
                        }
                    },
                    onPass = { c ->
                        viewModel.passCandidate(c)
                        navController.popBackStack()
                    },
                    onCheckCompatibility = { c ->
                        viewModel.checkCompatibility(c) {
                            navController.navigate(AstraDestinations.HOROSCOPE_COMPATIBILITY)
                        }
                    },
                    onVerificationClick = { type, c ->
                        viewModel.showVerification(type, c)
                    }
                )
            }

            // 6. Horoscope Compatibility / Celestial Alignment
            composable(AstraDestinations.HOROSCOPE_COMPATIBILITY) {
                val candidate = selectedCandidate ?: MockData.candidates.first()
                HoroscopeCompatibilityScreen(
                    candidate = candidate,
                    compatibility = currentCompatibility,
                    isAnalyzing = isAnalyzingCompatibility,
                    onBack = { navController.popBackStack() },
                    onConnect = {
                        viewModel.likeCandidate(candidate) {
                            navController.navigate(AstraDestinations.MATCH_CELEBRATION)
                        }
                    }
                )
            }

            // 7. Match Celebration
            composable(AstraDestinations.MATCH_CELEBRATION) {
                val candidate = viewModel.lastMatchedCandidate.value ?: selectedCandidate ?: MockData.candidates.first()
                MatchCelebrationScreen(
                    userProfile = userProfile,
                    candidate = candidate,
                    onStartChatting = {
                        viewModel.openConversationForCandidate(candidate)
                        navController.navigate(AstraDestinations.CHAT_DETAIL)
                    },
                    onKeepDiscovering = {
                        navController.navigate(AstraDestinations.DISCOVER) {
                            popUpTo(AstraDestinations.DISCOVER) { inclusive = true }
                        }
                    }
                )
            }

            // 8. Matches & Messages
            composable(AstraDestinations.MATCHES) {
                MatchesConversationsScreen(
                    conversations = conversations,
                    newMatches = MockData.newMatches,
                    onSelectConversation = { convo ->
                        viewModel.openConversationForCandidate(convo.candidate)
                        navController.navigate(AstraDestinations.CHAT_DETAIL)
                    },
                    onSelectNewMatch = { candidate ->
                        viewModel.selectCandidate(candidate)
                        navController.navigate(AstraDestinations.CANDIDATE_DETAIL)
                    },
                    onOpenAstroAi = {
                        navController.navigate(AstraDestinations.ASTRO_AI)
                    },
                    currentTab = AstraTab.MATCHES,
                    onTabSelected = { tab ->
                        navigateToTab(navController, tab)
                    }
                )
            }

            // 9. Chat Detail
            composable(AstraDestinations.CHAT_DETAIL) {
                val convo = activeConversation ?: conversations.first()
                ChatDetailScreen(
                    conversation = convo,
                    isTyping = isChatTyping,
                    onBack = { navController.popBackStack() },
                    onSendMessage = { text ->
                        viewModel.sendChatMessage(text)
                    },
                    onViewCompatibility = {
                        viewModel.selectCandidate(convo.candidate)
                        navController.navigate(AstraDestinations.HOROSCOPE_COMPATIBILITY)
                    }
                )
            }

            // 10. Astro AI Assistant
            composable(AstraDestinations.ASTRO_AI) {
                AstroAiAssistantScreen(
                    messages = astroAiMessages,
                    isTyping = isAstroAiTyping,
                    suggestedQuestions = MockData.suggestedQuestions,
                    onSendMessage = { q ->
                        viewModel.askAstroAi(q)
                    },
                    currentTab = AstraTab.ASTRO_AI,
                    onTabSelected = { tab ->
                        navigateToTab(navController, tab)
                    }
                )
            }

            // 11. User Profile & Verification
            composable(AstraDestinations.USER_PROFILE) {
                val themeMode by viewModel.themeMode.collectAsState()
                UserProfileScreen(
                    userProfile = userProfile,
                    onEditProfile = { navController.navigate(AstraDestinations.ONBOARDING_PROFILE) },
                    onEditAstrology = { navController.navigate(AstraDestinations.ONBOARDING_ASTROLOGY) },
                    onVerificationClick = { type ->
                        viewModel.showUserVerification(type)
                    },
                    onStartPoliceVerification = {
                        viewModel.verifyPoliceForUser()
                    },
                    currentThemeMode = themeMode,
                    onThemeModeSelected = { mode ->
                        viewModel.setThemeMode(mode)
                    },
                    currentTab = AstraTab.PROFILE,
                    onTabSelected = { tab ->
                        navigateToTab(navController, tab)
                    }
                )
            }
        }

        // Global Verification Modal Bottom Sheet
        activeVerificationDetail?.let { detail ->
            VerificationBottomSheet(
                detail = detail,
                onDismiss = { viewModel.dismissVerification() },
                onVerifyAction = if (!detail.isVerified) {
                    { viewModel.verifyPoliceForUser() }
                } else null
            )
        }
    }
}

private fun navigateToTab(navController: NavHostController, tab: AstraTab) {
    val destination = when (tab) {
        AstraTab.DISCOVER -> AstraDestinations.DISCOVER
        AstraTab.MATCHES -> AstraDestinations.MATCHES
        AstraTab.ASTRO_AI -> AstraDestinations.ASTRO_AI
        AstraTab.PROFILE -> AstraDestinations.USER_PROFILE
    }

    navController.navigate(destination) {
        popUpTo(AstraDestinations.DISCOVER) {
            saveState = true
        }
        launchSingleTop = true
        restoreState = true
    }
}
