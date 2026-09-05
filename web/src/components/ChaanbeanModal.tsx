import React, { useState } from 'react';
import { Shield, X, FileText, CheckCircle, Search, AlertCircle, CreditCard } from 'lucide-react';
import { Candidate } from '../types';

interface ChaanbeanModalProps {
  targetUser: Candidate | null;
  onDismiss: () => void;
}

export const ChaanbeanModal: React.FC<ChaanbeanModalProps> = ({ targetUser, onDismiss }) => {
  const [step, setStep] = useState(1);
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [consentGiven, setConsentGiven] = useState(false);

  const toggleCheck = (id: string) => {
    setSelectedChecks(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const checks = [
    { id: 'police', name: 'Criminal & Police Records', price: '₹999' },
    { id: 'credit', name: 'Financial & Credit Health', price: '₹499' },
    { id: 'education', name: 'Academic Credentials', price: '₹799' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onClick={onDismiss}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-card)',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          border: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-card)',
          animation: 'floatOrb 0.3s ease-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Search size={24} color="var(--accent-amber)" />
            </div>
            <div>
              <h3 className="heading-font" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Chaanbean™ MVP
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-amber-light)' }}>
                Comprehensive Background Verification
              </p>
            </div>
          </div>
          <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select the background checks you wish to request for <strong>{targetUser?.name || 'this profile'}</strong>. 
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {checks.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => toggleCheck(c.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${selectedChecks.includes(c.id) ? 'var(--accent-amber)' : 'var(--border-color)'}`,
                    background: selectedChecks.includes(c.id) ? 'rgba(245,158,11,0.1)' : 'var(--bg-secondary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{c.name}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-amber)' }}>{c.price}</span>
                </div>
              ))}
            </div>

            <button
              disabled={selectedChecks.length === 0}
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '9999px',
                border: 'none',
                background: selectedChecks.length === 0 ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
                color: selectedChecks.length === 0 ? 'var(--text-muted)' : '#0F0C1B',
                fontWeight: 700,
                marginTop: '8px',
                cursor: selectedChecks.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <AlertCircle size={18} color="#ef4444" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>Legal Consent Required</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Chaanbean requires explicit legal consent from the target profile to perform external verification via DigiLocker, CIBIL, or Police networks.
              </p>
            </div>

            <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="checkbox" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} style={{ marginTop: '4px' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                I understand this will send a consent request to {targetUser?.name || 'the user'}. The check will only proceed if they accept.
              </span>
            </label>

            <button
              disabled={!consentGiven}
              onClick={() => setStep(3)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '9999px',
                border: 'none',
                background: !consentGiven ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
                color: !consentGiven ? 'var(--text-muted)' : '#0F0C1B',
                fontWeight: 700,
                marginTop: '8px',
                cursor: !consentGiven ? 'not-allowed' : 'pointer'
              }}
            >
              Agree & Proceed to Payment
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
            <CreditCard size={48} color="var(--accent-amber)" />
            <h4 style={{ fontSize: '1.2rem', margin: 0 }}>Prototype Payment</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              (MOCK) In the production version, this will open a Razorpay/Stripe gateway for ₹{(selectedChecks.length * 799).toString()}. No real verification is performed in this MVP.
            </p>
            
            <button
              onClick={onDismiss}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent-amber) 0%, #D97706 100%)',
                color: '#0F0C1B',
                fontWeight: 700,
                marginTop: '8px',
                cursor: 'pointer'
              }}
            >
              Send Request (Simulated)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
