package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.Candidate
import com.example.data.models.MatchConversation
import com.example.ui.components.AstraBottomNavigationBar
import com.example.ui.components.AstraTab
import com.example.ui.components.CandidateAvatar
import com.example.ui.theme.AstraTheme

@Composable
fun MatchesConversationsScreen(
    conversations: List<MatchConversation>,
    newMatches: List<Candidate>,
    onSelectConversation: (MatchConversation) -> Unit,
    onSelectNewMatch: (Candidate) -> Unit,
    onOpenAstroAi: () -> Unit,
    currentTab: AstraTab = AstraTab.MATCHES,
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
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Matches",
                    style = androidx.compose.ui.text.TextStyle(
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 28.sp,
                        color = colors.textPrimary
                    )
                )

                IconButton(
                    onClick = { /* Search */ },
                    modifier = Modifier.testTag("matches_search_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search Matches",
                        tint = colors.textPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize()
            ) {
                // Section 1: NEW MATCHES
                item {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "NEW MATCHES (${newMatches.size})",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            color = colors.textSecondary,
                            modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                        )

                        LazyRow(
                            modifier = Modifier.fillMaxWidth(),
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            items(newMatches) { candidate ->
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(12.dp))
                                        .clickable { onSelectNewMatch(candidate) }
                                        .padding(4.dp)
                                        .testTag("new_match_${candidate.id}")
                                ) {
                                    Box(contentAlignment = Alignment.BottomCenter) {
                                        CandidateAvatar(
                                            name = candidate.name,
                                            photoUrl = candidate.photoUrls.firstOrNull().orEmpty(),
                                            size = 64.dp,
                                            borderWidth = 2.dp,
                                            borderColor = colors.primary,
                                            gradientStart = candidate.avatarGradientStart,
                                            gradientEnd = candidate.avatarGradientEnd
                                        )

                                        // Compatibility Pill Badge
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = colors.primary,
                                            modifier = Modifier.padding(bottom = 0.dp)
                                        ) {
                                            Text(
                                                text = "${candidate.compatibilityScore}%",
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = colors.onPrimary,
                                                modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))

                                    Text(
                                        text = candidate.name,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = colors.textPrimary
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                    }
                }

                // Section 2: Astro AI Assistant Banner Card
                item {
                    Surface(
                        shape = RoundedCornerShape(18.dp),
                        color = colors.indigoBg,
                        border = BorderStroke(1.dp, colors.indigoBorder),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 6.dp)
                            .clickable(onClick = onOpenAstroAi)
                            .testTag("matches_astro_ai_card")
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(CircleShape)
                                    .background(colors.primary),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AutoAwesome,
                                    contentDescription = null,
                                    tint = colors.onPrimary,
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(14.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Ask Astro AI",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Get Vedic astrology insights about your matches & connections",
                                    fontSize = 12.sp,
                                    color = colors.textSecondary,
                                    lineHeight = 16.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Section 3: MESSAGES
                item {
                    Text(
                        text = "MESSAGES",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        color = colors.textSecondary,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 4.dp)
                    )
                }

                items(conversations) { convo ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectConversation(convo) }
                            .padding(horizontal = 20.dp, vertical = 12.dp)
                            .testTag("conversation_row_${convo.candidate.id}"),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CandidateAvatar(
                            name = convo.candidate.name,
                            photoUrl = convo.candidate.photoUrls.firstOrNull().orEmpty(),
                            size = 54.dp,
                            borderWidth = 1.5.dp,
                            borderColor = colors.border,
                            gradientStart = convo.candidate.avatarGradientStart,
                            gradientEnd = convo.candidate.avatarGradientEnd
                        )

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = convo.candidate.name,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = colors.textPrimary
                                )
                                Text(
                                    text = convo.timestamp,
                                    fontSize = 11.sp,
                                    color = colors.textTertiary
                                )
                            }

                            Spacer(modifier = Modifier.height(3.dp))

                            Text(
                                text = convo.lastMessage,
                                fontSize = 13.sp,
                                color = if (convo.unreadCount > 0) colors.textPrimary else colors.textSecondary,
                                fontWeight = if (convo.unreadCount > 0) FontWeight.Medium else FontWeight.Normal,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }

                        if (convo.unreadCount > 0) {
                            Spacer(modifier = Modifier.width(8.dp))
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(colors.primary)
                            )
                        }
                    }

                    HorizontalDivider(
                        thickness = 0.5.dp,
                        color = colors.divider,
                        modifier = Modifier.padding(start = 88.dp, end = 20.dp)
                    )
                }

                item {
                    Spacer(modifier = Modifier.height(30.dp))
                }
            }
        }
    }
}
