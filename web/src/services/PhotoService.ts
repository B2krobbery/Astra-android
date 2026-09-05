import { supabase } from '../lib/supabase';

export interface PhotoRequestRecord {
  id: string;
  requester_id: string;
  target_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
  requester_profile?: {
    display_name: string;
    photo_url?: string;
    location?: string;
  };
}

export class PhotoService {
  /**
   * Request private photos from a candidate
   */
  static async requestPhotos(targetUserId: string): Promise<'PENDING' | 'ACCEPTED'> {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) throw new Error('Authentication required.');

    // Check existing request
    const { data: existing } = await supabase
      .from('photo_requests')
      .select('status')
      .eq('requester_id', uid)
      .eq('target_id', targetUserId)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'ACCEPTED') return 'ACCEPTED';
      return 'PENDING';
    }

    const { error } = await supabase.from('photo_requests').insert({
      requester_id: uid,
      target_id: targetUserId,
      status: 'PENDING'
    });

    if (error) throw error;
    return 'PENDING';
  }

  /**
   * Check status of photo request to a candidate
   */
  static async getRequestStatus(targetUserId: string): Promise<'NONE' | 'PENDING' | 'ACCEPTED' | 'DECLINED'> {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) return 'NONE';

    const { data } = await supabase
      .from('photo_requests')
      .select('status')
      .eq('requester_id', uid)
      .eq('target_id', targetUserId)
      .maybeSingle();

    return (data?.status as any) || 'NONE';
  }

  /**
   * Accept or decline an incoming photo request
   */
  static async respondToRequest(requestId: string, accept: boolean): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) throw new Error('Authentication required.');

    const newStatus = accept ? 'ACCEPTED' : 'DECLINED';
    const { error } = await supabase
      .from('photo_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
      .eq('target_id', uid);

    if (error) throw error;
  }

  /**
   * Get all incoming photo requests for current user
   */
  static async getIncomingRequests(): Promise<PhotoRequestRecord[]> {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) return [];

    const { data, error } = await supabase
      .from('photo_requests')
      .select(`
        id,
        requester_id,
        target_id,
        status,
        created_at,
        profiles:requester_id (
          display_name,
          location
        )
      `)
      .eq('target_id', uid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch incoming photo requests', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      requester_id: row.requester_id,
      target_id: row.target_id,
      status: row.status,
      created_at: row.created_at,
      requester_profile: row.profiles
    }));
  }

  /**
   * Loads authorized private photo signed URLs for a candidate
   */
  static async loadAuthorizedPhotos(targetUserId: string): Promise<string[]> {
    // 1. Call RPC get_private_photos
    const { data: photos, error } = await supabase.rpc('get_private_photos', {
      p_target_id: targetUserId
    });

    if (error || !photos || photos.length === 0) {
      return [];
    }

    const pathsToSign = photos.map((p: any) => p.storage_path).filter((p: string) => !p.startsWith('http'));
    if (pathsToSign.length === 0) {
      return photos.map((p: any) => p.storage_path);
    }

    const { data: signedUrls } = await supabase.storage.from('avatars').createSignedUrls(pathsToSign, 3600);
    if (!signedUrls) return [];

    return signedUrls.map((s: any) => s.signedUrl).filter(Boolean);
  }
}
