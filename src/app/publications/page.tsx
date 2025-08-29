"use client"

import { useState, useMemo } from "react"
import { allPublications } from "contentlayer/generated"
import { PublicationCard } from "@/components/publication-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

export default function PublicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"year" | "title">("year")

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    allPublications.forEach(pub => 
      pub.tags.forEach(tag => tags.add(tag))
    )
    return Array.from(tags).sort()
  }, [])

  // Filter and sort publications
  const filteredPublications = useMemo(() => {
    const filtered = allPublications.filter(publication => {
      const matchesSearch = !searchQuery || 
        publication.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        publication.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        publication.venue.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => publication.tags.includes(tag))
      
      return matchesSearch && matchesTags
    })

    // Sort publications
    filtered.sort((a, b) => {
      if (sortBy === "year") {
        return b.year - a.year // Newest first
      } else {
        return a.title.localeCompare(b.title)
      }
    })

    return filtered
  }, [searchQuery, selectedTags, sortBy])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Publications</h1>
        <p className="text-muted-foreground">
          Research publications and academic work ({allPublications.length} total)
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search publications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "year" ? "default" : "outline"}
              onClick={() => setSortBy("year")}
              size="sm"
            >
              By Year
            </Button>
            <Button
              variant={sortBy === "title" ? "default" : "outline"}
              onClick={() => setSortBy("title")}
              size="sm"
            >
              By Title
            </Button>
          </div>
        </div>

        {/* Tag filters */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter by tags:</span>
            {(searchQuery || selectedTags.length > 0) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredPublications.length === allPublications.length
            ? `Showing all ${allPublications.length} publications`
            : `Showing ${filteredPublications.length} of ${allPublications.length} publications`}
        </p>
      </div>

      {/* Publications grid */}
      {filteredPublications.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPublications.map((publication) => (
            <PublicationCard key={publication.slug} publication={publication} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No publications match your search criteria.</p>
          <Button className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}