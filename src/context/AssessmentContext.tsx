import React, { createContext, useContext, useState } from 'react';
import {
  Assessment,
  AssessmentResult,
  AssessmentStatus,
  AssessmentType,
} from '../types/assessment';
import { INITIAL_ASSESSMENTS, INITIAL_ASSESSMENT_RESULTS } from '../data/assessmentMockData';
import { useBootcamps } from './BootcampContext';
import { useTrainees } from './TraineeContext';
import { useSessions } from './SessionContext';
import { notificationService } from '../services/NotificationService';
import { User } from '../types/bootcamp';

export interface TraineeAssessmentStats {
  averageScore: number;
  completedCount: number;
  passedCount: number;
  failedCount: number;
  records: Array<{
    assessmentId: string;
    assessmentName: string;
    moduleName: string;
    date: string;
    score: number;
    totalMarks: number;
    percentage: number;
    result: 'Pass' | 'Fail';
    evaluatorName: string;
    evaluatorComment?: string;
  }>;
}

export interface BootcampAssessmentStats {
  totalAssessments: number;
  upcomingCount: number;
  averageCohortScore: number;
  passRate: number;
  needAttentionCount: number;
  assessments: Assessment[];
}

interface AssessmentContextType {
  assessments: Assessment[];
  resultsMap: Record<string, AssessmentResult[]>;
  createAssessment: (
    data: Partial<Assessment>,
    participantIds: string[]
  ) => boolean;
  updateAssessment: (id: string, data: Partial<Assessment>) => boolean;
  enterScores: (
    assessmentId: string,
    scoreEntries: Array<{
      traineeId: string;
      score: number;
      strengths?: string;
      improvementAreas?: string;
      evaluatorComment?: string;
    }>
  ) => boolean;
  completeAssessment: (assessmentId: string) => boolean;
  publishResults: (assessmentId: string) => boolean;
  duplicateAssessment: (assessmentId: string) => boolean;
  archiveAssessment: (assessmentId: string) => boolean;
  getTraineeAssessmentStats: (traineeId: string) => TraineeAssessmentStats;
  getBootcampAssessmentStats: (bootcampId: string) => BootcampAssessmentStats;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assessments, setAssessments] = useState<Assessment[]>(INITIAL_ASSESSMENTS);
  const [resultsMap, setResultsMap] = useState<Record<string, AssessmentResult[]>>(
    INITIAL_ASSESSMENT_RESULTS
  );

  const { bootcamps, showToast } = useBootcamps();
  const { trainees, updateTrainee } = useTrainees();
  const { sessions, createSession } = useSessions();

  // 1. Create Assessment
  const createAssessment = (
    data: Partial<Assessment>,
    participantIds: string[]
  ): boolean => {
    const selectedBootcamp = bootcamps.find((b) => b.id === data.bootcampId) || bootcamps[0];
    const nowStr = new Date().toISOString().split('T')[0];

    const assessmentId = 'asm-' + Date.now();
    const status: AssessmentStatus = data.status || 'Scheduled';

    let linkedSessionId = data.linkedSessionId;

    // Calendar Integration: If status is Scheduled and no existing linked session was explicitly provided,
    // create or link to an assessment event on the training calendar
    if (status === 'Scheduled') {
      if (!linkedSessionId) {
        const calendarCreated = createSession({
          bootcampId: selectedBootcamp.id,
          bootcampName: selectedBootcamp.name,
          sessionDate: data.date || nowStr,
          startTime: data.startTime || '09:30',
          endTime: data.endTime || '12:30',
          durationText: '3 hrs',
          title: data.name || 'Module Assessment',
          agenda: `Assessment Evaluation: ${data.name}`,
          moduleId: data.moduleId || 'm-1',
          moduleName: data.moduleName || 'Assessment',
          learningTrack: data.track || 'Common Foundation',
          trainerName: data.evaluatorName || selectedBootcamp.primaryTrainerName,
          evaluatorName: data.evaluatorName || selectedBootcamp.primaryTrainerName,
          eventType: data.type === 'Mock Test' ? 'Mock Test' : data.type === 'Certification Evaluation' ? 'Evaluation' : 'Assessment',
          linkedAssessmentId: assessmentId,
        });

        if (calendarCreated) {
          // Link newly created calendar session
          const latestSession = sessions[0];
          linkedSessionId = latestSession ? latestSession.id : undefined;
        }
      }
    }

    const newAssessment: Assessment = {
      id: assessmentId,
      name: data.name || 'New Assessment',
      type: (data.type as AssessmentType) || 'Module Test',
      bootcampId: selectedBootcamp.id,
      bootcampName: selectedBootcamp.name,
      bootcampYear: selectedBootcamp.bootcampYear || 2026,
      track: data.track || 'Common Foundation',
      moduleId: data.moduleId || 'm-1',
      moduleName: data.moduleName || 'General',
      linkedSessionId,
      date: data.date || nowStr,
      startTime: data.startTime || '09:30',
      endTime: data.endTime || '12:30',
      evaluatorId: data.evaluatorId || 'tr-1',
      evaluatorName: data.evaluatorName || selectedBootcamp.primaryTrainerName,
      additionalEvaluatorId: data.additionalEvaluatorId,
      additionalEvaluatorName: data.additionalEvaluatorName,
      totalMarks: data.totalMarks || 100,
      passingMarks: data.passingMarks || 60,
      evaluationStyle: data.evaluationStyle || 'SCORE_BASED',
      criteria: data.criteria || [],
      status,
      participantIds,
      totalParticipants: participantIds.length,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    setAssessments((prev) => [newAssessment, ...prev]);

    // Send AI / Mail Notification to Evaluator
    const evaluatorUser: User = {
      id: newAssessment.evaluatorId,
      employeeId: 'EMP101',
      name: newAssessment.evaluatorName,
      email: `${newAssessment.evaluatorName.toLowerCase().replace(/\s+/g, '.')}@systechusa.com`,
      role: 'Trainer',
    };

    notificationService.sendTrainerNotification(
      {
        id: newAssessment.id,
        bootcampId: newAssessment.bootcampId,
        bootcampName: newAssessment.bootcampName,
        sessionDate: newAssessment.date,
        startTime: newAssessment.startTime || '09:30',
        endTime: newAssessment.endTime || '12:30',
        durationMinutes: 180,
        agenda: `Assigned as Evaluator for ${newAssessment.name}`,
        title: newAssessment.name,
        moduleId: newAssessment.moduleId,
        moduleName: newAssessment.moduleName,
        learningTrack: newAssessment.track,
        mode: 'Classroom',
        status: 'Scheduled',
        eventType: 'Assessment',
        attendanceApplicable: true,
        attendanceRecorded: false,
        attendedCount: 0,
        totalEnrolled: participantIds.length,
        createdAt: nowStr,
        updatedAt: nowStr,
      },
      evaluatorUser,
      'SCHEDULED'
    );

    showToast(`Assessment "${newAssessment.name}" created & evaluator notified.`);
    return true;
  };

  // 2. Update Assessment
  const updateAssessment = (id: string, data: Partial<Assessment>): boolean => {
    setAssessments((prev) =>
      prev.map((asm) =>
        asm.id === id
          ? {
              ...asm,
              ...data,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : asm
      )
    );
    showToast('Assessment updated successfully');
    return true;
  };

  // 3. Enter Scores
  const enterScores = (
    assessmentId: string,
    scoreEntries: Array<{
      traineeId: string;
      score: number;
      strengths?: string;
      improvementAreas?: string;
      evaluatorComment?: string;
    }>
  ): boolean => {
    const assessment = assessments.find((a) => a.id === assessmentId);
    if (!assessment) return false;

    const nowStr = new Date().toISOString().split('T')[0];

    const updatedResults: AssessmentResult[] = scoreEntries.map((entry) => {
      const traineeObj = trainees.find((t) => t.id === entry.traineeId);
      const percentage = Math.round((entry.score / assessment.totalMarks) * 100);
      const isPass = entry.score >= assessment.passingMarks;
      const resultStr: 'Pass' | 'Fail' = isPass ? 'Pass' : 'Fail';

      // Rule-based risk determination
      let learningStatus: AssessmentResult['learningStatus'] = 'On Track';
      if (!isPass) {
        learningStatus = entry.score < assessment.totalMarks * 0.5 ? 'At Risk' : 'Needs Attention';
      }

      return {
        id: `res-${assessmentId}-${entry.traineeId}`,
        assessmentId,
        traineeId: entry.traineeId,
        employeeId: traineeObj?.employeeId || 'EMP',
        traineeName: traineeObj?.name || 'Trainee',
        score: entry.score,
        percentage,
        result: resultStr,
        learningStatus,
        strengths: entry.strengths,
        improvementAreas: entry.improvementAreas,
        evaluatorComment: entry.evaluatorComment,
        evaluatedAt: nowStr,
      };
    });

    setResultsMap((prev) => ({
      ...prev,
      [assessmentId]: updatedResults,
    }));

    // Update status to In Progress if currently Scheduled or Draft
    if (assessment.status === 'Draft' || assessment.status === 'Scheduled') {
      setAssessments((prev) =>
        prev.map((a) => (a.id === assessmentId ? { ...a, status: 'In Progress' } : a))
      );
    }

    showToast(`Scores entered for ${scoreEntries.length} trainees.`);
    return true;
  };

  // 4. Complete Assessment
  const completeAssessment = (assessmentId: string): boolean => {
    const assessment = assessments.find((a) => a.id === assessmentId);
    if (!assessment) return false;

    const results = resultsMap[assessmentId] || [];
    if (results.length === 0) {
      showToast('Please enter scores before completing assessment.');
      return false;
    }

    const totalScores = results.reduce((acc, r) => acc + r.score, 0);
    const averageScore = Math.round(totalScores / results.length);
    const scores = results.map((r) => r.score);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const passedCount = results.filter((r) => r.result === 'Pass').length;
    const passRate = Math.round((passedCount / results.length) * 100);
    const failCount = results.length - passedCount;
    const needAttentionCount = results.filter(
      (r) => r.learningStatus === 'Needs Attention' || r.learningStatus === 'At Risk'
    ).length;

    setAssessments((prev) =>
      prev.map((a) =>
        a.id === assessmentId
          ? {
              ...a,
              status: 'Completed',
              averageScore,
              highestScore,
              lowestScore,
              passRate,
              failCount,
              needAttentionCount,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : a
      )
    );

    // Synchronize Trainee averages in TraineeContext
    results.forEach((r) => {
      const stats = getTraineeAssessmentStats(r.traineeId);
      updateTrainee(r.traineeId, {
        avgScorePercent: stats.averageScore,
        learningStatus: r.learningStatus === 'At Risk' ? 'At Risk' : r.learningStatus === 'Needs Attention' ? 'Needs Attention' : 'On Track',
      });
    });

    showToast(`Assessment "${assessment.name}" marked as Completed.`);
    return true;
  };

  // 5. Publish Results
  const publishResults = (assessmentId: string): boolean => {
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === assessmentId
          ? {
              ...a,
              status: 'Published',
              publishedAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : a
      )
    );
    showToast('Assessment results published to trainees.');
    return true;
  };

  // 6. Duplicate Assessment
  const duplicateAssessment = (assessmentId: string): boolean => {
    const existing = assessments.find((a) => a.id === assessmentId);
    if (!existing) return false;

    const nowStr = new Date().toISOString().split('T')[0];
    const newId = 'asm-' + Date.now();

    const duplicated: Assessment = {
      ...existing,
      id: newId,
      name: `${existing.name} (Copy)`,
      status: 'Draft',
      linkedSessionId: undefined,
      averageScore: undefined,
      highestScore: undefined,
      lowestScore: undefined,
      passRate: undefined,
      failCount: undefined,
      needAttentionCount: undefined,
      publishedAt: undefined,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    setAssessments((prev) => [duplicated, ...prev]);
    showToast(`Assessment duplicated as "${duplicated.name}".`);
    return true;
  };

  // 7. Archive Assessment (Never delete permanently)
  const archiveAssessment = (assessmentId: string): boolean => {
    setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
    showToast('Assessment archived from active view.');
    return true;
  };

  // 8. Trainee Assessment Stats Calculation
  const getTraineeAssessmentStats = (traineeId: string): TraineeAssessmentStats => {
    const records: TraineeAssessmentStats['records'] = [];
    let totalScoreSum = 0;
    let completedCount = 0;
    let passedCount = 0;
    let failedCount = 0;

    assessments.forEach((asm) => {
      const results = resultsMap[asm.id] || [];
      const res = results.find((r) => r.traineeId === traineeId);
      if (res) {
        completedCount++;
        totalScoreSum += res.percentage;
        if (res.result === 'Pass') passedCount++;
        else failedCount++;

        records.push({
          assessmentId: asm.id,
          assessmentName: asm.name,
          moduleName: asm.moduleName,
          date: asm.date,
          score: res.score,
          totalMarks: asm.totalMarks,
          percentage: res.percentage,
          result: res.result,
          evaluatorName: asm.evaluatorName,
          evaluatorComment: res.evaluatorComment,
        });
      }
    });

    const averageScore = completedCount > 0 ? Math.round(totalScoreSum / completedCount) : 0;

    return {
      averageScore,
      completedCount,
      passedCount,
      failedCount,
      records,
    };
  };

  // 9. Bootcamp Assessment Stats Calculation
  const getBootcampAssessmentStats = (bootcampId: string): BootcampAssessmentStats => {
    const cohortAssessments = assessments.filter((a) => a.bootcampId === bootcampId);
    const completed = cohortAssessments.filter((a) => a.status === 'Completed' || a.status === 'Published');
    const upcoming = cohortAssessments.filter((a) => a.status === 'Scheduled' || a.status === 'Draft' || a.status === 'In Progress');

    let totalAvgSum = 0;
    let totalPassed = 0;
    let totalEvaluated = 0;
    let needAttentionCount = 0;

    completed.forEach((asm) => {
      if (asm.averageScore !== undefined) {
        totalAvgSum += asm.averageScore;
      }
      const results = resultsMap[asm.id] || [];
      totalEvaluated += results.length;
      results.forEach((r) => {
        if (r.result === 'Pass') totalPassed++;
        if (r.learningStatus === 'Needs Attention' || r.learningStatus === 'At Risk') {
          needAttentionCount++;
        }
      });
    });

    const averageCohortScore = completed.length > 0 ? Math.round(totalAvgSum / completed.length) : 0;
    const passRate = totalEvaluated > 0 ? Math.round((totalPassed / totalEvaluated) * 100) : 0;

    return {
      totalAssessments: cohortAssessments.length,
      upcomingCount: upcoming.length,
      averageCohortScore,
      passRate,
      needAttentionCount,
      assessments: cohortAssessments,
    };
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessments,
        resultsMap,
        createAssessment,
        updateAssessment,
        enterScores,
        completeAssessment,
        publishResults,
        duplicateAssessment,
        archiveAssessment,
        getTraineeAssessmentStats,
        getBootcampAssessmentStats,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessments = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessments must be used within an AssessmentProvider');
  }
  return context;
};
