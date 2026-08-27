import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  User,
  BookOpen,
  Calendar,
  Star,
  Brain,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Search,
  Check,
  AlertTriangle,
  Award,
  Layers,
  MessageSquare,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { useBootcamps } from '../../context/BootcampContext';
import { useTrainees } from '../../context/TraineeContext';
import { FeedbackRecord } from '../../types/feedback';

interface AddTrainerFeedbackModalProps {
  onClose: () => void;
}

const TRAINER_LIST = [
  { id: 'trainer-1', name: 'Sneha', role: 'SQL & Database Architecture Lead', empId: 'EMP101' },
  { id: 'trainer-2', name: 'Sarah David', role: 'Python & Data Science Lead', empId: 'EMP102' },
  { id: 'trainer-3', name: 'John Mathew', role: 'dbt & Snowflake Specialist', empId: 'EMP103' },
  { id: 'trainer-4', name: 'Alex Thomas', role: 'Databricks & PySpark Lead', empId: 'EMP104' },
  { id: 'trainer-5', name: 'Dinesh Kumar', role: 'Data Warehouse Modeling Lead', empId: 'EMP105' },
];

export const AddTrainerFeedbackModal: React.FC<AddTrainerFeedbackModalProps> = ({ onClose }) => {
  const { addFeedback } = useFeedback();
  const { bootcamps } = useBootcamps();
  const { trainees } = useTrainees();

  // Active Wizard Step (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Success State
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedRecord, setSavedRecord] = useState<FeedbackRecord | null>(null);

  // Trainee search state
  const [traineeSearch, setTraineeSearch] = useState('');
  const [showTraineeDropdown, setShowTraineeDropdown] = useState(false);

  // Form Field State
  const [selectedTraineeId, setSelectedTraineeId] = useState(trainees[0]?.id || 'te-1');
  const selectedTrainee = trainees.find((t) => t.id === selectedTraineeId) || trainees[0];

  const [selectedTrainerId, setSelectedTrainerId] = useState(TRAINER_LIST[1].id);
  const selectedTrainer = TRAINER_LIST.find((t) => t.id === selectedTrainerId) || TRAINER_LIST[1];

  const [selectedBootcampId, setSelectedBootcampId] = useState(
    selectedTrainee?.bootcampId || bootcamps[0]?.id || 'bc-1'
  );
  const selectedBootcamp = bootcamps.find((b) => b.id === selectedBootcampId) || bootcamps[0];

  const [selectedModule, setSelectedModule] = useState(
    (selectedBootcamp as any)?.modules?.[0]?.title || 'Python Core & OOP'
  );
  const [sessionTopic, setSessionTopic] = useState('Session 04 — OOP Concepts & Methods');
  const [feedbackDate, setFeedbackDate] = useState(new Date().toISOString().split('T')[0]);

  // Ratings (1 to 5)
  const [technicalRating, setTechnicalRating] = useState(4);
  const [participationRating, setParticipationRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(4);
  const [problemSolvingRating, setProblemSolvingRating] = useState(3);
  const [practicalApplicationRating, setPracticalApplicationRating] = useState(4);
  const [learningAttitudeRating, setLearningAttitudeRating] = useState(5);
  const [overallRating, setOverallRating] = useState(4.2);

  // Comments
  const [strengthComments, setStrengthComments] = useState(
    'Demonstrates strong understanding of Python core concepts and actively engages during interactive coding sessions.'
  );
  const [improvementComments, setImprovementComments] = useState(
    'Needs additional practice with complex algorithm optimization and exception handling under timed exercises.'
  );
  const [generalComments, setGeneralComments] = useState(
    'Trainee displays a positive learning attitude and consistent commitment to coursework.'
  );
  const [recommendedFocus, setRecommendedFocus] = useState(
    'Provide additional hands-on exercises for object-oriented programming patterns before track allocation.'
  );

  // AI Analysis state on Step 4
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [aiGeneratedSummary, setAiGeneratedSummary] = useState<string | null>(null);

  // Dependent Filtering when Trainee Changes
  const handleTraineeSelect = (traineeId: string) => {
    setSelectedTraineeId(traineeId);
    setShowTraineeDropdown(false);
    const traineeObj = trainees.find((t) => t.id === traineeId);
    if (traineeObj && traineeObj.bootcampId) {
      setSelectedBootcampId(traineeObj.bootcampId);
      const matchedBc = bootcamps.find((b) => b.id === traineeObj.bootcampId);
      if (matchedBc && (matchedBc as any).modules && (matchedBc as any).modules.length > 0) {
        setSelectedModule((matchedBc as any).modules[0].title);
      }
    }
  };

  // Helper for initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Rating Meaning Labels
  const RATING_LABELS: Record<number, string> = {
    1: 'Needs Improvement',
    2: 'Developing',
    3: 'Meets Expectations',
    4: 'Strong',
    5: 'Excellent',
  };

  // Rating Segment Selector
  const renderRatingSegments = (
    value: number,
    onChange: (val: number) => void
  ) => {
    return (
      <div className="fbm-rating-segment-group">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            className={`fbm-rating-btn-1to5 ${value === num ? 'selected' : ''}`}
            onClick={() => onChange(num)}
          >
            {num}
          </button>
        ))}
        <span className="fbm-rating-meaning-label">
          {value} / 5 ({RATING_LABELS[value]})
        </span>
      </div>
    );
  };

  // Run AI Analysis mock trigger
  const handleRunAiAnalysis = () => {
    setIsAiRunning(true);
    setTimeout(() => {
      setIsAiRunning(false);
      setAiGeneratedSummary(
        `AI Summary: ${selectedTrainee?.name || 'Trainee'} shows high engagement (${participationRating}/5) and strong technical fundamentals (${technicalRating}/5). Key development area: independent problem solving (${problemSolvingRating}/5).`
      );
    }, 1200);
  };

  // Final Submit Handler
  const handleSaveFeedback = (status: 'Approved' | 'Published' | 'Needs Review') => {
    const recordPayload: Partial<FeedbackRecord> = {
      traineeId: selectedTraineeId,
      traineeName: selectedTrainee?.name || 'Kaviram Sudharajanainar Paramasivan',
      employeeId: selectedTrainee?.employeeId || 'EMP001',
      trainerId: selectedTrainerId,
      trainerName: selectedTrainer.name,
      trainerRole: selectedTrainer.role,
      bootcampId: selectedBootcampId,
      bootcampName: selectedBootcamp?.name || 'Python Data Engineering',
      bootcampCode: selectedBootcamp?.code || 'DE-B-2026-B02',
      moduleId: 'mod-' + Date.now(),
      moduleName: selectedModule,
      sessionTitle: sessionTopic,
      track: (selectedBootcamp as any)?.category || 'Common Foundation',
      feedbackDate: feedbackDate,
      technicalRating,
      participationRating,
      communicationRating,
      problemSolvingRating,
      practicalApplicationRating,
      learningAttitudeRating,
      overallRating: Number(overallRating),
      strengthComments,
      improvementComments,
      generalComments,
      aiSummary:
        aiGeneratedSummary ||
        'Strong technical core with active classroom engagement. Focus on algorithmic problem solving.',
      aiStrengths: ['Python Fundamentals', 'Classroom Engagement', 'Code Structure'],
      aiImprovementAreas: ['Algorithm Optimization', 'Timed Exercises'],
      insightBadgeType: 'Strength',
      status: status,
      source: 'MANUAL',
    };

    addFeedback(recordPayload);
    setSavedRecord(recordPayload as FeedbackRecord);
    setIsSuccess(true);
  };

  const filteredTrainees = trainees.filter(
    (t) =>
      t.name.toLowerCase().includes(traineeSearch.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(traineeSearch.toLowerCase())
  );

  return (
    <div className="fbm-modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.18 }}
        className="fbm-add-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER (~88px HEIGHT) */}
        <div className="fbm-modal-header">
          <div className="fbm-header-left-group">
            <div className="fbm-header-icon-tile">
              <MessageSquare size={22} />
            </div>
            <div className="fbm-header-title-block">
              <span className="fbm-header-tag">L&amp;D ADMIN ENTRY</span>
              <h2 className="fbm-header-main-title">Add Trainer Feedback</h2>
              <p className="fbm-header-subtitle">
                Record trainer observations, ratings and development feedback for a trainee.
              </p>
            </div>
          </div>

          <div className="fbm-header-right-group">
            <span className="fbm-step-indicator-pill">Step {currentStep} of 4</span>
            <button
              type="button"
              className="fbm-modal-close-btn"
              onClick={onClose}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MODAL BODY (GRID: 210px STEPPER + FLEX FORM) */}
        {!isSuccess ? (
          <div className="fbm-modal-body-layout">
            {/* LEFT 210px STEPPER */}
            <aside className="fbm-stepper-sidebar">
              <nav className="fbm-stepper-list">
                {[
                  { step: 1, title: 'Trainee & Training', desc: 'Context & learning' },
                  { step: 2, title: 'Trainer Ratings', desc: 'Evaluation' },
                  { step: 3, title: 'Trainer Comments', desc: 'Observations' },
                  { step: 4, title: 'Review & Save', desc: 'Confirmation' },
                ].map((item) => {
                  const isDone = currentStep > item.step;
                  const isCurrent = currentStep === item.step;

                  return (
                    <button
                      key={item.step}
                      type="button"
                      className={`fbm-step-item-btn ${
                        isCurrent ? 'active' : isDone ? 'completed' : ''
                      }`}
                      onClick={() => setCurrentStep(item.step)}
                    >
                      <div className="fbm-step-number-circle">
                        {isDone ? <Check size={16} /> : `0${item.step}`}
                      </div>
                      <div className="fbm-step-text-stack">
                        <span className="fbm-step-title">{item.title}</span>
                        <span className="fbm-step-desc">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* ADMIN AUTHORITATIVE NOTE CARD */}
              <div className="fbm-admin-note-card">
                <div className="fbm-admin-note-title">
                  <ShieldCheck size={14} /> Human Authoritative
                </div>
                <div className="fbm-admin-note-text">
                  Trainer ratings are entered and verified by L&amp;D. AI only summarizes written feedback and never changes ratings.
                </div>
              </div>
            </aside>

            {/* RIGHT FORM CONTENT AREA */}
            <main className="fbm-form-content-area">
              {/* STEP 01: TRAINEE & TRAINING CONTEXT */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-5"
                >
                  <div className="fbm-section-header">
                    <h3 className="fbm-section-title">01 Trainee &amp; Training Context</h3>
                    <p className="fbm-section-subtitle">
                      Identify who received the feedback and which learning activity the feedback belongs to.
                    </p>
                  </div>

                  <div className="fbm-form-grid-2col">
                    {/* Trainee Selector */}
                    <div className="fbm-field-group relative">
                      <label className="fbm-field-label">Trainee *</label>
                      <div
                        className="fbm-trainee-card-selector"
                        onClick={() => setShowTraineeDropdown(!showTraineeDropdown)}
                      >
                        <div className="fbm-trainee-info-inline">
                          <div className="fbm-trainee-avatar-32px">
                            {getInitials(selectedTrainee?.name || 'Kaviram Sudharajanainar Paramasivan')}
                          </div>
                          <div className="fbm-trainee-name-block">
                            <span className="fbm-trainee-name">{selectedTrainee?.name}</span>
                            <span className="fbm-trainee-meta-sub">
                              {selectedTrainee?.employeeId} • {selectedTrainee?.bootcampName}
                            </span>
                          </div>
                        </div>
                        <Search size={14} className="text-slate-400" />
                      </div>

                      {showTraineeDropdown && (
                        <div className="absolute left-0 right-0 top-[76px] bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-52 overflow-y-auto p-2">
                          <input
                            type="text"
                            className="fbm-control-input mb-2 h-9 text-xs"
                            placeholder="Search trainee name or ID..."
                            value={traineeSearch}
                            onChange={(e) => setTraineeSearch(e.target.value)}
                          />
                          {filteredTrainees.map((t) => (
                            <div
                              key={t.id}
                              className="p-2 hover:bg-teal-50 rounded-lg cursor-pointer flex items-center justify-between"
                              onClick={() => handleTraineeSelect(t.id)}
                            >
                              <span className="text-xs font-bold text-slate-800">
                                {t.name} ({t.employeeId})
                              </span>
                              <span className="text-[10px] text-teal-700 font-semibold">{t.bootcampName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Trainer Selector */}
                    <div className="fbm-field-group">
                      <label className="fbm-field-label">Trainer *</label>
                      <select
                        className="fbm-control-select"
                        value={selectedTrainerId}
                        onChange={(e) => setSelectedTrainerId(e.target.value)}
                      >
                        {TRAINER_LIST.map((tr) => (
                          <option key={tr.id} value={tr.id}>
                            {tr.name} ({tr.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bootcamp Selector */}
                    <div className="fbm-field-group">
                      <label className="fbm-field-label">Bootcamp *</label>
                      <select
                        className="fbm-control-select"
                        value={selectedBootcampId}
                        onChange={(e) => setSelectedBootcampId(e.target.value)}
                      >
                        {bootcamps.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Module Selector */}
                    <div className="fbm-field-group">
                      <label className="fbm-field-label">Module *</label>
                      <select
                        className="fbm-control-select"
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                      >
                        <option value="Python Core & OOP">Python Core &amp; OOP</option>
                        <option value="SQL Fundamentals & T-SQL">SQL Fundamentals &amp; T-SQL</option>
                        <option value="dbt Core Transformation">dbt Core Transformation</option>
                        <option value="PySpark & Delta Lake">PySpark &amp; Delta Lake</option>
                        <option value="Data Warehouse Modeling">Data Warehouse Modeling</option>
                      </select>
                    </div>

                    {/* Session / Topic */}
                    <div className="fbm-field-group">
                      <label className="fbm-field-label">Session / Topic</label>
                      <input
                        type="text"
                        className="fbm-control-input"
                        value={sessionTopic}
                        onChange={(e) => setSessionTopic(e.target.value)}
                      />
                    </div>

                    {/* Feedback Date */}
                    <div className="fbm-field-group">
                      <label className="fbm-field-label">Feedback Date *</label>
                      <input
                        type="date"
                        className="fbm-control-input"
                        value={feedbackDate}
                        onChange={(e) => setFeedbackDate(e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 02: TRAINER RATINGS */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-5"
                >
                  <div className="fbm-section-header">
                    <h3 className="fbm-section-title">02 Trainer Ratings</h3>
                    <p className="fbm-section-subtitle">
                      Record the trainer&apos;s original evaluation. Values are authoritative human-entered ratings.
                    </p>
                  </div>

                  <div className="fbm-ratings-layout-grid">
                    {/* LEFT: 6 CATEGORIES */}
                    <div className="fbm-ratings-categories-card">
                      <div className="fbm-rating-row-item">
                        <span className="fbm-field-label">Technical Knowledge *</span>
                        {renderRatingSegments(technicalRating, setTechnicalRating)}
                      </div>

                      <div className="fbm-rating-row-item">
                        <span className="fbm-field-label">Participation *</span>
                        {renderRatingSegments(participationRating, setParticipationRating)}
                      </div>

                      <div className="fbm-rating-row-item">
                        <span className="fbm-field-label">Communication *</span>
                        {renderRatingSegments(communicationRating, setCommunicationRating)}
                      </div>

                      <div className="fbm-rating-row-item">
                        <span className="fbm-field-label">Problem Solving *</span>
                        {renderRatingSegments(problemSolvingRating, setProblemSolvingRating)}
                      </div>

                      <div className="fbm-rating-row-item">
                        <span className="fbm-field-label">Practical Application *</span>
                        {renderRatingSegments(practicalApplicationRating, setPracticalApplicationRating)}
                      </div>

                      <div className="fbm-rating-row-item">
                        <span className="fbm-field-label">Learning Attitude *</span>
                        {renderRatingSegments(learningAttitudeRating, setLearningAttitudeRating)}
                      </div>
                    </div>

                    {/* RIGHT: LIVE SUMMARY */}
                    <div className="fbm-rating-summary-darkbox">
                      <div>
                        <span className="text-[11px] font-bold text-teal-300 tracking-wider uppercase">RATING SUMMARY</span>
                        <div className="fbm-summary-score-large">
                          {overallRating.toFixed(1)} <span className="text-sm font-normal text-teal-200">/ 5</span>
                        </div>
                        <span className="text-xs text-teal-200 block">Overall Evaluated Mark</span>
                      </div>

                      <div className="flex flex-col gap-2 my-4 text-xs text-teal-100 border-t border-b border-teal-800/80 py-3">
                        <div className="flex justify-between"><span>Technical:</span> <strong>{technicalRating} / 5</strong></div>
                        <div className="flex justify-between"><span>Participation:</span> <strong>{participationRating} / 5</strong></div>
                        <div className="flex justify-between"><span>Communication:</span> <strong>{communicationRating} / 5</strong></div>
                        <div className="flex justify-between"><span>Problem Solving:</span> <strong>{problemSolvingRating} / 5</strong></div>
                        <div className="flex justify-between"><span>Practical:</span> <strong>{practicalApplicationRating} / 5</strong></div>
                        <div className="flex justify-between"><span>Attitude:</span> <strong>{learningAttitudeRating} / 5</strong></div>
                      </div>

                      <div>
                        <label className="text-[11px] text-teal-200 block mb-1">Overall Override Rating</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          className="fbm-control-input text-white bg-teal-800/80 border-teal-700 h-9"
                          value={overallRating}
                          onChange={(e) => setOverallRating(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 03: TRAINER COMMENTS */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-5"
                >
                  <div className="fbm-section-header">
                    <h3 className="fbm-section-title">03 Trainer Comments &amp; Observations</h3>
                    <p className="fbm-section-subtitle">
                      Capture qualitative observations, strengths and improvement areas provided by the trainer.
                    </p>
                  </div>

                  <div className="fbm-form-grid-2col">
                    <div className="fbm-field-group">
                      <label className="fbm-field-label text-emerald-800">Strengths / Positive Observations</label>
                      <textarea
                        className="fbm-control-textarea"
                        value={strengthComments}
                        onChange={(e) => setStrengthComments(e.target.value)}
                        placeholder="e.g. Demonstrates strong understanding of SQL fundamentals..."
                      />
                    </div>

                    <div className="fbm-field-group">
                      <label className="fbm-field-label text-rose-800">Areas for Improvement</label>
                      <textarea
                        className="fbm-control-textarea"
                        value={improvementComments}
                        onChange={(e) => setImprovementComments(e.target.value)}
                        placeholder="e.g. Struggles with complex window functions and CTEs..."
                      />
                    </div>
                  </div>

                  <div className="fbm-field-group">
                    <label className="fbm-field-label">General Trainer Feedback</label>
                    <textarea
                      className="fbm-control-textarea"
                      value={generalComments}
                      onChange={(e) => setGeneralComments(e.target.value)}
                    />
                  </div>

                  <div className="fbm-field-group">
                    <label className="fbm-field-label text-teal-800">Recommended Development Focus</label>
                    <textarea
                      className="fbm-control-textarea"
                      value={recommendedFocus}
                      onChange={(e) => setRecommendedFocus(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 04: REVIEW & SAVE */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-5"
                >
                  <div className="fbm-section-header">
                    <h3 className="fbm-section-title">04 Review Trainer Feedback</h3>
                    <p className="fbm-section-subtitle">
                      Verify ratings and qualitative comments before finalizing and publishing.
                    </p>
                  </div>

                  <div className="fbm-form-grid-2col">
                    {/* LEFT CARD: TRAINEE CARD */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                      <span className="text-[11px] font-bold text-teal-700 block uppercase">TRAINEE &amp; TRAINING</span>
                      <div className="flex items-center gap-3">
                        <div className="fbm-trainee-avatar-32px w-10 h-10 text-sm">
                          {getInitials(selectedTrainee?.name || 'Kaviram Sudharajanainar Paramasivan')}
                        </div>
                        <div>
                          <strong className="text-sm font-bold text-slate-900 block">{selectedTrainee?.name}</strong>
                          <span className="text-xs text-slate-500">{selectedTrainee?.employeeId}</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-col gap-1 border-t border-slate-100 pt-2">
                        <div><strong>Bootcamp:</strong> {selectedBootcamp?.name}</div>
                        <div><strong>Module:</strong> {selectedModule}</div>
                        <div><strong>Trainer:</strong> {selectedTrainer.name}</div>
                      </div>
                    </div>

                    {/* RIGHT CARD: OVERALL RATING */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-amber-700 block uppercase">OVERALL RATING</span>
                        <div className="text-3xl font-black text-slate-900 mt-1">
                          {overallRating.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 5</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2">
                        <span>Technical: <strong>{technicalRating}/5</strong></span>
                        <span>Participation: <strong>{participationRating}/5</strong></span>
                        <span>Communication: <strong>{communicationRating}/5</strong></span>
                        <span>Problem Solving: <strong>{problemSolvingRating}/5</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* AI FEEDBACK ANALYSIS SECTION */}
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Brain size={16} className="text-teal-700" />
                        <h4 className="text-xs font-bold text-slate-900 m-0">AI Feedback Analysis Boundary</h4>
                      </div>
                      <button
                        type="button"
                        className="fbm-footer-action-btn h-8 px-3 text-xs"
                        onClick={handleRunAiAnalysis}
                        disabled={isAiRunning}
                      >
                        {isAiRunning ? 'Analyzing...' : 'Generate AI Analysis'}
                      </button>
                    </div>

                    {aiGeneratedSummary ? (
                      <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 m-0 leading-relaxed">
                        {aiGeneratedSummary}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 m-0 italic">
                        AI Analysis Not Configured — Trainer feedback can still be saved and published manually. AI will never alter human-entered numeric ratings.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </main>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-white">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 m-0">✓ Feedback Recorded</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6 max-w-md">
              Trainer feedback for <strong>{savedRecord?.traineeName}</strong> has been successfully captured and linked.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-sm w-full text-left mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-800">{savedRecord?.traineeName}</span>
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  {savedRecord?.status}
                </span>
              </div>
              <div className="text-xs text-slate-600">Trainer: {savedRecord?.trainerName}</div>
              <div className="text-xs text-slate-600">Module: {savedRecord?.moduleName}</div>
              <div className="text-xs font-bold text-amber-700 mt-2">
                Overall Rating: {savedRecord?.overallRating.toFixed(1)} / 5
              </div>
            </div>

            <button
              type="button"
              className="fbm-footer-action-btn"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}

        {/* FIXED FOOTER (72px HEIGHT) */}
        {!isSuccess && (
          <footer className="fbm-modal-footer">
            <button
              type="button"
              className="fbm-footer-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="fbm-footer-sec-btn"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  className="fbm-footer-action-btn"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next: {currentStep === 1 ? 'Trainer Ratings' : currentStep === 2 ? 'Trainer Comments' : 'Review & Save'} &rarr;
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="fbm-footer-sec-btn"
                    onClick={() => handleSaveFeedback('Needs Review')}
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    className="fbm-footer-action-btn"
                    onClick={() => handleSaveFeedback('Approved')}
                  >
                    Approve &amp; Publish
                  </button>
                </>
              )}
            </div>
          </footer>
        )}
      </motion.div>
    </div>
  );
};
