import { z } from 'zod'
import { getSiteContent } from './content-indexer'
import { hybridSearch } from './embeddings'
import { supabase } from './supabase'

// Enhanced tool schemas for ByteBrain
export const bytebrainToolSchemas = {
  navigate_site: z.object({
    destination: z.enum(['about', 'publications', 'projects', 'photos', 'search', 'home']).describe('Page to navigate to'),
    specificContent: z.string().optional().describe('Specific content ID or slug to highlight')
  }),

  search_content: z.object({
    query: z.string().describe('What to search for'),
    type: z.enum(['publication', 'project', 'photo', 'all']).optional().default('all').describe('Type of content'),
    limit: z.number().optional().default(5).describe('Max results to return')
  }),

  render_gallery: z.object({
    album: z.string().optional().describe('Album name to filter by'),
    tags: z.array(z.string()).optional().describe('Tags to filter by'),
    limit: z.number().optional().default(12).describe('Number of photos')
  }),

  summarize_content: z.object({
    contentId: z.string().describe('ID or URL of content to summarize'),
    contentType: z.enum(['publication', 'project', 'pdf']).describe('Type of content'),
    style: z.enum(['brief', 'detailed', 'accessible']).optional().default('accessible').describe('Summary style')
  }),

  recommend_content: z.object({
    basedOn: z.string().describe('Content or topic to base recommendations on'),
    type: z.enum(['publication', 'project', 'photo', 'all']).optional().default('all'),
    count: z.number().optional().default(3).describe('Number of recommendations')
  })
}

