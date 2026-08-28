package com.example.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.PersonOutline
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.Amber500
import com.example.ui.theme.AstraTheme
import com.example.ui.theme.Indigo500
import com.example.ui.theme.Purple500

enum class AstraTab(
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val tag: String
) {
    DISCOVER("Discover", Icons.Filled.Explore, Icons.Outlined.Explore, "tab_discover"),
    MATCHES("Matches", Icons.Filled.Favorite, Icons.Outlined.FavoriteBorder, "tab_matches"),
    ASTRO_AI("Astro AI", Icons.Filled.AutoAwesome, Icons.Outlined.AutoAwesome, "tab_astro_ai"),
    PROFILE("Profile", Icons.Filled.Person, Icons.Outlined.PersonOutline, "tab_profile")
}

@Composable
fun AstraBottomNavigationBar(
    currentTab: AstraTab,
    onTabSelected: (AstraTab) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = AstraTheme.colors

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
        color = colors.bottomNavBg,
        tonalElevation = 6.dp,
        shadowElevation = if (colors.isDark) 12.dp else 4.dp
    ) {
        Column {
            HorizontalDivider(
                thickness = 0.8.dp,
                color = colors.bottomNavDivider
            )
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
                    .padding(horizontal = 12.dp),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Tab 1: Discover
                BottomNavItem(
                    tab = AstraTab.DISCOVER,
                    isSelected = currentTab == AstraTab.DISCOVER,
                    onClick = { onTabSelected(AstraTab.DISCOVER) }
                )

                // Tab 2: Matches
                BottomNavItem(
                    tab = AstraTab.MATCHES,
                    isSelected = currentTab == AstraTab.MATCHES,
                    onClick = { onTabSelected(AstraTab.MATCHES) }
                )

                // Center Highlighted Celestial Button
                CenterAstroPill(
                    isActive = currentTab == AstraTab.ASTRO_AI,
                    onClick = { onTabSelected(AstraTab.ASTRO_AI) }
                )

                // Tab 3: Astro AI
                BottomNavItem(
                    tab = AstraTab.ASTRO_AI,
                    isSelected = currentTab == AstraTab.ASTRO_AI,
                    onClick = { onTabSelected(AstraTab.ASTRO_AI) }
                )

                // Tab 4: Profile
                BottomNavItem(
                    tab = AstraTab.PROFILE,
                    isSelected = currentTab == AstraTab.PROFILE,
                    onClick = { onTabSelected(AstraTab.PROFILE) }
                )
            }
        }
    }
}

@Composable
private fun BottomNavItem(
    tab: AstraTab,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val colors = AstraTheme.colors
    val iconColor by animateColorAsState(
        targetValue = if (isSelected) colors.primary else colors.textTertiary,
        label = "tab_color"
    )

    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 6.dp)
            .testTag(tab.tag),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = if (isSelected) tab.selectedIcon else tab.unselectedIcon,
            contentDescription = tab.title,
            tint = iconColor,
            modifier = Modifier.size(23.dp)
        )
        Spacer(modifier = Modifier.height(3.dp))
        Text(
            text = tab.title,
            color = iconColor,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
        )
    }
}

@Composable
private fun CenterAstroPill(
    isActive: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .size(46.dp)
            .shadow(8.dp, CircleShape, spotColor = Amber500.copy(alpha = 0.4f))
            .clip(CircleShape)
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Indigo500,
                        Purple500,
                        Amber500
                    )
                )
            )
            .clickable(onClick = onClick)
            .testTag("center_astro_button"),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Default.AutoAwesome,
            contentDescription = "Astro Celestial Center",
            tint = Color.White,
            modifier = Modifier.size(24.dp)
        )
    }
}
