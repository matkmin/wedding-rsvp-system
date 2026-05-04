const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyyzllpzictxsctihkdx.supabase.co';
const supabaseAnonKey = 'sb_publishable_kbyixTFX98mDdw2KsKct9g_MlbD4Yr8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('Testing Supabase insert...');
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .insert([{ 
        name: 'Test Agent', 
        attendance: 'Hadir', 
        phone: '0123456789', 
        notes: 'Testing from script', 
        guests: 1 
      }]);

    if (error) {
      console.error('Insert Error:', error);
    } else {
      console.log('Insert successful! Data:', data);
    }
  } catch (err) {
    console.error('Caught Exception:', err);
  }
}

testInsert();
