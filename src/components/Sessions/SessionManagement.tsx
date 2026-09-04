import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Upload,
  BookOpen,
  Award,
  Sparkles,
  Bell,
  ListFilter,
  Layers,
  X,
  ExternalLink,
  ArrowRight,
  UserCheck,
  RotateCcw,
  Send,
  AlertCircle,
  Mail,
  Check,
} from 'lucide-react';
import { useSessions } from '../../context/SessionContext';
import { useBootcamps } from '../../context/BootcampContext';
import { Session } from '../../types/session';
import { ScheduleView } from './ScheduleView';
import { CalendarView } from './CalendarView';
import { ModuleView } from './ModuleView';
import { ScheduleSessionModal } from './ScheduleSessionModal';
import { RescheduleSessionModal } from './RescheduleSessionModal';
import { CancelSessionModal } from './CancelSessionModal';
import { ImportCalendarModal } from './ImportCalendarModal';
import { AIEmailPreviewModal } from './AIEmailPreviewModal';
import { CalendarOrbit } from './CalendarOrbit';
import { AnimatedCounter } from '../Common/AnimatedCounter';

const MOCK_TRAINING_QUEUE_ITEMS = [
  {
    id: 'q-1',
    title: 'Knowledge Sharing Series',
    topic: 'Databricks Performance Optimization & Cluster Tuning',
    track: 'DE',
    trainerName: 'Sarah David',
    status: 'Trainer Available',
    preferredDate: '2026-09-18',
    preferredTime: '15:00 - 16:00',
    type: 'Knowledge Sharing',
  },
  {
    id: 'q-2',
    title: 'Technical Deep Dive',
    topic: 'Agile BRD Authoring & User Story Mapping',
    track: 'BA',
    trainerName: 'John Mathew',
    status: 'Ready to Schedule',
    preferredDate: '2026-09-22',
    preferredTime: '10:00 - 12:00',
    type: 'Technical Training',
  },
  {
    id: 'q-3',
    title: 'Tool Masterclass',
    topic: 'dbt Core & Semantic Layer Models',
    track: 'Tools',
    trainerName: 'Alex Thomas',
    status: 'Trainer Available',
    preferredDate: '2026-09-25',
    preferredTime: '14:00 - 17:00',
    type: 'Tool Training',
  },
  {
    id: 'q-4',
    title: 'Internal Workshop',
    topic: 'Snowflake Snowpark & Python UDF Architectures',
    track: 'DE',
    trainerName: 'Awaiting Availability',
    status: 'Awaiting Trainer',
    preferredDate: '2026-09-28',
    preferredTime: '11:00 - 13:00',
    type: 'Workshop',
  },
  {
    id: 'q-5',
    title: 'Certification Prep',
    topic: 'Databricks Certified Data Engineer Associate Exam Review',
    track: 'Tools',
    trainerName: 'Awaiting Availability',
    status: 'Awaiting Trainer',
    preferredDate: '2026-09-30',
    preferredTime: '16:00 - 18:00',
    type: 'Certification Preparation',
  },
  {
    id: 'q-6',
    title: 'Lateral Bootcamp Workshop',
    topic: 'Kafka Real-Time Streaming & Consumer Group Balancing',
    track: 'DE',
    trainerName: 'Awaiting Availability',
    status: 'Awaiting Trainer',
    preferredDate: '2026-10-02',
    preferredTime: '14:00 - 16:00',
    type: 'Bootcamp',
  },
  {
    id: 'q-7',
    title: 'Management Training',
    topic: 'Sprint Velocity Tracking & Agile Capacity Planning',
    track: 'BA',
    trainerName: 'Priya Sharma',
    status: 'Ready to Schedule',
    preferredDate: '2026-10-05',
    preferredTime: '10:00 - 11:30',
    type: 'Technical Training',
  },
];

