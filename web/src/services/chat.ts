import { supabase } from '../lib/supabase';
import { MatchConversation, ChatMessage } from '../types';
import { DiscoveryService } from './discovery';

export const ChatService = {
  async getConversations(targetUserId?: string): Promise<MatchConversation[]> {
    let userId = targetUserId;
    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      userId = sessionData?.session?.user?.id;
    }
    if (!userId) return [];

    const { data: parts, error: partsErr } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (partsErr || !parts || parts.length === 0) return [];
    const convoIds = parts.map(p => p.conversation_id);

    const { data: otherParts, error: otherErr } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .in('conversation_id', convoIds)
      .neq('user_id', userId);

    if (otherErr || !otherParts || otherParts.length === 0) return [];

    // Batch query: Fetch all profiles in 1 single network request
    const otherUserIds = Array.from(new Set(otherParts.map(p => p.user_id)));
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds);

    // Map full Candidate objects with all gallery photos and signed URLs
    const candidates = await DiscoveryService.mapProfilesToCandidates(profiles || []);
    const candidateMap = new Map(candidates.map(c => [c.id, c]));

    // Parallel fetch last message per conversation
    const matchConversations = await Promise.all(
      otherParts.map(async part => {
        const candidate = candidateMap.get(part.user_id);
        if (!candidate) return null;

        if (!candidate.compatibilityScore) {
          candidate.compatibilityScore = 90;
        }

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', part.conversation_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          id: part.conversation_id,
          candidate,
          lastMessage: lastMsg ? lastMsg.content : 'New Match!',
          timestamp: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          unreadCount: 0,
          messages: []
        } as MatchConversation;
      })
    );

    return matchConversations.filter(Boolean) as MatchConversation[];
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map(msg => ({
      id: msg.id,
      senderName: msg.sender_id === userId ? 'You' : 'Them',
      message: msg.content,
      timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromUser: msg.sender_id === userId
    }));
  },

  async sendMessage(conversationId: string, content: string) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger push notification dispatch for background/closed devices
    if (data) {
      supabase.functions.invoke('push_notifications', {
        body: {
          type: 'INSERT',
          table: 'messages',
          record: data
        }
      }).catch(err => {
        console.warn('[ChatService] Push notification dispatch warning:', err);
      });
    }

    return data;
  },

  subscribeToMessages(conversationId: string, onNewMessage: (msg: ChatMessage) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData?.user?.id;
          
          const newMsg = payload.new;
          onNewMessage({
            id: newMsg.id,
            senderName: newMsg.sender_id === userId ? 'You' : 'Them', 
            message: newMsg.content,
            timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isFromUser: newMsg.sender_id === userId
          });
        }
      )
      .subscribe();
  }
};
