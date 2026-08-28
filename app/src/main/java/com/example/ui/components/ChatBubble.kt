package com.example.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.ChatMessage
import com.example.ui.theme.AstraTheme
import kotlinx.coroutines.delay

@Composable
fun ChatBubble(
    message: ChatMessage,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors
    val isUser = message.isFromUser

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(
                    RoundedCornerShape(
                        topStart = 18.dp,
                        topEnd = 18.dp,
                        bottomStart = if (isUser) 18.dp else 4.dp,
                        bottomEnd = if (isUser) 4.dp else 18.dp
                    )
                )
                .background(if (isUser) colors.primary else colors.card)
                .border(
                    width = 1.dp,
                    color = if (isUser) colors.primaryVariant else colors.border,
                    shape = RoundedCornerShape(
                        topStart = 18.dp,
                        topEnd = 18.dp,
                        bottomStart = if (isUser) 18.dp else 4.dp,
                        bottomEnd = if (isUser) 4.dp else 18.dp
                    )
                )
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Text(
                text = message.message,
                color = if (isUser) colors.onPrimary else colors.textPrimary,
                fontSize = 14.sp,
                lineHeight = 20.sp,
                fontWeight = if (isUser) FontWeight.Medium else FontWeight.Normal
            )
        }

        Spacer(modifier = Modifier.height(2.dp))

        Text(
            text = message.timestamp,
            fontSize = 10.sp,
            color = colors.textTertiary,
            modifier = Modifier.padding(horizontal = 4.dp)
        )
    }
}

@Composable
fun TypingIndicator(
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors
    val dot1Offset = remember { Animatable(0f) }
    val dot2Offset = remember { Animatable(0f) }
    val dot3Offset = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        val spec = infiniteRepeatable<Float>(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        )
        dot1Offset.animateTo(-6f, spec)
    }
    LaunchedEffect(Unit) {
        delay(150)
        val spec = infiniteRepeatable<Float>(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        )
        dot2Offset.animateTo(-6f, spec)
    }
    LaunchedEffect(Unit) {
        delay(300)
        val spec = infiniteRepeatable<Float>(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        )
        dot3Offset.animateTo(-6f, spec)
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(colors.card)
            .border(1.dp, colors.border, RoundedCornerShape(16.dp))
            .padding(horizontal = 14.dp, vertical = 12.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .offset(y = dot1Offset.value.dp)
                    .size(7.dp)
                    .clip(CircleShape)
                    .background(colors.primary)
            )
            Box(
                modifier = Modifier
                    .offset(y = dot2Offset.value.dp)
                    .size(7.dp)
                    .clip(CircleShape)
                    .background(colors.primary.copy(alpha = 0.8f))
            )
            Box(
                modifier = Modifier
                    .offset(y = dot3Offset.value.dp)
                    .size(7.dp)
                    .clip(CircleShape)
                    .background(colors.primary.copy(alpha = 0.6f))
            )
        }
    }
}
