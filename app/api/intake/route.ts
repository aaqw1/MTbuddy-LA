import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { intakeData } = body;

        if (!intakeData) {
            return NextResponse.json(
                { error: 'intakeData is required' },
                { status: 400 }
            );
        }

        // 1. Create a new session
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({})
            .select()
            .single();

        if (sessionError) {
            console.error('Session creation error:', sessionError);
            // Return a session ID even if DB save fails (use a random one)
            return NextResponse.json({
                sessionId: crypto.randomUUID(),
                saved: false,
            });
        }

        // 2. Save the intake data linked to the session
        const { error: intakeError } = await supabase
            .from('intakes')
            .insert({
                session_id: session.id,
                residential_type: intakeData.residentialType,
                is_new_bathroom: intakeData.isNewBathroom,
                is_layout_change: intakeData.isLayoutChange,
                tub_shower_preference: intakeData.tubShowerPreference,
                is_removing_walls: intakeData.isRemovingWalls,
                is_changing_openings: intakeData.isChangingOpenings,
                is_relocating_plumbing: intakeData.isRelocatingPlumbing,
                is_changing_electrical: intakeData.isChangingElectrical,
                is_changing_ventilation: intakeData.isChangingVentilation,
                is_load_bearing: intakeData.isLoadBearing,
                permit_puller: intakeData.permitPuller,
                priority: intakeData.priority,
                okay_with_revisions: intakeData.okayWithRevisions,
                has_evidence_pack: intakeData.hasEvidencePack,
            });

        if (intakeError) {
            console.error('Intake save error:', intakeError);
        }

        return NextResponse.json({
            sessionId: session.id,
            saved: !intakeError,
        });
    } catch (err: any) {
        console.error('Intake API Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
