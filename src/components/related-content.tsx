"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'

interface RelatedItem {
  type: 'publication' | 'project'
  id: string
  title: string
  url: string
  similarity: number
  tags?: string[]
}

interface RelatedContentProps {
  contentId: string
  contentType: 'publication' | 'project'
  className?: string
}

export function RelatedContent({ contentId, contentType, className = "" }: RelatedContentProps) {
  const [related, setRelated] = useState<RelatedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelated() {
      try {
        setLoading(true)
        const response = await fetch(`/api/related?id=${contentId}&type=${contentType}`)

        if (!response.ok) {
          throw new Error('Failed to fetch related content')
        }

        const data = await response.json()
        setRelated(data.related || [])
      } catch (err) {
        console.error('Error fetching related content:', err)
        setError('Unable to load recommendations')
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [contentId, contentType])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            You Might Also Like
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || related.length === 0) {
    return null // Don't show widget if no recommendations
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          You Might Also Like
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {related.map((item, index) => (
            <Link
              key={item.id}
              href={item.url}
              className="block p-4 rounded-lg border bg-card hover:bg-accent transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={item.type === 'publication' ? 'default' : 'secondary'} className="text-xs">
                      {item.type}
                    </Badge>
                    {item.similarity > 80 && (
                      <Badge variant="outline" className="text-xs">
                        {item.similarity}% match
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-sm leading-snug mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
