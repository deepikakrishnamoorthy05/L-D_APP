import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Session } from '../../types/session';
import { useSessions } from '../../context/SessionContext';

interface RescheduleSessionModalProps {
  session: Session;
  onClose: () => void;
  onSuccess?: (updatedSession: Session) => void;
}

export const RescheduleSessionModal: React.FC<RescheduleSessionModalProps> = ({ session, onClose, onSuccess }) => {
  const { rescheduleSession } = useSessions();

  const [newDate, setNewDate] = useState(session.sessionDate);
  const [newStart, setNewStart] = useState(session.startTime);
  const [newEnd, setNewEnd] = useState(session.endTime);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newEnd <= newStart) {
      setError('End Time must be later than Start Time.');
      return;
    }

    rescheduleSession(session.id, newDate, newStart, newEnd, reason);

    const updated: Session = {
      ...session,
      sessionDate: newDate,
      startTime: newStart,
      endTime: newEnd,
      status: 'Rescheduled',
    };

    if (onSuccess) {
      onSuccess(updated);
    } else {
      onClose();
    }
  };

  return (
    <div className="bootcamp-modal-backdrop" onClick={onClose}>
      <div className="bootcamp-modal-card bootcamp-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Clock size={18} className="header-icon" />
            <h3>Reschedule Session</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {error && <div className="modal-error-alert">{error}</div>}

            <div className="confirm-info-box">
              <span className="info-label">Current Schedule:</span>
              <span className="info-val-bold">
                {session.sessionDate} ({session.startTime} – {session.endTime})
              </span>
            </div>

            <div className="form-group">
              <label className="input-label">New Date*</label>
              <input
                type="date"
                className="bootcamp-form-input"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>

            <div className="form-row two-cols">
              <div className="form-group">
                <label className="input-label">New Start Time*</label>
                <input
                  type="time"
                  className="bootcamp-form-input"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">New End Time*</label>
                <input
                  type="time"
                  className="bootcamp-form-input"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Reason for Rescheduling (Optional)</label>
              <textarea
                className="bootcamp-form-textarea"
                rows={2}
                placeholder="e.g. Trainer availability, technical setup..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="bootcamp-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bootcamp-btn-primary">
              Reschedule Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
