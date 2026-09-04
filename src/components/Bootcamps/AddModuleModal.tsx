import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  Layers,
  Clock,
  Hash,
  AlignLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  Tag,
} from 'lucide-react';
import { BootcampModule, ModuleStatus } from '../../types/bootcamp';

interface AddModuleModalProps {
  initialData?: Partial<BootcampModule>;
  existingCount: number;
  onSave: (moduleData: Partial<BootcampModule>) => void;
  onClose: () => void;
}

export const AddModuleModal: React.FC<AddModuleModalProps> = ({
  initialData,
  existingCount,
  onSave,
  onClose,
}) => {
  const isEdit = Boolean(initialData?.id);
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [sequence, setSequence] = useState<number>(initialData?.sequence || existingCount + 1);
  const [plannedDuration, setPlannedDuration] = useState(initialData?.plannedDuration || '1 Week');
  const [status, setStatus] = useState<ModuleStatus>(initialData?.status || 'Not Started');
  const [stage, setStage] = useState<string>(initialData?.stage || 'Common Foundation');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Module Name is required.');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      sequence,
      plannedDuration: plannedDuration.trim(),
      status,
      stage: stage as any,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="module-modal-backdrop" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="module-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* MODAL HEADER */}
          <div className="module-modal-header">
            <div className="module-header-title-group">
              <div className="module-header-icon-badge">
                <BookOpen size={20} className="icon-svg" />
              </div>
              <div>
                <h3 className="module-modal-title">
                  {isEdit ? 'Edit Learning Module' : 'Add Learning Module'}
                </h3>
                <p className="module-modal-subtitle">
                  Configure curriculum module details, sequence order, duration, and status.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="module-modal-close-btn"
              onClick={onClose}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="module-modal-form">
            <div className="module-modal-body">
              {error && (
                <div className="module-error-banner">
                  <AlertCircle size={16} className="error-icon" />
                  <span>{error}</span>
                </div>
              )}

              {/* MODULE NAME */}
              <div className="module-form-group">
                <label className="module-field-label">
                  <Layers size={14} className="label-icon" />
                  <span>Module Name</span>
                  <span className="required-star">*</span>
                </label>
                <div className="module-input-wrapper">
                  <input
                    type="text"
                    className="module-styled-input"
                    placeholder="e.g. PySpark & Distributed Compute"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    required
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="module-form-group">
                <label className="module-field-label">
                  <AlignLeft size={14} className="label-icon" />
                  <span>Module Description</span>
                </label>
                <div className="module-input-wrapper">
                  <textarea
                    className="module-styled-textarea"
                    rows={3}
                    placeholder="Describe module objectives, core topics, and target outcomes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* 2-COLUMN ROW: SEQUENCE ORDER & PLANNED DURATION */}
              <div className="module-form-grid-2">
                <div className="module-form-group">
                  <label className="module-field-label">
                    <Hash size={14} className="label-icon" />
                    <span>Sequence Order</span>
                  </label>
                  <div className="module-input-wrapper">
                    <input
                      type="number"
                      min={1}
                      className="module-styled-input"
                      value={sequence}
                      onChange={(e) => setSequence(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="module-form-group">
                  <label className="module-field-label">
                    <Clock size={14} className="label-icon" />
                    <span>Planned Duration</span>
                  </label>
                  <div className="module-input-wrapper">
                    <input
                      type="text"
                      className="module-styled-input"
                      placeholder="e.g. 2 Weeks"
                      value={plannedDuration}
                      onChange={(e) => setPlannedDuration(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 2-COLUMN ROW: CURRICULUM STAGE & STATUS */}
              <div className="module-form-grid-2">
                <div className="module-form-group">
                  <label className="module-field-label">
                    <Tag size={14} className="label-icon" />
                    <span>Curriculum Stage</span>
                  </label>
                  <div className="module-input-wrapper">
                    <select
                      className="module-styled-select"
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                    >
                      <option value="Common Foundation">Common Foundation</option>
                      <option value="DBT & Snowflake">DBT & Snowflake</option>
                      <option value="Databricks">Databricks</option>
                      <option value="Shared">Shared Track</option>
                    </select>
                  </div>
                </div>

                <div className="module-form-group">
                  <label className="module-field-label">
                    <CheckCircle2 size={14} className="label-icon" />
                    <span>Status</span>
                  </label>
                  <div className="module-input-wrapper">
                    <select
                      className="module-styled-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ModuleStatus)}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="module-modal-footer">
              <button
                type="button"
                className="module-footer-btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="module-footer-btn-primary">
                {isEdit ? <Save size={16} /> : <Plus size={16} />}
                <span>{isEdit ? 'Save Changes' : 'Add Module'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
