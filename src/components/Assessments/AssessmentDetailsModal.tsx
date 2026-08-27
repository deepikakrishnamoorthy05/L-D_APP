import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, TrendingUp, BarChart2, Users, ArrowUpRight } from 'lucide-react';
import { Assessment } from '../../types/assessment';
import { useAssessments } from '../../context/AssessmentContext';

interface AssessmentDetailsModalProps {
  assessment: Assessment;
  onClose: () => void;
  onOpenEnterScores?: () => void;
}

export const AssessmentDetailsModal: React.FC<AssessmentDetailsModalProps> = ({
  assessment,
  onClose,
  onOpenEnterScores,
}) => {
  const { resultsMap, publishResults } = useAssessments();
  const results = resultsMap[assessment.id] || [];

  // Distribution buckets calculation
  const excellentCount = results.filter((r) => r.percentage >= 90).length;
  const goodCount = results.filter((r) => r.percentage >= 75 && r.percentage < 90).length;
  const passCount = results.filter((r) => r.percentage >= 60 && r.percentage < 75).length;
  const needAttentionCount = results.filter((r) => r.percentage < 60).length;

  const total = results.length || 1;
  const excellentPct = Math.round((excellentCount / total) * 100);
  const goodPct = Math.round((goodCount / total) * 100);
  const passPct = Math.round((passCount / total) * 100);
  const needAttentionPct = Math.round((needAttentionCount / total) * 100);

  return (
    <div className="modal-backdrop-overlay" role="dialog" aria-modal="true">
      <div className="modal-container-card max-w-5xl">
        {/* Modal Header */}
        <header className="modal-header-bar">
          <div className="modal-header-title">
            <Award size={22} className="header-icon-gradient" />
            <div>
              <h2>{assessment.name}</h2>
              <div className="badge-row mt-1">
                <span className="code-chip lg">{assessment.type}</span>
                <span className="track-badge foundation">{assessment.track}</span>
                <span className="bootcamp-status-badge status-completed">{assessment.status}</span>
              </div>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {/* Modal Body */}
        <div className="modal-body-scroll">
          {/* Metadata Summary Bar */}
          <div className="details-meta-bar mb-4">
            <div className="meta-item">
              <span className="meta-label">Bootcamp:</span>
              <span className="meta-val">{assessment.bootcampName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Module:</span>
              <span className="meta-val">{assessment.moduleName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Evaluator:</span>
              <span className="meta-val">{assessment.evaluatorName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Date:</span>
              <span className="meta-val">{assessment.date}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Total Marks:</span>
              <span className="meta-val">{assessment.totalMarks}</span>
            </div>
          </div>

          {/* Result Dashboard KPI Cards */}
          <div className="result-kpi-row grid-6-cols mb-4">
            <div className="kpi-card-compact text-center">
              <span className="kpi-label">Average Score</span>
              <div className="kpi-value text-cyan">{assessment.averageScore || 0}%</div>
              <span className="kpi-subtext">Cohort Average</span>
            </div>

            <div className="kpi-card-compact text-center">
              <span className="kpi-label">Pass Rate</span>
              <div className="kpi-value text-green">{assessment.passRate || 0}%</div>
              <span className="kpi-subtext">Passing Cohort</span>
            </div>

            <div className="kpi-card-compact text-center">
              <span className="kpi-label">Highest Score</span>
              <div className="kpi-value text-indigo">{assessment.highestScore || 0}%</div>
              <span className="kpi-subtext">Top Mark</span>
            </div>

            <div className="kpi-card-compact text-center">
              <span className="kpi-label">Lowest Score</span>
              <div className="kpi-value text-orange">{assessment.lowestScore || 0}%</div>
              <span className="kpi-subtext">Minimum Mark</span>
            </div>

            <div className="kpi-card-compact text-center">
              <span className="kpi-label">Evaluated</span>
              <div className="kpi-value text-purple">{results.length}</div>
              <span className="kpi-subtext">Trainees Evaluated</span>
            </div>

            <div className="kpi-card-compact text-center">
              <span className="kpi-label">Need Attention</span>
              <div className="kpi-value text-rose">{assessment.needAttentionCount || 0}</div>
              <span className="kpi-subtext">Below Pass Mark</span>
            </div>
          </div>

          {/* Result Distribution Bar Visualization */}
          <div className="details-section-card mb-4">
            <h3 className="section-heading mb-3">Score Distribution Breakdown</h3>
            <div className="distribution-bars-container">
              <div className="dist-bar-item">
                <div className="dist-bar-label">
                  <span>90–100% (Excellent)</span>
                  <span>{excellentCount} Trainees ({excellentPct}%)</span>
                </div>
                <div className="dist-track">
                  <div className="dist-fill bg-cyan" style={{ width: `${excellentPct}%` }} />
                </div>
              </div>

              <div className="dist-bar-item">
                <div className="dist-bar-label">
                  <span>75–89% (Good)</span>
                  <span>{goodCount} Trainees ({goodPct}%)</span>
                </div>
                <div className="dist-track">
                  <div className="dist-fill bg-indigo" style={{ width: `${goodPct}%` }} />
                </div>
              </div>

              <div className="dist-bar-item">
                <div className="dist-bar-label">
                  <span>60–74% (Pass)</span>
                  <span>{passCount} Trainees ({passPct}%)</span>
                </div>
                <div className="dist-track">
                  <div className="dist-fill bg-green" style={{ width: `${passPct}%` }} />
                </div>
              </div>

              <div className="dist-bar-item">
                <div className="dist-bar-label">
                  <span>Below 60% (Needs Attention)</span>
                  <span>{needAttentionCount} Trainees ({needAttentionPct}%)</span>
                </div>
                <div className="dist-track">
                  <div className="dist-fill bg-rose" style={{ width: `${needAttentionPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Trainee Results Breakdown Table */}
          <div className="details-section-card">
            <h3 className="section-heading mb-3">Trainee Individual Evaluation Results</h3>
            <div className="table-responsive-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Trainee Name</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Result</th>
                    <th>Learning Status</th>
                    <th>Evaluator Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-table-cell">
                        No scores recorded for this assessment yet.
                      </td>
                    </tr>
                  ) : (
                    results.map((r) => (
                      <tr key={r.id} className="table-row-hover">
                        <td>
                          <span className="code-chip">{r.employeeId}</span>
                        </td>
                        <td className="font-weight-bold">{r.traineeName}</td>
                        <td>{r.score} / {assessment.totalMarks}</td>
                        <td className="font-weight-bold">{r.percentage}%</td>
                        <td>
                          <span className={`risk-tag ${r.result === 'Pass' ? 'risk-low' : 'risk-high'}`}>
                            {r.result}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`risk-tag ${
                              r.learningStatus === 'On Track'
                                ? 'risk-low'
                                : r.learningStatus === 'Needs Attention'
                                ? 'risk-medium'
                                : 'risk-high'
                            }`}
                          >
                            {r.learningStatus || 'On Track'}
                          </span>
                        </td>
                        <td className="text-secondary-cell text-sm">{r.evaluatorComment || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <footer className="modal-footer-bar justify-between">
          <button type="button" className="bootcamp-btn-secondary" onClick={onClose}>
            Close
          </button>

          <div className="footer-actions-right">
            {onOpenEnterScores && (
              <button type="button" className="bootcamp-btn-secondary" onClick={onOpenEnterScores}>
                Edit / Enter Scores
              </button>
            )}
            {assessment.status !== 'Published' && (
              <button
                type="button"
                className="bootcamp-btn-primary"
                onClick={() => {
                  publishResults(assessment.id);
                  onClose();
                }}
              >
                <CheckCircle2 size={16} /> Publish Results
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
