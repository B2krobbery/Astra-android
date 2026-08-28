package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AstraTheme
import com.example.ui.theme.Indigo500

@Composable
fun CelestialEmblem(
    modifier: Modifier = Modifier,
    size: Int = 140
) {
    val colors = AstraTheme.colors

    Box(
        modifier = modifier.size(size.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size.dp)) {
            val center = Offset(this.size.width / 2f, this.size.height / 2f)
            val radius = this.size.width / 2f

            // Orbit rings
            drawCircle(
                color = colors.textPrimary.copy(alpha = 0.10f),
                radius = radius * 0.72f,
                center = center,
                style = Stroke(width = 1.5.dp.toPx())
            )
            drawCircle(
                color = colors.primary.copy(alpha = 0.25f),
                radius = radius * 0.90f,
                center = center,
                style = Stroke(width = 1.dp.toPx())
            )

            // 4-Pointed Star geometry
            val starPath = Path().apply {
                val cx = center.x
                val cy = center.y
                val rMax = radius * 0.95f
                val rMin = radius * 0.30f

                moveTo(cx, cy - rMax)
                cubicTo(cx + rMin * 0.3f, cy - rMin * 0.3f, cx + rMin * 0.3f, cy - rMin * 0.3f, cx + rMax, cy)
                cubicTo(cx + rMin * 0.3f, cy + rMin * 0.3f, cx + rMin * 0.3f, cy + rMin * 0.3f, cx, cy + rMax)
                cubicTo(cx - rMin * 0.3f, cy + rMin * 0.3f, cx - rMin * 0.3f, cy + rMin * 0.3f, cx - rMax, cy)
                cubicTo(cx - rMin * 0.3f, cy - rMin * 0.3f, cx - rMin * 0.3f, cy - rMin * 0.3f, cx, cy - rMax)
                close()
            }

            drawPath(
                path = starPath,
                brush = Brush.radialGradient(
                    colors = listOf(colors.primary.copy(alpha = 0.4f), colors.textPrimary.copy(alpha = 0.05f)),
                    center = center,
                    radius = radius
                )
            )
        }

        // Center circular badge with glowing sparkle
        Box(
            modifier = Modifier
                .size((size * 0.36).dp)
                .background(
                    Brush.linearGradient(
                        colors = listOf(Indigo500, colors.primary)
                    ),
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = "Astra Sparkle",
                tint = colors.onPrimary,
                modifier = Modifier.size((size * 0.20).dp)
            )
        }
    }
}

@Composable
fun AstraBrandHeader(
    modifier: Modifier = Modifier,
    title: String = "ASTRA",
    tagline: String = "Where stars align"
) {
    val colors = AstraTheme.colors

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        CelestialEmblem(size = 130)

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = title,
            style = androidx.compose.ui.text.TextStyle(
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Bold,
                fontSize = 24.sp,
                letterSpacing = 4.sp,
                color = colors.textPrimary
            )
        )

        Spacer(modifier = Modifier.height(6.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .width(28.dp)
                    .height(1.dp)
                    .background(colors.border)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = tagline.uppercase(),
                style = androidx.compose.ui.text.TextStyle(
                    fontFamily = FontFamily.SansSerif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    letterSpacing = 2.sp,
                    color = colors.primary
                )
            )
            Spacer(modifier = Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .width(28.dp)
                    .height(1.dp)
                    .background(colors.border)
            )
        }
    }
}
