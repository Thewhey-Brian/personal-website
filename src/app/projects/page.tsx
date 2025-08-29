"use client"

import { useState, useMemo } from "react"
import { allProjects } from "contentlayer/generated"
import { ProjectCard } from "@/components/project-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "title" | "status">("date")

  // Get all unique tags and tech stack items
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    allProjects.forEach(project => {
      project.tags.forEach(tag => tags.add(tag))
      project.stack.forEach(tech => tags.add(tech))
    })
    return Array.from(tags).sort()
  }, [])

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const filtered = allProjects.filter(project => {
      const matchesSearch = !searchQuery || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.role && project.role.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => 
          project.tags.includes(tag) || project.stack.includes(tag)
        )
      
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      
      return matchesSearch && matchesTags && matchesStatus
    })

    // Sort projects
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        // Sort by start date, with more recent first
        const aDate = a.startDate ? new Date(a.startDate) : new Date(0)
        const bDate = b.startDate ? new Date(b.startDate) : new Date(0)
        return bDate.getTime() - aDate.getTime()
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title)
      } else if (sortBy === "status") {
        const statusOrder = { "in-progress": 0, planned: 1, completed: 2 }
        return statusOrder[a.status] - statusOrder[b.status]
      }
      return 0
    })

    return filtered
  }, [searchQuery, selectedTags, statusFilter, sortBy])

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
    setStatusFilter("all")
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
        <p className="text-muted-foreground">
          Personal and professional projects ({allProjects.length} total)
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: "date" | "title" | "status") => setSortBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="title">By Title</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tag filters */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter by tags & tech:</span>
            {(searchQuery || selectedTags.length > 0 || statusFilter !== "all") && (
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
          {filteredProjects.length === allProjects.length
            ? `Showing all ${allProjects.length} projects`
            : `Showing ${filteredProjects.length} of ${allProjects.length} projects`}
        </p>
      </div>

      {/* Projects grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects match your search criteria.</p>
          <Button className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}