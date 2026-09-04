/**
 * Bootcamp Entity Data Models and TypeScript Interfaces
 */

export type BootcampStatus = 'Planned' | 'Active' | 'Completed' | 'Archived';
export type BootcampType = 'BOOTCAMP' | 'LATERAL';
export type ModuleStatus = 'Not Started' | 'In Progress' | 'Completed';
export type EnrollmentStatus = 'On Track' | 'Needs Attention' | 'At Risk' | 'Project Ready' | 'Completed' | 'Active';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'L&D Team' | 'Trainer' | 'Coordinator' | 'Trainee';
  avatar?: string;
  department?: string;
  primaryDomain?: string;
  joiningDate?: string;
  companyOutcome?: 'Selected' | 'Not Selected' | 'Pending';
  avgScorePercent?: number;
}

export interface BootcampModule {
  id: string;
  bootcampId: string;
  name: string;
  description: string;
  sequence: number;
  plannedDuration: string;
  status: ModuleStatus;
  stage?: 'Common Foundation' | 'DBT & Snowflake' | 'Databricks' | 'Shared';
}

export interface BootcampEnrollment {
  id: string;
  bootcampId: string;
  traineeId: string;
  trainee: User;
  enrollmentDate: string;
  enrollmentStatus: EnrollmentStatus;
  progressPercent: number;
  attendancePercent: number;
}

export interface Bootcamp {
  id: string;
  name: string;
  code: string;
  bootcampType: BootcampType; // BOOTCAMP | LATERAL
  bootcampYear: number; // e.g. 2026, 2025, 2024
  cohortName?: string; // e.g. "Cohort 01"
  cohortSequence?: number;
  description: string;
  startDate: string;
  endDate: string;
  status: BootcampStatus;
  primaryTrainerId: string;
  primaryTrainerName: string;
  additionalTrainerId?: string;
  additionalTrainerName?: string;
  coordinatorId: string;
  coordinatorName: string;
  traineesCount: number;
  modulesCount: number;
  progressPercent: number;
  attendancePercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface BootcampFilterState {
  searchQuery: string;
  status: string;
  trainer: string;
  technology: string;
  bootcampYear: number | 'All';
  bootcampType: BootcampType | 'All';
}
