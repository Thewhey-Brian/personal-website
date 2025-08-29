import { z } from 'zod'
import { hybridSearch, semanticSearch } from './embeddings'
import { getNodeGraph, getGraphStats } from './graph'
import { supabase } from './supabase'
import { allPublications, allProjects } from 'contentlayer/generated'

// Tool schemas for the AI agent
export const toolSchemas = {
  search_content: z.object({
    query: z.string().describe('The search query to find relevant content'),
    type: z.enum(['publication', 'project', 'photo', 'all']).optional().describe('Type of content to search'),
    limit: z.number().optional().default(10).describe('Maximum number of results to return')
  }),

  get_graph: z.object({
    nodeId: z.string().describe('The ID of the node to get the knowledge graph for'),
    depth: z.number().optional().default(1).describe('Depth of relationships to include')
  }),

  open_media: z.object({
    url: z.string().describe('URL or ID of the media to open'),
    type: z.enum(['pdf', 'image', 'video']).optional().describe('Type of media')
  }),

  render_gallery: z.object({
    filter: z.object({
      album: z.string().optional().describe('Filter by album name'),
      tags: z.array(z.string()).optional().describe('Filter by tags'),
      limit: z.number().optional().default(20).describe('Maximum number of photos')
    }).describe('Gallery filter options')
  }),

  summarize_pdf: z.object({
    url: z.string().describe('URL of the PDF to summarize'),
    maxLength: z.number().optional().default(500).describe('Maximum length of summary in words')
  })
}

