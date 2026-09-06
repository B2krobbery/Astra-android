import { supabase } from '../lib/supabase';
import { Candidate } from '../types';

export const DiscoveryService = {
  async getCandidates(filters: any = {}): Promise<Candidate[]> {
    const { data: profiles, error } = await supabase.rpc('get_discovery_candidates', { p_filters: filters });
    if (error) {
      console.error('[DiscoveryService] get_discovery_candidates error:', error.message, error.details, error.hint);
      return [];
    }
    return DiscoveryService.mapProfilesToCandidates(profiles || []);
  },

  async getPendingRequests(): Promise<Candidate[]> {
    const { data: profiles, error } = await supabase.rpc('get_pending_requests');
    if (error) throw error;
    return DiscoveryService.mapProfilesToCandidates(profiles || []);
  },

  async getSentRequests(): Promise<Candidate[]> {
    const { data: profiles, error } = await supabase.rpc('get_sent_requests');
    if (error) throw error;
    return DiscoveryService.mapProfilesToCandidates(profiles || []);
  },

  async mapProfilesToCandidates(profiles: any[]): Promise<Candidate[]> {
    if (!profiles || profiles.length === 0) return [];

    // Fetch photos for all candidates
    const profileIds = profiles.map((p: any) => p.id);
    const { data: photos } = await supabase
      .from('profile_photos')
      .select('user_id, storage_path')
      .in('user_id', profileIds);

    // Fetch Signed URLs for all photos in one batch
    let signedUrlsMap: Record<string, string> = {};
    if (photos && photos.length > 0) {
      const pathsToSign = photos.map(p => p.storage_path).filter(p => !p.startsWith('http'));
      if (pathsToSign.length > 0) {
        const { data: signedUrls } = await supabase.storage.from('avatars').createSignedUrls(pathsToSign, 3600);
        if (signedUrls) {
          signedUrls.forEach(su => {
            if (su.signedUrl) signedUrlsMap[su.path || ""] = su.signedUrl;
          });
        }
      }
    }

    return profiles.map((p: any) => {
      // Find all photos for this profile
      const userPhotos = photos?.filter(photo => photo.user_id === p.id) || [];
      const photoUrls = userPhotos.length > 0 
        ? userPhotos.map(photo => {
            if (photo.storage_path.startsWith('http')) {
              return photo.storage_path;
            }
            return signedUrlsMap[photo.storage_path] || ''; // Use signed URL
          }).filter(url => url !== '')
        : [`https://ui-avatars.com/api/?name=${encodeURIComponent(p.display_name || 'User')}&background=1E1836&color=F59E0B&size=800`]; // Fallback

      // If no valid signed URLs could be loaded (due to RLS or missing files), show fallback
      if (photoUrls.length === 0) {
        photoUrls.push(`https://ui-avatars.com/api/?name=${encodeURIComponent(p.display_name || 'User')}&background=1E1836&color=F59E0B&size=800`);
      }

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
        education: p.higher_education || p.education || 'Graduate',
        compatibilityScore: 0, // Handled dynamically
        marriageQuestionnaire: p.marriage_questionnaire,
        chemistryAnswers: p.chemistry_answers || p.marriage_questionnaire,
        nakshatra: p.nakshatra,
        rashi: p.rashi,
        nadi: p.nadi,
        manglik: p.manglik,
        subCaste: p.sub_caste,
        gotra: p.gotra,
        height: p.height,
        diet: p.diet,
        photoPrivacy: p.photo_privacy,
        regionalCategory: p.region || (() => {
          const loc = (p.location || '').toLowerCase();
          if (loc.includes('kerala')) return 'Kerala';
          if (loc.includes('delhi') || loc.includes('ncr') || loc.includes('punjab') || loc.includes('uttar') || loc.includes('rajasthan')) return 'North India';
          if (loc.includes('mumbai') || loc.includes('pune') || loc.includes('maharashtra') || loc.includes('gujarat')) return 'West India';
          if (loc.includes('chennai') || loc.includes('bengaluru') || loc.includes('hyderabad') || loc.includes('tamil') || loc.includes('karnataka') || loc.includes('andhra')) return 'South India';
          if (loc.includes('kolkata') || loc.includes('bengal') || loc.includes('odisha') || loc.includes('bihar')) return 'East India';
          return 'ALL';
        })()
      };
    });
  },

  async interact(targetId: string, actionType: 'LIKE' | 'PASS' | 'BLOCK' | 'REPORT') {
    const { data: userData } = await supabase.auth.getUser();
    const actorId = userData?.user?.id;
    if (!actorId) throw new Error('Not authenticated');

    const { error } = await supabase.from('interactions').upsert({
      actor_id: actorId,
      target_id: targetId,
      action_type: actionType
    }, {
      onConflict: 'actor_id, target_id'
    });
    
    if (error) throw error;
    
    if (actionType === 'LIKE') {
      const { data: mutual, error: mutualError } = await supabase
        .from('interactions')
        .select('id')
        .eq('actor_id', targetId)
        .eq('target_id', actorId)
        .eq('action_type', 'LIKE')
        .maybeSingle();
        
      if (mutualError) {
        console.error('Error checking mutual match:', mutualError);
      }
        
      return { isMatch: !!mutual };
    }
    
    return { isMatch: false };
  },

  async resetInteractions() {
    const { data: userData } = await supabase.auth.getUser();
    const actorId = userData?.user?.id;
    if (!actorId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('interactions')
      .delete()
      .eq('actor_id', actorId);
      
    if (error) throw error;
  }
};
