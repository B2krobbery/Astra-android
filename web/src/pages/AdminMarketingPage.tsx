import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { Megaphone, Plus, ArrowLeft, Bot, LayoutDashboard, Send, Check } from 'lucide-react';

export const AdminMarketingPage: React.FC = () => {
  const navigate = useNavigate();
  const { marketingCampaigns, addMarketingCampaign } = useAstra();

  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<'PUSH_NOTIFICATION' | 'EMAIL' | 'SOCIAL_AD' | 'REFERRAL_BOOST'>('PUSH_NOTIFICATION');
  const [target, setTarget] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addMarketingCampaign({
        title,
        channel,
        targetAudience: target || 'All Active Feed Users',
        status: 'ACTIVE'
      });
      setTitle('');
      setTarget('');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0914',
        color: '#F8FAFC',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/discover')}
            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="heading-font" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
              Marketing & Growth Suite 📣
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Automated Push Campaigns & Referral Distribution
            </span>
          </div>
        </div>

        {/* Sub Nav */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate('/admin/ai-agents')}
            style={{
              padding: '8px 12px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFF',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Bot size={14} /> AI Panel
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{
              padding: '8px 12px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFF',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <LayoutDashboard size={14} /> Analytics
          </button>
        </div>
      </header>

      {/* Campaign Creator Form */}
      <div
        style={{
          padding: '20px',
          borderRadius: '24px',
          background: 'rgba(24, 19, 41, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--accent-amber-light)' }}>
          Create New Automated AI Campaign
        </h3>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Campaign Title / Notification Copy</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Rohini & Ashwini stars are 90% aligned today!"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                background: '#0F0C1B',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFF',
                fontSize: '0.9rem',
                marginTop: '4px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Channel</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#0F0C1B',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFF',
                  fontSize: '0.85rem',
                  marginTop: '4px'
                }}
              >
                <option value="PUSH_NOTIFICATION">Push Notification</option>
                <option value="REFERRAL_BOOST">Referral Reward Boost</option>
                <option value="EMAIL">Email Blast</option>
                <option value="SOCIAL_AD">Social Ad Creative</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Target Audience</label>
              <input
                type="text"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="e.g. Malayali & Kerala Community"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#0F0C1B',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFF',
                  fontSize: '0.85rem',
                  marginTop: '4px'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            style={{
              marginTop: '8px',
              padding: '12px',
              borderRadius: '9999px',
              border: 'none',
              background: title.trim() ? 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)' : 'rgba(255, 255, 255, 0.1)',
              color: title.trim() ? '#0F0C1B' : '#94A3B8',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: title.trim() ? 'pointer' : 'default'
            }}
          >
            <Send size={16} /> Launch Automated Campaign
          </button>
        </form>
      </div>

      {/* Campaigns List */}
      <div>
        <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px' }}>
          Active & Scheduled Campaigns ({marketingCampaigns.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {marketingCampaigns.map(camp => (
            <div
              key={camp.id}
              style={{
                padding: '14px 18px',
                borderRadius: '18px',
                background: 'rgba(24, 19, 41, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber-light)', fontWeight: 700 }}>
                    {camp.channel}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{camp.targetAudience}</span>
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>{camp.title}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4ADE80' }}>
                  {camp.conversions.toLocaleString()} Converted
                </span>
                <p style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Reach: {camp.reach.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
