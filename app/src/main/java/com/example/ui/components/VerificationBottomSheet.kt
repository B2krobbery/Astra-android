package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
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
import com.example.data.models.VerificationDetail
import com.example.data.models.VerificationType
import com.example.ui.theme.AstraTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VerificationBottomSheet(
    detail: VerificationDetail,
    onDismiss: () -> Unit,
    onVerifyAction: (() -> Unit)? = null
) {
    val colors = AstraTheme.colors
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = colors.background,
        shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
        dragHandle = null
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
                .testTag("verification_modal")
        ) {
            // Header Row with Close
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val icon = when (detail.type) {
                        VerificationType.EDUCATION -> Icons.Default.School
                        VerificationType.POLICE -> Icons.Default.Security
                        VerificationType.CREDIT -> Icons.Default.CreditCard
                    }
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(if (colors.isDark) Color(0xFF1E293B) else colors.cardHighlight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = detail.title,
                            tint = colors.primary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = detail.title.uppercase(),
                        style = androidx.compose.ui.text.TextStyle(
                            fontFamily = FontFamily.SansSerif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            letterSpacing = 1.sp,
                            color = colors.textPrimary
                        )
                    )
                }

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = colors.textSecondary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Verified Status Banner
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = if (detail.isVerified) colors.verifiedGreenBg else if (colors.isDark) Color(0xFF332005) else Color(0xFFFEF3C7),
                border = BorderStroke(1.dp, if (detail.isVerified) colors.verifiedGreen.copy(alpha = 0.3f) else colors.primary.copy(alpha = 0.3f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (detail.isVerified) Icons.Default.Verified else Icons.Default.Security,
                        contentDescription = null,
                        tint = if (detail.isVerified) colors.verifiedGreen else colors.primary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = if (detail.isVerified) "VERIFIED RECORD" else "NOT YET VERIFIED",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (detail.isVerified) colors.verifiedGreen else colors.primary,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            text = detail.statusText,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = colors.textPrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Details Container
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = colors.card,
                border = BorderStroke(1.dp, colors.border),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = detail.institution,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = detail.credential,
                        fontSize = 13.sp,
                        color = colors.textSecondary
                    )

                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = 12.dp),
                        thickness = 0.8.dp,
                        color = colors.border
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(text = "Verified Date", fontSize = 11.sp, color = colors.textSecondary)
                            Text(text = detail.verifiedDate, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = colors.textPrimary)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text(text = "Record ID", fontSize = 11.sp, color = colors.textSecondary)
                            Text(text = detail.verificationId, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = colors.textPrimary)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Authority: ${detail.partnerAuthority}",
                        fontSize = 11.sp,
                        color = colors.textSecondary,
                        lineHeight = 15.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Privacy Security Note
            Row(
                modifier = Modifier.padding(horizontal = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = null,
                    tint = colors.textSecondary,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Astra protects all user credentials using encrypted digital verification.",
                    fontSize = 11.sp,
                    color = colors.textSecondary
                )
            }

            Spacer(modifier = Modifier.height(22.dp))

            if (!detail.isVerified && onVerifyAction != null) {
                AstraPrimaryButton(
                    text = "Complete Police Verification",
                    onClick = {
                        onVerifyAction()
                        onDismiss()
                    },
                    testTag = "modal_verify_action_button"
                )
            } else {
                AstraPrimaryButton(
                    text = "Close",
                    onClick = onDismiss,
                    testTag = "modal_close_button"
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
