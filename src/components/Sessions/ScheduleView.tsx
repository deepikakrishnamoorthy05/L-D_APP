import React, { useState } from 'react';
import {
  Clock,
  BookOpen,
  Calendar as CalendarIcon,
  MoreVertical,
  Eye,
  Edit,
  RotateCcw,
  XCircle,
  List,
  LayoutGrid,
  Sparkles,
  GitFork,
  ChevronRight,
  Layers,
  Award,
} from 'lucide-react';
import { Session, LearningTrack } from '../../types/session';

interface ScheduleViewProps {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
  onEditSession: (session: Session) => void;
  onRescheduleSession: (session: Session) => void;
  onCancelSession: (session: Session) => void;
  onMarkCompleted: (sessionId: string) => void;
  onOpenAttendance: (sessionId: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  sessions,
  onSelectSession,
  onEditSession,
  onRescheduleSession,
  onCancelSession,
  onMarkCompleted,
  onOpenAttendance,
}) => {
  const [displayMode, setDisplayMode] = useState<'timeline' | 'cards' | 'table'>('timeline');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Group sessions by date string (YYYY-MM-DD)
  const groupedSessions = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    const key = s.sessionDate;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSessions).sort();

  const getEventTypeBadgeClass = (type: Session['eventType']) => {
    switch (type) {
      case 'Assessment':
      case 'Mock Test':
        return 'type-badge assessment';
      case 'Workshop':
      case 'Practice':
        return 'type-badge workshop';
      case 'Project':
        return 'type-badge project';
      case 'Certification':
      case 'Evaluation':
      case 'Sign Off':
        return 'type-badge cert';
      case 'Holiday':
        return 'type-badge holiday';
      case 'HR Event':
        return 'type-badge hr';
      default:
        return 'type-badge training';
    }
  };

  const getTrackBadgeClass = (track?: LearningTrack) => {
    switch (track) {
      case 'Common Foundation':
        return 'track-badge foundation';
      case 'DBT & Snowflake':
        return 'track-badge dbt-snowflake';
      case 'Databricks':
        return 'track-badge databricks';
      default:
        return 'track-badge shared';
    }
  };

  const formatDateHeaderParts = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const year = d.getFullYear();
      return { dayName, dayNum, monthName, year };
    } catch {
      return { dayName: 'EVENT', dayNum: 1, monthName: 'JAN', year: 2026 };
    }
  };

  return (
    <div className="schedule-view-wrapper">
      {/* 1. INTERACTIVE 3D BOOTCAMP LEARNING JOURNEY FLOWCHART */}
      <section className="learning-journey-card glass-panel-3d">
        <div className="journey-header">
          <Sparkles size={16} className="icon-sparkle" />
          <h3>BOOTCAMP LEARNING JOURNEY PIPELINE</h3>
        </div>

        <div className="journey-flowchart-wrapper">
          <div className="flowchart-step glass-node-3d">
            <span className="step-title">SQL / T-SQL</span>
            <span className="step-sub">Common Foundation</span>
          </div>

          <ChevronRight size={14} className="flow-arrow" />

          <div className="flowchart-step glass-node-3d">
            <span className="step-title">Python</span>
            <span className="step-sub">Common Foundation</span>
          </div>

          <ChevronRight size={14} className="flow-arrow" />

          {/* TRACK ALLOCATION BRANCHING NODE */}
          <div className="flowchart-split-box glass-split-3d">
            <div className="split-header">
              <GitFork size={14} />
              <span>Track Allocation</span>
            </div>
            <div className="split-branches">
              <div className="branch dbt glass-node-3d">DBT + Snowflake</div>
              <div className="branch dbx glass-node-3d">Databricks</div>
            </div>
          </div>

          <ChevronRight size={14} className="flow-arrow" />

          <div className="flowchart-step glass-node-3d">
            <span className="step-title">Shared Learning</span>
            <span className="step-sub">Power BI, QA, DevOps</span>
          </div>

          <ChevronRight size={14} className="flow-arrow" />

          <div className="flowchart-step glass-node-3d">
            <span className="step-title">Simulation Project</span>
            <span className="step-sub">Client Capstone</span>
          </div>

          <ChevronRight size={14} className="flow-arrow" />

          <div className="flowchart-step glass-node-3d">
            <span className="step-title">DI Certification</span>
            <span className="step-sub">Evaluation &amp; Sign Off</span>
          </div>
        </div>
      </section>

      {/* View Mode Toggle Bar */}
      <div className="schedule-toggle-bar mt-3">
        <span className="toggle-label">Schedule View Mode:</span>
        <div className="toggle-btn-group">
          <button
            type="button"
            className={`toggle-btn ${displayMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setDisplayMode('timeline')}
          >
            <Clock size={14} /> Interactive Timeline
          </button>
          <button
            type="button"
            className={`toggle-btn ${displayMode === 'cards' ? 'active' : ''}`}
            onClick={() => setDisplayMode('cards')}
          >
            <LayoutGrid size={14} /> Grouped Date Cards
          </button>
          <button
            type="button"
            className={`toggle-btn ${displayMode === 'table' ? 'active' : ''}`}
            onClick={() => setDisplayMode('table')}
          >
            <List size={14} /> Training Schedule Table
          </button>
        </div>
      </div>

      {/* MODE 1: INTERACTIVE TIMELINE VIEW */}
      {displayMode === 'timeline' && (
        <div className="interactive-vertical-timeline mt-3">
          {sortedDates.length === 0 ? (
            <div className="empty-state-card glass-panel-3d">
              <CalendarIcon size={36} className="empty-icon" />
              <h4>No training sessions found</h4>
              <p>Try adjusting your filters.</p>
            </div>
          ) : (
            sortedDates.map((dateKey) => {
              const daySessions = groupedSessions[dateKey];
              const header = formatDateHeaderParts(dateKey);

              return (
                <div key={dateKey} className="timeline-day-block">
                  {/* Left Date Spine */}
                  <div className="timeline-date-spine">
                    <span className="spine-day-name">{header.dayName}</span>
                    <span className="spine-date-num">{header.dayNum} {header.monthName}</span>
                  </div>

                  {/* Center Node Line */}
                  <div className="timeline-node-line">
                    <div className="node-dot-pulse" />
                    <div className="node-vertical-connector" />
                  </div>

                  {/* Right Session Stack */}
                  <div className="timeline-session-cards-stack">
                    {daySessions.map((session) => (
                      <div key={session.id} className="timeline-session-card glass-card-3d">
                        <div className="card-top-bar">
                          <span className="time-badge">
                            <Clock size={12} /> {session.timeSlot || `${session.startTime}–${session.endTime}`}
                          </span>
                          <span className={getEventTypeBadgeClass(session.eventType)}>
                            {session.eventType}
                          </span>
                          <span className={getTrackBadgeClass(session.learningTrack)}>
                            {session.learningTrack || 'Shared'}
                          </span>
                        </div>

                        <div className="card-body-content">
                          <button
                            type="button"
                            className="agenda-title-btn"
                            onClick={() => onSelectSession(session.id)}
                          >
                            {session.title || session.agenda}
                          </button>
                          {session.notes && <p className="session-notes-subtext">{session.notes}</p>}
                        </div>

                        <div className="card-footer-bar">
                          <div className="people-chips">
                            {session.moduleName && (
                              <span className="people-chip">
                                <BookOpen size={11} /> {session.moduleName}
                              </span>
                            )}
                            {session.trainerName && (
                              <span className="people-chip highlight">
                                Trainer: {session.trainerName}
                              </span>
                            )}
                          </div>

                          <div className="card-actions-right">
                            {session.attendanceApplicable ? (
                              <span className="att-count-pill">
                                {session.attendedCount}/{session.totalEnrolled}
                              </span>
                            ) : (
                              <span className="att-not-applicable">Holiday/SignOff</span>
                            )}
                            <button
                              type="button"
                              className="icon-menu-btn"
                              onClick={() => onSelectSession(session.id)}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODE 2: GROUPED DATE CONTAINERS */}
      {displayMode === 'cards' && (
        <div className="grouped-schedule-timeline mt-3">
          {sortedDates.map((dateKey) => {
            const daySessions = groupedSessions[dateKey];
            const header = formatDateHeaderParts(dateKey);

            return (
              <div key={dateKey} className="schedule-day-container glass-card-3d">
                <div className="date-container-header">
                  <span className="day-name">{header.dayName}</span>
                  <span className="day-date-number">
                    {header.dayNum} {header.monthName} {header.year}
                  </span>
                  <span className="events-count-badge">{daySessions.length} Event(s)</span>
                </div>

                <div className="date-container-sessions-stack">
                  {daySessions.map((session) => (
                    <div key={session.id} className="session-item-row">
                      <div className="session-col-left">
                        <span className="slot-badge">
                          {session.timeSlot || `${session.startTime}–${session.endTime}`}
                        </span>
                        <span className="duration-pill-sm">{session.durationText || '3 hrs'}</span>
                      </div>

                      <div className="session-col-center">
                        <div className="agenda-title-row">
                          <button
                            type="button"
                            className="agenda-title-btn"
                            onClick={() => onSelectSession(session.id)}
                          >
                            {session.title || session.agenda}
                          </button>
                          <span className={getEventTypeBadgeClass(session.eventType)}>
                            {session.eventType}
                          </span>
                        </div>

                        <div className="session-tags-row mt-1">
                          <span className="tag-chip module-chip">{session.moduleName}</span>
                          <span className={getTrackBadgeClass(session.learningTrack)}>
                            {session.learningTrack || 'Shared'}
                          </span>
                        </div>
                      </div>

                      <div className="session-col-right">
                        <button
                          type="button"
                          className="icon-menu-btn"
                          onClick={() => onSelectSession(session.id)}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODE 3: TRAINING SCHEDULE TABLE */}
      {displayMode === 'table' && (
        <div className="bootcamp-table-wrapper mt-3 glass-card-3d">
          <div className="table-responsive-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Date</th>
                  <th>Slot</th>
                  <th>Agenda</th>
                  <th>Module</th>
                  <th>Track</th>
                  <th>Trainer</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="table-row-hover">
                    <td><span className="sequence-badge">#{s.trainingDay || 1}</span></td>
                    <td className="font-weight-bold">{s.sessionDate}</td>
                    <td><span className="slot-chip">{s.timeSlot || 'FN'}</span></td>
                    <td>
                      <button
                        type="button"
                        className="table-link-title"
                        onClick={() => onSelectSession(s.id)}
                      >
                        {s.agenda}
                      </button>
                    </td>
                    <td><span className="batch-cell">{s.moduleName}</span></td>
                    <td><span className={getTrackBadgeClass(s.learningTrack)}>{s.learningTrack || 'Shared'}</span></td>
                    <td className="font-weight-bold">{s.trainerName}</td>
                    <td>
                      <span className="bootcamp-status-badge status-active">{s.status}</span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="icon-action-btn-sm"
                        onClick={() => onSelectSession(s.id)}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
