// Headless test mocks for Capacitor Preferences in Node
if (typeof window === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).window = {
    location: { origin: 'http://localhost:5173' },
    localStorage: {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    }
  };
}

import { AuthService } from '../src/services/auth';

async function runAuthTests() {
  console.log('Testing AuthService Google Authentication...');

  // 1. Check method exists
  if (typeof AuthService.signInWithGoogleNative !== 'function') {
    throw new Error('AuthService.signInWithGoogleNative is not a function');
  }
  console.log('✅ AuthService.signInWithGoogleNative is defined');

  if (typeof AuthService.signInWithGoogle !== 'function') {
    throw new Error('AuthService.signInWithGoogle is not a function');
  }
  console.log('✅ AuthService.signInWithGoogle is defined');

  // 2. Test Browser Fallback execution in Node/Web test environment
  // When running in Node/Vite (non-native), Capacitor.isNativePlatform() returns false
  const result = await AuthService.signInWithGoogleNative();
  console.log('Browser/Node execution result:', result);
  if (result.cancelled !== false) {
    throw new Error(`Expected cancelled to be false, got ${result.cancelled}`);
  }
  console.log('✅ Web/Non-native fallback handled correctly');

  console.log('🎉 All AuthService Google Authentication tests passed!');
}

runAuthTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
