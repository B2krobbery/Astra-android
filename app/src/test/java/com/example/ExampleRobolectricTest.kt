package com.example

import android.content.Context
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performScrollTo
import androidx.test.core.app.ApplicationProvider
import com.example.data.AstrologyEngine
import com.example.data.MockData
import com.example.ui.screens.AstrologySetupScreen
import com.example.ui.screens.CandidateDetailScreen
import com.example.ui.screens.HoroscopeCompatibilityScreen
import com.example.ui.screens.MatchCelebrationScreen
import com.example.ui.screens.ProfileOnboardingScreen
import com.example.ui.screens.SplashScreen
import com.example.ui.screens.UserProfileScreen
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun `read string from context`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("Astra", appName)
    }

    @Test
    fun `test astrology engine compatibility calculations`() {
        val user = com.example.data.models.UserProfile(nakshatra = "Rohini", rashi = "Vrishabha (Taurus)")
        val candidate = MockData.candidates.first()
        val compatibility = AstrologyEngine.calculateCompatibility(user, candidate)
        assertNotNull(compatibility)
        assertTrue(compatibility.score >= 50)
        assertTrue(compatibility.emotionalScore > 0)
        assertEquals("Ananya", compatibility.candidateName)
    }

    @Test
    fun `test mock data candidate integrity`() {
        val candidates = MockData.candidates
        assertTrue(candidates.isNotEmpty())
        val first = candidates.first()
        assertEquals("Ananya", first.name)
        assertTrue(first.isVerified)
        assertTrue(first.educationVerified)
    }

    @Test
    fun `test splash screen scroll and button rendered`() {
        composeTestRule.setContent {
            SplashScreen(
                onContinuePhone = {},
                onContinueGoogle = {},
                onCreateAccount = {}
            )
        }
        composeTestRule.onNodeWithTag("continue_phone_button").assertExists()
        composeTestRule.onNodeWithTag("continue_google_button").assertExists()
    }

    @Test
    fun `test profile onboarding screen scrollable`() {
        composeTestRule.setContent {
            ProfileOnboardingScreen(
                initialProfile = com.example.data.models.UserProfile(),
                onBack = {},
                onSkip = {},
                onContinue = { _, _, _, _, _ -> }
            )
        }
        composeTestRule.onNodeWithTag("onboarding_continue_button").assertExists()
    }

    @Test
    fun `test astrology setup screen scrollable`() {
        composeTestRule.setContent {
            AstrologySetupScreen(
                userProfile = com.example.data.models.UserProfile(),
                onBack = {},
                onSkip = {},
                onCalculate = { _, _, _ -> }
            )
        }
        composeTestRule.onNodeWithTag("calculate_astrology_button").assertExists()
    }

    @Test
    fun `test match celebration screen scrollable`() {
        composeTestRule.setContent {
            MatchCelebrationScreen(
                userProfile = com.example.data.models.UserProfile(),
                candidate = MockData.candidates.first(),
                onStartChatting = {},
                onKeepDiscovering = {}
            )
        }
        composeTestRule.onNodeWithTag("match_start_chat_button").assertExists()
        composeTestRule.onNodeWithTag("match_keep_discovering_button").assertExists()
    }

    @Test
    fun `test user profile screen scrollable`() {
        composeTestRule.setContent {
            UserProfileScreen(
                userProfile = com.example.data.models.UserProfile(),
                onEditProfile = {},
                onEditAstrology = {},
                onVerificationClick = {},
                onStartPoliceVerification = {},
                onTabSelected = {}
            )
        }
        composeTestRule.onNodeWithTag("user_profile_edit_button").assertExists()
        composeTestRule.onNodeWithTag("user_astrology_card").assertExists()
    }

    @Test
    fun `test candidate detail screen scrollable`() {
        composeTestRule.setContent {
            CandidateDetailScreen(
                candidate = MockData.candidates.first(),
                onBack = {},
                onLike = {},
                onPass = {},
                onCheckCompatibility = {},
                onVerificationClick = { _, _ -> }
            )
        }
        composeTestRule.onNodeWithTag("detail_connect_button").assertExists()
    }
}
