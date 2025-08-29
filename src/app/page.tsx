import { allPublications } from "contentlayer/generated"
import { allProjects } from "contentlayer/generated"
import HeroSection from "@/components/hero-section"
import FeaturedSections from "@/components/featured-sections"

export default function Home() {
  const featuredPublication = allPublications.find(pub => pub.featured)
  const featuredProject = allProjects.find(project => project.featured)
  
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedSections 
        featuredPublication={featuredPublication}
        featuredProject={featuredProject}
      />
    </div>
  );
}
