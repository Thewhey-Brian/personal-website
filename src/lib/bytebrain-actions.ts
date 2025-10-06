/**
 * ByteBrain AI Tool Actions
 * These tools enable ByteBrain to search, navigate, and interact with the website
 */

import { z } from 'zod'
import { hybridSearch } from './embeddings'
import { allPublications, allProjects } from 'contentlayer/generated'

// Tool parameter schemas
export const toolSchemas = {
  search_content: z.object({
    query: z.string().describe('Search query to find publications, projects, or content'),
    type: z.enum(['all', 'publication', 'project']).optional().describe('Type of content to search'),
    limit: z.number().optional().default(5).describe('Maximum number of results')
  }),

  get_related_content: z.object({
    contentId: z.string().describe('ID or slug of the content to find related items for'),
    contentType: z.enum(['publication', 'project']).describe('Type of the source content'),
    limit: z.number().optional().default(3).describe('Number of related items to return')
  }),

  summarize_content: z.object({
    contentId: z.string().describe('Slug or ID of the content to summarize'),
    contentType: z.enum(['publication', 'project']).describe('Type of content'),
  }),

  get_content_details: z.object({
    slug: z.string().describe('Slug of the content to retrieve'),
    type: z.enum(['publication', 'project']).describe('Type of content'),
  })
}

// Tool implementations
export const toolActions = {
  /**
   * Search across publications and projects using hybrid semantic + keyword search
   */
  search_content: async (params: z.infer<typeof toolSchemas.search_content>) => {
    try {
      const { query, type = 'all', limit = 5 } = params

      // Use hybrid search with embeddings
      const searchType = type === 'all' ? undefined : type as 'publication' | 'project'
      const results = await hybridSearch(query, limit, searchType)

      const formattedResults = results.combined.slice(0, limit).map(result => ({
        type: result.object_type,
        id: result.object_id,
        title: result.metadata.title || 'Untitled',
        snippet: result.chunk.slice(0, 200) + '...',
        url: result.metadata.url,
        relevanceScore: Math.round((result.similarity || result.score || 0) * 100),
        metadata: {
          year: result.metadata.year,
          venue: result.metadata.venue,
          status: result.metadata.status,
          tags: result.metadata.tags?.slice(0, 3),
          pdfUrl: result.metadata.pdfUrl,
          codeUrl: result.metadata.codeUrl,
          repoUrl: result.metadata.repoUrl
        }
      }))

      return {
        query,
        totalResults: results.combined.length,
        results: formattedResults,
        searchType: type,
        message: formattedResults.length > 0
          ? `Found ${formattedResults.length} relevant ${type === 'all' ? 'items' : type + 's'}`
          : 'No results found. Try different keywords!'
      }
    } catch (error) {
      console.error('Search tool error:', error)
      return {
        error: 'Search temporarily unavailable',
        query: params.query,
        results: []
      }
    }
  },

  /**
   * Find content related to a specific publication or project
   */
  get_related_content: async (params: z.infer<typeof toolSchemas.get_related_content>) => {
    const { contentId, contentType, limit = 3 } = params

    try {
      // Find the source content
      const sourceContent = contentType === 'publication'
        ? allPublications.find(p => p.slug === contentId)
        : allProjects.find(p => p.slug === contentId)

      if (!sourceContent) {
        return { error: 'Content not found', contentId, related: [] }
      }

      // Create search query from tags and title
      const searchQuery = [
        sourceContent.title,
        ...sourceContent.tags
      ].join(' ')

      // Search for related content using embeddings
      const results = await hybridSearch(searchQuery, limit + 1)

      // Filter out the source content and get related items
      const related = results.combined
        .filter(r => r.object_id !== contentId)
        .slice(0, limit)
        .map(r => ({
          type: r.object_type,
          id: r.object_id,
          title: r.metadata.title,
          url: r.metadata.url,
          similarity: Math.round((r.similarity || 0) * 100),
          tags: r.metadata.tags?.slice(0, 3)
        }))

      return {
        sourceContent: {
          id: contentId,
          type: contentType,
          title: sourceContent.title
        },
        related,
        message: related.length > 0
          ? `Found ${related.length} related items`
          : 'No related content found'
      }
    } catch (error) {
      console.error('Related content error:', error)
      return {
        error: 'Unable to find related content',
        contentId,
        related: []
      }
    }
  },

  /**
   * Get detailed summary of a publication or project
   */
  summarize_content: async (params: z.infer<typeof toolSchemas.summarize_content>) => {
    const { contentId, contentType } = params

    const content = contentType === 'publication'
      ? allPublications.find(p => p.slug === contentId)
      : allProjects.find(p => p.slug === contentId)

    if (!content) {
      return { error: 'Content not found', contentId }
    }

    if (contentType === 'publication') {
      const pub = content as typeof allPublications[0]
      return {
        type: 'publication',
        title: pub.title,
        summary: pub.abstract,
        year: pub.year,
        venue: pub.venue,
        tags: pub.tags,
        url: pub.url,
        pdfUrl: pub.pdfUrl,
        codeUrl: pub.codeUrl,
        authors: 'Xinyu Guo et al.',
        keyTakeaway: `This ${pub.year} research published in ${pub.venue} explores ${pub.abstract.slice(0, 150)}...`
      }
    } else {
      const proj = content as typeof allProjects[0]
      return {
        type: 'project',
        title: proj.title,
        summary: proj.summary,
        status: proj.status,
        technologies: proj.stack,
        tags: proj.tags,
        url: proj.url,
        repoUrl: proj.repoUrl,
        demoUrl: proj.demoUrl,
        keyTakeaway: `${proj.status === 'completed' ? 'Completed' : 'Ongoing'} project using ${proj.stack.slice(0, 3).join(', ')}`
      }
    }
  },

  /**
   * Get full details of specific content
   */
  get_content_details: async (params: z.infer<typeof toolSchemas.get_content_details>) => {
    const { slug, type } = params

    const content = type === 'publication'
      ? allPublications.find(p => p.slug === slug)
      : allProjects.find(p => p.slug === slug)

    if (!content) {
      return { error: 'Content not found', slug }
    }

    return {
      ...content,
      type,
      message: `Retrieved details for "${content.title}"`
    }
  }
}

export type ToolName = keyof typeof toolSchemas
export type ToolResult<T extends ToolName> = Awaited<ReturnType<typeof toolActions[T]>>
