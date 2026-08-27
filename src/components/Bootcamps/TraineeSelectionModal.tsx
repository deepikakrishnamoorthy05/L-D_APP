import React, { useState } from 'react';
import { Search, X, CheckSquare, Square, UserCheck } from 'lucide-react';
import { User } from '../../types/bootcamp';

interface TraineeSelectionModalProps {
  allTrainees: User[];
  selectedTraineeIds: string[];
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
}

export const TraineeSelectionModal: React.FC<TraineeSelectionModalProps> = ({
  allTrainees,
  selectedTraineeIds,
  onConfirm,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedTraineeIds);

  const filteredTrainees = allTrainees.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredTrainees.map((t) => t.id);
    setSelectedIds(Array.from(new Set([...selectedIds, ...allFilteredIds])));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  return (
    <div className="bootcamp-modal-backdrop" onClick={onClose}>
      <div className="bootcamp-modal-card bootcamp-modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <UserCheck size={18} className="header-icon" />
            <h3>Manage &amp; Select Trainees</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="selection-toolbar">
            <div className="bootcamp-search-box">
              <Search size={16} className="bootcamp-search-icon" />
              <input
                type="text"
                placeholder="Search trainee name, ID or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bootcamp-search-input"
              />
            </div>

            <div className="bulk-actions-row">
              <button type="button" className="text-action-btn" onClick={handleSelectAll}>
                Select All
              </button>
              <span className="dot-sep">•</span>
              <button type="button" className="text-action-btn" onClick={handleClearAll}>
                Clear All
              </button>
              <span className="selection-count-tag">{selectedIds.length} Selected</span>
            </div>
          </div>

          <div className="trainee-checklist-container">
            {filteredTrainees.length === 0 ? (
              <div className="empty-state-small">No trainees matching search criteria.</div>
            ) : (
              filteredTrainees.map((trainee) => {
                const isSelected = selectedIds.includes(trainee.id);
                return (
                  <div
                    key={trainee.id}
                    className={`trainee-check-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggle(trainee.id)}
                  >
                    <div className="check-box-icon">
                      {isSelected ? <CheckSquare size={18} className="checked" /> : <Square size={18} />}
                    </div>

                    <div className="trainee-details">
                      <div className="trainee-name-row">
                        <span className="trainee-name">{trainee.name}</span>
                        <span className="emp-id-chip">{trainee.employeeId}</span>
                      </div>
                      <span className="trainee-email">{trainee.email}</span>
                    </div>

                    <span className="role-tag">{trainee.role}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="bootcamp-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="bootcamp-btn-primary"
            onClick={() => {
              onConfirm(selectedIds);
              onClose();
            }}
          >
            Add Selected Trainees ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};
