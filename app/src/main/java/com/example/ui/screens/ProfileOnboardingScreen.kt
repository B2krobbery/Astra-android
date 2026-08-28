package com.example.ui.screens

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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.UserProfile
import com.example.ui.components.AstraChip
import com.example.ui.components.AstraPrimaryButton
import com.example.ui.theme.AstraTheme

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProfileOnboardingScreen(
    initialProfile: UserProfile,
    onBack: () -> Unit,
    onSkip: () -> Unit,
    onContinue: (profession: String, education: String, city: String, lookingFor: List<String>, interests: List<String>) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors
    var profession by remember { mutableStateOf(initialProfile.profession) }
    var education by remember { mutableStateOf(initialProfile.education) }
    var city by remember { mutableStateOf(initialProfile.location) }

    val lookingForOptions = listOf(
        "Long-term partner",
        "Marriage / Matrimony",
        "Meaningful connection",
        "Open to explore"
    )
    var selectedLookingFor by remember {
        mutableStateOf(initialProfile.lookingFor.toSet().ifEmpty { setOf("Long-term partner") })
    }

    val interestOptions = listOf(
        "Tech", "Star Gazing", "Filter Coffee", "Hiking",
        "Vinyl Records", "Modern Architecture", "Classical Music", "Yoga",
        "Vedic Philosophy", "Photography", "Books"
    )
    var selectedInterests by remember {
        mutableStateOf(initialProfile.interests.toSet().ifEmpty { setOf("Tech", "Star Gazing", "Filter Coffee") })
    }

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
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Top Navigation Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.testTag("onboarding_back_button")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = colors.textPrimary
                    )
                }

                Text(
                    text = "STEP 2 OF 4",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp,
                    color = colors.primary
                )

                Text(
                    text = "Skip",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = colors.textSecondary,
                    modifier = Modifier
                        .clickable(onClick = onSkip)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                        .testTag("onboarding_skip_button")
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Headline
            Text(
                text = "Tell us about yourself",
                style = androidx.compose.ui.text.TextStyle(
                    fontFamily = FontFamily.SansSerif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 28.sp,
                    lineHeight = 34.sp,
                    color = colors.textPrimary
                )
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "This helps us find matches who align with your life and values.",
                fontSize = 14.sp,
                color = colors.textSecondary,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Form Inputs
            Text(
                text = "PROFESSION",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = profession,
                onValueChange = { profession = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("input_profession"),
                shape = RoundedCornerShape(14.dp),
                placeholder = { Text("e.g. Software Engineer, Google", color = colors.textTertiary, fontSize = 14.sp) },
                leadingIcon = {
                    Icon(Icons.Default.Work, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = colors.card,
                    unfocusedContainerColor = colors.card,
                    focusedBorderColor = colors.primary,
                    unfocusedBorderColor = colors.border,
                    focusedTextColor = colors.textPrimary,
                    unfocusedTextColor = colors.textPrimary
                ),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
            )

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "EDUCATION",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = education,
                onValueChange = { education = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("input_education"),
                shape = RoundedCornerShape(14.dp),
                placeholder = { Text("e.g. IIT Bombay · B.Tech", color = colors.textTertiary, fontSize = 14.sp) },
                leadingIcon = {
                    Icon(Icons.Default.School, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = colors.card,
                    unfocusedContainerColor = colors.card,
                    focusedBorderColor = colors.primary,
                    unfocusedBorderColor = colors.border,
                    focusedTextColor = colors.textPrimary,
                    unfocusedTextColor = colors.textPrimary
                ),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
            )

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "CITY / CURRENT LOCATION",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = city,
                onValueChange = { city = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("input_city"),
                shape = RoundedCornerShape(14.dp),
                placeholder = { Text("e.g. Bengaluru, Indiranagar", color = colors.textTertiary, fontSize = 14.sp) },
                leadingIcon = {
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = colors.card,
                    unfocusedContainerColor = colors.card,
                    focusedBorderColor = colors.primary,
                    unfocusedBorderColor = colors.border,
                    focusedTextColor = colors.textPrimary,
                    unfocusedTextColor = colors.textPrimary
                ),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done)
            )

            Spacer(modifier = Modifier.height(26.dp))

            // Looking For Section
            Text(
                text = "LOOKING FOR",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(10.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                lookingForOptions.forEach { option ->
                    val isSelected = option in selectedLookingFor
                    AstraChip(
                        text = option,
                        isSelected = isSelected,
                        onToggle = {
                            selectedLookingFor = if (isSelected) {
                                if (selectedLookingFor.size > 1) selectedLookingFor - option else selectedLookingFor
                            } else {
                                selectedLookingFor + option
                            }
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(26.dp))

            // Interests Section
            Text(
                text = "INTERESTS & PASSIONS",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = colors.textSecondary
            )
            Spacer(modifier = Modifier.height(10.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                interestOptions.forEach { interest ->
                    val isSelected = interest in selectedInterests
                    AstraChip(
                        text = interest,
                        isSelected = isSelected,
                        onToggle = {
                            selectedInterests = if (isSelected) {
                                selectedInterests - interest
                            } else {
                                selectedInterests + interest
                            }
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            // Continue Button
            AstraPrimaryButton(
                text = "Continue",
                onClick = {
                    onContinue(
                        profession,
                        education,
                        city,
                        selectedLookingFor.toList(),
                        selectedInterests.toList()
                    )
                },
                testTag = "onboarding_continue_button"
            )

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
