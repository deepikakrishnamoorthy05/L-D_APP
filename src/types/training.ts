export type TrainerTrack = 'BA' | 'DE' | 'Tools';

export type TrainingType =
  | 'Knowledge Sharing Series'
  | 'Technical Training'
  | 'Tool Training'
  | 'Workshop'
  | 'Upskilling Session'
  | 'Certification Preparation'
  | 'Internal Learning Session'
  | string;

export type TrainingPlanStatus =
  | 'Draft'
  | 'Finding Trainer'
  | 'Awaiting Availability'
  | 'Trainer Available'
  | 'Ready to Schedule'
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled';

export type TrainerAvailabilityStatus =
  | 'Awaiting Response'
  | 'Available'
  | 'Not Available'
  | 'Expired';

export interface Trainer {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  track: TrainerTrack;
  skills: string[];
  secondarySkills?: string[];
  recentSessions?: string[];
  availabilityStatus: 'Available' | 'Assigned' | 'On Leave';
  initials: string;
  avatarUrl?: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  type: TrainingType;
  topic: string;
  description: string;
  track: TrainerTrack;
  targetAudience: string;
  expectedParticipants: number;
  preferredDate: string;
  preferredTime: string;
  duration: string;
  priority: 'High' | 'Medium' | 'Low';
  status: TrainingPlanStatus;
  selectedTrainerIds: string[];
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  scheduledSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerAvailabilityRequest {
  id: string;
  trainingPlanId: string;
  trainingName: string;
  topic: string;
  trainerId: string;
  trainerName: string;
  trainerEmail: string;
  track: TrainerTrack;
  requestedSlot: string;
  requestSentAt: string;
  response: TrainerAvailabilityStatus;
  respondedAt?: string;
}
