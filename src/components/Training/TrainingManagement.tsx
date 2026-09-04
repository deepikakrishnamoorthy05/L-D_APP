import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  UserCheck,
  Clock3,
  Send,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import { TrainingPlan } from '../../types/training';
import { useTraining } from '../../context/TrainingContext';
import { PlanTrainingModal } from './PlanTrainingModal';
import { TrainerAvailabilityModal } from './TrainerAvailabilityModal';
import { ScheduleSessionModal } from '../Sessions/ScheduleSessionModal';
import { StatusBadge } from '../ui/StatusBadge';
import { GlassCard, Button, SearchInput } from '../ui';
import { TrainingOrbit } from './TrainingOrbit';
import { CustomFilterDropdown } from './CustomFilterDropdown';

interface TrainingManagementProps {
  onNavigateToSessions?: (sessionId?: string) => void;
}

export const TrainingManagement: React.FC<TrainingManagementProps> = ({ onNavigateToSessions }) => {
  const { trainingPlans, availabilityRequests, trainers, scheduleTrainingPlan } = useTraining();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    'plans' | 'availability' | 'scheduled' | 'history'
  >('plans');

  // View Mode (Cards vs Table) for Plans Tab
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // History Tab Filters
  const [historyYear, setHistoryYear] = useState('2026');
  const [historyTrack, setHistoryTrack] = useState('All');
  const [historyType, setHistoryType] = useState('All');

  // Modals State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlanForAvail, setSelectedPlanForAvail] = useState<TrainingPlan | null>(null);

  // Integration Scheduler Modal State
  const [schedulerInitialData, setSchedulerInitialData] = useState<any | null>(null);
  const [selectedPlanIdForScheduler, setSelectedPlanIdForScheduler] = useState<string | null>(null);
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);

  // KPI Computations
  const plannedCount = trainingPlans.filter(
    (p) => p.status !== 'Completed' && p.status !== 'Cancelled'
  ).length;

  const awaitingResponseCount = trainingPlans.filter(
    (p) => p.status === 'Awaiting Availability'
  ).length;

  const readyToScheduleCount = trainingPlans.filter(
    (p) => p.status === 'Ready to Schedule'
  ).length;

  const scheduledMonthCount = trainingPlans.filter((p) => p.status === 'Scheduled').length;

  // Filtered Training Plans
  const filteredPlans = trainingPlans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrack =
      selectedTrackFilter === 'All' || plan.track === selectedTrackFilter;

    const matchesStatus =
      selectedStatusFilter === 'All' || plan.status === selectedStatusFilter;

    return matchesSearch && matchesTrack && matchesStatus;
  });

  // Scheduled Plans
  const scheduledPlans = trainingPlans.filter((p) => p.status === 'Scheduled');

  // History Plans
  const historyPlans = trainingPlans.filter(
    (p) => p.status === 'Completed' || p.status === 'Cancelled'
  );

  const filteredHistory = historyPlans.filter((p) => {
    const matchesTrack = historyTrack === 'All' || p.track === historyTrack;
    const matchesType = historyType === 'All' || p.type === historyType;
    return matchesTrack && matchesType;
  });

  // Open Scheduler with pre-filled plan info
  const handleOpenSchedulerForPlan = (plan: TrainingPlan, trainerId?: string) => {
    const assignedTrainerName =
      plan.assignedTrainerName ||
      trainers.find((t) => t.id === trainerId)?.name ||
      'Sneha';

    const initialSession = {
      bootcampId: 'bc-1',
      bootcampName: `${plan.track} Training Cohort`,
      sessionDate: plan.preferredDate || '2026-09-18',
      timeSlot: 'FN',
      startTime: plan.preferredTime ? plan.preferredTime.split('-')[0].trim() : '10:00',
      endTime: plan.preferredTime ? plan.preferredTime.split('-')[1]?.trim() || '12:00' : '12:00',
      agenda: plan.topic,
      title: `${plan.name} — ${plan.topic}`,
      moduleName: plan.name,
      trainerName: assignedTrainerName,
      coordinatorName: 'Priya Sharma',
      evaluatorName: 'Dinesh Kumar',
      learningTrack: plan.track === 'DE' ? 'Databricks' : 'Common Foundation',
      mode: 'Classroom',
      notes: plan.description,
    };

    setSchedulerInitialData(initialSession);
    setSelectedPlanIdForScheduler(plan.id);
    setShowSchedulerModal(true);
    setSelectedPlanForAvail(null);
  };

  // Helper for 4-Stage Workflow Progress Strip on Cards
  const getWorkflowStageIndex = (status: string): number => {
    if (status === 'Draft' || status === 'Finding Trainer') return 1;
    if (status === 'Awaiting Availability') return 2;
    if (status === 'Ready to Schedule') return 3;
    if (status === 'Scheduled' || status === 'Completed') return 4;
    return 1;
  };

  const trackOptions = [
    { label: 'All Tracks', value: 'All' },
    { label: 'BA (Business Analyst)', value: 'BA' },
    { label: 'DE (Data Engineering)', value: 'DE' },
    { label: 'Tools & Platforms', value: 'Tools' },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Finding Trainer', value: 'Finding Trainer' },
    { label: 'Awaiting Availability', value: 'Awaiting Availability' },
    { label: 'Ready to Schedule', value: 'Ready to Schedule' },
    { label: 'Scheduled', value: 'Scheduled' },
    { label: 'Completed', value: 'Completed' },
  ];

  const tabsList = [
    { id: 'plans', label: 'Training Plans', count: trainingPlans.length, icon: <BookOpen size={15} /> },
    { id: 'availability', label: 'Trainer Availability', count: awaitingResponseCount, isWarning: awaitingResponseCount > 0, icon: <UserCheck size={15} /> },
    { id: 'scheduled', label: 'Scheduled Training', count: scheduledPlans.length, icon: <Calendar size={15} /> },
    { id: 'history', label: 'Training History', icon: <Clock size={15} /> },
  ];

  return (
    <div className="training-management-view page-container space-y-6">
      {/* 1. UNIFIED PREMIUM HERO CARD (MASTER REFERENCE LAYOUT) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="unified-bootcamp-hero-card"
      >
        {/* LEFT SECTION: ANIMATED LEARNING ORBIT */}
        <div className="hero-section-left">
          <TrainingOrbit />
        </div>

        {/* CENTER SECTION: EYEBROW, TITLE IN MIDDLE, SUBTITLE & METRICS */}
        <div className="hero-section-center">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hero-eyebrow-badge"
          >
            <span>L&amp;D TRAINING OPERATIONS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="hero-merged-title"
          >
            Training Management
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hero-merged-subtitle"
          >
            Plan internal training programs, identify suitable trainers, collect availability and schedule sessions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="hero-compact-metrics-row"
          >
            <span className="hero-metric-pill">
              <BookOpen size={14} className="pill-icon text-teal-600" />
              <strong className="pill-val">{plannedCount}</strong>
              <span className="pill-label">Active Plans</span>
            </span>

            <span className="hero-metric-pill">
              <Clock3 size={14} className="pill-icon text-amber-600" />
              <strong className="pill-val">{awaitingResponseCount}</strong>
              <span className="pill-label">Pending Requests</span>
            </span>

            <span className="hero-metric-pill">
              <UserCheck size={14} className="pill-icon text-emerald-600" />
              <strong className="pill-val">{readyToScheduleCount}</strong>
              <span className="pill-label">Ready to Schedule</span>
            </span>
          </motion.div>
        </div>

        {/* RIGHT SECTION: YEAR BADGE & PRIMARY ACTION BUTTON */}
        <div className="hero-section-right">
          <div className="hero-context-badge">
            <span className="badge-year">2026</span>
            <span className="badge-label">L&amp;D SCHEDULER</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={18} />}
              onClick={() => setShowPlanModal(true)}
              className="hero-action-btn"
            >
              Plan Training
            </Button>
          </motion.div>

          <span className="hero-muted-meta">
            BA • DE • Tools Tracks
          </span>
        </div>
      </motion.div>

      {/* 2. MASTER REFERENCE KPI CARDS GRID */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="training-kpi-4col-grid"
      >
        {/* KPI 1: PLANNED TRAINING */}
        {(() => {
          const isSelected = activeTab === 'plans' && selectedStatusFilter === 'All';
          return (
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.18 }}
              onClick={() => {
                setSelectedStatusFilter('All');
                setActiveTab('plans');
              }}
              className={`asm-kpi-card-box cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-teal-500 border-teal-500 bg-teal-50/20' : ''
              }`}
            >
              <div className="kpi-card-header">
                <span className="kpi-label-text">PLANNED TRAINING</span>
                <div className="kpi-icon-badge teal">
                  <BookOpen size={16} />
                </div>
              </div>
              <div className="kpi-num-display">{plannedCount}</div>
              <span className="kpi-desc-text">Active pipeline</span>
            </motion.div>
          );
        })()}

        {/* KPI 2: AWAITING RESPONSE */}
        {(() => {
          const isSelected = activeTab === 'plans' && selectedStatusFilter === 'Awaiting Availability';
          return (
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.18 }}
              onClick={() => {
                setSelectedStatusFilter('Awaiting Availability');
                setActiveTab('plans');
              }}
              className={`asm-kpi-card-box cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20' : ''
              }`}
            >
              <div className="kpi-card-header">
                <span className="kpi-label-text">AWAITING RESPONSE</span>
                <div className="kpi-icon-badge indigo">
                  <Clock3 size={16} />
                </div>
              </div>
              <div className="kpi-num-display">{awaitingResponseCount}</div>
              <span className="kpi-desc-text">Requests sent</span>
            </motion.div>
          );
        })()}

        {/* KPI 3: READY TO SCHEDULE */}
        {(() => {
          const isSelected = activeTab === 'plans' && selectedStatusFilter === 'Ready to Schedule';
          return (
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.18 }}
              onClick={() => {
                setSelectedStatusFilter('Ready to Schedule');
                setActiveTab('plans');
              }}
              className={`asm-kpi-card-box cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : ''
              }`}
            >
              <div className="kpi-card-header">
                <span className="kpi-label-text">READY TO SCHEDULE</span>
                <div className="kpi-icon-badge emerald">
                  <UserCheck size={16} />
                </div>
              </div>
              <div className="kpi-num-display">{readyToScheduleCount}</div>
              <span className="kpi-desc-text">Trainer available</span>
            </motion.div>
          );
        })()}

        {/* KPI 4: SCHEDULED THIS MONTH */}
        {(() => {
          const isSelected = activeTab === 'plans' && selectedStatusFilter === 'Scheduled';
          return (
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.18 }}
              onClick={() => {
                setSelectedStatusFilter('Scheduled');
                setActiveTab('plans');
              }}
              className={`asm-kpi-card-box cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20' : ''
              }`}
            >
              <div className="kpi-card-header">
                <span className="kpi-label-text">SCHEDULED THIS MONTH</span>
                <div className="kpi-icon-badge amber">
                  <Calendar size={16} />
                </div>
              </div>
              <div className="kpi-num-display">{scheduledMonthCount}</div>
              <span className="kpi-desc-text">In calendar</span>
            </motion.div>
          );
        })()}
      </motion.div>

      {/* 3. PREMIUM SEGMENTED TAB BAR */}
      <div className="training-tab-bar">
        {tabsList.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={`training-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTrainingTabIndicator"
                  className="training-tab-pill-bg"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="training-tab-text-content">
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="training-tab-badge">{tab.count}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB VIEWS WITH ANIMATED TRANSITIONS */}
      <AnimatePresence mode="wait">
        {/* TAB CONTENT 1: TRAINING PLANS */}
        {activeTab === 'plans' && (
          <motion.div
            key="plans-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="tab-content-area space-y-4"
          >
            {/* SEARCH & FILTER TOOLBAR (STRICT SIDE-BY-SIDE HORIZONTAL LAYOUT) */}
            <GlassCard variant="default" padding="sm">
              <div className="training-toolbar-row">
                {/* Search Input Box */}
                <div className="training-search-input-box">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search training programs by name, topic, or category..."
                  />
                </div>

                {/* Custom Popover Dropdowns & View Mode Toggle (FORCED SIDE-BY-SIDE IN ONE ROW) */}
                <div className="training-controls-side-by-side">
                  <CustomFilterDropdown
                    label="Track:"
                    value={selectedTrackFilter}
                    options={trackOptions}
                    onChange={setSelectedTrackFilter}
                  />

                  <CustomFilterDropdown
                    label="Status:"
                    value={selectedStatusFilter}
                    options={statusOptions}
                    onChange={setSelectedStatusFilter}
                  />

                  {/* Cards / Table View Toggle */}
                  <div className="view-mode-toggle-group">
                    <button
                      type="button"
                      className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
                      onClick={() => setViewMode('cards')}
                      title="Grid Cards View"
                    >
                      <LayoutGrid size={15} />
                    </button>
                    <button
                      type="button"
                      className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                      title="Table View"
                    >
                      <List size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* TRAINING CARDS GRID */}
            {filteredPlans.length === 0 ? (
              <GlassCard variant="default" padding="lg" className="text-center py-12">
                <BookOpen size={36} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">No Training Plans Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  No active training plans match your filter criteria. Try resetting filters or creating a new program.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={16} />}
                  className="mt-4 mx-auto"
                  onClick={() => setShowPlanModal(true)}
                >
                  + Plan New Training
                </Button>
              </GlassCard>
            ) : viewMode === 'cards' ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
                className="training-plans-cards-grid"
              >
                {filteredPlans.map((plan) => {
                  const assignedTrainer = plan.assignedTrainerName || 'Awaiting Availability';
                  const stageIdx = getWorkflowStageIndex(plan.status);

                  return (
                    <motion.div
                      key={plan.id}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={{ y: -4, transition: { duration: 0.18 } }}
                      className="group flex h-full"
                    >
                      <GlassCard
                        variant="interactive"
                        padding="md"
                        className="training-plan-card-shell w-full flex flex-col justify-between border-slate-200/80 dark:border-slate-700/80 group-hover:border-teal-500/50 transition-all shadow-sm group-hover:shadow-md"
                      >
                        {/* Card Header & Content Body */}
                        <div>
                          <div className="plan-card-header-bar flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`track-pill-chip ${plan.track.toLowerCase()}`}>
                                {plan.track}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                {plan.type}
                              </span>
                            </div>
                            <StatusBadge status={plan.status} />
                          </div>

                          {/* Card Title & Topic */}
                          <h3 className="plan-title-name text-base font-extrabold text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {plan.name}
                          </h3>
                          <p className="plan-topic-sub text-xs text-slate-600 dark:text-slate-300 font-medium mb-3 line-clamp-2">
                            {plan.topic}
                          </p>

                          {/* Info Grid */}
                          <div className="plan-details-rows bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-1.5 mb-3">
                            <div className="detail-meta-row flex justify-between text-xs">
                              <span className="text-slate-500 font-semibold">Tentative Date:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {plan.preferredDate}
                              </span>
                            </div>
                            <div className="detail-meta-row flex justify-between text-xs">
                              <span className="text-slate-500 font-semibold">Duration:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {plan.duration}
                              </span>
                            </div>
                            <div className="detail-meta-row flex justify-between text-xs">
                              <span className="text-slate-500 font-semibold">Trainer Status:</span>
                              <span
                                className={`font-bold ${
                                  plan.assignedTrainerName ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {assignedTrainer}
                              </span>
                            </div>
                          </div>

                          {/* WORKFLOW PROGRESS STRIP */}
                          <div className="workflow-progress-strip my-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center text-[10px] font-extrabold mb-1.5 text-slate-400 uppercase tracking-wider">
                              <span>WORKFLOW STAGE</span>
                              <span className="text-teal-600 dark:text-teal-400 font-bold">
                                {stageIdx === 1 ? '1/4 Plan' : stageIdx === 2 ? '2/4 Availability' : stageIdx === 3 ? '3/4 Ready' : '4/4 Scheduled'}
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-1">
                              {['Plan', 'Trainer', 'Avail', 'Schedule'].map((stageLabel, idx) => {
                                const stepNum = idx + 1;
                                const isCurrentOrCompleted = stageIdx >= stepNum;
                                return (
                                  <div
                                    key={stageLabel}
                                    className={`h-1.5 rounded-full transition-all ${
                                      isCurrentOrCompleted
                                        ? 'bg-teal-500 dark:bg-teal-400 shadow-sm'
                                        : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                                    title={`Stage ${stepNum}: ${stageLabel}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Action (Strictly Aligned at Bottom) */}
                        <div className="plan-card-footer-actions mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          {plan.status === 'Ready to Schedule' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<Calendar size={14} />}
                              className="w-full justify-center"
                              onClick={() => handleOpenSchedulerForPlan(plan)}
                            >
                              Schedule Training →
                            </Button>
                          ) : plan.status === 'Awaiting Availability' ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<UserCheck size={14} />}
                              className="w-full justify-center text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
                              onClick={() => setSelectedPlanForAvail(plan)}
                            >
                              Review Responses →
                            </Button>
                          ) : plan.status === 'Scheduled' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<ExternalLink size={14} />}
                              className="w-full justify-center text-slate-700 dark:text-slate-300"
                              onClick={() => {
                                if (onNavigateToSessions) onNavigateToSessions();
                              }}
                            >
                              View in Calendar
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Send size={14} />}
                              className="w-full justify-center"
                              onClick={() => setSelectedPlanForAvail(plan)}
                            >
                              Manage Training →
                            </Button>
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* TABLE VIEW */
              <div className="avail-table-card">
                <div className="table-responsive-wrapper">
                  <table className="avail-data-table">
                    <thead>
                      <tr>
                        <th>Training Program</th>
                        <th>Type</th>
                        <th>Track</th>
                        <th>Preferred Date</th>
                        <th>Trainer</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlans.map((plan) => (
                        <tr key={plan.id}>
                          <td>
                            <div className="font-bold text-slate-900 dark:text-white">{plan.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{plan.topic}</div>
                          </td>
                          <td>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{plan.type}</span>
                          </td>
                          <td>
                            <span className={`track-pill-chip ${plan.track.toLowerCase()}`}>
                              {plan.track}
                            </span>
                          </td>
                          <td>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{plan.preferredDate}</div>
                            <div className="text-xs text-slate-400 font-medium">{plan.duration}</div>
                          </td>
                          <td>
                            <span
                              className={`font-extrabold ${
                                plan.assignedTrainerName ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {plan.assignedTrainerName || 'Awaiting Availability'}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={plan.status} />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {plan.status === 'Ready to Schedule' ? (
                              <button
                                type="button"
                                className="avail-action-btn"
                                onClick={() => handleOpenSchedulerForPlan(plan)}
                              >
                                <span>Schedule</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="avail-action-btn"
                                onClick={() => setSelectedPlanForAvail(plan)}
                              >
                                <span>Manage</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB CONTENT 2: TRAINER AVAILABILITY */}
        {activeTab === 'availability' && (
          <motion.div
            key="availability-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="tab-content-area space-y-4"
          >
            {/* COMPACT SUMMARY CARDS GRID */}
            <div className="avail-summary-grid">
              <div className="avail-kpi-card">
                <span className="avail-kpi-label">
                  Pending Responses
                </span>
                <span className="avail-kpi-val text-amber-600 dark:text-amber-400">
                  {availabilityRequests.filter((r) => r.response === 'Awaiting Response').length}
                </span>
              </div>

              <div className="avail-kpi-card">
                <span className="avail-kpi-label">
                  Available Trainers
                </span>
                <span className="avail-kpi-val text-emerald-600 dark:text-emerald-400">
                  {availabilityRequests.filter((r) => r.response === 'Available').length}
                </span>
              </div>

              <div className="avail-kpi-card">
                <span className="avail-kpi-label">
                  Unavailable Trainers
                </span>
                <span className="avail-kpi-val text-rose-600 dark:text-rose-400">
                  {availabilityRequests.filter((r) => r.response === 'Not Available').length}
                </span>
              </div>

              <div className="avail-kpi-card">
                <span className="avail-kpi-label">
                  Ready to Schedule
                </span>
                <span className="avail-kpi-val text-teal-600 dark:text-teal-400">
                  {readyToScheduleCount}
                </span>
              </div>
            </div>

            {/* AVAILABILITY REQUESTS TABLE */}
            <div className="avail-table-card">
              <div className="table-responsive-wrapper">
                <table className="avail-data-table">
                  <thead>
                    <tr>
                      <th>Training</th>
                      <th>Trainer</th>
                      <th>Track</th>
                      <th>Requested Slot</th>
                      <th>Request Sent</th>
                      <th>Response</th>
                      <th>Responded At</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availabilityRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          No availability requests active.
                        </td>
                      </tr>
                    ) : (
                      availabilityRequests.map((req) => {
                        const parentPlan = trainingPlans.find((p) => p.id === req.trainingPlanId);

                        return (
                          <tr key={req.id}>
                            <td>
                              <div className="font-bold text-slate-900 dark:text-white">{req.trainingName}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{req.topic}</div>
                            </td>
                            <td>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">{req.trainerName}</div>
                              <div className="text-xs text-slate-400">{req.trainerEmail}</div>
                            </td>
                            <td>
                              <span className={`track-pill-chip ${req.track.toLowerCase()}`}>
                                {req.track}
                              </span>
                            </td>
                            <td className="font-bold text-slate-800 dark:text-slate-200">
                              {req.requestedSlot}
                            </td>
                            <td className="text-slate-500">{req.requestSentAt}</td>
                            <td>
                              {req.response === 'Awaiting Response' && (
                                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-semibold">
                                  ⏳ Awaiting Response
                                </span>
                              )}
                              {req.response === 'Available' && (
                                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-semibold">
                                  ✓ Available
                                </span>
                              )}
                              {req.response === 'Not Available' && (
                                <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-full text-xs font-semibold">
                                  ✕ Not Available
                                </span>
                              )}
                            </td>
                            <td className="text-slate-500">{req.respondedAt || '—'}</td>
                            <td style={{ textAlign: 'right' }}>
                              {parentPlan ? (
                                <button
                                  type="button"
                                  className="avail-action-btn"
                                  onClick={() => setSelectedPlanForAvail(parentPlan)}
                                >
                                  <span>Review &amp; Schedule</span>
                                </button>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB CONTENT 3: SCHEDULED TRAINING */}
        {activeTab === 'scheduled' && (
          <motion.div
            key="scheduled-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="tab-content-area"
          >
            <div className="avail-table-card">
              <div className="table-responsive-wrapper">
                <table className="avail-data-table">
                  <thead>
                    <tr>
                      <th>Training Program</th>
                      <th>Track</th>
                      <th>Trainer</th>
                      <th>Date</th>
                      <th>Time / Duration</th>
                      <th>Expected Participants</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduledPlans.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          No training sessions currently scheduled.
                        </td>
                      </tr>
                    ) : (
                      scheduledPlans.map((plan) => (
                        <tr key={plan.id}>
                          <td>
                            <div className="font-bold text-slate-900 dark:text-white">{plan.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{plan.topic}</div>
                          </td>
                          <td>
                            <span className={`track-pill-chip ${plan.track.toLowerCase()}`}>
                              {plan.track}
                            </span>
                          </td>
                          <td className="font-bold text-slate-800 dark:text-slate-200">
                            {plan.assignedTrainerName || 'Assigned Trainer'}
                          </td>
                          <td className="font-bold text-slate-800 dark:text-slate-200">
                            {plan.preferredDate}
                          </td>
                          <td>
                            <div className="font-bold text-slate-900 dark:text-white">{plan.preferredTime}</div>
                            <div className="text-xs text-slate-400 font-medium">{plan.duration}</div>
                          </td>
                          <td className="font-semibold text-slate-800 dark:text-slate-200">
                            {plan.expectedParticipants} Enrolled
                          </td>
                          <td>
                            <StatusBadge status="Scheduled" />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="avail-action-btn"
                              onClick={() => {
                                if (onNavigateToSessions) onNavigateToSessions();
                              }}
                            >
                              <ExternalLink size={12} />
                              <span>View Session →</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB CONTENT 4: TRAINING HISTORY */}
        {activeTab === 'history' && (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="tab-content-area space-y-4"
          >
            {/* HISTORY FILTERS TOOLBAR */}
            <div className="history-filter-toolbar">
              <CustomFilterDropdown
                label="Year:"
                value={historyYear}
                options={[
                  { label: '2026', value: '2026' },
                  { label: '2025', value: '2025' },
                ]}
                onChange={setHistoryYear}
              />

              <CustomFilterDropdown
                label="Track:"
                value={historyTrack}
                options={[
                  { label: 'All Tracks', value: 'All' },
                  { label: 'BA', value: 'BA' },
                  { label: 'DE', value: 'DE' },
                  { label: 'Tools', value: 'Tools' },
                ]}
                onChange={setHistoryTrack}
              />

              <CustomFilterDropdown
                label="Type:"
                value={historyType}
                options={[
                  { label: 'All Types', value: 'All' },
                  { label: 'Workshop', value: 'Workshop' },
                  { label: 'Technical Training', value: 'Technical Training' },
                ]}
                onChange={setHistoryType}
              />
            </div>

            <div className="avail-table-card">
              <div className="table-responsive-wrapper">
                <table className="avail-data-table">
                  <thead>
                    <tr>
                      <th>Training Program</th>
                      <th>Track</th>
                      <th>Trainer</th>
                      <th>Completed Date</th>
                      <th>Participants</th>
                      <th>Status</th>
                      <th>Feedback Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500">
                          No historical completed training records found.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((plan) => (
                        <tr key={plan.id}>
                          <td>
                            <div className="font-bold text-slate-900 dark:text-white">{plan.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{plan.topic}</div>
                          </td>
                          <td>
                            <span className={`track-pill-chip ${plan.track.toLowerCase()}`}>
                              {plan.track}
                            </span>
                          </td>
                          <td className="font-bold text-slate-800 dark:text-slate-200">
                            {plan.assignedTrainerName || 'John Mathew'}
                          </td>
                          <td className="font-semibold text-slate-800 dark:text-slate-200">{plan.preferredDate}</td>
                          <td className="font-semibold text-slate-800 dark:text-slate-200">{plan.expectedParticipants} Participants</td>
                          <td>
                            <StatusBadge status={plan.status} />
                          </td>
                          <td>
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-black rounded-lg border border-emerald-200 dark:border-emerald-800">
                              4.8 / 5.0
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      {showPlanModal && (
        <PlanTrainingModal
          onClose={() => setShowPlanModal(false)}
          onSuccess={() => setShowPlanModal(false)}
        />
      )}

      {selectedPlanForAvail && (
        <TrainerAvailabilityModal
          plan={selectedPlanForAvail}
          onClose={() => setSelectedPlanForAvail(null)}
          onOpenScheduler={handleOpenSchedulerForPlan}
        />
      )}

      {showSchedulerModal && schedulerInitialData && (
        <ScheduleSessionModal
          initialData={schedulerInitialData}
          onClose={() => {
            setShowSchedulerModal(false);
            setSelectedPlanIdForScheduler(null);
          }}
          onSuccess={(createdSession) => {
            if (selectedPlanIdForScheduler) {
              scheduleTrainingPlan(
                selectedPlanIdForScheduler,
                createdSession.trainerId || 'tr-2',
                createdSession.sessionDate,
                createdSession.startTime,
                createdSession.endTime,
                createdSession.mode || 'Classroom',
                createdSession.location || createdSession.meetingLink || ''
              );
            }
            setShowSchedulerModal(false);
            setSchedulerInitialData(null);
            setSelectedPlanIdForScheduler(null);
          }}
        />
      )}
    </div>
  );
};
