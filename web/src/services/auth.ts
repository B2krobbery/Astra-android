import { Capacitor } from '@capacitor/core';
import { GoogleOneTapAuth } from 'capacitor-native-google-one-tap-signin';
import { supabase } from '../lib/supabase';

export interface GoogleAuthResult {
  data: any | null;
  error: any | null;
  cancelled?: boolean;
}

async function generateNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  const rawNonce = btoa(binary);

  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(rawNonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return { rawNonce, hashedNonce };
}

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
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
        const { rawNonce, hashedNonce } = await generateNonce();

        // Pass hashedNonce to Google SDK Credential Manager
        await GoogleOneTapAuth.initialize({
          clientId,
          nonce: hashedNonce,
        });

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
          const payload = parseJwtPayload(result.success.idToken);
          console.log('[Auth] Google ID Token audience:', payload?.aud);
          console.log('[Auth] Google ID Token presenter:', payload?.azp);
          console.log('[Auth] Google ID Token nonce present:', !!payload?.nonce);

          // If token has a nonce, supply matching rawNonce. If token has no nonce, pass undefined.
          // This satisfies GoTrue's requirement that passed nonce and token nonce must either both exist or neither exist.
          const hasTokenNonce = !!payload?.nonce;

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: result.success.idToken,
            nonce: hasTokenNonce ? rawNonce : undefined,
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
