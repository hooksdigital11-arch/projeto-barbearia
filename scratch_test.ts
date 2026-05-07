import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfsntzwwzhxybqgbxmag.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmc250end3emh4eWJxZ2J4bWFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgwNTI5OSwiZXhwIjoyMDkzMzgxMjk5fQ.m0rT8Pavv3HO2aXFSNrvn9I54SQBuUM5JVR5syp-tgA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('get_admin_dashboard_kpis', {
    p_org_id: '123e4567-e89b-12d3-a456-426614174000', // Dummy UUID
    p_period: 'month',
    p_search: ''
  });

  console.log('Error:', error);
  console.log('Data:', data);
}

test();
