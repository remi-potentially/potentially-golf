

import type { LucideProps } from 'lucide-react';
import type React from 'react';

export interface Drill {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  scoringMethodology: string;
  icon: string;
  targetsAreaOfPotential: string[];
  relevanceScore?: number;
  matchedAreasOfPotentialTags?: string[];
  audioUrl?: string;
  maxScore?: number;
}

export interface HoleScore {
  hole: number;
  par: number;
  score: number;
  yardage: number;
  drivingDistance: number;
  teeShot: 'Left' | 'Fairway' | 'Right' | null;
  gir: boolean;
  putts: number;
  upAndDown: boolean;
  penaltyStrokes: number;
  sandSavesAttempted: number;
  sandSavesMade: number;
}

export interface SelectedGoal {
    description: string;
    type: 'Outcome' | 'Process';
}

export interface RoundStats {
  id: string | number;
  roundDate: string;
  roundType: 'Casual' | 'Competition' | 'Indoor';
  courseName: string;
  courseId?: string; // Added for searchable course
  teePlayedOff: string;
  city?: string; // Optional field for weather lookup
  country?: string; // Optional field for weather lookup
  holesPlayed: '9' | '18';
  currentHandicap: string;
  targetHandicap: string; 
  grossScore: string;
  coursePar: string;
  scoreToPar: string;
  drivingDistance: string;
  fairwaysInRegulation: string;
  fairwaysMissedLeft: string;
  fairwaysMissedRight: string;
  drivingPenalties: string;
  greensInRegulation: string;
  greensMissedLeft: string;
  greensMissedRight: string;
  greensMissedShort: string;
  greensMissedLong: string;
  approachPenalties: string;
  upAndDown: string;
  sandSavesAttempted: string;
  sandSavesMade: string;
  notApplicableSand?: boolean;
  puttsTotal: string;
  threePuttsOrMore: string;
  onePutts: string;
  twoPutts: string;
  notApplicablePutting?: boolean;
  puttsAttempted5yards: string;
  puttsMade5yards: string;
  notApplicable5yards: boolean;
  puttsAttempted10yards: string;
  puttsMade10yards: string;
  notApplicable10yards: boolean;
  puttsAttempted20yards: string;
  puttsMade20yards: string;
  notApplicable20yards: boolean;
  puttsAttempted21plusYards: string;
  puttsMade21plusYards: string;
  notApplicable21plusYards: boolean;
  generalObservations: string;
  holeScores?: HoleScore[]; // To store live round data
  selectedGoals?: SelectedGoal[];
}

export interface PracticeSession {
  id: string;
  name: string;
  createdAt: any; // Can be a server timestamp
  isCompleted: boolean;
  sessionDate?: string;
}

export interface PracticePlanItem {
  id?: string;
  drillId: string;
  score: string;
  notes: string;
  completed: boolean;
  dateAdded: string;
  timeTaken: number;
  dateCompleted?: string; 
  sessionId?: string | null;
}

export interface JournalEntry {
  id?: string;
  notes: string;
  date: string;
  drillName: string;
  practicePlanItemDateAdded?: string;
  roundId?: string;
}

export interface IdentifiedAreaOfPotential {
  tag: string;
  score: number;
}

export interface CompletedDrillHistoryEntry {
  drillId: string;
  dateCompleted: string;
  recurrenceScore: number;
}

export interface AiDrillModificationItem {
  title: string;
  description: string;
}

export interface AiDrillModifications {
  drillId: string | null;
  content: AiDrillModificationItem[] | null;
  error: string | null;
}

export type CurrentPage =
  | 'dashboard'
  | 'inputRoundChoice'
  | 'liveScorecard'
  | 'liveScorecardReview'
  | 'inputRoundEssentials'
  | 'inputRoundDriving'
  | 'inputRoundApproach'
  | 'inputRoundAroundTheGreen'
  | 'inputRoundPutting'
  | 'inputReflection'
  | 'drills'
  | 'practice'
  | 'journal'
  | 'library'
  | 'achievements'
  | 'theLockerRoom'
  | 'profile'
  | 'preRoundCheckIn'
  | 'roundPlanner';

export type ActivePracticeTab = 'unassigned' | 'sessions' | 'completed';

export interface ImageUrls {
  morning: string;
  midday: string;
  evening: string;
}

export interface HandicapHistoryEntry {
    date: string;
    handicap: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  handicap?: string;
  targetHandicap?: string;
  primaryGoal?: string;
  handedness?: 'Right' | 'Left';
  strengths?: string;
  weaknesses?: string;
  driverDistance?: string;
  sevenIronDistance?: string;
  pitchingWedgeDistance?: string;
  practiceHoursPerWeek?: string;
  practiceFacilities?: string[];
  profilePictureUrl?: string;
  homeClub?: string;
  bagSetup?: {
    driver?: string;
    woods?: string;
    hybrids?: string;
    irons?: string;
    wedges?: string;
    putter?: string;
  };
  practicePeriodStartDate?: string;
  practicePeriodEndDate?: string;
  primaryFocus?: string; // GMA: The current medium-term goal focus
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
}

export type GpsPoint = [number, number]; // [lat, lng]
export type GpsPolygon = GpsPoint[];

