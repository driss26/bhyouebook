const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bvndufrwljyllmwlswsf.supabase.co';
const supabaseAnonKey = 'sb_publishable_y8lTUURupN5Idp_ho8QPXw_0kF4BGmZ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing Supabase insert...");
  const newLead = {
    id: 'lead-' + Date.now(),
    email: 'test_lead_agent@gmail.com',
    source: 'test_source',
    createdAt: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('leads')
      .insert(newLead);

    if (error) {
      console.error("Supabase Insert Error:", error.message);
    } else {
      console.log("Supabase Insert Success! Result data:", data);
      
      // Verify count
      const { data: selectData, error: selectError } = await supabase
        .from('leads')
        .select('*');
      console.log("Leads after insert:", selectData.length, selectData);
    }
  } catch (err) {
    console.error("Unexpected Error:", err.message);
  }
}

test();