// Tool implementations
export const toolImplementations = {
  search_content: async ({ query, type, limit }: z.infer<typeof toolSchemas.search_content>) => {
    try {
      // Use hybrid search for best results
      const results = await hybridSearch(
        query, 
        limit, 
        type === 'all' ? undefined : type
      )

      // Format results for the agent
      const formattedResults = results.combined.map(result => ({
        type: result.object_type,
        id: result.object_id,
        title: result.metadata.title || 'Untitled',
        summary: result.chunk.slice(0, 200) + (result.chunk.length > 200 ? '...' : ''),
        url: result.metadata.url,
        relevance: result.similarity || result.score || 0,
        metadata: {
          year: result.metadata.year,
          venue: result.metadata.venue,
          status: result.metadata.status,
          tags: result.metadata.tags || [],
          stack: result.metadata.stack || []
        }
      }))

      return {
        results: formattedResults,
        totalFound: results.combined.length,
        query,
        searchType: type || 'all'
      }
    } catch (error) {
      console.error('Search content tool error:', error)
      return {
        error: 'Failed to search content',
        results: [],
        totalFound: 0
      }
    }
  },

  get_graph: async ({ nodeId, depth }: z.infer<typeof toolSchemas.get_graph>) => {
    try {
      const graphData = await getNodeGraph(nodeId, depth)
      const stats = await getGraphStats()

      return {
        centralNode: nodeId,
        nodes: graphData.nodes.map(node => ({
          id: node.id,
          type: node.type,
          label: node.label,
          metadata: node.metadata
        })),
        edges: graphData.edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          relation: edge.relation,
          weight: edge.weight
        })),
        stats: {
          nodesInGraph: graphData.nodes.length,
          edgesInGraph: graphData.edges.length,
          totalNodes: stats.totalNodes,
          totalEdges: stats.totalEdges
        }
      }
    } catch (error) {
      console.error('Get graph tool error:', error)
      return {
        error: 'Failed to retrieve knowledge graph',
        centralNode: nodeId,
        nodes: [],
        edges: [],
        stats: { nodesInGraph: 0, edgesInGraph: 0, totalNodes: 0, totalEdges: 0 }
      }
    }
  },

  open_media: async ({ url, type }: z.infer<typeof toolSchemas.open_media>) => {
    try {
      // This tool prepares media for display
      // In a real implementation, you might validate URLs, check file types, etc.
      
      return {
        mediaUrl: url,
        mediaType: type || detectMediaType(url),
        status: 'ready',
        instructions: 'Media is ready to be displayed to the user'
      }
    } catch (error) {
      console.error('Open media tool error:', error)
      return {
        error: 'Failed to open media',
        mediaUrl: url,
        status: 'error'
      }
    }
  },

  render_gallery: async ({ filter }: z.infer<typeof toolSchemas.render_gallery>) => {
    try {
      let query = supabase
        .from('photos')
        .select('id, image_url, caption, album, tags, created_at')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filter.album) {
        query = query.eq('album', filter.album)
      }

      if (filter.tags && filter.tags.length > 0) {
        query = query.contains('tags', filter.tags)
      }

      if (filter.limit) {
        query = query.limit(filter.limit)
      }

      const { data: photos, error } = await query

      if (error) {
        // Fallback to sample data if database query fails
        const samplePhotos = [
          {
            id: '1',
            image_url: '/photos/sample1.jpg',
            caption: 'Sample landscape photo',
            album: 'Landscapes',
            tags: ['landscape', 'nature'],
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            image_url: '/photos/sample2.jpg', 
            caption: 'Sample street photography',
            album: 'Street',
            tags: ['street', 'urban'],
            created_at: new Date().toISOString()
          }
        ]

        return {
          photos: samplePhotos,
          totalCount: samplePhotos.length,
          appliedFilters: filter,
          source: 'sample_data'
        }
      }

      return {
        photos: photos || [],
        totalCount: photos?.length || 0,
        appliedFilters: filter,
        source: 'database'
      }
    } catch (error) {
      console.error('Render gallery tool error:', error)
      return {
        error: 'Failed to render gallery',
        photos: [],
        totalCount: 0,
        appliedFilters: filter
      }
    }
  },

  summarize_pdf: async ({ url, maxLength }: z.infer<typeof toolSchemas.summarize_pdf>) => {
    try {
      // For now, return a mock summary since PDF processing requires additional setup
      // In production, you would use a PDF processing library or service
      
      // Check if this is a known publication PDF
      const publication = allPublications.find(pub => pub.pdfUrl === url)
      
      if (publication) {
        const summary = publication.abstract.length > maxLength 
          ? publication.abstract.slice(0, maxLength) + '...'
          : publication.abstract

        return {
          title: publication.title,
          summary,
          pageCount: 'Unknown',
          source: 'publication_metadata',
          url
        }
      }

      return {
        title: 'PDF Document',
        summary: 'PDF summarization requires additional setup. This would normally extract and summarize the PDF content using OpenAI or other document processing services.',
        pageCount: 'Unknown',
        source: 'placeholder',
        url,
        note: 'PDF processing not fully implemented in this demo'
      }
    } catch (error) {
      console.error('Summarize PDF tool error:', error)
      return {
        error: 'Failed to summarize PDF',
        title: 'Unknown Document',
        summary: '',
        url
      }
    }
  }
}

// Helper function to detect media type from URL
function detectMediaType(url: string): 'pdf' | 'image' | 'video' | 'unknown' {
  const extension = url.split('.').pop()?.toLowerCase()
  
  if (extension === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image'
  if (['mp4', 'webm', 'mov', 'avi'].includes(extension || '')) return 'video'
  
  return 'unknown'
}

// Tool descriptions for the AI agent
export const toolDescriptions = {
  search_content: 'Search through publications, projects, and photos using semantic and keyword search. Returns relevant content with metadata and relevance scores.',
  get_graph: 'Retrieve knowledge graph data for a specific node, showing related entities and relationships. Useful for exploring connections between topics, technologies, venues, etc.',
  open_media: 'Prepare media (PDFs, images, videos) for display to the user. Returns media information and display instructions.',
  render_gallery: 'Query and display photo galleries with filtering options. Can filter by album, tags, or other criteria.',
  summarize_pdf: 'Generate a summary of a PDF document. Useful for quickly understanding research papers or documents.'
}

export type ToolName = keyof typeof toolSchemas
export type ToolResult<T extends ToolName> = Awaited<ReturnType<typeof toolImplementations[T]>>