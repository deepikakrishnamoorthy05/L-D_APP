import { LearningTrack } from './session';

export type AssessmentType =
  | 'Module Test'
  | 'Mock Test'
  | 'Practical'
  | 'Technical Evaluation'
  | 'Project Evaluation'
  | 'Certification Evaluation';

export type AssessmentStatus = 'Draft' | 'Scheduled' | 'In Progress' | 'Completed' | 'Published';

export interface AssessmentCriterion {
  id: string;
  name: string;
  weight: number; // percentage (e.g. 40 for 40%)
  maxMarks?: number;
}

export interface AssessmentParticipant {
  id: string;
  assessmentId: string;
  traineeId: string;
  employeeId: string;
  traineeName: string;
  status: 'Assigned' | 'Evaluated' | 'Pending';
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  traineeId: string;
  employeeId: string;
  traineeName: string;
  score: number;
  percentage: number;
  result: 'Pass' | 'Fail';
  learningStatus?: 'On Track' | 'Needs Attention' | 'At Risk' | 'Project Ready';
  strengths?: string;
  improvementAreas?: string;
  evaluatorComment?: string;
  evaluatedAt?: string;
}

export interface Assessment {
  id: string;
  name: string;
  type: AssessmentType;
  bootcampId: string;
  bootcampName: string;
  bootcampYear: number;
  trackId?: string;
  track: LearningTrack;
  moduleId: string;
  moduleName: string;
  linkedSessionId?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  evaluatorId: string;
  evaluatorName: string;
  additionalEvaluatorId?: string;
  additionalEvaluatorName?: string;
  totalMarks: number;
  passingMarks: number;
  evaluationStyle: 'SCORE_BASED' | 'CRITERIA_BASED';
  criteria?: AssessmentCriterion[];
  status: AssessmentStatus;
  participantIds: string[];
  totalParticipants: number;
  averageScore?: number;
  highestScore?: number;
  lowestScore?: number;
  passRate?: number;
  failCount?: number;
  needAttentionCount?: number;
  strengthsSummary?: string;
  improvementAreasSummary?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
