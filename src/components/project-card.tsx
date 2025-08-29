import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Calendar, Clock } from "lucide-react"
import { Project } from "contentlayer/generated"
import { format } from "date-fns"

interface ProjectCardProps {
  project: Project
}

const statusVariants = {
  completed: "default" as const,
  "in-progress": "secondary" as const,
  planned: "outline" as const,
}

const statusLabels = {
  completed: "Completed",
  "in-progress": "In Progress",
  planned: "Planned",
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-6">
            <Link href={project.url} className="hover:text-primary transition-colors">
              {project.title}
            </Link>
          </CardTitle>
          <Badge variant={statusVariants[project.status]}>
            {statusLabels[project.status]}
          </Badge>
        </div>
        {project.role && (
          <CardDescription className="text-sm">{project.role}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {project.summary}
        </p>

        {/* Tech stack */}
        {project.stack.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">Tech Stack:</div>
            <div className="flex flex-wrap gap-1">
              {project.stack.map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Project dates */}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Calendar className="h-3 w-3" />
            {project.startDate && (
              <span>{format(new Date(project.startDate), "MMM yyyy")}</span>
            )}
            {project.startDate && project.endDate && <span>-</span>}
            {project.endDate && (
              <span>{format(new Date(project.endDate), "MMM yyyy")}</span>
            )}
            {project.startDate && !project.endDate && project.status === "in-progress" && (
              <span>- Present</span>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex flex-wrap gap-2 w-full">
          {project.demoUrl && (
            <Button size="sm" variant="outline" asChild>
              <Link href={project.demoUrl} target="_blank">
                <ExternalLink className="h-3 w-3 mr-1" />
                Demo
              </Link>
            </Button>
          )}
          {project.repoUrl && (
            <Button size="sm" variant="outline" asChild>
              <Link href={project.repoUrl} target="_blank">
                <Github className="h-3 w-3 mr-1" />
                Code
              </Link>
            </Button>
          )}
          <Button size="sm" variant="ghost" asChild>
            <Link href={project.url}>
              View Details
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}