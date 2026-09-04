/**
 * Certification Intelligence Centralized Service & Single Source of Truth
 * Manages Multi-Provider Certification Catalogs, Certified Talent Gallery,
 * Quarterly Quota Planning, Partnership Requirements, Management Requests,
 * Exam Lifecycles, Voucher Hub, and Copilot Natural-Language Answers.
 */

import { skillIntelligenceService } from './skillIntelligenceService';

export interface CertificationCatalogItem {
  id: string;
  examCode: string;
  title: string;
  provider: 'Microsoft' | 'Databricks' | 'Informatica' | 'Snowflake' | 'AWS' | 'Azure' | 'Power BI / Fabric';
  product: string;
  role: 'Data Engineer' | 'Analytics Engineer' | 'Data Architect' | 'BI Specialist';
  level: 'Intermediate' | 'Advanced' | 'Expert';
  isActive: boolean;
  lastVerified: string;
  description: string;
  capabilityAreas: string[];
  recommendedTrack: string;
  targetCount: number;
  completedCount: number;
  preparingCount: number;
  gapCount: number;
}

export interface PartnershipItem {
  id: string;
  provider: 'Microsoft' | 'Databricks' | 'Informatica' | 'Snowflake' | 'AWS' | 'Azure' | 'Power BI / Fabric';
  tierName: string;
  requiredCount: number;
  certifiedCount: number;
  preparingCount: number;
  gapCount: number;
  status: 'Requirement Met' | 'On Track' | 'Attention Required' | 'Critical Gap';
  deadline: string;
  notes: string;
}

export interface ManagementRequestItem {
  id: string;
  title: string;
  provider: string;
  certificationName: string;
  resourcesRequired: number;
  currentlyAvailable: number;
  preparing: number;
  gap: number;
  purpose: string;
  requiredBy: string;
  requestedBy: string;
  status: 'Open' | 'In Progress' | 'Attention Required' | 'Fulfilled';
  notes: string;
}

export interface QuotaItem {
  id: string;
  certification: string;
  provider: string;
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  target: number;
  completed: number;
  preparing: number;
  scheduled: number;
  gap: number;
  progressPercent: number;
  track: string;
}

export interface CertificationResourceItem {
  id: string;
  certificationCode: string;
  title: string;
  provider: string;
  learningPathUrl: string;
  examGuideUrl: string;
  internalTrainingUrl: string;
  practiceTestUrl: string;
  examCost: string;
  totalVouchers: number;
  availableVouchers: number;
  assignedVouchers: number;
  usedVouchers: number;
  expiredVouchers: number;
  deadline: string;
}

export interface TraineeCertificationRecommendation {
  traineeId: string;
  name: string;
  employeeId: string;
  avatarInitials: string;
  bootcampName: string;
  targetTrack: string;
  
  bestCertificationId: string;
  examCode: string;
  certificationTitle: string;
  product: string;
  provider: string;
  
  matchScore: number;       // Alignment with trainee skill profile (0 - 100)
  readinessScore: number;   // Preparation level for exam (0 - 100)
  readinessLevel: 'READY TO SCHEDULE' | 'PREPARING' | 'NEEDS DEVELOPMENT' | 'NOT READY';
  
  strongEvidence: Array<{ skill: string; score: number }>;
  developmentGaps: Array<{ skill: string; score: number }>;
  status: 'RECOMMENDED' | 'APPROVED' | 'PREPARING' | 'EXAM SCHEDULED' | 'PASSED' | 'FAILED' | 'CERTIFIED' | 'RENEWAL DUE';
  examDate?: string;
  credentialDate?: string;
  credentialId?: string;
  voucherCode?: string;
  validUntil?: string;
  validityStatus?: 'ACTIVE' | 'EXPIRING SOON' | 'EXPIRED';
  nextAction: string;
}

export interface CertifiedTraineeRecord {
  traineeId: string;
  name: string;
  employeeId: string;
  avatarInitials: string;
  bootcampName: string;
  track: string;
  provider: string;
  certificationId: string;
  examCode: string;
  certificationTitle: string;
  product: string;
  certifiedDate: string;
  validUntil: string;
  score: number;
  credentialId: string;
  verificationUrl: string;
  status: 'ACTIVE' | 'EXPIRING SOON' | 'EXPIRED' | 'RENEWAL DUE';
  expiryDaysRemaining: number;
  nextRecommendedCertId: string;
  nextRecommendedCertCode: string;
}

export interface CertificationCopilotResult {
  question: string;
  headline: string;
  summaryText: string;
  results: Array<{
    rank: number;
    traineeName: string;
    employeeId: string;
    avatarInitials: string;
    examCode: string;
    score: number;
    scoreLabel: string;
    statusBadge: string;
    evidence: string[];
    gapAction?: string;
  }>;
}

