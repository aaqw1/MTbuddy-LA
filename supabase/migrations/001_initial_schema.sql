-- ============================================================
-- MTBuddy LA — Supabase Initial Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Requires: pgvector extension (enabled by default on Supabase)
-- ============================================================

-- 1. Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 2. Documents table — RAG knowledge base with vector embeddings
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id          BIGSERIAL PRIMARY KEY,
  content     TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}'::JSONB,
  embedding   VECTOR(768),  -- text-embedding-004 outputs 768 dims
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vector similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================
-- 3. RPC function for vector similarity search
-- ============================================================
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count     INT DEFAULT 5
)
RETURNS TABLE (
  id         BIGINT,
  content    TEXT,
  metadata   JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- 4. Sessions table — groups chat interactions
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. Intakes table — intake wizard form data
-- ============================================================
CREATE TABLE IF NOT EXISTS intakes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id              UUID REFERENCES sessions(id) ON DELETE CASCADE,
  residential_type        TEXT,
  is_new_bathroom         TEXT,
  is_layout_change        TEXT,
  tub_shower_preference   TEXT,
  is_removing_walls       TEXT,
  is_changing_openings    TEXT,
  is_relocating_plumbing  TEXT,
  is_changing_electrical  TEXT,
  is_changing_ventilation TEXT,
  is_load_bearing         TEXT,
  permit_puller           TEXT,
  priority                TEXT,
  okay_with_revisions     TEXT,
  has_evidence_pack       TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. Messages table — chat messages (user & assistant)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT,
  previews    JSONB,      -- PreviewCard[] JSON
  detail      JSONB,      -- DesignOption | SurgeryReport JSON
  detail_type TEXT,       -- 'design' | 'surgery'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. Consult Requests table — expert consultation submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS consult_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES sessions(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  address         TEXT,
  message         TEXT,
  intake_data     JSONB,
  design_title    TEXT,
  design_style    TEXT,
  cost_estimate   TEXT,
  status          TEXT DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. Row Level Security (RLS) — open for MVP, restrict later
-- ============================================================
ALTER TABLE documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE intakes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE consult_requests ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role key (server-side only)
CREATE POLICY "Service role full access on documents"
  ON documents FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on sessions"
  ON sessions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on intakes"
  ON intakes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on messages"
  ON messages FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on consult_requests"
  ON consult_requests FOR ALL USING (true) WITH CHECK (true);
