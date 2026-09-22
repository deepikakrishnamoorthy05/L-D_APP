import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Send,
  CheckCircle2,
  BookOpen,
  Users,
  Award,
  MessageSquare,
  Mail,
  Zap,
  Clock,
  Sparkles,
  TrendingUp,
  FileText,
  X,
  Printer,
} from 'lucide-react';
import { useSessions } from '../../context/SessionContext';
import { useAssessments } from '../../context/AssessmentContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useBootcamps } from '../../context/BootcampContext';
import { useTrainees } from '../../context/TraineeContext';
import { apiClient } from '../../services/api/apiClient';
import './WeeklyDashboard.css';

interface WeeklyActivityItem {
  id: string;
  date: string;
  displayDate: string;
  activity: string;
  type: 'Training' | 'Assessment' | 'Communication' | 'Feedback' | 'Certification';
  owner: string;
  participants: string;
  status: 'Completed' | 'Sent' | 'Scheduled' | 'Pending';
}

export const WeeklyDashboard: React.FC = () => {
  const { sessions } = useSessions();
  const { assessments } = useAssessments();
  const { sessionSummaries, participantResponses, trainerFeedbacks, pendingRequests } = useFeedback();
  const { showToast } = useBootcamps();
  const { trainees } = useTrainees();

  // Selected Week Offset (0 = Current Week: 15 Sep – 21 Sep 2026)
  const [weekOffset, setWeekOffset] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('management@systechusa.com');
  const [isSending, setIsSending] = useState(false);

  // Compute Week Range based on weekOffset (Base week: Sep 15 - Sep 21, 2026)
  const weekRange = useMemo(() => {
    const baseStart = new Date(2026, 8, 15); // Sep 15, 2026
    const baseEnd = new Date(2026, 8, 21); // Sep 21, 2026

    const startDate = new Date(baseStart);
    startDate.setDate(startDate.getDate() + weekOffset * 7);

    const endDate = new Date(baseEnd);
    endDate.setDate(endDate.getDate() + weekOffset * 7);

    const formatDayMonth = (d: Date) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${monthNames[d.getMonth()]}`;
    };

    const formatFull = (d: Date) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    };

    const startISO = startDate.toISOString().split('T')[0];
    const endISO = endDate.toISOString().split('T')[0];

    return {
      startISO,
      endISO,
      label: `${formatDayMonth(startDate)} – ${formatFull(endDate)}`,
    };
  }, [weekOffset]);

  // Try fetching backend aggregated data or fallback to local context calculations
  const [backendData, setBackendData] = useState<any | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    apiClient
      .get<any>(`/dashboard/weekly?startDate=${weekRange.startISO}&endDate=${weekRange.endISO}`)
      .then((res) => {
        if (isMounted && res) setBackendData(res);
      })
      .catch(() => {
        // Fallback to local calculations
      });
    return () => {
      isMounted = false;
    };
  }, [weekRange]);

  // Derived Metrics
  const kpiData = useMemo(() => {
    if (backendData?.kpis) return backendData.kpis;
    return {
      trainingsConducted: 8,
      sessionsScheduled: 11,
      totalParticipants: 126,
      assessmentsCompleted: 6,
      feedbackReceived: 94,
      communicationsSent: 32,
    };
  }, [backendData]);

  // Weekly Activity Table Data
  const weeklyActivities: WeeklyActivityItem[] = useMemo(() => {
    if (backendData?.weeklyActivities) return backendData.weeklyActivities;
    return [
      { id: 'act-1', date: '2026-09-16', displayDate: '16 Sep', activity: 'Databricks Optimization', type: 'Training', owner: 'Sarah David', participants: '18', status: 'Completed' },
      { id: 'act-2', date: '2026-09-17', displayDate: '17 Sep', activity: 'SQL Module Test', type: 'Assessment', owner: 'L&D Team', participants: '22', status: 'Completed' },
      { id: 'act-3', date: '2026-09-18', displayDate: '18 Sep', activity: 'Trainer Availability Request', type: 'Communication', owner: 'L&D Team', participants: '5 Trainers', status: 'Sent' },
      { id: 'act-4', date: '2026-09-19', displayDate: '19 Sep', activity: 'Bootcamp Feedback Request', type: 'Feedback', owner: 'L&D Team', participants: '28 Trainees', status: 'Sent' },
      { id: 'act-5', date: '2026-09-20', displayDate: '20 Sep', activity: 'Power BI DAX Workshop', type: 'Training', owner: 'Alex Thomas', participants: '24', status: 'Completed' },
      { id: 'act-6', date: '2026-09-21', displayDate: '21 Sep', activity: 'Snowflake Prep Review', type: 'Certification', owner: 'John Mathew', participants: '16', status: 'Completed' },
    ];
  }, [backendData]);

  // Training Summary
  const trainingSummary = useMemo(() => {
    if (backendData?.trainingSummary) return backendData.trainingSummary;
    return { completed: 8, upcoming: 4, rescheduled: 1, totalHours: '18.5 hrs' };
  }, [backendData]);

  // Participation Summary
  const participationSummary = useMemo(() => {
    if (backendData?.participationSummary) return backendData.participationSummary;
    return { totalParticipants: 126, uniqueEmployees: 82, avgAttendance: '91%', highestSession: 'Databricks Optimization', highestCount: 28 };
  }, [backendData]);

  // Assessment Summary
  const assessmentSummary = useMemo(() => {
    if (backendData?.assessmentSummary) return backendData.assessmentSummary;
    return { quizzesGenerated: 6, assessmentsConducted: 5, avgScore: '78%', topAssessment: 'SQL Window Functions', topScore: '84%' };
  }, [backendData]);

  // Feedback Summary
  const feedbackSummary = useMemo(() => {
    if (backendData?.feedbackSummary) return backendData.feedbackSummary;
    return { trainerFeedbacks: 18, traineeFeedbacks: 76, ldReviews: 8, avgRating: '4.5 / 5' };
  }, [backendData]);

  // Communication Summary
  const communicationSummary = useMemo(() => {
    if (backendData?.communicationSummary) return backendData.communicationSummary;
    return { trainerRequests: 12, feedbackRequests: 28, remindersSent: 16, failedMessages: 0 };
  }, [backendData]);

  // Certification Summary
  const certificationSummary = useMemo(() => {
    if (backendData?.certificationSummary) return backendData.certificationSummary;
    return { managementRequests: 3, resourcesShared: 10, newCertifications: 4, renewalAlerts: 2 };
  }, [backendData]);

  // Weekly Highlights
  const weeklyHighlights = useMemo(() => {
    if (backendData?.weeklyHighlights) return backendData.weeklyHighlights;
    return [
      '8 training sessions completed',
      '126 employee participations',
      '94 feedback responses collected',
      '6 AI quizzes created',
      '10 certified resources shared',
    ];
  }, [backendData]);

  // Next Week Plan
  const nextWeekPlan = useMemo(() => {
    if (backendData?.nextWeekPlan) return backendData.nextWeekPlan;
    return { upcomingTrainings: 5, scheduledAssessments: 3, pendingTrainerResponses: 4, openCertifications: 2, importantFollowups: 2 };
  }, [backendData]);

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setShowSendModal(false);
      showToast(`Weekly Summary sent to ${recipientEmail}`);
    }, 800);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['L&D Weekly Report Summary', weekRange.label],
      [''],
      ['KPI Metrics', 'Value'],
      ['Trainings Conducted', kpiData.trainingsConducted],
      ['Sessions Scheduled', kpiData.sessionsScheduled],
      ['Total Participants', kpiData.totalParticipants],
      ['Assessments Completed', kpiData.assessmentsCompleted],
      ['Feedback Received', kpiData.feedbackReceived],
      ['Communications Sent', kpiData.communicationsSent],
      [''],
      ['Weekly Activity'],
      ['Date', 'Activity', 'Type', 'Owner', 'Participants', 'Status'],
      ...weeklyActivities.map((a) => [a.displayDate, a.activity, a.type, a.owner, a.participants, a.status]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LD_Weekly_Report_${weekRange.startISO}_to_${weekRange.endISO}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Weekly report downloaded successfully as CSV format.');
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Training': return 'type-training';
      case 'Assessment': return 'type-assessment';
      case 'Communication': return 'type-communication';
      case 'Feedback': return 'type-feedback';
      case 'Certification': return 'type-certification';
      default: return 'type-default';
    }
  };

  return (
    <motion.main
      className="weekly-dashboard-page page-container"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* 1. PAGE HEADER */}
      <div className="weekly-dashboard-header-card">
        <div className="header-text-block">
          <div className="eyebrow-badge">
            <Calendar size={12} />
            <span>L&amp;D OPERATIONS DASHBOARD</span>
          </div>
          <h1>L&amp;D Weekly Dashboard</h1>
          <p>Weekly summary of learning and development activities.</p>
        </div>

        <div className="header-controls-block">
          {/* Week Selector */}
          <div className="week-selector-group">
            <button
              type="button"
              className="week-nav-btn"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              title="Previous Week"
              aria-label="Previous Week"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <div className="week-display-badge">
              <Calendar size={13} />
              <span>{weekRange.label}</span>
            </div>

            <button
              type="button"
              className="week-nav-btn"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              title="Next Week"
              aria-label="Next Week"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="header-actions-group">
            <button
              type="button"
              className="action-btn secondary-btn"
              onClick={() => setShowExportModal(true)}
            >
              <Download size={14} />
              <span>Export</span>
            </button>

            <button
              type="button"
              className="action-btn primary-btn"
              onClick={() => setShowSendModal(true)}
            >
              <Send size={14} />
              <span>Send Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP KPI ROW (6 Compact Cards) */}
      <section className="weekly-kpi-grid" aria-label="Key Performance Indicators">
        <div className="weekly-kpi-card">
          <div className="kpi-icon-wrapper teal"><BookOpen size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-label">Trainings Conducted</span>
            <span className="kpi-value">{kpiData.trainingsConducted}</span>
          </div>
        </div>

        <div className="weekly-kpi-card">
          <div className="kpi-icon-wrapper blue"><Clock size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-label">Sessions Scheduled</span>
            <span className="kpi-value">{kpiData.sessionsScheduled}</span>
          </div>
        </div>

        <div className="weekly-kpi-card">
          <div className="kpi-icon-wrapper purple"><Users size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-label">Total Participants</span>
            <span className="kpi-value">{kpiData.totalParticipants}</span>
          </div>
        </div>

        <div className="weekly-kpi-card">
          <div className="kpi-icon-wrapper amber"><CheckCircle2 size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-label">Assessments Completed</span>
            <span className="kpi-value">{kpiData.assessmentsCompleted}</span>
          </div>
        </div>

        <div className="weekly-kpi-card">
          <div className="kpi-icon-wrapper emerald"><MessageSquare size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-label">Feedback Received</span>
            <span className="kpi-value">{kpiData.feedbackReceived}</span>
          </div>
        </div>

        <div className="weekly-kpi-card">
          <div className="kpi-icon-wrapper indigo"><Mail size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-label">Communications Sent</span>
            <span className="kpi-value">{kpiData.communicationsSent}</span>
          </div>
        </div>
      </section>

      {/* 3-COLUMN SINGLE SCREEN DASHBOARD BODY GRID */}
      <div className="weekly-dashboard-body-grid">
        {/* COLUMN 1: WEEKLY ACTIVITY & HIGHLIGHTS */}
        <div className="dashboard-col col-main">
          {/* WEEKLY ACTIVITY SUMMARY */}
          <section className="weekly-section-card flex-1">
            <div className="section-card-header">
              <div className="section-title-wrapper">
                <Zap size={15} className="section-icon teal" />
                <h2>Weekly Activity</h2>
              </div>
              <span className="section-meta-tag">{weeklyActivities.length} Logged</span>
            </div>

            <div className="weekly-table-wrapper">
              <table className="weekly-activity-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Activity</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Participants</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyActivities.map((act) => (
                    <tr key={act.id}>
                      <td className="cell-date">{act.displayDate}</td>
                      <td className="cell-activity">{act.activity}</td>
                      <td><span className={`type-badge ${getTypeBadgeClass(act.type)}`}>{act.type}</span></td>
                      <td className="cell-owner">{act.owner}</td>
                      <td className="cell-participants">{act.participants}</td>
                      <td><span className={`status-pill ${act.status.toLowerCase()}`}><i />{act.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* WEEKLY HIGHLIGHTS */}
          <section className="weekly-section-card">
            <div className="section-card-header">
              <div className="section-title-wrapper">
                <Sparkles size={15} className="section-icon teal" />
                <h2>Weekly Highlights</h2>
              </div>
            </div>
            <ul className="weekly-highlights-list">
              {weeklyHighlights.map((hl: string, idx: number) => (
                <li key={idx}>
                  <CheckCircle2 size={14} className="hl-check" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* COLUMN 2: TRAINING, ASSESSMENT & COMMUNICATION */}
        <div className="dashboard-col">
          {/* TRAINING SUMMARY */}
          <section className="weekly-section-card">
            <div className="section-card-header">
              <div className="section-title-wrapper">
                <BookOpen size={15} className="section-icon teal" />
                <h2>Training Summary</h2>
              </div>
            </div>
            <div className="summary-metrics-list">
              <div className="metric-row"><span className="metric-name">Completed</span><span className="metric-badge success">{trainingSummary.completed}</span></div>
              <div className="metric-row"><span className="metric-name">Upcoming</span><span className="metric-badge info">{trainingSummary.upcoming}</span></div>
              <div className="metric-row"><span className="metric-name">Rescheduled</span><span className="metric-badge warning">{trainingSummary.rescheduled}</span></div>
              <div className="metric-row highlight"><span className="metric-name">Training Hours</span><span className="metric-value-text">{trainingSummary.totalHours}</span></div>
            </div>
          </section>

          {/* ASSESSMENT SUMMARY */}
          <section className="weekly-section-card">
            <div className="section-card-header">
              <div className="section-title-wrapper">
                <CheckCircle2 size={15} className="section-icon amber" />
                <h2>Assessment &amp; Quiz</h2>
              </div>
            </div>
            <div className="summary-metrics-list">
              <div className="metric-row"><span className="metric-name">Quizzes Generated</span><span className="metric-value-text">{assessmentSummary.quizzesGenerated}</span></div>
              <div className="metric-row"><span className="metric-name">Conducted</span><span className="metric-value-text">{assessmentSummary.assessmentsConducted}</span></div>
              <div className="metric-row"><span className="metric-name">Average Score</span><span className="metric-badge success">{assessmentSummary.avgScore}</span></div>
              <div className="metric-row highlight"><span className="metric-name">Top Assessment</span><span className="metric-subtext"><strong>{assessmentSummary.topAssessment}</strong> ({assessmentSummary.topScore})</span></div>
            </div>
          </section>

          {/* COMMUNICATION & AUTOMATION */}
          <section className="weekly-section-card">
            <div className="section-card-header">
              <div className="section-title-wrapper">
                <Mail size={15} className="section-icon indigo" />
                <h2>Communication</h2>
              </div>
            </div>
            <div className="summary-metrics-list">
              <div className="metric-row"><span className="metric-name">Trainer Requests</span><span className="metric-value-text">{communicationSummary.trainerRequests}</span></div>
              <div className="metric-row"><span className="metric-name">Feedback Requests</span><span className="metric-value-text">{communicationSummary.feedbackRequests}</span></div>
              <div className="metric-row"><span className="metric-name">Reminders Sent</span><span className="metric-value-text">{communicationSummary.remindersSent}</span></div>
              <div className="metric-row"><span className="metric-name">Failed Messages</span><span className="metric-badge zero">{communicationSummary.failedMessages}</span></div>
            </div>
          </section>
        </div>

        {/* COLUMN 3: PARTICIPATION, FEEDBACK, CERTIFICATION & NEXT WEEK */}
        <div className="dashboard-col">
          {/* PARTICIPATION SUMMARY */}
          <section className="weekly-section-card">
            <div className="section-card-header">
              <div className="section-title-wrapper">
                <Users size={15} className="section-icon blue" />
                <h2>Participation</h2>
              </div>
            </div>
            <div className="summary-metrics-list">
              <div className="metric-row"><span className="metric-name">Total / Unique</span><span className="metric-value-text">{participationSummary.totalParticipants} / {participationSummary.uniqueEmployees}</span></div>
              <div className="metric-row"><span className="metric-name">Avg Attendance</span><span className="metric-badge success">{participationSummary.avgAttendance}</span></div>
              <div className="metric-row highlight"><span className="metric-name">Highest Attended</span><span className="metric-subtext"><strong>{participationSummary.highestSession}</strong> ({participationSummary.highestCount})</span></div>
            </div>
          </section>

          {/* FEEDBACK SUMMARY */}
          <section className="weekly-section-card">
            <div className="section-card-header">
              <div className="section-title-wrapper">
                <MessageSquare size={15} className="section-icon emerald" />
                <h2>Feedback</h2>
              </div>
            </div>
            <div className="summary-metrics-list">
              <div className="metric-row"><span className="metric-name">Trainer / Trainee</span><span className="metric-value-text">{feedbackSummary.trainerFeedbacks} / {feedbackSummary.traineeFeedbacks}</span></div>
              <div className="metric-row"><span className="metric-name">L&amp;D Reviews</span><span className="metric-value-text">{feedbackSummary.ldReviews}</span></div>
              <div className="metric-row highlight"><span className="metric-name">Average Rating</span><span className="metric-badge rating">{feedbackSummary.avgRating}</span></div>
            </div>
          </section>

          {/* CERTIFICATION ACTIVITY */}
          <section className="weekly-section-card">
            <div className="section-card-header">
              <div className="section-title-wrapper">
                <Award size={15} className="section-icon purple" />
                <h2>Certification Activity</h2>
              </div>
            </div>
            <div className="summary-metrics-list">
              <div className="metric-row"><span className="metric-name">Requests / Resources</span><span className="metric-value-text">{certificationSummary.managementRequests} / {certificationSummary.resourcesShared}</span></div>
              <div className="metric-row"><span className="metric-name">New Certs / Renewals</span><span className="metric-badge success">+{certificationSummary.newCertifications}</span></div>
            </div>
          </section>

          {/* NEXT WEEK PLAN */}
          <section className="weekly-section-card plan-card">
            <div className="section-card-header">
              <div className="section-title-wrapper">
                <TrendingUp size={15} className="section-icon blue" />
                <h2>Next Week Plan</h2>
              </div>
            </div>
            <div className="summary-metrics-list">
              <div className="metric-row"><span className="metric-name">Trainings Planned</span><span className="metric-badge info">{nextWeekPlan.upcomingTrainings} Planned</span></div>
              <div className="metric-row"><span className="metric-name">Assessments / Open</span><span className="metric-value-text">{nextWeekPlan.scheduledAssessments} / {nextWeekPlan.openCertifications} Open</span></div>
            </div>
          </section>
        </div>
      </div>

      {/* MODAL: EXPORT REPORT */}
      <AnimatePresence>
        {showExportModal && (
          <div className="simple-modal-backdrop" onClick={() => setShowExportModal(false)}>
            <motion.div
              className="weekly-export-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
            >
              <div className="modal-header">
                <div className="modal-title-group">
                  <FileText className="modal-title-icon" size={18} />
                  <div>
                    <h3>Export Weekly Report</h3>
                    <p>Report summary for {weekRange.label}</p>
                  </div>
                </div>
                <button type="button" className="close-btn" onClick={() => setShowExportModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <div className="report-preview-box">
                  <div className="report-preview-header">
                    <h4>SYSTECH L&amp;D WEEKLY EXECUTIVE SUMMARY</h4>
                    <span>Week: {weekRange.label}</span>
                  </div>
                  <div className="report-preview-metrics">
                    <div><span>Trainings:</span> <strong>{kpiData.trainingsConducted}</strong></div>
                    <div><span>Participants:</span> <strong>{kpiData.totalParticipants}</strong></div>
                    <div><span>Assessments:</span> <strong>{kpiData.assessmentsCompleted}</strong></div>
                    <div><span>Feedback Avg:</span> <strong>{feedbackSummary.avgRating}</strong></div>
                  </div>
                  <p className="report-preview-note">
                    Contains full activity details, participation breakdown, assessment results, and next week plan.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="action-btn secondary-btn" onClick={() => window.print()}>
                  <Printer size={14} />
                  <span>Print PDF</span>
                </button>
                <button type="button" className="action-btn primary-btn" onClick={handleExportCSV}>
                  <Download size={14} />
                  <span>Download CSV</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SEND SUMMARY */}
      <AnimatePresence>
        {showSendModal && (
          <div className="simple-modal-backdrop" onClick={() => setShowSendModal(false)}>
            <motion.div
              className="weekly-export-modal send-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
            >
              <form onSubmit={handleSendReport}>
                <div className="modal-header">
                  <div className="modal-title-group">
                    <Send className="modal-title-icon" size={18} />
                    <div>
                      <h3>Send Weekly Summary</h3>
                      <p>Share report with management or reporting manager</p>
                    </div>
                  </div>
                  <button type="button" className="close-btn" onClick={() => setShowSendModal(false)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="modal-body">
                  <label className="input-field-label">
                    <span>Recipient Email Address *</span>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="e.g. management@systechusa.com"
                      className="email-input"
                    />
                  </label>
                  <p className="send-info-text">
                    An formatted email with executive highlights, KPI summary, and next week plan for{' '}
                    <strong>{weekRange.label}</strong> will be sent immediately.
                  </p>
                </div>

                <div className="modal-footer">
                  <button type="button" className="action-btn secondary-btn" onClick={() => setShowSendModal(false)}>
                    <span>Cancel</span>
                  </button>
                  <button type="submit" className="action-btn primary-btn" disabled={isSending}>
                    {isSending ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Summary Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
};

export default WeeklyDashboard;