// 1. CONFIGURABLE CERTIFICATION CATALOG (MULTI-PROVIDER)
const CERTIFICATION_CATALOG: CertificationCatalogItem[] = [
  {
    id: 'cert-inf-cdi',
    examCode: 'INF-CDI',
    title: 'Informatica Cloud Data Integration Specialist',
    provider: 'Informatica',
    product: 'IDMC / CDI',
    role: 'Data Engineer',
    level: 'Intermediate',
    isActive: true,
    lastVerified: '2026-08-01',
    description: 'Validates expertise in Informatica Intelligent Data Management Cloud (IDMC) data pipelines, mapping tasks, and enterprise ETL architecture.',
    capabilityAreas: ['IDMC Architecture', 'Cloud Data Integration', 'Data Quality', 'Mapping Task Design', 'API Transformations'],
    recommendedTrack: 'DE',
    targetCount: 10,
    completedCount: 6,
    preparingCount: 3,
    gapCount: 4,
  },
  {
    id: 'cert-dp750',
    examCode: 'DP-750',
    title: 'Databricks Certified Data Engineer Associate',
    provider: 'Databricks',
    product: 'Azure Databricks',
    role: 'Data Engineer',
    level: 'Intermediate',
    isActive: true,
    lastVerified: '2026-08-01',
    description: 'Validates skills in Databricks Lakehouse Platform, Delta Lake, Unity Catalog governance, and PySpark pipeline optimization.',
    capabilityAreas: ['Databricks Lakehouse', 'PySpark Automation', 'Unity Catalog', 'Delta Lake Architecture', 'Performance Tuning'],
    recommendedTrack: 'DE',
    targetCount: 15,
    completedCount: 10,
    preparingCount: 3,
    gapCount: 5,
  },
  {
    id: 'cert-dp700',
    examCode: 'DP-700',
    title: 'Microsoft Fabric Data Engineer Associate',
    provider: 'Microsoft',
    product: 'Microsoft Fabric',
    role: 'Data Engineer',
    level: 'Intermediate',
    isActive: true,
    lastVerified: '2026-08-01',
    description: 'Validates expertise in data ingestion, transformation, monitoring and Fabric Lakehouse solution architecture.',
    capabilityAreas: ['SQL Architecture', 'PySpark Dataflows', 'KQL Analytics', 'Data Ingestion Pipelines', 'Fabric Monitoring'],
    recommendedTrack: 'DE',
    targetCount: 20,
    completedCount: 14,
    preparingCount: 4,
    gapCount: 6,
  },
  {
    id: 'cert-snow-core',
    examCode: 'COF-C02',
    title: 'Snowflake SnowPro Core Certified',
    provider: 'Snowflake',
    product: 'Snowflake Data Cloud',
    role: 'Data Architect',
    level: 'Intermediate',
    isActive: true,
    lastVerified: '2026-08-01',
    description: 'Validates core knowledge of Snowflake Data Cloud architecture, virtual warehouses, data sharing, and security governance.',
    capabilityAreas: ['Data Cloud Architecture', 'Virtual Warehouses', 'Snowpipe Ingestion', 'Secure Data Sharing', 'Time Travel & Cloning'],
    recommendedTrack: 'Shared',
    targetCount: 8,
    completedCount: 5,
    preparingCount: 2,
    gapCount: 3,
  },
  {
    id: 'cert-aws-dea',
    examCode: 'DEA-C01',
    title: 'AWS Certified Data Engineer Associate',
    provider: 'AWS',
    product: 'AWS Data Services',
    role: 'Data Engineer',
    level: 'Intermediate',
    isActive: true,
    lastVerified: '2026-08-01',
    description: 'Validates abilities in AWS data ingestion, transformation, Redshift data warehousing, Glue ETL, and IAM security.',
    capabilityAreas: ['AWS Glue & EMR', 'Amazon Redshift', 'S3 Data Lake', 'Athena Querying', 'IAM Security Governance'],
    recommendedTrack: 'DE',
    targetCount: 8,
    completedCount: 4,
    preparingCount: 2,
    gapCount: 4,
  },
];

// 2. PARTNERSHIP REQUIREMENTS DATASET
const PARTNERSHIP_SEED: PartnershipItem[] = [
  {
    id: 'p-1',
    provider: 'Microsoft',
    tierName: 'Gold Solutions Partner',
    requiredCount: 20,
    certifiedCount: 16,
    preparingCount: 3,
    gapCount: 4,
    status: 'Attention Required',
    deadline: '30 Sep 2026',
    notes: 'Need 4 more Fabric & Azure certified resources before Q3 audit.',
  },
  {
    id: 'p-2',
    provider: 'Databricks',
    tierName: 'Elite Partner Tier',
    requiredCount: 10,
    certifiedCount: 8,
    preparingCount: 2,
    gapCount: 2,
    status: 'On Track',
    deadline: '15 Oct 2026',
    notes: '2 candidates ready for DP-750 exam next week.',
  },
  {
    id: 'p-3',
    provider: 'Informatica',
    tierName: 'Premier Cloud Partner',
    requiredCount: 10,
    certifiedCount: 6,
    preparingCount: 3,
    gapCount: 4,
    status: 'Attention Required',
    deadline: '30 Sep 2026',
    notes: 'Management requested 10 certified resources for enterprise client rollout.',
  },
  {
    id: 'p-4',
    provider: 'Snowflake',
    tierName: 'Select Services Partner',
    requiredCount: 8,
    certifiedCount: 5,
    preparingCount: 2,
    gapCount: 3,
    status: 'On Track',
    deadline: '30 Nov 2026',
    notes: 'SnowPro Core certification path ongoing for DE cohort.',
  },
  {
    id: 'p-5',
    provider: 'AWS',
    tierName: 'Advanced Tier Partner',
    requiredCount: 10,
    certifiedCount: 4,
    preparingCount: 2,
    gapCount: 6,
    status: 'Critical Gap',
    deadline: '31 Oct 2026',
    notes: 'Requires urgent candidate recommendations and voucher allocation.',
  },
];

