const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://miihpahygrefwynniuxj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paWhwYWh5Z3JlZnd5bm5pdXhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk1NTg2NiwiZXhwIjoyMDg4NTMxODY2fQ.eaWyzJEbff9pWBrUGt2-iAIWBY12cEsbKUVxErlwhTc',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function test() {
  const email = `test-${Date.now()}@test.com`;
  console.log('Creating user:', email);
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }
  
  console.log('User created:', authUser.user.id);
  
  console.log('Checking if profile was auto-created...');
  const { data: existingProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', authUser.user.id);
  console.log('Existing profile:', existingProfile);

  // create org
  const { data: org, error: orgError } = await supabaseAdmin.from('organizations').insert({ name: 'Test Org', slug: 'test-org-' + Date.now() }).select().single();
  if (orgError) {
    console.error('Org Error:', orgError);
    return;
  }

  console.log('Inserting into profiles...');
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authUser.user.id,
    full_name: 'Test User',
    email: email,
    role: 'admin',
    organization_id: org.id
  });

  if (profileError) {
    console.error('Profile Insert Error:', profileError);
    
    console.log('Trying UPDATE instead...');
    const { error: updateError } = await supabaseAdmin.from('profiles').update({
      full_name: 'Test User',
      role: 'admin',
      organization_id: org.id
    }).eq('id', authUser.user.id);
    console.log('Update Error:', updateError);
  } else {
    console.log('Profile inserted successfully!');
  }
}

test();
