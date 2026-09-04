import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Mail,
  Send,
  Check,
  Search,
  Filter,
  Sparkles,
  Layers,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { TrainerTrack, TrainingType, TrainingPlan } from '../../types/training';
import { useTraining } from '../../context/TrainingContext';

interface PlanTrainingModalProps {
  onClose: () => void;
  onSuccess?: (plan: TrainingPlan) => void;
}

export const PlanTrainingModal: React.FC<PlanTrainingModalProps> = ({ onClose, onSuccess }) => {
  const { trainers, createTrainingPlan } = useTraining();

  // Wizard Step (1: Training Details, 2: Select Track & Trainer, 3: Email Preview)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1 FORM STATE
  const [trainingName, setTrainingName] = useState('Knowledge Sharing Series');
  const [trainingType, setTrainingType] = useState<TrainingType>('Knowledge Sharing Series');
  const [customType, setCustomType] = useState('');
  const [topic, setTopic] = useState('Databricks Performance Optimization');
  const [description, setDescription] = useState(
    'Internal technical session focusing on query tuning, memory allocation, and cost optimization.'
  );
  const [targetAudience, setTargetAudience] = useState('Data Engineering Associates & Consultants');
  const [expectedParticipants, setExpectedParticipants] = useState(25);
  const [preferredDate, setPreferredDate] = useState('2026-09-18');
  const [preferredTime, setPreferredTime] = useState('15:00 - 16:00');
  const [duration, setDuration] = useState('1 Hour');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // STEP 2 TRACK & TRAINER STATE
  const [selectedTrack, setSelectedTrack] = useState<TrainerTrack>('DE');
  const [trainerSearchQuery, setTrainerSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>(['tr-de-1', 'tr-de-2']);

  // STEP 3 EMAIL EDITING STATE
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customIntroText, setCustomIntroText] = useState('');
  const [customSignoff, setCustomSignoff] = useState('');

  const [error, setError] = useState('');

  // Track Specific Filtered Trainers
  const trackTrainers = trainers.filter((t) => t.track === selectedTrack);

  // Extract all unique skills for the selected track
  const availableTrackSkills = Array.from(
    new Set(trackTrainers.flatMap((t) => t.skills || []))
  );

  const filteredTrainers = trackTrainers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(trainerSearchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(trainerSearchQuery.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(trainerSearchQuery.toLowerCase()));

    const matchesSkill =
      selectedSkillFilter === 'All' || t.skills.includes(selectedSkillFilter);

    return matchesSearch && matchesSkill;
  });

  const handleToggleTrainerSelect = (id: string) => {
    if (selectedTrainerIds.includes(id)) {
      setSelectedTrainerIds(selectedTrainerIds.filter((tId) => tId !== id));
    } else {
      setSelectedTrainerIds([...selectedTrainerIds, id]);
    }
  };

  const handleTrackSelect = (track: TrainerTrack) => {
    setSelectedTrack(track);
    setSelectedSkillFilter('All');
    const newTrackTrainers = trainers.filter((t) => t.track === track);
    if (newTrackTrainers.length > 0) {
      setSelectedTrainerIds([newTrackTrainers[0].id]);
    } else {
      setSelectedTrainerIds([]);
    }
  };

  const selectedTrainerObjects = trainers.filter((t) => selectedTrainerIds.includes(t.id));

  // Step Navigation Validation
  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!trainingName.trim()) {
        setError('Please enter a training program name.');
        return;
      }
      if (!topic.trim()) {
        setError('Please enter a topic or technology name.');
        return;
      }
      if (!preferredDate) {
        setError('Please select a preferred date.');
        return;
      }
    } else if (currentStep === 2) {
      if (selectedTrainerIds.length === 0) {
        setError('Please select at least one candidate trainer to receive availability requests.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit Training Plan
  const handleSubmitPlan = () => {
    if (selectedTrainerIds.length === 0) {
      setError('Please select at least one trainer.');
      return;
    }

    const finalType = trainingType === 'Other' ? customType || 'Custom Training' : trainingType;

    const newPlan = createTrainingPlan({
      name: trainingName,
      type: finalType,
      topic,
      description,
      track: selectedTrack,
      targetAudience,
      expectedParticipants,
      preferredDate,
      preferredTime,
      duration,
      priority,
      selectedTrainerIds: selectedTrainerIds,
    });

    if (onSuccess) onSuccess(newPlan);
    onClose();
  };

  const stepsList = [
    { num: 1, title: 'Details', subtitle: 'Program & Schedule' },
    { num: 2, title: 'Trainers', subtitle: 'Track & Candidates' },
    { num: 3, title: 'Requests', subtitle: 'Email Preview' },
  ];

  return (
    <div className="unified-modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 14 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="unified-modal-shell max-w-[840px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. HEADER BAR */}
        <div className="unified-modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 tracking-wider uppercase">
                TRAINING PROGRAM PLANNER
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                Plan New Training Session
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer border-0 outline-none"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. BODY GRID (STEPPER + CONTENT PANE) */}
        <div className="unified-modal-body-grid">
          {/* LEFT WORKFLOW STEPPER */}
          <div className="unified-left-stepper">
            {stepsList.map((step, idx) => {
              const stepNum = idx + 1;
              const isCompleted = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;

              return (
                <button
                  key={step.num}
                  type="button"
                  className={`stepper-item-row ${isCurrent ? 'active' : ''} ${
                    isCompleted ? 'completed' : ''
                  }`}
                  onClick={() => {
                    if (stepNum < currentStep) setCurrentStep(stepNum);
                  }}
                >
                  <div
                    className={`stepper-circle-badge ${
                      isCompleted ? 'completed' : isCurrent ? 'current' : 'future'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : stepNum}
                  </div>
                  <div className="stepper-text-block">
                    <span className="stepper-item-title">
                      {step.num} {step.title}
                    </span>
                    <span className="stepper-item-sub">{step.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT STEP CONTENT PANE */}
          <div className="unified-right-pane">
            {error && (
              <div className="modal-alert-banner error mb-4">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* STEP 1: TRAINING DETAILS */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="step-pane-wrapper"
                >
                  <div className="step-content-header">
                    <span className="step-num-pill">01</span>
                    <div>
                      <h3 className="step-title-text">Training Details</h3>
                      <p className="step-subtitle-text">
                        Specify the training program name, type, core technology topic, and preferred schedule.
                      </p>
                    </div>
                  </div>

                  <div className="common-form-grid">
                    <div className="form-field-group">
                      <label className="field-label">Training Name *</label>
                      <input
                        type="text"
                        className="common-form-control"
                        value={trainingName}
                        onChange={(e) => setTrainingName(e.target.value)}
                        placeholder="e.g. Knowledge Sharing Series, Informatica Training"
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Training Type *</label>
                      <select
                        className="common-form-control"
                        value={trainingType}
                        onChange={(e) => setTrainingType(e.target.value as TrainingType)}
                      >
                        <option value="Knowledge Sharing Series">Knowledge Sharing Series</option>
                        <option value="Technical Training">Technical Training</option>
                        <option value="Tool Training">Tool Training</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Upskilling Session">Upskilling Session</option>
                        <option value="Certification Preparation">Certification Preparation</option>
                        <option value="Internal Learning Session">Internal Learning Session</option>
                        <option value="Other">Custom Training Type</option>
                      </select>
                    </div>

                    {trainingType === 'Other' && (
                      <div className="form-field-group full-width">
                        <label className="field-label">Specify Custom Training Type</label>
                        <input
                          type="text"
                          className="common-form-control"
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                          placeholder="e.g. Executive Seminar"
                        />
                      </div>
                    )}

                    <div className="form-field-group full-width">
                      <label className="field-label">Topic / Technology *</label>
                      <input
                        type="text"
                        className="common-form-control"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Databricks Performance Optimization, Informatica PowerCenter"
                        required
                      />
                    </div>

                    <div className="form-field-group full-width">
                      <label className="field-label">Description / Objective</label>
                      <textarea
                        className="common-form-control textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Briefly describe the key concepts covered and learning outcomes..."
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Target Audience</label>
                      <input
                        type="text"
                        className="common-form-control"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g. Data Engineering Associates"
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Expected Participants</label>
                      <input
                        type="number"
                        className="common-form-control"
                        value={expectedParticipants}
                        onChange={(e) => setExpectedParticipants(Number(e.target.value))}
                        min={1}
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Preferred Date *</label>
                      <input
                        type="date"
                        className="common-form-control"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Preferred Time Slot</label>
                      <input
                        type="text"
                        className="common-form-control"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        placeholder="e.g. 15:00 - 16:00 or 10:00 AM"
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Duration *</label>
                      <select
                        className="common-form-control"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      >
                        <option value="1 Hour">1 Hour</option>
                        <option value="2 Hours">2 Hours</option>
                        <option value="3 Hours">3 Hours</option>
                        <option value="Half Day (4 Hours)">Half Day (4 Hours)</option>
                        <option value="Full Day (8 Hours)">Full Day (8 Hours)</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Priority</label>
                      <select
                        className="common-form-control"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SELECT TRACK AND TRAINER */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="step-pane-wrapper"
                >
                  <div className="step-content-header">
                    <span className="step-num-pill">02</span>
                    <div>
                      <h3 className="step-title-text">Select Track &amp; Potential Trainers</h3>
                      <p className="step-subtitle-text">
                        Choose the relevant track to view mapped internal trainers and select candidates for availability requests.
                      </p>
                    </div>
                  </div>

                  {/* TRACK SELECTION CARDS */}
                  <div className="track-selection-label">
                    Select Organizational Track *
                  </div>
                  <div className="track-cards-grid-3col">
                    <button
                      type="button"
                      className={`track-select-card ${selectedTrack === 'BA' ? 'active' : ''}`}
                      onClick={() => handleTrackSelect('BA')}
                    >
                      <div className="track-badge-icon ba">BA</div>
                      <div className="track-text-block">
                        <span className="track-name-title">Business Analyst</span>
                        <span className="track-code-sub">BA Track</span>
                      </div>
                      {selectedTrack === 'BA' && <CheckCircle2 size={16} className="track-check-icon" />}
                    </button>

                    <button
                      type="button"
                      className={`track-select-card ${selectedTrack === 'DE' ? 'active' : ''}`}
                      onClick={() => handleTrackSelect('DE')}
                    >
                      <div className="track-badge-icon de">DE</div>
                      <div className="track-text-block">
                        <span className="track-name-title">Data Engineering</span>
                        <span className="track-code-sub">DE Track</span>
                      </div>
                      {selectedTrack === 'DE' && <CheckCircle2 size={16} className="track-check-icon" />}
                    </button>

                    <button
                      type="button"
                      className={`track-select-card ${selectedTrack === 'Tools' ? 'active' : ''}`}
                      onClick={() => handleTrackSelect('Tools')}
                    >
                      <div className="track-badge-icon tools">Tools</div>
                      <div className="track-text-block">
                        <span className="track-name-title">Tools &amp; Platforms</span>
                        <span className="track-code-sub">Tools Track</span>
                      </div>
                      {selectedTrack === 'Tools' && <CheckCircle2 size={16} className="track-check-icon" />}
                    </button>
                  </div>

                  {/* TRAINER SEARCH & SKILL FILTERS BAR */}
                  <div className="trainer-filter-toolbar">
                    <div className="toolbar-search-input-wrap">
                      <Search size={14} className="search-icon" />
                      <input
                        type="text"
                        className="toolbar-search-input"
                        placeholder={`Search ${selectedTrack} trainers by name or skill...`}
                        value={trainerSearchQuery}
                        onChange={(e) => setTrainerSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="toolbar-skill-select-wrap">
                      <Filter size={13} className="filter-icon" />
                      <select
                        className="toolbar-skill-select"
                        value={selectedSkillFilter}
                        onChange={(e) => setSelectedSkillFilter(e.target.value)}
                      >
                        <option value="All">All {selectedTrack} Skills</option>
                        {availableTrackSkills.map((sk) => (
                          <option key={sk} value={sk}>
                            {sk}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* MAPPED TRAINERS GRID */}
                  <div className="available-trainers-heading">
                    <span>AVAILABLE TRAINER POOL ({filteredTrainers.length})</span>
                    <span className="selected-count-badge">
                      {selectedTrainerIds.length} Selected
                    </span>
                  </div>

                  <div className="trainer-pool-cards-grid">
                    {filteredTrainers.length === 0 ? (
                      <div className="empty-trainer-state">
                        <p>No trainers match the current search or skill filter.</p>
                      </div>
                    ) : (
                      filteredTrainers.map((trainer) => {
                        const isSelected = selectedTrainerIds.includes(trainer.id);

                        return (
                          <motion.div
                            key={trainer.id}
                            whileHover={{ y: -2 }}
                            className={`trainer-candidate-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleToggleTrainerSelect(trainer.id)}
                          >
                            <div className="candidate-card-header">
                              <div className="avatar-chip">{trainer.initials}</div>
                              <div className="candidate-meta">
                                <h4>{trainer.name}</h4>
                                <span className="emp-id">{trainer.employeeId}</span>
                              </div>
                              <div className="candidate-checkbox-badge">
                                {isSelected && <Check size={13} strokeWidth={3} />}
                              </div>
                            </div>

                            <div className="candidate-skills-chips">
                              {trainer.skills.slice(0, 3).map((sk) => (
                                <span key={sk} className="skill-chip">
                                  {sk}
                                </span>
                              ))}
                              {trainer.skills.length > 3 && (
                                <span className="skill-chip more">
                                  +{trainer.skills.length - 3}
                                </span>
                              )}
                            </div>

                            <div className="candidate-recent-subtext">
                              <strong>Recent:</strong> {trainer.recentSessions?.[0] || 'N/A'}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: AVAILABILITY REQUEST EMAIL PREVIEW */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="step-pane-wrapper"
                >
                  <div className="step-content-header">
                    <span className="step-num-pill">03</span>
                    <div>
                      <h3 className="step-title-text">Send Availability Request</h3>
                      <p className="step-subtitle-text">
                        Review and customize the automated email invitation template to be sent to selected candidate trainers.
                      </p>
                    </div>
                  </div>

                  {/* INTEGRATION READY NOTIFICATION BADGE */}
                  <div className="modal-alert-banner info mb-3">
                    <Sparkles size={16} />
                    <span>
                      <strong>Integration Ready:</strong> Email requests are dispatched via Corporate Outlook / Microsoft Graph API.
                    </span>
                  </div>

                  {/* EMAIL COMPOSER PREVIEW & EDIT MODE */}
                  <div className="email-composer-card">
                    <div className="composer-header-bar">
                      <div className="flex items-center gap-2">
                        <span className="composer-title-text">
                          TRAINER AVAILABILITY REQUEST EMAIL PREVIEW
                        </span>
                        {(customSubject || customIntroText || customSignoff) && (
                          <span className="px-2 py-0.5 rounded bg-teal-800 text-teal-200 text-[10px] font-bold">
                            Customized Template
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {(customSubject || customIntroText || customSignoff) && (
                          <button
                            type="button"
                            className="composer-edit-btn"
                            onClick={() => {
                              setCustomSubject('');
                              setCustomIntroText('');
                              setCustomSignoff('');
                            }}
                            title="Reset to default template"
                          >
                            <RotateCcw size={12} /> Reset
                          </button>
                        )}

                        <button
                          type="button"
                          className={`composer-edit-btn ${isEditingEmail ? 'active' : ''}`}
                          onClick={() => setIsEditingEmail(!isEditingEmail)}
                        >
                          {isEditingEmail ? (
                            <>
                              <Check size={13} /> Done Editing
                            </>
                          ) : (
                            <>
                              <Edit3 size={13} /> Edit Email Template
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="composer-meta-rows">
                      <div className="meta-row">
                        <span className="meta-key">RECIPIENTS</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedTrainerObjects.map((tr) => (
                            <span key={tr.id} className="meta-val-badge">
                              {tr.name} &lt;{tr.email}&gt;
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">SUBJECT</span>
                        {isEditingEmail ? (
                          <input
                            type="text"
                            className="meta-subject-input"
                            value={
                              customSubject !== ''
                                ? customSubject
                                : `Trainer Availability Request – ${trainingName} – ${topic}`
                            }
                            onChange={(e) => setCustomSubject(e.target.value)}
                            placeholder="Subject line..."
                          />
                        ) : (
                          <span className="meta-subject-text">
                            {customSubject || `Trainer Availability Request – ${trainingName} – ${topic}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="composer-message-body">
                      <div className="composer-mail-paper">
                        <p className="mail-salutation">Hi [Trainer Name],</p>

                        {isEditingEmail ? (
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Email Opening Message
                            </label>
                            <textarea
                              className="mail-edit-textarea"
                              value={
                                customIntroText !== ''
                                  ? customIntroText
                                  : 'The L&D Team is planning the following internal training session and would like to confirm your availability:'
                              }
                              onChange={(e) => setCustomIntroText(e.target.value)}
                              rows={2}
                            />
                          </div>
                        ) : (
                          <p className="mail-intro">
                            {customIntroText ||
                              'The L&D Team is planning the following internal training session and would like to confirm your availability:'}
                          </p>
                        )}

                        <div className="mail-session-table">
                          <div className="mail-table-row">
                            <span className="table-lbl">Training Program:</span>
                            <strong className="table-val">{trainingName}</strong>
                          </div>
                          <div className="mail-table-row">
                            <span className="table-lbl">Track / Topic:</span>
                            <span className="table-val">
                              {selectedTrack} — {topic}
                            </span>
                          </div>
                          <div className="mail-table-row">
                            <span className="table-lbl">Preferred Date:</span>
                            <span className="table-val">{preferredDate}</span>
                          </div>
                          <div className="mail-table-row">
                            <span className="table-lbl">Preferred Time:</span>
                            <span className="table-val">
                              {preferredTime} ({duration})
                            </span>
                          </div>
                          <div className="mail-table-row">
                            <span className="table-lbl">Target Audience:</span>
                            <span className="table-val">{targetAudience}</span>
                          </div>
                        </div>

                        <div className="mail-response-actions-demo mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            Trainer Response Options:
                          </span>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-300 dark:border-emerald-700">
                              [ Available ]
                            </span>
                            <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 text-xs font-semibold rounded-lg border border-rose-300 dark:border-rose-700">
                              [ Not Available ]
                            </span>
                          </div>
                        </div>

                        {isEditingEmail ? (
                          <div className="space-y-1 mt-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Email Sign-off Signature
                            </label>
                            <input
                              type="text"
                              className="mail-edit-input"
                              value={customSignoff !== '' ? customSignoff : 'L&D Operations Team'}
                              onChange={(e) => setCustomSignoff(e.target.value)}
                              placeholder="Signoff text..."
                            />
                          </div>
                        ) : (
                          <p className="mail-signoff mt-4">
                            Regards,
                            <br />
                            <strong>{customSignoff || 'L&D Operations Team'}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 3. FOOTER ACTIONS BAR */}
        <div className="unified-modal-footer">
          {currentStep > 1 ? (
            <button
              type="button"
              className="ui-button-secondary"
              onClick={handlePrevStep}
            >
              <ArrowLeft size={14} /> <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              className="ui-button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              className="ui-button-primary"
              onClick={handleNextStep}
            >
              <span>Continue</span> <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="ui-button-primary"
              onClick={handleSubmitPlan}
            >
              <Send size={14} />
              <span>Send Requests &amp; Save Plan</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
