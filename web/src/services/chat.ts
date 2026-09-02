import { supabase } from '../lib/supabase';

export const ChatService = {
  async getConversations() {
    const { data, error } = await supabase.from('conversations').select(`
      id,
      created_at,
      conversation_participants(user_id)
    `);
    if (error) throw error;
    return data;
  },
  async getMessages(conversationId: string) {
    const { data, error } = await supabase.from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  async sendMessage(conversationId: string, content: string) {
    const { data, error } = await supabase.from('messages').insert([
      { conversation_id: conversationId, content }
    ]);
    if (error) throw error;
    return data;
  },
  subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return supabase.channel(`public:messages:conversation_id=eq.${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, payload => {
        callback(payload.new);
      }).subscribe();
  }
};