const MOCK_REMINDER_ITEMS = [
  {
    id: 'rem-1',
    sessionTitle: 'Knowledge Sharing Series — Databricks Optimization',
    recipient: 'sarah.david@systechusa.com + 18 Participants',
    rule: '1-Day Before Reminder',
    scheduledFor: '17 Sep 2026 • 3:00 PM',
    status: '● Queued (Active)',
  },
  {
    id: 'rem-2',
    sessionTitle: 'Databricks Cluster Tuning Masterclass',
    recipient: 'alex.thomas@systechusa.com + 25 Participants',
    rule: '1-Hour Before Reminder',
    scheduledFor: '18 Sep 2026 • 2:00 PM',
    status: '● Queued (Active)',
  },
  {
    id: 'rem-3',
    sessionTitle: 'Agile User Story Mapping & BRD Workshop',
    recipient: 'john.mathew@systechusa.com + 15 Participants',
    rule: '1-Day Before Reminder',
    scheduledFor: '21 Sep 2026 • 10:00 AM',
    status: '● Queued (Active)',
  },
  {
    id: 'rem-4',
    sessionTitle: 'Trainer Availability Confirmation Request',
    recipient: 'ramesh@systechusa.com',
    rule: 'Trainer Request Notification',
    scheduledFor: 'Today • 09:15 AM',
    status: '✓ Simulated Sent',
  },
  {
    id: 'rem-5',
    sessionTitle: 'Python Data Engineering Foundation',
    recipient: 'sneha@systechusa.com + 28 Participants',
    rule: 'Session Confirmation Notice',
    scheduledFor: 'Yesterday • 4:30 PM',
    status: '✓ Delivered',
  },
];

interface SessionManagementProps {
  onSelectSession: (sessionId: string, initialTab?: string) => void;
  onOpenAttendance: (sessionId: string) => void;
}

