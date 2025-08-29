import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string
          short_bio: string | null
          long_bio_mdx: string | null
          headshot_url: string | null
          location: string | null
          links: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          short_bio?: string | null
          long_bio_mdx?: string | null
          headshot_url?: string | null
          location?: string | null
          links?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          short_bio?: string | null
          long_bio_mdx?: string | null
          headshot_url?: string | null
          location?: string | null
          links?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      publications: {
        Row: {
          id: string
          title: string
          abstract_mdx: string | null
          year: number
          venue: string
          doi: string | null
          pdf_url: string | null
          code_url: string | null
          slides_url: string | null
          video_url: string | null
          tags: string[]
          featured: boolean
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          abstract_mdx?: string | null
          year: number
          venue: string
          doi?: string | null
          pdf_url?: string | null
          code_url?: string | null
          slides_url?: string | null
          video_url?: string | null
          tags?: string[]
          featured?: boolean
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          abstract_mdx?: string | null
          year?: number
          venue?: string
          doi?: string | null
          pdf_url?: string | null
          code_url?: string | null
          slides_url?: string | null
          video_url?: string | null
          tags?: string[]
          featured?: boolean
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          summary_mdx: string | null
          status: 'completed' | 'in-progress' | 'planned'
          role: string | null
          stack: string[]
          repo_url: string | null
          demo_url: string | null
          images: string[]
          tags: string[]
          featured: boolean
          slug: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary_mdx?: string | null
          status?: 'completed' | 'in-progress' | 'planned'
          role?: string | null
          stack?: string[]
          repo_url?: string | null
          demo_url?: string | null
          images?: string[]
          tags?: string[]
          featured?: boolean
          slug: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary_mdx?: string | null
          status?: 'completed' | 'in-progress' | 'planned'
          role?: string | null
          stack?: string[]
          repo_url?: string | null
          demo_url?: string | null
          images?: string[]
          tags?: string[]
          featured?: boolean
          slug?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          image_url: string
          caption: string | null
          exif: Record<string, any> | null
          album: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          image_url: string
          caption?: string | null
          exif?: Record<string, any> | null
          album?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          caption?: string | null
          exif?: Record<string, any> | null
          album?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}