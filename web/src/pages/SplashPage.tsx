import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CelestialLogo } from '../components/CelestialLogo';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';
import { Sparkles, ShieldCheck, ArrowRight, Heart, Users } from 'lucide-react';
import { CosmicBackgroundCanvas } from '../components/CosmicBackgroundCanvas';
import { FloatingHeartsBackground } from '../components/FloatingHeartsBackground';
import { AuthService } from '../services/auth';
import { supabase } from '../lib/supabase';
import { useAstra } from '../context/AstraContext';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUserIntent } = useAstra();

  // Auth State
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Gateway State
  const [selectedIntent, setSelectedIntent] = useState<'Dating' | 'Marriage' | 'Login'>('Marriage');

  const handleSendOtp = async () => {
    // TEMPORARY BYPASS FOR TESTING
    if (selectedIntent === 'Marriage' || selectedIntent === 'Dating') {
      setUserIntent(selectedIntent);
    }
    if (selectedIntent === 'Marriage') {
      navigate('/marriage-onboarding');
    } else {
      navigate('/onboarding-typeform');
    }
    return;

    const rawPhone = phoneNumber.replace(/\D/g, '');
    if (rawPhone.length < 10) return setErrorMsg('Enter a valid 10-digit number');
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { error } = await AuthService.signInWithOtp('+91' + rawPhone);
      if (error) throw error;
      setIsOtpSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP. Check Supabase connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) return setErrorMsg('Enter the 6-digit OTP');
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { data: sessionData, error } = await AuthService.verifyOtp('+91' + phoneNumber.replace(/\D/g, ''), otpCode);
      if (error) throw error;
      
      setIsPhoneModalOpen(false);
      
      // Smart Routing based on DB Profile
      if (sessionData?.user) {
        const { data: profile } = await supabase.from('profiles').select('onboarding_completed, intent').eq('id', sessionData.user.id).single();
        
        if (profile?.onboarding_completed) {
          navigate('/discover');
        } else {
          // Update intent if they selected one
          const finalIntent = selectedIntent === 'Login' ? 'Marriage' : selectedIntent;
          await supabase.from('profiles').update({ intent: finalIntent }).eq('id', sessionData.user.id);
          
          if (finalIntent === 'Marriage') {
            navigate('/marriage-onboarding');
          } else {
            navigate('/onboarding-typeform'); // Fallback for dating
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: '32px 24px',
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0F0C1B',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <FloatingHeartsBackground />
      <CosmicBackgroundCanvas />

      {isPhoneModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 12, 27, 0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#1E1836', width: '100%', maxWidth: '360px', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
            <h3 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              {isOtpSent ? 'Verify Phone Number' : 'Enter Phone Number'}
            </h3>
            
            {errorMsg && <div style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>{errorMsg}</div>}

            {!isOtpSent ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
                  <span style={{ color: '#94A3B8', marginRight: '8px', fontSize: '1rem' }}>+91</span>
                  <input 
                    type="tel" 
                    placeholder="99999 99999" 
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '1rem', width: '100%', outline: 'none' }}
                  />
                </div>
                <PrimaryButton onClick={handleSendOtp}>
                  {isLoading ? 'Sending...' : 'Send Secure OTP'}
                </PrimaryButton>
              </>
            ) : (
              <>
                <input 
                  type="number" 
                  placeholder="6-digit code" 
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', color: '#FFF', fontSize: '1.2rem', width: '100%', outline: 'none', textAlign: 'center', letterSpacing: '4px', fontWeight: 800 }}
                />
                <PrimaryButton onClick={handleVerifyOtp}>
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </PrimaryButton>
              </>
            )}

            <button 
              onClick={() => { setIsPhoneModalOpen(false); setIsOtpSent(false); setErrorMsg(''); }}
              style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.9rem', width: '100%', marginTop: '16px', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 5 }}>
        <CelestialLogo size="large" />

        <p
          style={{
            maxWidth: '300px',
            marginTop: '20px',
            fontSize: '0.95rem',
            color: 'rgba(248, 250, 252, 0.85)',
            lineHeight: 1.5
          }}
        >
          Modern Matchmaking, Guided by the Stars ✨
          <br />
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', zIndex: 5 }}>
        <h3 style={{ color: 'white', fontSize: '1.1rem', textAlign: 'center', marginBottom: '4px', fontWeight: 700 }}>Choose Your Path</h3>
        
        <PrimaryButton onClick={() => { setSelectedIntent('Dating'); setIsPhoneModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #F43F5E, #FB923C)', display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Heart size={20} /> Dating</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Lighter Experience</span>
        </PrimaryButton>

        <PrimaryButton onClick={() => { setSelectedIntent('Marriage'); setIsPhoneModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> Marriage</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Serious Matrimonial</span>
        </PrimaryButton>

        <div style={{ marginTop: '12px' }}>
          <SecondaryOutlineButton onClick={() => { setSelectedIntent('Login'); setIsPhoneModalOpen(true); }}>
            Already have an account? Sign In
          </SecondaryOutlineButton>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'rgba(248, 250, 252, 0.6)', marginTop: '8px' }}>
          <ShieldCheck size={14} color="var(--accent-amber)" /> Verified Trust Badges & Background Checks
        </div>
      </div>
    </div>
  );
};