export const SessionManagement: React.FC<SessionManagementProps> = ({
  onSelectSession,
  onOpenAttendance,
}) => {
  const { sessions, markCompleted } = useSessions();
  const { bootcamps, showToast } = useBootcamps();

  // Reminder Center Interactive State
  const [reminderList, setReminderList] = useState(MOCK_REMINDER_ITEMS);
  const [reminderTab, setReminderTab] = useState<'All' | 'Queued' | 'Sent'>('All');

  // Trigger handlers
  const handleTriggerSingleReminder = (remItem: (typeof MOCK_REMINDER_ITEMS)[0]) => {
    setReminderList((prev) =>
      prev.map((r) => (r.id === remItem.id ? { ...r, status: '✓ Delivered' } : r))
    );
    showToast(`Automated reminder email dispatched to ${remItem.recipient}!`);
  };

  const handleTriggerAllReminders = () => {
    setReminderList((prev) => prev.map((r) => ({ ...r, status: '✓ Delivered' })));
    showToast('Dispatched all pending automated reminder notifications!');
  };

  const filteredReminders = reminderList.filter((rem) => {
    if (reminderTab === 'Queued') return rem.status.includes('Queued');
    if (reminderTab === 'Sent') return !rem.status.includes('Queued');
    return true;
  });

  // Master View Mode State — DEFAULTS TO CALENDAR!
  const [viewMode, setViewMode] = useState<'calendar' | 'schedule' | 'modules'>('calendar');

  // Search & Dynamic Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('All');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('January 2026');
  const [selectedEventType, setSelectedEventType] = useState<string>('All');

  // Operational Control Center States
  const [showTrainingQueue, setShowTrainingQueue] = useState(false);
  const [showReminderCenter, setShowReminderCenter] = useState(false);
  const [queueTab, setQueueTab] = useState<'All' | 'Awaiting Trainer' | 'Ready to Schedule'>('All');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'scheduled' | 'awaiting-trainer' | 'ready-to-schedule' | 'today' | 'reminders-due' | null>(null);
  const [prefilledSessionData, setPrefilledSessionData] = useState<Session | undefined>(undefined);

  // Modal Triggers
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [aiPreviewSession, setAiPreviewSession] = useState<{ session: Session; actionType: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' } | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [reschedulingSession, setReschedulingSession] = useState<Session | null>(null);
  const [cancellingSession, setCancellingSession] = useState<Session | null>(null);

  // Dynamic Options derived from Dataset
  const dynamicTrainers = Array.from(
    new Set(sessions.map((s) => s.trainerName).filter((tr): tr is string => Boolean(tr)))
  ).sort();

  // Operational KPI Cards (5 small single-row cards)
  const totalEvents = sessions.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = sessions.filter((s) => s.sessionDate === todayStr && s.status !== 'Cancelled').length;
  const upcomingCount = sessions.filter((s) => s.sessionDate >= todayStr && s.status !== 'Cancelled').length;

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedModule('All');
    setSelectedTrainer('All');
    setSelectedTrack('All');
    setSelectedEventType('All');
    setSelectedDateFilter('January 2026');
    setActiveKpiFilter(null);
  };

  // KPI Card Click Handler
  const handleKpiCardClick = (filterType: 'scheduled' | 'awaiting-trainer' | 'ready-to-schedule' | 'today' | 'reminders-due') => {
    setActiveKpiFilter(filterType);

    if (filterType === 'awaiting-trainer') {
      setShowTrainingQueue(true);
      setQueueTab('Awaiting Trainer');
    } else if (filterType === 'ready-to-schedule') {
      setShowTrainingQueue(true);
      setQueueTab('Ready to Schedule');
    } else if (filterType === 'reminders-due') {
      setShowReminderCenter(true);
    } else if (filterType === 'today') {
      setSearchQuery(todayStr);
    } else if (filterType === 'scheduled') {
      setSelectedEventType('All');
    }
  };

  // Filter Logic
  const filteredSessions = sessions.filter((s) => {
    if (activeKpiFilter === 'scheduled') {
      if (s.status === 'Cancelled') return false;
    }

    const matchesSearch =
      s.agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.trainerName && s.trainerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.moduleName && s.moduleName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.moduleOwner && s.moduleOwner.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesModule = selectedModule === 'All' || s.moduleName === selectedModule;
    const matchesTrainer = selectedTrainer === 'All' || (s.trainerName && s.trainerName.includes(selectedTrainer));
    const matchesTrack = selectedTrack === 'All' || s.learningTrack === selectedTrack;
    const matchesEventType = selectedEventType === 'All' || s.eventType === selectedEventType;

    return matchesSearch && matchesModule && matchesTrainer && matchesTrack && matchesEventType;
  });

  const filteredQueue = MOCK_TRAINING_QUEUE_ITEMS.filter((item) => {
    if (queueTab === 'Awaiting Trainer') return item.status === 'Awaiting Trainer';
    if (queueTab === 'Ready to Schedule') return item.status === 'Ready to Schedule' || item.status === 'Trainer Available';
    return true;
  });

  return (
    <div className="training-calendar-page">
      {/* AMBIENT BACKGROUND GLOW ORBS */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />

      {/* 1. UNIFIED PREMIUM HERO CARD WITH 3D ANIMATED ORBIT */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="unified-bootcamp-hero-card"
      >
        {/* LEFT SECTION: ANIMATED CALENDAR ORBIT */}
        <div className="hero-section-left">
          <CalendarOrbit />
        </div>

        {/* CENTER SECTION: EYEBROW, TITLE & SUBTITLE */}
        <div className="hero-section-center">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hero-eyebrow-badge"
          >
            <span>L&amp;D LEARNING OPERATIONS</span>
            <ChevronRight size={12} className="inline" />
            <span className="text-teal-600 dark:text-teal-400 font-bold">L&amp;D Calendar</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="hero-title"
          >
            L&amp;D Calendar
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="hero-subtitle"
          >
            Manage all organization-wide training schedules, pending sessions, trainer confirmations, reminders and upcoming learning activities.
          </motion.p>
        </div>

        {/* RIGHT SECTION: ACTION COMMAND BUTTONS */}
        <div className="hero-section-right flex items-center gap-2">
          <button
            type="button"
            className={`ui-button-secondary ${showTrainingQueue ? 'active' : ''}`}
            onClick={() => setShowTrainingQueue(!showTrainingQueue)}
          >
            <ListFilter size={15} /> Training Queue ({MOCK_TRAINING_QUEUE_ITEMS.length})
          </button>

          <button
            type="button"
            className={`ui-button-secondary ${showReminderCenter ? 'active' : ''}`}
            onClick={() => setShowReminderCenter(true)}
          >
            <Bell size={15} className="text-teal-600 dark:text-teal-400" /> Reminder Center ({MOCK_REMINDER_ITEMS.filter(r => r.status.includes('Queued')).length})
          </button>

          <button
            type="button"
            className="ui-button-primary micro-btn"
            onClick={() => {
              setPrefilledSessionData(undefined);
              setShowScheduleModal(true);
            }}
          >
            <Plus size={16} className="btn-plus-icon" /> Schedule Session
          </button>
        </div>
      </motion.div>

      {/* 2. TOP 5 OPERATIONAL SUMMARY KPI CARDS */}
      <section className="compact-glass-metrics-strip my-2">
        <div
          className={`glass-metric-tile interactive ${activeKpiFilter === 'scheduled' ? 'active' : ''}`}
          onClick={() => handleKpiCardClick('scheduled')}
          title="Click to filter scheduled sessions"
        >
          <span className="metric-tile-val"><AnimatedCounter value={28} /></span>
          <span className="metric-tile-lbl">Scheduled</span>
        </div>

        <div className="metric-tile-divider" />

        <div
          className={`glass-metric-tile interactive ${activeKpiFilter === 'awaiting-trainer' ? 'active' : ''}`}
          onClick={() => handleKpiCardClick('awaiting-trainer')}
          title="Click to view requests awaiting trainer response"
        >
          <span className="metric-tile-val text-amber-600 dark:text-amber-400"><AnimatedCounter value={4} /></span>
          <span className="metric-tile-lbl">Awaiting Trainer</span>
        </div>

        <div className="metric-tile-divider" />

        <div
          className={`glass-metric-tile interactive ${activeKpiFilter === 'ready-to-schedule' ? 'active' : ''}`}
          onClick={() => handleKpiCardClick('ready-to-schedule')}
          title="Click to view sessions ready to schedule"
        >
          <span className="metric-tile-val text-emerald-600 dark:text-emerald-400"><AnimatedCounter value={3} /></span>
          <span className="metric-tile-lbl">Ready to Schedule</span>
        </div>

        <div className="metric-tile-divider" />

        <div
          className={`glass-metric-tile interactive ${activeKpiFilter === 'today' ? 'active' : ''}`}
          onClick={() => handleKpiCardClick('today')}
          title="Click to view sessions scheduled today"
        >
          <span className="metric-tile-val text-teal-600 dark:text-teal-400"><AnimatedCounter value={todayCount || 2} /></span>
          <span className="metric-tile-lbl">Today</span>
        </div>

        <div className="metric-tile-divider" />

        <div
          className={`glass-metric-tile interactive ${activeKpiFilter === 'reminders-due' ? 'active' : ''}`}
          onClick={() => handleKpiCardClick('reminders-due')}
          title="Click to open Automated Reminder Center"
        >
          <span className="metric-tile-val text-cyan-600 dark:text-cyan-400"><AnimatedCounter value={5} /></span>
          <span className="metric-tile-lbl">Reminders Due</span>
        </div>
      </section>

      {/* ACTIVE KPI FILTER BAR */}
      {activeKpiFilter && (
        <div className="kpi-filter-active-bar">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Active KPI Filter: <span className="capitalize font-extrabold text-teal-700 dark:text-teal-300">{activeKpiFilter.replace('-', ' ')}</span>
            </span>
          </div>
          <button
            type="button"
            className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 flex items-center gap-1"
            onClick={handleClearFilters}
          >
            <RotateCcw size={12} /> Clear Filter
          </button>
        </div>
      )}

      {/* 3. COLLAPSIBLE TRAINING QUEUE PANEL */}
      {showTrainingQueue && (
        <div className="training-queue-panel">
          <div className="queue-panel-header">
            <div className="queue-panel-header-left">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ListFilter size={16} className="text-teal-600" /> TRAINING QUEUE ({MOCK_TRAINING_QUEUE_ITEMS.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pending training plans awaiting trainer response or scheduling confirmation.
              </p>
            </div>

            <div className="queue-panel-header-right">
              <div className="queue-tabs-wrap">
                {(['All', 'Awaiting Trainer', 'Ready to Schedule'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`queue-tab-pill ${queueTab === tab ? 'active' : ''}`}
                    onClick={() => setQueueTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="queue-close-btn"
                onClick={() => setShowTrainingQueue(false)}
                title="Close Panel"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="queue-cards-grid">
            {filteredQueue.map((item) => (
              <div key={item.id} className="queue-item-card">
                <div>
                  <div className="queue-card-top">
                    <span className="queue-track-chip">{item.track}</span>
                    <span className={`queue-status-chip ${item.status === 'Ready to Schedule' || item.status === 'Trainer Available' ? 'ready' : 'awaiting'}`}>
                      {item.status}
                    </span>
                  </div>

                  <h4 className="queue-title">{item.title}</h4>
                  <p className="queue-topic">{item.topic}</p>
                </div>

                <div className="queue-card-footer">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <div><strong>Trainer:</strong> {item.trainerName}</div>
                    <div><strong>Preferred:</strong> {item.preferredDate} ({item.preferredTime})</div>
                  </div>

                  <button
                    type="button"
                    className="ui-button-primary text-xs py-1 px-3"
                    onClick={() => {
                      setPrefilledSessionData({
                        id: 'queue-plan-' + item.id,
                        bootcampId: 'bc-1',
                        bootcampName: 'DE Bootcamp 2026',
                        sessionDate: item.preferredDate,
                        startTime: item.preferredTime.split(' - ')[0],
                        endTime: item.preferredTime.split(' - ')[1],
                        agenda: item.topic,
                        title: item.title,
                        moduleId: 'mod-1',
                        moduleName: item.topic,
                        trainerName: item.trainerName !== 'Awaiting Availability' ? item.trainerName : 'Sarah David',
                        learningTrack: (item.track === 'DE' ? 'Databricks' : item.track === 'BA' ? 'Common Foundation' : 'Shared') as any,
                        mode: 'Online',
                        status: 'Scheduled',
                        eventType: (item.type as any) || 'Training',
                        durationMinutes: 120,
                        attendanceApplicable: true,
                        attendanceRecorded: false,
                        attendedCount: 0,
                        totalEnrolled: 25,
                        createdAt: '2026-09-03',
                        updatedAt: '2026-09-03',
                      });
                      setShowScheduleModal(true);
                    }}
                  >
                    Schedule →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PREMIUM AUTOMATED REMINDER CENTER MODAL */}
      <AnimatePresence>
        {showReminderCenter && (
          <div
            className="rem-overlay"
            onClick={() => setShowReminderCenter(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="rem-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER STRIP */}
              <div className="rem-header">
                <div className="rem-header-left">
                  <div className="rem-icon-box">
                    <Bell size={22} />
                  </div>
                  <div className="rem-title-block">
                    <div className="rem-title-row">
                      <h3 className="rem-title">AUTOMATED REMINDER CENTER</h3>
                      <span className="rem-count-chip">
                        {reminderList.filter((r) => r.status.includes('Queued')).length} Pending Jobs
                      </span>
                    </div>
                    <p className="rem-subtitle">
                      Scheduled email notification jobs for upcoming training sessions &amp; trainer confirmations.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="rem-close-btn"
                  onClick={() => setShowReminderCenter(false)}
                  title="Close Modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* FILTER SEGMENTED TAB STRIP */}
              <div className="rem-toolbar">
                <div className="rem-tabs-group">
                  {(['All', 'Queued', 'Sent'] as const).map((tab) => {
                    const count =
                      tab === 'All'
                        ? reminderList.length
                        : tab === 'Queued'
                        ? reminderList.filter((r) => r.status.includes('Queued')).length
                        : reminderList.filter((r) => !r.status.includes('Queued')).length;
                    return (
                      <button
                        key={tab}
                        type="button"
                        className={`rem-tab-btn ${reminderTab === tab ? 'active' : ''}`}
                        onClick={() => setReminderTab(tab)}
                      >
                        {tab} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="rem-engine-status">
                  <CheckCircle2 size={13} /> Auto-Dispatch Engine Active
                </div>
              </div>

              {/* REMINDER ITEMS LIST */}
              <div className="rem-body-list custom-scrollbar">
                {filteredReminders.map((rem) => {
                  const isQueued = rem.status.includes('Queued');
                  return (
                    <motion.div
                      key={rem.id}
                      whileHover={{ y: -2 }}
                      className="rem-card-item"
                    >
                      <div className="rem-card-info">
                        <h4 className="rem-session-title">{rem.sessionTitle}</h4>

                        <div className="rem-recipient-pill">
                          <Mail size={12} />
                          <span>To: {rem.recipient}</span>
                        </div>

                        <div className="rem-rule-meta">
                          <span className="flex items-center gap-1">
                            <Sparkles size={11} className="text-amber-500" /> {rem.rule}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {rem.scheduledFor}
                          </span>
                        </div>
                      </div>

                      <div className="rem-card-actions">
                        <span className={`rem-status-badge ${isQueued ? 'queued' : 'delivered'}`}>
                          {rem.status}
                        </span>

                        {isQueued ? (
                          <button
                            type="button"
                            className="rem-trigger-btn"
                            onClick={() => handleTriggerSingleReminder(rem)}
                          >
                            <Send size={11} /> Trigger Now →
                          </button>
                        ) : (
                          <span className="rem-dispatched-text">
                            <CheckCircle2 size={12} /> Dispatched
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* FOOTER */}
              <div className="rem-footer">
                <div className="rem-footer-note">
                  <Check size={14} className="text-teal-600" /> 1-Day &amp; 1-Hour automated notification triggers active
                </div>

                <div className="rem-footer-cmds">
                  <button
                    type="button"
                    className="rem-btn-all"
                    onClick={handleTriggerAllReminders}
                  >
                    <Send size={13} /> Trigger All Pending
                  </button>

                  <button
                    type="button"
                    className="rem-btn-close"
                    onClick={() => setShowReminderCenter(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MAIN CALENDAR CONTAINER */}
      <section className="main-calendar-content-section mt-2">
        {viewMode === 'calendar' && (
          <CalendarView
            sessions={filteredSessions}
            onSelectSession={onSelectSession}
            onScheduleForDate={(dStr) => setShowScheduleModal(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
            selectedTrainer={selectedTrainer}
            setSelectedTrainer={setSelectedTrainer}
            selectedEventType={selectedEventType}
            setSelectedEventType={setSelectedEventType}
            onClearFilters={handleClearFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            dynamicTrainers={dynamicTrainers}
          />
        )}

        {viewMode === 'schedule' && (
          <ScheduleView
            sessions={filteredSessions}
            onSelectSession={onSelectSession}
            onEditSession={(s: Session) => setEditingSession(s)}
            onRescheduleSession={(s: Session) => setReschedulingSession(s)}
            onCancelSession={(s: Session) => setCancellingSession(s)}
            onMarkCompleted={(id: string) => markCompleted(id)}
            onOpenAttendance={onOpenAttendance}
            onBackToCalendar={() => setViewMode('calendar')}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}

        {viewMode === 'modules' && (
          <ModuleView
            sessions={filteredSessions}
            onSelectSession={onSelectSession}
            onBackToCalendar={() => setViewMode('calendar')}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}
      </section>

      {/* MODALS */}
      {showScheduleModal && (
        <ScheduleSessionModal
          initialData={prefilledSessionData}
          onClose={() => {
            setShowScheduleModal(false);
            setPrefilledSessionData(undefined);
          }}
          onSuccess={(newSession) => {
            setShowScheduleModal(false);
            setPrefilledSessionData(undefined);
            setAiPreviewSession({ session: newSession, actionType: 'SCHEDULED' });
          }}
        />
      )}

      {showImportModal && (
        <ImportCalendarModal onClose={() => setShowImportModal(false)} />
      )}

      {reschedulingSession && (
        <RescheduleSessionModal
          session={reschedulingSession}
          onClose={() => setReschedulingSession(null)}
          onSuccess={(updated) => {
            setReschedulingSession(null);
            setAiPreviewSession({ session: updated, actionType: 'RESCHEDULED' });
          }}
        />
      )}

      {cancellingSession && (
        <CancelSessionModal
          session={cancellingSession}
          onClose={() => setCancellingSession(null)}
          onSuccess={(updated) => {
            setCancellingSession(null);
            setAiPreviewSession({ session: updated, actionType: 'CANCELLED' });
          }}
        />
      )}

      {/* AI TRAINER EMAIL PREVIEW MODAL */}
      {aiPreviewSession && (
        <AIEmailPreviewModal
          session={aiPreviewSession.session}
          actionType={aiPreviewSession.actionType}
          onClose={() => setAiPreviewSession(null)}
        />
      )}
    </div>
  );
};
