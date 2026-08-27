import React, { createContext, useContext, useState } from 'react';
import { Session, AttendanceRecord, SessionStatus, CalendarImportStats } from '../types/session';
import { COMPANY_CALENDAR_SESSIONS, classifyEventType } from '../data/companyCalendarDataset';
import { INITIAL_ATTENDANCE } from '../data/sessionMockData';
import { useBootcamps } from './BootcampContext';
import { useTrainees } from './TraineeContext';

interface TraineeAttendanceStats {
  totalConducted: number;
  attended: number;
  missed: number;
  late: number;
  attendancePercent: number;
  records: Array<{
    sessionId: string;
    sessionTitle: string;
    moduleName: string;
    sessionDate: string;
    status: 'Present' | 'Absent' | 'Late';
    remarks?: string;
  }>;
}

interface SessionContextType {
  sessions: Session[];
  attendanceMap: Record<string, AttendanceRecord[]>;
  createSession: (sessionData: Partial<Session>) => boolean;
  updateSession: (id: string, sessionData: Partial<Session>) => boolean;
  rescheduleSession: (id: string, newDate: string, newStart: string, newEnd: string, reason?: string) => void;
  cancelSession: (id: string, reason?: string) => void;
  markCompleted: (id: string) => void;
  recordAttendance: (sessionId: string, records: Array<{ traineeId: string; status: 'Present' | 'Absent' | 'Late'; remarks?: string }>) => void;
  getTraineeAttendanceStats: (traineeId: string) => TraineeAttendanceStats;
  importCalendarData: (rows: Record<string, unknown>[]) => CalendarImportStats;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>(COMPANY_CALENDAR_SESSIONS);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord[]>>(INITIAL_ATTENDANCE);

  const { showToast, bootcamps } = useBootcamps();
  const { updateTrainee } = useTrainees();

  // Helper to check trainer schedule overlap
  const checkTrainerConflict = (
    trainerId: string,
    sessionDate: string,
    startTime: string,
    endTime: string,
    excludeSessionId?: string
  ): boolean => {
    return sessions.some((s) => {
      if (excludeSessionId && s.id === excludeSessionId) return false;
      if (s.status === 'Cancelled' || s.eventType === 'Holiday') return false;
      if (s.trainerId === trainerId && s.sessionDate === sessionDate) {
        return startTime < s.endTime && endTime > s.startTime;
      }
      return false;
    });
  };

  // 1. Create Session
  const createSession = (sessionData: Partial<Session>): boolean => {
    const trainerId = sessionData.trainerId || '';
    const sessionDate = sessionData.sessionDate || '';
    const startTime = sessionData.startTime || '09:30';
    const endTime = sessionData.endTime || '12:30';

    if (trainerId && checkTrainerConflict(trainerId, sessionDate, startTime, endTime)) {
      showToast('Trainer already has another session scheduled during this time.');
      return false;
    }

    const selectedBootcamp = bootcamps.find((b) => b.id === sessionData.bootcampId) || bootcamps[0];
    const agendaText = sessionData.agenda || sessionData.title || 'Training Session';
    const eventType = sessionData.eventType || classifyEventType(agendaText);
    const attApplicable = eventType !== 'Holiday' && eventType !== 'Sign Off';

    const trainerObj = {
      id: sessionData.trainerId || 'tr-1',
      employeeId: 'EMP101',
      name: sessionData.trainerName || selectedBootcamp.primaryTrainerName,
      email: `${(sessionData.trainerName || selectedBootcamp.primaryTrainerName).toLowerCase().replace(/\s+/g, '.')}@systechusa.com`,
      role: 'Trainer' as const,
    };

    const newSession: Session = {
      id: 'cal-' + Date.now(),
      bootcampId: selectedBootcamp.id,
      bootcampName: selectedBootcamp.name,
      trainingDay: sessionData.trainingDay,
      sessionDate,
      dayOfWeek: sessionData.dayOfWeek,
      timeSlot: sessionData.timeSlot || 'FN',
      startTime,
      endTime,
      durationText: sessionData.durationText || '3 hrs',
      durationMinutes: 180,
      agenda: agendaText,
      title: sessionData.title || agendaText,
      moduleId: sessionData.moduleId || 'm-1',
      moduleName: sessionData.moduleName || 'Core Fundamentals',
      moduleOwner: sessionData.moduleOwner,
      trainerId: sessionData.trainerId || 'tr-1',
      trainerName: sessionData.trainerName || selectedBootcamp.primaryTrainerName,
      additionalTrainerId: sessionData.additionalTrainerId,
      additionalTrainerName: sessionData.additionalTrainerName,
      coordinatorName: sessionData.coordinatorName,
      evaluatorName: sessionData.evaluatorName,
      mode: sessionData.mode || 'Classroom',
      meetingPlatform: sessionData.meetingPlatform,
      meetingLink: sessionData.meetingLink,
      location: sessionData.location,
      notes: sessionData.notes,
      reminder: sessionData.reminder || '15 Minutes Before',
      status: 'Scheduled',
      eventType,
      attendanceApplicable: attApplicable,
      attendanceRecorded: false,
      attendedCount: 0,
      totalEnrolled: selectedBootcamp.traineesCount || 28,
      notificationStatus: 'Sent',
      notificationSentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setSessions((prev) => [newSession, ...prev]);
    showToast('Session scheduled & trainer email notification sent.');
    return true;
  };

  // 2. Update Session
  const updateSession = (id: string, sessionData: Partial<Session>): boolean => {
    const existing = sessions.find((s) => s.id === id);
    if (!existing) return false;

    const trainerId = sessionData.trainerId || existing.trainerId;
    const sessionDate = sessionData.sessionDate || existing.sessionDate;
    const startTime = sessionData.startTime || existing.startTime;
    const endTime = sessionData.endTime || existing.endTime;

    if (trainerId && checkTrainerConflict(trainerId, sessionDate, startTime, endTime, id)) {
      showToast('Trainer already has another session scheduled during this time.');
      return false;
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updatedAgenda = sessionData.agenda || s.agenda;
          const eventType = sessionData.eventType || classifyEventType(updatedAgenda);
          return {
            ...s,
            ...sessionData,
            eventType,
            attendanceApplicable: eventType !== 'Holiday' && eventType !== 'Sign Off',
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return s;
      })
    );

    showToast('Session updated successfully');
    return true;
  };

