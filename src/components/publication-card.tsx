import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Code, Video } from "lucide-react"
import { allPublications, Publication } from "contentlayer/generated"

interface PublicationCardProps {
  publication: Publication
}

export function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-6">
            {publication.title}
          </CardTitle>
          <Badge variant={publication.featured ? "default" : "secondary"}>
            {publication.year}
          </Badge>
        </div>
        <CardDescription className="text-sm">{publication.venue}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {publication.abstract}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {publication.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex flex-wrap gap-2 w-full">
          {publication.pdfUrl && (
            <Button size="sm" variant="outline" asChild>
              <Link href={publication.pdfUrl} target="_blank">
                <FileText className="h-3 w-3 mr-1" />
                PDF
              </Link>
            </Button>
          )}
          {publication.codeUrl && (
            <Button size="sm" variant="outline" asChild>
              <Link href={publication.codeUrl} target="_blank">
                <Code className="h-3 w-3 mr-1" />
                Code
              </Link>
            </Button>
          )}
          {publication.videoUrl && (
            <Button size="sm" variant="outline" asChild>
              <Link href={publication.videoUrl} target="_blank">
                <Video className="h-3 w-3 mr-1" />
                Video
              </Link>
            </Button>
          )}
          {publication.doi && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`https://doi.org/${publication.doi}`} target="_blank">
                <ExternalLink className="h-3 w-3 mr-1" />
                DOI
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}