import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Sparkles, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import { skillIntelligenceService } from '../../services/skillIntelligenceService';

interface CompareTraineesModalProps {
  onClose: () => void;
  onViewEvidence?: (traineeId: string) => void;
}

export const CompareTraineesModal: React.FC<CompareTraineesModalProps> = ({
  onClose,
  onViewEvidence,
}) => {
  const allTrainees = skillIntelligenceService.getTrainees();

  // Selected trainee IDs (Default: top 3)
  const [selectedIds, setSelectedIds] = useState<string[]>([
    allTrainees[2]?.traineeId || 'te-5', // Madhan Raj
    allTrainees[1]?.traineeId || 'te-2', // Saran Mani
    allTrainees[0]?.traineeId || 'te-1', // Kaviram
  ]);

  const toggleTrainee = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const comparisonData = skillIntelligenceService.compareTrainees(selectedIds);

  return (
    <AnimatePresence>
      <div className="modal-backdrop-overlay" role="dialog" aria-modal="true">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.22 }}
          className="modal-container-card compare-trainees-modal max-w-4xl w-full"
        >
          {/* Modal Header */}
          <header className="compare-modal-header">
            <div className="header-badge-row">
              <span className="ai-intel-pill">
                <Users size={14} className="text-teal-600" />
                <span>TRAINEE COMPARISON INTELLIGENCE</span>
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
              <h2>Compare Trainees</h2>
              <p className="subtitle">
                Compare skill, readiness and performance evidence side-by-side. Select up to 3 trainees.
              </p>
            </div>

            {/* Trainee Selection Selector Pills */}
            <div className="trainee-selector-pills-row mt-3">
              {allTrainees.map((t) => {
                const isSelected = selectedIds.includes(t.traineeId);
                return (
                  <button
                    key={t.traineeId}
                    type="button"
                    className={`trainee-select-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleTrainee(t.traineeId)}
                  >
                    <span className="avatar-chip">{t.avatarInitials}</span>
                    <span className="pill-name">{t.name}</span>
                    {isSelected && <CheckCircle2 size={14} className="check-icon" />}
                  </button>
                );
              })}
            </div>
          </header>

          {/* Modal Body: Comparison Table */}
          <div className="modal-body-scroll p-4">
            <div className="comparison-table-wrapper">
              <table className="comparison-matrix-table">
                <thead>
                  <tr>
                    <th className="metric-col-header">METRIC / SKILL</th>
                    {comparisonData.trainees.map((t) => (
                      <th key={t.traineeId} className="trainee-col-header">
                        <div className="trainee-header-cell">
                          <div className="avatar-circle-36">{t.avatarInitials}</div>
                          <span className="trainee-cell-name">{t.name}</span>
                          <span className="trainee-cell-emp">{t.employeeId}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.metricsRows.map((row) => (
                    <tr key={row.key} className={row.key === 'overallReadinessScore' ? 'highlight-row' : ''}>
                      <td className="row-label-td">{row.label}</td>
                      {comparisonData.trainees.map((t) => {
                        let val: any = 0;
                        if (row.isSkill) {
                          val = t.skills[row.key as keyof typeof t.skills] || 0;
                        } else {
                          val = t[row.key as keyof typeof t] || 0;
                        }

                        const displayVal = `${val}${row.suffix || '%'}`;
                        const isHigh = typeof val === 'number' && val >= 85;

                        return (
                          <td key={t.traineeId} className="metric-val-td">
                            <span className={`val-chip ${isHigh ? 'high-performer' : ''}`}>
                              {displayVal}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Suitability / Best Fit Summary Section */}
            <div className="suitability-summary-card mt-4">
              <h4 className="card-section-title">
                <Sparkles size={15} className="text-teal-600" />
                <span>CAPABILITY SUITABILITY SUMMARY</span>
              </h4>

              <div className="suitability-grid-3col mt-3">
                <div className="suitability-box">
                  <span className="lbl">Databricks Project Fit</span>
                  <strong className="val text-teal-700">{comparisonData.suitability.databricksProject}</strong>
                </div>

                <div className="suitability-box">
                  <span className="lbl">SQL Architecture Fit</span>
                  <strong className="val text-indigo-700">{comparisonData.suitability.sqlArchitecture}</strong>
                </div>

                <div className="suitability-box">
                  <span className="lbl">Data Modeling Fit</span>
                  <strong className="val text-emerald-700">{comparisonData.suitability.dataModeling}</strong>
                </div>
              </div>

              <div className="disclaimer-note mt-3">
                <span>{comparisonData.disclaimer}</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <footer className="compare-modal-footer">
            <div className="flex items-center gap-2">
              {comparisonData.trainees.map((t) => (
                <button
                  key={t.traineeId}
                  type="button"
                  className="ui-btn-secondary sm"
                  onClick={() => {
                    if (onViewEvidence) onViewEvidence(t.traineeId);
                  }}
                >
                  Evidence: {t.name.split(' ')[0]} →
                </button>
              ))}
            </div>
            <button type="button" className="ui-btn-primary sm" onClick={onClose}>
              Close Comparison
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
