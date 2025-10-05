#!/usr/bin/env tsx

/**
 * Database initialization script
 * Run with: npx tsx src/scripts/init-database.ts
 */

import { storeEmbeddings, EmbeddingContent } from '../lib/embeddings'

async function initializeDatabase() {
  // Import contentlayer data dynamically to avoid module resolution issues
  const { allPublications, allProjects } = await import('../../.contentlayer/generated/index.mjs')
  console.log('🚀 Starting database initialization...')

  try {
    // 1. Generate and store embeddings
    console.log('\n📊 Generating embeddings for content...')
    
    const embeddingContents: EmbeddingContent[] = []

    // Process publications
    allPublications.forEach(pub => {
      embeddingContents.push({
        objectType: 'publication',
        objectId: pub.slug,
        chunk: `${pub.title}. ${pub.abstract}. Published in ${pub.venue} (${pub.year}). Tags: ${pub.tags.join(', ')}.`,
        metadata: {
          title: pub.title,
          year: pub.year,
          venue: pub.venue,
          tags: pub.tags,
          url: pub.url
        }
      })

      // Also embed the full content
      if (pub.body.raw && pub.body.raw.length > 0) {
        embeddingContents.push({
          objectType: 'publication',
          objectId: pub.slug,
          chunk: pub.body.raw,
          metadata: {
            title: pub.title,
            year: pub.year,
            venue: pub.venue,
            type: 'full_content'
          }
        })
      }
    })

    // Process projects
    allProjects.forEach(proj => {
      embeddingContents.push({
        objectType: 'project',
        objectId: proj.slug,
        chunk: `${proj.title}. ${proj.summary}. Status: ${proj.status}. Technologies: ${proj.stack.join(', ')}. Tags: ${proj.tags.join(', ')}.`,
        metadata: {
          title: proj.title,
          status: proj.status,
          stack: proj.stack,
          tags: proj.tags,
          url: proj.url
        }
      })

      // Also embed the full content
      if (proj.body.raw && proj.body.raw.length > 0) {
        embeddingContents.push({
          objectType: 'project',
          objectId: proj.slug,
          chunk: proj.body.raw,
          metadata: {
            title: proj.title,
            status: proj.status,
            stack: proj.stack,
            type: 'full_content'
          }
        })
      }
    })

    console.log(`📝 Processing ${embeddingContents.length} content chunks...`)

    // Store embeddings (this will generate them using OpenAI)
    await storeEmbeddings(embeddingContents)
    console.log('✅ Embeddings stored successfully!')

    // 3. Summary
    console.log('\n🎉 Database initialization complete!')
    console.log(`📚 Publications: ${allPublications.length}`)
    console.log(`🚀 Projects: ${allProjects.length}`)
    console.log(`🔍 Embedding chunks: ${embeddingContents.length}`)

    console.log('\n✨ Your AI agent is now ready to use!')
    console.log('💬 Try asking: "What research have you published?" or "Show me your latest projects"')

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().catch(console.error)
}

export { initializeDatabase }