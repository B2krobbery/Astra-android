package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.ui.theme.GoldAccent
import com.example.ui.theme.PrimaryWine

@Composable
fun CandidateAvatar(
    name: String,
    photoUrl: String,
    modifier: Modifier = Modifier,
    size: Dp = 56.dp,
    borderWidth: Dp = 1.5.dp,
    borderColor: Color = GoldAccent.copy(alpha = 0.5f),
    gradientStart: Long = 0xFF5C1D2E,
    gradientEnd: Long = 0xFFC59B27
) {
    val initial = name.take(1).uppercase()

    Box(
        modifier = modifier
            .size(size)
            .border(borderWidth, borderColor, CircleShape)
            .clip(CircleShape)
            .background(
                Brush.linearGradient(
                    colors = listOf(Color(gradientStart), Color(gradientEnd))
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        if (photoUrl.isNotBlank()) {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data(photoUrl)
                    .crossfade(true)
                    .build(),
                contentDescription = name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        } else {
            Text(
                text = initial,
                color = Color.White,
                fontSize = (size.value * 0.42).sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Serif
            )
        }
    }
}
