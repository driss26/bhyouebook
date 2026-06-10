const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bvndufrwljyllmwlswsf.supabase.co';
const supabaseAnonKey = 'sb_publishable_y8lTUURupN5Idp_ho8QPXw_0kF4BGmZ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing Supabase connection...");
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .limit(5);

    if (error) {
      console.error("Supabase Error:", error);
    } else {
      console.log("Supabase Success! Data:", data);
    }
  } catch (err) {
    console.error("Unexpected Error:", err);
  }
}

test();