// Enhanced tool implementations
export const bytebrainToolImplementations = {
  navigate_site: async ({ destination, specificContent }: z.infer<typeof bytebrainToolSchemas.navigate_site>) => {
    const siteContent = await getSiteContent()
    
    const pages = {
      home: { 
        url: '/', 
        description: "Brian's homepage with latest updates and featured content" 
      },
      about: { 
        url: '/about', 
        description: "Learn about Brian's background, education, and research journey" 
      },
      publications: { 
        url: '/publications', 
        description: `Explore ${siteContent.publications.length} research publications` 
      },
      projects: { 
        url: '/projects', 
        description: `Browse ${siteContent.projects.length} coding and research projects` 
      },
      photos: { 
        url: '/photos', 
        description: `View ${siteContent.photos.length} photos from various collections` 
      },
      search: { 
        url: '/search', 
        description: "Advanced search across all content types" 
      }
    }

    const pageInfo = pages[destination]
    let specificUrl = pageInfo.url

    // Handle specific content navigation
    if (specificContent && destination !== 'home' && destination !== 'search') {
      if (destination === 'publications') {
        const pub = siteContent.publications.find(p => 
          p.id.includes(specificContent) || p.title.toLowerCase().includes(specificContent.toLowerCase())
        )
        if (pub) specificUrl = pub.url
      } else if (destination === 'projects') {
        const project = siteContent.projects.find(p => 
          p.id.includes(specificContent) || p.title.toLowerCase().includes(specificContent.toLowerCase())
        )
        if (project) specificUrl = project.url
      }
    }

    return {
      destination,
      url: specificUrl,
      description: pageInfo.description,
      specificContent: specificContent || null,
      instruction: `I'm directing you to ${pageInfo.description}. Click this link to go there: [${destination.charAt(0).toUpperCase() + destination.slice(1)}](${specificUrl})`,
      contentPreview: destination === 'publications' ? 
        siteContent.publications.slice(0, 3).map(p => ({ title: p.title, year: p.year })) :
        destination === 'projects' ?
        siteContent.projects.slice(0, 3).map(p => ({ title: p.title, status: p.status })) :
        null
    }
  },

  search_content: async ({ query, type, limit }: z.infer<typeof bytebrainToolSchemas.search_content>) => {
    try {
      const results = await hybridSearch(query, limit, type === 'all' ? undefined : type)
      
      const formattedResults = results.combined.slice(0, limit).map(result => ({
        type: result.object_type,
        id: result.object_id,
        title: result.metadata.title || 'Untitled',
        snippet: result.chunk.slice(0, 150) + (result.chunk.length > 150 ? '...' : ''),
        url: result.metadata.url,
        relevance: Math.round((result.similarity || result.score || 0) * 100),
        metadata: {
          year: result.metadata.year,
          venue: result.metadata.venue,
          status: result.metadata.status,
          tags: result.metadata.tags?.slice(0, 3) || [],
          featured: result.metadata.featured
        }
      }))

      return {
        query,
        results: formattedResults,
        totalFound: results.combined.length,
        searchType: type,
        suggestion: formattedResults.length === 0 ? 
          "Try different keywords or check out the featured content instead!" :
          formattedResults.length === 1 ?
          "Found exactly what you're looking for!" :
          `Found ${formattedResults.length} great matches!`
      }
    } catch (error) {
      return {
        error: 'Search neurons are offline! Try again in a moment.',
        query,
        results: [],
        totalFound: 0
      }
    }
  },

  render_gallery: async ({ album, tags, limit }: z.infer<typeof bytebrainToolSchemas.render_gallery>) => {
    try {
      let query = supabase
        .from('photos')
        .select('id, image_url, caption, album, tags, created_at')
        .order('created_at', { ascending: false })

      if (album) query = query.eq('album', album)
      if (tags && tags.length > 0) query = query.contains('tags', tags)
      if (limit) query = query.limit(limit)

      const { data: photos, error } = await query

      if (error) {
        // Fallback sample data
        return {
          photos: [
            {
              id: '1',
              imageUrl: '/photos/sample1.jpg',
              caption: 'Sample photo - Photography feature coming soon!',
              album: 'Samples',
              tags: ['sample']
            }
          ],
          totalCount: 1,
          source: 'demo',
          message: "Photo gallery is in demo mode! Brian's working on uploading his collection."
        }
      }

      return {
        photos: photos?.map(p => ({
          id: p.id,
          imageUrl: p.image_url,
          caption: p.caption,
          album: p.album,
          tags: p.tags
        })) || [],
        totalCount: photos?.length || 0,
        appliedFilters: { album, tags },
        source: 'database',
        message: `Found ${photos?.length || 0} photos${album ? ` in "${album}" album` : ''}${tags ? ` tagged with ${tags.join(', ')}` : ''}!`
      }
    } catch (error) {
      return {
        error: 'Photo processing circuits overloaded! Try again soon.',
        photos: [],
        totalCount: 0
      }
    }
  },

  summarize_content: async ({ contentId, contentType, style }: z.infer<typeof bytebrainToolSchemas.summarize_content>) => {
    try {
      const siteContent = await getSiteContent()
      
      if (contentType === 'publication') {
        const pub = siteContent.publications.find(p => 
          p.id.includes(contentId) || p.url.includes(contentId)
        )
        
        if (pub) {
          const summary = style === 'brief' ? 
            pub.abstract.slice(0, 100) + '...' :
            style === 'detailed' ?
            pub.abstract :
            `This ${pub.year} research published in ${pub.venue} explores ${pub.abstract.slice(0, 200)}...`

          return {
            title: pub.title,
            summary,
            type: 'publication',
            metadata: {
              year: pub.year,
              venue: pub.venue,
              tags: pub.tags
            },
            readMoreUrl: pub.url,
            pdfUrl: pub.pdfUrl,
            insight: "This is one of Brian's research contributions to computational biology!"
          }
        }
      } else if (contentType === 'project') {
        const project = siteContent.projects.find(p => 
          p.id.includes(contentId) || p.url.includes(contentId)
        )
        
        if (project) {
          return {
            title: project.title,
            summary: project.summary,
            type: 'project',
            metadata: {
              status: project.status,
              stack: project.stack,
              tags: project.tags
            },
            demoUrl: project.demoUrl,
            repoUrl: project.repoUrl,
            insight: `This ${project.status} project showcases Brian's skills in ${project.stack?.slice(0, 3).join(', ')}!`
          }
        }
      }

      return {
        error: 'Content not found in my neural pathways!',
        title: 'Unknown Content',
        summary: 'Could not locate the requested content.'
      }
    } catch (error) {
      return {
        error: 'Summary circuits are overheating!',
        title: 'Processing Error',
        summary: 'Try again in a moment.'
      }
    }
  },

  recommend_content: async ({ basedOn, type, count }: z.infer<typeof bytebrainToolSchemas.recommend_content>) => {
    try {
      const siteContent = await getSiteContent()
      
      // Simple recommendation logic based on tags and keywords
      let recommendations: any[] = []
      
      if (type === 'all' || type === 'publication') {
        recommendations.push(...siteContent.publications
          .filter(p => 
            p.tags?.some(tag => basedOn.toLowerCase().includes(tag.toLowerCase())) ||
            p.title.toLowerCase().includes(basedOn.toLowerCase()) ||
            p.abstract.toLowerCase().includes(basedOn.toLowerCase())
          )
          .slice(0, count)
          .map(p => ({ ...p, type: 'publication' }))
        )
      }
      
      if (type === 'all' || type === 'project') {
        recommendations.push(...siteContent.projects
          .filter(p => 
            p.tags?.some(tag => basedOn.toLowerCase().includes(tag.toLowerCase())) ||
            p.stack?.some(tech => basedOn.toLowerCase().includes(tech.toLowerCase())) ||
            p.title.toLowerCase().includes(basedOn.toLowerCase()) ||
            p.summary?.toLowerCase().includes(basedOn.toLowerCase())
          )
          .slice(0, count)
          .map(p => ({ ...p, type: 'project' }))
        )
      }

      // If no direct matches, recommend featured content
      if (recommendations.length === 0) {
        recommendations = [
          ...siteContent.publications.filter(p => p.featured).slice(0, count),
          ...siteContent.projects.filter(p => p.featured).slice(0, count)
        ]
      }

      return {
        basedOn,
        recommendations: recommendations.slice(0, count).map(item => ({
          title: item.title,
          type: item.type,
          url: item.url,
          description: item.abstract || item.summary || 'No description available',
          metadata: {
            year: item.year,
            venue: item.venue,
            status: item.status,
            tags: item.tags?.slice(0, 3) || [],
            featured: item.featured
          }
        })),
        totalFound: recommendations.length,
        reasoning: recommendations.length > 0 ?
          `These relate to "${basedOn}" through shared themes and technologies!` :
          "No direct matches, but here's some of Brian's featured work instead!"
      }
    } catch (error) {
      return {
        error: 'Recommendation algorithms need a reboot!',
        basedOn,
        recommendations: [],
        totalFound: 0
      }
    }
  }
}

export type ByteBrainToolName = keyof typeof bytebrainToolSchemas
export type ByteBrainToolResult<T extends ByteBrainToolName> = Awaited<ReturnType<typeof bytebrainToolImplementations[T]>>