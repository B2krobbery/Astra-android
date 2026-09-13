import { createClient } from '@supabase/supabase-js';
import { Preferences } from '@capacitor/preferences';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || ((globalThis as any).process?.env?.VITE_SUPABASE_URL) || 'https://placeholder.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || ((globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY) || 'placeholder-anon-key';

// Dual storage adapter: Instant synchronous localStorage + background Capacitor Preferences backup
const hybridStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const value = window.localStorage.getItem(key);
      if (value) return value;
    }
    // Async background sync to populate localStorage if missing
    Preferences.get({ key }).then(({ value }) => {
      if (value && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    }).catch(() => {});
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    Preferences.set({ key, value }).catch(() => {});
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    Preferences.remove({ key }).catch(() => {});
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: hybridStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Recommended false for native apps
  },
});
