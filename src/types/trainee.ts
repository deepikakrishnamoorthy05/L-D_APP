/**
 * Trainee Entity Data Models and TypeScript Interfaces
 */

export type LearningStatus = 'On Track' | 'Needs Attention' | 'At Risk' | 'Project Ready';
export type EnrollmentStatus = 'Active' | 'Completed' | 'Not Assigned' | 'Archived';
export type CompanyOutcome = 'Selected' | 'Pending' | 'Not Selected';

export interface TraineeSelectionDetails {
  date?: string;
  department?: string;
  project?: string;
}

export interface TraineeModuleProgress {
  moduleId: string;
  moduleName: string;
  completedSessions: number;
  totalSessions: number;
  scorePercent: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface TraineeAssessmentResult {
  id: string;
  title: string;
  date: string;
  scorePercent: number;
  passingPercent: number;
  passed: boolean;
  type: 'Module Test' | 'Mock Test' | 'Certification';
}

export interface TraineeAttendanceSummary {
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  lateSessions: number;
  attendancePercent: number;
}

export interface Trainee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  role?: string;
  joiningDate?: string;
  joinedDate?: string;
  enrollmentDate?: string;
  primaryDomain?: string;
  primaryTech?: string;
  primaryTrainerName?: string;
  assignmentsCompleted?: number;
  totalAssignments?: number;
  modulesCompleted?: number;
  totalModules?: number;
  certificationsCount?: number;
  bootcampId: string;
  bootcampName: string;
  enrollmentStatus: EnrollmentStatus;
  learningStatus: LearningStatus;
  companyOutcome?: CompanyOutcome;
  selectionDetails?: TraineeSelectionDetails;
  progressPercent: number;
  attendancePercent: number;
  avgScorePercent: number;
  moduleProgress?: TraineeModuleProgress[];
  assessments?: TraineeAssessmentResult[];
  attendance?: TraineeAttendanceSummary;
  createdAt: string;
  updatedAt: string;
}

export interface TraineeFilterState {
  searchQuery: string;
  bootcampId: string;
  learningStatus: string;
  enrollmentStatus: string;
}
