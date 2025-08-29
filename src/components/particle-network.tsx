"use client"

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

interface ParticleNetworkProps {
  className?: string
}

export default function ParticleNetwork({ className = '' }: ParticleNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()

  // Configuration
  const config = {
    particleCount: 80,
    maxDistance: 120,
    particleSpeed: 0.5,
    mouseRadius: 150,
    particleSize: { min: 1, max: 3 }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !mounted) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < config.particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * config.particleSpeed,
          vy: (Math.random() - 0.5) * config.particleSpeed,
          size: Math.random() * (config.particleSize.max - config.particleSize.min) + config.particleSize.min
        })
      }
    }

    // Get theme-appropriate colors
    const getColors = () => {
      const isDark = resolvedTheme === 'dark'
      return {
        particle: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)',
        line: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        mouseConnection: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
      }
    }

    // Animation loop
    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      
      const colors = getColors()
      const particles = particlesRef.current

      // Update and draw particles
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > width) particle.vx *= -1
        if (particle.y < 0 || particle.y > height) particle.vy *= -1

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(width, particle.x))
        particle.y = Math.max(0, Math.min(height, particle.y))

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = colors.particle
        ctx.fill()
      })

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < config.maxDistance) {
            const opacity = 1 - distance / config.maxDistance
            ctx.strokeStyle = colors.line.replace('0.1', (0.1 * opacity).toString())
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }

        // Draw connections to mouse
        const mouseDistance = Math.sqrt(
          (particles[i].x - mouseRef.current.x) ** 2 + 
          (particles[i].y - mouseRef.current.y) ** 2
        )

        if (mouseDistance < config.mouseRadius) {
          const opacity = 1 - mouseDistance / config.mouseRadius
          ctx.strokeStyle = colors.mouseConnection.replace('0.3', (0.3 * opacity).toString()).replace('0.2', (0.2 * opacity).toString())
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y)
          ctx.stroke()
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    // Resize handler
    const handleResize = () => {
      resizeCanvas()
      initParticles()
    }

    // Initialize
    resizeCanvas()
    initParticles()
    animate()

    // Event listeners
    canvas.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [mounted, resolvedTheme])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        width: '100%', 
        height: '100%',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}
    />
  )
}