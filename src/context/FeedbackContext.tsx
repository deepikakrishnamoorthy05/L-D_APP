import React, { createContext, useContext, useState } from 'react';
import {
  SessionFeedbackSummary,
  ParticipantFeedbackResponse,
  TrainerFeedbackRecord,
  PendingFeedbackRequest,
  FeedbackRecord,
} from '../types/feedback';

interface FeedbackContextType {
  sessionSummaries: SessionFeedbackSummary[];
  participantResponses: ParticipantFeedbackResponse[];
  trainerFeedbacks: TrainerFeedbackRecord[];
  pendingRequests: PendingFeedbackRequest[];
  feedbackRecords: FeedbackRecord[];
  addSessionFeedback: (summary: Partial<SessionFeedbackSummary>) => void;
  importSessionFeedback: (records: Partial<SessionFeedbackSummary>[]) => void;
  sendFeedbackReminder: (sessionId: string) => void;
  simulateAllPendingReminders: () => void;

  // Legacy compatibility helpers
  addFeedback: (record: Partial<FeedbackRecord>) => void;
  updateFeedback: (id: string, updates: Partial<FeedbackRecord>) => void;
  approveFeedback: (id: string) => void;
  publishFeedback: (id: string) => void;
  runAiAnalysis: (id: string) => void;
  archiveFeedback: (id: string) => void;
  duplicateFeedback: (id: string) => void;
}

