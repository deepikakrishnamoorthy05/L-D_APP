import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Upload,
  Search,
  MessageSquare,
  Star,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Filter,
  X,
  LayoutGrid,
  List,
  MoreVertical,
  Eye,
  Edit,
  Brain,
  CheckSquare,
  Copy,
  Archive,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  Send,
  UserCheck,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { useBootcamps } from '../../context/BootcampContext';
import { useTrainees } from '../../context/TraineeContext';
import { getCentralTrainerDirectory, getTrainerInitials } from '../../services/trainerService';
import { StatusBadge } from '../ui';
import { FeedbackRecord, FeedbackStatus } from '../../types/feedback';
import { AddTrainerFeedbackModal } from './AddTrainerFeedbackModal';
import { ImportTrainerFeedbackModal } from './ImportTrainerFeedbackModal';
import { FeedbackDetailModal } from './FeedbackDetailModal';

export const FeedbackManagement: React.FC = () => {
  const {
    feedbackRecords,
    approveFeedback,
    publishFeedback,
    runAiAnalysis,
    archiveFeedback,
    duplicateFeedback,
  } = useFeedback();

  const { bootcamps } = useBootcamps();
  const { trainees } = useTrainees();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBootcampId, setSelectedBootcampId] = useState('All');
  const [selectedTrainerName, setSelectedTrainerName] = useState('All');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // View Mode: Table (default) vs Cards
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Active Dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFeedbackDetails, setSelectedFeedbackDetails] = useState<FeedbackRecord | null>(null);
  const [detailModalMode, setDetailModalMode] = useState<'view' | 'edit'>('view');

  // Close popover when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Unique Filter Options
  const uniqueTrainers = Array.from(new Set(feedbackRecords.map((f) => f.trainerName)));
  const uniqueModules = Array.from(new Set(feedbackRecords.map((f) => f.moduleName)));

  // KPI Calculations
  const totalFeedbackCount = feedbackRecords.length;
  const awaitingFeedbackCount = 18;
  const avgCohortRating = (
    feedbackRecords.reduce((sum, f) => sum + f.overallRating, 0) / (feedbackRecords.length || 1)
  ).toFixed(1);
  const needAttentionCount = feedbackRecords.filter(
    (f) => f.overallRating < 3.5 || f.aiDevelopmentPriority === 'High' || f.insightBadgeType === 'Needs Attention'
  ).length;
  const trainersParticipatedCount = uniqueTrainers.length;

  // Filter Logic
  const filteredRecords = feedbackRecords.filter((f) => {
    const matchesSearch =
      f.traineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.moduleName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBootcamp = selectedBootcampId === 'All' || f.bootcampId === selectedBootcampId;
    const matchesTrainer = selectedTrainerName === 'All' || f.trainerName === selectedTrainerName;
    const matchesModule = selectedModule === 'All' || f.moduleName === selectedModule;
    const matchesStatus = selectedStatus === 'All' || f.status === selectedStatus;

    let matchesRating = true;
    if (selectedRating === '4.5+') matchesRating = f.overallRating >= 4.5;
    else if (selectedRating === '4.0+') matchesRating = f.overallRating >= 4.0;
    else if (selectedRating === '<3.5') matchesRating = f.overallRating < 3.5;

    return matchesSearch && matchesBootcamp && matchesTrainer && matchesModule && matchesStatus && matchesRating;
  });

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedBootcampId !== 'All' ||
    selectedTrainerName !== 'All' ||
    selectedModule !== 'All' ||
    selectedRating !== 'All' ||
    selectedStatus !== 'All';

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBootcampId('All');
    setSelectedTrainerName('All');
    setSelectedModule('All');
    setSelectedRating('All');
    setSelectedStatus('All');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(<Star key={i} size={12} className="fill-amber-400 text-amber-400 inline" />);
      } else {
        stars.push(<Star key={i} size={12} className="text-slate-300 inline" />);
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="assessment-ops-container feedback-page-root"
    >
      {/* 1. PAGE HEADER CARD */}
      <header className="asm-header-glass-card">
        <div className="header-left-title-group">
          <div className="breadcrumb-trail">L&amp;D / Feedback</div>
          <h1 className="header-main-title">Feedback Intelligence</h1>
          <p className="header-subtitle-text">
            Capture, validate and analyze trainer feedback across trainee learning journeys.
          </p>
        </div>

        <div className="feedback-header-actions">
          <button
            type="button"
            className="import-feedback-btn"
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={16} /> Import Trainer Feedback
          </button>
          <button
            type="button"
            className="add-feedback-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>Add Feedback</span>
          </button>
        </div>
      </header>

      {/* 2. 5 EQUAL KPI CARDS ROW */}
      <div className="asm-kpi-cards-5row">
        {/* KPI 1: Feedback Received */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">FEEDBACK RECEIVED</span>
            <div className="kpi-icon-badge teal">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{totalFeedbackCount}</div>
          <span className="kpi-desc-text">Processed feedback entries</span>
        </motion.div>

        {/* KPI 2: Awaiting Feedback */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">AWAITING FEEDBACK</span>
            <div className="kpi-icon-badge indigo">
              <Clock size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{awaitingFeedbackCount}</div>
          <span className="kpi-desc-text">Sessions awaiting submission</span>
        </motion.div>

        {/* KPI 3: Average Rating */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">AVERAGE RATING</span>
            <div className="kpi-icon-badge amber">
              <Star size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{avgCohortRating} <span className="text-sm text-slate-400 font-normal">/ 5</span></div>
          <div className="flex gap-1 mt-1">{renderStars(Number(avgCohortRating))}</div>
          <span className="kpi-desc-text mt-1">Overall cohort performance</span>
        </motion.div>

        {/* KPI 4: Need Attention */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text text-rose">NEED ATTENTION</span>
            <div className="kpi-icon-badge rose">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="kpi-num-display text-rose">{needAttentionCount}</div>
          <span className="kpi-desc-text">Ratings below threshold</span>
        </motion.div>

        {/* KPI 5: Trainers Participated */}
        <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.18 }} className="asm-kpi-card-box">
          <div className="kpi-card-header">
            <span className="kpi-label-text">TRAINERS PARTICIPATED</span>
            <div className="kpi-icon-badge emerald">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="kpi-num-display">{trainersParticipatedCount}</div>
          <span className="kpi-desc-text">Active feedback contributors</span>
        </motion.div>
      </div>



      {/* 4. FILTER WORKSPACE CARD */}
      <div className="asm-filter-workspace-card">
        <div className="feedback-filter-grid">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon text-teal-700" />
            <input
              type="text"
              className="asm-search-input-field"
              placeholder="Search trainee, trainer or module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="asm-select-field"
            value={selectedBootcampId}
            onChange={(e) => setSelectedBootcampId(e.target.value)}
          >
            <option value="All">Bootcamp: All</option>
            {bootcamps.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            className="asm-select-field"
            value={selectedTrainerName}
            onChange={(e) => setSelectedTrainerName(e.target.value)}
          >
            <option value="All">Trainer: All</option>
            {uniqueTrainers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            className="asm-select-field"
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            <option value="All">Module: All</option>
            {uniqueModules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="asm-select-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="Imported">Imported</option>
            <option value="Validated">Validated</option>
            <option value="Needs Review">Needs Review</option>
            <option value="AI Processed">AI Processed</option>
            <option value="Approved">Approved</option>
            <option value="Published">Published</option>
          </select>

          <button
            type="button"
            className={`clear-filters-btn ${hasActiveFilters ? 'visible' : ''}`}
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            <X size={14} /> Clear
          </button>
        </div>
      </div>

      {/* 5. FEEDBACK RESULTS MASTER CARD */}
      <div className="asm-results-master-card">
        <div className="directory-header-bar">
          <div className="directory-title-block">
            <h3 className="directory-main-title">Feedback Directory</h3>
            <span className="directory-count-pill">
              {filteredRecords.length} Record{filteredRecords.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="view-mode-segmented-control">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid size={14} /> Cards
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List size={14} /> Table
            </button>
          </div>
        </div>

        {/* WORKSPACE VIEW: TABLE OR CARDS */}
        {viewMode === 'table' ? (
          <div className="table-responsive-wrapper">
            <table className="feedback-enterprise-table">
              <thead>
                <tr>
                  <th style={{ width: '17%' }}>TRAINEE</th>
                  <th style={{ width: '14%' }}>TRAINER</th>
                  <th style={{ width: '17%' }}>BOOTCAMP / MODULE</th>
                  <th style={{ width: '13%' }}>RATING</th>
                  <th style={{ width: '21%' }}>AI INSIGHT</th>
                  <th style={{ width: '8%' }}>DATE</th>
                  <th style={{ width: '7%' }}>STATUS</th>
                  <th style={{ width: '3%' }} className="text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-results-cell">
                      <div className="empty-state-content">
                        <MessageSquare size={36} className="text-teal-700 mb-2" />
                        <h4 className="empty-title">No Feedback Records Found</h4>
                        <p className="empty-desc">No entries match your search criteria. Try clearing active filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((f) => {
                    const matchedTrainee = trainees.find(
                      (t) => t.id === f.traineeId || t.employeeId === f.employeeId || t.name === f.traineeName
                    );
                    const traineeName = matchedTrainee ? matchedTrainee.name : f.traineeName;
                    const employeeId = matchedTrainee ? matchedTrainee.employeeId : f.employeeId;

                    const centralTrainers = getCentralTrainerDirectory();
                    const matchedTrainer = centralTrainers.find(
                      (tr) => tr.name.toLowerCase() === f.trainerName.toLowerCase()
                    );
                    const trainerName = matchedTrainer ? matchedTrainer.name : f.trainerName;
                    const trainerRole = matchedTrainer ? matchedTrainer.role : (f.trainerRole || 'Trainer');

                    return (
                      <tr key={f.id} className="feedback-table-row">
                        {/* TRAINEE COLUMN */}
                        <td>
                          <div className="trainee-cell-identity">
                            <div className="avatar-38px-teal">
                              {getInitials(traineeName)}
                            </div>
                            <div className="trainee-info-block">
                              <span className="trainee-name-title" title={traineeName}>{traineeName}</span>
                              <span className="trainee-emp-code">{employeeId}</span>
                              <span className="trainee-program-sub">{f.bootcampName}</span>
                            </div>
                          </div>
                        </td>

                        {/* TRAINER COLUMN */}
                        <td>
                          <div className="trainer-cell-identity">
                            <div className="avatar-38px-slate">
                              {getTrainerInitials(trainerName)}
                            </div>
                            <div className="trainer-info-block">
                              <span className="trainer-name-title">{trainerName}</span>
                              <span className="trainer-role-sub">{trainerRole}</span>
                            </div>
                          </div>
                        </td>

                        {/* BOOTCAMP / MODULE COLUMN */}
                        <td>
                          <div className="module-cell-block">
                            <span className="module-name-heading">{f.moduleName}</span>
                            <span className="bootcamp-sub-name">{f.bootcampName}</span>
                            <span className="track-pill-chip">{f.track || 'Common Foundation'}</span>
                          </div>
                        </td>

                        {/* RATING COLUMN */}
                        <td>
                          <div className="rating-cell-block">
                            <div className="overall-rating-row">
                              <span className="overall-num">{f.overallRating.toFixed(1)}</span>
                              <div className="star-rating-stars">{renderStars(f.overallRating)}</div>
                              <span className="rating-sub-text">Overall</span>
                            </div>
                            <div className="subscores-2x2-grid">
                              <div className="subscore-item">
                                <span className="subscore-label">Tech</span>
                                <span className="subscore-val">{f.technicalRating.toFixed(1)}</span>
                              </div>
                              <div className="subscore-item">
                                <span className="subscore-label">Part</span>
                                <span className="subscore-val">{f.participationRating.toFixed(1)}</span>
                              </div>
                              <div className="subscore-item">
                                <span className="subscore-label">Comm</span>
                                <span className="subscore-val">{f.communicationRating.toFixed(1)}</span>
                              </div>
                              <div className="subscore-item">
                                <span className="subscore-label">Prob</span>
                                <span className="subscore-val">{f.problemSolvingRating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* AI INSIGHT COLUMN */}
                        <td>
                          <div className="ai-insight-cell-block">
                            <div className="insight-section strength">
                              <span className="insight-badge-pill strength">STRENGTH</span>
                              <p className="insight-text-line">{f.strengthComments || f.aiStrengths?.[0] || f.aiSummary}</p>
                            </div>
                            <div className="insight-section focus">
                              <span className="insight-badge-pill focus">FOCUS</span>
                              <p className="insight-text-line">{f.improvementComments || f.aiImprovementAreas?.[0] || f.aiRecommendedFocus}</p>
                            </div>
                          </div>
                        </td>

                        {/* DATE COLUMN */}
                        <td>
                          <div className="date-cell-block">
                            <span className="date-display-text">{f.feedbackDate}</span>
                            <span className="date-sub-text">Trainer Feedback</span>
                          </div>
                        </td>

                        {/* STATUS COLUMN */}
                        <td>
                          <StatusBadge status={f.status} />
                        </td>

                        {/* ACTION COLUMN */}
                        <td className="text-right">
                          <div className="action-popover-wrapper">
                            <button
                              type="button"
                              className="table-action-icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === f.id ? null : f.id);
                              }}
                              aria-label="Actions"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeMenuId === f.id && (
                              <div className="dropdown-menu-popover-table" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  className="dropdown-table-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    setDetailModalMode('view');
                                    setSelectedFeedbackDetails(f);
                                  }}
                                >
                                  <Eye size={14} /> View Feedback
                                </button>
                                <button
                                  type="button"
                                  className="dropdown-table-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    setDetailModalMode('edit');
                                    setSelectedFeedbackDetails(f);
                                  }}
                                >
                                  <Edit size={14} /> Edit Feedback
                                </button>
                                <button
                                  type="button"
                                  className="dropdown-table-item"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    runAiAnalysis(f.id);
                                  }}
                                >
                                  <Sparkles size={14} /> Regenerate AI Insight
                                </button>
                                {f.status !== 'Approved' && f.status !== 'Published' && (
                                  <button
                                    type="button"
                                    className="dropdown-table-item"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      approveFeedback(f.id);
                                    }}
                                  >
                                    <CheckSquare size={14} /> Approve
                                  </button>
                                )}
                                {f.status !== 'Published' && (
                                  <button
                                    type="button"
                                    className="dropdown-table-item"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      publishFeedback(f.id);
                                    }}
                                  >
                                    <Send size={14} /> Publish
                                  </button>
                                )}
                                <div className="dropdown-table-divider" />
                                <button
                                  type="button"
                                  className="dropdown-table-item danger"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    archiveFeedback(f.id);
                                  }}
                                >
                                  <Archive size={14} /> Archive Feedback
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARDS VIEW (3 COLUMNS DESKTOP) */
          <div className="cards-grid-3col p-4">
            {filteredRecords.length === 0 ? (
              <div className="col-span-3 p-5 text-center">
                <MessageSquare size={36} className="text-teal-700 mx-auto mb-2" />
                <h4 className="empty-title">No Feedback Records Found</h4>
                <p className="empty-desc">No entries match your search criteria.</p>
              </div>
            ) : (
              filteredRecords.map((f) => (
                <motion.div
                  key={f.id}
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ duration: 0.18 }}
                  className="asm-grid-card-shell"
                >
                  <div className="card-top-row">
                    <div className="flex items-center gap-2">
                      <div className="eval-chip">{getInitials(f.traineeName)}</div>
                      <div>
                        <strong className="text-sm text-slate-800">{f.traineeName}</strong>
                        <span className="text-xs text-slate-400 block">{f.employeeId}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{f.overallRating.toFixed(1)} ★</span>
                  </div>

                  <div className="card-divider" />

                  <div className="card-meta-pairs">
                    <div className="pair-row">
                      <span className="lbl">Bootcamp:</span>
                      <span className="val">{f.bootcampName}</span>
                    </div>
                    <div className="pair-row">
                      <span className="lbl">Module:</span>
                      <span className="val highlight">{f.moduleName}</span>
                    </div>
                    <div className="pair-row">
                      <span className="lbl">Trainer:</span>
                      <div className="eval-inline">
                        <span className="eval-chip">{getInitials(f.trainerName)}</span>
                        <span>{f.trainerName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-divider" />

                  <div className="card-metrics-strip grid-cols-2">
                    <div className="pair-row"><span>Technical</span> <strong>{f.technicalRating} / 5</strong></div>
                    <div className="pair-row"><span>Participation</span> <strong>{f.participationRating} / 5</strong></div>
                    <div className="pair-row"><span>Communication</span> <strong>{f.communicationRating} / 5</strong></div>
                    <div className="pair-row"><span>Problem Solving</span> <strong>{f.problemSolvingRating} / 5</strong></div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-2">
                    <span className="text-xs font-bold text-teal-800 block mb-1">AI INSIGHT</span>
                    <p className="text-xs text-slate-600 m-0 line-clamp-2">
                      {f.aiSummary || f.strengthComments || 'Feedback recorded.'}
                    </p>
                  </div>

                  <div className="card-footer-action-row">
                    <span
                      className={`status-pill-badge ${
                        f.status === 'Published' || f.status === 'Approved'
                          ? 'completed'
                          : 'scheduled'
                      }`}
                    >
                      {f.status}
                    </span>

                    <button
                      type="button"
                      className="card-view-link-btn"
                      onClick={() => {
                        setDetailModalMode('view');
                        setSelectedFeedbackDetails(f);
                      }}
                    >
                      View Feedback <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* FULLY FUNCTIONAL MODALS FOR ADD, IMPORT & VIEW/EDIT DETAILS */}
      {showAddModal && (
        <AddTrainerFeedbackModal onClose={() => setShowAddModal(false)} />
      )}

      {showImportModal && (
        <ImportTrainerFeedbackModal onClose={() => setShowImportModal(false)} />
      )}

      {selectedFeedbackDetails && (
        <FeedbackDetailModal
          record={selectedFeedbackDetails}
          initialMode={detailModalMode}
          onClose={() => setSelectedFeedbackDetails(null)}
        />
      )}
    </motion.div>
  );
};

