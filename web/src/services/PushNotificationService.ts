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

      await PushNotifications.register();

      // We only attach listeners once so we don't duplicate them
      await PushNotifications.removeAllListeners();

      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        // Save the token to Supabase push_tokens table
        await supabase
          .from('push_tokens')
          .upsert({ user_id: userId, token: token.value, platform: Capacitor.getPlatform() }, { onConflict: 'user_id, token' });
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      });

    } catch (e) {
      console.error('PushNotificationService init error:', e);
    }
  }
};
