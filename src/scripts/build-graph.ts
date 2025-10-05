#!/usr/bin/env node
/**
 * Build Knowledge Graph
 *
 * This script extracts entities and relationships from your content
 * (publications, projects) and stores them in the Supabase database.
 *
 * Usage: npm run build-graph
 */

import { storeGraphData, getGraphStats, GraphNode, GraphEdge } from '../lib/graph.js'
import { allPublications } from '../../.contentlayer/generated/index.mjs'
import { allProjects } from '../../.contentlayer/generated/index.mjs'

// Inline extraction function to avoid module resolution issues
function extractEntitiesFromContent() {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const nodeMap = new Map<string, GraphNode>()

  const addNode = (id: string, type: GraphNode['type'], label: string, metadata: any = {}) => {
    if (!nodeMap.has(id)) {
      const node: GraphNode = { id, type, label, metadata }
      nodeMap.set(id, node)
      nodes.push(node)
    }
    return nodeMap.get(id)!
  }

  const addEdge = (sourceId: string, targetId: string, relation: string, weight = 1, metadata: any = {}) => {
    const edgeId = `${sourceId}-${relation}-${targetId}`
    if (!edges.find(e => e.id === edgeId)) {
      edges.push({ id: edgeId, source: sourceId, target: targetId, relation, weight, metadata })
    }
  }

  // Process publications
  allPublications.forEach(pub => {
    addNode(pub.slug, 'publication', pub.title, {
      year: pub.year,
      venue: pub.venue,
      abstract: pub.abstract,
      tags: pub.tags,
      featured: pub.featured,
      url: pub.url
    })

    if (pub.venue) {
      const venueId = `venue-${pub.venue.toLowerCase().replace(/\s+/g, '-')}`
      addNode(venueId, 'venue', pub.venue, { type: 'conference' })
      addEdge(pub.slug, venueId, 'published_in', 1, { year: pub.year })
    }

    pub.tags.forEach(tag => {
      const topicId = `topic-${tag.toLowerCase().replace(/\s+/g, '-')}`
      addNode(topicId, 'topic', tag, { category: 'research_area' })
      addEdge(pub.slug, topicId, 'relates_to', 0.8)
    })

    for (let i = 0; i < pub.tags.length; i++) {
      for (let j = i + 1; j < pub.tags.length; j++) {
        const topic1 = `topic-${pub.tags[i].toLowerCase().replace(/\s+/g, '-')}`
        const topic2 = `topic-${pub.tags[j].toLowerCase().replace(/\s+/g, '-')}`
        addEdge(topic1, topic2, 'co_occurs_with', 0.5)
      }
    }
  })

  // Process projects
  allProjects.forEach(proj => {
    addNode(proj.slug, 'project', proj.title, {
      status: proj.status,
      summary: proj.summary,
      stack: proj.stack,
      tags: proj.tags,
      featured: proj.featured,
      url: proj.url,
      startDate: proj.startDate,
      endDate: proj.endDate
    })

    proj.stack.forEach(tech => {
      const techId = `tech-${tech.toLowerCase().replace(/\s+/g, '-')}`
      addNode(techId, 'technology', tech, { category: 'programming_language_or_framework' })
      addEdge(proj.slug, techId, 'uses_technology', 1)
    })

    proj.tags.forEach(tag => {
      const topicId = `topic-${tag.toLowerCase().replace(/\s+/g, '-')}`
      addNode(topicId, 'topic', tag, { category: 'project_area' })
      addEdge(proj.slug, topicId, 'relates_to', 0.8)
    })

    for (let i = 0; i < proj.stack.length; i++) {
      for (let j = i + 1; j < proj.stack.length; j++) {
        const tech1 = `tech-${proj.stack[i].toLowerCase().replace(/\s+/g, '-')}`
        const tech2 = `tech-${proj.stack[j].toLowerCase().replace(/\s+/g, '-')}`
        addEdge(tech1, tech2, 'used_together', 0.6)
      }
    }
  })

  // Cross-content relationships
  allPublications.forEach(pub => {
    allProjects.forEach(proj => {
      const commonTags = pub.tags.filter(tag =>
        proj.tags.some(projTag => projTag.toLowerCase() === tag.toLowerCase()) ||
        proj.stack.some(tech => tech.toLowerCase().includes(tag.toLowerCase()))
      )

      if (commonTags.length > 0) {
        addEdge(pub.slug, proj.slug, 'related_to', commonTags.length * 0.3, {
          commonTags,
          type: 'cross_content'
        })
      }
    })
  })

  return { nodes, edges }
}

async function main() {
  console.log('🕸️  Building Knowledge Graph...\n')

  try {
    // Extract entities and relationships from content
    console.log('📊 Extracting entities from content...')
    const graphData = extractEntitiesFromContent()

    console.log(`   ✓ Found ${graphData.nodes.length} nodes`)
    console.log(`   ✓ Found ${graphData.edges.length} edges\n`)

    // Show breakdown by type
    const nodeTypes = graphData.nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('📦 Node types:')
    Object.entries(nodeTypes).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count}`)
    })

    const relationTypes = graphData.edges.reduce((acc, edge) => {
      acc[edge.relation] = (acc[edge.relation] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('\n🔗 Relationship types:')
    Object.entries(relationTypes).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count}`)
    })

    // Store in database
    console.log('\n💾 Storing graph data in Supabase...')
    await storeGraphData(graphData)
    console.log('   ✓ Successfully stored graph data\n')

    // Verify storage
    console.log('✅ Verifying stored data...')
    const stats = await getGraphStats()
    console.log(`   ✓ Nodes in database: ${stats.totalNodes}`)
    console.log(`   ✓ Edges in database: ${stats.totalEdges}\n`)

    console.log('🎉 Knowledge graph built successfully!')
    console.log('   You can now view interactive graphs on your project and publication pages.\n')

  } catch (error) {
    console.error('❌ Error building knowledge graph:', error)

    if (error instanceof Error) {
      if (error.message.includes('PGRST')) {
        console.error('\n💡 Database error - please check:')
        console.error('   1. Supabase connection is configured (.env.local)')
        console.error('   2. Database tables exist (run: npm run init-db)')
        console.error('   3. RLS policies allow operations\n')
      }
    }

    process.exit(1)
  }
}

main()
