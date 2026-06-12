import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

// Manually parse .env file
let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
      if (key === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = val;
    }
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing in .env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Connecting to Supabase at:", supabaseUrl);
  try {
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('*');

    if (fetchError) {
      console.error("Error fetching posts:", fetchError);
      process.exit(1);
    }

    console.log(`Found ${posts.length} posts. Checking authors...`);
    let updatedCount = 0;

    for (const post of posts) {
      if (post.author === 'Coach Sarah' || post.author === 'Coach Dave') {
        console.log(`Updating author for post "${post.title}" (ID: ${post.id}) to BHYou...`);
        const { error: updateError } = await supabase
          .from('posts')
          .update({ author: 'BHYou' })
          .eq('id', post.id);

        if (updateError) {
          console.error(`Error updating post ${post.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }

    console.log(`Successfully updated ${updatedCount} posts in Supabase.`);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
