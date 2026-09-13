import { supabase } from '../lib/supabase';
import { MatchConversation, ChatMessage } from '../types';

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

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    // Parallel fetch last message per conversation
    const matchConversations = await Promise.all(
      otherParts.map(async part => {
        const rawProfile = profileMap.get(part.user_id);
        if (!rawProfile) return null;

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', part.conversation_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let avatarUrl = rawProfile.photo_url || '';
        if (!avatarUrl && rawProfile.avatar_storage_path) {
          if (rawProfile.avatar_storage_path.startsWith('http')) {
            avatarUrl = rawProfile.avatar_storage_path;
          } else {
            const { data: signedData } = await supabase.storage
              .from('avatars')
              .createSignedUrl(rawProfile.avatar_storage_path, 3600);
            if (signedData) avatarUrl = signedData.signedUrl;
          }
        }

        return {
          id: part.conversation_id,
          candidate: {
            id: rawProfile.id,
            name: rawProfile.display_name || 'Unknown',
            age: rawProfile.date_of_birth ? Math.max(18, new Date().getFullYear() - new Date(rawProfile.date_of_birth).getFullYear()) : 25,
            profession: rawProfile.profession || '',
            location: rawProfile.location || '',
            bio: rawProfile.bio || '',
            photoUrls: avatarUrl ? [avatarUrl] : [],
            isVerified: true,
            educationVerified: true,
            policeVerified: true,
            creditVerified: true,
            interests: [],
            education: rawProfile.higher_education || '',
            compatibilityScore: 90
          },
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
