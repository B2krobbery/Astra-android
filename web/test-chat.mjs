import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xpkkathtikucwtyjzfja.supabase.co',
  'sb_publishable_7C4Qmq1NFC93t-d0UG2xqw_UIQvVYrQ'
);

async function test() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'visalvijay66@gmail.com',
    password: 'password123'
  });
  if (authErr) {
    console.error('Auth error', authErr);
    return;
  }
  const userId = authData.user.id;
  
  const { data: parts, error: partsErr } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);
    
  console.log('parts', parts, partsErr);
  
  const convoIds = parts.map(p => p.conversation_id);
  
  const { data: otherParts, error: otherErr } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', convoIds)
    .neq('user_id', userId);
    
  console.log('otherParts', otherParts, otherErr);
}
test();
