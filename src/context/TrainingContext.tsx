import React, { createContext, useContext, useState } from 'react';
import {
  TrainingPlan,
  Trainer,
  TrainerAvailabilityRequest,
  TrainerTrack,
  TrainingType,
  TrainerAvailabilityStatus,
} from '../types/training';
import {
  INITIAL_TRAINERS,
  INITIAL_TRAINING_PLANS,
  INITIAL_AVAILABILITY_REQUESTS,
} from '../data/trainingMockData';
import { useSessions } from './SessionContext';

interface TrainingContextType {
  trainingPlans: TrainingPlan[];
  trainers: Trainer[];
  availabilityRequests: TrainerAvailabilityRequest[];
  createTrainingPlan: (
    planData: Omit<TrainingPlan, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ) => TrainingPlan;
  sendAvailabilityRequests: (
    planId: string,
    selectedTrainerIds: string[]
  ) => void;
  updateTrainerResponse: (
    requestId: string,
    response: TrainerAvailabilityStatus
  ) => void;
  selectTrainerAndReadySchedule: (
    planId: string,
    trainerId: string
  ) => void;
  scheduleTrainingPlan: (
    planId: string,
    trainerId: string,
    sessionDate: string,
    startTime: string,
    endTime: string,
    mode: 'Classroom' | 'Online' | 'Hybrid',
    locationOrLink: string
  ) => boolean;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>(INITIAL_TRAINING_PLANS);
  const [trainers, setTrainers] = useState<Trainer[]>(INITIAL_TRAINERS);
  const [availabilityRequests, setAvailabilityRequests] = useState<TrainerAvailabilityRequest[]>(
    INITIAL_AVAILABILITY_REQUESTS
  );

  const { createSession } = useSessions();

  const createTrainingPlan = (
    planData: Omit<TrainingPlan, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): TrainingPlan => {
    const newId = `tp-${Date.now()}`;
    const initialStatus =
      planData.selectedTrainerIds && planData.selectedTrainerIds.length > 0
        ? 'Awaiting Availability'
        : 'Finding Trainer';

    const newPlan: TrainingPlan = {
      ...planData,
      id: newId,
      status: initialStatus,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setTrainingPlans((prev) => [newPlan, ...prev]);

    // Automatically generate availability requests if trainers selected
    if (planData.selectedTrainerIds && planData.selectedTrainerIds.length > 0) {
      const nowStr = new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      const newRequests: TrainerAvailabilityRequest[] = planData.selectedTrainerIds.map(
        (tId, idx) => {
          const trainerObj = trainers.find((t) => t.id === tId);
          return {
            id: `req-${Date.now()}-${idx}`,
            trainingPlanId: newId,
            trainingName: planData.name,
            topic: planData.topic,
            trainerId: tId,
            trainerName: trainerObj ? trainerObj.name : 'Selected Trainer',
            trainerEmail: trainerObj ? trainerObj.email : 'trainer@systechusa.com',
            track: planData.track,
            requestedSlot: `${planData.preferredDate} • ${planData.preferredTime}`,
            requestSentAt: nowStr,
            response: 'Awaiting Response',
          };
        }
      );

      setAvailabilityRequests((prev) => [...newRequests, ...prev]);
    }

    return newPlan;
  };

  const sendAvailabilityRequests = (planId: string, selectedTrainerIds: string[]) => {
    const plan = trainingPlans.find((p) => p.id === planId);
    if (!plan) return;

    const nowStr = new Date().toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newRequests: TrainerAvailabilityRequest[] = selectedTrainerIds.map((tId, idx) => {
      const trainerObj = trainers.find((t) => t.id === tId);
      return {
        id: `req-${Date.now()}-${idx}`,
        trainingPlanId: planId,
        trainingName: plan.name,
        topic: plan.topic,
        trainerId: tId,
        trainerName: trainerObj ? trainerObj.name : 'Selected Trainer',
        trainerEmail: trainerObj ? trainerObj.email : 'trainer@systechusa.com',
        track: plan.track,
        requestedSlot: `${plan.preferredDate} • ${plan.preferredTime}`,
        requestSentAt: nowStr,
        response: 'Awaiting Response',
      };
    });

    setAvailabilityRequests((prev) => [...newRequests, ...prev]);

    setTrainingPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              selectedTrainerIds,
              status: 'Awaiting Availability',
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );
  };

