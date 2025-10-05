import { allPublications, allProjects } from 'contentlayer/generated'
import { supabase } from './supabase'

export interface SiteContent {
  publications: Array<{
    id: string
    title: string
    abstract: string
    year?: number
    venue?: string
    tags?: string[]
    url: string
    pdfUrl?: string
    featured?: boolean
  }>
  projects: Array<{
    id: string
    title: string
    summary: string
    status?: string
    stack?: string[]
    tags?: string[]
    url: string
    repoUrl?: string
    demoUrl?: string
    featured?: boolean
  }>
  photos: Array<{
    id: string
    caption?: string
    album?: string
    tags?: string[]
    imageUrl: string
  }>
  siteInfo: {
    name: string
    title: string
    bio: string
    location: string
    currentRole: string
    university: string
    skills: string[]
    researchAreas: string[]
    lastUpdated: string
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  // Get publications from contentlayer
  const publications = allPublications.map(pub => ({
    id: pub._id,
    title: pub.title,
    abstract: pub.abstract,
    year: pub.year,
    venue: pub.venue,
    tags: pub.tags,
    url: `/publications/${pub._raw.flattenedPath}`,
    pdfUrl: pub.pdfUrl,
    featured: pub.featured
  }))

  // Get projects from contentlayer
  const projects = allProjects.map(project => ({
    id: project._id,
    title: project.title,
    summary: project.summary,
    status: project.status,
    stack: project.stack,
    tags: project.tags,
    url: `/projects/${project._raw.flattenedPath}`,
    repoUrl: project.repoUrl,
    demoUrl: project.demoUrl,
    featured: project.featured
  }))

  // Get photos from Supabase (with fallback)
  let photos: SiteContent['photos'] = []
  try {
    const { data } = await supabase
      .from('photos')
      .select('id, caption, album, tags, image_url')
      .limit(50)
    
    photos = (data || []).map(photo => ({
      id: photo.id,
      caption: photo.caption,
      album: photo.album,
      tags: photo.tags,
      imageUrl: photo.image_url
    }))
  } catch (error) {
    console.warn('Could not fetch photos:', error)
  }

  // Site owner information
  const siteInfo = {
    name: "Xinyu (Brian) Guo",
    title: "Ph.D. Candidate in Computational Biology & Bioinformatics",
    bio: "Passionate researcher focusing on genomics, statistical learning, and deep learning. Building tools that make sense of complex biological data and uncover patterns that drive disease and therapy insights.",
    location: "Los Angeles, CA",
    currentRole: "Ph.D. Candidate",
    university: "University of Southern California",
    skills: ["R", "Python", "SQL", "Java", "PyTorch", "scikit-learn", "Bioconductor"],
    researchAreas: [
      "Computational Biology (single-cell, spatial transcriptomics, genomics)",
      "Machine Learning & AI (self-supervised learning, LLMs)", 
      "Statistical Modeling (risk prediction, regression, meta-analysis)",
      "Computer Vision (object detection, tracking, action recognition)"
    ],
    lastUpdated: new Date().toISOString()
  }

  return {
    publications,
    projects,
    photos,
    siteInfo
  }
}

export function generateContentSummary(content: SiteContent): string {
  const pubCount = content.publications.length
  const projectCount = content.projects.length
  const photoCount = content.photos.length
  const featuredPubs = content.publications.filter(p => p.featured).length
  const featuredProjects = content.projects.filter(p => p.featured).length

  const recentPub = content.publications
    .sort((a, b) => (b.year || 0) - (a.year || 0))[0]
  
  const activeProjects = content.projects.filter(p => 
    p.status === 'active' || p.status === 'ongoing'
  ).length

  return `Site Owner: ${content.siteInfo.name}
Current Role: ${content.siteInfo.title} at ${content.siteInfo.university}
Location: ${content.siteInfo.location}

Content Overview:
- ${pubCount} publications (${featuredPubs} featured)${recentPub ? `, most recent: "${recentPub.title}" (${recentPub.year})` : ''}
- ${projectCount} projects (${featuredProjects} featured, ${activeProjects} active)
- ${photoCount} photos across various albums
- Research areas: ${content.siteInfo.researchAreas.join(', ')}

Key Skills: ${content.siteInfo.skills.join(', ')}
Bio: ${content.siteInfo.bio}

Last Updated: ${content.siteInfo.lastUpdated}`
}