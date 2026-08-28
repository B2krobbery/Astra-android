package com.example.data.models

enum class VerificationType {
    EDUCATION,
    POLICE,
    CREDIT
}

data class VerificationDetail(
    val type: VerificationType,
    val title: String,
    val isVerified: Boolean,
    val statusText: String,
    val institution: String,
    val credential: String,
    val verifiedDate: String,
    val verificationId: String,
    val partnerAuthority: String,
    val description: String
)
