/**
 * Enterprise Mock Data Layer for Systech Solutions L&D Command Center
 * Clean separation of data structures from UI components.
 */

export interface KpiItem {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  context: string;
  trend: string;
  trendPositive: boolean;
  iconName: 'bootcamp' | 'trainees' | 'ready' | 'attention' | 'cert' | 'progress';
}

export interface LearningProgressPoint {
  week: string;
  overall: number;
  assessment: number;
  assignment: number;
}

export interface BootcampDomain {
  id: string;
  name: string;
  code: string;
  traineesCount: number;
  avgScore: number;
  completionRate: number;
  attendanceRate: number;
  status: 'EXCELLENT' | 'ON_TRACK' | 'NEEDS_ATTENTION';
}

export interface AiInsight {
  id: string;
  title: string;
  explanation: string;
  category: 'Performance' | 'Skill Gap' | 'Engagement' | 'Milestone' | 'Intervention' | 'Upskilling' | 'Analytics';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  affectedCount: number;
  metricLabel: string;
  recommendedAction: string;
}

export interface TraineeAttentionItem {
  id: string;
  traineeCode: string;
  batch: string;
  primarySkillGap: string;
  progressPercent: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  recommendedAction: string;
  lastActive: string;
}

export interface UpcomingActivityItem {
  id: string;
  sessionTitle: string;
  trainer: string;
  dateTime: string;
  batch: string;
  type: 'Lecture' | 'Assessment' | 'Review' | 'Workshop';
}

export interface CertificationItem {
  id: string;
  code: string;
  title: string;
  preparingCount: number;
  completedThisMonth: number;
  targetPassRate: number;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'assessment' | 'submission' | 'feedback' | 'certification' | 'intervention';
}

// --------------------------------------------------------------------------
// DEMO MOCK DATA
// --------------------------------------------------------------------------

export const KPI_METRICS: KpiItem[] = [
  {
    id: 'kpi-1',
    title: 'Active Bootcamps',
    value: 4,
    context: 'Data, Power BI, SQL, Python',
    trend: '+1 this month',
    trendPositive: true,
    iconName: 'bootcamp'
  },
  {
    id: 'kpi-2',
    title: 'Total Trainees',
    value: 96,
    context: 'Across 4 active cohorts',
    trend: '+12 new intake',
    trendPositive: true,
    iconName: 'trainees'
  },
  {
    id: 'kpi-3',
    title: 'Project Ready',
    value: 58,
    context: '60.4% deployment benchmark',
    trend: '+8 this week',
    trendPositive: true,
    iconName: 'ready'
  },
  {
    id: 'kpi-4',
    title: 'Need Attention',
    value: 12,
    context: 'Requires intervention/mentorship',
    trend: '-3 resolved',
    trendPositive: true,
    iconName: 'attention'
  },
  {
    id: 'kpi-5',
    title: 'Certifications',
    value: 37,
    context: 'Azure, Databricks & Power BI',
    trend: '+5 this week',
    trendPositive: true,
    iconName: 'cert'
  },
  {
    id: 'kpi-6',
    title: 'Avg Learning Progress',
    value: '81%',
    context: 'Curriculum completion rate',
    trend: '+4.2% overall',
    trendPositive: true,
    iconName: 'progress'
  }
];

export const LEARNING_OVERVIEW_SERIES: LearningProgressPoint[] = [
  { week: 'Wk 1', overall: 42, assessment: 38, assignment: 55 },
  { week: 'Wk 2', overall: 51, assessment: 48, assignment: 62 },
  { week: 'Wk 3', overall: 63, assessment: 59, assignment: 70 },
  { week: 'Wk 4', overall: 68, assessment: 65, assignment: 74 },
  { week: 'Wk 5', overall: 74, assessment: 71, assignment: 81 },
  { week: 'Wk 6', overall: 78, assessment: 76, assignment: 85 },
  { week: 'Wk 7', overall: 81, assessment: 79, assignment: 88 },
  { week: 'Wk 8', overall: 86, assessment: 84, assignment: 92 },
];

export const BOOTCAMP_PERFORMANCE_DOMAINS: BootcampDomain[] = [
  {
    id: 'b-1',
    name: 'SQL Data Architecture',
    code: 'SQL-B01',
    traineesCount: 28,
    avgScore: 88,
    completionRate: 92,
    attendanceRate: 96,
    status: 'EXCELLENT'
  },
  {
    id: 'b-2',
    name: 'Python Data Engineering',
    code: 'PY-B02',
    traineesCount: 24,
    avgScore: 74,
    completionRate: 78,
    attendanceRate: 88,
    status: 'NEEDS_ATTENTION'
  },
  {
    id: 'b-3',
    name: 'Power BI & DAX Intelligence',
    code: 'PBI-B01',
    traineesCount: 22,
    avgScore: 79,
    completionRate: 84,
    attendanceRate: 91,
    status: 'ON_TRACK'
  },
  {
    id: 'b-4',
    name: 'Enterprise Data Engineering',
    code: 'DE-B03',
    traineesCount: 22,
    avgScore: 84,
    completionRate: 89,
    attendanceRate: 94,
    status: 'EXCELLENT'
  }
];

