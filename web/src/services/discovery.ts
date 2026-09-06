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

    const profileIds = profiles.map((p: any) => p.id);
    const { data: photos } = await supabase
      .from('profile_photos')
      .select('user_id, storage_path')
      .in('user_id', profileIds);

    // Build map of user_id -> storage_path[] (checking both profiles.avatar_storage_path and profile_photos)
    const userPhotoPathsMap: Record<string, string[]> = {};
    profiles.forEach((p: any) => {
      userPhotoPathsMap[p.id] = [];
      if (p.avatar_storage_path) {
        userPhotoPathsMap[p.id].push(p.avatar_storage_path);
      }
    });

    photos?.forEach((photo: any) => {
      if (photo.user_id && photo.storage_path) {
        if (!userPhotoPathsMap[photo.user_id]) userPhotoPathsMap[photo.user_id] = [];
        if (!userPhotoPathsMap[photo.user_id].includes(photo.storage_path)) {
          userPhotoPathsMap[photo.user_id].push(photo.storage_path);
        }
      }
    });

    // Collect all distinct paths to sign
    const allPaths: string[] = [];
    Object.values(userPhotoPathsMap).forEach(paths => {
      paths.forEach(p => {
        if (p && !allPaths.includes(p) && !p.startsWith('http')) {
          allPaths.push(p);
        }
      });
    });

    // Sign URLs by index mapping with publicUrl fallback
    const signedUrlsMap: Record<string, string> = {};
    if (allPaths.length > 0) {
      const { data: signedUrls } = await supabase.storage.from('avatars').createSignedUrls(allPaths, 3600);
      allPaths.forEach((path, i) => {
        if (signedUrls && signedUrls[i]?.signedUrl) {
          signedUrlsMap[path] = signedUrls[i].signedUrl;
        } else {
          const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(path);
          if (pubData?.publicUrl) {
            signedUrlsMap[path] = pubData.publicUrl;
          }
        }
      });
    }

    return profiles.map((p: any) => {
      const paths = userPhotoPathsMap[p.id] || [];
      const photoUrls: string[] = [];

      paths.forEach(path => {
        if (path.startsWith('http')) {
          photoUrls.push(path);
        } else if (signedUrlsMap[path]) {
          photoUrls.push(signedUrlsMap[path]);
        }
      });

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
        voiceNoteUrl: p.voice_note_url,
        voiceNotePrompt: p.voice_note_prompt,
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
