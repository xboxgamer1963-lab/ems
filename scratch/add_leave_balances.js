const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProfiles() {
  const sql = `
    ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS annual_leave_balance INTEGER DEFAULT 20,
    ADD COLUMN IF NOT EXISTS sick_leave_balance INTEGER DEFAULT 10,
    ADD COLUMN IF NOT EXISTS personal_leave_balance INTEGER DEFAULT 5;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Error updating profiles:', error);
  } else {
    console.log('Profiles updated with leave balances');
  }
}

updateProfiles();