// 3. MANAGEMENT REQUESTS DATASET
const MANAGEMENT_REQUESTS_SEED: ManagementRequestItem[] = [
  {
    id: 'mr-1',
    title: 'Informatica Enterprise Rollout Talent',
    provider: 'Informatica',
    certificationName: 'Informatica Cloud Data Integration',
    resourcesRequired: 10,
    currentlyAvailable: 6,
    preparing: 3,
    gap: 4,
    purpose: 'Partnership Requirement & Enterprise Migration Project',
    requiredBy: '30 Sep 2026',
    requestedBy: 'Anusha — Delivery Head',
    status: 'Attention Required',
    notes: 'Client delivery requires 10 IDMC certified engineers for Q4 project onboarding.',
  },
  {
    id: 'mr-2',
    title: 'Databricks Lakehouse Team Expansion',
    provider: 'Databricks',
    certificationName: 'Databricks Certified Data Engineer',
    resourcesRequired: 8,
    currentlyAvailable: 8,
    preparing: 2,
    gap: 0,
    purpose: 'Client Architecture Audit & Competency Building',
    requiredBy: '15 Oct 2026',
    requestedBy: 'Dinesh Kumar — Practice Director',
    status: 'Fulfilled',
    notes: 'Target achieved with Madhan Raj and team certification completion.',
  },
];

// 4. QUOTA & PLANNING DATASET
const QUOTA_SEED: QuotaItem[] = [
  {
    id: 'q-1',
    certification: 'Databricks Data Engineer (DP-750)',
    provider: 'Databricks',
    year: 2026,
    quarter: 'Q3',
    target: 15,
    completed: 10,
    preparing: 3,
    scheduled: 2,
    gap: 5,
    progressPercent: 67,
    track: 'DE',
  },
  {
    id: 'q-2',
    certification: 'Informatica Cloud Data Integration',
    provider: 'Informatica',
    year: 2026,
    quarter: 'Q3',
    target: 10,
    completed: 6,
    preparing: 3,
    scheduled: 1,
    gap: 4,
    progressPercent: 60,
    track: 'DE',
  },
  {
    id: 'q-3',
    certification: 'Microsoft Fabric Data Engineer (DP-700)',
    provider: 'Microsoft',
    year: 2026,
    quarter: 'Q3',
    target: 20,
    completed: 14,
    preparing: 4,
    scheduled: 2,
    gap: 6,
    progressPercent: 70,
    track: 'DE',
  },
  {
    id: 'q-4',
    certification: 'Snowflake SnowPro Core (COF-C02)',
    provider: 'Snowflake',
    year: 2026,
    quarter: 'Q3',
    target: 8,
    completed: 5,
    preparing: 2,
    scheduled: 1,
    gap: 3,
    progressPercent: 63,
    track: 'Shared',
  },
];

// 5. RESOURCES & VOUCHERS DATASET
const RESOURCES_SEED: CertificationResourceItem[] = [
  {
    id: 'res-dp700',
    certificationCode: 'DP-700',
    title: 'Fabric Data Engineer Associate',
    provider: 'Microsoft',
    learningPathUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/',
    examGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-700',
    internalTrainingUrl: '/calendar',
    practiceTestUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/practice-assessments',
    examCost: '$165 USD',
    totalVouchers: 15,
    availableVouchers: 6,
    assignedVouchers: 5,
    usedVouchers: 4,
    expiredVouchers: 0,
    deadline: '30 Sep 2026',
  },
  {
    id: 'res-dp750',
    certificationCode: 'DP-750',
    title: 'Databricks Certified Data Engineer',
    provider: 'Databricks',
    learningPathUrl: 'https://academy.databricks.com/',
    examGuideUrl: 'https://www.databricks.com/learn/certification',
    internalTrainingUrl: '/calendar',
    practiceTestUrl: 'https://academy.databricks.com/practice-exams',
    examCost: '$200 USD',
    totalVouchers: 12,
    availableVouchers: 4,
    assignedVouchers: 4,
    usedVouchers: 4,
    expiredVouchers: 0,
    deadline: '15 Oct 2026',
  },
  {
    id: 'res-inf',
    certificationCode: 'INF-CDI',
    title: 'Informatica Cloud Data Integration',
    provider: 'Informatica',
    learningPathUrl: 'https://www.informatica.com/services-and-training.html',
    examGuideUrl: 'https://www.informatica.com/certification.html',
    internalTrainingUrl: '/calendar',
    practiceTestUrl: 'https://www.informatica.com/practice-tests.html',
    examCost: '$250 USD',
    totalVouchers: 10,
    availableVouchers: 3,
    assignedVouchers: 3,
    usedVouchers: 4,
    expiredVouchers: 0,
    deadline: '30 Sep 2026',
  },
];

