import { supabase } from '../lib/supabase';
import { CommunityRoom, RoomCategory, RoomMessage, RoomParticipant } from '../types';
import { LocationService } from './LocationService';

export interface CreateRoomInput {
  name: string;
  category: RoomCategory;
  description?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  maxParticipants?: number;
}

export const RoomService = {
  /**
   * Fetch all active community rooms, with participant count, join status, and distance.
   */
  async getActiveRooms(userLat?: number, userLng?: number, categoryFilter?: string): Promise<CommunityRoom[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;

      let query = supabase
        .from('community_rooms')
        .select(`
          id,
          creator_id,
          name,
          category,
          description,
          location_name,
          latitude,
          longitude,
          radius_km,
          max_participants,
          is_active,
          expires_at,
          created_at
        `)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (categoryFilter && categoryFilter !== 'ALL') {
        query = query.eq('category', categoryFilter);
      }

      const { data: roomsData, error: roomsError } = await query;
      if (roomsError) {
        console.error('[RoomService] getActiveRooms error:', roomsError);
        return [];
      }

      if (!roomsData || roomsData.length === 0) return [];

      const roomIds = roomsData.map(r => r.id);
      const creatorIds = Array.from(new Set(roomsData.map(r => r.creator_id)));

      // Fetch participants for participant count and user's joined status
      const { data: participantsData } = await supabase
        .from('room_participants')
        .select('room_id, user_id, role')
        .in('room_id', roomIds);

      // Fetch creator profiles
      const { data: creatorsData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_storage_path')
        .in('id', creatorIds);

      const creatorMap: Record<string, { name: string; avatar?: string }> = {};
      creatorsData?.forEach(c => {
        creatorMap[c.id] = {
          name: c.display_name || 'Anonymous',
          avatar: c.avatar_storage_path || undefined
        };
      });

      // Group participants by room
      const countsByRoom: Record<string, number> = {};
      const userJoinedSet = new Set<string>();

      participantsData?.forEach(p => {
        countsByRoom[p.room_id] = (countsByRoom[p.room_id] || 0) + 1;
        if (currentUserId && p.user_id === currentUserId) {
          userJoinedSet.add(p.room_id);
        }
      });

      return roomsData.map(r => {
        let distanceKm: number | undefined = undefined;
        if (
          userLat !== undefined &&
          userLng !== undefined &&
          r.latitude !== null &&
          r.longitude !== null &&
          r.latitude !== undefined &&
          r.longitude !== undefined
        ) {
          distanceKm = LocationService.haversineDistanceKm(
            userLat,
            userLng,
            Number(r.latitude),
            Number(r.longitude)
          );
        }

        const creator = creatorMap[r.creator_id];

        return {
          id: r.id,
          creatorId: r.creator_id,
          creatorName: creator?.name || 'Creator',
          creatorAvatar: creator?.avatar,
          name: r.name,
          category: r.category as RoomCategory,
          description: r.description || undefined,
          locationName: r.location_name || 'Nearby',
          latitude: r.latitude ? Number(r.latitude) : undefined,
          longitude: r.longitude ? Number(r.longitude) : undefined,
          radiusKm: r.radius_km || 25,
          maxParticipants: r.max_participants || 15,
          participantCount: countsByRoom[r.id] || 1,
          isJoined: userJoinedSet.has(r.id),
          distanceKm,
          isActive: r.is_active,
          expiresAt: r.expires_at,
          createdAt: r.created_at
        };
      });
    } catch (err) {
      console.error('[RoomService] Unexpected error in getActiveRooms:', err);
      return [];
    }
  },

  /**
   * Create a new community room.
   */
  async createRoom(input: CreateRoomInput): Promise<CommunityRoom> {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;
    if (!currentUserId) throw new Error('Authentication required');

    // Attempt RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_community_room', {
      p_name: input.name,
      p_category: input.category,
      p_description: input.description || null,
      p_location_name: input.locationName || 'Nearby',
      p_latitude: input.latitude || null,
      p_longitude: input.longitude || null,
      p_max_participants: input.maxParticipants || 15
    });

    if (!rpcError && rpcData?.id) {
      return {
        id: rpcData.id,
        creatorId: currentUserId,
        name: input.name,
        category: input.category,
        description: input.description,
        locationName: input.locationName || 'Nearby',
        latitude: input.latitude,
        longitude: input.longitude,
        radiusKm: input.radiusKm || 25,
        maxParticipants: input.maxParticipants || 15,
        participantCount: 1,
        isJoined: true,
        isActive: true,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
    }

    // Direct insert fallback
    const { data: insertedRoom, error: insertError } = await supabase
      .from('community_rooms')
      .insert({
        creator_id: currentUserId,
        name: input.name,
        category: input.category,
        description: input.description,
        location_name: input.locationName || 'Nearby',
        latitude: input.latitude,
        longitude: input.longitude,
        max_participants: input.maxParticipants || 15
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Join room as creator
    await supabase.from('room_participants').insert({
      room_id: insertedRoom.id,
      user_id: currentUserId,
      role: 'creator'
    });

    return {
      id: insertedRoom.id,
      creatorId: currentUserId,
      name: insertedRoom.name,
      category: insertedRoom.category,
      description: insertedRoom.description,
      locationName: insertedRoom.location_name,
      latitude: insertedRoom.latitude ? Number(insertedRoom.latitude) : undefined,
      longitude: insertedRoom.longitude ? Number(insertedRoom.longitude) : undefined,
      radiusKm: insertedRoom.radius_km,
      maxParticipants: insertedRoom.max_participants,
      participantCount: 1,
      isJoined: true,
      isActive: insertedRoom.is_active,
      expiresAt: insertedRoom.expires_at,
      createdAt: insertedRoom.created_at
    };
  },

  /**
   * Join an active community room.
   */
  async joinRoom(roomId: string): Promise<boolean> {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;
    if (!currentUserId) throw new Error('Authentication required');

    const { error: rpcError } = await supabase.rpc('join_community_room', {
      p_room_id: roomId
    });

    if (rpcError) {
      // Direct insert fallback
      const { error: insertError } = await supabase
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: currentUserId,
          role: 'member'
        });
      if (insertError && !insertError.message.includes('duplicate')) {
        throw insertError;
      }
    }

    return true;
  },

  /**
   * Leave a community room.
   */
  async leaveRoom(roomId: string): Promise<boolean> {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;
    if (!currentUserId) throw new Error('Authentication required');

    const { error: rpcError } = await supabase.rpc('leave_community_room', {
      p_room_id: roomId
    });

    if (rpcError) {
      const { error } = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', currentUserId);
      if (error) throw error;
    }

    return true;
  },

  /**
   * Fetch messages for a specific room.
   */
  async getRoomMessages(roomId: string): Promise<RoomMessage[]> {
    const { data, error } = await supabase
      .from('room_messages')
      .select(`
        id,
        room_id,
        sender_id,
        content,
        created_at
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('[RoomService] getRoomMessages error:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    const senderIds = Array.from(new Set(data.map(m => m.sender_id)));
    const { data: senders } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_storage_path')
      .in('id', senderIds);

    const senderMap: Record<string, { name: string; avatar?: string }> = {};
    senders?.forEach(s => {
      senderMap[s.id] = {
        name: s.display_name || 'Member',
        avatar: s.avatar_storage_path || undefined
      };
    });

    return data.map(m => ({
      id: m.id,
      roomId: m.room_id,
      senderId: m.sender_id,
      senderName: senderMap[m.sender_id]?.name || 'Member',
      senderAvatar: senderMap[m.sender_id]?.avatar,
      content: m.content,
      createdAt: m.created_at
    }));
  },

  /**
   * Send a message to a room.
   */
  async sendRoomMessage(roomId: string, content: string): Promise<RoomMessage> {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;
    if (!currentUserId) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('room_messages')
      .insert({
        room_id: roomId,
        sender_id: currentUserId,
        content: content.trim()
      })
      .select()
      .single();

    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_storage_path')
      .eq('id', currentUserId)
      .single();

    return {
      id: data.id,
      roomId: data.room_id,
      senderId: data.sender_id,
      senderName: profile?.display_name || 'You',
      senderAvatar: profile?.avatar_storage_path || undefined,
      content: data.content,
      createdAt: data.created_at
    };
  },

  /**
   * Subscribe to real-time messages in a room.
   */
  subscribeToRoomMessages(
    roomId: string,
    onMessage: (msg: RoomMessage) => void
  ): () => void {
    const channel = supabase
      .channel(`room-chat-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newRow = payload.new as any;
          if (!newRow) return;

          // Fetch sender display details
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_storage_path')
            .eq('id', newRow.sender_id)
            .single();

          onMessage({
            id: newRow.id,
            roomId: newRow.room_id,
            senderId: newRow.sender_id,
            senderName: profile?.display_name || 'Member',
            senderAvatar: profile?.avatar_storage_path || undefined,
            content: newRow.content,
            createdAt: newRow.created_at
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
