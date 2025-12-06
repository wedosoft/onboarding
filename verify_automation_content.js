import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    db: { schema: 'onboarding' }
  }
);

async function verifyContent() {
  const { data, error } = await supabase
    .from('module_contents')
    .select('title_ko, section_type, level, estimated_minutes')
    .eq('module_id', 'd84102b8-c3a1-49de-878d-d03be03e1388')
    .order('display_order');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\nAutomation Module Content:');
  console.log('Total sections:', data.length);
  console.log('\nSections:');
  data.forEach((section, index) => {
    const num = index + 1;
    console.log(num + '. [' + section.section_type + '/' + section.level + '] ' + section.title_ko + ' (' + section.estimated_minutes + 'min)');
  });
}

verifyContent();