// 6. MASTER CERTIFIED TALENT DATASET
const CERTIFIED_TALENT_SEED: CertifiedTraineeRecord[] = [
  {
    traineeId: 'emp-101',
    name: 'Madhan Raj',
    employeeId: 'EMP005',
    avatarInitials: 'MR',
    bootcampName: 'Data Engineering Cohort',
    track: 'DE',
    provider: 'Databricks',
    certificationId: 'cert-dp750',
    examCode: 'DP-750',
    certificationTitle: 'Databricks Certified Data Engineer Associate',
    product: 'Azure Databricks',
    certifiedDate: '12 Aug 2026',
    validUntil: '12 Aug 2028',
    score: 910,
    credentialId: 'DB-CERT-904812',
    verificationUrl: 'https://www.databricks.com/verify/DB-CERT-904812',
    status: 'ACTIVE',
    expiryDaysRemaining: 708,
    nextRecommendedCertId: 'cert-dp700',
    nextRecommendedCertCode: 'DP-700',
  },
  {
    traineeId: 'emp-102',
    name: 'Saran Mani',
    employeeId: 'EMP002',
    avatarInitials: 'SM',
    bootcampName: 'SQL Data Architecture',
    track: 'DE',
    provider: 'Microsoft',
    certificationId: 'cert-dp600',
    examCode: 'DP-600',
    certificationTitle: 'Fabric Analytics Engineer Associate',
    product: 'Microsoft Fabric',
    certifiedDate: '24 Jul 2026',
    validUntil: '24 Jul 2027',
    score: 890,
    credentialId: 'MS-CERT-884102',
    verificationUrl: 'https://learn.microsoft.com/verify/MS-CERT-884102',
    status: 'ACTIVE',
    expiryDaysRemaining: 324,
    nextRecommendedCertId: 'cert-dp750',
    nextRecommendedCertCode: 'DP-750',
  },
  {
    traineeId: 'emp-103',
    name: 'Priya Sharma',
    employeeId: 'EMP014',
    avatarInitials: 'PS',
    bootcampName: 'ETL & Informatica Mastery',
    track: 'DE',
    provider: 'Informatica',
    certificationId: 'cert-inf-cdi',
    examCode: 'INF-CDI',
    certificationTitle: 'Informatica Cloud Data Integration Specialist',
    product: 'IDMC / CDI',
    certifiedDate: '10 Jun 2026',
    validUntil: '10 Jun 2028',
    score: 940,
    credentialId: 'INF-CERT-330192',
    verificationUrl: 'https://www.informatica.com/verify/INF-CERT-330192',
    status: 'ACTIVE',
    expiryDaysRemaining: 645,
    nextRecommendedCertId: 'cert-dp750',
    nextRecommendedCertCode: 'DP-750',
  },
  {
    traineeId: 'emp-104',
    name: 'Dinesh Kumar',
    employeeId: 'EMP018',
    avatarInitials: 'DK',
    bootcampName: 'ETL & Informatica Mastery',
    track: 'DE',
    provider: 'Informatica',
    certificationId: 'cert-inf-cdi',
    examCode: 'INF-CDI',
    certificationTitle: 'Informatica Cloud Data Integration Specialist',
    product: 'IDMC / CDI',
    certifiedDate: '15 May 2026',
    validUntil: '15 May 2028',
    score: 920,
    credentialId: 'INF-CERT-330205',
    verificationUrl: 'https://www.informatica.com/verify/INF-CERT-330205',
    status: 'ACTIVE',
    expiryDaysRemaining: 619,
    nextRecommendedCertId: 'cert-dp700',
    nextRecommendedCertCode: 'DP-700',
  },
  {
    traineeId: 'emp-105',
    name: 'Anusha Swaminathan',
    employeeId: 'EMP022',
    avatarInitials: 'AS',
    bootcampName: 'ETL & Informatica Mastery',
    track: 'DE',
    provider: 'Informatica',
    certificationId: 'cert-inf-cdi',
    examCode: 'INF-CDI',
    certificationTitle: 'Informatica Cloud Data Integration Specialist',
    product: 'IDMC / CDI',
    certifiedDate: '01 Apr 2026',
    validUntil: '01 Apr 2028',
    score: 880,
    credentialId: 'INF-CERT-330118',
    verificationUrl: 'https://www.informatica.com/verify/INF-CERT-330118',
    status: 'ACTIVE',
    expiryDaysRemaining: 575,
    nextRecommendedCertId: 'cert-dp750',
    nextRecommendedCertCode: 'DP-750',
  },
  {
    traineeId: 'emp-106',
    name: 'Kaviram Sudharajanainar Paramasivan',
    employeeId: 'EMP001',
    avatarInitials: 'KS',
    bootcampName: 'Python Data Engineering',
    track: 'DE',
    provider: 'Informatica',
    certificationId: 'cert-inf-cdi',
    examCode: 'INF-CDI',
    certificationTitle: 'Informatica Cloud Data Integration Specialist',
    product: 'IDMC / CDI',
    certifiedDate: '18 Jan 2026',
    validUntil: '18 Jan 2028',
    score: 870,
    credentialId: 'INF-CERT-329801',
    verificationUrl: 'https://www.informatica.com/verify/INF-CERT-329801',
    status: 'ACTIVE',
    expiryDaysRemaining: 502,
    nextRecommendedCertId: 'cert-dp750',
    nextRecommendedCertCode: 'DP-750',
  },
  {
    traineeId: 'emp-107',
    name: 'Rohan Mehta',
    employeeId: 'EMP031',
    avatarInitials: 'RM',
    bootcampName: 'ETL & Informatica Mastery',
    track: 'DE',
    provider: 'Informatica',
    certificationId: 'cert-inf-cdi',
    examCode: 'INF-CDI',
    certificationTitle: 'Informatica Cloud Data Integration Specialist',
    product: 'IDMC / CDI',
    certifiedDate: '05 Feb 2026',
    validUntil: '05 Feb 2028',
    score: 865,
    credentialId: 'INF-CERT-329910',
    verificationUrl: 'https://www.informatica.com/verify/INF-CERT-329910',
    status: 'ACTIVE',
    expiryDaysRemaining: 520,
    nextRecommendedCertId: 'cert-dp700',
    nextRecommendedCertCode: 'DP-700',
  },
  {
    traineeId: 'emp-108',
    name: 'Sneha Patel',
    employeeId: 'EMP044',
    avatarInitials: 'SP',
    bootcampName: 'ETL & Informatica Mastery',
    track: 'DE',
    provider: 'Informatica',
    certificationId: 'cert-inf-cdi',
    examCode: 'INF-CDI',
    certificationTitle: 'Informatica Cloud Data Integration Specialist',
    product: 'IDMC / CDI',
    certifiedDate: '12 Nov 2025',
    validUntil: '12 Oct 2026',
    score: 850,
    credentialId: 'INF-CERT-321045',
    verificationUrl: 'https://www.informatica.com/verify/INF-CERT-321045',
    status: 'EXPIRING SOON',
    expiryDaysRemaining: 39,
    nextRecommendedCertId: 'cert-inf-cdi',
    nextRecommendedCertCode: 'INF-CDI Renewal',
  },
  {
    traineeId: 'emp-109',
    name: 'Pavithra Annadurai',
    employeeId: 'EMP004',
    avatarInitials: 'PA',
    bootcampName: 'Power BI & DAX Intelligence',
    track: 'BA',
    provider: 'Microsoft',
    certificationId: 'cert-dp700',
    examCode: 'DP-700',
    certificationTitle: 'Fabric Data Engineer Associate',
    product: 'Microsoft Fabric',
    certifiedDate: '28 Aug 2026',
    validUntil: '28 Aug 2027',
    score: 930,
    credentialId: 'MS-CERT-990142',
    verificationUrl: 'https://learn.microsoft.com/verify/MS-CERT-990142',
    status: 'ACTIVE',
    expiryDaysRemaining: 359,
    nextRecommendedCertId: 'cert-dp750',
    nextRecommendedCertCode: 'DP-750',
  },
  {
    traineeId: 'emp-110',
    name: 'Vikram Malhotra',
    employeeId: 'EMP052',
    avatarInitials: 'VM',
    bootcampName: 'Snowflake Data Cloud',
    track: 'Shared',
    provider: 'Snowflake',
    certificationId: 'cert-snow-core',
    examCode: 'COF-C02',
    certificationTitle: 'Snowflake SnowPro Core Certified',
    product: 'Snowflake Data Cloud',
    certifiedDate: '14 May 2026',
    validUntil: '14 May 2028',
    score: 885,
    credentialId: 'SNOW-CERT-55201',
    verificationUrl: 'https://www.snowflake.com/verify/SNOW-CERT-55201',
    status: 'ACTIVE',
    expiryDaysRemaining: 618,
    nextRecommendedCertId: 'cert-aws-dea',
    nextRecommendedCertCode: 'DEA-C01',
  },
];

