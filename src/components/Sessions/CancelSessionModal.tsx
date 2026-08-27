import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Session } from '../../types/session';
import { useSessions } from '../../context/SessionContext';

interface CancelSessionModalProps {
  session: Session;
  onClose: () => void;
  onSuccess?: (cancelledSession: Session) => void;
}

export const CancelSessionModal: React.FC<CancelSessionModalProps> = ({ session, onClose, onSuccess }) => {
  const { cancelSession } = useSessions();
  const [reason, setReason] = useState('');

  const handleConfirmCancel = () => {
    cancelSession(session.id, reason);
    const updated: Session = {
      ...session,
      status: 'Cancelled',
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
        <div className="modal-header header-warning">
          <div className="modal-title-row">
            <AlertTriangle size={18} className="icon-warning" />
            <h3>Cancel Session?</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p className="confirm-message">
            Are you sure you want to cancel <strong>"{session.title}"</strong>? The session record will not be deleted and session history will be preserved.
          </p>

          <div className="form-group mt-3">
            <label className="input-label">Reason for Cancellation (Optional)</label>
            <input
              type="text"
              className="bootcamp-form-input"
              placeholder="e.g. Weather emergency, schedule conflict..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="bootcamp-btn-secondary" onClick={onClose}>
            Keep Session
          </button>
          <button
            type="button"
            className="bootcamp-btn-danger"
            onClick={handleConfirmCancel}
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};
