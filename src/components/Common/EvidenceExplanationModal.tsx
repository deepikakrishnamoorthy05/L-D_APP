import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { skillIntelligenceService } from '../../services/skillIntelligenceService';

interface EvidenceExplanationModalProps {
  traineeId: string;
  contextTitle?: string;
  onClose: () => void;
}

export const EvidenceExplanationModal: React.FC<EvidenceExplanationModalProps> = ({
  traineeId,
  contextTitle,
  onClose,
}) => {
  const data = skillIntelligenceService.getEvidenceExplanation(traineeId, contextTitle);

  return (
    <AnimatePresence>
      <div className="modal-backdrop-overlay" role="dialog" aria-modal="true">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="modal-container-card evidence-explanation-modal max-w-lg w-full"
        >
          {/* Modal Header */}
          <header className="evidence-modal-header">
            <div className="header-badge-row">
              <span className="ai-intel-pill">
                <Sparkles size={14} className="text-teal-600" />
                <span>INTELLIGENCE EVIDENCE</span>
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

            <div className="trainee-header-block mt-2">
              <h2 className="trainee-name-title">{data.name}</h2>
              <div className="trainee-meta-chips">
                <span className="emp-id-chip">{data.employeeId}</span>
                <span className="dot-sep">•</span>
                <span className="dept-chip">{data.department}</span>
                <span className="dot-sep">•</span>
                <span className="bootcamp-chip">{data.bootcampName}</span>
              </div>
            </div>

            {/* Context Match Card */}
            <div className="match-score-glass-banner mt-3">
              <div className="banner-left">
                <span className="context-label">{data.contextTitle}</span>
                <div className="score-val-huge">{data.projectMatchPercent}%</div>
              </div>
              <div className="banner-right">
                <span className={`status-badge-refined ${data.readinessStatus === 'Project Ready' ? 'ready' : data.readinessStatus === 'On Track' ? 'on-track' : 'attention'}`}>
                  {data.readinessStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </header>

          {/* Modal Body: Evidence Grid */}
          <div className="modal-body-content p-4">
            <h4 className="section-subtitle-sm">
              <ShieldCheck size={14} className="text-teal-600" />
              <span>EVIDENCE BREAKDOWN</span>
            </h4>

            <div className="evidence-grid-2col mt-2">
              {data.evidence.map((item) => (
                <div key={item.label} className="evidence-item-tile">
                  <span className="item-label">{item.label}</span>
                  <strong className="item-value">{item.value}</strong>
                </div>
              ))}
            </div>

            {/* Development Gap */}
            <div className="dev-gap-alert-card mt-3">
              <div className="card-top-alert">
                <AlertCircle size={15} className="text-rose-600" />
                <strong className="alert-title">DEVELOPMENT GAP</strong>
              </div>
              <p className="gap-desc-text">{data.developmentGap}</p>
            </div>

            {/* AI Recommendation Rationale */}
            <div className="recommendation-rationale-box mt-3">
              <h4 className="box-title">
                <Award size={14} className="text-teal-600" />
                <span>RECOMMENDATION</span>
              </h4>
              <p className="rationale-text">{data.recommendationText}</p>
            </div>
          </div>

          {/* Modal Footer Disclaimer */}
          <footer className="evidence-modal-footer">
            <span className="disclaimer-text">{data.disclaimer}</span>
            <button type="button" className="ui-btn-primary sm" onClick={onClose}>
              Close Explanation
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
