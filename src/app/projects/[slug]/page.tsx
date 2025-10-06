import { notFound } from "next/navigation"
import { allProjects } from "contentlayer/generated"
import { Mdx } from "@/components/mdx-components"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RelatedContent } from "@/components/related-content"
import { ArrowLeft, ExternalLink, Github, Calendar, User, Clock, CheckCircle, Circle } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"
import { format } from "date-fns"

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return allProjects.map((project) => ({
    slug: project.slug,
  }))
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = allProjects.find(
    (project) => project.slug === slug
  )

  if (!project) {
    return {}
  }

  return {
    title: `${project.title} - Projects`,
    description: project.summary,
  }
}

const statusIcons = {
  completed: CheckCircle,
  "in-progress": Clock,
  planned: Circle,
}

const statusLabels = {
  completed: "Completed",
  "in-progress": "In Progress", 
  planned: "Planned",
}

const statusVariants = {
  completed: "default" as const,
  "in-progress": "secondary" as const,
  planned: "outline" as const,
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = allProjects.find(
    (project) => project.slug === slug
  )

  if (!project) {
    notFound()
  }

  const StatusIcon = statusIcons[project.status]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              {project.title}
            </h1>
            <div className="flex items-center gap-2 ml-4">
              {project.featured && (
                <Badge>Featured</Badge>
              )}
              <Badge variant={statusVariants[project.status]}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusLabels[project.status]}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            {project.role && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {project.role}
              </div>
            )}
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {project.startDate && format(new Date(project.startDate), "MMM yyyy")}
                {project.startDate && project.endDate && " - "}
                {project.endDate ? format(new Date(project.endDate), "MMM yyyy") : 
                 (project.startDate && project.status === "in-progress" && "Present")}
              </div>
            )}
          </div>

          <p className="text-lg text-muted-foreground mb-6">
            {project.summary}
          </p>

          {/* Links */}
          <div className="flex flex-wrap gap-3 mb-6">
            {project.demoUrl && (
              <Button asChild>
                <Link href={project.demoUrl} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live Demo
                </Link>
              </Button>
            )}
            {project.repoUrl && (
              <Button variant="outline" asChild>
                <Link href={project.repoUrl} target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  Source Code
                </Link>
              </Button>
            )}
          </div>

          {/* Tech stack and tags */}
          <div className="space-y-4">
            {project.stack.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {project.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Project images */}
        {project.images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Screenshots</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {project.images.map((image, index) => (
                <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <span>Image {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MDX Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <Mdx code={project.body.code} />
        </div>

        {/* Related Content */}
        <div className="my-12">
          <RelatedContent contentId={project.slug} contentType="project" />
        </div>

        {/* Navigation to other projects */}
        <div className="mt-16 border-t pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Other Projects</h3>
            <Button variant="outline" asChild>
              <Link href="/projects">View All</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {allProjects
              .filter(p => p.slug !== project.slug)
              .slice(0, 2)
              .map((otherProject) => {
                const OtherStatusIcon = statusIcons[otherProject.status]
                return (
                  <Card key={otherProject.slug} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <Link href={otherProject.url} className="block">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium leading-5 hover:text-primary transition-colors">
                            {otherProject.title}
                          </h4>
                          <Badge variant={statusVariants[otherProject.status]} className="text-xs">
                            <OtherStatusIcon className="mr-1 h-2 w-2" />
                            {statusLabels[otherProject.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {otherProject.summary}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {otherProject.stack.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {otherProject.stack.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{otherProject.stack.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}