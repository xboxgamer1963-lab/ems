const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL() {
  const sql = `
    ALTER TABLE attendance ADD COLUMN IF NOT EXISTS break_start TIMESTAMPTZ;
    ALTER TABLE attendance ADD COLUMN IF NOT EXISTS total_break_seconds INTEGER DEFAULT 0;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    if (error.message.includes('function "exec_sql" does not exist')) {
        console.warn('RPC exec_sql not found. You may need to manually add these columns in Supabase: break_start (TIMESTAMPTZ), total_break_seconds (INTEGER)');
    } else {
        console.error('Error adding columns:', error);
    }
  } else {
    console.log('Columns added successfully');
  }
}

runSQL();
