import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Award, AlertTriangle, Save } from 'lucide-react';
import { Assessment, AssessmentResult } from '../../types/assessment';
import { useTrainees } from '../../context/TraineeContext';
import { useAssessments } from '../../context/AssessmentContext';

interface EnterScoresModalProps {
  assessment: Assessment;
  onClose: () => void;
}

interface ScoreRowState {
  traineeId: string;
  employeeId: string;
  traineeName: string;
  score: number | string;
  strengths: string;
  improvementAreas: string;
  evaluatorComment: string;
}

export const EnterScoresModal: React.FC<EnterScoresModalProps> = ({
  assessment,
  onClose,
}) => {
  const { trainees } = useTrainees();
  const { resultsMap, enterScores, completeAssessment } = useAssessments();

  const existingResults = resultsMap[assessment.id] || [];

  // Determine list of participant trainees
  const participantTrainees = trainees.filter((t) =>
    assessment.participantIds.includes(t.id)
  );

  // Initialize form rows state
  const [rows, setRows] = useState<ScoreRowState[]>(() => {
    return participantTrainees.map((t) => {
      const existing = existingResults.find((r) => r.traineeId === t.id);
      return {
        traineeId: t.id,
        employeeId: t.employeeId,
        traineeName: t.name,
        score: existing !== undefined ? existing.score : '',
        strengths: existing?.strengths || '',
        improvementAreas: existing?.improvementAreas || '',
        evaluatorComment: existing?.evaluatorComment || '',
      };
    });
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleScoreChange = (index: number, val: string) => {
    setValidationError(null);
    const newRows = [...rows];
    newRows[index].score = val;
    setRows(newRows);
  };

  const handleCommentChange = (index: number, val: string) => {
    const newRows = [...rows];
    newRows[index].evaluatorComment = val;
    setRows(newRows);
  };

  const handleSaveScores = (complete: boolean = false) => {
    // Validate scores
    for (let i = 0; i < rows.length; i++) {
      const numScore = Number(rows[i].score);
      if (rows[i].score === '' || isNaN(numScore)) {
        if (complete) {
          setValidationError(`Please enter a valid numeric score for ${rows[i].traineeName}.`);
          return;
        }
      } else if (numScore < 0 || numScore > assessment.totalMarks) {
        setValidationError(
          `Score for ${rows[i].traineeName} (${numScore}) must be between 0 and ${assessment.totalMarks}.`
        );
        return;
      }
    }

    const payload = rows
      .filter((r) => r.score !== '')
      .map((r) => ({
        traineeId: r.traineeId,
        score: Number(r.score),
        strengths: r.strengths,
        improvementAreas: r.improvementAreas,
        evaluatorComment: r.evaluatorComment,
      }));

    enterScores(assessment.id, payload);

    if (complete) {
      completeAssessment(assessment.id);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop-overlay" role="dialog" aria-modal="true">
      <div className="modal-container-card max-w-5xl">
        {/* Modal Header */}
        <header className="modal-header-bar">
          <div className="modal-header-title">
            <Award size={20} className="header-icon-gradient" />
            <div>
              <h2>Assessment Evaluation &amp; Score Entry</h2>
              <p className="subtitle">
                {assessment.name} • {assessment.moduleName} ({assessment.track})
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {/* Evaluation Metadata Bar */}
        <div className="evaluation-meta-banner">
          <div className="meta-chip">
            <span>Date:</span> <strong>{assessment.date}</strong>
          </div>
          <div className="meta-chip">
            <span>Evaluator:</span> <strong>{assessment.evaluatorName}</strong>
          </div>
          <div className="meta-chip">
            <span>Total Marks:</span> <strong>{assessment.totalMarks}</strong>
          </div>
          <div className="meta-chip">
            <span>Pass Mark:</span> <strong>{assessment.passingMarks} ({Math.round((assessment.passingMarks / assessment.totalMarks) * 100)}%)</strong>
          </div>
        </div>

        {validationError && (
          <div className="modal-error-banner" role="alert">
            <AlertTriangle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        {/* Score Entry Table */}
        <div className="modal-body-scroll p-0">
          <div className="table-responsive-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Trainee</th>
                  <th>Score (Max {assessment.totalMarks})</th>
                  <th>Percentage</th>
                  <th>Result</th>
                  <th>Evaluator Comment</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const numScore = Number(r.score);
                  const isValidNum = r.score !== '' && !isNaN(numScore);
                  const percentage = isValidNum ? Math.round((numScore / assessment.totalMarks) * 100) : 0;
                  const isPass = isValidNum && numScore >= assessment.passingMarks;

                  return (
                    <tr key={r.traineeId} className="table-row-hover">
                      <td>
                        <span className="code-chip">{r.employeeId}</span>
                      </td>
                      <td className="font-weight-bold">{r.traineeName}</td>
                      <td className="score-input-cell">
                        <input
                          ref={(el) => (inputRefs.current[idx] = el)}
                          type="number"
                          min={0}
                          max={assessment.totalMarks}
                          className="form-input score-input-field"
                          placeholder="Score"
                          value={r.score}
                          onChange={(e) => handleScoreChange(idx, e.target.value)}
                        />
                      </td>
                      <td>
                        <span className="percentage-display">
                          {isValidNum ? `${percentage}%` : '—'}
                        </span>
                      </td>
                      <td>
                        {isValidNum ? (
                          <span className={`risk-tag ${isPass ? 'risk-low' : 'risk-high'}`}>
                            {isPass ? 'Pass' : 'Fail'}
                          </span>
                        ) : (
                          <span className="text-muted-cell">Pending</span>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input text-sm"
                          placeholder="Evaluator feedback..."
                          value={r.evaluatorComment}
                          onChange={(e) => handleCommentChange(idx, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <footer className="modal-footer-bar justify-between">
          <button type="button" className="bootcamp-btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <div className="footer-actions-right">
            <button
              type="button"
              className="bootcamp-btn-secondary"
              onClick={() => handleSaveScores(false)}
            >
              <Save size={16} /> Save Scores Draft
            </button>

            <button
              type="button"
              className="bootcamp-btn-primary"
              onClick={() => handleSaveScores(true)}
            >
              <CheckCircle2 size={16} /> Complete Assessment
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
