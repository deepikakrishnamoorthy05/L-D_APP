import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Mail,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Building,
  Check,
  Target,
  Clock,
  Sparkles,
  Layers,
  User,
  ShieldAlert,
  BadgeCheck,
  Compass,
  Cpu,
  GitBranch,
} from 'lucide-react';
import { useTrainees } from '../../context/TraineeContext';
import { useAssessments } from '../../context/AssessmentContext';
import { useSessions } from '../../context/SessionContext';
import { useBootcamps } from '../../context/BootcampContext';
import { Trainee, LearningStatus } from '../../types/trainee';
import { AddTraineeModal } from './AddTraineeModal';
import { AnimatedCounter } from '../Common/AnimatedCounter';
import { ProgressBar } from '../ui/ProgressBar';

interface TraineeProfileProps {
  traineeId: string;
  initialTab?: string;
  onBack: () => void;
}

export const TraineeProfile: React.FC<TraineeProfileProps> = ({
  traineeId,
  initialTab = 'overview',
  onBack,
}) => {
  const { trainees } = useTrainees();
  const { getTraineeAssessmentStats } = useAssessments();
  const { getTraineeAttendanceStats } = useSessions();
  const { bootcamps } = useBootcamps();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hoveredRoadmapNode, setHoveredRoadmapNode] = useState<string | null>(null);

  const trainee: Trainee = trainees.find((t) => t.id === traineeId) || trainees[0];
  const assessmentStats = getTraineeAssessmentStats(trainee.id);
  const attendanceStats = getTraineeAttendanceStats(trainee.id);
  const matchedBootcamp = bootcamps.find((b) => b.id === trainee.bootcampId) || bootcamps[0];

  // Compute initials fallback
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'TR';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Status Badge Rendering
  const renderStatusBadge = (status: LearningStatus) => {
    switch (status) {
      case 'Project Ready':
        return (
          <span className="status-badge-refined ready">
            <CheckCircle2 size={13} /> Project Ready
          </span>
        );
      case 'On Track':
        return (
          <span className="status-badge-refined on-track">
            <span className="badge-dot" /> On Track
          </span>
        );
      case 'Needs Attention':
        return (
          <span className="status-badge-refined attention">
            <AlertTriangle size={13} /> Needs Attention
          </span>
        );
      case 'At Risk':
        return (
          <span className="status-badge-refined risk">
            <AlertTriangle size={13} /> At Risk
          </span>
        );
    }
  };

  const tabsList = [
    { id: 'overview', label: 'Passport' },
    { id: 'progress', label: 'Learning Progress' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'projects', label: 'Projects' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'skills', label: 'Skill Matrix' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="page-container trainee-profile-redesign"
    >
      {/* 1. TOP COMMAND BAR */}
      <div className="profile-command-bar">
        <button
          type="button"
          className="hero-action-compact-btn"
          onClick={onBack}
        >
          <ArrowLeft size={16} /> Back to Trainees
        </button>

        <button
          type="button"
          className="hero-action-compact-btn edit"
          onClick={() => setShowEditModal(true)}
        >
          <Edit size={14} /> Edit Profile
        </button>
      </div>

      {/* 2. PROFILE HERO (EMPLOYEE IDENTITY + LEARNING STATUS PANEL) */}
      <section className="profile-hero-composite">
        {/* LEFT: EMPLOYEE IDENTITY (90px + minmax) */}
        <div className="hero-identity-composite">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 1.5 }}
            transition={{ duration: 0.2 }}
            className="profile-avatar-84-wrapper"
          >
            {trainee.avatar ? (
              <img src={trainee.avatar} alt={trainee.name} className="profile-avatar-84-img" />
            ) : (
              <div className="profile-avatar-84-initials">
                {getInitials(trainee.name)}
              </div>
            )}
            <span
              className="hero-presence-dot-lg"
              style={{
                backgroundColor:
                  trainee.learningStatus === 'Project Ready' || trainee.learningStatus === 'On Track'
                    ? '#10B981'
                    : trainee.learningStatus === 'Needs Attention'
                    ? '#F59E0B'
                    : '#EF4444',
              }}
            />
          </motion.div>

          <div className="identity-composite-details">
            <div className="flex items-center gap-3">
              <h1 className="profile-title-name">{trainee.name}</h1>
              <span className="code-chip lg">{trainee.employeeId}</span>
            </div>

            <div className="identity-email-subtext mt-1">
              <Mail size={13} /> {trainee.email}
            </div>

            <div className="identity-tags-line mt-3 flex items-center gap-2 flex-wrap">
              <span className="dept-pill"><Building size={13} /> {trainee.department || 'Data & Analytics'}</span>
              <span className="role-pill">{trainee.role || 'Associate Data Engineer'}</span>
              {renderStatusBadge(trainee.learningStatus)}
            </div>
          </div>
        </div>

        {/* RIGHT: LEARNING STATUS PANEL */}
        <div className="hero-status-panel-composite">
          <div className="panel-header-top flex items-center justify-between">
            <span className="panel-badge-label"><Compass size={13} /> CURRENT LEARNING JOURNEY</span>
            <span className="code-chip">{matchedBootcamp?.code || 'DE-B-2026'}</span>
          </div>

          <h3 className="panel-cohort-title">{trainee.bootcampName}</h3>

          <div className="panel-mini-grid mt-2">
            <div className="p-cell">
              <span className="p-label">PROGRAM TYPE</span>
              <span className="p-val font-semibold">{matchedBootcamp?.bootcampType || 'Bootcamp'} • {matchedBootcamp?.bootcampYear || 2026}</span>
            </div>
            <div className="p-cell">
              <span className="p-label">CURRENT STAGE</span>
              <span className="p-val font-semibold text-teal-600">Common Foundation</span>
            </div>
            <div className="p-cell">
              <span className="p-label">LEAD TRAINER</span>
              <span className="p-val font-semibold">{trainee.primaryTrainerName || matchedBootcamp?.primaryTrainerName || 'Sarah David'}</span>
            </div>
            <div className="p-cell">
              <span className="p-label">TRACK ALLOCATION</span>
              <span className="p-val font-semibold">{trainee.primaryTech || 'SQL & Data Warehousing'}</span>
            </div>
          </div>

          <div className="panel-progress-footer mt-3">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Current Journey Progress</span>
              <span className="text-teal-600">{trainee.progressPercent}%</span>
            </div>
            <ProgressBar value={trainee.progressPercent} color="cyan" height={6} />
          </div>
        </div>
      </section>

      {/* 3. KPI METRIC CARDS ROW (4 EQUAL CARDS) */}
      <section className="kpi-cards-grid grid-4-cols">
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="metric-card-3d cyan-tint"
        >
          <div className="card-top-row">
            <span className="metric-label">OVERALL PROGRESS</span>
            <div className="metric-icon-box cyan">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-val-large">
            <AnimatedCounter value={trainee.progressPercent} />%
          </div>
          <div className="metric-sub-bar mt-2">
            <ProgressBar value={trainee.progressPercent} color="cyan" height={5} />
            <span className="metric-subtext mt-1 block">Learning completion</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="metric-card-3d indigo-tint"
        >
          <div className="card-top-row">
            <span className="metric-label">ATTENDANCE</span>
            <div className="metric-icon-box indigo">
              <Calendar size={18} />
            </div>
          </div>
          <div className="metric-val-large">
            <AnimatedCounter value={trainee.attendancePercent} />%
          </div>
          <div className="metric-sub-bar mt-2">
            <ProgressBar value={trainee.attendancePercent} color="indigo" height={5} />
            <span className="metric-subtext mt-1 block">Session attendance</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="metric-card-3d green-tint"
        >
          <div className="card-top-row">
            <span className="metric-label">AVERAGE SCORE</span>
            <div className="metric-icon-box green">
              <Award size={18} />
            </div>
          </div>
          <div className="metric-val-large">
            <AnimatedCounter value={assessmentStats.averageScore || trainee.avgScorePercent} />%
          </div>
          <div className="metric-sub-bar mt-2">
            <ProgressBar value={assessmentStats.averageScore || trainee.avgScorePercent} color="green" height={5} />
            <span className="metric-subtext mt-1 block">Assessment average</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="metric-card-3d amber-tint"
        >
          <div className="card-top-row">
            <span className="metric-label">PROJECT READINESS</span>
            <div className="metric-icon-box amber">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="metric-val-large text-sm font-extrabold mt-2">
            {trainee.learningStatus}
          </div>
          <span className="metric-subtext mt-2 block">Evaluated by L&amp;D Engine</span>
        </motion.div>
      </section>

      {/* 4. PREMIUM FLOATING SEGMENTED TAB NAV BAR */}
      <nav className="profile-tabs-floating-bar">
        {tabsList.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`profile-segmented-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="profileSegmentedActive"
                className="tab-segmented-slider"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="tab-segmented-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* 5. MAIN CONTENT GRID (12-COLUMN ASYMMETRIC GRID) */}
      <AnimatePresence mode="wait">
        {/* PASSPORT OVERVIEW TAB (SPAN 5 / SPAN 7 ROW COMPOSITION) */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="main-12col-content-grid"
          >
            {/* ROW 1 CARD 1: DIGITAL LEARNING PASSPORT (SPAN 5) */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="card-span-5 passport-special-card"
            >
              <div className="passport-holographic-shimmer" />
              <div className="passport-vertical-security-accent" />

              <div className="card-header-line flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="passport-badge-title">DIGITAL LEARNING PASSPORT</span>
                </div>
                <BadgeCheck size={18} className="text-teal-600" />
              </div>

              <div className="passport-identity-strip flex items-center gap-4 py-3 border-y border-teal-900/10">
                <div className="passport-avatar-circle">
                  {getInitials(trainee.name)}
                </div>
                <div>
                  <h3 className="passport-full-name">{trainee.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="code-chip">{trainee.employeeId}</span>
                    <span className="text-xs text-muted font-medium">{trainee.department || 'Data & Analytics'}</span>
                  </div>
                </div>
              </div>

              <div className="passport-details-footer mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Enrolled Bootcamp:</span>
                  <span className="font-bold text-teal-700">{trainee.bootcampName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Current Stage:</span>
                  <span className="font-semibold">Common Foundation</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted">Deployment Status:</span>
                  {renderStatusBadge(trainee.learningStatus)}
                </div>
              </div>
            </motion.div>

            {/* ROW 1 CARD 2: LEARNING JOURNEY ROADMAP (SPAN 7 - INTERACTIVE SVG ROADMAP) */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="card-span-7 roadmap-interactive-card"
            >
              <div className="card-header-line flex items-center justify-between mb-4">
                <h3 className="card-title-text">Learning Journey &amp; Roadmap</h3>
                <span className="code-chip text-xs">Stage 2 of 3 Active</span>
              </div>

              {/* HORIZONTAL ROADMAP WITH SVG CONNECTORS & INTERACTIVE HOVER */}
              <div className="roadmap-stepper-visual">
                {/* STEP 1: SQL */}
                <div
                  className="roadmap-node-step completed"
                  onMouseEnter={() => setHoveredRoadmapNode('sql')}
                  onMouseLeave={() => setHoveredRoadmapNode(null)}
                >
                  <div className="node-icon-circle"><Check size={16} /></div>
                  <span className="node-title font-bold">SQL / T-SQL</span>
                  <span className="node-tag success">Completed ✓</span>
                </div>

                <div className="roadmap-connector-line completed" />

                {/* STEP 2: PYTHON (ACTIVE GLOWING) */}
                <div
                  className="roadmap-node-step active"
                  onMouseEnter={() => setHoveredRoadmapNode('python')}
                  onMouseLeave={() => setHoveredRoadmapNode(null)}
                >
                  <div className="node-icon-circle active-glowing">
                    <span className="glowing-pulse-dot" />
                  </div>
                  <span className="node-title font-bold text-teal-700">Python &amp; PySpark</span>
                  <span className="node-tag active">In Progress (76%)</span>
                </div>

                <div className="roadmap-connector-line active-animated" />

                {/* STEP 3: TRACK ALLOCATION */}
                <div
                  className="roadmap-node-step future"
                  onMouseEnter={() => setHoveredRoadmapNode('track')}
                  onMouseLeave={() => setHoveredRoadmapNode(null)}
                >
                  <div className="node-icon-circle"><GitBranch size={16} /></div>
                  <span className="node-title font-bold">Track Allocation</span>
                  <span className="node-tag muted">Awaiting Allocation</span>
                </div>
              </div>

              {/* SPLIT BRANCHES FOR TRACK ALLOCATION */}
              <div className="roadmap-branches-subrow flex items-center justify-end gap-3 mt-4 pt-3 border-t">
                <span className="text-xs text-muted font-medium">Target Tracks:</span>
                <span className="track-badge-mini">DBT + Snowflake</span>
                <span className="track-badge-mini">Databricks Engineering</span>
              </div>

              {/* HOVER PREVIEW POPOVER */}
              <AnimatePresence>
                {hoveredRoadmapNode && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="roadmap-hover-popover mt-3 p-3 rounded-xl bg-teal-900/5 border border-teal-900/15 text-xs flex items-center justify-between"
                  >
                    {hoveredRoadmapNode === 'sql' && (
                      <>
                        <span><strong>SQL Architecture:</strong> 10/10 Sessions Completed • Lead: John Mathew</span>
                        <span className="font-bold text-emerald-600">88% Assessment</span>
                      </>
                    )}
                    {hoveredRoadmapNode === 'python' && (
                      <>
                        <span><strong>Python &amp; PySpark:</strong> 8/10 Sessions Completed • Lead: Sarah David</span>
                        <span className="font-bold text-teal-600">82% Assessment</span>
                      </>
                    )}
                    {hoveredRoadmapNode === 'track' && (
                      <>
                        <span><strong>Track Allocation:</strong> Planned after Common Foundation evaluation</span>
                        <span className="font-bold text-indigo-600">Scheduled Q2</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ROW 2 CARD 3: EMPLOYEE INFORMATION (SPAN 5 NESTED TILES GRID) */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="card-span-5 nested-tiles-card"
            >
              <h3 className="card-title-text mb-4">Employee Information</h3>
              <div className="nested-tiles-grid-2col">
                <div className="nested-tile">
                  <span className="tile-label">EMPLOYEE ID</span>
                  <span className="tile-val font-bold">{trainee.employeeId}</span>
                </div>
                <div className="nested-tile">
                  <span className="tile-label">FULL NAME</span>
                  <span className="tile-val font-bold">{trainee.name}</span>
                </div>
                <div className="nested-tile">
                  <span className="tile-label">WORK EMAIL</span>
                  <span className="tile-val font-medium text-xs truncate">{trainee.email}</span>
                </div>
                <div className="nested-tile">
                  <span className="tile-label">DEPARTMENT</span>
                  <span className="tile-val font-medium">{trainee.department || 'Data & Analytics'}</span>
                </div>
                <div className="nested-tile">
                  <span className="tile-label">DESIGNATION / ROLE</span>
                  <span className="tile-val font-medium">{trainee.role || 'Associate Data Engineer'}</span>
                </div>
                <div className="nested-tile">
                  <span className="tile-label">JOINING DATE</span>
                  <span className="tile-val font-medium">{trainee.joiningDate || trainee.joinedDate || '2026-01-19'}</span>
                </div>
              </div>
            </motion.div>

            {/* ROW 2 CARD 4: LEARNING ASSIGNMENT (SPAN 7 NESTED TILES GRID + BOTTOM PROGRESS) */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="card-span-7 nested-tiles-card"
            >
              <h3 className="card-title-text mb-4">Learning Assignment Details</h3>
              <div className="nested-tiles-grid-2col">
                <div className="nested-tile">
                  <span className="tile-label">BOOTCAMP COHORT</span>
                  <span className="tile-val font-bold">{trainee.bootcampName}</span>
                </div>
                <div className="nested-tile">
                  <span className="tile-label">PROGRAM CODE</span>
                  <span className="tile-val code-chip">{matchedBootcamp?.code || 'DE-B-2026'}</span>
                </div>
                <div className="nested-tile">
                  <span className="tile-label">PRIMARY TRAINER</span>
                  <span className="tile-val font-semibold text-teal-700">{trainee.primaryTrainerName || matchedBootcamp?.primaryTrainerName || 'Sarah David'}</span>
                </div>
                <div className="nested-tile">
                  <span className="tile-label">CURRENT STAGE</span>
                  <span className="tile-val font-medium">Common Foundation</span>
                </div>
                <div className="nested-tile">
                  <span className="tile-label">PRIMARY TECH TRACK</span>
                  <span className="tile-val font-medium text-teal-600">{trainee.primaryTech || 'SQL & Data Warehousing'}</span>
                </div>
                <div className="nested-tile">
                  <span className="tile-label">ENROLLMENT STATUS</span>
                  <span className="tile-val font-bold">{trainee.enrollmentStatus}</span>
                </div>
              </div>

              {/* FULL-WIDTH VISUAL PROGRESS AT BOTTOM */}
              <div className="full-width-progress-box mt-4 pt-3 border-t">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Bootcamp Completion</span>
                  <span className="text-teal-600">{trainee.progressPercent}%</span>
                </div>
                <ProgressBar value={trainee.progressPercent} color="cyan" height={8} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* OTHER TABS (LEARNING PROGRESS, ASSESSMENTS, ATTENDANCE, ETC.) */}
        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="single-tab-content-wrapper mt-4"
          >
            <div className="nested-tiles-card">
              <h3 className="card-title-text mb-4">Curriculum Module Progress</h3>
              <div className="space-y-4">
                <div className="module-item-card p-4 rounded-xl border bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm">1. SQL &amp; Relational Database Architecture</h4>
                      <span className="text-xs text-muted">Lead Trainer: John Mathew</span>
                    </div>
                    <span className="status-badge-refined ready"><CheckCircle2 size={12} /> Completed</span>
                  </div>
                  <ProgressBar value={100} color="green" height={8} />
                  <div className="flex justify-between text-xs mt-2 font-semibold">
                    <span>10 / 10 Sessions Attended</span>
                    <span>Assessment Score: 88%</span>
                  </div>
                </div>

                <div className="module-item-card p-4 rounded-xl border bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm">2. Python Data Engineering &amp; PySpark</h4>
                      <span className="text-xs text-muted">Lead Trainer: Sarah David</span>
                    </div>
                    <span className="status-badge-refined on-track"><span className="badge-dot" /> In Progress</span>
                  </div>
                  <ProgressBar value={76} color="cyan" height={8} />
                  <div className="flex justify-between text-xs mt-2 font-semibold">
                    <span>8 / 10 Sessions Attended</span>
                    <span>Assessment Score: 82%</span>
                  </div>
                </div>

                <div className="module-item-card p-4 rounded-xl border bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-sm">3. Data Warehousing, Modeling &amp; ETL</h4>
                      <span className="text-xs text-muted">Lead Trainer: Priya Sharma</span>
                    </div>
                    <span className="status-badge-refined attention"><Clock size={12} /> Scheduled</span>
                  </div>
                  <ProgressBar value={0} color="indigo" height={8} />
                  <div className="flex justify-between text-xs mt-2 font-semibold">
                    <span>0 / 8 Sessions Attended</span>
                    <span>Assessment Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ASSESSMENTS */}
        {activeTab === 'assessments' && (
          <motion.div
            key="assessments"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="single-tab-content-wrapper mt-4"
          >
            <div className="kpi-cards-grid grid-4-cols mb-4">
              <div className="metric-card-3d cyan-tint">
                <span className="metric-label">AVERAGE SCORE</span>
                <div className="metric-val-large">{assessmentStats.averageScore}%</div>
              </div>
              <div className="metric-card-3d indigo-tint">
                <span className="metric-label">TESTS COMPLETED</span>
                <div className="metric-val-large">{assessmentStats.completedCount}</div>
              </div>
              <div className="metric-card-3d green-tint">
                <span className="metric-label">PASSED</span>
                <div className="metric-val-large text-green">{assessmentStats.passedCount}</div>
              </div>
              <div className="metric-card-3d amber-tint">
                <span className="metric-label">NEEDS REMEDIATION</span>
                <div className="metric-val-large text-rose">{assessmentStats.failedCount}</div>
              </div>
            </div>

            <div className="trainee-table-wrapper">
              <table className="trainee-enterprise-table">
                <thead>
                  <tr>
                    <th>ASSESSMENT</th>
                    <th>MODULE</th>
                    <th>DATE</th>
                    <th>SCORE</th>
                    <th>RESULT</th>
                    <th>EVALUATOR</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentStats.records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-table-cell text-center py-4">
                        No assessment records found.
                      </td>
                    </tr>
                  ) : (
                    assessmentStats.records.map((r) => (
                      <tr key={r.assessmentId}>
                        <td className="font-bold">{r.assessmentName}</td>
                        <td>{r.moduleName}</td>
                        <td>{r.date}</td>
                        <td className="font-bold">{r.score} / {r.totalMarks} ({r.percentage}%)</td>
                        <td>
                          <span className={`status-badge-refined ${r.result === 'Pass' ? 'ready' : 'risk'}`}>
                            {r.result}
                          </span>
                        </td>
                        <td>{r.evaluatorName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 4: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="single-tab-content-wrapper mt-4"
          >
            <div className="kpi-cards-grid grid-4-cols mb-4">
              <div className="metric-card-3d cyan-tint">
                <span className="metric-label">OVERALL ATTENDANCE</span>
                <div className="metric-val-large">{attendanceStats.attendancePercent}%</div>
              </div>
              <div className="metric-card-3d green-tint">
                <span className="metric-label">SESSIONS ATTENDED</span>
                <div className="metric-val-large">{attendanceStats.attended}</div>
              </div>
              <div className="metric-card-3d amber-tint">
                <span className="metric-label">LATE ARRIVALS</span>
                <div className="metric-val-large">{attendanceStats.late}</div>
              </div>
              <div className="metric-card-3d amber-tint">
                <span className="metric-label">MISSED SESSIONS</span>
                <div className="metric-val-large text-rose">{attendanceStats.missed}</div>
              </div>
            </div>

            <div className="trainee-table-wrapper">
              <table className="trainee-enterprise-table">
                <thead>
                  <tr>
                    <th>SESSION TITLE</th>
                    <th>MODULE</th>
                    <th>DATE</th>
                    <th>ATTENDANCE STATUS</th>
                    <th>REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceStats.records.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-table-cell text-center py-4">
                        No session attendance logs recorded.
                      </td>
                    </tr>
                  ) : (
                    attendanceStats.records.map((rec) => (
                      <tr key={rec.sessionId}>
                        <td className="font-bold">{rec.sessionTitle}</td>
                        <td>{rec.moduleName}</td>
                        <td>{rec.sessionDate}</td>
                        <td>
                          <span className={`status-badge-refined ${rec.status === 'Present' ? 'ready' : rec.status === 'Late' ? 'attention' : 'risk'}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="text-muted-cell">{rec.remarks || 'Standard attendance'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 5: SKILLS TAB */}
        {activeTab === 'skills' && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="single-tab-content-wrapper mt-4"
          >
            <div className="nested-tiles-card">
              <h3 className="card-title-text mb-4">Evaluated Technical Skill Matrix</h3>
              <div className="space-y-4">
                <div className="skill-item-bar">
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span>SQL &amp; Relational Database Architecture</span>
                    <span className="text-teal-600">88%</span>
                  </div>
                  <ProgressBar value={88} color="cyan" height={10} />
                </div>

                <div className="skill-item-bar">
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span>Python &amp; PySpark Data Engineering</span>
                    <span className="text-teal-600">81%</span>
                  </div>
                  <ProgressBar value={81} color="cyan" height={10} />
                </div>

                <div className="skill-item-bar">
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span>Data Warehousing &amp; Dimensional Modeling</span>
                    <span className="text-indigo-600">74%</span>
                  </div>
                  <ProgressBar value={74} color="indigo" height={10} />
                </div>

                <div className="skill-item-bar">
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span>ETL &amp; Data Pipeline Architecture</span>
                    <span className="text-indigo-600">70%</span>
                  </div>
                  <ProgressBar value={70} color="indigo" height={10} />
                </div>

                <div className="skill-item-bar">
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span>Problem Solving &amp; Query Optimization</span>
                    <span className="text-green">85%</span>
                  </div>
                  <ProgressBar value={85} color="green" height={10} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* OTHER TABS */}
        {activeTab !== 'overview' &&
          activeTab !== 'progress' &&
          activeTab !== 'assessments' &&
          activeTab !== 'attendance' &&
          activeTab !== 'skills' && (
            <motion.div
              key="other-tabs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="single-tab-content-wrapper mt-4"
            >
              <div className="nested-tiles-card text-center p-6">
                <h3 className="card-title-text">{tabsList.find((t) => t.id === activeTab)?.label} Records</h3>
                <p className="text-sm text-muted mt-1">
                  Synchronized with L&amp;D Learning Intelligence Engine for {trainee.name}.
                </p>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      {showEditModal && (
        <AddTraineeModal initialData={trainee} onClose={() => setShowEditModal(false)} />
      )}
    </motion.div>
  );
};
