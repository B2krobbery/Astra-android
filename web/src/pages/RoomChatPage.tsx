import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Users, MapPin, Sparkles, LogOut } from 'lucide-react';
import { CommunityRoom, RoomMessage } from '../types';
import { RoomService } from '../services/RoomService';
import { useAstra } from '../context/AstraContext';

export const RoomChatPage: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessionUser, userProfile, userCoords, themeMode } = useAstra();

  // If in Marriage mode, redirect to Matches
  useEffect(() => {
    if (userProfile.intent === 'Marriage') {
      navigate('/matches', { replace: true });
    }
  }, [userProfile.intent, navigate]);

  const [room, setRoom] = useState<CommunityRoom | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load Room Details and Initial Messages
  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;
    setIsLoading(true);

    const loadRoomData = async () => {
      try {
        const rooms = await RoomService.getActiveRooms(userCoords?.latitude, userCoords?.longitude);
        const currentRoom = rooms.find(r => r.id === roomId);
        if (isMounted) {
          if (currentRoom) {
            setRoom(currentRoom);
            setIsJoined(!!currentRoom.isJoined);
          }
        }

        const msgs = await RoomService.getRoomMessages(roomId);
        if (isMounted) {
          setMessages(msgs);
          setIsLoading(false);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error('Failed to load room details:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadRoomData();

    // Subscribe to Realtime messages
    const unsubscribe = RoomService.subscribeToRoomMessages(roomId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(scrollToBottom, 50);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [roomId]);

  const handleJoin = async () => {
    if (!roomId || isJoining) return;
    setIsJoining(true);
    try {
      await RoomService.joinRoom(roomId);
      setIsJoined(true);
      setRoom(prev => prev ? { ...prev, participantCount: (prev.participantCount || 1) + 1, isJoined: true } : prev);
    } catch (err: any) {
      alert(err.message || 'Failed to join room.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!roomId) return;
    const confirmLeave = window.confirm('Are you sure you want to leave this activity room?');
    if (!confirmLeave) return;

    try {
      await RoomService.leaveRoom(roomId);
      setIsJoined(false);
      setRoom(prev => prev ? { ...prev, participantCount: Math.max(1, (prev.participantCount || 2) - 1), isJoined: false } : prev);
    } catch (err: any) {
      alert(err.message || 'Failed to leave room.');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const sentMsg = await RoomService.sendRoomMessage(roomId, text);
      setMessages(prev => {
        if (prev.some(m => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setInputText(text); // restore
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const categoryEmoji: Record<string, string> = {
    'Sports': '🏏',
    'Chai & Coffee': '☕',
    'Fitness': '🏸',
    'Social': '🗣️',
    'Music': '🎵',
    'Tech': '💻',
    'Other': '✨'
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        position: 'relative'
      }}
    >
      {/* Fixed Chat Header */}
      <header
        style={{
          padding: 'calc(12px + env(safe-area-inset-top, 0px)) 16px 12px 16px',
          background: themeMode === 'LIGHT' ? 'rgba(255, 245, 247, 0.95)' : 'rgba(15, 12, 27, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <button
            onClick={() => navigate('/matches?tab=rooms')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <span style={{ fontSize: '1.4rem' }}>
            {room?.category ? (categoryEmoji[room.category] || '✨') : '🏏'}
          </span>

          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: 'var(--accent-amber-light)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                margin: 0
              }}
            >
              {room?.name || 'Community Room'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Users size={11} /> {room?.participantCount || 1}/{room?.maxParticipants || 15}
              </span>
              {room?.distanceKm !== undefined && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#4ADE80' }}>
                  <MapPin size={10} /> {room.distanceKm < 1 ? '<1 km' : `${room.distanceKm} km`}
                </span>
              )}
              {room?.locationName && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                  • {room.locationName}
                </span>
              )}
            </div>
          </div>
        </div>

        {isJoined && (
          <button
            onClick={handleLeave}
            title="Leave Room"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F87171',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <LogOut size={14} />
          </button>
        )}
      </header>

      {/* Room Details / Description Banner */}
      {room?.description && (
        <div
          style={{
            padding: '8px 16px',
            background: 'rgba(245, 158, 11, 0.08)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={14} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{room.description}</span>
        </div>
      )}

      {/* Messages Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Sparkles size={28} className="spin-slow" color="var(--accent-amber)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.85rem' }}>Loading group chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🏏</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Welcome to {room?.name || 'the room'}!
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              No messages yet. Say hello and coordinate your activity!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = sessionUser?.id === msg.senderId;
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                {!isMe && (
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-amber-light)', fontWeight: 700, marginBottom: '2px', marginLeft: '6px' }}>
                    {msg.senderName}
                  </span>
                )}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe
                      ? 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)'
                      : 'var(--bg-card)',
                    border: isMe ? 'none' : '1px solid var(--border-color)',
                    color: isMe ? '#0B0B0E' : 'var(--text-primary)',
                    fontSize: '0.88rem',
                    lineHeight: '1.35',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.content}
                </div>
                <span
                  style={{
                    fontSize: '0.62rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                    marginRight: isMe ? '4px' : '0',
                    marginLeft: !isMe ? '4px' : '0'
                  }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input / Join Bar */}
      <div
        style={{
          padding: '10px 16px calc(14px + env(safe-area-inset-bottom, 0px)) 16px',
          background: themeMode === 'LIGHT' ? 'rgba(255, 245, 247, 0.98)' : 'rgba(15, 12, 27, 0.98)',
          borderTop: '1px solid var(--border-color)',
          zIndex: 20
        }}
      >
        {!isJoined ? (
          <button
            onClick={handleJoin}
            disabled={isJoining}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '9999px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
              color: '#0B0B0E',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: isJoining ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)'
            }}
          >
            <Sparkles size={18} />
            {isJoining ? 'Joining Room...' : 'Join Room to Chat & Participate'}
          </button>
        ) : (
          <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Send message to group..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: 'none',
                background: inputText.trim() ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.1)',
                color: inputText.trim() ? '#0B0B0E' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'default',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
