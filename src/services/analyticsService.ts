/**
 * Analytics & Talent Outcomes Centralized Service
 * Consumes telemetry ground truth from skillIntelligenceService & certificationIntelligenceService.
 * Provides Organization-level, Batch-level, and Individual Trainee analytical models.
 */

import { skillIntelligenceService } from './skillIntelligenceService';
import { certificationIntelligenceService } from './certificationIntelligenceService';

export interface AnalyticsKpiCard {
  label: string;
  value: string | number;
  subtext: string;
  type: 'neutral' | 'emerald' | 'teal' | 'indigo' | 'amber' | 'rose';
}

export interface SkillCoverageItem {
  skill: string;
  avgScore: number;
  proficiencyLevel: 'Proficient' | 'Developing' | 'Needs Focus';
}

export const analyticsService = {
  // 1. Get Enterprise Overall Analytics Model
  getOverallAnalytics: () => {
    const trainees = skillIntelligenceService.getTrainees();
    const certRecommendations = certificationIntelligenceService.getCertificationRecommendations();

    const totalTrainees = trainees.length;
    const activeLearners = trainees.filter((t) => t.readinessStatus !== 'At Risk').length;
    const projectReady = trainees.filter((t) => t.readinessStatus === 'Project Ready').length;
    const certReady = certRecommendations.filter((r) => r.readinessLevel === 'READY TO SCHEDULE').length;
    const onTrack = trainees.filter((t) => t.readinessStatus === 'On Track').length;
    const needAttention = trainees.filter((t) => t.readinessStatus === 'Needs Attention').length;
    const atRisk = trainees.filter((t) => t.readinessStatus === 'At Risk').length;

    const kpis: AnalyticsKpiCard[] = [
      { label: 'TOTAL TRAINEES', value: totalTrainees, subtext: 'Enrolled across all cohorts', type: 'neutral' },
      { label: 'ACTIVE LEARNERS', value: activeLearners, subtext: 'Currently in active training', type: 'teal' },
      { label: 'PROJECT READY', value: projectReady, subtext: 'Ready for client deployment', type: 'emerald' },
      { label: 'CERTIFICATION READY', value: certReady, subtext: 'Exceeding 85% exam threshold', type: 'indigo' },
      { label: 'ON TRACK', value: onTrack, subtext: 'Meeting milestone targets', type: 'teal' },
      { label: 'NEED ATTENTION', value: needAttention, subtext: 'Targeted support required', type: 'amber' },
      { label: 'AT RISK', value: atRisk, subtext: 'Immediate intervention needed', type: 'rose' },
      { label: 'AVG TRAINING COMPLETION', value: '82%', subtext: 'Cohort progress average', type: 'neutral' },
    ];

    const skillCoverage: SkillCoverageItem[] = [
      { skill: 'SQL Architecture', avgScore: 86, proficiencyLevel: 'Proficient' },
      { skill: 'Python Automation', avgScore: 82, proficiencyLevel: 'Proficient' },
      { skill: 'Data Modeling', avgScore: 78, proficiencyLevel: 'Proficient' },
      { skill: 'Databricks Lakehouse', avgScore: 72, proficiencyLevel: 'Developing' },
      { skill: 'dbt Core Transformation', avgScore: 68, proficiencyLevel: 'Developing' },
      { skill: 'Snowflake Warehouse', avgScore: 71, proficiencyLevel: 'Developing' },
      { skill: 'Microsoft Fabric', avgScore: 65, proficiencyLevel: 'Needs Focus' },
    ];

    const trackPerformance = [
      {
        trackName: 'DBT + SNOWFLAKE TRANSFORMATION',
        traineeCount: 12,
        avgAssessment: 84,
        skillReadiness: 81,
        projectReadyCount: 2,
        certReadyCount: 2,
      },
      {
        trackName: 'DATABRICKS LAKEHOUSE',
        traineeCount: 14,
        avgAssessment: 86,
        skillReadiness: 84,
        projectReadyCount: 2,
        certReadyCount: 2,
      },
    ];

    const topTalent = skillIntelligenceService.getOverallReadinessRanking();

    return {
      kpis,
      readinessDistribution: [
        { label: 'Project Ready', count: projectReady, percent: 17, color: '#047857' },
        { label: 'On Track', count: onTrack, percent: 50, color: '#0F766E' },
        { label: 'Needs Attention', count: needAttention, percent: 17, color: '#B45309' },
        { label: 'At Risk', count: atRisk, percent: 16, color: '#BE123C' },
      ],
      funnel: [
        { stage: 'Enrolled', count: 28 },
        { stage: 'Active Learners', count: 26 },
        { stage: 'Foundation Completed', count: 24 },
        { stage: 'Track Allocated', count: 20 },
        { stage: 'Capstone Complete', count: 15 },
        { stage: 'Project Ready', count: 10 },
        { stage: 'Certification Ready', count: 6 },
      ],
      skillCoverage,
      trackPerformance,
      topTalent,
      attentionList: [
        { name: 'Aakash Duraisamy', empId: 'EMP006', concern: 'Databricks Architecture (48%)', riskScore: 'High Risk' },
        { name: 'Amuthanilavan', empId: 'EMP003', concern: 'dbt Transformation (58%)', riskScore: 'Moderate' },
      ],
    };
  },

  // 2. Get Batch / Cohort Specific Analytics
  getBatchAnalytics: (batchId: string = 'DE-B-2026-B01') => {
    return {
      batchHeader: {
        title: 'SQL Data Architecture & Python Data Engineering',
        batchCode: 'DE-B-2026-B01',
        program: 'BOOTCAMP 2026',
        primaryTrainer: 'John Mathew',
        coordinator: 'Priya Sharma',
        traineeCount: 28,
        currentStage: 'Track Allocation Phase',
      },
      kpis: [
        { label: 'TOTAL TRAINEES', value: 28, subtext: 'Batch enrollment', type: 'neutral' },
        { label: 'OVERALL PROGRESS', value: '78%', subtext: 'Milestones achieved', type: 'teal' },
        { label: 'AVG ATTENDANCE', value: '94%', subtext: 'Session attendance', type: 'emerald' },
        { label: 'AVG ASSESSMENT', value: '84%', subtext: 'Score across quizzes', type: 'teal' },
        { label: 'PROJECT READY', value: 1, subtext: 'Kaviram (82%)', type: 'emerald' },
        { label: 'CERTIFICATION READY', value: 2, subtext: 'Saran & Madhan', type: 'indigo' },
        { label: 'NEED ATTENTION', value: 1, subtext: 'Amuthanilavan (64%)', type: 'amber' },
        { label: 'AT RISK', value: 1, subtext: 'Aakash (56%)', type: 'rose' },
      ],
      batchVsOrgComparison: [
        { metric: 'Assessment Score', batchScore: 84, orgScore: 79 },
        { metric: 'Attendance Rate', batchScore: 94, orgScore: 89 },
        { metric: 'Project Readiness', batchScore: 81, orgScore: 74 },
        { metric: 'Skill Readiness', batchScore: 83, orgScore: 77 },
      ],
      topBatchTrainees: skillIntelligenceService.getOverallReadinessRanking().slice(0, 3),
      batchCertReadiness: [
        { code: 'DP-700', readyCount: 2 },
        { code: 'DP-750', readyCount: 2 },
        { code: 'DP-600', readyCount: 2 },
      ],
    };
  },

  // 3. Get Individual Trainee Analytics
  getTraineeAnalytics: (traineeId: string = 'te-1') => {
    const trainees = skillIntelligenceService.getTrainees();
    const target = trainees.find((t) => t.traineeId === traineeId) || trainees[0];
    const recs = certificationIntelligenceService.getCertificationRecommendations(target.traineeId);
    const certRec = recs[0] || certificationIntelligenceService.getCertificationRecommendations()[0];

    const skillAvg = Math.round(
      (target.skills.SQL + target.skills.Python + target.skills.Databricks + target.skills.Modeling) / 4
    );

    return {
      identity: {
        traineeId: target.traineeId,
        name: target.name,
        employeeId: target.employeeId,
        avatarInitials: target.avatarInitials,
        bootcampName: target.bootcampName,
        targetTrack: target.recommendedTrack,
        readinessScore: target.overallReadinessScore,
        readinessLevel: target.readinessStatus,
        statusTag: 'On Track',
      },
      kpis: [
        { label: 'OVERALL PROGRESS', value: `${target.overallReadinessScore}%`, subtext: 'Readiness index', type: 'teal' },
        { label: 'ATTENDANCE RATE', value: `${target.attendancePercent}%`, subtext: '24 Present / 2 Late', type: 'emerald' },
        { label: 'ASSESSMENT AVG', value: `${target.assessmentScore}%`, subtext: 'Technical quizzes', type: 'teal' },
        { label: 'SKILL READINESS', value: `${skillAvg}%`, subtext: 'Core telemetry', type: 'teal' },
        { label: 'PROJECT READINESS', value: `${target.overallReadinessScore}%`, subtext: 'Client ready', type: 'emerald' },
        { label: 'CERTIFICATION PREP', value: `${certRec.readinessScore}%`, subtext: certRec.examCode, type: 'indigo' },
        { label: 'TRAINER FEEDBACK', value: `${target.trainerFeedbackRating} / 5`, subtext: 'Rating score', type: 'neutral' },
      ],
      skillRadar: [
        { skill: 'SQL Architecture', score: target.skills.SQL },
        { skill: 'Python Automation', score: target.skills.Python },
        { skill: 'Data Modeling', score: target.skills.Modeling },
        { skill: 'Problem Solving', score: target.skills['Problem Solving'] },
        { skill: 'Communication', score: target.skills.Communication },
        { skill: 'Databricks / dbt', score: target.skills.Databricks },
      ],
      projectFitMatches: [
        { projectName: 'Azure Databricks Migration', fitScore: 86 },
        { projectName: 'Data Warehouse Modernization', fitScore: 81 },
        { projectName: 'Fabric Lakehouse Implementation', fitScore: 76 },
      ],
      targetCert: certRec,
      feedbackBreakdown: {
        technical: 4.3,
        participation: 4.5,
        communication: 4.1,
        problemSolving: 3.7,
        overall: target.trainerFeedbackRating,
      },
      traineeVsBatch: [
        { metric: 'SQL Architecture', traineeVal: target.skills.SQL, batchAvg: 79 },
        { metric: 'Python Automation', traineeVal: target.skills.Python, batchAvg: 77 },
        { metric: 'Attendance Rate', traineeVal: target.attendancePercent, batchAvg: 87 },
        { metric: 'Assessment Average', traineeVal: target.assessmentScore, batchAvg: 78 },
        { metric: 'Project Readiness', traineeVal: target.overallReadinessScore, batchAvg: 74 },
      ],
    };
  },

  // 4. Copilot Resolver for Analytics Scope
  askAnalyticsCopilot: (queryText: string, mode: string, selectedTraineeName: string = 'Kaviram Sudharajanainar Paramasivan') => {
    const qLower = queryText.toLowerCase();

    if (qLower.includes('ready') || qLower.includes('deployment')) {
      return {
        question: queryText,
        headline: 'DEPLOYMENT READINESS SUMMARY',
        summaryText: 'Evaluated 28 trainees across common foundation and track specializations.',
        highlights: [
          '#1 Kaviram Sudharajanainar Paramasivan (82% Readiness — Project Ready)',
          '#2 Saran Mani (79% Readiness — On Track)',
          '#3 Madhan Raj (78% Readiness — On Track)',
        ],
      };
    }

    if (qLower.includes('weak') || qLower.includes('gap') || qLower.includes('improve')) {
      return {
        question: queryText,
        headline: 'ORGANIZATION SKILL GAPS',
        summaryText: 'Primary skill gaps identified across cohort telemetry:',
        highlights: [
          'dbt Core Transformation (68% Average)',
          'Microsoft Fabric Security & Governance (65% Average)',
          'Databricks Join Shuffle Optimization (72% Average)',
        ],
      };
    }

    return {
      question: queryText,
      headline: `ANALYTICS INSIGHT FOR ${mode.toUpperCase()}`,
      summaryText: `Generated intelligence response for current analytics scope (${mode}):`,
      highlights: [
        `Trainee readiness index averages 78% across 2026 cohorts.`,
        `Databricks Lakehouse track shows highest technical score growth (+19%).`,
        `Recommended next L&D action: Schedule targeted Fabric & Databricks practical drills.`,
      ],
    };
  },
};
