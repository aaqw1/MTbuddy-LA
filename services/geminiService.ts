import { GoogleGenAI } from "@google/genai";
import { DocumentChunk, AiResponse, Citation, DesignOption, DesignStyle, IntakeData, PreviewCard, SurgeryReport } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- IMAGE GENERATION HELPER ---
async function generateImage(prompt: string, aspectRatio: "1:1" | "3:4" | "16:9" | "4:3" = "1:1", referenceImageBase64?: string): Promise<string | null> {
  if (!prompt) return null;
  const maxRetries = 2;

  // If reference image exists, use it (Image-to-Image)
  const contents = referenceImageBase64 
    ? {
        parts: [
          { inlineData: { data: referenceImageBase64, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    : { parts: [{ text: prompt }] };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: contents,
        config: { imageConfig: { aspectRatio: aspectRatio, imageSize: "1K" } }
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      return null;
    } catch (error: any) {
      if (error.status === 429 || error.code === 429 || error.message?.includes('quota')) {
        await delay(2000 * attempt); 
        continue;
      }
      return null;
    }
  }
  return null;
}

// --- VEO VIDEO GENERATION HELPER ---
export const generateVirtualTour = async (imageBase64: string): Promise<string | null> => {
  if (!imageBase64) return null;
  
  // Clean base64 string
  const cleanBase64 = imageBase64.includes('base64,') ? imageBase64.split('base64,')[1] : imageBase64;
  
  // Use a fresh instance to ensure the latest API key (e.g. from user selection) is used
  const apiKey = process.env.API_KEY || '';
  const freshAi = new GoogleGenAI({ apiKey });

  try {
    let operation = await freshAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview', // High quality model
      prompt: 'Cinematic FPV walkthrough of this renovated bathroom. Moving forward slowly to reveal details. Photorealistic, 4k quality, soft lighting. Ensure the video is 8 seconds long.',
      image: {
        imageBytes: cleanBase64,
        mimeType: 'image/png', // Assumption: previous images are png
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9' // Use landscape for video
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s polling
      operation = await freshAi.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) return null;

    // Fetch the video content to create a local Blob URL
    // This avoids issues with the <video> tag failing to authenticate
    const response = await fetch(`${videoUri}&key=${apiKey}`);
    if (!response.ok) {
        console.error("Failed to fetch video blob", response.statusText);
        return null;
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (e) {
    console.error("Veo Gen Error", e);
    return null;
  }
};

// --- BLUEPRINT GENERATION HELPER (NEW) ---
export const generateBlueprint = async (moodImageBase64: string): Promise<string | null> => {
  if (!moodImageBase64) return null;
  
  // Clean base64 string if it has prefix
  const cleanBase64 = moodImageBase64.includes('base64,') ? moodImageBase64.split('base64,')[1] : moodImageBase64;

  const prompt = `Create a technical architectural blueprint sheet based on this design.
  Layout: 4-quadrant layout with "Floor Plan" (top-left), "Elevation A" (top-right), "Elevation B" (bottom-left), "Section" (bottom-right).
  Style: Black lines on beige paper. Minimalist line work.
  
  CRITICAL RULES:
  1. NO DIMENSIONS: Do NOT include any dimension lines, measurements, or numeric annotations. Clean drawing only.
  2. SIMPLIFIED FIXTURES: Draw toilets, sinks, and tubs as simple geometric outlines. No internal details or shading.
  3. LABELS: Label the views simply as: "Floor Plan", "Elevation A", "Elevation B", "Section" below each view. Use a clear, professional font.
  4. NO TITLE BLOCK: Do not include a main project title or title block. Leave the header area blank.
  5. DISCLAIMER: Include this text note clearly at the bottom: "Drafted plan for pre-planning. not accurate enough for permit package."`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: cleanBase64, mimeType: 'image/png' } },
          { text: prompt }
        ]
      },
      config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) {
    console.error("Blueprint Gen Error", e);
    return null;
  }
};

