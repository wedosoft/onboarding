import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iusmdodvhtvmyuziuuhp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1c21kb2R2aHR2bXl1eml1dWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MjMyNzAsImV4cCI6MjA0ODk5OTI3MH0.QGGn-DVaX1RAJ7J_hPqphyZfIBp5w_Y5RkBVmXQP0eg',
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