const INITIAL_SESSION_SUMMARIES: SessionFeedbackSummary[] = [
  {
    id: 's-fb-101',
    sessionId: 'cal-101',
    sessionTitle: 'Databricks Performance Optimization',
    trainingType: 'Knowledge Sharing Series',
    track: 'DE',
    trainerId: 'trainer-2',
    trainerName: 'Sarah David',
    sessionDate: '2026-09-18',
    year: 2026,
    quarter: 'Q3',
    totalParticipants: 18,
    responsesCount: 15,
    pendingCount: 3,
    overallRating: 4.6,
    contentRating: 4.7,
    trainerRating: 4.8,
    relevanceRating: 4.4,
    engagementRating: 4.5,
    paceRating: 4.3,
    status: 'Collected',
    positiveComments: [
      'Excellent deep dive into Databricks cluster sizing and AQE optimization.',
      'The live query plan debugging demonstration was extremely practical.',
      'Sarah explained complex caching strategies with clear real-world examples.',
    ],
    improvementSuggestions: [
      'Provide more time for hands-on notebook lab exercises.',
      'Share query plan slides beforehand for pre-reading.',
    ],
    trainerComments: 'High participant engagement during query plan analysis. Recommend follow-up advanced lab session.',
    createdAt: '2026-09-18T16:00:00Z',
  },
  {
    id: 's-fb-102',
    sessionId: 'cal-102',
    sessionTitle: 'AI Agentic Workflows & Tool Use',
    trainingType: 'Antigravity Training',
    track: 'Tools',
    trainerId: 'trainer-5',
    trainerName: 'Ramesh',
    sessionDate: '2026-09-28',
    year: 2026,
    quarter: 'Q3',
    totalParticipants: 20,
    responsesCount: 14,
    pendingCount: 6,
    overallRating: 4.4,
    contentRating: 4.5,
    trainerRating: 4.6,
    relevanceRating: 4.5,
    engagementRating: 4.3,
    paceRating: 4.1,
    status: 'Awaiting Feedback',
    positiveComments: [
      'Great introduction to multi-agent task execution and prompt structure.',
      'Demonstrating tool declaration schema helped demystify agent orchestration.',
    ],
    improvementSuggestions: [
      'Add step-by-step documentation for configuring local environment tools.',
    ],
    trainerComments: 'Participants were enthusiastic about subagent execution patterns.',
    createdAt: '2026-09-28T17:00:00Z',
  },
  {
    id: 's-fb-103',
    sessionId: 'cal-103',
    sessionTitle: 'Cloud Data Integration Specialist Masterclass',
    trainingType: 'Informatica Training',
    track: 'DE',
    trainerId: 'trainer-4',
    trainerName: 'Dinesh Kumar',
    sessionDate: '2026-08-14',
    year: 2026,
    quarter: 'Q3',
    totalParticipants: 16,
    responsesCount: 12,
    pendingCount: 4,
    overallRating: 4.2,
    contentRating: 4.3,
    trainerRating: 4.4,
    relevanceRating: 4.1,
    engagementRating: 4.0,
    paceRating: 4.0,
    status: 'Partially Collected',
    positiveComments: [
      'Solid walkthrough of Informatica Intelligent Cloud Services (IICS) mapping tasks.',
      'Good practical tips on error handling and taskflows.',
    ],
    improvementSuggestions: [
      'Pace was slightly fast during pushdown optimization configuration.',
    ],
    trainerComments: 'Foundational concepts covered well; 4 participants missed hands-on exercise submitting feedback.',
    createdAt: '2026-08-14T15:30:00Z',
  },
  {
    id: 's-fb-104',
    sessionId: 'cal-104',
    sessionTitle: 'PySpark ETL Data Pipelines',
    trainingType: 'Databricks Training',
    track: 'DE',
    trainerId: 'trainer-2',
    trainerName: 'Sarah David',
    sessionDate: '2026-07-22',
    year: 2026,
    quarter: 'Q3',
    totalParticipants: 22,
    responsesCount: 20,
    pendingCount: 2,
    overallRating: 4.8,
    contentRating: 4.9,
    trainerRating: 4.9,
    relevanceRating: 4.8,
    engagementRating: 4.7,
    paceRating: 4.6,
    status: 'Collected',
    positiveComments: [
      'One of the best sessions! Hands-on PySpark DataFrame operations were flawless.',
      'Sarah is super clear in explaining partition pruning and memory management.',
    ],
    improvementSuggestions: ['Add a second part focusing on Delta Live Tables.'],
    trainerComments: 'Cohort demonstrated high proficiency in PySpark transformations.',
    createdAt: '2026-07-22T16:00:00Z',
  },
  {
    id: 's-fb-105',
    sessionId: 'cal-105',
    sessionTitle: 'Agile Business Requirements & User Stories',
    trainingType: 'BA Training',
    track: 'BA',
    trainerId: 'trainer-6',
    trainerName: 'Priya Sharma',
    sessionDate: '2026-06-10',
    year: 2026,
    quarter: 'Q2',
    totalParticipants: 14,
    responsesCount: 12,
    pendingCount: 2,
    overallRating: 4.5,
    contentRating: 4.6,
    trainerRating: 4.7,
    relevanceRating: 4.5,
    engagementRating: 4.4,
    paceRating: 4.3,
    status: 'Collected',
    positiveComments: [
      'Interactive workshop format made user story mapping very engaging.',
      'Great examples of acceptance criteria formulation.',
    ],
    improvementSuggestions: ['Include case study examples from current client projects.'],
    trainerComments: 'Strong participation in group mock sprint refinement exercises.',
    createdAt: '2026-06-10T15:00:00Z',
  },
  {
    id: 's-fb-106',
    sessionId: 'cal-106',
    sessionTitle: 'Snowflake Architecture & Data Warehouse Optimization',
    trainingType: 'DE Training',
    track: 'DE',
    trainerId: 'trainer-3',
    trainerName: 'John Mathew',
    sessionDate: '2026-05-18',
    year: 2026,
    quarter: 'Q2',
    totalParticipants: 19,
    responsesCount: 16,
    pendingCount: 3,
    overallRating: 4.6,
    contentRating: 4.7,
    trainerRating: 4.8,
    relevanceRating: 4.5,
    engagementRating: 4.4,
    paceRating: 4.4,
    status: 'Collected',
    positiveComments: [
      'Clear explanation of micro-partitions and virtual warehouse auto-suspend settings.',
      'John provided valuable cost optimization formulas.',
    ],
    improvementSuggestions: ['Provide downloadable code snippets for automated warehouse scaling.'],
    trainerComments: 'Good grasp of multi-cluster warehouse credit billing dynamics.',
    createdAt: '2026-05-18T16:30:00Z',
  },
  {
    id: 's-fb-107',
    sessionId: 'cal-107',
    sessionTitle: 'dbt Model Transformation Masterclass',
    trainingType: 'Tools Training',
    track: 'Tools',
    trainerId: 'trainer-3',
    trainerName: 'John Mathew',
    sessionDate: '2026-04-25',
    year: 2026,
    quarter: 'Q2',
    totalParticipants: 15,
    responsesCount: 15,
    pendingCount: 0,
    overallRating: 4.7,
    contentRating: 4.8,
    trainerRating: 4.8,
    relevanceRating: 4.7,
    engagementRating: 4.6,
    paceRating: 4.5,
    status: 'Collected',
    positiveComments: [
      '100% feedback completion! Excellent session on dbt Jinja macros and testing.',
    ],
    improvementSuggestions: ['More time on dbt Semantic Layer.'],
    trainerComments: 'All 15 participants submitted feedback promptly. Outstanding lab execution.',
    createdAt: '2026-04-25T16:00:00Z',
  },
  {
    id: 's-fb-108',
    sessionId: 'cal-108',
    sessionTitle: 'Cloud Architecture & Azure Security Best Practices',
    trainingType: 'Workshop',
    track: 'Shared',
    trainerId: 'trainer-5',
    trainerName: 'Ramesh',
    sessionDate: '2026-03-12',
    year: 2026,
    quarter: 'Q1',
    totalParticipants: 30,
    responsesCount: 21,
    pendingCount: 9,
    overallRating: 3.4,
    contentRating: 3.5,
    trainerRating: 3.6,
    relevanceRating: 3.4,
    engagementRating: 3.2,
    paceRating: 3.1,
    status: 'Needs Attention',
    positiveComments: ['Good overview of RBAC and Azure Key Vault integration.'],
    improvementSuggestions: [
      'Too much theoretical slide presentation; needs hands-on Azure portal exercises.',
      'Pace was rushed in the second half of the workshop.',
      'Audio quality had minor dropouts during streaming.',
    ],
    trainerComments: '30 attendees created tight time constraints. Will break into 2 smaller cohort workshops next time.',
    createdAt: '2026-03-12T17:00:00Z',
  },
  {
    id: 's-fb-109',
    sessionId: 'cal-109',
    sessionTitle: 'Databricks Certified Associate Exam Prep',
    trainingType: 'Certification Preparation',
    track: 'DE',
    trainerId: 'trainer-2',
    trainerName: 'Sarah David',
    sessionDate: '2026-02-20',
    year: 2026,
    quarter: 'Q1',
    totalParticipants: 12,
    responsesCount: 8,
    pendingCount: 4,
    overallRating: 3.6,
    contentRating: 3.7,
    trainerRating: 3.8,
    relevanceRating: 3.6,
    engagementRating: 3.4,
    paceRating: 3.2,
    status: 'Needs Attention',
    positiveComments: ['Mock practice questions were aligned with exam syllabus.'],
    improvementSuggestions: [
      'Need full 60-question timed practice drill before actual exam.',
      'More explanation on Databricks Lakehouse storage architecture questions.',
    ],
    trainerComments: '4 candidates have not submitted feedback. Need to follow up before voucher code allocation.',
    createdAt: '2026-02-20T16:00:00Z',
  },
];