// --- RAG QUERY HELPER ---
export const queryGeminiWithRAG = async (
  userQuery: string,
  contextChunks: DocumentChunk[]
): Promise<AiResponse> => {
  const contextText = contextChunks.map(c => `SOURCE: ${c.title}\nCONTENT: ${c.content}`).join('\n---\n');
  
  const systemInstruction = `
    You are an expert LA Permit Consultant.
    Answer the user's question based on the provided context.
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [{ text: `CONTEXT: ${contextText}\nQUESTION: ${userQuery}` }] 
      },
      config: { 
        systemInstruction, 
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      answer: data.answer,
      citations: data.citations || [],
      previews: []
    };
  } catch (e) {
    console.error("RAG Query Error", e);
    return {
      answer: "I encountered an error analyzing the regulations.",
      previews: [],
      citations: []
    };
  }
};

// --- PHASE 1: GENERATE PREVIEWS ---
export const generatePreviews = async (
  userQuery: string,
  intakeData?: IntakeData,
  mediaParts?: Array<{ inlineData: { data: string; mimeType: string } }>,
  referenceImageBase64?: string
): Promise<PreviewCard[]> => {
  
  const intakeString = intakeData ? JSON.stringify(intakeData, null, 2) : "No intake data provided.";

  // --- BUILD STRICT CONSTRAINTS ---
  let strictConstraints = "";
  if (intakeData) {
     if (intakeData.isChangingOpenings === "No" || intakeData.isChangingOpenings === "Unsure") {
        strictConstraints += "- CONSTRAINT: DO NOT MOVE WINDOWS OR DOORS. KEEP EXACT POSITIONS.\n";
     }
     if (intakeData.isLayoutChange === "Like-for-Like" || intakeData.isLayoutChange === "No") {
        strictConstraints += "- CONSTRAINT: DO NOT MOVE PLUMBING FIXTURES (Toilet, Sink, Shower/Tub) from original locations.\n";
     }
     if (intakeData.isRemovingWalls === "No") {
        strictConstraints += "- CONSTRAINT: DO NOT REMOVE OR MOVE ANY WALLS.\n";
     }
     
     // Tub/Shower Preferences
     if (intakeData.tubShowerPreference) {
        if (intakeData.tubShowerPreference === "Walk-in Shower") {
            strictConstraints += "- CONSTRAINT: REMOVE ANY BATHTUB. INSTALL WALK-IN SHOWER. NO TUB.\n";
        } else if (intakeData.tubShowerPreference === "Free Standing Tub") {
            strictConstraints += "- CONSTRAINT: INSTALL FREE STANDING TUB.\n";
        } else if (intakeData.tubShowerPreference === "Alcove Tub") {
             strictConstraints += "- CONSTRAINT: INSTALL ALCOVE TUB.\n";
        } else if (intakeData.tubShowerPreference === "Keep Existing") {
             strictConstraints += "- CONSTRAINT: KEEP EXISTING TUB/SHOWER CONFIGURATION.\n";
        }
     }
  }

  const systemInstruction = `
    You are an Architectural Consultant. 
    Analyze the user's intake and media (Video/Photo).
    
    Output exactly 4 options in a JSON array called "previews".
    The order MUST be:
    1. "Classical" Design (Type: design, Style: Classical)
    2. "Transitional" Design (Type: design, Style: Transitional)
    3. "Modern" Design (Type: design, Style: Modern)
    4. "Plumbing Analysis" (Type: surgery) - A 3D Axonometric MEP analysis.

    **CRITICAL FOR 'SURGERY':**
    - Construct the 3D scene carefully from the photo.
    - **MUST INCLUDE THE SINK:** There is a Sink/Lavatory plumbing group (typically to the right of the toilet). Do not ignore it.
    - Image Prompt: "A 3D AXONOMETRIC CUTAWAY DIAGRAM of the bathroom plumbing. Isometric view. The walls are cut away to reveal the internal piping stack. Show the TOILET drain (Green), the SHOWER drain (Green), and the SINK/LAVATORY supplies (Blue/Red) and drain to the right. Dark technical blueprint background. High-tech engineering style."

    **CRITICAL FOR 'DESIGN' IMAGE PROMPTS:**
    1. **VISUAL CONSISTENCY**: The 'image_prompt' MUST match the Design Title and Description logic.
       - If Title is "Modern" and you decide to convert tub to shower, the image_prompt MUST contain: "REMOVE bathtub. Install frameless glass walk-in shower."
       - If description implies a "Floating Vanity", image_prompt MUST say "Install floating vanity".
    
    2. **GEOMETRY & LAYOUT LOCK (CRITICAL)**:
       - **USER CONSTRAINTS:**
       ${strictConstraints}
       - **DO NOT HALLUCINATE** new windows or doors. Use the reference image as the absolute ground truth for the room shell.

    3. **STYLE SPECIFICS**:
       - Classical: "Ornate moldings, traditional vanity, marble floors. Keep layout."
       - Modern: "Minimalist, flat panel floating vanity, large format tile. Remove clutter."
       - Transitional: "Shaker cabinets, subway tile, balanced mix."
  `;

  const textPart = {
    text: `
    USER INTAKE: ${intakeString}
    USER NOTES: ${userQuery}
    
    Generate the 4 previews JSON. 
    Ensure 'image_prompt' contains EXPLICIT commands for modifications (e.g. "REMOVE Tub") and EXPLICIT constraints for what stays (e.g. "KEEP Door location").
    `
  };
  const parts = mediaParts ? [...mediaParts, textPart] : [textPart];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { 
        systemInstruction, 
        responseMimeType: "application/json",
        temperature: 0.4 
      }
    });

    const data = JSON.parse(response.text || "{}");
    const previews: PreviewCard[] = data.previews || [];

    // Generate Previews. 
    // Design uses 4:3. Surgery uses 16:9.
    await Promise.all(previews.map(async (p) => {
      const ratio = p.type === 'design' ? "4:3" : "16:9";
      p.image_url = await generateImage(p.image_prompt, ratio, referenceImageBase64) || undefined;
    }));

    return previews;
  } catch (e) {
    console.error("Preview Gen Error", e);
    return [];
  }
};

// --- PHASE 2: GENERATE DESIGN DETAIL ---
export const generateDesignDetail = async (
  style: DesignStyle,
  userQuery: string,
  contextChunks: DocumentChunk[],
  intakeData?: IntakeData,
  mediaParts?: Array<{ inlineData: { data: string; mimeType: string } }>,
  referenceImageBase64?: string,
  styleImageUrl?: string
): Promise<DesignOption | null> => {
  const contextText = contextChunks.map(c => `SOURCE: ${c.title}\nCONTENT: ${c.content}`).join('\n---\n');
  const intakeString = intakeData ? JSON.stringify(intakeData, null, 2) : "No intake data provided.";

  // --- BUILD STRICT CONSTRAINTS FOR DETAIL ---
  let strictConstraints = "";
  if (intakeData) {
     if (intakeData.isChangingOpenings === "No" || intakeData.isChangingOpenings === "Unsure") {
        strictConstraints += "CONSTRAINT: Visual comparison MUST KEEP exact door and window positions.\n";
     }
     if (intakeData.isLayoutChange === "Like-for-Like" || intakeData.isLayoutChange === "No") {
        strictConstraints += "CONSTRAINT: Visual comparison MUST KEEP toilet and sink in original locations.\n";
     }
     
     // Tub/Shower Preferences
     if (intakeData.tubShowerPreference) {
        if (intakeData.tubShowerPreference === "Walk-in Shower") {
            strictConstraints += "CONSTRAINT: REMOVE ANY BATHTUB. DESIGN MUST FEATURE WALK-IN SHOWER.\n";
        } else if (intakeData.tubShowerPreference === "Free Standing Tub") {
            strictConstraints += "CONSTRAINT: DESIGN MUST FEATURE FREE STANDING TUB.\n";
        } else if (intakeData.tubShowerPreference === "Alcove Tub") {
             strictConstraints += "CONSTRAINT: DESIGN MUST FEATURE ALCOVE TUB.\n";
        } else if (intakeData.tubShowerPreference === "Keep Existing") {
             strictConstraints += "CONSTRAINT: KEEP EXISTING BATHTUB/SHOWER CONFIGURATION.\n";
        }
     }
  }

  const systemInstruction = `
    You are a high-end Bathroom Design & Permit Coach for Los Angeles.
    
    INPUT CONTEXT:
    1. User Intake Data.
    2. **REALITY CHECK**: The user's bathroom size is FIXED. Do NOT pretend the room is bigger.
    
    TASK:
    Generate a COMPLETE renovation plan.
    
    1. **VISUAL COMPARISONS & MODIFICATIONS**:
       - ALIGN WITH VISUALS: If the style is 'Modern', assume we are using a Floating Vanity and Wall-Hung elements to save space.
       - **CONSISTENCY CHECK**: If you propose "Convert Tub to Shower", the 'generated_image_prompt' for the comparison MUST explicitly say "Remove bathtub, install walk-in shower".
       - **CONSTRAINT CHECK**: 
         ${strictConstraints}
       
       - Explicitly state: "Using 18-inch depth vanity to increase clearance" in the 'change' field.
    
    2. **PERMIT PATH ANALYSIS (CRITICAL)**:
       - Determine if the project is "Express e-Permit" or "Counter Plan Check" based on LADBS rules (Layout change = Plan Check, Structural = Plan Check).
       - Provide key factors and CITATIONS (e.g., "LADBS IB P/GI 2023-003").

    3. **TIMELINE**:
       - Create a realistic 4-phase timeline (Demo, Rough-In, Inspection, Finish).
    
    OUTPUT JSON FORMAT:
    {
      "title": "Full Design Title",
      "description": "...",
      "permit_path_info": {
         "type": "Express e-Permit" OR "Counter Plan Check",
         "summary": "Short explanation of why...",
         "key_factors": ["Reason 1", "Reason 2"],
         "citations": ["LADBS IB P/GI 2023-003"]
      },
      "project_timeline": [
         { "phase": "1. Demolition & Prep", "duration": "3 Days", "description": "Remove fixtures, open walls." },
         { "phase": "2. Rough-In (MEP)", "duration": "1 Week", "description": "Run new waste lines and supply." }
      ],
      "visual_comparisons": [
         {
           "title": "Main Transformation",
           "description": "Overview of major changes.",
           "generated_image_prompt": "Photorealistic renovation... [STYLE]... REMOVE [Item]... INSTALL [Item]... KEEP [Item]...", 
           "modifications": [
              { "area": "Vanity / Storage", "change": "Replace bulky cabinet with 18-inch shallow floating vanity", "permit_impact": "Maintains 30-inch clearance code." }
           ]
         }
      ],
      "fixtures": { ... }, 
      "materials": { ... },
      "cost_breakdown": {
         "materials": { "low": "$X", "high": "$Y", "drivers": "..." },
         "labor": { "low": "$X", "high": "$Y", "drivers": "..." },
         "fixtures": { "low": "$X", "high": "$Y", "drivers": "..." },
         "permits": { "low": "$X", "high": "$Y", "drivers": "..." },
         "total_range": "$X - $Y"
      },
      "permit_readiness_pack": [
         { "item": "Sheet A-1: Plot Plan", "details": "Show property lines, parking, and scope location." }
      ],
      "inspection_checklists": [ ... ],
      "permit_summary": "..."
    }
  `;

  const textPart = { text: `CONTEXT: ${contextText}\nINTAKE: ${intakeString}\nGENERATE DETAILS FOR STYLE: ${style}` };
  const parts = mediaParts ? [...mediaParts, textPart] : [textPart];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { systemInstruction, responseMimeType: "application/json" }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    const opt = data as DesignOption;
    
    return opt;
  } catch (e) {
    console.error("Detail Gen Error", e);
    return null;
  }
};

// --- PHASE 2: GENERATE SURGERY REPORT ---
export const generateSurgeryDetail = async (
  userQuery: string,
  contextChunks: DocumentChunk[],
  intakeData?: IntakeData,
  mediaParts?: Array<{ inlineData: { data: string; mimeType: string } }>,
  referenceImageBase64?: string
): Promise<SurgeryReport | null> => {
  const contextText = contextChunks.map(c => `SOURCE: ${c.title}\nCONTENT: ${c.content}`).join('\n---\n');
  const intakeString = intakeData ? JSON.stringify(intakeData, null, 2) : "No intake data provided.";

  const systemInstruction = `
    You are a Senior MEP (Mechanical, Electrical, Plumbing) Consultant.
    
    TASK:
    Generate a **3D AXONOMETRIC (Isometric)** analysis of the bathroom plumbing.
    
    1. **VISUALIZATION STYLE**: 
       - "3D Cutaway / Exploded View".
       - Walls cut away to reveal internal piping stack.
       - **CRITICAL**: Include the SINK/LAVATORY plumbing group (usually to the right of the toilet).
       
    2. **KEYFRAME DEFINITIONS**:
       - The 'image_prompt' must be:
         "A 3D AXONOMETRIC CUTAWAY DIAGRAM of the bathroom. Isometric view. The walls are cut away to reveal the internal plumbing stack. 
          - NEON BLUE lines for Cold Water. 
          - NEON RED lines for Hot Water. 
          - THICK NEON GREEN lines for the Waste Pipe/Soil Stack. 
          - **SHOW SINK PLUMBING to the right of the toilet.** 
          - Dark technical blueprint background. High-tech engineering style."
    
    3. **EXECUTIVE SUMMARY**: 
       - Provide 3 actionable steps based on these findings.
    
    OUTPUT JSON FORMAT:
    {
      "overall_risk": "Summary...",
      "executive_summary": [ 
          { "action": "Verify Stack Location", "time_estimate": "1 hr", "who": "Plumber", "tools": "Camera" }
      ],
      "analysis_coverage": ["Visible plumbing", "Outlets"],
      "analysis_limitations": ["In-wall vent routing"],
      "permit_triggers": ["List triggers..."],
      "permit_and_inspection_strategy": "Detailed strategy...",
      "keyframes": [
        {
          "id": 1,
          "timestamp": "00:05",
          "title": "3D Axonometric Plumbing View",
          "image_prompt": "A 3D AXONOMETRIC CUTAWAY DIAGRAM of the bathroom. Isometric view. The walls are cut away to reveal the internal plumbing stack. NEON BLUE lines for Cold Water. NEON RED lines for Hot Water. THICK NEON GREEN lines for the Waste Pipe/Soil Stack. **SHOW SINK PLUMBING to the right of the toilet.** Dark technical blueprint background. High-tech engineering style.",
          "annotations": [
             { 
               "object_name": "Main Soil Stack", 
               "risk_level": "Orange", 
               "permit_impact": "Likely IF relocated", 
               "action": "Locate cleanout",
               "who": "Plumber", 
               "notes": "..." 
             }
          ]
        }
      ]
    }
  `;

   const textPart = { text: `CONTEXT: ${contextText}\nINTAKE: ${intakeString}\nANALYZE EXISTING CONDITIONS VIDEO.` };
   const parts = mediaParts ? [...mediaParts, textPart] : [textPart];

   try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { 
        systemInstruction, 
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const data = JSON.parse(response.text || "{}");
    const report = data as SurgeryReport;

    if (report.keyframes) {
        await Promise.all(report.keyframes.map(async (kf) => {
           // Generates the 3D Axonometric Diagram
           kf.image_url = await generateImage(kf.image_prompt, "16:9", referenceImageBase64) || undefined;
        }));
    }

    return report;

   } catch (e) {
     console.error("Surgery Gen Error", e);
     return null;
   }
};