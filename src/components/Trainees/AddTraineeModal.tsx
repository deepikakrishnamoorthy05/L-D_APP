import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, BookOpen, User, Building } from 'lucide-react';
import { Trainee, LearningStatus, EnrollmentStatus } from '../../types/trainee';
import { useTrainees } from '../../context/TraineeContext';
import { useBootcamps } from '../../context/BootcampContext';

interface AddTraineeModalProps {
  initialData?: Trainee;
  onClose: () => void;
}

export const AddTraineeModal: React.FC<AddTraineeModalProps> = ({ initialData, onClose }) => {
  const { addTrainee, updateTrainee } = useTrainees();
  const { bootcamps } = useBootcamps();

  const isEdit = Boolean(initialData);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [employeeId, setEmployeeId] = useState(initialData?.employeeId || '');
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [department, setDepartment] = useState(initialData?.department || 'Data Engineering');
  const [role, setRole] = useState(initialData?.role || 'Associate Data Engineer');
  const [joiningDate, setJoiningDate] = useState(
    initialData?.joiningDate || new Date().toISOString().split('T')[0]
  );

  const [bootcampId, setBootcampId] = useState(
    initialData?.bootcampId || bootcamps[0]?.id || 'bc-1'
  );
  const [learningStatus, setLearningStatus] = useState<LearningStatus>(
    initialData?.learningStatus || 'On Track'
  );
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>(
    initialData?.enrollmentStatus || 'Active'
  );
  const [primaryTech, setPrimaryTech] = useState(
    initialData?.primaryTech || 'SQL & Data Warehousing'
  );

  const [error, setError] = useState('');

  // Compute initials live
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'TR';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const selectedBootcamp = bootcamps.find((b) => b.id === bootcampId) || bootcamps[0];

  const validateStep1 = () => {
    if (!employeeId.trim()) {
      setError('Employee ID is required.');
      return false;
    }
    if (!name.trim()) {
      setError('Full name is required.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid work email address is required.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    setError('');
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    const payload: Partial<Trainee> = {
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      role: role.trim(),
      joiningDate,
      bootcampId: selectedBootcamp.id,
      bootcampName: selectedBootcamp.name,
      learningStatus,
      enrollmentStatus,
      primaryTech,
    };

    if (isEdit && initialData) {
      updateTrainee(initialData.id, payload);
    } else {
      addTrainee(payload);
    }
    onClose();
  };

  return (
    <div className="bootcamp-modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bootcamp-modal-shell trainee-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="trainee-modal-header">
          <div className="header-left-wrap">
            <div className="modal-icon-badge">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="modal-headline">{isEdit ? 'Edit Trainee Profile' : 'Enroll New Trainee'}</h3>
              <p className="modal-subtext">Add employee information and assign the initial learning journey.</p>
            </div>
          </div>
          <button type="button" className="close-btn-round" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="trainee-modal-stepper">
          <div className={`stepper-tab ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`} onClick={() => currentStep > 1 && setCurrentStep(1)}>
            <span className="step-num">01</span>
            <span className="step-title">Employee Profile</span>
          </div>
          <div className="stepper-line" />
          <div className={`stepper-tab ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`} onClick={() => currentStep > 2 && setCurrentStep(2)}>
            <span className="step-num">02</span>
            <span className="step-title">Bootcamp Assignment</span>
          </div>
          <div className="stepper-line" />
          <div className={`stepper-tab ${currentStep === 3 ? 'active' : ''}`}>
            <span className="step-num">03</span>
            <span className="step-title">Review &amp; Enroll</span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="trainee-modal-body">
          {error && (
            <div className="modal-error-banner mb-3" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: EMPLOYEE PROFILE */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="step-container"
              >
                {/* Live Avatar Preview */}
                <div className="live-avatar-preview-box">
                  <div className="preview-avatar-circle">
                    {getInitials(name)}
                  </div>
                  <div className="preview-info">
                    <span className="preview-name">{name.trim() || 'Employee Full Name'}</span>
                    <span className="preview-sub">{employeeId.trim() || 'EMP-ID'} • {email.trim() || 'email@systechusa.com'}</span>
                  </div>
                </div>

                <div className="form-grid-2col mt-3">
                  <div className="form-group-unified">
                    <label className="field-label">Employee ID *</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="e.g. EMP098"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  </div>

                  <div className="form-group-unified">
                    <label className="field-label">Full Name *</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="e.g. Kaviram Sudharajanainar Paramasivan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group-unified">
                    <label className="field-label">Work Email Address *</label>
                    <input
                      type="email"
                      className="field-input"
                      placeholder="e.g. kaviram.paramasivan@systechusa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group-unified">
                    <label className="field-label">Department / Unit</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="e.g. Data Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>

                  <div className="form-group-unified">
                    <label className="field-label">Role / Designation</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="e.g. Associate Data Engineer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>

                  <div className="form-group-unified">
                    <label className="field-label">Joining Date</label>
                    <input
                      type="date"
                      className="field-input"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: BOOTCAMP ASSIGNMENT */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="step-container"
              >
                <div className="form-grid-2col">
                  <div className="form-group-unified">
                    <label className="field-label">Assigned Bootcamp Cohort *</label>
                    <select
                      className="field-select"
                      value={bootcampId}
                      onChange={(e) => setBootcampId(e.target.value)}
                    >
                      {bootcamps.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code}) — {b.bootcampYear}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-unified">
                    <label className="field-label">Primary Skill / Tech Track</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="e.g. SQL & Data Warehousing"
                      value={primaryTech}
                      onChange={(e) => setPrimaryTech(e.target.value)}
                    />
                  </div>

                  <div className="form-group-unified">
                    <label className="field-label">Learning Performance Status *</label>
                    <select
                      className="field-select"
                      value={learningStatus}
                      onChange={(e) => setLearningStatus(e.target.value as LearningStatus)}
                    >
                      <option value="On Track">On Track</option>
                      <option value="Project Ready">Project Ready</option>
                      <option value="Needs Attention">Needs Attention</option>
                      <option value="At Risk">At Risk</option>
                    </select>
                  </div>

                  <div className="form-group-unified">
                    <label className="field-label">Enrollment Status *</label>
                    <select
                      className="field-select"
                      value={enrollmentStatus}
                      onChange={(e) => setEnrollmentStatus(e.target.value as EnrollmentStatus)}
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Not Assigned">Not Assigned</option>
                    </select>
                  </div>
                </div>

                {/* Selected Bootcamp Visual Preview Card */}
                {selectedBootcamp && (
                  <div className="selected-bootcamp-preview-card mt-3">
                    <div className="preview-card-header">
                      <BookOpen size={18} className="text-teal-600" />
                      <span className="card-badge">{selectedBootcamp.bootcampType} • {selectedBootcamp.bootcampYear}</span>
                    </div>
                    <h4 className="preview-card-title">{selectedBootcamp.name}</h4>
                    <span className="preview-card-code font-mono">{selectedBootcamp.code}</span>
                    <p className="preview-card-desc">{selectedBootcamp.description}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: REVIEW & ENROLL */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="step-container"
              >
                <div className="review-summary-card">
                  <div className="review-hero-row">
                    <div className="review-avatar-large">
                      {getInitials(name)}
                    </div>
                    <div className="review-hero-info">
                      <h4 className="review-name">{name || 'Unnamed Employee'}</h4>
                      <span className="review-sub"><User size={13} /> {employeeId} • {email}</span>
                      <span className="review-sub mt-1"><Building size={13} /> {department} • {role}</span>
                    </div>
                  </div>

                  <div className="review-divider" />

                  <div className="review-details-grid">
                    <div className="review-cell">
                      <span className="review-label">BOOTCAMP COHORT</span>
                      <span className="review-val font-semibold">{selectedBootcamp?.name}</span>
                      <span className="review-val-sub font-mono text-teal-600">{selectedBootcamp?.code}</span>
                    </div>

                    <div className="review-cell">
                      <span className="review-label">PRIMARY TECH TRACK</span>
                      <span className="review-val font-semibold">{primaryTech}</span>
                    </div>

                    <div className="review-cell">
                      <span className="review-label">LEARNING STATUS</span>
                      <span className="review-val font-semibold">{learningStatus}</span>
                    </div>

                    <div className="review-cell">
                      <span className="review-label">ENROLLMENT STATUS</span>
                      <span className="review-val font-semibold">{enrollmentStatus}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="trainee-modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>

          <div className="footer-right-actions">
            {currentStep > 1 && (
              <button type="button" className="btn-prev" onClick={handlePrev}>
                <ArrowLeft size={16} /> Previous
              </button>
            )}

            {currentStep < 3 ? (
              <button type="button" className="btn-next" onClick={handleNext}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" className="btn-submit" onClick={() => handleSubmit()}>
                <CheckCircle2 size={16} /> {isEdit ? 'Save Trainee Profile' : 'Enroll Trainee'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
