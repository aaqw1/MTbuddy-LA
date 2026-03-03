import { NextRequest, NextResponse } from 'next/server';
import { generateDesignDetail as generateDesignDetailService } from '@/services/geminiService';
import { retrieveContext } from '@/services/ragService';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            style,
            query,
            intakeData,
            mediaParts,
            referenceImageBase64,
            styleImageUrl,
        } = body;

        if (!style || !query) {
            return NextResponse.json(
                { error: 'style and query are required' },
                { status: 400 }
            );
        }

        // Retrieve RAG context from Supabase (or fallback mock)
        const contextChunks = await retrieveContext(query);

        const detail = await generateDesignDetailService(
            style,
            query,
            contextChunks,
            intakeData || undefined,
            mediaParts || undefined,
            referenceImageBase64 || undefined,
            styleImageUrl || undefined
        );

        if (!detail) {
            return NextResponse.json(
                { error: 'Failed to generate design detail' },
                { status: 500 }
            );
        }

        return NextResponse.json({ detail });
    } catch (err: any) {
        console.error('Design Detail API Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
