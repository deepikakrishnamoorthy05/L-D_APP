import React, { useState } from 'react';
import { X, BookOpen } from 'lucide-react';
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
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [sequence, setSequence] = useState<number>(initialData?.sequence || existingCount + 1);
  const [plannedDuration, setPlannedDuration] = useState(initialData?.plannedDuration || '1 Week');
  const [status, setStatus] = useState<ModuleStatus>(initialData?.status || 'Not Started');
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
    });
    onClose();
  };

  return (
    <div className="bootcamp-modal-backdrop" onClick={onClose}>
      <div className="bootcamp-modal-card bootcamp-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <BookOpen size={18} className="header-icon" />
            <h3>{initialData?.id ? 'Edit Module' : 'Add Learning Module'}</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {error && <div className="modal-error-alert">{error}</div>}

            <div className="form-group">
              <label className="input-label">Module Name*</label>
              <input
                type="text"
                className="bootcamp-form-input"
                placeholder="e.g. PySpark & Distributed Compute"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Description</label>
              <textarea
                className="bootcamp-form-textarea"
                rows={3}
                placeholder="Module objectives and core skills covered..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-row two-cols">
              <div className="form-group">
                <label className="input-label">Sequence Order</label>
                <input
                  type="number"
                  min={1}
                  className="bootcamp-form-input"
                  value={sequence}
                  onChange={(e) => setSequence(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Planned Duration</label>
                <input
                  type="text"
                  className="bootcamp-form-input"
                  placeholder="e.g. 2 Weeks"
                  value={plannedDuration}
                  onChange={(e) => setPlannedDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Status</label>
              <select
                className="bootcamp-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ModuleStatus)}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="bootcamp-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bootcamp-btn-primary">
              {initialData?.id ? 'Update Module' : 'Add Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
