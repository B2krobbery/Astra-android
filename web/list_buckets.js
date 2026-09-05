import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://xpkkathtikucwtyjzfja.supabase.co', 'sb_publishable_7C4Qmq1NFC93t-d0UG2xqw_UIQvVYrQ');

async function main() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) console.error("Error listing buckets:", error);
  else console.log("Buckets:", data.map(b => b.name));
}

main();
