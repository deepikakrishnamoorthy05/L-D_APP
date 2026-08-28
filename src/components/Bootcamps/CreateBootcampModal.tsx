import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Plus,
  Users,
  Layers,
  BookOpen,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  Search,
  UserCheck,
  Award,
  Database,
  Code,
  Cpu,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Bootcamp, BootcampStatus, BootcampType } from '../../types/bootcamp';
import { useBootcamps } from '../../context/BootcampContext';
import { useTrainees } from '../../context/TraineeContext';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SearchInput,
  FormField,
  FormGrid,
  Stepper,
  StatusBadge,
  Avatar,
  GlassCard,
  LearningPathDesigner,
} from '../ui';

interface CreateBootcampModalProps {
  initialData?: Bootcamp;
  isDuplicateMode?: boolean;
  onClose: () => void;
}

const PREDEFINED_MODULE_TAGS = [
  'SQL Data Architecture',
  'Python Data Engineering',
  'Power BI & DAX Intelligence',
  'Data Engineering',
  'Azure Synapse & Data Factory',
  'Databricks Delta Lake',
  'dbt Transformations & Snowflake',
  'Machine Learning Foundations',
];

export const CreateBootcampModal: React.FC<CreateBootcampModalProps> = ({
  initialData,
  isDuplicateMode = false,
  onClose,
}) => {
  const { bootcamps, trainers, coordinators, createBootcamp, updateBootcamp, createFromPreviousYear } = useBootcamps();
  const { trainees } = useTrainees();

  const isEdit = Boolean(initialData && !isDuplicateMode);

  // Active step state (1: Basics, 2: Curriculum, 3: Trainers, 4: Trainees, 5: Review)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form State
  const [bootcampType, setBootcampType] = useState<BootcampType>(
    initialData?.bootcampType || 'BOOTCAMP'
  );
  const [bootcampYear, setBootcampYear] = useState<number>(
    initialData?.bootcampYear || 2026
  );
  const [cohortName, setCohortName] = useState<string>(
    initialData?.cohortName || 'Cohort 01'
  );
  const [name, setName] = useState(
    isDuplicateMode && initialData ? `${initialData.name} (Copy)` : initialData?.name || ''
  );
  const [code, setCode] = useState(
    isDuplicateMode && initialData ? `${initialData.code}-COPY` : initialData?.code || 'DE-B-2026-B01'
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [startDate, setStartDate] = useState(
    initialData?.startDate || `${bootcampYear}-01-19`
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate || `${bootcampYear}-05-18`
  );
  const [status, setStatus] = useState<BootcampStatus>(
    isDuplicateMode ? 'Planned' : initialData?.status || 'Active'
  );

  const [primaryTrainerId, setPrimaryTrainerId] = useState(
    initialData?.primaryTrainerId || trainers[0]?.id || 'tr-1'
  );
  const [additionalTrainerId, setAdditionalTrainerId] = useState(
    initialData?.additionalTrainerId || ''
  );
  const [coordinatorId, setCoordinatorId] = useState(
    initialData?.coordinatorId || coordinators[0]?.id || 'co-1'
  );

  // Module Tag Chips State
  const [modules, setModules] = useState<string[]>(
    initialData ? ['SQL Data Architecture', 'Python Data Engineering', 'dbt & Snowflake Transformation'] : ['SQL Data Architecture', 'Python Data Engineering']
  );
  const [customModuleInput, setCustomModuleInput] = useState('');

  // Trainee Selection State (using actual Trainee IDs & Employee IDs)
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>(
    initialData ? ['te-1', 'te-2', 'te-4', 'te-5'] : ['te-1', 'te-2', 'te-3', 'te-4']
  );
  const [traineeSearch, setTraineeSearch] = useState('');

  // Annual Duplication Source Select State
  const [cloneSourceId, setCloneSourceId] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCloneFromPrevious = () => {
    if (!cloneSourceId) return;
    createFromPreviousYear(cloneSourceId, bootcampYear);
    onClose();
  };

  const handleTypeOrYearChange = (type: BootcampType, yr: number) => {
    setBootcampType(type);
    setBootcampYear(yr);
    if (!isEdit && !isDuplicateMode) {
      const typeCode = type === 'BOOTCAMP' ? 'B' : 'L';
      setCode(`DE-${typeCode}-${yr}-B01`);
    }
  };

  const handleAddModuleTag = (tag: string) => {
    if (tag && !modules.includes(tag)) {
      setModules([...modules, tag]);
    }
    setCustomModuleInput('');
  };

  const handleRemoveModuleTag = (tagToRemove: string) => {
    setModules(modules.filter((m) => m !== tagToRemove));
  };

  const handleToggleTrainee = (traineeId: string) => {
    if (selectedTraineeIds.includes(traineeId)) {
      setSelectedTraineeIds(selectedTraineeIds.filter((id) => id !== traineeId));
    } else {
      setSelectedTraineeIds([...selectedTraineeIds, traineeId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Bootcamp Name is mandatory.');
      setActiveStep(1);
      return;
    }
    if (!code.trim()) {
      setValidationError('Bootcamp Code is mandatory.');
      setActiveStep(1);
      return;
    }

    if (!isEdit) {
      const codeExists = bootcamps.some((b) => b.code.toLowerCase() === code.trim().toLowerCase());
      if (codeExists) {
        setValidationError(`Bootcamp Code "${code.trim()}" already exists. Code must be unique.`);
        setActiveStep(1);
        return;
      }
    }

    const primaryTrainerObj = trainers.find((t) => t.id === primaryTrainerId) || trainers[0];
    const addTrainerObj = trainers.find((t) => t.id === additionalTrainerId);
    const coordinatorObj = coordinators.find((c) => c.id === coordinatorId) || coordinators[0];

    const payload: Partial<Bootcamp> = {
      name: name.trim(),
      code: code.trim(),
      bootcampType,
      bootcampYear,
      cohortName: cohortName.trim(),
      description: description.trim(),
      startDate,
      endDate,
      status,
      primaryTrainerId,
      primaryTrainerName: primaryTrainerObj ? primaryTrainerObj.name : 'John Mathew',
      additionalTrainerId: additionalTrainerId || undefined,
      additionalTrainerName: addTrainerObj ? addTrainerObj.name : undefined,
      coordinatorId,
      coordinatorName: coordinatorObj ? coordinatorObj.name : 'Priya Sharma',
      traineesCount: selectedTraineeIds.length,
      modulesCount: modules.length,
      progressPercent: isEdit && initialData ? initialData.progressPercent : 0,
      attendancePercent: isEdit && initialData ? initialData.attendancePercent : 100,
    };

    if (isEdit && initialData) {
      updateBootcamp(initialData.id, payload, selectedTraineeIds);
    } else {
      createBootcamp(payload, selectedTraineeIds);
    }

    onClose();
  };

  // Step definitions with distinct titles & subtitles
  const stepItems = [
    { id: 1, numberText: '01', title: 'Basics', subtitle: 'Type, Year & Code' },
    { id: 2, numberText: '02', title: 'Curriculum', subtitle: 'Modules & Stage Path' },
    { id: 3, numberText: '03', title: 'Trainers', subtitle: 'Staff Assignment' },
    { id: 4, numberText: '04', title: 'Trainees', subtitle: 'Roster & Track Allocation' },
    { id: 5, numberText: '05', title: 'Review', subtitle: 'Confirmation' },
  ];

  // Candidates & Counts
  const selectedPrimaryTrainer = trainers.find((t) => t.id === primaryTrainerId) || trainers[0];
  const selectedAddTrainer = trainers.find((t) => t.id === additionalTrainerId);
  const selectedCoordinator = coordinators.find((c) => c.id === coordinatorId) || coordinators[0];

  const filteredTrainees = trainees.filter(
    (t) =>
      t.name.toLowerCase().includes(traineeSearch.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(traineeSearch.toLowerCase())
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="min(1100px, calc(100vw - 56px))"
    >
      <div className="modal-header-custom">
        <div className="header-left">
          <div className="header-icon-box">
            <Sparkles size={20} className="header-icon-gradient" />
          </div>
          <div>
            <h2 className="ui-modal-title">
              {isEdit ? `Edit Bootcamp — ${initialData?.code}` : 'Launch New Bootcamp Cohort'}
            </h2>
            <p className="ui-modal-subtitle">
              Define program parameters, curriculum stages, staff assignment and trainee tracks.
            </p>
          </div>
        </div>

        <div className="header-right flex items-center gap-3">
          <span className="step-counter-chip">Step {activeStep} of 5</span>
          <button type="button" className="ui-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="modal-form-flex">
        <ModalBody className="p-0 modal-body-grid-container">
          <div className="vertical-stepper-layout">
            {/* LEFT 220PX STEPPER SIDEBAR */}
            <aside className="stepper-sidebar">
              <Stepper
                steps={stepItems}
                currentStep={activeStep}
                onSelectStep={(s) => setActiveStep(s)}
                orientation="vertical"
              />

              {/* Annual Duplication Source Box */}
              {!isEdit && !isDuplicateMode && (
                <div className="clone-source-box mt-auto p-3 card-inner-box">
                  <span className="ui-label mb-1">Clone Previous Cohort</span>
                  <Select
                    value={cloneSourceId}
                    onChange={(e) => setCloneSourceId(e.target.value)}
                    className="text-xs mb-2"
                  >
                    <option value="">-- Select Source --</option>
                    {bootcamps.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.bootcampYear})
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!cloneSourceId}
                    onClick={handleCloneFromPrevious}
                    className="w-full text-xs"
                  >
                    Clone Cohort
                  </Button>
                </div>
              )}
            </aside>

            {/* RIGHT WORKSPACE (Full Width of Right Pane) */}
            <div className="stepper-content-area">
              {validationError && (
                <div className="modal-error-banner mb-3" role="alert">
                  <span>{validationError}</span>
                </div>
              )}

              {/* STEP 01 — BASICS */}
              {activeStep === 1 && (
                <div className="step-content-pane">
                  <h3 className="ui-section-title mb-4">01 Program Basics &amp; Configuration</h3>

                  <FormGrid columns={2} gap="md">
                    <FormField label="Program Type *">
                      <Select
                        value={bootcampType}
                        onChange={(e) =>
                          handleTypeOrYearChange(e.target.value as BootcampType, bootcampYear)
                        }
                      >
                        <option value="BOOTCAMP">BOOTCAMP (Standard 16-Week Graduate Program)</option>
                        <option value="LATERAL">LATERAL (Accelerated 8-Week Experienced Hires)</option>
                      </Select>
                    </FormField>

                    <FormField label="Program Year *">
                      <Select
                        value={bootcampYear}
                        onChange={(e) =>
                          handleTypeOrYearChange(bootcampType, Number(e.target.value))
                        }
                      >
                        <option value={2026}>2026 Cohorts</option>
                        <option value={2025}>2025 Historical</option>
                        <option value={2027}>2027 Upcoming</option>
                      </Select>
                    </FormField>

                    <FormField label="Bootcamp Name *">
                      <Input
                        type="text"
                        placeholder="e.g. SQL Data Architecture"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Program Code *">
                      <Input
                        type="text"
                        placeholder="e.g. DE-B-2026-B01"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Cohort Identifier">
                      <Input
                        type="text"
                        placeholder="e.g. Cohort 01"
                        value={cohortName}
                        onChange={(e) => setCohortName(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Program Status">
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as BootcampStatus)}
                      >
                        <option value="Active">Active</option>
                        <option value="Planned">Planned</option>
                        <option value="Completed">Completed</option>
                        <option value="Archived">Archived</option>
                      </Select>
                    </FormField>

                    <FormField label="Start Date">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </FormField>

                    <FormField label="End Date">
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Description &amp; Curriculum Focus" fullWidth>
                      <textarea
                        className="form-input h-24 p-3"
                        placeholder="Describe key learning outcomes and modules..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </FormField>
                  </FormGrid>
                </div>
              )}

              {/* STEP 02 — CURRICULUM */}
              {activeStep === 2 && (
                <div className="step-content-pane">
                  <h3 className="ui-section-title mb-1">02 Curriculum &amp; Learning Path Architecture</h3>
                  <p className="ui-body mb-4">Visual stage progression for Common Foundation and Track Splits</p>

                  <LearningPathDesigner />

                  <div className="curriculum-workspace-card mt-4 p-4 card-inner-box">
                    <h4 className="ui-card-title mb-2">Configured Learning Modules</h4>

                    <div className="module-chips-wrap mb-3">
                      {modules.map((modTag) => (
                        <span key={modTag} className="module-chip-tag">
                          <span>{modTag}</span>
                          <button
                            type="button"
                            className="remove-chip-btn"
                            onClick={() => handleRemoveModuleTag(modTag)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <FormGrid columns={2} gap="md">
                      <FormField label="Add Predefined Module">
                        <Select
                          onChange={(e) => {
                            if (e.target.value) handleAddModuleTag(e.target.value);
                          }}
                          value=""
                        >
                          <option value="">-- Select Predefined Module --</option>
                          {PREDEFINED_MODULE_TAGS.map((tag) => (
                            <option key={tag} value={tag}>
                              {tag}
                            </option>
                          ))}
                        </Select>
                      </FormField>

                      <FormField label="Add Custom Module">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Custom module name..."
                            value={customModuleInput}
                            onChange={(e) => setCustomModuleInput(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleAddModuleTag(customModuleInput.trim())}
                            disabled={!customModuleInput.trim()}
                          >
                            + Add
                          </Button>
                        </div>
                      </FormField>
                    </FormGrid>
                  </div>
                </div>
              )}

              {/* STEP 03 — TRAINERS */}
              {activeStep === 3 && (
                <div className="step-content-pane">
                  <h3 className="ui-section-title mb-1">03 Staff &amp; Trainer Assignment</h3>
                  <p className="ui-body mb-4">Assign primary lead trainer, optional co-trainers and program coordination for this cohort.</p>

                  <div className="step-03-grid-workspace">
                    {/* LEFT COLUMN: TRAINER CANDIDATES & CONTROLS */}
                    <div className="trainer-left-column">
                      <h4 className="ui-card-title mb-3">Trainer Candidates (Select Primary Lead)</h4>

                      {/* 2-COLUMN TRAINER CARDS GRID */}
                      <div className="trainer-cards-grid-2col mb-4">
                        {trainers.map((tr, index) => {
                          const isPrimary = tr.id === primaryTrainerId;

                          return (
                            <motion.div
                              key={tr.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.06 }}
                              whileHover={{ y: -3 }}
                              onClick={() => setPrimaryTrainerId(tr.id)}
                              className={`trainer-card-unified ${isPrimary ? 'selected-teal' : ''}`}
                            >
                              <div className="trainer-card-header">
                                <Avatar name={tr.name} size="md" colorScheme={isPrimary ? 'teal' : 'indigo'} />
                                {isPrimary ? (
                                  <span className="trainer-selected-check">
                                    <CheckCircle2 size={14} /> Primary Lead
                                  </span>
                                ) : (
                                  <span className="trainer-avail-badge">Available</span>
                                )}
                              </div>

                              <div className="trainer-card-body mt-2">
                                <div className="trainer-name-row">
                                  <span className="trainer-name">{tr.name}</span>
                                  <span className="trainer-emp-id">{tr.employeeId}</span>
                                </div>
                                <span className="trainer-spec-text">SQL &amp; Data Engineering</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* ASSIGNMENT CONTROLS 2-COLUMN GRID */}
                      <FormGrid columns={2} gap="md" className="mt-4">
                        <FormField label="Additional Trainer (Optional)">
                          <Select
                            value={additionalTrainerId}
                            onChange={(e) => setAdditionalTrainerId(e.target.value)}
                          >
                            <option value="">-- None Assigned --</option>
                            {trainers
                              .filter((t) => t.id !== primaryTrainerId)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.employeeId})
                                </option>
                              ))}
                          </Select>
                        </FormField>

                        <FormField label="L&amp;D Program Coordinator *">
                          <Select
                            value={coordinatorId}
                            onChange={(e) => setCoordinatorId(e.target.value)}
                          >
                            {coordinators.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.employeeId})
                              </option>
                            ))}
                          </Select>
                        </FormField>
                      </FormGrid>
                    </div>

                    {/* RIGHT COLUMN: STAFFING SUMMARY CARD */}
                    <div className="staffing-summary-card">
                      <h4 className="summary-card-title mb-4">
                        <ShieldCheck size={16} className="text-teal-600" />
                        <span>STAFFING SUMMARY</span>
                      </h4>

                      {/* Section 1: Primary Lead Trainer */}
                      <div className="summary-staff-section">
                        <span className="section-label">PRIMARY TRAINER</span>
                        {selectedPrimaryTrainer ? (
                          <div className="staff-info-block mt-2">
                            <Avatar name={selectedPrimaryTrainer.name} size="sm" colorScheme="teal" />
                            <div className="staff-meta">
                              <span className="staff-name">{selectedPrimaryTrainer.name}</span>
                              <span className="staff-sub">{selectedPrimaryTrainer.employeeId} • SQL &amp; Data Engineering</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-empty mt-2">Not Selected</span>
                        )}
                      </div>

                      <div className="summary-divider my-3" />

                      {/* Section 2: Additional Trainer */}
                      <div className="summary-staff-section">
                        <span className="section-label">ADDITIONAL TRAINER</span>
                        {selectedAddTrainer ? (
                          <div className="staff-info-block mt-2">
                            <Avatar name={selectedAddTrainer.name} size="sm" colorScheme="indigo" />
                            <div className="staff-meta">
                              <span className="staff-name">{selectedAddTrainer.name}</span>
                              <span className="staff-sub">{selectedAddTrainer.employeeId}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-empty mt-2">Not Assigned</span>
                        )}
                      </div>

                      <div className="summary-divider my-3" />

                      {/* Section 3: Program Coordinator */}
                      <div className="summary-staff-section">
                        <span className="section-label">PROGRAM COORDINATOR</span>
                        {selectedCoordinator ? (
                          <div className="staff-info-block mt-2">
                            <Avatar name={selectedCoordinator.name} size="sm" colorScheme="amber" />
                            <div className="staff-meta">
                              <span className="staff-name">{selectedCoordinator.name}</span>
                              <span className="staff-sub">{selectedCoordinator.employeeId} • L&amp;D Coordinator</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-empty mt-2">Not Selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 04 — TRAINEES */}
              {activeStep === 4 && (
                <div className="step-content-pane">
                  <h3 className="ui-section-title mb-4">04 Trainee Roster &amp; Track Allocation</h3>

                  <div className="two-cols-split-65-35">
                    <div className="trainee-roster-column">
                      <div className="roster-header-row mb-3 flex items-center justify-between">
                        <span className="ui-card-title">{selectedTraineeIds.length} Trainees Selected</span>
                        <SearchInput
                          value={traineeSearch}
                          onChange={setTraineeSearch}
                          placeholder="Search trainees..."
                          className="w-48"
                        />
                      </div>

                      <div className="trainees-list-scroll">
                        {filteredTrainees.map((t) => {
                          const isSelected = selectedTraineeIds.includes(t.id);

                          return (
                            <div
                              key={t.id}
                              className={`trainee-row-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleToggleTrainee(t.id)}
                            >
                              <input type="checkbox" checked={isSelected} readOnly />
                              <Avatar name={t.name} size="sm" />
                              <div className="trainee-row-info">
                                <span className="name">{t.name}</span>
                                <span className="employee-id">{t.employeeId}</span>
                              </div>
                              <span className="track-badge foundation">Common Foundation</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="track-allocation-summary-column card-inner-box p-4">
                      <h4 className="ui-card-title mb-3">Track Allocation Summary</h4>

                      <div className="track-card-compact mb-3">
                        <span className="ui-label">Common Foundation</span>
                        <div className="track-count-num text-teal-600">{selectedTraineeIds.length} Trainees</div>
                      </div>

                      <div className="track-split-flow-icon my-3 text-center text-xs text-muted font-bold">
                        ↓ TRACK ALLOCATION SPLIT
                      </div>

                      <div className="track-split-grid-2">
                        <div className="track-card-compact">
                          <span className="ui-label text-xs">DBT &amp; Snowflake</span>
                          <div className="track-count-num text-indigo-600">
                            {Math.ceil(selectedTraineeIds.length / 2)}
                          </div>
                        </div>

                        <div className="track-card-compact">
                          <span className="ui-label text-xs">Databricks</span>
                          <div className="track-count-num text-amber-600">
                            {Math.floor(selectedTraineeIds.length / 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 05 — REVIEW */}
              {activeStep === 5 && (
                <div className="step-content-pane">
                  <GlassCard variant="hero" padding="lg">
                    <div className="review-header-title">
                      <h2 className="ui-page-title">{name || 'Data Engineering Bootcamp'}</h2>
                      <div className="badge-row mt-2 flex items-center gap-2">
                        <span className="code-chip lg">{bootcampType}</span>
                        <span className="code-chip lg">{bootcampYear}</span>
                        <StatusBadge status={status} />
                      </div>
                      <span className="code-chip mt-2 inline-block">{code}</span>
                    </div>

                    <FormGrid columns={3} gap="md" className="mt-4">
                      <div className="info-cell">
                        <span className="ui-label">Cohort Identifier</span>
                        <span className="info-val">{cohortName}</span>
                      </div>

                      <div className="info-cell">
                        <span className="ui-label">Schedule Duration</span>
                        <span className="info-val">{startDate} – {endDate}</span>
                      </div>

                      <div className="info-cell">
                        <span className="ui-label">Primary Lead Trainer</span>
                        <span className="info-val">{selectedPrimaryTrainer?.name}</span>
                      </div>

                      <div className="info-cell">
                        <span className="ui-label">Enrolled Trainees</span>
                        <span className="info-val highlight text-teal-600">{selectedTraineeIds.length} Trainees</span>
                      </div>

                      <div className="info-cell">
                        <span className="ui-label">Configured Modules</span>
                        <span className="info-val">{modules.length} Modules</span>
                      </div>

                      <div className="info-cell">
                        <span className="ui-label">Track Streams</span>
                        <span className="info-val">2 Tracks (DBT &amp; Databricks)</span>
                      </div>
                    </FormGrid>
                  </GlassCard>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="modal-footer-aligned">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex gap-2">
            {activeStep > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveStep(activeStep - 1)}
              >
                Previous Step
              </Button>
            )}

            {activeStep < 5 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Next Step →
              </Button>
            ) : (
              <Button type="submit" variant="primary" icon={<ArrowRight size={16} />}>
                Launch Bootcamp Cohort →
              </Button>
            )}
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
};
