import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

const socialLinks = [
  { name: "GitHub", href: "https://github.com/Thewhey-Brian", icon: Github },
  { name: "Twitter", href: "https://x.com/BrianXinyu", icon: Twitter },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/xinyu-guo-5408/",
    icon: Linkedin,
  },
  { name: "Email", href: "mailto:xyguo1202@gmail.com", icon: Mail },
];

const navLinks = [
  { name: "About", href: "/about" },
  { name: "Publications", href: "/publications" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="font-display text-2xl tracking-tight">
              Xinyu Guo
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Computational biology, machine learning, and the space between
              them.
            </p>
          </div>

          <nav className="flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-wipe w-fit font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center gap-6 border-t border-border pt-7 sm:flex-row sm:justify-between">
          <p className="font-mono text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Xinyu Guo
          </p>

          <div className="flex items-center gap-1">
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={link.name}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <link.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
