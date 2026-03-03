import { NextRequest, NextResponse } from 'next/server';
import { generateVirtualTour } from '@/services/geminiService';

export const runtime = 'nodejs';
export const maxDuration = 300; // Video generation can take up to 5 minutes

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

        // Note: generateVirtualTour returns a blob URL on client-side.
        // On server-side, we return the raw video URI for the client to fetch.
        const videoUrl = await generateVirtualTour(imageBase64);

        return NextResponse.json({ videoUrl });
    } catch (err: any) {
        console.error('Video Generation API Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
