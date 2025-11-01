import { Button } from "@/components/ui/button"
import { Download, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Xinyu Guo's background in computational biology, education at USC and Johns Hopkins, and research interests in genomics and AI.",
  alternates: {
    canonical: 'https://www.xinyuguo.com/about'
  }
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          <div className="md:w-1/3">
            <div className="sticky top-24">
              <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-muted">
                <img 
                  src="/headshot.jpg" 
                  alt="Xinyu (Brian) Guo - Professional Headshot" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <h1 className="text-2xl font-bold">Xinyu (Brian) Guo</h1>
                <p className="text-muted-foreground">Researcher & Developer</p>
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Los Angeles, CA
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button asChild>
                  <Link href="/cv.pdf" target="_blank">
                    <Download className="mr-2 h-4 w-4" />
                    Download CV
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Welcome to my corner of the internet! I’m (郭昕育) Xinyu (Brian) Guo — a passionate researcher, 
                    developer, and Ph.D. candidate in Computational Biology & Bioinformatics at USC. 
                  </p>
                  <p>
                    My research focuses on the intersection of genomics, statistical learning, 
                    and deep learning, where I build tools that make sense of complex biological data and 
                    uncover patterns that drive disease and therapy insights.
                  </p>
                  <p>
                    I’m especially enthusiastic about novel technologies — from LLM-powered systems, 
                    to computer vision pipelines. For me, every new algorithm or platform isn’t just a tool,
                    but a chance to explore, experiment, and create solutions that bridge science and real-world impact.
                  </p>
                  <p>
                    Outside of research, I enjoy exploring new hobbies that keep me equally curious. 
                    You can find me exploring the world through photography,
                    capturing moments that tell stories about our shared human experiences.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Skills & Expertise</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Research Areas</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Computational Biology (single-cell, spatial transcriptomics, genomics)</li>
                      <li>• Machine Learning & AI (self-supervised learning, LLMs)</li>
                      <li>• Statistical Modeling (risk prediction, regression, meta-analysis)</li>
                      <li>• Computer Vision (object detection, tracking, action recognition)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Technical Skills</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• R, Python, SQL, Java, HTML</li>
                      <li>• PyTorch, scikit-learn, Bioconductor</li>
                      <li>• Data scraping, dashboard building, predictive analytics</li>
                      <li>• Single-cell & multi-omics pipelines</li>
                      <li>• Git, cloud computing, HPC</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Timeline</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                        <Calendar className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="w-px h-16 bg-border"></div>
                    </div>
                    <div className="pb-8">
                      <h3 className="font-medium">Present</h3>
                      <p className="text-sm text-muted-foreground">Ph.D. Candidate in Computational Biology & Bioinformatics</p>
                      <p className="text-sm text-muted-foreground">University of Southern California</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="w-px h-16 bg-border"></div>
                    </div>
                    <div className="pb-8">
                      <h3 className="font-medium">2022</h3>
                      <p className="text-sm text-muted-foreground">ScM. in Biostatistics</p>
                      <p className="text-sm text-muted-foreground">Johns Hopkins University</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">2020</h3>
                      <p className="text-sm text-muted-foreground">B.A. in Mathematics & Computer Science</p>
                      <p className="text-sm text-muted-foreground">Washington University in St. Louis</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}