import { OpenAI } from 'openai'
import { supabase } from './supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface EmbeddingContent {
  objectType: 'publication' | 'project' | 'photo'
  objectId: string
  chunk: string
  metadata?: Record<string, any>
}

/**
 * Generate embeddings for a text chunk using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' '),
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

/**
 * Split text into chunks for embedding
 */
export function splitIntoChunks(text: string, maxChunkSize = 1000): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const chunks: string[] = []
  let currentChunk = ''
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (currentChunk.length + trimmedSentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = trimmedSentence
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks.length > 0 ? chunks : [text] // Fallback to original text if no chunks
}

/**
 * Store embeddings in Supabase
 */
export async function storeEmbeddings(contents: EmbeddingContent[]): Promise<void> {
  const embeddingPromises = contents.map(async (content) => {
    const chunks = splitIntoChunks(content.chunk)
    
    return Promise.all(chunks.map(async (chunk) => {
      const embedding = await generateEmbedding(chunk)
      
      return {
        object_type: content.objectType,
        object_id: content.objectId,
        chunk,
        embedding: `[${embedding.join(',')}]`, // PostgreSQL array format
        metadata: content.metadata || {}
      }
    }))
  })
  
  const allEmbeddings = (await Promise.all(embeddingPromises)).flat()
  
  const { error } = await supabase
    .from('embeddings')
    .upsert(allEmbeddings, { 
      onConflict: 'object_type,object_id,chunk',
      ignoreDuplicates: false 
    })
  
  if (error) {
    console.error('Error storing embeddings:', error)
    throw error
  }
}

/**
 * Perform semantic search using embeddings
 */
export async function semanticSearch(
  query: string, 
  limit = 10,
  objectType?: 'publication' | 'project' | 'photo'
): Promise<Array<{
  object_type: string
  object_id: string
  chunk: string
  similarity: number
  metadata: Record<string, any>
}>> {
  try {
    const queryEmbedding = await generateEmbedding(query)
    
    let rpcQuery = supabase.rpc('match_documents', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: 0.7,
      match_count: limit
    })
    
    if (objectType) {
      rpcQuery = rpcQuery.eq('object_type', objectType)
    }
    
    const { data, error } = await rpcQuery
    
    if (error) {
      console.error('Error in semantic search:', error)
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error('Semantic search failed:', error)
    return []
  }
}

/**
 * Perform hybrid search (semantic + keyword)
 */
export async function hybridSearch(
  query: string,
  limit = 10,
  objectType?: 'publication' | 'project' | 'photo'
): Promise<{
  semantic: Array<any>
  keyword: Array<any>
  combined: Array<any>
}> {
  try {
    // Semantic search
    const semanticResults = await semanticSearch(query, Math.ceil(limit / 2), objectType)
    
    // Keyword search (using PostgreSQL full-text search)
    let keywordQuery = supabase
      .from('embeddings')
      .select('object_type, object_id, chunk, metadata')
      .textSearch('chunk', query)
      .limit(Math.ceil(limit / 2))
    
    if (objectType) {
      keywordQuery = keywordQuery.eq('object_type', objectType)
    }
    
    const { data: keywordResults, error } = await keywordQuery
    
    if (error) {
      console.error('Error in keyword search:', error)
    }
    
    // Combine and deduplicate results
    const combinedMap = new Map()
    
    // Add semantic results with higher weight
    semanticResults.forEach((result, index) => {
      const key = `${result.object_type}-${result.object_id}`
      combinedMap.set(key, {
        ...result,
        score: 1 - (index * 0.1), // Higher score for earlier results
        source: 'semantic'
      })
    })
    
    // Add keyword results with lower weight if not already present
    keywordResults?.forEach((result, index) => {
      const key = `${result.object_type}-${result.object_id}`
      if (!combinedMap.has(key)) {
        combinedMap.set(key, {
          ...result,
          score: 0.5 - (index * 0.05),
          source: 'keyword'
        })
      }
    })
    
    const combined = Array.from(combinedMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
    
    return {
      semantic: semanticResults,
      keyword: keywordResults || [],
      combined
    }
  } catch (error) {
    console.error('Hybrid search failed:', error)
    return {
      semantic: [],
      keyword: [],
      combined: []
    }
  }
}