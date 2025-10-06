import { NextRequest, NextResponse } from 'next/server'
import { toolActions } from '@/lib/bytebrain-actions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('id')
    const contentType = searchParams.get('type') as 'publication' | 'project'

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'Missing required parameters: id and type' },
        { status: 400 }
      )
    }

    // Use the existing tool action for getting related content
    const result = await toolActions.get_related_content({
      contentId,
      contentType,
      limit: 3
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Related content API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
