import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  UserCheck,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  FileText,
  Users,
  User,
  BookOpen,
} from 'lucide-react';
import { useSessions } from '../../context/SessionContext';
import { Session } from '../../types/session';
import { ScheduleSessionModal } from './ScheduleSessionModal';

interface SessionDetailsProps {
  sessionId: string;
  initialTab?: string;
  onBack: () => void;
  onOpenAttendance: (sessionId: string) => void;
}

export const SessionDetails: React.FC<SessionDetailsProps> = ({
  sessionId,
  initialTab = 'overview',
  onBack,
  onOpenAttendance,
}) => {
  const { sessions, attendanceMap } = useSessions();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [showEditModal, setShowEditModal] = useState(false);

  const session: Session = sessions.find((s) => s.id === sessionId) || sessions[0];
  const attendanceRecords = attendanceMap[session.id] || [];

  const getStatusBadge = (status: Session['status']) => {
    switch (status) {
      case 'Scheduled':
        return <span className="bootcamp-status-badge status-active">Scheduled</span>;
      case 'In Progress':
        return <span className="bootcamp-status-badge status-planned">In Progress</span>;
      case 'Completed':
        return <span className="bootcamp-status-badge status-completed">Completed</span>;
      case 'Rescheduled':
        return <span className="bootcamp-status-badge status-planned">Rescheduled</span>;
      case 'Cancelled':
        return <span className="bootcamp-status-badge status-archived">Cancelled</span>;
    }
  };

  const tabsList = [
    { id: 'overview', label: 'Overview' },
    { id: 'attendance', label: `Attendance (${attendanceRecords.length})` },
    { id: 'notes', label: 'Agenda & Notes' },
  ];

  return (
    <div className="bootcamp-details-container">
      {/* Header */}
      <header className="bootcamp-details-header-card">
        <div className="details-header-top">
          <button type="button" className="btn-back" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Training Calendar
          </button>

          <div className="details-actions">
            {session.attendanceApplicable && (
              <button
                type="button"
                className="bootcamp-btn-primary"
                onClick={() => onOpenAttendance(session.id)}
              >
                <UserCheck size={16} /> Record Attendance
              </button>
            )}

            <button
              type="button"
              className="bootcamp-btn-secondary"
              onClick={() => setShowEditModal(true)}
            >
              <Edit size={14} /> Edit Session
            </button>
          </div>
        </div>

        <div className="details-title-row">
          <div className="title-with-badge">
            <h1 className="details-title">{session.title}</h1>
            <span className="code-chip lg">{session.eventType}</span>
            {getStatusBadge(session.status)}
          </div>
          <p className="details-description">{session.agenda}</p>
        </div>

        {/* Source Metadata Summary Bar */}
        <div className="details-meta-bar">
          <div className="meta-item">
            <span className="meta-label">Day &amp; Date:</span>
            <span className="meta-val highlight">
              {session.trainingDay ? `Day ${session.trainingDay} • ` : ''}
              {session.sessionDate} ({session.dayOfWeek || 'Weekday'})
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Time &amp; Slot:</span>
            <span className="meta-val">{session.timeSlot || `${session.startTime} – ${session.endTime}`}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Module:</span>
            <span className="meta-val">{session.moduleName}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Module Owner:</span>
            <span className="meta-val">{session.moduleOwner || 'L&D Team'}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Trainer:</span>
            <span className="meta-val">{session.trainerName}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bootcamp-tabs-bar" aria-label="Session Details Sections">
        {tabsList.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`bootcamp-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="tab-content-wrapper">
          <div className="details-section-card">
            <h3 className="section-heading">Source Excel Calendar Information</h3>
            <div className="info-grid">
              <div className="info-cell">
                <span className="info-label">Training Day</span>
                <span className="info-val">{session.trainingDay ? `Day #${session.trainingDay}` : 'N/A'}</span>
              </div>

              <div className="info-cell">
                <span className="info-label">Date</span>
                <span className="info-val">{session.sessionDate}</span>
              </div>

              <div className="info-cell">
                <span className="info-label">Week of Day (Spreadsheet)</span>
                <span className="info-val">{session.dayOfWeek || 'Weekday'}</span>
              </div>

              <div className="info-cell">
                <span className="info-label">Time / Slot</span>
                <span className="info-val">{session.timeSlot || `${session.startTime} – ${session.endTime}`}</span>
              </div>

              <div className="info-cell">
                <span className="info-label">Duration</span>
                <span className="info-val">{session.durationText || '3 hrs'}</span>
              </div>

              <div className="info-cell">
                <span className="info-label">Module Name</span>
                <span className="info-val">{session.moduleName}</span>
              </div>

              <div className="info-cell">
                <span className="info-label">Owner of the Module</span>
                <span className="info-val">{session.moduleOwner || 'L&D Team'}</span>
              </div>

              <div className="info-cell">
                <span className="info-label">Trainer(s)</span>
                <span className="info-val">{session.trainerName}</span>
              </div>

              <div className="info-cell">
                <span className="info-label">Coordinator</span>
                <span className="info-val">{session.coordinatorName || 'Priya'}</span>
              </div>

              <div className="info-cell">
                <span className="info-label">Evaluator</span>
                <span className="info-val">{session.evaluatorName || 'Dinesh Kumar'}</span>
              </div>
            </div>

            {/* Trainer Email Notification Status Card */}
            <div className="trainer-notification-status-card glass-panel-3d mt-3 p-3">
              <div className="status-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="status-icon-ring sent" style={{ color: '#10B981', display: 'flex', alignItems: 'center' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div className="status-text-block">
                  <span className="status-title font-weight-bold" style={{ display: 'block', color: '#102A33', fontSize: '0.88rem' }}>
                    Trainer Email Notification
                  </span>
                  <span className="status-desc text-muted" style={{ fontSize: '0.78rem', color: '#647982' }}>
                    {session.notificationStatus === 'Sent'
                      ? `✓ Sent to ${session.trainerName || 'Trainer'} (${(session.trainerName || 'trainer').toLowerCase().replace(/\s+/g, '.')}@systechusa.com)${session.notificationSentAt ? ` at ${session.notificationSentAt}` : ''}`
                      : 'Notification Pending'}
                  </span>
                </div>
                <button type="button" className="bootcamp-btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
                  Notify Trainer Again
                </button>
              </div>
            </div>

            <div className="info-grid mt-4">
              <div className="info-cell full-width">
                <span className="info-label">Source Agenda</span>
                <span className="info-val">{session.agenda}</span>
              </div>

              {session.meetingLink && (
                <div className="info-cell full-width">
                  <span className="info-label">Meeting Link ({session.meetingPlatform})</span>
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="table-link-title"
                  >
                    {session.meetingLink}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="tab-content-wrapper">
          <div className="bootcamp-table-wrapper">
            <div className="table-responsive-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Trainee Record</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Recorded Date</th>
                  </tr>
                </thead>
                <tbody>
                  {!session.attendanceApplicable ? (
                    <tr>
                      <td colSpan={4} className="empty-table-cell">
                        <div className="empty-state-wrapper">
                          <CheckCircle2 size={32} className="empty-icon" />
                          <p className="empty-title">Attendance Not Applicable</p>
                          <p className="empty-desc">
                            This calendar item ({session.eventType}) does not require trainee attendance.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-table-cell">
                        <div className="empty-state-wrapper">
                          <Users size={32} className="empty-icon" />
                          <p className="empty-title">Attendance Not Recorded</p>
                          <p className="empty-desc">
                            Click "Record Attendance" above to mark attendance for this session.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    attendanceRecords.map((att) => (
                      <tr key={att.id} className="table-row-hover">
                        <td className="font-weight-bold">Trainee #{att.traineeId}</td>
                        <td>
                          <span
                            className={`risk-tag ${
                              att.status === 'Present'
                                ? 'risk-low'
                                : att.status === 'Late'
                                ? 'risk-medium'
                                : 'risk-high'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="text-secondary-cell">{att.remarks || '—'}</td>
                        <td className="text-muted-cell">{att.recordedAt}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="tab-content-wrapper">
          <div className="details-section-card">
            <h3 className="section-heading">Agenda &amp; Session Notes</h3>
            <div className="info-grid">
              <div className="info-cell full-width">
                <span className="info-label">Session Agenda / Topics</span>
                <span className="info-val">{session.agenda}</span>
              </div>

              <div className="info-cell full-width">
                <span className="info-label">Trainer Notes &amp; Instructions</span>
                <span className="info-val">{session.notes || 'No extra notes recorded.'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <ScheduleSessionModal initialData={session} onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
};
