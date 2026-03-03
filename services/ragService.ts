import { DocumentChunk } from '../types';
import { MOCK_KNOWLEDGE_BASE } from '../data/knowledgeBase';

/**
 * RAG Context Retrieval Service.
 *
 * Strategy:
 * 1. Try real Supabase pgvector search via the `/api/chat` route
 *    (embeddings + cosine similarity).
 * 2. If Supabase is not configured or errors out, fall back to
 *    keyword-based filtering against the in-memory MOCK_KNOWLEDGE_BASE.
 *
 * This module is imported by server-side API routes (design-detail, surgery-detail, chat).
 * It can optionally use the Supabase client directly when running server-side.
 */

let supabaseAvailable: boolean | null = null;

async function trySupabaseSearch(query: string): Promise<DocumentChunk[] | null> {
  try {
    // Dynamically import to avoid client-side bundling issues
    const { supabase } = await import('../lib/supabase');
    const { GoogleGenAI } = await import('@google/genai');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    // Generate embedding for the query
    const embeddingResponse = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: [{ parts: [{ text: query }] }],
    });

    const embedding = (embeddingResponse as any).embeddings?.values;
    if (!embedding) return null;

    // Search Supabase via the match_documents RPC
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.4,
      match_count: 8,
    });

    if (error || !documents || documents.length === 0) {
      return null;
    }

    // Map Supabase documents to DocumentChunk format
    return documents.map((doc: any, index: number) => ({
      id: `supabase_${doc.id || index}`,
      title: doc.metadata?.filename || 'Knowledge Base',
      section: `Chunk ${doc.metadata?.chunkIndex || index}`,
      content: doc.content,
    }));
  } catch {
    // Supabase not available — fall through to mock
    return null;
  }
}

/**
 * Retrieve relevant context chunks for a query.
 * Tries Supabase first, falls back to mock keyword matching.
 */
export const retrieveContext = async (query: string): Promise<DocumentChunk[]> => {
  // Try Supabase on first call, cache the result
  if (supabaseAvailable === null) {
    const results = await trySupabaseSearch(query);
    if (results) {
      supabaseAvailable = true;
      return results;
    }
    supabaseAvailable = false;
  } else if (supabaseAvailable) {
    const results = await trySupabaseSearch(query);
    if (results) return results;
  }

  // Fallback: simple keyword matching against mock knowledge base
  const lowerQuery = query.toLowerCase();

  const results = MOCK_KNOWLEDGE_BASE.filter((doc) => {
    const contentMatch = doc.content.toLowerCase().includes(lowerQuery);
    const titleMatch = doc.title.toLowerCase().includes(lowerQuery);
    // Return all for broad queries
    if (
      lowerQuery.includes('plan check') ||
      lowerQuery.includes('permit') ||
      lowerQuery.includes('inspection')
    ) {
      return true;
    }
    return contentMatch || titleMatch;
  });

  // If results are thin, return core docs
  if (results.length < 2) {
    return MOCK_KNOWLEDGE_BASE;
  }

  return results;
};
