import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://xpkkathtikucwtyjzfja.supabase.co', 'sb_publishable_7C4Qmq1NFC93t-d0UG2xqw_UIQvVYrQ');

async function test() {
  // Sign up a dummy user
  const email = `testuser_${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  
  if (authError) {
    console.error('Auth error:', authError);
    return;
  }
  
  const userId = authData.user.id;
  
  // Need to create a profile for them first so RLS passes?
  // Profiles usually have a trigger, let's assume it works.
  
  // Give it a second for triggers
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Logged in as', userId);
  
  // Test 1: With space
  const res1 = await supabase.from('interactions').upsert({
    actor_id: userId,
    target_id: '11111111-1111-4111-1111-111111111111',
    action_type: 'LIKE'
  }, {
    onConflict: 'actor_id, target_id'
  });
  
  console.log('Result with space:', res1.error?.message || 'Success');
  
  // Test 2: Without space
  const res2 = await supabase.from('interactions').upsert({
    actor_id: userId,
    target_id: '11111111-1111-4111-1111-111111111111',
    action_type: 'PASS'
  }, {
    onConflict: 'actor_id,target_id'
  });
  
  console.log('Result without space:', res2.error?.message || 'Success');
}

test();
