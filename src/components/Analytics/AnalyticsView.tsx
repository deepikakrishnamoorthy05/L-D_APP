import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowRight,
  X,
  Trophy,
  Rocket,
  Target,
} from 'lucide-react';
import { useTrainees } from '../../context/TraineeContext';
import { useBootcamps } from '../../context/BootcampContext';
import { Trainee, CompanyOutcome, LearningStatus } from '../../types/trainee';

interface AnalyticsViewProps {
  onNavigateToCommandCenter?: () => void;
}

// ----------------------------------------------------
// WEIGHTED OVERALL SCORE CALCULATION
// Formula: Assessment*0.30 + Attendance*0.15 + TrainingCompletion*0.15 + SkillReadiness*0.20 + TrainerFeedback*0.10 + ProjectReadiness*0.10
// ----------------------------------------------------
export const calculateWeightedScore = (trainee: Trainee): number => {
  const assessmentScore = trainee.avgScorePercent || 80;
  const attendanceScore = trainee.attendancePercent || 90;
  const completionScore = trainee.progressPercent || 75;

  let skillReadinessScore = 82;
  if (trainee.learningStatus === 'Project Ready') skillReadinessScore = 95;
  else if (trainee.learningStatus === 'Needs Attention') skillReadinessScore = 65;
  else if (trainee.learningStatus === 'At Risk') skillReadinessScore = 50;

  const trainerFeedbackScore = 88; // ~4.4/5
  const projectReadinessScore = trainee.learningStatus === 'Project Ready' ? 96 : 74;

  const weighted =
    assessmentScore * 0.30 +
    attendanceScore * 0.15 +
    completionScore * 0.15 +
    skillReadinessScore * 0.20 +
    trainerFeedbackScore * 0.10 +
    projectReadinessScore * 0.10;

  return Math.min(100, Math.max(0, Math.round(weighted)));
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = () => {
  const { trainees } = useTrainees();
  const { bootcamps } = useBootcamps();

  // TOP SEGMENTED SWITCH: 'overall' | 'individual'
  const [activeTab, setActiveTab] = useState<'overall' | 'individual'>('overall');

  // OVERALL DASHBOARD FILTERS
  const [filterYear, setFilterYear] = useState<string>('2026');
  const [filterBootcamp, setFilterBootcamp] = useState<string>('All');
  const [filterTrack, setFilterTrack] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // INDIVIDUAL DASHBOARD TRAINEE SELECTOR
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(
    trainees.length > 0 ? trainees[0].id : ''
  );
  const [traineeSearchQuery, setTraineeSearchQuery] = useState<string>('');
  const [executiveDetail, setExecutiveDetail] = useState<
    null | 'skills' | 'cohorts' | 'performers' | 'ready' | 'attention'
  >(null);

  // FILTERED TRAINEES COMPUTATION FOR OVERALL VIEW
  const filteredTrainees = useMemo(() => {
    return trainees.filter((t) => {
      if (filterBootcamp !== 'All' && t.bootcampName !== filterBootcamp && t.bootcampId !== filterBootcamp) {
        return false;
      }
      if (filterTrack !== 'All' && t.primaryDomain !== filterTrack) {
        return false;
      }
      if (filterStatus !== 'All' && t.learningStatus !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [trainees, filterBootcamp, filterTrack, filterStatus]);

  // RESET FILTERS HANDLER
  const handleResetFilters = () => {
    setFilterYear('2026');
    setFilterBootcamp('All');
    setFilterTrack('All');
    setFilterStatus('All');
  };

  // OVERALL METRICS COMPUTATIONS
  const totalCount = filteredTrainees.length;
  const completedCount = filteredTrainees.filter(
    (t) => t.progressPercent >= 80 || t.enrollmentStatus === 'Completed'
  ).length;
  const projectReadyCount = filteredTrainees.filter((t) => t.learningStatus === 'Project Ready').length;
  const selectedCount = filteredTrainees.filter((t) => t.companyOutcome === 'Selected').length;
  const pendingCount = filteredTrainees.filter((t) => t.companyOutcome === 'Pending' || !t.companyOutcome).length;
  const notSelectedCount = filteredTrainees.filter((t) => t.companyOutcome === 'Not Selected').length;
  const conversionRate = totalCount > 0 ? ((selectedCount / totalCount) * 100).toFixed(1) : '0.0';
  const certReadyCount = filteredTrainees.filter(
    (t) => (t.certificationsCount ?? 0) >= 1 || t.avgScorePercent >= 85
  ).length;
  const needAttentionCount = filteredTrainees.filter(
    (t) => t.learningStatus === 'Needs Attention' || t.learningStatus === 'At Risk'
  ).length;

  const avgAssessment = useMemo(() => {
    if (filteredTrainees.length === 0) return 0;
    const sum = filteredTrainees.reduce((acc, t) => acc + (t.avgScorePercent || 0), 0);
    return Math.round(sum / filteredTrainees.length);
  }, [filteredTrainees]);

  const avgAttendance = useMemo(() => {
    if (filteredTrainees.length === 0) return 0;
    const sum = filteredTrainees.reduce((acc, t) => acc + (t.attendancePercent || 0), 0);
    return Math.round(sum / filteredTrainees.length);
  }, [filteredTrainees]);

  const avgCompletion = useMemo(() => {
    if (filteredTrainees.length === 0) return 0;
    const sum = filteredTrainees.reduce((acc, t) => acc + (t.progressPercent || 0), 0);
    return Math.round(sum / filteredTrainees.length);
  }, [filteredTrainees]);

  // TOP 5 OVERALL PERFORMERS
  const topPerformers = useMemo(() => {
    return [...filteredTrainees]
      .sort((a, b) => calculateWeightedScore(b) - calculateWeightedScore(a))
      .slice(0, 5);
  }, [filteredTrainees]);

  // COMPANY SELECTED TALENT LIST
  const selectedTalentList = useMemo(() => {
    return filteredTrainees.filter((t) => t.companyOutcome === 'Selected');
  }, [filteredTrainees]);

  // ATTENTION NEEDED LIST
  const attentionList = useMemo(() => {
    return filteredTrainees.filter(
      (t) => t.learningStatus === 'Needs Attention' || t.learningStatus === 'At Risk'
    );
  }, [filteredTrainees]);

  const projectReadyList = useMemo(
    () => filteredTrainees.filter((t) => t.learningStatus === 'Project Ready'),
    [filteredTrainees]
  );

  const skillPerformance = [
    { skill: 'SQL', score: 86, status: 'Strong' },
    { skill: 'Python', score: 82, status: 'Strong' },
    { skill: 'PySpark', score: 78, status: 'Proficient' },
    { skill: 'Databricks', score: 74, status: 'Proficient' },
    { skill: 'dbt', score: 71, status: 'Proficient' },
    { skill: 'Snowflake', score: 76, status: 'Proficient' },
    { skill: 'Power BI', score: 84, status: 'Strong' },
    { skill: 'Data Modeling', score: 79, status: 'Proficient' },
    { skill: 'Problem Solving', score: 69, status: 'Developing' },
    { skill: 'Communication', score: 81, status: 'Strong' },
  ];

  const cohortPerformance = useMemo(() => bootcamps.map((b) => {
    const cohortTrainees = filteredTrainees.filter((t) => t.bootcampName === b.name || t.bootcampId === b.id);
    const cohortTotal = cohortTrainees.length;
    const average = (field: 'avgScorePercent' | 'attendancePercent' | 'progressPercent') => cohortTotal > 0
      ? Math.round(cohortTrainees.reduce((sum, trainee) => sum + (trainee[field] || 0), 0) / cohortTotal)
      : 0;
    const ready = cohortTrainees.filter((t) => t.learningStatus === 'Project Ready').length;
    const selected = cohortTrainees.filter((t) => t.companyOutcome === 'Selected').length;
    return {
      id: b.id,
      name: b.name,
      total: cohortTotal,
      assessment: average('avgScorePercent'),
      attendance: average('attendancePercent'),
      completion: average('progressPercent'),
      ready,
      selected,
      conversion: cohortTotal > 0 ? Math.round((selected / cohortTotal) * 100) : 0,
    };
  }), [bootcamps, filteredTrainees]);

  // INDIVIDUAL VIEW: CURRENT SELECTED TRAINEE
  const currentTrainee = useMemo(() => {
    return trainees.find((t) => t.id === selectedTraineeId) || trainees[0] || null;
  }, [trainees, selectedTraineeId]);

  // SELECTOR DROPDOWN FILTERED LIST
  const selectorTraineesList = useMemo(() => {
    if (!traineeSearchQuery.trim()) return trainees;
    const q = traineeSearchQuery.toLowerCase();
    return trainees.filter(
      (t) => t.name.toLowerCase().includes(q) || t.employeeId.toLowerCase().includes(q)
    );
  }, [trainees, traineeSearchQuery]);

  // Helper for initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="analytics-workspace-root">
      {/* HEADER & TOP SEGMENTED SWITCH */}
      <div className="analytics-header-card">
        <div>
          <div className="analytics-eyebrow">
            <BarChart2 size={15} /> L&amp;D Performance &amp; Executive Outcomes
          </div>
          <h1 className="analytics-main-title">Analytics Intelligence</h1>
        </div>

        {/* SEGMENTED TAB SWITCH */}
        <div className="analytics-view-switch">
          <button
            type="button"
            className={`analytics-tab-btn ${activeTab === 'overall' ? 'active' : ''}`}
            onClick={() => setActiveTab('overall')}
          >
            <TrendingUp size={14} /> Overall Performance
          </button>
          <button
            type="button"
            className={`analytics-tab-btn ${activeTab === 'individual' ? 'active' : ''}`}
            onClick={() => setActiveTab('individual')}
          >
            <Users size={14} /> Individual Performance
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1 — OVERALL PERFORMANCE DASHBOARD                                   */}
      {/* ========================================================================= */}
      {activeTab === 'overall' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="analytics-view-body"
        >
          {/* TOP FILTER BAR */}
          <div className="analytics-filters-bar">
            <div className="analytics-filter-controls">
              <span className="analytics-filter-lbl">
                <Filter size={13} /> Filters:
              </span>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="analytics-filter-select"
              >
                <option value="2026">Year: 2026</option>
                <option value="2025">Year: 2025</option>
                <option value="All">Year: All</option>
              </select>

              <select
                value={filterBootcamp}
                onChange={(e) => setFilterBootcamp(e.target.value)}
                className="analytics-filter-select"
              >
                <option value="All">Program: All</option>
                {bootcamps.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={filterTrack}
                onChange={(e) => setFilterTrack(e.target.value)}
                className="analytics-filter-select"
              >
                <option value="All">Track: All</option>
                <option value="SQL Architecture">SQL Architecture</option>
                <option value="Python & Data Pipelines">Python &amp; Data Pipelines</option>
                <option value="Power BI & Analytics">Power BI &amp; Analytics</option>
                <option value="Azure & Databricks">Azure &amp; Databricks</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="analytics-filter-select"
              >
                <option value="All">Status: All</option>
                <option value="Project Ready">Project Ready</option>
                <option value="On Track">On Track</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="analytics-reset-btn"
            >
              <RefreshCw size={12} /> Reset Filters
            </button>
          </div>

          {/* TOP EXECUTIVE KPI ROW (7 ALIGNED CARDS IN ONE ROW AT DESKTOP) */}
          <div className="analytics-kpi-grid">
            {/* 1. TOTAL TRAINEES */}
            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">TOTAL TRAINEES</span>
              <div className="analytics-kpi-value">{totalCount}</div>
              <span className="analytics-kpi-sub">Trainees enrolled</span>
            </div>

            {/* 2. TRAINING COMPLETED */}
            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">TRAINING COMPLETED</span>
              <div className="analytics-kpi-value text-emerald">{completedCount}</div>
              <span className="analytics-kpi-sub text-emerald">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}% completion
              </span>
            </div>

            {/* 3. PROJECT READY */}
            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">PROJECT READY</span>
              <div className="analytics-kpi-value text-cyan">{projectReadyCount}</div>
              <span className="analytics-kpi-sub text-cyan">Ready for deployment</span>
            </div>

            {/* 4. COMPANY SELECTED */}
            <div className="analytics-kpi-card highlight">
              <span className="analytics-kpi-label text-teal">COMPANY SELECTED</span>
              <div className="analytics-kpi-value text-teal">{selectedCount}</div>
              <span className="analytics-kpi-sub text-teal">Selected / absorbed</span>
            </div>

            {/* 5. CONVERSION RATE */}
            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">CONVERSION RATE</span>
              <div className="analytics-kpi-value text-teal">{conversionRate}%</div>
              <span className="analytics-kpi-sub">Training-to-company</span>
            </div>

            {/* 6. CERTIFICATION READY */}
            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">CERT READY</span>
              <div className="analytics-kpi-value text-indigo">{certReadyCount}</div>
              <span className="analytics-kpi-sub text-indigo">Ready for Microsoft</span>
            </div>

            {/* 7. NEED ATTENTION */}
            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">NEED ATTENTION</span>
              <div className="analytics-kpi-value text-amber">{needAttentionCount}</div>
              <span className="analytics-kpi-sub text-amber">Support required</span>
            </div>
          </div>

          <div className="executive-analytics-summary">
            <div className="executive-primary-grid">
              <section className="analytics-panel executive-card">
                <div className="panel-hdr-group">
                  <h3 className="panel-title">Training Outcome</h3>
                  <p className="panel-sub">Progress from enrollment to workforce selection</p>
                </div>
                <div className="executive-outcome-list">
                  {[
                    { label: 'Enrolled', value: totalCount, percent: 100 },
                    { label: 'Completed', value: completedCount, percent: totalCount ? (completedCount / totalCount) * 100 : 0 },
                    { label: 'Project Ready', value: projectReadyCount, percent: totalCount ? (projectReadyCount / totalCount) * 100 : 0 },
                    { label: 'Company Selected', value: selectedCount, percent: totalCount ? (selectedCount / totalCount) * 100 : 0 },
                  ].map((stage) => (
                    <div key={stage.label} className="executive-outcome-row">
                      <div><span>{stage.label}</span><strong>{stage.value}</strong></div>
                      <div className="executive-progress-track"><span style={{ width: `${stage.percent}%` }} /></div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="analytics-panel executive-card">
                <div className="panel-hdr-group">
                  <h3 className="panel-title">Performance Snapshot</h3>
                  <p className="panel-sub">Key learning and readiness indicators</p>
                </div>
                <div className="executive-metric-grid">
                  {[
                    ['Average Assessment', `${avgAssessment}%`],
                    ['Attendance', `${avgAttendance}%`],
                    ['Completion', `${avgCompletion}%`],
                    ['Trainer Feedback', '4.4 / 5'],
                    ['Certification Ready', certReadyCount],
                    ['Need Attention', needAttentionCount],
                  ].map(([label, value]) => (
                    <div key={label} className="executive-metric-tile"><span>{label}</span><strong>{value}</strong></div>
                  ))}
                </div>
              </section>
            </div>

            <div className="executive-secondary-grid">
              <section className="analytics-panel executive-card executive-snapshot-card">
                <div className="panel-hdr-group">
                  <h3 className="panel-title">Skill Snapshot</h3>
                  <p className="panel-sub">Organization-wide strengths and priority</p>
                </div>
                <div className="executive-snapshot-list">
                  <div><span>Strongest Skill</span><strong>SQL <em>86%</em></strong></div>
                  <div><span>Strong Skills</span><strong>Power BI <em>84%</em> &nbsp; Python <em>82%</em></strong></div>
                  <div><span>Development Priority</span><strong>Problem Solving <em>69%</em></strong></div>
                </div>
                <button type="button" className="executive-link-button" onClick={() => setExecutiveDetail('skills')}>
                  View Full Skill Analysis <ArrowRight size={14} />
                </button>
              </section>

              <section className="analytics-panel executive-card executive-cohort-card">
                <div className="panel-hdr-group">
                  <h3 className="panel-title">Cohort Performance</h3>
                  <p className="panel-sub">Top active cohorts at a glance</p>
                </div>
                <div className="executive-cohort-list">
                  {cohortPerformance.slice(0, 3).map((cohort) => (
                    <div key={cohort.id} className="executive-cohort-row">
                      <div><strong>{cohort.name}</strong><span>{cohort.total} trainees · {cohort.ready} project ready</span></div>
                      <b>{cohort.assessment}%</b>
                    </div>
                  ))}
                </div>
                <button type="button" className="executive-link-button" onClick={() => setExecutiveDetail('cohorts')}>
                  View All Cohorts <ArrowRight size={14} />
                </button>
              </section>
            </div>

            <section className="analytics-panel executive-talent-section">
              <div className="panel-hdr-group">
                <h3 className="panel-title">Talent Overview</h3>
                <p className="panel-sub">Open a focused people analytics view</p>
              </div>
              <div className="executive-talent-grid">
                {[
                  { key: 'performers' as const, title: 'Top Performers', count: topPerformers.length, icon: <Trophy size={18} /> },
                  { key: 'ready' as const, title: 'Project Ready', count: projectReadyCount, icon: <Rocket size={18} /> },
                  { key: 'attention' as const, title: 'Need Attention', count: needAttentionCount, icon: <Target size={18} /> },
                ].map((item) => (
                  <button key={item.key} type="button" className="executive-talent-card" onClick={() => setExecutiveDetail(item.key)}>
                    <span className="executive-talent-icon">{item.icon}</span>
                    <span><strong>{item.title}</strong><small>{item.count} trainees</small></span>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="analytics-legacy-overall-content" aria-hidden="true">
          {/* SECTION 1 & 2: OUTCOME FUNNEL & COMPANY CONVERSION ANALYSIS */}
          <div className="analytics-dashboard-grid">
            {/* SECTION 1 — TRAINING OUTCOME FUNNEL (SPAN 8) */}
            <div className="analytics-panel col-span-8">
              <div className="panel-hdr-group">
                <h3 className="panel-title">Training Outcome Funnel</h3>
                <p className="panel-sub">
                  Progressive conversion flow from enrollment to company workforce selection
                </p>
              </div>

              {/* FUNNEL STAGES */}
              <div className="analytics-funnel-stack">
                <div className="funnel-stage-row">
                  <div className="funnel-meta">
                    <span className="funnel-lbl">Enrolled Trainees</span>
                    <span className="funnel-val">{totalCount} trainees &bull; 100%</span>
                  </div>
                  <div className="funnel-bar-bg">
                    <div className="funnel-bar-fill f1" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="funnel-stage-row">
                  <div className="funnel-meta">
                    <span className="funnel-lbl">Active Learning</span>
                    <span className="funnel-val">{totalCount} trainees &bull; 100%</span>
                  </div>
                  <div className="funnel-bar-bg">
                    <div className="funnel-bar-fill f2" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="funnel-stage-row">
                  <div className="funnel-meta">
                    <span className="funnel-lbl">Foundation Completed</span>
                    <span className="funnel-val">
                      {completedCount} trainees &bull;{' '}
                      {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                    </span>
                  </div>
                  <div className="funnel-bar-bg">
                    <div
                      className="funnel-bar-fill f3"
                      style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="funnel-stage-row">
                  <div className="funnel-meta">
                    <span className="funnel-lbl">Project Ready</span>
                    <span className="funnel-val">
                      {projectReadyCount} trainees &bull;{' '}
                      {totalCount > 0 ? Math.round((projectReadyCount / totalCount) * 100) : 0}%
                    </span>
                  </div>
                  <div className="funnel-bar-bg">
                    <div
                      className="funnel-bar-fill f4"
                      style={{ width: `${totalCount > 0 ? (projectReadyCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="funnel-stage-row highlight">
                  <div className="funnel-meta">
                    <span className="funnel-lbl text-teal font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Selected by Company
                    </span>
                    <span className="funnel-val text-teal font-bold">
                      {selectedCount} trainees &bull; {conversionRate}%
                    </span>
                  </div>
                  <div className="funnel-bar-bg highlight">
                    <div
                      className="funnel-bar-fill f5"
                      style={{ width: `${totalCount > 0 ? (selectedCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="funnel-stage-row">
                  <div className="funnel-meta">
                    <span className="funnel-lbl">Certified Talent</span>
                    <span className="funnel-val">
                      {certReadyCount} trainees &bull;{' '}
                      {totalCount > 0 ? Math.round((certReadyCount / totalCount) * 100) : 0}%
                    </span>
                  </div>
                  <div className="funnel-bar-bg">
                    <div
                      className="funnel-bar-fill f6"
                      style={{ width: `${totalCount > 0 ? (certReadyCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2 — COMPANY CONVERSION ANALYSIS (SPAN 4) */}
            <div className="analytics-panel col-span-4 flex-col justify-between">
              <div>
                <div className="panel-hdr-group">
                  <h3 className="panel-title">Training &rarr; Company Conversion</h3>
                  <p className="panel-sub">Workforce absorption telemetry</p>
                </div>

                <div className="conversion-big-badge">
                  <span className="big-val">{conversionRate}%</span>
                  <span className="big-lbl">Overall Company Conversion</span>
                </div>

                <div className="conversion-breakdown-grid">
                  <div className="breakdown-tile bg-teal-sub font-bold text-teal">
                    <span className="b-val">{selectedCount}</span>
                    <span className="b-lbl">Selected</span>
                  </div>
                  <div className="breakdown-tile">
                    <span className="b-val">{pendingCount}</span>
                    <span className="b-lbl">Pending</span>
                  </div>
                  <div className="breakdown-tile">
                    <span className="b-val">{notSelectedCount}</span>
                    <span className="b-lbl">Not Selected</span>
                  </div>
                </div>
              </div>

              <div className="conversion-sub-strip">
                <span className="strip-lbl">Project-Ready &rarr; Selected Rate</span>
                <strong className="strip-val">
                  {projectReadyCount > 0 ? Math.round((selectedCount / projectReadyCount) * 100) : 0}%
                </strong>
              </div>
            </div>
          </div>

          {/* SECTION 3 — BATCH / COHORT PERFORMANCE TABLE */}
          <div className="analytics-panel margin-b">
            <div className="panel-hdr-group">
              <h3 className="panel-title">Batch / Cohort Performance</h3>
              <p className="panel-sub">Cross-bootcamp performance metrics comparison</p>
            </div>

            <div className="table-responsive-container">
              <table className="analytics-data-table">
                <thead>
                  <tr>
                    <th>Cohort Name</th>
                    <th>Trainees</th>
                    <th>Avg Assessment</th>
                    <th>Attendance</th>
                    <th>Completion %</th>
                    <th>Project Ready</th>
                    <th>Company Selected</th>
                    <th>Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {bootcamps.map((b) => {
                    const bTrainees = filteredTrainees.filter(
                      (t) => t.bootcampName === b.name || t.bootcampId === b.id
                    );
                    const bTotal = bTrainees.length;
                    const bAvgAssess =
                      bTotal > 0
                        ? Math.round(bTrainees.reduce((acc, t) => acc + (t.avgScorePercent || 0), 0) / bTotal)
                        : 0;
                    const bAvgAtt =
                      bTotal > 0
                        ? Math.round(bTrainees.reduce((acc, t) => acc + (t.attendancePercent || 0), 0) / bTotal)
                        : 0;
                    const bAvgComp =
                      bTotal > 0
                        ? Math.round(bTrainees.reduce((acc, t) => acc + (t.progressPercent || 0), 0) / bTotal)
                        : 0;
                    const bReady = bTrainees.filter((t) => t.learningStatus === 'Project Ready').length;
                    const bSelected = bTrainees.filter((t) => t.companyOutcome === 'Selected').length;
                    const bConvRate = bTotal > 0 ? Math.round((bSelected / bTotal) * 100) : 0;

                    return (
                      <tr key={b.id}>
                        <td className="font-bold flex-name">
                          <span className="dot-indicator" /> {b.name}
                        </td>
                        <td className="font-bold">{bTotal}</td>
                        <td>{bAvgAssess}%</td>
                        <td>{bAvgAtt}%</td>
                        <td>{bAvgComp}%</td>
                        <td className="text-cyan font-bold">{bReady}</td>
                        <td className="text-teal font-bold">{bSelected}</td>
                        <td className="text-teal font-bold">{bConvRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4 & 5: PERFORMANCE DISTRIBUTION & OVERALL SCORECARD */}
          <div className="analytics-dashboard-grid">
            {/* SECTION 4 — PERFORMANCE DISTRIBUTION (SPAN 6) */}
            <div className="analytics-panel col-span-6">
              <div className="panel-hdr-group">
                <h3 className="panel-title">Performance Distribution</h3>
                <p className="panel-sub">Trainee learning status categorization</p>
              </div>

              <div className="distrib-stack">
                <div className="distrib-row">
                  <div className="distrib-meta">
                    <span className="text-cyan font-bold">&bull; Project Ready</span>
                    <span>
                      {projectReadyCount} ({totalCount > 0 ? Math.round((projectReadyCount / totalCount) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="distrib-bar-bg">
                    <div
                      className="distrib-bar-fill bg-cyan"
                      style={{ width: `${totalCount > 0 ? (projectReadyCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="distrib-row">
                  <div className="distrib-meta">
                    <span className="text-teal font-bold">&bull; On Track</span>
                    <span>
                      {filteredTrainees.filter((t) => t.learningStatus === 'On Track').length} (
                      {totalCount > 0
                        ? Math.round(
                            (filteredTrainees.filter((t) => t.learningStatus === 'On Track').length / totalCount) * 100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="distrib-bar-bg">
                    <div
                      className="distrib-bar-fill bg-teal"
                      style={{
                        width: `${
                          totalCount > 0
                            ? (filteredTrainees.filter((t) => t.learningStatus === 'On Track').length / totalCount) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="distrib-row">
                  <div className="distrib-meta">
                    <span className="text-amber font-bold">&bull; Needs Attention</span>
                    <span>
                      {filteredTrainees.filter((t) => t.learningStatus === 'Needs Attention').length} (
                      {totalCount > 0
                        ? Math.round(
                            (filteredTrainees.filter((t) => t.learningStatus === 'Needs Attention').length / totalCount) *
                              100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="distrib-bar-bg">
                    <div
                      className="distrib-bar-fill bg-amber"
                      style={{
                        width: `${
                          totalCount > 0
                            ? (filteredTrainees.filter((t) => t.learningStatus === 'Needs Attention').length /
                                totalCount) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="distrib-row">
                  <div className="distrib-meta">
                    <span className="text-rose font-bold">&bull; At Risk</span>
                    <span>
                      {filteredTrainees.filter((t) => t.learningStatus === 'At Risk').length} (
                      {totalCount > 0
                        ? Math.round(
                            (filteredTrainees.filter((t) => t.learningStatus === 'At Risk').length / totalCount) * 100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="distrib-bar-bg">
                    <div
                      className="distrib-bar-fill bg-rose"
                      style={{
                        width: `${
                          totalCount > 0
                            ? (filteredTrainees.filter((t) => t.learningStatus === 'At Risk').length / totalCount) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5 — OVERALL SCORECARD (SPAN 6) */}
            <div className="analytics-panel col-span-6 flex-col justify-between">
              <div>
                <div className="panel-hdr-group">
                  <h3 className="panel-title">Overall Scorecard</h3>
                  <p className="panel-sub">Core platform aggregate metrics</p>
                </div>

                <div className="scorecard-2x2-grid">
                  <div className="scorecard-tile">
                    <span className="sc-lbl">AVERAGE ASSESSMENT</span>
                    <strong className="sc-val text-teal">{avgAssessment}%</strong>
                  </div>

                  <div className="scorecard-tile">
                    <span className="sc-lbl">AVERAGE ATTENDANCE</span>
                    <strong className="sc-val text-cyan">{avgAttendance}%</strong>
                  </div>

                  <div className="scorecard-tile">
                    <span className="sc-lbl">AVERAGE COMPLETION</span>
                    <strong className="sc-val text-emerald">{avgCompletion}%</strong>
                  </div>

                  <div className="scorecard-tile">
                    <span className="sc-lbl">TRAINER FEEDBACK</span>
                    <strong className="sc-val text-amber">4.4 / 5</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6 — SKILL PERFORMANCE */}
          <div className="analytics-panel margin-b">
            <div className="panel-hdr-group">
              <h3 className="panel-title">Organization Skill Performance</h3>
              <p className="panel-sub">Core competency mastery across all active trainees</p>
            </div>

            <div className="skills-2col-grid">
              {[
                { skill: 'SQL', score: 86, status: 'Strong' },
                { skill: 'Python', score: 82, status: 'Strong' },
                { skill: 'PySpark', score: 78, status: 'Proficient' },
                { skill: 'Databricks', score: 74, status: 'Proficient' },
                { skill: 'dbt', score: 71, status: 'Proficient' },
                { skill: 'Snowflake', score: 76, status: 'Proficient' },
                { skill: 'Power BI', score: 84, status: 'Strong' },
                { skill: 'Data Modeling', score: 79, status: 'Proficient' },
                { skill: 'Problem Solving', score: 69, status: 'Developing' },
                { skill: 'Communication', score: 81, status: 'Strong' },
              ].map((item) => (
                <div key={item.skill} className="skill-item-card">
                  <div className="skill-item-hdr">
                    <span className="skill-name">{item.skill}</span>
                    <div className="skill-score-group">
                      <span className="skill-val">{item.score}%</span>
                      <span className={`skill-status-tag ${item.status.toLowerCase()}`}>{item.status}</span>
                    </div>
                  </div>
                  <div className="skill-bar-bg">
                    <div className="skill-bar-fill" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7 & 8: COMPANY-SELECTED TALENT & TOP PERFORMERS */}
          <div className="analytics-dashboard-grid">
            {/* SECTION 7 — COMPANY-SELECTED TALENT (SPAN 6) */}
            <div className="analytics-panel col-span-6">
              <div className="panel-hdr-flex">
                <div>
                  <h3 className="panel-title">Selected Talent</h3>
                  <p className="panel-sub">Trainees absorbed into company workforce</p>
                </div>
                <span className="pill-count-badge text-teal">{selectedTalentList.length} Selected</span>
              </div>

              <div className="scrollable-talent-list">
                {selectedTalentList.map((t) => (
                  <div key={t.id} className="talent-row-card">
                    <div className="talent-user-info">
                      <div className="avatar-circle">{getInitials(t.name)}</div>
                      <div>
                        <strong className="t-name">{t.name}</strong>
                        <span className="t-sub">
                          {t.employeeId} &bull; {t.bootcampName}
                        </span>
                      </div>
                    </div>

                    <div className="talent-outcome font-bold">
                      <span className="badge-selected">
                        <CheckCircle2 size={11} /> SELECTED
                      </span>
                      <span className="t-score font-bold">Score: {calculateWeightedScore(t)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 8 — TOP 5 OVERALL PERFORMERS (SPAN 6) */}
            <div className="analytics-panel col-span-6">
              <div className="panel-hdr-group">
                <h3 className="panel-title">Top 5 Overall Performers</h3>
                <p className="panel-sub">Ranked by weighted multi-signal performance index</p>
              </div>

              <div className="top-performers-list">
                {topPerformers.map((t, idx) => (
                  <div key={t.id} className="performer-row-card">
                    <div className="performer-user-info">
                      <span className="rank-badge">0{idx + 1}</span>
                      <div className="avatar-circle">{getInitials(t.name)}</div>
                      <div>
                        <strong className="p-name">{t.name}</strong>
                        <span className="p-sub">{t.bootcampName}</span>
                      </div>
                    </div>

                    <div className="performer-score-block">
                      <strong className="p-score">{calculateWeightedScore(t)}%</strong>
                      <span className="p-outcome">{t.companyOutcome || 'Pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 9 — L&D ATTENTION CENTER */}
          <div className="analytics-panel">
            <div className="panel-hdr-flex">
              <div>
                <h3 className="panel-title">L&amp;D Attention Center</h3>
                <p className="panel-sub">Trainees requiring targeted intervention</p>
              </div>
              <span className="pill-count-badge text-amber">{attentionList.length} Trainees</span>
            </div>

            <div className="table-responsive-container">
              <table className="analytics-data-table">
                <thead>
                  <tr>
                    <th>Trainee</th>
                    <th>Primary Gap</th>
                    <th>Current Score</th>
                    <th>Status</th>
                    <th>Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attentionList.map((t) => (
                    <tr key={t.id}>
                      <td className="font-bold flex-name">
                        <div className="avatar-circle small">{getInitials(t.name)}</div>
                        {t.name}
                      </td>
                      <td className="text-amber font-semibold">Databricks &amp; PySpark</td>
                      <td className="font-bold">{t.avgScorePercent}%</td>
                      <td>
                        <span className="status-badge amber">{t.learningStatus}</span>
                      </td>
                      <td>Assign Databricks practical optimization lab</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>

          {executiveDetail && (
            <div className="executive-detail-backdrop" role="presentation" onMouseDown={() => setExecutiveDetail(null)}>
              <section className="executive-detail-panel" role="dialog" aria-modal="true" aria-label="Analytics detail" onMouseDown={(event) => event.stopPropagation()}>
                <div className="executive-detail-header">
                  <div>
                    <span>ANALYTICS DETAIL</span>
                    <h2>{executiveDetail === 'skills' ? 'Full Skill Analysis' : executiveDetail === 'cohorts' ? 'Cohort Performance' : executiveDetail === 'performers' ? 'Top 5 Overall Performers' : executiveDetail === 'ready' ? 'Project-Ready Trainees' : 'L&D Attention Center'}</h2>
                  </div>
                  <button type="button" onClick={() => setExecutiveDetail(null)} aria-label="Close analytics detail"><X size={18} /></button>
                </div>

                <div className="executive-detail-body">
                  {executiveDetail === 'skills' && (
                    <div className="skills-2col-grid">
                      {skillPerformance.map((item) => (
                        <div key={item.skill} className="skill-item-card">
                          <div className="skill-item-hdr"><span className="skill-name">{item.skill}</span><div className="skill-score-group"><span className="skill-val">{item.score}%</span><span className={`skill-status-tag ${item.status.toLowerCase()}`}>{item.status}</span></div></div>
                          <div className="skill-bar-bg"><div className="skill-bar-fill" style={{ width: `${item.score}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {executiveDetail === 'cohorts' && (
                    <div className="table-responsive-container"><table className="analytics-data-table"><thead><tr><th>Cohort</th><th>Trainees</th><th>Assessment</th><th>Attendance</th><th>Completion</th><th>Project Ready</th><th>Selected</th><th>Conversion</th></tr></thead><tbody>{cohortPerformance.map((cohort) => <tr key={cohort.id}><td className="font-bold">{cohort.name}</td><td>{cohort.total}</td><td>{cohort.assessment}%</td><td>{cohort.attendance}%</td><td>{cohort.completion}%</td><td>{cohort.ready}</td><td>{cohort.selected}</td><td>{cohort.conversion}%</td></tr>)}</tbody></table></div>
                  )}

                  {(executiveDetail === 'performers' || executiveDetail === 'ready') && (
                    <div className="executive-people-list">
                      {(executiveDetail === 'performers' ? topPerformers : projectReadyList).map((trainee, index) => (
                        <div key={trainee.id} className="executive-person-row">
                          <div className="executive-person-main">{executiveDetail === 'performers' && <span className="rank-badge">0{index + 1}</span>}<div className="avatar-circle">{getInitials(trainee.name)}</div><div><strong>{trainee.name}</strong><span>{trainee.employeeId}</span><small>{trainee.bootcampName}</small></div></div>
                          <div className="executive-person-score"><strong>{calculateWeightedScore(trainee)}%</strong><span>{trainee.companyOutcome || trainee.learningStatus}</span></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {executiveDetail === 'attention' && (
                    <div className="table-responsive-container"><table className="analytics-data-table"><thead><tr><th>Trainee</th><th>Primary Gap</th><th>Current Score</th><th>Status</th><th>Recommended Action</th></tr></thead><tbody>{attentionList.map((trainee) => <tr key={trainee.id}><td><div className="executive-table-person"><div className="avatar-circle small">{getInitials(trainee.name)}</div><span><strong>{trainee.name}</strong><small>{trainee.employeeId}</small></span></div></td><td>Databricks &amp; PySpark</td><td>{trainee.avgScorePercent}%</td><td><span className="status-badge amber">{trainee.learningStatus}</span></td><td>Assign Databricks practical optimization lab</td></tr>)}</tbody></table></div>
                  )}
                </div>
              </section>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2 — INDIVIDUAL PERFORMANCE ANALYSIS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'individual' && currentTrainee && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="analytics-view-body"
        >
          {/* TRAINEE SELECTOR BAR */}
          <div className="analytics-selector-bar">
            <div className="selector-title">
              <Search size={14} /> Select Trainee:
            </div>

            <div className="selector-controls">
              <input
                type="text"
                placeholder="Search name or ID..."
                value={traineeSearchQuery}
                onChange={(e) => setTraineeSearchQuery(e.target.value)}
                className="analytics-search-input"
              />

              <select
                value={selectedTraineeId}
                onChange={(e) => setSelectedTraineeId(e.target.value)}
                className="analytics-filter-select font-bold"
              >
                {selectorTraineesList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.employeeId}) &bull; {t.bootcampName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* INDIVIDUAL HEADER */}
          <div className="individual-header-card">
            <div className="individual-user-flex">
              <div className="individual-avatar">{getInitials(currentTrainee.name)}</div>
              <div>
                <h2 className="ind-name">{currentTrainee.name}</h2>
                <div className="ind-meta-line">
                  <strong>{currentTrainee.employeeId}</strong> &bull; {currentTrainee.bootcampName} &bull;{' '}
                  {currentTrainee.primaryDomain}
                </div>
              </div>
            </div>

            <div className="individual-badges-flex">
              <span className="status-badge teal">● {currentTrainee.learningStatus}</span>
              <span
                className={`status-badge ${
                  currentTrainee.companyOutcome === 'Selected'
                    ? 'emerald'
                    : currentTrainee.companyOutcome === 'Not Selected'
                    ? 'rose'
                    : 'amber'
                }`}
              >
                ● {currentTrainee.companyOutcome || 'Pending'}
              </span>
            </div>
          </div>

          {/* INDIVIDUAL KPI ROW (6 CARDS) */}
          <div className="analytics-kpi-grid cols-6">
            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">OVERALL SCORE</span>
              <div className="analytics-kpi-value text-teal">{calculateWeightedScore(currentTrainee)}%</div>
            </div>

            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">ASSESSMENT AVG</span>
              <div className="analytics-kpi-value text-cyan">{currentTrainee.avgScorePercent}%</div>
            </div>

            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">ATTENDANCE</span>
              <div className="analytics-kpi-value text-emerald">{currentTrainee.attendancePercent}%</div>
            </div>

            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">COMPLETION</span>
              <div className="analytics-kpi-value text-teal">{currentTrainee.progressPercent}%</div>
            </div>

            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">SKILL READINESS</span>
              <div className="analytics-kpi-value text-indigo">
                {currentTrainee.learningStatus === 'Project Ready' ? '92%' : '84%'}
              </div>
            </div>

            <div className="analytics-kpi-card">
              <span className="analytics-kpi-label">TRAINER RATING</span>
              <div className="analytics-kpi-value text-amber">4.5 / 5</div>
            </div>
          </div>

          {/* PERFORMANCE TREND & SKILL PROFILE */}
          <div className="analytics-dashboard-grid">
            <div className="analytics-panel col-span-6">
              <div className="panel-hdr-group">
                <h3 className="panel-title">Performance Trend Over Time</h3>
                <p className="panel-sub">Module-by-module score progression</p>
              </div>

              <div className="distrib-stack">
                {[
                  { module: 'Module 1: Fundamentals', score: currentTrainee.avgScorePercent - 4 },
                  { module: 'Module 2: Core Architecture', score: currentTrainee.avgScorePercent },
                  { module: 'Module 3: Advanced Dataflows', score: currentTrainee.avgScorePercent + 2 },
                  { module: 'Module 4: Capstone Project', score: currentTrainee.avgScorePercent + 5 },
                ].map((m) => (
                  <div key={m.module} className="distrib-row">
                    <div className="distrib-meta">
                      <span>{m.module}</span>
                      <span className="font-bold text-teal">{m.score}%</span>
                    </div>
                    <div className="distrib-bar-bg">
                      <div className="distrib-bar-fill bg-teal" style={{ width: `${m.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-panel col-span-6">
              <div className="panel-hdr-group">
                <h3 className="panel-title">Skill Profile vs Cohort Average</h3>
                <p className="panel-sub">Direct competency score comparison</p>
              </div>

              <div className="skills-2col-grid">
                {[
                  { skill: 'SQL', traineeScore: currentTrainee.avgScorePercent + 3, cohortAvg: 82 },
                  { skill: 'Python', traineeScore: currentTrainee.avgScorePercent, cohortAvg: 79 },
                  { skill: 'Databricks', traineeScore: currentTrainee.avgScorePercent - 5, cohortAvg: 74 },
                  { skill: 'Communication', traineeScore: 85, cohortAvg: 80 },
                ].map((item) => (
                  <div key={item.skill} className="skill-item-card">
                    <div className="skill-item-hdr">
                      <span className="skill-name">{item.skill}</span>
                      <div className="skill-score-group">
                        <span className="text-teal font-bold">Trainee: {item.traineeScore}%</span>
                        <span className="text-sub font-semibold">Cohort: {item.cohortAvg}%</span>
                      </div>
                    </div>
                    <div className="skill-bar-bg">
                      <div className="skill-bar-fill" style={{ width: `${item.traineeScore}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STRENGTHS & DEVELOPMENT AREAS */}
          <div className="analytics-dashboard-grid">
            <div className="analytics-panel col-span-6">
              <h3 className="panel-title text-teal flex items-center gap-2">
                <CheckCircle2 size={16} /> Key Strengths
              </h3>
              <ul className="bullet-list">
                <li>Strong SQL &amp; relational database architecture skills</li>
                <li>Consistent session attendance ({currentTrainee.attendancePercent}%)</li>
                <li>Proactive participation in peer coding labs</li>
              </ul>
            </div>

            <div className="analytics-panel col-span-6">
              <h3 className="panel-title text-amber flex items-center gap-2">
                <AlertCircle size={16} /> Development Areas
              </h3>
              <ul className="bullet-list">
                <li>Databricks Delta Lake optimization requires additional hands-on practice</li>
                <li>Advanced PySpark memory management</li>
              </ul>
              <div className="recommendation-box">
                <strong>Recommended Action:</strong> Complete Databricks optimization practical lab.
              </div>
            </div>
          </div>

          {/* COMPANY OUTCOME & COHORT COMPARISON */}
          <div className="analytics-dashboard-grid">
            <div className="analytics-panel col-span-6 highlight-outcome">
              <h3 className="panel-title">Company Outcome</h3>
              <div className="outcome-pill-container">
                <span
                  className={`status-badge large ${
                    currentTrainee.companyOutcome === 'Selected'
                      ? 'emerald'
                      : currentTrainee.companyOutcome === 'Not Selected'
                      ? 'rose'
                      : 'amber'
                  }`}
                >
                  ● {currentTrainee.companyOutcome || 'PENDING'}
                </span>
              </div>

              {currentTrainee.selectionDetails && (
                <div className="selection-details-card">
                  <div>
                    <strong>Target Team:</strong> {currentTrainee.selectionDetails.department || 'Data Engineering'}
                  </div>
                  <div>
                    <strong>Assigned Project:</strong> {currentTrainee.selectionDetails.project || 'Azure Databricks Migration'}
                  </div>
                </div>
              )}
            </div>

            <div className="analytics-panel col-span-6">
              <h3 className="panel-title">Cohort Comparison</h3>
              <table className="analytics-data-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Trainee</th>
                    <th>Cohort Avg</th>
                    <th>Delta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold">Assessment</td>
                    <td className="font-bold">{currentTrainee.avgScorePercent}%</td>
                    <td>82%</td>
                    <td className="text-teal font-bold">+{currentTrainee.avgScorePercent - 82}%</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Attendance</td>
                    <td className="font-bold">{currentTrainee.attendancePercent}%</td>
                    <td>89%</td>
                    <td className="text-teal font-bold">+{currentTrainee.attendancePercent - 89}%</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Completion</td>
                    <td className="font-bold">{currentTrainee.progressPercent}%</td>
                    <td>84%</td>
                    <td className="text-teal font-bold">+{currentTrainee.progressPercent - 84}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI PERFORMANCE INTELLIGENCE NARRATIVE */}
          <div className="analytics-panel ai-summary-panel">
            <div className="ai-summary-hdr">
              AI Performance Intelligence Summary
            </div>
            <p className="ai-summary-text">
              "{currentTrainee.name} demonstrates strong overall capability ({calculateWeightedScore(currentTrainee)}% weighted index) with above-cohort assessment ({currentTrainee.avgScorePercent}%) and attendance ({currentTrainee.attendancePercent}%) performance in the {currentTrainee.bootcampName} program. Databricks optimization remains the primary technical development area. Current readiness indicates high suitability for client project deployment."
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
