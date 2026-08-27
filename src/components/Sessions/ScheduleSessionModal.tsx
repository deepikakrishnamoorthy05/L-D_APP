import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  Sparkles,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Mail,
  RefreshCw,
  Edit3,
  Send,
  Check,
} from 'lucide-react';
import { Session, EventType, LearningTrack } from '../../types/session';
import { useSessions } from '../../context/SessionContext';
import { useBootcamps } from '../../context/BootcampContext';

interface ScheduleSessionModalProps {
  initialData?: Session;
  onClose: () => void;
  onSuccess?: (session: Session) => void;
}

interface TrainerCardOption {
  id: string;
  name: string;
  role: string;
  initials: string;
  status: 'Available' | 'Conflict';
  conflictTime?: string;
}

import { getCentralTrainerDirectory } from '../../services/trainerService';

const getTrainerOptions = (): TrainerCardOption[] => {
  return getCentralTrainerDirectory().map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    initials: t.initials,
    status: 'Available',
  }));
};

export const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({
  initialData,
  onClose,
  onSuccess,
}) => {
  const { createSession, updateSession } = useSessions();
  const { bootcamps } = useBootcamps();

  const isEdit = Boolean(initialData);

  // Active Step State (1: Context & Slot, 2: Agenda, 3: Trainers, 4: AI Notification)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [sessionDate, setSessionDate] = useState(
    initialData?.sessionDate || '2026-01-25'
  );
  const [timeSlot, setTimeSlot] = useState(initialData?.timeSlot || 'FN');
  const [startTime, setStartTime] = useState(initialData?.startTime || '09:30');
  const [endTime, setEndTime] = useState(initialData?.endTime || '12:30');
  const [agenda, setAgenda] = useState(initialData?.agenda || 'Introduction to Relational Databases and SQL Fundamentals');
  const [description, setDescription] = useState(initialData?.notes || '');
  const [moduleName, setModuleName] = useState(initialData?.moduleName || 'SQL Fundamentals');
  const [eventType, setEventType] = useState<EventType>(initialData?.eventType || 'Training');
  const [bootcampId, setBootcampId] = useState(initialData?.bootcampId || bootcamps[0]?.id || 'bc-1');
  const [learningTrack, setLearningTrack] = useState<LearningTrack>(
    (initialData?.learningTrack as LearningTrack) || 'Common Foundation'
  );
  const [mode, setMode] = useState<'Online' | 'Classroom' | 'Hybrid'>(initialData?.mode || 'Classroom');
  const [meetingPlatform, setMeetingPlatform] = useState('Microsoft Teams');
  const [meetingLink, setMeetingLink] = useState(initialData?.meetingLink || '');
  const [location, setLocation] = useState(initialData?.location || 'Training Room 4B');

  // Trainer Assignment State
  const [primaryTrainer, setPrimaryTrainer] = useState<string>(initialData?.trainerName || 'Sneha');
  const [coordinatorName, setCoordinatorName] = useState(initialData?.coordinatorName || 'Priya Sharma');
  const [evaluatorName, setEvaluatorName] = useState(initialData?.evaluatorName || 'Dinesh Kumar');
  const [trainerConflictAlert, setTrainerConflictAlert] = useState<string | null>(null);

  // Step 4 AI Email Composer State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [customEmailBody, setCustomEmailBody] = useState<string | null>(null);

  const [error, setError] = useState('');

  const handleTrainerSelect = (t: TrainerCardOption) => {
    if (t.status === 'Conflict') {
      setTrainerConflictAlert(`${t.name} is already assigned to a session during ${t.conflictTime || 'this slot'}!`);
    } else {
      setTrainerConflictAlert(null);
    }
    setPrimaryTrainer(t.name);
  };

  // AI Email Draft Generator
  const handleRegenerateAI = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setIsGeneratingAI(false);
      setCustomEmailBody(null);
    }, 700);
  };

  const handleSaveAndExecute = (sendEmailNotification: boolean) => {
    setError('');

    if (!sessionDate) {
      setError('Session Date is required.');
      setCurrentStep(1);
      return;
    }
    if (!agenda.trim()) {
      setError('Session Agenda is required.');
      setCurrentStep(2);
      return;
    }

    const dateObj = new Date(sessionDate + 'T00:00:00');
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const selectedBootcamp = bootcamps.find((b) => b.id === bootcampId) || bootcamps[0];

    const payload: Partial<Session> = {
      sessionDate,
      dayOfWeek,
      timeSlot,
      durationText: '3 hrs',
      agenda: agenda.trim(),
      title: agenda.trim(),
      moduleName: moduleName.trim(),
      trainerName: primaryTrainer,
      coordinatorName: coordinatorName.trim(),
      evaluatorName: evaluatorName.trim(),
      eventType,
      learningTrack,
      mode,
      meetingLink,
      location,
      notes: description.trim(),
      bootcampId: selectedBootcamp.id,
      bootcampName: selectedBootcamp.name,
      startTime,
      endTime,
      notificationStatus: sendEmailNotification ? 'Sent' : 'Pending',
      notificationSentAt: sendEmailNotification ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    };

    let success = false;
    if (isEdit && initialData) {
      success = updateSession(initialData.id, payload);
    } else {
      success = createSession(payload);
    }

    if (success) {
      const createdSession: Session = {
        id: initialData?.id || 'cal-' + Date.now(),
        bootcampId: selectedBootcamp.id,
        bootcampName: selectedBootcamp.name,
        sessionDate,
        dayOfWeek,
        timeSlot,
        startTime,
        endTime,
        durationMinutes: 180,
        agenda: agenda.trim(),
        title: agenda.trim(),
        moduleId: 'm-1',
        moduleName: moduleName.trim(),
        trainerId: 'tr-1',
        trainerName: primaryTrainer,
        coordinatorName: coordinatorName.trim(),
        evaluatorName: evaluatorName.trim(),
        learningTrack,
        mode,
        meetingLink,
        location,
        status: 'Scheduled',
        eventType,
        attendanceApplicable: true,
        attendanceRecorded: false,
        attendedCount: 0,
        totalEnrolled: selectedBootcamp.traineesCount || 28,
        notificationStatus: sendEmailNotification ? 'Sent' : 'Pending',
        notificationSentAt: sendEmailNotification ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      if (onSuccess) {
        onSuccess(createdSession);
      } else {
        onClose();
      }
    }
  };

  const trainerOptions = getTrainerOptions();
  const selectedTrainerObj = trainerOptions.find((t) => t.name === primaryTrainer) || trainerOptions[0];
  const trainerEmail = selectedTrainerObj ? `${selectedTrainerObj.name.toLowerCase().replace(/\s+/g, '.')}@systechusa.com` : 'trainer@systechusa.com';

  const stepsList = [
    { num: '01', title: 'Context & Slot', subtitle: 'Bootcamp & Schedule' },
    { num: '02', title: 'Agenda & Details', subtitle: 'Topics & Delivery' },
    { num: '03', title: 'Trainer Assignment', subtitle: 'Trainer & Team' },
    { num: '04', title: 'AI Review', subtitle: 'Trainer Email' },
  ];

  return (
    <div className="unified-modal-backdrop" onClick={onClose}>
      <div className="unified-modal-shell schedule-session-modal" onClick={(e) => e.stopPropagation()}>
        {/* Subtle Ambient Radial Glows */}
        <div className="modal-ambient-glow glow-top-left" />
        <div className="modal-ambient-glow glow-bottom-right" />

        {/* 1. FIXED HEIGHT HEADER (86px) */}
        <div className="unified-modal-header">
          <div className="modal-header-left">
            <div className="modal-icon-badge">
              <Calendar size={22} className="text-teal-700" />
            </div>
            <div className="modal-title-block">
              <h2 className="modal-title-text">
                {isEdit ? 'Edit Training Session' : 'Schedule Training Session'}
              </h2>
              <p className="modal-subtitle-text">
                Configure learning context, schedule slot, trainer assignment &amp; notification.
              </p>
            </div>
          </div>

          <div className="modal-header-right">
            <span className="step-counter-badge">Step {currentStep} of 4</span>
            <button type="button" className="modal-close-btn" onClick={onClose} title="Close Modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. BODY GRID (LEFT STEPPER 190px + RIGHT CONTENT PANE) */}
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
                  className={`stepper-item-row ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(stepNum)}
                >
                  <div className={`stepper-circle-badge ${isCompleted ? 'completed' : isCurrent ? 'current' : 'future'}`}>
                    {isCompleted ? <Check size={14} /> : stepNum}
                  </div>
                  <div className="stepper-text-block">
                    <span className="stepper-item-title">{step.num} {step.title}</span>
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
              {/* STEP 01: LEARNING CONTEXT & SCHEDULE SLOT */}
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
                      <h3 className="step-title-text">Learning Context &amp; Schedule Slot</h3>
                      <p className="step-subtitle-text">Select bootcamp cohort, track, module topic and time slot.</p>
                    </div>
                  </div>

                  <div className="common-form-grid">
                    <div className="form-field-group">
                      <label className="field-label">Bootcamp Cohort *</label>
                      <select
                        className="common-form-control"
                        value={bootcampId}
                        onChange={(e) => setBootcampId(e.target.value)}
                      >
                        {bootcamps.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Learning Track *</label>
                      <select
                        className="common-form-control"
                        value={learningTrack}
                        onChange={(e) => setLearningTrack(e.target.value as LearningTrack)}
                      >
                        <option value="Common Foundation">Common Foundation</option>
                        <option value="DBT & Snowflake">dbt &amp; Snowflake</option>
                        <option value="Databricks">Databricks</option>
                        <option value="Shared">Shared</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Module / Topic Name *</label>
                      <input
                        type="text"
                        className="common-form-control"
                        value={moduleName}
                        onChange={(e) => setModuleName(e.target.value)}
                        placeholder="e.g. SQL Fundamentals"
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Event Type *</label>
                      <select
                        className="common-form-control"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as EventType)}
                      >
                        <option value="Training">Training</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Assessment">Assessment</option>
                        <option value="Mock Test">Mock Test</option>
                        <option value="HR Event">HR Event</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Project">Project</option>
                        <option value="Certification">Certification</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Session Date *</label>
                      <input
                        type="date"
                        className="common-form-control"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Time Slot Preset</label>
                      <select
                        className="common-form-control"
                        value={timeSlot}
                        onChange={(e) => {
                          setTimeSlot(e.target.value);
                          if (e.target.value === 'FN') {
                            setStartTime('09:30');
                            setEndTime('12:30');
                          } else if (e.target.value === 'AN') {
                            setStartTime('14:00');
                            setEndTime('17:00');
                          }
                        }}
                      >
                        <option value="FN">FN (09:30 AM – 12:30 PM)</option>
                        <option value="AN">AN (02:00 PM – 05:00 PM)</option>
                        <option value="Custom">Custom Slot</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Start Time *</label>
                      <input
                        type="time"
                        className="common-form-control"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">End Time *</label>
                      <input
                        type="time"
                        className="common-form-control"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 02: AGENDA & DELIVERY DETAILS */}
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
                      <h3 className="step-title-text">Session Agenda &amp; Delivery</h3>
                      <p className="step-subtitle-text">Define session title, detailed syllabus notes and delivery mode.</p>
                    </div>
                  </div>

                  <div className="common-form-grid">
                    <div className="form-field-group full-width">
                      <label className="field-label">Session Agenda / Title *</label>
                      <input
                        type="text"
                        className="common-form-control"
                        value={agenda}
                        onChange={(e) => setAgenda(e.target.value)}
                        placeholder="e.g. Introduction to Relational Databases and SQL Fundamentals"
                        required
                      />
                    </div>

                    <div className="form-field-group full-width">
                      <label className="field-label">Detailed Description / Notes</label>
                      <textarea
                        className="common-form-control textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter key concepts, prerequisites, capstone alignment notes..."
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Delivery Mode *</label>
                      <select
                        className="common-form-control"
                        value={mode}
                        onChange={(e) => setMode(e.target.value as any)}
                      >
                        <option value="Classroom">Classroom</option>
                        <option value="Online">Online Virtual Class</option>
                        <option value="Hybrid">Hybrid Delivery</option>
                      </select>
                    </div>

                    {mode !== 'Classroom' ? (
                      <div className="form-field-group">
                        <label className="field-label">Meeting Platform &amp; Link</label>
                        <input
                          type="text"
                          className="common-form-control"
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          placeholder="https://teams.microsoft.com/l/meetup-join/..."
                        />
                      </div>
                    ) : (
                      <div className="form-field-group">
                        <label className="field-label">Training Room / Location</label>
                        <input
                          type="text"
                          className="common-form-control"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Training Room 4B"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 03: TRAINER & TEAM ASSIGNMENT */}
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
                      <h3 className="step-title-text">Trainer &amp; Team Assignment</h3>
                      <p className="step-subtitle-text">Choose a trainer. Availability is validated against the selected session schedule.</p>
                    </div>
                  </div>

                  {trainerConflictAlert && (
                    <div className="modal-alert-banner warning mb-3">
                      <AlertTriangle size={16} /> <span>{trainerConflictAlert}</span>
                    </div>
                  )}

                  {/* 3-COLUMN TRAINER CARDS GRID */}
                  <div className="trainer-cards-3col-grid">
                    {getTrainerOptions().map((t) => {
                      const isSelected = primaryTrainer === t.name;
                      const isConflict = t.status === 'Conflict';

                      return (
                        <motion.div
                          key={t.id}
                          whileHover={{ y: -2 }}
                          animate={isSelected ? { scale: 1.015 } : { scale: 1 }}
                          className={`trainer-card-shell ${isSelected ? 'selected' : ''} ${isConflict ? 'conflict' : ''}`}
                          onClick={() => handleTrainerSelect(t)}
                        >
                          <div className="trainer-card-top">
                            <div className="trainer-avatar-circle">{t.initials}</div>
                            {isConflict ? (
                              <span className="trainer-status-chip conflict">
                                <AlertTriangle size={11} /> Conflict
                              </span>
                            ) : (
                              <span className="trainer-status-chip available">
                                <CheckCircle2 size={11} /> Available
                              </span>
                            )}
                          </div>

                          <div className="trainer-card-body">
                            <h4 className="trainer-name-text">{t.name}</h4>
                            <p className="trainer-role-text">{t.role}</p>

                            {isConflict && t.conflictTime && (
                              <div className="conflict-time-subtext">
                                Existing session: {t.conflictTime}
                              </div>
                            )}
                          </div>

                          <div className="trainer-card-footer">
                            <span className="candidate-label">
                              {isSelected ? '✓ Selected Primary Trainer' : 'Primary Trainer Candidate'}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* TEAM ASSIGNMENT FIELDS */}
                  <div className="common-form-grid mt-4">
                    <div className="form-field-group">
                      <label className="field-label">L&amp;D Coordinator</label>
                      <select
                        className="common-form-control"
                        value={coordinatorName}
                        onChange={(e) => setCoordinatorName(e.target.value)}
                      >
                        <option value="Priya Sharma">Priya Sharma</option>
                        <option value="Rohan Verma">Rohan Verma</option>
                        <option value="Ananya Roy">Ananya Roy</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-label">Module Evaluator</label>
                      <select
                        className="common-form-control"
                        value={evaluatorName}
                        onChange={(e) => setEvaluatorName(e.target.value)}
                      >
                        <option value="Dinesh Kumar">Dinesh Kumar</option>
                        <option value="Kavita Reddy">Kavita Reddy</option>
                        <option value="Siddharth Rao">Siddharth Rao</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 04: AI TRAINER NOTIFICATION EMAIL COMPOSER PREVIEW */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="step-pane-wrapper"
                >
                  <div className="step-content-header">
                    <span className="step-num-pill">04</span>
                    <div>
                      <h3 className="step-title-text">AI Trainer Notification</h3>
                      <p className="step-subtitle-text">Review and confirm automated AI communication for the assigned trainer.</p>
                    </div>
                  </div>

                  {/* EMAIL COMPOSER PREVIEW SHELL */}
                  <div className="email-composer-card">
                    {/* Composer Header */}
                    <div className="composer-header-bar">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-teal-600" />
                        <span className="composer-title-text">✨ AI TRAINER NOTIFICATION</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="composer-action-btn"
                          onClick={handleRegenerateAI}
                          disabled={isGeneratingAI}
                        >
                          <RefreshCw size={12} className={isGeneratingAI ? 'animate-spin' : ''} />
                          <span>Regenerate with AI</span>
                        </button>
                        <button
                          type="button"
                          className="composer-action-btn"
                          onClick={() => setIsEditingDraft(!isEditingDraft)}
                        >
                          <Edit3 size={12} />
                          <span>{isEditingDraft ? 'Done Editing' : 'Edit Draft'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Composer Meta Header */}
                    <div className="composer-meta-rows">
                      <div className="meta-row">
                        <span className="meta-key">TO</span>
                        <div className="meta-val-badge">
                          <strong>{primaryTrainer}</strong> &lt;{trainerEmail}&gt;
                        </div>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">CC</span>
                        <div className="meta-val-badge">
                          <strong>{coordinatorName}</strong> &lt;{coordinatorName.toLowerCase().replace(/\s+/g, '.')}@systechusa.com&gt;
                        </div>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">SUBJECT</span>
                        <span className="meta-subject-text">
                          L&amp;D Training Assignment — {moduleName}
                        </span>
                      </div>
                    </div>

                    {/* Composer Message Body */}
                    <div className="composer-message-body">
                      {isGeneratingAI ? (
                        <div className="ai-shimmer-loader-box">
                          <div className="shimmer-line line-1" />
                          <div className="shimmer-line line-2" />
                          <div className="shimmer-line line-3" />
                          <span className="shimmer-label">Generating trainer communication...</span>
                        </div>
                      ) : isEditingDraft ? (
                        <textarea
                          className="composer-editable-textarea"
                          value={customEmailBody || `Hello ${primaryTrainer},

You have been scheduled to conduct the following bootcamp training session:

• Session: ${agenda || moduleName}
• Date: ${sessionDate}
• Time: ${startTime} – ${endTime}
• Delivery Mode: ${mode}
• Location/Room: ${location || meetingLink || 'Training Room 4B'}

Please review the curriculum details and confirm your availability.

Regards,
L&D Operations Team`}
                          onChange={(e) => setCustomEmailBody(e.target.value)}
                        />
                      ) : (
                        <div className="composer-mail-paper">
                          <p className="mail-salutation">Hello {primaryTrainer},</p>
                          <p className="mail-intro">You have been scheduled to conduct the following bootcamp training session:</p>

                          <div className="mail-session-table">
                            <div className="mail-table-row">
                              <span className="table-lbl">Session Topic:</span>
                              <strong className="table-val">{agenda || moduleName}</strong>
                            </div>
                            <div className="mail-table-row">
                              <span className="table-lbl">Date &amp; Slot:</span>
                              <span className="table-val">{sessionDate} ({startTime} – {endTime})</span>
                            </div>
                            <div className="mail-table-row">
                              <span className="table-lbl">Delivery Mode:</span>
                              <span className="table-val">{mode}</span>
                            </div>
                            <div className="mail-table-row">
                              <span className="table-lbl">Venue / Link:</span>
                              <span className="table-val">{location || meetingLink || 'Training Room 4B'}</span>
                            </div>
                          </div>

                          <p className="mail-outro">Please review the curriculum details in your trainer portal.</p>
                          <p className="mail-signoff">Regards,<br /><strong>L&amp;D Operations Team</strong></p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 3. COMMON FOOTER (FIXED HEIGHT 72px) */}
        <div className="unified-modal-footer">
          <div className="footer-left">
            <button type="button" className="ui-button-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>

          <div className="footer-right">
            {currentStep > 1 && (
              <button
                type="button"
                className="ui-button-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                className="ui-button-primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="ui-button-secondary ml-2"
                  onClick={() => handleSaveAndExecute(false)}
                >
                  Schedule Only
                </button>
                <button
                  type="button"
                  className="ui-button-primary ml-2"
                  onClick={() => handleSaveAndExecute(true)}
                >
                  <Send size={14} /> Schedule &amp; Send
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
