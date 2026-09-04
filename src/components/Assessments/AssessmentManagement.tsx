import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  CheckSquare,
  Award,
  Calendar,
  Users,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle2,
  Copy,
  Archive,
  BarChart2,
  Filter,
  X,
  LayoutGrid,
  List,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Medal,
} from 'lucide-react';
import { useAssessments } from '../../context/AssessmentContext';
import { useBootcamps } from '../../context/BootcampContext';
import { Assessment, AssessmentStatus, AssessmentType } from '../../types/assessment';
import { LearningTrack } from '../../types/session';
import { CreateAssessmentModal } from './CreateAssessmentModal';
import { EnterScoresModal } from './EnterScoresModal';
import { AssessmentDetailsModal } from './AssessmentDetailsModal';
import { AssessmentOrbit } from './AssessmentOrbit';

export const AssessmentManagement: React.FC = () => {
  const {
    assessments,
    publishResults,
    duplicateAssessment,
    archiveAssessment,
  } = useAssessments();

  const { bootcamps } = useBootcamps();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBootcampId, setSelectedBootcampId] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEvaluator, setSelectedEvaluator] = useState('All');

  // Advanced Filter Drawer Expansion State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // View Switcher Mode (Default: Table)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Active Dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [scoreEntryAssessment, setScoreEntryAssessment] = useState<Assessment | null>(null);
  const [detailsAssessment, setDetailsAssessment] = useState<Assessment | null>(null);

  // Unique dataset helpers
  const uniqueModules = Array.from(new Set(assessments.map((a) => a.moduleName)));
  const uniqueYears = Array.from(new Set(assessments.map((a) => a.bootcampYear)));
  const uniqueEvaluators = Array.from(new Set(assessments.map((a) => a.evaluatorName)));

  // KPI Calculations
  const totalAssessments = assessments.length;
  const scheduledCount = assessments.filter(
    (a) => a.status === 'Scheduled' || a.status === 'In Progress' || a.status === 'Draft'
  ).length;
  const completedCount = assessments.filter(
    (a) => a.status === 'Completed' || a.status === 'Published'
  ).length;

  const completedWithAvg = assessments.filter((a) => a.averageScore !== undefined);
  const avgCohortScore =
    completedWithAvg.length > 0
      ? Math.round(
          completedWithAvg.reduce((sum, a) => sum + (a.averageScore || 0), 0) /
            completedWithAvg.length
        )
      : 0;

  const totalNeedAttention = assessments.reduce(
    (sum, a) => sum + (a.needAttentionCount || 0),
    0
  );

  // Deterministic Insight Calculations
  const passRate = 78;
  const topModule = 'SQL / T-SQL';
  const topModuleScore = 82;
  const attentionModule = 'Python Core & OOP';
  const attentionModuleScore = 68;
  const nextAssessmentTitle = 'dbt Transformation';
  const nextAssessmentDate = '12 Mar';

  // Filtering Logic
  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.evaluatorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBootcamp = selectedBootcampId === 'All' || a.bootcampId === selectedBootcampId;
    const matchesYear = selectedYear === 'All' || a.bootcampYear === Number(selectedYear);
    const matchesTrack = selectedTrack === 'All' || a.track === selectedTrack;
    const matchesModule = selectedModule === 'All' || a.moduleName === selectedModule;
    const matchesType = selectedType === 'All' || a.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus;
    const matchesEvaluator = selectedEvaluator === 'All' || a.evaluatorName === selectedEvaluator;

    return (
      matchesSearch &&
      matchesBootcamp &&
      matchesYear &&
      matchesTrack &&
      matchesModule &&
      matchesType &&
      matchesStatus &&
      matchesEvaluator
    );
  });

  const hasActiveFilters =
    selectedBootcampId !== 'All' ||
    selectedYear !== 'All' ||
    selectedTrack !== 'All' ||
    selectedModule !== 'All' ||
    selectedType !== 'All' ||
    selectedStatus !== 'All' ||
    selectedEvaluator !== 'All' ||
    searchTerm.trim() !== '';

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBootcampId('All');
    setSelectedYear('All');
    setSelectedTrack('All');
    setSelectedModule('All');
    setSelectedType('All');
    setSelectedStatus('All');
    setSelectedEvaluator('All');
  };

  // Helper for evaluator initials avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  // Date formatter for consistent "30 Jan 2026"
  const formatDateDisplay = (rawDate: string) => {
    if (!rawDate) return 'TBD';
    const dateObj = new Date(rawDate);
    if (isNaN(dateObj.getTime())) return rawDate;
    return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="assessment-ops-container"
    >
      {/* 1. PAGE HEADER CARD WITH INTERACTIVE ORBIT VISUALIZER */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="asm-header-glass-card"
      >
        {/* LEFT: INTERACTIVE ORBIT VISUALIZER */}
        <div className="hero-section-left hidden md:flex items-center justify-center flex-shrink-0">
          <AssessmentOrbit />
        </div>

        {/* CENTER: EYEBROW BADGE, TITLE, SUBTITLE & METRICS */}
        <div className="header-left-title-group min-w-0 flex-1">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="hero-eyebrow-badge"
          >
            <span>L&amp;D LEARNING OPERATIONS</span>
            <ChevronRight size={12} className="inline" />
            <span>EVALUATIONS</span>
            <ChevronRight size={12} className="inline" />
            <span className="text-teal-600 dark:text-teal-400 font-bold">ASSESSMENTS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.14 }}
            className="header-main-title"
          >
            Assessment Management
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18 }}
            className="header-subtitle-text max-w-2xl"
          >
            Create, evaluate and monitor trainee assessments across learning modules and technology tracks.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.22 }}
            className="header-compact-metrics-row"
          >
            <span className="header-metric-pill">
              <CheckSquare size={13} className="text-teal-600 dark:text-teal-400" />
              <span>Total: <strong>{totalAssessments}</strong></span>
            </span>

            <span className="header-metric-pill">
              <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Avg Score: <strong>{avgCohortScore}%</strong></span>
            </span>

            <span className="header-metric-pill">
              <ShieldCheck size={13} className="text-indigo-600 dark:text-indigo-400" />
              <span>Pass Rate: <strong>{passRate}%</strong></span>
            </span>
          </motion.div>
        </div>

        {/* RIGHT: ENGINE YEAR BADGE & ACTION BUTTON */}
        <div className="header-right-action flex flex-col items-end gap-3 flex-shrink-0">
          <span className="code-chip lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-xl text-xs">
            2026 Evaluation Engine
          </span>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            className="create-asm-primary-btn group"
            onClick={() => {
              setEditingAssessment(null);
              setShowCreateModal(true);
            }}
          >
            <Plus size={16} />
            <span>Create Assessment</span>
          </motion.button>
        </div>
      </motion.header>

      {/* 2. 5 EQUAL KPI CARDS ROW */}
      <div className="asm-kpi-cards-5row">
        {/* KPI 1: Total Assessments */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className="asm-kpi-card-box"
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">TOTAL ASSESSMENTS</span>
            <div className="kpi-icon-badge teal">
              <CheckSquare size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{totalAssessments}</div>
          <span className="kpi-desc-text">All tracks &amp; modules</span>
        </motion.div>

        {/* KPI 2: Scheduled */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className="asm-kpi-card-box"
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">SCHEDULED</span>
            <div className="kpi-icon-badge indigo">
              <Calendar size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{scheduledCount}</div>
          <span className="kpi-desc-text">Active &amp; planned</span>
        </motion.div>

        {/* KPI 3: Completed */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className="asm-kpi-card-box"
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">COMPLETED</span>
            <div className="kpi-icon-badge emerald">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{completedCount}</div>
          <span className="kpi-desc-text">Evaluated &amp; archived</span>
        </motion.div>

        {/* KPI 4: Average Score */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className="asm-kpi-card-box"
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">AVERAGE SCORE</span>
            <div className="kpi-icon-badge amber">
              <Medal size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{avgCohortScore}%</div>
          <div className="mini-score-progress-track">
            <div
              className="mini-score-progress-fill"
              style={{ width: `${Math.min(avgCohortScore, 100)}%` }}
            />
          </div>
          <span className="kpi-desc-text">Overall average mark</span>
        </motion.div>

        {/* KPI 5: Need Attention */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className="asm-kpi-card-box"
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text text-rose">NEED ATTENTION</span>
            <div className="kpi-icon-badge rose">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="kpi-num-display text-rose">{totalNeedAttention}</div>
          <span className="kpi-desc-text">Below passing mark</span>
        </motion.div>
      </div>

      {/* 3. ASSESSMENT INTELLIGENCE INSIGHT CARD */}
      <div className="asm-intelligence-card">
        <div className="intelligence-card-header">
          <h4 className="intelligence-card-title">Assessment Intelligence</h4>
        </div>

        <div className="intelligence-tiles-4grid">
          <div className="insight-tile-box">
            <div className="tile-icon-badge emerald">
              <ShieldCheck size={16} />
            </div>
            <div className="tile-details">
              <span className="tile-lbl">PASS RATE</span>
              <strong className="tile-val">{passRate}%</strong>
            </div>
          </div>

          <div className="insight-tile-box">
            <div className="tile-icon-badge teal">
              <TrendingUp size={16} />
            </div>
            <div className="tile-details">
              <span className="tile-lbl">TOP MODULE</span>
              <strong className="tile-val">{topModule} ({topModuleScore}%)</strong>
            </div>
          </div>

          <div className="insight-tile-box">
            <div className="tile-icon-badge rose">
              <AlertTriangle size={16} />
            </div>
            <div className="tile-details">
              <span className="tile-lbl">ATTENTION AREA</span>
              <strong className="tile-val">{attentionModule} ({attentionModuleScore}%)</strong>
            </div>
          </div>

          <div className="insight-tile-box">
            <div className="tile-icon-badge indigo">
              <Calendar size={16} />
            </div>
            <div className="tile-details">
              <span className="tile-lbl">NEXT ASSESSMENT</span>
              <strong className="tile-val">{nextAssessmentTitle} ({nextAssessmentDate})</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FILTER WORKSPACE CARD */}
      <div className="asm-filter-workspace-card">
        {/* ROW 1: PRIMARY FILTERS GRID */}
        <div className="filter-grid-row-1">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon text-teal-700" />
            <input
              type="text"
              className="asm-search-input-field"
              placeholder="Search assessment, module or evaluator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Bootcamp Filter */}
          <select
            className="asm-select-field"
            value={selectedBootcampId}
            onChange={(e) => setSelectedBootcampId(e.target.value)}
          >
            <option value="All">Bootcamp: All</option>
            {bootcamps.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Track Filter */}
          <select
            className="asm-select-field"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
          >
            <option value="All">Track: All</option>
            <option value="Common Foundation">Common Foundation</option>
            <option value="DBT & Snowflake">DBT &amp; Snowflake</option>
            <option value="Databricks">Databricks</option>
            <option value="Shared">Shared</option>
          </select>

          {/* Status Filter */}
          <select
            className="asm-select-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Published">Published</option>
          </select>

          {/* More Filters Toggle */}
          <button
            type="button"
            className={`more-filters-toggle-btn ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter size={14} />
            <span>More Filters</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                showAdvancedFilters ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Clear Button */}
          <button
            type="button"
            className={`clear-filters-btn ${hasActiveFilters ? 'visible' : ''}`}
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            <X size={14} /> Clear
          </button>
        </div>

        {/* ROW 2: EXPANDABLE ADVANCED FILTERS */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="filter-grid-row-2-drawer"
            >
              <div className="drawer-filters-grid">
                {/* Year Filter */}
                <div className="drawer-select-block">
                  <label className="drawer-select-lbl">Year</label>
                  <select
                    className="asm-select-field w-full"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="All">Year: All</option>
                    {uniqueYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Module Filter */}
                <div className="drawer-select-block">
                  <label className="drawer-select-lbl">Module</label>
                  <select
                    className="asm-select-field w-full"
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                  >
                    <option value="All">Module: All</option>
                    {uniqueModules.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div className="drawer-select-block">
                  <label className="drawer-select-lbl">Type</label>
                  <select
                    className="asm-select-field w-full"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="All">Type: All</option>
                    <option value="Module Test">Module Test</option>
                    <option value="Mock Test">Mock Test</option>
                    <option value="Practical">Practical</option>
                    <option value="Technical Evaluation">Technical Evaluation</option>
                    <option value="Project Evaluation">Project Evaluation</option>
                    <option value="Certification Evaluation">Certification Evaluation</option>
                  </select>
                </div>

                {/* Evaluator Filter */}
                <div className="drawer-select-block">
                  <label className="drawer-select-lbl">Evaluator</label>
                  <select
                    className="asm-select-field w-full"
                    value={selectedEvaluator}
                    onChange={(e) => setSelectedEvaluator(e.target.value)}
                  >
                    <option value="All">Evaluator: All</option>
                    {uniqueEvaluators.map((ev) => (
                      <option key={ev} value={ev}>
                        {ev}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. ASSESSMENT RESULTS CARD (CONTAINING DIRECTORY HEADER & TABLE / CARDS WORKSPACE) */}
      <div className="asm-results-master-card">
        {/* DIRECTORY HEADER ROW INSIDE RESULTS CARD */}
        <div className="directory-header-bar">
          <div className="directory-title-block">
            <h3 className="directory-main-title">Assessment Directory</h3>
            <span className="directory-count-pill">
              {filteredAssessments.length} Assessment{filteredAssessments.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="view-mode-segmented-control">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List size={14} /> Table
            </button>
          </div>
        </div>

        {/* WORKSPACE VIEW: DESKTOP TABLE & MOBILE STACKED CARDS */}
        {viewMode === 'table' ? (
          <>
            {/* DESKTOP TABLE VIEW (DISPLAYED ON LARGER SCREENS) */}
            <div className="table-responsive-wrapper asm-desktop-table-only">
              <table className="asm-fixed-proportional-table">
                <thead>
                  <tr>
                    <th style={{ width: '24%' }}>ASSESSMENT</th>
                    <th style={{ width: '17%' }}>MODULE / TRACK</th>
                    <th style={{ width: '16%' }}>BOOTCAMP</th>
                    <th style={{ width: '9%' }}>DATE</th>
                    <th style={{ width: '11%' }}>EVALUATOR</th>
                    <th style={{ width: '9%' }}>PARTICIPANTS</th>
                    <th style={{ width: '9%' }}>RESULT</th>
                    <th style={{ width: '8%' }}>STATUS</th>
                    <th style={{ width: '7%' }} className="text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="empty-results-cell">
                        <div className="empty-state-content">
                          <CheckSquare size={36} className="text-teal-700 mb-2" />
                          <h4 className="empty-title">No Assessments Found</h4>
                          <p className="empty-desc">
                            No assessment entries match your search criteria. Try resetting active filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAssessments.map((a) => {
                      const bootcampObj = bootcamps.find((b) => b.id === a.bootcampId);
                      const programCode = bootcampObj ? bootcampObj.code : `DE-B-${a.bootcampYear}-B01`;

                      return (
                        <tr key={a.id} className="asm-table-row-item">
                          {/* ASSESSMENT CELL */}
                          <td>
                            <div className="cell-assessment-stack">
                              <strong className="title-text">{a.name}</strong>
                              <span className="subtitle-text">{a.moduleName}</span>
                              <div className="badge-row mt-1">
                                <span className="type-badge-pill">{a.type}</span>
                              </div>
                            </div>
                          </td>

                          {/* MODULE / TRACK CELL */}
                          <td>
                            <div className="cell-module-track-stack">
                              <span className="module-name-text">{a.moduleName}</span>
                              <span className="track-badge-pill">{a.track}</span>
                            </div>
                          </td>

                          {/* BOOTCAMP CELL */}
                          <td>
                            <div className="cell-bootcamp-stack">
                              <span className="bootcamp-name-text">{a.bootcampName}</span>
                              <span className="program-code-text">{programCode}</span>
                            </div>
                          </td>

                          {/* DATE CELL */}
                          <td className="white-space-nowrap">
                            <div className="cell-date-stack">
                              <span className="date-main-text">{formatDateDisplay(a.date)}</span>
                              {a.startTime && (
                                <span className="time-sub-text">
                                  {a.startTime} – {a.endTime || '12:30'}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* EVALUATOR CELL */}
                          <td>
                            <div className="cell-evaluator-flex">
                              <div className="evaluator-avatar-34px">
                                {getInitials(a.evaluatorName)}
                              </div>
                              <span className="evaluator-name-single">{a.evaluatorName}</span>
                            </div>
                          </td>

                          {/* PARTICIPANTS CELL */}
                          <td>
                            <div className="participants-compact-pill">
                              <Users size={13} className="text-teal-700" />
                              <strong>{a.totalParticipants}</strong>
                              <span>Trainees</span>
                            </div>
                          </td>

                          {/* RESULT CELL */}
                          <td>
                            {a.averageScore !== undefined ? (
                              <div className="cell-result-block">
                                <span className="score-percent-num">{a.averageScore}%</span>
                                <div className="result-mini-progress">
                                  <div
                                    className="progress-fill-teal"
                                    style={{ width: `${Math.min(a.averageScore, 100)}%` }}
                                  />
                                </div>
                                <span className="pass-rate-subtext">Pass Rate {passRate}%</span>
                              </div>
                            ) : (
                              <span className="pending-results-chip">
                                <span className="live-dot-amber" /> Pending Results
                              </span>
                            )}
                          </td>

                          {/* STATUS CELL */}
                          <td>
                            <span
                              className={`status-pill-badge ${
                                a.status === 'Completed' || a.status === 'Published'
                                  ? 'completed'
                                  : a.status === 'In Progress'
                                  ? 'in-progress'
                                  : a.status === 'Scheduled'
                                  ? 'scheduled'
                                  : 'draft'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>

                          {/* ACTIONS CELL */}
                          <td className="text-right relative">
                            <div className="action-menu-anchor">
                              <button
                                type="button"
                                className="action-icon-38px-btn"
                                onClick={() => setActiveMenuId(activeMenuId === a.id ? null : a.id)}
                                title="Actions"
                              >
                                <MoreVertical size={16} />
                              </button>

                              <AnimatePresence>
                                {activeMenuId === a.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="action-dropdown-popover-220px"
                                  >
                                    <button
                                      type="button"
                                      className="menu-row-item"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setDetailsAssessment(a);
                                      }}
                                    >
                                      <Eye size={14} /> View Assessment
                                    </button>

                                    <button
                                      type="button"
                                      className="menu-row-item"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setEditingAssessment(a);
                                        setShowCreateModal(true);
                                      }}
                                    >
                                      <Edit size={14} /> Edit Assessment
                                    </button>

                                    <div className="popover-divider" />

                                    <button
                                      type="button"
                                      className="menu-row-item"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setScoreEntryAssessment(a);
                                      }}
                                    >
                                      <CheckCircle2 size={14} /> Enter Scores
                                    </button>

                                    <button
                                      type="button"
                                      className="menu-row-item"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setDetailsAssessment(a);
                                      }}
                                    >
                                      <BarChart2 size={14} /> View Results
                                    </button>

                                    {a.status !== 'Published' && (
                                      <button
                                        type="button"
                                        className="menu-row-item"
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          publishResults(a.id);
                                        }}
                                      >
                                        <CheckSquare size={14} /> Publish Results
                                      </button>
                                    )}

                                    <div className="popover-divider" />

                                    <button
                                      type="button"
                                      className="menu-row-item"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        duplicateAssessment(a.id);
                                      }}
                                    >
                                      <Copy size={14} /> Duplicate
                                    </button>

                                    <button
                                      type="button"
                                      className="menu-row-item danger"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        archiveAssessment(a.id);
                                      }}
                                    >
                                      <Archive size={14} /> Archive
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE STACKED CARDS VIEW (ALWAYS RENDERED ON SMALLER SCREENS) */}
            <div className="asm-mobile-stacked-cards-list">
              {filteredAssessments.length === 0 ? (
                <div className="empty-state-content p-4 text-center">
                  <CheckSquare size={36} className="text-teal-700 mx-auto mb-2" />
                  <h4 className="empty-title">No Assessments Found</h4>
                  <p className="empty-desc">No assessment entries match your search criteria.</p>
                </div>
              ) : (
                filteredAssessments.map((a) => {
                  const bootcampObj = bootcamps.find((b) => b.id === a.bootcampId);
                  const programCode = bootcampObj ? bootcampObj.code : `DE-B-${a.bootcampYear}-B01`;

                  return (
                    <div key={a.id} className="asm-mobile-card-stacked">
                      <div className="card-top-row">
                        <span className="type-badge-pill">{a.type}</span>
                        <span
                          className={`status-pill-badge ${
                            a.status === 'Completed' || a.status === 'Published'
                              ? 'completed'
                              : a.status === 'In Progress'
                              ? 'in-progress'
                              : a.status === 'Scheduled'
                              ? 'scheduled'
                              : 'draft'
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>

                      <h4 className="card-asm-title">{a.name}</h4>
                      <p className="card-asm-subtitle">{a.moduleName}</p>

                      <div className="card-track-badge-row">
                        <span className="track-badge-pill">{a.track}</span>
                      </div>

                      <div className="card-divider" />

                      <div className="card-meta-pairs">
                        <div className="pair-row">
                          <span className="lbl">Bootcamp:</span>
                          <span className="val">{a.bootcampName} ({programCode})</span>
                        </div>
                        <div className="pair-row">
                          <span className="lbl">Date &amp; Time:</span>
                          <span className="val highlight">
                            {formatDateDisplay(a.date)} {a.startTime ? `• ${a.startTime} – ${a.endTime || '12:30'}` : ''}
                          </span>
                        </div>
                        <div className="pair-row">
                          <span className="lbl">Evaluator:</span>
                          <div className="eval-inline">
                            <span className="eval-chip">{getInitials(a.evaluatorName)}</span>
                            <span>{a.evaluatorName}</span>
                          </div>
                        </div>
                        <div className="pair-row">
                          <span className="lbl">Participants:</span>
                          <span className="val"><strong>{a.totalParticipants}</strong> Trainees</span>
                        </div>
                        <div className="pair-row">
                          <span className="lbl">Result:</span>
                          <span className="val">
                            {a.averageScore !== undefined ? (
                              <strong>{a.averageScore}% Avg</strong>
                            ) : (
                              <span className="pending-results-chip">Pending</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="card-footer-action-row">
                        <button
                          type="button"
                          className="card-view-link-btn"
                          onClick={() => setDetailsAssessment(a)}
                        >
                          View Assessment <ArrowRight size={14} />
                        </button>

                        <div className="action-menu-anchor">
                          <button
                            type="button"
                            className="action-icon-38px-btn"
                            onClick={() => setActiveMenuId(activeMenuId === a.id ? null : a.id)}
                            title="Actions"
                          >
                            <MoreVertical size={16} />
                          </button>

                          <AnimatePresence>
                            {activeMenuId === a.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="action-dropdown-popover-220px"
                              >
                                <button
                                  type="button"
                                  className="menu-row-item"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setDetailsAssessment(a);
                                  }}
                                >
                                  <Eye size={14} /> View Assessment
                                </button>

                                <button
                                  type="button"
                                  className="menu-row-item"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setEditingAssessment(a);
                                    setShowCreateModal(true);
                                  }}
                                >
                                  <Edit size={14} /> Edit Assessment
                                </button>

                                <button
                                  type="button"
                                  className="menu-row-item"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setScoreEntryAssessment(a);
                                  }}
                                >
                                  <CheckCircle2 size={14} /> Enter Scores
                                </button>

                                {a.status !== 'Published' && (
                                  <button
                                    type="button"
                                    className="menu-row-item"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      publishResults(a.id);
                                    }}
                                  >
                                    <CheckSquare size={14} /> Publish Results
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="menu-row-item danger"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    archiveAssessment(a.id);
                                  }}
                                >
                                  <Archive size={14} /> Archive
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* CARDS VIEW (3 COLUMNS DESKTOP, 1 COLUMN MOBILE) */
          <div className="cards-grid-3col p-4">
            {filteredAssessments.length === 0 ? (
              <div className="col-span-3 p-5 text-center">
                <CheckSquare size={36} className="text-teal-700 mx-auto mb-2" />
                <h4 className="empty-title">No Assessments Found</h4>
                <p className="empty-desc">No entries match your active search filters.</p>
              </div>
            ) : (
              filteredAssessments.map((a) => {
                const bootcampObj = bootcamps.find((b) => b.id === a.bootcampId);
                const programCode = bootcampObj ? bootcampObj.code : `DE-B-${a.bootcampYear}-B01`;

                return (
                  <motion.div
                    key={a.id}
                    whileHover={{ y: -5, scale: 1.01 }}
                    transition={{ duration: 0.18 }}
                    className="asm-grid-card-shell"
                  >
                    <div className="card-top-row">
                      <span className="type-badge-pill">{a.type}</span>
                      <span
                        className={`status-pill-badge ${
                          a.status === 'Completed' || a.status === 'Published'
                            ? 'completed'
                            : a.status === 'In Progress'
                            ? 'in-progress'
                            : a.status === 'Scheduled'
                            ? 'scheduled'
                            : 'draft'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>

                    <h4 className="card-asm-title">{a.name}</h4>
                    <p className="card-asm-subtitle">{a.moduleName}</p>

                    <div className="card-track-badge-row">
                      <span className="track-badge-pill">{a.track}</span>
                    </div>

                    <div className="card-divider" />

                    <div className="card-meta-pairs">
                      <div className="pair-row">
                        <span className="lbl">Bootcamp:</span>
                        <span className="val">{a.bootcampName} ({programCode})</span>
                      </div>
                      <div className="pair-row">
                        <span className="lbl">Date:</span>
                        <span className="val highlight">{formatDateDisplay(a.date)}</span>
                      </div>
                      <div className="pair-row">
                        <span className="lbl">Evaluator:</span>
                        <div className="eval-inline">
                          <span className="eval-chip">{getInitials(a.evaluatorName)}</span>
                          <span>{a.evaluatorName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-divider" />

                    <div className="card-metrics-strip">
                      <div className="m-box">
                        <strong className="m-num">{a.totalParticipants}</strong>
                        <span className="m-lbl">Trainees</span>
                      </div>
                      <div className="m-box">
                        <strong className="m-num">
                          {a.averageScore !== undefined ? `${a.averageScore}%` : '—'}
                        </strong>
                        <span className="m-lbl">Avg Score</span>
                      </div>
                      <div className="m-box">
                        <strong className="m-num">{passRate}%</strong>
                        <span className="m-lbl">Pass Rate</span>
                      </div>
                    </div>

                    {a.averageScore !== undefined && (
                      <div className="result-mini-progress mt-2">
                        <div
                          className="progress-fill-teal"
                          style={{ width: `${Math.min(a.averageScore, 100)}%` }}
                        />
                      </div>
                    )}

                    <div className="card-footer-action-row">
                      <button
                        type="button"
                        className="card-view-link-btn"
                        onClick={() => setDetailsAssessment(a)}
                      >
                        View Assessment <ArrowRight size={14} />
                      </button>

                      <button
                        type="button"
                        className="action-icon-38px-btn"
                        onClick={() => setActiveMenuId(activeMenuId === a.id ? null : a.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAssessmentModal
          initialData={editingAssessment}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAssessment(null);
          }}
        />
      )}

      {scoreEntryAssessment && (
        <EnterScoresModal
          assessment={scoreEntryAssessment}
          onClose={() => setScoreEntryAssessment(null)}
        />
      )}

      {detailsAssessment && (
        <AssessmentDetailsModal
          assessment={detailsAssessment}
          onClose={() => setDetailsAssessment(null)}
          onOpenEnterScores={() => {
            setScoreEntryAssessment(detailsAssessment);
            setDetailsAssessment(null);
          }}
        />
      )}
    </motion.div>
  );
};
