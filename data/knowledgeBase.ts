
import { DocumentChunk } from '../types';

/**
 * Knowledge Base derived from official LADBS Documents and provided Renovation Guides.
 * Source Material:
 * 1. P/GI 2023-003 (Express Permits)
 * 2. P/GI 2023-008 (Submittal Requirements)
 * 3. PC/STR/Corr.Lst.058 (Counter Plan Check Corrections)
 * 4. PC/MECH/Corr.Lst.106 (Plumbing Corrections)
 * 5. Sweeten & Southland Remodeling Guides (Costs & Process)
 * 6. Owner-Builder Forms & Affidavits
 */
export const MOCK_KNOWLEDGE_BASE: DocumentChunk[] = [
  // --- EXPRESS PERMITS (P/GI 2023-003) ---
  {
    id: "express_permit_criteria_building",
    title: "LADBS Information Bulletin P/GI 2023-003",
    section: "Express Permits - Building",
    content: "Express permits (No Plan Check) can be issued for: 1. Window/door change-out (same size/type). 2. Kitchen/bathroom remodel for residential buildings (NO structural changes). 3. Re-stucco. 4. Re-roof (Class A/B). 5. Drywall replacement. 6. Chimney repair. 7. Siding replacement. 11. Adding sill plate anchor bolts/plywood to cripple walls. Note: If you move walls or change the footprint, you cannot use Express Permit.",
    url: "Local Doc: P/GI 2023-003"
  },
  {
    id: "express_permit_criteria_plumbing",
    title: "LADBS Information Bulletin P/GI 2023-003",
    section: "Express Permits - Plumbing",
    content: "Express plumbing permits allowed for: 1. Non-engineered domestic water systems (1.5 inch or less). 2. Replacing plumbing fixtures. 3. Adding plumbing fixtures. 4. Replacing underground water pipes (same size). 8. Sewer alteration/repair. 10. Replacing water heaters. 11. Adding earthquake valves. 12. Lawn sprinklers.",
    url: "Local Doc: P/GI 2023-003"
  },
  {
    id: "express_permit_criteria_electrical",
    title: "LADBS Information Bulletin P/GI 2023-003",
    section: "Express Permits - Electrical",
    content: "Electrical Express permits allowed for non-engineered wiring: 1. Installation < 600 volts and up to 400 amps total load. 2. Rewiring or adding receptacles, switches, lighting. 12. Smoke detectors. 14. EV Charging stations (single family). 15. Photovoltaic systems (10kW or less, rooftop).",
    url: "Local Doc: P/GI 2023-003"
  },

  // --- SUBMITTAL REQUIREMENTS (P/GI 2023-008) ---
  {
    id: "submittal_req_plans",
    title: "LADBS Information Bulletin P/GI 2023-008",
    section: "Plan Requirements for Alterations",
    content: "For alterations/additions, plans must be: 1. Ink/indelible pencil, fully dimensioned, drawn to scale (min 1/8\"=1'). 2. Min size 18x24 for single family. 3. Signed/stamped by CA architect/engineer. 4. Cover sheet must list codes (2023 LABC, CPC, CEC, etc.), scope of work, occupancy group, and floor area.",
    url: "Local Doc: P/GI 2023-008"
  },
  {
    id: "submittal_req_architectural",
    title: "LADBS Information Bulletin P/GI 2023-008",
    section: "Architectural Plan Contents",
    content: "Architectural plans must include: 1. Plot plan (vicinity map, lot dims, building footprint, parking). 2. Floor plans (existing vs proposed, room sizes, uses, door/window schedules). 3. Roof plans (if new construction). 4. Exterior elevations. 5. Construction sections. 6. Green Code notes.",
    url: "Local Doc: P/GI 2023-008"
  },

  // --- PLUMBING CORRECTIONS (PC/MECH/Corr.Lst.106) ---
  {
    id: "plumbing_general_reqs",
    title: "Plan Check Correction Sheet (Plumbing 2020 LAPC)",
    section: "General Plumbing Requirements",
    content: "1. All fixtures must be listed. 2. Water pressure reducing valve (PRV) required if pressure > 80 psi. 3. Show make/model of PRV and Backflow preventer. 4. Water heaters must be strapped. 5. Show first hour rating of water heater. 6. CPVC piping requires specific listing/approval.",
    url: "Local Doc: PC/MECH/Corr.Lst.106"
  },
  {
    id: "plumbing_water_closet",
    title: "Plan Check Correction Sheet (Plumbing 2020 LAPC)",
    section: "Toilet & Shower Requirements",
    content: "1. Ultra-low flush water closets required. 2. Showers must have individual tempering valves (prevent scalding). 3. Shower compartments must have smooth, non-absorbent surface up to 72 inches above drain. 4. 15 inch min clearance from centerline of toilet to side wall; 24 inch clear space in front.",
    url: "Local Doc: PC/MECH/Corr.Lst.106"
  },
  {
    id: "plumbing_waste_vent",
    title: "Plan Check Correction Sheet (Plumbing 2020 LAPC)",
    section: "Waste and Vent",
    content: "1. Specify slope of horizontal drainage (min 1/4 inch per foot usually). 2. Provide riser diagram for waste/vent systems showing fixture units. 3. No vertical waste pipes in combination waste/vent systems. 4. Cleanouts required every 100 ft or at aggregate horizontal changes > 135 degrees.",
    url: "Local Doc: PC/MECH/Corr.Lst.106"
  },

  // --- COUNTER PLAN CHECK CORRECTIONS (PC/STR/Corr.Lst.058) ---
  {
    id: "counter_pc_admin",
    title: "Counter Plan Check Correction Sheet (2017 LABC)",
    section: "Administration & Clearances",
    content: "1. Plan check expires 18 months from submittal. 2. Soil/Foundation reports must be approved by Grading Section. 3. Fire lane access required if building is 150ft from street. 4. Owner-Builder permit requires notarized letter if agent pulls it. 5. Verify Workers Comp insurance.",
    url: "Local Doc: PC/STR/Corr.Lst.058"
  },
  {
    id: "counter_pc_bath_vent",
    title: "Counter Plan Check Correction Sheet (2017 LABC)",
    section: "Interior Environment - Bathrooms",
    content: "1. Bathrooms must have natural ventilation (openable window area 4% of floor area) OR mechanical ventilation (exhaust fan). 2. Glazing in hazardous locations (tubs, showers, doors) must be tempered. 3. Minimum ceiling height 7'0\".",
    url: "Local Doc: PC/STR/Corr.Lst.058"
  },

  // --- COST & RENOVATION GUIDES (Sweeten/Southland) ---
  {
    id: "cost_guide_overview",
    title: "Sweeten / Southland Remodeling Cost Guide",
    section: "LA Bathroom Renovation Costs",
    content: "1. Budget Full Renovation: Starts at $22,000 (standard materials, no layout change). 2. Mid-Grade: Starts at $32,500 (better finishes, some plumbing updates). 3. High-End: Starts at $45,000+ (luxury tile, moving walls, custom vanities). 4. Powder Room: $5,000 - $15,000.",
    url: "Local Doc: Sweeten Blog"
  },
  {
    id: "cost_guide_labor_materials",
    title: "Sweeten / Southland Remodeling Cost Guide",
    section: "Cost Breakdown",
    content: "Labor typically accounts for 25-35% of the total cost. Rough materials (drywall, pipes) are separate from Finish materials (tile, fixtures). Converting a tub to a shower often requires a 3-inch drain upsize (breaking the floor), costing extra $2k-$5k.",
    url: "Local Doc: Sweeten Blog"
  },
  {
    id: "hiring_contractor_tips",
    title: "Sweeten Renovation Guide",
    section: "Hiring a Contractor",
    content: "1. Check CSLB license active status. 2. Ensure they have General Liability and Workers Comp. 3. Ask for experience with LADBS specifically. 4. Never pay more than 10% or $1,000 down (whichever is less) per CA law.",
    url: "Local Doc: Sweeten Blog"
  },

  // --- OWNER-BUILDER RISKS ---
  {
    id: "owner_builder_risks",
    title: "Notice to Property Owner (Owner-Builder)",
    section: "Owner-Builder Risks",
    content: "1. If you pull the permit as Owner-Builder, you assume liability for worker injuries (unless you hire a licensed contractor). 2. You act as the employer for tax/insurance purposes. 3. Unlicensed contractors cannot legally work on projects > $500. 4. Construction defects are your responsibility if you sell the home.",
    url: "Local Doc: Notice to Property Owner"
  },

  // --- PERMIT APPLICATION FORMS ---
  {
    id: "permit_application_fields",
    title: "LADBS Permit Application Form 01",
    section: "Required Application Fields",
    content: "Application requires: Project Address, Valuation ($), Description of Work, Use of Building (e.g. Single Family), Owner Name/Address, Contractor License/Class, Architect/Engineer License (if applicable).",
    url: "Local Doc: PC/STR/App.01"
  }
];

// Mock permits remain useful for the Analytics view
export const MOCK_PERMITS: any[] = [
  { id: "24016-10000-01234", address: "1234 SUNSET BLVD", zip: "90026", valuation: 15000, workDescription: "BATHROOM REMODEL. REPLACE FIXTURES, NEW TILE.", status: "Issued", date: "2024-02-15" },
  { id: "24016-10000-05678", address: "5678 HOLLYWOOD BLVD", zip: "90028", valuation: 45000, workDescription: "REMODEL MASTER BATH. RELOCATE SHOWER, NEW PARTITION WALL.", status: "Finaled", date: "2024-01-10" },
  { id: "24016-10000-09012", address: "9012 VENTURA BLVD", zip: "91423", valuation: 8500, workDescription: "REPLACE TUB WITH SHOWER. NO STRUCTURAL.", status: "Issued", date: "2024-03-01" },
  { id: "24016-10000-03456", address: "3456 FIGUEROA ST", zip: "90065", valuation: 22000, workDescription: "BATHROOM UPGRADE. ELECTRICAL UPGRADE 200A.", status: "In Plan Check", date: "2024-03-10" },
];