export interface HoleGpsData {
  hole: number;
  par: number;
  yardage: number;
  tee: GpsPoint;
  green: GpsPolygon;
  fairway?: GpsPolygon;
  bunkers?: GpsPolygon[];
  water?: GpsPolygon[];
}

export interface Scorecard {
  id: string;
  courseName: string;
  teeColor: string;
  holeData: (Pick<HoleScore, 'hole' | 'par' | 'yardage'> & Partial<HoleGpsData>)[];
}


export interface AchievementData {
  rounds: RoundStats[];
  practicePlan: PracticePlanItem[];
  journalEntries: JournalEntry[];
  completedDrillHistory: CompletedDrillHistoryEntry[];
  favouriteDrillIds: string[];
  profile: UserProfile | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: (data: AchievementData) => boolean;
  progress?: (data: AchievementData) => { current: number; target: number; unit?: string };
  dependsOn?: string;
  getInstances?: (data: AchievementData) => { date: string; description: string }[];
}

// AI Flow input/output types for UI


// Round Clarifying Questions Flow
export type ClarifyingQuestionsInput = {
  typeOfRound: 'Casual' | 'Competition' | 'Indoor';
  generalObservations: string;
  pastObservations: string[];
  scoreToPar: string;
  fairwaysInRegulation: string;
  greensInRegulation: string;
  puttsTotal: string;
  threePuttsOrMore: string;
};

export type ClarifyingQuestionsOutput = {
  questions: string[];
};

// Drill Clarifying Questions Flow
export type DrillClarifyingQuestionsInput = {
  drillName: string;
  drillCategory: string;
  userNotes: string;
  pastRoundObservations: string[];
  pastDrillNotes: string[];
};

export type DrillClarifyingQuestionsOutput = {
  questions: string[];
};


// Analyze Round Reflection Flow
export interface AnalyzeRoundReflectionInput {
  roundId: string;
  userName?: string;
  currentHandicap: string;
  roundType: string;
  holesPlayed: string;
  grossScore: string;
  coursePar: string;
  scoreToPar: string;
  fairwaysInRegulation: string;
  greensInRegulation: string;
  upAndDown?: string;
  sandSavesAttempted?: string;
  sandSavesMade?: string;
  puttsTotal: string;
  threePuttsOrMore: string;
  puttingSummary: string;
  courseName: string;
  city?: string;
  country?: string;
  roundDate: string;
  teePlayedOff: string;
  generalObservations: string;
  targetHandicap: string;
  selectedGoals?: SelectedGoal[];
  availableDrills: {
    id: string;
    name: string;
    category: string;
    description: string;
  }[];
  drillCompletionTarget?: number;
}
export type AnalyzeRoundReflectionOutput = {
  roundId: string;
  reflection: string;
  recommendedDrills?: {
    drillId: string;
    rationale: string;
  }[];
};


// AI Drill Focus Flow
export interface AiDrillFocusInput {
  drillName: string;
  drillDescription: string;
  areasOfPotential: string[];
  lastRound?: {
    scoreToPar: string;
    fairwaysInRegulation: string;
    greensInRegulation: string;
    puttsTotal: string;
    generalObservations: string;
  };
  relevantJournalEntries: {
    drillName: string;
    notes: string;
  }[];
}

export type AiDrillFocusOutput = {
  modifications: AiDrillModificationItem[];
};

// Pre-round Focus Flow
export interface ProposedGoal {
    description: string;
    type: 'Outcome' | 'Process';
}

export interface PreRoundFocusInput {
    userName?: string;
    confidence: string;
    worries: string;
    courseName: string;
    city: string;
    country: string;
    playDate: string;
    userHandicap?: string;
    identifiedAreasOfPotential: string[];
    allRounds: {
        roundDate: string;
        scoreToPar: string;
        fairwaysInRegulation: string;
        greensInRegulation: string;
        puttsTotal: string;
        generalObservations: string;
        courseName: string;
        roundType: string;
    }[];
    allJournalEntries: {
        date: string;
        drillName: string;
        notes: string;
    }[];
}

export interface PreRoundFocusOutput {
    mainFocus: string;
    statInsight: string;
    cheatSheet: string[];
    tacticalStrategy: string;
    proposedGoals: ProposedGoal[];
    lockedInGoals?: SelectedGoal[];
}

// Coach Check-in Flow
export interface CoachCheckInInput {
    userName?: string;
    allRounds: {
        roundDate: string;
        scoreToPar: string;
        fairwaysInRegulation: string;
        greensInRegulation: string;
        puttsTotal: string;
        roundType: string;
    }[];
    allJournalEntries: {
        date: string;
        drillName: string;
        notes: string;
    }[];
    pendingDrills: {
        name: string;
        category: string;
    }[];
    isProactive?: boolean;
}

export interface CoachCheckInOutput {
    checkInMessage: string;
}

// Goal Manager Agent
export interface GMAInput {
    userProfile: UserProfile;
    allRounds: RoundStats[];
    areasOfPotential: IdentifiedAreaOfPotential[];
}

export interface GMAResult {
    focusHasChanged: boolean;
    newFocus: string | null;
    message: string | null;
}
