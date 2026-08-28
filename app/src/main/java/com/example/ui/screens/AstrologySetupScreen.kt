package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.UserProfile
import com.example.ui.components.AstraPrimaryButton
import com.example.ui.theme.AstraTheme

@Composable
fun AstrologySetupScreen(
    userProfile: UserProfile,
    onBack: () -> Unit,
    onSkip: () -> Unit,
    onCalculate: (dob: String, time: String, city: String) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors
    var dob by remember { mutableStateOf(userProfile.dateOfBirth.ifEmpty { "14 July 1998" }) }
    var time by remember { mutableStateOf(userProfile.birthTime.ifEmpty { "08:45 AM" }) }
    var city by remember { mutableStateOf(userProfile.birthCity.ifEmpty { "Bengaluru, Karnataka" }) }

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
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top App Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.testTag("astro_setup_back_button")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = colors.textPrimary
                    )
                }

                Text(
                    text = "STEP 3 OF 4",
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
                        .testTag("astro_setup_skip_button")
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Celestial Astrology Graphic
            Box(
                modifier = Modifier
                    .size(110.dp)
                    .clip(CircleShape)
                    .background(if (colors.isDark) Color(0xFF161922) else colors.cardHighlight),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.size(100.dp)) {
                    val center = Offset(size.width / 2, size.height / 2)
                    drawCircle(
                        color = colors.primary.copy(alpha = 0.4f),
                        radius = 40.dp.toPx(),
                        center = center,
                        style = Stroke(width = 1.dp.toPx())
                    )
                    drawCircle(
                        color = colors.indigo.copy(alpha = 0.6f),
                        radius = 28.dp.toPx(),
                        center = center,
                        style = Stroke(width = 1.5.dp.toPx())
                    )
                }
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = colors.primary,
                    modifier = Modifier.size(38.dp)
                )
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Headline
            Text(
                text = "Want to see if your stars align?",
                style = androidx.compose.ui.text.TextStyle(
                    fontFamily = FontFamily.SansSerif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp,
                    lineHeight = 30.sp,
                    color = colors.textPrimary,
                    textAlign = TextAlign.Center
                )
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Enter your birth details for Vedic astrology compatibility. All details are kept strictly private.",
                fontSize = 13.sp,
                color = colors.textSecondary,
                lineHeight = 19.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 10.dp)
            )

            Spacer(modifier = Modifier.height(26.dp))

            // Date of Birth
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "DATE OF BIRTH",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = colors.textSecondary
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = dob,
                    onValueChange = { dob = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_dob"),
                    shape = RoundedCornerShape(14.dp),
                    placeholder = { Text("DD Month YYYY (e.g. 14 July 1998)", color = colors.textTertiary, fontSize = 14.sp) },
                    leadingIcon = {
                        Icon(Icons.Default.CalendarToday, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
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
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Time of Birth
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "TIME OF BIRTH",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = colors.textSecondary
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = time,
                    onValueChange = { time = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_time"),
                    shape = RoundedCornerShape(14.dp),
                    placeholder = { Text("HH:MM AM/PM (e.g. 08:45 AM)", color = colors.textTertiary, fontSize = 14.sp) },
                    leadingIcon = {
                        Icon(Icons.Default.AccessTime, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
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
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Place of Birth
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "PLACE OF BIRTH",
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
                        .testTag("input_birth_city"),
                    shape = RoundedCornerShape(14.dp),
                    placeholder = { Text("City, State (e.g. Bengaluru, Karnataka)", color = colors.textTertiary, fontSize = 14.sp) },
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
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Informational Note
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = colors.indigoBg,
                border = BorderStroke(1.dp, colors.indigoBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = colors.indigoText,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Accurate birth time helps generate your true Kundali, Nakshatra, and Guna Milan scores.",
                        fontSize = 12.sp,
                        color = colors.textSecondary,
                        lineHeight = 16.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Primary Action
            AstraPrimaryButton(
                text = "Calculate My Astrology Profile",
                onClick = { onCalculate(dob, time, city) },
                icon = Icons.Default.Star,
                testTag = "calculate_astrology_button"
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Skip for now",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = colors.textSecondary,
                modifier = Modifier
                    .clickable(onClick = onSkip)
                    .padding(8.dp)
                    .testTag("astro_skip_text_button")
            )

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
