"use client"

import { useState } from 'react'
import Link from "next/link"
import { ArrowRight, BookOpen, Code, Camera, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FeaturedSectionsProps {
  featuredPublication?: any
  featuredProject?: any
}

export default function FeaturedSections({ featuredPublication, featuredProject }: FeaturedSectionsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const sections = [
    {
      id: 'publication',
      title: 'Latest Research',
      icon: BookOpen,
      description: featuredPublication 
        ? `${featuredPublication.title} - ${featuredPublication.abstract?.substring(0, 120)}...` 
        : 'Explore my latest research in computational biology and bioinformatics.',
      href: '/publications',
      linkText: 'View Publications',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'project',
      title: 'Featured Project',
      icon: Code,
      description: featuredProject 
        ? `${featuredProject.title} - ${featuredProject.summary}`
        : 'Discover innovative solutions bridging science and technology.',
      href: '/projects',
      linkText: 'View Projects',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'photography',
      title: 'Visual Stories',
      icon: Camera,
      description: 'Journey through my photography collection featuring landscapes, street scenes, and scientific visualization.',
      href: '/photos',
      linkText: 'View Gallery',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="h-4 w-4" />
            Featured Work
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Explore My Tiny Universe
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From research to creative projects, discover the intersection of science, technology, and art.
          </p>
        </div>

        {/* Featured Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {sections.map((section) => {
            const Icon = section.icon
            const isHovered = hoveredCard === section.id

            return (
              <Card
                key={section.id}
                className={`group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 hover:shadow-2xl transition-all duration-500 ${
                  isHovered ? 'scale-105 shadow-2xl' : ''
                }`}
                onMouseEnter={() => setHoveredCard(section.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <CardHeader className="relative">
                  <div className="mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${section.color} text-white w-fit`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {section.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative">
                  <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-4">
                    {section.description}
                  </p>
                  
                  <Link
                    href={section.href}
                    className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${section.color} bg-clip-text text-transparent hover:gap-3 transition-all duration-300 group/link`}
                  >
                    {section.linkText}
                    <ArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                      isHovered ? 'translate-x-1' : ''
                    }`} />
                  </Link>
                </CardContent>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-lg border-2 border-gradient-to-br ${section.color} opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none`} />
              </Card>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
            <p className="text-sm text-muted-foreground px-4">
              Want to collaborate or learn more?
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
          </div>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Get in touch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}