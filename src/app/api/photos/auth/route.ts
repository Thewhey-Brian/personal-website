import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const adminKey = formData.get('adminKey') as string

    // Check admin authentication
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized: Invalid admin key' }, { status: 401 })
    }

    return NextResponse.json({ success: true, message: 'Authentication successful' })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}