  // 3. Reschedule Session
  const rescheduleSession = (
    id: string,
    newDate: string,
    newStart: string,
    newEnd: string,
    reason?: string
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const originalScheduleStr = `${s.sessionDate} (${s.startTime} – ${s.endTime})`;
          return {
            ...s,
            sessionDate: newDate,
            startTime: newStart,
            endTime: newEnd,
            status: 'Rescheduled' as SessionStatus,
            originalSchedule: s.originalSchedule || originalScheduleStr,
            notes: reason ? `Rescheduled: ${reason}. Original: ${originalScheduleStr}` : s.notes,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return s;
      })
    );
    showToast('Session rescheduled successfully');
  };

  // 4. Cancel Session
  const cancelSession = (id: string, reason?: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'Cancelled' as SessionStatus,
              notes: reason ? `Cancelled: ${reason}` : s.notes,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : s
      )
    );
    showToast('Session cancelled');
  };

  // 5. Mark Completed
  const markCompleted = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Completed' as SessionStatus } : s))
    );
    showToast('Session marked as completed');
  };

  // 6. Record Attendance
  const recordAttendance = (
    sessionId: string,
    records: Array<{ traineeId: string; status: 'Present' | 'Absent' | 'Late'; remarks?: string }>
  ) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const newRecords: AttendanceRecord[] = records.map((r, idx) => ({
      id: `att-${sessionId}-${idx}`,
      sessionId,
      traineeId: r.traineeId,
      status: r.status,
      remarks: r.remarks,
      recordedAt: nowStr,
    }));

    setAttendanceMap((prev) => ({ ...prev, [sessionId]: newRecords }));

    const attendedCount = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              attendanceRecorded: true,
              attendedCount,
              status: s.status === 'Scheduled' ? 'Completed' : s.status,
              updatedAt: nowStr,
            }
          : s
      )
    );

    records.forEach((r) => {
      const stats = getTraineeAttendanceStats(r.traineeId);
      updateTrainee(r.traineeId, { attendancePercent: stats.attendancePercent });
    });

    showToast('Attendance recorded successfully');
  };

  // 7. Trainee Attendance Stats Calculation (Excludes Holidays & non-applicable sessions)
  const getTraineeAttendanceStats = (traineeId: string): TraineeAttendanceStats => {
    let totalConducted = 0;
    let attended = 0;
    let missed = 0;
    let late = 0;
    const history: TraineeAttendanceStats['records'] = [];

    // Filter conducted sessions (excluding Holidays and Cancelled sessions)
    const conductedSessions = sessions.filter(
      (s) =>
        s.status !== 'Cancelled' &&
        s.attendanceApplicable !== false &&
        (s.status === 'Completed' || s.attendanceRecorded)
    );

    conductedSessions.forEach((s) => {
      const sessionAtt = attendanceMap[s.id] || [];
      const record = sessionAtt.find((a) => a.traineeId === traineeId);

      totalConducted++;
      if (record) {
        if (record.status === 'Present') {
          attended++;
          history.push({ sessionId: s.id, sessionTitle: s.title, moduleName: s.moduleName, sessionDate: s.sessionDate, status: 'Present', remarks: record.remarks });
        } else if (record.status === 'Late') {
          attended++;
          late++;
          history.push({ sessionId: s.id, sessionTitle: s.title, moduleName: s.moduleName, sessionDate: s.sessionDate, status: 'Late', remarks: record.remarks });
        } else {
          missed++;
          history.push({ sessionId: s.id, sessionTitle: s.title, moduleName: s.moduleName, sessionDate: s.sessionDate, status: 'Absent', remarks: record.remarks });
        }
      } else {
        attended++;
        history.push({ sessionId: s.id, sessionTitle: s.title, moduleName: s.moduleName, sessionDate: s.sessionDate, status: 'Present' });
      }
    });

    const attendancePercent = totalConducted > 0 ? Math.round((attended / totalConducted) * 100) : 100;

    return {
      totalConducted: totalConducted || 1,
      attended: attended || 1,
      missed,
      late,
      attendancePercent,
      records: history,
    };
  };

  // 8. Import Company Calendar Data from Excel/CSV Raw Rows
  const importCalendarData = (rawRows: Record<string, unknown>[]): CalendarImportStats => {
    let trainingSessions = 0;
    let assessments = 0;
    let workshops = 0;
    let projects = 0;
    let certificationEvents = 0;
    let holidays = 0;
    let skippedRows = 0;

    const newSessions: Session[] = [];

    rawRows.forEach((row, idx) => {
      // Find key matching source column names case-insensitively
      const getVal = (possibleKeys: string[]): string => {
        for (const k of Object.keys(row)) {
          const cleanK = k.trim().toLowerCase();
          if (possibleKeys.some((p) => cleanK === p.toLowerCase())) {
            return String(row[k] || '').trim();
          }
        }
        return '';
      };

      const dayStr = getVal(['day']);
      const dateStr = getVal(['date']);
      const weekOfDayStr = getVal(['week of day', 'day of week', 'weekday']);
      const timeStr = getVal(['time', 'slot', 'time slot']);
      const durationStr = getVal(['duration']);
      const agendaStr = getVal(['agenda', 'topic', 'title']);
      const moduleNameStr = getVal(['module name', 'module']);
      const moduleOwnerStr = getVal(['owner of the module', 'module owner', 'owner']);
      const trainerStr = getVal(['trainer']);
      const coordinatorStr = getVal(['coordinator']);
      const evaluatorStr = getVal(['evalauator', 'evaluator']);

      // Skip completely empty rows or rows without Agenda/Date
      if (!agendaStr && !dateStr) {
        skippedRows++;
        return;
      }

      const eventType = classifyEventType(agendaStr);

      switch (eventType) {
        case 'Training':
        case 'Practice':
        case 'HR Event':
        case 'Feedback':
        case 'Evaluation':
        case 'Sign Off':
        case 'Other':
          trainingSessions++;
          break;
        case 'Assessment':
        case 'Mock Test':
          assessments++;
          break;
        case 'Workshop':
          workshops++;
          break;
        case 'Project':
          projects++;
          break;
        case 'Certification':
          certificationEvents++;
          break;
        case 'Holiday':
          holidays++;
          break;
      }

      const parsedDay = parseInt(dayStr) || undefined;
      const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr || new Date().toISOString().split('T')[0];

      newSessions.push({
        id: `imported-${Date.now()}-${idx}`,
        bootcampId: 'bc-1',
        bootcampName: 'SQL Data Architecture',
        trainingDay: parsedDay,
        sessionDate: cleanDate,
        dayOfWeek: weekOfDayStr || 'Monday',
        timeSlot: timeStr || 'FN',
        startTime: '09:30',
        endTime: '12:30',
        durationText: durationStr || '3 hrs',
        durationMinutes: 180,
        agenda: agendaStr || 'Scheduled Training',
        title: agendaStr || 'Scheduled Training',
        moduleId: `mod-imp-${idx}`,
        moduleName: moduleNameStr || 'Core Module',
        moduleOwner: moduleOwnerStr,
        trainerId: `tr-imp-${idx}`,
        trainerName: trainerStr || 'Assigned Trainer',
        coordinatorName: coordinatorStr,
        evaluatorName: evaluatorStr,
        mode: 'Classroom',
        status: 'Scheduled',
        eventType,
        attendanceApplicable: eventType !== 'Holiday' && eventType !== 'Sign Off',
        originalCalendarRow: row,
        attendanceRecorded: false,
        attendedCount: 0,
        totalEnrolled: 28,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      });
    });

    if (newSessions.length > 0) {
      setSessions((prev) => [...newSessions, ...prev]);
      showToast('Training Calendar Imported Successfully');
    }

    return {
      totalRows: rawRows.length,
      trainingSessions,
      assessments,
      workshops,
      projects,
      certificationEvents,
      holidays,
      skippedRows,
    };
  };

  return (
    <SessionContext.Provider
      value={{
        sessions,
        attendanceMap,
        createSession,
        updateSession,
        rescheduleSession,
        cancelSession,
        markCompleted,
        recordAttendance,
        getTraineeAttendanceStats,
        importCalendarData,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessions must be used within a SessionProvider');
  }
  return context;
};
