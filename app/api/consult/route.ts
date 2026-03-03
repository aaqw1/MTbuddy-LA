import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            sessionId,
            name,
            email,
            phone,
            address,
            message,
            intakeData,
            designTitle,
            designStyle,
            costEstimate,
        } = body;

        if (!name || !email) {
            return NextResponse.json(
                { error: 'name and email are required' },
                { status: 400 }
            );
        }

        // Persist to Supabase
        const { data, error } = await supabase
            .from('consult_requests')
            .insert({
                session_id: sessionId || null,
                name,
                email,
                phone: phone || null,
                address: address || null,
                message: message || null,
                intake_data: intakeData || null,
                design_title: designTitle || null,
                design_style: designStyle || null,
                cost_estimate: costEstimate || null,
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase consult insert error:', error);
            // Still return success — we don't want to block the user
            return NextResponse.json({
                success: true,
                saved: false,
                message: 'Request received but could not save to database.',
            });
        }

        return NextResponse.json({
            success: true,
            saved: true,
            id: data.id,
        });
    } catch (err: any) {
        console.error('Consult API Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
