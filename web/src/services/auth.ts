import { Capacitor } from '@capacitor/core';
import { GoogleOneTapAuth } from 'capacitor-native-google-one-tap-signin';
import { supabase } from '../lib/supabase';

export interface GoogleAuthResult {
  data: any | null;
  error: any | null;
  cancelled?: boolean;
}

export const AuthService = {
  async signInWithOtp(phone: string) {
    return supabase.auth.signInWithOtp({ phone });
  },
  async verifyOtp(phone: string, token: string) {
    return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  },
  async signInWithGoogleNative(): Promise<GoogleAuthResult> {
    const clientId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) || ((globalThis as any).process?.env?.VITE_GOOGLE_CLIENT_ID) || '';

    if (Capacitor.isNativePlatform()) {
      if (!clientId) {
        return {
          data: null,
          error: new Error('Google Sign-In is not configured: missing VITE_GOOGLE_CLIENT_ID'),
          cancelled: false,
        };
      }

      try {
        await GoogleOneTapAuth.initialize({ clientId });

        // Trigger native Google button flow (Credential Manager / Play Services)
        let result = await GoogleOneTapAuth.signInWithGoogleButtonFlowForNativePlatform();

        if (!result.isSuccess) {
          const reasonCode = result.noSuccess?.noSuccessReasonCode;
          const info = result.noSuccess?.noSuccessAdditionalInfo || '';

          if (reasonCode === 'SIGN_IN_CANCELLED' || info.toLowerCase().includes('cancel')) {
            return { data: null, error: null, cancelled: true };
          }

          // Fallback to tryAutoOrOneTapSignIn
          result = await GoogleOneTapAuth.tryAutoOrOneTapSignIn();
          if (!result.isSuccess) {
            if (result.noSuccess?.noSuccessReasonCode === 'SIGN_IN_CANCELLED' ||
                result.noSuccess?.noSuccessAdditionalInfo?.toLowerCase().includes('cancel')) {
              return { data: null, error: null, cancelled: true };
            }
            return {
              data: null,
              error: new Error(result.noSuccess?.noSuccessAdditionalInfo || 'Google Sign-In was not successful'),
              cancelled: false
            };
          }
        }

        if (result.isSuccess && result.success?.idToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: result.success.idToken,
          });
          return { data, error, cancelled: false };
        }

        return { data: null, error: new Error('No Google ID token received from device'), cancelled: false };
      } catch (err: any) {
        if (err?.message?.toLowerCase().includes('cancel')) {
          return { data: null, error: null, cancelled: true };
        }
        return { data: null, error: err, cancelled: false };
      }
    } else {
      // Browser / Web fallback
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: origin
          }
        });
        return { data, error, cancelled: false };
      } catch (err: any) {
        return { data: null, error: err, cancelled: false };
      }
    }
  },
  async signInWithGoogle() {
    return this.signInWithGoogleNative();
  },
  async signOut() {
    return supabase.auth.signOut();
  },
  async getSession() {
    return supabase.auth.getSession();
  },
  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
  async deleteAccount() {
    const { error } = await supabase.rpc('delete_user');
    if (error) throw error;
    return supabase.auth.signOut();
  }
};
