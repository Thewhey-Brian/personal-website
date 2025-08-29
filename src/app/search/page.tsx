"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, FolderOpen, Camera, Loader2, ExternalLink, Github, Calendar, Building2 } from "lucide-react"

interface SearchResult {
  object_type: 'publication' | 'project' | 'photo'
  object_id: string
  chunk: string
  score?: number
  similarity?: number
  source?: 'semantic' | 'keyword' | 'fallback'
  metadata: {
    title?: string
    year?: number
    venue?: string
    status?: string
    stack?: string[]
    tags?: string[]
    url?: string
    featured?: boolean
    pdfUrl?: string
    codeUrl?: string
    repoUrl?: string
    demoUrl?: string
  }
}

interface SearchResults {
  semantic: SearchResult[]
  keyword: SearchResult[]
  combined: SearchResult[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams?.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults>({ semantic: [], keyword: [], combined: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchType, setSearchType] = useState<'all' | 'publication' | 'project' | 'photo'>('all')
  const [method, setMethod] = useState<'hybrid' | 'semantic' | 'keyword'>('hybrid')

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        method,
        limit: '20'
      })
      
      if (searchType !== 'all') {
        params.append('type', searchType)
      }

      const response = await fetch(`/api/search?${params}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setError(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query)
      // Update URL without navigation
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(query)}`)
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'publication': return <FileText className="h-4 w-4" />
      case 'project': return <FolderOpen className="h-4 w-4" />
      case 'photo': return <Camera className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getResultIcon(result.object_type)}
            <CardTitle className="text-lg">
              {result.metadata.url ? (
                <Link href={result.metadata.url} className="hover:text-primary transition-colors">
                  {result.metadata.title || result.object_id}
                </Link>
              ) : (
                result.metadata.title || result.object_id
              )}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {result.metadata.featured && (
              <Badge>Featured</Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize">
              {result.object_type}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {result.object_type === 'publication' && result.metadata.venue && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {result.metadata.venue}
            </div>
          )}
          {result.metadata.year && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {result.metadata.year}
            </div>
          )}
          {result.object_type === 'project' && result.metadata.status && (
            <Badge variant="secondary" className="text-xs">
              {result.metadata.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="mb-3 line-clamp-3">
          {result.chunk}
        </CardDescription>
        
        {/* Tags */}
        {(result.metadata.tags || result.metadata.stack) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {result.metadata.tags?.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {result.metadata.stack?.slice(0, 3).map(tech => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {result.metadata.pdfUrl && (
            <Button size="sm" variant="outline" asChild>
              <Link href={result.metadata.pdfUrl} target="_blank">
                <FileText className="h-3 w-3 mr-1" />
                PDF
              </Link>
            </Button>
          )}
          {(result.metadata.codeUrl || result.metadata.repoUrl) && (
            <Button size="sm" variant="outline" asChild>
              <Link href={result.metadata.codeUrl || result.metadata.repoUrl!} target="_blank">
                <Github className="h-3 w-3 mr-1" />
                Code
              </Link>
            </Button>
          )}
          {result.metadata.demoUrl && (
            <Button size="sm" variant="outline" asChild>
              <Link href={result.metadata.demoUrl} target="_blank">
                <ExternalLink className="h-3 w-3 mr-1" />
                Demo
              </Link>
            </Button>
          )}
          
          {/* Search metadata */}
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            {result.source && (
              <Badge variant="secondary" className="text-xs">
                {result.source}
              </Badge>
            )}
            {(result.similarity || result.score) && (
              <span>
                {Math.round((result.similarity || result.score!) * 100)}% match
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search publications, projects, and photos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="publication">Publications</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="photo">Photos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={method} onValueChange={(value: any) => setMethod(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                  <SelectItem value="keyword">Keyword</SelectItem>
                </SelectContent>
              </Select>
              
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Results */}
        {(results.combined.length > 0 || results.semantic.length > 0 || results.keyword.length > 0) && (
          <Tabs defaultValue="combined" className="mb-8">
            <TabsList>
              <TabsTrigger value="combined">
                Combined ({results.combined.length})
              </TabsTrigger>
              <TabsTrigger value="semantic">
                Semantic ({results.semantic.length})
              </TabsTrigger>
              <TabsTrigger value="keyword">
                Keyword ({results.keyword.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="combined" className="space-y-4">
              {results.combined.length > 0 ? (
                results.combined.map((result, index) => (
                  <ResultCard key={`${result.object_type}-${result.object_id}-${index}`} result={result} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No results found. Try adjusting your search terms or filters.
                </p>
              )}
            </TabsContent>

            <TabsContent value="semantic" className="space-y-4">
              {results.semantic.length > 0 ? (
                results.semantic.map((result, index) => (
                  <ResultCard key={`sem-${result.object_type}-${result.object_id}-${index}`} result={result} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No semantic results found. This feature requires embeddings to be set up.
                </p>
              )}
            </TabsContent>

            <TabsContent value="keyword" className="space-y-4">
              {results.keyword.length > 0 ? (
                results.keyword.map((result, index) => (
                  <ResultCard key={`kw-${result.object_type}-${result.object_id}-${index}`} result={result} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No keyword results found.
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {!loading && !error && results.combined.length === 0 && query && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try different keywords or check your spelling.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}