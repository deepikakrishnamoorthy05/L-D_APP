import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PauseCircle,
  FileText,
  X,
  Printer,
  Grid,
  Layers,
  Award,
  BookOpen,
  Sparkles,
  Users,
  MessageSquare,
  Zap,
  TrendingUp,
  Mail,
  RefreshCw
} from 'lucide-react';
import { useSessions } from '../../context/SessionContext';
import { useAssessments } from '../../context/AssessmentContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useBootcamps } from '../../context/BootcampContext';
import { useTrainees } from '../../context/TraineeContext';
import { apiClient } from '../../services/api/apiClient';

import {
  PROGRAM_TRACKERS_DATA,
  CERTIFICATION_INITIATIVES_DATA,
  OTHER_INITIATIVES_DATA,
  ProgramTracker,
  WeeklyRow,
  CertificationInitiative,
  OtherInitiative
} from '../../data/weeklyTrackerData';
import './WeeklyDashboard.css';

// Week Options List
const AVAILABLE_WEEKS = [
  { date: '2026-09-09', label: '09 Sep – 15 Sep 2026 (WK_03)' },
  { date: '2026-09-16', label: '16 Sep – 22 Sep 2026 (WK_04)' },
  { date: '2026-09-23', label: '23 Sep – 29 Sep 2026 (WK_05)' },
];

