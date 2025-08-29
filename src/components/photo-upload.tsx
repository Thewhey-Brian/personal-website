"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Image as ImageIcon, Loader2, Plus } from "lucide-react"

interface PhotoPreview {
  file: File
  preview: string
  caption: string
  album: string
  tags: string[]
}

interface PhotoUploadProps {
  onUploadComplete?: () => void
}

export default function PhotoUpload({ onUploadComplete }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList) => {
    const newPhotos: PhotoPreview[] = []
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file)
        newPhotos.push({
          file,
          preview,
          caption: '',
          album: '',
          tags: []
        })
      }
    })
    
    setPhotos(prev => [...prev, ...newPhotos])
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev]
      URL.revokeObjectURL(newPhotos[index].preview)
      newPhotos.splice(index, 1)
      return newPhotos
    })
  }

  const updatePhoto = (index: number, field: keyof PhotoPreview, value: string | string[]) => {
    setPhotos(prev => prev.map((photo, i) => 
      i === index ? { ...photo, [field]: value } : photo
    ))
  }

  const handleAuth = async (key: string) => {
    // Test auth by making a dummy request
    const testFormData = new FormData()
    testFormData.append('adminKey', key)
    testFormData.append('test', 'true')
    
    try {
      const response = await fetch('/api/photos/auth', {
        method: 'POST',
        body: testFormData
      })
      
      if (response.ok) {
        setIsAuthenticated(true)
        setAdminKey(key)
        return true
      } else {
        setIsAuthenticated(false)
        return false
      }
    } catch {
      return false
    }
  }

  const addTag = (photoIndex: number, tag: string) => {
    if (tag.trim()) {
      updatePhoto(photoIndex, 'tags', [...photos[photoIndex].tags, tag.trim().toLowerCase()])
    }
  }

  const removeTag = (photoIndex: number, tagIndex: number) => {
    const newTags = [...photos[photoIndex].tags]
    newTags.splice(tagIndex, 1)
    updatePhoto(photoIndex, 'tags', newTags)
  }

  const uploadPhotos = async () => {
    if (photos.length === 0) return
    
    setUploading(true)
    
    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        
        // Create FormData for API upload
        const formData = new FormData()
        formData.append('file', photo.file)
        formData.append('caption', photo.caption)
        formData.append('album', photo.album)
        formData.append('tags', photo.tags.join(','))
        formData.append('adminKey', adminKey)
        
        // Upload via API route
        const response = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        if (!response.ok) {
          console.error('Upload error:', result.error)
          continue
        }
        
        console.log('Photo uploaded successfully:', result.photo)
      }
      
      // Clear photos after successful upload
      photos.forEach(photo => URL.revokeObjectURL(photo.preview))
      setPhotos([])
      
      // Notify parent component
      onUploadComplete?.()
      
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const AdminAuthForm = () => {
    const [key, setKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError('')

      const success = await handleAuth(key)
      if (!success) {
        setError('Invalid admin key. Please try again.')
      }
      setLoading(false)
    }

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center">
            🔐 Admin Access Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter admin key..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !key.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Access Upload Panel'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return <AdminAuthForm />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Photos
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAuthenticated(false)}
            className="ml-auto"
          >
            Logout
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Drop photos here or click to select</p>
            <p className="text-sm text-muted-foreground">Supports JPEG, PNG, WebP files up to 10MB</p>
          </div>
          <Button 
            className="mt-4" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Select Photos
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Photo Previews */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Photos to Upload ({photos.length})</h3>
            <div className="space-y-4">
              {photos.map((photo, index) => (
                <Card key={index} className="p-4">
                  <div className="flex gap-4">
                    {/* Photo Preview */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={photo.preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Photo Details */}
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Photo caption..."
                        value={photo.caption}
                        onChange={(e) => updatePhoto(index, 'caption', e.target.value)}
                      />
                      
                      <Input
                        placeholder="Album name..."
                        value={photo.album}
                        onChange={(e) => updatePhoto(index, 'album', e.target.value)}
                      />
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {photo.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs">
                              {tag}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto w-auto p-0 ml-1"
                                onClick={() => removeTag(index, tagIndex)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Add tags (press Enter)..."
                          className="text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const target = e.target as HTMLInputElement
                              addTag(index, target.value)
                              target.value = ''
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <Button 
              onClick={uploadPhotos} 
              disabled={uploading} 
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}