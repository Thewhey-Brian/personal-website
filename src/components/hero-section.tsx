"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react"
import ParticleNetwork from "./particle-network"

export default function HeroSection() {
  const [displayText, setDisplayText] = useState('')
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)
  const roles = ['Researcher', 'Developer', 'Photographer', 'Scientist', 'Entrepreneur']
  
  useEffect(() => {
    const currentRole = roles[currentRoleIndex]
    let charIndex = 0
    
    const typeInterval = setInterval(() => {
      setDisplayText(currentRole.slice(0, charIndex + 1))
      charIndex++
      
      if (charIndex >= currentRole.length) {
        clearInterval(typeInterval)
        
        setTimeout(() => {
          const deleteInterval = setInterval(() => {
            charIndex--
            setDisplayText(currentRole.slice(0, charIndex))
            
            if (charIndex <= 0) {
              clearInterval(deleteInterval)
              setCurrentRoleIndex((prev) => (prev + 1) % roles.length)
            }
          }, 100)
        }, 2000)
      }
    }, 150)
    
    return () => clearInterval(typeInterval)
  }, [currentRoleIndex])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Network Background */}
      <ParticleNetwork className="z-0" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10" />
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <div className="space-y-8">
          {/* Main Heading with Animation */}
          <div className="space-y-4">
            <div className="inline-block">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                  Hi, I&apos;m{' '}
                </span>
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                  Xinyu Guo
                </span>
              </h1>
            </div>
            
            {/* Animated Role Text */}
            <div className="h-16 flex items-center justify-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-muted-foreground">
                <span className="text-primary">{displayText}</span>
                <span className="animate-pulse text-primary">|</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Exploring the worlds of{' '}
            <span className="text-foreground font-semibold">computational biology</span>,{' '}
            <span className="text-foreground font-semibold">AI/ML</span>, and{' '}
            <span className="text-foreground font-semibold">statistical modeling</span>
            {' '}— decoding genomes by day, debugging code by night.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" className="group" asChild>
              <Link href="/about">
                Discover My Story
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/publications">
                Research & Publications
              </Link>
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 pt-8">
            <Link 
              href="https://github.com/yourusername" 
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6" />
            </Link>
            <Link 
              href="https://linkedin.com/in/yourusername" 
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-6 w-6" />
            </Link>
            <Link 
              href="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="Contact"
            >
              <Mail className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}