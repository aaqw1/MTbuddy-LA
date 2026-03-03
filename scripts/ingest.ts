
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from "@google/genai";

// 1. Config
const DOCS_DIR = path.join((process as any).cwd(), 'docs'); // Place your PDFs here
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

async function getEmbedding(text: string) {
  // Use 'contents' array as required by EmbedContentParameters
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: [{
      parts: [{ text }]
    }]
  });
  // Access embedding values via the 'embeddings' property
  return response.embeddings.values;
}

async function ingest() {
  console.log("🚀 Starting ingestion...");

  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`❌ Directory ${DOCS_DIR} not found. Create it and add PDFs.`);
    return;
  }

  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.pdf'));

  for (const file of files) {
    console.log(`Processing ${file}...`);
    const filePath = path.join(DOCS_DIR, file);
    const dataBuffer = fs.readFileSync(filePath);

    // Basic PDF Text Extraction
    // Cast pdf-parse import to any to resolve "expression is not callable" error in ESM environments
    const data = await (pdf as any)(dataBuffer);
    const text = data.text;

    // Simple chunking strategy
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const p of paragraphs) {
      if (currentChunk.length + p.length < 1000) {
        currentChunk += p + "\n";
      } else {
        chunks.push(currentChunk);
        currentChunk = p + "\n";
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    console.log(`--> Generated ${chunks.length} chunks.`);

    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];
      if (content.trim().length < 20) continue; // Skip noise

      try {
        const embedding = await getEmbedding(content);

        const { error } = await supabase.from('documents').insert({
          content,
          metadata: {
            filename: file,
            chunkIndex: i,
            totalChunks: chunks.length
          },
          embedding
        });

        if (error) console.error('Supabase Error:', error);
      } catch (err) {
        console.error('Embedding Error:', err);
      }
    }
  }

  console.log("✅ Ingestion complete.");
}

ingest();
