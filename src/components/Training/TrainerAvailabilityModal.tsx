import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Mail,
  Send,
} from 'lucide-react';
import { TrainingPlan } from '../../types/training';
import { useTraining } from '../../context/TrainingContext';

interface TrainerAvailabilityModalProps {
  plan: TrainingPlan;
  onClose: () => void;
  onOpenScheduler: (plan: TrainingPlan, trainerId: string) => void;
}

export const TrainerAvailabilityModal: React.FC<TrainerAvailabilityModalProps> = ({
  plan,
  onClose,
  onOpenScheduler,
}) => {
  const { availabilityRequests, trainers, updateTrainerResponse, selectTrainerAndReadySchedule } =
    useTraining();

  const planRequests = availabilityRequests.filter((r) => r.trainingPlanId === plan.id);

  const [selectedTrainerId, setSelectedTrainerId] = useState<string>(
    plan.assignedTrainerId || (planRequests.find((r) => r.response === 'Available')?.trainerId || '')
  );

  const handleSimulateResponse = (requestId: string, status: 'Available' | 'Not Available') => {
    updateTrainerResponse(requestId, status);
  };

  const handleConfirmSelectionAndSchedule = () => {
    if (!selectedTrainerId) return;
    selectTrainerAndReadySchedule(plan.id, selectedTrainerId);
    onOpenScheduler(plan, selectedTrainerId);
  };

  return (
    <div className="tam-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="tam-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. HEADER SECTION */}
        <div className="tam-header">
          <div className="tam-header-left">
            <div className="tam-header-icon-box">
              <UserCheck size={24} />
            </div>
            <div>
              <span className="tam-eyebrow">
                TRAINER RESPONSES &amp; AVAILABILITY
              </span>
              <h2 className="tam-title">
                {plan.name}
              </h2>
              <div className="tam-subtitle">
                {plan.topic} • Track: <strong>{plan.track}</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="tam-close-btn"
            onClick={onClose}
            title="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. BODY SECTION */}
        <div className="tam-body">
          {/* INFO / CONTEXT BANNER */}
          <div className="tam-info-banner">
            <div className="tam-info-title-row">
              <Sparkles size={16} />
              <span>Demo Simulation Control</span>
            </div>
            <p className="tam-info-desc">
              Click <em>[Mark Available]</em> or <em>[Mark Not Available]</em> on any trainer card below to simulate real-time email responses.
            </p>

            {/* METADATA PILLS ROW */}
            <div className="tam-info-pills-row">
              <span className="tam-info-pill">
                <Send size={12} className="text-teal-600" />
                Requests Sent: <strong>{planRequests.length}</strong>
              </span>

              <span className="tam-info-pill">
                <Calendar size={12} className="text-teal-600" />
                Preferred Slot: <strong>{plan.preferredDate} ({plan.preferredTime || '15:00 - 16:00'})</strong>
              </span>
            </div>
          </div>

          {/* TRAINER CARDS LIST */}
          {planRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <Mail size={32} className="mx-auto text-slate-400 mb-2" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">No Requests Sent</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No availability requests active for this plan.
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className="tam-cards-list"
            >
              {planRequests.map((req) => {
                const isSelected = selectedTrainerId === req.trainerId;
                const isAvailable = req.response === 'Available';
                const isNotAvailable = req.response === 'Not Available';

                return (
                  <motion.div
                    key={req.id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className={`tam-card ${isSelected ? 'selected' : ''}`}
                  >
                    {/* CARD TOP ROW: AVATAR + TRAINER INFO + STATUS BADGE */}
                    <div className="tam-card-top">
                      <div className="tam-trainer-info-block">
                        <div className="tam-avatar">
                          {req.trainerName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="tam-name-row">
                            <h4 className="tam-trainer-name">
                              {req.trainerName}
                            </h4>
                            {isSelected && (
                              <span className="tam-selected-chip">
                                Selected Trainer
                              </span>
                            )}
                          </div>
                          <span className="tam-trainer-email">
                            {req.trainerEmail}
                          </span>
                        </div>
                      </div>

                      {/* STATUS BADGES */}
                      <div>
                        {req.response === 'Awaiting Response' && (
                          <span className="tam-status-badge awaiting">
                            <Clock size={13} /> Awaiting Response
                          </span>
                        )}
                        {isAvailable && (
                          <span className="tam-status-badge available">
                            <CheckCircle2 size={14} /> Available
                          </span>
                        )}
                        {isNotAvailable && (
                          <span className="tam-status-badge unavailable">
                            <XCircle size={14} /> Not Available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* METADATA TIMESTAMPS ROW */}
                    <div className="tam-card-meta">
                      Sent: <strong>{req.requestSentAt}</strong>
                      {req.respondedAt ? <> • Responded: <strong>{req.respondedAt}</strong></> : ''}
                    </div>

                    {/* ACTIONS ROW */}
                    <div className="tam-card-actions">
                      <button
                        type="button"
                        className="demo-btn-available"
                        onClick={() => handleSimulateResponse(req.id, 'Available')}
                      >
                        ✓ Mark Available (Demo)
                      </button>
                      <button
                        type="button"
                        className="demo-btn-unavailable"
                        onClick={() => handleSimulateResponse(req.id, 'Not Available')}
                      >
                        ✕ Mark Unavailable (Demo)
                      </button>

                      {isAvailable && (
                        <button
                          type="button"
                          className={isSelected ? 'demo-btn-selected-active' : 'demo-btn-select'}
                          onClick={() => setSelectedTrainerId(req.trainerId)}
                        >
                          {isSelected ? '✓ Selected Trainer' : 'Select Trainer'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* 3. FOOTER SECTION */}
        <div className="tam-footer">
          <button
            type="button"
            className="ui-button-secondary"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            disabled={!selectedTrainerId}
            onClick={handleConfirmSelectionAndSchedule}
            className="ui-button-primary"
          >
            <span>Continue to Scheduling</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
