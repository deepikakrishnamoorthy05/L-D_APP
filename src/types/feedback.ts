/**
 * Organization-Wide L&D Feedback & Session Evaluation Entity Models
 */

export type FeedbackStatus =
  | 'Not Requested'
  | 'Request Scheduled'
  | 'Awaiting Feedback'
  | 'Partially Collected'
  | 'Collected'
  | 'Closed'
  | 'Needs Attention'
  | 'Imported'
  | 'Validated'
  | 'Approved'
  | 'Published';

export type FeedbackSource = 'MANUAL' | 'EXCEL_IMPORT' | 'AUTOMATED_SURVEY';

/**
 * Session-Level Feedback Summary
 */
export interface SessionFeedbackSummary {
  id: string;
  sessionId: string;
  sessionTitle: string;
  trainingType: string; // e.g. 'Knowledge Sharing Series', 'Antigravity Training', 'Databricks Training', 'Informatica Training', 'Bootcamp Training', etc.
  track: string; // e.g. 'DE', 'BA', 'Tools', 'Shared', 'Common Foundation'
  trainerId: string;
  trainerName: string;
  sessionDate: string;
  year: number;
  quarter: string; // e.g. 'Q1', 'Q3'
  totalParticipants: number;
  responsesCount: number;
  pendingCount: number;
  overallRating: number; // e.g. 4.6
  contentRating: number;
  trainerRating: number;
  relevanceRating: number;
  engagementRating: number;
  paceRating: number;
  status: FeedbackStatus;
  positiveComments: string[];
  improvementSuggestions: string[];
  trainerComments?: string;
  createdAt: string;
}

/**
 * Individual Participant Feedback Response
 */
export interface ParticipantFeedbackResponse {
  id: string;
  sessionId: string;
  sessionTitle: string;
  trainingType: string;
  track: string;
  participantId: string;
  participantName: string;
  employeeId: string;
  avatarUrl?: string;
  trainerName: string;
  submittedAt: string;
  contentRating: number; // 1 to 5
  trainerRating: number;
  relevanceRating: number;
  engagementRating: number;
  paceRating: number;
  overallRating: number;
  mostUsefulComment?: string;
  improvementComment?: string;
  recommendSession?: 'Yes' | 'No' | 'Maybe';
  additionalComments?: string;
  status: 'Completed' | 'Pending';
}

/**
 * Trainer Feedback Record
 */
export interface TrainerFeedbackRecord {
  id: string;
  sessionId: string;
  sessionTitle: string;
  trainingType: string;
  trainerId: string;
  trainerName: string;
  feedbackMode: 'SESSION_LEVEL' | 'INDIVIDUAL_EMPLOYEE';
  employeeId?: string;
  employeeName?: string;
  engagementRating: number;
  understandingRating: number;
  effectivenessRating: number;
  paceRating: number;
  contentSuitabilityRating: number;
  technicalSkillRating?: number;
  problemSolvingRating?: number;
  overallRating: number;
  trainerComments: string;
  recommendedFollowUp?: string;
  submittedAt: string;
}

/**
 * Pending Feedback Request Tracking
 */
export interface PendingFeedbackRequest {
  id: string;
  sessionId: string;
  sessionTitle: string;
  trainingType: string;
  totalParticipants: number;
  responsesCount: number;
  pendingCount: number;
  requestSentDate: string;
  lastReminderDate?: string;
  nextReminderDate?: string;
  status: 'Awaiting Feedback' | 'Reminder Queued' | 'Reminded' | 'Closed';
  pendingRespondents: {
    id: string;
    name: string;
    employeeId: string;
    email: string;
  }[];
}

/**
 * Legacy/Trainee Specific Feedback Record
 */
export interface FeedbackRecord {
  id: string;
  traineeId: string;
  traineeName: string;
  employeeId: string;
  avatarUrl?: string;
  trainerId: string;
  trainerName: string;
  trainerRole?: string;
  bootcampId: string;
  bootcampName: string;
  bootcampCode?: string;
  moduleId: string;
  moduleName: string;
  sessionId?: string;
  sessionTitle?: string;
  track: string;
  feedbackDate: string;
  technicalRating: number;
  participationRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  practicalApplicationRating?: number;
  learningAttitudeRating?: number;
  overallRating: number;
  strengthComments?: string;
  improvementComments?: string;
  generalComments?: string;
  aiSummary?: string;
  aiStrengths?: string[];
  aiImprovementAreas?: string[];
  aiSkills?: string[];
  aiDevelopmentPriority?: 'Low' | 'Moderate' | 'High';
  aiRecommendedFocus?: string;
  insightBadgeType?: 'Strength' | 'Development Opportunity' | 'Needs Attention';
  status: FeedbackStatus;
  source: FeedbackSource;
  importedBy?: string;
  importedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedBy?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Feedback Filters
 */
export interface FeedbackFilterState {
  searchQuery: string;
  yearFilter: string;
  quarterFilter: string;
  trainingTypeFilter: string;
  trackFilter: string;
  trainerFilter: string;
  statusFilter: string;
  ratingFilter: string;
  kpiFilter: string | null;
}
