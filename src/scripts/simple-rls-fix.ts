import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testAndFixPermissions() {
  console.log('Testing photo upload permissions...')

  try {
    // Test direct insert with service role key
    const { data, error } = await supabase
      .from('photos')
      .insert({
        image_url: 'https://example.com/test.jpg',
        caption: 'Test photo upload',
        album: 'Test Album',
        tags: ['test', 'upload']
      })
      .select()

    if (error) {
      console.error('❌ Insert failed:', error.message)
      console.log('This suggests RLS is blocking even service role inserts')
    } else {
      console.log('✅ Insert successful with service role key')
      
      // Clean up test record
      if (data && data.length > 0) {
        await supabase.from('photos').delete().eq('id', data[0].id)
        console.log('✅ Test record cleaned up')
      }
    }

    // Test with anonymous client (what the frontend uses)
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    
    const { data: anonData, error: anonError } = await anonSupabase
      .from('photos')
      .insert({
        image_url: 'https://example.com/test-anon.jpg',
        caption: 'Test anon upload',
        album: 'Test Album',
        tags: ['test', 'anon']
      })
      .select()

    if (anonError) {
      console.error('❌ Anonymous insert failed:', anonError.message)
      console.log('💡 This is expected - RLS is blocking anonymous inserts')
      console.log('💡 Solution: We need to modify the upload component to use the service role or set up proper auth')
    } else {
      console.log('✅ Anonymous insert successful')
      
      // Clean up test record
      if (anonData && anonData.length > 0) {
        await anonSupabase.from('photos').delete().eq('id', anonData[0].id)
        console.log('✅ Anonymous test record cleaned up')
      }
    }

  } catch (error) {
    console.error('Error testing permissions:', error)
  }
}

testAndFixPermissions()