const { createClient } = require('@supabase/supabase-js');

// Create admin client to bypass RLS for a moment to just verify DB logic
const supabase = createClient(
  'https://xpkkathtikucwtyjzfja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey... wait I don't have the service role key.
