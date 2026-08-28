package com.example.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

enum class ThemeMode(val title: String) {
    DARK("Dark"),
    LIGHT("Light"),
    SYSTEM("System Default")
}

data class AstraColorScheme(
    val isDark: Boolean,
    val background: Color,
    val surface: Color,
    val surfaceElevated: Color,
    val card: Color,
    val cardHighlight: Color,
    val border: Color,
    val borderSubtle: Color,
    val primary: Color,
    val primaryVariant: Color,
    val primaryContainer: Color,
    val onPrimaryContainer: Color,
    val onPrimary: Color,
    val secondary: Color,
    val secondaryContainer: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textTertiary: Color,
    val indigo: Color,
    val indigoBg: Color,
    val indigoBorder: Color,
    val indigoText: Color,
    val goldAccent: Color,
    val goldContainer: Color,
    val verifiedBlue: Color,
    val verifiedBlueBg: Color,
    val verifiedGreen: Color,
    val verifiedGreenBg: Color,
    val metricEmotional: Color,
    val metricNakshatra: Color,
    val metricRashi: Color,
    val metricHarmony: Color,
    val divider: Color,
    val inputBackground: Color,
    val inputBorder: Color,
    val glassPillBg: Color,
    val glassPillBorder: Color,
    val glassPillText: Color,
    val circleActionBg: Color,
    val circleActionBorder: Color,
    val bottomNavBg: Color,
    val bottomNavDivider: Color
)

// Sleek Interface Dark Backgrounds & Canvas
val SleekBackground = Color(0xFF0B0D11)
val SleekSurface = Color(0xFF131722)
val SleekSurfaceElevated = Color(0xFF1C2230)
val SleekCard = Color(0xFF161B26)
val SleekCardHighlight = Color(0xFF222938)
val SleekBorder = Color(0x1AFFFFFF) // white/10
val SleekBorderSubtle = Color(0x0DFFFFFF) // white/5

// Compatibility & Legacy Aliases for seamless theme integration
val CreamBackground = SleekBackground
val CreamSurface = SleekSurface
val CreamCard = SleekCard
val CreamCardLight = SleekSurfaceElevated
val CreamBorder = SleekBorder

// Radiant Amber & Warm Gold Accents
val Amber400 = Color(0xFFFBBF24)
val Amber500 = Color(0xFFF59E0B)
val Orange500 = Color(0xFFF97316)
val GoldAccent = Color(0xFFFBBF24)
val GoldLight = Color(0xFFFDE68A)
val GoldContainer = Color(0x26FBBF24)

// Celestial Electric Indigo & Purple Accents
val Indigo400 = Color(0xFF818CF8)
val Indigo500 = Color(0xFF6366F1)
val Indigo900 = Color(0xFF1E1B4B)
val IndigoBg = Color(0x33312E81) // bg-indigo-900/20
val IndigoBorder = Color(0x336366F1) // border-indigo-500/20
val IndigoText = Color(0xFFC7D2FE) // text-indigo-200
val Purple500 = Color(0xFFA855F7)
val PrimaryWine = Color(0xFFF59E0B)
val PrimaryWineDark = Color(0xFF0B0D11)
val PrimaryWineLight = Color(0xFFFBBF24)
val WineContainer = Color(0x266366F1)
val OnWineContainer = Color(0xFFF1F5F9)

// Sleek Slate Text Colors
val TextPrimary = Color(0xFFF8FAFC) // text-slate-50
val TextSecondary = Color(0xFF94A3B8) // text-slate-400
val TextTertiary = Color(0xFF64748B) // text-slate-500

// Status & Verification Colors
val VerifiedBlue = Color(0xFF60A5FA) // blue-400 glowing
val VerifiedBlueBg = Color(0x263B82F6)
val VerifiedGreen = Color(0xFF34D399)
val VerifiedGreenBg = Color(0x2610B981)
val WarningAmber = Color(0xFFF59E0B)
val DangerRed = Color(0xFFEF4444)

// Vedic Metric Bar Colors (Sleek Celestial)
val MetricEmotional = Color(0xFFFBBF24)
val MetricNakshatra = Color(0xFF818CF8)
val MetricRashi = Color(0xFFA855F7)
val MetricHarmony = Color(0xFF34D399)

