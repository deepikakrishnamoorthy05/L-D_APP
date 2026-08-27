/**
 * Feedback Entity Data Models and TypeScript Interfaces
 */

export type FeedbackStatus =
  | 'Imported'
  | 'Validated'
  | 'Needs Review'
  | 'AI Processed'
  | 'Approved'
  | 'Published';

export type FeedbackSource = 'MANUAL' | 'EXCEL_IMPORT';

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

  // Numeric Ratings (1.0 to 5.0)
  technicalRating: number;
  participationRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  practicalApplicationRating?: number;
  learningAttitudeRating?: number;
  overallRating: number;

  // Trainer Comments
  strengthComments?: string;
  improvementComments?: string;
  generalComments?: string;

  // AI Interpretation & Analytics
  aiSummary?: string;
  aiStrengths?: string[];
  aiImprovementAreas?: string[];
  aiSkills?: string[];
  aiDevelopmentPriority?: 'Low' | 'Moderate' | 'High';
  aiRecommendedFocus?: string;
  insightBadgeType?: 'Strength' | 'Development Opportunity' | 'Needs Attention';

  status: FeedbackStatus;
  source: FeedbackSource;

  // Audit Fields
  importedBy?: string;
  importedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedBy?: string;
  publishedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface FeedbackFilterState {
  searchQuery: string;
  bootcampId: string;
  trainerId: string;
  moduleId: string;
  ratingFilter: string;
  status: string;
}
