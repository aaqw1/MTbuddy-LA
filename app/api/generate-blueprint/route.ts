import { NextRequest, NextResponse } from 'next/server';
import { generateBlueprint as generateBlueprintService } from '@/services/geminiService';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageBase64 } = body;

        if (!imageBase64) {
            return NextResponse.json(
                { error: 'imageBase64 is required' },
                { status: 400 }
            );
        }

        const blueprintUrl = await generateBlueprintService(imageBase64);

        return NextResponse.json({ blueprintUrl });
    } catch (err: any) {
        console.error('Blueprint API Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
