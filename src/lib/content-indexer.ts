import { allPublications, allProjects } from 'contentlayer/generated'

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
    startDate?: string
    endDate?: string
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
    url: pub.url,
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
    url: project.url,
    repoUrl: project.repoUrl,
    demoUrl: project.demoUrl,
    featured: project.featured,
    startDate: project.startDate,
    endDate: project.endDate
  }))


  // Site owner information
  const siteInfo = {
    name: "Xinyu (Brian) Guo",
    title: "Postdoctoral Associate, AI for Biology (Ph.D., Computational Biology & Bioinformatics, USC)",
    bio: "AI for biology researcher and builder. Develops and evaluates biological and genomic foundation models (DNA, RNA, single-cell) and scientific AI agents at Yale; USC Ph.D.; evaluated genomic foundation models on tumor cohorts at Abbott Cancer Diagnostics. Also a founder who has shipped AI products end to end to the App Store: RallyAI (tennis analytics) and Doover (AI photo editing).",
    location: "New Haven, CT",
    currentRole: "Postdoctoral Associate",
    university: "Yale University",
    skills: ["Python", "PyTorch", "JAX", "Hugging Face", "LLM training and fine-tuning", "AI agents and tool use", "computer vision", "Swift / iOS", "Next.js / TypeScript", "R", "SQL", "AWS SageMaker / Bedrock", "Nextflow"],
    researchAreas: [
      "Biological and genomic foundation models (AlphaGenome, Evo2, Enformer, DNA/RNA/single-cell)",
      "Scientific AI agents, LLM tool use and governed workflows",
      "Cancer genomics, variant-effect prediction and precision oncology",
      "Single-cell and spatial transcriptomics, self-supervised learning",
      "Computer vision and on-device ML (pose estimation, tracking, Core ML)",
      "Benchmark design and model evaluation"
    ],
    lastUpdated: new Date().toISOString()
  }

  return {
    publications,
    projects,
    siteInfo
  }
}

export function generateContentSummary(content: SiteContent): string {
  const pubCount = content.publications.length
  const projectCount = content.projects.length
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
- Research areas: ${content.siteInfo.researchAreas.join(', ')}

Key Skills: ${content.siteInfo.skills.join(', ')}
Bio: ${content.siteInfo.bio}

Last Updated: ${content.siteInfo.lastUpdated}`
}