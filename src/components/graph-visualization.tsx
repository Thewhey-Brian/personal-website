"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Maximize2, Minimize2, RefreshCw } from 'lucide-react'
import { GraphData, GraphNode, GraphEdge } from '@/lib/graph'

interface GraphVisualizationProps {
  nodeId: string
  title?: string
  className?: string
  height?: number
}

// Node type colors
const NODE_COLORS = {
  publication: '#3b82f6', // blue
  project: '#10b981',     // green
  author: '#f59e0b',      // yellow
  venue: '#8b5cf6',       // purple
  topic: '#ef4444',       // red
  technology: '#06b6d4',  // cyan
} as const

// Relation type styles
const EDGE_STYLES = {
  'published_in': { color: '#8b5cf6', style: 'solid', width: 2 },
  'relates_to': { color: '#ef4444', style: 'dashed', width: 1 },
  'uses_technology': { color: '#06b6d4', style: 'solid', width: 2 },
  'co_occurs_with': { color: '#6b7280', style: 'dotted', width: 1 },
  'used_together': { color: '#10b981', style: 'dashed', width: 1 },
  'related_to': { color: '#f59e0b', style: 'solid', width: 1.5 },
} as const

export function GraphVisualization({ 
  nodeId, 
  title = "Knowledge Graph", 
  className = "",
  height = 400 
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<any>(null)
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  useEffect(() => {
    loadCytoscape()
  }, [nodeId])

  const loadCytoscape = async () => {
    if (typeof window === 'undefined') return

    setLoading(true)
    setError(null)

    try {
      // Dynamically import Cytoscape to avoid SSR issues
      const cytoscape = (await import('cytoscape')).default
      const dagre = (await import('cytoscape-dagre')).default
      
      cytoscape.use(dagre)

      // Fetch graph data
      const response = await fetch(`/api/graph/${nodeId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch graph data')
      }
      
      const data: GraphData = await response.json()
      setGraphData(data)

      if (!containerRef.current || data.nodes.length === 0) {
        setLoading(false)
        return
      }

      // Initialize Cytoscape
      const cy = cytoscape({
        container: containerRef.current,
        elements: [
          // Nodes
          ...data.nodes.map(node => ({
            data: {
              id: node.id,
              label: node.label,
              type: node.type,
              ...node.metadata
            },
            classes: node.type
          })),
          // Edges
          ...data.edges.map(edge => ({
            data: {
              id: edge.id,
              source: edge.source,
              target: edge.target,
              label: edge.relation,
              weight: edge.weight,
              relation: edge.relation,
              ...edge.metadata
            },
            classes: edge.relation.replace(/\s+/g, '_')
          }))
        ],
        style: [
          // Node styles
          {
            selector: 'node',
            style: {
              'background-color': 'data(type)',
              'label': 'data(label)',
              'width': '60px',
              'height': '60px',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '12px',
              'color': '#fff',
              'text-outline-width': 2,
              'text-outline-color': '#000',
              'text-wrap': 'wrap',
              'text-max-width': '80px',
              'overlay-padding': '6px',
              'z-index': 10
            }
          },
          // Node type specific colors
          ...Object.entries(NODE_COLORS).map(([type, color]) => ({
            selector: `node.${type}`,
            style: {
              'background-color': color
            }
          })),
          // Central node (larger)
          {
            selector: `node[id="${nodeId}"]`,
            style: {
              'width': '80px',
              'height': '80px',
              'border-width': '3px',
              'border-color': '#fff',
              'font-size': '14px',
              'font-weight': 'bold'
            }
          },
          // Edge styles
          {
            selector: 'edge',
            style: {
              'width': 'data(weight)',
              'line-color': '#6b7280',
              'target-arrow-color': '#6b7280',
              'target-arrow-shape': 'triangle',
              'arrow-scale': 1,
              'curve-style': 'bezier',
              'font-size': '10px',
              'text-rotation': 'autorotate',
              'text-margin-y': -10,
              'text-background-color': '#fff',
              'text-background-opacity': 0.8,
              'text-background-padding': '2px'
            }
          },
          // Edge type specific styles
          ...Object.entries(EDGE_STYLES).map(([relation, style]) => ({
            selector: `edge.${relation.replace(/\s+/g, '_')}`,
            style: {
              'line-color': style.color,
              'target-arrow-color': style.color,
              'line-style': style.style,
              'width': style.width
            }
          })),
          // Selected node
          {
            selector: 'node:selected',
            style: {
              'border-width': '4px',
              'border-color': '#3b82f6',
              'z-index': 20
            }
          },
          // Highlighted edges
          {
            selector: 'edge.highlighted',
            style: {
              'width': 4,
              'line-color': '#3b82f6',
              'target-arrow-color': '#3b82f6',
              'z-index': 15
            }
          }
        ],
        layout: {
          name: 'dagre',
          directed: true,
          padding: 10,
          spacingFactor: 1.2,
          rankDir: 'TB',
          ranker: 'network-simplex'
        }
      })

      // Event handlers
      cy.on('tap', 'node', (evt) => {
        const node = evt.target
        const nodeData = node.data()
        
        // Find corresponding GraphNode
        const graphNode = data.nodes.find(n => n.id === nodeData.id)
        setSelectedNode(graphNode || null)
        
        // Highlight connected edges
        cy.edges().removeClass('highlighted')
        node.connectedEdges().addClass('highlighted')
      })

      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          cy.edges().removeClass('highlighted')
          setSelectedNode(null)
        }
      })

      cyRef.current = cy
      setLoading(false)
    } catch (error) {
      console.error('Error loading graph:', error)
      setError(error instanceof Error ? error.message : 'Failed to load graph')
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadCytoscape()
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleLayout = () => {
    if (cyRef.current) {
      cyRef.current.layout({
        name: 'dagre',
        directed: true,
        padding: 10,
        spacingFactor: 1.2,
        rankDir: 'TB'
      }).run()
    }
  }

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(null, 50)
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <p>Failed to load graph</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLayout}>
              Layout
            </Button>
            <Button variant="outline" size="sm" onClick={handleFit}>
              Fit
            </Button>
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <p>No graph data available</p>
              <p className="text-sm">Try building the knowledge graph first</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div 
              ref={containerRef}
              style={{ 
                height: isFullscreen ? '80vh' : `${height}px`,
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            
            {/* Graph Stats */}
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {graphData.nodes.length} nodes
              </Badge>
              <Badge variant="outline">
                {graphData.edges.length} edges
              </Badge>
            </div>
            
            {/* Node Legend */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(NODE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
            
            {/* Selected Node Info */}
            {selectedNode && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: NODE_COLORS[selectedNode.type] }}
                  />
                  <h4 className="font-medium">{selectedNode.label}</h4>
                  <Badge variant="outline" className="text-xs">
                    {selectedNode.type}
                  </Badge>
                </div>
                {Object.entries(selectedNode.metadata).slice(0, 3).map(([key, value]) => (
                  <p key={key} className="text-xs text-muted-foreground">
                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span> {
                      Array.isArray(value) ? value.join(', ') : String(value)
                    }
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}