// 7. TRACKER RECOMMENDATIONS SEED
const RECOMMENDATIONS_SEED: TraineeCertificationRecommendation[] = [
  {
    traineeId: 'te-1',
    name: 'Kaviram Sudharajanainar Paramasivan',
    employeeId: 'EMP001',
    avatarInitials: 'KS',
    bootcampName: 'Python Data Engineering',
    targetTrack: 'DE',
    bestCertificationId: 'cert-dp750',
    examCode: 'DP-750',
    certificationTitle: 'Databricks Certified Data Engineer Associate',
    product: 'Azure Databricks',
    provider: 'Databricks',
    matchScore: 88,
    readinessScore: 78,
    readinessLevel: 'PREPARING',
    strongEvidence: [
      { skill: 'Python', score: 82 },
      { skill: 'SQL Architecture', score: 86 },
      { skill: 'Data Engineering', score: 82 },
    ],
    developmentGaps: [
      { skill: 'Databricks Lakehouse', score: 65 },
      { skill: 'Unity Catalog Governance', score: 58 },
    ],
    status: 'PREPARING',
    voucherCode: 'VOUCH-DB-9901',
    nextAction: 'Complete Unity Catalog Governance lab and 2 Databricks practical mock drills.',
  },
  {
    traineeId: 'te-2',
    name: 'Saran Mani',
    employeeId: 'EMP002',
    avatarInitials: 'SM',
    bootcampName: 'SQL Data Architecture',
    targetTrack: 'DE',
    bestCertificationId: 'cert-dp600',
    examCode: 'DP-600',
    certificationTitle: 'Fabric Analytics Engineer Associate',
    product: 'Microsoft Fabric',
    provider: 'Microsoft',
    matchScore: 91,
    readinessScore: 87,
    readinessLevel: 'READY TO SCHEDULE',
    strongEvidence: [
      { skill: 'SQL Architecture', score: 84 },
      { skill: 'Data Modeling', score: 84 },
      { skill: 'dbt Core', score: 82 },
    ],
    developmentGaps: [
      { skill: 'Fabric Monitoring & Security', score: 68 },
    ],
    status: 'EXAM SCHEDULED',
    examDate: '2026-09-18',
    voucherCode: 'VOUCH-MS-4410',
    nextAction: 'L&D Admin to confirm Pearson VUE test center slot for Sept 18.',
  },
  {
    traineeId: 'te-3',
    name: 'Amuthanilavan',
    employeeId: 'EMP003',
    avatarInitials: 'AM',
    bootcampName: 'Informatica Cloud Integration',
    targetTrack: 'DE',
    bestCertificationId: 'cert-inf-cdi',
    examCode: 'INF-CDI',
    certificationTitle: 'Informatica Cloud Data Integration Specialist',
    product: 'IDMC / CDI',
    provider: 'Informatica',
    matchScore: 89,
    readinessScore: 84,
    readinessLevel: 'READY TO SCHEDULE',
    strongEvidence: [
      { skill: 'Cloud Data Integration', score: 86 },
      { skill: 'SQL Architecture', score: 84 },
      { skill: 'ETL Pipeline Design', score: 82 },
    ],
    developmentGaps: [
      { skill: 'Informatica API Manager', score: 65 },
    ],
    status: 'PREPARING',
    voucherCode: 'VOUCH-INF-1204',
    nextAction: 'Final mapping task mock assessment scheduled for Friday.',
  },
  {
    traineeId: 'te-4',
    name: 'Pavithra Annadurai',
    employeeId: 'EMP004',
    avatarInitials: 'PA',
    bootcampName: 'Power BI & DAX Intelligence',
    targetTrack: 'BA',
    bestCertificationId: 'cert-dp700',
    examCode: 'DP-700',
    certificationTitle: 'Fabric Data Engineer Associate',
    product: 'Microsoft Fabric',
    provider: 'Microsoft',
    matchScore: 95,
    readinessScore: 93,
    readinessLevel: 'READY TO SCHEDULE',
    strongEvidence: [
      { skill: 'Power BI Analytics', score: 92 },
      { skill: 'DAX Modeling', score: 90 },
      { skill: 'SQL Architecture', score: 88 },
    ],
    developmentGaps: [],
    status: 'PASSED',
    examDate: '2026-08-28',
    credentialDate: '2026-08-28',
    credentialId: 'MS-CERT-990142',
    validUntil: '2027-08-28',
    validityStatus: 'ACTIVE',
    nextAction: 'Active Credential issued. Certificate available in drawer.',
  },
  {
    traineeId: 'te-5',
    name: 'Madhan Raj',
    employeeId: 'EMP005',
    avatarInitials: 'MR',
    bootcampName: 'Data Engineering Cohort',
    targetTrack: 'DE',
    bestCertificationId: 'cert-dp750',
    examCode: 'DP-750',
    certificationTitle: 'Databricks Certified Data Engineer Associate',
    product: 'Azure Databricks',
    provider: 'Databricks',
    matchScore: 94,
    readinessScore: 91,
    readinessLevel: 'READY TO SCHEDULE',
    strongEvidence: [
      { skill: 'Databricks Architecture', score: 92 },
      { skill: 'Python Automation', score: 90 },
      { skill: 'SQL Architecture', score: 88 },
    ],
    developmentGaps: [],
    status: 'CERTIFIED',
    examDate: '2026-08-12',
    credentialDate: '2026-08-12',
    credentialId: 'DB-CERT-904812',
    validUntil: '2028-08-12',
    validityStatus: 'ACTIVE',
    nextAction: 'Active Credential. Recommended next step: DP-700 Fabric Data Engineer.',
  },
  {
    traineeId: 'te-6',
    name: 'Sneha Patel',
    employeeId: 'EMP044',
    avatarInitials: 'SP',
    bootcampName: 'ETL & Informatica Mastery',
    targetTrack: 'DE',
    bestCertificationId: 'cert-inf-cdi',
    examCode: 'INF-CDI',
    certificationTitle: 'Informatica Cloud Data Integration Specialist',
    product: 'IDMC / CDI',
    provider: 'Informatica',
    matchScore: 82,
    readinessScore: 80,
    readinessLevel: 'PREPARING',
    strongEvidence: [
      { skill: 'Informatica IDMC', score: 80 },
    ],
    developmentGaps: [],
    status: 'RENEWAL DUE',
    validUntil: '2026-10-12',
    validityStatus: 'EXPIRING SOON',
    nextAction: 'Certification expires in 39 days. Issue recertification voucher.',
  },
];

