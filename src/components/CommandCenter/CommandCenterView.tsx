import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  Bell,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Search,
  Plus,
  Send,
  Award,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  X,
  Zap,
  CheckSquare,
  BookOpen,
  Brain,
  Layers,
  Users,
  Bookmark,
} from 'lucide-react';

import { useTraining } from '../../context/TrainingContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useAssessments } from '../../context/AssessmentContext';
import { useBootcamps } from '../../context/BootcampContext';
import { PlanTrainingModal } from '../Training/PlanTrainingModal';
import { ScheduleSessionModal } from '../Sessions/ScheduleSessionModal';
import { CreateAssessmentModal } from '../Assessments/CreateAssessmentModal';

interface CommandCenterViewProps {
  onNavigate?: (navId: string, filter?: 'active' | 'project-ready' | 'needs-attention' | null) => void;
  onSelectTrainee?: (traineeId: string, initialTab?: string) => void;
  onSelectBootcamp?: (bootcampId: string, initialTab?: string) => void;
}

interface ActionItem {
  id: string;
  type: 'HIGH' | 'REMINDER' | 'FEEDBACK' | 'CERTIFICATION' | 'ASSESSMENT';
  title: string;
  program: string;
  description: string;
  meta: string;
  actionText: string;
  targetNav: string;
}

