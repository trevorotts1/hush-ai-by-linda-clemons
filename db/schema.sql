-- Hush App Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xniwslztgcidwfcuzxlo/sql/new

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

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
  user_id UUID REFERENCES hush_users(id),
  primary_track TEXT,
  status TEXT DEFAULT 'active',
  affirmation TEXT,
  transcript JSONB DEFAULT '[]',
  word_cloud_data JSONB,
  infographic_url TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  exchange_count INTEGER DEFAULT 0
);

-- Knowledge chunks (pgvector)
CREATE TABLE IF NOT EXISTS hush_knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  section TEXT,
  content TEXT NOT NULL,
  embedding VECTOR(1536)
);

-- Vector index
CREATE INDEX IF NOT EXISTS hush_knowledge_embedding_idx 
  ON hush_knowledge_chunks 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
