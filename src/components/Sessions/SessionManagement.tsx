import React, { useState } from 'react';
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
import { LearningJourneyPipeline } from './LearningJourneyPipeline';
import { HeaderOrbitWidget } from './HeaderOrbitWidget';
import { AnimatedCounter } from '../Common/AnimatedCounter';

interface SessionManagementProps {
  onSelectSession: (sessionId: string, initialTab?: string) => void;
  onOpenAttendance: (sessionId: string) => void;
}

export const SessionManagement: React.FC<SessionManagementProps> = ({
  onSelectSession,
  onOpenAttendance,
}) => {
  const { sessions, markCompleted } = useSessions();
  const { bootcamps } = useBootcamps();

  // Master View Mode State — DEFAULTS TO CALENDAR!
  const [viewMode, setViewMode] = useState<'calendar' | 'schedule' | 'modules'>('calendar');

  // Search & Dynamic Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('All');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('January 2026');
  const [selectedEventType, setSelectedEventType] = useState<string>('All');

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
  const assessmentsCount = sessions.filter(
    (s) => s.eventType === 'Assessment' || s.eventType === 'Mock Test'
  ).length;
  const avgAttendance = 96;

  // Mouse Light Reflection Handler for KPI Cards
  const handleKPIMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedModule('All');
    setSelectedTrainer('All');
    setSelectedTrack('All');
    setSelectedEventType('All');
    setSelectedDateFilter('January 2026');
  };

  // Filter Logic
  const filteredSessions = sessions.filter((s) => {
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

  return (
    <div className="training-calendar-page">
      {/* AMBIENT BACKGROUND GLOW ORBS */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />

      {/* 1. COMPACT PAGE HEADER (90–110px) */}
      <header className="calendar-compact-header glass-panel-3d">
        <div className="header-left">
          <nav className="header-breadcrumbs" aria-label="Breadcrumb">
            <span className="breadcrumb-item">L&amp;D</span>
            <ChevronRight size={12} className="breadcrumb-separator" />
            <span className="breadcrumb-item active">Training Calendar</span>
          </nav>

          <div className="header-title-block">
            <h1 className="header-page-title">Training Calendar</h1>
            <p className="header-page-subtitle">
              Plan, schedule and monitor Bootcamp and Lateral Bootcamp learning activities.
            </p>
          </div>
        </div>

        <div className="header-right">
          <HeaderOrbitWidget />
          <button
            type="button"
            className="ui-button-secondary"
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={16} /> Import Calendar
          </button>
          <button
            type="button"
            className="ui-button-primary micro-btn"
            onClick={() => setShowScheduleModal(true)}
          >
            <Plus size={16} className="btn-plus-icon" /> Schedule Session
          </button>
        </div>
      </header>

      {/* 2. COMPACT BOOTCAMP LEARNING JOURNEY (COLLAPSIBLE) */}
      <section className="pipeline-section mt-2">
        <LearningJourneyPipeline />
      </section>

      {/* 3. COMPACT GLASS METRIC TILES STRIP */}
      <section className="compact-glass-metrics-strip my-2">
        <div className="glass-metric-tile">
          <span className="metric-tile-val"><AnimatedCounter value={totalEvents} /></span>
          <span className="metric-tile-lbl">Scheduled</span>
        </div>

        <div className="metric-tile-divider" />

        <div className="glass-metric-tile">
          <span className="metric-tile-val"><AnimatedCounter value={todayCount} /></span>
          <span className="metric-tile-lbl">Today</span>
        </div>

        <div className="metric-tile-divider" />

        <div className="glass-metric-tile">
          <span className="metric-tile-val"><AnimatedCounter value={upcomingCount} /></span>
          <span className="metric-tile-lbl">Upcoming</span>
        </div>

        <div className="metric-tile-divider" />

        <div className="glass-metric-tile">
          <span className="metric-tile-val"><AnimatedCounter value={assessmentsCount} /></span>
          <span className="metric-tile-lbl">Assessments</span>
        </div>

        <div className="metric-tile-divider" />

        <div className="glass-metric-tile">
          <span className="metric-tile-val"><AnimatedCounter value={avgAttendance} suffix="%" /></span>
          <span className="metric-tile-lbl">Attendance</span>
        </div>
      </section>

      {/* 4. MAIN CALENDAR CONTAINER */}
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
          />
        )}

        {viewMode === 'modules' && (
          <ModuleView sessions={filteredSessions} onSelectSession={onSelectSession} />
        )}
      </section>

      {/* MODALS & DRAWER TRIGGERS */}
      {showScheduleModal && (
        <ScheduleSessionModal
          onClose={() => setShowScheduleModal(false)}
          onSuccess={(newSession) => {
            setShowScheduleModal(false);
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