export const WeeklyDashboard: React.FC = () => {
  const { showToast } = useBootcamps();
  const { sessions } = useSessions();
  const { assessments } = useAssessments();

  // Selected Week Date State (Primary filter for fetching week-specific dashboard)
  const [selectedWeekDate, setSelectedWeekDate] = useState<string>('2026-09-16');
  const [activeTab, setActiveTab] = useState<'slides' | 'programs' | 'certifications' | 'activities'>('slides');
  const [selectedProgramId, setSelectedProgramId] = useState<string>(PROGRAM_TRACKERS_DATA[0].id);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Backend & Weekly Data State
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('management@systechusa.com');
  const [isSending, setIsSending] = useState(false);

  // New Log Form State
  const [newLogProgramId, setNewLogProgramId] = useState(PROGRAM_TRACKERS_DATA[0].id);
  const [newLogDateRange, setNewLogDateRange] = useState('17/09/2026 - 23/09/2026');
  const [newLogTopic, setNewLogTopic] = useState('');
  const [newLogTrainer, setNewLogTrainer] = useState('L&D');
  const [newLogStatus, setNewLogStatus] = useState<'Completed' | 'In Progress' | 'Yet To Start'>('In Progress');

  // Programs Data state (Updated when switching weeks or adding logs)
  const [programsData, setProgramsData] = useState<ProgramTracker[]>(PROGRAM_TRACKERS_DATA);

  // Fetch Week-Specific Dashboard from Backend whenever selectedWeekDate changes!
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    apiClient
      .get<any>(`/dashboard/weekly?weekDate=${selectedWeekDate}`)
      .then((res) => {
        if (isMounted && res) {
          setWeeklyData(res);
          if (res.programs && res.programs.length > 0) {
            setProgramsData(res.programs);
          }
        }
      })
      .catch(() => {
        // Fallback local filtering for requested week
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedWeekDate]);

  // Current Selected Week Label
  const currentWeekLabel = useMemo(() => {
    const found = AVAILABLE_WEEKS.find((w) => w.date === selectedWeekDate);
    return found ? found.label : `${selectedWeekDate} Weekly Report`;
  }, [selectedWeekDate]);

  // Navigate to Previous Week
  const handlePrevWeek = () => {
    const idx = AVAILABLE_WEEKS.findIndex((w) => w.date === selectedWeekDate);
    if (idx > 0) {
      setSelectedWeekDate(AVAILABLE_WEEKS[idx - 1].date);
    } else {
      showToast('No earlier weeks stored in database');
    }
  };

  // Navigate to Next Week
  const handleNextWeek = () => {
    const idx = AVAILABLE_WEEKS.findIndex((w) => w.date === selectedWeekDate);
    if (idx < AVAILABLE_WEEKS.length - 1) {
      setSelectedWeekDate(AVAILABLE_WEEKS[idx + 1].date);
    } else {
      showToast('No later weeks stored in database');
    }
  };

  // Dynamic KPI Metrics for Selected Week (Fetched from Backend or Computed)
  const weekKpi = useMemo(() => {
    if (weeklyData?.kpis) return weeklyData.kpis;
    return {
      trainingsConducted: 8,
      sessionsScheduled: 11,
      totalParticipants: 126,
      assessmentsCompleted: 6,
      feedbackReceived: 94,
      communicationsSent: 32,
      passedThisWeek: 4,
    };
  }, [weeklyData]);

  // Dynamic Weekly Activity List for Selected Week
  const weekActivities = useMemo(() => {
    if (weeklyData?.weeklyActivities) return weeklyData.weeklyActivities;
    return [
      { id: 'act-1', date: selectedWeekDate, displayDate: '16 Sep', activity: 'Databricks Optimization', type: 'Training', owner: 'Samuel Davidson', participants: '18', status: 'Completed' },
      { id: 'act-2', date: selectedWeekDate, displayDate: '17 Sep', activity: 'SQL Module Test', type: 'Assessment', owner: 'L&D Team', participants: '22', status: 'Completed' },
      { id: 'act-3', date: selectedWeekDate, displayDate: '18 Sep', activity: 'Trainer Availability Request', type: 'Communication', owner: 'L&D Team', participants: '5 Trainers', status: 'Sent' },
    ];
  }, [weeklyData, selectedWeekDate]);

  // Selected Program for slide / detail view
  const selectedProgram = useMemo(() => {
    return programsData.find((p) => p.id === selectedProgramId) || programsData[0];
  }, [programsData, selectedProgramId]);

  // Slide deck list (Title Slide + Program Slides + Cert Slides)
  const slideDeck = useMemo(() => {
    const slides: Array<{ type: 'title' | 'program' | 'cert' | 'other_cert'; title: string; data?: any }> = [
      { type: 'title', title: `L&D Weekly Tracker (${currentWeekLabel})` },
    ];
    programsData.forEach((prog) => {
      slides.push({ type: 'program', title: prog.programName, data: prog });
    });
    slides.push({ type: 'cert', title: 'Certification Initiatives — Weekly Status' });
    slides.push({ type: 'other_cert', title: 'Other Initiatives — Databricks Expert Program' });
    return slides;
  }, [programsData, currentWeekLabel]);

  // Navigation for slides
  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev < slideDeck.length - 1 ? prev + 1 : 0));
  };
  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : slideDeck.length - 1));
  };

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return programsData.filter((prog) => {
      const matchesSearch =
        prog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prog.weeklyRows.some((r) => r.topic.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || prog.status.toUpperCase().replace(/\s+/g, '_') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [programsData, searchQuery, statusFilter]);

  // Program KPI Counts
  const programMetrics = useMemo(() => {
    const totalPrograms = programsData.length;
    const completedCount = programsData.filter((p) => p.status === 'Completed').length;
    const inProgressCount = programsData.filter((p) => p.status === 'In Progress').length;
    const delayedCount = programsData.filter((p) => p.status === 'Delayed').length;
    const onHoldCount = programsData.filter((p) => p.status === 'On Hold').length;

    return { totalPrograms, completedCount, inProgressCount, delayedCount, onHoldCount };
  }, [programsData]);

  // Handle Add Weekly Log and Persist to Backend
  const handleAddLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTopic.trim()) {
      showToast('Please enter a topic or update description');
      return;
    }

    const updatedPrograms = programsData.map((prog) => {
      if (prog.id === newLogProgramId) {
        return {
          ...prog,
          weeklyRows: [
            ...prog.weeklyRows,
            {
              dateRange: newLogDateRange,
              topic: newLogTopic,
              trainer: newLogTrainer,
              status: newLogStatus,
            },
          ],
        };
      }
      return prog;
    });

    setProgramsData(updatedPrograms);

    // Save to Backend Database
    try {
      await apiClient.post('/dashboard/weekly', {
        weekDate: selectedWeekDate,
        weekLabel: currentWeekLabel,
        kpis: weekKpi,
        weeklyActivities: weekActivities,
        programs: updatedPrograms,
      });
      showToast(`Status log saved to backend for week ${currentWeekLabel}`);
    } catch (err) {
      showToast(`Log added locally for week ${currentWeekLabel}`);
    }

    setShowAddLogModal(false);
    setNewLogTopic('');
  };

  // Render Status Badge for Program Cards & Tables
  const renderStatusPill = (status: string) => {
    const upper = status.toUpperCase();
    if (upper === 'IN PROGRESS') {
      return <span className="ppt-status-pill status-in-progress">In Progress</span>;
    }
    if (upper === 'DELAYED') {
      return <span className="ppt-status-pill status-delayed">Delayed</span>;
    }
    if (upper === 'ON HOLD') {
      return <span className="ppt-status-pill status-on-hold">On Hold</span>;
    }
    if (upper === 'COMPLETED') {
      return <span className="ppt-status-pill status-completed">Completed</span>;
    }
    if (upper === 'YET TO START') {
      return <span className="ppt-status-pill status-yet-to-start">Yet To Start</span>;
    }
    return <span className="ppt-status-pill">{status}</span>;
  };



  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setShowSendModal(false);
      showToast(`Weekly Tracker presentation summary sent to ${recipientEmail}`);
    }, 800);
  };

  return (
    <motion.main
      className="weekly-dashboard-container"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* 1. TOP EXECUTIVE APP BAR */}
      <header className="weekly-app-header">
        <div className="header-branding">
          <div className="brand-badge">L&amp;D OPERATIONS DASHBOARD</div>
          <h1>L&amp;D Weekly Dashboard &amp; Tracker</h1>
          <span className="header-date">Week Date: {selectedWeekDate}</span>
        </div>

        {/* Week Selector Dropdown & Buttons */}
        <div className="week-selector-group">
          <button
            type="button"
            className="week-nav-btn"
            onClick={handlePrevWeek}
            title="Previous Week"
          >
            <ChevronLeft size={16} />
            <span>Prev Week</span>
          </button>

          <div className="week-select-wrapper">
            <Calendar size={15} className="week-select-icon" />
            <select
              value={selectedWeekDate}
              onChange={(e) => setSelectedWeekDate(e.target.value)}
              className="week-select-dropdown"
            >
              {AVAILABLE_WEEKS.map((w) => (
                <option key={w.date} value={w.date}>
                  {w.label}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="week-select-arrow" />
          </div>

          <button
            type="button"
            className="week-nav-btn"
            onClick={handleNextWeek}
            title="Next Week"
          >
            <span>Next Week</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* View Tab Selector */}
        <div className="view-tab-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'slides' ? 'active' : ''}`}
            onClick={() => setActiveTab('slides')}
          >
            <Layers size={15} />
            <span>Slide Deck</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            <BookOpen size={15} />
            <span>Programs ({programsData.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('certifications')}
          >
            <Award size={15} />
            <span>Certifications</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="header-quick-actions">
          <button
            type="button"
            className="action-btn primary-teal"
            onClick={() => setShowAddLogModal(true)}
          >
            <Plus size={14} />
            <span>Add Log</span>
          </button>

          <button
            type="button"
            className="action-btn outline-btn"
            onClick={() => setShowSendModal(true)}
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </div>
      </header>

      {/* 2. DYNAMIC WEEK-SPECIFIC KPI OVERVIEW BAR */}
      <section className="weekly-kpi-bar">
        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Trainings Conducted</span>
          <span className="kpi-mini-val">{weekKpi.trainingsConducted}</span>
        </div>
        <div className="kpi-mini-card blue">
          <span className="kpi-mini-label">Sessions Scheduled</span>
          <span className="kpi-mini-val">{weekKpi.sessionsScheduled}</span>
        </div>
        <div className="kpi-mini-card purple">
          <span className="kpi-mini-label">Total Participants</span>
          <span className="kpi-mini-val">{weekKpi.totalParticipants}</span>
        </div>
        <div className="kpi-mini-card green">
          <span className="kpi-mini-label">Assessments Completed</span>
          <span className="kpi-mini-val">{weekKpi.assessmentsCompleted}</span>
        </div>
        <div className="kpi-mini-card teal">
          <span className="kpi-mini-label">Passed This Week</span>
          <span className="kpi-mini-val">{weekKpi.passedThisWeek}</span>
        </div>
        <div className="kpi-mini-card red">
          <span className="kpi-mini-label">Delayed Programs</span>
          <span className="kpi-mini-val">{programMetrics.delayedCount}</span>
        </div>
      </section>

      {/* 3. MAIN CONTENT BODY */}

      {/* TAB 1: PRESENTATION SLIDE DECK VIEW FOR SELECTED WEEK */}
      {activeTab === 'slides' && (
        <section className="slides-view-section">
          {/* Slide Navigation Controls Bar */}
          <div className="slide-nav-bar">
            <div className="slide-counter-info">
              <span className="slide-num">Slide {currentSlideIndex + 1} of {slideDeck.length}</span>
              <span className="slide-title-text">{slideDeck[currentSlideIndex].title}</span>
            </div>

            <div className="slide-arrows-group">
              <button
                type="button"
                className="slide-nav-arrow"
                onClick={prevSlide}
                title="Previous Slide"
              >
                <ChevronLeft size={18} />
                <span>Prev Slide</span>
              </button>

              <button
                type="button"
                className="slide-nav-arrow"
                onClick={nextSlide}
                title="Next Slide"
              >
                <span>Next Slide</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* SLIDE CANVAS DISPLAY CONTAINER */}
          <div className="ppt-slide-canvas-frame">
            {/* SLIDE TYPE 1: COVER TITLE SLIDE */}
            {slideDeck[currentSlideIndex].type === 'title' && (
              <div className="ppt-slide cover-slide">
                <div className="cover-slide-content">
                  <h1 className="cover-title">L&amp;D Weekly Tracker</h1>
                  <div className="cover-date">{selectedWeekDate}</div>
                  <p style={{ marginTop: '1rem', color: '#64748b' }}>Weekly Report: {currentWeekLabel}</p>
                </div>
              </div>
            )}

            {/* SLIDE TYPE 2: PROGRAM TRACKER SLIDE */}
            {slideDeck[currentSlideIndex].type === 'program' && slideDeck[currentSlideIndex].data && (
              <div className="ppt-slide program-slide">
                {/* PPT Navy Banner */}
                <div className="ppt-banner">
                  <h2 className="ppt-banner-title">
                    {slideDeck[currentSlideIndex].data.title}
                  </h2>
                  <span className="ppt-banner-request-date">
                    Request Date: {slideDeck[currentSlideIndex].data.requestDate}
                  </span>
                </div>

                {/* Top Metrics Cards Row */}
                <div className="ppt-metrics-row">
                  <div className="ppt-metric-box">
                    <span className="ppt-metric-title">Total Participants:</span>
                    <span className="ppt-metric-value">{slideDeck[currentSlideIndex].data.totalParticipants}</span>
                  </div>

                  <div className="ppt-metric-box">
                    <span className="ppt-metric-title">Status:</span>
                    <span className="ppt-metric-value">
                      {renderStatusPill(slideDeck[currentSlideIndex].data.status)}
                    </span>
                  </div>

                  <div className="ppt-metric-box">
                    <span className="ppt-metric-title">Planned End Date:</span>
                    <span className="ppt-metric-value">{slideDeck[currentSlideIndex].data.plannedEndDate || 'NA'}</span>
                  </div>

                  {slideDeck[currentSlideIndex].data.revisedEndDate && (
                    <div className="ppt-metric-box">
                      <span className="ppt-metric-title">Revised End Date:</span>
                      <span className="ppt-metric-value">{slideDeck[currentSlideIndex].data.revisedEndDate}</span>
                    </div>
                  )}
                </div>

                {/* Weekly Activity Table */}
                <div className="ppt-table-container">
                  <table className="ppt-tracker-table">
                    <thead>
                      <tr>
                        <th style={{ width: '22%' }}>Week Start Date</th>
                        <th style={{ width: '48%' }}>Topic</th>
                        <th style={{ width: '15%' }}>Trainer</th>
                        <th style={{ width: '15%' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slideDeck[currentSlideIndex].data.weeklyRows.map((row: WeeklyRow, rIdx: number) => (
                        <tr key={rIdx}>
                          <td className="cell-date-range">{row.dateRange}</td>
                          <td className="cell-topic-text">{row.topic}</td>
                          <td className="cell-trainer">{row.trainer}</td>
                          <td className="cell-status">
                            <span className={`status-badge-cell ${row.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SLIDE TYPE 3: CERTIFICATION INITIATIVES WEEKLY STATUS SLIDE */}
            {slideDeck[currentSlideIndex].type === 'cert' && (
              <div className="ppt-slide cert-slide">
                <div className="ppt-banner cert-banner-styled">
                  <div className="cert-banner-accent" />
                  <div className="cert-banner-text-group">
                    <span className="cert-eyebrow">CERTIFICATION TRACKER</span>
                    <h2 className="ppt-banner-title">Certification Initiatives — Weekly Status</h2>
                  </div>
                  <div className="cert-banner-meta">
                    Week: <strong>{selectedWeekDate}</strong> &nbsp;|&nbsp; Owner: <strong>L&amp;D Team</strong>
                  </div>
                </div>

                {/* Top 4 KPI Cards */}
                <div className="cert-kpi-row">
                  <div className="cert-kpi-card teal-bar">
                    <span className="cert-kpi-number">14</span>
                    <span className="cert-kpi-label">Certifications</span>
                    <span className="cert-kpi-sub">This quarter</span>
                  </div>

                  <div className="cert-kpi-card navy-bar">
                    <span className="cert-kpi-number">109</span>
                    <span className="cert-kpi-label">Total Nominees</span>
                    <span className="cert-kpi-sub">Across all certs</span>
                  </div>

                  <div className="cert-kpi-card green-bar">
                    <span className="cert-kpi-number">{String(weekKpi.passedThisWeek).padStart(2, '0')}</span>
                    <span className="cert-kpi-label">Passed This Week</span>
                    <span className="cert-kpi-sub">New completions</span>
                  </div>

                  <div className="cert-kpi-card cyan-bar">
                    <span className="cert-kpi-number">70</span>
                    <span className="cert-kpi-label">Passed this Quarter</span>
                    <span className="cert-kpi-sub">This quarter</span>
                  </div>
                </div>

                <div className="cert-subheader-bar">CERTIFICATION DETAILS</div>

                <div className="ppt-table-container cert-table-scroll">
                  <table className="cert-details-table">
                    <thead>
                      <tr>
                        <th>Certification / Program</th>
                        <th>Practice / Requested</th>
                        <th>Provider</th>
                        <th>Deadline</th>
                        <th>Nominees</th>
                        <th>Enrolled</th>
                        <th>Passed</th>
                        <th>Pass Rate</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CERTIFICATION_INITIATIVES_DATA.map((c) => (
                        <tr key={c.id}>
                          <td className="cert-name-cell">{c.certification}</td>
                          <td>{c.practiceOrTeam}</td>
                          <td>{c.provider}</td>
                          <td>{c.deadline}</td>
                          <td>{String(c.nominees).padStart(2, '0')}</td>
                          <td>{String(c.enrolled).padStart(2, '0')}</td>
                          <td><strong>{String(c.passed).padStart(2, '0')}</strong></td>
                          <td className="pass-rate-cell">{c.passRate}</td>
                          <td className={`cert-status-cell ${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {c.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SLIDE TYPE 4: OTHER INITIATIVES SLIDE */}
            {slideDeck[currentSlideIndex].type === 'other_cert' && (
              <div className="ppt-slide cert-slide">
                <div className="ppt-banner cert-banner-styled">
                  <div className="cert-banner-accent" />
                  <div className="cert-banner-text-group">
                    <span className="cert-eyebrow">CERTIFICATION TRACKER</span>
                    <h2 className="ppt-banner-title">Other Initiatives — Databricks Expert Program</h2>
                  </div>
                </div>

                <div className="ppt-table-container" style={{ marginTop: '1.5rem' }}>
                  <table className="cert-details-table">
                    <thead>
                      <tr>
                        <th>Certification / Program</th>
                        <th>Required</th>
                        <th>Deadline</th>
                        <th>Nominees</th>
                        <th>Completed</th>
                        <th>Completion Rate</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {OTHER_INITIATIVES_DATA.map((o) => (
                        <tr key={o.id}>
                          <td className="cert-name-cell">{o.program}</td>
                          <td>{o.required}</td>
                          <td>{o.deadline}</td>
                          <td>{o.nominees}</td>
                          <td><strong>{o.completed}</strong></td>
                          <td className="pass-rate-cell">{o.completionRate}</td>
                          <td className={`cert-status-cell ${o.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {o.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Slide Thumbnails Tray */}
          <div className="slide-thumbnails-tray">
            {slideDeck.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className={`thumb-card ${currentSlideIndex === idx ? 'selected' : ''}`}
                onClick={() => setCurrentSlideIndex(idx)}
              >
                <span className="thumb-num">{idx + 1}</span>
                <span className="thumb-title">{s.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: INTERACTIVE TRAINING PROGRAMS VIEW FOR SELECTED WEEK */}
      {activeTab === 'programs' && (
        <section className="programs-view-section">
          <div className="programs-filter-bar">
            <div className="search-box-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search training programs or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="status-filter-pills">
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All ({programsData.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
                onClick={() => setStatusFilter('IN_PROGRESS')}
              >
                In Progress ({programMetrics.inProgressCount})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'DELAYED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('DELAYED')}
              >
                Delayed ({programMetrics.delayedCount})
              </button>
            </div>
          </div>

          <div className="programs-master-detail-grid">
            <div className="program-cards-list">
              {filteredPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className={`prog-card-item ${selectedProgramId === prog.id ? 'active' : ''}`}
                  onClick={() => setSelectedProgramId(prog.id)}
                >
                  <div className="card-top-row">
                    <h3 className="prog-title-text">{prog.title}</h3>
                    {renderStatusPill(prog.status)}
                  </div>
                  <div className="card-sub-info">
                    <span>Req: {prog.requestDate}</span>
                    <span>Participants: <strong>{prog.totalParticipants}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="program-detail-board">
              {selectedProgram ? (
                <div className="detail-board-inner">
                  <div className="ppt-banner">
                    <h2 className="ppt-banner-title">{selectedProgram.title}</h2>
                    <span className="ppt-banner-request-date">
                      Request Date: {selectedProgram.requestDate}
                    </span>
                  </div>

                  <div className="ppt-metrics-row">
                    <div className="ppt-metric-box">
                      <span className="ppt-metric-title">Total Participants:</span>
                      <span className="ppt-metric-value">{selectedProgram.totalParticipants}</span>
                    </div>

                    <div className="ppt-metric-box">
                      <span className="ppt-metric-title">Status:</span>
                      <span className="ppt-metric-value">{renderStatusPill(selectedProgram.status)}</span>
                    </div>

                    <div className="ppt-metric-box">
                      <span className="ppt-metric-title">Planned End Date:</span>
                      <span className="ppt-metric-value">{selectedProgram.plannedEndDate || 'NA'}</span>
                    </div>
                  </div>

                  <div className="ppt-table-container">
                    <table className="ppt-tracker-table">
                      <thead>
                        <tr>
                          <th style={{ width: '22%' }}>Week Start Date</th>
                          <th style={{ width: '48%' }}>Topic</th>
                          <th style={{ width: '15%' }}>Trainer</th>
                          <th style={{ width: '15%' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProgram.weeklyRows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td className="cell-date-range">{row.dateRange}</td>
                            <td className="cell-topic-text">{row.topic}</td>
                            <td className="cell-trainer">{row.trainer}</td>
                            <td className="cell-status">
                              <span className={`status-badge-cell ${row.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="empty-selection">Select a program to view details</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: CERTIFICATION INITIATIVES FULL VIEW */}
      {activeTab === 'certifications' && (
        <section className="cert-full-section">
          <div className="ppt-banner cert-banner-styled">
            <div className="cert-banner-accent" />
            <div className="cert-banner-text-group">
              <span className="cert-eyebrow">CERTIFICATION TRACKER</span>
              <h2 className="ppt-banner-title">Certification Initiatives — Weekly Status</h2>
            </div>
          </div>

          <div className="cert-kpi-row">
            <div className="cert-kpi-card teal-bar">
              <span className="cert-kpi-number">14</span>
              <span className="cert-kpi-label">Certifications</span>
              <span className="cert-kpi-sub">This quarter</span>
            </div>

            <div className="cert-kpi-card navy-bar">
              <span className="cert-kpi-number">109</span>
              <span className="cert-kpi-label">Total Nominees</span>
              <span className="cert-kpi-sub">Across all certs</span>
            </div>

            <div className="cert-kpi-card green-bar">
              <span className="cert-kpi-number">{String(weekKpi.passedThisWeek).padStart(2, '0')}</span>
              <span className="cert-kpi-label">Passed This Week</span>
              <span className="cert-kpi-sub">New completions</span>
            </div>

            <div className="cert-kpi-card cyan-bar">
              <span className="cert-kpi-number">70</span>
              <span className="cert-kpi-label">Passed this Quarter</span>
              <span className="cert-kpi-sub">This quarter</span>
            </div>
          </div>

          <div className="cert-subheader-bar">CERTIFICATION DETAILS</div>

          <div className="ppt-table-container">
            <table className="cert-details-table">
              <thead>
                <tr>
                  <th>Certification / Program</th>
                  <th>Practice / Requested</th>
                  <th>Provider</th>
                  <th>Deadline</th>
                  <th>Nominees</th>
                  <th>Enrolled</th>
                  <th>Passed</th>
                  <th>Pass Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {CERTIFICATION_INITIATIVES_DATA.map((c) => (
                  <tr key={c.id}>
                    <td className="cert-name-cell">{c.certification}</td>
                    <td>{c.practiceOrTeam}</td>
                    <td>{c.provider}</td>
                    <td>{c.deadline}</td>
                    <td>{String(c.nominees).padStart(2, '0')}</td>
                    <td>{String(c.enrolled).padStart(2, '0')}</td>
                    <td><strong>{String(c.passed).padStart(2, '0')}</strong></td>
                    <td className="pass-rate-cell">{c.passRate}</td>
                    <td className={`cert-status-cell ${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {c.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4. MODALS */}

      {/* MODAL: ADD STATUS LOG FOR SELECTED WEEK */}
      <AnimatePresence>
        {showAddLogModal && (
          <div className="modal-backdrop-overlay" onClick={() => setShowAddLogModal(false)}>
            <motion.div
              className="weekly-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <form onSubmit={handleAddLogSubmit}>
                <div className="modal-header-row">
                  <div className="modal-title-wrap">
                    <Plus className="icon-teal" size={20} />
                    <div>
                      <h3>Add Log to Week ({selectedWeekDate})</h3>
                      <p>Save status update for week: {currentWeekLabel}</p>
                    </div>
                  </div>
                  <button type="button" className="close-btn" onClick={() => setShowAddLogModal(false)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="modal-body-content">
                  <label className="form-field">
                    <span>Select Training Program *</span>
                    <select
                      value={newLogProgramId}
                      onChange={(e) => setNewLogProgramId(e.target.value)}
                      className="form-input-select"
                    >
                      {programsData.map((p) => (
                        <option key={p.id} value={p.id}>{p.programName}</option>
                      ))}
                    </select>
                  </label>

                  <div className="form-row-two">
                    <label className="form-field">
                      <span>Week Date Range *</span>
                      <input
                        type="text"
                        required
                        value={newLogDateRange}
                        onChange={(e) => setNewLogDateRange(e.target.value)}
                        placeholder="e.g. 17/09/2026 - 23/09/2026"
                        className="form-input-text"
                      />
                    </label>

                    <label className="form-field">
                      <span>Trainer / Owner *</span>
                      <input
                        type="text"
                        required
                        value={newLogTrainer}
                        onChange={(e) => setNewLogTrainer(e.target.value)}
                        placeholder="e.g. Janakiraman & Team"
                        className="form-input-text"
                      />
                    </label>
                  </div>

                  <label className="form-field">
                    <span>Weekly Topic &amp; Progress Description *</span>
                    <textarea
                      required
                      rows={3}
                      value={newLogTopic}
                      onChange={(e) => setNewLogTopic(e.target.value)}
                      placeholder="Describe progress for this week..."
                      className="form-input-textarea"
                    />
                  </label>

                  <label className="form-field">
                    <span>Weekly Status *</span>
                    <select
                      value={newLogStatus}
                      onChange={(e) => setNewLogStatus(e.target.value as any)}
                      className="form-input-select"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Yet To Start">Yet To Start</option>
                    </select>
                  </label>
                </div>

                <div className="modal-footer-row">
                  <button type="button" className="action-btn outline-btn" onClick={() => setShowAddLogModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="action-btn primary-teal">
                    Save Status Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* MODAL: SEND SUMMARY EMAIL */}
      <AnimatePresence>
        {showSendModal && (
          <div className="modal-backdrop-overlay" onClick={() => setShowSendModal(false)}>
            <motion.div
              className="weekly-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <form onSubmit={handleSendReport}>
                <div className="modal-header-row">
                  <div className="modal-title-wrap">
                    <Send className="icon-teal" size={20} />
                    <div>
                      <h3>Send Weekly Executive Summary</h3>
                      <p>Send report for week: {currentWeekLabel}</p>
                    </div>
                  </div>
                  <button type="button" className="close-btn" onClick={() => setShowSendModal(false)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="modal-body-content">
                  <label className="form-field">
                    <span>Recipient Email Address *</span>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="e.g. management@systechusa.com"
                      className="form-input-text"
                    />
                  </label>
                </div>

                <div className="modal-footer-row">
                  <button type="button" className="action-btn outline-btn" onClick={() => setShowSendModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="action-btn primary-teal" disabled={isSending}>
                    {isSending ? 'Sending...' : 'Send Summary Email'}
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
