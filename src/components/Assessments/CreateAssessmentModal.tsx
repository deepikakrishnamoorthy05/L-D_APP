import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { useBootcamps } from '../../context/BootcampContext';
import { useTrainees } from '../../context/TraineeContext';
import { useSessions } from '../../context/SessionContext';
import { useAssessments } from '../../context/AssessmentContext';
import { AssessmentType, AssessmentCriterion, AssessmentStatus } from '../../types/assessment';
import { LearningTrack } from '../../types/session';

interface CreateAssessmentModalProps {
  onClose: () => void;
  initialData?: any;
}

export const CreateAssessmentModal: React.FC<CreateAssessmentModalProps> = ({
  onClose,
  initialData,
}) => {
  const { bootcamps, modulesMap } = useBootcamps();
  const { trainees } = useTrainees();
  const { sessions } = useSessions();
  const { createAssessment, updateAssessment } = useAssessments();

  const [step, setStep] = useState<number>(1);

  // Step 01 Form State
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<AssessmentType>(initialData?.type || 'Module Test');
  const [bootcampId, setBootcampId] = useState(initialData?.bootcampId || bootcamps[0]?.id || 'bc-1');
  const [track, setTrack] = useState<LearningTrack>(initialData?.track || 'Common Foundation');
  const [moduleId, setModuleId] = useState(initialData?.moduleId || '');
  const [linkedSessionId, setLinkedSessionId] = useState(initialData?.linkedSessionId || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialData?.startTime || '09:30');
  const [endTime, setEndTime] = useState(initialData?.endTime || '12:30');
  const [evaluatorName, setEvaluatorName] = useState(initialData?.evaluatorName || 'John Mathew');
  const [additionalEvaluatorName, setAdditionalEvaluatorName] = useState(initialData?.additionalEvaluatorName || '');
  const [totalMarks, setTotalMarks] = useState<number>(initialData?.totalMarks || 100);
  const [passingMarks, setPassingMarks] = useState<number>(initialData?.passingMarks || 60);
  const [status, setStatus] = useState<AssessmentStatus>(initialData?.status || 'Scheduled');

  // Step 02 Participants State
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>(
    initialData?.participantIds || []
  );
  const [participantSearch, setParticipantSearch] = useState('');

  // Step 03 Evaluation Structure State
  const [evaluationStyle, setEvaluationStyle] = useState<'SCORE_BASED' | 'CRITERIA_BASED'>(
    initialData?.evaluationStyle || 'SCORE_BASED'
  );
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>(
    initialData?.criteria || [
      { id: 'c-1', name: 'Technical Knowledge', weight: 40 },
      { id: 'c-2', name: 'Practical Implementation', weight: 30 },
      { id: 'c-3', name: 'Problem Solving', weight: 20 },
      { id: 'c-4', name: 'Communication & Documentation', weight: 10 },
    ]
  );
  const [strengths, setStrengths] = useState(initialData?.strengthsSummary || '');
  const [improvementAreas, setImprovementAreas] = useState(initialData?.improvementAreasSummary || '');

  // Validation Error State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic Module loading based on Bootcamp & Track
  const selectedBootcamp = bootcamps.find((b) => b.id === bootcampId) || bootcamps[0];
  const bootcampModules = modulesMap[bootcampId] || [];

  // Filter modules based on stage/track if specified
  const applicableModules = bootcampModules.filter(
    (m) => !m.stage || m.stage === track || track === 'Shared' || m.stage === 'Common Foundation'
  );

  // Default module selection if empty
  useEffect(() => {
    if (applicableModules.length > 0 && !moduleId) {
      setModuleId(applicableModules[0].id);
    }
  }, [bootcampId, track, applicableModules]);

  // Calendar sessions available for linking
  const candidateSessions = sessions.filter(
    (s) =>
      s.bootcampId === bootcampId &&
      (s.eventType === 'Assessment' || s.eventType === 'Mock Test' || s.eventType === 'Evaluation')
  );

  // Automatic Track-Aware Trainee Suggestion for Step 02
  useEffect(() => {
    if (selectedTraineeIds.length === 0) {
      let filtered = trainees.filter((t) => t.bootcampId === bootcampId || !t.bootcampId);
      if (track === 'Databricks') {
        filtered = filtered.filter(
          (t) => t.primaryDomain?.toLowerCase().includes('python') || t.primaryDomain?.toLowerCase().includes('databricks')
        );
      } else if (track === 'DBT & Snowflake') {
        filtered = filtered.filter(
          (t) => t.primaryDomain?.toLowerCase().includes('sql') || t.primaryDomain?.toLowerCase().includes('bi') || t.primaryDomain?.toLowerCase().includes('dbt')
        );
      }
      setSelectedTraineeIds(filtered.map((t) => t.id));
    }
  }, [bootcampId, track]);

  // Candidate Trainees for Step 02 display
  const eligibleTrainees = trainees.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(participantSearch.toLowerCase());
    return matchesSearch;
  });

  const handleToggleTrainee = (traineeId: string) => {
    if (selectedTraineeIds.includes(traineeId)) {
      setSelectedTraineeIds(selectedTraineeIds.filter((id) => id !== traineeId));
    } else {
      setSelectedTraineeIds([...selectedTraineeIds, traineeId]);
    }
  };

  const handleSelectAll = () => {
    setSelectedTraineeIds(eligibleTrainees.map((t) => t.id));
  };

  const handleClearAll = () => {
    setSelectedTraineeIds([]);
  };

  // Criteria Helpers
  const handleAddCriterion = () => {
    const newCriterion: AssessmentCriterion = {
      id: 'c-' + Date.now(),
      name: 'New Criterion',
      weight: 10,
    };
    setCriteria([...criteria, newCriterion]);
  };

  const handleRemoveCriterion = (cId: string) => {
    setCriteria(criteria.filter((c) => c.id !== cId));
  };

  const handleCriterionChange = (cId: string, field: 'name' | 'weight', val: any) => {
    setCriteria(
      criteria.map((c) => (c.id === cId ? { ...c, [field]: field === 'weight' ? Number(val) : val } : c))
    );
  };

  const totalCriteriaWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

  // Step Transitions & Validations
  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg('Please enter an assessment name.');
        return;
      }
      if (!date) {
        setErrorMsg('Please select an assessment date.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedTraineeIds.length === 0) {
        setErrorMsg('Please select at least 1 trainee participant.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (evaluationStyle === 'CRITERIA_BASED' && totalCriteriaWeight !== 100) {
        setErrorMsg(`Criteria weights must sum to 100%. Current total: ${totalCriteriaWeight}%.`);
        return;
      }
      setStep(4);
    }
  };

  const handleSubmit = (finalStatus: AssessmentStatus) => {
    const selectedModule = applicableModules.find((m) => m.id === moduleId);
    const assessmentPayload = {
      name,
      type,
      bootcampId,
      bootcampName: selectedBootcamp.name,
      track,
      moduleId,
      moduleName: selectedModule ? selectedModule.name : 'General Module',
      linkedSessionId: linkedSessionId || undefined,
      date,
      startTime,
      endTime,
      evaluatorName,
      additionalEvaluatorName: additionalEvaluatorName || undefined,
      totalMarks,
      passingMarks,
      evaluationStyle,
      criteria,
      status: finalStatus,
      strengthsSummary: strengths,
      improvementAreasSummary: improvementAreas,
    };

    if (initialData?.id) {
      updateAssessment(initialData.id, assessmentPayload);
    } else {
      createAssessment(assessmentPayload, selectedTraineeIds);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" role="dialog" aria-modal="true">
      <div className="modal-container-card premium-wizard-modal max-w-4xl">
        {/* Modal Header */}
        <header className="modal-header-bar">
          <div className="modal-header-title">
            <Award size={20} className="header-icon-gradient" />
            <div>
              <h2>{initialData ? 'Edit Assessment' : 'Create New Assessment'}</h2>
              <p className="subtitle">Configure track-aware evaluation and scheduling</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {/* 4-Step Stepper Bar */}
        <div className="modal-stepper-bar">
          <div className={`step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            <span className="step-num">01</span>
            <span className="step-label">Assessment Setup</span>
          </div>
          <div className={`step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            <span className="step-num">02</span>
            <span className="step-label">Participants</span>
          </div>
          <div className={`step-item ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
            <span className="step-num">03</span>
            <span className="step-label">Evaluation Structure</span>
          </div>
          <div className={`step-item ${step === 4 ? 'active' : ''}`}>
            <span className="step-num">04</span>
            <span className="step-label">Review &amp; Schedule</span>
          </div>
        </div>

        {errorMsg && (
          <div className="modal-error-banner" role="alert">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 01 — SETUP */}
        {step === 1 && (
          <div className="modal-body-scroll">
            <div className="form-grid-2">
              <div className="form-group full-width">
                <label className="form-label">Assessment Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Module Test 1 — SQL & T-SQL"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assessment Type *</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as AssessmentType)}
                >
                  <option value="Module Test">Module Test</option>
                  <option value="Mock Test">Mock Test</option>
                  <option value="Practical">Practical</option>
                  <option value="Technical Evaluation">Technical Evaluation</option>
                  <option value="Project Evaluation">Project Evaluation</option>
                  <option value="Certification Evaluation">Certification Evaluation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bootcamp *</label>
                <select
                  className="form-select"
                  value={bootcampId}
                  onChange={(e) => setBootcampId(e.target.value)}
                >
                  {bootcamps.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.bootcampYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Learning Track *</label>
                <select
                  className="form-select"
                  value={track}
                  onChange={(e) => setTrack(e.target.value as LearningTrack)}
                >
                  <option value="Common Foundation">Common Foundation</option>
                  <option value="DBT & Snowflake">DBT &amp; Snowflake</option>
                  <option value="Databricks">Databricks</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Module *</label>
                <select
                  className="form-select"
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                >
                  {applicableModules.length === 0 ? (
                    <option value="">No specific modules found</option>
                  ) : (
                    applicableModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Linked Training Calendar Session (Optional)</label>
                <select
                  className="form-select"
                  value={linkedSessionId}
                  onChange={(e) => setLinkedSessionId(e.target.value)}
                >
                  <option value="">-- Create/Link Automatically on Calendar --</option>
                  {candidateSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.sessionDate} • {s.title} ({s.eventType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assessment Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time Slot</label>
                <div className="time-flex">
                  <input
                    type="time"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="time"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Evaluator *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Mathew"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Evaluator (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sarah David"
                  value={additionalEvaluatorName}
                  onChange={(e) => setAdditionalEvaluatorName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Marks *</label>
                <input
                  type="number"
                  className="form-input"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Passing Marks *</label>
                <input
                  type="number"
                  className="form-input"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 02 — PARTICIPANTS */}
        {step === 2 && (
          <div className="modal-body-scroll">
            <div className="participant-selection-header">
              <div className="participant-count-badge">
                <Users size={16} />
                <span>Selected Trainees: <strong>{selectedTraineeIds.length}</strong></span>
              </div>

              <div className="participant-actions-row">
                <div className="bootcamp-search-box sm">
                  <Search size={14} className="bootcamp-search-icon" />
                  <input
                    type="text"
                    className="bootcamp-search-input"
                    placeholder="Search Trainee..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                  />
                </div>
                <button type="button" className="bootcamp-btn-secondary sm" onClick={handleSelectAll}>
                  Select All
                </button>
                <button type="button" className="bootcamp-btn-secondary sm" onClick={handleClearAll}>
                  Clear All
                </button>
              </div>
            </div>

            <div className="track-notice-pill mt-2">
              <span>
                Track Selection: <strong>{track}</strong>. Trainees are filtered automatically to match track requirements.
              </span>
            </div>

            <div className="trainee-checkbox-grid mt-3">
              {eligibleTrainees.map((t) => {
                const isChecked = selectedTraineeIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`trainee-checkbox-card ${isChecked ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleTrainee(t.id)}
                    />
                    <div className="trainee-card-info">
                      <span className="trainee-name">{t.name}</span>
                      <span className="trainee-subtext">
                        {t.employeeId} • {t.primaryDomain || t.role}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 03 — EVALUATION STRUCTURE */}
        {step === 3 && (
          <div className="modal-body-scroll">
            <div className="style-toggle-buttons mb-3">
              <button
                type="button"
                className={`style-toggle-btn ${evaluationStyle === 'SCORE_BASED' ? 'active' : ''}`}
                onClick={() => setEvaluationStyle('SCORE_BASED')}
              >
                A. Score-Based Evaluation
              </button>
              <button
                type="button"
                className={`style-toggle-btn ${evaluationStyle === 'CRITERIA_BASED' ? 'active' : ''}`}
                onClick={() => setEvaluationStyle('CRITERIA_BASED')}
              >
                B. Criteria-Based Weighted Evaluation
              </button>
            </div>

            {evaluationStyle === 'SCORE_BASED' ? (
              <div className="score-based-box card-inner-box p-4">
                <h4>Score-Based Configuration</h4>
                <p className="text-secondary-cell mb-3">
                  Direct numerical score evaluation out of total marks.
                </p>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Total Marks</label>
                    <input
                      type="number"
                      className="form-input"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Passing Marks</label>
                    <input
                      type="number"
                      className="form-input"
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="criteria-based-box card-inner-box p-4">
                <div className="criteria-header-row mb-2">
                  <div>
                    <h4>Evaluation Criteria Breakdown</h4>
                    <p className="text-secondary-cell">
                      Assign percentages to skill dimensions (Total must equal 100%).
                    </p>
                  </div>
                  <span className={`weight-total-badge ${totalCriteriaWeight === 100 ? 'valid' : 'invalid'}`}>
                    Total: {totalCriteriaWeight}% / 100%
                  </span>
                </div>

                <div className="criteria-list">
                  {criteria.map((c) => (
                    <div key={c.id} className="criterion-row">
                      <input
                        type="text"
                        className="form-input flex-1"
                        placeholder="Criterion Name"
                        value={c.name}
                        onChange={(e) => handleCriterionChange(c.id, 'name', e.target.value)}
                      />
                      <div className="weight-input-wrapper">
                        <input
                          type="number"
                          className="form-input w-24"
                          placeholder="Weight %"
                          value={c.weight}
                          onChange={(e) => handleCriterionChange(c.id, 'weight', e.target.value)}
                        />
                        <span className="weight-suffix">%</span>
                      </div>
                      <button
                        type="button"
                        className="action-icon-danger-btn"
                        onClick={() => handleRemoveCriterion(c.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="bootcamp-btn-secondary sm mt-3"
                  onClick={handleAddCriterion}
                >
                  <Plus size={14} /> + Add Criterion
                </button>
              </div>
            )}

            <div className="optional-comments-section mt-4">
              <h4 className="mb-2">Evaluation Feedback Criteria</h4>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Key Focus Strengths</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Query optimization, T-SQL windowing"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Areas for Improvement</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Index fragmentation analysis"
                    value={improvementAreas}
                    onChange={(e) => setImprovementAreas(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 04 — REVIEW */}
        {step === 4 && (
          <div className="modal-body-scroll">
            <div className="review-summary-card">
              <div className="review-card-top">
                <h3>{name}</h3>
                <div className="badge-row">
                  <span className="code-chip lg">{type}</span>
                  <span className="track-badge foundation">{track}</span>
                  <span className="bootcamp-status-badge status-active">{status}</span>
                </div>
              </div>

              <div className="info-grid mt-3">
                <div className="info-cell">
                  <span className="info-label">Bootcamp</span>
                  <span className="info-val">{selectedBootcamp.name}</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Assessment Date</span>
                  <span className="info-val">{date} ({startTime} – {endTime})</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Evaluator</span>
                  <span className="info-val">{evaluatorName}</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Total Participants</span>
                  <span className="info-val highlight">{selectedTraineeIds.length} Trainees</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Total Marks</span>
                  <span className="info-val">{totalMarks}</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Passing Marks</span>
                  <span className="info-val">{passingMarks} Marks ({Math.round((passingMarks / totalMarks) * 100)}%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <footer className="modal-footer-bar justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                className="bootcamp-btn-secondary"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={16} /> Previous
              </button>
            )}
          </div>

          <div className="footer-actions-right">
            {step < 4 ? (
              <button type="button" className="bootcamp-btn-primary" onClick={handleNext}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="bootcamp-btn-secondary"
                  onClick={() => handleSubmit('Draft')}
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  className="bootcamp-btn-primary"
                  onClick={() => handleSubmit('Scheduled')}
                >
                  Schedule Assessment
                </button>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
