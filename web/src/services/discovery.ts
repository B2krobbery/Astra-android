import { supabase } from '../lib/supabase';

export const DiscoveryService = {
  async getCandidates() {
    const { data, error } = await supabase.rpc('get_discovery_candidates');
    if (error) throw error;
    return data;
  },
  async interact(targetId: string, actionType: 'LIKE' | 'PASS' | 'BLOCK' | 'REPORT') {
    const { data, error } = await supabase.from('interactions').insert([
      { target_id: targetId, action_type: actionType }
    ]);
    if (error) throw error;
    return data;
  }
};
