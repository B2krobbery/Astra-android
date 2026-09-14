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

export interface ProfilePhoto {
  id: string;
  userId: string;
  storagePath: string;
  url: string;
  isPrimary: boolean;
  position: number;
}

export interface PhotoUploadResult {
  photos: ProfilePhoto[];
  errors: string[];
}

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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

  /**
   * Fetch the current user's profile photos, ordered primary-first then position.
   * Returns [] when signed out. Throws query/sign errors rather than swallowing.
   */
  static async getMyPhotos(): Promise<ProfilePhoto[]> {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) return [];

    const { data, error } = await supabase
      .from('profile_photos')
      .select('id, user_id, storage_path, is_primary, position')
      .eq('user_id', uid)
      .order('is_primary', { ascending: false })
      .order('position', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Preserve HTTP paths; batch-sign internal paths from the avatars bucket.
    const internalPaths = data
      .map((row: any) => row.storage_path)
      .filter((p: string) => p && !p.startsWith('http'));

    const signedByPath: Record<string, string> = {};
    if (internalPaths.length > 0) {
      const { data: signedUrls, error: signError } = await supabase.storage
        .from('avatars')
        .createSignedUrls(internalPaths, 3600);

      if (signError) throw signError;

      // Map signed URL results by each result's `path` when available, with an
      // index fallback for SDK responses that omit `path`. Do not rely solely on
      // compacted index ordering.
      if (signedUrls) {
        signedUrls.forEach((signed, index) => {
          const path = signed?.path || internalPaths[index];
          if (path && signed?.signedUrl) signedByPath[path] = signed.signedUrl;
        });
      }
    }

    return data.map((row: any) => {
      const storagePath: string = row.storage_path;
      const url = storagePath.startsWith('http')
        ? storagePath
        : signedByPath[storagePath];
      if (!url) {
        throw new Error(`Failed to sign profile photo: ${storagePath}`);
      }
      return {
        id: row.id,
        userId: row.user_id,
        storagePath,
        url,
        isPrimary: !!row.is_primary,
        position: typeof row.position === 'number' ? row.position : 0
      };
    });
  }

  /**
   * Validate and upload multiple profile photos for the current user.
   * Each file is validated independently; accepted files are uploaded sequentially
   * and registered via the register_profile_photo RPC. The first accepted upload is
   * marked primary only when the user currently has zero photos. Successful uploads
   * are never lost if a later one fails.
   */
  static async uploadProfilePhotos(files: File[]): Promise<PhotoUploadResult> {
    const errors: string[] = [];
    if (!files || files.length === 0) {
      return { photos: [], errors };
    }

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) throw new Error('Authentication required.');

    // Snapshot current photos so we know whether the first upload should be primary
    // and to enforce the max-five limit per slot.
    const current = await PhotoService.getMyPhotos();
    let nextSlot = current.length;

    const accepted: File[] = [];
    for (const file of files) {
      const slot = nextSlot;
      if (slot >= MAX_PHOTOS) {
        errors.push(`"${file.name}" could not be added — you already have ${MAX_PHOTOS} photos.`);
        continue;
      }
      if (!ACCEPTED_MIME_TYPES.has(file.type)) {
        errors.push(`"${file.name}" was rejected — only JPEG, PNG, or WebP images are allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" was rejected — it exceeds the 5 MB size limit.`);
        continue;
      }
      accepted.push(file);
      nextSlot += 1;
    }

    if (accepted.length === 0) {
      const photos = await PhotoService.getMyPhotos();
      return { photos, errors };
    }

    const makePrimaryForFirst = current.length === 0;
    let registeredCount = 0;

    for (const file of accepted) {
      const ext = (file.name.split('.').pop() || '').toLowerCase() || 'jpg';
      const safeExt = ACCEPTED_MIME_TYPES.has(file.type)
        ? file.type.split('/')[1]
        : ext;
      const filePath = `${uid}/${crypto.randomUUID()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: false, contentType: file.type });

      if (uploadError) {
        errors.push(`"${file.name}" failed to upload: ${uploadError.message}`);
        continue;
      }

      const { error: rpcError } = await supabase.rpc('register_profile_photo', {
        p_storage_path: filePath,
        p_make_primary: makePrimaryForFirst && registeredCount === 0
      });

      if (rpcError) {
        errors.push(`"${file.name}" was uploaded but could not be registered: ${rpcError.message}`);
        // Roll back the just-uploaded object so we don't leak orphaned files.
        const { error: removeError } = await supabase.storage.from('avatars').remove([filePath]);
        if (removeError) {
          console.error('Failed to clean up orphaned upload after RPC failure', removeError);
        }
        continue;
      }
      registeredCount += 1;
    }

    const photos = await PhotoService.getMyPhotos();
    return { photos, errors };
  }

  /**
   * Set a profile photo as primary via the set_primary_profile_photo RPC, then refresh.
   */
  static async setPrimaryPhoto(photoId: string): Promise<ProfilePhoto[]> {
    const { error } = await supabase.rpc('set_primary_profile_photo', { p_photo_id: photoId });
    if (error) throw error;
    return PhotoService.getMyPhotos();
  }

  /**
   * Delete a profile photo via the delete_profile_photo RPC, then remove the returned
   * storage object. Object cleanup errors are logged but do not roll back metadata.
   */
  static async deleteProfilePhoto(photoId: string): Promise<ProfilePhoto[]> {
    const { data, error } = await supabase.rpc('delete_profile_photo', { p_photo_id: photoId });
    if (error) throw error;

    const deletedPath: string | undefined = typeof data === 'string' ? data : undefined;
    if (deletedPath && !deletedPath.startsWith('http')) {
      const { error: removeError } = await supabase.storage.from('avatars').remove([deletedPath]);
      if (removeError) {
        console.error('Failed to remove deleted photo object from storage', removeError);
      }
    }

    return PhotoService.getMyPhotos();
  }
}