export const AI_INSIGHTS: AiInsight[] = [
  {
    id: 'ai-1',
    title: 'Declining Assessment Performance Identified',
    explanation: '12 trainees show a 15%+ score drop in recent Python OOP and algorithm assessments over the past 14 days.',
    category: 'Performance',
    priority: 'HIGH',
    affectedCount: 12,
    metricLabel: '12 Trainees Affected',
    recommendedAction: 'Schedule 1-on-1 mentor revision lab'
  },
  {
    id: 'ai-2',
    title: 'DAX & Complex Calculations Skill Gap',
    explanation: 'Power BI and DAX measures represent the single highest error cluster (38% miss rate) in Cohort PBI-B01.',
    category: 'Skill Gap',
    priority: 'HIGH',
    affectedCount: 15,
    metricLabel: '38% Error Cluster',
    recommendedAction: 'Deploy DAX Masterclass workshop'
  },
  {
    id: 'ai-3',
    title: 'Late Assignment Submission Trend',
    explanation: '8 trainees have submitted late assignments for two consecutive modules in Data Engineering B02.',
    category: 'Engagement',
    priority: 'MEDIUM',
    affectedCount: 8,
    metricLabel: '8 Trainees Delayed',
    recommendedAction: 'Trigger Coordinator check-in alert'
  },
  {
    id: 'ai-4',
    title: 'Project Readiness Acceleration',
    explanation: '6 trainees achieved >90% benchmark scores in recent capstone reviews and are ready for client deployment.',
    category: 'Milestone',
    priority: 'LOW',
    affectedCount: 6,
    metricLabel: '6 Trainees Ready',
    recommendedAction: 'Initiate Client Readiness Certification'
  }
];

export const TRAINEES_ATTENTION: TraineeAttentionItem[] = [
  {
    id: 't-1',
    traineeCode: 'Amuthanilavan',
    batch: 'Data Engineering - B02',
    primarySkillGap: 'Python DataFrames & OOP',
    progressPercent: 64,
    riskLevel: 'High',
    recommendedAction: 'Focused Practice & Code Review',
    lastActive: '2 hours ago'
  },
  {
    id: 't-2',
    traineeCode: 'Pavithra Annadurai',
    batch: 'Power BI - B01',
    primarySkillGap: 'DAX Time Intelligence',
    progressPercent: 71,
    riskLevel: 'Medium',
    recommendedAction: 'Mentor Session with Lead Trainer',
    lastActive: '30 mins ago'
  },
  {
    id: 't-3',
    traineeCode: 'Aakash Duraisamy',
    batch: 'SQL Architecture - B01',
    primarySkillGap: 'Query Optimization & CTEs',
    progressPercent: 68,
    riskLevel: 'High',
    recommendedAction: 'Remedial Query Tuning Lab',
    lastActive: '1 day ago'
  },
  {
    id: 't-4',
    traineeCode: 'Saran Mani',
    batch: 'Data Bootcamp - B01',
    primarySkillGap: 'Data Pipeline Design',
    progressPercent: 75,
    riskLevel: 'Low',
    recommendedAction: 'Peer Review & Pair Programming',
    lastActive: '10 mins ago'
  }
];

export const UPCOMING_ACTIVITIES: UpcomingActivityItem[] = [
  {
    id: 'act-1',
    sessionTitle: 'Advanced DAX Time Intelligence',
    trainer: 'Alex Thomas',
    dateTime: 'Tomorrow • 10:00 AM',
    batch: 'Power BI - B01',
    type: 'Lecture'
  },
  {
    id: 'act-2',
    sessionTitle: 'Python Data Pipeline Assessment',
    trainer: 'Sarah David',
    dateTime: 'Friday • 02:00 PM',
    batch: 'Data Engineering - B02',
    type: 'Assessment'
  },
  {
    id: 'act-3',
    sessionTitle: 'Simulation Project Capstone Review',
    trainer: 'Trainer C',
    dateTime: 'Monday • 11:00 AM',
    batch: 'Data Bootcamp - B01',
    type: 'Review'
  }
];

export const CERTIFICATION_SNAPSHOTS: CertificationItem[] = [
  {
    id: 'c-1',
    code: 'DP-700',
    title: 'Fabric Data Engineer',
    preparingCount: 14,
    completedThisMonth: 6,
    targetPassRate: 85
  },
  {
    id: 'c-2',
    code: 'DP-600',
    title: 'Fabric Analytics Engineer',
    preparingCount: 10,
    completedThisMonth: 4,
    targetPassRate: 80
  },
  {
    id: 'c-3',
    code: 'PL-300',
    title: 'Power BI Data Analyst',
    preparingCount: 12,
    completedThisMonth: 8,
    targetPassRate: 90
  }
];

export const RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'r-1',
    title: 'Assessment Completed',
    description: 'Cohort SQL-B01 submitted SQL Advanced Indexing Assessment.',
    timestamp: '5 min ago',
    type: 'assessment'
  },
  {
    id: 'r-2',
    title: 'Trainer Feedback Added',
    description: 'Sarah David added feedback for Pavithra Annadurai in Power BI DAX Lab.',
    timestamp: '25 min ago',
    type: 'feedback'
  },
  {
    id: 'r-3',
    title: 'Certification Completed',
    description: 'Saran Mani earned Microsoft PL-300 Certification badge.',
    timestamp: '1 hour ago',
    type: 'certification'
  },
  {
    id: 'r-4',
    title: 'Intervention Assigned',
    description: 'Mentorship assigned to Amuthanilavan for Python DataFrames.',
    timestamp: '2 hours ago',
    type: 'intervention'
  }
];
