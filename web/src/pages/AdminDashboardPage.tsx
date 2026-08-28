import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { Users, Heart, MessageSquare, TrendingUp, ShieldCheck, Share2, ArrowLeft, Bot, Megaphone } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminMetrics } = useAstra();

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
              Matchmaking KPIs & Analytics 📊
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Real-time Operations & Product Health Dashboard
            </span>
          </div>
        </div>

        {/* Sub-Nav */}
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
            onClick={() => navigate('/admin/marketing')}
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
            <Megaphone size={14} /> Campaigns
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '12px' }}>
        <div
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: 'rgba(24, 19, 41, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--accent-amber)' }}>
            <Users size={20} />
            <span style={{ fontSize: '0.65rem', color: '#4ADE80', fontWeight: 700 }}>+12%</span>
          </div>
          <h3 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px' }}>
            {adminMetrics.totalUsers.toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Total Users</span>
        </div>

        <div
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: 'rgba(24, 19, 41, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#818CF8' }}>
            <TrendingUp size={20} />
            <span style={{ fontSize: '0.65rem', color: '#4ADE80', fontWeight: 700 }}>Active</span>
          </div>
          <h3 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px' }}>
            {adminMetrics.activeDau.toLocaleString()}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Daily Active (DAU)</span>
        </div>

        <div
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: 'rgba(24, 19, 41, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#F43F5E' }}>
            <Heart size={20} />
            <span style={{ fontSize: '0.65rem', color: '#4ADE80', fontWeight: 700 }}>34.8% Rate</span>
          </div>
          <h3 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px' }}>
            {(adminMetrics.totalMatchesCreated / 1000).toFixed(0)}k
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Matches Created</span>
        </div>

        <div
          style={{
            padding: '16px',
            borderRadius: '20px',
            background: 'rgba(24, 19, 41, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FBBF24' }}>
            <Share2 size={20} />
            <span style={{ fontSize: '0.65rem', color: '#4ADE80', fontWeight: 700 }}>Viral</span>
          </div>
          <h3 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px' }}>
            {adminMetrics.referralKFactor}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Referral K-Factor</span>
        </div>
      </div>

      {/* Visual Data Charts Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Regional / Community Breakdown */}
        <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            background: 'rgba(24, 19, 41, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--accent-amber-light)' }}>
            Regional & Community Matchmaking Distribution (%)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(adminMetrics.regionalDistribution).map(([region, percent]) => (
              <div key={region} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#CBD5E1' }}>{region}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{percent}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.08)' }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      borderRadius: '9999px',
                      background: 'linear-gradient(90deg, var(--accent-amber) 0%, var(--accent-indigo) 100%)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification & Trust Funnel */}
        <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            background: 'rgba(24, 19, 41, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', color: '#818CF8' }}>
            Trust & Verification Funnel Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>🎓 DigiLocker Education Verified</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>88%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>🛡️ Police Character Certificate Verified</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4ADE80' }}>64%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>💳 Experian Prime Credit Score Badge</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FBBF24' }}>76%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