const INITIAL_PARTICIPANT_RESPONSES: ParticipantFeedbackResponse[] = [
  {
    id: 'pr-101',
    sessionId: 'cal-101',
    sessionTitle: 'Databricks Performance Optimization',
    trainingType: 'Knowledge Sharing Series',
    track: 'DE',
    participantId: 'tr-1',
    participantName: 'Kaviram Sudharajanainar Paramasivan',
    employeeId: 'EMP001',
    trainerName: 'Sarah David',
    submittedAt: '2026-09-18T17:30:00Z',
    contentRating: 5,
    trainerRating: 5,
    relevanceRating: 4,
    engagementRating: 5,
    paceRating: 4,
    overallRating: 4.8,
    mostUsefulComment: 'Live query plan debugging and adaptive query execution breakdown.',
    improvementComment: 'Would love a follow-up session dedicated to memory spill debugging.',
    recommendSession: 'Yes',
    additionalComments: 'Sarah David is a stellar trainer!',
    status: 'Completed',
  },
  {
    id: 'pr-102',
    sessionId: 'cal-101',
    sessionTitle: 'Databricks Performance Optimization',
    trainingType: 'Knowledge Sharing Series',
    track: 'DE',
    participantId: 'tr-2',
    participantName: 'Saran Mani',
    employeeId: 'EMP002',
    trainerName: 'Sarah David',
    submittedAt: '2026-09-18T18:00:00Z',
    contentRating: 4,
    trainerRating: 5,
    relevanceRating: 5,
    engagementRating: 4,
    paceRating: 4,
    overallRating: 4.6,
    mostUsefulComment: 'Databricks cluster sizing and caching strategies.',
    improvementComment: 'More time for hands-on notebook exercises.',
    recommendSession: 'Yes',
    additionalComments: 'Very helpful for our current client project.',
    status: 'Completed',
  },
  {
    id: 'pr-103',
    sessionId: 'cal-102',
    sessionTitle: 'AI Agentic Workflows & Tool Use',
    trainingType: 'Antigravity Training',
    track: 'Tools',
    participantId: 'tr-3',
    participantName: 'Amuthanilavan',
    employeeId: 'EMP003',
    trainerName: 'Ramesh',
    submittedAt: '2026-09-28T18:15:00Z',
    contentRating: 4,
    trainerRating: 4,
    relevanceRating: 5,
    engagementRating: 4,
    paceRating: 4,
    overallRating: 4.4,
    mostUsefulComment: 'Multi-agent orchestration and schema definition for tools.',
    improvementComment: 'Share code repository before the session.',
    recommendSession: 'Yes',
    additionalComments: 'Awesome session!',
    status: 'Completed',
  },
];

