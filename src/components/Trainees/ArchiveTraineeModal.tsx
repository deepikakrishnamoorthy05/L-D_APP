import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Trainee } from '../../types/trainee';
import { useTrainees } from '../../context/TraineeContext';

interface ArchiveTraineeModalProps {
  trainee: Trainee;
  onClose: () => void;
}

export const ArchiveTraineeModal: React.FC<ArchiveTraineeModalProps> = ({ trainee, onClose }) => {
  const { archiveTrainee } = useTrainees();

  return (
    <div className="bootcamp-modal-backdrop" onClick={onClose}>
      <div className="bootcamp-modal-card bootcamp-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header header-warning">
          <div className="modal-title-row">
            <AlertTriangle size={18} className="icon-warning" />
            <h3>Archive Trainee?</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p className="confirm-message">
            The employee's learning history and records for <strong>{trainee.name} ({trainee.employeeId})</strong> will remain available, but the trainee will no longer appear in active trainee lists.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="bootcamp-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="bootcamp-btn-danger"
            onClick={() => {
              archiveTrainee(trainee.id);
              onClose();
            }}
          >
            Archive Trainee
          </button>
        </div>
      </div>
    </div>
  );
};
