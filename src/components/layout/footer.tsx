import Link from "next/link"
import { Github, Twitter, Mail, Linkedin } from "lucide-react"

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/Thewhey-Brian",
    icon: Github,
  },
  {
    name: "Twitter",
    href: "https://x.com/BrianXinyu", 
    icon: Twitter,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/xinyu-guo-5408/",
    icon: Linkedin,
  },
  {
    name: "Email",
    href: "mailto:xyguo1202@gmail.com",
    icon: Mail,
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with{" "}
              <Link
                href="https://nextjs.org"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Next.js
              </Link>
              {" "}and{" "}
              <Link
                href="https://ui.shadcn.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                shadcn/ui
              </Link>
              . The source code is available on{" "}
              <Link
                href="https://github.com/yourusername/personal-website"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                GitHub
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-9 py-2 w-9 px-0"
              >
                <link.icon className="h-4 w-4" />
                <span className="sr-only">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}