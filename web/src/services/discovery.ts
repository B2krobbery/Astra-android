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

  async getPendingRequests(targetUserId?: string): Promise<Candidate[]> {
    let userId = targetUserId;
    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      userId = sessionData?.session?.user?.id;
    }
    if (!userId) return [];

    const { data: profiles, error } = await supabase.rpc('get_pending_requests', { target_user_id: userId });
    if (error) throw error;
    return DiscoveryService.mapProfilesToCandidates(profiles || []);
  },

  async getSentRequests(targetUserId?: string): Promise<Candidate[]> {
    let userId = targetUserId;
    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      userId = sessionData?.session?.user?.id;
    }
    if (!userId) return [];

    const { data: profiles, error } = await supabase.rpc('get_sent_requests', { target_user_id: userId });
    if (error) throw error;
    return DiscoveryService.mapProfilesToCandidates(profiles || []);
  },

  async mapProfilesToCandidates(profiles: any[]): Promise<Candidate[]> {
    if (!profiles || profiles.length === 0) return [];

    const userPhotoPathsMap: Record<string, string[]> = {};
    const signedUrlsMap: Record<string, string> = {};

    try {
      const profileIds = profiles.map((p: any) => p.id);
      const { data: photos } = await supabase
        .from('profile_photos')
        .select('user_id, storage_path')
        .in('user_id', profileIds);

      // Build map of user_id -> storage_path[] (checking both profiles.avatar_storage_path and profile_photos)
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
      if (allPaths.length > 0) {
        try {
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
        } catch (e) {
          console.error('[mapProfilesToCandidates] Storage sign error:', e);
        }
      }
    } catch (e) {
      console.error('[mapProfilesToCandidates] Photo query error:', e);
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
        photoUrls.push(`https://ui-avatars.com/api/?name=${encodeURIComponent(p.display_name || 'User')}&background=181822&color=D4AF37&size=800`);
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
        motherFatherGotra: p.mother_father_gotra,
        fatherMotherGotra: p.father_mother_gotra,
        motherMotherGotra: p.mother_mother_gotra,
        height: p.height,
        diet: p.diet,
        alcohol: p.alcohol_frequency,
        smoking: p.smoking_frequency,
        voiceNoteUrl: p.voice_note_url,
        voiceNotePrompt: p.voice_note_prompt,
        healthStatus: p.health_status,
        healthCondition: p.pre_existing_conditions || undefined,
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

  async interact(targetId: string, actionType: 'LIKE' | 'PASS' | 'BLOCK' | 'REPORT', explicitActorId?: string) {
    let actorId = explicitActorId;
    if (!actorId) {
      const { data: userData } = await supabase.auth.getUser();
      actorId = userData?.user?.id;
    }
    if (!actorId) {
      const { data: sessionData } = await supabase.auth.getSession();
      actorId = sessionData?.session?.user?.id;
    }
    if (!actorId) throw new Error('Not authenticated');

    const { data: resData, error } = await supabase.rpc('interact_with_candidate', {
      p_target_id: targetId,
      p_action_type: actionType,
      p_actor_id: actorId
    });

    if (error) {
      console.error('[DiscoveryService] interact_with_candidate RPC error:', error);
      throw error;
    }

    return { isMatch: !!(resData?.isMatch) };
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
  },

  async unmatchCandidate(targetId: string) {
    const { data, error } = await supabase.rpc('unmatch_candidate', { p_target_id: targetId });
    if (error) throw error;
    return data;
  }
};
