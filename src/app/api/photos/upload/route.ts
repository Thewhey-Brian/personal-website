import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string
    const album = formData.get('album') as string
    const tags = formData.get('tags') as string
    const adminKey = formData.get('adminKey') as string

    // Check admin authentication
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized: Invalid admin key' }, { status: 401 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('photos')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('photos')
      .getPublicUrl(filePath)

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : []

    // Insert into database using admin client
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('photos')
      .insert({
        image_url: publicUrl,
        caption: caption || null,
        album: album || null,
        tags: parsedTags,
        exif: null
      })
      .select()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      photo: dbData[0],
      message: 'Photo uploaded successfully' 
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}