import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Users, Save, RotateCcw } from 'lucide-react';
import { useSessions } from '../../context/SessionContext';
import { useTrainees } from '../../context/TraineeContext';
import { AttendanceStatus } from '../../types/session';

interface AttendanceManagementProps {
  sessionId: string;
  onBack: () => void;
}

interface TraineeAttRow {
  traineeId: string;
  employeeId: string;
  name: string;
  email: string;
  status: AttendanceStatus;
  remarks: string;
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ sessionId, onBack }) => {
  const { sessions, attendanceMap, recordAttendance } = useSessions();
  const { trainees } = useTrainees();

  const session = sessions.find((s) => s.id === sessionId) || sessions[0];
  const existingRecords = attendanceMap[session.id] || [];

  // Filter trainees assigned to this session's bootcamp
  const bootcampTrainees = trainees.filter(
    (t) => t.bootcampId === session.bootcampId || t.bootcampName === session.bootcampName
  );
  const targetTrainees = bootcampTrainees.length > 0 ? bootcampTrainees : trainees;

  // Initialize attendance rows state
  const [rows, setRows] = useState<TraineeAttRow[]>(() => {
    return targetTrainees.map((t) => {
      const existing = existingRecords.find((r) => r.traineeId === t.id);
      return {
        traineeId: t.id,
        employeeId: t.employeeId,
        name: t.name,
        email: t.email,
        status: existing?.status || 'Present',
        remarks: existing?.remarks || '',
      };
    });
  });

  // Calculate Metrics dynamically
  const enrolledCount = rows.length;
  const presentCount = rows.filter((r) => r.status === 'Present').length;
  const absentCount = rows.filter((r) => r.status === 'Absent').length;
  const lateCount = rows.filter((r) => r.status === 'Late').length;
  const attPercent = enrolledCount > 0 ? Math.round(((presentCount + lateCount) / enrolledCount) * 100) : 100;

  const handleStatusChange = (traineeId: string, newStatus: AttendanceStatus) => {
    setRows((prev) =>
      prev.map((r) => (r.traineeId === traineeId ? { ...r, status: newStatus } : r))
    );
  };

  const handleRemarksChange = (traineeId: string, remarks: string) => {
    setRows((prev) =>
      prev.map((r) => (r.traineeId === traineeId ? { ...r, remarks } : r))
    );
  };

  const handleMarkAllPresent = () => {
    setRows((prev) => prev.map((r) => ({ ...r, status: 'Present' as AttendanceStatus })));
  };

  const handleClearAttendance = () => {
    setRows((prev) => prev.map((r) => ({ ...r, status: 'Absent' as AttendanceStatus, remarks: '' })));
  };

  const handleSave = () => {
    const payload = rows.map((r) => ({
      traineeId: r.traineeId,
      status: r.status,
      remarks: r.remarks,
    }));
    recordAttendance(session.id, payload);
    onBack();
  };

  return (
    <div className="bootcamp-management-container">
      {/* Top Header */}
      <header className="details-header-card">
        <div className="details-header-top">
          <button type="button" className="btn-back" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Sessions
          </button>

          <div className="details-actions">
            <button type="button" className="bootcamp-btn-secondary" onClick={handleMarkAllPresent}>
              <CheckCircle2 size={14} /> Mark All Present
            </button>

            <button type="button" className="bootcamp-btn-secondary" onClick={handleClearAttendance}>
              <RotateCcw size={14} /> Clear Attendance
            </button>

            <button type="button" className="bootcamp-btn-primary" onClick={handleSave}>
              <Save size={16} /> Save Attendance
            </button>
          </div>
        </div>

        <div className="details-title-row">
          <h1 className="details-title">Record Session Attendance</h1>
          <p className="details-description">
            Session: <strong>{session.title}</strong> • Bootcamp: <strong>{session.bootcampName}</strong> • Module: <strong>{session.moduleName}</strong> • Trainer: <strong>{session.trainerName}</strong> • Date: <strong>{session.sessionDate}</strong>
          </p>
        </div>
      </header>

      {/* Summary Cards Row */}
      <section className="bootcamp-summary-cards-row" aria-label="Attendance Stats">
        <div className="bootcamp-summary-card">
          <div className="bootcamp-card-top">
            <span className="bootcamp-card-label">Enrolled</span>
            <Users size={18} className="bootcamp-card-icon-box" />
          </div>
          <div className="bootcamp-card-value">{enrolledCount}</div>
          <span className="bootcamp-card-subtext">Total cohort trainees</span>
        </div>

        <div className="bootcamp-summary-card">
          <div className="bootcamp-card-top">
            <span className="bootcamp-card-label">Present</span>
            <CheckCircle2 size={18} className="bootcamp-card-icon-box success" />
          </div>
          <div className="bootcamp-card-value">{presentCount}</div>
          <span className="bootcamp-card-subtext">On-time attendees</span>
        </div>

        <div className="bootcamp-summary-card">
          <div className="bootcamp-card-top">
            <span className="bootcamp-card-label">Absent</span>
            <AlertTriangle size={18} className="bootcamp-card-icon-box warning" />
          </div>
          <div className="bootcamp-card-value">{absentCount}</div>
          <span className="bootcamp-card-subtext">Missed session</span>
        </div>

        <div className="bootcamp-summary-card">
          <div className="bootcamp-card-top">
            <span className="bootcamp-card-label">Attendance %</span>
            <CheckCircle2 size={18} className="bootcamp-card-icon-box" />
          </div>
          <div className="bootcamp-card-value">{attPercent}%</div>
          <span className="bootcamp-card-subtext">Session rate</span>
        </div>
      </section>

      {/* Trainees Attendance Table */}
      <section className="bootcamp-table-wrapper">
        <div className="table-responsive-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Trainee Name</th>
                <th>Email</th>
                <th>Attendance Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.traineeId} className="table-row-hover">
                  <td>
                    <span className="code-chip">{row.employeeId}</span>
                  </td>
                  <td className="font-weight-bold">{row.name}</td>
                  <td className="text-secondary-cell">{row.email}</td>

                  {/* Quick Attendance Toggle Buttons */}
                  <td>
                    <div className="attendance-status-toggle-group">
                      <button
                        type="button"
                        className={`att-toggle-btn ${row.status === 'Present' ? 'active-present' : ''}`}
                        onClick={() => handleStatusChange(row.traineeId, 'Present')}
                      >
                        Present
                      </button>

                      <button
                        type="button"
                        className={`att-toggle-btn ${row.status === 'Late' ? 'active-late' : ''}`}
                        onClick={() => handleStatusChange(row.traineeId, 'Late')}
                      >
                        Late
                      </button>

                      <button
                        type="button"
                        className={`att-toggle-btn ${row.status === 'Absent' ? 'active-absent' : ''}`}
                        onClick={() => handleStatusChange(row.traineeId, 'Absent')}
                      >
                        Absent
                      </button>
                    </div>
                  </td>

                  <td>
                    <input
                      type="text"
                      className="bootcamp-form-input inline-input"
                      placeholder="Optional remarks (e.g. excused leave)..."
                      value={row.remarks}
                      onChange={(e) => handleRemarksChange(row.traineeId, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer-actions mt-3 text-right">
          <button type="button" className="bootcamp-btn-primary" onClick={handleSave}>
            <Save size={16} /> Save &amp; Update Attendance Records
          </button>
        </div>
      </section>
    </div>
  );
};
