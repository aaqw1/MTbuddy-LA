import { NextRequest, NextResponse } from 'next/server';
import { generateSurgeryDetail as generateSurgeryDetailService } from '@/services/geminiService';
import { retrieveContext } from '@/services/ragService';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, intakeData, mediaParts, referenceImageBase64 } = body;

        if (!query) {
            return NextResponse.json(
                { error: 'query is required' },
                { status: 400 }
            );
        }

        // Retrieve RAG context from Supabase (or fallback mock)
        const contextChunks = await retrieveContext(query);

        const detail = await generateSurgeryDetailService(
            query,
            contextChunks,
            intakeData || undefined,
            mediaParts || undefined,
            referenceImageBase64 || undefined
        );

        if (!detail) {
            return NextResponse.json(
                { error: 'Failed to generate surgery detail' },
                { status: 500 }
            );
        }

        return NextResponse.json({ detail });
    } catch (err: any) {
        console.error('Surgery Detail API Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
