package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.outlined.Language
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.AstraBrandHeader
import com.example.ui.components.AstraOutlinedButton
import com.example.ui.components.AstraPrimaryButton
import com.example.ui.theme.AstraTheme

@Composable
fun SplashScreen(
    onContinuePhone: () -> Unit,
    onContinueGoogle: () -> Unit,
    onCreateAccount: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp, vertical = 16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Brand Logo & Name
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 16.dp)
            ) {
                AstraBrandHeader(
                    title = "NAKSHATRA",
                    tagline = "Where stars align"
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Hero Headline
                Text(
                    text = "Meet someone who feels right.",
                    style = androidx.compose.ui.text.TextStyle(
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 30.sp,
                        lineHeight = 38.sp,
                        color = colors.textPrimary,
                        textAlign = TextAlign.Center
                    ),
                    modifier = Modifier.padding(horizontal = 12.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Thoughtful matchmaking with verified profiles and Vedic astrology compatibility.",
                    style = androidx.compose.ui.text.TextStyle(
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Normal,
                        fontSize = 14.sp,
                        lineHeight = 22.sp,
                        color = colors.textSecondary,
                        textAlign = TextAlign.Center
                    ),
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }

            Spacer(modifier = Modifier.height(36.dp))

            // Action Buttons
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                AstraPrimaryButton(
                    text = "Continue with Phone",
                    onClick = onContinuePhone,
                    icon = Icons.Default.Phone,
                    testTag = "continue_phone_button"
                )

                Spacer(modifier = Modifier.height(12.dp))

                AstraOutlinedButton(
                    text = "Continue with Google",
                    onClick = onContinueGoogle,
                    icon = Icons.Outlined.Language,
                    testTag = "continue_google_button"
                )

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Don't have an account? ",
                        fontSize = 13.sp,
                        color = colors.textSecondary
                    )
                    Text(
                        text = "Create Account",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.primary,
                        modifier = Modifier
                            .clickable(onClick = onCreateAccount)
                            .testTag("create_account_text_button")
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "By continuing, you agree to Astra's Terms & Privacy Policy.",
                    fontSize = 11.sp,
                    color = colors.textTertiary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 24.dp)
                )
            }
        }
    }
}
