import React, { createContext, useContext, useState } from 'react';
import { FeedbackRecord, FeedbackStatus } from '../types/feedback';

interface FeedbackContextType {
  feedbackRecords: FeedbackRecord[];
  addFeedback: (record: Partial<FeedbackRecord>) => void;
  updateFeedback: (id: string, updates: Partial<FeedbackRecord>) => void;
  approveFeedback: (id: string) => void;
  publishFeedback: (id: string) => void;
  runAiAnalysis: (id: string) => void;
  archiveFeedback: (id: string) => void;
  duplicateFeedback: (id: string) => void;
}

const INITIAL_MOCK_FEEDBACK: FeedbackRecord[] = [
  {
    id: 'fb-101',
    traineeId: 'tr-1',
    traineeName: 'Kaviram Sudharajanainar Paramasivan',
    employeeId: 'EMP001',
    trainerId: 'trainer-1',
    trainerName: 'Sneha',
    trainerRole: 'SQL Trainer',
    bootcampId: 'bc-1',
    bootcampName: 'SQL Data Architecture',
    bootcampCode: 'DE-B-2026-B01',
    moduleId: 'm-1',
    moduleName: 'SQL Fundamentals & T-SQL',
    track: 'Common Foundation',
    feedbackDate: '2026-01-24',
    technicalRating: 4.5,
    participationRating: 5.0,
    communicationRating: 4.0,
    problemSolvingRating: 3.5,
    practicalApplicationRating: 4.0,
    learningAttitudeRating: 5.0,
    overallRating: 4.3,
    strengthComments: 'Understands relational database schema design extremely well and actively leads group exercises.',
    improvementComments: 'Requires more practice with complex subqueries and CTE windowing functions under timed pressure.',
    generalComments: 'High potential trainee with excellent classroom engagement.',
    aiSummary: 'Strong SQL conceptual understanding and high participation. Recommended focus on complex joins & window functions.',
    aiStrengths: ['SQL Schema Design', 'Classroom Leadership', 'Database Fundamentals'],
    aiImprovementAreas: ['CTE Windowing', 'Complex Subqueries', 'Timed Execution'],
    aiSkills: ['SQL', 'T-SQL', 'Relational Modeling'],
    aiDevelopmentPriority: 'Moderate',
    aiRecommendedFocus: 'Provide additional hands-on exercises for windowing functions before Track Allocation.',
    insightBadgeType: 'Strength',
    status: 'Published',
    source: 'EXCEL_IMPORT',
    createdAt: '2026-01-24T10:30:00Z',
    updatedAt: '2026-01-24T14:00:00Z',
  },
  {
    id: 'fb-102',
    traineeId: 'tr-2',
    traineeName: 'Saran Mani',
    employeeId: 'EMP002',
    trainerId: 'trainer-2',
    trainerName: 'Sarah David',
    trainerRole: 'Python Trainer',
    bootcampId: 'bc-2',
    bootcampName: 'Python Data Engineering',
    bootcampCode: 'DE-B-2026-B02',
    moduleId: 'm-2',
    moduleName: 'Python Core & OOP',
    track: 'Common Foundation',
    feedbackDate: '2026-01-22',
    technicalRating: 4.8,
    participationRating: 4.5,
    communicationRating: 4.5,
    problemSolvingRating: 4.8,
    practicalApplicationRating: 5.0,
    learningAttitudeRating: 4.5,
    overallRating: 4.7,
    strengthComments: 'Outstanding algorithmic problem solving and modular object-oriented code structuring.',
    improvementComments: 'Minor syntax refinement needed in exception handling decorators.',
    generalComments: 'Top performer in Python data structures evaluation.',
    aiSummary: 'Exceptional OOP code structuring and algorithmic efficiency. Ready for advanced Databricks PySpark modules.',
    aiStrengths: ['Python OOP', 'Data Structures', 'Algorithmic Thinking'],
    aiImprovementAreas: ['Decorators', 'Custom Exceptions'],
    aiSkills: ['Python', 'Data Structures', 'OOP'],
    aiDevelopmentPriority: 'Low',
    aiRecommendedFocus: 'Accelerated track assignment to Databricks PySpark pipeline development.',
    insightBadgeType: 'Strength',
    status: 'Approved',
    source: 'MANUAL',
    createdAt: '2026-01-22T11:15:00Z',
    updatedAt: '2026-01-23T09:00:00Z',
  },
  {
    id: 'fb-103',
    traineeId: 'tr-3',
    traineeName: 'Amuthanilavan',
    employeeId: 'EMP003',
    trainerId: 'trainer-3',
    trainerName: 'John Mathew',
    trainerRole: 'dbt & Snowflake Trainer',
    bootcampId: 'bc-1',
    bootcampName: 'SQL Data Architecture',
    bootcampCode: 'DE-B-2026-B01',
    moduleId: 'm-3',
    moduleName: 'dbt Core & Snowflake Transformation',
    track: 'DBT & Snowflake',
    feedbackDate: '2026-01-20',
    technicalRating: 3.0,
    participationRating: 3.5,
    communicationRating: 3.0,
    problemSolvingRating: 2.8,
    practicalApplicationRating: 3.0,
    learningAttitudeRating: 4.0,
    overallRating: 3.2,
    strengthComments: 'Good effort in understanding Jinja macro templates.',
    improvementComments: 'Struggles with dimensional data modeling and incremental model materialization configs.',
    generalComments: 'Requires dedicated mentoring support to catch up on transformation logic.',
    aiSummary: 'Struggling with incremental dbt models and dimensional schema design. High development priority attention needed.',
    aiStrengths: ['Jinja Templates', 'Eager Learner'],
    aiImprovementAreas: ['Dimensional Modeling', 'Incremental Models', 'Star Schema'],
    aiSkills: ['dbt', 'Snowflake', 'SQL'],
    aiDevelopmentPriority: 'High',
    aiRecommendedFocus: 'Assign 1-on-1 mentoring sessions on dimensional schema design.',
    insightBadgeType: 'Needs Attention',
    status: 'Needs Review',
    source: 'EXCEL_IMPORT',
    createdAt: '2026-01-20T16:45:00Z',
    updatedAt: '2026-01-21T08:30:00Z',
  },
  {
    id: 'fb-104',
    traineeId: 'tr-4',
    traineeName: 'Pavithra Annadurai',
    employeeId: 'EMP004',
    trainerId: 'trainer-4',
    trainerName: 'Alex Thomas',
    trainerRole: 'Primary Trainer',
    bootcampId: 'bc-3',
    bootcampName: 'Lateral Data Engineering Acceleration',
    bootcampCode: 'DE-L-2026-B01',
    moduleId: 'm-4',
    moduleName: 'PySpark & Delta Lake Architecture',
    track: 'Databricks',
    feedbackDate: '2026-01-18',
    technicalRating: 4.0,
    participationRating: 4.2,
    communicationRating: 4.0,
    problemSolvingRating: 4.0,
    practicalApplicationRating: 4.2,
    learningAttitudeRating: 4.5,
    overallRating: 4.1,
    strengthComments: 'Solid execution of Delta Lake ACID transactions and time-travel querying.',
    improvementComments: 'Could optimize PySpark shuffle partitions for large dataset joins.',
    generalComments: 'Consistent progress and proactive in asking technical questions.',
    aiSummary: 'Solid Delta Lake fundamentals with good practical application. Opportunities in PySpark performance tuning.',
    aiStrengths: ['Delta Lake', 'Time Travel Queries', 'PySpark Basics'],
    aiImprovementAreas: ['Shuffle Partition Tuning', 'Spark UI Debugging'],
    aiSkills: ['PySpark', 'Delta Lake', 'Databricks'],
    aiDevelopmentPriority: 'Low',
    aiRecommendedFocus: 'Focus on PySpark memory optimization and join shuffle tuning.',
    insightBadgeType: 'Development Opportunity',
    status: 'AI Processed',
    source: 'EXCEL_IMPORT',
    createdAt: '2026-01-18T14:20:00Z',
    updatedAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 'fb-105',
    traineeId: 'tr-5',
    traineeName: 'Madhan Raj',
    employeeId: 'EMP005',
    trainerId: 'trainer-5',
    trainerName: 'Dinesh Kumar',
    trainerRole: 'Evaluator & Trainer',
    bootcampId: 'bc-1',
    bootcampName: 'SQL Data Architecture',
    bootcampCode: 'DE-B-2026-B01',
    moduleId: 'm-5',
    moduleName: 'Data Warehouse Modeling',
    track: 'Shared',
    feedbackDate: '2026-01-15',
    technicalRating: 4.6,
    participationRating: 4.8,
    communicationRating: 4.5,
    problemSolvingRating: 4.4,
    practicalApplicationRating: 4.6,
    learningAttitudeRating: 4.8,
    overallRating: 4.6,
    strengthComments: 'Excellent star schema design and surrogate key management.',
    improvementComments: 'Explore slowly changing dimensions (SCD Type 2) implementation in depth.',
    generalComments: 'Strong analytical skills and team collaboration.',
    aiSummary: 'Exceptional data warehousing & dimensional modeling skills. Recommended for advanced ETL project assignment.',
    aiStrengths: ['Star Schema', 'Surrogate Keys', 'Data Warehousing'],
    aiImprovementAreas: ['SCD Type 2', 'Data Lineage'],
    aiSkills: ['Data Modeling', 'ETL', 'SQL'],
    aiDevelopmentPriority: 'Low',
    aiRecommendedFocus: 'Hands-on practice with SCD Type 2 tracking in real-time pipelines.',
    insightBadgeType: 'Strength',
    status: 'Published',
    source: 'MANUAL',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-16T11:30:00Z',
  },
];

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feedbackRecords, setFeedbackRecords] = useState<FeedbackRecord[]>(INITIAL_MOCK_FEEDBACK);

  const addFeedback = (record: Partial<FeedbackRecord>) => {
    const newRecord: FeedbackRecord = {
      id: 'fb-' + Date.now(),
      traineeId: record.traineeId || 'tr-1',
      traineeName: record.traineeName || 'Trainee',
      employeeId: record.employeeId || 'EMP000',
      trainerId: record.trainerId || 'trainer-1',
      trainerName: record.trainerName || 'Sneha',
      trainerRole: record.trainerRole || 'Trainer',
      bootcampId: record.bootcampId || 'bc-1',
      bootcampName: record.bootcampName || 'SQL Data Architecture',
      bootcampCode: record.bootcampCode || 'DE-B-2026-B01',
      moduleId: record.moduleId || 'm-1',
      moduleName: record.moduleName || 'SQL Fundamentals',
      track: record.track || 'Common Foundation',
      feedbackDate: record.feedbackDate || new Date().toISOString().split('T')[0],
      technicalRating: record.technicalRating || 4.0,
      participationRating: record.participationRating || 4.0,
      communicationRating: record.communicationRating || 4.0,
      problemSolvingRating: record.problemSolvingRating || 4.0,
      overallRating: record.overallRating || 4.0,
      strengthComments: record.strengthComments || '',
      improvementComments: record.improvementComments || '',
      generalComments: record.generalComments || '',
      aiSummary: record.aiSummary || 'Feedback imported and validated by L&D Admin.',
      status: record.status || 'Validated',
      source: record.source || 'MANUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFeedbackRecords((prev) => [newRecord, ...prev]);
  };

  const updateFeedback = (id: string, updates: Partial<FeedbackRecord>) => {
    setFeedbackRecords((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f))
    );
  };

  const approveFeedback = (id: string) => {
    updateFeedback(id, { status: 'Approved', approvedAt: new Date().toISOString(), approvedBy: 'L&D Admin' });
  };

  const publishFeedback = (id: string) => {
    updateFeedback(id, { status: 'Published', publishedAt: new Date().toISOString(), publishedBy: 'L&D Admin' });
  };

  const runAiAnalysis = (id: string) => {
    updateFeedback(id, {
      status: 'AI Processed',
      aiSummary: 'AI analysis generated: Strong technical understanding with active participation. Recommended focus on practical problem solving.',
      aiStrengths: ['Technical Knowledge', 'Active Participation'],
      aiImprovementAreas: ['Independent Problem Solving'],
      aiDevelopmentPriority: 'Moderate',
      insightBadgeType: 'Strength',
    });
  };

  const archiveFeedback = (id: string) => {
    setFeedbackRecords((prev) => prev.filter((f) => f.id !== id));
  };

  const duplicateFeedback = (id: string) => {
    const existing = feedbackRecords.find((f) => f.id === id);
    if (existing) {
      addFeedback({
        ...existing,
        id: undefined,
        traineeName: `${existing.traineeName} (Copy)`,
        status: 'Draft' as any,
      });
    }
  };

  return (
    <FeedbackContext.Provider
      value={{
        feedbackRecords,
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
