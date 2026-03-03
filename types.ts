
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  previews?: PreviewCard[];
  detail?: DesignOption | SurgeryReport;
  detailType?: 'design' | 'surgery';
}

export interface Citation {
  sourceId: string;
  title: string;
  location: string;
}

export type DesignStyle = 'Classical' | 'Transitional' | 'Modern';

export interface ProductItem {
  name: string;
  specs: string;
  why: string;
  citation?: string;
  imageUrl?: string;
  image_prompt?: string;
}

export interface CostRange {
  low: string;
  typical: string;
  high: string;
  drivers: string; 
}

export interface CostBreakdownDetailed {
  materials: CostRange;
  labor: CostRange;
  fixtures: CostRange;
  permits: CostRange;
  soft_costs: string; 
  contingency: string; 
  total_range: string; 
}

export interface TimelinePhase {
  phase: string;
  duration: string;
  description: string;
}

export interface PermitReadinessItem {
  item: string; 
  details: string; 
}

export interface InspectionChecklist {
  inspection_name: string; 
  checks: string[]; 
}

export interface DetailedPermitInfo {
  plan_requirements: {
    required_sheets: string[];
    sheet_details: string[]; 
  };
  permit_process: {
    likely_type: string; 
    express_vs_plancheck: string; 
    submitter_recommendation: string; 
    common_delays: string[];
  };
  inspection_strategy: {
    stages: string[];
    critical_checks: string[]; 
    do_not_cover_warning: string;
  };
  next_actions: string[];
}

// Phase 1: Lightweight Preview
export interface PreviewCard {
  id: string;
  type: 'design' | 'surgery';
  style?: DesignStyle;
  title: string;
  description: string;
  image_prompt: string;
  image_url?: string;
  // NEW: Blueprint Generation Fields
  blueprint_url?: string;
  blueprint_status?: 'idle' | 'generating' | 'done' | 'error';
  // NEW: Video Generation Fields
  video_url?: string;
  video_status?: 'idle' | 'generating' | 'done' | 'error';
}

// NEW: Visual Comparison for Design
export interface VisualComparison {
  title: string; // e.g., "Vanity Zone"
  description: string;
  original_frame_url?: string; // The user's original image
  generated_style_url?: string; // The AI generated image
  generated_image_prompt: string;
  modifications: {
    area: string; // "Sink Plumbing"
    change: string; // "Relocated 2ft left"
    permit_impact: string; // "Requires 2in drain line update"
  }[];
}

export interface PermitPathInfo {
  type: 'Express e-Permit' | 'Counter Plan Check';
  summary: string;
  key_factors: string[]; 
  citations: string[]; 
}

// Phase 2: Full Design Detail
export interface DesignOption extends PreviewCard {
  visual_comparisons?: VisualComparison[]; // Side-by-Side views
  fixtures: {
    toilet: ProductItem;
    shower_tub: ProductItem;
    sink: ProductItem;
    storage: ProductItem;
    door?: ProductItem;
    window?: ProductItem; 
  };
  materials: {
    waterproofing: ProductItem;
    wall_substrate: ProductItem;
    surface_finish: ProductItem;
    metal_finish: ProductItem;
  };
  cost_breakdown: CostBreakdownDetailed; 
  project_timeline: TimelinePhase[]; 
  permit_summary: string;
  permit_readiness_pack: PermitReadinessItem[]; 
  inspection_checklists: InspectionChecklist[]; 
  permit_detailed?: DetailedPermitInfo;
  permit_path_info?: PermitPathInfo; // Added field
  ladbs_application_steps?: string[]; 
  mood_url?: string;
  mood_prompt?: string;
  cost_estimate?: string;
}

// Phase 2: Full Surgery Detail
export interface SurgeryAnnotation {
  object_id: string; 
  object_name: string; 
  action: 'Keep' | 'Replace' | 'Upgrade' | 'Verify';
  effort: 'Low' | 'Medium' | 'High';
  risk_level: 'Green' | 'Orange' | 'Red'; 
  permit_impact: string; // Changed to string for "Likely IF..." logic
  who: string; 
  notes: string; 
  trigger_reason?: string; 
}

export interface SurgeryKeyframe {
  id: number;
  timestamp: string; 
  title: string; 
  annotations: SurgeryAnnotation[];
  image_prompt: string; 
  image_url?: string;
}

export interface ExecutiveAction {
  action: string;
  time_estimate: string;
  who: string;
  tools: string;
}

export interface SurgeryReport extends PreviewCard {
  overall_risk: string;
  executive_summary: ExecutiveAction[]; 
  keyframes: SurgeryKeyframe[];
  permit_triggers: string[];
  permit_and_inspection_strategy: string; 
  analysis_coverage: string[]; // What was checked?
  analysis_limitations: string[]; // What couldn't be checked?
}

export interface AiResponse {
  answer?: string; 
  previews: PreviewCard[];
  citations?: Citation[];
}

export interface DocumentChunk {
  id: string;
  title: string;
  section: string;
  content: string;
  url?: string;
}

export interface IntakeData {
  residentialType: string;
  isNewBathroom: string;
  isLayoutChange: string;
  tubShowerPreference: string; // Added field
  isRemovingWalls: string;
  isChangingOpenings: string;
  isRelocatingPlumbing: string;
  isChangingElectrical: string;
  isChangingVentilation: string;
  isLoadBearing: string;
  permitPuller: string;
  priority: string;
  okayWithRevisions: string;
  hasEvidencePack: string;
}

export interface ScopeData {
  address: string;
  zip: string;
  jurisdiction: 'CITY_OF_LA' | 'UNINCORPORATED' | 'OTHER';
  isDemolitionOnly: boolean;
  replaceFixturesSameLocation: boolean;
  relocatePlumbing: boolean;
  newPenetrations: boolean;
  newCircuits: boolean;
  addExhaustFan: boolean;
  modifyStructural: boolean;
  waterproofingChanges: boolean;
  description: string;
}

export enum PermitPath {
  E_PERMIT = 'E_PERMIT',
  PLAN_CHECK = 'PLAN_CHECK',
  UNCERTAIN = 'UNCERTAIN'
}
