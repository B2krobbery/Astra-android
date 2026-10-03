package com.aistudio.astra.vedicmatch;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannels();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                NotificationChannel chatChannel = new NotificationChannel(
                    "chat_messages",
                    "Chat Messages",
                    NotificationManager.IMPORTANCE_HIGH
                );
                chatChannel.setDescription("Incoming messages from matches and matrimonial alliances");
                chatChannel.enableLights(true);
                chatChannel.setLightColor(Color.parseColor("#D4AF37"));
                chatChannel.enableVibration(true);
                chatChannel.setShowBadge(true);
                manager.createNotificationChannel(chatChannel);
            }
        }
    }
}