  const updateTrainerResponse = (requestId: string, response: TrainerAvailabilityStatus) => {
    const nowStr = new Date().toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    let targetPlanId: string | undefined;

    setAvailabilityRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          targetPlanId = req.trainingPlanId;
          return {
            ...req,
            response,
            respondedAt: nowStr,
          };
        }
        return req;
      })
    );

    if (targetPlanId) {
      // Check if any request for this plan has response 'Available'
      setTrainingPlans((prev) =>
        prev.map((plan) => {
          if (plan.id === targetPlanId) {
            const planReqs = availabilityRequests.map((r) =>
              r.id === requestId ? { ...r, response } : r
            );
            const hasAvailable = planReqs.some(
              (r) => r.trainingPlanId === targetPlanId && r.response === 'Available'
            );
            const newStatus = hasAvailable ? 'Ready to Schedule' : plan.status;
            return {
              ...plan,
              status: newStatus,
              updatedAt: new Date().toISOString().split('T')[0],
            };
          }
          return plan;
        })
      );
    }
  };

  const selectTrainerAndReadySchedule = (planId: string, trainerId: string) => {
    const trainerObj = trainers.find((t) => t.id === trainerId);
    setTrainingPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              assignedTrainerId: trainerId,
              assignedTrainerName: trainerObj ? trainerObj.name : 'Selected Trainer',
              status: 'Ready to Schedule',
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );
  };

  const scheduleTrainingPlan = (
    planId: string,
    trainerId: string,
    sessionDate: string,
    startTime: string,
    endTime: string,
    mode: 'Classroom' | 'Online' | 'Hybrid',
    locationOrLink: string
  ): boolean => {
    const plan = trainingPlans.find((p) => p.id === planId);
    const trainerObj = trainers.find((t) => t.id === trainerId);
    if (!plan) return false;

    const trainerName = trainerObj ? trainerObj.name : plan.assignedTrainerName || 'Trainer';

    // Map track
    let learningTrack: any = 'Common Foundation';
    if (plan.track === 'DE') learningTrack = 'Databricks';
    if (plan.track === 'Tools') learningTrack = 'dbt & Snowflake';

    const sessionPayload = {
      bootcampId: 'bc-1',
      bootcampName: `${plan.track} Training Cohort`,
      sessionDate: sessionDate || plan.preferredDate,
      dayOfWeek: new Date(sessionDate || plan.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
      }),
      timeSlot: 'FN',
      startTime,
      endTime,
      durationText: plan.duration,
      agenda: plan.topic,
      title: `${plan.name} — ${plan.topic}`,
      moduleName: plan.name,
      trainerName,
      coordinatorName: 'Priya Sharma',
      evaluatorName: 'Dinesh Kumar',
      learningTrack,
      mode,
      meetingLink: mode !== 'Classroom' ? locationOrLink : '',
      location: mode === 'Classroom' ? locationOrLink || 'Training Room 4B' : '',
      notes: plan.description,
      status: 'Scheduled' as const,
      eventType: 'Training' as const,
      notificationStatus: 'Sent' as const,
    };

    const success = createSession(sessionPayload);

    if (success) {
      const scheduledId = `cal-tp-${Date.now()}`;
      setTrainingPlans((prev) =>
        prev.map((p) =>
          p.id === planId
            ? {
                ...p,
                assignedTrainerId: trainerId,
                assignedTrainerName: trainerName,
                scheduledSessionId: scheduledId,
                status: 'Scheduled',
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : p
        )
      );

      setAvailabilityRequests((prev) =>
        prev.map((req) =>
          req.trainingPlanId === planId && req.trainerId === trainerId
            ? { ...req, response: 'Available' }
            : req
        )
      );

      return true;
    }
    return false;
  };

  return (
    <TrainingContext.Provider
      value={{
        trainingPlans,
        trainers,
        availabilityRequests,
        createTrainingPlan,
        sendAvailabilityRequests,
        updateTrainerResponse,
        selectTrainerAndReadySchedule,
        scheduleTrainingPlan,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};