const INITIAL_TRAINER_FEEDBACKS: TrainerFeedbackRecord[] = [
  {
    id: 'tf-101',
    sessionId: 'cal-101',
    sessionTitle: 'Databricks Performance Optimization',
    trainingType: 'Knowledge Sharing Series',
    trainerId: 'trainer-2',
    trainerName: 'Sarah David',
    feedbackMode: 'SESSION_LEVEL',
    engagementRating: 4.8,
    understandingRating: 4.7,
    effectivenessRating: 4.8,
    paceRating: 4.5,
    contentSuitabilityRating: 4.9,
    overallRating: 4.8,
    trainerComments: 'High participant engagement during query plan analysis. Recommend follow-up advanced lab session.',
    recommendedFollowUp: 'Advanced Databricks Delta Lake Optimization Lab',
    submittedAt: '2026-09-18T18:30:00Z',
  },
  {
    id: 'tf-102',
    sessionId: 'cal-101',
    sessionTitle: 'Databricks Performance Optimization',
    trainingType: 'Knowledge Sharing Series',
    trainerId: 'trainer-2',
    trainerName: 'Sarah David',
    feedbackMode: 'INDIVIDUAL_EMPLOYEE',
    employeeId: 'EMP001',
    employeeName: 'Kaviram Sudharajanainar Paramasivan',
    engagementRating: 5,
    understandingRating: 4.5,
    effectivenessRating: 4.8,
    paceRating: 4.5,
    contentSuitabilityRating: 4.8,
    technicalSkillRating: 4.5,
    problemSolvingRating: 4.7,
    overallRating: 4.7,
    trainerComments: 'Strong SQL and Databricks query understanding. Needs minor practice with complex subquery execution under timed pressure.',
    recommendedFollowUp: 'Databricks Certified Associate Exam Preparation',
    submittedAt: '2026-09-18T19:00:00Z',
  },
];

