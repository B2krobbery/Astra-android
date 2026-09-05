import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://xpkkathtikucwtyjzfja.supabase.co', 'sb_publishable_7C4Qmq1NFC93t-d0UG2xqw_UIQvVYrQ');

async function test() {
  const { data, error } = await supabase.from('interactions').upsert({
    actor_id: '619449c7-61b7-4ead-9c8c-8c21fdb59495',
    target_id: '11111111-1111-4111-1111-111111111111',
    action_type: 'LIKE'
  }, {
    onConflict: 'actor_id, target_id'
  });
  
  console.log('Error with space:', error?.message || error);
}

test();
