// Quick Supabase connection test
// Run this in your browser console to test the connection

console.log('🧪 Testing Supabase connection...');

// Test 1: Check if Supabase client is created
try {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    'https://digital-garden.supabase.co',
    'sb_secret_9BJx8W0dkcQ6eEbbHHA8mA_4Hyu5Ayy'
  );
  console.log('✅ Supabase client created successfully');
  
  // Test 2: Try a simple query
  const { data, error } = await supabase.from('user_tasks').select('count').limit(1);
  if (error) {
    console.error('❌ Supabase query error:', error);
  } else {
    console.log('✅ Supabase query successful:', data);
  }
  
  // Test 3: Try authentication
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  
  if (authError) {
    console.error('❌ Supabase auth error:', authError);
  } else {
    console.log('✅ Supabase auth test successful:', authData);
  }
  
} catch (error) {
  console.error('❌ Supabase connection failed:', error);
}
