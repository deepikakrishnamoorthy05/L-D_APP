import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Layers, ArrowRight, Calendar, Info, User, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { Trainee } from '../../types/trainee';
import { useTrainees } from '../../context/TraineeContext';
import { useBootcamps } from '../../context/BootcampContext';

interface ChangeBootcampModalProps {
  trainee: Trainee;
  onClose: () => void;
}

export const ChangeBootcampModal: React.FC<ChangeBootcampModalProps> = ({ trainee, onClose }) => {
  const { changeBootcamp } = useTrainees();
  const { bootcamps } = useBootcamps();

  // Mode detection: If trainee has no bootcamp assigned or is 'Unassigned', treat as "Assign Bootcamp"
  const isAssignMode =
    !trainee.bootcampName ||
    trainee.bootcampName === 'Unassigned' ||
    trainee.bootcampId === 'unassigned' ||
    !trainee.bootcampId;

  // Selected Bootcamp State (default to first available non-current bootcamp or first bootcamp)
  const [selectedBootcampId, setSelectedBootcampId] = useState(
    bootcamps.find((b) => b.id !== trainee.bootcampId)?.id || bootcamps[0]?.id || ''
  );

  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // Lookup Current & Selected Bootcamp Data
  const currentBc = bootcamps.find((b) => b.id === trainee.bootcampId || b.name === trainee.bootcampName);
  const newBc = bootcamps.find((b) => b.id === selectedBootcampId);

  // Helper for Initials
  const getInitials = (name: string) => {
    if (!name) return 'TR';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper for Date Display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBc) {
      changeBootcamp(trainee.id, newBc.id, newBc.name, newBc.primaryTrainerName, effectiveDate);
    }
    onClose();
  };

  const isSubmitDisabled = !newBc || (!isAssignMode && newBc.id === trainee.bootcampId);

  return (
    <div className="cbm-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.985, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.985, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="cbm-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <header className="cbm-header">
          <div className="cbm-header-left">
            <div className="cbm-header-icon-box">
              {isAssignMode ? <Layers size={22} /> : <ArrowRightLeft size={22} />}
            </div>
            <div className="cbm-header-titles">
              <h2 className="cbm-title">
                {isAssignMode ? 'Assign Bootcamp' : 'Change Trainee Bootcamp'}
              </h2>
              <p className="cbm-subtitle">
                {isAssignMode
                  ? 'Assign the trainee to their initial learning cohort.'
                  : 'Move the trainee to another learning cohort while preserving their learning history.'}
              </p>
            </div>
          </div>
          <button type="button" className="cbm-close-btn" onClick={onClose} aria-label="Close Modal">
            <X size={18} />
          </button>
        </header>

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit}>
          <div className="cbm-body">
            {/* 1. TRAINEE PROFILE SUMMARY CARD */}
            <div className="cbm-trainee-card">
              <div className="cbm-trainee-profile-left">
                <div className="cbm-trainee-avatar">{getInitials(trainee.name)}</div>
                <div className="cbm-trainee-info">
                  <div className="cbm-trainee-name">{trainee.name}</div>
                  <div className="cbm-trainee-meta">
                    <span className="cbm-emp-badge">{trainee.employeeId}</span>
                    <span>•</span>
                    <span>{trainee.primaryTech || trainee.department || 'Talent Engineering'}</span>
                  </div>
                </div>
              </div>

              {!isAssignMode && (
                <div className="cbm-current-assignment-right">
                  <span className="cbm-assignment-lbl">Current Assignment</span>
                  <span className="cbm-assignment-val">{trainee.bootcampName}</span>
                  {currentBc?.code && <span className="cbm-code-chip">{currentBc.code}</span>}
                </div>
              )}
            </div>

            {/* 2. TRANSFER VISUAL (BEFORE -> AFTER COMPARISON) */}
            {!isAssignMode && (
              <div className="cbm-transfer-visual">
                <div className="cbm-cohort-box current">
                  <span className="cbm-cohort-tag">CURRENT COHORT</span>
                  <span className="cbm-cohort-title">{trainee.bootcampName}</span>
                  {currentBc?.code && <span className="cbm-code-chip">{currentBc.code}</span>}
                </div>

                <div className="cbm-arrow-divider">
                  <ArrowRight size={16} />
                </div>

                <div className="cbm-cohort-box new">
                  <span className="cbm-cohort-tag">NEW ASSIGNMENT</span>
                  <span className="cbm-cohort-title">{newBc ? newBc.name : 'Select new cohort...'}</span>
                  {newBc?.code && <span className="cbm-code-chip">{newBc.code}</span>}
                </div>
              </div>
            )}

            {/* 3. NEW BOOTCAMP FIELD */}
            <div className="cbm-field">
              <label className="cbm-label">New Bootcamp Cohort *</label>
              <span className="cbm-field-subtext">Select the destination cohort for this trainee.</span>
              <select
                className="cbm-select"
                value={selectedBootcampId}
                onChange={(e) => setSelectedBootcampId(e.target.value)}
                required
              >
                {bootcamps.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code}) — Lead: {b.primaryTrainerName}
                  </option>
                ))}
              </select>

              {/* TRAINER & COHORT METADATA */}
              {newBc && (
                <div className="cbm-trainer-meta">
                  <User size={14} className="text-teal-600" />
                  <span>
                    Lead Trainer: <strong>{newBc.primaryTrainerName}</strong>
                  </span>
                  {newBc.code && (
                    <>
                      <span>•</span>
                      <span>Code: {newBc.code}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 4. EFFECTIVE DATE FIELD */}
            <div className="cbm-field">
              <label className="cbm-label">Effective Date *</label>
              <div className="cbm-date-input-wrapper">
                <Calendar size={18} className="cbm-date-icon" />
                <input
                  type="date"
                  className="cbm-date-input"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 5. REASON FOR TRANSFER FIELD */}
            <div className="cbm-field">
              <div className="cbm-field-label-row">
                <label className="cbm-label">Reason for Transfer</label>
                <span className="cbm-optional-badge">Optional</span>
              </div>
              <textarea
                className="cbm-textarea"
                placeholder="e.g. Skill alignment, cohort reassignment or schedule change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* 6. INFORMATION NOTE */}
            <div className="cbm-info-panel">
              <Info size={16} className="info-icon" />
              <span>
                Learning history, assessments and feedback will remain associated with the trainee after the cohort change.
              </span>
            </div>

            {/* 7. CONFIRMATION PREVIEW */}
            {newBc && !isSubmitDisabled && (
              <div className="cbm-confirm-preview">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-teal-500" />
                  <span>
                    {isAssignMode ? (
                      <>Assigning to <strong>{newBc.name}</strong></>
                    ) : (
                      <>Changing from <strong>{trainee.bootcampName}</strong> to <strong>{newBc.name}</strong></>
                    )}
                  </span>
                </div>
                <span>Effective: <strong>{formatDisplayDate(effectiveDate)}</strong></span>
              </div>
            )}
          </div>

          {/* MODAL FOOTER */}
          <footer className="cbm-footer">
            <button type="button" className="cbm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cbm-btn-confirm" disabled={isSubmitDisabled}>
              {isAssignMode ? 'Assign Bootcamp' : 'Confirm Change'}
            </button>
          </footer>
        </form>
      </motion.div>
    </div>
  );
};
