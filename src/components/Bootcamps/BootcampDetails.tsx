import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Plus,
  BookOpen,
  Users,
  Calendar,
  CheckCircle2,
  Trash2,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useBootcamps } from '../../context/BootcampContext';
import { getPrimaryTrainerForBootcamp } from '../../services/trainerService';
import { useSessions } from '../../context/SessionContext';
import { useAssessments } from '../../context/AssessmentContext';
import { BootcampModule } from '../../types/bootcamp';
import { CreateBootcampModal } from './CreateBootcampModal';
import { TraineeSelectionModal } from './TraineeSelectionModal';
import { AddModuleModal } from './AddModuleModal';
import { ArchiveConfirmModal } from './ArchiveConfirmModal';
import {
  GlassCard,
  MetricCard,
  Button,
  StatusBadge,
  Tabs,
  SearchInput,
  ProgressBar,
} from '../ui';

interface BootcampDetailsProps {
  bootcampId: string;
  initialTab?: string;
  onBack: () => void;
  onOpenScheduleSession?: () => void;
  onOpenRecordAttendance?: (sessionId: string) => void;
}

export const BootcampDetails: React.FC<BootcampDetailsProps> = ({
  bootcampId,
  initialTab = 'overview',
  onBack,
  onOpenRecordAttendance,
}) => {
  const {
    bootcamps,
    allTrainees,
    modulesMap,
    enrollmentsMap,
    updateModule,
    deleteModule,
    deleteBootcamp,
    reorderModules,
    addModuleToBootcamp,
    addTraineesToBootcamp,
    removeTraineeFromBootcamp,
  } = useBootcamps();

  const { sessions } = useSessions();
  const { getBootcampAssessmentStats } = useAssessments();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [traineeSearch, setTraineeSearch] = useState('');

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddTraineesModal, setShowAddTraineesModal] = useState(false);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<BootcampModule | null>(null);

  // Removal confirmation modals
  const [removingTraineeId, setRemovingTraineeId] = useState<string | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);

  const bootcamp = bootcamps.find((b) => b.id === bootcampId) || bootcamps[0];
  const modules = modulesMap[bootcamp.id] || [];
  const enrollments = enrollmentsMap[bootcamp.id] || [];
  const cohortAssessmentStats = getBootcampAssessmentStats(bootcamp.id);

  // Filter sessions belonging to this bootcamp
  const bootcampSessions = sessions.filter(
    (s) => s.bootcampId === bootcamp.id || s.bootcampName === bootcamp.name
  );

  const filteredEnrollments = enrollments.filter(
    (e) =>
      e.trainee.name.toLowerCase().includes(traineeSearch.toLowerCase()) ||
      e.trainee.employeeId.toLowerCase().includes(traineeSearch.toLowerCase()) ||
      e.trainee.email.toLowerCase().includes(traineeSearch.toLowerCase())
  );

  const tabsList = [
    { id: 'overview', label: 'Overview' },
    { id: 'trainees', label: 'Trainees', badge: enrollments.length },
    { id: 'modules', label: 'Modules', badge: modules.length },
    { id: 'sessions', label: 'Sessions', badge: bootcampSessions.length },
    { id: 'attendance', label: 'Attendance' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'projects', label: 'Projects' },
    { id: 'feedback', label: 'Feedback' },
  ];

  return (
    <div className="bootcamp-page bootcamp-details-container page-container">
      {/* 1. REBUILT ENTERPRISE HERO CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bootcamp-details-hero-redesigned"
      >
        <div className="details-hero-grid">
          {/* LEFT 1.65fr: COMPACT ACTION ROW, TITLE BLOCK, BADGES, CODE, DESCRIPTION */}
          <div className="details-hero-left">
            <div className="hero-action-row">
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={onBack}
                className="hero-back-btn-compact"
              >
                Back to Bootcamps
              </Button>
            </div>

            <h1 className="hero-bootcamp-title">{bootcamp.name}</h1>

            <div className="hero-badges-row">
              <span className="hero-pill-badge type-badge">{bootcamp.bootcampType}</span>
              <span className="hero-pill-badge year-badge">{bootcamp.bootcampYear}</span>
              <StatusBadge status={bootcamp.status} />
            </div>

            <div className="hero-code-tag">{bootcamp.code}</div>

            <p className="hero-description-text">{bootcamp.description}</p>
          </div>

          {/* RIGHT 0.9fr: TOP EDIT/DELETE ACTIONS + STRUCTURED SUMMARY PANEL */}
          <div className="details-hero-right">
            <div className="hero-right-actions">
              <Button
                variant="secondary"
                size="sm"
                icon={<Edit size={14} />}
                onClick={() => setShowEditModal(true)}
                className="hero-action-subtle"
              >
                Edit Cohort
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={() => setShowDeleteModal(true)}
                className="hero-action-subtle-danger"
              >
                Delete
              </Button>
            </div>

            <div className="hero-summary-panel-2x2">
              <div className="summary-grid-cell">
                <span className="cell-label">PRIMARY TRAINER</span>
                <span className="cell-value">{getPrimaryTrainerForBootcamp(bootcamp.id, bootcamp.primaryTrainerName)}</span>
              </div>

              <div className="summary-grid-cell">
                <span className="cell-label">COORDINATOR</span>
                <span className="cell-value">{bootcamp.coordinatorName}</span>
              </div>

              <div className="summary-grid-cell">
                <span className="cell-label">DURATION</span>
                <span className="cell-value">{bootcamp.startDate} – {bootcamp.endDate}</span>
              </div>

              <div className="summary-grid-cell">
                <span className="cell-label">LEARNING TRACK</span>
                <span className="cell-value accent-teal">Foundation → Track Split</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. KPI ROW (4 Equal MetricCards) */}
      <div className="kpi-cards-grid grid-4-cols mt-4">
        <MetricCard
          label="Total Trainees"
          value={enrollments.length}
          subtext="Active cohort size"
          icon={<Users size={18} />}
          variant="cyan"
        />
        <MetricCard
          label="Total Modules"
          value={modules.length}
          subtext="Curriculum scope"
          icon={<BookOpen size={18} />}
          variant="indigo"
        />
        <MetricCard
          label="Overall Progress"
          value={`${bootcamp.progressPercent}%`}
          subtext="Completion rate"
          icon={<CheckCircle2 size={18} />}
          variant="green"
        />
        <MetricCard
          label="Attendance Rate"
          value={`${bootcamp.attendancePercent}%`}
          subtext="Average participation"
          icon={<Calendar size={18} />}
          variant="amber"
        />
      </div>

      {/* 3. ANIMATED TABS BAR */}
      <div className="mt-4">
        <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* 4. OVERVIEW TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="overview-two-cards-grid mt-4">
          <GlassCard variant="default" padding="lg" className="program-info-card">
            <h3 className="ui-section-title mb-4">Program Information</h3>
            <div className="info-definition-grid">
              <div className="def-cell">
                <span className="def-label">Bootcamp Name</span>
                <span className="def-val font-bold">{bootcamp.name}</span>
              </div>
              <div className="def-cell">
                <span className="def-label">Program Code</span>
                <span className="def-val code-chip">{bootcamp.code}</span>
              </div>
              <div className="def-cell">
                <span className="def-label">Program Type</span>
                <span className="def-val font-medium">{bootcamp.bootcampType}</span>
              </div>
              <div className="def-cell">
                <span className="def-label">Program Year</span>
                <span className="def-val font-medium">{bootcamp.bootcampYear}</span>
              </div>
              <div className="def-cell">
                <span className="def-label">Primary Trainer</span>
                <span className="def-val font-semibold text-teal-700">{bootcamp.primaryTrainerName}</span>
              </div>
              <div className="def-cell">
                <span className="def-label">Coordinator</span>
                <span className="def-val font-semibold text-indigo-700">{bootcamp.coordinatorName}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="default" padding="lg" className="learning-progress-card">
            <h3 className="ui-section-title mb-4">Learning Progress</h3>
            <div className="info-definition-grid">
              <div className="def-cell">
                <span className="def-label">Overall Progress</span>
                <span className="def-val text-teal-600 font-bold text-lg">{bootcamp.progressPercent}%</span>
                <ProgressBar value={bootcamp.progressPercent} color="cyan" height={8} className="mt-2" />
              </div>
              <div className="def-cell">
                <span className="def-label">Attendance Rate</span>
                <span className="def-val text-indigo-600 font-bold text-lg">{bootcamp.attendancePercent}%</span>
                <ProgressBar value={bootcamp.attendancePercent} color="indigo" height={8} className="mt-2" />
              </div>
              <div className="def-cell mt-2">
                <span className="def-label">Modules Completed</span>
                <span className="def-val font-bold">{modules.filter((m) => m.status === 'Completed').length} / {modules.length}</span>
              </div>
              <div className="def-cell mt-2">
                <span className="def-label">Trainees Enrolled</span>
                <span className="def-val font-bold">{enrollments.length}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* 5. TRAINEES TAB */}
      {activeTab === 'trainees' && (
        <div className="tab-content-wrapper mt-4">
          <div className="tab-toolbar flex items-center justify-between">
            <SearchInput
              value={traineeSearch}
              onChange={setTraineeSearch}
              placeholder="Search trainees..."
              className="max-w-md"
            />

            <Button
              variant="primary"
              icon={<UserPlus size={16} />}
              onClick={() => setShowAddTraineesModal(true)}
            >
              Add Trainees
            </Button>
          </div>

          <div className="bootcamp-table-wrapper mt-3">
            <div className="table-responsive-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Trainee Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Progress</th>
                    <th>Attendance</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-table-cell">
                        No trainees assigned.
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((e) => (
                      <tr key={e.id} className="table-row-hover">
                        <td><span className="code-chip">{e.trainee.employeeId}</span></td>
                        <td className="font-bold">{e.trainee.name}</td>
                        <td className="text-secondary-cell">{e.trainee.email}</td>
                        <td className="text-muted-cell">{e.trainee.role}</td>
                        <td>{e.progressPercent}%</td>
                        <td>{e.attendancePercent}%</td>
                        <td><StatusBadge status={e.enrollmentStatus} /></td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="action-icon-danger-btn"
                            onClick={() => setRemovingTraineeId(e.traineeId)}
                            title="Remove Trainee from Bootcamp"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODULES TAB */}
      {activeTab === 'modules' && (
        <div className="tab-content-wrapper mt-4">
          <div className="tab-toolbar flex justify-end">
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setShowAddModuleModal(true)}
            >
              Add Module
            </Button>
          </div>

          <div className="bootcamp-table-wrapper mt-3">
            <div className="table-responsive-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Module Name</th>
                    <th>Planned Duration</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-table-cell">
                        No curriculum modules configured yet.
                      </td>
                    </tr>
                  ) : (
                    modules.map((mod, idx) => (
                      <tr key={mod.id} className="table-row-hover">
                        <td className="font-bold">#{mod.sequence}</td>
                        <td>
                          <div className="module-title-block">
                            <span className="module-name font-bold">{mod.name}</span>
                            <span className="module-desc text-xs text-muted block">{mod.description}</span>
                          </div>
                        </td>
                        <td className="text-secondary-cell">{mod.plannedDuration}</td>
                        <td><StatusBadge status={mod.status} /></td>
                        <td className="text-right">
                          <div className="module-actions-row flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="icon-action-btn-sm"
                              disabled={idx === 0}
                              onClick={() => reorderModules(bootcamp.id, idx, idx - 1)}
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              className="icon-action-btn-sm"
                              disabled={idx === modules.length - 1}
                              onClick={() => reorderModules(bootcamp.id, idx, idx + 1)}
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              className="icon-action-btn-sm"
                              onClick={() => setEditingModule(mod)}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              className="action-icon-danger-btn"
                              onClick={() => setDeletingModuleId(mod.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. SESSIONS TAB */}
      {activeTab === 'sessions' && (
        <div className="tab-content-wrapper mt-4">
          <div className="bootcamp-table-wrapper">
            <div className="table-responsive-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Session Title</th>
                    <th>Module</th>
                    <th>Trainer</th>
                    <th>Date &amp; Time</th>
                    <th>Attendance</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bootcampSessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-table-cell">
                        No sessions scheduled.
                      </td>
                    </tr>
                  ) : (
                    bootcampSessions.map((s) => (
                      <tr key={s.id} className="table-row-hover">
                        <td className="font-bold">{s.title}</td>
                        <td className="text-secondary-cell">{s.moduleName}</td>
                        <td>{s.trainerName}</td>
                        <td className="text-muted-cell">{s.sessionDate} • {s.startTime} – {s.endTime}</td>
                        <td>
                          {s.attendanceRecorded ? (
                            <span className="att-count-pill">{s.attendedCount}/{s.totalEnrolled}</span>
                          ) : (
                            <span className="att-not-recorded text-muted">Not Recorded</span>
                          )}
                        </td>
                        <td><StatusBadge status={s.status} /></td>
                        <td className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onOpenRecordAttendance && onOpenRecordAttendance(s.id)}
                          >
                            Attendance
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showEditModal && (
        <CreateBootcampModal initialData={bootcamp} onClose={() => setShowEditModal(false)} />
      )}

      {showAddTraineesModal && (
        <TraineeSelectionModal
          allTrainees={allTrainees}
          selectedTraineeIds={enrollments.map((e) => e.traineeId)}
          onConfirm={(updatedIds) => addTraineesToBootcamp(bootcamp.id, updatedIds)}
          onClose={() => setShowAddTraineesModal(false)}
        />
      )}

      {showAddModuleModal && (
        <AddModuleModal
          existingCount={modules.length}
          onSave={(modData) => addModuleToBootcamp(bootcamp.id, modData)}
          onClose={() => setShowAddModuleModal(false)}
        />
      )}

      {editingModule && (
        <AddModuleModal
          initialData={editingModule}
          existingCount={modules.length}
          onSave={(modData) => updateModule(bootcamp.id, editingModule.id, modData)}
          onClose={() => setEditingModule(null)}
        />
      )}

      {removingTraineeId && (
        <ArchiveConfirmModal
          title="Remove Trainee from Bootcamp?"
          message="Are you sure you want to remove this trainee from this bootcamp cohort enrollment? The employee record will not be permanently deleted."
          confirmLabel="Remove Trainee"
          onConfirm={() => removeTraineeFromBootcamp(bootcamp.id, removingTraineeId)}
          onClose={() => setRemovingTraineeId(null)}
        />
      )}

      {deletingModuleId && (
        <ArchiveConfirmModal
          title="Delete Learning Module?"
          message="Are you sure you want to delete this module from the curriculum sequence?"
          confirmLabel="Delete Module"
          onConfirm={() => deleteModule(bootcamp.id, deletingModuleId)}
          onClose={() => setDeletingModuleId(null)}
        />
      )}

      {showDeleteModal && (
        <ArchiveConfirmModal
          title={`Delete Bootcamp — ${bootcamp.name}`}
          message="Are you sure you want to permanently delete this bootcamp cohort? All associated modules and trainee assignments will be removed. This action cannot be undone."
          confirmLabel="Delete Cohort"
          onConfirm={() => {
            deleteBootcamp(bootcamp.id);
            onBack();
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};
