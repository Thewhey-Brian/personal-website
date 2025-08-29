import { supabase } from './supabase'
import { allPublications, allProjects } from 'contentlayer/generated'

export interface GraphNode {
  id: string
  type: 'publication' | 'project' | 'author' | 'venue' | 'topic' | 'technology'
  label: string
  metadata: Record<string, any>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  relation: string
  weight: number
  metadata: Record<string, any>
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * Extract entities and relationships from content
 */
export function extractEntitiesFromContent(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const nodeMap = new Map<string, GraphNode>()

  // Helper function to add node
  const addNode = (id: string, type: GraphNode['type'], label: string, metadata: any = {}) => {
    if (!nodeMap.has(id)) {
      const node: GraphNode = { id, type, label, metadata }
      nodeMap.set(id, node)
      nodes.push(node)
    }
    return nodeMap.get(id)!
  }

  // Helper function to add edge
  const addEdge = (sourceId: string, targetId: string, relation: string, weight = 1, metadata: any = {}) => {
    const edgeId = `${sourceId}-${relation}-${targetId}`
    if (!edges.find(e => e.id === edgeId)) {
      edges.push({
        id: edgeId,
        source: sourceId,
        target: targetId,
        relation,
        weight,
        metadata
      })
    }
  }

  // Process publications
  allPublications.forEach(pub => {
    // Add publication node
    const pubNode = addNode(pub.slug, 'publication', pub.title, {
      year: pub.year,
      venue: pub.venue,
      abstract: pub.abstract,
      tags: pub.tags,
      featured: pub.featured,
      url: pub.url
    })

    // Add venue node and relationship
    if (pub.venue) {
      const venueId = `venue-${pub.venue.toLowerCase().replace(/\s+/g, '-')}`
      addNode(venueId, 'venue', pub.venue, { type: 'conference' })
      addEdge(pub.slug, venueId, 'published_in', 1, { year: pub.year })
    }

    // Add topic nodes from tags and relationships
    pub.tags.forEach(tag => {
      const topicId = `topic-${tag.toLowerCase().replace(/\s+/g, '-')}`
      addNode(topicId, 'topic', tag, { category: 'research_area' })
      addEdge(pub.slug, topicId, 'relates_to', 0.8)
    })

    // Create co-occurrence relationships between tags
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
    // Add project node
    const projNode = addNode(proj.slug, 'project', proj.title, {
      status: proj.status,
      summary: proj.summary,
      stack: proj.stack,
      tags: proj.tags,
      featured: proj.featured,
      url: proj.url,
      startDate: proj.startDate,
      endDate: proj.endDate
    })

    // Add technology nodes from stack and relationships
    proj.stack.forEach(tech => {
      const techId = `tech-${tech.toLowerCase().replace(/\s+/g, '-')}`
      addNode(techId, 'technology', tech, { category: 'programming_language_or_framework' })
      addEdge(proj.slug, techId, 'uses_technology', 1)
    })

    // Add topic nodes from project tags
    proj.tags.forEach(tag => {
      const topicId = `topic-${tag.toLowerCase().replace(/\s+/g, '-')}`
      addNode(topicId, 'topic', tag, { category: 'project_area' })
      addEdge(proj.slug, topicId, 'relates_to', 0.8)
    })

    // Create relationships between technologies used together
    for (let i = 0; i < proj.stack.length; i++) {
      for (let j = i + 1; j < proj.stack.length; j++) {
        const tech1 = `tech-${proj.stack[i].toLowerCase().replace(/\s+/g, '-')}`
        const tech2 = `tech-${proj.stack[j].toLowerCase().replace(/\s+/g, '-')}`
        addEdge(tech1, tech2, 'used_together', 0.6)
      }
    }
  })

  // Create cross-content relationships
  // Publications and Projects with similar tags
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

/**
 * Store graph data in Supabase
 */
export async function storeGraphData(graphData: GraphData): Promise<void> {
  try {
    // Clear existing graph data
    await supabase.from('graph_edges').delete().neq('id', '')
    await supabase.from('graph_nodes').delete().neq('node_id', '')

    // Insert nodes
    const { error: nodesError } = await supabase
      .from('graph_nodes')
      .insert(
        graphData.nodes.map(node => ({
          node_id: node.id,
          type: node.type,
          label: node.label,
          metadata: node.metadata
        }))
      )

    if (nodesError) {
      console.error('Error storing graph nodes:', nodesError)
      throw nodesError
    }

    // Insert edges
    const { error: edgesError } = await supabase
      .from('graph_edges')
      .insert(
        graphData.edges.map(edge => ({
          src_node_id: edge.source,
          dst_node_id: edge.target,
          relation: edge.relation,
          weight: edge.weight,
          metadata: edge.metadata
        }))
      )

    if (edgesError) {
      console.error('Error storing graph edges:', edgesError)
      throw edgesError
    }

    console.log(`Stored ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`)
  } catch (error) {
    console.error('Failed to store graph data:', error)
    throw error
  }
}

/**
 * Get graph data for a specific node and its neighbors
 */
export async function getNodeGraph(nodeId: string, depth = 1): Promise<GraphData> {
  try {
    // Get the central node
    const { data: centralNode, error: nodeError } = await supabase
      .from('graph_nodes')
      .select('*')
      .eq('node_id', nodeId)
      .single()

    if (nodeError || !centralNode) {
      return { nodes: [], edges: [] }
    }

    // Get direct neighbors
    const { data: edges, error: edgesError } = await supabase
      .from('graph_edges')
      .select(`
        id,
        src_node_id,
        dst_node_id,
        relation,
        weight,
        metadata,
        source_node:graph_nodes!graph_edges_src_node_id_fkey(*),
        target_node:graph_nodes!graph_edges_dst_node_id_fkey(*)
      `)
      .or(`src_node_id.eq.${nodeId},dst_node_id.eq.${nodeId}`)
      .limit(20) // Limit for performance

    if (edgesError) {
      console.error('Error fetching graph edges:', edgesError)
      return { nodes: [], edges: [] }
    }

    // Build nodes and edges
    const nodesMap = new Map<string, GraphNode>()
    const graphEdges: GraphEdge[] = []

    // Add central node
    nodesMap.set(centralNode.node_id, {
      id: centralNode.node_id,
      type: centralNode.type as GraphNode['type'],
      label: centralNode.label,
      metadata: centralNode.metadata || {}
    })

    // Process edges and add neighbor nodes
    edges?.forEach(edge => {
      // Add source node
      if (edge.source_node) {
        nodesMap.set(edge.src_node_id, {
          id: edge.src_node_id,
          type: edge.source_node.type as GraphNode['type'],
          label: edge.source_node.label,
          metadata: edge.source_node.metadata || {}
        })
      }

      // Add target node
      if (edge.target_node) {
        nodesMap.set(edge.dst_node_id, {
          id: edge.dst_node_id,
          type: edge.target_node.type as GraphNode['type'],
          label: edge.target_node.label,
          metadata: edge.target_node.metadata || {}
        })
      }

      // Add edge
      graphEdges.push({
        id: edge.id.toString(),
        source: edge.src_node_id,
        target: edge.dst_node_id,
        relation: edge.relation,
        weight: edge.weight || 1,
        metadata: edge.metadata || {}
      })
    })

    return {
      nodes: Array.from(nodesMap.values()),
      edges: graphEdges
    }
  } catch (error) {
    console.error('Error fetching node graph:', error)
    return { nodes: [], edges: [] }
  }
}

/**
 * Get graph statistics
 */
export async function getGraphStats(): Promise<{
  totalNodes: number
  totalEdges: number
  nodeTypes: Record<string, number>
  relationTypes: Record<string, number>
}> {
  try {
    // Get node counts by type
    const { data: nodeStats } = await supabase
      .from('graph_nodes')
      .select('type')

    // Get edge counts by relation
    const { data: edgeStats } = await supabase
      .from('graph_edges')
      .select('relation')

    const nodeTypes: Record<string, number> = {}
    const relationTypes: Record<string, number> = {}

    nodeStats?.forEach(node => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1
    })

    edgeStats?.forEach(edge => {
      relationTypes[edge.relation] = (relationTypes[edge.relation] || 0) + 1
    })

    return {
      totalNodes: nodeStats?.length || 0,
      totalEdges: edgeStats?.length || 0,
      nodeTypes,
      relationTypes
    }
  } catch (error) {
    console.error('Error getting graph stats:', error)
    return {
      totalNodes: 0,
      totalEdges: 0,
      nodeTypes: {},
      relationTypes: {}
    }
  }
}