import React from 'react';
import { motion } from 'framer-motion';
import { X, Award, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { CertificationCatalogItem } from '../../services/certificationIntelligenceService';
import './CertificationDetailsModal.css';

interface CertificationDetailsModalProps {
  certification: CertificationCatalogItem;
  recommendations: any[];
  onClose: () => void;
  onSelectCandidateReadiness: (traineeId: string) => void;
  onOpenTracker: () => void;
  onOpenRecommendations: () => void;
}

export const CertificationDetailsModal: React.FC<CertificationDetailsModalProps> = ({
  certification,
  recommendations,
  onClose,
  onSelectCandidateReadiness,
  onOpenTracker,
  onOpenRecommendations,
}) => {
  const matchingCandidates = recommendations.filter((r) => r.examCode === certification.examCode);

  return (
    <div className="certification-modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="certification-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP-RIGHT ISOLATED CIRCULAR CLOSE BUTTON */}
        <button
          type="button"
          className="certification-modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* 1. HEADER */}
        <header className="certification-modal-header">
          <div className="certification-heading">
            <div className="provider-row">
              <span className="provider-pill">{certification.provider} Certification</span>
              <span className="exam-code-pill">{certification.examCode}</span>
            </div>

            <h2>{certification.title}</h2>

            <div className="cert-meta-row">
              <span>{certification.product}</span>
              <span className="dot-separator">•</span>
              <span>{certification.role}</span>
              <span className="dot-separator">•</span>
              <span>{certification.level}</span>
            </div>
          </div>

          <div className="cert-seal-box">
            <Award size={24} className="text-teal-700" />
            <span className="text-[10px] font-black text-teal-900 mt-0.5">{certification.examCode}</span>
            <span className="text-[8px] font-extrabold text-teal-700 uppercase">MICROSOFT</span>
          </div>
        </header>

        {/* 2. SUMMARY METRICS GRID */}
        <section className="certification-summary-grid">
          <div className="metric-card slate">
            <span className="metric-num">4</span>
            <div className="metric-label-stack">
              <span>Recommended</span>
              <span>Trainees</span>
            </div>
          </div>

          <div className="metric-card teal">
            <span className="metric-num">2</span>
            <div className="metric-label-stack">
              <span>Ready</span>
              <span>Candidates</span>
            </div>
          </div>

          <div className="metric-card amber">
            <span className="metric-num">1</span>
            <div className="metric-label-stack">
              <span>Preparing</span>
              <span>Trainee</span>
            </div>
          </div>

          <div className="metric-card emerald">
            <span className="metric-num">1</span>
            <div className="metric-label-stack">
              <span>Certified</span>
              <span>Credential</span>
            </div>
          </div>
        </section>

        {/* 3. CAPABILITY SECTION LAYOUT */}
        <section className="certification-capability-section">
          {/* LEFT: CORE CAPABILITY CHIPS */}
          <div className="capability-box">
            <div className="capability-section-title">
              <CheckCircle2 size={15} /> CORE CAPABILITIES
            </div>
            <div className="capability-chips">
              {certification.capabilityAreas.map((skill) => (
                <span key={skill} className="capability-chip">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: CAPABILITY EMPHASIS CHART */}
          <div className="capability-box">
            <div className="capability-section-title">
              <TrendingUp size={15} /> CAPABILITY EMPHASIS
            </div>
            <div className="skill-emphasis-stack">
              {[
                { skill: 'SQL & Data Pipelines', weight: 90 },
                { skill: 'PySpark / Dataflows', weight: 85 },
                { skill: 'Lakehouse Transformation', weight: 82 },
                { skill: 'Monitoring & Optimization', weight: 75 },
              ].map((item) => (
                <div key={item.skill} className="skill-emphasis-row">
                  <div className="skill-emphasis-header">
                    <span>{item.skill}</span>
                    <strong>{item.weight}%</strong>
                  </div>
                  <div className="skill-track">
                    <div className="skill-fill" style={{ width: `${item.weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. TOP READY CANDIDATES SECTION */}
        <section className="certification-candidates-section">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">TOP READY CANDIDATES</span>
            <span className="text-xs text-slate-500 font-semibold">Trainees closest to {certification.examCode} readiness</span>
          </div>

          <div className="certification-candidate-grid">
            {matchingCandidates.map((cand) => (
              <div key={cand.traineeId} className="candidate-card-item">
                <div className="candidate-identity-row">
                  <div className="candidate-avatar-48">{cand.avatarInitials}</div>
                  <div className="candidate-info-stack">
                    <span className="candidate-name-txt">{cand.name}</span>
                    <span className="candidate-empid-txt">{cand.employeeId} • {cand.bootcampName}</span>
                  </div>
                  <span className="candidate-score-num">{cand.readinessScore}%</span>
                </div>

                <div className="skill-track">
                  <div className="skill-fill bg-emerald-600" style={{ width: `${cand.readinessScore}%` }} />
                </div>

                <div className="candidate-evidence-box">
                  <div><strong>Strongest:</strong> {cand.strongEvidence[0]?.skill || 'Python Core'} ({cand.strongEvidence[0]?.score || 82}%)</div>
                  {cand.developmentGaps.length > 0 && (
                    <div><strong>Main Gap:</strong> {cand.developmentGaps[0]?.skill} ({cand.developmentGaps[0]?.score}%)</div>
                  )}
                </div>

                <button
                  type="button"
                  className="candidate-action-btn"
                  onClick={() => {
                    onClose();
                    onSelectCandidateReadiness(cand.traineeId);
                  }}
                >
                  View Readiness Breakdown &rarr;
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CERTIFICATION READINESS INSIGHT CARD */}
        <section className="certification-insight-card">
          <div className="insight-header-title">
            CERTIFICATION READINESS INSIGHT
          </div>
          <p className="m-0 text-slate-700">
            2 trainees are currently closest to {certification.examCode} readiness. Cohort main development focus is on Lakehouse Monitoring and PySpark Optimization.
          </p>
          <div className="insight-action-pill">
            Suggested L&amp;D Action: Schedule targeted preparation labs before booking exam vouchers.
          </div>
        </section>

        {/* 6. STICKY MODAL FOOTER */}
        <footer className="certification-modal-footer">
          <button type="button" className="footer-btn-neutral" onClick={onClose}>
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="footer-btn-neutral"
              onClick={() => {
                onClose();
                onOpenRecommendations();
              }}
            >
              View All Candidates
            </button>
            <button
              type="button"
              className="footer-btn-primary"
              onClick={() => {
                onClose();
                onOpenTracker();
              }}
            >
              Open Certification Tracker &rarr;
            </button>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};
