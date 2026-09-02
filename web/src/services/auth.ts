import { supabase } from '../lib/supabase';

export const AuthService = {
  async signInWithOtp(phone: string) {
    return supabase.auth.signInWithOtp({ phone });
  },
  async verifyOtp(phone: string, token: string) {
    return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  },
  async signInWithGoogle() {
    return supabase.auth.signInWithOAuth({ provider: 'google' });
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
  }
};
