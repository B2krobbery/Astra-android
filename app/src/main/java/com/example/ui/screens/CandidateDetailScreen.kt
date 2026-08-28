package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.data.models.Candidate
import com.example.data.models.VerificationType
import com.example.ui.components.ActionCircleButton
import com.example.ui.components.AstraPrimaryButton
import com.example.ui.components.SleekGlassPill
import com.example.ui.components.VerificationCardItem
import com.example.ui.theme.Amber500
import com.example.ui.theme.AstraTheme

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CandidateDetailScreen(
    candidate: Candidate,
    onBack: () -> Unit,
    onLike: (Candidate) -> Unit,
    onPass: (Candidate) -> Unit,
    onCheckCompatibility: (Candidate) -> Unit,
    onVerificationClick: (VerificationType, Candidate) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 120.dp)
        ) {
            // Hero Photo Section with Top Navigation
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(420.dp)
            ) {
                if (candidate.photoUrls.isNotEmpty()) {
                    AsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data(candidate.photoUrls.first())
                            .crossfade(true)
                            .build(),
                        contentDescription = candidate.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.linearGradient(
                                    listOf(Color(candidate.avatarGradientStart), Color(candidate.avatarGradientEnd))
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = candidate.name.take(1),
                            fontSize = 80.sp,
                            color = Color.White,
                            fontFamily = FontFamily.SansSerif
                        )
                    }
                }

                // Gradient Vignette overlay for smooth transition into background
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Black.copy(alpha = 0.5f),
                                    Color.Transparent,
                                    colors.background.copy(alpha = 0.8f),
                                    colors.background
                                )
                            )
                        )
                )

                // Top Controls
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.6f))
                            .border(1.dp, Color.White.copy(alpha = 0.15f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        IconButton(
                            onClick = onBack,
                            modifier = Modifier.testTag("detail_back_button")
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.6f))
                            .border(1.dp, Color.White.copy(alpha = 0.15f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        IconButton(
                            onClick = { /* More */ },
                            modifier = Modifier.testTag("detail_more_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = "More",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }

            // Candidate Information Container
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                // Name, Age & Verified
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${candidate.name}, ${candidate.age}",
                        style = androidx.compose.ui.text.TextStyle(
                            fontFamily = FontFamily.SansSerif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 28.sp,
                            color = colors.textPrimary
                        )
                    )
                    if (candidate.isVerified) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Verified Profile",
                            tint = colors.verifiedBlue,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "${candidate.profession} · ${candidate.location}",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Normal,
                    color = colors.textSecondary
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Astrology Compatibility Banner Card
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = colors.indigoBg,
                    border = BorderStroke(1.dp, colors.indigoBorder),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onCheckCompatibility(candidate) }
                        .testTag("detail_compatibility_banner")
                ) {
                    Row(
                        modifier = Modifier.padding(18.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(Amber500),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${candidate.compatibilityScore}%",
                                color = Color(0xFF0B0D11),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.AutoAwesome,
                                    contentDescription = null,
                                    tint = colors.primary,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "ASTROLOGY COMPATIBILITY",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primary,
                                    letterSpacing = 1.sp
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "${candidate.nakshatra} & your Nakshatra in harmony · Guna Milan 29/36",
                                fontSize = 13.sp,
                                color = colors.textSecondary,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // About Section
                Text(
                    text = "ABOUT",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp,
                    color = colors.textSecondary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = candidate.bio,
                    fontSize = 14.sp,
                    color = colors.textPrimary,
                    lineHeight = 22.sp
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Interests Section
                Text(
                    text = "INTERESTS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp,
                    color = colors.textSecondary
                )
                Spacer(modifier = Modifier.height(10.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    candidate.interests.forEach { interest ->
                        SleekGlassPill(text = interest)
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))

                // Trust & Verification Section
                Text(
                    text = "TRUST & VERIFICATION",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp,
                    color = colors.textSecondary
                )
                Spacer(modifier = Modifier.height(12.dp))

                VerificationCardItem(
                    type = VerificationType.EDUCATION,
                    title = "Education",
                    subtitle = candidate.educationDetails,
                    isVerified = candidate.educationVerified,
                    onClick = { onVerificationClick(VerificationType.EDUCATION, candidate) }
                )

                Spacer(modifier = Modifier.height(10.dp))

                VerificationCardItem(
                    type = VerificationType.POLICE,
                    title = "Police Verification",
                    subtitle = candidate.policeDetails,
                    isVerified = candidate.policeVerified,
                    onClick = { onVerificationClick(VerificationType.POLICE, candidate) }
                )

                Spacer(modifier = Modifier.height(10.dp))

                VerificationCardItem(
                    type = VerificationType.CREDIT,
                    title = "Credit Profile",
                    subtitle = candidate.creditDetails,
                    isVerified = candidate.creditVerified,
                    onClick = { onVerificationClick(VerificationType.CREDIT, candidate) }
                )
            }
        }

        // Floating Bottom Actions
        Surface(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .navigationBarsPadding(),
            color = colors.background.copy(alpha = 0.95f),
            shadowElevation = 8.dp
        ) {
            Column {
                HorizontalDivider(thickness = 0.8.dp, color = colors.divider)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ActionCircleButton(
                        icon = Icons.Default.Close,
                        onClick = { onPass(candidate) },
                        size = 52.dp,
                        iconSize = 22.dp,
                        containerColor = colors.circleActionBg,
                        iconTint = colors.textPrimary,
                        borderColor = colors.circleActionBorder,
                        elevation = 0.dp,
                        contentDescription = "Pass",
                        testTag = "detail_action_pass"
                    )

                    Spacer(modifier = Modifier.width(14.dp))

                    AstraPrimaryButton(
                        text = "Connect with ${candidate.name}",
                        onClick = { onLike(candidate) },
                        icon = Icons.Default.Favorite,
                        modifier = Modifier.weight(1f),
                        testTag = "detail_connect_button"
                    )
                }
            }
        }
    }
}