const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'act-1',
    type: 'HIGH',
    title: 'Trainer Availability Pending',
    program: 'Informatica Training',
    description: 'Michael Paul has not responded to trainer availability request for Q4 batch.',
    meta: 'Due: Today',
    actionText: 'Review →',
    targetNav: 'training',
  },
  {
    id: 'act-2',
    type: 'REMINDER',
    title: '1-Day Pre-Session Reminder Due',
    program: 'Antigravity Training',
    description: '18 registered participants + lead trainer awaiting automated email dispatch.',
    meta: 'Send: 2:00 PM',
    actionText: 'View Reminder →',
    targetNav: 'calendar',
  },
  {
    id: 'act-3',
    type: 'FEEDBACK',
    title: '6 Session Feedbacks Pending',
    program: 'Knowledge Sharing Series',
    description: 'Feedback completion currently at 67%. Target response rate is 85%.',
    meta: '6 Pending',
    actionText: 'Review →',
    targetNav: 'feedback',
  },
  {
    id: 'act-4',
    type: 'CERTIFICATION',
    title: 'Management Resource Gap',
    program: 'Informatica Specialist',
    description: 'Management requested 10 certified resources. 6 available, 4 gap remaining.',
    meta: 'Gap: 4',
    actionText: 'Find Resources →',
    targetNav: 'certifications',
  },
  {
    id: 'act-5',
    type: 'ASSESSMENT',
    title: 'Low Assessment Score Alert',
    program: 'SQL & Database Core',
    description: '2 trainees scored below 70% passing threshold in latest evaluation.',
    meta: '2 Trainees',
    actionText: 'Review Scores →',
    targetNav: 'assessments',
  },
  {
    id: 'act-6',
    type: 'HIGH',
    title: 'Unassigned Lead Trainer',
    program: 'Business Analyst Foundations',
    description: 'Training plan is approved but requires assigned lead trainer before scheduling.',
    meta: 'Action Required',
    actionText: 'Find Trainer →',
    targetNav: 'training',
  },
];

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({ onNavigate }) => {
  // Action Items State
  const [actionItems, setActionItems] = useState<ActionItem[]>(INITIAL_ACTION_ITEMS);
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);

  // Command Palette State (Ctrl + K)
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals State
  const [showPlanTrainingModal, setShowPlanTrainingModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard shortcut Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDismissAction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionItems((prev) => prev.filter((item) => item.id !== id));
    triggerToast('Item marked as reviewed');
  };

  const filteredActionItems = activeKpiFilter === 'needs-attention'
    ? actionItems.filter((i) => i.type === 'HIGH' || i.type === 'CERTIFICATION')
    : actionItems;

  const commandOptions = [
    { title: 'Plan Training Program', category: 'Training', icon: <BookOpen size={14} />, action: () => { setShowPlanTrainingModal(true); setShowCommandPalette(false); } },
    { title: 'Schedule Training Session', category: 'Calendar', icon: <CalendarIcon size={14} />, action: () => { setShowScheduleModal(true); setShowCommandPalette(false); } },
    { title: 'Create Assessment', category: 'Assessments', icon: <CheckSquare size={14} />, action: () => { setShowAssessmentModal(true); setShowCommandPalette(false); } },
    { title: 'Find Certified Resources', category: 'Certifications', icon: <Award size={14} />, action: () => { onNavigate?.('certifications'); setShowCommandPalette(false); } },
    { title: 'View Pending Feedback Requests', category: 'Feedback', icon: <Clock size={14} />, action: () => { onNavigate?.('feedback'); setShowCommandPalette(false); } },
    { title: 'Open Today Calendar', category: 'Calendar', icon: <CalendarIcon size={14} />, action: () => { onNavigate?.('calendar'); setShowCommandPalette(false); } },
    { title: 'Find Available Trainer', category: 'Training', icon: <UserCheck size={14} />, action: () => { onNavigate?.('training'); setShowCommandPalette(false); } },
  ].filter((c) => c.title.toLowerCase().includes(commandQuery.toLowerCase()) || c.category.toLowerCase().includes(commandQuery.toLowerCase()));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="assessment-ops-container space-y-5 pb-10"
    >
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="global-toast-banner"
          >
            <CheckCircle2 size={16} className="toast-icon text-teal-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO HEADER CARD (CLEAN DESIGN SYSTEM HEADER MATCHING ASSESSMENTS & BOOTCAMPS) */}
      <header className="asm-header-glass-card">
        <div className="header-left-title-group space-y-2">
          <div className="hero-eyebrow-badge">
            <span>ENTERPRISE LEARNING OPERATIONS</span>
          </div>

          <h1 className="header-main-title">
            Command Center
          </h1>

          <p className="header-subtitle-text max-w-2xl">
            Your priorities, schedules and automation at a glance. Good Morning, L&amp;D Team.
          </p>

          <div className="hero-compact-metrics-row pt-1">
            <span className="hero-metric-pill">
              <CalendarIcon size={14} className="pill-icon text-teal-600" />
              <strong className="pill-val">3</strong>
              <span className="pill-label">Sessions Today</span>
            </span>

            <span className="hero-metric-pill">
              <AlertTriangle size={14} className="pill-icon text-rose-600" />
              <strong className="pill-val">6</strong>
              <span className="pill-label">Action Required</span>
            </span>

            <span className="hero-metric-pill">
              <Zap size={14} className="pill-icon text-amber-600" />
              <strong className="pill-val">Live</strong>
              <span className="pill-label">Automation Active</span>
            </span>
          </div>
        </div>

        <div className="header-right-action flex flex-col items-end gap-3">
          <div className="hero-context-badge">
            <span className="badge-year">2026</span>
            <span className="badge-label">LIVE OPERATIONS YEAR</span>
          </div>

          <button
            type="button"
            className="create-asm-primary-btn"
            onClick={() => setShowCommandPalette(true)}
          >
            <Search size={16} />
            <span>Quick Command ⌘K</span>
          </button>
        </div>
      </header>

      {/* 2. TOP 5 OPERATIONAL KPI CARDS */}
      <div className="asm-kpi-cards-5row">
        {/* KPI 1: Training Today */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.08 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="asm-kpi-card-box cursor-pointer group shadow-sm hover:shadow-md"
          onClick={() => onNavigate?.('calendar')}
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">TRAINING TODAY</span>
            <div className="kpi-icon-badge teal group-hover:scale-110 transition-transform">
              <CalendarIcon size={16} />
            </div>
          </div>
          <div className="kpi-num-display">3</div>
          <div className="flex items-center justify-between">
            <span className="kpi-desc-text">Sessions scheduled today</span>
            <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-teal-600 transition-all" />
          </div>
        </motion.div>

        {/* KPI 2: Awaiting Trainer Response */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.13 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="asm-kpi-card-box cursor-pointer group shadow-sm hover:shadow-md"
          onClick={() => onNavigate?.('training')}
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">AWAITING TRAINER</span>
            <div className="kpi-icon-badge indigo group-hover:scale-110 transition-transform">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="kpi-num-display">4</div>
          <div className="flex items-center justify-between">
            <span className="kpi-desc-text">Availability requests pending</span>
            <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
          </div>
        </motion.div>

        {/* KPI 3: Ready to Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.18 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="asm-kpi-card-box cursor-pointer group shadow-sm hover:shadow-md"
          onClick={() => onNavigate?.('training')}
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">READY TO SCHEDULE</span>
            <div className="kpi-icon-badge emerald group-hover:scale-110 transition-transform">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="kpi-num-display">2</div>
          <div className="flex items-center justify-between">
            <span className="kpi-desc-text">Confirmed trainers ready</span>
            <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
          </div>
        </motion.div>

        {/* KPI 4: Reminders Due */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.23 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="asm-kpi-card-box cursor-pointer group shadow-sm hover:shadow-md"
          onClick={() => onNavigate?.('calendar')}
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text">REMINDERS DUE</span>
            <div className="kpi-icon-badge amber group-hover:scale-110 transition-transform">
              <Bell size={16} />
            </div>
          </div>
          <div className="kpi-num-display text-amber-600 dark:text-amber-400">5</div>
          <div className="flex items-center justify-between">
            <span className="kpi-desc-text">Automated notifications today</span>
            <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
          </div>
        </motion.div>

        {/* KPI 5: Needs Attention */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.28 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className={`asm-kpi-card-box cursor-pointer group shadow-sm hover:shadow-md ${
            activeKpiFilter === 'needs-attention' ? 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-950/20' : ''
          }`}
          onClick={() => setActiveKpiFilter(activeKpiFilter === 'needs-attention' ? null : 'needs-attention')}
        >
          <div className="kpi-card-header">
            <span className="kpi-label-text text-rose">NEEDS ATTENTION</span>
            <div className="kpi-icon-badge rose group-hover:scale-110 transition-transform">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="kpi-num-display text-rose">{actionItems.length}</div>
          <div className="flex items-center justify-between">
            <span className="kpi-desc-text">
              {activeKpiFilter === 'needs-attention' ? 'Filtered Active' : 'Items requiring L&D action'}
            </span>
            <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-rose-600 transition-all" />
          </div>
        </motion.div>
      </div>

      {/* 3. PRIMARY OPERATIONAL GRID (2/3 LEFT, 1/3 RIGHT) */}
      <div className="cmd-ops-grid">
        {/* LEFT COLUMN: ACTION REQUIRED & MANAGEMENT REQUESTS */}
        <div className="space-y-5">
          {/* SECTION A: ACTION REQUIRED */}
          <div className="cmd-card-box shadow-sm">
            <div className="cmd-section-header">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Action Required
                </h3>
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 font-extrabold text-xs flex items-center justify-center">
                  {filteredActionItems.length}
                </span>
                {activeKpiFilter && (
                  <button
                    type="button"
                    className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 ml-2"
                    onClick={() => setActiveKpiFilter(null)}
                  >
                    <X size={12} /> Clear Filter
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-500">Items requiring L&amp;D review or action.</span>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence>
                {filteredActionItems.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">You're All Caught Up!</h4>
                    <p className="text-xs text-slate-500">No pending operational action items at this moment.</p>
                  </div>
                ) : (
                  filteredActionItems.map((item) => {
                    const badgeClass = item.type.toLowerCase();
                    const iconMap = {
                      HIGH: <AlertTriangle size={12} />,
                      REMINDER: <Bell size={12} />,
                      FEEDBACK: <Clock size={12} />,
                      CERTIFICATION: <Award size={12} />,
                      ASSESSMENT: <CheckSquare size={12} />,
                    };
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.22 }}
                        className="cmd-action-item-card"
                      >
                        <div className="cmd-action-item-left">
                          <span className={`cmd-action-badge-pill ${badgeClass}`}>
                            {iconMap[item.type]}
                            <span>{item.type}</span>
                          </span>

                          <div className="min-w-0">
                            <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              {item.title} <span className="font-normal text-slate-500">• {item.program}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="cmd-action-item-right">
                          <span className="cmd-action-meta-lbl">
                            {item.meta}
                          </span>
                          <button
                            type="button"
                            className="cmd-action-cta-btn"
                            onClick={() => onNavigate?.(item.targetNav)}
                          >
                            <span>{item.actionText}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SECTION B: MANAGEMENT REQUESTS */}
          <div className="mgmt-card-box">
            <div className="mgmt-section-header">
              <div className="mgmt-header-left">
                <div className="mgmt-icon-badge">
                  <Bookmark size={18} />
                </div>
                <div className="mgmt-header-title-group">
                  <div className="mgmt-title-row">
                    <h3 className="mgmt-main-title">
                      Active Management Requests
                    </h3>
                    <span className="mgmt-active-count-badge">
                      <span className="mgmt-pulse-dot" /> 2 Active
                    </span>
                  </div>
                  <p className="mgmt-subtitle-text">
                    Priority skill and training requisitions from leadership
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="mgmt-view-all-btn"
                onClick={() => onNavigate?.('certifications')}
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="mgmt-cards-grid">
              {/* Request 1: Certification Request */}
              <div className="mgmt-request-card">
                <div className="mgmt-card-top-accent teal" />
                
                <div className="mgmt-card-body">
                  <div className="mgmt-card-meta-row">
                    <span className="mgmt-badge-pill cert">
                      <Award size={13} /> CERTIFICATION REQUEST
                    </span>
                    <span className="mgmt-status-chip gap">
                      <AlertTriangle size={12} /> Gap: 4
                    </span>
                  </div>

                  <h4 className="mgmt-request-title">
                    Need 10 Informatica Certified Resources
                  </h4>

                  <div className="mgmt-metrics-wrapper">
                    <div className="mgmt-metrics-row">
                      <span className="mgmt-metrics-value">
                        6 Available / 10 Requested
                      </span>
                      <span className="mgmt-percent-badge">
                        60% Met
                      </span>
                    </div>

                    <div className="mgmt-progress-track">
                      <div
                        className="mgmt-progress-fill"
                        style={{ width: '60%' }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mgmt-cta-button"
                  onClick={() => onNavigate?.('certifications')}
                >
                  <span>Find Certified Resources</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Request 2: Training Request */}
              <div className="mgmt-request-card">
                <div className="mgmt-card-top-accent indigo" />

                <div className="mgmt-card-body">
                  <div className="mgmt-card-meta-row">
                    <span className="mgmt-badge-pill training">
                      <BookOpen size={13} /> TRAINING REQUEST
                    </span>
                    <span className="mgmt-status-chip planning">
                      <Clock size={12} /> Planning
                    </span>
                  </div>

                  <h4 className="mgmt-request-title">
                    Power BI Advanced Training for BA Team
                  </h4>

                  <div className="mgmt-detail-tiles-grid">
                    <div className="mgmt-detail-tile">
                      <div className="mgmt-detail-icon-box teal">
                        <Users size={14} />
                      </div>
                      <div className="mgmt-detail-content">
                        <span className="mgmt-detail-label">Audience</span>
                        <span className="mgmt-detail-value">15 Analysts</span>
                      </div>
                    </div>

                    <div className="mgmt-detail-tile">
                      <div className="mgmt-detail-icon-box indigo">
                        <CalendarIcon size={14} />
                      </div>
                      <div className="mgmt-detail-content">
                        <span className="mgmt-detail-label">Preferred</span>
                        <span className="mgmt-detail-value">Sept 2026</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mgmt-cta-button"
                  onClick={() => onNavigate?.('training')}
                >
                  <span>Review Training Plan</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TODAY & UPCOMING, AUTOMATION & LEARNING HEALTH */}
        <div className="space-y-5">
          {/* SECTION A: TODAY & UPCOMING */}
          <div className="agenda-card-box">
            <div className="agenda-header">
              <div className="agenda-header-left">
                <div className="agenda-icon-box">
                  <Clock size={18} />
                </div>
                <h3 className="agenda-title">
                  Today &amp; Upcoming
                </h3>
              </div>
              <button
                type="button"
                className="agenda-btn-link"
                onClick={() => onNavigate?.('calendar')}
              >
                <span>View Calendar</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="agenda-section-group">
              <div>
                <span className="agenda-label-heading">
                  TODAY SESSIONS
                </span>
                <div className="agenda-list">
                  <div className="agenda-item-card live">
                    <div className="agenda-item-top">
                      <span className="agenda-time-pill">
                        <Clock size={12} /> 10:00 – 11:00 AM
                      </span>
                      <span className="agenda-status-live">
                        <span className="agenda-live-dot" /> Live Now
                      </span>
                    </div>
                    <h4 className="agenda-item-title">Knowledge Sharing Series</h4>
                    <div className="agenda-item-meta">
                      <span>Sarah David</span> • <span className="agenda-track-tag">DE Track</span>
                    </div>
                  </div>

                  <div className="agenda-item-card upcoming">
                    <div className="agenda-item-top">
                      <span className="agenda-time-pill">
                        <Clock size={12} /> 02:00 – 04:00 PM
                      </span>
                      <span className="agenda-status-upcoming">Upcoming</span>
                    </div>
                    <h4 className="agenda-item-title">Informatica Training</h4>
                    <div className="agenda-item-meta">
                      <span>Michael Paul</span> • <span className="agenda-track-tag">Tools Track</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="agenda-label-heading gray">
                  TOMORROW
                </span>
                <div className="agenda-list">
                  <div className="agenda-item-card tomorrow">
                    <div className="agenda-item-top">
                      <span className="agenda-time-pill">
                        <Clock size={12} /> 11:00 AM – 12:00 PM
                      </span>
                    </div>
                    <h4 className="agenda-item-title">Business Requirements Workshop</h4>
                    <div className="agenda-item-meta">
                      <span>Priya Sharma</span> • <span className="agenda-track-tag">BA Track</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: LIVE AUTOMATION CENTER */}
          <div className="auto-card-box">
            <div className="auto-header">
              <div className="auto-header-left">
                <div className="auto-icon-box">
                  <Zap size={18} />
                </div>
                <h3 className="auto-title">
                  Automation Center
                </h3>
              </div>
              <span className="auto-live-badge">
                <span className="mgmt-pulse-dot" /> Live Stream
              </span>
            </div>

            <div className="auto-metrics-grid">
              <div className="auto-metric-tile amber">
                <span className="auto-metric-label amber">REMINDERS</span>
                <strong className="auto-metric-val">5 Emails Due</strong>
              </div>
              <div className="auto-metric-tile indigo">
                <span className="auto-metric-label indigo">SCHEDULED</span>
                <strong className="auto-metric-val">12 Jobs Active</strong>
              </div>
            </div>

            {/* Automation Live Activity Stream */}
            <div className="auto-stream-wrapper">
              <span className="auto-stream-label">
                RECENT AUTOMATION STREAM
              </span>
              <div className="auto-stream-list">
                <div className="auto-stream-card">
                  <div className="auto-stream-left">
                    <div className="auto-stream-icon-box teal">
                      <Send size={13} />
                    </div>
                    <div className="auto-stream-text-content">
                      <h5 className="auto-stream-title">
                        Availability request sent
                      </h5>
                      <span className="auto-stream-subtitle">
                        Sarah David • Knowledge Sharing
                      </span>
                    </div>
                  </div>
                  <span className="auto-stream-time-badge">11:30 AM</span>
                </div>

                <div className="auto-stream-card">
                  <div className="auto-stream-left">
                    <div className="auto-stream-icon-box amber">
                      <Clock size={13} />
                    </div>
                    <div className="auto-stream-text-content">
                      <h5 className="auto-stream-title">
                        Feedback reminder queued
                      </h5>
                      <span className="auto-stream-subtitle">
                        Antigravity Training • 6 Participants
                      </span>
                    </div>
                  </div>
                  <span className="auto-stream-time-badge">10:00 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: LEARNING HEALTH */}
          <div className="health-card-box">
            <div className="health-header">
              <div className="health-header-left">
                <div className="health-icon-box">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="health-title">
                  Learning Health
                </h3>
              </div>
              <span className="health-trend-badge">
                <TrendingUp size={12} /> ↑ 3% vs Q2
              </span>
            </div>

            <div className="health-metrics-grid">
              <div className="health-metric-card">
                <div className="health-metric-top">
                  <span className="health-metric-label">PROJECT READY</span>
                  <div className="health-metric-icon teal">
                    <UserCheck size={13} />
                  </div>
                </div>
                <div className="health-metric-val-row">
                  <strong className="health-metric-value">10</strong>
                </div>
              </div>

              <div className="health-metric-card">
                <div className="health-metric-top">
                  <span className="health-metric-label">COMPLETION</span>
                  <div className="health-metric-icon emerald">
                    <CheckCircle2 size={13} />
                  </div>
                </div>
                <div className="health-metric-val-row">
                  <strong className="health-metric-value teal">78%</strong>
                </div>
              </div>

              <div className="health-metric-card">
                <div className="health-metric-top">
                  <span className="health-metric-label">AVG ASSESSMENT</span>
                  <div className="health-metric-icon indigo">
                    <CheckSquare size={13} />
                  </div>
                </div>
                <div className="health-metric-val-row">
                  <strong className="health-metric-value">82%</strong>
                </div>
              </div>

              <div className="health-metric-card">
                <div className="health-metric-top">
                  <span className="health-metric-label">AVG FEEDBACK</span>
                  <div className="health-metric-icon amber">
                    <Sparkles size={13} />
                  </div>
                </div>
                <div className="health-metric-val-row">
                  <strong className="health-metric-value amber">4.3 / 5</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. INLINE QUICK ACTIONS TOOLBAR */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2.5 flex-wrap shadow-xs">
        <span className="text-xs font-black uppercase text-slate-400 tracking-wider mr-2">Quick Actions:</span>
        <button
          type="button"
          className="cmd-quick-tile"
          onClick={() => setShowPlanTrainingModal(true)}
        >
          <Plus size={14} /> Plan Training
        </button>

        <button
          type="button"
          className="cmd-quick-tile"
          onClick={() => setShowScheduleModal(true)}
        >
          <CalendarIcon size={14} /> Schedule Session
        </button>

        <button
          type="button"
          className="cmd-quick-tile"
          onClick={() => setShowAssessmentModal(true)}
        >
          <CheckSquare size={14} /> Create Assessment
        </button>

        <button
          type="button"
          className="cmd-quick-tile"
          onClick={() => onNavigate?.('certifications')}
        >
          <Award size={14} /> Cert Request
        </button>

        <button
          type="button"
          className="cmd-quick-tile"
          onClick={() => onNavigate?.('feedback')}
        >
          <Send size={14} /> Send Reminder
        </button>
      </div>

      {/* ============================================================ */}
      {/* COMMAND PALETTE MODAL (Ctrl + K)                            */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showCommandPalette && (
          <div
            className="cert-modal-overlay"
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="cmd-palette-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cmd-palette-search-row">
                <Search size={18} className="text-teal-600 flex-shrink-0" />
                <input
                  type="text"
                  autoFocus
                  className="cmd-palette-input"
                  placeholder="Search actions, operations, or pages..."
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="cert-modal-close"
                  onClick={() => setShowCommandPalette(false)}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="cmd-palette-options-list">
                {commandOptions.map((opt) => (
                  <button
                    key={opt.title}
                    type="button"
                    className="cmd-palette-option-btn"
                    onClick={opt.action}
                  >
                    <div className="cmd-palette-option-left">
                      <div className="cmd-palette-icon-badge">
                        {opt.icon}
                      </div>
                      <span className="cmd-palette-option-title">
                        {opt.title}
                      </span>
                    </div>
                    <span className="cmd-palette-category-chip">
                      {opt.category}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MODALS INTEGRATION                                           */}
      {/* ============================================================ */}

      {/* 1. PLAN TRAINING MODAL */}
      {showPlanTrainingModal && (
        <PlanTrainingModal onClose={() => setShowPlanTrainingModal(false)} />
      )}

      {/* 2. SCHEDULE SESSION MODAL */}
      {showScheduleModal && (
        <ScheduleSessionModal onClose={() => setShowScheduleModal(false)} />
      )}

      {/* 3. CREATE ASSESSMENT MODAL */}
      {showAssessmentModal && (
        <CreateAssessmentModal onClose={() => setShowAssessmentModal(false)} />
      )}
    </motion.div>
  );
};

export default CommandCenterView;
