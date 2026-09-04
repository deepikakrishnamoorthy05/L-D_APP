import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar as CalendarIcon,
  Clock,
  RotateCcw,
  Plus,
  X,
  UserCheck,
  Award,
  Sparkles,
  AlertTriangle,
  Edit,
  User,
  BookOpen,
  Filter,
  CheckCircle2,
  Video,
  MapPin,
  Users,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { Session, EventType, LearningTrack } from '../../types/session';
import { useSessions } from '../../context/SessionContext';
import { RescheduleSessionModal } from './RescheduleSessionModal';
import { CancelSessionModal } from './CancelSessionModal';

interface CalendarViewProps {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
  onScheduleForDate?: (dateStr: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedTrack: string;
  setSelectedTrack: (t: string) => void;
  selectedTrainer: string;
  setSelectedTrainer: (tr: string) => void;
  selectedEventType: string;
  setSelectedEventType: (e: string) => void;
  onClearFilters: () => void;
  viewMode: 'calendar' | 'schedule' | 'modules';
  setViewMode: (v: 'calendar' | 'schedule' | 'modules') => void;
  dynamicTrainers: string[];
}

// Soft Semantic Category Accents Mapping for Organization-wide L&D Training Types
const getPinCategoryStyle = (eventType: string, track?: string) => {
  const typeLower = (eventType || '').toLowerCase();
  const trackLower = (track || '').toLowerCase();

  // Knowledge Sharing / Knowledge Sharing Series -> Cyan / Aqua
  if (typeLower.includes('knowledge') || typeLower.includes('sharing')) {
    return {
      category: 'Knowledge Sharing',
      bgColor: '#ECFEFF',
      borderColor: '#A5F3FC',
      pinColor: '#0891B2',
      textColor: '#155E75',
      badgeBg: '#CFFAFE',
    };
  }
  // Informatica Training -> Deep Indigo
  if (typeLower.includes('informatica')) {
    return {
      category: 'Informatica Training',
      bgColor: '#EEF2FF',
      borderColor: '#C7D2FE',
      pinColor: '#4F46E5',
      textColor: '#3730A3',
      badgeBg: '#E0E7FF',
    };
  }
  // Antigravity Training -> Purple / Electric Violet
  if (typeLower.includes('antigravity')) {
    return {
      category: 'Antigravity Training',
      bgColor: '#F5F3FF',
      borderColor: '#DDD6FE',
      pinColor: '#7C3AED',
      textColor: '#5B21B6',
      badgeBg: '#EDE9FE',
    };
  }
  // Databricks Training -> Sky Blue
  if (typeLower.includes('databricks')) {
    return {
      category: 'Databricks Training',
      bgColor: '#F0F9FF',
      borderColor: '#BAE6FD',
      pinColor: '#0284C7',
      textColor: '#075985',
      badgeBg: '#E0F2FE',
    };
  }
  // BA Training / BA -> Amber / Gold
  if (typeLower.includes('ba training') || typeLower.includes('business analyst') || trackLower === 'ba') {
    return {
      category: 'BA Training',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
      pinColor: '#D97706',
      textColor: '#92400E',
      badgeBg: '#FEF3C7',
    };
  }
  // DE Training / DE -> Emerald / Teal
  if (typeLower.includes('de training') || typeLower.includes('data engineering') || trackLower === 'de') {
    return {
      category: 'DE Training',
      bgColor: '#F0FDF4',
      borderColor: '#A7F3D0',
      pinColor: '#059669',
      textColor: '#065F46',
      badgeBg: '#D1FAE5',
    };
  }
  // Tools Training / Tools -> Rose / Pink
  if (typeLower.includes('tool') || trackLower.includes('tools') || trackLower.includes('dbt')) {
    return {
      category: 'Tool Training',
      bgColor: '#FFF1F2',
      borderColor: '#FECDD3',
      pinColor: '#E11D48',
      textColor: '#9F1239',
      badgeBg: '#FFE4E6',
    };
  }
  // Technical Training -> Blue
  if (typeLower.includes('technical') || typeLower.includes('engineering') || typeLower.includes('tech deep dive')) {
    return {
      category: 'Technical Training',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      pinColor: '#2563EB',
      textColor: '#1E40AF',
      badgeBg: '#DBEAFE',
    };
  }
  // Soft Skills Training -> Fuchsia / Pink
  if (typeLower.includes('soft skills') || typeLower.includes('communication')) {
    return {
      category: 'Soft Skills',
      bgColor: '#FDF4FF',
      borderColor: '#F5D0FE',
      pinColor: '#C026D3',
      textColor: '#86198F',
      badgeBg: '#FAE8FF',
    };
  }
  // Management Training -> Slate / Steel
  if (typeLower.includes('management') || typeLower.includes('agile')) {
    return {
      category: 'Management Training',
      bgColor: '#F1F5F9',
      borderColor: '#CBD5E1',
      pinColor: '#475569',
      textColor: '#1E293B',
      badgeBg: '#E2E8F0',
    };
  }
  // External Training -> Lime
  if (typeLower.includes('external')) {
    return {
      category: 'External Training',
      bgColor: '#F7FEE7',
      borderColor: '#D9F99D',
      pinColor: '#65A30D',
      textColor: '#3F6212',
      badgeBg: '#ECFCCB',
    };
  }
  // Upskilling Session -> Purple
  if (typeLower.includes('upskilling')) {
    return {
      category: 'Upskilling Session',
      bgColor: '#FAF5FF',
      borderColor: '#E9D5FF',
      pinColor: '#9333EA',
      textColor: '#6B21A8',
      badgeBg: '#F3E8FF',
    };
  }
  // Workshop -> Amber / Orange
  if (typeLower.includes('workshop')) {
    return {
      category: 'Workshop',
      bgColor: '#FFF7ED',
      borderColor: '#FFEDD5',
      pinColor: '#EA580C',
      textColor: '#9A3412',
      badgeBg: '#FFEDD5',
    };
  }
  // Certification Prep / Certification -> Green
  if (typeLower.includes('cert') || typeLower.includes('sign off')) {
    return {
      category: 'Certification',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      pinColor: '#059669',
      textColor: '#065F46',
      badgeBg: '#D1FAE5',
    };
  }
  // Assessment / Mock Test -> Orange / Red
  if (typeLower.includes('assessment') || typeLower.includes('mock')) {
    return {
      category: 'Assessment',
      bgColor: '#FFF7ED',
      borderColor: '#FFEDD5',
      pinColor: '#EA580C',
      textColor: '#9A3412',
      badgeBg: '#FFEDD5',
    };
  }
  // Holiday / Leave -> Rose / Light Red
  if (typeLower.includes('holiday') || typeLower.includes('leave')) {
    return {
      category: 'Holiday / Leave',
      bgColor: '#FEF2F2',
      borderColor: '#FCA5A5',
      pinColor: '#EF4444',
      textColor: '#991B1B',
      badgeBg: '#FEE2E2',
    };
  }
  // Bootcamp Training -> Teal
  if (typeLower.includes('bootcamp') || trackLower.includes('bootcamp')) {
    return {
      category: 'Bootcamp',
      bgColor: '#F0FDF4',
      borderColor: '#99F6E4',
      pinColor: '#0D9488',
      textColor: '#115E59',
      badgeBg: '#CCFBF1',
    };
  }

  // Default: Internal Training
  return {
    category: 'Internal Training',
    bgColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    pinColor: '#0F766E',
    textColor: '#334155',
    badgeBg: '#F1F5F9',
  };
};

// Deterministic rotation helper max ±0.7 deg
const getDeterministicRotation = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const deg = ((Math.abs(hash) % 15) - 7) * 0.1; // -0.7 to +0.7 deg
  return deg;
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  onSelectSession,
  onScheduleForDate,
  searchQuery,
  setSearchQuery,
  selectedTrack,
  setSelectedTrack,
  selectedTrainer,
  setSelectedTrainer,
  selectedEventType,
  setSelectedEventType,
  onClearFilters,
  viewMode,
  setViewMode,
  dynamicTrainers,
}) => {
  const { rescheduleSession } = useSessions();
  const [currentDate, setCurrentDate] = useState(new Date()); // Default Present Month
  const [subView, setSubView] = useState<'month' | 'week'>('month');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Selected session for right-side drawer
  const [activeDrawerSession, setActiveDrawerSession] = useState<Session | null>(null);
  
  // Reschedule & Cancel modals
  const [reschedulingSession, setReschedulingSession] = useState<Session | null>(null);
  const [cancellingSession, setCancellingSession] = useState<Session | null>(null);

  // Filters state
  const [selectedDeliveryMode, setSelectedDeliveryMode] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Day Schedule Panel for +N more
  const [dayScheduleDate, setDayScheduleDate] = useState<{ dateStr: string; dayNum: number } | null>(null);

  // Drag & Drop state
  const [draggedSession, setDraggedSession] = useState<Session | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{ session: Session; targetDate: string } | null>(null);

  // Conflict warning state
  const [conflictData, setConflictData] = useState<{
    session: Session;
    targetDate: string;
    conflictingSession: Session;
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setSlideDirection('left');
    setCurrentDate(new Date(year, month - 1, 1));
    setTimeout(() => setSlideDirection(null), 300);
  };

  const nextMonth = () => {
    setSlideDirection('right');
    setCurrentDate(new Date(year, month + 1, 1));
    setTimeout(() => setSlideDirection(null), 300);
  };

  const goToToday = () => {
    setSlideDirection(null);
    setCurrentDate(new Date());
  };

  // Month grid days calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean }> = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevDay = prevMonthDays - i;
    const prevMonthNum = month === 0 ? 12 : month;
    const prevYearNum = month === 0 ? year - 1 : year;
    const monthStr = String(prevMonthNum).padStart(2, '0');
    daysArray.push({
      dayNum: prevDay,
      dateStr: `${prevYearNum}-${monthStr}-${String(prevDay).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    daysArray.push({
      dayNum: d,
      dateStr: `${year}-${monthStr}-${dayStr}`,
      isCurrentMonth: true,
    });
  }

  // Index sessions by YYYY-MM-DD
  const sessionsByDate: Record<string, Session[]> = {};
  sessions.forEach((s) => {
    if (!sessionsByDate[s.sessionDate]) {
      sessionsByDate[s.sessionDate] = [];
    }
    sessionsByDate[s.sessionDate].push(s);
  });

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Trainer conflict checker helper
  const checkTrainerConflict = (
    trainerId: string | undefined,
    trainerName: string | undefined,
    targetDate: string,
    startTime: string,
    endTime: string,
    excludeSessionId: string
  ): Session | null => {
    if (!trainerName && !trainerId) return null;
    return (
      sessions.find((s) => {
        if (s.id === excludeSessionId) return false;
        if (s.status === 'Cancelled' || s.eventType === 'Holiday') return false;
        if (s.sessionDate !== targetDate) return false;
        
        const isSameTrainer =
          (trainerId && s.trainerId === trainerId) ||
          (trainerName && s.trainerName === trainerName);

        if (!isSameTrainer) return false;

        // Time overlap check
        return startTime < s.endTime && endTime > s.startTime;
      }) || null
    );
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, session: Session) => {
    e.dataTransfer.setData('text/plain', session.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSession(session);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetDate !== dateStr) {
      setDropTargetDate(dateStr);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDropTargetDate(null);
    if (!draggedSession) return;

    if (draggedSession.sessionDate === targetDate) {
      setDraggedSession(null);
      return;
    }

    // Prepare pending move
    setPendingMove({
      session: draggedSession,
      targetDate,
    });
    setDraggedSession(null);
  };

  // Confirm Reschedule action
  const executeReschedule = () => {
    if (!pendingMove) return;
    const { session, targetDate } = pendingMove;

    // Check trainer conflict
    const conflict = checkTrainerConflict(
      session.trainerId,
      session.trainerName,
      targetDate,
      session.startTime,
      session.endTime,
      session.id
    );

    if (conflict) {
      setConflictData({
        session,
        targetDate,
        conflictingSession: conflict,
      });
      setPendingMove(null);
      return;
    }

    // Execute reschedule
    rescheduleSession(
      session.id,
      targetDate,
      session.startTime,
      session.endTime,
      `Rescheduled via Planning Board drag-and-drop`
    );

    setPendingMove(null);
  };

  // Week View Data Scale & Dynamic Days Calculation
  const hoursList = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const todayDateStr = new Date().toISOString().split('T')[0];
  
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + dayOffset);
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dateNumStr = String(d.getDate()).padStart(2, '0');
    return {
      name: dayNames[dayOffset],
      dayNum: d.getDate(),
      dateStr: `${d.getFullYear()}-${monthStr}-${dateNumStr}`,
    };
  });

  return (
    <div className="ld-planning-board-wrapper relative">
      {/* MAIN L&D TRAINING PLANNING BOARD FRAME */}
      <div className="ld-planning-board-frame">
        {/* Subtle Board Corner Metallic Brackets */}
        <div className="board-corner-bracket top-left" />
        <div className="board-corner-bracket top-right" />
        <div className="board-corner-bracket bottom-left" />
        <div className="board-corner-bracket bottom-right" />

        {/* Board Background Details & Micro Dots Watermark */}
        <div className="board-texture-overlay" />
        <div className="board-watermark-label">L&amp;D OPERATIONS BOARD</div>

        {/* 1. TOP BOARD HEADER SECTION */}
        <div className="board-header-row">
          {/* LEFT: TITLE & MONTH NAVIGATION */}
          <div className="board-header-left">
            <div className="board-title-group">
              <h2 className="board-main-title">L&amp;D CALENDAR BOARD</h2>
              <div className="board-month-navigator">
                <button type="button" className="board-nav-btn" onClick={prevMonth} title="Previous Month">
                  <ChevronLeft size={16} />
                </button>
                <span className="board-month-text">{monthName}</span>
                <button type="button" className="board-nav-btn" onClick={nextMonth} title="Next Month">
                  <ChevronRight size={16} />
                </button>
                <button type="button" className="board-today-btn ml-2" onClick={goToToday}>
                  Today
                </button>
              </div>
            </div>
            <span className="board-session-badge">
              {sessions.length} Scheduled Sessions
            </span>
          </div>

          {/* CENTER: SEGMENTED VIEW SWITCHER (Calendar / Timeline / Modules) */}
          <div className="board-header-center">
            <div className="board-segmented-switch">
              {(['calendar', 'schedule', 'modules'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`board-segmented-btn ${viewMode === m ? 'active' : ''}`}
                  onClick={() => setViewMode(m)}
                >
                  {viewMode === m && (
                    <motion.div
                      layoutId="boardViewTab"
                      className="board-segmented-pill-bg"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 capitalize font-bold text-xs">
                    {m === 'schedule' ? 'Timeline' : m}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: SUB-VIEW (Month / Week) & SCHEDULE SESSION BUTTON */}
          <div className="board-header-right">
            <div className="board-segmented-switch compact">
              {(['month', 'week'] as const).map((sv) => (
                <button
                  key={sv}
                  type="button"
                  className={`board-segmented-btn ${subView === sv ? 'active' : ''}`}
                  onClick={() => setSubView(sv)}
                >
                  {subView === sv && (
                    <motion.div
                      layoutId="boardSubViewTab"
                      className="board-segmented-pill-bg"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 capitalize font-bold text-xs">{sv}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="board-primary-action-btn"
              onClick={() => onScheduleForDate && onScheduleForDate(todayDateStr)}
            >
              <Plus size={15} /> Schedule Session
            </button>
          </div>
        </div>

        {/* 2. FILTER TOOLBAR INTEGRATED INSIDE BOARD */}
        <div className="board-filter-toolbar">
          <div className="filter-group-left flex items-center gap-2 flex-wrap">
            <div className="board-search-field">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search training, trainer, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="board-search-input"
              />
            </div>

            <div className="board-select-box">
              <Filter size={12} className="select-icon" />
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="board-select"
              >
                <option value="All">Track: All</option>
                <option value="BA">BA</option>
                <option value="DE">DE</option>
                <option value="Tools">Tools</option>
                <option value="Common Foundation">Common Foundation</option>
                <option value="DBT & Snowflake">dbt &amp; Snowflake</option>
                <option value="Databricks">Databricks</option>
              </select>
            </div>

            <div className="board-select-box">
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="board-select"
              >
                <option value="All">Type: All</option>
                <option value="Bootcamp Training">Bootcamp Training</option>
                <option value="Knowledge Sharing Series">Knowledge Sharing Series</option>
                <option value="Informatica Training">Informatica Training</option>
                <option value="Antigravity Training">Antigravity Training</option>
                <option value="Databricks Training">Databricks Training</option>
                <option value="BA Training">BA Training</option>
                <option value="DE Training">DE Training</option>
                <option value="Tools Training">Tools Training</option>
                <option value="Technical Training">Technical Training</option>
                <option value="Workshop">Workshop</option>
                <option value="Internal Training">Internal Training</option>
                <option value="Certification Preparation">Certification Prep</option>
                <option value="Assessment">Assessment</option>
                <option value="Soft Skills Training">Soft Skills Training</option>
                <option value="Management Training">Management Training</option>
                <option value="External Training">External Training</option>
                <option value="Upskilling Session">Upskilling Session</option>
                <option value="Holiday">Holiday / Leave</option>
              </select>
            </div>

            <div className="board-select-box">
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className="board-select"
              >
                <option value="All">Trainer: All</option>
                {dynamicTrainers.map((tr) => (
                  <option key={tr} value={tr}>{tr}</option>
                ))}
              </select>
            </div>

            <div className="board-select-box">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="board-select"
              >
                <option value="All">Status: All</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="board-select-box">
              <select
                value={selectedDeliveryMode}
                onChange={(e) => setSelectedDeliveryMode(e.target.value)}
                className="board-select"
              >
                <option value="All">Mode: All</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="In Person">In Person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            className="board-clear-btn"
            onClick={() => {
              onClearFilters();
              setSelectedDeliveryMode('All');
              setSelectedStatus('All');
            }}
          >
            <RotateCcw size={12} /> Clear Filters
          </button>
        </div>

        {/* 3. CALENDAR BODY MOUNTED INSIDE THE PLANNING BOARD */}
        {subView === 'month' ? (
          <div className={`board-month-view-container ${slideDirection ? `slide-${slideDirection}` : ''}`}>
            {/* Weekday Column Headers */}
            <div className="board-weekday-header-grid">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="board-weekday-cell">
                  {day}
                </div>
              ))}
            </div>

            {/* 7-Column Connected Calendar Grid */}
            <div className="board-month-grid">
              {daysArray.map((cell, idx) => {
                const daySessions = sessionsByDate[cell.dateStr] || [];
                const visibleSessions = daySessions.slice(0, 3);
                const extraCount = daySessions.length - 3;
                const isToday = cell.dateStr === todayDateStr;
                const isDropTarget = dropTargetDate === cell.dateStr;

                const dateObj = new Date(cell.dateStr + 'T00:00:00');
                const dayOfWeekNum = dateObj.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
                const isWeekday = dayOfWeekNum >= 1 && dayOfWeekNum <= 5;
                const isWeekend = dayOfWeekNum === 0 || dayOfWeekNum === 6;

                return (
                  <div
                    key={idx}
                    className={`board-day-cell ${!cell.isCurrentMonth ? 'muted-day' : ''} ${isToday ? 'today-board-cell' : ''} ${isDropTarget ? 'drop-target-active' : ''} ${isWeekend ? 'weekend-day-cell' : ''}`}
                    onDragOver={(e) => handleDragOver(e, cell.dateStr)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, cell.dateStr)}
                  >
                    {/* Day Cell Top Date Marker & Add Session Hover Button */}
                    <div className="day-cell-top-bar">
                      <span className={`date-number-marker ${isToday ? 'today-teal-circle' : ''}`}>
                        {cell.dayNum}
                      </span>

                      {/* Day Hover "+ Add Session" Button */}
                      <button
                        type="button"
                        className="day-hover-add-btn"
                        title={`Add session on ${cell.dateStr}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onScheduleForDate) onScheduleForDate(cell.dateStr);
                        }}
                      >
                        + Add Session
                      </button>
                    </div>

                    {/* Subtle Available Indicator for Empty Weekdays (Mon-Fri) & Weekend Badge */}
                    {daySessions.length === 0 && cell.isCurrentMonth && (
                      <div className="empty-day-status-bar">
                        {isWeekday ? (
                          <div className="available-day-pill" title="No scheduled sessions. Working day available.">
                            <span className="available-dot">●</span> Available
                          </div>
                        ) : (
                          <div className="weekend-day-pill" title="Weekend non-working day">
                            Weekend
                          </div>
                        )}
                      </div>
                    )}

                    {/* Day Sessions Pinned Notes Stack */}
                    <div className="day-pinned-notes-stack">
                      {visibleSessions.map((s, sIdx) => {
                        const styleInfo = getPinCategoryStyle(s.eventType, s.learningTrack);
                        const rotationDeg = getDeterministicRotation(s.id);

                        return (
                          <motion.div
                            key={s.id}
                            initial={{ opacity: 0, scale: 0.96, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: sIdx * 0.04 }}
                            whileHover={{
                              y: -4,
                              scale: 1.015,
                              rotate: 0,
                              boxShadow: '0 10px 20px rgba(15, 40, 50, 0.14)',
                            }}
                            draggable
                            onDragStart={(e: any) => handleDragStart(e, s)}
                            className="pinned-schedule-note-card"
                            style={{
                              backgroundColor: styleInfo.bgColor,
                              borderColor: styleInfo.borderColor,
                              transform: `rotate(${rotationDeg}deg)`,
                            }}
                            onClick={() => setActiveDrawerSession(s)}
                          >
                            {/* Metallic Spherical 3D Pin Head */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.15, 1] }}
                              transition={{ duration: 0.25, delay: sIdx * 0.04 + 0.1 }}
                              className="pinned-3d-dot"
                              style={{ backgroundColor: styleInfo.pinColor }}
                            />

                            {/* Note Content */}
                            <div className="note-card-inner">
                              <div className="note-time-row" style={{ color: styleInfo.textColor }}>
                                <Clock size={11} className="inline mr-1 opacity-75" />
                                {s.startTime} – {s.endTime}
                              </div>
                              <h4 className="note-title-text" style={{ color: '#0F2A33' }}>
                                {s.title}
                              </h4>
                              <div className="note-trainer-text">
                                <User size={10} className="inline mr-1 opacity-60" />
                                {s.trainerName || 'Trainer not assigned'}
                              </div>
                              <div
                                className="note-category-tag"
                                style={{
                                  backgroundColor: styleInfo.badgeBg,
                                  color: styleInfo.textColor,
                                }}
                              >
                                {styleInfo.category}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* +N More Button */}
                      {extraCount > 0 && (
                        <button
                          type="button"
                          className="board-more-notes-btn"
                          onClick={() => setDayScheduleDate({ dateStr: cell.dateStr, dayNum: cell.dayNum })}
                        >
                          +{extraCount} more activities
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* WEEK BOARD TIMETABLE VIEW */
          <div className="board-week-timetable-container">
            <div className="week-timetable-header-row">
              <div className="time-col-header">TIME</div>
              {weekDays.map((wd) => (
                <div key={wd.dateStr} className={`week-header-day-cell ${wd.dateStr === todayDateStr ? 'today-week-header' : ''}`}>
                  <span className="week-day-name">{wd.name}</span>
                  <span className={`week-day-num ${wd.dateStr === todayDateStr ? 'today-circle-num' : ''}`}>{wd.dayNum}</span>
                </div>
              ))}
            </div>

            <div className="week-timetable-body relative">
              {/* Subtle Red Current-Time Line across timetable */}
              <div className="board-current-time-line" style={{ top: '160px' }}>
                <span className="current-time-dot" />
                <span className="current-time-label">10:15 AM</span>
              </div>

              {hoursList.map((hr) => {
                const hourLabel = hr > 12 ? `${hr - 12} PM` : hr === 12 ? '12 PM' : `${hr} AM`;
                return (
                  <div key={hr} className="week-timetable-row">
                    <div className="time-slot-label">{hourLabel}</div>
                    {weekDays.map((wd) => {
                      const daySessions = sessionsByDate[wd.dateStr] || [];
                      const matchingSession = daySessions.find((s) => {
                        const sHour = parseInt((s.startTime || '09:00').split(':')[0], 10);
                        return sHour === hr;
                      });

                      return (
                        <div key={wd.dateStr} className="week-slot-cell">
                          {matchingSession && (
                            <motion.div
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="week-pinned-session-note"
                              style={{
                                backgroundColor: getPinCategoryStyle(matchingSession.eventType, matchingSession.learningTrack).bgColor,
                                borderColor: getPinCategoryStyle(matchingSession.eventType, matchingSession.learningTrack).borderColor,
                              }}
                              onClick={() => setActiveDrawerSession(matchingSession)}
                            >
                              <div
                                className="pinned-3d-dot mini"
                                style={{ backgroundColor: getPinCategoryStyle(matchingSession.eventType, matchingSession.learningTrack).pinColor }}
                              />
                              <div className="week-note-time">
                                {matchingSession.startTime} – {matchingSession.endTime}
                              </div>
                              <div className="week-note-title">{matchingSession.title}</div>
                              <div className="week-note-trainer">{matchingSession.trainerName || 'Trainer not assigned'}</div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. EVENT DETAILS RIGHT-SIDE PREMIUM DRAWER */}
      <AnimatePresence>
        {activeDrawerSession && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="drawer-backdrop"
              onClick={() => setActiveDrawerSession(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="board-event-details-drawer"
            >
              <div className="drawer-header-strip">
                <div className="drawer-header-title-block">
                  <span className="drawer-track-badge">
                    {activeDrawerSession.learningTrack || 'DE'}
                  </span>
                  <h3 className="drawer-main-title">{activeDrawerSession.title}</h3>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setActiveDrawerSession(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="drawer-body-content space-y-4">
                {/* Event Key Spec Tiles */}
                <div className="drawer-spec-grid">
                  <div className="spec-tile">
                    <span className="spec-label">Date &amp; Day</span>
                    <span className="spec-value">{activeDrawerSession.sessionDate} ({activeDrawerSession.dayOfWeek || 'Wednesday'})</span>
                  </div>
                  <div className="spec-tile">
                    <span className="spec-label">Time Slot</span>
                    <span className="spec-value">{activeDrawerSession.startTime} – {activeDrawerSession.endTime}</span>
                  </div>
                  <div className="spec-tile">
                    <span className="spec-label">Assigned Trainer</span>
                    <span className="spec-value highlight">{activeDrawerSession.trainerName || 'Sarah David'}</span>
                  </div>
                  <div className="spec-tile">
                    <span className="spec-label">Track</span>
                    <span className="spec-value">{activeDrawerSession.learningTrack || 'DE'}</span>
                  </div>
                  <div className="spec-tile">
                    <span className="spec-label">Delivery Mode</span>
                    <span className="spec-value font-semibold text-teal-700 dark:text-teal-300">
                      {activeDrawerSession.deliveryMode || 'Microsoft Teams'}
                    </span>
                  </div>
                  <div className="spec-tile">
                    <span className="spec-label">Enrolled Participants</span>
                    <span className="spec-value">{activeDrawerSession.attendedCount || 18} Enrolled</span>
                  </div>
                </div>

                {/* Teams Link Box */}
                <div className="p-3 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <div className="text-xs font-extrabold text-cyan-950 dark:text-cyan-200">Microsoft Teams Meeting</div>
                      <div className="text-[11px] text-cyan-700 dark:text-cyan-300">Join session via corporate calendar invite</div>
                    </div>
                  </div>
                  <a
                    href="https://teams.microsoft.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> Join Teams
                  </a>
                </div>

                <div className="drawer-agenda-box">
                  <span className="agenda-title">Agenda &amp; Topics</span>
                  <p className="agenda-desc">{activeDrawerSession.agenda || 'Databricks Performance Optimization & Cluster Tuning Workshop'}</p>
                </div>

                {/* Automated Reminder Status Badge Box */}
                <div className="drawer-reminder-card p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-teal-200/60 dark:border-teal-800/40">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-teal-600 dark:text-teal-400" />
                      <span className="font-extrabold text-xs text-teal-950 dark:text-teal-200">Automated Reminder Job</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-sm">
                      ● Active &amp; Queued
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Next Notification:</span> 1-Day Reminder Scheduled for {activeDrawerSession.sessionDate} • 3:00 PM
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Recipients:</span> Trainer ({activeDrawerSession.trainerName || 'Sarah David'}) + {activeDrawerSession.totalEnrolled || 18} Participants
                    </div>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-teal-700 dark:text-teal-300 font-semibold">
                      <span>☑ 1-Day Before</span>
                      <span>☑ 1-Hour Before</span>
                      <span>☐ 30-Min Before</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    className="py-2 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    onClick={() => {
                      setReschedulingSession(activeDrawerSession);
                    }}
                  >
                    <Clock size={13} /> Reschedule
                  </button>

                  <button
                    type="button"
                    className="py-2 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    onClick={() => {
                      setCancellingSession(activeDrawerSession);
                    }}
                  >
                    <AlertTriangle size={13} /> Cancel Session
                  </button>

                  <button
                    type="button"
                    className="py-2 px-3 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-900 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    onClick={() => {
                      const id = activeDrawerSession.id;
                      setActiveDrawerSession(null);
                      onSelectSession(id);
                    }}
                  >
                    <UserCheck size={13} /> Record Attendance
                  </button>

                  <button
                    type="button"
                    className="py-2 px-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    onClick={() => {
                      const id = activeDrawerSession.id;
                      setActiveDrawerSession(null);
                      onSelectSession(id);
                    }}
                  >
                    <Edit size={13} /> Full Details &amp; Edit
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODALS */}
      {reschedulingSession && (
        <RescheduleSessionModal
          session={reschedulingSession}
          onClose={() => setReschedulingSession(null)}
          onSuccess={() => {
            setReschedulingSession(null);
            setActiveDrawerSession(null);
          }}
        />
      )}

      {cancellingSession && (
        <CancelSessionModal
          session={cancellingSession}
          onClose={() => setCancellingSession(null)}
          onSuccess={() => {
            setCancellingSession(null);
            setActiveDrawerSession(null);
          }}
        />
      )}

      {/* 5. DAY SCHEDULE FLOATING BOARD PANEL (+N More Modal) */}
      <AnimatePresence>
        {dayScheduleDate && (
          <div className="ui-modal-overlay">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="ui-modal-content max-w-lg p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-teal-950">
                    {dayScheduleDate.dateStr} Schedule Board
                  </h3>
                  <span className="text-xs text-gray-500">
                    {(sessionsByDate[dayScheduleDate.dateStr] || []).length} Training Activities
                  </span>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-gray-100"
                  onClick={() => setDayScheduleDate(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="py-4 space-y-3 max-h-96 overflow-y-auto">
                {(sessionsByDate[dayScheduleDate.dateStr] || []).map((s) => {
                  const styleInfo = getPinCategoryStyle(s.eventType, s.learningTrack);
                  return (
                    <div
                      key={s.id}
                      className="pinned-schedule-note-card full-width cursor-pointer"
                      style={{
                        backgroundColor: styleInfo.bgColor,
                        borderColor: styleInfo.borderColor,
                      }}
                      onClick={() => {
                        setDayScheduleDate(null);
                        setActiveDrawerSession(s);
                      }}
                    >
                      <div className="pinned-3d-dot" style={{ backgroundColor: styleInfo.pinColor }} />
                      <div className="note-card-inner">
                        <div className="note-time-row" style={{ color: styleInfo.textColor }}>
                          <Clock size={11} className="inline mr-1" />
                          {s.startTime} – {s.endTime}
                        </div>
                        <h4 className="note-title-text" style={{ color: '#0F2A33' }}>
                          {s.title}
                        </h4>
                        <div className="note-trainer-text">Trainer: {s.trainerName || 'Trainer not assigned'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  className="ui-button-secondary"
                  onClick={() => setDayScheduleDate(null)}
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. DROP CONFIRMATION MODAL */}
      <AnimatePresence>
        {pendingMove && (
          <div className="ui-modal-overlay">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="ui-modal-content max-w-md p-6"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-teal-950">RESCHEDULE SESSION</h3>
                  <span className="text-xs text-gray-500">Confirm session board drag-and-drop</span>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <h4 className="font-bold text-teal-900 text-sm">{pendingMove.session.title}</h4>
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <p><strong>From:</strong> {pendingMove.session.sessionDate} • {pendingMove.session.startTime}</p>
                    <p><strong>To:</strong> <span className="text-teal-700 font-bold">{pendingMove.targetDate}</span> • {pendingMove.session.startTime}</p>
                    <p><strong>Trainer:</strong> {pendingMove.session.trainerName || 'Trainer not assigned'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="ui-button-secondary"
                  onClick={() => setPendingMove(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ui-button-primary"
                  onClick={executeReschedule}
                >
                  Confirm Reschedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. TRAINER CONFLICT WARNING MODAL */}
      <AnimatePresence>
        {conflictData && (
          <div className="ui-modal-overlay">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="ui-modal-content max-w-md p-6"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-rose-200">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-rose-950">Trainer Conflict</h3>
                  <span className="text-xs text-rose-700">Schedule Overlap Warning</span>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-xs text-gray-700">
                  <strong>{conflictData.session.trainerName || 'Trainer not assigned'}</strong> already has another session scheduled on target date:
                </p>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                  <p className="font-bold text-rose-900">{conflictData.conflictingSession.title}</p>
                  <p className="text-rose-700">{conflictData.conflictingSession.sessionDate} • {conflictData.conflictingSession.startTime} – {conflictData.conflictingSession.endTime}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="ui-button-secondary"
                  onClick={() => setConflictData(null)}
                >
                  Cancel Move
                </button>
                <button
                  type="button"
                  className="ui-button-primary"
                  onClick={() => {
                    const sessionToEdit = conflictData.session;
                    setConflictData(null);
                    onSelectSession(sessionToEdit.id);
                  }}
                >
                  Choose Another Trainer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
