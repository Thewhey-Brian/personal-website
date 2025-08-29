import { NextRequest, NextResponse } from 'next/server'
import { getNodeGraph, extractEntitiesFromContent, storeGraphData } from '@/lib/graph'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const depth = parseInt(searchParams.get('depth') || '1')

    // Try to get graph data from database
    let graphData = await getNodeGraph(id, depth)

    // If no data found, generate from content and store it
    if (graphData.nodes.length === 0) {
      console.log('No graph data found, generating from content...')
      
      try {
        const generatedGraph = extractEntitiesFromContent()
        await storeGraphData(generatedGraph)
        
        // Try to get the specific node graph again
        graphData = await getNodeGraph(id, depth)
      } catch (error) {
        console.error('Error generating graph data:', error)
        // Return empty graph if generation fails
        graphData = { nodes: [], edges: [] }
      }
    }

    return NextResponse.json(graphData)
  } catch (error) {
    console.error('Graph API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch graph data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Regenerate graph data for this node
    const generatedGraph = extractEntitiesFromContent()
    await storeGraphData(generatedGraph)
    
    // Return the updated graph for this node
    const graphData = await getNodeGraph(id)
    
    return NextResponse.json({
      message: 'Graph data regenerated successfully',
      ...graphData
    })
  } catch (error) {
    console.error('Graph regeneration error:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate graph data' },
      { status: 500 }
    )
  }
}