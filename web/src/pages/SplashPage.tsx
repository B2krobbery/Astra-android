import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CelestialLogo } from '../components/CelestialLogo';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';
import { Sparkles, ShieldCheck, ArrowRight, Heart, Users } from 'lucide-react';
import { CosmicBackgroundCanvas } from '../components/CosmicBackgroundCanvas';
import { AuthService } from '../services/auth';
import { supabase } from '../lib/supabase';
import { useAstra } from '../context/AstraContext';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUserIntent, sessionUser } = useAstra();

  // Auth State
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'EmailLogin' | 'EmailSignup' | 'Phone'>('EmailSignup');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Gateway State
  const [selectedIntent, setSelectedIntent] = useState<'Dating' | 'Marriage' | 'Login'>('Marriage');

  useEffect(() => {
    const checkSessionAndRoute = async () => {
      if (sessionUser) {
        setIsLoading(true);
        try {
          const { data: profile } = await supabase.from('profiles').select('onboarding_completed, intent').eq('id', sessionUser.id).single();
          
          if (profile?.onboarding_completed) {
            navigate('/discover');
          } else {
            if (profile?.intent === 'Marriage') {
              navigate('/marriage-onboarding');
            } else {
              navigate('/onboarding-typeform');
            }
          }
        } catch (err) {
          console.error('Failed to route based on session:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    checkSessionAndRoute();
  }, [sessionUser, navigate]);

  const handleSendOtp = async () => {

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

  const handleEmailAuth = async () => {
    if (!email || password.length < 6) return setErrorMsg('Enter a valid email and 6+ char password');
    if (loginMethod === 'EmailSignup' && password !== confirmPassword) {
      return setErrorMsg('Passwords do not match');
    }
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      let sessionData = null;
      if (loginMethod === 'EmailSignup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        sessionData = data;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        sessionData = data;
      }

      setIsPhoneModalOpen(false);
      
      if (sessionData?.user) {
        const { data: profile } = await supabase.from('profiles').select('onboarding_completed, intent').eq('id', sessionData.user.id).single();
        
        if (profile?.onboarding_completed) {
          navigate('/discover');
        } else {
          const finalIntent = selectedIntent === 'Login' ? 'Marriage' : selectedIntent;
          // upsert intent
          await supabase.from('profiles').upsert({ id: sessionData.user.id, intent: finalIntent });
          
          if (finalIntent === 'Marriage') {
            navigate('/marriage-onboarding');
          } else {
            navigate('/onboarding-typeform');
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await AuthService.signInWithGoogleNative();
      if (result.cancelled) {
        setIsLoading(false);
        return;
      }
      if (result.error) {
        throw result.error;
      }

      setIsPhoneModalOpen(false);

      if (result.data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, intent')
          .eq('id', result.data.user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          navigate('/discover');
        } else {
          const finalIntent = selectedIntent === 'Login' ? (profile?.intent || 'Marriage') : selectedIntent;
          await supabase.from('profiles').upsert({
            id: result.data.user.id,
            intent: finalIntent,
            display_name: result.data.user.user_metadata?.full_name || result.data.user.user_metadata?.name || undefined
          });

          if (finalIntent === 'Marriage') {
            navigate('/marriage-onboarding');
          } else {
            navigate('/onboarding-typeform');
          }
        }
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMsg(err.message || 'Google Sign-In failed');
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
      <CosmicBackgroundCanvas />

      {isPhoneModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 12, 27, 0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#1E1836', width: '100%', maxWidth: '360px', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
            <h3 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              {loginMethod === 'EmailSignup' ? 'Create Account' : loginMethod === 'EmailLogin' ? 'Sign In' : isOtpSent ? 'Verify Phone Number' : 'Enter Phone Number'}
            </h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' }}>
              <button 
                onClick={() => setLoginMethod('EmailSignup')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: loginMethod === 'EmailSignup' ? '#E11D48' : 'transparent', color: loginMethod === 'EmailSignup' ? '#FFF' : '#94A3B8', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Sign Up
              </button>
              <button 
                onClick={() => setLoginMethod('EmailLogin')}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: loginMethod === 'EmailLogin' ? '#E11D48' : 'transparent', color: loginMethod === 'EmailLogin' ? '#FFF' : '#94A3B8', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Sign In
              </button>
            </div>

            {errorMsg && <div style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}>{errorMsg}</div>}

            {loginMethod === 'EmailSignup' || loginMethod === 'EmailLogin' ? (
              <>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', color: '#FFF', fontSize: '1rem', width: '100%', outline: 'none' }}
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: loginMethod === 'EmailSignup' ? '12px' : '16px', color: '#FFF', fontSize: '1rem', width: '100%', outline: 'none' }}
                />
                {loginMethod === 'EmailSignup' && (
                  <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', color: '#FFF', fontSize: '1rem', width: '100%', outline: 'none' }}
                  />
                )}
                <PrimaryButton onClick={handleEmailAuth}>
                  {isLoading ? 'Loading...' : loginMethod === 'EmailSignup' ? 'Create Account' : 'Sign In'}
                </PrimaryButton>
              </>
            ) : (
              !isOtpSent ? (
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
              )
            )}

            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0 12px 0', gap: '8px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#FFFFFF',
                color: '#1F2937',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s',
                gap: '10px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

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
        
        <PrimaryButton onClick={() => { setSelectedIntent('Dating'); setLoginMethod('EmailSignup'); setIsPhoneModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #F43F5E, #FB923C)', display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Heart size={20} /> Dating</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Lighter Experience</span>
        </PrimaryButton>

        <PrimaryButton onClick={() => { setSelectedIntent('Marriage'); setLoginMethod('EmailSignup'); setIsPhoneModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> Marriage</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Serious Matrimonial</span>
        </PrimaryButton>

        <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', gap: '8px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />
        </div>

        <button
          type="button"
          onClick={() => { setSelectedIntent('Marriage'); handleGoogleAuth(); }}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '14px 20px',
            backgroundColor: '#FFFFFF',
            color: '#1F2937',
            border: 'none',
            borderRadius: '16px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            gap: '12px',
            transition: 'all 0.2s'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {isLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div style={{ marginTop: '8px' }}>
          <SecondaryOutlineButton onClick={() => { setSelectedIntent('Login'); setLoginMethod('EmailLogin'); setIsPhoneModalOpen(true); }}>
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