const INITIAL_PENDING_REQUESTS: PendingFeedbackRequest[] = [
  {
    id: 'pend-101',
    sessionId: 'cal-102',
    sessionTitle: 'AI Agentic Workflows & Tool Use',
    trainingType: 'Antigravity Training',
    totalParticipants: 20,
    responsesCount: 14,
    pendingCount: 6,
    requestSentDate: '2026-09-28',
    lastReminderDate: '2026-09-29',
    nextReminderDate: '2026-10-01',
    status: 'Awaiting Feedback',
    pendingRespondents: [
      { id: 'tr-4', name: 'Dinesh Kumar', employeeId: 'EMP018', email: 'dinesh.k@systech.com' },
      { id: 'tr-5', name: 'Priya Sharma', employeeId: 'EMP014', email: 'priya.s@systech.com' },
      { id: 'tr-6', name: 'Madhan Raj', employeeId: 'EMP005', email: 'madhan.r@systech.com' },
      { id: 'tr-7', name: 'Kavita Iyer', employeeId: 'EMP022', email: 'kavita.i@systech.com' },
      { id: 'tr-8', name: 'Rajesh V', employeeId: 'EMP029', email: 'rajesh.v@systech.com' },
      { id: 'tr-9', name: 'Ananya Roy', employeeId: 'EMP033', email: 'ananya.r@systech.com' },
    ],
  },
  {
    id: 'pend-102',
    sessionId: 'cal-103',
    sessionTitle: 'Cloud Data Integration Specialist Masterclass',
    trainingType: 'Informatica Training',
    totalParticipants: 16,
    responsesCount: 12,
    pendingCount: 4,
    requestSentDate: '2026-08-14',
    lastReminderDate: '2026-08-15',
    nextReminderDate: '2026-08-18',
    status: 'Awaiting Feedback',
    pendingRespondents: [
      { id: 'tr-10', name: 'Suresh Kumar', employeeId: 'EMP041', email: 'suresh.k@systech.com' },
      { id: 'tr-11', name: 'Meera Menon', employeeId: 'EMP045', email: 'meera.m@systech.com' },
      { id: 'tr-12', name: 'Arun Prakash', employeeId: 'EMP048', email: 'arun.p@systech.com' },
      { id: 'tr-13', name: 'Deepa Lakshmi', employeeId: 'EMP052', email: 'deepa.l@systech.com' },
    ],
  },
  {
    id: 'pend-103',
    sessionId: 'cal-109',
    sessionTitle: 'Databricks Certified Associate Exam Prep',
    trainingType: 'Certification Preparation',
    totalParticipants: 12,
    responsesCount: 8,
    pendingCount: 4,
    requestSentDate: '2026-02-20',
    lastReminderDate: '2026-02-22',
    nextReminderDate: '2026-02-25',
    status: 'Awaiting Feedback',
    pendingRespondents: [
      { id: 'tr-14', name: 'Vikas Gupta', employeeId: 'EMP060', email: 'vikas.g@systech.com' },
      { id: 'tr-15', name: 'Nisha Singh', employeeId: 'EMP062', email: 'nisha.s@systech.com' },
      { id: 'tr-16', name: 'Rohan Joshi', employeeId: 'EMP066', email: 'rohan.j@systech.com' },
      { id: 'tr-17', name: 'Swati Patel', employeeId: 'EMP070', email: 'swati.p@systech.com' },
    ],
  },
];

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionSummaries, setSessionSummaries] = useState<SessionFeedbackSummary[]>(INITIAL_SESSION_SUMMARIES);
  const [participantResponses, setParticipantResponses] = useState<ParticipantFeedbackResponse[]>(INITIAL_PARTICIPANT_RESPONSES);
  const [trainerFeedbacks, setTrainerFeedbacks] = useState<TrainerFeedbackRecord[]>(INITIAL_TRAINER_FEEDBACKS);
  const [pendingRequests, setPendingRequests] = useState<PendingFeedbackRequest[]>(INITIAL_PENDING_REQUESTS);
  const [feedbackRecords, setFeedbackRecords] = useState<FeedbackRecord[]>([]);

  const addSessionFeedback = (summary: Partial<SessionFeedbackSummary>) => {
    const newSummary: SessionFeedbackSummary = {
      id: `s-fb-${Date.now()}`,
      sessionId: summary.sessionId || `session-${Date.now()}`,
      sessionTitle: summary.sessionTitle || 'New L&D Training Session',
      trainingType: summary.trainingType || 'Knowledge Sharing Series',
      track: summary.track || 'DE',
      trainerId: summary.trainerId || 'trainer-1',
      trainerName: summary.trainerName || 'Sarah David',
      sessionDate: summary.sessionDate || new Date().toISOString().split('T')[0],
      year: summary.year || 2026,
      quarter: summary.quarter || 'Q3',
      totalParticipants: summary.totalParticipants || 15,
      responsesCount: summary.responsesCount || 1,
      pendingCount: (summary.totalParticipants || 15) - (summary.responsesCount || 1),
      overallRating: summary.overallRating || 4.5,
      contentRating: summary.contentRating || 4.5,
      trainerRating: summary.trainerRating || 4.7,
      relevanceRating: summary.relevanceRating || 4.4,
      engagementRating: summary.engagementRating || 4.5,
      paceRating: summary.paceRating || 4.3,
      status: summary.status || 'Collected',
      positiveComments: summary.positiveComments || ['Great interactive presentation and clear examples.'],
      improvementSuggestions: summary.improvementSuggestions || ['Provide follow-up exercise lab notebooks.'],
      trainerComments: summary.trainerComments || 'Trainees were engaged and actively participated.',
      createdAt: new Date().toISOString(),
    };
    setSessionSummaries((prev) => [newSummary, ...prev]);
  };

  const importSessionFeedback = (records: Partial<SessionFeedbackSummary>[]) => {
    const imported: SessionFeedbackSummary[] = records.map((r, idx) => ({
      id: `s-fb-imp-${Date.now()}-${idx}`,
      sessionId: r.sessionId || `session-imp-${idx}`,
      sessionTitle: r.sessionTitle || 'Imported L&D Session',
      trainingType: r.trainingType || 'Knowledge Sharing Series',
      track: r.track || 'DE',
      trainerId: r.trainerId || 'trainer-1',
      trainerName: r.trainerName || 'Sarah David',
      sessionDate: r.sessionDate || new Date().toISOString().split('T')[0],
      year: 2026,
      quarter: 'Q3',
      totalParticipants: r.totalParticipants || 20,
      responsesCount: r.responsesCount || 18,
      pendingCount: (r.totalParticipants || 20) - (r.responsesCount || 18),
      overallRating: r.overallRating || 4.5,
      contentRating: r.contentRating || 4.6,
      trainerRating: r.trainerRating || 4.7,
      relevanceRating: r.relevanceRating || 4.4,
      engagementRating: r.engagementRating || 4.5,
      paceRating: r.paceRating || 4.3,
      status: 'Collected',
      positiveComments: r.positiveComments || ['Imported feedback record verified successfully.'],
      improvementSuggestions: r.improvementSuggestions || [],
      trainerComments: r.trainerComments || 'Imported session evaluation dataset.',
      createdAt: new Date().toISOString(),
    }));
    setSessionSummaries((prev) => [...imported, ...prev]);
  };

  const sendFeedbackReminder = (sessionId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setPendingRequests((prev) =>
      prev.map((req) => {
        if (req.sessionId === sessionId || req.id === sessionId) {
          return {
            ...req,
            lastReminderDate: todayStr,
            status: 'Reminded' as const,
          };
        }
        return req;
      })
    );

    setSessionSummaries((prev) =>
      prev.map((s) => {
        if (s.sessionId === sessionId || s.id === sessionId) {
          return { ...s, status: 'Awaiting Feedback' as const };
        }
        return s;
      })
    );
  };

  const simulateAllPendingReminders = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setPendingRequests((prev) =>
      prev.map((req) => ({
        ...req,
        lastReminderDate: todayStr,
        status: 'Reminded' as const,
      }))
    );
  };

  // Legacy Compatibility Functions
  const addFeedback = (record: Partial<FeedbackRecord>) => {};
  const updateFeedback = (id: string, updates: Partial<FeedbackRecord>) => {};
  const approveFeedback = (id: string) => {};
  const publishFeedback = (id: string) => {};
  const runAiAnalysis = (id: string) => {};
  const archiveFeedback = (id: string) => {};
  const duplicateFeedback = (id: string) => {};

  return (
    <FeedbackContext.Provider
      value={{
        sessionSummaries,
        participantResponses,
        trainerFeedbacks,
        pendingRequests,
        feedbackRecords,
        addSessionFeedback,
        importSessionFeedback,
        sendFeedbackReminder,
        simulateAllPendingReminders,
        addFeedback,
        updateFeedback,
        approveFeedback,
        publishFeedback,
        runAiAnalysis,
        archiveFeedback,
        duplicateFeedback,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
