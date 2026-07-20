const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('shared_documents')
    .select('*')
    .limit(3);

  if (error) {
    console.error('Error fetching shared_documents:', error);
  } else {
    console.log('Success! Shared documents columns:', Object.keys(data[0] || {}));
    console.log('First doc downloads_count:', data[0]?.downloads_count);
    console.log('Full data:', data);
  }
}

test();
