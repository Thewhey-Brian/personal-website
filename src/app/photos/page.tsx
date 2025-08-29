"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Grid, List, Camera, MapPin } from "lucide-react"
import { supabase } from "@/lib/supabase"
import PhotoUpload from "@/components/photo-upload"

interface Photo {
  id: string
  image_url: string
  caption: string | null
  album: string | null
  tags: string[]
  exif: Record<string, any> | null
  created_at: string
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [albumFilter, setAlbumFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fetch photos from Supabase
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching photos:', error)
          // For demo purposes, use sample data
          setSamplePhotos()
        } else if (data) {
          setPhotos(data)
        } else {
          // Use sample data if no photos in database
          setSamplePhotos()
        }
      } catch (error) {
        console.error('Error:', error)
        setSamplePhotos()
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  const handleUploadComplete = () => {
    // Refetch photos after upload
    fetchPhotos()
  }

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching photos:', error)
        setSamplePhotos()
      } else if (data) {
        setPhotos(data)
      } else {
        setSamplePhotos()
      }
    } catch (error) {
      console.error('Error:', error)
      setSamplePhotos()
    } finally {
      setLoading(false)
    }
  }

  // Sample photos for demo
  const setSamplePhotos = () => {
    const samplePhotos: Photo[] = [
      {
        id: "1",
        image_url: "/photos/landscape1.jpg",
        caption: "Golden hour over the mountains",
        album: "Landscapes",
        tags: ["landscape", "sunset", "mountains"],
        exif: { camera: "Canon EOS R5", lens: "24-70mm", focalLength: "35mm" },
        created_at: "2024-01-15T10:00:00Z"
      },
      {
        id: "2",
        image_url: "/photos/street1.jpg",
        caption: "Evening rush in the city",
        album: "Street Photography",
        tags: ["street", "urban", "people"],
        exif: { camera: "Sony A7III", lens: "50mm", focalLength: "50mm" },
        created_at: "2024-01-10T15:30:00Z"
      },
      {
        id: "3",
        image_url: "/photos/portrait1.jpg",
        caption: "Natural light portrait",
        album: "Portraits",
        tags: ["portrait", "natural light"],
        exif: { camera: "Canon EOS R5", lens: "85mm", focalLength: "85mm" },
        created_at: "2024-01-05T14:20:00Z"
      }
    ]
    setPhotos(samplePhotos)
  }

  // Get all unique tags and albums
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    photos.forEach(photo => 
      photo.tags.forEach(tag => tags.add(tag))
    )
    return Array.from(tags).sort()
  }, [photos])

  const albums = useMemo(() => {
    const albumSet = new Set<string>()
    photos.forEach(photo => {
      if (photo.album) albumSet.add(photo.album)
    })
    return Array.from(albumSet).sort()
  }, [photos])

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      const matchesSearch = !searchQuery || 
        (photo.caption && photo.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
        photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (photo.album && photo.album.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => photo.tags.includes(tag))
      
      const matchesAlbum = albumFilter === "all" || photo.album === albumFilter
      
      return matchesSearch && matchesTags && matchesAlbum
    })
  }, [photos, searchQuery, selectedTags, albumFilter])

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
    setAlbumFilter("all")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading photos...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Photography</h1>
        <p className="text-muted-foreground">
          Personal photography collection ({photos.length} photos)
        </p>
      </div>

      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gallery" className="space-y-8 mt-8">

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={albumFilter} onValueChange={setAlbumFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Album" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Albums</SelectItem>
                {albums.map((album) => (
                  <SelectItem key={album} value={album}>
                    {album}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tag filters */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter by tags:</span>
            {(searchQuery || selectedTags.length > 0 || albumFilter !== "all") && (
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
          {filteredPhotos.length === photos.length
            ? `Showing all ${photos.length} photos`
            : `Showing ${filteredPhotos.length} of ${photos.length} photos`}
        </p>
      </div>

      {/* Photos */}
      {filteredPhotos.length > 0 ? (
        <div className={viewMode === "grid" 
          ? "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
          : "space-y-6"
        }>
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className={viewMode === "grid" ? "aspect-square" : "aspect-video"}>
                {photo.image_url ? (
                  <img
                    src={photo.image_url}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {photo.caption && (
                    <p className="text-sm font-medium">{photo.caption}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {photo.album && (
                      <Badge variant="secondary" className="text-xs">
                        📁 {photo.album}
                      </Badge>
                    )}
                    {photo.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {photo.exif && (
                    <div className="text-xs text-muted-foreground">
                      {photo.exif.camera && (
                        <div>{photo.exif.camera}</div>
                      )}
                      {photo.exif.lens && photo.exif.focalLength && (
                        <div>{photo.exif.lens} @ {photo.exif.focalLength}</div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No photos match your search criteria.</p>
          <Button className="mt-4" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}
        </TabsContent>
        
        <TabsContent value="upload" className="mt-8">
          <PhotoUpload onUploadComplete={handleUploadComplete} />
        </TabsContent>
      </Tabs>
    </div>
  )
}