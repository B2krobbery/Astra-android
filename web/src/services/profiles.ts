import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export const ProfileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
  },
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
    return data;
  },
  async uploadPhoto(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  }
};
