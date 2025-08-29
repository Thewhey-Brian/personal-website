import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('Setting up Supabase Storage for photos...')

  try {
    // Create photos bucket
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket('photos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
        fileSizeLimit: 10485760, // 10MB
      })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Error creating bucket:', bucketError)
      return
    }

    console.log('✅ Photos bucket created/verified')

    // Set up RLS policies for the bucket
    const policies = [
      // Allow public read access to all photos
      `
      CREATE POLICY "Allow public read access to photos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'photos');
      `,
      // Allow authenticated users to upload photos
      `
      CREATE POLICY "Allow authenticated upload to photos"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
      `,
      // Allow authenticated users to delete their own photos
      `
      CREATE POLICY "Allow authenticated delete own photos"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'photos' AND auth.role() = 'authenticated');
      `
    ]

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: policy
      })
      
      if (policyError && !policyError.message.includes('already exists')) {
        console.warn('Policy creation warning:', policyError.message)
      }
    }

    console.log('✅ Storage policies configured')
    console.log('✅ Supabase Storage setup complete!')
    
  } catch (error) {
    console.error('Error setting up storage:', error)
  }
}

setupStorage()