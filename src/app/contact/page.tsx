import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Github, Twitter, Linkedin, MapPin } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Xinyu Guo for collaborations, opportunities, or discussions about computational biology and AI projects.",
  alternates: {
    canonical: 'https://www.xinyuguo.com/contact'
  }
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Get in Touch</h1>
        <p className="text-lg text-muted-foreground mb-8">
          I&apos;m always interested in hearing about new opportunities, collaborations, or ideas worth exploring. 
          Whether it&apos;s about computational biology, AI projects, or turning crazy ideas into real prototypes, 
          I&apos;d be glad to connect.
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
              <CardDescription>
                The best way to reach me for professional inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="mailto:xyguo1202@gmail.com">
                  Send Email
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub
              </CardTitle>
              <CardDescription>
                Check out my open source projects and contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="https://github.com/Thewhey-Brian" target="_blank">
                  View Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="h-5 w-5" />
                LinkedIn
              </CardTitle>
              <CardDescription>
                Connect with me professionally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="https://www.linkedin.com/in/xinyu-guo-5408/" target="_blank">
                  Connect
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Twitter className="h-5 w-5" />
                Twitter
              </CardTitle>
              <CardDescription>
                Follow for updates on my work and thoughts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="https://x.com/BrianXinyu" target="_blank">
                  Follow
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
            <CardDescription>
              Currently based in Los Angeles, CA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have an opportunity, a collaboration idea, or just want to talk tech and science, 
              I&apos;d love to hear from you.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Prefer other communication methods? Let me know what works best for you when you reach out.
          </p>
        </div>
      </div>
    </div>
  )
}