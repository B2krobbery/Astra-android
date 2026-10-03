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

      await PushNotifications.register();

      // We only attach listeners once so we don't duplicate them
      await PushNotifications.removeAllListeners();

      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        // Save the token to Supabase push_tokens table
        await supabase
          .from('push_tokens')
          .upsert(
            { user_id: userId, token: token.value, platform: Capacitor.getPlatform() },
            { onConflict: 'user_id, token' }
          );
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
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

    } catch (e) {
      console.error('PushNotificationService init error:', e);
    }
  }
};
