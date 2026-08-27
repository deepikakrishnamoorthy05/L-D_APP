import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Plus,
  Upload,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  MoreVertical,
  Eye,
  Edit,
  Layers,
  TrendingUp,
  Archive,
  Table as TableIcon,
  LayoutGrid,
  Filter,
  X,
  Target,
  BookOpen,
} from 'lucide-react';
import { useTrainees } from '../../context/TraineeContext';
import { useBootcamps } from '../../context/BootcampContext';
import { Trainee, LearningStatus } from '../../types/trainee';
import { AddTraineeModal } from './AddTraineeModal';
import { ChangeBootcampModal } from './ChangeBootcampModal';
import { ArchiveTraineeModal } from './ArchiveTraineeModal';
import { ImportTraineesModal } from './ImportTraineesModal';
import { AnimatedCounter } from '../Common/AnimatedCounter';
import { StatusBadge } from '../ui';

interface TraineeManagementProps {
  onSelectTrainee: (traineeId: string, initialTab?: string) => void;
}

export const TraineeManagement: React.FC<TraineeManagementProps> = ({ onSelectTrainee }) => {
  const { trainees } = useTrainees();
  const { bootcamps } = useBootcamps();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBootcamp, setSelectedBootcamp] = useState<string>('All');
  const [selectedLearningStatus, setSelectedLearningStatus] = useState<string>('All');
  const [selectedEnrollmentStatus, setSelectedEnrollmentStatus] = useState<string>('All');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');

  // View Mode: Table or Cards
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Dropdown Popover State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal Triggers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<Trainee | null>(null);
  const [changingBootcampTrainee, setChangingBootcampTrainee] = useState<Trainee | null>(null);
  const [archivingTrainee, setArchivingTrainee] = useState<Trainee | null>(null);

  // Metrics Calculations (Derived dynamically from live trainees state)
  const totalCount = trainees.length;
  const activeCount = trainees.filter((t) => t.enrollmentStatus === 'Active').length;
  const readyCount = trainees.filter((t) => t.learningStatus === 'Project Ready').length;
  const attentionCount = trainees.filter((t) => t.learningStatus === 'Needs Attention' || t.learningStatus === 'At Risk').length;

  // Compute initials fallback
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'TR';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getPresenceColor = (status: LearningStatus) => {
    switch (status) {
      case 'Project Ready':
      case 'On Track':
        return '#10B981';
      case 'Needs Attention':
        return '#F59E0B';
      case 'At Risk':
        return '#EF4444';
      default:
        return '#10B981';
    }
  };

  const getBootcampCode = (bootcampId: string, bootcampName: string) => {
    const match = bootcamps.find((b) => b.id === bootcampId || b.name === bootcampName);
    if (match) return match.code;
    if (bootcampId.toLowerCase().includes('bc-1') || bootcampName.toLowerCase().includes('sql')) return 'DE-B-2026-B01';
    if (bootcampId.toLowerCase().includes('bc-2') || bootcampName.toLowerCase().includes('python')) return 'DE-B-2026-B02';
    if (bootcampId.toLowerCase().includes('bc-3') || bootcampName.toLowerCase().includes('lateral')) return 'DE-L-2026-B01';
    if (bootcampId.toLowerCase().includes('bc-4') || bootcampName.toLowerCase().includes('bi')) return 'BI-B-2026-B01';
    return bootcampId.toUpperCase();
  };

  // Status Badge Rendering
  const renderStatusBadge = (status: LearningStatus) => {
    return <StatusBadge status={status} />;
  };

  // Filter Logic
  const filteredTrainees = trainees.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBootcamp =
      selectedBootcamp === 'All' ||
      t.bootcampId === selectedBootcamp ||
      t.bootcampName.toLowerCase().includes(selectedBootcamp.toLowerCase());

    const matchesLearningStatus =
      selectedLearningStatus === 'All' || t.learningStatus === selectedLearningStatus;

    const matchesEnrollmentStatus =
      selectedEnrollmentStatus === 'All' || t.enrollmentStatus === selectedEnrollmentStatus;

    const matchesTrack =
      selectedTrack === 'All' || (t.primaryTech && t.primaryTech.toLowerCase().includes(selectedTrack.toLowerCase()));

    return matchesSearch && matchesBootcamp && matchesLearningStatus && matchesEnrollmentStatus && matchesTrack;
  });

  const isFilterActive =
    searchQuery !== '' ||
    selectedBootcamp !== 'All' ||
    selectedLearningStatus !== 'All' ||
    selectedEnrollmentStatus !== 'All' ||
    selectedTrack !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBootcamp('All');
    setSelectedLearningStatus('All');
    setSelectedEnrollmentStatus('All');
    setSelectedTrack('All');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="page-container trainee-management-page"
    >
      {/* 1. COMPACT PAGE HEADER */}
      <header className="page-header flex items-center justify-between">
        <div className="header-left">
          <nav className="header-breadcrumbs" aria-label="Breadcrumb">
            <span className="breadcrumb-item">L&amp;D</span>
            <ChevronRight size={12} className="breadcrumb-separator" />
            <span className="breadcrumb-item active">Trainees</span>
          </nav>

          <div className="header-title-block mt-1">
            <h1 className="header-page-title">Trainee Management</h1>
            <p className="header-page-subtitle">
              Manage trainee enrollment, learning progress, performance and deployment readiness.
            </p>
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="import-trainees-hdr-btn"
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={16} /> Import Trainees
          </button>
          <button
            type="button"
            className="ui-button-primary icon-button-single"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} /> Add Trainee
          </button>
        </div>
      </header>

      {/* 2. KPI ROW (4 Equal Metric Cards with 3D Depth & Count Up) */}
      <section className="kpi-cards-grid grid-4-cols mt-4" aria-label="Trainee Statistics">
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="metric-card-3d cyan-tint"
        >
          <div className="card-top-row">
            <span className="metric-label">TOTAL TRAINEES</span>
            <div className="metric-icon-box cyan">
              <Users size={18} />
            </div>
          </div>
          <div className="metric-val-large">
            <AnimatedCounter value={totalCount} />
          </div>
          <span className="metric-subtext">Total enrolled talent</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="metric-card-3d indigo-tint"
        >
          <div className="card-top-row">
            <span className="metric-label">ACTIVE LEARNERS</span>
            <div className="metric-icon-box indigo">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-val-large">
            <AnimatedCounter value={activeCount} />
          </div>
          <span className="metric-subtext">Currently in active cohorts</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="metric-card-3d green-tint"
        >
          <div className="card-top-row">
            <span className="metric-label">PROJECT READY</span>
            <div className="metric-icon-box green">
              <Award size={18} />
            </div>
          </div>
          <div className="metric-val-large">
            <AnimatedCounter value={readyCount} />
          </div>
          <span className="metric-subtext">Qualified for deployment</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="metric-card-3d amber-tint"
        >
          <div className="card-top-row">
            <span className="metric-label">NEED ATTENTION</span>
            <div className="metric-icon-box amber">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-val-large">
            <AnimatedCounter value={attentionCount} />
          </div>
          <span className="metric-subtext">Requiring support / intervention</span>
        </motion.div>
      </section>

      {/* 3. FILTER TOOLBAR (Single Compact Flex Row) */}
      <section className="trainee-filter-toolbar mt-4">
        <div className="filter-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search trainee, ID or email..."
            className="filter-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select-control"
          value={selectedBootcamp}
          onChange={(e) => setSelectedBootcamp(e.target.value)}
        >
          <option value="All">Bootcamp: All</option>
          {bootcamps.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          className="filter-select-control"
          value={selectedLearningStatus}
          onChange={(e) => setSelectedLearningStatus(e.target.value)}
        >
          <option value="All">Learning Status: All</option>
          <option value="On Track">On Track</option>
          <option value="Project Ready">Project Ready</option>
          <option value="Needs Attention">Needs Attention</option>
          <option value="At Risk">At Risk</option>
        </select>

        <select
          className="filter-select-control"
          value={selectedEnrollmentStatus}
          onChange={(e) => setSelectedEnrollmentStatus(e.target.value)}
        >
          <option value="All">Enrollment: All</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Not Assigned">Not Assigned</option>
        </select>

        <select
          className="filter-select-control"
          value={selectedTrack}
          onChange={(e) => setSelectedTrack(e.target.value)}
        >
          <option value="All">Track: All</option>
          <option value="SQL">SQL</option>
          <option value="Python">Python</option>
          <option value="Power BI">Power BI</option>
        </select>

        {isFilterActive && (
          <button type="button" className="filter-clear-btn" onClick={clearFilters}>
            <X size={14} /> Clear
          </button>
        )}
      </section>

      {/* 4. WORKSPACE CONTAINER WITH HEADER & VIEW TOGGLE */}
      <section className="trainee-workspace-card mt-4">
        <div className="workspace-card-header flex items-center justify-between">
          <h3 className="workspace-title">Trainee Directory</h3>

          <div className="segmented-view-toggle">
            <button
              type="button"
              className={`segmented-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <TableIcon size={15} /> Table
            </button>
            <button
              type="button"
              className={`segmented-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid size={15} /> Cards
            </button>
          </div>
        </div>

        {/* 5. TABLE VIEW */}
        {viewMode === 'table' ? (
          <div className="trainee-table-wrapper">
            <table className="trainee-enterprise-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>BOOTCAMP</th>
                  <th>PROGRESS</th>
                  <th>ATTENDANCE</th>
                  <th>AVG SCORE</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-table-cell">
                      <div className="empty-state-wrapper py-6">
                        <Users size={36} className="empty-icon text-muted" />
                        <p className="empty-title font-bold mt-2">No Trainees Found</p>
                        <p className="empty-desc text-sm text-muted mt-1">
                          No trainees match the selected filter criteria. Try resetting filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTrainees.map((t) => (
                    <tr key={t.id} className="trainee-row-hover">
                      {/* EMPLOYEE COLUMN: Avatar (36px) + Name + ID & Email */}
                      <td>
                        <div
                          className="employee-cell-grid"
                          onClick={() => onSelectTrainee(t.id, 'overview')}
                          role="button"
                          tabIndex={0}
                          title={t.name}
                        >
                          <div className="avatar-wrapper-36">
                            <div className="avatar-initials-36">
                              {getInitials(t.name)}
                            </div>
                          </div>

                          <div className="employee-info-meta">
                            <span className="employee-name-link">{t.name}</span>
                            <span className="employee-id-sub">{t.employeeId} • {t.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* BOOTCAMP COLUMN: Title + [ Code ] • Type */}
                      <td>
                        <div className="bootcamp-cell-meta">
                          <span className="bootcamp-name-title">{t.bootcampName}</span>
                          <div className="bootcamp-code-type-row">
                            <span className="program-code-badge">{getBootcampCode(t.bootcampId, t.bootcampName)}</span>
                            <span className="bootcamp-dot-sep">•</span>
                            <span className="bootcamp-type-subtext">Bootcamp</span>
                          </div>
                        </div>
                      </td>

                      {/* LEARNING PROGRESS COLUMN: 76% + Micro Progress Bar */}
                      <td>
                        <div className="table-progress-cell">
                          <div className="progress-value-row">
                            <span className="progress-percent-val">{t.progressPercent}%</span>
                            <span className="progress-sub-label">Progress</span>
                          </div>
                          <div className="table-progress-track">
                            <div
                              className="table-progress-fill"
                              style={{ width: `${t.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* ATTENDANCE COLUMN */}
                      <td>
                        <div className="metric-cell-group">
                          <span className={`metric-val-bold ${t.attendancePercent >= 90 ? 'good' : t.attendancePercent >= 75 ? 'mid' : 'low'}`}>
                            {t.attendancePercent}%
                          </span>
                          <span className="metric-sub-label">Attendance</span>
                        </div>
                      </td>

                      {/* AVG SCORE COLUMN */}
                      <td>
                        <div className="metric-cell-group">
                          <span className="metric-val-bold score-val">{t.avgScorePercent}%</span>
                          <span className="metric-sub-label">Avg Score</span>
                        </div>
                      </td>

                      {/* LEARNING STATUS COLUMN */}
                      <td>{renderStatusBadge(t.learningStatus)}</td>

                      {/* ACTIONS COLUMN (Rounded 36px icon button + Popover menu) */}
                      <td className="text-right">
                        <div className="action-popover-wrapper">
                          <button
                            type="button"
                            className="table-action-icon-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === t.id ? null : t.id);
                            }}
                            aria-label="Trainee options"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuId === t.id && (
                            <div
                              className="dropdown-menu-popover-table"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="dropdown-table-item"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onSelectTrainee(t.id, 'overview');
                                }}
                              >
                                <Eye size={14} /> View Profile
                              </button>

                              <button
                                type="button"
                                className="dropdown-table-item"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setEditingTrainee(t);
                                }}
                              >
                                <Edit size={14} /> Edit Trainee
                              </button>

                              <button
                                type="button"
                                className="dropdown-table-item"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setChangingBootcampTrainee(t);
                                }}
                              >
                                <BookOpen size={14} /> Assign Bootcamp
                              </button>

                              <button
                                type="button"
                                className="dropdown-table-item"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onSelectTrainee(t.id, 'progress');
                                }}
                              >
                                <TrendingUp size={14} /> View Progress
                              </button>

                              <div className="dropdown-table-divider" />

                              <button
                                type="button"
                                className="dropdown-table-item danger"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setArchivingTrainee(t);
                                }}
                              >
                                <Archive size={14} /> Archive Trainee
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* 6. CARDS VIEW */
          <div className="trainee-cards-grid p-4">
            {filteredTrainees.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="trainee-card-interactive"
              >
                <div className="card-top-header flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onSelectTrainee(t.id, 'overview')}
                  >
                    <div className="avatar-wrapper-48">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="avatar-img-48" />
                      ) : (
                        <div className="avatar-initials-48">{getInitials(t.name)}</div>
                      )}
                      <span
                        className="presence-status-dot"
                        style={{ backgroundColor: getPresenceColor(t.learningStatus) }}
                      />
                    </div>
                    <div>
                      <h4 className="card-trainee-name">{t.name}</h4>
                      <span className="card-emp-id">{t.employeeId}</span>
                    </div>
                  </div>

                  <div className="action-popover-wrapper">
                    <button
                      type="button"
                      className="icon-action-circle-btn"
                      onClick={() => setActiveMenuId(activeMenuId === t.id ? null : t.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenuId === t.id && (
                      <div className="floating-action-popover">
                        <button
                          type="button"
                          className="popover-item"
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectTrainee(t.id, 'overview');
                          }}
                        >
                          <Eye size={14} /> View Profile
                        </button>
                        <button
                          type="button"
                          className="popover-item"
                          onClick={() => {
                            setActiveMenuId(null);
                            setEditingTrainee(t);
                          }}
                        >
                          <Edit size={14} /> Edit Trainee
                        </button>
                        <button
                          type="button"
                          className="popover-item danger"
                          onClick={() => {
                            setActiveMenuId(null);
                            setArchivingTrainee(t);
                          }}
                        >
                          <Archive size={14} /> Archive Trainee
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-bootcamp-info mt-3 pt-3 border-t">
                  <span className="card-bootcamp-name font-bold">{t.bootcampName}</span>
                  <span className="card-email-sub text-xs text-muted block mt-1">{t.email}</span>
                </div>

                <div className="card-progress-section mt-3">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Progress</span>
                    <span>{t.progressPercent}%</span>
                  </div>
                  <div className="progress-track-sm">
                    <div className="progress-fill-cyan" style={{ width: `${t.progressPercent}%` }} />
                  </div>
                </div>

                <div className="card-stats-row mt-3 flex items-center justify-between text-xs pt-2 border-t">
                  <span>Attendance: <strong>{t.attendancePercent}%</strong></span>
                  <span>Avg Score: <strong>{t.avgScorePercent}%</strong></span>
                </div>

                <div className="card-footer mt-3 flex items-center justify-between">
                  {renderStatusBadge(t.learningStatus)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* MODALS */}
      {showAddModal && <AddTraineeModal onClose={() => setShowAddModal(false)} />}

      {editingTrainee && (
        <AddTraineeModal initialData={editingTrainee} onClose={() => setEditingTrainee(null)} />
      )}

      {changingBootcampTrainee && (
        <ChangeBootcampModal
          trainee={changingBootcampTrainee}
          onClose={() => setChangingBootcampTrainee(null)}
        />
      )}

      {archivingTrainee && (
        <ArchiveTraineeModal
          trainee={archivingTrainee}
          onClose={() => setArchivingTrainee(null)}
        />
      )}

      <ImportTraineesModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </motion.div>
  );
};
