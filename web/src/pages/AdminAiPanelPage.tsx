import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { Bot, Play, CheckCircle, Clock, ArrowLeft, Terminal, LayoutDashboard, Megaphone, Sparkles } from 'lucide-react';
import { AiBrainIllustration } from '../components/Illustrations';

export const AdminAiPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { aiAgents, runAiAgent } = useAstra();
  const [selectedAgentId, setSelectedAgentId] = useState(aiAgents[0].id);

  const activeAgent = aiAgents.find(a => a.id === selectedAgentId) || aiAgents[0];

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
              Astra Admin AI Control Panel 🤖
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Central Operations & Autonomous Agents Framework
            </span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
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
            <Megaphone size={14} /> Marketing
          </button>
        </div>
      </header>

      {/* Agents Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {aiAgents.map(agent => {
          const isSelected = agent.id === selectedAgentId;
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              style={{
                padding: '12px',
                borderRadius: '16px',
                background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? '1px solid var(--accent-amber)' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <Bot size={18} color={isSelected ? 'var(--accent-amber)' : '#94A3B8'} />
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: agent.status === 'RUNNING' ? '#FCD34D' : agent.status === 'COMPLETED' ? '#4ADE80' : '#94A3B8'
                  }}
                >
                  {agent.status}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? '#FFF' : '#CBD5E1' }}>
                {agent.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Workspace */}
      <div
        style={{
          padding: '20px',
          borderRadius: '24px',
          background: 'rgba(24, 19, 41, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="heading-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
              {activeAgent.name}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{activeAgent.role}</span>
          </div>

          <button
            onClick={() => runAiAgent(activeAgent.id)}
            disabled={activeAgent.status === 'RUNNING'}
            style={{
              padding: '10px 20px',
              borderRadius: '9999px',
              border: 'none',
              background: activeAgent.status === 'RUNNING' ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
              color: '#0F0C1B',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: activeAgent.status === 'RUNNING' ? 'default' : 'pointer'
            }}
          >
            {activeAgent.status === 'RUNNING' ? (
              <>
                <Sparkles size={16} className="spin-slow" /> Running...
              </>
            ) : (
              <>
                <Play size={16} fill="#0F0C1B" /> Trigger Agent Run
              </>
            )}
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.45 }}>
          {activeAgent.description}
        </p>

        {/* Prompt Configuration */}
        <div>
          <span style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
            AI Agent System Prompt Template
          </span>
          <textarea
            readOnly
            value={activeAgent.promptTemplate}
            rows={2}
            style={{
              width: '100%',
              marginTop: '6px',
              padding: '10px 14px',
              borderRadius: '14px',
              background: '#0F0C1B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#818CF8',
              fontFamily: 'monospace',
              fontSize: '0.8rem'
            }}
          />
        </div>

        {/* Real-time Execution Logs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Terminal size={16} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
              Live Agent Activity Logs
            </span>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: '16px',
              background: '#05030A',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxHeight: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            {activeAgent.logs.map((log, idx) => (
              <div key={idx} style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#A7F3D0' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