// Centralized Dark Color Scheme
val AstraDarkColorScheme = AstraColorScheme(
    isDark = true,
    background = Color(0xFF0B0D11),
    surface = Color(0xFF131722),
    surfaceElevated = Color(0xFF1C2230),
    card = Color(0xFF161B26),
    cardHighlight = Color(0xFF222938),
    border = Color(0x1AFFFFFF),
    borderSubtle = Color(0x0DFFFFFF),
    primary = Amber400,
    primaryVariant = Amber500,
    primaryContainer = WineContainer,
    onPrimaryContainer = IndigoText,
    onPrimary = SleekBackground,
    secondary = Indigo400,
    secondaryContainer = IndigoBg,
    textPrimary = Color(0xFFF8FAFC),
    textSecondary = Color(0xFF94A3B8),
    textTertiary = Color(0xFF64748B),
    indigo = Indigo400,
    indigoBg = Color(0x33312E81),
    indigoBorder = Color(0x336366F1),
    indigoText = Color(0xFFC7D2FE),
    goldAccent = Amber400,
    goldContainer = Color(0x26FBBF24),
    verifiedBlue = Color(0xFF60A5FA),
    verifiedBlueBg = Color(0x263B82F6),
    verifiedGreen = Color(0xFF34D399),
    verifiedGreenBg = Color(0x2610B981),
    metricEmotional = Color(0xFFFBBF24),
    metricNakshatra = Color(0xFF818CF8),
    metricRashi = Color(0xFFA855F7),
    metricHarmony = Color(0xFF34D399),
    divider = Color(0xFF1E2330),
    inputBackground = Color(0xFF161B26),
    inputBorder = Color(0x1AFFFFFF),
    glassPillBg = Color.White.copy(alpha = 0.10f),
    glassPillBorder = Color.White.copy(alpha = 0.08f),
    glassPillText = Color(0xFFE2E8F0),
    circleActionBg = Color.White.copy(alpha = 0.08f),
    circleActionBorder = Color.White.copy(alpha = 0.12f),
    bottomNavBg = Color(0xFF0B0D11),
    bottomNavDivider = Color(0xFF1E2330)
)

// Centralized Light Color Scheme (Polished, faithful adaptation)
val AstraLightColorScheme = AstraColorScheme(
    isDark = false,
    background = Color(0xFFF5F7FB),
    surface = Color(0xFFFFFFFF),
    surfaceElevated = Color(0xFFFFFFFF),
    card = Color(0xFFFFFFFF),
    cardHighlight = Color(0xFFF1F5F9),
    border = Color(0xFFE2E8F0),
    borderSubtle = Color(0xFFF1F5F9),
    primary = Color(0xFFD97706),
    primaryVariant = Color(0xFFB45309),
    primaryContainer = Color(0xFFFEF3C7),
    onPrimaryContainer = Color(0xFF78350F),
    onPrimary = Color.White,
    secondary = Color(0xFF4F46E5),
    secondaryContainer = Color(0xFFEEF2FF),
    textPrimary = Color(0xFF0F172A),
    textSecondary = Color(0xFF475569),
    textTertiary = Color(0xFF94A3B8),
    indigo = Color(0xFF4F46E5),
    indigoBg = Color(0xFFEEF2FF),
    indigoBorder = Color(0xFFC7D2FE),
    indigoText = Color(0xFF3730A3),
    goldAccent = Color(0xFFD97706),
    goldContainer = Color(0xFFFEF3C7),
    verifiedBlue = Color(0xFF2563EB),
    verifiedBlueBg = Color(0xFFEFF6FF),
    verifiedGreen = Color(0xFF059669),
    verifiedGreenBg = Color(0xFFECFDF5),
    metricEmotional = Color(0xFFD97706),
    metricNakshatra = Color(0xFF4F46E5),
    metricRashi = Color(0xFF9333EA),
    metricHarmony = Color(0xFF059669),
    divider = Color(0xFFE2E8F0),
    inputBackground = Color(0xFFFFFFFF),
    inputBorder = Color(0xFFCBD5E1),
    glassPillBg = Color(0xFFF1F5F9),
    glassPillBorder = Color(0xFFE2E8F0),
    glassPillText = Color(0xFF334155),
    circleActionBg = Color(0xFFF1F5F9),
    circleActionBorder = Color(0xFFCBD5E1),
    bottomNavBg = Color(0xFFFFFFFF),
    bottomNavDivider = Color(0xFFE2E8F0)
)

val LocalAstraColors = staticCompositionLocalOf { AstraDarkColorScheme }

object AstraTheme {
    val colors: AstraColorScheme
        @Composable
        @ReadOnlyComposable
        get() = LocalAstraColors.current
}
