const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://miihpahygrefwynniuxj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paWhwYWh5Z3JlZnd5bm5pdXhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk1NTg2NiwiZXhwIjoyMDg4NTMxODY2fQ.eaWyzJEbff9pWBrUGt2-iAIWBY12cEsbKUVxErlwhTc',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function check() {
  const { data, error } = await supabaseAdmin.rpc('run_sql', {
    sql_query: `
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'profiles' AND tc.constraint_type = 'FOREIGN KEY';
    `
  });
  console.log(data || error);
}

check();
