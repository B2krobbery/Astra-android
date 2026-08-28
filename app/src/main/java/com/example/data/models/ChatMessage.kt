package com.example.data.models

data class ChatMessage(
    val id: String,
    val senderName: String,
    val message: String,
    val timestamp: String,
    val isFromUser: Boolean
)

data class MatchConversation(
    val candidate: Candidate,
    val lastMessage: String,
    val timestamp: String,
    val unreadCount: Int = 1,
    val messages: List<ChatMessage>
)
