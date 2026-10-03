import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';

export const PushNotificationService = {
  async register(userId: string) {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web.');
      return;
    }

    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.log('User denied push notification permissions.');
        return;
      }

      // Ensure Android high-priority notification channel exists
      try {
        await PushNotifications.createChannel({
          id: 'chat_messages',
          name: 'Chat Messages',
          description: 'Incoming messages from matches and matrimonial alliances',
          importance: 5, // High importance (heads-up / banner)
          visibility: 1, // Public visibility on lockscreen
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: '#D4AF37' // Cosmic gold
        });
      } catch (channelErr) {
        console.warn('Notification channel creation notice:', channelErr);
      }

      // 1. Remove previous listeners to avoid duplicates
      await PushNotifications.removeAllListeners();

      // 2. Attach listeners BEFORE calling register()
      PushNotifications.addListener('registration', async (token) => {
        console.log('[PushNotificationService] Push registration success, token:', token.value);
        if (!token?.value) return;
        try {
          const { error: upsertErr } = await supabase
            .from('push_tokens')
            .upsert(
              { user_id: userId, token: token.value, platform: Capacitor.getPlatform() },
              { onConflict: 'user_id, token' }
            );
          if (upsertErr) {
            console.error('[PushNotificationService] Failed to upsert token:', upsertErr);
          } else {
            console.log('[PushNotificationService] Token saved to Supabase for user:', userId);
          }
        } catch (dbErr) {
          console.error('[PushNotificationService] DB save error:', dbErr);
        }
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('[PushNotificationService] Error on registration:', JSON.stringify(error));
      });

      // App is in Foreground: notification received
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received in foreground:', notification);
        const data = notification.data || {};
        window.dispatchEvent(
          new CustomEvent('astra:push_received', { detail: { notification, data } })
        );
      });

      // User tapped notification from background or closed state
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push action performed:', action);
        const data = action.notification?.data || {};
        window.dispatchEvent(
          new CustomEvent('astra:push_action', { detail: { action, data } })
        );
        if (data.conversation_id) {
          window.dispatchEvent(
            new CustomEvent('astra:open_conversation', {
              detail: { conversationId: data.conversation_id, senderId: data.sender_id }
            })
          );
        }
      });

      // 3. Register with FCM after all listeners are safely mounted
      await PushNotifications.register();

    } catch (e) {
      console.error('PushNotificationService init error:', e);
    }
  }
};
