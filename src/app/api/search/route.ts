import { NextRequest, NextResponse } from 'next/server'
import { hybridSearch, semanticSearch } from '@/lib/embeddings'
import { allPublications, allProjects } from 'contentlayer/generated'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') as 'publication' | 'project' | 'photo' | undefined
    const method = searchParams.get('method') || 'hybrid' // hybrid, semantic, keyword
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    let results: { semantic?: unknown[]; keyword?: unknown[]; combined?: unknown[] } = {}

    if (method === 'semantic') {
      // Pure semantic search
      const semanticResults = await semanticSearch(query, limit, type)
      results = { semantic: semanticResults }
    } else if (method === 'hybrid') {
      // Hybrid search (semantic + keyword)
      results = await hybridSearch(query, limit, type)
    } else {
      // Fallback to content-based search if embeddings not available
      results = await fallbackContentSearch(query, type, limit)
    }

    // Enrich results with full content metadata
    const enrichedResults = await enrichSearchResults(results)

    return NextResponse.json(enrichedResults)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error during search' }, 
      { status: 500 }
    )
  }
}

/**
 * Fallback search using Contentlayer data when embeddings aren't available
 */
async function fallbackContentSearch(
  query: string, 
  type?: string, 
  limit = 10
): Promise<{ semantic: never[]; keyword: never[]; combined: unknown[] }> {
  const searchTerm = query.toLowerCase()
  let results: unknown[] = []

  // Search publications
  if (!type || type === 'publication') {
    const pubResults = allPublications
      .filter(pub => 
        pub.title.toLowerCase().includes(searchTerm) ||
        pub.abstract.toLowerCase().includes(searchTerm) ||
        pub.venue.toLowerCase().includes(searchTerm) ||
        pub.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .map(pub => ({
        object_type: 'publication',
        object_id: pub.slug,
        chunk: pub.abstract,
        score: pub.title.toLowerCase().includes(searchTerm) ? 1 : 0.7,
        source: 'fallback',
        metadata: {
          title: pub.title,
          year: pub.year,
          venue: pub.venue,
          url: pub.url
        }
      }))
    
    results = results.concat(pubResults)
  }

  // Search projects
  if (!type || type === 'project') {
    const projResults = allProjects
      .filter(proj => 
        proj.title.toLowerCase().includes(searchTerm) ||
        proj.summary.toLowerCase().includes(searchTerm) ||
        proj.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        proj.stack.some(tech => tech.toLowerCase().includes(searchTerm))
      )
      .map(proj => ({
        object_type: 'project',
        object_id: proj.slug,
        chunk: proj.summary,
        score: proj.title.toLowerCase().includes(searchTerm) ? 1 : 0.7,
        source: 'fallback',
        metadata: {
          title: proj.title,
          status: proj.status,
          stack: proj.stack,
          url: proj.url
        }
      }))
    
    results = results.concat(projResults)
  }

  // Sort by relevance and limit
  results.sort((a: any, b: any) => b.score - a.score)
  
  return {
    semantic: [],
    keyword: [],
    combined: results.slice(0, limit)
  }
}

/**
 * Enrich search results with full content metadata
 */
async function enrichSearchResults(results: { semantic?: unknown[]; keyword?: unknown[]; combined?: unknown[] }): Promise<{ semantic: unknown[]; keyword: unknown[]; combined: unknown[] }> {
  const enrichResults = (items: any[]) => {
    return items.map((item: any) => {
      let enrichedMetadata = { ...item.metadata }

      // Find full content for publications
      if (item.object_type === 'publication') {
        const pub = allPublications.find(p => p.slug === item.object_id)
        if (pub) {
          enrichedMetadata = {
            ...enrichedMetadata,
            title: pub.title,
            year: pub.year,
            venue: pub.venue,
            tags: pub.tags,
            url: pub.url,
            featured: pub.featured,
            pdfUrl: pub.pdfUrl,
            codeUrl: pub.codeUrl
          }
        }
      }

      // Find full content for projects
      if (item.object_type === 'project') {
        const proj = allProjects.find(p => p.slug === item.object_id)
        if (proj) {
          enrichedMetadata = {
            ...enrichedMetadata,
            title: proj.title,
            status: proj.status,
            stack: proj.stack,
            tags: proj.tags,
            url: proj.url,
            featured: proj.featured,
            repoUrl: proj.repoUrl,
            demoUrl: proj.demoUrl
          }
        }
      }

      return {
        ...item,
        metadata: enrichedMetadata
      }
    })
  }

  return {
    semantic: enrichResults(results.semantic || []),
    keyword: enrichResults(results.keyword || []),
    combined: enrichResults(results.combined || [])
  }
}