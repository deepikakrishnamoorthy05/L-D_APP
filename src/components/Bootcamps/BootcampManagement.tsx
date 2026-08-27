import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Plus,
  BookOpen,
  MoreVertical,
  Eye,
  Users,
  Calendar,
  Sparkles,
  Layers,
  Trash2,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';
import { useBootcamps } from '../../context/BootcampContext';
import { Bootcamp, BootcampType } from '../../types/bootcamp';
import { getCentralTrainerDirectory, getTrainerInitials, getPrimaryTrainerForBootcamp } from '../../services/trainerService';
import { CreateBootcampModal } from './CreateBootcampModal';
import { TraineeSelectionModal } from './TraineeSelectionModal';
import { AddModuleModal } from './AddModuleModal';
import { ArchiveConfirmModal } from './ArchiveConfirmModal';
import { BootcampOrbit } from './BootcampOrbit';
import {
  PageHeader,
  GlassCard,
  Button,
  StatusBadge,
  SearchInput,
  SegmentedControl,
  ProgressBar,
} from '../ui';

interface BootcampManagementProps {
  onSelectBootcamp: (bootcampId: string, initialTab?: string) => void;
}

export const BootcampManagement: React.FC<BootcampManagementProps> = ({
  onSelectBootcamp,
}) => {
  const {
    bootcamps,
    allTrainees,
    modulesMap,
    enrollmentsMap,
    duplicateBootcamp,
    archiveBootcamp,
    deleteBootcamp,
    addTraineesToBootcamp,
    addModuleToBootcamp,
  } = useBootcamps();

  // Selected Filter States
  const [selectedYear, setSelectedYear] = useState<number | 'All'>(2026);
  const [selectedType, setSelectedType] = useState<BootcampType | 'All'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Search & Secondary Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [trainerFilter, setTrainerFilter] = useState<string>('All');

  // Modal triggers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBootcamp, setEditingBootcamp] = useState<Bootcamp | null>(null);
  const [managingTraineesBc, setManagingTraineesBc] = useState<Bootcamp | null>(null);
  const [addingModuleBc, setAddingModuleBc] = useState<Bootcamp | null>(null);
  const [archivingBc, setArchivingBc] = useState<Bootcamp | null>(null);
  const [deletingBc, setDeletingBc] = useState<Bootcamp | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Available Years
  const availableYears: (number | 'All')[] = ['All', 2024, 2025, 2026, 2027];

  // Dynamic Filtering Logic
  const filteredBootcamps = bootcamps.filter((b) => {
    const matchesYear = selectedYear === 'All' || b.bootcampYear === selectedYear;
    const matchesType = selectedType === 'All' || b.bootcampType === selectedType;

    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.primaryTrainerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesTrainer =
      trainerFilter === 'All' || b.primaryTrainerName.includes(trainerFilter);

    return matchesYear && matchesType && matchesSearch && matchesStatus && matchesTrainer;
  });

  // Dynamic Portfolio Calculations
  const yearBootcamps = bootcamps.filter(
    (b) => selectedYear === 'All' || b.bootcampYear === selectedYear
  );

  const normalBootcamps = yearBootcamps.filter((b) => b.bootcampType === 'BOOTCAMP');
  const lateralBootcamps = yearBootcamps.filter((b) => b.bootcampType === 'LATERAL');
  const totalTraineesCount = yearBootcamps.reduce((sum, b) => {
    const enrollments = enrollmentsMap[b.id] || [];
    return sum + (enrollments.length || b.traineesCount || 0);
  }, 0);

  return (
    <div className="bootcamp-page bootcamp-management-container page-container">
      {/* UNIFIED PREMIUM ANIMATED HERO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="unified-bootcamp-hero-card"
      >
        {/* LEFT 30%: ANIMATED LEARNING ORBIT */}
        <div className="hero-section-left">
          <BootcampOrbit />
        </div>

        {/* CENTER 50%: TITLE, DESCRIPTION, METRICS */}
        <div className="hero-section-center">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="hero-eyebrow-badge"
          >
            <Sparkles size={13} className="text-teal-600" />
            <span>ENTERPRISE LEARNING OPERATIONS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="hero-merged-title"
          >
            Bootcamp &amp; Cohort Management
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hero-merged-subtitle"
          >
            Manage graduate cohorts, lateral onboarding, curriculum pathways and talent development from one intelligent workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="hero-compact-metrics-row"
          >
            <span className="hero-metric-pill">
              <BookOpen size={14} className="pill-icon text-teal-600" />
              <strong className="pill-val">{filteredBootcamps.length}</strong>
              <span className="pill-label">Active Cohorts</span>
            </span>

            <span className="hero-metric-pill">
              <Users size={14} className="pill-icon text-indigo-600" />
              <strong className="pill-val">{totalTraineesCount}</strong>
              <span className="pill-label">Trainees</span>
            </span>

            <span className="hero-metric-pill">
              <Layers size={14} className="pill-icon text-amber-600" />
              <strong className="pill-val">2</strong>
              <span className="pill-label">Program Types</span>
            </span>
          </motion.div>
        </div>

        {/* RIGHT 20%: CONTEXTUAL BADGE & PRIMARY ACTION */}
        <div className="hero-section-right">
          <div className="hero-context-badge">
            <span className="badge-year">2026</span>
            <span className="badge-label">CURRENT COHORT YEAR</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={18} />}
              onClick={() => {
                setEditingBootcamp(null);
                setShowCreateModal(true);
              }}
              className="hero-action-btn"
            >
              Launch New Cohort
            </Button>
          </motion.div>

          <span className="hero-muted-meta">
            Bootcamp • Lateral Bootcamp
          </span>
        </div>
      </motion.div>

      {/* 3. Floating Control Bar (Year & Program Selector) */}
      <GlassCard variant="default" padding="sm" className="compact-floating-control-bar mt-4">
        <div className="control-group left-group">
          <span className="control-label">COHORT YEAR:</span>
          <div className="years-pills-row">
            {availableYears.map((yr) => (
              <button
                key={String(yr)}
                type="button"
                className={`year-pill ${selectedYear === yr ? 'active' : ''}`}
                onClick={() => setSelectedYear(yr)}
              >
                <span>{yr}</span>
                {yr === 2026 && <span className="year-sub-tag">CURRENT</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group right-group">
          <span className="control-label">PROGRAM TYPE:</span>
          <SegmentedControl
            options={[
              { id: 'All', label: 'All Programs' },
              { id: 'BOOTCAMP', label: 'Bootcamp', badge: normalBootcamps.length },
              { id: 'LATERAL', label: 'Lateral Bootcamp', badge: lateralBootcamps.length },
            ]}
            value={selectedType}
            onChange={(val) => setSelectedType(val as any)}
          />
        </div>
      </GlassCard>

      {/* 4. Search & Filter Bar (Single Row Desktop Toolbar) */}
      <div className="filter-toolbar-card mt-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search bootcamp, code or trainer..."
          className="search-input-flex"
        />

        <div className="filter-select-group">
          <select
            className="filter-select-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Planned">Planned</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            className="filter-select-dropdown"
            value={trainerFilter}
            onChange={(e) => setTrainerFilter(e.target.value)}
          >
            <option value="All">Trainer: All</option>
            {getCentralTrainerDirectory().map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="view-mode-toggle-group">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Grid View"
          >
            <LayoutGrid size={16} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <TableIcon size={16} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* 5. Active Cohort Cards Grid / Table View */}
      {viewMode === 'cards' ? (
        <div className="cohort-cards-grid grid-3-cols mt-4">
          {filteredBootcamps.length === 0 ? (
            <div className="empty-state-wrapper full-width p-4">
              <p className="empty-title">No Bootcamps Found</p>
              <p className="empty-desc">No cohorts match the selected filters and search criteria.</p>
            </div>
          ) : (
            filteredBootcamps.map((b, idx) => {
              const modules = modulesMap[b.id] || [];
              const enrollments = enrollmentsMap[b.id] || [];
              const traineesCount = enrollments.length || b.traineesCount;
              const trainerName = getPrimaryTrainerForBootcamp(b.id, b.primaryTrainerName);

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.07 }}
                  whileHover={{ y: -3 }}
                  className="bootcamp-card"
                >
                  {/* TOP METADATA ROW */}
                  <div className="bootcamp-card-top-row">
                    <span className="bootcamp-type-year-label">
                      {b.bootcampType === 'BOOTCAMP' ? 'BOOTCAMP' : 'LATERAL BOOTCAMP'} • {b.bootcampYear}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>

                  {/* TITLE & CODE */}
                  <h3
                    className="bootcamp-card-title cursor-pointer hover:text-teal-600 transition-colors"
                    onClick={() => onSelectBootcamp(b.id)}
                  >
                    {b.name}
                  </h3>
                  <span className="bootcamp-card-code">{b.code}</span>

                  {/* DESCRIPTION */}
                  <p className="bootcamp-card-desc">{b.description}</p>

                  {/* TRAINER SECTION */}
                  <div className="bootcamp-card-trainer-section">
                    <span className="bootcamp-section-label">TRAINER</span>
                    <div className="bootcamp-trainer-identity">
                      <div className="bootcamp-trainer-avatar">
                        {getTrainerInitials(trainerName)}
                      </div>
                      <div className="bootcamp-trainer-info">
                        <span className="bootcamp-trainer-name">{trainerName}</span>
                        <span className="bootcamp-trainer-role">Primary Trainer</span>
                      </div>
                    </div>
                  </div>

                  {/* TRAINEE + PROGRESS ROW */}
                  <div className="bootcamp-progress-section">
                    <div className="bootcamp-progress-header">
                      <span className="bootcamp-trainees-text">{traineesCount} Trainees</span>
                      <span className="bootcamp-progress-text">{b.progressPercent}% Progress</span>
                    </div>
                    <div className="bootcamp-progress-track">
                      <div
                        className="bootcamp-progress-fill"
                        style={{ width: `${b.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* LEARNING PATH */}
                  <div className="bootcamp-path-section">
                    <span className="bootcamp-section-label">LEARNING PATH</span>
                    <div className="bootcamp-path-flow">
                      <span className="path-pill">SQL</span>
                      <span className="path-arrow">─›</span>
                      <span className="path-pill">Python</span>
                      <span className="path-arrow">─›</span>
                      <span className="path-pill">Track Split</span>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="bootcamp-card-divider" />
                  <div className="bootcamp-card-footer">
                    <div className="bootcamp-date-range">
                      <Calendar size={13} />
                      <span>{b.startDate} — {b.endDate}</span>
                    </div>
                    <div className="bootcamp-footer-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelectBootcamp(b.id)}
                      >
                        View Cohort →
                      </Button>
                      <div className="dropdown-action-wrapper">
                        <button
                          type="button"
                          className="icon-action-btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === b.id ? null : b.id);
                          }}
                          aria-label="More options"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === b.id && (
                          <div className="dropdown-menu-popover">
                            <button
                              type="button"
                              className="dropdown-item-btn"
                              onClick={() => {
                                setEditingBootcamp(b);
                                setShowCreateModal(true);
                                setOpenMenuId(null);
                              }}
                            >
                              <Eye size={14} /> Edit Cohort
                            </button>
                            <button
                              type="button"
                              className="dropdown-item-btn"
                              onClick={() => {
                                duplicateBootcamp(b.id, {
                                  name: `${b.name} (Copy)`,
                                  code: `${b.code}-COPY`,
                                  startDate: b.startDate,
                                  endDate: b.endDate,
                                });
                                setOpenMenuId(null);
                              }}
                            >
                              <Sparkles size={14} /> Duplicate Cohort
                            </button>
                            <button
                              type="button"
                              className="dropdown-item-btn danger"
                              onClick={() => {
                                setArchivingBc(b);
                                setOpenMenuId(null);
                              }}
                            >
                              Archive Cohort
                            </button>
                            <button
                              type="button"
                              className="dropdown-item-btn danger"
                              onClick={() => {
                                setDeletingBc(b);
                                setOpenMenuId(null);
                              }}
                            >
                              <Trash2 size={14} /> Delete Cohort
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bootcamp-table-wrapper mt-4">
          <div className="table-responsive-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Bootcamp Name</th>
                  <th>Type</th>
                  <th>Year</th>
                  <th>Primary Trainer</th>
                  <th>Trainees</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBootcamps.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-table-cell">
                      No cohorts found.
                    </td>
                  </tr>
                ) : (
                  filteredBootcamps.map((b) => (
                    <tr key={b.id} className="table-row-hover">
                      <td><span className="code-chip">{b.code}</span></td>
                      <td>
                        <button
                          type="button"
                          className="table-link-btn font-weight-bold"
                          onClick={() => onSelectBootcamp(b.id)}
                        >
                          {b.name}
                        </button>
                      </td>
                      <td>{b.bootcampType}</td>
                      <td>{b.bootcampYear}</td>
                      <td>{b.primaryTrainerName}</td>
                      <td>{(enrollmentsMap[b.id] || []).length || b.traineesCount}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{b.progressPercent}%</span>
                          <ProgressBar value={b.progressPercent} color="cyan" height={6} className="w-20" />
                        </div>
                      </td>
                      <td><StatusBadge status={b.status} /></td>
                      <td className="text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<ChevronRight size={14} />}
                          onClick={() => onSelectBootcamp(b.id)}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showCreateModal && (
        <CreateBootcampModal
          initialData={editingBootcamp || undefined}
          onClose={() => {
            setShowCreateModal(false);
            setEditingBootcamp(null);
          }}
        />
      )}

      {managingTraineesBc && (
        <TraineeSelectionModal
          allTrainees={allTrainees}
          selectedTraineeIds={(enrollmentsMap[managingTraineesBc.id] || []).map((e) => e.traineeId)}
          onConfirm={(updatedIds) => addTraineesToBootcamp(managingTraineesBc.id, updatedIds)}
          onClose={() => setManagingTraineesBc(null)}
        />
      )}

      {addingModuleBc && (
        <AddModuleModal
          existingCount={(modulesMap[addingModuleBc.id] || []).length}
          onSave={(modData) => addModuleToBootcamp(addingModuleBc.id, modData)}
          onClose={() => setAddingModuleBc(null)}
        />
      )}

      {archivingBc && (
        <ArchiveConfirmModal
          title={`Archive Bootcamp — ${archivingBc.name}`}
          message="Are you sure you want to archive this bootcamp cohort? Historical data will be preserved."
          confirmLabel="Archive Cohort"
          onConfirm={() => archiveBootcamp(archivingBc.id)}
          onClose={() => setArchivingBc(null)}
        />
      )}

      {deletingBc && (
        <ArchiveConfirmModal
          title={`Delete Bootcamp — ${deletingBc.name}`}
          message="Are you sure you want to permanently delete this bootcamp cohort? All associated modules and trainee assignments will be removed. This action cannot be undone."
          confirmLabel="Delete Cohort"
          onConfirm={() => deleteBootcamp(deletingBc.id)}
          onClose={() => setDeletingBc(null)}
        />
      )}
    </div>
  );
};
