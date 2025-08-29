import { notFound } from "next/navigation"
import { allPublications } from "contentlayer/generated"
import { Mdx } from "@/components/mdx-components"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GraphVisualization } from "@/components/graph-visualization"
import { ArrowLeft, ExternalLink, FileText, Code, Presentation, Video, Calendar, Building2 } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

interface PublicationPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return allPublications.map((publication) => ({
    slug: publication.slug,
  }))
}

export async function generateMetadata({
  params,
}: PublicationPageProps): Promise<Metadata> {
  const { slug } = await params
  const publication = allPublications.find(
    (publication) => publication.slug === slug
  )

  if (!publication) {
    return {}
  }

  return {
    title: `${publication.title} - Publications`,
    description: publication.abstract,
  }
}

export default async function PublicationPage({ params }: PublicationPageProps) {
  const { slug } = await params
  const publication = allPublications.find(
    (publication) => publication.slug === slug
  )

  if (!publication) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/publications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Publications
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              {publication.title}
            </h1>
            {publication.featured && (
              <Badge className="ml-4">Featured</Badge>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {publication.year}
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {publication.venue}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {publication.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {publication.pdfUrl && (
              <Button asChild>
                <Link href={publication.pdfUrl} target="_blank">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Link>
              </Button>
            )}
            {publication.codeUrl && (
              <Button variant="outline" asChild>
                <Link href={publication.codeUrl} target="_blank">
                  <Code className="mr-2 h-4 w-4" />
                  Code
                </Link>
              </Button>
            )}
            {publication.slidesUrl && (
              <Button variant="outline" asChild>
                <Link href={publication.slidesUrl} target="_blank">
                  <Presentation className="mr-2 h-4 w-4" />
                  Slides
                </Link>
              </Button>
            )}
            {publication.videoUrl && (
              <Button variant="outline" asChild>
                <Link href={publication.videoUrl} target="_blank">
                  <Video className="mr-2 h-4 w-4" />
                  Video
                </Link>
              </Button>
            )}
            {publication.doi && (
              <Button variant="outline" asChild>
                <Link href={`https://doi.org/${publication.doi}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  DOI
                </Link>
              </Button>
            )}
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Video */}
        {publication.videoUrl && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video">
                <iframe
                  src={publication.videoUrl}
                  title={`Video: ${publication.title}`}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Abstract */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Abstract</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {publication.abstract}
            </p>
          </CardContent>
        </Card>

        {/* Knowledge Graph */}
        <div className="mb-8">
          <GraphVisualization 
            nodeId={publication.slug}
            title={`Knowledge Graph for "${publication.title}"`}
            height={500}
          />
        </div>

        {/* MDX Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <Mdx code={publication.body.code} publication={publication} />
        </div>

        {/* Navigation to other publications */}
        <div className="mt-16 border-t pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Other Publications</h3>
            <Button variant="outline" asChild>
              <Link href="/publications">View All</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {allPublications
              .filter(p => p.slug !== publication.slug)
              .slice(0, 2)
              .map((otherPublication) => (
                <Card key={otherPublication.slug} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Link href={otherPublication.url} className="block">
                      <h4 className="font-medium leading-5 mb-2 hover:text-primary transition-colors">
                        {otherPublication.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {otherPublication.venue} • {otherPublication.year}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {otherPublication.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}