import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  UserCheck,
  CheckCircle2,
  Circle,
  Users,
  Check,
} from 'lucide-react';
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
  const [filterRole, setFilterRole] = useState<'All' | 'Selected' | 'Unselected'>('All');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const filteredTrainees = allTrainees.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.department && t.department.toLowerCase().includes(search.toLowerCase())) ||
      (t.primaryDomain && t.primaryDomain.toLowerCase().includes(search.toLowerCase()));

    const isSelected = selectedIds.includes(t.id);
    const matchesFilter =
      filterRole === 'All' ||
      (filterRole === 'Selected' && isSelected) ||
      (filterRole === 'Unselected' && !isSelected);

    return matchesSearch && matchesFilter;
  });

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
    <AnimatePresence>
      <div className="trainee-modal-backdrop" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="trainee-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* MODAL HEADER */}
          <div className="trainee-modal-header">
            <div className="trainee-header-title-group">
              <div className="trainee-header-icon-badge">
                <UserCheck size={20} className="icon-svg" />
              </div>
              <div>
                <h3 className="trainee-modal-title">Manage Cohort Trainees</h3>
                <p className="trainee-modal-subtitle">
                  Select and assign trainees from the enterprise directory to this bootcamp cohort.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="trainee-modal-close-btn"
              onClick={onClose}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* CONTROL TOOLBAR: SEARCH & BULK ACTIONS */}
          <div className="trainee-modal-toolbar">
            <div className="trainee-modal-search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by trainee name, EMP ID, email or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="trainee-modal-search-input"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="trainee-modal-actions-row">
              <div className="bulk-pill-buttons">
                <button
                  type="button"
                  className="bulk-action-pill"
                  onClick={handleSelectAll}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="bulk-action-pill danger"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>

              <div className="selection-counter-badge">
                <Users size={14} />
                <span>
                  <strong>{selectedIds.length}</strong> / {allTrainees.length} Selected
                </span>
              </div>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="trainee-modal-filter-tabs">
            <button
              type="button"
              className={`filter-tab-btn ${filterRole === 'All' ? 'active' : ''}`}
              onClick={() => setFilterRole('All')}
            >
              All Trainees ({allTrainees.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filterRole === 'Selected' ? 'active' : ''}`}
              onClick={() => setFilterRole('Selected')}
            >
              Selected ({selectedIds.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filterRole === 'Unselected' ? 'active' : ''}`}
              onClick={() => setFilterRole('Unselected')}
            >
              Available ({allTrainees.length - selectedIds.length})
            </button>
          </div>

          {/* SCROLLABLE TRAINEE CARD LIST */}
          <div className="trainee-modal-body-scroll">
            {filteredTrainees.length === 0 ? (
              <div className="trainee-empty-state">
                <Users size={32} className="empty-icon" />
                <h4>No Trainees Found</h4>
                <p>No trainee records matched your search filters.</p>
              </div>
            ) : (
              <div className="trainee-cards-grid">
                {filteredTrainees.map((trainee) => {
                  const isSelected = selectedIds.includes(trainee.id);
                  const initials = getInitials(trainee.name);

                  return (
                    <div
                      key={trainee.id}
                      className={`trainee-selection-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleToggle(trainee.id)}
                    >
                      {/* CHECKBOX INDICATOR */}
                      <div className="trainee-check-indicator">
                        {isSelected ? (
                          <CheckCircle2 size={20} className="check-icon checked" />
                        ) : (
                          <Circle size={20} className="check-icon unchecked" />
                        )}
                      </div>

                      {/* AVATAR INITIALS */}
                      <div className="trainee-avatar-badge">
                        <span>{initials}</span>
                      </div>

                      {/* TRAINEE INFO */}
                      <div className="trainee-info-content">
                        <div className="trainee-name-line">
                          <span className="trainee-full-name">{trainee.name}</span>
                          <span className="trainee-emp-code">{trainee.employeeId}</span>
                        </div>
                        <div className="trainee-email-text">{trainee.email}</div>
                        {(trainee.department || trainee.primaryDomain) && (
                          <div className="trainee-tags-row">
                            {trainee.department && (
                              <span className="trainee-dept-tag">{trainee.department}</span>
                            )}
                            {trainee.primaryDomain && (
                              <span className="trainee-domain-tag">{trainee.primaryDomain}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* RIGHT STATUS TAG */}
                      <div className="trainee-card-right">
                        <span className={`trainee-status-pill ${isSelected ? 'selected-pill' : ''}`}>
                          {isSelected ? 'Selected' : 'Add'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MODAL FOOTER */}
          <div className="trainee-modal-footer">
            <div className="footer-left-info">
              Showing {filteredTrainees.length} of {allTrainees.length} trainees
            </div>
            <div className="footer-action-buttons">
              <button
                type="button"
                className="trainee-footer-btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="trainee-footer-btn-primary"
                onClick={() => {
                  onConfirm(selectedIds);
                  onClose();
                }}
              >
                <Check size={16} />
                <span>Apply Selection ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
