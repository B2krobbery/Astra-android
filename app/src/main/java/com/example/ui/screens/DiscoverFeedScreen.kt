package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.Candidate
import com.example.ui.components.AstraBottomNavigationBar
import com.example.ui.components.AstraTab
import com.example.ui.components.DiscoverCandidateCard
import com.example.ui.theme.AstraTheme
import com.example.ui.theme.Indigo500
import com.example.ui.theme.Purple500

@Composable
fun DiscoverFeedScreen(
    currentCandidate: Candidate?,
    onCardClick: (Candidate) -> Unit,
    onLikeClick: (Candidate) -> Unit,
    onPassClick: (Candidate) -> Unit,
    onCheckCompatibility: (Candidate) -> Unit,
    currentTab: AstraTab = AstraTab.DISCOVER,
    onTabSelected: (AstraTab) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors

    Scaffold(
        modifier = modifier.fillMaxSize(),
        bottomBar = {
            AstraBottomNavigationBar(
                currentTab = currentTab,
                onTabSelected = onTabSelected
            )
        },
        containerColor = colors.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .statusBarsPadding()
                .padding(horizontal = 16.dp)
        ) {
            // Sleek Header Bar matching reference design
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Title and Subtitle Tagline
                Column {
                    Text(
                        text = "Astra",
                        style = androidx.compose.ui.text.TextStyle(
                            fontFamily = FontFamily.SansSerif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 22.sp,
                            letterSpacing = (-0.5).sp,
                            color = colors.textPrimary
                        )
                    )
                    Text(
                        text = "WHERE STARS ALIGN",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp,
                        color = colors.primary
                    )
                }

                // Header Actions (Filter Button + Glowing Indigo/Purple Avatar Ring)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(colors.card)
                            .border(1.dp, colors.border, CircleShape)
                            .clickable { /* Filter */ }
                            .testTag("feed_filter_button"),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Tune,
                            contentDescription = "Filter Preferences",
                            tint = colors.textSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // User Avatar with glowing gradient ring
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.sweepGradient(
                                    colors = listOf(Indigo500, Purple500, colors.primary, Indigo500)
                                )
                            )
                            .padding(2.dp)
                            .clickable { onTabSelected(AstraTab.PROFILE) },
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(CircleShape)
                                .background(if (colors.isDark) Color(0xFF1E293B) else colors.cardHighlight),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "A",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Main Discover Candidate Card
            if (currentCandidate != null) {
                DiscoverCandidateCard(
                    candidate = currentCandidate,
                    onCardClick = { onCardClick(currentCandidate) },
                    onLikeClick = { onLikeClick(currentCandidate) },
                    onPassClick = { onPassClick(currentCandidate) },
                    onCheckCompatibilityClick = { onCheckCompatibility(currentCandidate) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .padding(bottom = 10.dp)
                )

                // Astro AI Insight Card Banner below the card
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = colors.indigoBg,
                    border = androidx.compose.foundation.BorderStroke(1.dp, colors.indigoBorder),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                        .clickable { onCheckCompatibility(currentCandidate) }
                        .testTag("feed_astro_insight_banner")
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Glowing Sparkle Icon Container
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(Indigo500.copy(alpha = 0.25f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = colors.indigo,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "ASTRO AI INSIGHT",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                color = colors.indigoText
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Your charts show high emotional resonance with ${currentCandidate.name}.",
                                fontSize = 12.sp,
                                color = colors.textSecondary,
                                maxLines = 1
                            )
                        }

                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = "View Insight",
                            tint = colors.indigo,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = colors.primary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "You've viewed all candidates for today!",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.textPrimary
                        )
                        Text(
                            text = "Check back soon as new verified profiles align.",
                            fontSize = 13.sp,
                            color = colors.textSecondary
                        )
                    }
                }
            }
        }
    }
}
