-- Enable pgvector extension (run this first in Supabase SQL Editor)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE(
  object_type text,
  object_id uuid,
  chunk text,
  similarity float,
  metadata jsonb
)
LANGUAGE sql
AS $$
  SELECT
    e.object_type,
    e.object_id,
    e.chunk,
    1 - (e.embedding <=> query_embedding) as similarity,
    e.metadata
  FROM embeddings e
  WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx 
ON embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create full-text search index for hybrid search
CREATE INDEX IF NOT EXISTS embeddings_chunk_fts_idx 
ON embeddings 
USING gin(to_tsvector('english', chunk));

-- Update embeddings table to ensure proper vector column
ALTER TABLE embeddings 
ALTER COLUMN embedding TYPE vector(1536);