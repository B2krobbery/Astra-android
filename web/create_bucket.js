import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://xpkkathtikucwtyjzfja.supabase.co', 'sb_publishable_7C4Qmq1NFC93t-d0UG2xqw_UIQvVYrQ');

async function main() {
  const { data, error } = await supabase.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  });
  
  if (error) {
    console.error("Error creating bucket:", error);
  } else {
    console.log("Bucket created successfully:", data);
  }
}

main();
