
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ai } from '@/lib/gemini';

export const runtime = 'nodejs'; // Required for some supabase/node ops if needed, though edge is possible with different clients

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content;

    if (!lastMessage) {
      return NextResponse.json({ error: 'No message found' }, { status: 400 });
    }

    // 1. Generate Embedding for the query
    // Fix: Update to use 'contents' array and 'embeddings' response property.
    const embeddingResponse = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: [{
        parts: [{ text: lastMessage }]
      }]
    });
    
    // Fix: Use 'embeddings' instead of 'embedding' to match the EmbedContentResponse structure.
<<<<<<< HEAD
    const embedding =
      embeddingResponse.embeddings?.values ??
      (embeddingResponse as any).embedding?.values;

    if (!embedding) {
      console.error("EmbedContent response:", embeddingResponse);
      return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
    }    
=======
    const embedding = embeddingResponse.embeddings?.values;

    if (!embedding) {
      return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 });
    }
>>>>>>> main

    // 2. Query Supabase for relevant chunks
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.5, // Adjust based on testing
      match_count: 5
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // 3. Construct Context
    let contextString = "";
    if (documents && documents.length > 0) {
      contextString = documents.map((doc: any) => 
        `SOURCE: ${doc.metadata?.filename || 'Unknown'} (Page ${doc.metadata?.page || 'N/A'})\nCONTENT: ${doc.content}`
      ).join('\n\n---\n\n');
    }

    // 4. Build System Prompt
    const systemInstruction = `
      You are an expert LA Permit Consultant. 
      You answer questions about Los Angeles bathroom remodeling permits, codes, and inspections.
      
      RULES:
      1. Use ONLY the provided context to answer. 
      2. If the context does not contain the answer, say: "I can't find a reliable source in the provided documents for that specific detail."
      3. CITATIONS ARE MANDATORY. When you state a fact, append [Filename, Page X] or [Section Name].
      4. Be concise and professional.
      5. Format using Markdown (bolding, lists).
    `;

    const fullPrompt = `
      CONTEXT:
      ${contextString}

      USER QUESTION:
      ${lastMessage}
    `;

    // 5. Generate Response
    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2
      }
    });

    const responseText = result.text;

    // Return as JSON (MVP) - For production, you might want StreamingTextResponse
    return NextResponse.json({ 
      role: 'assistant', 
      content: responseText 
    });

  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
