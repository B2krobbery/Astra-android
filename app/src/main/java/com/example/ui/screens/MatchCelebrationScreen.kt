package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.Candidate
import com.example.data.models.UserProfile
import com.example.ui.components.CandidateAvatar
import com.example.ui.theme.AstraTheme

@Composable
fun MatchCelebrationScreen(
    userProfile: UserProfile,
    candidate: Candidate,
    onStartChatting: () -> Unit,
    onKeepDiscovering: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = if (colors.isDark) {
                        listOf(
                            Color(0xFF0F172A),
                            colors.background,
                            Color(0xFF0B0D11)
                        )
                    } else {
                        listOf(
                            Color(0xFFF1F5F9),
                            colors.background,
                            Color(0xFFEDE9FE)
                        )
                    }
                )
            )
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        // Top Close
        IconButton(
            onClick = onKeepDiscovering,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
                .testTag("match_close_button")
        ) {
            Icon(
                imageVector = Icons.Default.Close,
                contentDescription = "Close",
                tint = colors.textPrimary.copy(alpha = 0.8f)
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            // Headline Section
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(colors.primary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = colors.onPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "It's a Match!",
                    style = androidx.compose.ui.text.TextStyle(
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 36.sp,
                        color = colors.textPrimary,
                        textAlign = TextAlign.Center
                    )
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "You and ${candidate.name} have liked each other.",
                    fontSize = 14.sp,
                    color = colors.textSecondary,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Overlapping Glowing Avatars
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp),
                contentAlignment = Alignment.Center
            ) {
                // User Avatar (Left)
                CandidateAvatar(
                    name = userProfile.name,
                    photoUrl = userProfile.photoUrl,
                    size = 110.dp,
                    borderWidth = 3.dp,
                    borderColor = colors.primary,
                    gradientStart = if (colors.isDark) 0xFF1E293B else 0xFFE2E8F0,
                    gradientEnd = if (colors.isDark) 0xFF0F172A else 0xFFCBD5E1,
                    modifier = Modifier.offset(x = (-42).dp)
                )

                // Candidate Avatar (Right)
                CandidateAvatar(
                    name = candidate.name,
                    photoUrl = candidate.photoUrls.firstOrNull().orEmpty(),
                    size = 110.dp,
                    borderWidth = 3.dp,
                    borderColor = colors.primary,
                    gradientStart = candidate.avatarGradientStart,
                    gradientEnd = candidate.avatarGradientEnd,
                    modifier = Modifier.offset(x = 42.dp)
                )

                // Heart Badge in Center
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .shadow(8.dp, CircleShape, spotColor = colors.primary.copy(alpha = 0.5f))
                        .clip(CircleShape)
                        .background(colors.card)
                        .border(2.dp, colors.primary, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Favorite,
                        contentDescription = "Match Heart",
                        tint = colors.primary,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Astrology Pill
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = colors.indigoBg,
                border = BorderStroke(1.dp, colors.indigoBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = colors.primary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "${candidate.compatibilityScore}% ASTROLOGY COMPATIBILITY",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary,
                            letterSpacing = 1.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${userProfile.nakshatra} & ${candidate.nakshatra} in cosmic harmony",
                        fontSize = 13.sp,
                        color = colors.textSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Bottom Actions
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                Button(
                    onClick = onStartChatting,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .testTag("match_start_chat_button"),
                    shape = RoundedCornerShape(28.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colors.primary,
                        contentColor = colors.onPrimary
                    )
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.ChatBubble,
                            contentDescription = null,
                            tint = colors.onPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Start Chatting",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = colors.onPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedButton(
                    onClick = onKeepDiscovering,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .testTag("match_keep_discovering_button"),
                    shape = RoundedCornerShape(28.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = colors.textPrimary
                    ),
                    border = BorderStroke(1.dp, colors.border)
                ) {
                    Text(
                        text = "Keep Discovering",
                        fontWeight = FontWeight.Medium,
                        fontSize = 14.sp,
                        color = colors.textPrimary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
