// ─── Enumerations ─────────────────────────────────────────────────────────────

export type InspectionType = 'pre' | 'post';

export type InspectionRating = 'good' | 'average' | 'poor' | 'na';

// ─── Component Ratings ────────────────────────────────────────────────────────

export interface InspectionComponents {
  engine: InspectionRating;
  brakes: InspectionRating;
  clutch: InspectionRating;
  ac: InspectionRating;
  battery: InspectionRating;
  tyres: InspectionRating;
  lights: InspectionRating;
  steering: InspectionRating;
}

// ─── Inspection ───────────────────────────────────────────────────────────────

export interface Inspection {
  id: string;
  job_card_id: string;
  /** @deprecated use job_card_id */
  jobCardId?: string;

  type: InspectionType;

  // Component ratings
  engine: InspectionRating;
  brakes: InspectionRating;
  clutch: InspectionRating;
  ac: InspectionRating;
  battery: InspectionRating;
  tyres: InspectionRating;
  lights: InspectionRating;
  steering: InspectionRating;

  notes?: string;

  /** Only applicable for post-inspection */
  road_test_done?: boolean;

  inspected_by: string;
  created_at: string;

  // Legacy flat-list inspection (backward compat)
  /** @deprecated use component fields above */
  checkItem?: string;
  /** @deprecated use component fields above */
  status?: 'OK' | 'NEEDS_ATTENTION' | 'CRITICAL';
  /** @deprecated */
  photoUrls?: string[];
}

// ─── Payload ──────────────────────────────────────────────────────────────────

export interface CreateInspectionPayload extends InspectionComponents {
  job_card_id: string;
  type: InspectionType;
  notes?: string;
  road_test_done?: boolean;
}
