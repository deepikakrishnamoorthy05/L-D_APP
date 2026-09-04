import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  MessageSquare,
  Star,
  Users,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
  Send,
  UserCheck,
  TrendingUp,
  Clock,
  Mail,
  Award,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { StatusBadge } from '../ui';
import { SessionFeedbackSummary } from '../../types/feedback';
import { AddTrainerFeedbackModal } from './AddTrainerFeedbackModal';
import { ImportTrainerFeedbackModal } from './ImportTrainerFeedbackModal';
import { FeedbackDetailModal } from './FeedbackDetailModal';
import { FeedbackOrbit } from './FeedbackOrbit';

export const FeedbackManagement: React.FC = () => {
  const {
    sessionSummaries,
    participantResponses,
    trainerFeedbacks,
    pendingRequests,
    sendFeedbackReminder,
    simulateAllPendingReminders,
  } = useFeedback();

  // Primary Tab State
  const [activeTab, setActiveTab] = useState<
    'session' | 'trainer' | 'participant' | 'pending' | 'insights'
  >('session');

  // Trainer Feedback Sub-Tab State
  const [trainerFeedbackMode, setTrainerFeedbackMode] = useState<
    'session-level' | 'individual'
  >('session-level');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('2026');
  const [quarterFilter, setQuarterFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [trackFilter, setTrackFilter] = useState('All');
  const [trainerFilter, setTrainerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);

  // Advanced Filter Drawer State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // View Mode: Cards vs Table
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState<SessionFeedbackSummary | null>(null);

  // Reminders simulation toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // KPI Calculations
  const completedSessionsCount = sessionSummaries.length;
  const totalFeedbackCollected = sessionSummaries.reduce((sum, s) => sum + s.responsesCount, 0);
  const totalPendingFeedback = sessionSummaries.reduce((sum, s) => sum + s.pendingCount, 0);
  const avgOverallRating = (
    sessionSummaries.reduce((sum, s) => sum + s.overallRating, 0) / (sessionSummaries.length || 1)
  ).toFixed(1);
  const needsAttentionCount = sessionSummaries.filter(
    (s) => s.overallRating < 3.8 || s.status === 'Needs Attention'
  ).length;

  // Filter Logic
  const filteredSessions = sessionSummaries.filter((s) => {
    const matchesSearch =
      s.sessionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.trainingType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.track.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuarter = quarterFilter === 'All' || s.quarter === quarterFilter;
    const matchesType = typeFilter === 'All' || s.trainingType === typeFilter;
    const matchesTrack = trackFilter === 'All' || s.track === trackFilter;
    const matchesTrainer = trainerFilter === 'All' || s.trainerName === trainerFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    let matchesRating = true;
    if (ratingFilter === '4.5+') matchesRating = s.overallRating >= 4.5;
    else if (ratingFilter === '4.0+') matchesRating = s.overallRating >= 4.0;
    else if (ratingFilter === '<3.8') matchesRating = s.overallRating < 3.8;

    let matchesKpi = true;
    if (activeKpiFilter === 'completed') matchesKpi = true;
    else if (activeKpiFilter === 'collected') matchesKpi = s.responsesCount > 0;
    else if (activeKpiFilter === 'pending') matchesKpi = s.pendingCount > 0;
    else if (activeKpiFilter === 'rating') matchesKpi = s.overallRating >= 4.5;
    else if (activeKpiFilter === 'attention') matchesKpi = s.overallRating < 3.8 || s.status === 'Needs Attention';

    return matchesSearch && matchesQuarter && matchesType && matchesTrack && matchesTrainer && matchesStatus && matchesRating && matchesKpi;
  });

  const hasActiveFilters =
    searchTerm !== '' ||
    quarterFilter !== 'All' ||
    typeFilter !== 'All' ||
    trackFilter !== 'All' ||
    trainerFilter !== 'All' ||
    statusFilter !== 'All' ||
    ratingFilter !== 'All' ||
    activeKpiFilter !== null;

  const handleClearFilters = () => {
    setSearchTerm('');
    setYearFilter('2026');
    setQuarterFilter('All');
    setTypeFilter('All');
    setTrackFilter('All');
    setTrainerFilter('All');
    setStatusFilter('All');
    setRatingFilter('All');
    setActiveKpiFilter(null);
  };

  const handleSingleReminder = (sessionId: string, sessionTitle: string, pending: number) => {
    sendFeedbackReminder(sessionId);
    triggerToast(`Simulated reminder sent to ${pending} pending participants for ${sessionTitle}`);
  };

  const handleSimulateAllReminders = () => {
    simulateAllPendingReminders();
    setShowReminderModal(false);
    triggerToast('Simulated email feedback reminders sent to all pending respondents');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="assessment-ops-container"
    >
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="global-toast-banner"
          >
            <CheckCircle2 size={16} className="toast-icon" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. PAGE HEADER CARD WITH INTERACTIVE ORBIT VISUALIZER */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="asm-header-glass-card"
      >
        {/* LEFT: INTERACTIVE ORBIT VISUALIZER */}
        <div className="hero-section-left hidden md:flex items-center justify-center flex-shrink-0">
          <FeedbackOrbit />
        </div>

        {/* CENTER: BREADCRUMB BADGE, TITLE, SUBTITLE & METRICS */}
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
            <span className="text-teal-600 dark:text-teal-400 font-bold">FEEDBACK</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.14 }}
            className="header-main-title"
          >
            Feedback &amp; Session Evaluation
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18 }}
            className="header-subtitle-text max-w-2xl"
          >
            Collect, monitor and analyze feedback across all L&amp;D training programs and completed learning sessions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.22 }}
            className="header-compact-metrics-row"
          >
            <span className="header-metric-pill">
              <Star size={13} className="text-amber-500 fill-amber-500" />
              <span>Avg Rating: <strong>{avgOverallRating} / 5</strong></span>
            </span>

            <span className="header-metric-pill">
              <MessageSquare size={13} className="text-teal-600 dark:text-teal-400" />
              <span>Collected: <strong>{totalFeedbackCollected}</strong></span>
            </span>

            <span className="header-metric-pill">
              <Mail size={13} className="text-indigo-600 dark:text-indigo-400" />
              <span>Pending: <strong>{totalPendingFeedback}</strong></span>
            </span>
          </motion.div>
        </div>

        {/* RIGHT: ENGINE YEAR BADGE & ACTION BUTTONS */}
        <div className="header-right-action flex flex-col items-end gap-3 flex-shrink-0">
          <span className="code-chip lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-xl text-xs">
            2026 Feedback Operations
          </span>

          <div className="asm-header-actions-group flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="asm-secondary-header-btn cursor-pointer"
              onClick={() => setShowReminderModal(true)}
            >
              <Mail size={15} />
              <span>Send Pending Requests</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="asm-secondary-header-btn cursor-pointer"
              onClick={() => setShowImportModal(true)}
            >
              <Upload size={15} />
              <span>Import Feedback</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              className="create-asm-primary-btn group cursor-pointer"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              <span>Add Feedback</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* 2. 5 EQUAL KPI CARDS ROW */}
      <div className="asm-kpi-cards-5row">
        {/* KPI 1: Completed Sessions */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className={`asm-kpi-card-box cursor-pointer ${activeKpiFilter === 'completed' ? 'ring-2 ring-teal-500/30' : ''}`}
          onClick={() => setActiveKpiFilter(activeKpiFilter === 'completed' ? null : 'completed')}
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">COMPLETED SESSIONS</span>
            <div className="kpi-icon-badge teal">
              <CheckSquare size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{completedSessionsCount}</div>
          <span className="kpi-desc-text">Completed training sessions</span>
        </motion.div>

        {/* KPI 2: Feedback Collected */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className={`asm-kpi-card-box cursor-pointer ${activeKpiFilter === 'collected' ? 'ring-2 ring-teal-500/30' : ''}`}
          onClick={() => setActiveKpiFilter(activeKpiFilter === 'collected' ? null : 'collected')}
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">FEEDBACK COLLECTED</span>
            <div className="kpi-icon-badge emerald">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{totalFeedbackCollected}</div>
          <span className="kpi-desc-text">Surveys &amp; evaluations</span>
        </motion.div>

        {/* KPI 3: Pending Feedback */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className={`asm-kpi-card-box cursor-pointer ${activeKpiFilter === 'pending' ? 'ring-2 ring-amber-500/30' : ''}`}
          onClick={() => setActiveKpiFilter(activeKpiFilter === 'pending' ? null : 'pending')}
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">PENDING FEEDBACK</span>
            <div className="kpi-icon-badge amber">
              <Clock size={16} />
            </div>
          </div>
          <div className="kpi-num-display text-amber-600 dark:text-amber-400">{totalPendingFeedback}</div>
          <span className="kpi-desc-text">Awaiting responses</span>
        </motion.div>

        {/* KPI 4: Average Rating */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className={`asm-kpi-card-box cursor-pointer ${activeKpiFilter === 'rating' ? 'ring-2 ring-teal-500/30' : ''}`}
          onClick={() => setActiveKpiFilter(activeKpiFilter === 'rating' ? null : 'rating')}
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">AVERAGE RATING</span>
            <div className="kpi-icon-badge indigo">
              <Star size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{avgOverallRating} / 5</div>
          <div className="mini-score-progress-track">
            <div
              className="mini-score-progress-fill"
              style={{ width: `${(parseFloat(avgOverallRating) / 5) * 100}%` }}
            />
          </div>
          <span className="kpi-desc-text">Overall satisfaction mark</span>
        </motion.div>

        {/* KPI 5: Need Attention */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className={`asm-kpi-card-box cursor-pointer ${activeKpiFilter === 'attention' ? 'ring-2 ring-rose-500/30' : ''}`}
          onClick={() => setActiveKpiFilter(activeKpiFilter === 'attention' ? null : 'attention')}
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text text-rose">NEED ATTENTION</span>
            <div className="kpi-icon-badge rose">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="kpi-num-display text-rose">{needsAttentionCount}</div>
          <span className="kpi-desc-text">Rated below 3.8</span>
        </motion.div>
      </div>

      {/* 3. FEEDBACK INTELLIGENCE STRIP */}
      <div className="asm-intelligence-card">
        <div className="intelligence-card-header">
          <h4 className="intelligence-card-title">Feedback Intelligence</h4>
        </div>

        <div className="intelligence-tiles-4grid">
          <div className="insight-tile-box">
            <div className="tile-icon-badge emerald">
              <ShieldCheck size={16} />
            </div>
            <div className="tile-details">
              <span className="tile-lbl">FEEDBACK COMPLETION</span>
              <strong className="tile-val">83%</strong>
            </div>
          </div>

          <div className="insight-tile-box">
            <div className="tile-icon-badge teal">
              <TrendingUp size={16} />
            </div>
            <div className="tile-details">
              <span className="tile-lbl">TOP RATED TRAINING</span>
              <strong className="tile-val">Databricks Training • 4.8</strong>
            </div>
          </div>

          <div className="insight-tile-box">
            <div className="tile-icon-badge amber">
              <Award size={16} />
            </div>
            <div className="tile-details">
              <span className="tile-lbl">TOP RATED TRAINER</span>
              <strong className="tile-val">Sarah David • 4.7</strong>
            </div>
          </div>

          <div className="insight-tile-box">
            <div className="tile-icon-badge rose">
              <AlertTriangle size={16} />
            </div>
            <div className="tile-details">
              <span className="tile-lbl">ATTENTION AREA</span>
              <strong className="tile-val">2 Sessions Below Threshold</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN NAVIGATION TABS */}
      <nav className="bootcamp-tabs-bar" aria-label="Feedback Navigation">
        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'session' ? 'active' : ''}`}
          onClick={() => setActiveTab('session')}
        >
          <MessageSquare size={15} className="inline mr-1.5" /> Session Feedback
        </button>

        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'trainer' ? 'active' : ''}`}
          onClick={() => setActiveTab('trainer')}
        >
          <UserCheck size={15} className="inline mr-1.5" /> Trainer Feedback
        </button>

        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'participant' ? 'active' : ''}`}
          onClick={() => setActiveTab('participant')}
        >
          <Users size={15} className="inline mr-1.5" /> Participant Feedback
        </button>

        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={15} className="inline mr-1.5" /> Pending Requests ({totalPendingFeedback})
        </button>

        <button
          type="button"
          className={`bootcamp-tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <TrendingUp size={15} className="inline mr-1.5" /> Insights
        </button>
      </nav>

      {/* 5. FILTER WORKSPACE CARD */}
      <div className="asm-filter-workspace-card">
        {/* ROW 1: PRIMARY FILTERS GRID */}
        <div className="filter-grid-row-1">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon text-teal-700" />
            <input
              type="text"
              className="asm-search-input-field"
              placeholder="Search session, trainer, participant, track..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Year Filter */}
          <select
            className="asm-select-field"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="2026">Year: 2026</option>
            <option value="2025">Year: 2025</option>
          </select>

          {/* Training Type Filter */}
          <select
            className="asm-select-field"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">Type: All</option>
            <option value="Knowledge Sharing Series">Knowledge Sharing Series</option>
            <option value="Antigravity Training">Antigravity Training</option>
            <option value="Informatica Training">Informatica Training</option>
            <option value="Databricks Training">Databricks Training</option>
            <option value="BA Training">BA Training</option>
            <option value="DE Training">DE Training</option>
            <option value="Tools Training">Tools Training</option>
            <option value="Technical Training">Technical Training</option>
            <option value="Workshop">Workshop</option>
            <option value="Soft Skills Training">Soft Skills Training</option>
          </select>

          {/* Track Filter */}
          <select
            className="asm-select-field"
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
          >
            <option value="All">Track: All</option>
            <option value="DE">DE</option>
            <option value="BA">BA</option>
            <option value="Tools">Tools</option>
            <option value="Shared">Shared</option>
          </select>

          {/* Status Filter */}
          <select
            className="asm-select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="Collected">Collected</option>
            <option value="Awaiting Feedback">Awaiting Feedback</option>
            <option value="Partially Collected">Partially Collected</option>
            <option value="Needs Attention">Needs Attention</option>
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
              className={`transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Clear Button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-btn visible"
              onClick={handleClearFilters}
            >
              <X size={14} /> Clear
            </button>
          )}

          {activeTab === 'session' && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl ml-auto">
              <button
                type="button"
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-bold ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid size={14} /> Cards
              </button>
              <button
                type="button"
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-bold ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                onClick={() => setViewMode('table')}
              >
                <List size={14} /> Table
              </button>
            </div>
          )}
        </div>

        {/* ROW 2: EXPANDABLE ADVANCED FILTERS DRAWER */}
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
                <div className="drawer-select-block">
                  <label className="drawer-select-lbl">Quarter</label>
                  <select
                    className="asm-select-field w-full"
                    value={quarterFilter}
                    onChange={(e) => setQuarterFilter(e.target.value)}
                  >
                    <option value="All">All Quarters</option>
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>

                <div className="drawer-select-block">
                  <label className="drawer-select-lbl">Trainer</label>
                  <select
                    className="asm-select-field w-full"
                    value={trainerFilter}
                    onChange={(e) => setTrainerFilter(e.target.value)}
                  >
                    <option value="All">All Trainers</option>
                    <option value="Sarah David">Sarah David</option>
                    <option value="Ramesh">Ramesh</option>
                    <option value="Sneha">Sneha</option>
                    <option value="John Mathew">John Mathew</option>
                    <option value="Dinesh Kumar">Dinesh Kumar</option>
                  </select>
                </div>

                <div className="drawer-select-block">
                  <label className="drawer-select-lbl">Rating Threshold</label>
                  <select
                    className="asm-select-field w-full"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                  >
                    <option value="All">All Ratings</option>
                    <option value="4.5+">4.5+ Rating</option>
                    <option value="4.0+">4.0+ Rating</option>
                    <option value="<3.8">Needs Attention (&lt;3.8)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: SESSION FEEDBACK                                      */}
      {/* ============================================================ */}
      {activeTab === 'session' && (
        <section className="space-y-4">
          {viewMode === 'cards' ? (
            <div className="asm-card-grid-3col">
              {filteredSessions.map((s) => (
                <div key={s.id} className="asm-feedback-card">
                  <div>
                    <div className="asm-card-top-header">
                      <span className="code-chip lg text-[10px]">{s.trainingType}</span>
                      <StatusBadge status={s.status as any} size="sm" />
                    </div>

                    <h3 className="asm-card-title-text">{s.sessionTitle}</h3>

                    <div className="asm-card-meta-row">
                      <span className="code-chip text-[10px]">{s.track}</span>
                      <span className="text-xs text-slate-500 font-bold">• Trainer: {s.trainerName}</span>
                    </div>

                    <div className="asm-card-stats-box">
                      <div className="asm-card-stats-cell">
                        <span className="asm-card-stats-label">Date</span>
                        <strong className="asm-card-stats-val">{s.sessionDate}</strong>
                      </div>
                      <div className="asm-card-stats-cell">
                        <span className="asm-card-stats-label">Responses</span>
                        <strong className="asm-card-stats-val text-teal-700 dark:text-teal-300">
                          {s.responsesCount} / {s.totalParticipants}
                        </strong>
                      </div>
                    </div>

                    <div className="asm-card-rating-strip">
                      <span className="text-xs font-extrabold text-teal-800 dark:text-teal-300">Overall Rating</span>
                      <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                        <Star size={13} className="fill-amber-400" />
                        <span className="text-slate-900 dark:text-white">{s.overallRating.toFixed(1)} / 5.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="asm-card-footer-action">
                    <button
                      type="button"
                      className="ui-button-secondary text-xs w-full py-1.5 flex items-center justify-center gap-1"
                      onClick={() => setSelectedSessionDetails(s)}
                    >
                      View Feedback →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bootcamp-table-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Training Type</th>
                    <th>Track</th>
                    <th>Trainer</th>
                    <th>Date</th>
                    <th>Participants</th>
                    <th>Responses</th>
                    <th>Average Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => (
                    <tr key={s.id} className="table-row-hover">
                      <td className="font-extrabold text-xs text-slate-900 dark:text-white max-w-xs">{s.sessionTitle}</td>
                      <td><span className="code-chip lg text-[10px]">{s.trainingType}</span></td>
                      <td><span className="code-chip text-[10px]">{s.track}</span></td>
                      <td className="text-xs font-bold">{s.trainerName}</td>
                      <td className="text-xs">{s.sessionDate}</td>
                      <td className="text-xs font-bold">{s.totalParticipants}</td>
                      <td className="text-xs font-extrabold text-teal-700">{s.responsesCount} / {s.totalParticipants}</td>
                      <td>
                        <div className="flex items-center gap-1 font-extrabold text-xs">
                          <Star size={13} className="text-amber-400 fill-amber-400" />
                          <span>{s.overallRating.toFixed(1)} / 5</span>
                        </div>
                      </td>
                      <td><StatusBadge status={s.status as any} size="sm" /></td>
                      <td>
                        <button
                          type="button"
                          className="ui-button-secondary text-xs py-1 px-2.5"
                          onClick={() => setSelectedSessionDetails(s)}
                        >
                          View Feedback →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 2: TRAINER FEEDBACK                                      */}
      {/* ============================================================ */}
      {activeTab === 'trainer' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
            <button
              type="button"
              className={`px-4 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                trainerFeedbackMode === 'session-level'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setTrainerFeedbackMode('session-level')}
            >
              Session-Level Trainer Feedback
            </button>
            <button
              type="button"
              className={`px-4 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                trainerFeedbackMode === 'individual'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setTrainerFeedbackMode('individual')}
            >
              Individual Employee Evaluation
            </button>
          </div>

          {trainerFeedbackMode === 'session-level' ? (
            <div className="bootcamp-table-wrapper">
              <table className="enterprise-table text-xs">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Training Type</th>
                    <th>Trainer</th>
                    <th>Engagement</th>
                    <th>Understanding</th>
                    <th>Effectiveness</th>
                    <th>Pace</th>
                    <th>Overall Rating</th>
                    <th>Trainer Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {trainerFeedbacks
                    .filter((tf) => tf.feedbackMode === 'SESSION_LEVEL')
                    .map((tf) => (
                      <tr key={tf.id} className="table-row-hover">
                        <td className="font-extrabold text-slate-900 dark:text-white max-w-xs">{tf.sessionTitle}</td>
                        <td><span className="code-chip lg text-[10px]">{tf.trainingType}</span></td>
                        <td className="font-bold">{tf.trainerName}</td>
                        <td className="font-extrabold text-teal-700">{tf.engagementRating} / 5</td>
                        <td className="font-extrabold text-teal-700">{tf.understandingRating} / 5</td>
                        <td className="font-extrabold text-teal-700">{tf.effectivenessRating} / 5</td>
                        <td className="font-extrabold text-teal-700">{tf.paceRating} / 5</td>
                        <td>
                          <div className="flex items-center gap-1 font-black text-xs text-amber-600">
                            <Star size={13} className="fill-amber-400" /> {tf.overallRating} / 5
                          </div>
                        </td>
                        <td className="text-slate-600 dark:text-slate-300 italic max-w-md">"{tf.trainerComments}"</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bootcamp-table-wrapper">
              <table className="enterprise-table text-xs">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Employee ID</th>
                    <th>Session / Module</th>
                    <th>Trainer</th>
                    <th>Technical Skill</th>
                    <th>Participation</th>
                    <th>Problem Solving</th>
                    <th>Overall Rating</th>
                    <th>Recommended Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {trainerFeedbacks
                    .filter((tf) => tf.feedbackMode === 'INDIVIDUAL_EMPLOYEE')
                    .map((tf) => (
                      <tr key={tf.id} className="table-row-hover">
                        <td className="font-extrabold text-slate-900 dark:text-white">{tf.employeeName || 'Kaviram Sudharajanainar'}</td>
                        <td className="font-mono text-slate-500">{tf.employeeId || 'EMP001'}</td>
                        <td className="font-bold">{tf.sessionTitle}</td>
                        <td>{tf.trainerName}</td>
                        <td className="font-extrabold text-teal-700">{tf.technicalSkillRating || 4.5} / 5</td>
                        <td className="font-extrabold text-teal-700">{tf.engagementRating} / 5</td>
                        <td className="font-extrabold text-teal-700">{tf.problemSolvingRating || 4.7} / 5</td>
                        <td>
                          <div className="flex items-center gap-1 font-black text-xs text-amber-600">
                            <Star size={13} className="fill-amber-400" /> {tf.overallRating} / 5
                          </div>
                        </td>
                        <td>
                          <span className="code-chip lg text-[10px] text-teal-700 dark:text-teal-300">
                            {tf.recommendedFollowUp || 'Databricks Certified Exam Prep'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PARTICIPANT FEEDBACK                                  */}
      {/* ============================================================ */}
      {activeTab === 'participant' && (
        <section className="space-y-4">
          <div className="bootcamp-table-wrapper">
            <table className="enterprise-table text-xs">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Session</th>
                  <th>Training Type</th>
                  <th>Trainer</th>
                  <th>Content</th>
                  <th>Trainer</th>
                  <th>Overall Rating</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participantResponses.map((pr) => (
                  <tr key={pr.id} className="table-row-hover">
                    <td>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">{pr.participantName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{pr.employeeId}</span>
                      </div>
                    </td>
                    <td className="font-bold max-w-xs">{pr.sessionTitle}</td>
                    <td><span className="code-chip lg text-[10px]">{pr.trainingType}</span></td>
                    <td className="font-bold">{pr.trainerName}</td>
                    <td className="font-extrabold text-teal-700">{pr.contentRating} / 5</td>
                    <td className="font-extrabold text-teal-700">{pr.trainerRating} / 5</td>
                    <td>
                      <div className="flex items-center gap-1 font-black text-xs text-amber-600">
                        <Star size={13} className="fill-amber-400" /> {pr.overallRating} / 5
                      </div>
                    </td>
                    <td>{pr.submittedAt.split('T')[0]}</td>
                    <td><span className="risk-tag risk-low">Completed</span></td>
                    <td>
                      <button
                        type="button"
                        className="ui-button-secondary text-xs py-1 px-2.5"
                        onClick={() => {
                          const matchedSummary = sessionSummaries.find((s) => s.sessionId === pr.sessionId);
                          if (matchedSummary) setSelectedSessionDetails(matchedSummary);
                        }}
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 4: PENDING REQUESTS                                      */}
      {/* ============================================================ */}
      {activeTab === 'pending' && (
        <section className="space-y-4">
          <div className="bootcamp-table-wrapper">
            <table className="enterprise-table text-xs">
              <thead>
                <tr>
                  <th>Session Title</th>
                  <th>Training Type</th>
                  <th>Audience</th>
                  <th>Responses</th>
                  <th>Pending</th>
                  <th>Request Sent</th>
                  <th>Last Reminder</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="table-row-hover">
                    <td className="font-extrabold text-slate-900 dark:text-white max-w-xs">{req.sessionTitle}</td>
                    <td><span className="code-chip lg text-[10px]">{req.trainingType}</span></td>
                    <td className="font-bold">{req.totalParticipants} Participants</td>
                    <td className="font-extrabold text-teal-700">{req.responsesCount}</td>
                    <td><span className="font-black text-amber-600 dark:text-amber-400">{req.pendingCount} Pending</span></td>
                    <td>{req.requestSentDate}</td>
                    <td>{req.lastReminderDate || '—'}</td>
                    <td><StatusBadge status={req.status as any} size="sm" /></td>
                    <td>
                      <button
                        type="button"
                        className="ui-button-primary text-xs py-1 px-3 flex items-center gap-1"
                        onClick={() => handleSingleReminder(req.sessionId, req.sessionTitle, req.pendingCount)}
                      >
                        <Send size={12} /> Send Reminder →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* TAB 5: INSIGHTS                                              */}
      {/* ============================================================ */}
      {activeTab === 'insights' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <span className="text-[11px] font-extrabold text-teal-600 uppercase tracking-wider">Highest Rated Session</span>
              <h4 className="font-black text-base text-slate-900 dark:text-white">Knowledge Sharing Series</h4>
              <p className="text-xs text-slate-500">Databricks Performance Optimization</p>
              <div className="flex items-center gap-1 text-amber-500 font-black text-sm pt-1">
                <Star size={16} className="fill-amber-400" /> 4.8 / 5.0 Rating
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <span className="text-[11px] font-extrabold text-teal-600 uppercase tracking-wider">Top Rated Trainer</span>
              <h4 className="font-black text-base text-slate-900 dark:text-white">Sarah David</h4>
              <p className="text-xs text-slate-500">Python &amp; Databricks Lead Trainer</p>
              <div className="flex items-center gap-1 text-teal-600 font-black text-sm pt-1">
                <Award size={16} /> 4.7 / 5.0 Average Trainer Score
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <span className="text-[11px] font-extrabold text-teal-600 uppercase tracking-wider">Most Common Improvement Area</span>
              <h4 className="font-black text-base text-slate-900 dark:text-white">Hands-on Practical Labs</h4>
              <p className="text-xs text-slate-500">Requested across 62% of participant feedback comments</p>
              <div className="text-slate-700 dark:text-slate-300 font-bold text-xs pt-1">
                Provide downloadable notebook drills before sessions
              </div>
            </div>
          </div>

          {/* Training Type Rating Progress Bars */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Average Rating by Training Type
            </h4>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Databricks Training</span>
                  <span className="font-extrabold text-teal-700 dark:text-teal-300">4.8 / 5</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full" style={{ width: '96%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Antigravity Training</span>
                  <span className="font-extrabold text-teal-700 dark:text-teal-300">4.7 / 5</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Knowledge Sharing Series</span>
                  <span className="font-extrabold text-teal-700 dark:text-teal-300">4.6 / 5</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">DE &amp; BA Track Training</span>
                  <span className="font-extrabold text-teal-700 dark:text-teal-300">4.5 / 5</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1 text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Informatica Training</span>
                  <span className="font-extrabold text-teal-700 dark:text-teal-300">4.2 / 5</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full" style={{ width: '84%' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* MODALS & DRAWERS                                             */}
      {/* ============================================================ */}

      {/* 1. SESSION DETAIL DRAWER */}
      {selectedSessionDetails && (
        <FeedbackDetailModal
          sessionSummary={selectedSessionDetails}
          onClose={() => setSelectedSessionDetails(null)}
        />
      )}

      {/* 2. ADD FEEDBACK MODAL */}
      {showAddModal && (
        <AddTrainerFeedbackModal onClose={() => setShowAddModal(false)} />
      )}

      {/* 3. IMPORT FEEDBACK MODAL */}
      {showImportModal && (
        <ImportTrainerFeedbackModal onClose={() => setShowImportModal(false)} />
      )}

      {/* 4. SEND PENDING REQUESTS PREVIEW MODAL */}
      <AnimatePresence>
        {showReminderModal && (
          <div
            className="cert-modal-overlay"
            onClick={() => setShowReminderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="cert-modal-card"
              style={{ maxWidth: '560px', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="reminder-modal-header">
                <div className="flex items-center gap-3">
                  <div className="import-icon-badge" style={{ marginBottom: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="cert-modal-title">
                      Send Pending Feedback Reminders
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Simulate sending email notifications to all pending respondents.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="cert-modal-close"
                  onClick={() => setShowReminderModal(false)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="cert-modal-body space-y-4">
                {/* Email Preview Box */}
                <div className="reminder-email-preview-box">
                  <div className="reminder-preview-header-row">
                    <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider flex items-center gap-1.5">
                      <Mail size={12} /> Email Notification Template Preview
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Automated Dispatch</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        Subject Line
                      </span>
                      <div className="reminder-subject-box">
                        Feedback Request – L&amp;D Session Evaluation
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                        Message Body
                      </span>
                      <div className="reminder-body-box">
                        Hi <strong className="text-teal-700 dark:text-teal-400">[Employee Name]</strong>, thank you for attending the recent L&amp;D training session. Please take a moment to share your feedback to help us continuously improve our organizational learning programs.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Audience Summary Banner */}
                <div className="reminder-target-banner">
                  <div className="reminder-target-left">
                    <div className="reminder-count-badge">
                      24
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                        24 Pending Respondents Identified
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Targeting non-respondents across all active L&amp;D training sessions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded-full font-black text-[10px] uppercase tracking-wider border border-teal-300 dark:border-teal-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    Simulated Mode
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="cert-modal-footer">
                <button
                  type="button"
                  className="ui-button-secondary text-xs"
                  onClick={() => setShowReminderModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ui-button-primary text-xs flex items-center gap-1.5"
                  onClick={handleSimulateAllReminders}
                >
                  <Send size={13} />
                  <span>Simulate Sending Reminders</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