export const certificationIntelligenceService = {
  // 1. Get Certification Catalog
  getCertificationCatalog: (): CertificationCatalogItem[] => {
    return CERTIFICATION_CATALOG;
  },

  // 2. Get Partnerships
  getPartnerships: (): PartnershipItem[] => {
    return PARTNERSHIP_SEED;
  },

  // 3. Get Management Requests
  getManagementRequests: (): ManagementRequestItem[] => {
    return MANAGEMENT_REQUESTS_SEED;
  },

  // 4. Get Quota Items
  getQuotaItems: (): QuotaItem[] => {
    return QUOTA_SEED;
  },

  // 5. Get Resources & Vouchers
  getResources: (): CertificationResourceItem[] => {
    return RESOURCES_SEED;
  },

  // 6. Get Certified Talent Gallery (Search & Filter Support)
  getCertifiedTalent: (filter?: { provider?: string; cert?: string; track?: string; status?: string; validity?: string; search?: string }): CertifiedTraineeRecord[] => {
    let list = CERTIFIED_TALENT_SEED;

    if (filter) {
      if (filter.provider && filter.provider !== 'All') {
        list = list.filter((c) => c.provider.toLowerCase() === filter.provider?.toLowerCase());
      }
      if (filter.cert && filter.cert !== 'All') {
        list = list.filter((c) => c.examCode === filter.cert || c.certificationTitle.toLowerCase().includes(filter.cert?.toLowerCase() || ''));
      }
      if (filter.track && filter.track !== 'All') {
        list = list.filter((c) => c.track === filter.track);
      }
      if (filter.status && filter.status !== 'All') {
        list = list.filter((c) => c.status === filter.status);
      }
      if (filter.validity && filter.validity !== 'All') {
        list = list.filter((c) => c.status === filter.validity);
      }
      if (filter.search && filter.search.trim()) {
        const query = filter.search.toLowerCase().trim();
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.employeeId.toLowerCase().includes(query) ||
            c.certificationTitle.toLowerCase().includes(query) ||
            c.examCode.toLowerCase().includes(query)
        );
      }
    }

    return list;
  },

  // 7. Get Certification Recommendations & Tracker
  getCertificationRecommendations: (traineeId?: string): TraineeCertificationRecommendation[] => {
    if (traineeId) {
      return RECOMMENDATIONS_SEED.filter((r) => r.traineeId === traineeId);
    }
    return RECOMMENDATIONS_SEED;
  },

  getCertificationTracker: () => {
    return RECOMMENDATIONS_SEED;
  },

  // 8. Get Specific Trainee Readiness Breakdown
  getCertificationReadiness: (traineeId: string, certId: string) => {
    const rec = RECOMMENDATIONS_SEED.find((r) => r.traineeId === traineeId) || RECOMMENDATIONS_SEED[0];
    const catalogItem = CERTIFICATION_CATALOG.find((c) => c.id === certId) || CERTIFICATION_CATALOG[0];

    const categoryBreakdown = [
      { category: 'SQL Architecture (Assessment)', score: 86, status: 'READY' },
      { category: 'Python / PySpark Dataflows', score: 82, status: 'READY' },
      { category: 'Platform Governance & Cloud', score: 68, status: 'DEVELOPING' },
      { category: 'Assessment Score (30%)', score: 85, status: 'READY' },
      { category: 'Trainer Rating Evidence', score: 88, status: 'READY' },
    ];

    return {
      traineeId: rec.traineeId,
      name: rec.name,
      employeeId: rec.employeeId,
      avatarInitials: rec.avatarInitials,
      certificationId: catalogItem.id,
      examCode: catalogItem.examCode,
      certificationTitle: catalogItem.title,
      product: catalogItem.product,
      matchScore: rec.matchScore,
      overallReadinessScore: rec.readinessScore,
      readinessLevel: rec.readinessLevel,
      status: rec.status,
      categoryBreakdown,
      recommendedActionPlan: [
        'Complete platform governance & cloud security lab',
        'Finish 2 practical mock exam drills',
        'Pass 1 timed certification practice test',
        'Maintain overall readiness above 80% threshold',
      ],
    };
  },

  // 9. Centralized Certification Copilot Resolver (Zero Contradictions & Pure Application Data)
  askCertificationCopilot: (queryText: string): CertificationCopilotResult => {
    const textLower = queryText.toLowerCase();

    // Query: Informatica certified resources (Management Question)
    if (textLower.includes('informatica')) {
      const infTalent = CERTIFIED_TALENT_SEED.filter((c) => c.provider === 'Informatica');
      return {
        question: queryText,
        headline: `${infTalent.length} INFORMATICA CERTIFIED RESOURCES FOUND`,
        summaryText: `Discovered ${infTalent.length} active Informatica Cloud Data Integration (INF-CDI) certified employees in company records.`,
        results: infTalent.map((c, idx) => ({
          rank: idx + 1,
          traineeName: c.name,
          employeeId: c.employeeId,
          avatarInitials: c.avatarInitials,
          examCode: c.examCode,
          score: c.score,
          scoreLabel: 'Credential Score',
          statusBadge: c.status,
          evidence: [`Certified Date: ${c.certifiedDate}`, `Credential ID: ${c.credentialId}`, `Valid Until: ${c.validUntil}`],
          gapAction: 'Available for immediate project deployment or management reporting.',
        })),
      };
    }

    // Query: Databricks certified resources
    if (textLower.includes('databricks')) {
      const dbTalent = CERTIFIED_TALENT_SEED.filter((c) => c.provider === 'Databricks');
      return {
        question: queryText,
        headline: `${dbTalent.length} DATABRICKS CERTIFIED RESOURCES FOUND`,
        summaryText: `Found ${dbTalent.length} Databricks Data Engineer (DP-750) certified resource.`,
        results: dbTalent.map((c, idx) => ({
          rank: idx + 1,
          traineeName: c.name,
          employeeId: c.employeeId,
          avatarInitials: c.avatarInitials,
          examCode: c.examCode,
          score: c.score,
          scoreLabel: 'Credential Score',
          statusBadge: c.status,
          evidence: [`Certified Date: ${c.certifiedDate}`, `Credential ID: ${c.credentialId}`],
          gapAction: 'Active Credential in Databricks Lakehouse architecture.',
        })),
      };
    }

    // Query: Microsoft partnership gap
    if (textLower.includes('microsoft') || textLower.includes('partner') || textLower.includes('gap')) {
      const msPart = PARTNERSHIP_SEED.find((p) => p.provider === 'Microsoft') || PARTNERSHIP_SEED[0];
      return {
        question: queryText,
        headline: `MICROSOFT PARTNERSHIP GAP: ${msPart.gapCount} RESOURCES REQUIRED`,
        summaryText: `Current Microsoft certified count is ${msPart.certifiedCount} / ${msPart.requiredCount}. 3 preparing candidates can fill this gap before ${msPart.deadline}.`,
        results: [
          {
            rank: 1,
            traineeName: 'Saran Mani',
            employeeId: 'EMP002',
            avatarInitials: 'SM',
            examCode: 'DP-600',
            score: 87,
            scoreLabel: 'Readiness',
            statusBadge: 'EXAM SCHEDULED',
            evidence: ['Exam Date: 18 Sept 2026', 'Readiness: 87%'],
            gapAction: 'Passes in 2 weeks to fulfill partnership requirement.',
          },
        ],
      };
    }

    // Query: Expire / Expirations
    if (textLower.includes('expire') || textLower.includes('expiry') || textLower.includes('renewal')) {
      const expiring = CERTIFIED_TALENT_SEED.filter((c) => c.status === 'EXPIRING SOON');
      return {
        question: queryText,
        headline: `${expiring.length} CERTIFICATIONS EXPIRING WITHIN 90 DAYS`,
        summaryText: `Monitoring active certificates nearing validity expiration date.`,
        results: expiring.map((c, idx) => ({
          rank: idx + 1,
          traineeName: c.name,
          employeeId: c.employeeId,
          avatarInitials: c.avatarInitials,
          examCode: c.examCode,
          score: c.expiryDaysRemaining,
          scoreLabel: 'Days Remaining',
          statusBadge: 'EXPIRING SOON',
          evidence: [`Valid Until: ${c.validUntil}`, `Credential ID: ${c.credentialId}`],
          gapAction: 'Start Renewal Plan & issue recertification voucher.',
        })),
      };
    }

    // Default Fallback: Top Certification Candidates
    const topReady = RECOMMENDATIONS_SEED.filter((r) => r.readinessScore >= 80);
    return {
      question: queryText,
      headline: 'TOP CERTIFICATION CANDIDATES',
      summaryText: 'Candidates exceeding the 80% certification readiness threshold.',
      results: topReady.map((r, idx) => ({
        rank: idx + 1,
        traineeName: r.name,
        employeeId: r.employeeId,
        avatarInitials: r.avatarInitials,
        examCode: r.examCode,
        score: r.readinessScore,
        scoreLabel: 'Readiness',
        statusBadge: r.readinessLevel,
        evidence: r.strongEvidence.map((e) => `${e.skill}: ${e.score}%`),
        gapAction: r.nextAction,
      })),
    };
  },
};
