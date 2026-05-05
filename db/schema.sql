-- Hush App Database Schema
-- Production-aligned Supabase schema for the current app architecture.
-- Run in Supabase SQL Editor for project xniwslztgcidwfcuzxlo.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS hush_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  first_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS hush_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES hush_users(id) ON DELETE SET NULL,
  primary_track TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  affirmation TEXT,
  transcript JSONB DEFAULT '[]'::jsonb,
  word_cloud_data JSONB,
  infographic_url TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  exchange_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS hush_sessions_user_id_idx ON hush_sessions(user_id);
CREATE INDEX IF NOT EXISTS hush_sessions_status_idx ON hush_sessions(status);

-- Sentence-boundary book chunks used by src/lib/search.ts.
-- This replaced the older pgvector table because the current app uses Supabase full-text search.
CREATE TABLE IF NOT EXISTS hush_book_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT DEFAULT 'Hush',
  content TEXT NOT NULL,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(section, '') || ' ' || content)
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hush_book_chunks_search_idx
  ON hush_book_chunks
  USING GIN (search_vector);

CREATE OR REPLACE FUNCTION search_book(query_text TEXT, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  section TEXT,
  content TEXT,
  rank REAL
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.section,
    c.content,
    ts_rank(c.search_vector, plainto_tsquery('english', query_text)) AS rank
  FROM hush_book_chunks c
  WHERE c.search_vector @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT limit_count;
$$;
