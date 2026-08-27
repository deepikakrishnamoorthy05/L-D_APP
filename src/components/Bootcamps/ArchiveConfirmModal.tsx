import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ArchiveConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ArchiveConfirmModal: React.FC<ArchiveConfirmModalProps> = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="bootcamp-modal-backdrop" onClick={onClose}>
      <div className="bootcamp-modal-card bootcamp-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header header-warning">
          <div className="modal-title-row">
            <AlertTriangle size={18} className="icon-warning" />
            <h3>{title}</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p className="confirm-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button type="button" className="bootcamp-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="bootcamp-btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
