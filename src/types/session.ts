/**
 * Training Calendar & Session Entity Data Models
 * Authoritative schema mapping for Bootcamp 2026 Training Calendar
 */

export type SessionStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rescheduled';
export type SessionMode = 'Online' | 'Classroom' | 'Hybrid';
export type MeetingPlatform = 'Microsoft Teams' | 'Zoom' | 'Google Meet' | 'Other';
export type ReminderOption = 'No Reminder' | '15 Minutes Before' | '30 Minutes Before' | '1 Hour Before' | '1 Day Before';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export type EventType =
  | 'Training'
  | 'Workshop'
  | 'Practice'
  | 'Assessment'
  | 'Mock Test'
  | 'HR Event'
  | 'Holiday'
  | 'Feedback'
  | 'Project'
  | 'Certification'
  | 'Evaluation'
  | 'Sign Off'
  | 'Other';

export type LearningTrack = 'Common Foundation' | 'DBT & Snowflake' | 'Databricks' | 'Shared';

export interface Session {
  id: string;
  bootcampId: string;
  bootcampName: string;
  trainingDay?: number; // Source field: Day
  sessionDate: string; // Source field: Date (YYYY-MM-DD)
  dayOfWeek?: string; // Source field: Week of Day (Monday, Tuesday...)
  timeSlot?: string; // Source field: Time / Slot (FN, AN, AF, FN & AF, 09:30 AM - 10:30 AM)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationText?: string; // Source field: Duration (e.g. 1 hr, 2 hrs)
  durationMinutes: number;
  agenda: string; // Source field: Agenda
  title: string; // Event title / topic
  moduleId: string;
  moduleName: string; // Source field: Module Name
  learningTrack?: LearningTrack; // Track classification
  moduleOwner?: string; // Source field: Owner of the module
  trainerId?: string;
  trainerName?: string; // Source field: Trainer (Single or multiple names)
  additionalTrainerId?: string;
  additionalTrainerName?: string;
  coordinatorName?: string; // Source field: Coordinator
  evaluatorName?: string; // Source field: Evaluator
  mode: SessionMode;
  meetingPlatform?: MeetingPlatform;
  meetingLink?: string;
  location?: string;
  notes?: string;
  reminder?: ReminderOption;
  status: SessionStatus;
  eventType: EventType;
  attendanceApplicable: boolean; // false for Holidays & Sign Off
  originalSchedule?: string;
  linkedAssessmentId?: string;
  linkedProjectId?: string;
  linkedCertificationId?: string;
  originalCalendarRow?: Record<string, unknown>;
  attendanceRecorded: boolean;
  attendedCount: number;
  totalEnrolled: number;
  notificationStatus?: 'Sent' | 'Pending' | 'Failed';
  notificationSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  traineeId: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedAt: string;
}

export interface CalendarImportStats {
  totalRows: number;
  trainingSessions: number;
  assessments: number;
  workshops: number;
  projects: number;
  certificationEvents: number;
  holidays: number;
  skippedRows: number;
}
