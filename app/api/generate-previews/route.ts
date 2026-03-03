import { NextRequest, NextResponse } from 'next/server';
import {
    generatePreviews as generatePreviewsService,
} from '@/services/geminiService';

export const runtime = 'nodejs';
export const maxDuration = 120; // Allow up to 2 minutes for image generation

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, intakeData, mediaParts, referenceImageBase64 } = body;

        if (!query) {
            return NextResponse.json({ error: 'No query provided' }, { status: 400 });
        }

        const previews = await generatePreviewsService(
            query,
            intakeData || undefined,
            mediaParts || undefined,
            referenceImageBase64 || undefined
        );

        return NextResponse.json({ previews });
    } catch (err: any) {
        console.error('Generate Previews API Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
