package com.example.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.AstrologyCompatibility
import com.example.ui.theme.AstraTheme
import com.example.ui.theme.Indigo500

@Composable
fun VedicMetricProgressBar(
    title: String,
    score: Int,
    barColor: Color,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors
    val progress = remember { Animatable(0f) }

    LaunchedEffect(score) {
        progress.animateTo(
            targetValue = score / 100f,
            animationSpec = tween(durationMillis = 900, easing = FastOutSlowInEasing)
        )
    }

    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = colors.textPrimary
            )
            Text(
                text = "$score%",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = barColor
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(colors.divider)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction = progress.value)
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(barColor)
            )
        }
    }
}

@Composable
fun VedicMetricsCard(
    compatibility: AstrologyCompatibility,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors

    Surface(
        shape = RoundedCornerShape(24.dp),
        color = colors.card,
        border = BorderStroke(1.dp, colors.border),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(22.dp)
        ) {
            Text(
                text = "Vedic Metrics",
                style = androidx.compose.ui.text.TextStyle(
                    fontFamily = FontFamily.SansSerif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = colors.textPrimary
                )
            )

            Spacer(modifier = Modifier.height(18.dp))

            VedicMetricProgressBar(
                title = "Emotional Compatibility",
                score = compatibility.emotionalScore,
                barColor = colors.metricEmotional
            )

            Spacer(modifier = Modifier.height(16.dp))

            VedicMetricProgressBar(
                title = "Nakshatra Compatibility",
                score = compatibility.nakshatraScore,
                barColor = colors.metricNakshatra
            )

            Spacer(modifier = Modifier.height(16.dp))

            VedicMetricProgressBar(
                title = "Rashi Compatibility",
                score = compatibility.rashiScore,
                barColor = colors.metricRashi
            )

            Spacer(modifier = Modifier.height(16.dp))

            VedicMetricProgressBar(
                title = "Overall Harmony",
                score = compatibility.overallHarmonyScore,
                barColor = colors.metricHarmony
            )

            Spacer(modifier = Modifier.height(20.dp))

            HorizontalDivider(
                thickness = 0.8.dp,
                color = colors.divider
            )

            Spacer(modifier = Modifier.height(18.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = colors.primary,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = compatibility.reasonTitle,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = compatibility.reasonDescription,
                fontSize = 13.sp,
                color = colors.textSecondary,
                lineHeight = 20.sp
            )
        }
    }
}

@Composable
fun CelestialAnalyzingView(
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors
    val infiniteTransition = rememberInfiniteTransition(label = "celestial_spin")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "spin_angle"
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier.size(120.dp),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.size(120.dp).rotate(rotation)) {
                val center = Offset(size.width / 2, size.height / 2)
                drawCircle(
                    color = colors.primary.copy(alpha = 0.4f),
                    radius = 48.dp.toPx(),
                    center = center,
                    style = Stroke(width = 1.5.dp.toPx())
                )
                drawCircle(
                    color = Indigo500.copy(alpha = 0.6f),
                    radius = 32.dp.toPx(),
                    center = center,
                    style = Stroke(width = 2.dp.toPx())
                )
            }

            Icon(
                imageVector = Icons.Default.Star,
                contentDescription = null,
                tint = colors.primary,
                modifier = Modifier.size(36.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Analyzing your charts...",
            style = androidx.compose.ui.text.TextStyle(
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = colors.textPrimary
            )
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Harmonizing Vedic Gunas & Nakshatra alignments",
            fontSize = 13.sp,
            color = colors.textSecondary
        )
    }
}
