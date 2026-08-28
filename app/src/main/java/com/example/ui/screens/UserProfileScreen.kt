package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.Brightness4
import androidx.compose.material.icons.filled.Brightness6
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.UserProfile
import com.example.data.models.VerificationType
import com.example.ui.components.AstraBottomNavigationBar
import com.example.ui.components.AstraTab
import com.example.ui.components.CandidateAvatar
import com.example.ui.components.VerificationCardItem
import com.example.ui.theme.AstraTheme
import com.example.ui.theme.ThemeMode

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun UserProfileScreen(
    userProfile: UserProfile,
    onEditProfile: () -> Unit,
    onEditAstrology: () -> Unit,
    onVerificationClick: (VerificationType) -> Unit,
    onStartPoliceVerification: () -> Unit,
    currentThemeMode: ThemeMode = ThemeMode.DARK,
    onThemeModeSelected: (ThemeMode) -> Unit = {},
    currentTab: AstraTab = AstraTab.PROFILE,
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
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 12.dp)
        ) {
            // Header Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Profile",
                    style = androidx.compose.ui.text.TextStyle(
                        fontFamily = FontFamily.SansSerif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 28.sp,
                        color = colors.textPrimary
                    )
                )

                IconButton(
                    onClick = onEditProfile,
                    modifier = Modifier.testTag("user_profile_edit_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit Profile",
                        tint = colors.textPrimary,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // User Avatar & Main Info
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                CandidateAvatar(
                    name = userProfile.name,
                    photoUrl = userProfile.photoUrl,
                    size = 72.dp,
                    borderWidth = 2.5.dp,
                    borderColor = colors.primary,
                    gradientStart = 0xFF1E293B,
                    gradientEnd = 0xFF0F172A
                )

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        text = "${userProfile.name}, ${userProfile.age}",
                        style = androidx.compose.ui.text.TextStyle(
                            fontFamily = FontFamily.SansSerif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 22.sp,
                            color = colors.textPrimary
                        )
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "${userProfile.profession} · ${userProfile.location}",
                        fontSize = 13.sp,
                        color = colors.textSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Appearance & Theme Mode Section
            Text(
                text = "APPEARANCE & THEME",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(10.dp))

            Surface(
                shape = RoundedCornerShape(18.dp),
                color = colors.card,
                border = BorderStroke(1.dp, colors.border),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("theme_selection_card")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Palette,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "App Theme",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.textPrimary
                            )
                        }

                        Text(
                            text = currentThemeMode.title,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = colors.primary
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        ThemeOptionChip(
                            title = "Dark",
                            icon = Icons.Default.DarkMode,
                            isSelected = currentThemeMode == ThemeMode.DARK,
                            onClick = { onThemeModeSelected(ThemeMode.DARK) },
                            modifier = Modifier.weight(1f).testTag("theme_dark_button")
                        )

                        ThemeOptionChip(
                            title = "Light",
                            icon = Icons.Default.LightMode,
                            isSelected = currentThemeMode == ThemeMode.LIGHT,
                            onClick = { onThemeModeSelected(ThemeMode.LIGHT) },
                            modifier = Modifier.weight(1f).testTag("theme_light_button")
                        )

                        ThemeOptionChip(
                            title = "System",
                            icon = Icons.Default.PhoneAndroid,
                            isSelected = currentThemeMode == ThemeMode.SYSTEM,
                            onClick = { onThemeModeSelected(ThemeMode.SYSTEM) },
                            modifier = Modifier.weight(1f).testTag("theme_system_button")
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Profile Completion Card
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = colors.card,
                border = BorderStroke(1.dp, colors.border),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "PROFILE COMPLETION",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            color = colors.textSecondary
                        )
                        Text(
                            text = if (userProfile.policeVerified) "100%" else "${userProfile.completionPercentage}%",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    LinearProgressIndicator(
                        progress = { if (userProfile.policeVerified) 1.0f else (userProfile.completionPercentage / 100f) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = colors.primaryVariant,
                        trackColor = colors.divider
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = if (userProfile.policeVerified)
                            "✨ All verifications complete! Your profile is prioritized in discovery."
                        else
                            "Complete your police verification to reach 100% and unlock 3x more match recommendations.",
                        fontSize = 12.sp,
                        color = colors.textSecondary,
                        lineHeight = 16.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(22.dp))

            // Astrology Profile Section
            Text(
                text = "ASTROLOGY PROFILE",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(10.dp))

            Surface(
                shape = RoundedCornerShape(18.dp),
                color = colors.indigoBg,
                border = BorderStroke(1.dp, colors.indigoBorder),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onEditAstrology)
                    .testTag("user_astrology_card")
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = colors.primary,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "${userProfile.nakshatra} Nakshatra",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "${userProfile.rashi} · Born on ${userProfile.dateOfBirth} at ${userProfile.birthTime}",
                        fontSize = 13.sp,
                        color = colors.textSecondary
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Edit Birth Details & Chart",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.primary
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = colors.primary,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(22.dp))

            // Trust & Verification
            Text(
                text = "TRUST & VERIFICATION",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(10.dp))

            VerificationCardItem(
                type = VerificationType.EDUCATION,
                title = "Education",
                subtitle = userProfile.education,
                isVerified = userProfile.educationVerified,
                onClick = { onVerificationClick(VerificationType.EDUCATION) }
            )

            Spacer(modifier = Modifier.height(10.dp))

            VerificationCardItem(
                type = VerificationType.POLICE,
                title = "Police Verification",
                subtitle = if (userProfile.policeVerified) "Background Record Verified ✓" else "Not verified",
                isVerified = userProfile.policeVerified,
                onClick = { onVerificationClick(VerificationType.POLICE) },
                onActionClick = if (!userProfile.policeVerified) onStartPoliceVerification else null
            )

            Spacer(modifier = Modifier.height(10.dp))

            VerificationCardItem(
                type = VerificationType.CREDIT,
                title = "Credit Profile",
                subtitle = "Credit Health Verified · Experian Score 780+",
                isVerified = userProfile.creditVerified,
                onClick = { onVerificationClick(VerificationType.CREDIT) }
            )

            Spacer(modifier = Modifier.height(22.dp))

            // About Me
            Text(
                text = "ABOUT ME",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = userProfile.bio,
                fontSize = 14.sp,
                color = colors.textPrimary,
                lineHeight = 21.sp
            )

            Spacer(modifier = Modifier.height(18.dp))

            // Interests
            Text(
                text = "MY INTERESTS",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(8.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                userProfile.interests.forEach { interest ->
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = colors.card,
                        border = BorderStroke(1.dp, colors.border),
                        modifier = Modifier.padding(vertical = 2.dp)
                    ) {
                        Text(
                            text = interest,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = colors.textPrimary,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}

@Composable
private fun ThemeOptionChip(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors

    val bg = if (isSelected) colors.primaryContainer else colors.cardHighlight
    val borderColor = if (isSelected) colors.primary else colors.border
    val contentColor = if (isSelected) colors.primary else colors.textSecondary

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = bg,
        border = BorderStroke(if (isSelected) 1.5.dp else 1.dp, borderColor),
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 10.dp, horizontal = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = contentColor,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = contentColor
            )
        }
    }
}
