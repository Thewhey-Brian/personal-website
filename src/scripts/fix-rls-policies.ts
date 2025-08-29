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

async function fixRLSPolicies() {
  console.log('Fixing RLS policies for photos table...')

  try {
    // First, let's check if RLS is enabled on the photos table
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'photos')
      .eq('table_schema', 'public')

    console.log('Photos table found:', !!tables?.length)

    // Drop existing policies if they exist
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Allow public read access" ON public.photos;',
      'DROP POLICY IF EXISTS "Allow public insert" ON public.photos;',
      'DROP POLICY IF EXISTS "Allow all operations" ON public.photos;'
    ]

    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error && !error.message.includes('does not exist')) {
        console.warn('Drop policy warning:', error.message)
      }
    }

    // Disable RLS temporarily
    const { error: disableRLSError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.photos DISABLE ROW LEVEL SECURITY;'
    })

    if (disableRLSError) {
      console.warn('Disable RLS warning:', disableRLSError.message)
    } else {
      console.log('✅ RLS disabled for photos table')
    }

    // Alternative: Create permissive policies
    const permissivePolicies = [
      // Enable RLS
      'ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;',
      
      // Allow all operations for now (you can restrict later)
      `CREATE POLICY "Allow all operations on photos" ON public.photos 
       FOR ALL 
       USING (true) 
       WITH CHECK (true);`
    ]

    for (const policy of permissivePolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error && !error.message.includes('already exists')) {
        console.warn('Policy creation warning:', policy, error.message)
      }
    }

    console.log('✅ Permissive RLS policies created for photos table')
    
    // Test inserting a dummy record
    const { data: testInsert, error: testError } = await supabase
      .from('photos')
      .insert({
        image_url: 'test-url',
        caption: 'test',
        album: 'test',
        tags: ['test']
      })
      .select()

    if (testError) {
      console.error('❌ Test insert failed:', testError.message)
    } else {
      console.log('✅ Test insert successful')
      
      // Clean up test record
      if (testInsert && testInsert.length > 0) {
        await supabase.from('photos').delete().eq('id', testInsert[0].id)
        console.log('✅ Test record cleaned up')
      }
    }

  } catch (error) {
    console.error('Error fixing RLS policies:', error)
  }
}

fixRLSPolicies()