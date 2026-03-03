/**
 * Frontend API Client — replaces direct Gemini calls with server-side API routes.
 * All AI processing now happens on the server; the client only sends/receives JSON.
 */

import type {
    PreviewCard,
    DesignOption,
    DesignStyle,
    SurgeryReport,
    IntakeData,
    AiResponse,
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// --- PREVIEWS ---
export async function generatePreviews(
    query: string,
    intakeData?: IntakeData,
    mediaParts?: Array<{ inlineData: { data: string; mimeType: string } }>,
    referenceImageBase64?: string
): Promise<PreviewCard[]> {
    const result = await fetchJSON<{ previews: PreviewCard[] }>('/generate-previews', {
        query,
        intakeData,
        mediaParts,
        referenceImageBase64,
    });
    return result.previews || [];
}

// --- DESIGN DETAIL ---
export async function generateDesignDetail(
    style: DesignStyle,
    query: string,
    intakeData?: IntakeData,
    mediaParts?: Array<{ inlineData: { data: string; mimeType: string } }>,
    referenceImageBase64?: string,
    styleImageUrl?: string
): Promise<DesignOption | null> {
    const result = await fetchJSON<{ detail: DesignOption }>('/design-detail', {
        style,
        query,
        intakeData,
        mediaParts,
        referenceImageBase64,
        styleImageUrl,
    });
    return result.detail || null;
}

// --- SURGERY DETAIL ---
export async function generateSurgeryDetail(
    query: string,
    intakeData?: IntakeData,
    mediaParts?: Array<{ inlineData: { data: string; mimeType: string } }>,
    referenceImageBase64?: string
): Promise<SurgeryReport | null> {
    const result = await fetchJSON<{ detail: SurgeryReport }>('/surgery-detail', {
        query,
        intakeData,
        mediaParts,
        referenceImageBase64,
    });
    return result.detail || null;
}

// --- BLUEPRINT ---
export async function generateBlueprint(imageBase64: string): Promise<string | null> {
    const result = await fetchJSON<{ blueprintUrl: string | null }>('/generate-blueprint', {
        imageBase64,
    });
    return result.blueprintUrl || null;
}

// --- VIDEO ---
export async function generateVirtualTour(imageBase64: string): Promise<string | null> {
    const result = await fetchJSON<{ videoUrl: string | null }>('/generate-video', {
        imageBase64,
    });
    return result.videoUrl || null;
}

// --- RAG Q&A (for AskAI component) ---
export async function askQuestion(
    query: string,
    messages?: Array<{ role: string; content: string }>
): Promise<AiResponse> {
    const result = await fetchJSON<{ role: string; content: string }>('/chat', {
        messages: [...(messages || []), { role: 'user', content: query }],
    });
    return {
        answer: result.content,
        previews: [],
        citations: [],
    };
}

// --- CONSULT REQUEST ---
export async function sendConsultRequest(data: {
    sessionId?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    message: string;
    intakeData?: IntakeData;
    designTitle?: string;
    designStyle?: string;
    costEstimate?: string;
}): Promise<{ success: boolean; id?: string }> {
    return fetchJSON('/consult', data);
}

// --- INTAKE / SESSION ---
export async function saveIntake(intakeData: IntakeData): Promise<{ sessionId: string; saved: boolean }> {
    return fetchJSON('/intake', { intakeData });
}
