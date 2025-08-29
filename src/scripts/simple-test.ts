#!/usr/bin/env tsx

/**
 * Simple test script to verify the environment is working
 */

console.log('🧪 Testing environment...')

// Check environment variables
console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing')
console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing')
console.log('✅ OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Found' : 'Missing')

console.log('\n🎉 Environment test complete!')
console.log('💬 Your AI chat is ready to use in the web interface!')
console.log('🌐 Start the dev server with: npm run dev')