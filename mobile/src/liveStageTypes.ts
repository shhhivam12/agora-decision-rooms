export type PlanningTool = 'venues' | 'reservations' | 'weather' | 'travel';
export interface MeetingPlan {
  city: string;
  origin: string;
  date: string;
  time: string;
}
export interface MemberPreference {
  budget?: number | null;
  diet?: 'Vegetarian' | 'No vegetarian requirement' | '';
  setting?: 'Indoors preferred' | 'Outdoors preferred' | '';
  note?: string;
}
export interface LiveVenue {
  id: string;
  name: string;
  kind: string;
  vegetarian: string;
  hours: string;
  reservation: string;
  website: string | null;
  phone: string;
  source: string;
  price: number | null;
}
export interface PlanningCheck {
  tool: PlanningTool;
  status: 'checking' | 'ready' | 'error';
  summary: string;
  summaryHi?: string;
  detail?: string;
  detailHi?: string;
  checkedAt: number;
  requestedBy: string;
  provider?: string;
  source?: string;
  website?: string | null;
  phone?: string;
  needs?: ('city' | 'origin' | 'date' | 'venue')[];
  previousResult?: Pick<
    PlanningCheck,
    'summary' | 'summaryHi' | 'checkedAt' | 'provider' | 'source'
  >;
}
export interface LiveStageState {
  revision: number;
  decisionVersion: number;
  contextVersion: number;
  plan: MeetingPlan;
  preferences: Record<string, MemberPreference>;
  venues: LiveVenue[];
  selectedId: string | null;
  checks: Partial<Record<PlanningTool, PlanningCheck>>;
  votes: Record<string, string>;
  notice: string;
  voiceDelivery: 'idle' | 'sending' | 'sent' | 'failed' | 'not-started';
  pendingChecks?: Partial<
    Record<PlanningTool, { tool: PlanningTool; needs: string[] }>
  >;
  suggestedPlan?: { plan: MeetingPlan; name: string } | null;
  approved: null | {
    id: string;
    venue: LiveVenue;
    plan: MeetingPlan;
    participants: { uid: string; name: string }[];
    approvedAt: number;
    bookingMade: false;
  };
}
export type StageCommand =
  | { action: 'plan'; plan: MeetingPlan }
  | { action: 'preference'; preference: MemberPreference }
  | { action: 'utterance'; text: string; turnId: string }
  | { action: 'request'; text: string }
  | { action: 'check'; tool: PlanningTool }
  | { action: 'select'; venueId: string }
  | { action: 'vote'; support: boolean; version: number }
  | { action: 'approve'; version: number };
