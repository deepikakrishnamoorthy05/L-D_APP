import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, RefreshCw, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { skillIntelligenceService } from '../../services/skillIntelligenceService';

interface ReadinessSimulatorModalProps {
  onClose: () => void;
}

export const ReadinessSimulatorModal: React.FC<ReadinessSimulatorModalProps> = ({ onClose }) => {
  const trainees = skillIntelligenceService.getTrainees();

  // Selected trainee state
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(trainees[0]?.traineeId || 'te-1');

  const selectedTrainee = trainees.find((t) => t.traineeId === selectedTraineeId) || trainees[0];

  // Simulator Sliders (Local Temporary State Only)
  const [databricksVal, setDatabricksVal] = useState<number>(selectedTrainee.skills.Databricks || 65);
  const [dbtVal, setDbtVal] = useState<number>(selectedTrainee.skills.dbt || 52);
  const [assessmentVal, setAssessmentVal] = useState<number>(selectedTrainee.assessmentScore || 82);

  // Sync sliders when trainee selection changes
  const handleSelectTrainee = (tId: string) => {
    setSelectedTraineeId(tId);
    const t = trainees.find((item) => item.traineeId === tId) || trainees[0];
    setDatabricksVal(t.skills.Databricks || 65);
    setDbtVal(t.skills.dbt || 52);
    setAssessmentVal(t.assessmentScore || 82);
  };

  const handleReset = () => {
    setDatabricksVal(selectedTrainee.skills.Databricks || 65);
    setDbtVal(selectedTrainee.skills.dbt || 52);
    setAssessmentVal(selectedTrainee.assessmentScore || 82);
  };

  // Calculate dynamic simulation using shared intelligence logic
  const simResult = skillIntelligenceService.simulateReadiness(selectedTraineeId, {
    Databricks: databricksVal,
    dbt: dbtVal,
    assessmentScore: assessmentVal,
  });

  return (
    <AnimatePresence>
      <div className="modal-backdrop-overlay" role="dialog" aria-modal="true">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.22 }}
          className="modal-container-card readiness-simulator-modal max-w-2xl w-full"
        >
          {/* Modal Header */}
          <header className="simulator-modal-header">
            <div className="header-badge-row">
              <span className="ai-intel-pill">
                <Zap size={14} className="text-amber-500" />
                <span>WHAT-IF READINESS SIMULATOR</span>
              </span>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="header-title-group mt-2">
              <h2>Readiness What-If Simulator</h2>
              <p className="subtitle">
                Explore how targeted skill improvement could affect trainee readiness.
              </p>
            </div>

            {/* Simulation Only Notice Banner */}
            <div className="simulation-notice-banner mt-3">
              <ShieldAlert size={15} className="text-amber-600 flex-shrink-0" />
              <span>{simResult.isSimulationOnlyNotice}</span>
            </div>
          </header>

          {/* Modal Body */}
          <div className="modal-body-scroll p-4">
            {/* Step 1: Trainee Select */}
            <div className="form-group mb-4">
              <label className="form-label font-bold">Select Trainee for Simulation</label>
              <select
                className="asm-select-field w-full"
                value={selectedTraineeId}
                onChange={(e) => handleSelectTrainee(e.target.value)}
              >
                {trainees.map((t) => (
                  <option key={t.traineeId} value={t.traineeId}>
                    {t.name} ({t.employeeId}) • Current Readiness: {t.overallReadinessScore}%
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Sliders Section */}
            <div className="sliders-section-card p-3 rounded-xl border mb-4">
              <h4 className="card-title-sm mb-3">WHAT-IF SKILL IMPROVEMENTS</h4>

              {/* Slider 1: Databricks */}
              <div className="slider-row mb-3">
                <div className="slider-label-row">
                  <span className="lbl font-semibold">Databricks Proficiency</span>
                  <span className="val-delta">
                    {selectedTrainee.skills.Databricks}% → <strong>{databricksVal}%</strong>
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={databricksVal}
                  onChange={(e) => setDatabricksVal(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: dbt Core */}
              <div className="slider-row mb-3">
                <div className="slider-label-row">
                  <span className="lbl font-semibold">dbt Core Transformation</span>
                  <span className="val-delta">
                    {selectedTrainee.skills.dbt}% → <strong>{dbtVal}%</strong>
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={dbtVal}
                  onChange={(e) => setDbtVal(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Assessment Performance */}
              <div className="slider-row mb-2">
                <div className="slider-label-row">
                  <span className="lbl font-semibold">Assessment Performance</span>
                  <span className="val-delta">
                    {selectedTrainee.assessmentScore}% → <strong>{assessmentVal}%</strong>
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={assessmentVal}
                  onChange={(e) => setAssessmentVal(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  className="ui-btn-secondary sm inline-flex items-center gap-1"
                  onClick={handleReset}
                >
                  <RefreshCw size={13} /> Reset Simulation
                </button>
              </div>
            </div>

            {/* Simulation Comparison Result */}
            <div className="projection-result-card p-4 rounded-xl border bg-teal-50/50">
              <div className="result-cols-row flex items-center justify-around text-center">
                <div className="res-col">
                  <span className="res-lbl text-xs font-bold text-slate-500 uppercase">CURRENT READINESS</span>
                  <div className="res-val text-2xl font-black text-slate-800 mt-1">
                    {simResult.currentReadiness}%
                  </div>
                  <span className="status-subtext text-xs text-slate-500">{simResult.currentStatus}</span>
                </div>

                <ArrowRight size={24} className="text-teal-600" />

                <div className="res-col">
                  <span className="res-lbl text-xs font-bold text-teal-700 uppercase">PROJECTED READINESS</span>
                  <div className="res-val text-3xl font-black text-teal-700 mt-1">
                    {simResult.projectedReadiness}%
                  </div>
                  <span className="status-subtext text-xs font-bold text-emerald-600">
                    {simResult.projectedStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Suggested Development Focus */}
            <div className="suggested-focus-card mt-4 p-3 rounded-xl border">
              <h4 className="title-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-teal-600" />
                <span>SUGGESTED DEVELOPMENT FOCUS</span>
              </h4>
              <ul className="focus-list text-xs space-y-2">
                {simResult.suggestedFocus.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={14} className="text-teal-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Modal Footer */}
          <footer className="simulator-modal-footer p-3 border-t flex justify-end gap-2">
            <button type="button" className="ui-btn-primary sm" onClick={onClose}>
              Done Simulating
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
