import { createClient } from '@supabase/supabase-js';
import { Preferences } from '@capacitor/preferences';

const DEFAULT_SUPABASE_URL = 'https://xpkkathtikucwtyjzfja.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_7C4Qmq1NFC93t-d0UG2xqw_UIQvVYrQ';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || ((globalThis as any).process?.env?.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || ((globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON_KEY;

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
