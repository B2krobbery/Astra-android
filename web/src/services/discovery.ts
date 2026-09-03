import { supabase } from '../lib/supabase';
import { Candidate } from '../types';

export const DiscoveryService = {
  async getCandidates(): Promise<Candidate[]> {
    const { data: profiles, error } = await supabase.rpc('get_discovery_candidates');
    if (error) throw error;
    if (!profiles || profiles.length === 0) return [];

    // Fetch photos for all candidates
    const profileIds = profiles.map((p: any) => p.id);
    const { data: photos } = await supabase
      .from('profile_photos')
      .select('user_id, storage_path')
      .in('user_id', profileIds);

    return profiles.map((p: any) => {
      // Find all photos for this profile
      const userPhotos = photos?.filter(photo => photo.user_id === p.id) || [];
      const photoUrls = userPhotos.length > 0 
        ? userPhotos.map(photo => {
            if (photo.storage_path.startsWith('http')) {
              return photo.storage_path;
            }
            return supabase.storage.from('avatars').getPublicUrl(photo.storage_path).data.publicUrl;
          })
        : ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80']; // Fallback

      // Calculate age from date_of_birth
      let age = 25;
      if (p.date_of_birth) {
        const dob = new Date(p.date_of_birth);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms); 
        age = Math.abs(age_dt.getUTCFullYear() - 1970);
      }

      return {
        id: p.id,
        name: p.display_name || 'Unknown',
        age: age,
        gender: p.gender || 'Female',
        profession: p.profession || 'Professional',
        location: p.location || 'India',
        regionalCategory: 'ALL',
        bio: p.bio || '',
        intent: p.intent || 'Marriage',
        religion: p.religion,
        caste: p.caste,
        photoUrls: photoUrls,
        isVerified: true,
        educationVerified: true,
        policeVerified: true,
        creditVerified: true,
        interests: [],
        education: p.education_10th || 'Graduate',
        compatibilityScore: 0 // Handled by AstraContext AstrologyEngine
      };
    });
  },

  async interact(targetId: string, actionType: 'LIKE' | 'PASS' | 'BLOCK' | 'REPORT') {
    const { data: userData } = await supabase.auth.getUser();
    const actorId = userData?.user?.id;
    if (!actorId) throw new Error('Not authenticated');

    const { data, error } = await supabase.from('interactions').insert([
      { 
        actor_id: actorId,
        target_id: targetId, 
        action_type: actionType 
      }
    ]);
    if (error) throw error;
    return data;
  }
};
